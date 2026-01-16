import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';

export function FormalismInfo() {
  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <BookOpen className="h-3 w-3 text-primary" />
          Quantum Framework
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Tabs defaultValue="wave" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-7">
            <TabsTrigger value="wave" className="text-[9px] h-6">Wave ψ</TabsTrigger>
            <TabsTrigger value="resonance" className="text-[9px] h-6">Resonance</TabsTrigger>
            <TabsTrigger value="tunneling" className="text-[9px] h-6">Tunneling</TabsTrigger>
            <TabsTrigger value="params" className="text-[9px] h-6">Optimal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wave" className="mt-2 space-y-2">
            <div className="text-[10px] space-y-1.5">
              <p className="text-muted-foreground">The wave function combines three components:</p>
              <div className="p-2 bg-secondary/50 rounded font-mono text-[9px]">
                ψ<sub>basic</sub>(x) = N<sup>-1/2</sup> cos(2πtx) e<sup>-|t|x</sup>
              </div>
              <p className="text-muted-foreground">
                Where <strong>t</strong> is the Riemann zeta zero (default γ₁ = 14.134...).
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="resonance" className="mt-2 space-y-2">
            <div className="text-[10px] space-y-1.5">
              <p className="text-muted-foreground">Prime resonance via Gaussian peaks:</p>
              <div className="p-2 bg-secondary/50 rounded font-mono text-[9px]">
                R(x) = Σ<sub>p</sub> exp(-(x-p)²/2σ²)
              </div>
              <p className="text-muted-foreground">
                Gap modulation captures prime spacing rhythm:
              </p>
              <div className="p-2 bg-secondary/50 rounded font-mono text-[9px]">
                G(x) = cos(2π(x-p)/g<sub>p</sub>)
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tunneling" className="mt-2 space-y-2">
            <div className="text-[10px] space-y-1.5">
              <p className="text-muted-foreground">Quantum tunneling between prime pairs:</p>
              <div className="p-2 bg-secondary/50 rounded font-mono text-[9px]">
                T(x) = exp(-(x-p₁)(p₂-x)/ε) e<sup>iβ(x-p₁)</sup>
              </div>
              <p className="text-muted-foreground">
                This models the quantum probability amplitude of "jumping" between consecutive primes.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="params" className="mt-2 space-y-2">
            <div className="text-[10px] space-y-1.5">
              <p className="text-muted-foreground">Optimal parameters (p &lt; 10⁻⁸):</p>
              <div className="grid grid-cols-2 gap-2 p-2 bg-secondary/50 rounded">
                <div className="font-mono text-[9px]">V₀ = 0.100</div>
                <div className="font-mono text-[9px]">ε = 0.200</div>
                <div className="font-mono text-[9px]">β = 0.100</div>
                <div className="font-mono text-[9px]">σ = 0.500</div>
              </div>
              <div className="p-2 bg-primary/10 rounded text-center">
                <span className="font-mono text-[9px]">r<sub>wave</sub> = 0.454 | r<sub>res</sub> = 0.542</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
