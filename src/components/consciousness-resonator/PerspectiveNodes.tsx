import { motion } from 'framer-motion';
import type { PerspectiveType } from '@/lib/consciousness-resonator/types';
import { PERSPECTIVE_NODES, PERSPECTIVE_ORDER } from '@/lib/consciousness-resonator/perspective-config';

interface PerspectiveNodesProps {
  activePerspectives: PerspectiveType[];
  onTogglePerspective: (perspective: PerspectiveType) => void;
  hexagramLines: boolean[];
}

export function PerspectiveNodes({
  activePerspectives,
  onTogglePerspective,
  hexagramLines
}: PerspectiveNodesProps) {
  const activeCount = activePerspectives.length;
  
  return (
    <section className="bg-black/50 border border-blue-500/60 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-blue-400">Resonance Base Layer</h2>
        {activeCount > 0 && (
          <span className="text-xs px-2 py-0.5 bg-blue-500/20 rounded-full text-blue-400">
            {activeCount} active
          </span>
        )}
      </div>
      <p className="mb-3 text-muted-foreground text-xs">
        Click to toggle perspectives • Multiple selections query in parallel
      </p>
      
      <div className="grid grid-cols-3 gap-2">
        {PERSPECTIVE_ORDER.map((perspectiveId) => {
          const node = PERSPECTIVE_NODES[perspectiveId];
          const isActive = activePerspectives.includes(perspectiveId);
          
          return (
            <motion.button
              key={perspectiveId}
              onClick={() => onTogglePerspective(perspectiveId)}
              className={`
                relative w-full aspect-square rounded-full flex items-center justify-center
                border-2 transition-all duration-300
                hover:scale-105 cursor-pointer
                ${isActive 
                  ? `${node.borderColor} ${node.glowColor} bg-gradient-to-br from-black to-black/80` 
                  : 'border-muted/30 bg-black/40 hover:border-muted/50'}
              `}
              style={isActive ? {
                boxShadow: `0 0 20px ${node.color.includes('blue') ? 'rgba(59,130,246,0.5)' : 
                  node.color.includes('purple') ? 'rgba(168,85,247,0.5)' :
                  node.color.includes('green') ? 'rgba(34,197,94,0.5)' :
                  node.color.includes('orange') ? 'rgba(249,115,22,0.5)' :
                  node.color.includes('pink') ? 'rgba(236,72,153,0.5)' :
                  'rgba(234,179,8,0.5)'}`
              } : undefined}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Glow effect for active nodes */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle, ${
                      node.color.includes('blue') ? 'rgba(59,130,246,0.4)' : 
                      node.color.includes('purple') ? 'rgba(168,85,247,0.4)' :
                      node.color.includes('green') ? 'rgba(34,197,94,0.4)' :
                      node.color.includes('orange') ? 'rgba(249,115,22,0.4)' :
                      node.color.includes('pink') ? 'rgba(236,72,153,0.4)' :
                      'rgba(234,179,8,0.4)'
                    } 0%, transparent 70%)`
                  }}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <span className={`text-center font-bold text-xs relative z-10 ${isActive ? node.color : 'text-muted-foreground/60'}`}>
                {node.name}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Hexagram Display - Compact */}
      <div className="mt-4 flex items-center justify-between px-2">
        <div className="flex flex-col gap-0.5 w-12">
          {hexagramLines.map((solid, i) => (
            <div 
              key={i}
              className={`h-1.5 rounded-sm ${solid ? 'bg-white' : 'bg-transparent border-t border-white/60'}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">Quantum state</p>
      </div>
    </section>
  );
}
