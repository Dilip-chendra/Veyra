"use client";

import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function CinematicVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      video.muted = false;
      video.volume = 1.0;
      video.play().catch(() => {});
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <section className="py-32 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full relative bg-[#06070d]">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          02 / Product Film
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          SEE WHAT AN INTERVIEW WITH VEYRA FEELS LIKE.
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Not another question generator. A realtime conversation that listens, understands, and adapts.
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl w-full">
        {/* Cinematic Ambient Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 sm:-inset-10 rounded-3xl opacity-60 blur-3xl transition-opacity duration-1000"
          style={{
            background: "radial-gradient(circle at center, rgba(99, 102, 241, 0.22) 0%, rgba(139, 92, 246, 0.12) 50%, transparent 75%)",
          }}
        />

        {/* Video Player Frame with only clean Mute/Unmute control */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black/90 shadow-2xl shadow-indigo-950/60 aspect-[16/9] w-full"
          style={{
            boxShadow: "0 30px 100px -15px rgba(0, 0, 0, 0.95), 0 0 60px -10px rgba(99, 102, 241, 0.2)",
          }}
        >
          <video
            ref={videoRef}
            src="/videos/veyra_preview.mp4"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-contain bg-black"
          />

          {/* Clean Working Mute / Unmute Button (Only overlay on the video) */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30">
            <button
              type="button"
              onClick={toggleMute}
              className={`px-4 py-2.5 rounded-full text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-2.5 shadow-2xl backdrop-blur-md border cursor-pointer ${
                isMuted
                  ? "bg-black/80 hover:bg-black text-white border-white/20 hover:border-white/40"
                  : "bg-indigo-600/90 hover:bg-indigo-600 text-white border-indigo-400/50 shadow-indigo-600/40"
              }`}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-slate-300" />
                  <span>Unmute Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-300" />
                  <span>Mute Audio</span>
                  <div className="flex items-center gap-0.5 ml-0.5">
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-pulse delay-75" />
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
