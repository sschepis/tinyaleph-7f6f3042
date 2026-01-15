import { motion } from 'framer-motion';
import type { PerspectiveType } from '@/lib/consciousness-resonator/types';
import { PERSPECTIVE_NODES, PERSPECTIVE_ORDER } from '@/lib/consciousness-resonator/perspective-config';

interface PerspectiveNodesProps {
  activePerspective: PerspectiveType | null;
  onSelectPerspective: (perspective: PerspectiveType) => void;
  hexagramLines: boolean[];
}

export function PerspectiveNodes({
  activePerspective,
  onSelectPerspective,
  hexagramLines
}: PerspectiveNodesProps) {
  return (
    <section className="bg-black/50 border border-blue-500/60 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Resonance Base Layer</h2>
      <p className="mb-4 text-muted-foreground text-sm">
        Perspective nodes processing information from different viewpoints
      </p>
      
      <div className="grid grid-cols-3 gap-4">
        {PERSPECTIVE_ORDER.map((perspectiveId) => {
          const node = PERSPECTIVE_NODES[perspectiveId];
          const isActive = activePerspective === perspectiveId;
          
          return (
            <motion.button
              key={perspectiveId}
              onClick={() => onSelectPerspective(perspectiveId)}
              className={`
                w-24 h-24 mx-auto rounded-full flex items-center justify-center
                bg-black border-2 ${node.borderColor} transition-all duration-300
                hover:scale-105 cursor-pointer
                ${isActive ? `shadow-lg ${node.glowColor} scale-110` : `shadow-md ${node.glowColor.replace('50', '30')}`}
              `}
              animate={isActive ? { 
                boxShadow: ['0 0 20px currentColor', '0 0 40px currentColor', '0 0 20px currentColor']
              } : {}}
              transition={isActive ? { 
                duration: 2, 
                repeat: Infinity 
              } : {}}
            >
              <span className={`text-center font-bold text-sm ${node.color}`}>
                {node.name}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Hexagram Display */}
      <div className="mt-6 flex flex-col items-center">
        <div className="flex flex-col gap-1 w-20">
          {hexagramLines.map((solid, i) => (
            <div 
              key={i}
              className={`h-2 ${solid ? 'bg-white' : 'bg-transparent border-t-2 border-white'}`}
            />
          ))}
        </div>
        <p className="text-center mt-2 text-xs text-muted-foreground">Current quantum state</p>
      </div>
    </section>
  );
}
