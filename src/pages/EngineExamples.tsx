import { useState, useCallback } from 'react';
import { Play, RefreshCw, Brain, ArrowRight } from 'lucide-react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import SedenionVisualizer from '../components/SedenionVisualizer';
import { createEngine, SemanticBackend } from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';

const EngineExample = () => {
  const [input, setInput] = useState('What is the nature of wisdom?');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ output: string; entropy: number; steps: number; state: number[] } | null>(null);

  const runEngine = useCallback(async () => {
    setRunning(true);
    try {
      const engine = createEngine('semantic', { ...minimalConfig, engineOptions: { oscillatorCount: 16, coupling: 0.2, entropyThreshold: 0.1, maxIterations: 50 } });
      const engineResult = engine.run(input);
      let stateComponents: number[] = engineResult.state?.components?.slice(0, 16) || (engineResult.state as any)?.c?.slice(0, 16) || Array(16).fill(0);
      setResult({ output: engineResult.output || input, entropy: engineResult.entropy || 0, steps: engineResult.steps?.length || 0, state: stateComponents });
    } catch (e) { setResult({ output: `Error: ${(e as Error).message}`, entropy: 0, steps: 0, state: Array(16).fill(0) }); }
    setRunning(false);
  }, [input]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border" placeholder="Enter a query..." />
        <button onClick={runEngine} disabled={running} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run
        </button>
      </div>
      {result && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50"><SedenionVisualizer components={result.state.map(c => Math.abs(c))} animated={false} size="lg" /></div>
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between"><span>Entropy:</span><span className="font-mono text-primary">{result.entropy.toFixed(4)}</span></div>
            <div className="flex justify-between"><span>Steps:</span><span className="font-mono text-primary">{result.steps}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Deterministic hash for word similarity
const wordHash = (word: string): number[] => {
  const result: number[] = [];
  for (let i = 0; i < 8; i++) {
    let h = 0;
    for (let j = 0; j < word.length; j++) {
      h = ((h << 5) - h + word.charCodeAt(j) * (i + 1)) & 0xffffffff;
    }
    result.push((h % 1000) / 500 - 1);
  }
  return result;
};

const cosineSimilarity = (a: number[], b: number[]): number => {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB + 0.0001);
};

const AnalogyExample = () => {
  const [baseA, setBaseA] = useState('king');
  const [baseB, setBaseB] = useState('queen');
  const [targetA, setTargetA] = useState('man');
  const [result, setResult] = useState<string | null>(null);
  const [scores, setScores] = useState<{word: string; score: number}[]>([]);

  const runAnalogy = useCallback(() => {
    // Compute: baseB - baseA + targetA = ?
    const vecA = wordHash(baseA);
    const vecB = wordHash(baseB);
    const vecTarget = wordHash(targetA);
    
    // Analogy vector: B - A + targetA
    const analogyVec = vecA.map((v, i) => vecB[i] - v + vecTarget[i]);
    
    // Find best match from candidates
    const candidates = ['woman', 'boy', 'girl', 'prince', 'princess', 'lady', 'lord', 'duke', 'duchess'];
    const candidateScores = candidates.map(word => ({
      word,
      score: cosineSimilarity(analogyVec, wordHash(word))
    })).sort((a, b) => b.score - a.score);
    
    setResult(candidateScores[0].word);
    setScores(candidateScores.slice(0, 4));
  }, [baseA, baseB, targetA]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4"><Brain className="w-5 h-5 text-primary" /><h3 className="font-semibold">Analogical Reasoning</h3></div>
      <div className="flex flex-wrap items-center gap-2">
        <input value={baseA} onChange={(e) => { setBaseA(e.target.value); setResult(null); }} className="w-24 px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
        <span>:</span>
        <input value={baseB} onChange={(e) => { setBaseB(e.target.value); setResult(null); }} className="w-24 px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
        <span>::</span>
        <input value={targetA} onChange={(e) => { setTargetA(e.target.value); setResult(null); }} className="w-24 px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
        <span>:</span>
        <span className="px-3 py-2 rounded-lg bg-primary/20 text-primary font-semibold">{result || '?'}</span>
        <button onClick={runAnalogy} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"><Play className="w-4 h-4" /></button>
      </div>
      {scores.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Top matches:</span>
          {scores.map(({ word, score }) => (
            <span key={word} className="text-xs px-2 py-1 rounded bg-muted/50">
              {word} <span className="text-muted-foreground">({(score * 100).toFixed(0)}%)</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const examples: ExampleConfig[] = [
  { id: 'engine', number: '1', title: 'Full Pipeline', subtitle: 'Complete semantic engine', description: 'Run the complete semantic computation pipeline: encoding → oscillator dynamics → entropy reduction → output.', concepts: ['Semantic Engine', 'Pipeline', 'State Evolution'], code: `import { createEngine } from '@aleph-ai/tinyaleph';\n\nconst engine = createEngine('semantic', { engineOptions: { oscillatorCount: 16, coupling: 0.2 } });\nconst result = engine.run('What is wisdom?');\nconsole.log('Output:', result.output);\nconsole.log('Entropy:', result.entropy);`, codeTitle: 'engine/01-pipeline.js' },
  { id: 'analogy', number: '2', title: 'Analogical Reasoning', subtitle: 'Vector arithmetic', description: 'Perform word vector arithmetic: A is to B as C is to ? Uses semantic embeddings for analogical reasoning.', concepts: ['Word Vectors', 'Analogy', 'Semantic Arithmetic'], code: `// Vector arithmetic: king - man + woman = queen\nconst stateA = backend.encode('king');\nconst stateB = backend.encode('queen');\nconst diff = subtract(stateB, stateA);\nconst predicted = add(backend.encode('man'), diff);\n// Find closest word to predicted state`, codeTitle: 'engine/02-analogy.js' },
];

const exampleComponents: Record<string, React.FC> = { 'engine': EngineExample, 'analogy': AnalogyExample };

export default function EngineExamplesPage() {
  return <ExamplePageWrapper category="Engine" title="Engine Examples" description="Full semantic computation pipeline and reasoning capabilities." examples={examples} exampleComponents={exampleComponents} previousSection={{ title: 'Physics', path: '/physics' }} nextSection={{ title: 'Math', path: '/math' }} />;
}
