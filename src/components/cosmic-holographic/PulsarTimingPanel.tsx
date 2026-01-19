import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PulsarReference } from '@/lib/cosmic-holographic/types';
import { Radio, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface PulsarTimingPanelProps {
  pulsars: PulsarReference[];
  syncQuality: number;
}

export function PulsarTimingPanel({ pulsars, syncQuality }: PulsarTimingPanelProps) {
  // Find reference pulsar
  const referencePulsar = useMemo(() => 
    pulsars.find(p => p.isReference), [pulsars]
  );

  // Calculate timing residuals relative to reference
  const pulsarsWithResiduals = useMemo(() => {
    if (!referencePulsar) return pulsars.map(p => ({ ...p, residual: 0 }));
    
    return pulsars.map(p => {
      // Calculate expected phase based on period ratio
      const periodRatio = referencePulsar.period / p.period;
      const expectedPhase = (referencePulsar.phase * periodRatio) % (2 * Math.PI);
      
      // Timing residual is phase difference
      let residual = p.phase - expectedPhase;
      // Normalize to -π to π
      while (residual > Math.PI) residual -= 2 * Math.PI;
      while (residual < -Math.PI) residual += 2 * Math.PI;
      
      return { ...p, residual };
    });
  }, [pulsars, referencePulsar]);

  // Format phase as degrees or radians
  const formatPhase = (phase: number) => {
    const degrees = (phase * 180 / Math.PI) % 360;
    return `${degrees.toFixed(1)}°`;
  };

  // Format frequency from period
  const getFrequency = (periodMs: number) => {
    return (1000 / periodMs).toFixed(2);
  };

  // Get residual color
  const getResidualColor = (residual: number) => {
    const absResidual = Math.abs(residual);
    if (absResidual < 0.1) return 'text-green-400';
    if (absResidual < 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio className="w-4 h-4" /> Pulsar Timing Array
          </span>
          <Badge variant={syncQuality > 0.9 ? 'default' : 'secondary'} className="text-[10px]">
            {(syncQuality * 100).toFixed(0)}% sync
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1 p-2">
            {pulsarsWithResiduals.map((pulsar) => {
              const phasePercent = (pulsar.phase / (2 * Math.PI)) * 100;
              
              return (
                <div
                  key={pulsar.id}
                  className={`p-2 rounded transition-colors ${
                    pulsar.isReference 
                      ? 'bg-primary/20 border border-primary/40' 
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          pulsar.isReference ? 'bg-yellow-400' : 'bg-cyan-400'
                        }`}
                        animate={{ 
                          opacity: [0.4, 1, 0.4],
                          scale: [0.9, 1.1, 0.9]
                        }}
                        transition={{ 
                          duration: pulsar.period / 1000, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <span className="text-xs font-medium truncate max-w-[120px]">
                        {pulsar.name}
                      </span>
                      {pulsar.isReference && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                          REF
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {getFrequency(pulsar.period)} Hz
                    </span>
                  </div>
                  
                  {/* Phase bar */}
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
                    <motion.div
                      className={`absolute h-full ${
                        pulsar.isReference ? 'bg-yellow-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${phasePercent}%` }}
                      animate={{ width: `${phasePercent}%` }}
                      transition={{ duration: 0.05 }}
                    />
                  </div>
                  
                  {/* Stats row */}
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono">{formatPhase(pulsar.phase)}</span>
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="w-3 h-3" />
                        <span className="font-mono">{pulsar.period.toFixed(2)}ms</span>
                      </span>
                    </div>
                    
                    {/* Timing residual */}
                    {!pulsar.isReference && (
                      <span className={`font-mono ${getResidualColor(pulsar.residual)}`}>
                        Δ {(pulsar.residual * 1000).toFixed(1)}μs
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {/* Phase summary at bottom */}
        <div className="border-t p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Reference Phase</span>
            <span className="font-mono text-yellow-400">
              {referencePulsar ? formatPhase(referencePulsar.phase) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Avg Residual</span>
            <span className={`font-mono ${getResidualColor(
              pulsarsWithResiduals.reduce((s, p) => s + Math.abs(p.residual), 0) / pulsars.length
            )}`}>
              {(pulsarsWithResiduals.reduce((s, p) => s + Math.abs(p.residual), 0) / pulsars.length * 1000).toFixed(1)}μs
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
