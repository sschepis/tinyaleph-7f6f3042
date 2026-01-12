import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Oscillator } from '../types';

interface ExplorationHeatmapProps {
  oscillators: Oscillator[];
  activationCounts: number[];
  recentlyExploredIndices: number[];
  size?: number;
}

export const ExplorationHeatmap: React.FC<ExplorationHeatmapProps> = ({
  oscillators,
  activationCounts,
  recentlyExploredIndices,
  size = 280
}) => {
  // Calculate grid dimensions (aim for roughly square)
  const numOscillators = oscillators.length;
  const cols = Math.ceil(Math.sqrt(numOscillators));
  const rows = Math.ceil(numOscillators / cols);
  const cellSize = Math.floor(size / cols) - 1;
  
  // Calculate max activation for normalization
  const maxActivation = useMemo(() => 
    Math.max(1, ...activationCounts), 
    [activationCounts]
  );
  
  // Calculate statistics
  const stats = useMemo(() => {
    const explored = activationCounts.filter(c => c > 0).length;
    const total = activationCounts.length;
    const totalActivations = activationCounts.reduce((a, b) => a + b, 0);
    const avgActivation = explored > 0 ? totalActivations / explored : 0;
    
    return {
      explored,
      total,
      percentage: (explored / total) * 100,
      totalActivations,
      avgActivation
    };
  }, [activationCounts]);
  
  // Get color based on activation intensity
  const getColor = (count: number, isRecent: boolean) => {
    if (count === 0) {
      return 'hsla(var(--muted-foreground), 0.15)';
    }
    
    const intensity = count / maxActivation;
    
    if (isRecent) {
      // Gold/amber for recently explored
      return `hsla(45, 100%, ${50 + intensity * 20}%, ${0.7 + intensity * 0.3})`;
    }
    
    // Gradient from blue (low) to cyan to green to yellow (high)
    if (intensity < 0.25) {
      return `hsla(220, 70%, ${40 + intensity * 80}%, ${0.5 + intensity * 2})`;
    } else if (intensity < 0.5) {
      return `hsla(180, 70%, ${50 + (intensity - 0.25) * 40}%, ${0.6 + intensity * 0.4})`;
    } else if (intensity < 0.75) {
      return `hsla(120, 60%, ${50 + (intensity - 0.5) * 30}%, ${0.7 + intensity * 0.3})`;
    } else {
      return `hsla(60, 80%, ${55 + (intensity - 0.75) * 25}%, ${0.85 + intensity * 0.15})`;
    }
  };
  
  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted-foreground/20" />
          <span className="text-muted-foreground">Unexplored</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-12 h-2 rounded-sm bg-gradient-to-r from-blue-500 via-cyan-400 via-green-400 to-yellow-400" />
          <span className="text-muted-foreground">Frequency →</span>
        </div>
      </div>
      
      {/* Heatmap Grid */}
      <div 
        className="relative mx-auto rounded-lg overflow-hidden border border-border/50 bg-background/50"
        style={{ 
          width: size, 
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: '1px',
          padding: '2px'
        }}
      >
        {oscillators.map((osc, idx) => {
          const count = activationCounts[idx] || 0;
          const isRecent = recentlyExploredIndices.includes(idx);
          
          return (
            <motion.div
              key={idx}
              className="relative rounded-[2px] transition-colors"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: getColor(count, isRecent),
              }}
              animate={isRecent ? {
                scale: [1, 1.3, 1],
                boxShadow: [
                  '0 0 0 0 hsla(45, 100%, 60%, 0)',
                  '0 0 8px 2px hsla(45, 100%, 60%, 0.6)',
                  '0 0 0 0 hsla(45, 100%, 60%, 0)'
                ]
              } : {}}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              title={`Prime ${osc.prime}: ${count} activations`}
            >
              {/* Prime number label for larger cells */}
              {cellSize > 16 && count > 0 && (
                <span 
                  className="absolute inset-0 flex items-center justify-center text-[6px] font-mono text-foreground/70"
                >
                  {count}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-muted/30 rounded">
          <div className="text-lg font-mono font-bold text-primary">
            {stats.percentage.toFixed(0)}%
          </div>
          <div className="text-[10px] text-muted-foreground">Coverage</div>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <div className="text-lg font-mono font-bold">
            {stats.explored}/{stats.total}
          </div>
          <div className="text-[10px] text-muted-foreground">Explored</div>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <div className="text-lg font-mono font-bold">
            {stats.totalActivations}
          </div>
          <div className="text-[10px] text-muted-foreground">Total Hits</div>
        </div>
      </div>
    </div>
  );
};
