import { useEffect, useRef } from 'react';

interface QuantumParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  phase: number;
  phaseSpeed: number;
  history: { x: number; y: number }[];
  entangled: QuantumParticle | null;
}

export function QuantumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<QuantumParticle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const particleCount = 25;
    const particles: QuantumParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        size: Math.random() * 3 + 1,
        color: `hsla(${Math.random() * 120 + 180}, 100%, 60%, 0.7)`,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.05 + 0.01,
        history: [],
        entangled: null
      });
    }

    // Create entangled pairs
    for (let i = 0; i < particleCount - 1; i += 2) {
      particles[i].entangled = particles[i + 1];
      particles[i + 1].entangled = particles[i];
    }

    particlesRef.current = particles;

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Update phase
        p.phase += p.phaseSpeed;

        // Add randomness
        p.vx += (Math.random() * 0.4 - 0.2);
        p.vy += (Math.random() * 0.4 - 0.2);

        // Normalize speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) {
          p.vx = (p.vx / speed) * 2;
          p.vy = (p.vy / speed) * 2;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Store history
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > 50) {
          p.history.shift();
        }

        // Draw trail
        if (p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          for (let i = 1; i < p.history.length; i++) {
            const alpha = i / p.history.length * 0.5;
            ctx.strokeStyle = p.color.replace('0.7', alpha.toString());
            ctx.lineWidth = p.size * 0.7;
            ctx.lineTo(p.history[i].x, p.history[i].y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.history[i].x, p.history[i].y);
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.8 + Math.sin(p.phase) * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Draw entanglement
        if (p.entangled) {
          const dx = p.entangled.x - p.x;
          const dy = p.entangled.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 300) {
            const alpha = Math.min(0.6, 300 / distance);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.entangled.x, p.entangled.y);
            ctx.strokeStyle = p.color.replace('0.7', (alpha * 0.3).toString());
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-15 pointer-events-none"
    />
  );
}
