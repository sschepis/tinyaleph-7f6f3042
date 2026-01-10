
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import { useState, useMemo } from 'react';

// Simulated INT_SINE_TABLE (M=256)
const INT_SINE_TABLE = Array.from({ length: 256 }, (_, i) => 
  Math.round(127 * Math.sin(i * 2 * Math.PI / 256))
);

const IntegerSineTableExample = () => {
  const [frequency, setFrequency] = useState(17);
  const [steps, setSteps] = useState(16);
  
  // Simulate phase accumulator
  const simulation = useMemo(() => {
    const history: { t: number; phase: number; sine: number; normalized: number }[] = [];
    let phase = 0;
    
    for (let t = 0; t < steps; t++) {
      const idx = Math.floor(phase) & 0xFF;
      const sine = INT_SINE_TABLE[idx];
      history.push({ t, phase: idx, sine, normalized: sine / 127 });
      phase = (phase + frequency) % 256;
    }
    
    return history;
  }, [frequency, steps]);
  
  // Sample values for display
  const sampleIndices = [0, 32, 64, 96, 128, 160, 192, 224];
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Integer Sine Table (M=256)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="p-1">Index</th>
                    <th className="p-1">Phase (°)</th>
                    <th className="p-1">sin(phase)</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleIndices.map(i => (
                    <tr key={i} className="border-t border-border/50">
                      <td className="p-1">{i}</td>
                      <td className="p-1">{(i / 256 * 360).toFixed(1)}°</td>
                      <td className="p-1">{(INT_SINE_TABLE[i] / 127).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-2">
              Table Size: 256 entries | Range: [-127, 127]
            </div>
            <p className="text-xs text-muted-foreground">
              Pre-computed integer values eliminate floating-point drift
              and enable deterministic phase computation across nodes.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Phase Accumulator</h4>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Frequency (phase increment): {frequency}
                </label>
                <input
                  type="range"
                  min="1"
                  max="64"
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Steps: {steps}
                </label>
                <input
                  type="range"
                  min="4"
                  max="32"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Waveform visualization */}
            <svg width="100%" height="100" viewBox="0 0 300 100">
              <line x1="0" y1="50" x2="300" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="2" />
              <path
                d={simulation.map((s, i) => {
                  const x = (i / (steps - 1)) * 290 + 5;
                  const y = 50 - s.normalized * 40;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              {simulation.map((s, i) => (
                <circle
                  key={i}
                  cx={(i / (steps - 1)) * 290 + 5}
                  cy={50 - s.normalized * 40}
                  r="3"
                  fill="hsl(var(--primary))"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Histogram Coherence</h4>
        <div className="font-mono text-sm mb-2">
          C_bin(t) = max_k(b_k(t)) / |P|
        </div>
        <p className="text-sm text-muted-foreground">
          Measures how concentrated phases are in a single bin. High coherence indicates
          synchronization; low coherence indicates desynchronization.
        </p>
      </div>
    </div>
  );
};

const CodebookTunnelingExample = () => {
  const [inputPhase, setInputPhase] = useState(130);
  const [tunnelingForce, setTunnelingForce] = useState(0.5);
  
  // Generate 64-attractor codebook (evenly spaced)
  const codebook = useMemo(() => {
    return Array.from({ length: 64 }, (_, i) => ({
      index: i,
      phase: i * 4, // 0, 4, 8, ..., 252
      label: `0x${i.toString(16).padStart(2, '0').toUpperCase()}`
    }));
  }, []);
  
  // Find nearest attractor
  const nearest = useMemo(() => {
    let minDist = Infinity;
    let nearestIdx = 0;
    
    for (let i = 0; i < codebook.length; i++) {
      const dist = Math.min(
        Math.abs(inputPhase - codebook[i].phase),
        256 - Math.abs(inputPhase - codebook[i].phase)
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    
    return { ...codebook[nearestIdx], distance: minDist };
  }, [inputPhase, codebook]);
  
  // Calculate tunneled phase
  const tunneledPhase = useMemo(() => {
    const target = nearest.phase;
    const diff = target - inputPhase;
    const adjustedDiff = Math.abs(diff) > 128 
      ? (diff > 0 ? diff - 256 : diff + 256)
      : diff;
    return ((inputPhase + adjustedDiff * tunnelingForce) + 256) % 256;
  }, [inputPhase, nearest, tunnelingForce]);
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">64-Attractor SMF Codebook</h4>
            <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
              {codebook.map(c => (
                <div
                  key={c.index}
                  className={`p-1 text-center text-[10px] font-mono rounded ${
                    c.index === nearest.index ? 'bg-primary text-primary-foreground' : 'bg-background'
                  }`}
                  title={`Phase: ${c.phase}`}
                >
                  {c.label}
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              64 attractors evenly distributed across phase space (0-255)
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Tunneling Controls</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Input Phase: {inputPhase}
                </label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={inputPhase}
                  onChange={(e) => setInputPhase(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Tunneling Force: {tunnelingForce.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={tunnelingForce}
                  onChange={(e) => setTunnelingForce(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Phase Circle</h4>
            <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
              <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--border))" />
              
              {/* Attractor marks */}
              {codebook.map(c => {
                const angle = (c.phase / 256) * 2 * Math.PI - Math.PI / 2;
                const x = 100 + Math.cos(angle) * 80;
                const y = 100 + Math.sin(angle) * 80;
                return (
                  <circle
                    key={c.index}
                    cx={x}
                    cy={y}
                    r={c.index === nearest.index ? 4 : 2}
                    fill={c.index === nearest.index ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                    opacity={c.index === nearest.index ? 1 : 0.3}
                  />
                );
              })}
              
              {/* Input phase */}
              {(() => {
                const angle = (inputPhase / 256) * 2 * Math.PI - Math.PI / 2;
                const x = 100 + Math.cos(angle) * 60;
                const y = 100 + Math.sin(angle) * 60;
                return (
                  <circle cx={x} cy={y} r="8" fill="hsl(var(--accent))" />
                );
              })()}
              
              {/* Tunneled phase */}
              {(() => {
                const angle = (tunneledPhase / 256) * 2 * Math.PI - Math.PI / 2;
                const x = 100 + Math.cos(angle) * 70;
                const y = 100 + Math.sin(angle) * 70;
                return (
                  <circle cx={x} cy={y} r="6" fill="hsl(142, 70%, 45%)" />
                );
              })()}
            </svg>
            
            <div className="flex justify-center gap-4 text-xs mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span>Input</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142, 70%, 45%)' }} />
                <span>Tunneled</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Attractor</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
            <h4 className="text-sm font-medium mb-2">Tunneling Result</h4>
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <div className="text-muted-foreground text-xs">Nearest Attractor</div>
                <div className="text-lg">{nearest.label} (φ={nearest.phase})</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Distance</div>
                <div className="text-lg">{nearest.distance}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Input Phase</div>
                <div className="text-lg">{inputPhase}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Tunneled Phase</div>
                <div className="text-lg text-green-400">{tunneledPhase.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CanonicalFusionExample = () => {
  const [targetSum, setTargetSum] = useState(19);
  
  // Generate primes up to 100
  const primes = useMemo(() => {
    const sieve = new Array(101).fill(true);
    sieve[0] = sieve[1] = false;
    for (let i = 2; i * i <= 100; i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= 100; j += i) sieve[j] = false;
      }
    }
    return sieve.map((isPrime, i) => isPrime ? i : -1).filter(p => p > 0);
  }, []);
  
  // Check if a number is prime
  const isPrime = (n: number) => primes.includes(n);
  
  // Find canonical triad for target sum
  const canonicalTriad = useMemo(() => {
    if (targetSum < 6) return null;
    if (!isPrime(targetSum)) return { valid: false, reason: 'Target sum is not prime' };
    
    // Find lexicographically first triad (p, q, r) where p ≤ q ≤ r and p + q + r = target
    for (const p of primes) {
      if (p > targetSum - 4) break;
      for (const q of primes) {
        if (q < p) continue;
        const r = targetSum - p - q;
        if (r < q) continue;
        if (isPrime(r)) {
          return { valid: true, triad: [p, q, r], sum: targetSum };
        }
      }
    }
    return { valid: false, reason: 'No valid triad found' };
  }, [targetSum, primes, isPrime]);
  
  // Find all valid triads for comparison
  const allTriads = useMemo(() => {
    if (targetSum < 6 || !isPrime(targetSum)) return [];
    
    const results: number[][] = [];
    for (const p of primes) {
      if (p > targetSum - 4) break;
      for (const q of primes) {
        if (q < p) continue;
        const r = targetSum - p - q;
        if (r < q) continue;
        if (isPrime(r)) {
          results.push([p, q, r]);
        }
      }
    }
    return results;
  }, [targetSum, primes, isPrime]);
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Canonical FUSE(p, q, r) Selection</h4>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Target Sum (should be prime): {targetSum}
              </label>
              <input
                type="range"
                min="6"
                max="50"
                value={targetSum}
                onChange={(e) => setTargetSum(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${isPrime(targetSum) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isPrime(targetSum) ? 'Prime ✓' : 'Not Prime ✗'}
              </span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Canonical Selection Rule</h4>
            <p className="text-sm text-muted-foreground">
              Given a target prime sum S, the canonical triad (p, q, r) is the lexicographically 
              first triplet of primes where p ≤ q ≤ r and p + q + r = S.
            </p>
            <div className="font-mono text-xs mt-2 text-muted-foreground">
              Ensures deterministic, unique triad selection
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {canonicalTriad && canonicalTriad.valid ? (
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
              <h4 className="text-sm font-medium mb-3">Canonical Triad</h4>
              <div className="flex gap-4 items-center justify-center">
                {canonicalTriad.triad?.map((p, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-mono text-green-400">{p}</div>
                    <div className="text-xs text-muted-foreground">
                      {i === 0 ? 'p' : i === 1 ? 'q' : 'r'}
                    </div>
                  </div>
                ))}
                <div className="text-2xl text-muted-foreground">=</div>
                <div className="text-3xl font-mono text-primary">{targetSum}</div>
              </div>
              <div className="text-center text-sm text-muted-foreground mt-3">
                FUSE({canonicalTriad.triad?.join(', ')}) → {targetSum}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-orange-500/20 border border-orange-500/50">
              <h4 className="text-sm font-medium mb-2">No Valid Triad</h4>
              <p className="text-sm text-muted-foreground">
                {canonicalTriad?.reason || 'Target must be a prime number ≥ 6'}
              </p>
            </div>
          )}
          
          {allTriads.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">All Valid Triads</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {allTriads.map((triad, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center p-2 rounded font-mono text-sm ${i === 0 ? 'bg-green-500/20 text-green-400' : 'bg-background'}`}
                  >
                    <span>({triad.join(', ')})</span>
                    <span>{i === 0 ? '← CANONICAL' : ''}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {allTriads.length} valid triad(s) found
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TickGateExample = () => {
  const [tick, setTick] = useState(0);
  const [threshold, setThreshold] = useState(0.7);
  const [coherence, setCoherence] = useState(0.8);
  
  // Multiple tick gates with different prime periods
  const gates = [
    { name: 'Gate A', period: 2, phase: 0 },
    { name: 'Gate B', period: 3, phase: 0 },
    { name: 'Gate C', period: 5, phase: 1 },
    { name: 'Gate D', period: 7, phase: 2 }
  ];
  
  // Evaluate gates
  const gateResults = gates.map(gate => {
    const tickOpen = (tick - gate.phase) % gate.period === 0;
    const coherenceValid = coherence >= threshold;
    const passed = tickOpen && coherenceValid;
    
    return {
      ...gate,
      tickOpen,
      coherenceValid,
      passed,
      reason: !tickOpen ? 'TICK_CLOSED' : !coherenceValid ? 'LOW_COHERENCE' : 'TICK_VALID'
    };
  });
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Tick-Based Gating Controls</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Current Tick: {tick}
                </label>
                <input
                  type="range"
                  min="0"
                  max="42"
                  value={tick}
                  onChange={(e) => setTick(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Coherence Threshold: {threshold.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Current Coherence: {coherence.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={coherence}
                  onChange={(e) => setCoherence(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setTick(t => t + 1)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                Tick +1
              </button>
              <button
                onClick={() => setTick(0)}
                className="px-4 py-2 bg-secondary rounded"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Gate Logic</h4>
            <div className="font-mono text-sm space-y-1">
              <div>passed = tickOpen AND coherenceValid</div>
              <div className="text-muted-foreground text-xs">tickOpen = (tick - phase) mod period == 0</div>
              <div className="text-muted-foreground text-xs">coherenceValid = coherence ≥ threshold</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Prime-Period Gates</h4>
            
            <div className="space-y-2">
              {gateResults.map((gate, i) => (
                <div
                  key={i}
                  className={`p-3 rounded border ${
                    gate.passed
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-muted border-border'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{gate.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Period: {gate.period} | Phase: {gate.phase}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-mono ${gate.passed ? 'text-green-400' : 'text-muted-foreground'}`}>
                        {gate.passed ? 'OPEN' : 'CLOSED'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {gate.reason}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Next Open Ticks</h4>
            <div className="grid grid-cols-4 gap-2 text-sm">
              {gates.map((gate, i) => {
                const nextOpen = (() => {
                  for (let t = tick + 1; t < tick + 50; t++) {
                    if ((t - gate.phase) % gate.period === 0) return t;
                  }
                  return '...';
                })();
                return (
                  <div key={i} className="text-center">
                    <div className="text-xs text-muted-foreground">{gate.name}</div>
                    <div className="font-mono">{nextOpen}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  {
    id: 'integer-sine',
    number: '1',
    title: 'Integer Sine Tables',
    subtitle: 'Discrete phase dynamics',
    description: 'Pre-computed M=256 sine table for deterministic phase computation. Eliminates floating-point drift for reproducible dynamics.',
    concepts: ['Phase Accumulator', 'Histogram Coherence', 'Deterministic Dynamics', 'Lookup Tables'],
    code: `import { INT_SINE_TABLE, computeHistogramCoherence } from '@aleph-ai/tinyaleph';

// Lookup sine value (range -127 to 127)
const idx = 64;  // 90 degrees
console.log(INT_SINE_TABLE[idx]);  // 127 (max)

// Simulate phase accumulator
let phase = 0;
const frequency = 17;  // Prime frequency

for (let t = 0; t < 16; t++) {
  const idx = Math.floor(phase) & 0xFF;
  const sine = INT_SINE_TABLE[idx];
  console.log(\`t=\${t}: phase=\${idx}, sine=\${sine / 127}\`);
  phase = (phase + frequency) % 256;
}

// Compute histogram coherence
const phases = [0.1, 0.12, 0.11, 0.09, 0.15];
const coherence = computeHistogramCoherence(phases);`,
    codeTitle: 'discrete/01-integer-sine-table.js'
  },
  {
    id: 'codebook-tunneling',
    number: '2',
    title: 'Codebook Tunneling',
    subtitle: '64-attractor transitions',
    description: 'SMF codebook with 64 attractors for controlled state transitions. Enables discrete tunneling between semantic states.',
    concepts: ['64 Attractors', 'Nearest Attractor', 'Tunneling Force', 'State Transitions'],
    code: `import { SMF_CODEBOOK, nearestCodebookAttractor, codebookTunnel } from '@aleph-ai/tinyaleph';

// 64-attractor codebook
console.log(SMF_CODEBOOK.length);  // 64
console.log(SMF_CODEBOOK[0]);  // { index: 0, phase: 0, label: '0x00' }

// Find nearest attractor
const phase = 130;
const nearest = nearestCodebookAttractor(phase);
console.log(nearest.index, nearest.distance);

// Controlled tunneling
const result = codebookTunnel(phase, { force: 0.5 });
console.log(result.target, result.result);`,
    codeTitle: 'discrete/02-codebook-tunneling.js'
  },
  {
    id: 'canonical-fusion',
    number: '3',
    title: 'Canonical Fusion',
    subtitle: 'Deterministic triad selection',
    description: 'FUSE(p, q, r) with canonical triad selection. Ensures deterministic, unique triad for any prime target sum.',
    concepts: ['Prime Triads', 'Lexicographic Order', 'Canonical Selection', 'Goldbach Conjecture'],
    code: `import { canonicalTriad, canonicalFusion, verifyCanonical } from '@aleph-ai/tinyaleph';

// Find canonical triad for target prime
const triad = canonicalTriad(19);
console.log(triad);  // [3, 5, 11]

// Verify canonical property
console.log(verifyCanonical(3, 5, 11, 19));  // true

// Fuse with automatic triad selection
const result = canonicalFusion(19);
console.log(result.triad);  // [3, 5, 11]
console.log(result.sum);    // 19`,
    codeTitle: 'discrete/03-canonical-fusion.js'
  },
  {
    id: 'tick-gate',
    number: '4',
    title: 'Tick Gates',
    subtitle: 'Discrete-time gating',
    description: 'Tick-based discrete HQE gating with prime periods. Enables coordinated multi-gate operations and sequential pipelines.',
    concepts: ['Prime Periods', 'Phase Offset', 'Coherence Gating', 'Tick Isolation'],
    code: `import { TickGate } from '@aleph-ai/tinyaleph';

const gate = new TickGate({ threshold: 0.7 });

// Evaluate gate at each tick
for (let tick = 0; tick < 8; tick++) {
  const result = gate.evaluate({
    coherence: 0.8,
    tickValid: tick % 2 === 0
  });
  console.log(\`Tick \${tick}: \${result.passed ? 'OPEN' : 'CLOSED'}\`);
}

// Multi-gate coordination with prime periods
const gates = [
  new TickGate({ period: 2, phase: 0 }),
  new TickGate({ period: 3, phase: 0 }),
  new TickGate({ period: 5, phase: 1 })
];`,
    codeTitle: 'discrete/04-tick-gate.js'
  }
];

const exampleComponents: Record<string, React.FC> = {
  'integer-sine': IntegerSineTableExample,
  'codebook-tunneling': CodebookTunnelingExample,
  'canonical-fusion': CanonicalFusionExample,
  'tick-gate': TickGateExample
};

export default function DiscreteExamplesPage() {
  return (
    <ExamplePageWrapper
      category="Discrete"
      title="Discrete Dynamics"
      description="Integer-domain computation with sine tables, codebook tunneling, canonical fusion, and tick-based gating."
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'CRT-Homology', path: '/crt-homology' }}
      nextSection={{ title: 'Observer', path: '/observer' }}
    />
  );
}