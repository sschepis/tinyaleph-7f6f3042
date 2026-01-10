
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import { useState, useMemo, useRef, useEffect } from 'react';

// Simulated SMF Axes
const SMF_AXES = [
  { name: 'Attention', index: 0 },
  { name: 'Valence', index: 1 },
  { name: 'Arousal', index: 2 },
  { name: 'Novelty', index: 3 },
  { name: 'Relevance', index: 4 },
  { name: 'Certainty', index: 5 },
  { name: 'Agency', index: 6 },
  { name: 'Social', index: 7 },
  { name: 'Temporal', index: 8 },
  { name: 'Spatial', index: 9 },
  { name: 'Causal', index: 10 },
  { name: 'Abstract', index: 11 },
  { name: 'Embodied', index: 12 },
  { name: 'Self', index: 13 },
  { name: 'Other', index: 14 },
  { name: 'Meta', index: 15 }
];

const SedenionFieldExample = () => {
  const [smfState, setSmfState] = useState<number[]>(Array(16).fill(0.25));
  const [selectedAxis, setSelectedAxis] = useState<number | null>(null);
  
  // Calculate entropy
  const entropy = useMemo(() => {
    const norm = smfState.reduce((s, v) => s + v * v, 0);
    if (norm === 0) return 0;
    const normalized = smfState.map(v => (v * v) / norm);
    return -normalized.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
  }, [smfState]);
  
  // Calculate coherence (simplified)
  const coherence = useMemo(() => {
    const norm = Math.sqrt(smfState.reduce((s, v) => s + v * v, 0));
    return norm > 0 ? norm / 4 : 0; // Normalized to [0, 1] roughly
  }, [smfState]);
  
  const handleAxisChange = (index: number, value: number) => {
    const newState = [...smfState];
    newState[index] = value;
    setSmfState(newState);
  };
  
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'uniform':
        setSmfState(Array(16).fill(0.25));
        break;
      case 'focused':
        setSmfState([1, 0.5, 0.3, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        break;
      case 'emotional':
        setSmfState([0.2, 0.8, 0.9, 0.3, 0.4, 0.2, 0.1, 0.6, 0.2, 0.1, 0.1, 0.1, 0.5, 0.3, 0.4, 0.1]);
        break;
      case 'analytical':
        setSmfState([0.7, 0.1, 0.2, 0.4, 0.8, 0.9, 0.3, 0.1, 0.5, 0.6, 0.8, 0.9, 0.2, 0.2, 0.1, 0.7]);
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">16D Sedenion Memory Field</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => applyPreset('uniform')} className="px-2 py-1 text-xs bg-secondary rounded">Uniform</button>
              <button onClick={() => applyPreset('focused')} className="px-2 py-1 text-xs bg-secondary rounded">Focused</button>
              <button onClick={() => applyPreset('emotional')} className="px-2 py-1 text-xs bg-secondary rounded">Emotional</button>
              <button onClick={() => applyPreset('analytical')} className="px-2 py-1 text-xs bg-secondary rounded">Analytical</button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {SMF_AXES.map((axis, i) => (
                <div
                  key={i}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedAxis === i ? 'bg-primary/30 border border-primary' : 'bg-background'
                  }`}
                  onClick={() => setSelectedAxis(selectedAxis === i ? null : i)}
                >
                  <div className="text-[10px] text-muted-foreground">{axis.name}</div>
                  <div className="h-8 bg-muted rounded relative mt-1 overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary transition-all"
                      style={{ height: `${smfState[i] * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-center font-mono mt-1">{smfState[i].toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedAxis !== null && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">{SMF_AXES[selectedAxis].name} Axis</h4>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={smfState[selectedAxis]}
                onChange={(e) => handleAxisChange(selectedAxis, Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Field Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-background rounded">
                <div className="text-xs text-muted-foreground">Entropy</div>
                <div className="text-2xl font-mono text-primary">{entropy.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">bits</div>
              </div>
              <div className="p-3 bg-background rounded">
                <div className="text-xs text-muted-foreground">Coherence</div>
                <div className="text-2xl font-mono text-primary">{coherence.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">norm</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Radar View</h4>
            <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
              {/* Background circles */}
              {[0.25, 0.5, 0.75, 1].map(r => (
                <circle
                  key={r}
                  cx="100"
                  cy="100"
                  r={r * 80}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeDasharray="2"
                />
              ))}
              
              {/* Axis lines */}
              {SMF_AXES.slice(0, 8).map((_, i) => {
                const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
                return (
                  <line
                    key={i}
                    x1="100"
                    y1="100"
                    x2={100 + Math.cos(angle) * 80}
                    y2={100 + Math.sin(angle) * 80}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                  />
                );
              })}
              
              {/* Data polygon (first 8 dimensions) */}
              <polygon
                points={SMF_AXES.slice(0, 8).map((_, i) => {
                  const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
                  const r = Math.min(smfState[i], 1) * 80;
                  return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`;
                }).join(' ')}
                fill="hsla(var(--primary), 0.3)"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const PRSCLayerExample = () => {
  const [coupling, setCoupling] = useState(0.3);
  const [running, setRunning] = useState(false);
  const primes = [2, 3, 5, 7, 11, 13, 17, 19];
  
  const [oscillators, setOscillators] = useState(() =>
    primes.map(p => ({
      prime: p,
      phase: Math.random() * 2 * Math.PI,
      frequency: 1 / p,
      amplitude: 0.8
    }))
  );
  
  const [orderParameter, setOrderParameter] = useState(0);
  const [coherence, setCoherence] = useState(0);
  
  useEffect(() => {
    if (!running) return;
    
    const interval = setInterval(() => {
      setOscillators(prev => {
        const N = prev.length;
        return prev.map((osc, i) => {
          let couplingSum = 0;
          prev.forEach((other, j) => {
            if (i !== j) couplingSum += Math.sin(other.phase - osc.phase);
          });
          
          const newPhase = (osc.phase + osc.frequency * 0.1 + (coupling / N) * couplingSum * 0.1) % (2 * Math.PI);
          return { ...osc, phase: newPhase };
        });
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [running, coupling]);
  
  useEffect(() => {
    let sx = 0, sy = 0;
    oscillators.forEach(osc => {
      sx += Math.cos(osc.phase);
      sy += Math.sin(osc.phase);
    });
    const r = Math.sqrt(sx * sx + sy * sy) / oscillators.length;
    setOrderParameter(r);
    setCoherence(r);
  }, [oscillators]);
  
  const reset = () => {
    setOscillators(primes.map(p => ({
      prime: p,
      phase: Math.random() * 2 * Math.PI,
      frequency: 1 / p,
      amplitude: 0.8
    })));
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">PRSC Layer Controls</h4>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Coupling Strength: {coupling.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={coupling}
                onChange={(e) => setCoupling(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setRunning(!running)}
                className={`px-4 py-2 rounded ${running ? 'bg-accent' : 'bg-primary'} text-primary-foreground`}
              >
                {running ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-secondary rounded"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Oscillator Phases</h4>
            <div className="space-y-1">
              {oscillators.map((osc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono w-8">p={osc.prime}</span>
                  <div className="flex-1 h-4 bg-background rounded overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(osc.phase / (2 * Math.PI)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-12">{osc.phase.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Phase Circle</h4>
            <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
              <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--border))" />
              <circle 
                cx="100" 
                cy="100" 
                r={orderParameter * 80}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                opacity="0.3"
              />
              
              {oscillators.map((osc, i) => {
                const x = 100 + Math.cos(osc.phase) * 80;
                const y = 100 + Math.sin(osc.phase) * 80;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="8"
                    fill={`hsl(${(osc.prime * 30) % 360}, 70%, 50%)`}
                  />
                );
              })}
            </svg>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Order Parameter</div>
              <div className={`text-2xl font-mono ${orderParameter > 0.7 ? 'text-green-400' : orderParameter > 0.4 ? 'text-yellow-400' : 'text-orange-400'}`}>
                {orderParameter.toFixed(3)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Global Coherence</div>
              <div className="text-2xl font-mono text-primary">{coherence.toFixed(3)}</div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Sync Status</div>
            <div className={`text-lg font-medium ${orderParameter > 0.8 ? 'text-green-400' : orderParameter > 0.5 ? 'text-yellow-400' : 'text-orange-400'}`}>
              {orderParameter > 0.8 ? 'Synchronized' : orderParameter > 0.5 ? 'Partial Sync' : 'Desynchronized'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TemporalLayerExample = () => {
  const [moments, setMoments] = useState<{ tick: number; coherence: number; entropy: number; classification: string }[]>([]);
  const [tick, setTick] = useState(0);
  
  const addMoment = () => {
    const coherence = 0.3 + Math.random() * 0.6;
    const entropy = 1.5 + Math.random() * 2;
    
    let classification = 'neutral';
    if (coherence > 0.7 && entropy < 2) classification = 'flow';
    else if (coherence < 0.4 && entropy > 3) classification = 'chaos';
    else if (coherence > 0.6) classification = 'focused';
    else if (entropy > 2.5) classification = 'exploratory';
    
    setMoments(prev => [...prev.slice(-19), { tick, coherence, entropy, classification }]);
    setTick(t => t + 1);
  };
  
  const clear = () => {
    setMoments([]);
    setTick(0);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Temporal Layer</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Records discrete moments with coherence and entropy measurements.
              Each moment is classified based on state characteristics.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={addMoment}
                className="px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                Add Moment
              </button>
              <button
                onClick={clear}
                className="px-4 py-2 bg-secondary rounded"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Moment Classifications</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Flow (high coh, low ent)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Focused (high coh)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Exploratory (high ent)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Chaos (low coh, high ent)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Moment History</h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {moments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No moments recorded yet
                </div>
              ) : (
                moments.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-sm flex justify-between items-center ${
                      m.classification === 'flow' ? 'bg-green-500/20' :
                      m.classification === 'focused' ? 'bg-blue-500/20' :
                      m.classification === 'exploratory' ? 'bg-yellow-500/20' :
                      m.classification === 'chaos' ? 'bg-red-500/20' : 'bg-background'
                    }`}
                  >
                    <span className="font-mono">t={m.tick}</span>
                    <span>coh: {m.coherence.toFixed(2)}</span>
                    <span>ent: {m.entropy.toFixed(2)}</span>
                    <span className="capitalize">{m.classification}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {moments.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Coherence Timeline</h4>
              <svg width="100%" height="60" viewBox="0 0 300 60">
                <line x1="0" y1="50" x2="300" y2="50" stroke="hsl(var(--border))" />
                <path
                  d={moments.map((m, i) => {
                    const x = (i / Math.max(moments.length - 1, 1)) * 290 + 5;
                    const y = 50 - m.coherence * 45;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FullObserverExample = () => {
  const [inputs] = useState([
    'The quick brown fox jumps over the lazy dog',
    'Love and wisdom guide the heart',
    'Stars shine bright in the night sky',
    'Knowledge is power and power is responsibility',
    'Time flows like a river to the sea'
  ]);
  
  const [processedCount, setProcessedCount] = useState(0);
  const [state, setState] = useState({
    tick: 0,
    coherence: 0.5,
    entropy: 2.0,
    orderParameter: 0.3,
    code: 'INIT'
  });
  
  const processNext = () => {
    if (processedCount >= inputs.length) return;
    
    // Simulate processing
    const newTick = processedCount + 1;
    const newCoherence = 0.4 + Math.random() * 0.4;
    const newEntropy = 1.5 + Math.random() * 1.5;
    const newOrder = 0.3 + Math.random() * 0.5;
    const codes = ['FOCUS', 'EXPLORE', 'SYNC', 'LEARN', 'FLOW'];
    
    setState({
      tick: newTick,
      coherence: newCoherence,
      entropy: newEntropy,
      orderParameter: newOrder,
      code: codes[processedCount % codes.length]
    });
    
    setProcessedCount(p => p + 1);
  };
  
  const reset = () => {
    setProcessedCount(0);
    setState({
      tick: 0,
      coherence: 0.5,
      entropy: 2.0,
      orderParameter: 0.3,
      code: 'INIT'
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Input Queue</h4>
            <div className="space-y-2">
              {inputs.map((input, i) => (
                <div
                  key={i}
                  className={`p-2 rounded text-sm ${
                    i < processedCount ? 'bg-green-500/20 text-green-400' :
                    i === processedCount ? 'bg-primary/20' : 'bg-background text-muted-foreground'
                  }`}
                >
                  {i < processedCount ? '✓ ' : i === processedCount ? '→ ' : '  '}
                  {input.slice(0, 40)}...
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={processNext}
                disabled={processedCount >= inputs.length}
                className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
              >
                Process Next
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-secondary rounded"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Observer Stack</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>1. SedenionMemoryField</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span>2. PRSCLayer</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span>3. TemporalLayer</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span>4. EntanglementLayer</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span>5. AgencyLayer</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span>6. BoundaryLayer</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span>7. SafetyLayer</span>
                <span className="text-green-400">✓</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Current State</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-background rounded">
                <div className="text-xs text-muted-foreground">Tick</div>
                <div className="text-2xl font-mono">{state.tick}</div>
              </div>
              <div className="p-3 bg-background rounded">
                <div className="text-xs text-muted-foreground">Code</div>
                <div className="text-2xl font-mono text-primary">{state.code}</div>
              </div>
              <div className="p-3 bg-background rounded">
                <div className="text-xs text-muted-foreground">Coherence</div>
                <div className="text-2xl font-mono">{state.coherence.toFixed(3)}</div>
              </div>
              <div className="p-3 bg-background rounded">
                <div className="text-xs text-muted-foreground">Entropy</div>
                <div className="text-2xl font-mono">{state.entropy.toFixed(3)}</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Order Parameter</h4>
            <div className="h-8 bg-background rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  state.orderParameter > 0.7 ? 'bg-green-500' :
                  state.orderParameter > 0.4 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
                style={{ width: `${state.orderParameter * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span>{state.orderParameter.toFixed(3)}</span>
              <span>1</span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
            <h4 className="text-sm font-medium mb-2">Safety Status</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="text-green-400">✓</div>
                <div className="text-xs text-muted-foreground">Entropy</div>
              </div>
              <div className="text-center">
                <div className="text-green-400">✓</div>
                <div className="text-xs text-muted-foreground">Coherence</div>
              </div>
              <div className="text-center">
                <div className="text-green-400">✓</div>
                <div className="text-xs text-muted-foreground">Sync</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  {
    id: 'sedenion-field',
    number: '1',
    title: 'Sedenion Memory Field',
    subtitle: '16D semantic orientation',
    description: 'SedenionMemoryField provides a 16-dimensional semantic state space with named axes for attention, valence, arousal, and more.',
    concepts: ['16D Hypercomplex', 'Named Axes', 'State Entropy', 'Field Coherence'],
    code: `import { SedenionMemoryField, SMF_AXES } from '@aleph-ai/tinyaleph';

// Create uniform field
const smf = SedenionMemoryField.uniform();

// Access named axes
console.log(SMF_AXES[0].name);  // 'Attention'
console.log(smf.s[0]);          // 0.25

// Calculate metrics
const state = smf.toJSON();
console.log('Entropy:', state.entropy);
console.log('Coherence:', state.coherenceCoeff);

// Find nearest codebook attractor
const nearest = smf.nearestCodebook();
console.log('Code:', nearest.attractor.name);`,
    codeTitle: 'observer/01-sedenion-field.js'
  },
  {
    id: 'prsc-layer',
    number: '2',
    title: 'PRSC Layer',
    subtitle: 'Prime resonance oscillators',
    description: 'PRSCLayer creates coupled prime-indexed oscillators for phase coherence tracking and synchronization.',
    concepts: ['Prime Oscillators', 'Kuramoto Coupling', 'Order Parameter', 'Phase Coherence'],
    code: `import { PRSCLayer } from '@aleph-ai/tinyaleph';

const prsc = new PRSCLayer([2, 3, 5, 7, 11, 13, 17, 19], {
  coupling: 0.3
});

// Tick the oscillators
prsc.tick(0.1);

// Get synchronization metrics
console.log('Order parameter:', prsc.orderParameter());
console.log('Global coherence:', prsc.globalCoherence());
console.log('Active primes:', prsc.activePrimes());

// Get individual phases
const phases = prsc.getPhases();`,
    codeTitle: 'observer/02-prsc-layer.js'
  },
  {
    id: 'temporal-layer',
    number: '3',
    title: 'Temporal Layer',
    subtitle: 'Moment classification',
    description: 'TemporalLayer tracks state history and classifies moments based on coherence, entropy, and other metrics.',
    concepts: ['Moment Recording', 'State Classification', 'History Tracking', 'Trend Detection'],
    code: `import { TemporalLayer, Moment } from '@aleph-ai/tinyaleph';

const temporal = new TemporalLayer({ maxHistory: 100 });

// Update with current state
temporal.update({
  coherence: 0.8,
  entropy: 1.5,
  phases: [0.1, 0.2, 0.3],
  activePrimes: [2, 3, 5]
});

// Get recent moments
const recent = temporal.recentMoments(10);

// Classify current moment
// 'flow', 'focused', 'exploratory', 'chaos', 'neutral'`,
    codeTitle: 'observer/03-temporal-layer.js'
  },
  {
    id: 'full-observer',
    number: '4',
    title: 'Full Observer Stack',
    subtitle: 'Integrated observer architecture',
    description: 'Complete observer combining SMF, PRSC, Temporal, Entanglement, Agency, Boundary, and Safety layers.',
    concepts: ['Layer Integration', 'Safety Constraints', 'Goal-Directed', 'Input Processing'],
    code: `import {
  SedenionMemoryField,
  PRSCLayer,
  TemporalLayer,
  EntanglementLayer,
  AgencyLayer,
  BoundaryLayer,
  SafetyLayer
} from '@aleph-ai/tinyaleph';

class Observer {
  constructor() {
    this.smf = SedenionMemoryField.uniform();
    this.prsc = new PRSCLayer([2, 3, 5, 7, 11], { coupling: 0.3 });
    this.temporal = new TemporalLayer({ maxHistory: 100 });
    this.entanglement = new EntanglementLayer();
    this.agency = new AgencyLayer();
    this.boundary = new BoundaryLayer();
    this.safety = new SafetyLayer();
  }
  
  process(input) {
    // Convert input to vector
    // Absorb into SMF
    // Tick oscillators
    // Check safety
    // Record moment
    return this.getState();
  }
}`,
    codeTitle: 'observer/04-full-observer.js'
  }
];

const exampleComponents: Record<string, React.FC> = {
  'sedenion-field': SedenionFieldExample,
  'prsc-layer': PRSCLayerExample,
  'temporal-layer': TemporalLayerExample,
  'full-observer': FullObserverExample
};

export default function ObserverExamplesPage() {
  return (
    <ExamplePageWrapper
      category="Observer"
      title="Observer Stack"
      description="Building autonomous observers with SedenionMemoryField, PRSCLayer, and the full observer architecture."
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'Discrete', path: '/discrete' }}
      nextSection={{ title: 'Scientific', path: '/scientific' }}
    />
  );
}