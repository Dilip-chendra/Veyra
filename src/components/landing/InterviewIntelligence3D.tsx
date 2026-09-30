"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function InterviewIntelligence3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeNode, setActiveNode] = useState("Reasoning Core");

  useEffect(() => {
    setIsClient(true);
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7.5;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Intelligence Core Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 1. Concentric Gyroscopic Rings
    const ringMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.4 }),
      new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.35 }),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.3 }),
      new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.25 }),
    ];

    const rings: THREE.Mesh[] = [];
    const radii = [2.2, 1.8, 1.4, 1.0];
    radii.forEach((r, i) => {
      const geo = new THREE.TorusGeometry(r, 0.02, 16, 100);
      const ring = new THREE.Mesh(geo, ringMaterials[i]);
      ring.rotation.x = (i * Math.PI) / 4;
      ring.rotation.y = (i * Math.PI) / 6;
      rings.push(ring);
      coreGroup.add(ring);
    });

    // 2. Central Polyhedral Seed (Icosahedron Core)
    const seedGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const seedMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const seed = new THREE.Mesh(seedGeo, seedMat);
    coreGroup.add(seed);

    // 3. Floating Node Constellation
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dist = 2.4 + Math.random() * 1.2;
      particlePositions[i] = dist * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = dist * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = dist * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xa5b4fc,
      size: 0.045,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particles);

    // Mouse Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.8;
      targetRotX = y * 0.8;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Off-screen pausing via IntersectionObserver
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible || prefersReducedMotion) return;

      const elapsed = clock.getElapsedTime();

      // Slow orbital rotations
      rings[0].rotation.x = elapsed * 0.2;
      rings[0].rotation.y = elapsed * 0.15;

      rings[1].rotation.y = -elapsed * 0.25;
      rings[1].rotation.z = elapsed * 0.18;

      rings[2].rotation.x = -elapsed * 0.18;
      rings[2].rotation.z = -elapsed * 0.22;

      rings[3].rotation.y = elapsed * 0.3;

      seed.rotation.x = elapsed * 0.4;
      seed.rotation.y = elapsed * 0.3;

      particles.rotation.y = elapsed * 0.05;

      // Smooth mouse follow
      coreGroup.rotation.y += (targetRotY - coreGroup.rotation.y) * 0.05;
      coreGroup.rotation.x += (targetRotX - coreGroup.rotation.x) * 0.05;

      renderer?.render(scene, camera);
    };

    animate();

    // Resize Handler
    const onResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      observer.disconnect();

      // Dispose Three resources
      seedGeo.dispose();
      seedMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      rings.forEach((r) => {
        r.geometry.dispose();
      });
      ringMaterials.forEach((m) => m.dispose());
      renderer?.dispose();
      if (renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative z-10 py-32 bg-transparent overflow-hidden">
      {/* Background Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40"
      >
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Editorial Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.05]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            11 / Adaptive Architecture
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] uppercase">
            THE INTERVIEW{" "}
            <span className="font-serif italic font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFE57F] via-amber-300 to-amber-100">
              INTELLIGENCE CORE.
            </span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
            Veyra does not query a static database of interview prompts. Every turn operates through an evolving multi-dimensional reasoning engine that continuously balances ownership verification, latency diagnostics, and first-principles depth.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: "Reasoning Core", detail: "Turn-by-turn dynamic evaluation" },
              { label: "Cross-Turn Memory", detail: "Persistent claim dependency graph" },
              { label: "Signal Calibration", detail: "Role-specific engineering rubrics" },
              { label: "Latency Diagnostics", detail: "Sub-400ms voice turn turnaround" },
            ].map((node) => (
              <button
                key={node.label}
                type="button"
                onClick={() => setActiveNode(node.label)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  activeNode === node.label
                    ? "border-indigo-500/50 bg-indigo-950/20 text-white shadow-lg shadow-indigo-950/50"
                    : "border-white/[0.06] bg-white/[0.015] text-slate-400 hover:text-slate-200 hover:border-white/10"
                }`}
              >
                <div className="text-[12px] font-bold text-slate-200 tracking-tight">{node.label}</div>
                <div className="text-[11px] text-slate-500 mt-1">{node.detail}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 3D Viewport */}
        <div className="lg:col-span-6 flex justify-center relative">
          <div
            ref={containerRef}
            className="w-full max-w-[500px] aspect-square relative rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-sm shadow-2xl shadow-indigo-950/60 overflow-hidden flex items-center justify-center"
          >
            {/* Fallback if Three.js not yet mounted */}
            {!isClient && (
              <div className="text-xs text-slate-600 font-mono">Initializing Spatial Core...</div>
            )}

            {/* Subtle Overlay HUD */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono text-indigo-300 bg-black/60 border border-white/10 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span>CORE_LATENCY: 38ms</span>
            </div>

            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-500 bg-black/60 border border-white/5 px-2.5 py-1 rounded-md pointer-events-none">
              RENDER: WEBGL 2.0 (GPU)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
