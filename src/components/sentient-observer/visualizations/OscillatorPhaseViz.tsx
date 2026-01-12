import React from 'react';
import { Oscillator } from '../types';

interface OscillatorPhaseVizProps {
  oscillators: Oscillator[];
  coherence: number;
  recentlyExploredIndices?: number[];
  explorationProgress?: number;
}

export const OscillatorPhaseViz: React.FC<OscillatorPhaseVizProps> = ({ 
  oscillators, 
  coherence,
  recentlyExploredIndices = [],
  explorationProgress = 0
}) => {
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 20;

  // Show first 16 oscillators
  const displayOscillators = oscillators.slice(0, 16);

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Exploration progress ring */}
      <circle
        cx={center}
        cy={center}
        r={radius + 8}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeOpacity={0.2}
        strokeWidth={4}
      />
      <circle
        cx={center}
        cy={center}
        r={radius + 8}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeOpacity={0.6}
        strokeWidth={4}
        strokeDasharray={`${explorationProgress * 2 * Math.PI * (radius + 8)} ${2 * Math.PI * (radius + 8)}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        className="transition-all duration-300"
      />
      
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
        const isExploring = recentlyExploredIndices.includes(i);
        const hue = isExploring ? 45 : (i / 16) * 360; // Gold for exploring
        const opacity = Math.min(1, osc.amplitude + 0.2);
        const baseRadius = 4 + osc.amplitude * 4;

        return (
          <g key={i}>
            {/* Pulse ring for exploring oscillators */}
            {isExploring && (
              <>
                <circle
                  cx={x}
                  cy={y}
                  r={baseRadius + 8}
                  fill="none"
                  stroke={`hsla(45, 100%, 60%, 0.6)`}
                  strokeWidth={2}
                  className="animate-ping"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={baseRadius + 4}
                  fill={`hsla(45, 100%, 60%, 0.3)`}
                  className="animate-pulse"
                />
              </>
            )}
            {/* Main oscillator dot */}
            <circle
              cx={x}
              cy={y}
              r={isExploring ? baseRadius * 1.5 : baseRadius}
              fill={isExploring 
                ? `hsla(45, 100%, 60%, ${opacity})` 
                : `hsla(${hue}, 70%, 50%, ${opacity})`
              }
              className={isExploring ? 'transition-all duration-300' : ''}
              style={isExploring ? { filter: 'drop-shadow(0 0 6px hsla(45, 100%, 60%, 0.8))' } : {}}
            />
          </g>
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
