import React, { useEffect, useRef, useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Code,
  Atom,
  BrainCircuit,
} from 'lucide-react';

/**
 * LiveBackground Component
 * Renders a global, continuous flowing academic learning wallpaper:
 * - Interactive Knowledge Graph Canvas (synapses & drifting learning nodes across whole screen)
 * - Flowing multi-layer sinusoidal learning waves at bottom
 * - Ambient multi-spectral glow orbs
 * - Floating academic knowledge badges (Calculus, Machine Learning, Algorithms, Physics)
 * - Runs seamlessly as a fixed background across ALL pages of ClassConnect.
 */
export function LiveBackground({ isAuthPage = false, children }) {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive node count
    const isMobile = width < 768;
    const nodeCount = isMobile ? 30 : 65;
    const maxDistance = isMobile ? 100 : 150;

    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark');

    // Create knowledge nodes
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.65,
      vy: (Math.random() - 0.5) * 0.65,
      radius: Math.random() * 2 + 1.2,
      baseRadius: Math.random() * 2 + 1.2,
      pulse: Math.random() * Math.PI,
      pulseSpeed: 0.015 + Math.random() * 0.02,
      // Node color palette: royal indigo, electric violet, cyan, emerald
      hue: Math.random() > 0.6 ? 245 : Math.random() > 0.3 ? 275 : 190,
    }));

    // Global mouse tracking across the entire window
    const handleMouseMove = e => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: -1000, y: -1000 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    // Animation Render Loop
    const render = () => {
      time += 0.014;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle knowledge constellation connections
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];

        // Wave-drift update (sinusoidal learning flow)
        nodeA.x += nodeA.vx + Math.sin(time + nodeA.pulse) * 0.22;
        nodeA.y += nodeA.vy + Math.cos(time + nodeA.pulse) * 0.22;
        nodeA.pulse += nodeA.pulseSpeed;

        // Wrap around boundaries
        if (nodeA.x < 0) nodeA.x = width;
        if (nodeA.x > width) nodeA.x = 0;
        if (nodeA.y < 0) nodeA.y = height;
        if (nodeA.y > height) nodeA.y = 0;

        // Interactive mouse connection
        const dxMouse = mousePos.x - nodeA.x;
        const dyMouse = mousePos.y - nodeA.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 170) {
          const mouseAlpha = (1 - distMouse / 170) * 0.4;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.strokeStyle = isDark
            ? `rgba(129, 140, 248, ${mouseAlpha})`
            : `rgba(99, 102, 241, ${mouseAlpha})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }

        // Inter-node connections (Knowledge Graph Synapses)
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.28 : 0.18);
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = isDark
              ? `hsla(${nodeA.hue}, 85%, 68%, ${alpha})`
              : `hsla(${nodeA.hue}, 70%, 52%, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Draw node particle
        const currentRadius = nodeA.baseRadius + Math.sin(nodeA.pulse) * 0.7;
        ctx.beginPath();
        ctx.arc(nodeA.x, nodeA.y, Math.max(1, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `hsla(${nodeA.hue}, 90%, 75%, 0.75)`
          : `hsla(${nodeA.hue}, 75%, 55%, 0.65)`;
        ctx.shadowColor = `hsla(${nodeA.hue}, 90%, 60%, 0.5)`;
        ctx.shadowBlur = isDark ? 6 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* ── FIXED GLOBAL LIVE LEARNING WALLPAPER LAYER ───────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Ambient Glow Orbs */}
        <div
          className="absolute -top-36 -left-36 w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-brand-600/25 to-indigo-500/20 blur-3xl animate-orb-1"
          style={{ willChange: 'transform' }}
        />
        <div
          className="absolute -bottom-36 -right-36 w-[580px] h-[580px] rounded-full bg-gradient-to-br from-purple-600/20 to-pink-500/15 blur-3xl animate-orb-2"
          style={{ willChange: 'transform' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-teal-500/15 to-cyan-500/15 blur-3xl animate-orb-3"
          style={{ willChange: 'transform' }}
        />

        {/* Dynamic Interactive Knowledge Graph Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Flowing Learning Sinusoidal Waves at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-56 pointer-events-none overflow-hidden opacity-35 dark:opacity-20">
          <div className="absolute bottom-0 w-[200%] h-full animate-wave-flow-1">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z"
                className="fill-brand-500/20 dark:fill-brand-400/15"
              />
            </svg>
          </div>
          <div className="absolute bottom-0 w-[200%] h-full animate-wave-flow-2">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0,40 C300,120 450,10 700,75 C950,140 1050,30 1200,80 L1200,120 L0,120 Z"
                className="fill-indigo-500/20 dark:fill-purple-500/15"
              />
            </svg>
          </div>
        </div>

        {/* Floating Academic & Learning Badges (Dispersed in corners & margins) */}
        <div className="hidden lg:block">
          {/* Badge 1: Top-Left (Calculus & Math) */}
          <div className="absolute top-20 left-8 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 shadow-lg backdrop-blur-md animate-academic-1">
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
              ∫ dx
            </span>
            <div className="text-[10px] leading-tight">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Calculus III</span>
              <span className="text-[9px] text-slate-400 font-mono">e^(iπ) + 1 = 0</span>
            </div>
          </div>

          {/* Badge 2: Top-Right (AI Attention) */}
          <div className="absolute top-24 right-10 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 shadow-lg backdrop-blur-md animate-academic-2">
            <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400">
              <BrainCircuit className="w-3.5 h-3.5" />
            </span>
            <div className="text-[10px] leading-tight">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">AI405 Attention</span>
              <span className="text-[9px] text-brand-600 dark:text-brand-400 font-mono font-semibold">
                softmax(QKᵀ / √d)
              </span>
            </div>
          </div>

          {/* Badge 3: Bottom-Left (Algorithms) */}
          <div className="absolute bottom-16 left-8 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 shadow-lg backdrop-blur-md animate-academic-3">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Code className="w-3.5 h-3.5" />
            </span>
            <div className="text-[10px] leading-tight">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Dijkstra Paths</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                O(V log V + E)
              </span>
            </div>
          </div>

          {/* Badge 4: Bottom-Right (Campus Network) */}
          <div className="absolute bottom-16 right-8 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 shadow-lg backdrop-blur-md animate-academic-1">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <GraduationCap className="w-3.5 h-3.5" />
            </span>
            <div className="text-[10px] leading-tight">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">ClassConnect</span>
              <span className="text-[9px] text-emerald-600 font-semibold">● 1,420 Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Children if wrapped */}
      {children && <div className="relative z-10 w-full">{children}</div>}
    </>
  );
}

export default LiveBackground;
