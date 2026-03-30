'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const N = 28;
    const TEAM_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      team: number;
      targetX: number | null;
      targetY: number | null;
    }

    const nodes: Node[] = Array.from({ length: N }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      team: -1,
      targetX: null,
      targetY: null,
    }));

    let forming = false;
    let formTimer = 0;
    const FORM_INTERVAL = 200;
    const FORM_DURATION = 140;

    const assignTeams = () => {
      const numTeams = 4;
      const centers = Array.from({ length: numTeams }, () => ({
        x: 120 + Math.random() * (width - 240),
        y: 120 + Math.random() * (height - 240),
      }));
      nodes.forEach((node, i) => {
        node.team = i % numTeams;
        const c = centers[node.team];
        node.targetX = c.x + (Math.random() - 0.5) * 90;
        node.targetY = c.y + (Math.random() - 0.5) * 90;
      });
    };

    const disperseTeams = () => {
      nodes.forEach(node => {
        node.team = -1;
        node.targetX = null;
        node.targetY = null;
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      formTimer++;
      if (formTimer === FORM_INTERVAL) {
        forming = true;
        assignTeams();
      } else if (formTimer === FORM_INTERVAL + FORM_DURATION) {
        forming = false;
        disperseTeams();
        formTimer = 0;
      }

      nodes.forEach(node => {
        if (node.targetX !== null && node.targetY !== null) {
          node.x += (node.targetX - node.x) * 0.03;
          node.y += (node.targetY - node.y) * 0.03;
        } else {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
          node.x = Math.max(0, Math.min(width, node.x));
          node.y = Math.max(0, Math.min(height, node.y));
        }
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const sameTeam = forming && nodes[i].team !== -1 && nodes[i].team === nodes[j].team;
          const maxDist = sameTeam ? 130 : 90;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (sameTeam ? 0.55 : 0.12);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            if (sameTeam) {
              const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
              ctx.strokeStyle = TEAM_COLORS[nodes[i].team] + hex;
              ctx.lineWidth = 1.5;
            } else {
              ctx.strokeStyle = `rgba(150, 150, 150, ${alpha})`;
              ctx.lineWidth = 1;
            }
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        const color = forming && node.team !== -1 ? TEAM_COLORS[node.team] : '#6b7280';

        if (forming && node.team !== -1) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = color + '22';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-stone-950 overflow-hidden">

      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />

      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, #0c0a09 100%)'
      }} />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Nav */}
        <nav className="px-8 py-6 flex items-center justify-between">
          <span className="text-xs font-mono text-emerald-500 tracking-widest uppercase">TeamMatch</span>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-stone-400 hover:text-white transition"
          >
            Sign in →
          </button>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">Intelligent Team Formation</span>
            </div>

            <h1 className="text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Build better teams,<br />
              <span className="text-emerald-400">automatically.</span>
            </h1>

            <p className="text-lg text-stone-400 mb-10 max-w-lg mx-auto leading-relaxed">
              TeamMatch helps instructors form balanced, compatible student teams using skills, availability, and AI-powered recommendations.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition text-sm tracking-wide shadow-lg shadow-emerald-500/25"
            >
              Get Started →
            </button>
          </div>
        </div>

        {/* Feature pills */}
        <div className="pb-12 px-4">
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {[
              'Skill-based matching',
              'Schedule compatibility',
              'AI recommendations',
              'Progress tracking',
              'Team health insights',
            ].map(f => (
              <span key={f} className="text-xs text-stone-500 border border-stone-800 rounded-full px-4 py-1.5">
                {f}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
