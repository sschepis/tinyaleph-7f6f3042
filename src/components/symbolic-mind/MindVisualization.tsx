import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SymbolNode } from './SymbolNode';
import type { Symbol, MindState } from '@/lib/symbolic-mind/types';

interface MindVisualizationProps {
  mindState: MindState;
  width?: number;
  height?: number;
}

export function MindVisualization({ 
  mindState, 
  width = 400, 
  height = 400 
}: MindVisualizationProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Position anchoring symbols in a circle
  const anchorPositions = useMemo(() => {
    return mindState.anchoringSymbols.map((symbol, i) => {
      const angle = (i / mindState.anchoringSymbols.length) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(width, height) * 0.35;
      return {
        symbol,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
  }, [mindState.anchoringSymbols, width, height, centerX, centerY]);
  
  // Position active symbols in inner area
  const activePositions = useMemo(() => {
    const activeOnly = mindState.activeSymbols.filter(
      s => !mindState.anchoringSymbols.find(a => a.id === s.id)
    );
    return activeOnly.map((symbol, i) => {
      const angle = (i / Math.max(activeOnly.length, 1)) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.15;
      return {
        symbol,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
  }, [mindState.activeSymbols, mindState.anchoringSymbols, width, height, centerX, centerY]);
  
  // Draw connection lines
  const connections = useMemo(() => {
    const lines: { from: { x: number; y: number }; to: { x: number; y: number }; strength: number }[] = [];
    
    for (const active of activePositions) {
      for (const anchor of anchorPositions) {
        // Simple connection based on category match
        const strength = active.symbol.category === anchor.symbol.category ? 0.7 : 0.3;
        if (strength > 0.25) {
          lines.push({
            from: { x: active.x, y: active.y },
            to: { x: anchor.x, y: anchor.y },
            strength,
          });
        }
      }
    }
    
    return lines;
  }, [activePositions, anchorPositions]);
  
  return (
    <div 
      className="relative bg-background/50 rounded-xl border border-border/30 overflow-hidden"
      style={{ width, height }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at center, hsl(var(--primary) / 0.3) 0%, transparent 70%)`,
          }}
        />
      </div>
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((conn, i) => (
          <motion.line
            key={i}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke={`hsl(var(--primary) / ${conn.strength * 0.5})`}
            strokeWidth={conn.strength * 2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: conn.strength }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          />
        ))}
      </svg>
      
      {/* Center coherence indicator */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 60 + mindState.coherence * 40,
          height: 60 + mindState.coherence * 40,
          background: `radial-gradient(circle, hsl(var(--primary) / ${mindState.coherence * 0.4}) 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Coherence text */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-2xl font-bold text-primary">
          {Math.round(mindState.coherence * 100)}%
        </div>
        <div className="text-xs text-muted-foreground">coherence</div>
      </div>
      
      {/* Anchoring symbols */}
      {anchorPositions.map(({ symbol, x, y }) => (
        <SymbolNode
          key={`anchor-${symbol.id}`}
          symbol={symbol}
          isAnchoring
          isActive={mindState.activeSymbols.some(s => s.id === symbol.id)}
          position={{ x, y }}
        />
      ))}
      
      {/* Active (input) symbols */}
      {activePositions.map(({ symbol, x, y }) => (
        <SymbolNode
          key={`active-${symbol.id}`}
          symbol={symbol}
          isActive
          position={{ x, y }}
        />
      ))}
      
      {/* Iteration counter */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
        iteration {mindState.iteration}
        {mindState.converged && <span className="ml-1 text-green-400">✓</span>}
      </div>
    </div>
  );
}
