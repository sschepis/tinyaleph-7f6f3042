import { useMemo } from 'react';
import { PrimeState, getProbabilities, FIRST_64_PRIMES } from '@/lib/prime-resonance';

interface ProbabilityBarsProps {
  state: PrimeState;
  measurements?: { prime: number; count: number }[];
  height?: number;
}

export function ProbabilityBars({ state, measurements = [], height = 180 }: ProbabilityBarsProps) {
  const probabilities = useMemo(() => {
    const probs = getProbabilities(state);
    const maxProb = Math.max(...probs.map(p => p.probability), 0.001);
    
    // Show top 16 primes by probability
    return probs.slice(0, 16).map(p => ({
      ...p,
      normalized: p.probability / maxProb
    }));
  }, [state]);
  
  const measurementMap = useMemo(() => {
    const map = new Map<number, number>();
    const total = measurements.reduce((sum, m) => sum + m.count, 0) || 1;
    measurements.forEach(m => map.set(m.prime, m.count / total));
    return map;
  }, [measurements]);
  
  const barWidth = 100 / probabilities.length;
  
  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        {/* Background */}
        <rect x="0" y="0" width="100" height={height} fill="hsl(var(--muted))" fillOpacity="0.3" rx="2" />
        
        {/* Probability bars */}
        {probabilities.map((p, i) => {
          const barHeight = p.normalized * (height - 30);
          const x = i * barWidth + barWidth * 0.1;
          const y = height - 20 - barHeight;
          const measuredHeight = (measurementMap.get(p.prime) || 0) * (height - 30);
          
          return (
            <g key={p.prime}>
              {/* Theoretical probability bar */}
              <rect
                x={x}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill="hsl(var(--primary))"
                fillOpacity="0.6"
                rx="1"
              />
              
              {/* Measured frequency overlay */}
              {measurementMap.has(p.prime) && (
                <rect
                  x={x + barWidth * 0.15}
                  y={height - 20 - measuredHeight}
                  width={barWidth * 0.5}
                  height={measuredHeight}
                  fill="hsl(var(--chart-2))"
                  fillOpacity="0.8"
                  rx="1"
                />
              )}
              
              {/* Prime label */}
              <text
                x={x + barWidth * 0.4}
                y={height - 6}
                textAnchor="middle"
                fontSize="4"
                fill="hsl(var(--foreground))"
                className="font-mono"
              >
                {p.prime}
              </text>
              
              {/* Probability value */}
              <text
                x={x + barWidth * 0.4}
                y={y - 3}
                textAnchor="middle"
                fontSize="3.5"
                fill="hsl(var(--muted-foreground))"
              >
                {(p.probability * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        
        {/* Axis */}
        <line x1="0" y1={height - 20} x2="100" y2={height - 20} stroke="hsl(var(--border))" strokeWidth="0.3" />
      </svg>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-primary/60 rounded-sm" />
          |α_p|² theory
        </span>
        {measurements.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-chart-2/80 rounded-sm" />
            measured
          </span>
        )}
      </div>
    </div>
  );
}
