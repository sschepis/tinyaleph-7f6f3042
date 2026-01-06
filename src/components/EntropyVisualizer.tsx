import { useEffect, useState } from 'react';

interface EntropyVisualizerProps {
  steps?: number;
}

const EntropyVisualizer = ({ steps = 8 }: EntropyVisualizerProps) => {
  const [entropyValues, setEntropyValues] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Generate decreasing entropy values
    const values = Array.from({ length: steps }, (_, i) => {
      const progress = i / (steps - 1);
      // Entropy decreases exponentially
      return 4 * Math.exp(-2 * progress) + 0.1 + Math.random() * 0.2;
    });
    setEntropyValues(values);
  }, [steps]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps);
    }, 800);
    return () => clearInterval(interval);
  }, [steps]);

  const maxEntropy = 4.5;
  const width = 240;
  const height = 100;
  const padding = 20;

  return (
    <div className="relative">
      <svg width={width} height={height + 40} className="overflow-visible">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i}>
            <line
              x1={padding}
              y1={height - (i / maxEntropy) * (height - padding)}
              x2={width - padding}
              y2={height - (i / maxEntropy) * (height - padding)}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <text
              x={padding - 5}
              y={height - (i / maxEntropy) * (height - padding) + 4}
              textAnchor="end"
              className="text-[10px] fill-muted-foreground font-mono"
            >
              {i}
            </text>
          </g>
        ))}

        {/* Entropy line */}
        <path
          d={entropyValues.map((value, i) => {
            const x = padding + (i / (steps - 1)) * (width - 2 * padding);
            const y = height - (value / maxEntropy) * (height - padding);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {entropyValues.map((value, i) => {
          const x = padding + (i / (steps - 1)) * (width - 2 * padding);
          const y = height - (value / maxEntropy) * (height - padding);
          const isActive = i === currentStep;

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isActive ? 6 : 4}
                fill={isActive ? "hsl(var(--primary))" : "hsl(var(--card))"}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                style={{
                  filter: isActive ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              <text
                x={x}
                y={height + 15}
                textAnchor="middle"
                className="text-[9px] fill-muted-foreground font-mono"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height + 30}
          textAnchor="middle"
          className="text-[10px] fill-muted-foreground"
        >
          Transform Steps
        </text>
        <text
          x={-height / 2}
          y={8}
          textAnchor="middle"
          transform={`rotate(-90)`}
          className="text-[10px] fill-muted-foreground"
        >
          Entropy (bits)
        </text>
      </svg>
    </div>
  );
};

export default EntropyVisualizer;
