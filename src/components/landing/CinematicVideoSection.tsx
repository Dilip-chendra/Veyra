"use client";

import React, { useRef, useState, useEffect } from "react";

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

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <section className="py-32 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full relative bg-[#06070d]">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          07 / Product Film
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

        {/* Video Player Frame */}
        <div
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black/90 shadow-2xl shadow-indigo-950/60 aspect-[16/9] w-full"
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
            preload="metadata"
            className="w-full h-full object-contain bg-black"
          />

          {/* Top Live Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono text-slate-200 bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Actual Veyra Live Session</span>
          </div>

          {/* Audio Toggle */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <button
              type="button"
              onClick={toggleMute}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-200 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              <span>{isMuted ? "Unmute Audio" : "Mute Audio"}</span>
            </button>
          </div>

          {/* Center Play/Pause button on hover */}
          <div
            onClick={togglePlay}
            className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
              !isPlaying ? "opacity-100 bg-black/40" : "opacity-0 group-hover:opacity-100 bg-black/20"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl backdrop-blur-md border border-white/20 transition-transform transform hover:scale-110">
              {isPlaying ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
            </div>
          </div>

          {/* Bottom Metabar */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">Elena Rostova</span>
              <span className="text-slate-600">•</span>
              <span>Principal Technical Architect</span>
            </div>
            <div className="text-indigo-400 font-mono">1080p HD • Realtime Sync</div>
          </div>
        </div>
      </div>
    </section>
  );
}
