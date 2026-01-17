import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface QubitVisualizerProps {
  angle: number;
  label: string;
  color: string;
  result?: 0 | 1 | null;
  onAngleChange?: (angle: number) => void;
}

export function QubitVisualizer({ 
  angle, 
  label, 
  color, 
  result,
  onAngleChange 
}: QubitVisualizerProps) {
  const size = 120;
  const center = size / 2;
  const radius = 45;
  
  // Arrow endpoint
  const arrowX = center + radius * Math.cos(-angle + Math.PI / 2);
  const arrowY = center - radius * Math.sin(-angle + Math.PI / 2);
  
  // Angle in degrees for display
  const angleDeg = ((angle * 180 / Math.PI) % 360).toFixed(0);
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-medium">{label}</div>
      
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1}
          />
          
          {/* Axis markers */}
          <line x1={center} y1={center - radius - 5} x2={center} y2={center - radius + 5} 
                stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
          <line x1={center + radius - 5} y1={center} x2={center + radius + 5} y2={center} 
                stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
          
          {/* |0⟩ and |1⟩ labels */}
          <text x={center} y={center - radius - 10} 
                textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.5}>
            |0⟩
          </text>
          <text x={center} y={center + radius + 15} 
                textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.5}>
            |1⟩
          </text>
          
          {/* Measurement arrow */}
          <motion.line
            x1={center}
            y1={center}
            x2={arrowX}
            y2={arrowY}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            initial={false}
            animate={{ x2: arrowX, y2: arrowY }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          
          {/* Arrow head */}
          <motion.circle
            cx={arrowX}
            cy={arrowY}
            r={5}
            fill={color}
            initial={false}
            animate={{ cx: arrowX, cy: arrowY }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          
          {/* Center dot */}
          <circle cx={center} cy={center} r={3} fill={color} />
        </svg>
        
        {/* Result indicator */}
        {result !== null && result !== undefined && (
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {result}
          </motion.div>
        )}
      </div>
      
      <div className="text-xs font-mono text-muted-foreground">
        θ = {angleDeg}°
      </div>
      
      {onAngleChange && (
        <input
          type="range"
          min={0}
          max={360}
          value={(angle * 180 / Math.PI) % 360}
          onChange={(e) => onAngleChange(Number(e.target.value) * Math.PI / 180)}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      )}
    </div>
  );
}
