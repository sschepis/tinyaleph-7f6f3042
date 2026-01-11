import React from 'react';
import { motion } from 'framer-motion';
import type { Symbol } from '@/lib/symbolic-mind/types';

interface SymbolNodeProps {
  symbol: Symbol;
  isActive?: boolean;
  isAnchoring?: boolean;
  resonance?: number;
  position: { x: number; y: number };
  onClick?: () => void;
}

export function SymbolNode({ 
  symbol, 
  isActive = false, 
  isAnchoring = false,
  resonance = 0,
  position,
  onClick 
}: SymbolNodeProps) {
  const baseSize = isAnchoring ? 56 : 44;
  const glowIntensity = isActive ? 0.8 : resonance;
  
  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isActive ? 1.2 : 1, 
        opacity: 1,
      }}
      whileHover={{ scale: 1.3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: isAnchoring 
            ? `radial-gradient(circle, hsl(var(--primary) / ${glowIntensity * 0.6}) 0%, transparent 70%)`
            : `radial-gradient(circle, hsl(45 100% 60% / ${glowIntensity * 0.5}) 0%, transparent 70%)`,
          width: baseSize * 2,
          height: baseSize * 2,
          left: -baseSize / 2,
          top: -baseSize / 2,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [glowIntensity, glowIntensity * 0.7, glowIntensity],
        }}
        transition={{
          duration: 2 + Math.random(),
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Symbol circle */}
      <div
        className={`
          relative flex items-center justify-center rounded-full
          ${isAnchoring 
            ? 'bg-primary/20 border-2 border-primary/60' 
            : 'bg-muted/40 border border-border/60'}
          ${isActive ? 'ring-2 ring-yellow-400/60' : ''}
        `}
        style={{ width: baseSize, height: baseSize }}
      >
        <span className="text-2xl" role="img" aria-label={symbol.name}>
          {symbol.unicode}
        </span>
      </div>
      
      {/* Label */}
      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs text-muted-foreground/80">
          {symbol.name}
        </span>
      </div>
      
      {/* Resonance indicator */}
      {resonance > 0.3 && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
