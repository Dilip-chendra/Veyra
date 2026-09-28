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
 * useCartesiaTTS — Client-side hook for Cartesia Sonic-3.6 TTS.
 *
 * Calls POST /api/cartesia/tts (our secure server proxy).
 * Server reads CARTESIA_API_KEY — key never reaches browser.
 * Streams raw PCM audio from Cartesia SSE → AudioContext for playback.
 */
export function useCartesiaTTS(onSpeechEnd?: () => void): UseCartesiaTTSReturn {
  const [status, setStatus] = useState<CartesiaTTSStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPlayingRef = useRef(false);

  const isPlaying = status === "playing" || status === "loading";

  // Ensure AudioContext is created (must happen after user gesture)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx({ sampleRate: 44100 });
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }
    return audioContextRef.current;
  }, []);

  const stop = useCallback(() => {
    // Cancel any in-flight fetch
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    // Stop any playing audio
    try {
      sourceNodeRef.current?.stop();
    } catch {
      // May throw if already stopped
    }
    sourceNodeRef.current = null;
    isPlayingRef.current = false;
    setStatus("stopped");
  }, []);

  /**
   * Parse Cartesia SSE response and play as audio.
   * Cartesia TTS/SSE returns lines like:
   *   data: {"type":"chunk","data":"<base64-encoded-audio>","done":false}
   *   data: {"type":"done","done":true}
   */
  const speak = useCallback(
    async (text: string, gender: "male" | "female") => {
      if (!text?.trim()) return;

      // Stop any existing speech
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
          } catch {
            // ignore parse error
          }
          throw new Error(errorMsg);
        }

        if (!response.body) {
          throw new Error("No audio stream received from voice service.");
        }

        const ctx = getAudioContext();
        const audioChunks: Uint8Array[] = [];

        // Read SSE stream and collect base64 audio chunks
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!isPlayingRef.current) break; // Interrupted

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // Keep incomplete last line

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
                // Decode base64 audio data
                const binaryStr = atob(event.data);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                  bytes[i] = binaryStr.charCodeAt(i);
                }
                audioChunks.push(bytes);
              }

              if (event.done === true) break;
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        if (!isPlayingRef.current) {
          setStatus("stopped");
          return;
        }

        if (audioChunks.length === 0) {
          throw new Error("No audio data received from voice service.");
        }

        // Concatenate all PCM chunks
        const totalLength = audioChunks.reduce((acc, c) => acc + c.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of audioChunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }

        // Interpret as 32-bit float PCM (f32le, 44100Hz, mono)
        const floatArray = new Float32Array(combined.buffer, combined.byteOffset, combined.byteLength / 4);
        const audioBuffer = ctx.createBuffer(1, floatArray.length, 44100);
        audioBuffer.getChannelData(0).set(floatArray);

        if (!isPlayingRef.current) {
          setStatus("stopped");
          return;
        }

        // Play via AudioBufferSourceNode
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        sourceNodeRef.current = source;

        source.onended = () => {
          isPlayingRef.current = false;
          sourceNodeRef.current = null;
          setStatus("idle");
          onSpeechEnd?.();
        };

        setStatus("playing");
        source.start(0);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          setStatus("stopped");
          return;
        }
        const message = err instanceof Error ? err.message : "Voice synthesis failed.";
        setError(message);
        setStatus("error");
        isPlayingRef.current = false;
        // DO NOT fall back to browser TTS — show the real error
      }
    },
    [getAudioContext, onSpeechEnd, stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      try {
        sourceNodeRef.current?.stop();
      } catch {}
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  return { speak, stop, isPlaying, status, error };
}
