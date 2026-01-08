import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, GitBranch } from 'lucide-react';

class Quaternion {
  constructor(public w: number, public x: number, public y: number, public z: number) {}
  
  magnitude(): number {
    return Math.sqrt(this.w ** 2 + this.x ** 2 + this.y ** 2 + this.z ** 2);
  }
}

const QuaternionDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const drawVisualization = useCallback((currentAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.35;

    // Clear
    ctx.fillStyle = 'hsl(220, 20%, 10%)';
    ctx.fillRect(0, 0, w, h);

    // Draw coordinate circles
    ctx.strokeStyle = 'hsl(220, 20%, 25%)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(scale => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(cx - radius - 15, cy);
    ctx.lineTo(cx + radius + 15, cy);
    ctx.moveTo(cx, cy - radius - 15);
    ctx.lineTo(cx, cy + radius + 15);
    ctx.stroke();

    // Create quaternion rotation
    const q = new Quaternion(
      Math.cos(currentAngle / 2),
      Math.sin(currentAngle / 2) * 0.577,
      Math.sin(currentAngle / 2) * 0.577,
      Math.sin(currentAngle / 2) * 0.577
    );

    // Draw quaternion components as vectors
    const components = [
      { label: 'w', value: q.w, color: 'hsl(200, 80%, 60%)' },
      { label: 'x', value: q.x, color: 'hsl(0, 80%, 60%)' },
      { label: 'y', value: q.y, color: 'hsl(120, 80%, 60%)' },
      { label: 'z', value: q.z, color: 'hsl(280, 80%, 60%)' },
    ];

    components.forEach((comp, i) => {
      const compAngle = (i / 4) * Math.PI * 2 - Math.PI / 2;
      const len = Math.abs(comp.value) * radius;
      const endX = cx + Math.cos(compAngle) * len;
      const endY = cy + Math.sin(compAngle) * len;

      ctx.strokeStyle = comp.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Label
      ctx.fillStyle = comp.color;
      ctx.font = 'bold 11px monospace';
      const labelX = cx + Math.cos(compAngle) * (radius + 25);
      const labelY = cy + Math.sin(compAngle) * (radius + 25);
      ctx.fillText(`${comp.label}=${comp.value.toFixed(2)}`, labelX - 20, labelY + 4);
    });

    // Draw rotation arc
    ctx.strokeStyle = 'hsl(50, 80%, 50%)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.6, -Math.PI / 2, -Math.PI / 2 + currentAngle);
    ctx.stroke();
    ctx.setLineDash([]);

    // Magnitude indicator
    const mag = q.magnitude();
    ctx.fillStyle = 'hsl(50, 80%, 50%)';
    ctx.font = '11px monospace';
    ctx.fillText(`|q| = ${mag.toFixed(3)}`, 8, 16);
    ctx.fillText(`θ = ${(currentAngle * 180 / Math.PI).toFixed(1)}°`, 8, 32);
  }, []);

  useEffect(() => {
    drawVisualization(angle);
  }, [angle, drawVisualization]);

  const toggleAnimation = () => {
    if (isAnimating) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      let currentAngle = angle;
      
      const animate = () => {
        currentAngle += 0.02;
        if (currentAngle > Math.PI * 2) currentAngle = 0;
        setAngle(currentAngle);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Quaternion Rotation</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Hamilton quaternion multiplication mixes semantic states via rotations in 4D hypercomplex space.
          </p>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Rotation: {(angle * 180 / Math.PI).toFixed(1)}°
            </label>
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.01"
              value={angle}
              onChange={(e) => setAngle(parseFloat(e.target.value))}
              className="w-full"
              disabled={isAnimating}
            />
          </div>

          <button
            onClick={toggleAnimation}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAnimating ? 'Stop' : 'Animate'}
          </button>

          <div className="p-2 rounded bg-muted/50 font-mono text-[10px]">
            q = cos(θ/2) + sin(θ/2)(xi + yj + zk)
          </div>
        </div>

        <div className="flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="rounded-lg border border-border"
          />
        </div>
      </div>
    </div>
  );
};

export default QuaternionDemo;
