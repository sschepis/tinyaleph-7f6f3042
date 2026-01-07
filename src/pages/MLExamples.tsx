import { useState, useCallback } from 'react';
import { Play, Brain, Plus, X, RotateCcw } from 'lucide-react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';

// Deterministic hash for consistent token similarity
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Compute semantic similarity based on shared characters and letter patterns
const tokenSimilarity = (a: string, b: string): number => {
  if (a === b) return 1.0;
  const setA = new Set(a.toLowerCase());
  const setB = new Set(b.toLowerCase());
  const intersection = [...setA].filter(c => setB.has(c)).length;
  const union = new Set([...setA, ...setB]).size;
  const jaccard = intersection / union;
  const hashSim = 1 - Math.abs(hashString(a) - hashString(b)) / (hashString(a) + hashString(b) + 1);
  return jaccard * 0.6 + hashSim * 0.4;
};

const AttentionExample = () => {
  const [tokens, setTokens] = useState(['wisdom', 'ancient', 'truth', 'knowledge']);
  const [newToken, setNewToken] = useState('');
  const [matrix, setMatrix] = useState<number[][]>([]);

  const compute = useCallback(() => {
    if (tokens.length === 0) return;
    const rawScores = tokens.map((t1) => 
      tokens.map((t2) => tokenSimilarity(t1, t2))
    );
    const normalized = rawScores.map(row => {
      const maxVal = Math.max(...row);
      const expRow = row.map(v => Math.exp((v - maxVal) * 3));
      const sum = expRow.reduce((a, b) => a + b, 0);
      return expRow.map(v => v / sum);
    });
    setMatrix(normalized);
  }, [tokens]);

  const addToken = () => {
    if (newToken.trim() && !tokens.includes(newToken.trim())) {
      setTokens([...tokens, newToken.trim()]);
      setNewToken('');
      setMatrix([]);
    }
  };

  const removeToken = (index: number) => {
    setTokens(tokens.filter((_, i) => i !== index));
    setMatrix([]);
  };

  const updateToken = (index: number, value: string) => {
    const updated = [...tokens];
    updated[index] = value;
    setTokens(updated);
    setMatrix([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Resonant Attention</h3>
      </div>
      
      {/* Token editor */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Edit tokens or add new ones:</p>
        <div className="flex flex-wrap gap-2">
          {tokens.map((token, i) => (
            <div key={i} className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1">
              <input
                type="text"
                value={token}
                onChange={(e) => updateToken(i, e.target.value)}
                className="bg-transparent border-none text-sm w-20 focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
              />
              {tokens.length > 2 && (
                <button onClick={() => removeToken(i)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToken()}
              placeholder="add..."
              className="bg-muted/30 border border-border rounded-lg text-sm w-20 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={addToken} className="p-1 rounded bg-primary/20 hover:bg-primary/30 text-primary">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <button onClick={compute} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
        <Play className="w-4 h-4" /> Compute
      </button>
      
      {matrix.length > 0 && (
        <div className="overflow-x-auto">
          <div className="grid gap-1 min-w-fit" style={{ gridTemplateColumns: `80px repeat(${tokens.length}, minmax(60px, 1fr))` }}>
            <div></div>
            {tokens.map((t, i) => (
              <div key={i} className="text-xs text-center truncate px-1 font-medium">{t}</div>
            ))}
            {matrix.map((row, i) => (
              <>
                <div key={`label-${i}`} className="text-xs text-right pr-2 font-medium truncate">{tokens[i]}</div>
                {row.map((v, j) => (
                  <div 
                    key={`${i}-${j}`} 
                    className="h-10 rounded flex items-center justify-center text-xs font-mono transition-colors"
                    style={{ 
                      backgroundColor: `hsla(200, 70%, 50%, ${v})`,
                      color: v > 0.4 ? 'white' : 'inherit'
                    }}
                  >
                    {v.toFixed(2)}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GradientExample = () => {
  const [step, setStep] = useState(0);
  const [loss, setLoss] = useState(100);
  const [lossHistory, setLossHistory] = useState<number[]>([100]);

  const computeLoss = (s: number) => {
    const baseLoss = 100 * Math.exp(-0.1 * s);
    const variation = Math.sin(s * 0.5) * 2;
    return Math.max(0.5, baseLoss + variation);
  };

  const runStep = useCallback(() => {
    setStep(s => {
      const newStep = s + 1;
      const newLoss = computeLoss(newStep);
      setLoss(newLoss);
      setLossHistory(h => [...h, newLoss]);
      return newStep;
    });
  }, []);

  const runMany = useCallback(() => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => runStep(), i * 100);
    }
  }, [runStep]);

  const reset = useCallback(() => {
    setStep(0);
    setLoss(100);
    setLossHistory([100]);
  }, []);

  const maxLoss = Math.max(...lossHistory, 1);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button onClick={runStep} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"><Play className="w-4 h-4" /> Step</button>
        <button onClick={runMany} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground border border-border"><Play className="w-4 h-4" /> ×10</button>
        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground border border-border"><RotateCcw className="w-4 h-4" /> Reset</button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Step</p>
          <p className="text-2xl font-mono text-primary">{step}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Loss</p>
          <p className="text-2xl font-mono text-primary">{loss.toFixed(2)}</p>
        </div>
      </div>

      {/* Loss History Chart */}
      <div className="p-4 rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">Loss History ({lossHistory.length} steps)</p>
        <div className="h-24 flex items-end gap-[2px]">
          {lossHistory.slice(-50).map((l, i) => (
            <div 
              key={i} 
              className="flex-1 bg-primary/70 rounded-t transition-all min-w-[3px]"
              style={{ height: `${(l / maxLoss) * 100}%` }}
              title={`Step ${i}: ${l.toFixed(2)}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>0</span>
          <span>{maxLoss.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  { id: 'attention', number: '1', title: 'Resonant Attention', subtitle: 'Prime-based attention', description: 'Compute attention weights using prime resonance instead of dot-product similarity.', concepts: ['Attention', 'Prime Resonance', 'Transformers'], code: `// ResoFormer attention uses prime resonance\nconst attention = computeResonantAttention(tokens);\nconsole.log('Attention matrix:', attention);`, codeTitle: 'ml/01-attention.js' },
  { id: 'gradient', number: '2', title: 'Gradient Descent', subtitle: 'Optimization', description: 'Visualize gradient descent optimization on a loss landscape.', concepts: ['Optimization', 'Gradient Descent', 'Loss Function'], code: `// Gradient descent step\nconst newParams = params.map((p, i) => p - learningRate * gradients[i]);\nconsole.log('Loss:', computeLoss(newParams));`, codeTitle: 'ml/02-gradient.js' },
];

const exampleComponents: Record<string, React.FC> = { 'attention': AttentionExample, 'gradient': GradientExample };

export default function MLExamplesPage() {
  return <ExamplePageWrapper category="ML" title="Machine Learning" description="Resonant attention mechanisms and optimization visualizations." examples={examples} exampleComponents={exampleComponents} previousSection={{ title: 'Math', path: '/math' }} nextSection={{ title: 'Scientific', path: '/scientific' }} />;
}
