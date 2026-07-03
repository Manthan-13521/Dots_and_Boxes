"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; life: number; maxLife: number;
    }[] = [];

    const gridSpacing = 64;
    let time = 0;

    const animate = () => {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const isDark = document.documentElement.classList.contains("dark");

      const gridColor = isDark ? "59, 130, 246" : "59, 130, 246";
      const particleColor = isDark ? "139, 92, 246" : "99, 102, 241";

      for (let x = 0; x < w + gridSpacing; x += gridSpacing) {
        for (let y = 0; y < h + gridSpacing; y += gridSpacing) {
          const dx = x - w / 2;
          const dy = y - h / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(w * w + h * h) / 2;
          const intensity = Math.max(0, 1 - dist / maxDist);

          const pulse = Math.sin(time * 0.02 + x * 0.01 + y * 0.01) * 0.3 + 0.7;
          const alpha = intensity * 0.08 * pulse;

          ctx.fillStyle = `rgba(${gridColor}, ${alpha})`;
          ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
      }

      for (let x = 0; x < w + gridSpacing; x += gridSpacing) {
        for (let y = 0; y < h + gridSpacing; y += gridSpacing) {
          const right = x + gridSpacing;
          const bottom = y + gridSpacing;

          if (right <= w) {
            const pulse = Math.sin(time * 0.015 + x * 0.008 + y * 0.012) * 0.2 + 0.8;
            const dx = (x + gridSpacing / 2) - w / 2;
            const dy = (y + gridSpacing / 2) - h / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.sqrt(w * w + h * h) / 2;
            const alpha = Math.max(0, 1 - dist / maxDist) * 0.06 * pulse;
            ctx.fillStyle = `rgba(${gridColor}, ${alpha})`;
            ctx.fillRect(x, y, gridSpacing, 0.5);
          }

          if (bottom <= h) {
            const pulse = Math.sin(time * 0.015 + x * 0.01 + y * 0.009) * 0.2 + 0.8;
            const dx = (x + gridSpacing / 2) - w / 2;
            const dy = (y + gridSpacing / 2) - h / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.sqrt(w * w + h * h) / 2;
            const alpha = Math.max(0, 1 - dist / maxDist) * 0.06 * pulse;
            ctx.fillStyle = `rgba(${gridColor}, ${alpha})`;
            ctx.fillRect(x, y, 0.5, gridSpacing);
          }
        }
      }

      if (time % 6 === 0 && particles.length < 80) {
        const edge = Math.floor(Math.random() * 4);
        let x: number, y: number;
        if (edge === 0) { x = Math.random() * w; y = -10; }
        else if (edge === 1) { x = w + 10; y = Math.random() * h; }
        else if (edge === 2) { x = Math.random() * w; y = h + 10; }
        else { x = -10; y = Math.random() * h; }
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: 1 + Math.random() * 2,
          alpha: 0.3 + Math.random() * 0.4,
          life: 0,
          maxLife: 200 + Math.random() * 150,
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${currentAlpha * 0.6})`;
        ctx.fill();

        if (p.life >= p.maxLife || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          particles.splice(i, 1);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
