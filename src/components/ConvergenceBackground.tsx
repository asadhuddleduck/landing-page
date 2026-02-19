"use client";

import { useEffect, useRef } from "react";

// Full-viewport convergence animation
// Particles and streaks flow from edges toward the input bar rectangle
// Creates an event-horizon effect - everything on screen is pulled toward the chat input

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

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

const VIRIDIAN = { r: 30, g: 186, b: 143 };
const SANDSTORM = { r: 247, g: 206, b: 70 };

function rgba(c: { r: number; g: number; b: number }, a: number): string {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Find the nearest point on a rectangle's perimeter to a given point
function nearestPointOnRect(px: number, py: number, rect: Rect): { x: number; y: number } {
  const cx = clamp(px, rect.left, rect.right);
  const cy = clamp(py, rect.top, rect.bottom);
  // If the point is inside the rect, push to nearest edge
  if (cx === px && cy === py) {
    const dLeft = px - rect.left;
    const dRight = rect.right - px;
    const dTop = py - rect.top;
    const dBottom = rect.bottom - py;
    const minD = Math.min(dLeft, dRight, dTop, dBottom);
    if (minD === dLeft) return { x: rect.left, y: py };
    if (minD === dRight) return { x: rect.right, y: py };
    if (minD === dTop) return { x: px, y: rect.top };
    return { x: px, y: rect.bottom };
  }
  return { x: cx, y: cy };
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

    // Input bar rectangle: horizontally centered, max-width 540px, ~62% down the viewport
    function getInputRect(): Rect {
      const maxW = 540;
      const pad = 24;
      const barW = Math.min(maxW, w - pad * 2);
      const left = (w - barW) / 2;
      const right = left + barW;
      const centerY = h * 0.62;
      const barH = 48;
      const top = centerY - barH / 2;
      const bottom = centerY + barH / 2;
      return { left, right, top, bottom, centerX: w / 2, centerY };
    }

    // Create streaks
    const STREAK_COUNT = 40;
    const streaks: Streak[] = [];

    function spawnStreak(): Streak {
      const rect = getInputRect();
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

      const target = nearestPointOnRect(sx, sy, rect);
      const dx = target.x - sx;
      const dy = target.y - sy;
      const angle = Math.atan2(dy, dx);

      return {
        x: sx,
        y: sy,
        angle: angle + (Math.random() - 0.5) * 0.15,
        speed: 0.8 + Math.random() * 1.2,
        length: 30 + Math.random() * 80,
        opacity: 0.04 + Math.random() * 0.08,
        width: 0.5 + Math.random() * 1,
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
      const rect = getInputRect();
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

      const target = nearestPointOnRect(mx, my, rect);
      const dx = target.x - mx;
      const dy = target.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxLife = 300 + Math.random() * 400;

      return {
        x: mx,
        y: my,
        vx: dist > 0 ? (dx / dist) * (0.15 + Math.random() * 0.3) : 0,
        vy: dist > 0 ? (dy / dist) * (0.15 + Math.random() * 0.3) : 0,
        radius: 0.5 + Math.random() * 1.5,
        opacity: 0.08 + Math.random() * 0.15,
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

      const rect = getInputRect();

      // ---- Draw streaks ----
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        // Home toward nearest point on input bar rect
        const target = nearestPointOnRect(s.x, s.y, rect);
        const dx = target.x - s.x;
        const dy = target.y - s.y;
        const targetAngle = Math.atan2(dy, dx);
        s.angle = lerp(s.angle, targetAngle, 0.01);

        const distToRect = Math.sqrt(dx * dx + dy * dy);

        let streakOpacity = s.opacity;
        if (distToRect < 60) {
          streakOpacity *= distToRect / 60;
        }
        // Accelerate as approaching (event horizon pull)
        if (distToRect < 200) {
          s.speed = lerp(s.speed, 3, 0.03);
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

        if (distToRect < 15 || s.x < -100 || s.x > w + 100 || s.y < -100 || s.y > h + 100) {
          streaks[i] = spawnStreak();
        }
      }

      // ---- Draw motes ----
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];

        const target = nearestPointOnRect(m.x, m.y, rect);
        const dx = target.x - m.x;
        const dy = target.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Slow-then-fast pull: cubic ramp toward the rect
        const t = Math.max(0, 1 - dist / 400);
        const pull = 0.003 + 0.04 * t * t * t;
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
        if (dist < 40) moteOpacity *= dist / 40;

        const color = i % 7 === 0 ? SANDSTORM : VIRIDIAN;

        // Glow
        const gRad = m.radius * 5;
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

        if (m.life > m.maxLife || dist < 10) {
          motes[i] = spawnMote();
        }
      }

      // ---- Event horizon glow around the input bar ----
      const pulse = 0.7 + Math.sin(Date.now() * 0.0015) * 0.3;
      const borderRadius = 16;
      const glowLayers = [
        { expand: 20, alpha: 0.025 * pulse },
        { expand: 12, alpha: 0.04 * pulse },
        { expand: 6, alpha: 0.06 * pulse },
        { expand: 2, alpha: 0.08 * pulse },
      ];

      for (const layer of glowLayers) {
        const e = layer.expand;
        ctx!.beginPath();
        ctx!.roundRect(
          rect.left - e,
          rect.top - e,
          (rect.right - rect.left) + e * 2,
          (rect.bottom - rect.top) + e * 2,
          borderRadius + e * 0.5
        );
        ctx!.strokeStyle = rgba(VIRIDIAN, layer.alpha);
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }

      // Inner glow fill
      const innerGlow = ctx!.createLinearGradient(rect.left, rect.top, rect.right, rect.bottom);
      innerGlow.addColorStop(0, rgba(VIRIDIAN, 0.015 * pulse));
      innerGlow.addColorStop(0.5, rgba(VIRIDIAN, 0.008 * pulse));
      innerGlow.addColorStop(1, rgba(VIRIDIAN, 0.015 * pulse));
      ctx!.beginPath();
      ctx!.roundRect(
        rect.left,
        rect.top,
        rect.right - rect.left,
        rect.bottom - rect.top,
        borderRadius
      );
      ctx!.fillStyle = innerGlow;
      ctx!.fill();

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
    }

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
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
