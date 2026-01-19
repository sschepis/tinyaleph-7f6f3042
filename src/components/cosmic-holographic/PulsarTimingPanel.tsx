import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PulsarReference } from '@/lib/cosmic-holographic/types';
import { Radio, Clock, Zap, CircleDot, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { PhaseDiagram } from './PhaseDiagram';

interface PulsarTimingPanelProps {
  pulsars: PulsarReference[];
  syncQuality: number;
  activePulsarIds?: Set<string>;
  onTogglePulsar?: (pulsarId: string) => void;
}

export function PulsarTimingPanel({ 
  pulsars, 
  syncQuality,
  activePulsarIds: externalActivePulsarIds,
  onTogglePulsar: externalOnToggle
}: PulsarTimingPanelProps) {
  // Internal state for activation if not controlled externally
  const [internalActiveIds, setInternalActiveIds] = useState<Set<string>>(() => 
    new Set(pulsars.map(p => p.id))
  );
  
  // Use external or internal state
  const activePulsarIds = externalActivePulsarIds ?? internalActiveIds;
  
  const handleToggle = (pulsarId: string) => {
    if (externalOnToggle) {
      externalOnToggle(pulsarId);
    } else {
      setInternalActiveIds(prev => {
        const next = new Set(prev);
        if (next.has(pulsarId)) {
          next.delete(pulsarId);
        } else {
          next.add(pulsarId);
        }
        return next;
      });
    }
  };
  
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

  // Active pulsars for stats
  const activePulsars = useMemo(() => 
    pulsarsWithResiduals.filter(p => activePulsarIds.has(p.id)),
    [pulsarsWithResiduals, activePulsarIds]
  );

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
      <CardHeader className="py-2 pb-0">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio className="w-4 h-4" /> Pulsar Timing Array
          </span>
          <Badge variant={syncQuality > 0.9 ? 'default' : 'secondary'} className="text-[10px]">
            {activePulsars.length}/{pulsars.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <Tabs defaultValue="diagram" className="w-full">
          <TabsList className="w-full h-7 mx-2" style={{ width: 'calc(100% - 16px)' }}>
            <TabsTrigger value="diagram" className="text-[10px] h-6 flex-1 gap-1">
              <CircleDot className="w-3 h-3" /> Phase
            </TabsTrigger>
            <TabsTrigger value="list" className="text-[10px] h-6 flex-1 gap-1">
              <List className="w-3 h-3" /> List
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagram" className="mt-2 px-2">
            <PhaseDiagram 
              pulsars={pulsars} 
              activePulsarIds={activePulsarIds}
              size={180}
            />
            
            {/* Quick toggles below diagram */}
            <div className="grid grid-cols-4 gap-1 mt-2">
              {pulsars.slice(0, 8).map(pulsar => (
                <button
                  key={pulsar.id}
                  onClick={() => handleToggle(pulsar.id)}
                  className={`text-[8px] px-1 py-0.5 rounded truncate transition-colors ${
                    activePulsarIds.has(pulsar.id)
                      ? pulsar.isReference 
                        ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50'
                        : 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {pulsar.name.replace('PSR ', '').slice(0, 8)}
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <ScrollArea className="h-[220px]">
              <div className="space-y-1 p-2">
                {pulsarsWithResiduals.map((pulsar) => {
                  const phasePercent = (pulsar.phase / (2 * Math.PI)) * 100;
                  const isActive = activePulsarIds.has(pulsar.id);
                  
                  return (
                    <div
                      key={pulsar.id}
                      className={`p-2 rounded transition-colors ${
                        !isActive 
                          ? 'opacity-40 bg-muted/20'
                          : pulsar.isReference 
                            ? 'bg-primary/20 border border-primary/40' 
                            : 'bg-secondary/30 hover:bg-secondary/50'
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => handleToggle(pulsar.id)}
                            className="scale-50 origin-left"
                          />
                          <motion.div
                            className={`w-2 h-2 rounded-full ${
                              pulsar.isReference ? 'bg-yellow-400' : 'bg-cyan-400'
                            }`}
                            animate={isActive ? { 
                              opacity: [0.4, 1, 0.4],
                              scale: [0.9, 1.1, 0.9]
                            } : { opacity: 0.3, scale: 1 }}
                            transition={{ 
                              duration: pulsar.period / 1000, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <span className="text-[10px] font-medium truncate max-w-[90px]">
                            {pulsar.name.replace('PSR ', '')}
                          </span>
                          {pulsar.isReference && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 h-3">
                              REF
                            </Badge>
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {getFrequency(pulsar.period)}Hz
                        </span>
                      </div>
                      
                      {/* Phase bar */}
                      {isActive && (
                        <>
                          <div className="relative h-1 bg-muted rounded-full overflow-hidden mb-1">
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
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-2.5 h-2.5" />
                              <span className="font-mono">{formatPhase(pulsar.phase)}</span>
                            </span>
                            
                            {/* Timing residual */}
                            {!pulsar.isReference && (
                              <span className={`font-mono ${getResidualColor(pulsar.residual)}`}>
                                Δ{(pulsar.residual * 1000).toFixed(1)}μs
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {/* Phase summary at bottom */}
        <div className="border-t p-2 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Reference Phase</span>
            <span className="font-mono text-yellow-400">
              {referencePulsar ? formatPhase(referencePulsar.phase) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Avg Residual ({activePulsars.length} active)</span>
            <span className={`font-mono ${getResidualColor(
              activePulsars.reduce((s, p) => s + Math.abs(p.residual), 0) / (activePulsars.length || 1)
            )}`}>
              {(activePulsars.reduce((s, p) => s + Math.abs(p.residual), 0) / (activePulsars.length || 1) * 1000).toFixed(1)}μs
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
