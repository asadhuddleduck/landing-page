"use client";

import { useEffect, useRef } from "react";

// 3-5 second one-time neural network animation using Canvas
// Nodes connect with glowing viridian lines, particles flow, then settles to ambient

interface Node {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  opacity: number;
  activateAt: number; // ms into animation when this node lights up
  connections: number[]; // indices of connected nodes
}

interface Particle {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  startAt: number;
}

export default function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const VIRIDIAN = { r: 30, g: 186, b: 143 };
    const ANIMATION_DURATION = 4000; // 4 seconds
    const AMBIENT_FADE_START = 3500;

    // Generate nodes in a rough grid with jitter
    const nodes: Node[] = [];
    const cols = 7;
    const rows = 4;
    const padX = width * 0.1;
    const padY = height * 0.15;
    const cellW = (width - padX * 2) / (cols - 1);
    const cellH = (height - padY * 2) / (rows - 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const jitterX = (Math.random() - 0.5) * cellW * 0.4;
        const jitterY = (Math.random() - 0.5) * cellH * 0.4;
        const x = padX + c * cellW + jitterX;
        const y = padY + r * cellH + jitterY;
        // Activate from center outward
        const cx = width / 2;
        const cy = height / 2;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
        const activateAt = (dist / maxDist) * 2000 + Math.random() * 400;

        nodes.push({
          x: cx, // Start at center (burst outward)
          y: cy,
          targetX: x,
          targetY: y,
          radius: 2 + Math.random() * 2,
          opacity: 0,
          activateAt,
          connections: [],
        });
      }
    }

    // Connect each node to 2-3 nearest neighbors
    for (let i = 0; i < nodes.length; i++) {
      const distances = nodes
        .map((n, j) => ({
          idx: j,
          dist: Math.sqrt(
            (nodes[i].targetX - n.targetX) ** 2 +
            (nodes[i].targetY - n.targetY) ** 2
          ),
        }))
        .filter((d) => d.idx !== i)
        .sort((a, b) => a.dist - b.dist);

      const connectCount = 2 + Math.floor(Math.random() * 2);
      for (let k = 0; k < connectCount && k < distances.length; k++) {
        const j = distances[k].idx;
        if (!nodes[i].connections.includes(j)) {
          nodes[i].connections.push(j);
        }
        if (!nodes[j].connections.includes(i)) {
          nodes[j].connections.push(i);
        }
      }
    }

    // Create particles that flow along connections
    const particles: Particle[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (const j of nodes[i].connections) {
        if (j > i && Math.random() > 0.4) {
          particles.push({
            fromNode: i,
            toNode: j,
            progress: 0,
            speed: 0.3 + Math.random() * 0.4,
            startAt: Math.max(nodes[i].activateAt, nodes[j].activateAt) + 200,
          });
        }
      }
    }

    const startTime = performance.now();
    let animFrame: number;

    function ease(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function draw(now: number) {
      const elapsed = now - startTime;
      ctx!.clearRect(0, 0, width, height);

      // Global ambient fade after animation completes
      let globalOpacity = 1;
      if (elapsed > AMBIENT_FADE_START) {
        const fadeProg = Math.min(
          (elapsed - AMBIENT_FADE_START) / (ANIMATION_DURATION - AMBIENT_FADE_START + 1000),
          1
        );
        globalOpacity = 1 - fadeProg * 0.65; // Fade to 35% opacity
      }

      // Update and draw nodes
      for (const node of nodes) {
        if (elapsed < node.activateAt) continue;

        const nodeElapsed = elapsed - node.activateAt;
        const moveProgress = Math.min(nodeElapsed / 800, 1);
        const eased = ease(moveProgress);

        node.x = node.x + (node.targetX - node.x) * 0.1;
        node.y = node.y + (node.targetY - node.y) * 0.1;

        // Snap close to target
        if (moveProgress > 0.9) {
          node.x = node.targetX;
          node.y = node.targetY;
        }

        node.opacity = Math.min(eased * 1.5, 1) * globalOpacity;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (const j of nodes[i].connections) {
          if (j <= i) continue;
          const a = nodes[i];
          const b = nodes[j];
          if (a.opacity === 0 || b.opacity === 0) continue;

          const lineOpacity = Math.min(a.opacity, b.opacity) * 0.3;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.strokeStyle = `rgba(${VIRIDIAN.r},${VIRIDIAN.g},${VIRIDIAN.b},${lineOpacity})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }

      // Draw particles
      for (const p of particles) {
        if (elapsed < p.startAt) continue;

        const pElapsed = elapsed - p.startAt;
        p.progress = (pElapsed * p.speed) / 1000;

        if (p.progress > 1) {
          // Loop particle
          p.progress = p.progress % 1;
        }

        const a = nodes[p.fromNode];
        const b = nodes[p.toNode];
        if (a.opacity === 0 || b.opacity === 0) continue;

        const px = a.x + (b.x - a.x) * p.progress;
        const py = a.y + (b.y - a.y) * p.progress;
        const pOpacity = Math.min(a.opacity, b.opacity) * 0.8 * globalOpacity;

        ctx!.beginPath();
        ctx!.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${VIRIDIAN.r},${VIRIDIAN.g},${VIRIDIAN.b},${pOpacity})`;
        ctx!.fill();
      }

      // Draw nodes (on top)
      for (const node of nodes) {
        if (node.opacity === 0) continue;

        // Glow
        const gradient = ctx!.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 4
        );
        gradient.addColorStop(0, `rgba(${VIRIDIAN.r},${VIRIDIAN.g},${VIRIDIAN.b},${node.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${VIRIDIAN.r},${VIRIDIAN.g},${VIRIDIAN.b},0)`);
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();

        // Core
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${VIRIDIAN.r},${VIRIDIAN.g},${VIRIDIAN.b},${node.opacity})`;
        ctx!.fill();
      }

      // Keep running for ambient state (particles loop)
      if (elapsed < ANIMATION_DURATION + 2000) {
        animFrame = requestAnimationFrame(draw);
      } else {
        // Final ambient frame
        drawAmbient();
      }
    }

    function drawAmbient() {
      ctx!.clearRect(0, 0, width, height);
      const ambientOpacity = 0.35;

      // Draw connections at low opacity
      for (let i = 0; i < nodes.length; i++) {
        for (const j of nodes[i].connections) {
          if (j <= i) continue;
          const a = nodes[i];
          const b = nodes[j];
          ctx!.beginPath();
          ctx!.moveTo(a.targetX, a.targetY);
          ctx!.lineTo(b.targetX, b.targetY);
          ctx!.strokeStyle = `rgba(${VIRIDIAN.r},${VIRIDIAN.g},${VIRIDIAN.b},${0.1 * ambientOpacity})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }

      // Draw nodes at low opacity
      for (const node of nodes) {
        const gradient = ctx!.createRadialGradient(
          node.targetX, node.targetY, 0,
          node.targetX, node.targetY, node.radius * 3
        );
        gradient.addColorStop(0, `rgba(${VIRIDIAN.r},${VIRIDIAN.g},${VIRIDIAN.b},${0.15 * ambientOpacity})`);
        gradient.addColorStop(1, `rgba(${VIRIDIAN.r},${VIRIDIAN.g},${VIRIDIAN.b},0)`);
        ctx!.beginPath();
        ctx!.arc(node.targetX, node.targetY, node.radius * 3, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(node.targetX, node.targetY, node.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${VIRIDIAN.r},${VIRIDIAN.g},${VIRIDIAN.b},${ambientOpacity})`;
        ctx!.fill();
      }
    }

    animFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div className="hero-animation">
      <canvas
        ref={canvasRef}
        className="hero-animation-canvas"
      />
    </div>
  );
}
