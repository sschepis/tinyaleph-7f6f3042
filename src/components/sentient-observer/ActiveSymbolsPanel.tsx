import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles } from 'lucide-react';
import { SYMBOL_DATABASE } from '@/lib/symbolic-mind/symbol-database';
import type { SymbolicSymbol } from '@/lib/symbolic-mind/types';
import type { Oscillator } from './types';

interface ActiveSymbolsPanelProps {
  oscillators: Oscillator[];
  coherence: number;
}

// Build a lookup from prime to symbol
const PRIME_TO_SYMBOL: Map<number, SymbolicSymbol> = new Map(
  Object.values(SYMBOL_DATABASE).map(s => [s.prime, s])
);

export function ActiveSymbolsPanel({ oscillators }: ActiveSymbolsPanelProps) {
  // Get active oscillators sorted by amplitude
  const activeSymbols = useMemo(() => {
    return oscillators
      .filter(o => o.amplitude > 0.1)
      .sort((a, b) => b.amplitude - a.amplitude)
      .map(o => ({
        prime: o.prime,
        amplitude: o.amplitude,
        phase: o.phase,
        symbol: PRIME_TO_SYMBOL.get(o.prime)
      }))
      .slice(0, 20);
  }, [oscillators]);

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
                {activeSymbols.slice(0, 12).map(({ prime, amplitude, symbol }) => (
                  <motion.div
                    key={prime}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="flex items-center gap-1.5 p-1.5 rounded bg-muted/30"
                    title={symbol?.meaning || `Prime ${prime}`}
                  >
                    <span 
                      className="text-base"
                      style={{ 
                        textShadow: `0 0 ${amplitude * 8}px hsl(${(prime * 37) % 360}, 70%, 50%)` 
                      }}
                    >
                      {symbol?.unicode || '◇'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium truncate">
                        {symbol?.name || `p${prime}`}
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
