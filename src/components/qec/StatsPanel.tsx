import { QECState } from '@/lib/qec';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Shield } from 'lucide-react';

interface StatsPanelProps {
  stats: QECState['stats'];
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const successRate = stats.totalErrors > 0 
    ? ((stats.correctedErrors / stats.totalErrors) * 100).toFixed(1)
    : '—';
  
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {stats.totalErrors}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Errors
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.correctedErrors}
            </div>
            <div className="text-xs text-muted-foreground">
              Corrected
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {successRate}%
            </div>
            <div className="text-xs text-muted-foreground">
              Success Rate
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
