"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface CartesiaSTTEvent {
  type: "turn.start" | "turn.update" | "turn.eager_end" | "turn.end" | "error" | "ready" | "closed";
  transcript?: string;
  message?: string;
}

export interface UseCartesiaSTTOptions {
  onTurnStart?: () => void;
  onTranscriptUpdate?: (partial: string) => void;
  onTurnEnd?: (finalTranscript: string) => void;
  onInterruption?: () => void; // candidate started speaking while AI was speaking
  isAiSpeaking?: boolean; // when true, detect interruptions
}

export interface UseCartesiaSTTReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isListening: boolean;
  partialTranscript: string;
  error: string | null;
  status: "idle" | "connecting" | "ready" | "listening" | "error" | "disconnected";
}

/**
 * useCartesiaSTT — Client-side hook for Cartesia Ink-2 STT via server relay.
 *
 * Connects to /api/cartesia/stt-relay (WebSocket) which relays to Cartesia.
 * Captures mic audio, sends 16kHz PCM to Cartesia.
 * Receives turn detection events from Ink-2.
 * 
 * IMPORTANT: Does NOT expose CARTESIA_API_KEY — the relay server adds it.
 */
export function useCartesiaSTT(options: UseCartesiaSTTOptions = {}): UseCartesiaSTTReturn {
  const { onTurnStart, onTranscriptUpdate, onTurnEnd, onInterruption, isAiSpeaking } = options;

  const [status, setStatus] = useState<"idle" | "connecting" | "ready" | "listening" | "error" | "disconnected">("idle");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isConnectedRef = useRef(false);
  const isAiSpeakingRef = useRef(isAiSpeaking ?? false);

  // Track current AI speaking state
  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking ?? false;
  }, [isAiSpeaking]);

  const disconnect = useCallback(() => {
    // Stop audio processing
    try {
      processorRef.current?.disconnect();
    } catch {}
    processorRef.current = null;

    // Stop mic tracks
    micStreamRef.current?.getTracks().forEach((t) => {
      t.stop();
    });
    micStreamRef.current = null;

    // Close AudioContext
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;

    // Close WebSocket
    wsRef.current?.close();
    wsRef.current = null;

    isConnectedRef.current = false;
    setStatus("disconnected");
    setPartialTranscript("");
  }, []);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return; // Already connected

    setStatus("connecting");
    setError(null);

    // 1. Get microphone access
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;
      // Also expose for cleanup on interview end
      (window as unknown as { __veyraLocalMicStream?: MediaStream }).__veyraLocalMicStream = stream;
    } catch (err) {
      const msg =
        (err as Error)?.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone permissions and refresh."
          : "Microphone unavailable. Please check your microphone and try again.";
      setError(msg);
      setStatus("error");
      return;
    }

    // 2. Connect to our server relay (which relays to Cartesia with the API key)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/cartesia/stt-relay`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
    } catch (err) {
      setError("Failed to connect to speech recognition service.");
      setStatus("error");
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    ws.onopen = () => {
      // WebSocket opened — wait for "ready" event from relay (which confirms Cartesia is connected)
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as CartesiaSTTEvent;

        switch (msg.type) {
          case "ready":
            isConnectedRef.current = true;
            setStatus("ready");
            // Start sending audio immediately
            startAudioCapture(stream, ws);
            break;

          case "turn.start":
            setStatus("listening");
            setPartialTranscript("");
            // If AI is currently speaking, this is an interruption
            if (isAiSpeakingRef.current) {
              onInterruption?.();
            }
            onTurnStart?.();
            break;

          case "turn.update":
            if (msg.transcript) {
              setPartialTranscript(msg.transcript);
              onTranscriptUpdate?.(msg.transcript);
            }
            break;

          case "turn.eager_end":
            // Ink-2 predicts the turn is ending — get a head start on processing
            if (msg.transcript) {
              setPartialTranscript(msg.transcript);
            }
            break;

          case "turn.end":
            {
              const finalText = msg.transcript ?? partialTranscript;
              setPartialTranscript("");
              setStatus("ready");
              if (finalText.trim()) {
                onTurnEnd?.(finalText.trim());
              }
            }
            break;

          case "error":
            console.error("[CartesiaSTT] Error from relay:", msg.message);
            setError(msg.message ?? "Speech recognition error.");
            setStatus("error");
            break;

          case "closed":
            isConnectedRef.current = false;
            setStatus("disconnected");
            break;
        }
      } catch {
        // Ignore JSON parse errors
      }
    };

    ws.onerror = () => {
      setError("Speech recognition connection failed.");
      setStatus("error");
      isConnectedRef.current = false;
    };

    ws.onclose = () => {
      isConnectedRef.current = false;
      if (status !== "disconnected") {
        setStatus("disconnected");
      }
    };
  }, [onTurnStart, onTranscriptUpdate, onTurnEnd, onInterruption, partialTranscript, status]);

  /**
   * Capture microphone audio and send 16kHz PCM to the WebSocket.
   * Cartesia Ink-2 expects: 16kHz, 16-bit PCM, mono, little-endian
   */
  function startAudioCapture(stream: MediaStream, ws: WebSocket) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx({ sampleRate: 16000 });
    audioContextRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);

    // Use ScriptProcessorNode to capture audio chunks
    // (4096 samples = ~256ms at 16kHz)
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);

      // Convert float32 to int16 PCM
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Send raw PCM bytes to relay → Cartesia
      ws.send(pcm16.buffer);
    };

    // Route processor to a muted gain node to prevent mic audio from echoing through speakers
    const muteNode = ctx.createGain();
    muteNode.gain.setValueAtTime(0, ctx.currentTime);
    source.connect(processor);
    processor.connect(muteNode);
    muteNode.connect(ctx.destination);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected: isConnectedRef.current,
    isListening: status === "listening",
    partialTranscript,
    error,
    status,
  };
}
