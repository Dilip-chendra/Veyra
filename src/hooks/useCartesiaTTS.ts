"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export type CartesiaTTSStatus =
  | "idle"
  | "loading"
  | "playing"
  | "stopped"
  | "error";

export interface UseCartesiaTTSReturn {
  speak: (text: string, gender: "male" | "female") => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  status: CartesiaTTSStatus;
  error: string | null;
}

/**
 * useCartesiaTTS — Realtime low-latency streaming TTS hook for Cartesia Sonic-3.6.
 *
 * Calls POST /api/cartesia/tts (server proxy).
 * Streams SSE raw PCM chunks directly to Web Audio API AudioBufferSourceNodes,
 * scheduling them seamlessly with nextPlayTime for immediate (~200ms) speech onset.
 *
 * Interruption: stop() immediately halts all scheduled audio buffers and aborts the stream.
 */
export function useCartesiaTTS(onSpeechEnd?: () => void): UseCartesiaTTSReturn {
  const [status, setStatus] = useState<CartesiaTTSStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPlayingRef = useRef(false);
  const onSpeechEndRef = useRef(onSpeechEnd);
  onSpeechEndRef.current = onSpeechEnd;

  const isPlaying = status === "playing" || status === "loading";

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx({ sampleRate: 44100 });
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }
    return audioContextRef.current;
  }, []);

  const stop = useCallback(() => {
    // 1. Abort in-flight fetch stream
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    // 2. Stop all scheduled audio buffers
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    }
    activeSourcesRef.current = [];
    isPlayingRef.current = false;
    setStatus("stopped");
  }, []);

  const speak = useCallback(
    async (text: string, gender: "male" | "female") => {
      if (!text?.trim()) return;

      // Stop any existing speech immediately
      stop();

      setStatus("loading");
      setError(null);
      isPlayingRef.current = true;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/cartesia/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim(), gender }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let errorMsg = `Voice synthesis failed (HTTP ${response.status})`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error ?? errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }

        if (!response.body) {
          throw new Error("No audio stream received from voice service.");
        }

        const ctx = getAudioContext();
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Track timeline for seamless chunk scheduling
        let nextPlayTime = ctx.currentTime + 0.05; // 50ms initial safety cushion
        let chunksScheduled = 0;
        let lastScheduledSource: AudioBufferSourceNode | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!isPlayingRef.current) break; // Interrupted

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;

            try {
              const event = JSON.parse(jsonStr) as {
                type: string;
                data?: string;
                done?: boolean;
              };

              if (event.type === "chunk" && event.data) {
                // Decode base64 to PCM bytes
                const binaryStr = atob(event.data);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                  bytes[i] = binaryStr.charCodeAt(i);
                }

                const sampleCount = Math.floor(bytes.byteLength / 4);
                if (sampleCount > 0 && isPlayingRef.current) {
                  const floatArray = new Float32Array(bytes.buffer, 0, sampleCount);
                  const audioBuffer = ctx.createBuffer(1, floatArray.length, 44100);
                  audioBuffer.getChannelData(0).set(floatArray);

                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(ctx.destination);

                  // Schedule seamlessly
                  const now = ctx.currentTime;
                  const startTime = Math.max(now, nextPlayTime);
                  source.start(startTime);
                  nextPlayTime = startTime + audioBuffer.duration;

                  activeSourcesRef.current.push(source);
                  lastScheduledSource = source;
                  chunksScheduled++;

                  if (chunksScheduled === 1) {
                    setStatus("playing");
                  }

                  // Cleanup completed source nodes
                  source.onended = () => {
                    activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
                  };
                }
              }

              if (event.done === true) break;
            } catch {
              // Ignore malformed SSE lines
            }
          }
        }

        if (!isPlayingRef.current) {
          setStatus("stopped");
          return;
        }

        if (chunksScheduled === 0) {
          throw new Error("No audio data received from Cartesia voice service.");
        }

        // Attach completion callback to the final scheduled audio chunk
        if (lastScheduledSource) {
          lastScheduledSource.onended = () => {
            activeSourcesRef.current = [];
            isPlayingRef.current = false;
            setStatus("idle");
            onSpeechEndRef.current?.();
          };
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          setStatus("stopped");
          return;
        }
        const message = err instanceof Error ? err.message : "Voice synthesis failed.";
        setError(message);
        setStatus("error");
        isPlayingRef.current = false;
      }
    },
    [getAudioContext, stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      for (const source of activeSourcesRef.current) {
        try {
          source.stop();
        } catch {}
      }
      activeSourcesRef.current = [];
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  return { speak, stop, isPlaying, status, error };
}
