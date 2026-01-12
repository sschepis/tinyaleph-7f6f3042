import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SymbolicSymbol } from '@/lib/symbolic-mind/types';

interface SymbolNodeProps {
  symbol: SymbolicSymbol;
  isActive?: boolean;
  isAnchoring?: boolean;
  resonance?: number;
  position: { x: number; y: number };
  compact?: boolean;
  onClick?: () => void;
}

export function SymbolNode({ 
  symbol, 
  isActive = false, 
  isAnchoring = false,
  resonance = 0,
  position,
  compact = false,
  onClick 
}: SymbolNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const baseSize = isAnchoring ? 48 : 40;
  const glowIntensity = isActive ? 0.8 : resonance;
  
  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -50%)',
        zIndex: isHovered ? 50 : isActive ? 20 : 10,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isActive ? 1.1 : 1, 
        opacity: 1,
      }}
      whileHover={{ scale: 1.25 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect - reduced size */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: isAnchoring 
            ? `radial-gradient(circle, hsl(var(--primary) / ${glowIntensity * 0.5}) 0%, transparent 70%)`
            : `radial-gradient(circle, hsl(45 100% 60% / ${glowIntensity * 0.4}) 0%, transparent 70%)`,
          width: baseSize * 1.6,
          height: baseSize * 1.6,
          left: -baseSize * 0.3,
          top: -baseSize * 0.3,
        }}
        animate={{
          scale: [1, 1.15, 1],
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
          relative flex items-center justify-center rounded-full transition-colors
          ${isAnchoring 
            ? 'bg-primary/20 border-2 border-primary/60' 
            : 'bg-muted/40 border border-border/60'}
          ${isActive ? 'ring-2 ring-yellow-400/60' : ''}
          ${isHovered ? 'bg-primary/30' : ''}
        `}
        style={{ width: baseSize, height: baseSize }}
      >
        <span className={`${isAnchoring ? 'text-xl' : 'text-lg'}`} role="img" aria-label={symbol.name}>
          {symbol.unicode}
        </span>
      </div>
      
      {/* Label - only shown on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="px-2 py-1 rounded-md bg-popover/95 border border-border/50 shadow-lg backdrop-blur-sm">
              <span className="text-xs font-medium text-foreground">
                {symbol.name}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Resonance indicator */}
      {resonance > 0.3 && (
        <motion.div
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
