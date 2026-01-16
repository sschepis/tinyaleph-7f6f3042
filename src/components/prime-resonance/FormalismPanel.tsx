import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function FormalismPanel() {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm">Prime Resonance Formalism</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Tabs defaultValue="hilbert" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="hilbert" className="text-[10px]">Hilbert Space</TabsTrigger>
            <TabsTrigger value="operators" className="text-[10px]">Operators</TabsTrigger>
            <TabsTrigger value="evolution" className="text-[10px]">Evolution</TabsTrigger>
            <TabsTrigger value="measurement" className="text-[10px]">Measurement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hilbert" className="mt-3 space-y-2 text-xs">
            <div className="p-2 rounded bg-muted/50 font-mono text-center">
              ℋ_P = span{'{'}|p⟩ : p ∈ ℙ{'}'}
            </div>
            <p className="text-muted-foreground">
              The <strong>Prime Hilbert Space</strong> is spanned by orthonormal basis states |p⟩ 
              indexed by prime numbers. Any semantic state is a superposition:
            </p>
            <div className="p-2 rounded bg-primary/10 font-mono text-center border border-primary/20">
              |ψ⟩ = Σ α_p |p⟩ where α_p ∈ ℂ
            </div>
            <p className="text-muted-foreground">
              The complex amplitude α_p encodes both <em>magnitude</em> (probability) and 
              <em>phase</em> (interference) information.
            </p>
          </TabsContent>
          
          <TabsContent value="operators" className="mt-3 space-y-2 text-xs">
            <div className="space-y-2">
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                <p className="font-mono text-blue-400">P̂|p⟩ = p|p⟩</p>
                <p className="text-muted-foreground mt-1">Prime eigenvalue operator extracts prime as eigenvalue</p>
              </div>
              <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                <p className="font-mono text-purple-400">R̂(n)|p⟩ = e^(2πi log_p(n))|p⟩</p>
                <p className="text-muted-foreground mt-1">Phase rotation creates logarithmic interference</p>
              </div>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <p className="font-mono text-amber-400">Ĉ(n)|p⟩ = e^(2πi(n mod p)/p)|p⟩</p>
                <p className="text-muted-foreground mt-1">Coupling operator creates modular phase shifts</p>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <p className="font-mono text-emerald-400">Ĥ = (1/√N) Σ e^(2πijk/N)</p>
                <p className="text-muted-foreground mt-1">Hadamard-like spreading over prime basis</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="evolution" className="mt-3 space-y-2 text-xs">
            <div className="p-2 rounded bg-muted/50 font-mono text-center text-[11px]">
              d|Ψ(t)⟩/dt = iĤ|Ψ(t)⟩ - λ(R̂ - r_stable)|Ψ(t)⟩
            </div>
            <p className="text-muted-foreground">
              <strong>Entropy-driven dynamics</strong>: The state evolves via unitary evolution (Ĥ) 
              combined with non-unitary damping towards a stable resonance r_stable.
            </p>
            <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
              <p className="font-mono text-destructive">P_collapse = 1 - e^(-∫S(t)dt)</p>
              <p className="text-muted-foreground mt-1">
                Collapse probability accumulates with entropy over time
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="measurement" className="mt-3 space-y-2 text-xs">
            <div className="p-2 rounded bg-muted/50 font-mono text-center">
              P(p) = |⟨p|ψ⟩|² = |α_p|²
            </div>
            <p className="text-muted-foreground">
              <strong>Born Rule</strong>: The probability of measuring prime p is the squared 
              magnitude of its amplitude. After measurement, the state collapses:
            </p>
            <div className="p-2 rounded bg-primary/10 font-mono text-center border border-primary/20">
              |ψ⟩ → |p⟩ with probability |α_p|²
            </div>
            <p className="text-muted-foreground">
              Repeated measurements reveal the underlying probability distribution, 
              demonstrating quantum-like statistical behavior.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
