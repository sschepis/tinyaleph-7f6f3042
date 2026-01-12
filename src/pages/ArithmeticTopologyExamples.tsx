import { useState } from 'react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';

// Simulated Legendre symbol computation
const legendreSymbol = (a: number, p: number): number => {
  if (p === 2) return 0;
  a = ((a % p) + p) % p;
  if (a === 0) return 0;
  let result = 1;
  let exp = (p - 1) / 2;
  let base = a;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % p;
    base = (base * base) % p;
    exp = Math.floor(exp / 2);
  }
  return result === 1 ? 1 : -1;
};

// Compute coupling matrix
const computeCouplingMatrix = (primes: number[]): number[][] => {
  const n = primes.length;
  const J: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        J[i][j] = legendreSymbol(primes[i], primes[j]);
      }
    }
  }
  return J;
};

const LegendreSymbolExample = () => {
  const [a, setA] = useState(5);
  const [p, setP] = useState(7);
  const primes = [5, 7, 11, 13];
  const J = computeCouplingMatrix(primes);
  
  const result = legendreSymbol(a, p);
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Compute Legendre Symbol (a/p)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">a:</label>
                <input
                  type="number"
                  value={a}
                  onChange={(e) => setA(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md bg-background border"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">p (odd prime):</label>
                <input
                  type="number"
                  value={p}
                  onChange={(e) => setP(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md bg-background border"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-background rounded-lg text-center">
              <span className="text-2xl font-mono">({a}/{p}) = </span>
              <span className={`text-2xl font-bold ${result === 1 ? 'text-green-500' : result === -1 ? 'text-red-500' : 'text-yellow-500'}`}>
                {result}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {result === 1 ? `${a} is a quadratic residue mod ${p}` :
               result === -1 ? `${a} is a quadratic non-residue mod ${p}` :
               `${p} divides ${a}`}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <h4 className="text-sm font-medium mb-2">Quadratic Reciprocity</h4>
            <div className="font-mono text-sm">
              (p/q)(q/p) = (-1)^((p-1)/2 · (q-1)/2)
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Coupling Matrix J for {`{${primes.join(', ')}}`}</h4>
            <table className="w-full text-center font-mono text-sm">
              <thead>
                <tr>
                  <th className="p-1"></th>
                  {primes.map(p => <th key={p} className="p-1">{p}</th>)}
                </tr>
              </thead>
              <tbody>
                {J.map((row, i) => (
                  <tr key={i}>
                    <td className="p-1 font-bold">{primes[i]}</td>
                    {row.map((val, j) => (
                      <td key={j} className={`p-1 ${val === 1 ? 'text-green-500' : val === -1 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Interpretation</h4>
            <div className="text-sm space-y-1">
              <div><span className="text-green-500">+1</span> = primes "in phase" (constructive)</div>
              <div><span className="text-red-500">-1</span> = primes "out of phase" (destructive)</div>
              <div><span className="text-muted-foreground">0</span> = no coupling (divisibility)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RedeiSymbolExample = () => {
  const primes = [5, 7, 11, 13, 17, 19, 23];
  
  const checkBorromean = (p1: number, p2: number, p3: number) => {
    const l12 = legendreSymbol(p1, p2) * legendreSymbol(p2, p1);
    const l23 = legendreSymbol(p2, p3) * legendreSymbol(p3, p2);
    const l31 = legendreSymbol(p3, p1) * legendreSymbol(p1, p3);
    return { l12, l23, l31, possible: l12 === 1 && l23 === 1 && l31 === 1 };
  };
  
  const triples = [
    [5, 13, 17],
    [5, 29, 41],
    [17, 41, 73],
    [5, 7, 11]
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Rédei Symbol [p₁, p₂, p₃]</h4>
            <p className="text-sm text-muted-foreground mb-4">
              The Rédei symbol measures triadic interaction between primes,
              analogous to the Milnor μ-invariant for links.
            </p>
            <div className="p-3 bg-background rounded font-mono text-sm">
              Requires: (pᵢ/pⱼ) = +1 for all pairs
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <h4 className="text-sm font-medium mb-2">Borromean Primes</h4>
            <p className="text-sm text-muted-foreground">
              Like Borromean rings: no two are linked,
              but the triple is inseparable.
              <br/><br/>
              Condition: J[i,j] = +1 pairwise but [p₁,p₂,p₃] ≠ 0
            </p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium mb-3">Borromean Checks</h4>
          <div className="space-y-3">
            {triples.map((triple, idx) => {
              const check = checkBorromean(triple[0], triple[1], triple[2]);
              return (
                <div key={idx} className={`p-3 rounded ${check.possible ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
                  <div className="font-mono text-sm mb-1">[{triple.join(', ')}]</div>
                  <div className="text-xs text-muted-foreground">
                    (p₁p₂): {check.l12}, (p₂p₃): {check.l23}, (p₃p₁): {check.l31}
                  </div>
                  <div className={`text-xs mt-1 ${check.possible ? 'text-green-500' : 'text-orange-500'}`}>
                    {check.possible ? '✓ Possible Borromean' : '✗ Not Borromean (pairwise condition fails)'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ALKKuramotoExample = () => {
  const [phases, setPhases] = useState<number[]>([0, 0.5, 1, 1.5, 2, 2.5]);
  const [orderParam, setOrderParam] = useState(0.2);
  const primes = [5, 7, 11, 13, 17, 19];
  
  const evolve = () => {
    const dt = 0.1;
    const K = 0.5;
    const J = computeCouplingMatrix(primes);
    const omega = primes.map(p => Math.log(p)); // Natural frequencies
    
    const newPhases = phases.map((theta, i) => {
      let coupling = 0;
      for (let j = 0; j < phases.length; j++) {
        if (i !== j) {
          coupling += J[i][j] * Math.sin(phases[j] - theta);
        }
      }
      return theta + dt * (omega[i] + K * coupling);
    });
    
    // Compute order parameter
    const sumCos = newPhases.reduce((s, p) => s + Math.cos(p), 0);
    const sumSin = newPhases.reduce((s, p) => s + Math.sin(p), 0);
    const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / newPhases.length;
    
    setPhases(newPhases);
    setOrderParam(r);
  };
  
  const reset = () => {
    setPhases(primes.map(() => Math.random() * 2 * Math.PI));
    setOrderParam(0.2);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">ALK-Kuramoto Dynamics</h4>
            <div className="font-mono text-sm mb-4 p-3 bg-background rounded">
              dθᵢ/dt = ωᵢ + Σⱼ Jᵢⱼ sin(θⱼ - θᵢ)
            </div>
            <div className="text-sm text-muted-foreground">
              <p>where:</p>
              <ul className="list-disc list-inside ml-2">
                <li>ωᵢ = ln(pᵢ) - natural frequency</li>
                <li>Jᵢⱼ = (pᵢ/pⱼ) - Legendre coupling</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={evolve} className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground">
              Evolve (100 steps)
            </button>
            <button onClick={reset} className="px-4 py-2 rounded-md bg-secondary">
              Reset
            </button>
          </div>
          
          <div className={`p-4 rounded-lg ${orderParam > 0.7 ? 'bg-green-500/20' : orderParam > 0.4 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
            <div className="flex justify-between items-center">
              <span>Order Parameter r:</span>
              <span className="text-2xl font-mono font-bold">{orderParam.toFixed(4)}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {orderParam > 0.7 ? 'Synchronized' : orderParam > 0.4 ? 'Partially synchronized' : 'Desynchronized'}
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium mb-3">Phase Distribution</h4>
          <svg width="100%" height="200" viewBox="0 0 300 200">
            <circle cx="150" cy="100" r="80" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
            {phases.map((theta, i) => {
              const x = 150 + 70 * Math.cos(theta);
              const y = 100 + 70 * Math.sin(theta);
              return (
                <g key={i}>
                  <line x1="150" y1="100" x2={x} y2={y} stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.5" />
                  <circle cx={x} cy={y} r="8" fill="hsl(var(--primary))" />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="white">{primes[i]}</text>
                </g>
              );
            })}
            {/* Order parameter vector */}
            <line
              x1="150"
              y1="100"
              x2={150 + 80 * orderParam * Math.cos(phases.reduce((s, p) => s + p, 0) / phases.length)}
              y2={100 + 80 * orderParam * Math.sin(phases.reduce((s, p) => s + p, 0) / phases.length)}
              stroke="hsl(var(--accent))"
              strokeWidth="3"
            />
          </svg>
          <div className="text-center text-xs text-muted-foreground mt-2">
            Blue = phase oscillators, Yellow = mean field
          </div>
        </div>
      </div>
    </div>
  );
};

const AlexanderModuleExample = () => {
  const [primes, setPrimes] = useState([5, 7, 11, 13]);
  
  // Simplified Alexander polynomial simulation
  const computeAlexander = (ps: number[]) => {
    const n = ps.length;
    const coeffs = [];
    for (let i = 0; i <= n; i++) {
      const sign = i % 2 === 0 ? 1 : -1;
      const binomial = factorial(n) / (factorial(i) * factorial(n - i));
      coeffs.push(sign * binomial);
    }
    return coeffs;
  };
  
  const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
  
  const coeffs = computeAlexander(primes);
  const polyString = coeffs.map((c, i) => {
    if (c === 0) return null;
    const sign = c > 0 ? (i === 0 ? '' : '+') : '';
    const coeff = Math.abs(c) === 1 && i > 0 ? (c < 0 ? '-' : '') : `${c}`;
    const term = i === 0 ? '' : i === 1 ? 't' : `t^${i}`;
    return `${sign}${coeff}${term}`;
  }).filter(Boolean).join(' ');
  
  const addPrime = (p: number) => {
    if (!primes.includes(p)) {
      setPrimes([...primes, p].sort((a, b) => a - b));
    }
  };
  
  const removePrime = (p: number) => {
    if (primes.length > 2) {
      setPrimes(primes.filter(x => x !== p));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Prime Set S</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {primes.map(p => (
                <button
                  key={p}
                  onClick={() => removePrime(p)}
                  className="px-3 py-1.5 rounded-md bg-primary/20 hover:bg-red-500/20 text-sm font-mono"
                >
                  {p} ×
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 5, 7, 11, 13, 17, 19, 23, 29].filter(p => !primes.includes(p)).map(p => (
                <button
                  key={p}
                  onClick={() => addPrime(p)}
                  className="px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-sm font-mono"
                >
                  +{p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <h4 className="text-sm font-medium mb-2">Alexander Polynomial</h4>
            <div className="font-mono text-lg p-3 bg-background rounded">
              Δ(t) = {polyString}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Degree: {primes.length}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Crowell Exact Sequence</h4>
            <div className="font-mono text-sm p-3 bg-background rounded text-center">
              0 → N^ab → A_ψ → I_{'{Z[H]}'} → 0
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Connects ψ-Galois module to Alexander module
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Fitting Ideals</h4>
            <div className="space-y-2 font-mono text-sm">
              {[0, 1, 2, 3].map(d => (
                <div key={d} className="flex justify-between p-2 bg-background rounded">
                  <span>E_{d}(A_ψ)</span>
                  <span className="text-muted-foreground">degree {Math.max(0, primes.length - d)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SignatureMemoryExample = () => {
  const [stored, setStored] = useState<{primes: number[], hash: string}[]>([
    { primes: [3, 5, 7], hash: '81da5999' },
    { primes: [5, 7, 11], hash: '91313197' },
    { primes: [7, 11, 13], hash: 'cb8ce35d' }
  ]);
  const [queryPrimes, setQueryPrimes] = useState('5,7,11');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  
  const generateHash = (primes: number[]) => {
    let hash = 0;
    for (const p of primes) {
      hash = ((hash << 5) - hash + p) | 0;
    }
    return (hash >>> 0).toString(16).slice(0, 8);
  };
  
  const storePrimes = () => {
    const primes = queryPrimes.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (primes.length >= 2) {
      const hash = generateHash(primes);
      if (!stored.find(s => s.hash === hash)) {
        setStored([...stored, { primes, hash }]);
      }
    }
  };
  
  const searchPrimes = () => {
    const primes = queryPrimes.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const hash = generateHash(primes);
    const found = stored.find(s => s.hash === hash);
    setSearchResult(found ? `Found: {${found.primes.join(', ')}}` : 'Not found');
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Signature Memory</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Content-addressable storage using module signatures as keys.
            </p>
            <div className="space-y-2">
              {stored.map((entry, idx) => (
                <div key={idx} className="p-2 bg-background rounded flex justify-between font-mono text-sm">
                  <span>{`{${entry.primes.join(', ')}}`}</span>
                  <span className="text-muted-foreground">{entry.hash}...</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Query/Store</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={queryPrimes}
                onChange={(e) => setQueryPrimes(e.target.value)}
                placeholder="e.g., 5,7,11"
                className="w-full px-3 py-2 rounded-md bg-background border font-mono"
              />
              <div className="flex gap-2">
                <button onClick={storePrimes} className="flex-1 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm">
                  Store
                </button>
                <button onClick={searchPrimes} className="flex-1 px-3 py-2 rounded-md bg-secondary text-sm">
                  Search
                </button>
              </div>
              {searchResult && (
                <div className={`p-3 rounded ${searchResult.includes('Found') ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                  {searchResult}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
            <h4 className="text-sm font-medium mb-2">Applications</h4>
            <ul className="text-sm space-y-1">
              <li>• Content-addressable prime-set lookup</li>
              <li>• Resonance-based retrieval</li>
              <li>• Attractor alignment targets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  {
    id: 'legendre-symbol',
    number: '1',
    title: 'Legendre Symbol',
    subtitle: 'Pairwise prime coupling',
    description: 'The Legendre symbol (a/p) encodes quadratic residuosity and forms the basis of pairwise coupling in the Arithmetic Link Kernel.',
    concepts: ['Quadratic Reciprocity', 'Coupling Matrix J', 'Phase Relationships', 'Topological Linking'],
    code: `import { LegendreSymbol, computeLegendreMatrix } from '@aleph-ai/tinyaleph';

// Compute Legendre symbol (5/7)
const ls = new LegendreSymbol(5, 7);
console.log('(5/7) =', ls.compute()); // -1

// Quadratic reciprocity: (p/q)(q/p) = (-1)^((p-1)/2 * (q-1)/2)
const ls1 = new LegendreSymbol(3, 5);
const ls2 = new LegendreSymbol(5, 3);
console.log('(3/5)(5/3) =', ls1.compute() * ls2.compute()); // 1

// Compute coupling matrix for prime set
const primes = [5, 7, 11, 13];
const J = computeLegendreMatrix(primes);
console.log('Coupling matrix J:');
console.log(J);
// J[i][j] = +1: constructive coupling
// J[i][j] = -1: destructive coupling`,
    codeTitle: 'arithmetic-topology/01-legendre-symbol.js'
  },
  {
    id: 'redei-symbol',
    number: '2',
    title: 'Rédei Symbol',
    subtitle: 'Triadic coupling & Borromean primes',
    description: 'The Rédei symbol [p₁, p₂, p₃] captures triadic interactions, analogous to the Milnor μ-invariant for links. Borromean primes exhibit linking without pairwise linking.',
    concepts: ['Rédei Symbol', 'Borromean Rings', 'Arithmetic Massey Products', 'K³ Tensor'],
    code: `import { RedeiSymbol, quickBorromeanCheck, findBorromeanPrimes } from '@aleph-ai/tinyaleph';

// Rédei symbol [p₁, p₂, p₃] - triadic interaction
const redei = new RedeiSymbol(5, 13, 17, 2);
console.log('Computable:', redei.isComputable);
// Requires all pairwise Legendre symbols = +1

// Quick Borromean check
const check = quickBorromeanCheck(5, 13, 17);
console.log('Borromean possible:', check.possible);
console.log('Legendre pairs:', check.l12, check.l23, check.l31);

// Borromean primes: J[i,j] = +1 pairwise but K³ ≠ 0
// Like Borromean rings: no two are linked, but triple is inseparable`,
    codeTitle: 'arithmetic-topology/02-redei-symbol.js'
  },
  {
    id: 'alk-kuramoto',
    number: '3',
    title: 'ALK-Kuramoto',
    subtitle: 'Prime-coupled oscillator synchronization',
    description: 'Combine the Arithmetic Link Kernel with Kuramoto dynamics. Phases evolve according to dθᵢ/dt = ωᵢ + Σⱼ Jᵢⱼ sin(θⱼ - θᵢ) where Jᵢⱼ is the Legendre coupling.',
    concepts: ['Kuramoto Model', 'Order Parameter', 'Phase Synchronization', 'Triadic Coherence'],
    code: `import { createALKKuramoto } from '@aleph-ai/tinyaleph';

// Create ALK-Kuramoto model for primes
const model = createALKKuramoto([5, 7, 11, 13, 17, 19], {
  K_pair: 1.0,    // Pairwise coupling strength
  K_triple: 0.5   // Triadic coupling strength
});

// ALK-Kuramoto dynamics:
// dθᵢ/dt = ωᵢ + Σⱼ Jᵢⱼ sin(θⱼ - θᵢ) + Σⱼ<ₖ K³ᵢⱼₖ sin(θⱼ + θₖ - 2θᵢ)
// where ωᵢ = ln(pᵢ) and Jᵢⱼ = (pᵢ/pⱼ)

// Evolve dynamics
for (let step = 0; step < 1000; step++) {
  model.evolve(1, 0.01);
}
console.log('Order parameter:', model.orderParameter);
console.log('Triadic coherence:', model.triadicCoherence);`,
    codeTitle: 'arithmetic-topology/03-alk-kuramoto.js'
  },
  {
    id: 'alexander-module',
    number: '4',
    title: 'Alexander Module',
    subtitle: 'Fitting ideals & characteristic polynomials',
    description: 'The Complete Alexander Module A_ψ for prime sets, with Crowell exact sequence and Fitting ideals E_d(A_ψ) that generalize Alexander polynomials.',
    concepts: ['Crowell Sequence', 'Fitting Ideals', 'Alexander Polynomial', 'Module Theory'],
    code: `import { createAlexanderModule } from '@aleph-ai/tinyaleph';

// Create Alexander module for prime set
const module = createAlexanderModule([5, 7, 11, 13], { ell: 2 });

// Crowell exact sequence: 0 → N^ab → A_ψ → I_{Z[H]} → 0
const exactness = module.crowellSequence.verifyExactness();
console.log('Exact at A_ψ:', exactness.exactAtApsi);

// Alexander polynomial Δ₀(A_ψ)
const alexPoly = module.alexanderPolynomial;
console.log('Δ(t) =', alexPoly.toString());
console.log('Degree:', alexPoly.degree);

// Fitting ideals E_d(A_ψ)
const ideals = module.getAllFittingIdeals(3);
Object.entries(ideals).forEach(([d, ideal]) => {
  console.log(\`E_\${d}: degree=\${ideal.characteristicPolynomial.degree}\`);
});`,
    codeTitle: 'arithmetic-topology/04-alexander-module.js'
  },
  {
    id: 'signature-memory',
    number: '5',
    title: 'Signature Memory',
    subtitle: 'Content-addressable retrieval',
    description: 'Module signatures Σ_{k,S,ℓ,ψ} serve as content-addressable keys for associative memory, enabling resonance-based retrieval and alignment.',
    concepts: ['Module Signatures', 'Content-Addressable Memory', 'Similarity Search', 'Attractor Alignment'],
    code: `import { SignatureMemory, extractSignature } from '@aleph-ai/tinyaleph';

// Create signature memory store
const memory = new SignatureMemory();

// Store signatures for various prime configurations
const configs = [[3, 5, 7], [5, 7, 11], [7, 11, 13]];
for (const primes of configs) {
  const sig = extractSignature(primes);
  memory.store(sig);
  console.log('Stored:', primes, '→', sig.hash.toString(16).slice(0, 8));
}

// Exact retrieval
const querySig = extractSignature([5, 7, 11]);
const exact = memory.get(querySig.hash);
console.log('Retrieved:', exact?.primes);

// Similarity search
const searchSig = extractSignature([5, 7, 13]); // Not stored
const similar = memory.findClosest(searchSig, 3);
console.log('Similar:', similar.map(s => s.signature.primes));`,
    codeTitle: 'arithmetic-topology/05-signature-memory.js'
  }
];

const exampleComponents: Record<string, React.FC> = {
  'legendre-symbol': LegendreSymbolExample,
  'redei-symbol': RedeiSymbolExample,
  'alk-kuramoto': ALKKuramotoExample,
  'alexander-module': AlexanderModuleExample,
  'signature-memory': SignatureMemoryExample
};

export default function ArithmeticTopologyExamplesPage() {
  return (
    <ExamplePageWrapper
      category="Arithmetic Topology"
      title="Primes as Knots"
      description="Arithmetic Link Kernel, Legendre/Rédei symbols, Alexander modules, and ALK-Kuramoto synchronization."
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'Topology', path: '/topology' }}
      nextSection={{ title: 'CRT-Homology', path: '/crt-homology' }}
    />
  );
}