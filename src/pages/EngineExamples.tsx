import { useState, useCallback } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import SedenionVisualizer from '../components/SedenionVisualizer';
import {
  createEngine,
} from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';

const EngineExample = () => {
  const [input, setInput] = useState('What is the nature of wisdom?');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    output: string;
    entropy: number;
    steps: number;
    orderParameter: number;
    state: number[];
    stepLog: { step: number; entropy: number; transform?: string }[];
  } | null>(null);

  const runEngine = useCallback(async () => {
    setRunning(true);
    setResult(null);

    try {
      const engine = createEngine('semantic', {
        ...minimalConfig,
        engineOptions: {
          oscillatorCount: 16,
          coupling: 0.2,
          entropyThreshold: 0.1,
          maxIterations: 50,
        }
      });

      // Run the engine
      const engineResult = engine.run(input);

      const stepLog = engineResult.steps?.map((s: any, i: number) => ({
        step: i + 1,
        entropy: s.entropyAfter || s.entropy || 0,
        transform: s.transform || 'transform',
      })) || [];

      // Get state components safely
      let stateComponents: number[] = [];
      if (engineResult.state) {
        if (engineResult.state.components) {
          stateComponents = engineResult.state.components.slice(0, 16);
        } else if ((engineResult.state as any).c) {
          stateComponents = [...(engineResult.state as any).c].slice(0, 16);
        }
      }

      setResult({
        output: engineResult.output || input,
        entropy: engineResult.entropy || 0,
        steps: engineResult.steps?.length || 0,
        orderParameter: engineResult.oscillators?.orderParameter || 0,
        state: stateComponents.length > 0 ? stateComponents : Array(16).fill(0),
        stepLog,
      });
    } catch (e) {
      console.error('Engine error:', e);
      setResult({
        output: `Error: ${(e as Error).message}`,
        entropy: 0,
        steps: 0,
        orderParameter: 0,
        state: Array(16).fill(0),
        stepLog: [],
      });
    }

    setRunning(false);
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Full Pipeline</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              placeholder="Enter a query..."
            />
            <button
              onClick={runEngine}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {running ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Final State</h4>
                  <div className="flex justify-center">
                    <SedenionVisualizer 
                      components={result.state.map((c: number) => Math.abs(c))}
                      animated={false}
                      size="lg"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Entropy:</span>
                    <span className="font-mono text-primary">{result.entropy.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transform Steps:</span>
                    <span className="font-mono text-primary">{result.steps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Parameter:</span>
                    <span className="font-mono text-primary">{result.orderParameter.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {result.stepLog.length > 0 && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Entropy Reduction</h4>
                  <div className="space-y-1">
                    {result.stepLog.slice(0, 10).map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-8 font-mono text-muted-foreground">#{step.step}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, (step.entropy / 4) * 100)}%` }}
                          />
                        </div>
                        <span className="w-16 font-mono text-xs text-right">
                          {step.entropy.toFixed(3)}
                        </span>
                      </div>
                    ))}
                    {result.stepLog.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        ...+{result.stepLog.length - 10} more steps
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="text-sm font-medium text-primary mb-2">Output</h4>
                <p className="text-sm">{result.output}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { createEngine } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

// Create semantic engine
const engine = createEngine('semantic', {
  ...config,
  engineOptions: {
    oscillatorCount: 16,
    coupling: 0.2,
    entropyThreshold: 0.1,
    maxIterations: 50
  }
});

// Run computation pipeline
const result = engine.run('${input}');

console.log('Output:', result.output);
console.log('Entropy:', result.entropy);
console.log('Steps:', result.steps.length);
console.log('Order Parameter:', result.oscillators.orderParameter);

// Trace entropy reduction
for (const step of result.steps) {
  console.log(\`Step \${step.step}: entropy \${step.entropyAfter.toFixed(3)}\`);
}`}
        language="javascript"
        title="engine-example.js"
      />
    </div>
  );
};

const EngineExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Engine Module</h1>
          <p className="text-muted-foreground">
            Interactive examples of the unified computation engine.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              AlephEngine Pipeline
            </h2>
            <EngineExample />
          </section>
        </div>
      </div>
    </div>
  );
};

export default EngineExamplesPage;
