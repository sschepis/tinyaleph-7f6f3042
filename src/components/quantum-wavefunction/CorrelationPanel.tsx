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
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="py-1.5 px-2">
        <CardTitle className="text-[10px] flex items-center justify-between">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-primary" />
            Correlation
          </span>
          <Badge 
            variant={stats.significance === 'very-high' ? 'default' : 'secondary'} 
            className="text-[8px] py-0 h-4"
          >
            {stats.significance.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        {/* Wave Correlation */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-muted-foreground">r(ψ, P)</span>
            <span className="font-mono font-bold text-cyan-400">
              {stats.waveCorrelation.toFixed(3)}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500/50 to-cyan-400 rounded-full transition-all"
              style={{ width: `${Math.abs(stats.waveCorrelation) * 100}%` }}
            />
          </div>
        </div>

        {/* Resonance Correlation */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-muted-foreground">r(R, P)</span>
            <span className="font-mono font-bold text-emerald-400">
              {stats.resonanceCorrelation.toFixed(3)}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-400 rounded-full transition-all"
              style={{ width: `${Math.abs(stats.resonanceCorrelation) * 100}%` }}
            />
          </div>
        </div>

        {/* P-value */}
        <div className="flex items-center justify-between py-1 px-1.5 bg-secondary/50 rounded text-[9px]">
          <div className="flex items-center gap-1">
            <SignificanceIcon className={`h-2.5 w-2.5 ${significanceColor[stats.significance]}`} />
            <span>p-value</span>
          </div>
          <span className="font-mono font-bold">
            {stats.pValue < 0.001 ? stats.pValue.toExponential(1) : stats.pValue.toFixed(3)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
