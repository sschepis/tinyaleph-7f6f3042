import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Sparkles, Clock, RotateCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PathFlow, SephirahName } from '@/lib/sephirotic-oscillator/types';
import { getPathBetween, getAssociationColor } from '@/lib/sephirotic-oscillator/path-letters';
import { 
  findWordsInStream, 
  getCategoryColor,
  type PathActivation,
  type HebrewWord 
} from '@/lib/sephirotic-oscillator/word-recognition';

interface WordAnalysisPanelProps {
  flows: PathFlow[];
}

const MAX_STREAM_LENGTH = 30;
const LETTER_DECAY_MS = 15000; // Letters visible for 15 seconds

// Physics engine only emits visualized flows above ~0.01.
// So: a path is "active" when it appears in `flows`, and it "fades" when it disappears.
const ENTER_THRESHOLD = 0.01; // record activation once we see it at least at the engine's emit threshold


export function WordAnalysisPanel({ flows }: WordAnalysisPanelProps) {
  const [letterStream, setLetterStream] = useState<PathActivation[]>([]);
  const [foundWords, setFoundWords] = useState<{ word: HebrewWord; fresh: boolean }[]>([]);
  
  // Track which paths are currently "active" (above threshold)
  // When they drop below threshold, we add the letter to the stream
  const activePathsRef = useRef<Map<string, { 
    letter: string; 
    letterName: string;
    from: SephirahName; 
    to: SephirahName;
    peakEnergy: number;
    activatedAt: number;
  }>>(new Map());
  
  // Sequence counter for ordering
  const sequenceRef = useRef(0);
  
  // Clear the stream
  const clearStream = () => {
    setLetterStream([]);
    setFoundWords([]);
    activePathsRef.current.clear();
    sequenceRef.current = 0;
  };
  
  // Track flows and detect when paths FADE (drop below threshold)
  useEffect(() => {
    const now = Date.now();
    const activePaths = activePathsRef.current;
    const newFadedLetters: PathActivation[] = [];
    
    // Aggregate flow strength per Hebrew path
    const pathStrength = new Map<string, { strength: number; from: SephirahName; to: SephirahName }>();

    flows.forEach(flow => {
      const path = getPathBetween(flow.from, flow.to);
      if (!path) return;

      const existing = pathStrength.get(path.id);
      if (existing) {
        existing.strength += flow.strength;
      } else {
        pathStrength.set(path.id, { strength: flow.strength, from: flow.from, to: flow.to });
      }
    });

    // Build a set of currently flowing paths.
    // If a path disappears from `flows`, we treat that as a fade event.
    const currentlyFlowing = new Set<string>();

    pathStrength.forEach((data, pathId) => {
      currentlyFlowing.add(pathId);

      // Mark as "active" once it crosses the engine's emit threshold
      if (data.strength >= ENTER_THRESHOLD) {
        const path = getPathBetween(data.from, data.to);
        if (!path) return;

        if (!activePaths.has(pathId)) {
          activePaths.set(pathId, {
            letter: path.letter,
            letterName: path.letterName,
            from: data.from,
            to: data.to,
            peakEnergy: data.strength,
            activatedAt: now
          });
        } else {
          const existing = activePaths.get(pathId)!;
          if (data.strength > existing.peakEnergy) existing.peakEnergy = data.strength;
        }
      }
    });

    
    // Check which previously active paths have now faded
    activePaths.forEach((data, pathId) => {
      if (!currentlyFlowing.has(pathId)) {
        // This path has faded! Add its letter to the stream
        sequenceRef.current += 1;
        
        newFadedLetters.push({
          pathId,
          letter: data.letter,
          letterName: data.letterName,
          timestamp: now,
          energy: data.peakEnergy,
          from: data.from,
          to: data.to,
          sequence: sequenceRef.current
        });
        
        // Remove from active tracking
        activePaths.delete(pathId);
      }
    });
    
    // Add faded letters to stream in order
    if (newFadedLetters.length > 0) {
      // Sort by when they were activated (earliest first)
      newFadedLetters.sort((a, b) => a.timestamp - b.timestamp);
      
      setLetterStream(prev => {
        const updated = [...prev, ...newFadedLetters];
        // Keep only recent letters
        const cutoff = now - LETTER_DECAY_MS;
        const filtered = updated.filter(a => a.timestamp > cutoff);
        return filtered.slice(-MAX_STREAM_LENGTH);
      });
    }
  }, [flows]);
  
  // Clean up old letters periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const cutoff = now - LETTER_DECAY_MS;
      setLetterStream(prev => prev.filter(a => a.timestamp > cutoff));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Find words in current stream
  useEffect(() => {
    const letters = letterStream.map(a => a.letter);
    const words = findWordsInStream(letters);
    
    setFoundWords(prev => {
      const newWords = words.map(w => ({
        word: w.word,
        fresh: !prev.some(pw => pw.word.letters === w.word.letters)
      }));
      return newWords;
    });
  }, [letterStream]);
  
  // Calculate age-based opacity for letters
  const getLetterOpacity = (timestamp: number) => {
    const age = Date.now() - timestamp;
    const remaining = Math.max(0, 1 - age / LETTER_DECAY_MS);
    return 0.3 + remaining * 0.7;
  };

  return (
    <div className="bg-black/60 border border-primary/30 rounded-lg p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-primary">Word Stream</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={clearStream}
          title="Clear stream"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
      
      {/* Current letter stream - shown left to right in temporal order */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Letters (as they fade)</span>
          </div>
          {letterStream.length > 0 && (
            <span className="text-[9px] font-mono opacity-60">
              {letterStream.length} letters
            </span>
          )}
        </div>
        <div className="bg-black/40 rounded-lg p-2 min-h-[56px] border border-white/5 overflow-hidden relative">
          {/* Display oldest → newest (left to right for reading order) */}
          <div className="flex flex-wrap gap-1.5 items-center" dir="ltr">
            <AnimatePresence mode="popLayout">
              {letterStream.length === 0 ? (
                <span className="text-xs text-muted-foreground/40 italic">
                  Letters appear as energy fades...
                </span>
              ) : (
                letterStream.map((activation, idx) => {
                  const path = getPathBetween(activation.from, activation.to);
                  const color = path ? getAssociationColor(path.association) : '#888';
                  const age = Date.now() - activation.timestamp;
                  const isRecent = age < 2000;
                  
                  return (
                    <motion.div
                      key={`${activation.pathId}-${activation.sequence || activation.timestamp}`}
                      initial={{ scale: 1.5, opacity: 0, y: -10 }}
                      animate={{ 
                        scale: 1, 
                        opacity: getLetterOpacity(activation.timestamp),
                        y: 0
                      }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="relative"
                    >
                      {/* Sequence number */}
                      <span 
                        className="absolute -top-1 -left-1 text-[7px] font-mono opacity-40"
                        style={{ color }}
                      >
                        {idx + 1}
                      </span>
                      {/* Letter */}
                      <span
                        className={`text-xl font-serif cursor-default inline-block ${isRecent ? 'animate-pulse' : ''}`}
                        style={{ 
                          color,
                          textShadow: isRecent 
                            ? `0 0 12px ${color}, 0 0 20px ${color}60`
                            : `0 0 6px ${color}40`
                        }}
                        title={`${activation.letterName} (${idx + 1})`}
                      >
                        {activation.letter}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
          {/* Fade gradient on right edge when many letters */}
          {letterStream.length > 10 && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />
          )}
        </div>
      </div>
      
      {/* Found words */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
          <Sparkles className="w-3 h-3" />
          <span>Recognized Words</span>
          {foundWords.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-[9px] h-4 px-1.5">
              {foundWords.length}
            </Badge>
          )}
        </div>
        
        <ScrollArea className="flex-1 -mx-1 px-1">
          <AnimatePresence mode="popLayout">
            {foundWords.length === 0 ? (
              <div className="text-xs text-muted-foreground/40 italic text-center py-4">
                Words will emerge from the flow...
              </div>
            ) : (
              <div className="space-y-1.5">
                {foundWords.map(({ word, fresh }, idx) => (
                  <motion.div
                    key={`${word.letters}-${idx}`}
                    initial={fresh ? { scale: 1.1, opacity: 0, y: -10 } : { opacity: 1 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`
                      flex items-center gap-2 rounded p-2 border
                      ${fresh ? 'bg-primary/10 border-primary/30' : 'bg-black/30 border-white/5'}
                    `}
                  >
                    {/* Hebrew word */}
                    <div 
                      className="text-2xl font-serif min-w-[40px] text-center"
                      style={{ 
                        color: getCategoryColor(word.category),
                        textShadow: fresh ? `0 0 12px ${getCategoryColor(word.category)}` : undefined
                      }}
                      dir="rtl"
                    >
                      {word.letters}
                    </div>
                    
                    {/* Translation */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">
                          {word.transliteration}
                        </span>
                        <Badge 
                          variant="outline" 
                          className="text-[8px] h-3.5 px-1"
                          style={{ 
                            borderColor: getCategoryColor(word.category),
                            color: getCategoryColor(word.category)
                          }}
                        >
                          {word.category}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {word.meaning}
                      </div>
                    </div>
                    
                    {/* Fresh indicator */}
                    {fresh && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-primary"
                        style={{ boxShadow: '0 0 8px var(--primary)' }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );
}
