import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';

export function FormalismInfo() {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="py-1.5 px-2">
        <CardTitle className="text-[10px] flex items-center gap-1">
          <BookOpen className="h-3 w-3 text-primary" />
          Framework
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <Tabs defaultValue="wave" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-5">
            <TabsTrigger value="wave" className="text-[8px] h-4 px-1">Wave</TabsTrigger>
            <TabsTrigger value="res" className="text-[8px] h-4 px-1">Resonance</TabsTrigger>
            <TabsTrigger value="tunnel" className="text-[8px] h-4 px-1">Tunnel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wave" className="mt-1.5">
            <div className="p-1.5 bg-secondary/50 rounded font-mono text-[8px] text-center">
              ψ(x) = N⁻¹/² cos(2πtx) e⁻ᐟᵗᐟˣ
            </div>
          </TabsContent>
          
          <TabsContent value="res" className="mt-1.5">
            <div className="p-1.5 bg-secondary/50 rounded font-mono text-[8px] text-center">
              R(x) = Σₚ exp(-(x-p)²/2σ²)
            </div>
          </TabsContent>
          
          <TabsContent value="tunnel" className="mt-1.5">
            <div className="p-1.5 bg-secondary/50 rounded font-mono text-[8px] text-center">
              T(x) = exp(-(x-p₁)(p₂-x)/ε)
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
