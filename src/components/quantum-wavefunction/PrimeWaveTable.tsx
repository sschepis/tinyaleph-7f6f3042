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
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="py-1.5 px-2">
        <CardTitle className="text-[10px] flex items-center gap-1">
          <Atom className="h-3 w-3 text-primary" />
          ψ(p) at Primes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
          {primeWaves.slice(0, maxDisplay).map(({ prime, magnitude, phase }) => (
            <div key={prime} className="flex items-center gap-1 text-[9px]">
              <span className="w-6 text-right font-mono text-muted-foreground">{prime}</span>
              <div className="flex-1 h-2 bg-secondary rounded relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/50 to-primary rounded transition-all"
                  style={{ width: `${(magnitude / maxMag) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-primary/70">
                {magnitude.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
