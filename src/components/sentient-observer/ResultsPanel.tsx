import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Brain,
  Activity,
  Zap
} from 'lucide-react';
import { Oscillator, SMFState, Moment, SMF_AXES } from './types';

interface ResultsPanelProps {
  coherence: number;
  entropy: number;
  oscillators: Oscillator[];
  smfState: SMFState;
  moments: Moment[];
  subjectiveTime: number;
  tickCount: number;
  peakCoherence?: number;
}

interface Interpretation {
  state: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  coherence,
  entropy,
  oscillators,
  smfState,
  moments,
  subjectiveTime,
  tickCount,
  peakCoherence = coherence
}) => {
  // Compute interpretations
  const consciousnessInterpretation = useMemo((): Interpretation => {
    if (coherence > 0.8) {
      return {
        state: 'Highly Focused',
        description: 'Strong phase synchronization indicates unified, focused awareness. The observer has achieved coherent attention.',
        color: 'text-green-500',
        icon: <Sparkles className="h-4 w-4" />
      };
    } else if (coherence > 0.5) {
      return {
        state: 'Attentive',
        description: 'Moderate coherence suggests active processing with some integration across semantic dimensions.',
        color: 'text-blue-500',
        icon: <Activity className="h-4 w-4" />
      };
    } else if (coherence > 0.3) {
      return {
        state: 'Diffuse',
        description: 'Low coherence indicates distributed attention, like daydreaming or unfocused awareness.',
        color: 'text-yellow-500',
        icon: <Minus className="h-4 w-4" />
      };
    } else {
      return {
        state: 'Minimal Integration',
        description: 'Very low coherence suggests fragmented processing—the system struggles to form unified experience.',
        color: 'text-red-500',
        icon: <TrendingDown className="h-4 w-4" />
      };
    }
  }, [coherence]);

  const entropyInterpretation = useMemo(() => {
    if (entropy > 0.8) {
      return { state: 'High Uncertainty', trend: 'Exploratory mode—many possibilities being considered' };
    } else if (entropy > 0.5) {
      return { state: 'Balanced', trend: 'Healthy mix of structure and flexibility' };
    } else {
      return { state: 'Ordered', trend: 'Highly structured processing, potentially rigid' };
    }
  }, [entropy]);

  // Get dominant SMF axes
  const dominantAxes = useMemo(() => {
    const values = smfState?.s ? Array.from(smfState.s) : new Array(16).fill(0);
    const indexed = values.map((v, i) => ({ axis: SMF_AXES[i], value: Math.abs(v as number) }));
    return indexed.sort((a, b) => b.value - a.value).slice(0, 3);
  }, [smfState]);

  // Compute active oscillators
  const activeCount = oscillators.filter(o => o.amplitude > 0.1).length;
  const totalEnergy = oscillators.reduce((sum, o) => sum + o.amplitude, 0);

  // Time dilation factor
  const timeDilation = tickCount > 0 ? (subjectiveTime / (tickCount * 0.016)).toFixed(2) : '1.00';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          System Interpretation
        </CardTitle>
        <CardDescription>
          Real-time analysis of the observer's conscious state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main consciousness state */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 mb-2">
            <span className={consciousnessInterpretation.color}>
              {consciousnessInterpretation.icon}
            </span>
            <span className="font-medium">{consciousnessInterpretation.state}</span>
            <Badge variant="outline" className="ml-auto">
              {(coherence * 100).toFixed(0)}% coherent
            </Badge>
          </div>
          {peakCoherence > coherence && (
            <div className="text-xs text-muted-foreground mb-2">
              Peak coherence achieved: <span className="font-mono text-primary">{(peakCoherence * 100).toFixed(0)}%</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {consciousnessInterpretation.description}
          </p>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Entropy State</span>
              <Badge variant="secondary" className="text-xs">
                {entropyInterpretation.state}
              </Badge>
            </div>
            <Progress value={entropy * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {entropyInterpretation.trend}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Time Dilation</span>
              <Badge variant="secondary" className="text-xs">
                {timeDilation}×
              </Badge>
            </div>
            <div className="text-lg font-mono">{subjectiveTime.toFixed(3)} τ</div>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(timeDilation) > 1.5 ? 'Time flows quickly (engaged)' : 
               parseFloat(timeDilation) < 0.5 ? 'Time drags (low activity)' : 'Normal flow'}
            </p>
          </div>
        </div>

        {/* Dominant semantic orientations */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Dominant Semantic Orientations
          </h4>
          <div className="flex flex-wrap gap-2">
            {dominantAxes.map(({ axis, value }) => (
              <Badge key={axis} variant="outline" className="flex items-center gap-1">
                <span className="capitalize">{axis}</span>
                <span className="text-muted-foreground">
                  {(value * 100).toFixed(0)}%
                </span>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            The observer is currently oriented toward {dominantAxes[0]?.axis || 'undefined'} 
            {dominantAxes[1] && ` and ${dominantAxes[1].axis}`} in semantic space.
          </p>
        </div>

        {/* Activity summary */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Active Primes</span>
          </div>
          <div className="text-right">
            <div className="font-mono">{activeCount}/32</div>
            <div className="text-xs text-muted-foreground">
              Energy: {totalEnergy.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Moments summary */}
        {moments.length > 0 && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            <strong>{moments.length} conscious moments</strong> recorded. 
            Last triggered by: <Badge variant="outline" className="text-xs ml-1">
              {moments[moments.length - 1]?.trigger || 'N/A'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
