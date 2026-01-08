import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HydrophobicityPlotProps {
  profile: number[];
  proteinSequence: string;
  windowSize?: number;
  showThreshold?: boolean;
}

const HydrophobicityPlot = ({ 
  profile, 
  proteinSequence, 
  windowSize = 7,
  showThreshold = true 
}: HydrophobicityPlotProps) => {
  const width = 500;
  const height = 200;
  const padding = { top: 30, right: 40, bottom: 40, left: 50 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  
  const { minVal, maxVal, path, zeroY } = useMemo(() => {
    if (profile.length === 0) return { minVal: -4.5, maxVal: 4.5, path: '', zeroY: 0 };
    
    const min = Math.min(-4.5, ...profile);
    const max = Math.max(4.5, ...profile);
    const range = max - min;
    
    const scaleX = (i: number) => padding.left + (i / (profile.length - 1)) * plotWidth;
    const scaleY = (v: number) => padding.top + ((max - v) / range) * plotHeight;
    
    const pathData = profile
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(v)}`)
      .join(' ');
    
    return { minVal: min, maxVal: max, path: pathData, zeroY: scaleY(0) };
  }, [profile, plotWidth, plotHeight]);

  const scaleX = (i: number) => padding.left + (i / Math.max(1, profile.length - 1)) * plotWidth;
  
  // Color the line segments based on hydrophobicity
  const segments = useMemo(() => {
    if (profile.length < 2) return [];
    
    return profile.slice(0, -1).map((v, i) => {
      const x1 = scaleX(i);
      const x2 = scaleX(i + 1);
      const y1 = padding.top + ((maxVal - v) / (maxVal - minVal)) * plotHeight;
      const y2 = padding.top + ((maxVal - profile[i + 1]) / (maxVal - minVal)) * plotHeight;
      const isHydrophobic = (v + profile[i + 1]) / 2 > 0;
      
      return { x1, y1, x2, y2, isHydrophobic };
    });
  }, [profile, minVal, maxVal, plotWidth, plotHeight]);

  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <svg width={width} height={height} className="overflow-visible">
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* X-axis at zero */}
        {showThreshold && (
          <line
            x1={padding.left}
            y1={zeroY}
            x2={padding.left + plotWidth}
            y2={zeroY}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}
        
        {/* Y-axis labels */}
        {[-4, -2, 0, 2, 4].map(v => {
          const y = padding.top + ((maxVal - v) / (maxVal - minVal)) * plotHeight;
          return (
            <g key={v}>
              <line
                x1={padding.left - 5}
                y1={y}
                x2={padding.left}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-xs"
              >
                {v}
              </text>
            </g>
          );
        })}
        
        {/* Hydrophobic/Hydrophilic regions */}
        <rect
          x={padding.left}
          y={padding.top}
          width={plotWidth}
          height={zeroY - padding.top}
          fill="hsl(45 80% 50%)"
          opacity={0.1}
        />
        <rect
          x={padding.left}
          y={zeroY}
          width={plotWidth}
          height={padding.top + plotHeight - zeroY}
          fill="hsl(200 80% 50%)"
          opacity={0.1}
        />
        
        {/* Region labels */}
        <text
          x={padding.left + 5}
          y={padding.top + 15}
          className="fill-amber-500 text-xs font-medium"
        >
          Hydrophobic
        </text>
        <text
          x={padding.left + 5}
          y={padding.top + plotHeight - 5}
          className="fill-blue-400 text-xs font-medium"
        >
          Hydrophilic
        </text>
        
        {/* Profile line segments */}
        {segments.map((seg, i) => (
          <motion.line
            key={i}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke={seg.isHydrophobic ? 'hsl(45 80% 50%)' : 'hsl(200 80% 50%)'}
            strokeWidth={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.01, duration: 0.1 }}
          />
        ))}
        
        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={padding.left + plotWidth}
          y2={padding.top + plotHeight}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* X-axis label */}
        <text
          x={padding.left + plotWidth / 2}
          y={height - 5}
          textAnchor="middle"
          className="fill-muted-foreground text-xs"
        >
          Residue Position
        </text>
        
        {/* Y-axis label */}
        <text
          x={-height / 2}
          y={12}
          textAnchor="middle"
          transform="rotate(-90)"
          className="fill-muted-foreground text-xs"
        >
          Hydropathy Index
        </text>
      </svg>
    </div>
  );
};

export default HydrophobicityPlot;
