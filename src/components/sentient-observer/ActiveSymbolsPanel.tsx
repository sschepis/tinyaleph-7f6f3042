import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';
import { SYMBOL_DATABASE } from '@/lib/symbolic-mind/symbol-database';
import type { SymbolicSymbol, SomaticMapping } from '@/lib/symbolic-mind/types';
import type { Oscillator } from './types';
import { getSemanticPrimeMapper } from '@/lib/sentient-observer/semantic-prime-mapper';

interface ActiveSymbolsPanelProps {
  oscillators: Oscillator[];
  coherence: number;
}

// Build a static lookup from prime to symbol (used as fallback)
const PRIME_TO_SYMBOL: Map<number, SymbolicSymbol> = new Map(
  Object.values(SYMBOL_DATABASE).map(s => [s.prime, s])
);

// Somatic tooltip component
function SomaticTooltipContent({ somatic, name }: { somatic?: SomaticMapping; name: string }) {
  if (!somatic) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No somatic mapping available
      </div>
    );
  }
  
  const intensityColors = {
    subtle: 'text-blue-400',
    moderate: 'text-yellow-400',
    strong: 'text-orange-400'
  };
  
  const nervousSystemColors = {
    sympathetic: 'text-red-400',
    parasympathetic: 'text-green-400',
    balanced: 'text-purple-400'
  };
  
  return (
    <div className="space-y-2 max-w-[200px]">
      <div className="font-medium text-foreground border-b border-border/50 pb-1">
        {name}
      </div>
      
      <div className="space-y-1.5 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground shrink-0">Body:</span>
          <span className="text-foreground capitalize">
            {somatic.bodyRegions.join(', ')}
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground shrink-0">Sensation:</span>
          <span className="text-foreground">{somatic.sensation}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Intensity:</span>
          <span className={`capitalize ${intensityColors[somatic.intensity]}`}>
            {somatic.intensity}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Nervous:</span>
          <span className={`capitalize ${nervousSystemColors[somatic.nervousSystem]}`}>
            {somatic.nervousSystem}
          </span>
        </div>
        
        {somatic.energyCenter && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Energy:</span>
            <span className="text-primary capitalize">{somatic.energyCenter}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ActiveSymbol {
  prime: number;
  amplitude: number;
  phase: number;
  name: string;
  unicode: string;
  somatic?: SomaticMapping;
  isFromMapper: boolean;
  confidence?: number;
  derivationChain?: { p: number; q: number; r: number; pMeaning?: string; qMeaning?: string; rMeaning?: string }[];
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
        let derivationChain: ActiveSymbol['derivationChain'];
        
        // Get somatic data from static symbol
        const somatic = staticSymbol?.somatic;
        
        if (mapperMeaning) {
          name = mapperMeaning.meaning;
          unicode = staticSymbol?.unicode || '◈';
          isFromMapper = !mapperMeaning.isSeeded;
          confidence = mapperMeaning.confidence;
          
          // Extract derivation chain with source prime meanings
          if (mapperMeaning.derivedFrom && mapperMeaning.derivedFrom.length > 0) {
            derivationChain = mapperMeaning.derivedFrom.map(fusion => {
              const pMeaning = mapper.getMeaning(fusion.p);
              const qMeaning = mapper.getMeaning(fusion.q);
              const rMeaning = mapper.getMeaning(fusion.r);
              return {
                p: fusion.p,
                q: fusion.q,
                r: fusion.r,
                pMeaning: pMeaning?.meaning,
                qMeaning: qMeaning?.meaning,
                rMeaning: rMeaning?.meaning
              };
            });
          }
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
          confidence,
          derivationChain,
          somatic
        } as ActiveSymbol;
      })
      .slice(0, 20);
  }, [oscillators, mapperVersion]);

  const totalActive = oscillators.filter(o => o.amplitude > 0.1).length;

  return (
    <TooltipProvider delayDuration={200}>
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
                  {activeSymbols.slice(0, 12).map(({ prime, amplitude, name, unicode, isFromMapper, somatic }) => (
                    <Tooltip key={prime}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          layout
                          className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-colors hover:bg-accent/50 ${isFromMapper ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}
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
                              {somatic && (
                                <span className="text-[8px] text-green-400/70" title="Has somatic mapping">◉</span>
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
                      </TooltipTrigger>
                      <TooltipContent side="right" className="p-3">
                        <SomaticTooltipContent somatic={somatic} name={name} />
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
