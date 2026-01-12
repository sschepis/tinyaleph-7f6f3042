import React from 'react';
import { Oscillator } from '../types';

interface OscillatorPhaseVizProps {
  oscillators: Oscillator[];
  coherence: number;
}

export const OscillatorPhaseViz: React.FC<OscillatorPhaseVizProps> = ({ oscillators, coherence }) => {
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 20;

  // Show first 16 oscillators
  const displayOscillators = oscillators.slice(0, 16);

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeOpacity={0.3}
      />

      {/* Mean phase indicator */}
      {displayOscillators.length > 0 &&
        (() => {
          const avgPhase = Math.atan2(
            displayOscillators.reduce((s, o) => s + Math.sin(o.phase), 0),
            displayOscillators.reduce((s, o) => s + Math.cos(o.phase), 0)
          );
          const x = center + radius * 0.8 * Math.cos(avgPhase);
          const y = center + radius * 0.8 * Math.sin(avgPhase);
          return (
            <line
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })()}

      {/* Individual oscillators */}
      {displayOscillators.map((osc, i) => {
        const x = center + radius * Math.cos(osc.phase);
        const y = center + radius * Math.sin(osc.phase);
        const hue = (i / 16) * 360;
        const opacity = Math.min(1, osc.amplitude + 0.2);

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4 + osc.amplitude * 4}
            fill={`hsla(${hue}, 70%, 50%, ${opacity})`}
          />
        );
      })}

      {/* Coherence indicator */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-lg font-bold fill-foreground"
      >
        {(coherence * 100).toFixed(0)}%
      </text>
      <text
        x={center}
        y={center + 18}
        textAnchor="middle"
        className="text-xs fill-muted-foreground"
      >
        coherence
      </text>
    </svg>
  );
};
