import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpectrumAnalysis } from '@/lib/quantum-wavefunction';
import { ArrowRightLeft } from 'lucide-react';

interface TunnelingVizProps {
  spectrum: SpectrumAnalysis;
  height?: number;
}

export function TunnelingViz({ spectrum, height = 120 }: TunnelingVizProps) {
  const { points, primes } = spectrum;
  
  // Calculate tunneling regions between prime pairs
  const tunnelingRegions = useMemo(() => {
    const regions: Array<{
      p1: number;
      p2: number;
      maxTunneling: number;
      avgTunneling: number;
    }> = [];
    
    for (let i = 0; i < primes.length - 1; i++) {
      const p1 = primes[i];
      const p2 = primes[i + 1];
      
      const regionPoints = points.filter(pt => pt.x >= p1 && pt.x <= p2);
      if (regionPoints.length > 0) {
        const tunnelValues = regionPoints.map(p => p.tunneling);
        regions.push({
          p1,
          p2,
          maxTunneling: Math.max(...tunnelValues),
          avgTunneling: tunnelValues.reduce((a, b) => a + b, 0) / tunnelValues.length
        });
      }
    }
    
    return regions.slice(0, 12); // Show first 12 gaps
  }, [points, primes]);

  const maxTunnel = Math.max(...tunnelingRegions.map(r => r.maxTunneling), 0.01);

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="py-1.5 px-2">
        <CardTitle className="text-[10px] flex items-center gap-1">
          <ArrowRightLeft className="h-3 w-3 text-violet-400" />
          Tunneling T(x)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-0.5" style={{ maxHeight: height }}>
          {tunnelingRegions.slice(0, 8).map(({ p1, p2, maxTunneling, avgTunneling }) => (
            <div key={`${p1}-${p2}`} className="flex items-center gap-1 text-[9px]">
              <span className="w-10 text-right font-mono text-muted-foreground">
                {p1}→{p2}
              </span>
              <div className="flex-1 h-2 bg-secondary rounded relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-violet-500/30 rounded"
                  style={{ width: `${(maxTunneling / maxTunnel) * 100}%` }}
                />
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded"
                  style={{ width: `${(avgTunneling / maxTunnel) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-violet-400">
                {maxTunneling.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
