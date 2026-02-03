import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Heart, Zap, Moon, Activity } from 'lucide-react';
import { aggregateSomaticState } from '@/lib/symbolic-mind/somatic-database';
import { generateFeltSense, generateShortFeltSense } from '@/lib/symbolic-mind/felt-sense-generator';
import { BodyMapViz } from './visualizations/BodyMapViz';
import type { Oscillator } from './types';

interface SomaticResonancePanelProps {
  oscillators: Oscillator[];
  coherence: number;
}

export const SomaticResonancePanel: React.FC<SomaticResonancePanelProps> = ({
  oscillators,
  coherence
}) => {
  // Calculate aggregate somatic state from active oscillators
  const somaticState = useMemo(() => {
    const activeOscillators = oscillators.filter(o => o.amplitude > 0.1);
    const primes = activeOscillators.map(o => o.prime);
    const amplitudes = activeOscillators.map(o => o.amplitude);
    return aggregateSomaticState(primes, amplitudes);
  }, [oscillators]);

  // Generate felt-sense narrative
  const feltSense = useMemo(() => {
    return generateFeltSense(somaticState, coherence);
  }, [somaticState, coherence]);

  const shortSense = useMemo(() => {
    return generateShortFeltSense(somaticState);
  }, [somaticState]);

  // Nervous system indicator
  const nsLabel = useMemo(() => {
    const balance = somaticState.nervousSystemBalance;
    if (balance > 0.5) return { label: 'Activated', icon: Zap, color: 'text-orange-500' };
    if (balance > 0.15) return { label: 'Energized', icon: Activity, color: 'text-yellow-500' };
    if (balance < -0.5) return { label: 'Deep Rest', icon: Moon, color: 'text-blue-500' };
    if (balance < -0.15) return { label: 'Relaxed', icon: Moon, color: 'text-cyan-500' };
    return { label: 'Balanced', icon: Heart, color: 'text-green-500' };
  }, [somaticState.nervousSystemBalance]);

  const NsIcon = nsLabel.icon;

  return (
    <Card className="flex flex-col">
      <CardHeader className="py-2 px-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Heart className="h-3 w-3 text-rose-500" />
            Somatic Resonance
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${nsLabel.color}`}>
                <NsIcon className="h-2.5 w-2.5 mr-1" />
                {nsLabel.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                Nervous System: {(somaticState.nervousSystemBalance * 100).toFixed(0)}%
                {somaticState.nervousSystemBalance > 0 ? ' sympathetic' : somaticState.nervousSystemBalance < 0 ? ' parasympathetic' : ' balanced'}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{shortSense}</p>
      </CardHeader>
      
      <CardContent className="flex-1 p-2 pt-0">
        {/* Body Silhouette - Prominent Visualization */}
        <div className="flex justify-center mb-3">
          <BodyMapViz 
            somaticState={somaticState} 
            size={180}
            showLabels={true}
          />
        </div>
        
        {/* Two-column stats below the body map */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Sensations */}
          <div>
            <div className="text-[10px] font-medium text-muted-foreground mb-1">
              Active Sensations
            </div>
            <ScrollArea className="h-[80px]">
              <div className="space-y-1">
                {somaticState.activeSensations.length === 0 ? (
                  <div className="text-[10px] text-muted-foreground italic">
                    No active sensations
                  </div>
                ) : (
                  somaticState.activeSensations.map(({ sensation, intensity, regions }, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-1.5 text-[10px]"
                      title={`Regions: ${regions.join(', ')}`}
                    >
                      <span className="truncate flex-1 capitalize">{sensation}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-[8px] px-1 py-0 ${
                          intensity === 'strong' ? 'bg-rose-500/20 text-rose-400' :
                          intensity === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {intensity}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Dominant Regions & Intensity */}
          <div className="space-y-2">
            {/* Dominant Body Regions */}
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">
                Active Regions
              </div>
              <div className="flex flex-wrap gap-1">
                {somaticState.dominantRegions.slice(0, 5).map(({ region, intensity: regionIntensity }) => (
                  <Badge 
                    key={region} 
                    variant="outline" 
                    className="text-[8px] px-1 py-0 capitalize"
                    style={{ 
                      opacity: 0.5 + regionIntensity * 0.5,
                      borderColor: `hsl(${regionIntensity * 120}, 60%, 50%)`
                    }}
                  >
                    {region.replace('-', ' ')}
                  </Badge>
                ))}
                {somaticState.dominantRegions.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic">None</span>
                )}
              </div>
            </div>
            
            {/* Overall Intensity */}
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-muted-foreground">Intensity</span>
                <span className="font-mono">{(somaticState.overallIntensity * 100).toFixed(0)}%</span>
              </div>
              <Progress value={somaticState.overallIntensity * 100} className="h-1.5" />
            </div>
            
            {/* Active Energy Centers */}
            {somaticState.activeEnergyCenters.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {somaticState.activeEnergyCenters.slice(0, 4).map(center => (
                  <Badge 
                    key={center} 
                    variant="outline" 
                    className="text-[8px] px-1 py-0 capitalize text-primary"
                  >
                    {center}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Felt Sense Narrative */}
        <div className="mt-3 p-2 bg-muted/30 rounded border border-border/50">
          <div className="text-[10px] font-medium text-muted-foreground mb-1">
            Felt Sense
          </div>
          <p className="text-xs leading-relaxed text-foreground/90 italic">
            "{feltSense}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
