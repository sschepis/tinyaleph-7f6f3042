import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CorrelationStats } from '@/lib/quantum-wavefunction';
import { TrendingUp, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface CorrelationPanelProps {
  stats: CorrelationStats;
}

export function CorrelationPanel({ stats }: CorrelationPanelProps) {
  const significanceColor = {
    'low': 'text-muted-foreground',
    'medium': 'text-yellow-500',
    'high': 'text-green-500',
    'very-high': 'text-cyan-400'
  };

  const SignificanceIcon = stats.significance === 'very-high' || stats.significance === 'high' 
    ? CheckCircle 
    : AlertCircle;

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-primary" />
            Correlation Statistics
          </span>
          <Badge 
            variant={stats.significance === 'very-high' ? 'default' : 'secondary'} 
            className="text-[9px]"
          >
            {stats.significance.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Wave Correlation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Wave Correlation r(ψ, P)</span>
            <span className="font-mono font-bold text-cyan-400">
              {stats.waveCorrelation.toFixed(3)}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500/50 to-cyan-400 rounded-full transition-all"
              style={{ width: `${Math.abs(stats.waveCorrelation) * 100}%` }}
            />
          </div>
        </div>

        {/* Resonance Correlation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Resonance Correlation r(R, P)</span>
            <span className="font-mono font-bold text-emerald-400">
              {stats.resonanceCorrelation.toFixed(3)}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-400 rounded-full transition-all"
              style={{ width: `${Math.abs(stats.resonanceCorrelation) * 100}%` }}
            />
          </div>
        </div>

        {/* P-value */}
        <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-1.5">
            <SignificanceIcon className={`h-3 w-3 ${significanceColor[stats.significance]}`} />
            <span className="text-[10px]">P-value</span>
          </div>
          <span className="font-mono text-[10px] font-bold">
            {stats.pValue < 0.001 ? stats.pValue.toExponential(2) : stats.pValue.toFixed(4)}
          </span>
        </div>

        {/* Interpretation */}
        <div className="text-[9px] text-center text-muted-foreground pt-1 border-t border-border">
          {stats.significance === 'very-high' ? (
            <span className="text-cyan-400">Strong quantum-prime correlation detected</span>
          ) : stats.significance === 'high' ? (
            <span className="text-green-500">Significant correlation with prime structure</span>
          ) : stats.significance === 'medium' ? (
            <span className="text-yellow-500">Moderate correlation observed</span>
          ) : (
            <span>Weak correlation - adjust parameters</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
