import { useState, useCallback } from 'react';
import { Play, Brain } from 'lucide-react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';

const AttentionExample = () => {
  const [tokens] = useState(['wisdom', 'ancient', 'truth', 'knowledge']);
  const [matrix, setMatrix] = useState<number[][]>([]);

  const compute = useCallback(() => {
    const m = tokens.map(() => tokens.map(() => Math.random()));
    const normalized = m.map(row => { const sum = row.reduce((a, b) => a + Math.exp(b), 0); return row.map(v => Math.exp(v) / sum); });
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
