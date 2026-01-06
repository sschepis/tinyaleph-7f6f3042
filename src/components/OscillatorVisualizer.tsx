import { useEffect, useState } from 'react';

interface OscillatorVisualizerProps {
  count?: number;
  coupling?: number;
}

const OscillatorVisualizer = ({ count = 8, coupling = 0.3 }: OscillatorVisualizerProps) => {
  const [phases, setPhases] = useState<number[]>(() => 
    Array.from({ length: count }, () => Math.random() * Math.PI * 2)
  );
  const [orderParameter, setOrderParameter] = useState(0);

  useEffect(() => {
    const frequencies = Array.from({ length: count }, (_, i) => 
      1 + (i - count / 2) * 0.1
    );

    const interval = setInterval(() => {
      setPhases(prevPhases => {
        const newPhases = prevPhases.map((phase, i) => {
          // Kuramoto dynamics
          let dPhase = frequencies[i] * 0.02;
          
          for (let j = 0; j < count; j++) {
            if (i !== j) {
              dPhase += (coupling / count) * Math.sin(prevPhases[j] - phase);
            }
          }
          
          return (phase + dPhase) % (Math.PI * 2);
        });
        
        // Calculate order parameter
        let sumCos = 0, sumSin = 0;
        newPhases.forEach(phase => {
          sumCos += Math.cos(phase);
          sumSin += Math.sin(phase);
        });
        const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / count;
        setOrderParameter(r);
        
        return newPhases;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [count, coupling]);

  const centerX = 80;
  const centerY = 80;
  const radius = 60;

  return (
    <div className="relative">
      <svg width="160" height="160" className="overflow-visible">
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        
        {/* Order parameter indicator */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * orderParameter}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          opacity={0.3}
        />
        
        {/* Oscillator dots */}
        {phases.map((phase, i) => {
          const x = centerX + Math.cos(phase) * radius;
          const y = centerY + Math.sin(phase) * radius;
          const hue = 180 + (i / count) * 40;
          
          return (
            <g key={i}>
              {/* Connection line to center */}
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={`hsla(${hue}, 70%, 50%, 0.2)`}
                strokeWidth="1"
              />
              {/* Oscillator dot */}
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={`hsl(${hue}, 70%, 50%)`}
                style={{
                  filter: `drop-shadow(0 0 6px hsla(${hue}, 70%, 50%, 0.8))`
                }}
              />
            </g>
          );
        })}
        
        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r="4"
          fill="hsl(var(--accent))"
          style={{
            filter: 'drop-shadow(0 0 8px hsl(var(--accent)))'
          }}
        />
      </svg>
      
      {/* Order parameter display */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <span className="text-xs font-mono text-muted-foreground">
          r = {orderParameter.toFixed(3)}
        </span>
      </div>
    </div>
  );
};

export default OscillatorVisualizer;
