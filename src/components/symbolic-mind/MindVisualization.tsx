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
  // Dynamic padding based on size
  const padding = Math.max(40, Math.min(width, height) * 0.12);
  const footerHeight = 28;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding - footerHeight - 10;
  const centerX = width / 2;
  const centerY = (height - footerHeight) / 2;
  
  // Calculate optimal radius based on symbol count and container size
  const anchorRadius = useMemo(() => {
    const symbolCount = mindState.anchoringSymbols.length;
    const maxRadius = Math.min(usableWidth, usableHeight) * 0.44;
    // Ensure minimum spacing between symbols (symbol size + gap)
    const minSpacingRadius = (symbolCount * 56) / (2 * Math.PI);
    return Math.max(minSpacingRadius, maxRadius * 0.6);
  }, [mindState.anchoringSymbols.length, usableWidth, usableHeight]);
  
  // Position anchoring symbols in a circle with proper padding
  const anchorPositions = useMemo(() => {
    return mindState.anchoringSymbols.map((symbol, i) => {
      const angle = (i / mindState.anchoringSymbols.length) * Math.PI * 2 - Math.PI / 2;
      return {
        symbol,
        x: centerX + Math.cos(angle) * anchorRadius,
        y: centerY + Math.sin(angle) * anchorRadius,
        angle,
      };
    });
  }, [mindState.anchoringSymbols, anchorRadius, centerX, centerY]);
  
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
    
    // Inner orbits should be well inside the anchor ring
    const innerRadiusBase = anchorRadius * 0.3;
    const innerRadiusStep = anchorRadius * 0.12;
    
    for (const [, symbols] of categories) {
      const orbitRadius = innerRadiusBase + categoryIndex * innerRadiusStep;
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
  }, [mindState.activeSymbols, mindState.anchoringSymbols, anchorRadius, centerX, centerY]);
  
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
    const numRings = 4;
    const maxRadius = anchorRadius * 0.25;
    
    for (let i = 0; i < numRings; i++) {
      const componentIndex = Math.floor((i / numRings) * 16);
      const amplitude = Math.abs(mindState.superposition[componentIndex] || 0);
      const phase = (i * Math.PI * 2) / numRings;
      const radius = 15 + i * (maxRadius / numRings);
      
      rings.push({ radius, amplitude, phase });
    }
    
    return rings;
  }, [mindState.superposition, anchorRadius]);
  
  // Coherence indicator size - keep it compact
  const coherenceSize = 60 + mindState.coherence * 30;
  
  return (
    <div 
      className="relative bg-background/50 rounded-xl border border-border/30 overflow-hidden"
      style={{ width, height }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(circle at ${centerX}px ${centerY}px, 
                hsl(var(--primary) / 0.12) 0%, 
                hsl(var(--primary) / 0.04) 30%,
                transparent 55%
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
        
        {/* Anchor orbit ring - subtle guide */}
        <circle
          cx={centerX}
          cy={centerY}
          r={anchorRadius}
          fill="none"
          stroke="hsl(var(--border) / 0.3)"
          strokeWidth={1}
          strokeDasharray="4 8"
        />
        
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
        className="absolute rounded-full pointer-events-none"
        style={{
          left: centerX - coherenceSize / 2,
          top: centerY - coherenceSize / 2,
          width: coherenceSize,
          height: coherenceSize,
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${mindState.coherence * 0.4}) 0%, 
            hsl(var(--primary) / ${mindState.coherence * 0.15}) 40%,
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
      <div 
        className="absolute text-center z-20 pointer-events-none"
        style={{
          left: centerX,
          top: centerY,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <motion.div 
          className="text-xl font-bold text-primary"
          animate={{ scale: mindState.converged ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {Math.round(mindState.coherence * 100)}%
        </motion.div>
        <div className="text-[10px] text-muted-foreground">
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
      
      {/* Status indicators - positioned in footer area */}
      <div 
        className="absolute left-3 text-xs text-muted-foreground"
        style={{ bottom: 8 }}
      >
        {mindState.activeSymbols.length} symbols
      </div>
      <div 
        className="absolute right-3 text-xs text-muted-foreground"
        style={{ bottom: 8 }}
      >
        iter {mindState.iteration}
        {mindState.converged && <span className="ml-1 text-green-400">✓</span>}
      </div>
    </div>
  );
}
