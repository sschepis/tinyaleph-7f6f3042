import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Sparkles, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
const LETTER_DECAY_MS = 8000; // Letters fade after 8 seconds

export function WordAnalysisPanel({ flows }: WordAnalysisPanelProps) {
  const [letterStream, setLetterStream] = useState<PathActivation[]>([]);
  const [foundWords, setFoundWords] = useState<{ word: HebrewWord; fresh: boolean }[]>([]);
  const lastFlowRef = useRef<string>('');
  
  // Track flows and build letter stream
  useEffect(() => {
    if (flows.length === 0) return;
    
    const now = Date.now();
    const newActivations: PathActivation[] = [];
    
    flows.forEach(flow => {
      const path = getPathBetween(flow.from, flow.to);
      if (path && flow.strength > 0.05) {
        const key = `${path.id}-${Math.floor(now / 500)}`; // Dedupe within 500ms
        if (key !== lastFlowRef.current) {
          lastFlowRef.current = key;
          newActivations.push({
            pathId: path.id,
            letter: path.letter,
            letterName: path.letterName,
            timestamp: now,
            energy: flow.strength,
            from: flow.from,
            to: flow.to
          });
        }
      }
    });
    
    if (newActivations.length > 0) {
      setLetterStream(prev => {
        const updated = [...prev, ...newActivations];
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
      <div className="flex items-center gap-2 mb-3">
        <Languages className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-primary">Word Stream</h3>
      </div>
      
      {/* Current letter stream */}
      <div className="mb-3">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
          <Clock className="w-3 h-3" />
          <span>Letter Flow (recent)</span>
        </div>
        <div className="bg-black/40 rounded-lg p-2 min-h-[48px] border border-white/5">
          <div className="flex flex-wrap gap-1" dir="rtl">
            <AnimatePresence mode="popLayout">
              {letterStream.length === 0 ? (
                <span className="text-xs text-muted-foreground/40 italic" dir="ltr">
                  Energy flow creates letters...
                </span>
              ) : (
                letterStream.map((activation, idx) => {
                  const path = getPathBetween(activation.from, activation.to);
                  const color = path ? getAssociationColor(path.association) : '#888';
                  
                  return (
                    <motion.span
                      key={`${activation.pathId}-${activation.timestamp}-${idx}`}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: getLetterOpacity(activation.timestamp)
                      }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="text-xl font-serif cursor-default"
                      style={{ 
                        color,
                        textShadow: `0 0 8px ${color}60`
                      }}
                      title={activation.letterName}
                    >
                      {activation.letter}
                    </motion.span>
                  );
                })
              )}
            </AnimatePresence>
          </div>
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
