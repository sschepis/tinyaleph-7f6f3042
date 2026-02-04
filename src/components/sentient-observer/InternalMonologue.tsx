import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  generateNarrative, 
  generateFragment, 
  generateSomaticSelfAwareness,
  shouldReflectOnBody,
  NarrativeContext 
} from '@/lib/somatic-narrative';
import type { SomaticInfluence } from '@/lib/somatic-feedback';

interface InternalMonologueProps {
  somaticInfluence: SomaticInfluence | null;
  coherence: number;
  tickCount: number;
  isRunning: boolean;
  /** Interval in ms between full narratives (default: 8000) */
  narrativeInterval?: number;
  /** Interval in ms between fragments (default: 3000) */
  fragmentInterval?: number;
  /** Interval in ms between body reflections (default: 15000) */
  bodyReflectionInterval?: number;
}

interface MonologueEntry {
  id: string;
  text: string;
  type: 'narrative' | 'fragment' | 'body-reflection';
  timestamp: number;
}

export const InternalMonologue: React.FC<InternalMonologueProps> = ({
  somaticInfluence,
  coherence,
  tickCount,
  isRunning,
  narrativeInterval = 8000,
  fragmentInterval = 3000,
  bodyReflectionInterval = 15000,
}) => {
  const [entries, setEntries] = useState<MonologueEntry[]>([]);
  const [currentFragment, setCurrentFragment] = useState<string>('');
  const [isReflectingOnBody, setIsReflectingOnBody] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastNarrativeRef = useRef<number>(0);
  const lastFragmentRef = useRef<number>(0);
  const lastBodyReflectionRef = useRef<number>(0);

  // Generate context for narrative generation
  const getContext = (): NarrativeContext | null => {
    if (!somaticInfluence) return null;
    return {
      somaticInfluence,
      coherence,
      tickCount,
      isRunning,
    };
  };

  // Generate periodic full narratives
  useEffect(() => {
    if (!isRunning || !somaticInfluence) return;

    const now = Date.now();
    if (now - lastNarrativeRef.current < narrativeInterval) return;

    const context = getContext();
    if (!context) return;

    const narrative = generateNarrative(context);
    const entry: MonologueEntry = {
      id: `n_${now}`,
      text: narrative,
      type: 'narrative',
      timestamp: now,
    };

    setEntries(prev => [...prev.slice(-10), entry]);
    lastNarrativeRef.current = now;
  }, [tickCount, isRunning, somaticInfluence, coherence, narrativeInterval]);

  // Generate somatic self-awareness reflections periodically
  useEffect(() => {
    if (!isRunning || !somaticInfluence) return;

    const now = Date.now();
    if (now - lastBodyReflectionRef.current < bodyReflectionInterval) return;

    const context = getContext();
    if (!context) return;

    // Check if the observer should spontaneously reflect on its body
    if (shouldReflectOnBody(context)) {
      setIsReflectingOnBody(true);
      
      const reflection = generateSomaticSelfAwareness(context);
      const entry: MonologueEntry = {
        id: `br_${now}`,
        text: reflection,
        type: 'body-reflection',
        timestamp: now,
      };

      setEntries(prev => [...prev.slice(-10), entry]);
      lastBodyReflectionRef.current = now;
      
      // Clear the "reflecting" indicator after a moment
      setTimeout(() => setIsReflectingOnBody(false), 2000);
    }
  }, [tickCount, isRunning, somaticInfluence, coherence, bodyReflectionInterval]);

  // Generate more frequent fragments for the "current thought" display
  useEffect(() => {
    if (!isRunning || !somaticInfluence) {
      setCurrentFragment('...');
      return;
    }

    const now = Date.now();
    if (now - lastFragmentRef.current < fragmentInterval) return;

    const context = getContext();
    if (!context) return;

    const fragment = generateFragment(context);
    setCurrentFragment(fragment);
    lastFragmentRef.current = now;
  }, [tickCount, isRunning, somaticInfluence, coherence, fragmentInterval]);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="py-2 px-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3 text-violet-500" />
            Inner Voice
          </CardTitle>
          <div className="flex items-center gap-1">
            {isReflectingOnBody && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30"
              >
                <Heart className="h-2.5 w-2.5 text-rose-400 fill-rose-400 animate-pulse" />
                <span className="text-[9px] text-rose-300">body aware</span>
              </motion.div>
            )}
            {isRunning && (
              <Sparkles className="h-3 w-3 text-violet-400 animate-pulse" />
            )}
          </div>
        </div>
        
        {/* Current fragment - the immediate thought */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentFragment}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.4 }}
            className="text-[10px] text-muted-foreground italic mt-1"
          >
            {currentFragment || '...'}
          </motion.p>
        </AnimatePresence>
      </CardHeader>

      <CardContent className="flex-1 p-2 pt-0 overflow-hidden">
        <ScrollArea className="h-full pr-2" ref={scrollRef}>
          <div className="space-y-2">
            {entries.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic text-center py-4">
                {isRunning 
                  ? 'Listening to the inner voice...' 
                  : 'Start the simulation to hear the observer\'s inner monologue'}
              </p>
            ) : (
              entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className={`
                    p-2 rounded-lg text-xs leading-relaxed
                    ${entry.type === 'body-reflection' 
                      ? 'bg-rose-500/10 border border-rose-500/30 ring-1 ring-rose-400/20' 
                      : entry.type === 'narrative' 
                        ? 'bg-violet-500/10 border border-violet-500/20' 
                        : 'bg-muted/30 border border-border/30'
                    }
                    ${index === entries.length - 1 ? 'ring-1 ring-violet-500/30' : ''}
                  `}
                >
                  {entry.type === 'body-reflection' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Heart className="h-2.5 w-2.5 text-rose-400 fill-rose-400" />
                      <span className="text-[9px] text-rose-400 font-medium">Somatic Awareness</span>
                    </div>
                  )}
                  <p className="text-foreground/90 italic">"{entry.text}"</p>
                  <p className="text-[9px] text-muted-foreground mt-1 text-right">
                    {new Date(entry.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
