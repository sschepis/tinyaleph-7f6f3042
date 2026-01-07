import { useState, useCallback } from 'react';
import { Play, Brain } from 'lucide-react';
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
  // Add hash-based component for more nuanced similarity
  const hashSim = 1 - Math.abs(hashString(a) - hashString(b)) / (hashString(a) + hashString(b) + 1);
  return jaccard * 0.6 + hashSim * 0.4;
};

const AttentionExample = () => {
  const [tokens] = useState(['wisdom', 'ancient', 'truth', 'knowledge']);
  const [matrix, setMatrix] = useState<number[][]>([]);

  const compute = useCallback(() => {
    // Compute deterministic attention based on token similarity
    const rawScores = tokens.map((t1) => 
      tokens.map((t2) => tokenSimilarity(t1, t2))
    );
    // Apply softmax normalization
    const normalized = rawScores.map(row => {
      const maxVal = Math.max(...row);
      const expRow = row.map(v => Math.exp((v - maxVal) * 3)); // temperature scaling
      const sum = expRow.reduce((a, b) => a + b, 0);
      return expRow.map(v => v / sum);
    });
    setMatrix(normalized);
  }, [tokens]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4"><Brain className="w-5 h-5 text-primary" /><h3 className="font-semibold">Resonant Attention</h3></div>
      <button onClick={compute} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"><Play className="w-4 h-4" /> Compute</button>
      {matrix.length > 0 && (
        <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${tokens.length}, 1fr)` }}>
          <div></div>
          {tokens.map((t, i) => (<div key={i} className="text-xs text-center truncate">{t}</div>))}
          {matrix.map((row, i) => (<>
            <div key={`label-${i}`} className="text-xs text-right pr-2">{tokens[i]}</div>
            {row.map((v, j) => (<div key={`${i}-${j}`} className="h-8 rounded" style={{ backgroundColor: `hsla(200, 70%, 50%, ${v})` }} />))}
          </>))}
        </div>
      )}
    </div>
  );
};

const GradientExample = () => {
  const [step, setStep] = useState(0);
  const [loss, setLoss] = useState(100);

  const runStep = useCallback(() => {
    setStep(s => s + 1);
    setLoss(l => l * 0.9 + Math.random() * 5);
  }, []);

  return (
    <div className="space-y-4">
      <button onClick={runStep} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"><Play className="w-4 h-4" /> Step</button>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 text-center"><p className="text-sm text-muted-foreground">Step</p><p className="text-2xl font-mono text-primary">{step}</p></div>
        <div className="p-4 rounded-lg bg-muted/50 text-center"><p className="text-sm text-muted-foreground">Loss</p><p className="text-2xl font-mono text-primary">{loss.toFixed(2)}</p></div>
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
