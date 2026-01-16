import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, RefreshCw } from 'lucide-react';
import { SYMBOL_DATABASE } from '@/lib/symbolic-mind/symbol-database';
import type { SymbolicSymbol } from '@/lib/symbolic-mind/types';
import type { Oscillator } from './types';
import { getSemanticPrimeMapper, type PrimeMeaning } from '@/lib/sentient-observer/semantic-prime-mapper';

interface ActiveSymbolsPanelProps {
  oscillators: Oscillator[];
  coherence: number;
}

// Build a static lookup from prime to symbol (used as fallback)
const PRIME_TO_SYMBOL: Map<number, SymbolicSymbol> = new Map(
  Object.values(SYMBOL_DATABASE).map(s => [s.prime, s])
);

interface ActiveSymbol {
  prime: number;
  amplitude: number;
  phase: number;
  name: string;
  unicode: string;
  isFromMapper: boolean;
  confidence?: number;
}

export function ActiveSymbolsPanel({ oscillators }: ActiveSymbolsPanelProps) {
  // Track mapper version to trigger re-renders
  const [mapperVersion, setMapperVersion] = useState(0);
  
  // Refresh mapper meanings periodically when oscillators are active
  useEffect(() => {
    const interval = setInterval(() => {
      setMapperVersion(v => v + 1);
    }, 2000); // Refresh every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get active oscillators sorted by amplitude, using mapper for latest meanings
  const activeSymbols = useMemo(() => {
    const mapper = getSemanticPrimeMapper();
    
    return oscillators
      .filter(o => o.amplitude > 0.1)
      .sort((a, b) => b.amplitude - a.amplitude)
      .map(o => {
        // First check the mapper for derived meanings
        const mapperMeaning = mapper.getMeaning(o.prime);
        // Fallback to static symbol database
        const staticSymbol = PRIME_TO_SYMBOL.get(o.prime);
        
        let name: string;
        let unicode: string;
        let isFromMapper = false;
        let confidence: number | undefined;
        
        if (mapperMeaning) {
          name = mapperMeaning.meaning;
          unicode = staticSymbol?.unicode || '◈';
          isFromMapper = !mapperMeaning.isSeeded;
          confidence = mapperMeaning.confidence;
        } else if (staticSymbol) {
          name = staticSymbol.name;
          unicode = staticSymbol.unicode;
        } else {
          name = `p${o.prime}`;
          unicode = '◇';
        }
        
        return {
          prime: o.prime,
          amplitude: o.amplitude,
          phase: o.phase,
          name,
          unicode,
          isFromMapper,
          confidence
        } as ActiveSymbol;
      })
      .slice(0, 20);
  }, [oscillators, mapperVersion]);

  const totalActive = oscillators.filter(o => o.amplitude > 0.1).length;

  return (
    <Card className="flex flex-col">
      <CardHeader className="py-2 px-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            Active Symbols
          </CardTitle>
          <span className="text-[10px] text-muted-foreground font-mono">
            {totalActive} active
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-2 pt-0">
        {activeSymbols.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-muted-foreground text-xs">
            No active resonances
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-2 gap-1">
              <AnimatePresence mode="popLayout">
                {activeSymbols.slice(0, 12).map(({ prime, amplitude, name, unicode, isFromMapper, confidence }) => (
                  <motion.div
                    key={prime}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    className={`flex items-center gap-1.5 p-1.5 rounded ${isFromMapper ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}
                    title={`${name} (Prime ${prime})${isFromMapper ? ` • Derived (${((confidence || 0) * 100).toFixed(0)}% confidence)` : ''}`}
                  >
                    <span 
                      className="text-base"
                      style={{ 
                        textShadow: `0 0 ${amplitude * 8}px hsl(${(prime * 37) % 360}, 70%, 50%)` 
                      }}
                    >
                      {unicode}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-medium truncate flex-1">
                          {name}
                        </span>
                        {isFromMapper && (
                          <span className="text-[8px] text-primary/70">✦</span>
                        )}
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ 
                            backgroundColor: `hsl(${(prime * 37) % 360}, 60%, 50%)` 
                          }}
                          animate={{ width: `${amplitude * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
