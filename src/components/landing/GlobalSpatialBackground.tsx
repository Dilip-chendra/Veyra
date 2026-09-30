"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function GlobalSpatialBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 48;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0); // Transparent background
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Helper to generate soft radial glow circular star texture (eliminates square sprite artifacts)
    const createStarTexture = () => {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d");
      if (!ctx) return null;

      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.25, "rgba(255, 255, 255, 0.8)");
      grad.addColorStop(0.55, "rgba(255, 255, 255, 0.2)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(c);
      return texture;
    };

    const starTexture = createStarTexture();

    // 2. High-Density Multi-Colored Starfield Constellation
    const particleCount = window.innerWidth < 768 ? 300 : 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xffe57f), // Golden amber (matches headings)
      new THREE.Color(0xf59e0b), // Deep gold
      new THREE.Color(0x818cf8), // Periwinkle
      new THREE.Color(0x6366f1), // Indigo
      new THREE.Color(0x38bdf8), // Electric cyan
      new THREE.Color(0xc084fc), // Soft violet
      new THREE.Color(0xffffff), // Pure white star
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 2] = -Math.random() * 80; // Depth behind camera (camera at z=48)

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle Material with circular star glow texture and additive blending
    const particleMaterial = new THREE.PointsMaterial({
      size: 1.5,
      map: starTexture || undefined,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 3. Concentric Gyroscopic Orbital Rings (Multi-axis subtle rotation)
    const ringsGroup = new THREE.Group();

    // Ring 1: Golden Amber Outer Orbital
    const ring1Geo = new THREE.TorusGeometry(38, 0.09, 16, 140);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xffe57f,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3.2;
    ring1.rotation.y = Math.PI / 6;
    ringsGroup.add(ring1);

    // Ring 2: Periwinkle Indigo Middle Orbital
    const ring2Geo = new THREE.TorusGeometry(28, 0.08, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    ringsGroup.add(ring2);

    // Ring 3: Electric Cyan Inner Core Orbital
    const ring3Geo = new THREE.TorusGeometry(18, 0.07, 16, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 2.8;
    ringsGroup.add(ring3);

    scene.add(ringsGroup);

    // 4. Floating Geometric Data Nodes (Drifting Wireframe Icosahedrons)
    const nodeCount = window.innerWidth < 768 ? 4 : 8;
    const nodes: THREE.Mesh[] = [];
    const nodeGeo = new THREE.IcosahedronGeometry(2.8, 1);

    for (let i = 0; i < nodeCount; i++) {
      const isGold = i % 3 === 0;
      const nodeMat = new THREE.MeshBasicMaterial({
        color: isGold ? 0xffe57f : 0x818cf8,
        wireframe: true,
        transparent: true,
        opacity: isGold ? 0.22 : 0.18,
      });

      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(
        (Math.random() - 0.5) * 110,
        (Math.random() - 0.5) * 110,
        (Math.random() - 0.5) * 50
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      nodes.push(mesh);
    }

    // 5. Mouse Parallax & Dynamic Scroll Reactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;
    let targetScrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // 6. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera parallax with mouse and scroll
      targetX += (mouseX * 5 - targetX) * 0.05;
      targetY += (-mouseY * 5 - targetY) * 0.05;
      targetScrollY += (scrollY * 0.015 - targetScrollY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = targetY - (targetScrollY % 60);
      camera.lookAt(0, - (targetScrollY % 60), 0);

      // Rotate starfield slowly
      particles.rotation.y = elapsed * 0.018;
      particles.rotation.x = elapsed * 0.009;

      // Rotate gyroscopic rings at varied planetary speeds
      ring1.rotation.z = elapsed * 0.025;
      ring1.rotation.y = elapsed * 0.015;

      ring2.rotation.x = elapsed * 0.02;
      ring2.rotation.z = -elapsed * 0.03;

      ring3.rotation.y = elapsed * 0.035;
      ring3.rotation.x = elapsed * 0.018;

      // Rotate and float geometric data nodes
      nodes.forEach((node, idx) => {
        node.rotation.x += 0.004 * (idx % 2 === 0 ? 1 : -1);
        node.rotation.y += 0.005 * (idx % 2 === 0 ? -1 : 1);
        node.position.y += Math.sin(elapsed * 0.6 + idx * 1.5) * 0.03;
      });

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      }
      geometry.dispose();
      particleMaterial.dispose();
      starTexture?.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      nodeGeo.dispose();
      nodes.forEach((n) => (n.material as THREE.Material).dispose());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-95"
      style={{
        background: "transparent",
      }}
    />
  );
}
