import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SymbolNode } from './SymbolNode';
import type { MindState } from '@/lib/symbolic-mind/types';

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
  // Add padding to prevent symbol cutoff (symbol size + label space)
  const padding = 60;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Position anchoring symbols in a circle with proper padding
  const anchorPositions = useMemo(() => {
    return mindState.anchoringSymbols.map((symbol, i) => {
      const angle = (i / mindState.anchoringSymbols.length) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(usableWidth, usableHeight) * 0.42;
      return {
        symbol,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        angle,
      };
    });
  }, [mindState.anchoringSymbols, usableWidth, usableHeight, centerX, centerY]);
  
  // Position active symbols in inner orbits based on their category
  const activePositions = useMemo(() => {
    const activeOnly = mindState.activeSymbols.filter(
      s => !mindState.anchoringSymbols.find(a => a.id === s.id)
    );
    
    // Group by category for orbital positioning
    const categories = new Map<string, typeof activeOnly>();
    for (const symbol of activeOnly) {
      const existing = categories.get(symbol.category) || [];
      existing.push(symbol);
      categories.set(symbol.category, existing);
    }
    
    const positions: { symbol: typeof activeOnly[0]; x: number; y: number; orbit: number }[] = [];
    let categoryIndex = 0;
    
    for (const [, symbols] of categories) {
      const orbitRadius = Math.min(usableWidth, usableHeight) * (0.12 + categoryIndex * 0.06);
      symbols.forEach((symbol, i) => {
        const angle = (i / symbols.length) * Math.PI * 2 + categoryIndex * 0.5;
        positions.push({
          symbol,
          x: centerX + Math.cos(angle) * orbitRadius,
          y: centerY + Math.sin(angle) * orbitRadius,
          orbit: categoryIndex,
        });
      });
      categoryIndex++;
    }
    
    return positions;
  }, [mindState.activeSymbols, mindState.anchoringSymbols, usableWidth, usableHeight, centerX, centerY]);
  
  // Calculate wave interference lines - now showing constructive/destructive
  const interferenceLines = useMemo(() => {
    const lines: { 
      from: { x: number; y: number }; 
      to: { x: number; y: number }; 
      strength: number; 
      constructive: boolean;
    }[] = [];
    
    for (const active of activePositions) {
      for (const anchor of anchorPositions) {
        // Calculate interference based on state vectors if available
        let interference = 0.3;
        let isConstructive = true;
        
        if (active.symbol.state && anchor.symbol.state) {
          let dot = 0;
          for (let i = 0; i < 16; i++) {
            dot += (active.symbol.state[i] || 0) * (anchor.symbol.state[i] || 0);
          }
          interference = (dot + 1) / 2;
          isConstructive = dot > 0;
        } else {
          // Fallback: category-based
          interference = active.symbol.category === anchor.symbol.category ? 0.7 : 0.3;
          isConstructive = interference > 0.5;
        }
        
        if (interference > 0.25) {
          lines.push({
            from: { x: active.x, y: active.y },
            to: { x: anchor.x, y: anchor.y },
            strength: interference,
            constructive: isConstructive,
          });
        }
      }
    }
    
    return lines;
  }, [activePositions, anchorPositions]);
  
  // Superposition wave visualization - rings showing wave amplitude
  const superpositionRings = useMemo(() => {
    if (!mindState.superposition) return [];
    
    const rings: { radius: number; amplitude: number; phase: number }[] = [];
    const numRings = 5;
    const maxRadius = Math.min(usableWidth, usableHeight) * 0.25;
    
    for (let i = 0; i < numRings; i++) {
      const componentIndex = Math.floor((i / numRings) * 16);
      const amplitude = Math.abs(mindState.superposition[componentIndex] || 0);
      const phase = (i * Math.PI * 2) / numRings;
      const radius = 20 + i * (maxRadius / numRings);
      
      rings.push({ radius, amplitude, phase });
    }
    
    return rings;
  }, [mindState.superposition, usableWidth, usableHeight]);
  
  return (
    <div 
      className="relative bg-background/50 rounded-xl border border-border/30"
      style={{ width, height }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(circle at center, 
                hsl(var(--primary) / 0.15) 0%, 
                hsl(var(--primary) / 0.05) 30%,
                transparent 60%
              )
            `,
          }}
        />
      </div>
      
      {/* SVG layer for lines and waves */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          {/* Gradient for constructive interference */}
          <linearGradient id="constructiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>
          
          {/* Gradient for destructive interference */}
          <linearGradient id="destructiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(0, 70%, 50%)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(0, 70%, 50%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(0, 70%, 50%)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Superposition wave rings */}
        {superpositionRings.map((ring, i) => (
          <motion.circle
            key={`ring-${i}`}
            cx={centerX}
            cy={centerY}
            r={ring.radius}
            fill="none"
            stroke={`hsl(var(--primary) / ${0.1 + ring.amplitude * 0.4})`}
            strokeWidth={1 + ring.amplitude * 2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1 + ring.amplitude * 0.1,
              opacity: 0.3 + ring.amplitude * 0.5,
            }}
            transition={{ 
              duration: 0.5,
              delay: i * 0.05,
            }}
          />
        ))}
        
        {/* Interference connection lines */}
        {interferenceLines.map((conn, i) => (
          <motion.line
            key={i}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke={conn.constructive 
              ? `hsl(var(--primary) / ${conn.strength * 0.6})` 
              : `hsl(0, 70%, 50%, ${conn.strength * 0.3})`
            }
            strokeWidth={conn.strength * 2}
            strokeDasharray={conn.constructive ? 'none' : '4 2'}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: conn.strength * 0.8 }}
            transition={{ duration: 0.4, delay: i * 0.02 }}
          />
        ))}
      </svg>
      
      {/* Center coherence indicator with wave animation */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 70 + mindState.coherence * 50,
          height: 70 + mindState.coherence * 50,
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${mindState.coherence * 0.5}) 0%, 
            hsl(var(--primary) / ${mindState.coherence * 0.2}) 40%,
            transparent 70%
          )`,
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2 - mindState.coherence,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Coherence display */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <motion.div 
          className="text-2xl font-bold text-primary"
          animate={{ scale: mindState.converged ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {Math.round(mindState.coherence * 100)}%
        </motion.div>
        <div className="text-xs text-muted-foreground">
          {mindState.converged ? '✨ collapsed' : 'coherence'}
        </div>
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
      
      {/* Active (input and resonated) symbols */}
      {activePositions.map(({ symbol, x, y }) => (
        <SymbolNode
          key={`active-${symbol.id}`}
          symbol={symbol}
          isActive
          position={{ x, y }}
        />
      ))}
      
      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
        {mindState.activeSymbols.length} symbols
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
        iter {mindState.iteration}
        {mindState.converged && <span className="ml-1 text-green-400">✓</span>}
      </div>
    </div>
  );
}
