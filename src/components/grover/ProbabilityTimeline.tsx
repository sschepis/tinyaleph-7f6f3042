import { IterationResult } from '@/lib/grover';
import { motion } from 'framer-motion';

interface ProbabilityTimelineProps {
  history: IterationResult[];
  currentIteration: number;
  optimalIterations: number;
}

export function ProbabilityTimeline({
  history,
  currentIteration,
  optimalIterations,
}: ProbabilityTimelineProps) {
  const maxProb = Math.max(...history.map(h => h.probabilityMarked), 0.1);
  
  return (
    <div className="bg-secondary/20 rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Success Probability vs Iterations</h3>
      
      <div className="relative h-32">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-muted-foreground">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-10 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-dashed border-border/30" />
            <div className="border-b border-dashed border-border/30" />
            <div className="border-b border-border/50" />
          </div>
          
          {/* Data points and line */}
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            {/* Optimal iteration marker */}
            {optimalIterations > 0 && optimalIterations < history.length && (
              <line
                x1={`${(optimalIterations / (history.length - 1)) * 100}%`}
                y1="0"
                x2={`${(optimalIterations / (history.length - 1)) * 100}%`}
                y2="100%"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.5}
              />
            )}
            
            {/* Line connecting points */}
            <polyline
              points={history.map((h, i) => {
                const x = (i / Math.max(history.length - 1, 1)) * 100;
                const y = 100 - (h.probabilityMarked * 100);
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              opacity={0.6}
            />
            
            {/* Data points */}
            {history.map((h, i) => {
              const x = (i / Math.max(history.length - 1, 1)) * 100;
              const y = 100 - (h.probabilityMarked * 100);
              const isCurrent = i === currentIteration;
              const isOptimal = i === optimalIterations;
              
              return (
                <motion.circle
                  key={i}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={isCurrent ? 6 : isOptimal ? 5 : 3}
                  fill={isCurrent ? 'hsl(142 76% 50%)' : isOptimal ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                  stroke={isCurrent ? 'white' : 'none'}
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                />
              );
            })}
          </svg>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="ml-10 flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>0</span>
        <span>Iterations →</span>
        <span>{history.length - 1}</span>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Optimal (k={optimalIterations})</span>
        </div>
      </div>
    </div>
  );
}
