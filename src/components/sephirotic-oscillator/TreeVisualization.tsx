import { motion } from 'framer-motion';
import type { SephirahName, OscillatorNode, PathFlow } from '@/lib/sephirotic-oscillator/types';
import { SEPHIROT, ALL_SEPHIROT } from '@/lib/sephirotic-oscillator/tree-config';
import { HEBREW_PATHS, getPathBetween, getAssociationColor, type HebrewPath } from '@/lib/sephirotic-oscillator/path-letters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TreeVisualizationProps {
  oscillators: Map<SephirahName, OscillatorNode>;
  flows: PathFlow[];
  activeSephirot: SephirahName[];
  onClickSephirah: (id: SephirahName) => void;
  meditationActive: boolean;
}

// Calculate flow strength through a specific path
function getPathFlowStrength(flows: PathFlow[], from: SephirahName, to: SephirahName): number {
  return flows
    .filter(f => (f.from === from && f.to === to) || (f.from === to && f.to === from))
    .reduce((sum, f) => sum + f.strength, 0);
}

// Calculate midpoint and perpendicular offset for label placement
function getPathLabelPosition(from: { x: number; y: number }, to: { x: number; y: number }) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  // Calculate perpendicular offset to avoid overlapping the line
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  
  // Offset perpendicular to the path (to the left when going down-right)
  const offsetX = len > 0 ? (-dy / len) * 2.5 : 0;
  const offsetY = len > 0 ? (dx / len) * 2.5 : 0;
  
  return { x: midX + offsetX, y: midY + offsetY };
}

export function TreeVisualization({
  oscillators,
  flows,
  activeSephirot,
  onClickSephirah,
  meditationActive
}: TreeVisualizationProps) {
  // Use the defined Hebrew paths instead of generating from connections
  const paths: { from: typeof SEPHIROT.keter; to: typeof SEPHIROT.keter; key: string; hebrewPath?: HebrewPath }[] = [];
  const pathSet = new Set<string>();
  
  // First add all Hebrew letter paths
  HEBREW_PATHS.forEach(hp => {
    const key = [hp.from, hp.to].sort().join('-');
    if (!pathSet.has(key)) {
      pathSet.add(key);
      paths.push({
        from: SEPHIROT[hp.from],
        to: SEPHIROT[hp.to],
        key,
        hebrewPath: hp
      });
    }
  });
  
  // Add any remaining connections from sephirot (like Daat connections) that aren't in Hebrew paths
  ALL_SEPHIROT.forEach(sephirah => {
    sephirah.connections.forEach(connectedId => {
      const key = [sephirah.id, connectedId].sort().join('-');
      if (!pathSet.has(key)) {
        pathSet.add(key);
        paths.push({
          from: sephirah,
          to: SEPHIROT[connectedId],
          key,
          hebrewPath: undefined
        });
      }
    });
  });

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden">
      {/* Deep background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="tree-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tree-grid)" />
        </svg>
      </div>

      {/* Radial glow in center */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)'
        }}
      />

      {/* Horizontal divider lines for consciousness layers */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        <line x1="8%" y1="34%" x2="92%" y2="34%" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
        <line x1="8%" y1="56%" x2="92%" y2="56%" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
      </svg>

      {/* Path connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-subtle">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.6)" />
          </linearGradient>
        </defs>
        
        {/* Base paths - always visible with Hebrew letter colors */}
        {paths.map(({ from, to, key, hebrewPath }) => {
          const pathColor = hebrewPath 
            ? getAssociationColor(hebrewPath.association)
            : 'rgba(100, 100, 120, 0.4)';
          
          return (
            <line
              key={`${key}-base`}
              x1={`${from.position.x}%`}
              y1={`${from.position.y}%`}
              x2={`${to.position.x}%`}
              y2={`${to.position.y}%`}
              stroke={pathColor}
              strokeOpacity={hebrewPath ? 0.35 : 0.25}
              strokeWidth="1.5"
            />
          );
        })}
        
        {/* Active paths with glow */}
        {paths.map(({ from, to, key, hebrewPath }) => {
          const fromNode = oscillators.get(from.id);
          const toNode = oscillators.get(to.id);
          const isActive = (fromNode?.energy || 0) > 0.15 || (toNode?.energy || 0) > 0.15;
          const flowStrength = Math.max(fromNode?.energy || 0, toNode?.energy || 0);
          
          if (!isActive) return null;
          
          const pathColor = hebrewPath 
            ? getAssociationColor(hebrewPath.association)
            : 'rgba(139, 92, 246, 1)';
          
          return (
            <motion.line
              key={key}
              x1={`${from.position.x}%`}
              y1={`${from.position.y}%`}
              x2={`${to.position.x}%`}
              y2={`${to.position.y}%`}
              stroke={pathColor}
              strokeOpacity={0.4 + flowStrength * 0.6}
              strokeWidth={1.5 + flowStrength * 2.5}
              filter="url(#glow-strong)"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: 1,
                strokeOpacity: [0.6, 1, 0.6]
              }}
              transition={{
                pathLength: { duration: 0.5 },
                strokeOpacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
            />
          );
        })}
        
        {/* Energy flow particles */}
        {flows.map((flow, idx) => {
          const from = SEPHIROT[flow.from];
          const to = SEPHIROT[flow.to];
          
          return flow.particles.map((offset, pIdx) => (
            <motion.circle
              key={`${idx}-${pIdx}`}
              r="4"
              fill={from.color}
              filter="url(#glow-strong)"
              initial={{
                cx: `${from.position.x}%`,
                cy: `${from.position.y}%`,
                opacity: 0
              }}
              animate={{
                cx: `${to.position.x}%`,
                cy: `${to.position.y}%`,
                opacity: [0, 0.9, 0]
              }}
              transition={{
                duration: 1.2,
                delay: offset * 0.4,
                ease: 'easeOut'
              }}
            />
          ));
        })}
        
        {/* Hebrew letter labels on paths - with flow-based animation */}
        {paths.map(({ from, to, key, hebrewPath }) => {
          if (!hebrewPath) return null;
          
          const labelPos = getPathLabelPosition(from.position, to.position);
          const fromNode = oscillators.get(from.id);
          const toNode = oscillators.get(to.id);
          const nodeEnergy = Math.max(fromNode?.energy || 0, toNode?.energy || 0);
          const isActive = nodeEnergy > 0.15;
          
          // Get actual flow through this path
          const flowStrength = getPathFlowStrength(flows, from.id, to.id);
          const isFlowing = flowStrength > 0.01;
          const flowIntensity = Math.min(1, flowStrength * 5);
          
          const pathColor = getAssociationColor(hebrewPath.association);
          
          return (
            <g key={`${key}-label`}>
              {/* Outer pulse ring when flowing */}
              {isFlowing && (
                <motion.circle
                  cx={`${labelPos.x}%`}
                  cy={`${labelPos.y}%`}
                  r="10"
                  fill="none"
                  stroke={pathColor}
                  strokeWidth="2"
                  initial={{ r: 10, opacity: 0.8 }}
                  animate={{ 
                    r: [10, 18, 10],
                    opacity: [0.6 * flowIntensity, 0, 0.6 * flowIntensity]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut'
                  }}
                />
              )}
              
              {/* Background circle for letter */}
              <motion.circle
                cx={`${labelPos.x}%`}
                cy={`${labelPos.y}%`}
                r="10"
                fill="rgba(0, 0, 0, 0.9)"
                stroke={pathColor}
                strokeWidth={isFlowing ? 2 : isActive ? 1.5 : 0.5}
                animate={{
                  strokeOpacity: isFlowing ? [0.9, 1, 0.9] : isActive ? 0.9 : 0.4,
                  scale: isFlowing ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 0.8,
                  repeat: isFlowing ? Infinity : 0,
                  ease: 'easeInOut'
                }}
                style={{
                  filter: isFlowing 
                    ? `drop-shadow(0 0 ${6 + flowIntensity * 8}px ${pathColor})`
                    : isActive 
                      ? `drop-shadow(0 0 4px ${pathColor}80)` 
                      : undefined
                }}
              />
              
              {/* Hebrew letter */}
              <motion.text
                x={`${labelPos.x}%`}
                y={`${labelPos.y}%`}
                textAnchor="middle"
                dominantBaseline="central"
                fill={pathColor}
                fontSize={isFlowing ? "14" : "12"}
                fontFamily="serif"
                fontWeight={isFlowing ? "bold" : "normal"}
                animate={{
                  opacity: isFlowing ? 1 : isActive ? 0.9 : 0.6,
                  scale: isFlowing ? [1, 1.15, 1] : 1
                }}
                transition={{
                  duration: 0.6,
                  repeat: isFlowing ? Infinity : 0,
                  ease: 'easeInOut'
                }}
                style={{ 
                  filter: isFlowing 
                    ? `drop-shadow(0 0 ${4 + flowIntensity * 6}px ${pathColor})`
                    : isActive 
                      ? `drop-shadow(0 0 3px ${pathColor})` 
                      : undefined 
                }}
              >
                {hebrewPath.letter}
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* Sephirot nodes */}
      <TooltipProvider>
        {ALL_SEPHIROT.map(sephirah => {
          const node = oscillators.get(sephirah.id);
          const isActive = activeSephirot.includes(sephirah.id);
          const energy = node?.energy || 0;
          const phase = node?.phase || 0;
          
          // Pulse based on phase
          const pulseScale = 1 + Math.sin(phase) * 0.08 * energy;
          
          return (
            <Tooltip key={sephirah.id}>
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${sephirah.position.x}%`,
                  top: `${sephirah.position.y}%`
                }}
              >
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => !meditationActive && onClickSephirah(sephirah.id)}
                    disabled={meditationActive}
                    className="group"
                    animate={{ scale: pulseScale }}
                    transition={{ duration: 0.1 }}
                    whileHover={!meditationActive ? { scale: 1.15 } : undefined}
                    whileTap={!meditationActive ? { scale: 0.95 } : undefined}
                  >
                    {/* Outer pulse ring - only when active */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-[-8px] rounded-full"
                        style={{ borderColor: sephirah.color }}
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.4, 0, 0.4],
                          borderWidth: ['2px', '1px', '2px']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    )}

                    {/* Glow aura */}
                    <motion.div
                      className="absolute inset-[-4px] rounded-full blur-lg"
                      style={{
                        backgroundColor: sephirah.color,
                        opacity: isActive ? 0.3 + energy * 0.3 : 0.05
                      }}
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.2, 1],
                              opacity: [0.3 + energy * 0.2, 0.4 + energy * 0.3, 0.3 + energy * 0.2]
                            }
                          : undefined
                      }
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />

                    {/* Main node */}
                    <div
                      className={`
                      relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-full 
                      flex flex-col items-center justify-center
                      transition-all duration-500 backdrop-blur-sm
                      ${isActive ? 'bg-black/90' : 'bg-black/70 group-hover:bg-black/80'}
                    `}
                      style={{
                        border: `2px solid ${isActive ? sephirah.color : 'rgba(120, 120, 140, 0.4)'}`,
                        boxShadow: isActive
                          ? `0 0 30px ${sephirah.color}50, 0 0 60px ${sephirah.color}20, inset 0 0 20px ${sephirah.color}15`
                          : 'inset 0 0 20px rgba(0,0,0,0.5)'
                      }}
                    >
                      {/* Inner glow ring */}
                      {isActive && (
                        <div
                          className="absolute inset-1 rounded-full opacity-20"
                          style={{
                            background: `radial-gradient(circle, ${sephirah.color}40 0%, transparent 70%)`
                          }}
                        />
                      )}

                      <span
                        className="text-xl md:text-2xl relative z-10"
                        style={{
                          textShadow: isActive ? `0 0 10px ${sephirah.color}` : undefined,
                          opacity: isActive ? 1 : 0.7
                        }}
                      >
                        {sephirah.planetarySymbol}
                      </span>
                      <span
                        className="text-[9px] md:text-[10px] font-bold tracking-widest relative z-10 mt-0.5"
                        style={{
                          color: isActive ? sephirah.color : 'rgba(180, 180, 200, 0.6)',
                          textShadow: isActive ? `0 0 8px ${sephirah.color}80` : undefined
                        }}
                      >
                        {sephirah.name.toUpperCase()}
                      </span>
                    </div>
                  </motion.button>
                </TooltipTrigger>
              </div>
              <TooltipContent
                side="right"
                className="bg-black/95 border max-w-[220px] backdrop-blur-xl"
                style={{ borderColor: `${sephirah.color}40` }}
              >
                <div className="space-y-2 p-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sephirah.planetarySymbol}</span>
                    <div>
                      <p className="font-bold" style={{ color: sephirah.color }}>
                        {sephirah.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{sephirah.hebrewName}</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium" style={{ color: sephirah.color }}>
                    {sephirah.meaning}
                  </p>
                  <p className="text-xs text-muted-foreground">{sephirah.psychologicalAspect}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <span className="text-[10px] text-muted-foreground">Energy</span>
                    <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: sephirah.color,
                          boxShadow: `0 0 10px ${sephirah.color}`
                        }}
                        animate={{ width: `${Math.max(5, energy * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: sephirah.color }}>
                      {(energy * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>

      {/* Pillar labels - top */}
      <div className="absolute top-3 left-0 right-0 flex justify-between px-4 md:px-8">
        <div className="text-[9px] md:text-[10px] text-cyan-400/50 uppercase tracking-[0.2em] font-medium">
          Pillar of Severity
        </div>
        <div className="text-[9px] md:text-[10px] text-amber-400/50 uppercase tracking-[0.2em] font-medium">
          Pillar of Balance
        </div>
        <div className="text-[9px] md:text-[10px] text-violet-400/50 uppercase tracking-[0.2em] font-medium">
          Pillar of Mercy
        </div>
      </div>

      {/* Layer labels - right side */}
      <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-around py-8 pointer-events-none">
        <div className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-[0.15em] transform rotate-90 origin-center whitespace-nowrap">
          Collective Unconscious
        </div>
        <div className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-[0.15em] transform rotate-90 origin-center whitespace-nowrap">
          Individual Unconscious
        </div>
        <div className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-[0.15em] transform rotate-90 origin-center whitespace-nowrap">
          Personal Consciousness
        </div>
      </div>
    </div>
  );
}
