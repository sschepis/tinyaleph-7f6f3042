import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Atom } from 'lucide-react';

interface PrimeWaveTableProps {
  primeWaves: Array<{
    prime: number;
    magnitude: number;
    phase: number;
  }>;
  maxDisplay?: number;
}

export function PrimeWaveTable({ primeWaves, maxDisplay = 15 }: PrimeWaveTableProps) {
  const maxMag = Math.max(...primeWaves.map(p => p.magnitude), 0.01);
  
  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Atom className="h-3 w-3 text-primary" />
          ψ(p) at Primes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {primeWaves.slice(0, maxDisplay).map(({ prime, magnitude, phase }) => (
            <div key={prime} className="flex items-center gap-2 text-[10px]">
              <Badge variant="outline" className="w-8 justify-center text-[9px] font-mono">
                {prime}
              </Badge>
              <div className="flex-1 h-3 bg-secondary rounded relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/50 to-primary rounded transition-all"
                  style={{ width: `${(magnitude / maxMag) * 100}%` }}
                />
              </div>
              <span className="w-12 text-right font-mono text-muted-foreground">
                |ψ|={magnitude.toFixed(2)}
              </span>
              <span className="w-12 text-right font-mono text-primary/70">
                φ={((phase * 180 / Math.PI) % 360).toFixed(0)}°
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
