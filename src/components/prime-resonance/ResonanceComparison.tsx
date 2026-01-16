import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GitCompare, Sparkles, Zap } from 'lucide-react';
import { 
  PrimeState, 
  uniformSuperposition, 
  conceptState, 
  innerProduct, 
  resonanceScore,
  complex,
  FIRST_64_PRIMES
} from '@/lib/prime-resonance';

interface ResonanceComparisonProps {
  currentState: PrimeState;
}

export function ResonanceComparison({ currentState }: ResonanceComparisonProps) {
  const [state1, setState1] = useState<PrimeState>(currentState);
  const [state2, setState2] = useState<PrimeState>(() => conceptState([3, 5, 7]));
  const [input1, setInput1] = useState('2,3,5');
  const [input2, setInput2] = useState('3,5,7');

  const parsePrimes = (input: string): number[] => {
    return input.split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && FIRST_64_PRIMES.includes(n));
  };

  const createState1 = useCallback(() => {
    const primes = parsePrimes(input1);
    if (primes.length > 0) {
      setState1(conceptState(primes));
    } else {
      setState1(uniformSuperposition(8));
    }
  }, [input1]);

  const createState2 = useCallback(() => {
    const primes = parsePrimes(input2);
    if (primes.length > 0) {
      setState2(conceptState(primes));
    } else {
      setState2(uniformSuperposition(8));
    }
  }, [input2]);

  const useCurrentAsState1 = () => {
    setState1(currentState);
    setInput1(currentState.primes.slice(0, 5).join(','));
  };

  // Calculate comparison metrics
  const ip = innerProduct(state1, state2);
  const overlap = complex.magnitude(ip);
  const phase = complex.phase(ip);
  const score = resonanceScore(state1, state2);

  // Jaccard similarity on prime sets
  const set1 = new Set(state1.primes);
  const set2 = new Set(state2.primes);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  const jaccard = intersection.size / union.size;

  // Get dominant primes for each state
  const getDominant = (state: PrimeState): number[] => {
    const sorted = Array.from(state.amplitudes.entries())
      .map(([p, a]) => ({ p, mag: complex.magnitude(a) }))
      .sort((a, b) => b.mag - a.mag);
    return sorted.slice(0, 3).map(x => x.p);
  };

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <GitCompare className="h-3 w-3 text-primary" />
          Resonance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* State 1 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">|ψ₁⟩</Badge>
            <Input 
              value={input1}
              onChange={e => setInput1(e.target.value)}
              className="h-6 text-[10px] flex-1"
              placeholder="2,3,5"
            />
            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={createState1}>
              Set
            </Button>
            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={useCurrentAsState1}>
              Use Current
            </Button>
          </div>
          <div className="flex gap-1">
            {getDominant(state1).map(p => (
              <Badge key={p} variant="secondary" className="text-[9px]">{p}</Badge>
            ))}
          </div>
        </div>

        {/* State 2 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">|ψ₂⟩</Badge>
            <Input 
              value={input2}
              onChange={e => setInput2(e.target.value)}
              className="h-6 text-[10px] flex-1"
              placeholder="3,5,7"
            />
            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={createState2}>
              Set
            </Button>
          </div>
          <div className="flex gap-1">
            {getDominant(state2).map(p => (
              <Badge key={p} variant="secondary" className="text-[9px]">{p}</Badge>
            ))}
          </div>
        </div>

        {/* Comparison Results */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div className="text-center p-2 bg-primary/5 rounded-lg">
            <div className="text-[10px] text-muted-foreground mb-1">⟨ψ₁|ψ₂⟩</div>
            <div className="font-mono text-sm font-bold text-primary">
              {overlap.toFixed(3)}
            </div>
            <div className="text-[9px] text-muted-foreground">
              φ = {(phase * 180 / Math.PI).toFixed(1)}°
            </div>
          </div>
          
          <div className="text-center p-2 bg-secondary rounded-lg">
            <div className="text-[10px] text-muted-foreground mb-1">Jaccard</div>
            <div className="font-mono text-sm font-bold">
              {jaccard.toFixed(3)}
            </div>
            <div className="text-[9px] text-muted-foreground">
              |P₁ ∩ P₂| = {intersection.size}
            </div>
          </div>
        </div>

        {/* Visual overlap */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Overlap</span>
            <span>{(overlap * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full transition-all"
              style={{ width: `${overlap * 100}%` }}
            />
          </div>
        </div>

        {/* Resonance score */}
        <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-yellow-500" />
            <span className="text-[10px]">Resonance Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Zap 
                  key={i} 
                  className={`h-3 w-3 ${i < Math.round(score.total * 5) ? 'text-yellow-500' : 'text-muted'}`}
                />
              ))}
            </div>
            <Badge variant={score.total > 0.7 ? "default" : "secondary"} className="text-[10px]">
              {(score.total * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>

        {/* Interpretation */}
        <p className="text-[9px] text-center text-muted-foreground">
          {overlap > 0.8 ? "High overlap - states are nearly identical" :
           overlap > 0.5 ? "Moderate overlap - states share significant structure" :
           overlap > 0.2 ? "Low overlap - states are mostly distinct" :
           "Orthogonal states - no shared structure"}
        </p>
      </CardContent>
    </Card>
  );
}
