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
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center gap-2">
          <Brain className="h-3 w-3 text-primary" />
          Interpretation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 space-y-2">
        {/* Main state - compact */}
        <div className="p-2 rounded bg-muted/30 border">
          <div className="flex items-center gap-2 mb-1">
            <span className={`${consciousnessInterpretation.color} scale-75`}>
              {consciousnessInterpretation.icon}
            </span>
            <span className="text-xs font-medium">{consciousnessInterpretation.state}</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">
              {(coherence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {consciousnessInterpretation.description}
          </p>
        </div>

        {/* Compact metrics row */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="p-1.5 rounded bg-muted/20">
            <div className="text-[10px] text-muted-foreground">Entropy</div>
            <div className="text-xs font-mono">{entropy.toFixed(2)}</div>
          </div>
          <div className="p-1.5 rounded bg-muted/20">
            <div className="text-[10px] text-muted-foreground">τ Dilation</div>
            <div className="text-xs font-mono">{timeDilation}×</div>
          </div>
          <div className="p-1.5 rounded bg-muted/20">
            <div className="text-[10px] text-muted-foreground">Active</div>
            <div className="text-xs font-mono">{activeCount}/{oscillators.length}</div>
          </div>
        </div>

        {/* Dominant axes - very compact */}
        <div className="flex flex-wrap gap-1">
          {dominantAxes.map(({ axis, value }) => (
            <Badge key={axis} variant="secondary" className="text-[9px] py-0 px-1.5 h-4">
              {axis}: {(value * 100).toFixed(0)}%
            </Badge>
          ))}
        </div>

        {/* Moments - minimal */}
        {moments.length > 0 && (
          <div className="text-[10px] text-muted-foreground pt-1 border-t">
            {moments.length} moments • Last: {moments[moments.length - 1]?.trigger || 'N/A'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
