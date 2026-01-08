import { useState, useCallback, useEffect } from 'react';
import { Zap } from 'lucide-react';

const PRIME_MAP: Record<string, number> = {
  a: 2, b: 3, c: 5, d: 7, e: 11, f: 13, g: 17, h: 19, i: 23, j: 29,
  k: 31, l: 37, m: 41, n: 43, o: 47, p: 53, q: 59, r: 61, s: 67, t: 71,
  u: 73, v: 79, w: 83, x: 89, y: 97, z: 101
};

const wordToPrimes = (word: string): number[] => {
  return word.toLowerCase().split('').filter(c => PRIME_MAP[c]).map(c => PRIME_MAP[c]);
};

const primeResonance = (p1: number[], p2: number[]): number => {
  const overlap = p1.filter(p => p2.includes(p)).length;
  const union = new Set([...p1, ...p2]).size;
  return union > 0 ? overlap / union : 0;
};

const PrimeResonanceDemo = () => {
  const [word1, setWord1] = useState('wisdom');
  const [word2, setWord2] = useState('knowledge');
  const [analysis, setAnalysis] = useState<{
    primes1: number[];
    primes2: number[];
    overlap: number[];
    union: number[];
    resonance: number;
  } | null>(null);

  const analyze = useCallback(() => {
    const p1 = wordToPrimes(word1);
    const p2 = wordToPrimes(word2);
    const overlap = p1.filter(p => p2.includes(p));
    const union = [...new Set([...p1, ...p2])].sort((a, b) => a - b);
    
    setAnalysis({
      primes1: p1,
      primes2: p2,
      overlap,
      union,
      resonance: primeResonance(p1, p2)
    });
  }, [word1, word2]);

  useEffect(() => {
    analyze();
  }, [analyze]);

  const getPrimeChar = (prime: number): string => {
    const entry = Object.entries(PRIME_MAP).find(([_, p]) => p === prime);
    return entry ? entry[0] : '?';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Prime Resonance Explorer</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Word 1</label>
          <input
            type="text"
            value={word1}
            onChange={(e) => setWord1(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Word 2</label>
          <input
            type="text"
            value={word2}
            onChange={(e) => setWord2(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono text-sm"
          />
        </div>
      </div>

      {analysis && (
        <div className="space-y-3">
          {/* Prime Signatures */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs font-medium mb-2 text-blue-400">{word1}</p>
              <div className="flex flex-wrap gap-1">
                {analysis.primes1.map((p, i) => (
                  <span 
                    key={i} 
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${analysis.overlap.includes(p) ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500' : 'bg-blue-500/20 text-blue-300'}`}
                  >
                    {getPrimeChar(p)}→{p}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-xs font-medium mb-2 text-green-400">{word2}</p>
              <div className="flex flex-wrap gap-1">
                {analysis.primes2.map((p, i) => (
                  <span 
                    key={i} 
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${analysis.overlap.includes(p) ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500' : 'bg-green-500/20 text-green-300'}`}
                  >
                    {getPrimeChar(p)}→{p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Resonance Score */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Resonance Score</span>
              <span className="font-mono text-lg text-primary">
                {analysis.resonance.toFixed(4)}
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all"
                style={{ width: `${analysis.resonance * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>|Overlap| = {analysis.overlap.length}</span>
              <span>|Union| = {analysis.union.length}</span>
            </div>
          </div>

          {/* Formula */}
          <div className="p-2 rounded bg-primary/10 font-mono text-xs text-center">
            resonance = |P₁ ∩ P₂| / |P₁ ∪ P₂| = {analysis.overlap.length}/{analysis.union.length} = {analysis.resonance.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrimeResonanceDemo;
