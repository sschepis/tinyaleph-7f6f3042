import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Triangle, Sparkles, Heart, Compass, Zap, RefreshCw } from 'lucide-react';
import { interpretTriad, getTriadSummary, type TriadInterpretation } from '@/lib/symbolic-mind/triad-interpreter';
import type { Oscillator } from './types';

interface TriadInterpreterPanelProps {
  oscillators: Oscillator[];
  coherence: number;
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  tension: 'text-orange-500 bg-orange-500/10',
  harmony: 'text-green-500 bg-green-500/10',
  transformation: 'text-purple-500 bg-purple-500/10',
  paradox: 'text-cyan-500 bg-cyan-500/10',
  synthesis: 'text-blue-500 bg-blue-500/10'
};

const RELATIONSHIP_ICONS: Record<string, string> = {
  tension: '⚡',
  harmony: '∞',
  transformation: '🔄',
  paradox: '☯',
  synthesis: '◈'
};

export const TriadInterpreterPanel: React.FC<TriadInterpreterPanelProps> = ({
  oscillators,
  coherence
}) => {
  const [interpretation, setInterpretation] = useState<TriadInterpretation | null>(null);
  const [lastUpdate, setLastUpdate] = useState(0);
  
  // Debounce interpretation updates
  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdate < 2000) return; // Don't update more than every 2s
    
    const primes = oscillators.map(o => o.prime);
    const amplitudes = oscillators.map(o => o.amplitude);
    const activeCount = amplitudes.filter(a => a > 0.1).length;
    
    if (activeCount >= 3) {
      const newInterpretation = interpretTriad(primes, amplitudes);
      if (newInterpretation) {
        setInterpretation(newInterpretation);
        setLastUpdate(now);
      }
    } else {
      setInterpretation(null);
    }
  }, [oscillators, lastUpdate]);
  
  const activeCount = oscillators.filter(o => o.amplitude > 0.1).length;
  
  if (activeCount < 3) {
    return (
      <Card className="opacity-60">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Triangle className="h-3 w-3" />
            Triad Interpreter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs text-center">
            <div>
              <Triangle className="h-6 w-6 mx-auto mb-2 opacity-30" />
              Activate 3+ symbols to reveal<br />the Triad interpretation
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!interpretation) {
    return (
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Triangle className="h-3 w-3" />
            Triad Interpreter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex items-center justify-center h-20">
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const summary = getTriadSummary(interpretation);
  
  return (
    <Card className="border-primary/20">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Triangle className="h-3 w-3 text-primary" />
            Triad Interpreter
          </CardTitle>
          <Badge variant="outline" className="text-[10px] px-1.5">
            {interpretation.archetype}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{summary}</p>
      </CardHeader>
      
      <CardContent className="p-2 pt-0 space-y-3">
        {/* Active Triad Members */}
        <div className="flex items-center justify-center gap-4">
          <AnimatePresence mode="popLayout">
            {interpretation.members.slice(0, 3).map((member, i) => (
              <motion.div
                key={member.prime}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-xl border-2"
                      style={{ 
                        borderColor: `hsl(${(member.prime * 37) % 360}, 60%, 50%)`,
                        boxShadow: `0 0 ${member.amplitude * 12}px hsl(${(member.prime * 37) % 360}, 60%, 50%, 0.5)`
                      }}
                    >
                      {member.symbol?.unicode || '◇'}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div className="font-medium">{member.meaning}</div>
                      {member.symbol && (
                        <div className="text-muted-foreground">{member.symbol.meaning}</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
                <span className="text-[9px] mt-1 text-muted-foreground font-mono">
                  {(member.amplitude * 100).toFixed(0)}%
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Relationships */}
        {interpretation.relationships.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {interpretation.relationships.slice(0, 3).map((rel, i) => (
              <Badge 
                key={i} 
                variant="secondary"
                className={`text-[9px] px-1.5 py-0 ${RELATIONSHIP_COLORS[rel.type]}`}
              >
                <span className="mr-1">{RELATIONSHIP_ICONS[rel.type]}</span>
                {rel.type}
              </Badge>
            ))}
          </div>
        )}
        
        <Separator className="my-2" />
        
        {/* Theme */}
        <div className="flex items-center gap-2 text-xs">
          <Compass className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{interpretation.theme}</span>
        </div>
        
        {/* Main Narrative */}
        <ScrollArea className="h-[80px]">
          <p className="text-xs leading-relaxed text-foreground/90">
            {interpretation.narrative}
          </p>
        </ScrollArea>
        
        {/* Somatic Layer */}
        <div className="p-2 bg-rose-500/5 rounded border border-rose-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Heart className="h-3 w-3 text-rose-500" />
            <span className="text-[10px] font-medium text-rose-500/80">Body Wisdom</span>
          </div>
          <p className="text-[11px] leading-relaxed text-foreground/80 italic">
            {interpretation.somaticNarrative}
          </p>
        </div>
        
        {/* Action Guidance */}
        <div className="p-2 bg-primary/5 rounded border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-medium text-primary/80">Guidance</span>
          </div>
          <p className="text-[11px] leading-relaxed text-foreground/80">
            {interpretation.actionGuidance}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
