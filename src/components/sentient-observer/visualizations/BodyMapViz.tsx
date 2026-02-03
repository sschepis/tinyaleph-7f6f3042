import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BodyRegion } from '@/lib/symbolic-mind/types';
import type { AggregateSomaticState } from '@/lib/symbolic-mind/somatic-database';

interface BodyMapVizProps {
  somaticState: AggregateSomaticState;
  size?: number;
  showLabels?: boolean;
}

// Body region positions (percentage-based for scalable SVG)
const BODY_REGIONS: Record<BodyRegion, { cx: number; cy: number; r: number; color: string; label: string }> = {
  'crown': { cx: 50, cy: 6, r: 5, color: 'violet', label: 'Crown' },
  'third-eye': { cx: 50, cy: 12, r: 4, color: 'indigo', label: 'Third Eye' },
  'throat': { cx: 50, cy: 22, r: 4.5, color: 'blue', label: 'Throat' },
  'heart': { cx: 50, cy: 32, r: 6, color: 'green', label: 'Heart' },
  'solar-plexus': { cx: 50, cy: 42, r: 5.5, color: 'yellow', label: 'Solar Plexus' },
  'sacral': { cx: 50, cy: 52, r: 5, color: 'orange', label: 'Sacral' },
  'root': { cx: 50, cy: 62, r: 5, color: 'red', label: 'Root' },
  'spine': { cx: 50, cy: 42, r: 3, color: 'white', label: 'Spine' },
  'hands': { cx: 25, cy: 50, r: 4, color: 'cyan', label: 'Hands' },
  'feet': { cx: 35, cy: 92, r: 4, color: 'brown', label: 'Feet' },
  'chest': { cx: 50, cy: 30, r: 8, color: 'teal', label: 'Chest' },
  'belly': { cx: 50, cy: 48, r: 7, color: 'amber', label: 'Belly' },
  'limbs': { cx: 75, cy: 50, r: 4, color: 'slate', label: 'Limbs' },
  'skin': { cx: 50, cy: 50, r: 25, color: 'purple', label: 'Skin' },
  'whole-body': { cx: 50, cy: 50, r: 30, color: 'gold', label: 'Whole Body' },
  'jaw': { cx: 50, cy: 16, r: 3.5, color: 'pink', label: 'Jaw' }
};

// Color mapping to HSL values
const COLOR_TO_HSL: Record<string, string> = {
  'violet': '270, 70%, 60%',
  'indigo': '240, 60%, 55%',
  'blue': '210, 70%, 55%',
  'green': '140, 60%, 45%',
  'yellow': '50, 90%, 55%',
  'orange': '30, 90%, 55%',
  'red': '0, 70%, 55%',
  'white': '0, 0%, 80%',
  'cyan': '180, 70%, 50%',
  'brown': '30, 40%, 40%',
  'teal': '175, 60%, 45%',
  'amber': '40, 80%, 50%',
  'slate': '220, 15%, 50%',
  'purple': '280, 60%, 55%',
  'gold': '45, 80%, 55%',
  'pink': '330, 70%, 60%'
};

export const BodyMapViz: React.FC<BodyMapVizProps> = ({ 
  somaticState, 
  size = 200,
  showLabels = false 
}) => {
  // Track previously active regions to detect new activations
  const prevRegionsRef = useRef<Set<BodyRegion>>(new Set());
  const [newlyActivated, setNewlyActivated] = useState<Set<BodyRegion>>(new Set());

  // Build intensity map from state
  const regionIntensities = useMemo(() => {
    const map = new Map<BodyRegion, number>();
    somaticState.dominantRegions.forEach(({ region, intensity }) => {
      map.set(region, intensity);
    });
    return map;
  }, [somaticState.dominantRegions]);

  // Detect newly activated regions
  useEffect(() => {
    const currentRegions = new Set(somaticState.dominantRegions.map(r => r.region));
    const newRegions = new Set<BodyRegion>();
    
    currentRegions.forEach(region => {
      if (!prevRegionsRef.current.has(region)) {
        newRegions.add(region);
      }
    });
    
    if (newRegions.size > 0) {
      setNewlyActivated(newRegions);
      // Clear "newly activated" status after animation completes
      const timer = setTimeout(() => {
        setNewlyActivated(new Set());
      }, 1500);
      return () => clearTimeout(timer);
    }
    
    prevRegionsRef.current = currentRegions;
  }, [somaticState.dominantRegions]);

  // Determine nervous system color tint
  const nsColor = useMemo(() => {
    const balance = somaticState.nervousSystemBalance;
    if (balance > 0.3) return 'hsl(15, 80%, 55%)'; // warm/sympathetic
    if (balance < -0.3) return 'hsl(200, 70%, 55%)'; // cool/parasympathetic
    return 'hsl(45, 70%, 55%)'; // balanced/gold
  }, [somaticState.nervousSystemBalance]);

  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      className="overflow-visible"
    >
      {/* Gradient definitions */}
      <defs>
        <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={nsColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={nsColor} stopOpacity="0" />
        </radialGradient>
        
        {/* Region-specific gradients */}
        {Object.entries(BODY_REGIONS).map(([region, config]) => (
          <radialGradient key={region} id={`glow-${region}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`hsl(${COLOR_TO_HSL[config.color]})`} stopOpacity="0.9" />
            <stop offset="70%" stopColor={`hsl(${COLOR_TO_HSL[config.color]})`} stopOpacity="0.4" />
            <stop offset="100%" stopColor={`hsl(${COLOR_TO_HSL[config.color]})`} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Background body silhouette */}
      <g className="opacity-30">
        {/* Head */}
        <ellipse cx="50" cy="10" rx="10" ry="10" fill="currentColor" />
        {/* Neck */}
        <rect x="46" y="18" width="8" height="6" fill="currentColor" />
        {/* Torso */}
        <ellipse cx="50" cy="40" rx="18" ry="22" fill="currentColor" />
        {/* Arms */}
        <ellipse cx="25" cy="40" rx="4" ry="18" fill="currentColor" transform="rotate(-15, 25, 40)" />
        <ellipse cx="75" cy="40" rx="4" ry="18" fill="currentColor" transform="rotate(15, 75, 40)" />
        {/* Legs */}
        <ellipse cx="40" cy="78" rx="6" ry="22" fill="currentColor" transform="rotate(-5, 40, 78)" />
        <ellipse cx="60" cy="78" rx="6" ry="22" fill="currentColor" transform="rotate(5, 60, 78)" />
        {/* Feet */}
        <ellipse cx="38" cy="98" rx="6" ry="3" fill="currentColor" />
        <ellipse cx="62" cy="98" rx="6" ry="3" fill="currentColor" />
      </g>

      {/* Overall body glow based on intensity */}
      {somaticState.overallIntensity > 0.2 && (
        <motion.ellipse
          cx="50"
          cy="45"
          rx="35"
          ry="45"
          fill="url(#bodyGlow)"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Spine line for spine region */}
      {regionIntensities.has('spine') && (
        <motion.line
          x1="50"
          y1="20"
          x2="50"
          y2="62"
          stroke={`hsl(${COLOR_TO_HSL['white']})`}
          strokeWidth={2 + (regionIntensities.get('spine')! * 3)}
          strokeLinecap="round"
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Active body regions */}
      {somaticState.dominantRegions.map(({ region, intensity }) => {
        const config = BODY_REGIONS[region];
        if (!config || region === 'spine') return null; // Spine handled separately
        
        const isNewlyActivated = newlyActivated.has(region);
        
        // For paired regions like hands/feet, render both sides
        const isLeftRight = region === 'hands' || region === 'limbs';
        const positions = isLeftRight 
          ? [{ cx: 25, cy: config.cy }, { cx: 75, cy: config.cy }]
          : region === 'feet'
            ? [{ cx: 38, cy: 94 }, { cx: 62, cy: 94 }]
            : [{ cx: config.cx, cy: config.cy }];

        return positions.map((pos, i) => (
          <motion.g key={`${region}-${i}`}>
            {/* Activation pulse ring - only shown when newly activated */}
            <AnimatePresence>
              {isNewlyActivated && (
                <motion.circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={config.r}
                  fill="none"
                  stroke={`hsl(${COLOR_TO_HSL[config.color]})`}
                  strokeWidth={2}
                  initial={{ r: config.r, opacity: 1, strokeWidth: 3 }}
                  animate={{ 
                    r: config.r * 3, 
                    opacity: 0, 
                    strokeWidth: 0.5 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.2,
                    ease: 'easeOut',
                    repeat: 1
                  }}
                />
              )}
            </AnimatePresence>
            
            {/* Outer glow */}
            <motion.circle
              cx={pos.cx}
              cy={pos.cy}
              r={config.r * (1 + intensity * 0.8)}
              fill={`url(#glow-${region})`}
              initial={isNewlyActivated ? { scale: 0, opacity: 0 } : false}
              animate={{
                r: [
                  config.r * (1 + intensity * 0.6),
                  config.r * (1 + intensity * 1.0),
                  config.r * (1 + intensity * 0.6)
                ],
                opacity: [0.5, 0.8, 0.5],
                scale: 1
              }}
              transition={{
                duration: isNewlyActivated ? 0.4 : 2 - intensity * 0.5,
                repeat: isNewlyActivated ? 0 : Infinity,
                ease: 'easeInOut',
                delay: i * 0.2
              }}
            />
            {/* Core point */}
            <motion.circle
              cx={pos.cx}
              cy={pos.cy}
              r={config.r * 0.4}
              fill={`hsl(${COLOR_TO_HSL[config.color]})`}
              initial={isNewlyActivated ? { scale: 0 } : false}
              animate={{
                scale: isNewlyActivated ? [0, 1.5, 1] : [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: isNewlyActivated ? 0.5 : 1.5,
                repeat: isNewlyActivated ? 0 : Infinity,
                ease: isNewlyActivated ? 'easeOut' : 'easeInOut',
                delay: i * 0.1
              }}
            />
            {/* Label */}
            {showLabels && i === 0 && (
              <motion.text
                x={pos.cx + config.r + 3}
                y={pos.cy + 1}
                fontSize="3"
                fill="currentColor"
                className="text-muted-foreground opacity-70"
                initial={isNewlyActivated ? { opacity: 0 } : false}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {config.label}
              </motion.text>
            )}
          </motion.g>
        ));
      })}

      {/* Energy center indicators (chakra-like) */}
      {['crown', 'third-eye', 'throat', 'heart', 'solar-plexus', 'sacral', 'root'].map((center, i) => {
        const isActive = somaticState.activeEnergyCenters.includes(center);
        const config = BODY_REGIONS[center as BodyRegion];
        if (!isActive || !config) return null;
        
        return (
          <motion.circle
            key={`energy-${center}`}
            cx={config.cx}
            cy={config.cy}
            r={config.r * 0.2}
            fill="white"
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1
            }}
          />
        );
      })}

      {/* Nervous system indicator bar at bottom */}
      <g transform="translate(10, 108)">
        <rect x="0" y="0" width="80" height="6" rx="3" fill="hsl(var(--muted))" />
        <motion.rect
          x="40"
          y="0"
          width={Math.abs(somaticState.nervousSystemBalance) * 40}
          height="6"
          rx="3"
          fill={somaticState.nervousSystemBalance > 0 ? 'hsl(15, 70%, 50%)' : 'hsl(200, 70%, 50%)'}
          animate={{
            x: somaticState.nervousSystemBalance > 0 ? 40 : 40 - Math.abs(somaticState.nervousSystemBalance) * 40
          }}
        />
        <circle cx="40" cy="3" r="2" fill="hsl(var(--foreground))" />
      </g>
      
      {/* NS labels */}
      <text x="8" y="114" fontSize="3" fill="currentColor" className="text-muted-foreground opacity-50">Para</text>
      <text x="78" y="114" fontSize="3" fill="currentColor" className="text-muted-foreground opacity-50">Sym</text>
    </svg>
  );
};
