import { useState, useCallback } from 'react';
import { Play, Layers, Activity, RotateCcw } from 'lucide-react';

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

const computeCoherence = (weights: number[]): number => {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0;
  const normalized = weights.map(w => w / sum);
  const entropy = -normalized.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
  return 1 - entropy / Math.log2(Math.max(normalized.length, 2));
};

interface LayerState {
  tokens: string[];
  attentionMatrix: number[][];
  coherence: number;
}

const AdaptiveDepthDemo = () => {
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
      await new Promise(resolve => setTimeout(resolve, 600));

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

      // Compute coherence from attention distribution
      const attentionWeights = normalizedAttn.map(row => 
        row.reduce((max, v) => Math.max(max, v), 0)
      );
      const coherence = computeCoherence(attentionWeights);

      const layerState: LayerState = {
        tokens,
        attentionMatrix: normalizedAttn,
        coherence,
      };

      newLayers.push(layerState);
      setLayers([...newLayers]);

      // Check halting condition
      if (coherence >= coherenceThreshold) {
        setHalted(true);
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
            donor.forEach((p, pIdx) => {
              if (!mixed.includes(p) && weight > 0.2 + pIdx * 0.05) {
                mixed.push(p);
              }
            });
          }
        });
        return mixed.slice(0, 8);
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Adaptive Depth Processing</h3>
      </div>

      {/* Controls */}
      <div className="grid gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Input Sequence</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none text-sm"
            disabled={isProcessing}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Threshold: {coherenceThreshold.toFixed(2)}
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
            <label className="text-xs text-muted-foreground mb-1 block">
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
      </div>

      <div className="flex gap-2">
        <button
          onClick={processLayers}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Activity className="w-4 h-4 animate-pulse" />
              Layer {currentLayer + 1}...
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
        </button>
      </div>

      {/* Layer Visualization */}
      {layers.length > 0 && (
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16">Progress:</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${halted ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${(layers.length / maxLayers) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono w-12 text-right">
              {layers.length}/{maxLayers}
            </span>
          </div>

          {/* Coherence Chart */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium mb-2">Coherence by Layer</p>
            <div className="relative h-24 flex items-end gap-1 bg-secondary/30 rounded p-2">
              {/* Threshold line */}
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-500 z-10"
                style={{ bottom: `${coherenceThreshold * 100}%` }}
              />
              {layers.map((layer, idx) => {
                const displayHeight = Math.max(layer.coherence * 100, 5);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-[9px] font-mono text-muted-foreground mb-1">
                      {layer.coherence.toFixed(2)}
                    </span>
                    <div 
                      className={`w-full rounded-t transition-all duration-500 min-h-[4px] ${layer.coherence >= coherenceThreshold ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ height: `${displayHeight}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground mt-1">L{idx + 1}</span>
                  </div>
                );
              })}
            </div>
            {halted && (
              <p className="text-xs text-green-500 font-medium mt-2">✓ Halted at layer {layers.length}</p>
            )}
          </div>
        </div>
      )}

      {/* Final Output */}
      {finalOutput && (
        <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50">
          <p className="text-xs font-medium mb-1">Entropy Collapse Output</p>
          <p className="font-mono text-xl text-green-400">{finalOutput}</p>
        </div>
      )}
    </div>
  );
};

export default AdaptiveDepthDemo;
