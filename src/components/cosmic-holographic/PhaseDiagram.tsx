import { useMemo } from 'react';
import { PulsarReference } from '@/lib/cosmic-holographic/types';
import { motion } from 'framer-motion';

interface PhaseDiagramProps {
  pulsars: PulsarReference[];
  activePulsarIds: Set<string>;
  size?: number;
}

export function PhaseDiagram({ pulsars, activePulsarIds, size = 200 }: PhaseDiagramProps) {
  const center = size / 2;
  const radius = size / 2 - 30;
  
  // Find reference pulsar
  const referencePulsar = useMemo(() => 
    pulsars.find(p => p.isReference), [pulsars]
  );
  
  // Calculate positions for each pulsar on the circle
  const pulsarPositions = useMemo(() => {
    return pulsars
      .filter(p => activePulsarIds.has(p.id))
      .map(pulsar => {
        // Phase relative to reference (if exists)
        let relativePhase = pulsar.phase;
        if (referencePulsar && !pulsar.isReference) {
          relativePhase = pulsar.phase - referencePulsar.phase;
        }
        
        // Convert phase to x,y position (0 rad = top, clockwise)
        const angle = relativePhase - Math.PI / 2; // Offset to start from top
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        
        // Inner position for line from center
        const innerRadius = radius * 0.3;
        const innerX = center + Math.cos(angle) * innerRadius;
        const innerY = center + Math.sin(angle) * innerRadius;
        
        return {
          pulsar,
          x,
          y,
          innerX,
          innerY,
          angle,
          relativePhase
        };
      });
  }, [pulsars, activePulsarIds, referencePulsar, center, radius]);

  // Generate tick marks for the circle (every 30 degrees)
  const ticks = useMemo(() => {
    const tickMarks = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180 - Math.PI / 2;
      const outerR = radius + 8;
      const innerR = radius - 4;
      tickMarks.push({
        x1: center + Math.cos(angle) * innerR,
        y1: center + Math.sin(angle) * innerR,
        x2: center + Math.cos(angle) * outerR,
        y2: center + Math.sin(angle) * outerR,
        label: `${i * 30}°`,
        labelX: center + Math.cos(angle) * (radius + 18),
        labelY: center + Math.sin(angle) * (radius + 18),
      });
    }
    return tickMarks;
  }, [center, radius]);

  return (
    <svg width={size} height={size} className="block mx-auto">
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={1}
        opacity={0.3}
      />
      
      {/* Inner circles for reference */}
      <circle
        cx={center}
        cy={center}
        r={radius * 0.66}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={1}
        opacity={0.15}
        strokeDasharray="4 4"
      />
      <circle
        cx={center}
        cy={center}
        r={radius * 0.33}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={1}
        opacity={0.15}
        strokeDasharray="4 4"
      />
      
      {/* Tick marks */}
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            opacity={0.4}
          />
          <text
            x={tick.labelX}
            y={tick.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="hsl(var(--muted-foreground))"
            opacity={0.6}
          >
            {tick.label}
          </text>
        </g>
      ))}
      
      {/* Center point */}
      <circle
        cx={center}
        cy={center}
        r={4}
        fill="hsl(var(--primary))"
        opacity={0.5}
      />
      
      {/* Reference line (0 phase) */}
      <line
        x1={center}
        y1={center}
        x2={center}
        y2={center - radius}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        opacity={0.3}
        strokeDasharray="6 3"
      />
      
      {/* Pulsar phase vectors */}
      {pulsarPositions.map(({ pulsar, x, y, innerX, innerY }) => (
        <g key={pulsar.id}>
          {/* Line from center to pulsar position */}
          <motion.line
            x1={innerX}
            y1={innerY}
            x2={x}
            y2={y}
            stroke={pulsar.isReference ? '#facc15' : '#22d3ee'}
            strokeWidth={pulsar.isReference ? 2.5 : 1.5}
            opacity={0.7}
            initial={false}
            animate={{ x2: x, y2: y }}
            transition={{ duration: 0.1 }}
          />
          
          {/* Pulsar dot */}
          <motion.circle
            cx={x}
            cy={y}
            r={pulsar.isReference ? 6 : 4}
            fill={pulsar.isReference ? '#facc15' : '#22d3ee'}
            initial={false}
            animate={{ cx: x, cy: y }}
            transition={{ duration: 0.1 }}
          />
          
          {/* Pulse animation ring */}
          <motion.circle
            cx={x}
            cy={y}
            r={6}
            fill="none"
            stroke={pulsar.isReference ? '#facc15' : '#22d3ee'}
            strokeWidth={1}
            initial={false}
            animate={{ 
              cx: x, 
              cy: y,
              r: [6, 12, 6],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{ 
              cx: { duration: 0.1 },
              cy: { duration: 0.1 },
              r: { duration: Math.min(pulsar.period / 500, 2), repeat: Infinity },
              opacity: { duration: Math.min(pulsar.period / 500, 2), repeat: Infinity }
            }}
          />
        </g>
      ))}
      
      {/* Legend */}
      <g transform={`translate(${size - 60}, ${size - 30})`}>
        <circle cx={0} cy={0} r={4} fill="#facc15" />
        <text x={8} y={4} fontSize={9} fill="hsl(var(--muted-foreground))">Ref</text>
        <circle cx={35} cy={0} r={4} fill="#22d3ee" />
        <text x={43} y={4} fontSize={9} fill="hsl(var(--muted-foreground))">PSR</text>
      </g>
    </svg>
  );
}
