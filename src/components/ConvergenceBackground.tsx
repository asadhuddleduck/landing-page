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

// Desaturated (washed-out / white-shifted) palette for subtle particles
const VIRIDIAN = { r: 140, g: 220, b: 195 };
const SANDSTORM = { r: 250, g: 230, b: 160 };

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

    // Skip animation entirely if user prefers reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

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

    // Poll for the input bar position — fast enough to catch keyboard open/close
    updateInputRect();
    const rectInterval = setInterval(updateInputRect, 150);

    function getFocalPoint(): { x: number; y: number } {
      return { x: inputRect.x, y: inputRect.y };
    }

    // Create streaks — fewer on mobile so they feel sparse and purposeful
    const isMobile = w < 768;
    const isLowEnd = isMobile && (navigator.hardwareConcurrency ?? 4) <= 4;
    const STREAK_COUNT = isLowEnd ? 14 : (isMobile ? 22 : 40);
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
        opacity: 0.06 + Math.random() * 0.1,
        width: 0.5 + Math.random() * 1,
      };
    }

    // On mobile, keep most streaks near edges (less advance) so they visibly arrive
    // On desktop, spread them out more for an ambient feel
    const maxAdvance = isMobile ? 200 : 600;
    for (let i = 0; i < STREAK_COUNT; i++) {
      const s = spawnStreak();
      const advance = Math.random() * maxAdvance;
      s.x += Math.cos(s.angle) * advance;
      s.y += Math.sin(s.angle) * advance;
      streaks.push(s);
    }

    // Create motes — fewer on mobile, even fewer on low-end devices
    const MOTE_COUNT = isLowEnd ? 8 : (isMobile ? 12 : 60);
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
        vx: dist > 0 ? (dx / dist) * (isMobile ? (3 + Math.random() * 4) : (0.3 + Math.random() * 0.5)) : 0,
        vy: dist > 0 ? (dy / dist) * (isMobile ? (3 + Math.random() * 4) : (0.3 + Math.random() * 0.5)) : 0,
        radius: isMobile ? (0.3 + Math.random() * 0.8) : (0.5 + Math.random() * 1.5),
        opacity: isMobile ? (0.18 + Math.random() * 0.22) : (0.12 + Math.random() * 0.18),
        life: Math.random() * maxLife,
        maxLife,
      };
    }

    for (let i = 0; i < MOTE_COUNT; i++) {
      motes.push(spawnMote());
    }

    // Scale acceleration radii to screen size so mobile feels dramatic.
    // On desktop (1440px) these stay close to original values.
    // On mobile (~390px) they scale up relative to viewport.
    let screenDiag = Math.sqrt(w * w + h * h);
    let streakSpeedRadius = Math.max(300, screenDiag * 0.6);
    let streakFadeRadius = w < 768 ? Math.max(120, screenDiag * 0.18) : Math.max(80, screenDiag * 0.12);  // event horizon: bigger on mobile
    let streakTargetSpeed = 3.5;
    let streakAccelRate = 0.02;
    let streakHomingBase = 0.008;
    let streakGravityRadius = 0;  // streaks use flat homing now (gravity well is for motes)

    // Mote pull radius — much bigger on mobile so they accelerate from far away
    let motePullRadius = w < 768 ? screenDiag * 1.2 : Math.max(400, screenDiag * 0.55);

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
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Distance-dependent homing: on mobile, homing strength increases
        // dramatically as streaks approach the focal point (gravity well effect).
        // Desktop uses a flat gentle rate.
        let homingRate = streakHomingBase;
        if (streakGravityRadius > 0 && dist < streakGravityRadius) {
          // t goes from 0 (at edge of gravity radius) to 1 (at focal point)
          const t = 1 - dist / streakGravityRadius;
          // Cubic ramp: gentle far away, aggressive close in
          homingRate = 0.01 + 0.25 * t * t * t;
        }
        s.angle = lerp(s.angle, targetAngle, homingRate);

        // Fade to transparent in a small zone right before the input bar
        let streakOpacity = s.opacity;
        if (dist < streakFadeRadius) {
          streakOpacity *= dist / streakFadeRadius;
        }
        // Accelerate — much more aggressive on mobile (no slow-feeling particles)
        if (dist < streakSpeedRadius) {
          s.speed = lerp(s.speed, streakTargetSpeed, streakAccelRate);
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

        if (dist < streakFadeRadius * 0.3 || s.x < -100 || s.x > w + 100 || s.y < -100 || s.y > h + 100) {
          streaks[i] = spawnStreak();
        }
      }

      // ---- Draw motes (converge to center point) ----
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];

        const dx = focal.x - m.x;
        const dy = focal.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Pull toward focal — on mobile, strong pull from very far away
        const t = Math.max(0, 1 - dist / motePullRadius);
        const basePull = isMobile
          ? 0.04 + 0.35 * t * t   // quadratic ramp: strong even at edges, fierce close in
          : 0.003 + 0.04 * t * t * t;
        if (dist > 0) {
          m.vx += (dx / dist) * basePull;
          m.vy += (dy / dist) * basePull;
        }

        // Less damping on mobile so they maintain speed
        const damping = isMobile ? 0.97 : 0.995;
        m.vx *= damping;
        m.vy *= damping;

        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        // Event horizon fade: motes ramp opacity to zero as they approach the center
        // Uses the same fade radius as streaks so the "event horizon" is consistent
        let moteOpacity = m.opacity;
        const lifeProg = m.life / m.maxLife;
        if (lifeProg < 0.1) moteOpacity *= lifeProg / 0.1;
        if (lifeProg > 0.8) moteOpacity *= (1 - lifeProg) / 0.2;
        if (dist < streakFadeRadius) moteOpacity *= dist / streakFadeRadius;

        const color = i % 7 === 0 ? SANDSTORM : VIRIDIAN;

        // Glow
        const gRad = m.radius * 5;
        const grad = ctx!.createRadialGradient(m.x, m.y, 0, m.x, m.y, gRad);
        grad.addColorStop(0, rgba(color, moteOpacity * 0.65));
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

        // Respawn once consumed by the event horizon (or expired)
        if (m.life > m.maxLife || dist < streakFadeRadius * 0.3) {
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
      // Recalculate acceleration radii for new screen size
      screenDiag = Math.sqrt(w * w + h * h);
      streakSpeedRadius = Math.max(300, screenDiag * 0.6);
      streakFadeRadius = w < 768 ? Math.max(120, screenDiag * 0.18) : Math.max(80, screenDiag * 0.12);
      streakTargetSpeed = 3.5;
      streakAccelRate = 0.02;
      streakHomingBase = 0.008;
      streakGravityRadius = 0;
      motePullRadius = w < 768 ? screenDiag * 1.2 : Math.max(400, screenDiag * 0.55);
    }

    window.addEventListener("resize", handleResize);

    // Pause animation when tab is not visible (saves CPU/battery)
    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(animFrame);
      } else {
        animFrame = requestAnimationFrame(draw);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(rectInterval);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="convergence-bg"
        aria-hidden="true"
      />
    </>
  );
}
