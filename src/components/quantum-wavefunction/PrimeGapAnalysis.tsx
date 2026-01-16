import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpectrumAnalysis, SMALL_PRIMES } from '@/lib/quantum-wavefunction';
import { BarChart3, TrendingUp, ArrowRight } from 'lucide-react';

interface PrimeGapAnalysisProps {
  spectrum: SpectrumAnalysis;
}

interface GapData {
  p1: number;
  p2: number;
  gap: number;
  tunneling: number;
  expectedTunneling: number;
  ratio: number;
}

export function PrimeGapAnalysis({ spectrum }: PrimeGapAnalysisProps) {
  const { points, primes } = spectrum;

  // Analyze gap statistics and tunneling correlations
  const analysis = useMemo(() => {
    const gaps: GapData[] = [];
    
    for (let i = 0; i < primes.length - 1; i++) {
      const p1 = primes[i];
      const p2 = primes[i + 1];
      const gap = p2 - p1;
      
      // Find tunneling in this region
      const regionPoints = points.filter(pt => pt.x >= p1 && pt.x <= p2);
      const maxTunneling = Math.max(...regionPoints.map(p => p.tunneling), 0);
      const avgTunneling = regionPoints.length > 0 
        ? regionPoints.reduce((sum, p) => sum + p.tunneling, 0) / regionPoints.length 
        : 0;
      
      // Expected tunneling based on gap size (larger gaps = less tunneling)
      const expectedTunneling = Math.exp(-gap * 0.2);
      
      gaps.push({
        p1,
        p2,
        gap,
        tunneling: avgTunneling,
        expectedTunneling,
        ratio: avgTunneling / (expectedTunneling + 0.001)
      });
    }
    
    // Statistical analysis
    const gapValues = gaps.map(g => g.gap);
    const tunnelValues = gaps.map(g => g.tunneling);
    
    const meanGap = gapValues.reduce((a, b) => a + b, 0) / gapValues.length;
    const maxGap = Math.max(...gapValues);
    const minGap = Math.min(...gapValues);
    
    // Correlation between gap size and tunneling
    const n = gaps.length;
    const sumXY = gaps.reduce((sum, g) => sum + g.gap * g.tunneling, 0);
    const sumX = gapValues.reduce((a, b) => a + b, 0);
    const sumY = tunnelValues.reduce((a, b) => a + b, 0);
    const sumX2 = gapValues.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = tunnelValues.reduce((sum, y) => sum + y * y, 0);
    
    const correlation = (n * sumXY - sumX * sumY) / 
      (Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)) + 0.001);
    
    // Gap distribution
    const gapCounts = new Map<number, number>();
    gapValues.forEach(g => {
      gapCounts.set(g, (gapCounts.get(g) || 0) + 1);
    });
    
    return {
      gaps: gaps.slice(0, 15),
      meanGap,
      maxGap,
      minGap,
      correlation,
      gapDistribution: Array.from(gapCounts.entries())
        .sort((a, b) => a[0] - b[0])
        .slice(0, 8)
    };
  }, [points, primes]);

  const maxTunnel = Math.max(...analysis.gaps.map(g => g.tunneling), 0.01);
  const maxCount = Math.max(...analysis.gapDistribution.map(([_, c]) => c), 1);

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-amber-400" />
            Prime Gap Analysis
          </span>
          <Badge 
            variant={Math.abs(analysis.correlation) > 0.5 ? 'default' : 'secondary'} 
            className="text-[9px]"
          >
            r = {analysis.correlation.toFixed(3)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Statistics row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-1.5 bg-secondary/50 rounded">
            <div className="text-[9px] text-muted-foreground">Mean Gap</div>
            <div className="font-mono text-sm font-bold text-amber-400">{analysis.meanGap.toFixed(1)}</div>
          </div>
          <div className="p-1.5 bg-secondary/50 rounded">
            <div className="text-[9px] text-muted-foreground">Min/Max</div>
            <div className="font-mono text-sm font-bold">{analysis.minGap}/{analysis.maxGap}</div>
          </div>
          <div className="p-1.5 bg-secondary/50 rounded">
            <div className="text-[9px] text-muted-foreground">Gap-Tunnel r</div>
            <div className={`font-mono text-sm font-bold ${analysis.correlation < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {analysis.correlation.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Gap distribution */}
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">Gap Size Distribution</div>
          <div className="flex items-end gap-1 h-12">
            {analysis.gapDistribution.map(([gap, count]) => (
              <div key={gap} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-amber-500/50 to-amber-400 rounded-t"
                  style={{ height: `${(count / maxCount) * 100}%` }}
                />
                <span className="text-[8px] text-muted-foreground mt-0.5">{gap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gap-Tunneling table */}
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">Gap vs Tunneling Amplitude</div>
          <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
            {analysis.gaps.map(({ p1, p2, gap, tunneling, ratio }) => (
              <div key={`${p1}-${p2}`} className="flex items-center gap-1.5 text-[9px]">
                <span className="w-12 font-mono text-muted-foreground flex items-center">
                  {p1}<ArrowRight className="h-2 w-2 mx-0.5" />{p2}
                </span>
                <Badge variant="outline" className="text-[8px] w-8 justify-center">
                  Δ{gap}
                </Badge>
                <div className="flex-1 h-2 bg-secondary rounded overflow-hidden">
                  <div 
                    className={`h-full rounded transition-all ${
                      ratio > 1.2 ? 'bg-green-500' : ratio < 0.8 ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(tunneling / maxTunnel) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono">{tunneling.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretation */}
        <div className="text-[9px] text-center text-muted-foreground pt-2 border-t border-border">
          {analysis.correlation < -0.3 ? (
            <span className="text-cyan-400">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Inverse correlation: larger gaps → weaker tunneling
            </span>
          ) : analysis.correlation > 0.3 ? (
            <span className="text-amber-400">
              Positive correlation: gap structure enhances tunneling
            </span>
          ) : (
            <span>Weak correlation between gap size and tunneling</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
