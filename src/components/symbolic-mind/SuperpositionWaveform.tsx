import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SuperpositionWaveformProps {
  superposition: number[];
  coherence: number;
  converged: boolean;
}

const COMPONENT_LABELS = [
  'e₀', 'e₁', 'e₂', 'e₃', 'e₄', 'e₅', 'e₆', 'e₇',
  'e₈', 'e₉', 'e₁₀', 'e₁₁', 'e₁₂', 'e₁₃', 'e₁₄', 'e₁₅'
];

export function SuperpositionWaveform({ 
  superposition, 
  coherence,
  converged 
}: SuperpositionWaveformProps) {
  // Normalize components for display
  const normalizedComponents = useMemo(() => {
    if (!superposition || superposition.length === 0) {
      return new Array(16).fill(0);
    }
    
    const maxAbs = Math.max(...superposition.map(v => Math.abs(v)), 0.001);
    return superposition.map(v => v / maxAbs);
  }, [superposition]);
  
  // Generate waveform path for smooth visualization
  const waveformPath = useMemo(() => {
    if (normalizedComponents.every(v => v === 0)) return '';
    
    const width = 280;
    const height = 60;
    const centerY = height / 2;
    
    const points = normalizedComponents.map((v, i) => {
      const x = (i / 15) * width;
      const y = centerY - v * (height / 2 - 4);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }, [normalizedComponents]);
  
  // Color based on coherence and convergence
  const barColor = useMemo(() => {
    if (converged) return 'hsl(var(--primary))';
    const hue = 220 + coherence * 60; // Blue to purple
    return `hsl(${hue}, 70%, 55%)`;
  }, [coherence, converged]);

  return (
    <div className="space-y-3">
      {/* Waveform curve */}
      <div className="relative h-16 bg-background/30 rounded-lg border border-border/30 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 280 60" preserveAspectRatio="none">
          {/* Center line */}
          <line 
            x1="0" y1="30" x2="280" y2="30" 
            stroke="hsl(var(--muted-foreground) / 0.2)" 
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          
          {/* Waveform path */}
          {waveformPath && (
            <motion.path
              d={waveformPath}
              fill="none"
              stroke={barColor}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
          
          {/* Area fill under curve */}
          {waveformPath && (
            <motion.path
              d={`${waveformPath} L 280,30 L 0,30 Z`}
              fill={`${barColor}`}
              fillOpacity={0.15}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </svg>
        
        {/* Convergence indicator */}
        {converged && (
          <motion.div
            className="absolute inset-0 bg-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.1] }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
      
      {/* Component bars */}
      <div className="flex items-end justify-between gap-0.5 h-20 px-1">
        {normalizedComponents.map((value, i) => {
          const absValue = Math.abs(value);
          const isPositive = value >= 0;
          const minHeight = 3;
          const maxHeight = 32;
          const barHeight = minHeight + absValue * (maxHeight - minHeight);
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {/* Bar container with bidirectional display */}
              <div className="relative h-16 w-full flex items-center justify-center">
                {/* Center baseline */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-border/40" />
                
                {/* Bar */}
                <motion.div
                  className="absolute w-full max-w-[14px] mx-auto rounded-sm"
                  style={{
                    backgroundColor: isPositive 
                      ? `hsl(var(--primary) / ${0.4 + absValue * 0.6})` 
                      : `hsl(0, 70%, 50%, ${0.3 + absValue * 0.5})`,
                    height: `${barHeight}px`,
                    top: isPositive ? `calc(50% - ${barHeight}px)` : '50%',
                    boxShadow: absValue > 0.5 
                      ? `0 0 8px ${isPositive ? 'hsl(var(--primary) / 0.4)' : 'hsl(0, 70%, 50%, 0.3)'}` 
                      : 'none',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: i * 0.02,
                    ease: 'easeOut'
                  }}
                />
              </div>
              
              {/* Label */}
              <span className="text-[8px] text-muted-foreground/70 font-mono">
                {COMPONENT_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Stats */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>16-dimensional superposition</span>
        <span className={converged ? 'text-primary' : ''}>
          {converged ? '⟨ψ|ψ⟩ = 1 (collapsed)' : `‖ψ‖ = ${coherence.toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}
