import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, ArrowLeft, Brain, Zap, GitBranch, Layers, Network, Pause, RotateCcw, 
  ChevronRight, ArrowDown, Sparkles, Activity, Target, Cpu
} from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

// ==================== Core Types & Utilities ====================

class Quaternion {
  constructor(public w: number, public x: number, public y: number, public z: number) {}
  
  magnitude(): number {
    return Math.sqrt(this.w ** 2 + this.x ** 2 + this.y ** 2 + this.z ** 2);
  }
  
  normalize(): Quaternion {
    const mag = this.magnitude();
    return new Quaternion(this.w / mag, this.x / mag, this.y / mag, this.z / mag);
  }
}

const hamiltonCompose = (q1: Quaternion, q2: Quaternion) => new Quaternion(
  q1.w*q2.w - q1.x*q2.x - q1.y*q2.y - q1.z*q2.z,
  q1.w*q2.x + q1.x*q2.w + q1.y*q2.z - q1.z*q2.y,
  q1.w*q2.y - q1.x*q2.z + q1.y*q2.w + q1.z*q2.x,
  q1.w*q2.z + q1.x*q2.y - q1.y*q2.x + q1.z*q2.w
);

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

const computeEntropy = (primes: number[]): number => {
  const freq: Record<number, number> = {};
  primes.forEach(p => freq[p] = (freq[p] || 0) + 1);
  const total = primes.length || 1;
  const probs = Object.values(freq).map(f => f / total);
  return -probs.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
};

const computeCoherence = (weights: number[]): number => {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0;
  const normalized = weights.map(w => w / sum);
  const entropy = -normalized.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
  return 1 - entropy / Math.log2(Math.max(normalized.length, 2));
};

// ==================== Architecture Visualization ====================

const ArchitectureDiagram = () => {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const stages = [
    { 
      id: 'input', 
      label: 'Input Tokens', 
      icon: Cpu,
      color: 'from-blue-500 to-cyan-500',
      description: 'Raw text tokens are fed into the model'
    },
    { 
      id: 'prime', 
      label: 'Prime Encoding', 
      icon: Zap,
      color: 'from-cyan-500 to-teal-500',
      description: 'Each character maps to a unique prime number, creating algebraic semantic signatures'
    },
    { 
      id: 'attention', 
      label: 'Resonant Attention', 
      icon: Brain,
      color: 'from-teal-500 to-emerald-500',
      description: 'Attention weights computed via prime signature overlap (Jaccard similarity)'
    },
    { 
      id: 'quaternion', 
      label: 'Quaternion Mix', 
      icon: GitBranch,
      color: 'from-emerald-500 to-green-500',
      description: 'Hamilton product rotates semantic states in 4D hypercomplex space'
    },
    { 
      id: 'coherence', 
      label: 'Coherence Gate', 
      icon: Target,
      color: 'from-green-500 to-lime-500',
      description: 'Measures state sharpness; if coherence > θ, halt early'
    },
    { 
      id: 'output', 
      label: 'Entropy Collapse', 
      icon: Sparkles,
      color: 'from-lime-500 to-yellow-500',
      description: 'Select token with minimum entropy (maximum certainty)'
    },
  ];

  const runAnimation = useCallback(() => {
    if (isAnimating) {
      setIsAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    setIsAnimating(true);
    let stage = 0;
    
    const animate = () => {
      setActiveStage(stage);
      stage++;
      
      if (stage < stages.length) {
        animationRef.current = window.setTimeout(() => {
          requestAnimationFrame(animate);
        }, 1000) as unknown as number;
      } else {
        setTimeout(() => {
          setActiveStage(null);
          setIsAnimating(false);
        }, 1500);
      }
    };
    
    animate();
  }, [isAnimating, stages.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          ResoFormer Architecture
        </h3>
        <button
          onClick={runAnimation}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isAnimating ? 'Pause' : 'Animate Flow'}
        </button>
      </div>

      {/* Pipeline Visualization */}
      <div className="relative p-6 rounded-xl border border-border bg-card overflow-x-auto">
        <div className="flex items-stretch gap-2 min-w-max">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === idx;
            const isPast = activeStage !== null && idx < activeStage;
            
            return (
              <div key={stage.id} className="flex items-center">
                <div 
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-500 cursor-pointer min-w-[140px]
                    ${isActive 
                      ? 'border-primary bg-primary/20 scale-105 shadow-lg shadow-primary/20' 
                      : isPast
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    }
                  `}
                  onClick={() => setActiveStage(idx)}
                >
                  <div className={`
                    absolute inset-0 rounded-xl bg-gradient-to-br ${stage.color} opacity-0 transition-opacity
                    ${isActive ? 'opacity-20' : ''}
                  `} />
                  
                  <div className="relative flex flex-col items-center gap-2 text-center">
                    <div className={`
                      p-2 rounded-lg transition-colors
                      ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{stage.label}</span>
                  </div>

                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                
                {idx < stages.length - 1 && (
                  <ChevronRight className={`
                    w-6 h-6 mx-1 transition-colors flex-shrink-0
                    ${isPast || isActive ? 'text-primary' : 'text-muted-foreground'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Description */}
      {activeStage !== null && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            {(() => {
              const Icon = stages[activeStage].icon;
              return <Icon className="w-5 h-5 text-primary mt-0.5" />;
            })()}
            <div>
              <p className="font-semibold text-primary">{stages[activeStage].label}</p>
              <p className="text-sm text-muted-foreground mt-1">{stages[activeStage].description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Multi-Layer Processing Demo ====================

interface LayerState {
  tokens: string[];
  primeStates: number[][];
  attentionMatrix: number[][];
  quaternionRotations: Quaternion[];
  coherence: number;
  entropy: number;
}

const MultiLayerDemo = () => {
  const [inputText, setInputText] = useState('the ancient wisdom speaks truth');
  const [coherenceThreshold, setCoherenceThreshold] = useState(0.85);
  const [maxLayers, setMaxLayers] = useState(6);
  const [layers, setLayers] = useState<LayerState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(-1);
  const [halted, setHalted] = useState(false);
  const [finalOutput, setFinalOutput] = useState<string | null>(null);

  const processLayers = useCallback(async () => {
    const tokens = inputText.split(' ').filter(Boolean);
    if (tokens.length === 0) return;

    setIsProcessing(true);
    setLayers([]);
    setCurrentLayer(-1);
    setHalted(false);
    setFinalOutput(null);

    const newLayers: LayerState[] = [];
    let currentPrimes = tokens.map(wordToPrimes);
    
    for (let layer = 0; layer < maxLayers; layer++) {
      setCurrentLayer(layer);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Compute attention matrix
      const attentionMatrix: number[][] = [];
      for (let i = 0; i < tokens.length; i++) {
        const row: number[] = [];
        for (let j = 0; j < tokens.length; j++) {
          row.push(primeResonance(currentPrimes[i], currentPrimes[j]));
        }
        attentionMatrix.push(row);
      }

      // Normalize attention (softmax)
      const normalizedAttn = attentionMatrix.map(row => {
        const sum = row.reduce((s, v) => s + Math.exp(v * 4), 0);
        return row.map(v => Math.exp(v * 4) / sum);
      });

      // Quaternion rotations based on layer
      const quaternionRotations = tokens.map((_, i) => {
        const angle = (layer * 0.2 + i * 0.1) * Math.PI;
        return new Quaternion(
          Math.cos(angle / 2),
          Math.sin(angle / 2) * 0.577,
          Math.sin(angle / 2) * 0.577,
          Math.sin(angle / 2) * 0.577
        ).normalize();
      });

      // Compute coherence from attention distribution
      const attentionWeights = normalizedAttn.map(row => 
        row.reduce((max, v) => Math.max(max, v), 0)
      );
      const coherence = computeCoherence(attentionWeights);

      // Compute average entropy
      const entropies = currentPrimes.map(computeEntropy);
      const avgEntropy = entropies.reduce((s, e) => s + e, 0) / entropies.length;

      const layerState: LayerState = {
        tokens,
        primeStates: currentPrimes,
        attentionMatrix: normalizedAttn,
        quaternionRotations,
        coherence,
        entropy: avgEntropy
      };

      newLayers.push(layerState);
      setLayers([...newLayers]);

      // Check halting condition
      if (coherence >= coherenceThreshold) {
        setHalted(true);
        // Select output token (highest attention received)
        const attentionReceived = tokens.map((_, i) => 
          normalizedAttn.reduce((s, row) => s + row[i], 0)
        );
        const maxIdx = attentionReceived.indexOf(Math.max(...attentionReceived));
        setFinalOutput(tokens[maxIdx]);
        break;
      }

      // Update primes for next layer (simulate mixing)
      currentPrimes = currentPrimes.map((primes, i) => {
        const mixed = [...primes];
        normalizedAttn[i].forEach((weight, j) => {
          if (weight > 0.15 && j !== i) {
            const donor = currentPrimes[j];
            donor.forEach(p => {
              if (!mixed.includes(p) && Math.random() < weight) {
                mixed.push(p);
              }
            });
          }
        });
        return mixed.slice(0, 8); // Cap at 8 primes
      });
    }

    // If didn't halt, select final output
    if (!halted && newLayers.length > 0) {
      const lastLayer = newLayers[newLayers.length - 1];
      const attentionReceived = tokens.map((_, i) => 
        lastLayer.attentionMatrix.reduce((s, row) => s + row[i], 0)
      );
      const maxIdx = attentionReceived.indexOf(Math.max(...attentionReceived));
      setFinalOutput(tokens[maxIdx]);
    }

    setIsProcessing(false);
    setCurrentLayer(-1);
  }, [inputText, coherenceThreshold, maxLayers, halted]);

  const reset = () => {
    setLayers([]);
    setCurrentLayer(-1);
    setHalted(false);
    setFinalOutput(null);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Adaptive Depth Processing
        </h3>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Input Sequence</label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Coherence Threshold: {coherenceThreshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={coherenceThreshold}
              onChange={(e) => setCoherenceThreshold(parseFloat(e.target.value))}
              className="w-full"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Max Layers: {maxLayers}
            </label>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={maxLayers}
              onChange={(e) => setMaxLayers(parseInt(e.target.value))}
              className="w-full"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={processLayers}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Activity className="w-4 h-4 animate-pulse" />
                Processing Layer {currentLayer + 1}...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Forward Pass
              </>
            )}
          </button>
          <button
            onClick={reset}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Layer Visualization */}
        {layers.length > 0 && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-20">Progress:</span>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${halted ? 'bg-green-500' : 'bg-primary'}`}
                  style={{ width: `${(layers.length / maxLayers) * 100}%` }}
                />
              </div>
              <span className="text-sm font-mono w-16 text-right">
                {layers.length}/{maxLayers}
              </span>
            </div>

            {/* Coherence Chart */}
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-3">Coherence by Layer</p>
              <div className="relative h-40 flex items-end gap-2 bg-secondary/30 rounded p-2">
                {/* Threshold line */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-500 z-10 pointer-events-none"
                  style={{ bottom: `${coherenceThreshold * 100}%` }}
                />
                {layers.map((layer, idx) => {
                  // Ensure coherence is visible (minimum 5% height for very small values)
                  const displayHeight = Math.max(layer.coherence * 100, 5);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="w-full flex flex-col items-center justify-end flex-1">
                        <span className="text-[10px] font-mono text-muted-foreground mb-1">
                          {layer.coherence.toFixed(2)}
                        </span>
                        <div 
                          className={`
                            w-full rounded-t transition-all duration-500 min-h-[4px]
                            ${layer.coherence >= coherenceThreshold 
                              ? 'bg-green-500' 
                              : 'bg-primary'
                            }
                          `}
                          style={{ height: `${displayHeight}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">L{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Threshold: {coherenceThreshold.toFixed(2)}</span>
                {halted && (
                  <span className="text-green-500 font-medium">✓ Halted at layer {layers.length}</span>
                )}
              </div>
            </div>

            {/* Attention Matrix for Last Layer */}
            {layers.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-3">
                  Attention Matrix (Layer {layers.length})
                </p>
                <div className="overflow-x-auto">
                  <div 
                    className="grid gap-1 w-max" 
                    style={{ gridTemplateColumns: `80px repeat(${layers[0].tokens.length}, 48px)` }}
                  >
                    <div></div>
                    {layers[0].tokens.map((t, i) => (
                      <div key={i} className="text-xs text-center truncate text-muted-foreground">
                        {t.slice(0, 6)}
                      </div>
                    ))}
                    {layers[layers.length - 1].attentionMatrix.map((row, i) => (
                      <>
                        <div key={`label-${i}`} className="text-xs text-right pr-2 text-muted-foreground truncate">
                          {layers[0].tokens[i].slice(0, 8)}
                        </div>
                        {row.map((val, j) => (
                          <div
                            key={`${i}-${j}`}
                            className="w-12 h-8 rounded flex items-center justify-center text-[10px] font-mono"
                            style={{ 
                              backgroundColor: `hsla(170, 80%, 40%, ${val})`,
                              color: val > 0.4 ? 'white' : 'inherit'
                            }}
                          >
                            {val.toFixed(2)}
                          </div>
                        ))}
                      </>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Output */}
        {finalOutput && (
          <div className="mt-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50">
            <p className="text-sm font-medium mb-1">Entropy Collapse Output</p>
            <p className="font-mono text-2xl text-green-400">{finalOutput}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Selected token with highest coherence after {layers.length} layer{layers.length !== 1 ? 's' : ''}
              {halted && ' (early stopping)'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== Prime Resonance Explorer ====================

const PrimeResonanceExplorer = () => {
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
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        Prime Resonance Explorer
      </h3>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Word 1</label>
          <input
            type="text"
            value={word1}
            onChange={(e) => setWord1(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Word 2</label>
          <input
            type="text"
            value={word2}
            onChange={(e) => setWord2(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono"
          />
        </div>
      </div>

      {analysis && (
        <div className="space-y-4">
          {/* Prime Signatures */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm font-medium mb-2 text-blue-400">{word1}</p>
              <div className="flex flex-wrap gap-2">
                {analysis.primes1.map((p, i) => (
                  <span 
                    key={i} 
                    className={`
                      px-2 py-1 rounded text-xs font-mono
                      ${analysis.overlap.includes(p) 
                        ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500' 
                        : 'bg-blue-500/20 text-blue-300'
                      }
                    `}
                  >
                    {getPrimeChar(p)}→{p}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm font-medium mb-2 text-green-400">{word2}</p>
              <div className="flex flex-wrap gap-2">
                {analysis.primes2.map((p, i) => (
                  <span 
                    key={i} 
                    className={`
                      px-2 py-1 rounded text-xs font-mono
                      ${analysis.overlap.includes(p) 
                        ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500' 
                        : 'bg-green-500/20 text-green-300'
                      }
                    `}
                  >
                    {getPrimeChar(p)}→{p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Overlap Visualization */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Resonance Score</span>
              <span className="font-mono text-2xl text-primary">
                {analysis.resonance.toFixed(4)}
              </span>
            </div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all"
                style={{ width: `${analysis.resonance * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>|Overlap| = {analysis.overlap.length}</span>
              <span>|Union| = {analysis.union.length}</span>
              <span>Jaccard = {analysis.overlap.length}/{analysis.union.length}</span>
            </div>
          </div>

          {/* Formula */}
          <div className="p-3 rounded bg-primary/10 font-mono text-sm text-center">
            resonance = |P₁ ∩ P₂| / |P₁ ∪ P₂| = {analysis.overlap.length} / {analysis.union.length} = {analysis.resonance.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Quaternion Rotation Visualizer ====================

const QuaternionMixingDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const drawVisualization = useCallback((currentAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.35;

    // Clear
    ctx.fillStyle = 'hsl(220, 20%, 10%)';
    ctx.fillRect(0, 0, w, h);

    // Draw coordinate circles
    ctx.strokeStyle = 'hsl(220, 20%, 25%)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(scale => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(cx - radius - 20, cy);
    ctx.lineTo(cx + radius + 20, cy);
    ctx.moveTo(cx, cy - radius - 20);
    ctx.lineTo(cx, cy + radius + 20);
    ctx.stroke();

    // Create quaternion rotation
    const q = new Quaternion(
      Math.cos(currentAngle / 2),
      Math.sin(currentAngle / 2) * 0.577,
      Math.sin(currentAngle / 2) * 0.577,
      Math.sin(currentAngle / 2) * 0.577
    );

    // Draw quaternion components as vectors
    const components = [
      { label: 'w', value: q.w, color: 'hsl(200, 80%, 60%)' },
      { label: 'x', value: q.x, color: 'hsl(0, 80%, 60%)' },
      { label: 'y', value: q.y, color: 'hsl(120, 80%, 60%)' },
      { label: 'z', value: q.z, color: 'hsl(280, 80%, 60%)' },
    ];

    components.forEach((comp, i) => {
      const compAngle = (i / 4) * Math.PI * 2 - Math.PI / 2;
      const len = Math.abs(comp.value) * radius;
      const endX = cx + Math.cos(compAngle) * len;
      const endY = cy + Math.sin(compAngle) * len;

      ctx.strokeStyle = comp.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw arrowhead
      const arrowAngle = Math.atan2(endY - cy, endX - cx);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - 10 * Math.cos(arrowAngle - 0.3),
        endY - 10 * Math.sin(arrowAngle - 0.3)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - 10 * Math.cos(arrowAngle + 0.3),
        endY - 10 * Math.sin(arrowAngle + 0.3)
      );
      ctx.stroke();

      // Label
      ctx.fillStyle = comp.color;
      ctx.font = 'bold 14px monospace';
      const labelX = cx + Math.cos(compAngle) * (radius + 30);
      const labelY = cy + Math.sin(compAngle) * (radius + 30);
      ctx.fillText(`${comp.label}=${comp.value.toFixed(2)}`, labelX - 25, labelY + 5);
    });

    // Draw rotation arc
    ctx.strokeStyle = 'hsl(50, 80%, 50%)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.6, -Math.PI / 2, -Math.PI / 2 + currentAngle);
    ctx.stroke();
    ctx.setLineDash([]);

    // Magnitude indicator
    const mag = q.magnitude();
    ctx.fillStyle = 'hsl(50, 80%, 50%)';
    ctx.font = '12px monospace';
    ctx.fillText(`|q| = ${mag.toFixed(3)}`, 10, 20);
    ctx.fillText(`θ = ${(currentAngle * 180 / Math.PI).toFixed(1)}°`, 10, 40);
  }, []);

  useEffect(() => {
    drawVisualization(angle);
  }, [angle, drawVisualization]);

  const toggleAnimation = () => {
    if (isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      let currentAngle = angle;
      
      const animate = () => {
        currentAngle += 0.02;
        if (currentAngle > Math.PI * 2) currentAngle = 0;
        setAngle(currentAngle);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-primary" />
        Quaternion Rotation Mixing
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ResoFormer uses Hamilton quaternion multiplication to mix semantic states.
            This enables rotations in 4D hypercomplex space, preserving magnitude while
            transforming meaning.
          </p>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Rotation Angle: {(angle * 180 / Math.PI).toFixed(1)}°
            </label>
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.01"
              value={angle}
              onChange={(e) => setAngle(parseFloat(e.target.value))}
              className="w-full"
              disabled={isAnimating}
            />
          </div>

          <button
            onClick={toggleAnimation}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAnimating ? 'Stop' : 'Animate'}
          </button>

          <div className="p-3 rounded bg-muted/50 font-mono text-xs">
            q = cos(θ/2) + sin(θ/2)(xi + yj + zk)
          </div>
        </div>

        <div className="flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="rounded-lg border border-border"
          />
        </div>
      </div>
    </div>
  );
};

// ==================== Main Page ====================

const ResoFormerExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/ml" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to ML Examples
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold gradient-text">ResoFormer</h1>
              <p className="text-muted-foreground">
                Resonant Attention Transformer with Adaptive Depth & Entropy Collapse
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl">
            ResoFormer is a novel transformer architecture that replaces dot-product attention with 
            <strong className="text-foreground"> prime-based resonance</strong>, uses 
            <strong className="text-foreground"> quaternion rotations</strong> for semantic mixing, and features 
            <strong className="text-foreground"> coherence-gated adaptive depth</strong> for efficient computation.
          </p>
        </div>

        {/* Architecture Overview */}
        <section className="mb-12">
          <ArchitectureDiagram />
        </section>

        {/* Key Concepts */}
        <section className="mb-12 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="p-2 rounded-lg bg-cyan-500/10 w-fit mb-3">
              <Zap className="w-5 h-5 text-cyan-500" />
            </div>
            <h3 className="font-semibold mb-2">Prime Resonance</h3>
            <p className="text-sm text-muted-foreground">
              Characters map to primes. Semantic similarity = prime signature overlap (Jaccard index).
              This provides algebraic structure to meaning.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="p-2 rounded-lg bg-purple-500/10 w-fit mb-3">
              <GitBranch className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">Quaternion Mixing</h3>
            <p className="text-sm text-muted-foreground">
              Hamilton product rotates states in 4D hypercomplex space, enabling non-commutative 
              semantic transformations that preserve magnitude.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="p-2 rounded-lg bg-green-500/10 w-fit mb-3">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Adaptive Halting</h3>
            <p className="text-sm text-muted-foreground">
              Coherence-gated computation: when state entropy drops below threshold, 
              processing halts early. Simple inputs use fewer layers.
            </p>
          </div>
        </section>

        {/* Multi-Layer Demo */}
        <section className="mb-12">
          <MultiLayerDemo />
        </section>

        {/* Prime Resonance Explorer */}
        <section className="mb-12">
          <PrimeResonanceExplorer />
        </section>

        {/* Quaternion Visualization */}
        <section className="mb-12">
          <QuaternionMixingDemo />
        </section>

        {/* Code Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold mb-6 gradient-text">Implementation</h2>
          <CodeBlock
            code={`import { 
  ResoFormer,
  PrimeEncoder,
  resonantAttention,
  EntropyCollapseHead,
  coherenceGatedCompute
} from '@aleph-ai/tinyaleph';

// Initialize ResoFormer with adaptive depth
const model = new ResoFormer({
  layers: 12,
  hiddenDim: 512,
  numHeads: 8,
  coherenceThreshold: 0.9,  // Halt when coherence exceeds this
  primeVocabSize: 32768
});

// Prime-based encoding
const encoder = new PrimeEncoder(vocabulary);
const primeStates = encoder.encode(['the', 'ancient', 'wisdom', 'speaks']);
// Each token → unique prime signature

// Resonant Attention (replaces dot-product)
const attended = resonantAttention({
  query: primeStates,
  keys: primeStates,
  values: primeStates,
  resonanceFn: 'jaccard'  // |P_q ∩ P_k| / |P_q ∪ P_k|
});

// Full forward pass with adaptive halting
const result = model.forward(input, {
  maxLayers: 12,
  returnTrace: true,
  temperature: 0.8
});

console.log('Output token:', result.output);
console.log('Layers used:', result.layersUsed);      // Adaptive depth
console.log('Final coherence:', result.coherence);   // State sharpness
console.log('Entropy:', result.entropy);             // Uncertainty measure

// Entropy Collapse decoding
const head = new EntropyCollapseHead(512, vocabSize);
const logits = head.forward(result.hidden);
// Selects token with minimum entropy (maximum certainty)
const output = head.collapse(logits);`}
            language="javascript"
            title="resoformer-usage.js"
          />
        </section>

        {/* Theory Section */}
        <section className="mb-12 p-6 rounded-xl border border-border bg-card">
          <h2 className="text-2xl font-display font-bold mb-4 gradient-text">
            Theoretical Foundation
          </h2>
          <div className="prose prose-invert max-w-none">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-primary">Prime Encoding</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Each character maps to a unique prime number via the fundamental theorem of arithmetic.
                  This creates algebraic semantic signatures where shared primes indicate shared meaning.
                </p>
                <div className="p-3 rounded bg-muted/50 font-mono text-sm">
                  "wisdom" → [83, 23, 67, 7, 47, 41]<br/>
                  "knowledge" → [31, 43, 47, 83, 37, 11, 7, 17, 11]
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-primary">Resonance vs Dot-Product</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Traditional attention: Q·K / √d<br/>
                  Resonant attention: |P_Q ∩ P_K| / |P_Q ∪ P_K|
                </p>
                <p className="text-sm text-muted-foreground">
                  Prime resonance captures structural similarity rather than learned embeddings,
                  providing interpretable attention patterns and natural clustering.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-primary">Coherence Metric</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Coherence measures how "sharp" or peaked a probability distribution is.
                  High coherence = low entropy = confident prediction.
                </p>
                <div className="p-3 rounded bg-muted/50 font-mono text-sm">
                  coherence = 1 - H(p) / log₂(n)<br/>
                  where H(p) = -Σ pᵢ log₂(pᵢ)
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-primary">Adaptive Computation</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlike fixed-depth transformers, ResoFormer halts when coherence exceeds threshold.
                  Simple inputs may use 2-3 layers; complex ones use all available layers.
                </p>
                <p className="text-sm text-muted-foreground">
                  This mirrors human cognition: easy decisions are fast, hard ones require more thought.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResoFormerExamplesPage;