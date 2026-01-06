import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowLeft, Activity, Gauge, TrendingDown } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

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

// Entropy & Information Theory
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
    
    // Normalize
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
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Shannon Entropy & Coherence
        </h3>

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

      <CodeBlock
        code={`import { shannonEntropy, coherence, mutualInformation, jointEntropy } from '@aleph-ai/tinyaleph';

const dist = [0.25, 0.25, 0.25, 0.25]; // Uniform

// Shannon entropy: H(X) = -Σ p(x) log₂ p(x)
console.log(shannonEntropy(dist)); // 2.0 bits (maximum)

// Coherence: 1 - H(X)/H_max
console.log(coherence(dist)); // 0.0 (minimum coherence)

// Joint entropy of two distributions
const distB = [0.5, 0.5];
console.log(jointEntropy(dist, distB));

// Mutual information I(X;Y)
console.log(mutualInformation(dist, distB, jointDist));`}
        language="javascript"
        title="entropy.js"
      />
    </div>
  );
};

// Lyapunov Stability
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
        // Logistic map r=3.9 (chaotic)
        x = 3.9 * x * (1 - x);
      } else {
        // Sinusoidal
        x = 0.5 + 0.4 * Math.sin(i * 0.3);
      }
      series.push(x);
    }
    setTimeSeries(series);

    // Estimate Lyapunov exponent
    const lyap = estimateLyapunov(series);
    const stability = classifyStability(lyap);

    setResult({ lyapunov: lyap, stability });
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          Lyapunov Stability Analysis
        </h3>

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

      <CodeBlock
        code={`import { estimateLyapunov, classifyStability, adaptiveCoupling } from '@aleph-ai/tinyaleph';

// Time series from your system
const timeSeries = [...]; // Array of measurements

// Estimate largest Lyapunov exponent
const lambda = estimateLyapunov(timeSeries);

// Classify: 'chaotic' (λ>0), 'stable' (λ<0), 'neutral' (λ≈0)
const stability = classifyStability(lambda);

// Adaptive coupling based on stability
const coupling = adaptiveCoupling(lambda, {
  minCoupling: 0.1,
  maxCoupling: 1.0,
  targetLyapunov: -0.1
});`}
        language="javascript"
        title="lyapunov.js"
      />
    </div>
  );
};

// Quantum-like State Collapse
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

    // Born measurement
    const measured = bornMeasurement(normalized);
    
    // Partial collapse (decoherence)
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
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary" />
          Quantum-like State Collapse
        </h3>

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

      <CodeBlock
        code={`import { 
  collapseProbability, 
  bornMeasurement, 
  partialCollapse,
  applyDecoherence
} from '@aleph-ai/tinyaleph';

// State vector amplitudes
const amplitudes = [0.5, 0.3, 0.15, 0.05];

// Collapse probability for index i: |α_i|²
const prob = collapseProbability(amplitudes, 0);

// Born measurement: randomly collapse according to |α|²
const measured = bornMeasurement(amplitudes);
console.log('Collapsed to:', measured);

// Partial collapse (soft measurement with decoherence)
const postState = partialCollapse(amplitudes, measured, 0.9);

// Apply environmental decoherence
const decohered = applyDecoherence(amplitudes, 0.1);`}
        language="javascript"
        title="collapse.js"
      />
    </div>
  );
};

const ScientificExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Examples
          </Link>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Scientific Computing</h1>
          <p className="text-muted-foreground">
            Information theory, dynamical systems, and quantum-inspired state collapse.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              Entropy & Information Theory
            </h2>
            <EntropyExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
              Lyapunov Stability
            </h2>
            <LyapunovExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">3</span>
              State Collapse & Measurement
            </h2>
            <CollapseExample />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ScientificExamplesPage;
