import { motion } from 'framer-motion';
import type { SephirahName, OscillatorNode, PathFlow } from '@/lib/sephirotic-oscillator/types';
import { SEPHIROT, ALL_SEPHIROT } from '@/lib/sephirotic-oscillator/tree-config';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TreeVisualizationProps {
  oscillators: Map<SephirahName, OscillatorNode>;
  flows: PathFlow[];
  activeSephirot: SephirahName[];
  onClickSephirah: (id: SephirahName) => void;
  meditationActive: boolean;
}

export function TreeVisualization({
  oscillators,
  flows,
  activeSephirot,
  onClickSephirah,
  meditationActive
}: TreeVisualizationProps) {
  // Generate paths between connected sephirot
  const paths: { from: typeof SEPHIROT.keter; to: typeof SEPHIROT.keter; key: string }[] = [];
  const pathSet = new Set<string>();
  
  ALL_SEPHIROT.forEach(sephirah => {
    sephirah.connections.forEach(connectedId => {
      const key = [sephirah.id, connectedId].sort().join('-');
      if (!pathSet.has(key)) {
        pathSet.add(key);
        paths.push({
          from: sephirah,
          to: SEPHIROT[connectedId],
          key
        });
      }
    });
  });

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Path connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {paths.map(({ from, to, key }) => {
          const fromNode = oscillators.get(from.id);
          const toNode = oscillators.get(to.id);
          const isActive = (fromNode?.energy || 0) > 0.2 || (toNode?.energy || 0) > 0.2;
          const flowStrength = Math.max(fromNode?.energy || 0, toNode?.energy || 0);
          
          return (
            <motion.line
              key={key}
              x1={`${from.position.x}%`}
              y1={`${from.position.y}%`}
              x2={`${to.position.x}%`}
              y2={`${to.position.y}%`}
              stroke={isActive ? `rgba(139, 92, 246, ${0.3 + flowStrength * 0.5})` : 'rgba(100, 100, 100, 0.2)'}
              strokeWidth={isActive ? 2 + flowStrength * 2 : 1}
              filter={isActive ? 'url(#glow)' : undefined}
              animate={{
                strokeOpacity: isActive ? [0.5, 1, 0.5] : 0.2
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
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
              r="3"
              fill={from.color}
              filter="url(#glow)"
              initial={{
                cx: `${from.position.x}%`,
                cy: `${from.position.y}%`,
                opacity: 0
              }}
              animate={{
                cx: `${to.position.x}%`,
                cy: `${to.position.y}%`,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1,
                delay: offset * 0.5,
                ease: 'easeOut'
              }}
            />
          ));
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
          const pulseScale = 1 + Math.sin(phase) * 0.1 * energy;
          
          return (
            <Tooltip key={sephirah.id}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => !meditationActive && onClickSephirah(sephirah.id)}
                  disabled={meditationActive}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${sephirah.position.x}%`,
                    top: `${sephirah.position.y}%`
                  }}
                  animate={{
                    scale: pulseScale
                  }}
                  transition={{
                    duration: 0.1
                  }}
                  whileHover={!meditationActive ? { scale: 1.2 } : undefined}
                  whileTap={!meditationActive ? { scale: 0.95 } : undefined}
                >
                  {/* Outer glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-md"
                    style={{
                      backgroundColor: sephirah.color,
                      opacity: energy * 0.6
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [energy * 0.4, energy * 0.6, energy * 0.4]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                  
                  {/* Main node */}
                  <div
                    className={`
                      relative w-14 h-14 md:w-16 md:h-16 rounded-full 
                      border-2 flex flex-col items-center justify-center
                      transition-all duration-300
                      ${isActive 
                        ? 'bg-black/80 shadow-lg' 
                        : 'bg-black/60 hover:bg-black/70'}
                    `}
                    style={{
                      borderColor: isActive ? sephirah.color : 'rgba(100, 100, 100, 0.5)',
                      boxShadow: isActive 
                        ? `0 0 20px ${sephirah.color}40, inset 0 0 10px ${sephirah.color}20` 
                        : undefined
                    }}
                  >
                    <span className="text-lg">{sephirah.planetarySymbol}</span>
                    <span 
                      className="text-[9px] font-bold tracking-wide"
                      style={{ color: isActive ? sephirah.color : 'rgba(200, 200, 200, 0.7)' }}
                    >
                      {sephirah.name.toUpperCase()}
                    </span>
                  </div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="bg-black/90 border-primary/30 max-w-[200px]"
              >
                <div className="space-y-1">
                  <p className="font-bold" style={{ color: sephirah.color }}>
                    {sephirah.name} <span className="text-muted-foreground">({sephirah.hebrewName})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{sephirah.meaning}</p>
                  <p className="text-xs">{sephirah.psychologicalAspect}</p>
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground">Energy:</span>
                    <div className="flex-1 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ backgroundColor: sephirah.color }}
                        animate={{ width: `${energy * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>

      {/* Pillar labels */}
      <div className="absolute top-2 left-[20%] transform -translate-x-1/2 text-[10px] text-muted-foreground uppercase tracking-widest">
        Pillar of Severity
      </div>
      <div className="absolute top-2 left-[50%] transform -translate-x-1/2 text-[10px] text-muted-foreground uppercase tracking-widest">
        Pillar of Balance
      </div>
      <div className="absolute top-2 left-[80%] transform -translate-x-1/2 text-[10px] text-muted-foreground uppercase tracking-widest">
        Pillar of Mercy
      </div>

      {/* Layer labels */}
      <div className="absolute right-2 top-[15%] text-[9px] text-muted-foreground uppercase tracking-wide transform rotate-90 origin-right">
        Collective Unconscious
      </div>
      <div className="absolute right-2 top-[50%] text-[9px] text-muted-foreground uppercase tracking-wide transform rotate-90 origin-right">
        Individual Unconscious
      </div>
      <div className="absolute right-2 top-[80%] text-[9px] text-muted-foreground uppercase tracking-wide transform rotate-90 origin-right">
        Personal Consciousness
      </div>
    </div>
  );
}
