"use client";

import { useEffect, useRef } from "react";

// Full-viewport convergence animation
// Particles and streaks flow circularly toward the input bar center
// Event horizon glow around the input bar

interface Streak {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  opacity: number;
  width: number;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  life: number;
  maxLife: number;
}

const VIRIDIAN = { r: 30, g: 186, b: 143 };
const SANDSTORM = { r: 247, g: 206, b: 70 };

function rgba(c: { r: number; g: number; b: number }, a: number): string {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export default function ConvergenceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Read the actual input bar position from the DOM
    // Falls back to an estimate if not found yet
    let inputRect = { x: w / 2, y: h * 0.65, w: Math.min(540, w - 48), h: 48 };

    function updateInputRect() {
      const el = document.querySelector(".two-msg-input-bar");
      if (el) {
        const r = el.getBoundingClientRect();
        inputRect = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
      }
    }

    // Poll for the input bar position (it may not be rendered yet on first frame)
    updateInputRect();
    const rectInterval = setInterval(updateInputRect, 1000);

    function getFocalPoint(): { x: number; y: number } {
      return { x: inputRect.x, y: inputRect.y };
    }

    // Create streaks
    const STREAK_COUNT = 40;
    const streaks: Streak[] = [];

    function spawnStreak(): Streak {
      const focal = getFocalPoint();
      const edge = Math.random();
      let sx: number, sy: number;

      if (edge < 0.25) {
        sx = Math.random() * w; sy = -20;
      } else if (edge < 0.5) {
        sx = Math.random() * w; sy = h + 20;
      } else if (edge < 0.75) {
        sx = -20; sy = Math.random() * h;
      } else {
        sx = w + 20; sy = Math.random() * h;
      }

      const dx = focal.x - sx;
      const dy = focal.y - sy;
      const angle = Math.atan2(dy, dx);

      return {
        x: sx,
        y: sy,
        angle: angle + (Math.random() - 0.5) * 0.15,
        speed: 1.5 + Math.random() * 2,
        length: 30 + Math.random() * 80,
        opacity: 0.06 + Math.random() * 0.12,
        width: 0.8 + Math.random() * 1.5,
      };
    }

    for (let i = 0; i < STREAK_COUNT; i++) {
      const s = spawnStreak();
      const advance = Math.random() * 600;
      s.x += Math.cos(s.angle) * advance;
      s.y += Math.sin(s.angle) * advance;
      streaks.push(s);
    }

    // Create motes
    const MOTE_COUNT = 60;
    const motes: Mote[] = [];

    function spawnMote(): Mote {
      const focal = getFocalPoint();
      const edgeBias = Math.random() < 0.7;
      let mx: number, my: number;

      if (edgeBias) {
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { mx = Math.random() * w; my = Math.random() * h * 0.2; }
        else if (side === 1) { mx = Math.random() * w; my = h * 0.8 + Math.random() * h * 0.2; }
        else if (side === 2) { mx = Math.random() * w * 0.2; my = Math.random() * h; }
        else { mx = w * 0.8 + Math.random() * w * 0.2; my = Math.random() * h; }
      } else {
        mx = Math.random() * w;
        my = Math.random() * h;
      }

      const dx = focal.x - mx;
      const dy = focal.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxLife = 300 + Math.random() * 400;

      return {
        x: mx,
        y: my,
        vx: dist > 0 ? (dx / dist) * (0.3 + Math.random() * 0.5) : 0,
        vy: dist > 0 ? (dy / dist) * (0.3 + Math.random() * 0.5) : 0,
        radius: 0.8 + Math.random() * 2,
        opacity: 0.12 + Math.random() * 0.2,
        life: Math.random() * maxLife,
        maxLife,
      };
    }

    for (let i = 0; i < MOTE_COUNT; i++) {
      motes.push(spawnMote());
    }

    let animFrame: number;

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      const focal = getFocalPoint();

      // ---- Draw streaks (converge to center point) ----
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        // Home toward focal center
        const dx = focal.x - s.x;
        const dy = focal.y - s.y;
        const targetAngle = Math.atan2(dy, dx);
        s.angle = lerp(s.angle, targetAngle, 0.008);

        const dist = Math.sqrt(dx * dx + dy * dy);

        let streakOpacity = s.opacity;
        if (dist < 80) {
          streakOpacity *= dist / 80;
        }
        if (dist < 200) {
          s.speed = lerp(s.speed, 3.5, 0.02);
        }

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx!.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, rgba(VIRIDIAN, 0));
        grad.addColorStop(0.7, rgba(VIRIDIAN, streakOpacity * 0.5));
        grad.addColorStop(1, rgba(VIRIDIAN, streakOpacity));

        ctx!.beginPath();
        ctx!.moveTo(tailX, tailY);
        ctx!.lineTo(s.x, s.y);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = s.width;
        ctx!.stroke();

        if (dist < 30 || s.x < -100 || s.x > w + 100 || s.y < -100 || s.y > h + 100) {
          streaks[i] = spawnStreak();
        }
      }

      // ---- Draw motes (converge to center point) ----
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];

        const dx = focal.x - m.x;
        const dy = focal.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Slow-then-fast: cubic ramp
        const t = Math.max(0, 1 - dist / 400);
        const pull = 0.006 + 0.05 * t * t * t;
        if (dist > 0) {
          m.vx += (dx / dist) * pull;
          m.vy += (dy / dist) * pull;
        }

        m.vx *= 0.995;
        m.vy *= 0.995;

        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        let moteOpacity = m.opacity;
        const lifeProg = m.life / m.maxLife;
        if (lifeProg < 0.1) moteOpacity *= lifeProg / 0.1;
        if (lifeProg > 0.8) moteOpacity *= (1 - lifeProg) / 0.2;
        if (dist < 50) moteOpacity *= dist / 50;

        const color = i % 7 === 0 ? SANDSTORM : VIRIDIAN;

        // Glow
        const gRad = m.radius * 6;
        const grad = ctx!.createRadialGradient(m.x, m.y, 0, m.x, m.y, gRad);
        grad.addColorStop(0, rgba(color, moteOpacity * 0.5));
        grad.addColorStop(1, rgba(color, 0));
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, gRad, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();

        // Core
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx!.fillStyle = rgba(color, moteOpacity);
        ctx!.fill();

        if (m.life > m.maxLife || dist < 20) {
          motes[i] = spawnMote();
        }
      }

      animFrame = requestAnimationFrame(draw);
    }

    animFrame = requestAnimationFrame(draw);

    function handleResize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      updateInputRect();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(rectInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="convergence-bg"
      aria-hidden="true"
    />
  );
}
