import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

const CATEGORY_LABELS: Record<ArchetypeCategory, string> = {
  action: 'Action & Power',
  wisdom: 'Wisdom & Knowledge',
  emotion: 'Emotion & Feeling',
  transformation: 'Transformation & Change',
  creation: 'Creation & Growth',
  spirit: 'Spirit & Transcendence',
  shadow: 'Shadow & Unconscious'
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-primary">Symbol Resonance Field</h2>
        {archetypes.length > 0 && (
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
            {archetypes.length} active
          </span>
        )}
      </div>
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
      
      {/* Archetype Grid with Scroll */}
      <div className="relative bg-secondary/20 rounded-lg mb-4 overflow-hidden">
        {/* Background glow */}
        <motion.div
          className={`absolute inset-0 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[dominantCategory]} opacity-20 pointer-events-none`}
          animate={{ 
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Archetype grid */}
        {archetypes.length > 0 ? (
          <ScrollArea className="h-[240px] p-4">
            <TooltipProvider delayDuration={200}>
              <div className="relative z-10 grid grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {archetypes.map((arch, index) => (
                    <Tooltip key={arch.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className={`
                            flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                            bg-card/60 border ${CATEGORY_BORDER_COLORS[arch.category]}
                            backdrop-blur-sm hover:bg-card/80 transition-colors
                          `}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: 1,
                            opacity: 1
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', damping: 20, delay: index * 0.03 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          {/* Symbol with glow */}
                          <motion.div
                            className="relative"
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{ 
                              duration: 2 + index * 0.2,
                              repeat: Infinity
                            }}
                          >
                            <span className="text-2xl">{arch.symbol}</span>
                            {/* Glow effect */}
                            <motion.div
                              className="absolute inset-0 blur-md opacity-50"
                              style={{
                                background: arch.category === 'action' ? 'rgba(239,68,68,0.5)' :
                                  arch.category === 'wisdom' ? 'rgba(59,130,246,0.5)' :
                                  arch.category === 'emotion' ? 'rgba(236,72,153,0.5)' :
                                  arch.category === 'transformation' ? 'rgba(168,85,247,0.5)' :
                                  arch.category === 'creation' ? 'rgba(34,197,94,0.5)' :
                                  arch.category === 'spirit' ? 'rgba(234,179,8,0.5)' :
                                  'rgba(100,116,139,0.5)'
                              }}
                              animate={{
                                opacity: [0.3, 0.6, 0.3]
                              }}
                              transition={{ 
                                duration: 1.5,
                                repeat: Infinity
                              }}
                            />
                          </motion.div>
                          
                          {/* Name */}
                          <span className="text-xs text-foreground/80 mt-1.5 text-center leading-tight">
                            {arch.name.replace('The ', '')}
                          </span>
                          
                          {/* Activation bar */}
                          <div className="w-full mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_COLORS[arch.category].replace('/40', '/80')}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${arch.activation * 100}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <span className="text-[9px] text-muted-foreground mt-1 font-mono">
                            {(arch.activation * 100).toFixed(0)}%
                          </span>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="max-w-[220px] bg-card border-border"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{arch.symbol}</span>
                            <span className="font-semibold text-foreground">{arch.name}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Category: </span>
                            <span className="text-primary capitalize">{CATEGORY_LABELS[arch.category]}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Activation: </span>
                            <span className="text-primary font-mono">{(arch.activation * 100).toFixed(1)}%</span>
                          </div>
                          {arch.matchedKeywords.length > 0 && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Keywords: </span>
                              <span className="text-accent">
                                {arch.matchedKeywords.slice(0, 5).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </AnimatePresence>
              </div>
            </TooltipProvider>
          </ScrollArea>
        ) : (
          <div className="relative z-10 flex items-center justify-center h-32 text-muted-foreground text-sm p-4">
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
