import React, { useEffect, useRef } from "react";

interface InteractiveBackgroundProps {
  isDark?: boolean;
}

export default function InteractiveBackground({ isDark = false }: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDarkRef = useRef(isDark);

  // Sync prop changes to ref instantly so ticker renders beautiful adapted colors
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Grid details
    const spacing = 65; // Distance between points in grid
    let points: Array<{
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      row: number;
      col: number;
    }> = [];

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;

    // Mouse coordinates (interpolated for elegant trailing & lag effect)
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    // Low resource constraint values
    let isLoopRunning = false;
    let idleCounter = 0;

    // Initialize points based on current canvas dimension
    const initGrid = (w: number, h: number) => {
      width = w;
      height = h;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      cols = Math.ceil(w / spacing) + 1;
      rows = Math.ceil(h / spacing) + 1;
      points = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;
          points.push({
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            row: r,
            col: c,
          });
        }
      }

      // Wake up loop to render initial frame
      wakeUpLoop();
    };

    // Watch size transitions
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: w, height: h } = entries[0].contentRect;
      initGrid(w, h);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Interactive mouse movement tracker
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
      wakeUpLoop();
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      mouse.active = false;
      wakeUpLoop();
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Dynamic rendering loop using physical spring dampening
    const tick = () => {
      if (!ctx) return;

      // Clear with elegant high transparency for subtle backdrop
      ctx.clearRect(0, 0, width, height);

      // Smoothly ease mouse to its target positions
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
      } else {
        mouse.x += (-1000 - mouse.x) * 0.12;
        mouse.y += (-1000 - mouse.y) * 0.12;
      }

      let activePhysicsCount = 0;

      // Update positions with interactive warp effect
      const radius = 140; // warp influence zone
      const forceMultiplier = 35; // stiffness

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // 1. Calculate distance from mouse pointer
        const dx = mouse.x - p.baseX;
        const dy = mouse.y - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = p.baseX;
        let targetY = p.baseY;

        if (dist < radius) {
          // Push points away or pull depending on distance to simulate physical bending
          const strength = (radius - dist) / radius; // 0 to 1
          const angle = Math.atan2(dy, dx);
          // Bend effect: push away symmetrically
          const bend = strength * forceMultiplier;
          targetX = p.baseX - Math.cos(angle) * bend;
          targetY = p.baseY - Math.sin(angle) * bend;
        }

        // 2. Dynamic Spring Physics (f = -kx - cv)
        const springK = 0.08; // tension
        const dampening = 0.78; // friction

        const ax = (targetX - p.x) * springK;
        const ay = (targetY - p.y) * springK;

        p.vx = (p.vx + ax) * dampening;
        p.vy = (p.vy + ay) * dampening;

        p.x += p.vx;
        p.y += p.vy;

        // Count how many points are actually still in motion
        if (Math.abs(p.vx) > 0.01 || Math.abs(p.vy) > 0.01) {
          activePhysicsCount++;
        }
      }

      // Draw subtle grid lines connecting nodes
      const isDarkActive = isDarkRef.current;
      ctx.strokeStyle = isDarkActive 
        ? "rgba(129, 140, 248, 0.06)" 
        : "rgba(99, 102, 241, 0.04)"; // Indigo adaptive opacity
      ctx.lineWidth = 1;

      // Create indexed matrix for fast grid line rendering
      const grid: Array<Array<typeof points[0]>> = Array.from({ length: rows }, () => []);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.row < rows && p.col < cols) {
          grid[p.row][p.col] = p;
        }
      }

      // Render lines between elements
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const current = grid[r]?.[c];
          if (!current) continue;

          // Right neighbor line
          const right = grid[r]?.[c + 1];
          if (right) {
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(right.x, right.y);
            ctx.stroke();
          }

          // Bottom neighbor line
          const bottom = grid[r + 1]?.[c];
          if (bottom) {
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(bottom.x, bottom.y);
            ctx.stroke();
          }
        }
      }

      // Draw standard minimal dot elements
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        
        // Calculate dynamic dot scale based on local warp displacement
        const dx = p.x - p.baseX;
        const dy = p.y - p.baseY;
        const displacement = Math.sqrt(dx * dx + dy * dy);
        
        if (isDarkActive) {
          ctx.fillStyle = displacement > 1 
            ? "rgba(129, 140, 248, 0.28)" 
            : "rgba(148, 163, 184, 0.15)";
        } else {
          ctx.fillStyle = displacement > 1 
            ? "rgba(99, 102, 241, 0.16)" 
            : "rgba(148, 163, 184, 0.09)"; // Indigo highlight or slate basic
        }

        ctx.beginPath();
        // Slightly larger for points that are warped to emphasize depth
        const r = displacement > 1 ? 2.5 : 1.5;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Energy-efficiency monitor to check if we can sleep the animation frame
      if (activePhysicsCount === 0 && !mouse.active) {
        idleCounter++;
        if (idleCounter > 60) {
          isLoopRunning = false;
          return;
        }
      } else {
        idleCounter = 0;
      }

      if (isLoopRunning) {
        requestAnimationFrame(tick);
      }
    };

    const wakeUpLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        idleCounter = 0;
        requestAnimationFrame(tick);
      }
    };

    // Force rendering wake when dark mode toggles explicitly
    const prevIsDark = isDarkRef.current;
    if (isDark !== prevIsDark) {
      wakeUpLoop();
    }

    return () => {
      isLoopRunning = false;
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Also trigger re-draw on prop change
  useEffect(() => {
    // If the loop is sleeping, wake it up to handle transition to new colors elegantly
    const canvas = canvasRef.current;
    if (canvas) {
      // Just wake it up globally
      const event = new MouseEvent("mousemove", { clientX: -2000, clientY: -2000 });
      window.dispatchEvent(event);
    }
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-70"
      />
    </div>
  );
}
