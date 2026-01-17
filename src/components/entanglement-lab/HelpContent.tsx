import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function HelpContent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Quantum Entanglement Lab</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-primary mb-2">What is Quantum Entanglement?</h3>
              <p className="text-muted-foreground">
                Entanglement is a quantum phenomenon where two particles become correlated in 
                such a way that measuring one instantly affects the other, regardless of distance. 
                This "spooky action at a distance" (Einstein's phrase) is one of the most 
                counterintuitive aspects of quantum mechanics.
              </p>
            </section>
            
            <section>
              <h3 className="font-semibold text-primary mb-2">Bell States</h3>
              <p className="text-muted-foreground mb-2">
                The four Bell states are maximally entangled two-qubit states:
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs bg-secondary/30 p-3 rounded">
                <div>|Φ⁺⟩ = (|00⟩ + |11⟩)/√2</div>
                <div>|Φ⁻⟩ = (|00⟩ - |11⟩)/√2</div>
                <div>|Ψ⁺⟩ = (|01⟩ + |10⟩)/√2</div>
                <div>|Ψ⁻⟩ = (|01⟩ - |10⟩)/√2</div>
              </div>
              <p className="text-muted-foreground mt-2">
                In |Φ⁺⟩, both qubits are always measured in the same state when using the 
                same measurement basis. In |Ψ⁻⟩ (the singlet), they're always opposite.
              </p>
            </section>
            
            <section>
              <h3 className="font-semibold text-primary mb-2">The CHSH Inequality</h3>
              <p className="text-muted-foreground mb-2">
                The Clauser-Horne-Shimony-Holt (CHSH) inequality tests whether correlations 
                between entangled particles can be explained by "local hidden variables" 
                (classical physics). The CHSH parameter is:
              </p>
              <div className="font-mono text-xs bg-secondary/30 p-3 rounded mb-2">
                S = E(a,b) - E(a,b') + E(a',b) + E(a',b')
              </div>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Classical bound:</strong> |S| ≤ 2 (any local hidden variable theory)</li>
                <li><strong>Quantum bound:</strong> |S| ≤ 2√2 ≈ 2.828 (Tsirelson bound)</li>
                <li><strong>Violation:</strong> |S| &gt; 2 proves quantum mechanics cannot be explained classically</li>
              </ul>
            </section>
            
            <section>
              <h3 className="font-semibold text-primary mb-2">Optimal CHSH Angles</h3>
              <p className="text-muted-foreground mb-2">
                Maximum violation (S = 2√2) occurs with these measurement angles:
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs bg-secondary/30 p-3 rounded">
                <div className="text-blue-400">Alice α = 0°</div>
                <div className="text-red-400">Bob β = 45°</div>
                <div className="text-blue-400">Alice α' = 90°</div>
                <div className="text-red-400">Bob β' = 135°</div>
              </div>
            </section>
            
            <section>
              <h3 className="font-semibold text-primary mb-2">The EPR Paradox</h3>
              <p className="text-muted-foreground">
                Einstein, Podolsky, and Rosen (1935) argued that quantum mechanics must be 
                incomplete because entanglement seemed to require faster-than-light communication. 
                Bell's theorem (1964) and subsequent experiments proved that quantum correlations 
                are real but don't actually transmit information—they're a new kind of correlation 
                that has no classical analog.
              </p>
            </section>
            
            <section>
              <h3 className="font-semibold text-primary mb-2">Using This Lab</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Select a Bell state to create an entangled pair</li>
                <li>Adjust Alice's and Bob's measurement angles</li>
                <li>Run single or multiple measurements to see correlations</li>
                <li>Use the CHSH panel to test Bell inequality violation</li>
                <li>Click "Optimal" to set angles for maximum violation</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
