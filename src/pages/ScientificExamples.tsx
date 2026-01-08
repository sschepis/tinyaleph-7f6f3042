import { useState, useCallback, useMemo } from 'react';
import { Play, Activity, Gauge, TrendingDown, Atom, Network, Target, Zap, Dice6, Waves } from 'lucide-react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';

// Local implementations for demo
const shannonEntropy = (probs: number[]) => -probs.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
const coherence = (probs: number[]) => 1 - shannonEntropy(probs) / Math.log2(probs.length);

const estimateLyapunov = (series: number[]) => {
  let sum = 0, count = 0;
  for (let i = 1; i < series.length; i++) {
    const diff = Math.abs(series[i] - series[i-1]);
    if (diff > 1e-10) { sum += Math.log(diff); count++; }
  }
  return count > 0 ? sum / count : 0;
};

const classifyStability = (lyap: number) => lyap > 0.01 ? 'chaotic' : lyap < -0.1 ? 'stable' : 'neutral';

const bornMeasurement = (probs: number[]) => {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (r < cumulative) return i;
  }
  return probs.length - 1;
};

const partialCollapse = (amps: number[], idx: number, strength: number) => {
  return amps.map((a, i) => i === idx ? a : a * (1 - strength));
};

const EntropyExample = () => {
  const [distribution, setDistribution] = useState('0.25,0.25,0.25,0.25');
  const [result, setResult] = useState<{
    shannon: number;
    coh: number;
    maxEntropy: number;
  } | null>(null);

  const runCompute = useCallback(() => {
    const probs = distribution.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p) && p > 0);
    if (probs.length === 0) return;
    
    const sum = probs.reduce((a, b) => a + b, 0);
    const normalized = probs.map(p => p / sum);
    
    const shannon = shannonEntropy(normalized);
    const coh = coherence(normalized);
    const maxEntropy = Math.log2(normalized.length);

    setResult({ shannon, coh, maxEntropy });
  }, [distribution]);

  const presets = [
    { name: 'Uniform', value: '0.25,0.25,0.25,0.25' },
    { name: 'Sharp', value: '0.9,0.05,0.03,0.02' },
    { name: 'Binary', value: '0.5,0.5' },
    { name: 'Biased', value: '0.7,0.2,0.1' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Shannon Entropy & Coherence</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Probability Distribution</label>
            <input
              type="text"
              value={distribution}
              onChange={(e) => setDistribution(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono"
              placeholder="0.25,0.25,0.25,0.25"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map(preset => (
              <button
                key={preset.name}
                onClick={() => setDistribution(preset.value)}
                className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <button
            onClick={runCompute}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Compute
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Shannon Entropy</p>
                <p className="font-mono text-2xl text-primary">{result.shannon.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">bits</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Coherence</p>
                <p className="font-mono text-2xl text-primary">{result.coh.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">1 - H/H_max</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Entropy</span>
                <span className="text-sm text-muted-foreground">Max: {result.maxEntropy.toFixed(2)} bits</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(result.shannon / result.maxEntropy) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LyapunovExample = () => {
  const [timeSeries, setTimeSeries] = useState<number[]>([]);
  const [result, setResult] = useState<{
    lyapunov: number;
    stability: string;
  } | null>(null);

  const generateTimeSeries = useCallback((type: 'stable' | 'chaotic' | 'periodic') => {
    const n = 200;
    const series: number[] = [];
    let x = 0.1;
    
    for (let i = 0; i < n; i++) {
      if (type === 'stable') {
        x = x * 0.95 + Math.random() * 0.01;
      } else if (type === 'chaotic') {
        x = 3.9 * x * (1 - x);
      } else {
        x = 0.5 + 0.4 * Math.sin(i * 0.3);
      }
      series.push(x);
    }
    setTimeSeries(series);

    const lyap = estimateLyapunov(series);
    const stability = classifyStability(lyap);

    setResult({ lyapunov: lyap, stability });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Gauge className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Lyapunov Stability Analysis</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate different types of time series and analyze their stability using Lyapunov exponents.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => generateTimeSeries('stable')}
              className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
            >
              Stable System
            </button>
            <button
              onClick={() => generateTimeSeries('chaotic')}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            >
              Chaotic System
            </button>
            <button
              onClick={() => generateTimeSeries('periodic')}
              className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
            >
              Periodic System
            </button>
          </div>

          {timeSeries.length > 0 && (
            <div className="h-32 flex items-end gap-px">
              {timeSeries.slice(-100).map((v, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/60 rounded-t"
                  style={{ height: `${v * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Lyapunov Exponent (λ)</p>
              <p className={`font-mono text-3xl ${result.lyapunov > 0 ? 'text-red-400' : result.lyapunov < -0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
                {result.lyapunov.toFixed(4)}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              result.stability === 'chaotic' ? 'bg-red-500/20 border-red-500/50' :
              result.stability === 'stable' ? 'bg-green-500/20 border-green-500/50' :
              'bg-yellow-500/20 border-yellow-500/50'
            } border`}>
              <p className="font-semibold capitalize">{result.stability}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.stability === 'chaotic' && 'λ > 0: Exponential divergence of trajectories'}
                {result.stability === 'stable' && 'λ < 0: Trajectories converge to attractor'}
                {result.stability === 'neutral' && 'λ ≈ 0: Marginal stability (edge of chaos)'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CollapseExample = () => {
  const [amplitudes, setAmplitudes] = useState([0.5, 0.3, 0.15, 0.05]);
  const [collapseResult, setCollapseResult] = useState<{
    probabilities: number[];
    measured: number;
    postState: number[];
  } | null>(null);

  const runMeasurement = useCallback(() => {
    const probs = amplitudes.map(a => a * a);
    const sum = probs.reduce((s, p) => s + p, 0);
    const normalized = probs.map(p => p / sum);

    const measured = bornMeasurement(normalized);
    const postState = partialCollapse(amplitudes, measured, 0.9);

    setCollapseResult({
      probabilities: normalized,
      measured,
      postState
    });
  }, [amplitudes]);

  const randomizeAmplitudes = useCallback(() => {
    const newAmps = Array.from({ length: 4 }, () => Math.random());
    const norm = Math.sqrt(newAmps.reduce((s, a) => s + a * a, 0));
    setAmplitudes(newAmps.map(a => a / norm));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <TrendingDown className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quantum-like State Collapse</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Amplitudes (|ψ⟩)</label>
            <div className="flex gap-2 flex-wrap">
              {amplitudes.map((a, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">|{i}⟩:</span>
                  <input
                    type="number"
                    step={0.1}
                    value={a.toFixed(2)}
                    onChange={(e) => {
                      const newAmps = [...amplitudes];
                      newAmps[i] = parseFloat(e.target.value) || 0;
                      setAmplitudes(newAmps);
                    }}
                    className="w-16 px-2 py-1 rounded bg-secondary border border-border text-foreground font-mono text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={runMeasurement}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Measure
            </button>
            <button
              onClick={randomizeAmplitudes}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              Randomize
            </button>
          </div>

          {collapseResult && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Probabilities (|α|²)</p>
              <div className="flex gap-2">
                {collapseResult.probabilities.map((p, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className="h-20 bg-muted/50 rounded relative overflow-hidden">
                      <div 
                        className={`absolute bottom-0 w-full rounded ${i === collapseResult.measured ? 'bg-primary' : 'bg-primary/40'}`}
                        style={{ height: `${p * 100}%` }}
                      />
                    </div>
                    <p className="text-xs font-mono mt-1">{(p * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {collapseResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="font-semibold mb-2">Measurement Result</p>
              <p className="font-mono text-3xl text-primary">|{collapseResult.measured}⟩</p>
              <p className="text-sm text-muted-foreground mt-2">
                Collapsed with probability {(collapseResult.probabilities[collapseResult.measured] * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Post-Measurement State (90% decoherence)</p>
              <div className="font-mono text-sm">
                {collapseResult.postState.map((a, i) => (
                  <span key={i} className={i === collapseResult.measured ? 'text-primary' : 'text-muted-foreground'}>
                    {a.toFixed(3)}|{i}⟩{i < collapseResult.postState.length - 1 ? ' + ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Single Qubit Example
const SingleQubitExample = () => {
  const [qubitState, setQubitState] = useState<{ alpha: number; beta: number }>({ alpha: 1, beta: 0 });
  const [measurements, setMeasurements] = useState<{ zeros: number; ones: number }>({ zeros: 0, ones: 0 });
  const [lastGate, setLastGate] = useState<string>('');

  const normalize = (a: number, b: number) => {
    const norm = Math.sqrt(a * a + b * b);
    return { alpha: a / norm, beta: b / norm };
  };

  const applyGate = useCallback((gate: string) => {
    setQubitState(prev => {
      const { alpha, beta } = prev;
      let newA = alpha, newB = beta;
      
      if (gate === 'H') {
        newA = (alpha + beta) / Math.sqrt(2);
        newB = (alpha - beta) / Math.sqrt(2);
      } else if (gate === 'X') {
        newA = beta;
        newB = alpha;
      } else if (gate === 'Z') {
        newA = alpha;
        newB = -beta;
      } else if (gate === 'Y') {
        newA = -beta;
        newB = alpha;
      }
      
      return normalize(newA, newB);
    });
    setLastGate(gate);
  }, []);

  const resetState = useCallback(() => {
    setQubitState({ alpha: 1, beta: 0 });
    setMeasurements({ zeros: 0, ones: 0 });
    setLastGate('');
  }, []);

  const measure = useCallback(() => {
    const prob0 = qubitState.alpha * qubitState.alpha;
    const isZero = Math.random() < prob0;
    
    setMeasurements(prev => ({
      zeros: prev.zeros + (isZero ? 1 : 0),
      ones: prev.ones + (isZero ? 0 : 1)
    }));
    
    // Collapse state
    setQubitState(isZero ? { alpha: 1, beta: 0 } : { alpha: 0, beta: 1 });
  }, [qubitState]);

  const prob0 = (qubitState.alpha * qubitState.alpha * 100).toFixed(1);
  const prob1 = (qubitState.beta * qubitState.beta * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Atom className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Single Qubit Gates</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apply quantum gates to a single qubit and observe state changes.
          </p>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => applyGate('H')} className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors font-mono">
              H (Hadamard)
            </button>
            <button onClick={() => applyGate('X')} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors font-mono">
              X (NOT)
            </button>
            <button onClick={() => applyGate('Z')} className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors font-mono">
              Z (Phase)
            </button>
            <button onClick={() => applyGate('Y')} className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors font-mono">
              Y (Pauli-Y)
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={measure} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Target className="w-4 h-4" /> Measure
            </button>
            <button onClick={resetState} className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              Reset to |0⟩
            </button>
          </div>

          {lastGate && (
            <p className="text-sm text-muted-foreground">Last gate: <span className="font-mono text-primary">{lastGate}</span></p>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Current State</p>
            <p className="font-mono text-lg">
              <span className="text-primary">{qubitState.alpha.toFixed(3)}</span>|0⟩ + <span className="text-primary">{qubitState.beta.toFixed(3)}</span>|1⟩
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
              <p className="text-sm text-muted-foreground">P(|0⟩)</p>
              <p className="font-mono text-2xl text-blue-400">{prob0}%</p>
              <div className="mt-2 h-2 bg-muted rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${prob0}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
              <p className="text-sm text-muted-foreground">P(|1⟩)</p>
              <p className="font-mono text-2xl text-orange-400">{prob1}%</p>
              <div className="mt-2 h-2 bg-muted rounded-full">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${prob1}%` }} />
              </div>
            </div>
          </div>

          {(measurements.zeros > 0 || measurements.ones > 0) && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm font-medium mb-2">Measurement History</p>
              <div className="flex gap-4">
                <span className="font-mono">|0⟩: {measurements.zeros}</span>
                <span className="font-mono">|1⟩: {measurements.ones}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Two-Qubit Example
const TwoQubitExample = () => {
  const [state, setState] = useState<number[]>([1, 0, 0, 0]); // |00⟩
  const [measurements, setMeasurements] = useState<Record<string, number>>({});

  const normalize = (arr: number[]) => {
    const norm = Math.sqrt(arr.reduce((s, a) => s + a * a, 0));
    return arr.map(a => a / norm);
  };

  const applyH = useCallback((qubit: 0 | 1) => {
    setState(prev => {
      const newState = [0, 0, 0, 0];
      for (let i = 0; i < 4; i++) {
        const bit = (i >> (1 - qubit)) & 1;
        const other = i ^ (1 << (1 - qubit));
        if (bit === 0) {
          newState[i] += prev[i] / Math.sqrt(2);
          newState[other] += prev[i] / Math.sqrt(2);
        } else {
          newState[i] += prev[i] / Math.sqrt(2);
          newState[other] -= prev[i] / Math.sqrt(2);
        }
      }
      return normalize(newState);
    });
  }, []);

  const applyCNOT = useCallback(() => {
    setState(prev => {
      // CNOT: control=q0, target=q1
      // |00⟩ -> |00⟩, |01⟩ -> |01⟩, |10⟩ -> |11⟩, |11⟩ -> |10⟩
      return [prev[0], prev[1], prev[3], prev[2]];
    });
  }, []);

  const createBellState = useCallback(() => {
    // Start fresh, H on q0, then CNOT
    const afterH = normalize([1 / Math.sqrt(2), 0, 1 / Math.sqrt(2), 0]);
    // CNOT: swap indices 2 and 3
    setState([afterH[0], afterH[1], afterH[3], afterH[2]]);
  }, []);

  const measure = useCallback(() => {
    const probs = state.map(a => a * a);
    const r = Math.random();
    let cumulative = 0;
    let result = 0;
    for (let i = 0; i < 4; i++) {
      cumulative += probs[i];
      if (r < cumulative) { result = i; break; }
    }
    const label = ['00', '01', '10', '11'][result];
    setMeasurements(prev => ({ ...prev, [label]: (prev[label] || 0) + 1 }));
    
    // Collapse
    const collapsed = [0, 0, 0, 0];
    collapsed[result] = 1;
    setState(collapsed);
  }, [state]);

  const reset = useCallback(() => {
    setState([1, 0, 0, 0]);
    setMeasurements({});
  }, []);

  const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
  const probs = state.map(a => a * a);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Network className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Two-Qubit Systems & Entanglement</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Explore two-qubit gates, CNOT, and create Bell states.
          </p>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => applyH(0)} className="px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors font-mono text-sm">
              H(q₀)
            </button>
            <button onClick={() => applyH(1)} className="px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors font-mono text-sm">
              H(q₁)
            </button>
            <button onClick={applyCNOT} className="px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors font-mono text-sm">
              CNOT
            </button>
            <button onClick={createBellState} className="px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors font-mono text-sm">
              Create |Φ+⟩
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={measure} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Target className="w-4 h-4" /> Measure
            </button>
            <button onClick={reset} className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">State Amplitudes</p>
            <div className="grid grid-cols-4 gap-2">
              {labels.map((label, i) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-mono text-sm text-primary">{state[i].toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm font-medium mb-2">Probabilities</p>
            <div className="space-y-2">
              {labels.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="font-mono text-xs w-8">{label}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${probs[i] * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs w-12 text-right">{(probs[i] * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {Object.keys(measurements).length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Measurement Results</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(measurements).map(([label, count]) => (
                  <span key={label} className="font-mono text-sm">|{label}⟩: {count}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Measurement Example
const MeasurementExample = () => {
  const [trials, setTrials] = useState(100);
  const [bias, setBias] = useState(0.5);
  const [results, setResults] = useState<{ histogram: Record<string, number>; total: number } | null>(null);

  const runMeasurements = useCallback(() => {
    const histogram: Record<string, number> = { '0': 0, '1': 0 };
    for (let i = 0; i < trials; i++) {
      const result = Math.random() < bias ? '0' : '1';
      histogram[result]++;
    }
    setResults({ histogram, total: trials });
  }, [trials, bias]);

  const presets = [
    { name: '|0⟩', bias: 1.0 },
    { name: '|1⟩', bias: 0.0 },
    { name: '|+⟩ (50/50)', bias: 0.5 },
    { name: 'Biased (70/30)', bias: 0.7 },
    { name: 'Biased (90/10)', bias: 0.9 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Dice6 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Repeated Measurements</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Run multiple measurements to observe statistical distributions.
          </p>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">P(|0⟩) = {(bias * 100).toFixed(0)}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={bias * 100}
              onChange={(e) => setBias(parseInt(e.target.value) / 100)}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button
                key={p.name}
                onClick={() => setBias(p.bias)}
                className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Number of trials</label>
            <select
              value={trials}
              onChange={(e) => setTrials(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            >
              <option value={10}>10</option>
              <option value={100}>100</option>
              <option value={1000}>1,000</option>
              <option value={10000}>10,000</option>
            </select>
          </div>

          <button
            onClick={runMeasurements}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Run Measurements
          </button>
        </div>

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                <p className="text-sm text-muted-foreground">|0⟩ outcomes</p>
                <p className="font-mono text-3xl text-blue-400">{results.histogram['0']}</p>
                <p className="text-sm text-muted-foreground">{((results.histogram['0'] / results.total) * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                <p className="text-sm text-muted-foreground">|1⟩ outcomes</p>
                <p className="font-mono text-3xl text-orange-400">{results.histogram['1']}</p>
                <p className="text-sm text-muted-foreground">{((results.histogram['1'] / results.total) * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Distribution</p>
              <div className="flex h-32 items-end gap-2">
                <div className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all"
                    style={{ height: `${(results.histogram['0'] / results.total) * 100}%` }}
                  />
                  <p className="text-xs font-mono mt-1">|0⟩</p>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-orange-500 rounded-t transition-all"
                    style={{ height: `${(results.histogram['1'] / results.total) * 100}%` }}
                  />
                  <p className="text-xs font-mono mt-1">|1⟩</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm">Expected: {(bias * 100).toFixed(0)}% |0⟩, {((1 - bias) * 100).toFixed(0)}% |1⟩</p>
              <p className="text-sm">Observed: {((results.histogram['0'] / results.total) * 100).toFixed(1)}% |0⟩, {((results.histogram['1'] / results.total) * 100).toFixed(1)}% |1⟩</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Quantum Algorithms Example
const AlgorithmsExample = () => {
  const [algorithm, setAlgorithm] = useState<'deutsch' | 'grover' | 'teleportation'>('deutsch');
  const [result, setResult] = useState<{ steps: string[]; conclusion: string } | null>(null);

  const runAlgorithm = useCallback(() => {
    if (algorithm === 'deutsch') {
      setResult({
        steps: [
          '1. Initialize |0⟩|1⟩',
          '2. Apply H to all qubits → |+⟩|-⟩',
          '3. Apply oracle Uꜰ',
          '4. Apply H to first qubit',
          '5. Measure first qubit',
        ],
        conclusion: 'Result: |0⟩ → f is CONSTANT, |1⟩ → f is BALANCED'
      });
    } else if (algorithm === 'grover') {
      setResult({
        steps: [
          '1. Initialize |0⟩⊗ⁿ',
          '2. Apply H⊗ⁿ (uniform superposition)',
          '3. Apply Oracle (mark target)',
          '4. Apply Diffusion operator',
          '5. Repeat √N times',
          '6. Measure all qubits',
        ],
        conclusion: 'Speedup: O(√N) vs O(N) classical search'
      });
    } else {
      setResult({
        steps: [
          '1. Create Bell pair between Alice & Bob',
          '2. Alice prepares state |ψ⟩ to teleport',
          '3. Alice performs Bell measurement',
          '4. Alice sends 2 classical bits to Bob',
          '5. Bob applies correction gates',
          '6. Bob now has |ψ⟩!',
        ],
        conclusion: 'State transferred without physical qubit travel'
      });
    }
  }, [algorithm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quantum Algorithms</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Explore famous quantum algorithms and their steps.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAlgorithm('deutsch')}
              className={`px-4 py-2 rounded-lg transition-colors ${algorithm === 'deutsch' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
            >
              Deutsch-Jozsa
            </button>
            <button
              onClick={() => setAlgorithm('grover')}
              className={`px-4 py-2 rounded-lg transition-colors ${algorithm === 'grover' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
            >
              Grover's Search
            </button>
            <button
              onClick={() => setAlgorithm('teleportation')}
              className={`px-4 py-2 rounded-lg transition-colors ${algorithm === 'teleportation' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
            >
              Teleportation
            </button>
          </div>

          <button
            onClick={runAlgorithm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Run Algorithm
          </button>

          <div className="p-4 rounded-lg bg-muted/50 text-sm">
            {algorithm === 'deutsch' && (
              <>
                <p className="font-medium mb-2">Deutsch-Jozsa</p>
                <p className="text-muted-foreground">Determines if a function is constant or balanced in a single query.</p>
              </>
            )}
            {algorithm === 'grover' && (
              <>
                <p className="font-medium mb-2">Grover's Search</p>
                <p className="text-muted-foreground">Searches an unsorted database with quadratic speedup.</p>
              </>
            )}
            {algorithm === 'teleportation' && (
              <>
                <p className="font-medium mb-2">Quantum Teleportation</p>
                <p className="text-muted-foreground">Transfers quantum state using entanglement and classical communication.</p>
              </>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="font-medium mb-3">Algorithm Steps</p>
              <div className="space-y-2">
                {result.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-mono">
                      {i + 1}
                    </div>
                    <p className="text-sm">{step.slice(3)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="font-medium text-green-400">{result.conclusion}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Random Number Generator Example
const RandomExample = () => {
  const [bits, setBits] = useState<number[]>([]);
  const [integers, setIntegers] = useState<number[]>([]);

  const generateBits = useCallback((count: number) => {
    const newBits: number[] = [];
    for (let i = 0; i < count; i++) {
      newBits.push(Math.random() < 0.5 ? 0 : 1);
    }
    setBits(newBits);
  }, []);

  const generateIntegers = useCallback((count: number, max: number) => {
    const newInts: number[] = [];
    for (let i = 0; i < count; i++) {
      newInts.push(Math.floor(Math.random() * (max + 1)));
    }
    setIntegers(newInts);
  }, []);

  const distribution = useMemo(() => {
    if (integers.length === 0) return [];
    const counts: Record<number, number> = {};
    integers.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
    const max = Math.max(...Object.values(counts));
    return Object.entries(counts).map(([n, count]) => ({ n: parseInt(n), count, pct: count / max }));
  }, [integers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Dice6 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quantum Random Numbers</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate random bits and integers using quantum measurement.
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium">Random Bits</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => generateBits(8)} className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm">8 bits</button>
              <button onClick={() => generateBits(16)} className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm">16 bits</button>
              <button onClick={() => generateBits(32)} className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm">32 bits</button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Random Integers (0-9)</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => generateIntegers(10, 9)} className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm">10 integers</button>
              <button onClick={() => generateIntegers(50, 9)} className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm">50 integers</button>
              <button onClick={() => generateIntegers(100, 9)} className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm">100 integers</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {bits.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Random Bits</p>
              <p className="font-mono text-lg break-all tracking-wide">{bits.join('')}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Ones: {bits.filter(b => b === 1).length} ({((bits.filter(b => b === 1).length / bits.length) * 100).toFixed(1)}%)
              </p>
            </div>
          )}

          {integers.length > 0 && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm font-medium mb-2">Random Integers</p>
              <p className="font-mono text-sm break-all">{integers.join(', ')}</p>
            </div>
          )}

          {distribution.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Distribution</p>
              <div className="flex items-end gap-1 h-20">
                {distribution.sort((a, b) => a.n - b.n).map(d => (
                  <div key={d.n} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${d.pct * 100}%`, minHeight: '4px' }}
                    />
                    <p className="text-xs font-mono mt-1">{d.n}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wavefunction Example
const WavefunctionExample = () => {
  const [dimension, setDimension] = useState(4);
  const [amplitudes, setAmplitudes] = useState<number[]>([1, 0, 0, 0]);
  const [evolving, setEvolving] = useState(false);

  const normalize = (arr: number[]) => {
    const norm = Math.sqrt(arr.reduce((s, a) => s + a * a, 0));
    return norm > 0 ? arr.map(a => a / norm) : arr;
  };

  const randomize = useCallback(() => {
    const newAmps = Array.from({ length: dimension }, () => Math.random() - 0.5);
    setAmplitudes(normalize(newAmps));
  }, [dimension]);

  const applyEvolution = useCallback(() => {
    setAmplitudes(prev => {
      // Simple rotation evolution
      const newAmps = prev.map((a, i) => {
        const phase = 0.3 * i;
        return a * Math.cos(phase) + (prev[(i + 1) % dimension] || 0) * Math.sin(phase);
      });
      return normalize(newAmps);
    });
  }, [dimension]);

  const probs = amplitudes.map(a => a * a);
  const entropy = -probs.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
  const norm = Math.sqrt(amplitudes.reduce((s, a) => s + a * a, 0));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Waves className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Wavefunction Properties</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Explore wavefunction properties: amplitudes, probabilities, and normalization.
          </p>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Dimension</label>
            <select
              value={dimension}
              onChange={(e) => {
                const d = parseInt(e.target.value);
                setDimension(d);
                const newAmps = Array.from({ length: d }, (_, i) => i === 0 ? 1 : 0);
                setAmplitudes(newAmps);
              }}
              className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            >
              <option value={2}>2 (1 qubit)</option>
              <option value={4}>4 (2 qubits)</option>
              <option value={8}>8 (3 qubits)</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={randomize} className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              Random State
            </button>
            <button onClick={applyEvolution} className="px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
              Evolve (Û)
            </button>
            <button 
              onClick={() => setAmplitudes(Array.from({ length: dimension }, (_, i) => i === 0 ? 1 : 0))}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Norm</p>
              <p className="font-mono text-lg text-primary">{norm.toFixed(4)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Entropy</p>
              <p className="font-mono text-lg text-primary">{entropy.toFixed(4)} bits</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Amplitudes</p>
            <div className="grid grid-cols-4 gap-2">
              {amplitudes.map((a, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-muted-foreground">|{i}⟩</p>
                  <p className="font-mono text-sm text-primary">{a.toFixed(3)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm font-medium mb-2">Probabilities |ψ|²</p>
            <div className="space-y-1">
              {probs.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-xs w-6">|{i}⟩</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${p * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs w-12 text-right">{(p * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  {
    id: 'single-qubit',
    number: '1',
    title: 'Single Qubit Operations',
    subtitle: 'Quantum gates on one qubit',
    description: 'Apply Pauli and Hadamard gates to a single qubit, observe state changes, and run measurements with probabilistic collapse.',
    concepts: ['Qubit States', 'Pauli Gates', 'Hadamard', 'Measurement'],
    code: `import { ScientificBackend } from '@aleph-ai/tinyaleph';

const backend = new ScientificBackend({ dimension: 2 });

// Create basis states
const ket0 = backend.encode('|0⟩');
const ket1 = backend.encode('|1⟩');

// Apply Hadamard gate - creates superposition
const h_state = backend.applyGate(ket0, 'H');
console.log('H|0⟩ = |+⟩');

// Apply Pauli-X gate - bit flip
const x_state = backend.applyGate(ket0, 'X');
console.log('X|0⟩ = |1⟩');

// Measure the state
const state = backend.primesToState(h_state);
const result = backend.measure(state);
console.log('Measurement result:', result);`,
    codeTitle: 'scientific/01-single-qubit.js',
  },
  {
    id: 'two-qubit',
    number: '2',
    title: 'Two-Qubit Systems',
    subtitle: 'Entanglement and CNOT',
    description: 'Explore two-qubit states, tensor products, CNOT gate, and create maximally entangled Bell states.',
    concepts: ['Tensor Products', 'CNOT Gate', 'Bell States', 'Entanglement'],
    code: `import { ScientificBackend } from '@aleph-ai/tinyaleph';

const backend = new ScientificBackend({ dimension: 4 });

// Two-qubit basis states
const ket00 = backend.encode('|00⟩');
const ket11 = backend.encode('|11⟩');

// Create Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
// 1. Apply H to first qubit
// 2. Apply CNOT

const bellState = backend.encode('|Phi+⟩');
console.log('Bell state created');

// Entangled pairs show perfect correlation
// Measuring one qubit determines the other`,
    codeTitle: 'scientific/02-two-qubit.js',
  },
  {
    id: 'measurement',
    number: '3',
    title: 'Quantum Measurement',
    subtitle: 'Statistics and collapse',
    description: 'Run repeated measurements to observe statistical distributions and verify Born rule probabilities.',
    concepts: ['Born Rule', 'Repeated Measurements', 'Statistics', 'Collapse'],
    code: `import { ScientificBackend } from '@aleph-ai/tinyaleph';

const backend = new ScientificBackend({ dimension: 4 });

// Create superposition state
const ket0 = backend.encode('|0⟩');
const superposition = backend.applyGate(ket0, 'H');

// Run many measurements
const results = { '0': 0, '1': 0 };
for (let i = 0; i < 1000; i++) {
  const state = backend.primesToState(superposition);
  const result = backend.measure(state);
  results[result]++;
}

console.log('|0⟩:', results['0'], '(~50%)');
console.log('|1⟩:', results['1'], '(~50%)');`,
    codeTitle: 'scientific/04-measurement.js',
  },
  {
    id: 'algorithms',
    number: '4',
    title: 'Quantum Algorithms',
    subtitle: 'Deutsch, Grover, Teleportation',
    description: 'Explore famous quantum algorithms: Deutsch-Jozsa for function properties, Grover for search, and quantum teleportation.',
    concepts: ['Deutsch-Jozsa', 'Grover Search', 'Teleportation', 'Quantum Advantage'],
    code: `// Deutsch-Jozsa: Determine if f is constant or balanced
// Classical: 2^(n-1)+1 queries | Quantum: 1 query

function deutschJozsa(oracle) {
  // 1. Initialize |0...0⟩|1⟩
  // 2. Apply H to all qubits
  // 3. Apply oracle Uₓ
  // 4. Apply H to input qubits
  // 5. Measure: |0...0⟩ = constant, else = balanced
  return oracle.type === 'constant' ? '000' : '001';
}

// Grover's Search: O(√N) vs O(N) classical
// Teleportation: Transfer state using entanglement`,
    codeTitle: 'scientific/05-algorithms.js',
  },
  {
    id: 'random',
    number: '5',
    title: 'Quantum Random Numbers',
    subtitle: 'True randomness from measurement',
    description: 'Generate truly random bits and integers using quantum measurement, not pseudo-random algorithms.',
    concepts: ['True Randomness', 'Random Bits', 'Random Integers', 'QRNG'],
    code: `import { ScientificBackend } from '@aleph-ai/tinyaleph';

const backend = new ScientificBackend({ dimension: 16 });

function quantumRandomBit() {
  // Create |+⟩ state (50/50 superposition)
  const superposition = backend.encode('|+⟩');
  const state = backend.primesToState(superposition);
  return backend.measure(state).outcome;
}

// Generate random bits
const bits = [];
for (let i = 0; i < 32; i++) {
  bits.push(quantumRandomBit());
}
console.log('Random bits:', bits.join(''));

// Generate random integer 0-9
function quantumRandomInt(max) {
  let value = 0;
  const bitsNeeded = Math.ceil(Math.log2(max + 1));
  for (let i = 0; i < bitsNeeded; i++) {
    value = (value << 1) | quantumRandomBit();
  }
  return value % (max + 1);
}`,
    codeTitle: 'scientific/06-random.js',
  },
  {
    id: 'wavefunction',
    number: '6',
    title: 'Wavefunction Properties',
    subtitle: 'Amplitudes and evolution',
    description: 'Explore wavefunction properties: normalization, probability amplitudes, and time evolution.',
    concepts: ['Wavefunction', 'Normalization', 'Probability Amplitudes', 'Time Evolution'],
    code: `import { ScientificBackend } from '@aleph-ai/tinyaleph';

const backend = new ScientificBackend({ dimension: 8 });

// Create ground state
const ket0 = backend.encode('|0⟩');
const state = backend.primesToState(ket0);

console.log('Ground state |0⟩:');
console.log('  Norm:', state.norm()); // Should be 1

// Compute probability amplitudes
function computeProbabilities(state) {
  return state.c.map(amplitude => amplitude * amplitude);
}

// Create superposition
const superposition = backend.applyGate(ket0, 'H');
const superState = backend.primesToState(superposition);

const probs = computeProbabilities(superState);
console.log('Superposition probabilities:', probs);`,
    codeTitle: 'scientific/07-wavefunction.js',
  },
  {
    id: 'entropy',
    number: '7',
    title: 'Entropy & Information',
    subtitle: 'Shannon entropy and coherence',
    description: 'Measure the information content of probability distributions using Shannon entropy. Coherence measures how "sharp" vs "spread out" a distribution is.',
    concepts: ['Shannon Entropy', 'Coherence', 'Information Theory'],
    code: `import { shannonEntropy, coherence } from '@aleph-ai/tinyaleph';

const dist = [0.25, 0.25, 0.25, 0.25]; // Uniform

// Shannon entropy: H(X) = -Σ p(x) log₂ p(x)
console.log(shannonEntropy(dist)); // 2.0 bits (maximum)

// Coherence: 1 - H(X)/H_max
console.log(coherence(dist)); // 0.0 (minimum coherence)`,
    codeTitle: 'scientific/01-entropy.js',
  },
  {
    id: 'lyapunov',
    number: '8',
    title: 'Lyapunov Stability',
    subtitle: 'Chaos detection',
    description: 'Analyze dynamical systems using Lyapunov exponents. Positive exponents indicate chaos, negative indicate stability.',
    concepts: ['Lyapunov Exponents', 'Chaos Theory', 'Dynamical Systems'],
    code: `import { estimateLyapunov, classifyStability } from '@aleph-ai/tinyaleph';

// Time series from your system
const timeSeries = [...]; // Array of measurements

// Estimate largest Lyapunov exponent
const lambda = estimateLyapunov(timeSeries);

// Classify: 'chaotic' (λ>0), 'stable' (λ<0), 'neutral' (λ≈0)
const stability = classifyStability(lambda);`,
    codeTitle: 'scientific/02-lyapunov.js',
  },
  {
    id: 'collapse',
    number: '9',
    title: 'State Collapse',
    subtitle: 'Quantum-like measurement',
    description: 'Simulate Born rule measurement and wavefunction collapse. States collapse probabilistically according to amplitude squares.',
    concepts: ['Born Rule', 'Wavefunction Collapse', 'Decoherence'],
    code: `import { bornMeasurement, partialCollapse } from '@aleph-ai/tinyaleph';

// State vector amplitudes
const amplitudes = [0.5, 0.3, 0.15, 0.05];

// Born measurement: randomly collapse according to |α|²
const measured = bornMeasurement(amplitudes);
console.log('Collapsed to:', measured);

// Partial collapse (soft measurement)
const postState = partialCollapse(amplitudes, measured, 0.9);`,
    codeTitle: 'scientific/03-collapse.js',
  },
];

const exampleComponents: Record<string, React.FC> = {
  'single-qubit': SingleQubitExample,
  'two-qubit': TwoQubitExample,
  'measurement': MeasurementExample,
  'algorithms': AlgorithmsExample,
  'random': RandomExample,
  'wavefunction': WavefunctionExample,
  'entropy': EntropyExample,
  'lyapunov': LyapunovExample,
  'collapse': CollapseExample,
};

const ScientificExamplesPage = () => {
  return (
    <ExamplePageWrapper
      category="Scientific"
      title="Scientific Computing"
      description="Quantum simulation, information theory, dynamical systems, and state evolution."
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'ML', path: '/ml' }}
      nextSection={{ title: 'Type System', path: '/type-system' }}
    />
  );
};

export default ScientificExamplesPage;
