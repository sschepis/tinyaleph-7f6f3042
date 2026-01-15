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
                bg-black border-2 transition-all duration-300
                hover:scale-105 cursor-pointer
                ${isActive 
                  ? `${node.borderColor} shadow-lg ${node.glowColor}` 
                  : 'border-muted/40 opacity-60 hover:opacity-80'}
              `}
              animate={isActive ? { 
                boxShadow: ['0 0 10px currentColor', '0 0 25px currentColor', '0 0 10px currentColor']
              } : {}}
              transition={isActive ? { 
                duration: 2, 
                repeat: Infinity 
              } : {}}
              whileTap={{ scale: 0.95 }}
            >
              {/* Selection indicator */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <span className="text-[10px] text-primary-foreground">✓</span>
                </motion.div>
              )}
              
              <span className={`text-center font-bold text-xs ${isActive ? node.color : 'text-muted-foreground'}`}>
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
