
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import { useState, useMemo } from 'react';

// Simulated CRT implementation for visualization
const DEFAULT_PRIMES = [2, 3, 5, 7];

const ResidueEncodingExample = () => {
  const [hiddenValues, setHiddenValues] = useState<number[]>([0.5, 0.3, 0.7, 0.2, 0.4, 0.6, 0.8, 0.1]);
  const primes = DEFAULT_PRIMES;
  const product = primes.reduce((a, b) => a * b, 1);
  
  // Simulate residue distributions
  const residues = useMemo(() => {
    return primes.map((p, k) => {
      const dist = new Array(p).fill(0);
      // Simple linear projection + softmax simulation
      const raw = new Array(p).fill(0);
      for (let i = 0; i < p; i++) {
        raw[i] = hiddenValues.reduce((sum, h, j) => sum + h * Math.sin((i + 1) * (j + 1) * (k + 1)), 0);
      }
      // Softmax
      const maxRaw = Math.max(...raw);
      const expSum = raw.reduce((sum, r) => sum + Math.exp(r - maxRaw), 0);
      for (let i = 0; i < p; i++) {
        dist[i] = Math.exp(raw[i] - maxRaw) / expSum;
      }
      return dist;
    });
  }, [hiddenValues, primes]);
  
  // Calculate expected residues
  const expectedResidues = useMemo(() => {
    return residues.map((dist, k) => {
      return dist.reduce((sum, p, i) => sum + i * p, 0);
    });
  }, [residues]);
  
  // CRT reconstruction (simplified)
  const reconstructed = useMemo(() => {
    // Using CRT formula: L = Σ E[r_k] * M_k * (M_k^{-1} mod p_k)
    let L = 0;
    for (let k = 0; k < primes.length; k++) {
      const Mk = product / primes[k];
      // Simplified inverse calculation for small primes
      const MkInv = Array.from({ length: primes[k] }, (_, i) => i).find(i => (Mk * i) % primes[k] === 1) || 1;
      L += expectedResidues[k] * Mk * MkInv;
    }
    return L % product;
  }, [expectedResidues, primes, product]);
  
  const randomize = () => {
    setHiddenValues(Array.from({ length: 8 }, () => Math.random()));
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Coprime Moduli</h4>
            <div className="flex gap-2 font-mono">
              {primes.map((p, i) => (
                <div key={i} className="px-3 py-2 bg-primary/20 rounded text-center">
                  <div className="text-lg">p{i+1} = {p}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Product P = {primes.join(' × ')} = {product}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Hidden Vector h</h4>
              <button
                onClick={randomize}
                className="px-3 py-1 text-xs rounded bg-secondary hover:bg-secondary/80"
              >
                Randomize
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {hiddenValues.map((v, i) => (
                <div key={i} className="text-center">
                  <div 
                    className="h-16 bg-primary/20 rounded relative overflow-hidden"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      const newVals = [...hiddenValues];
                      newVals[i] = Math.random();
                      setHiddenValues(newVals);
                    }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary transition-all"
                      style={{ height: `${v * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">h{i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Residue Distributions r_k</h4>
            {residues.map((dist, k) => (
              <div key={k} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">mod {primes[k]}:</span>
                  <span className="text-xs text-primary">E[r_{k}] = {expectedResidues[k].toFixed(3)}</span>
                </div>
                <div className="flex gap-1">
                  {dist.map((p, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary rounded text-center text-[10px] text-white"
                      style={{ height: '20px', opacity: Math.max(0.2, p) }}
                    >
                      {p > 0.15 ? p.toFixed(2) : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
            <h4 className="text-sm font-medium mb-2">CRT Reconstruction</h4>
            <div className="font-mono">
              <div className="text-sm text-muted-foreground">L̂ = Σ E[r_k] · M_k · M_k⁻¹ mod P</div>
              <div className="text-2xl text-green-400 mt-2">{reconstructed.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Mathematical Foundation</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
          <div>
            <span className="text-muted-foreground">Encoding:</span> r_k = softmax(W_k·h + b_k) ∈ Δ(ℤ/p_k)
          </div>
          <div>
            <span className="text-muted-foreground">Reconstruction:</span> L̂ = CRT(E[r_1], ..., E[r_K])
          </div>
        </div>
      </div>
    </div>
  );
};

const BirkhoffAttentionExample = () => {
  const [matrix, setMatrix] = useState([
    [0.8, 0.2, 0.1],
    [0.3, 0.9, 0.2],
    [0.1, 0.3, 0.8]
  ]);
  const [iterations, setIterations] = useState(10);
  
  // Sinkhorn-Knopp projection
  const projected = useMemo(() => {
    const result = matrix.map(row => [...row]);
    
    for (let iter = 0; iter < iterations; iter++) {
      // Normalize rows
      for (let i = 0; i < result.length; i++) {
        const rowSum = result[i].reduce((a, b) => a + b, 0);
        if (rowSum > 0) {
          result[i] = result[i].map(v => v / rowSum);
        }
      }
      
      // Normalize columns
      for (let j = 0; j < result[0].length; j++) {
        const colSum = result.reduce((sum, row) => sum + row[j], 0);
        if (colSum > 0) {
          for (let i = 0; i < result.length; i++) {
            result[i][j] /= colSum;
          }
        }
      }
    }
    
    return result;
  }, [matrix, iterations]);
  
  // Verify doubly stochastic property
  const rowSums = projected.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = projected[0].map((_, j) => projected.reduce((sum, row) => sum + row[j], 0));
  
  const randomize = () => {
    setMatrix(Array.from({ length: 3 }, () => 
      Array.from({ length: 3 }, () => Math.random())
    ));
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium">Input Attention Matrix</h4>
              <button
                onClick={randomize}
                className="px-3 py-1 text-xs rounded bg-secondary hover:bg-secondary/80"
              >
                Randomize
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {matrix.map((row, i) => 
                row.map((val, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="aspect-square flex items-center justify-center text-sm font-mono rounded"
                    style={{
                      backgroundColor: `hsla(var(--primary), ${val * 0.8})`,
                      color: val > 0.5 ? 'white' : 'inherit'
                    }}
                  >
                    {val.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <label className="text-sm text-muted-foreground mb-2 block">
              Sinkhorn Iterations: {iterations}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
            <h4 className="text-sm font-medium mb-3">Birkhoff Projected (Doubly-Stochastic)</h4>
            <div className="grid grid-cols-3 gap-1">
              {projected.map((row, i) => 
                row.map((val, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="aspect-square flex items-center justify-center text-sm font-mono rounded"
                    style={{
                      backgroundColor: `hsla(142, 70%, 45%, ${val * 0.8})`,
                      color: val > 0.4 ? 'white' : 'inherit'
                    }}
                  >
                    {val.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Verification</h4>
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <div className="text-muted-foreground text-xs mb-1">Row Sums:</div>
                {rowSums.map((s, i) => (
                  <div key={i} className={s > 0.99 && s < 1.01 ? 'text-green-400' : 'text-orange-400'}>
                    Row {i+1}: {s.toFixed(4)}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">Column Sums:</div>
                {colSums.map((s, i) => (
                  <div key={i} className={s > 0.99 && s < 1.01 ? 'text-green-400' : 'text-orange-400'}>
                    Col {i+1}: {s.toFixed(4)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Birkhoff Polytope</h4>
        <p className="text-sm text-muted-foreground">
          The set of doubly-stochastic matrices where all row and column sums equal 1.
          Sinkhorn-Knopp alternates row and column normalization to project onto this space.
          This enforces "conservation of attention mass" in transformer architectures.
        </p>
      </div>
    </div>
  );
};

const HomologyLossExample = () => {
  const primes = DEFAULT_PRIMES;
  const product = primes.reduce((a, b) => a * b, 1);
  
  // Test cases for kernel detection
  const testCases = [
    { name: 'Consistent', residues: [0.5, 1.2, 2.8, 4.1], description: 'Low reconstruction error' },
    { name: 'Boundary', residues: [0.99, 0.01, 2.5, 3.99], description: 'Values near moduli boundaries' },
    { name: 'Small', residues: [0.1, 0.2, 0.3, 0.4], description: 'Small residue values' },
    { name: 'Inconsistent', residues: [1.5, 2.9, 0.1, 6.5], description: 'High reconstruction error' }
  ];
  
  // Calculate reconstruction error for each test case
  const results = testCases.map(tc => {
    // CRT reconstruction
    let L = 0;
    for (let k = 0; k < primes.length; k++) {
      const Mk = product / primes[k];
      const MkInv = Array.from({ length: primes[k] }, (_, i) => i).find(i => (Mk * i) % primes[k] === 1) || 1;
      L += tc.residues[k] * Mk * MkInv;
    }
    const reconstructed = L % product;
    
    // Calculate reconstruction error
    let error = 0;
    for (let k = 0; k < primes.length; k++) {
      const expectedResidue = reconstructed % primes[k];
      error += Math.pow(tc.residues[k] - expectedResidue, 2);
    }
    error = Math.sqrt(error);
    
    const inKernel = error > 0.5;
    
    return { ...tc, reconstructed, error, inKernel };
  });
  
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-3">Kernel Detection: Ker(ℛ) ≈ {'{ r | ε(r) > τ }'}</h4>
        <p className="text-sm text-muted-foreground mb-4">
          The kernel contains residue tuples with high reconstruction error - these represent
          semantic inconsistencies that persist under perturbation.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="p-2">Case</th>
                <th className="p-2">Residues</th>
                <th className="p-2">L̂</th>
                <th className="p-2">ε(r)</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="p-2">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.description}</div>
                  </td>
                  <td className="p-2 font-mono text-xs">
                    [{r.residues.map(v => v.toFixed(2)).join(', ')}]
                  </td>
                  <td className="p-2 font-mono">{r.reconstructed.toFixed(2)}</td>
                  <td className="p-2 font-mono">{r.error.toFixed(4)}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${r.inKernel ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {r.inKernel ? '∈ Kernel' : 'Valid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Homology Loss</h4>
          <div className="font-mono text-sm space-y-1">
            <div>ℒ_homology = Σ_{'{cycles ∈ Ker(ℛ)}'} f(cycle)</div>
            <div className="text-muted-foreground text-xs mt-2">
              Penalizes topological holes (cycles that don't bound)
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Betti Numbers</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-primary font-bold">β₀</span>
              <div className="text-muted-foreground text-xs">Connected components</div>
            </div>
            <div>
              <span className="text-primary font-bold">β₁</span>
              <div className="text-muted-foreground text-xs">1-dimensional holes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CRTResoFormerExample = () => {
  const [numHeads, setNumHeads] = useState(4);
  const [numLayers, setNumLayers] = useState(3);
  const [homologyWeight, setHomologyWeight] = useState(0.1);
  
  // Simulated processing visualization
  const sequence = ['the', 'quick', 'fox'];
  const headModuli = [2, 3, 5, 7].slice(0, numHeads);
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">CRT-ResoFormer Configuration</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Attention Heads (→ Coprime Moduli): {numHeads}
                </label>
                <input
                  type="range"
                  min="2"
                  max="4"
                  value={numHeads}
                  onChange={(e) => setNumHeads(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Moduli: [{headModuli.join(', ')}]
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Layers: {numLayers}
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={numLayers}
                  onChange={(e) => setNumLayers(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Homology Weight: {homologyWeight.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={homologyWeight}
                  onChange={(e) => setHomologyWeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Input Sequence</h4>
            <div className="flex gap-2">
              {sequence.map((token, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-primary/20 rounded font-mono"
                >
                  {token}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Architecture</h4>
            
            {/* Layer visualization */}
            <div className="space-y-2">
              {Array.from({ length: numLayers }, (_, l) => (
                <div key={l} className="p-3 bg-background rounded border border-border">
                  <div className="text-xs text-muted-foreground mb-2">Layer {l + 1}</div>
                  <div className="flex gap-2 flex-wrap">
                    {headModuli.map((m, h) => (
                      <div
                        key={h}
                        className="px-2 py-1 text-xs rounded"
                        style={{
                          backgroundColor: `hsla(${h * 60 + 180}, 70%, 50%, 0.2)`,
                          borderColor: `hsla(${h * 60 + 180}, 70%, 50%, 0.5)`,
                          borderWidth: '1px'
                        }}
                      >
                        Head mod {m}
                      </div>
                    ))}
                    <div className="px-2 py-1 text-xs bg-green-500/20 rounded">
                      CRT Fusion
                    </div>
                    <div className="px-2 py-1 text-xs bg-orange-500/20 rounded">
                      Homology λ={homologyWeight}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
            <h4 className="text-sm font-medium mb-2">Output</h4>
            <div className="text-sm font-mono space-y-1">
              <div>Total homology loss: <span className="text-green-400">0.023</span></div>
              <div>Holes detected: <span className="text-green-400">false</span></div>
              <div>Max Betti number: <span className="text-green-400">0</span></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Key Innovation</h4>
        <p className="text-sm text-muted-foreground">
          CRT-ResoFormer uses the Chinese Remainder Theorem to fuse attention heads computed 
          over different coprime moduli. The homology loss detects semantic inconsistencies 
          (holes in residue space) that indicate reconstruction failures, providing a 
          topological regularization signal.
        </p>
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  {
    id: 'residue-encoding',
    number: '1',
    title: 'Residue Encoding',
    subtitle: 'CRT representation',
    description: 'Encode hidden vectors into K residue distributions over coprime moduli, then reconstruct via Chinese Remainder Theorem.',
    concepts: ['Residue Distributions', 'Coprime Moduli', 'CRT Reconstruction', 'Kernel Detection'],
    code: `import { ResidueEncoder, CRTReconstructor, DEFAULT_PRIMES_SMALL } from '@aleph-ai/tinyaleph';

const primes = DEFAULT_PRIMES_SMALL;  // [2, 3, 5, 7]
const encoder = new ResidueEncoder(primes, 16);
const crt = new CRTReconstructor(primes);

// Encode hidden vector to residue distributions
const h = new Float64Array(16).fill(0.5);
const residues = encoder.encode(h);
const expected = encoder.expectedResidues(residues);

// CRT reconstruction
const L = crt.reconstruct(expected);
console.log('Reconstructed:', L);

// Detect kernel (inconsistencies)
const inKernel = crt.detectKernel(expected, 0.1);`,
    codeTitle: 'crt-homology/01-residue-encoding.js'
  },
  {
    id: 'birkhoff-attention',
    number: '2',
    title: 'Birkhoff Attention',
    subtitle: 'Doubly-stochastic projection',
    description: 'Project attention matrices onto the Birkhoff polytope using Sinkhorn-Knopp algorithm for conservation of attention mass.',
    concepts: ['Birkhoff Polytope', 'Sinkhorn-Knopp', 'Doubly-Stochastic', 'Attention Conservation'],
    code: `import { BirkhoffProjector } from '@aleph-ai/tinyaleph';

const birkhoff = new BirkhoffProjector(20);  // 20 iterations

const attention = [
  [0.8, 0.2, 0.1],
  [0.3, 0.9, 0.2],
  [0.1, 0.3, 0.8]
];

const projected = birkhoff.project(attention);

// Verify doubly-stochastic property
const rowSums = projected.map(row => row.reduce((a, b) => a + b, 0));
const colSums = projected[0].map((_, j) => 
  projected.reduce((sum, row) => sum + row[j], 0)
);
// All sums ≈ 1`,
    codeTitle: 'crt-homology/02-birkhoff-attention.js'
  },
  {
    id: 'homology-loss',
    number: '3',
    title: 'Homology Loss',
    subtitle: 'Topological regularization',
    description: 'Detect semantic inconsistencies as topological holes in residue space. Compute Betti numbers and homology-based loss.',
    concepts: ['Kernel Detection', 'Betti Numbers', 'Cycle Detection', 'Topological Holes'],
    code: `import { HomologyLoss, CRTReconstructor } from '@aleph-ai/tinyaleph';

const crt = new CRTReconstructor([2, 3, 5, 7]);
const homology = new HomologyLoss({ tau: 0.1 });

// Batch of residue tuples
const residues = [
  [0.5, 1.2, 2.8, 4.1],
  [0.99, 0.01, 2.5, 3.99]
];

// Compute homology loss
const result = homology.compute(residues, crt);
console.log('Loss:', result.loss);
console.log('Cycles:', result.cycles);

// Betti numbers
const betti = homology.computeBettiNumbers(residues, crt);
console.log('β₀:', betti.beta0);
console.log('β₁:', betti.beta1);`,
    codeTitle: 'crt-homology/03-homology-loss.js'
  },
  {
    id: 'crt-resoformer',
    number: '4',
    title: 'CRT-ResoFormer',
    subtitle: 'Enhanced transformer',
    description: 'Full CRT-enhanced ResoFormer with per-modulus attention heads, CRT fusion, and homology detection.',
    concepts: ['Multi-Head CRT', 'Homology Regularization', 'Prime-Indexed', 'Semantic Consistency'],
    code: `import { createCRTResoFormer, SparsePrimeState } from '@aleph-ai/tinyaleph';

const model = createCRTResoFormer({
  numLayers: 3,
  numHeads: 4,        // Maps to coprime moduli [2, 3, 5, 7]
  homologyWeight: 0.1
});

const sequence = [
  SparsePrimeState.fromHash('the'),
  SparsePrimeState.fromHash('quick'),
  SparsePrimeState.fromHash('fox')
];

const result = model.forward(sequence);
console.log('Homology loss:', result.totalLoss);
console.log('Has holes:', result.homologyReport.hasHoles);`,
    codeTitle: 'crt-homology/04-crt-resoformer.js'
  }
];

const exampleComponents: Record<string, React.FC> = {
  'residue-encoding': ResidueEncodingExample,
  'birkhoff-attention': BirkhoffAttentionExample,
  'homology-loss': HomologyLossExample,
  'crt-resoformer': CRTResoFormerExample
};

export default function CRTHomologyExamplesPage() {
  return (
    <ExamplePageWrapper
      category="CRT-Homology"
      title="CRT-Homology Framework"
      description="Chinese Remainder Theorem reconstruction with homology-based consistency detection for semantic computing."
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'Topology', path: '/topology' }}
      nextSection={{ title: 'Discrete', path: '/discrete' }}
    />
  );
}