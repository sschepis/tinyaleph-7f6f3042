import { BlochState } from '@/lib/decoherence/types';
import { useRef, useEffect } from 'react';

interface BlochSphereVizProps {
  bloch: BlochState;
  history: BlochState[];
  showTrajectory?: boolean;
}

export function BlochSphereViz({ bloch, history, showTrajectory = true }: BlochSphereVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = canvas.width;
    const center = size / 2;
    const radius = size * 0.35;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Project 3D to 2D (isometric-ish view)
    const project = (x: number, y: number, z: number) => {
      const angle = Math.PI / 6; // 30 degree rotation
      const px = center + radius * (x * Math.cos(angle) - y * Math.sin(angle));
      const py = center - radius * (x * Math.sin(angle) * 0.5 + y * Math.cos(angle) * 0.5 + z);
      return { px, py };
    };
    
    // Draw sphere wireframe
    ctx.strokeStyle = 'hsla(var(--border), 0.3)';
    ctx.lineWidth = 1;
    
    // Equator
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      const x = Math.cos(theta);
      const y = Math.sin(theta);
      const { px, py } = project(x, y, 0);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    
    // Meridian (x-z plane)
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      const x = Math.cos(theta);
      const z = Math.sin(theta);
      const { px, py } = project(x, 0, z);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    
    // Meridian (y-z plane)
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      const y = Math.cos(theta);
      const z = Math.sin(theta);
      const { px, py } = project(0, y, z);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    
    // Draw axes
    const axisLen = 1.2;
    
    // X axis (red)
    ctx.strokeStyle = 'hsl(0, 70%, 50%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let p = project(-axisLen, 0, 0);
    ctx.moveTo(p.px, p.py);
    p = project(axisLen, 0, 0);
    ctx.lineTo(p.px, p.py);
    ctx.stroke();
    ctx.fillStyle = 'hsl(0, 70%, 50%)';
    ctx.font = '12px monospace';
    ctx.fillText('x', p.px + 5, p.py);
    
    // Y axis (green)
    ctx.strokeStyle = 'hsl(120, 70%, 40%)';
    ctx.beginPath();
    p = project(0, -axisLen, 0);
    ctx.moveTo(p.px, p.py);
    p = project(0, axisLen, 0);
    ctx.lineTo(p.px, p.py);
    ctx.stroke();
    ctx.fillStyle = 'hsl(120, 70%, 40%)';
    ctx.fillText('y', p.px + 5, p.py);
    
    // Z axis (blue)
    ctx.strokeStyle = 'hsl(220, 70%, 50%)';
    ctx.beginPath();
    p = project(0, 0, -axisLen);
    ctx.moveTo(p.px, p.py);
    p = project(0, 0, axisLen);
    ctx.lineTo(p.px, p.py);
    ctx.stroke();
    ctx.fillStyle = 'hsl(220, 70%, 50%)';
    ctx.fillText('|1⟩', p.px + 5, p.py);
    p = project(0, 0, -axisLen);
    ctx.fillText('|0⟩', p.px + 5, p.py + 12);
    
    // Draw trajectory
    if (showTrajectory && history.length > 1) {
      ctx.strokeStyle = 'hsla(280, 70%, 60%, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      history.forEach((h, i) => {
        const { px, py } = project(h.x, h.y, h.z);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
    
    // Draw Bloch vector
    const { px: bx, py: by } = project(bloch.x, bloch.y, bloch.z);
    
    // Vector line
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(bx, by);
    ctx.stroke();
    
    // Vector head
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.arc(bx, by, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Purity indicator (vector length)
    const r = Math.sqrt(bloch.x ** 2 + bloch.y ** 2 + bloch.z ** 2);
    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.font = '11px monospace';
    ctx.fillText(`|r| = ${r.toFixed(3)}`, 10, size - 10);
    
  }, [bloch, history, showTrajectory]);
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="bg-background/50 rounded-lg border border-border"
      />
    </div>
  );
}
