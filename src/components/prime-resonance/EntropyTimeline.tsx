import { useMemo } from 'react';
import { EvolutionState } from '@/lib/prime-resonance/types';

interface EntropyTimelineProps {
  history: EvolutionState[];
  current: EvolutionState;
  height?: number;
}

export function EntropyTimeline({ history, current, height = 120 }: EntropyTimelineProps) {
  const data = useMemo(() => {
    const points = [...history, current].slice(-60);
    if (points.length === 0) return [];
    
    const maxEntropy = Math.max(...points.map(p => p.entropy), 4);
    const maxTime = Math.max(...points.map(p => p.time), 1);
    
    return points.map((p, i) => ({
      x: (p.time / maxTime) * 100,
      entropyY: height - 20 - (p.entropy / maxEntropy) * (height - 30),
      collapseY: height - 20 - p.collapseProb * (height - 30),
      ...p
    }));
  }, [history, current, height]);
  
  const entropyPath = useMemo(() => {
    if (data.length < 2) return '';
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${d.entropyY}`).join(' ');
  }, [data]);
  
  const collapsePath = useMemo(() => {
    if (data.length < 2) return '';
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${d.collapseY}`).join(' ');
  }, [data]);
  
  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((y, i) => (
          <line
            key={i}
            x1="0"
            y1={height - 20 - y * (height - 30)}
            x2="100"
            y2={height - 20 - y * (height - 30)}
            stroke="hsl(var(--border))"
            strokeWidth="0.2"
            strokeDasharray="1 2"
          />
        ))}
        
        {/* Entropy curve */}
        <path
          d={entropyPath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.8"
        />
        
        {/* Collapse probability curve */}
        <path
          d={collapsePath}
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="0.5"
          strokeDasharray="2 1"
        />
        
        {/* Current point indicators */}
        {data.length > 0 && (
          <>
            <circle
              cx={data[data.length - 1].x}
              cy={data[data.length - 1].entropyY}
              r="2"
              fill="hsl(var(--primary))"
            />
            <circle
              cx={data[data.length - 1].x}
              cy={data[data.length - 1].collapseY}
              r="1.5"
              fill="hsl(var(--destructive))"
            />
          </>
        )}
        
        {/* Axis */}
        <line x1="0" y1={height - 20} x2="100" y2={height - 20} stroke="hsl(var(--border))" strokeWidth="0.3" />
        
        {/* Labels */}
        <text x="2" y="10" fontSize="4" fill="hsl(var(--muted-foreground))">S(t)</text>
        <text x="50" y={height - 4} textAnchor="middle" fontSize="4" fill="hsl(var(--muted-foreground))">t →</text>
      </svg>
      
      {/* Current values */}
      <div className="flex justify-between mt-2 text-[10px]">
        <span className="text-primary">S = {current.entropy.toFixed(3)} bits</span>
        <span className="text-destructive">P_collapse = {(current.collapseProb * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}
