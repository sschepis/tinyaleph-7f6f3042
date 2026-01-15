import { motion, AnimatePresence } from 'framer-motion';
import type { ActivatedArchetype, ArchetypeCategory } from '@/lib/consciousness-resonator/types';

interface SymbolResonanceVizProps {
  archetypes: ActivatedArchetype[];
  fieldStrength: number;
  dominantCategory: ArchetypeCategory;
  trigrams: { upper: { name: string; symbol: string; meaning: string }; lower: { name: string; symbol: string; meaning: string } } | null;
  tarot: { name: string; symbol: string; meaning: string } | null;
}

const CATEGORY_COLORS: Record<ArchetypeCategory, string> = {
  action: 'from-red-500/40 to-orange-500/40',
  wisdom: 'from-blue-500/40 to-cyan-500/40',
  emotion: 'from-pink-500/40 to-rose-500/40',
  transformation: 'from-purple-500/40 to-violet-500/40',
  creation: 'from-green-500/40 to-emerald-500/40',
  spirit: 'from-yellow-500/40 to-amber-500/40',
  shadow: 'from-slate-600/40 to-gray-800/40'
};

const CATEGORY_BORDER_COLORS: Record<ArchetypeCategory, string> = {
  action: 'border-red-500/60',
  wisdom: 'border-blue-500/60',
  emotion: 'border-pink-500/60',
  transformation: 'border-purple-500/60',
  creation: 'border-green-500/60',
  spirit: 'border-yellow-500/60',
  shadow: 'border-slate-500/60'
};

export function SymbolResonanceViz({ 
  archetypes, 
  fieldStrength, 
  dominantCategory,
  trigrams,
  tarot
}: SymbolResonanceVizProps) {
  return (
    <section className={`bg-black/50 border ${CATEGORY_BORDER_COLORS[dominantCategory]} rounded-lg p-6 transition-colors duration-500`}>
      <h2 className="text-2xl font-bold mb-4 text-primary">Symbol Resonance Field</h2>
      <p className="text-xs text-muted-foreground mb-4">
        TinyAleph prime-based archetype detection
      </p>
      
      {/* Field Strength Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1 text-muted-foreground">
          <span>Field Strength</span>
          <span>{(fieldStrength * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <motion.div 
            className={`h-2 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[dominantCategory]}`}
            initial={{ width: 0 }}
            animate={{ width: `${fieldStrength * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1 text-right capitalize">
          Dominant: {dominantCategory}
        </div>
      </div>
      
      {/* Archetype Constellation */}
      <div className="relative h-48 bg-gradient-to-b from-transparent to-secondary/20 rounded-lg mb-4 overflow-hidden">
        {/* Background glow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-radial ${CATEGORY_COLORS[dominantCategory]} opacity-30`}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Archetype nodes in orbital positions */}
        <AnimatePresence mode="popLayout">
          {archetypes.map((arch, index) => {
            const angle = (index / Math.max(archetypes.length, 1)) * Math.PI * 2 - Math.PI / 2;
            const radius = 70 - (arch.activation * 20);
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            
            return (
              <motion.div
                key={arch.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 0.8 + arch.activation * 0.4,
                  opacity: 0.5 + arch.activation * 0.5
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                {/* Glow ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 40 + arch.activation * 20,
                    height: 40 + arch.activation * 20,
                    background: `radial-gradient(circle, ${
                      arch.category === 'action' ? 'rgba(239,68,68,0.4)' :
                      arch.category === 'wisdom' ? 'rgba(59,130,246,0.4)' :
                      arch.category === 'emotion' ? 'rgba(236,72,153,0.4)' :
                      arch.category === 'transformation' ? 'rgba(168,85,247,0.4)' :
                      arch.category === 'creation' ? 'rgba(34,197,94,0.4)' :
                      arch.category === 'spirit' ? 'rgba(234,179,8,0.4)' :
                      'rgba(100,116,139,0.4)'
                    } 0%, transparent 70%)`
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.9, 0.6]
                  }}
                  transition={{ 
                    duration: 2 + index * 0.3,
                    repeat: Infinity
                  }}
                />
                
                {/* Symbol */}
                <span className="text-2xl relative z-10">{arch.symbol}</span>
                <span className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">
                  {arch.name.replace('The ', '')}
                </span>
                <span className="text-[9px] text-primary/60 font-mono">
                  {(arch.activation * 100).toFixed(0)}%
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Empty state */}
        {archetypes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Awaiting symbolic resonance...
          </div>
        )}
      </div>
      
      {/* I-Ching & Tarot Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Trigrams */}
        <div className="bg-secondary/30 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-2">I-Ching Trigrams</div>
          {trigrams ? (
            <div className="flex items-center justify-around">
              <div className="text-center">
                <span className="text-2xl">{trigrams.upper.symbol}</span>
                <div className="text-[10px] text-muted-foreground">{trigrams.upper.meaning}</div>
              </div>
              <div className="text-muted-foreground/50">over</div>
              <div className="text-center">
                <span className="text-2xl">{trigrams.lower.symbol}</span>
                <div className="text-[10px] text-muted-foreground">{trigrams.lower.meaning}</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-xs">--</div>
          )}
        </div>
        
        {/* Tarot */}
        <div className="bg-secondary/30 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-2">Active Tarot</div>
          {tarot ? (
            <div className="text-center">
              <span className="text-xl font-serif text-primary">{tarot.symbol}</span>
              <div className="text-sm font-medium">{tarot.name}</div>
              <div className="text-[10px] text-muted-foreground">{tarot.meaning}</div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-xs">--</div>
          )}
        </div>
      </div>
      
      {/* Matched Keywords */}
      {archetypes.length > 0 && archetypes[0].matchedKeywords.length > 0 && (
        <div className="text-xs">
          <span className="text-muted-foreground">Resonant words: </span>
          {archetypes.slice(0, 3).flatMap(a => a.matchedKeywords).slice(0, 6).map((kw, i) => (
            <span key={i} className="text-primary/80 mr-2">{kw}</span>
          ))}
        </div>
      )}
    </section>
  );
}
