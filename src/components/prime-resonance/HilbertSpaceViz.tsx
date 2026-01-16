import { useMemo } from 'react';
import { PrimeState, complex } from '@/lib/prime-resonance';

interface HilbertSpaceVizProps {
  state: PrimeState;
  size?: number;
}

export function HilbertSpaceViz({ state, size = 280 }: HilbertSpaceVizProps) {
  const visualData = useMemo(() => {
    const entries = Array.from(state.amplitudes.entries());
    const maxMag = Math.max(...entries.map(([_, a]) => complex.magnitude(a)), 0.001);
    
    return entries.map(([prime, amp]) => {
      const mag = complex.magnitude(amp);
      const phase = complex.phase(amp);
      const normalizedMag = mag / maxMag;
      
      // Map to polar coordinates - prime determines angle, magnitude determines radius
      const primeAngle = (Math.log(prime) / Math.log(311)) * 2 * Math.PI;
      const r = (size / 2 - 30) * normalizedMag;
      
      return {
        prime,
        x: size / 2 + r * Math.cos(primeAngle),
        y: size / 2 + r * Math.sin(primeAngle),
        magnitude: normalizedMag,
        phase,
        amp
      };
    });
  }, [state, size]);
  
  return (
    <svg width={size} height={size} className="bg-background/50 rounded-lg">
      {/* Background grid */}
      <defs>
        <radialGradient id="hilbert-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <circle cx={size/2} cy={size/2} r={size/2 - 10} fill="url(#hilbert-glow)" />
      
      {/* Concentric circles for probability levels */}
      {[0.25, 0.5, 0.75, 1].map((r, i) => (
        <circle
          key={i}
          cx={size/2}
          cy={size/2}
          r={(size/2 - 30) * r}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity={0.2}
          strokeDasharray="2 4"
        />
      ))}
      
      {/* Prime amplitude vectors */}
      {visualData.map(({ prime, x, y, magnitude, phase }) => (
        <g key={prime}>
          {/* Vector line from center */}
          <line
            x1={size/2}
            y1={size/2}
            x2={x}
            y2={y}
            stroke={`hsl(${(phase + Math.PI) / (2 * Math.PI) * 360}, 70%, 60%)`}
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          
          {/* Amplitude dot */}
          <circle
            cx={x}
            cy={y}
            r={4 + magnitude * 6}
            fill={`hsl(${(phase + Math.PI) / (2 * Math.PI) * 360}, 70%, 60%)`}
            fillOpacity={0.7 + magnitude * 0.3}
          />
          
          {/* Prime label */}
          <text
            x={x + (x > size/2 ? 8 : -8)}
            y={y + 4}
            fontSize="9"
            fill="hsl(var(--foreground))"
            textAnchor={x > size/2 ? 'start' : 'end'}
            className="font-mono"
          >
            {prime}
          </text>
        </g>
      ))}
      
      {/* Center origin */}
      <circle cx={size/2} cy={size/2} r={3} fill="hsl(var(--primary))" />
      
      {/* Labels */}
      <text x={size/2} y={16} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
        |ψ⟩ ∈ ℋ_P
      </text>
    </svg>
  );
}
