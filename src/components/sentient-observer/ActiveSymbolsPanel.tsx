import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export function ActiveSymbolsPanel({ oscillators, coherence }: ActiveSymbolsPanelProps) {
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
      .slice(0, 20); // Show top 20
  }, [oscillators]);

  const totalActive = oscillators.filter(o => o.amplitude > 0.1).length;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Active Symbols
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalActive} resonating
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-3 pt-0">
        {activeSymbols.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            No active resonances
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {activeSymbols.map(({ prime, amplitude, symbol }) => (
                  <motion.div
                    key={prime}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    layout
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {/* Symbol unicode */}
                    <div 
                      className="w-8 h-8 flex items-center justify-center text-lg rounded"
                      style={{ 
                        backgroundColor: `hsl(${(prime * 37) % 360}, 60%, 20%)`,
                        boxShadow: `0 0 ${amplitude * 12}px hsl(${(prime * 37) % 360}, 70%, 50%)` 
                      }}
                    >
                      {symbol?.unicode || '◇'}
                    </div>
                    
                    {/* Symbol info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {symbol?.name || `Prime ${prime}`}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          p={prime}
                        </span>
                      </div>
                      {symbol && (
                        <div className="text-xs text-muted-foreground truncate">
                          {symbol.meaning}
                        </div>
                      )}
                    </div>
                    
                    {/* Amplitude bar */}
                    <div className="w-16 flex items-center gap-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ 
                            backgroundColor: `hsl(${(prime * 37) % 360}, 70%, 50%)` 
                          }}
                          animate={{ width: `${amplitude * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">
                        {(amplitude * 100).toFixed(0)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
        
        {/* Coherence indicator */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">System Coherence</span>
            <span className={`font-mono ${
              coherence > 0.7 ? 'text-green-500' : 
              coherence > 0.4 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {(coherence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                coherence > 0.7 ? 'bg-green-500' : 
                coherence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              animate={{ width: `${coherence * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
