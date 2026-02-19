"use client";

import { useEffect, useRef } from "react";

// Cycling hero animation: 3 visual modes with smooth crossfades
// Mode 1: Particle constellation (drifting connected particles)
// Mode 2: Signal wave (horizontal energy pulses)
// Mode 3: Morphing mesh (warping grid with flowing energy)

const VIRIDIAN = { r: 30, g: 186, b: 143 };
const VIRIDIAN_DIM = { r: 20, g: 120, b: 95 };
const CYCLE_DURATION = 8000; // ms per mode
const CROSSFADE_DURATION = 1500; // ms for fade between modes
const MODE_COUNT = 3;

function rgba(c: { r: number; g: number; b: number }, a: number): string {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

// ===== MODE 1: Particle Constellation =====
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseOpacity: number;
}

function createParticles(w: number, h: number, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1 + Math.random() * 1.5,
      baseOpacity: 0.3 + Math.random() * 0.5,
    });
  }
  return particles;
}

function drawConstellation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  particles: Particle[],
  time: number,
  opacity: number
) {
  const breathe = 0.85 + Math.sin(time * 0.001) * 0.15;
  const connectionDist = 80;

  // Update positions
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
  }

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < connectionDist) {
        const lineAlpha = (1 - dist / connectionDist) * 0.15 * opacity * breathe;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = rgba(VIRIDIAN, lineAlpha);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  // Draw particles with glow
  for (const p of particles) {
    const pAlpha = p.baseOpacity * opacity * breathe;

    // Glow
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 6);
    grad.addColorStop(0, rgba(VIRIDIAN, pAlpha * 0.4));
    grad.addColorStop(1, rgba(VIRIDIAN, 0));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 6, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = rgba(VIRIDIAN, pAlpha);
    ctx.fill();
  }
}

// ===== MODE 2: Signal Wave =====
function drawSignalWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  opacity: number
) {
  const waveCount = 5;
  const t = time * 0.001;

  for (let wave = 0; wave < waveCount; wave++) {
    const waveY = h * (0.15 + (wave / (waveCount - 1)) * 0.7);
    const waveAlpha = (0.2 + (wave % 2 === 0 ? 0.15 : 0)) * opacity;
    const speed = 1 + wave * 0.3;
    const amplitude = 8 + wave * 3;
    const frequency = 0.008 + wave * 0.002;

    // Draw the wave line
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y =
        waveY +
        Math.sin(x * frequency + t * speed) * amplitude +
        Math.sin(x * frequency * 2.3 + t * speed * 1.7) * amplitude * 0.3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(VIRIDIAN, waveAlpha * 0.6);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw glow beneath the wave
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y =
        waveY +
        Math.sin(x * frequency + t * speed) * amplitude +
        Math.sin(x * frequency * 2.3 + t * speed * 1.7) * amplitude * 0.3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, waveY, 0, waveY + 40);
    grad.addColorStop(0, rgba(VIRIDIAN, waveAlpha * 0.08));
    grad.addColorStop(1, rgba(VIRIDIAN, 0));
    ctx.fillStyle = grad;
    ctx.fill();

    // Pulse particles along the wave
    const pulseCount = 3 + wave;
    for (let p = 0; p < pulseCount; p++) {
      const px = ((t * speed * 50 + p * (w / pulseCount)) % w);
      const py =
        waveY +
        Math.sin(px * frequency + t * speed) * amplitude +
        Math.sin(px * frequency * 2.3 + t * speed * 1.7) * amplitude * 0.3;

      const pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, 8);
      pulseGrad.addColorStop(0, rgba(VIRIDIAN, waveAlpha * 0.8));
      pulseGrad.addColorStop(1, rgba(VIRIDIAN, 0));
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = pulseGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = rgba(VIRIDIAN, waveAlpha);
      ctx.fill();
    }
  }
}

// ===== MODE 3: Morphing Mesh =====
interface MeshPoint {
  baseX: number;
  baseY: number;
  phase: number;
  ampX: number;
  ampY: number;
  freq: number;
}

function createMeshPoints(w: number, h: number, cols: number, rows: number): MeshPoint[] {
  const points: MeshPoint[] = [];
  const cellW = w / (cols - 1);
  const cellH = h / (rows - 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push({
        baseX: c * cellW,
        baseY: r * cellH,
        phase: Math.random() * Math.PI * 2,
        ampX: 10 + Math.random() * 15,
        ampY: 8 + Math.random() * 12,
        freq: 0.5 + Math.random() * 0.5,
      });
    }
  }
  return points;
}

function drawMorphMesh(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mesh: MeshPoint[],
  cols: number,
  time: number,
  opacity: number
) {
  const t = time * 0.001;
  const positions: { x: number; y: number }[] = [];

  // Calculate current positions
  for (const p of mesh) {
    positions.push({
      x: p.baseX + Math.sin(t * p.freq + p.phase) * p.ampX,
      y: p.baseY + Math.cos(t * p.freq * 0.8 + p.phase) * p.ampY,
    });
  }

  // Draw connections (grid lines)
  for (let i = 0; i < positions.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Right neighbor
    if (col < cols - 1) {
      const j = i + 1;
      const midX = (positions[i].x + positions[j].x) / 2;
      const energy = Math.sin(t * 2 + midX * 0.01) * 0.5 + 0.5;
      const lineAlpha = (0.08 + energy * 0.12) * opacity;

      ctx.beginPath();
      ctx.moveTo(positions[i].x, positions[i].y);
      ctx.lineTo(positions[j].x, positions[j].y);
      ctx.strokeStyle = rgba(
        energy > 0.6 ? VIRIDIAN : VIRIDIAN_DIM,
        lineAlpha
      );
      ctx.lineWidth = energy > 0.7 ? 1.5 : 0.8;
      ctx.stroke();
    }

    // Bottom neighbor
    if (row < Math.floor((mesh.length - 1) / cols)) {
      const j = i + cols;
      if (j < positions.length) {
        const midY = (positions[i].y + positions[j].y) / 2;
        const energy = Math.sin(t * 1.5 + midY * 0.015) * 0.5 + 0.5;
        const lineAlpha = (0.06 + energy * 0.1) * opacity;

        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[j].x, positions[j].y);
        ctx.strokeStyle = rgba(
          energy > 0.6 ? VIRIDIAN : VIRIDIAN_DIM,
          lineAlpha
        );
        ctx.lineWidth = energy > 0.7 ? 1.5 : 0.8;
        ctx.stroke();
      }
    }
  }

  // Draw nodes with energy pulses
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const energy = (Math.sin(t * 1.8 + i * 0.3) * 0.5 + 0.5);
    const nodeAlpha = (0.2 + energy * 0.6) * opacity;
    const nodeRadius = 1.5 + energy * 1.5;

    // Glow for high-energy nodes
    if (energy > 0.5) {
      const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, nodeRadius * 8);
      glowGrad.addColorStop(0, rgba(VIRIDIAN, nodeAlpha * 0.3));
      glowGrad.addColorStop(1, rgba(VIRIDIAN, 0));
      ctx.beginPath();
      ctx.arc(p.x, p.y, nodeRadius * 8, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = rgba(VIRIDIAN, nodeAlpha);
    ctx.fill();
  }
}

export default function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Initialize all 3 mode datasets
    const particleCount = Math.min(Math.floor(w * h / 2000), 120);
    const particles = createParticles(w, h, particleCount);
    const meshCols = 10;
    const meshRows = 6;
    const meshPoints = createMeshPoints(w, h, meshCols, meshRows);

    let animFrame: number;
    const startTime = performance.now();

    function draw(now: number) {
      const elapsed = now - startTime;
      ctx!.clearRect(0, 0, w, h);

      // Determine which mode is active and crossfade progress
      const totalCycle = CYCLE_DURATION * MODE_COUNT;
      const cyclePos = elapsed % totalCycle;
      const currentMode = Math.floor(cyclePos / CYCLE_DURATION);
      const modeProgress = (cyclePos % CYCLE_DURATION) / CYCLE_DURATION;

      // Calculate opacity for current and next mode
      let currentOpacity = 1;
      let nextOpacity = 0;
      const fadeStart = 1 - CROSSFADE_DURATION / CYCLE_DURATION;

      if (modeProgress > fadeStart) {
        const fadeProgress = (modeProgress - fadeStart) / (1 - fadeStart);
        currentOpacity = 1 - fadeProgress;
        nextOpacity = fadeProgress;
      }

      const nextMode = (currentMode + 1) % MODE_COUNT;

      // Draw current mode
      drawMode(ctx!, w, h, currentMode, elapsed, currentOpacity, particles, meshPoints, meshCols);

      // Draw next mode (during crossfade)
      if (nextOpacity > 0) {
        drawMode(ctx!, w, h, nextMode, elapsed, nextOpacity, particles, meshPoints, meshCols);
      }

      animFrame = requestAnimationFrame(draw);
    }

    function drawMode(
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      mode: number,
      time: number,
      opacity: number,
      particles: Particle[],
      mesh: MeshPoint[],
      meshCols: number
    ) {
      switch (mode) {
        case 0:
          drawConstellation(ctx, w, h, particles, time, opacity);
          break;
        case 1:
          drawSignalWave(ctx, w, h, time, opacity);
          break;
        case 2:
          drawMorphMesh(ctx, w, h, mesh, meshCols, time, opacity);
          break;
      }
    }

    animFrame = requestAnimationFrame(draw);

    // Handle resize
    function handleResize() {
      w = canvas!.offsetWidth;
      h = canvas!.offsetHeight;
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
    <div className="hero-animation">
      <canvas ref={canvasRef} className="hero-animation-canvas" />
    </div>
  );
}
