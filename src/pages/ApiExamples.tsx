import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SedenionVisualizer from '../components/SedenionVisualizer';
import CodeBlock from '../components/CodeBlock';
import { ArrowLeft, Play, Loader2, Server, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface ApiResult {
  success: boolean;
  operation: string;
  result: unknown;
}

const ApiDemo = () => {
  const [operation, setOperation] = useState('hypercomplex.create');
  const [params, setParams] = useState('{"components": [1, 0, 0, 0, 0.5, 0.3, 0.1, 0]}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const { toast } = useToast();

  const callApi = useCallback(async () => {
    setLoading(true);
    try {
      const parsedParams = JSON.parse(params);
      const response = await fetch(`${SUPABASE_URL}/functions/v1/tinyaleph-compute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ operation, params: parsedParams }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setResult(data);
      toast({
        title: 'Success',
        description: `Operation ${operation} completed`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [operation, params, toast]);

  const operationPresets: Record<string, string> = {
    'hypercomplex.create': '{"components": [1, 0, 0, 0, 0.5, 0.3, 0.1, 0]}',
    'hypercomplex.multiply': '{"a": [1, 0, 0, 0], "b": [0, 1, 0, 0]}',
    'hypercomplex.normalize': '{"components": [3, 4, 0, 0]}',
    'hypercomplex.conjugate': '{"components": [1, 2, 3, 4]}',
    'prime.check': '{"n": 97}',
    'prime.factorize': '{"n": 1234567}',
    'prime.upTo': '{"limit": 100}',
    'prime.nth': '{"n": 100}',
    'engine.run': '{"input": "What is consciousness?", "dims": 16, "maxSteps": 50}',
  };

  const handleOperationChange = (op: string) => {
    setOperation(op);
    setParams(operationPresets[op] || '{}');
  };

  const hypercomplexResult = result?.result && typeof result.result === 'object' && 'components' in result.result
    ? result.result as { components: number[] }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">Backend API Demo</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Operation</label>
            <Select value={operation} onValueChange={handleOperationChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hypercomplex.create">hypercomplex.create</SelectItem>
                <SelectItem value="hypercomplex.multiply">hypercomplex.multiply</SelectItem>
                <SelectItem value="hypercomplex.normalize">hypercomplex.normalize</SelectItem>
                <SelectItem value="hypercomplex.conjugate">hypercomplex.conjugate</SelectItem>
                <SelectItem value="prime.check">prime.check</SelectItem>
                <SelectItem value="prime.factorize">prime.factorize</SelectItem>
                <SelectItem value="prime.upTo">prime.upTo</SelectItem>
                <SelectItem value="prime.nth">prime.nth</SelectItem>
                <SelectItem value="engine.run">engine.run</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Parameters (JSON)</label>
            <textarea
              value={params}
              onChange={(e) => setParams(e.target.value)}
              className="w-full h-32 px-3 py-2 rounded-lg bg-muted border border-border font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button onClick={callApi} disabled={loading} className="w-full">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Execute</>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium mb-2 block">Result</label>
          <div className="p-4 rounded-lg bg-muted border border-border min-h-[200px] overflow-auto">
            {result ? (
              <pre className="font-mono text-xs whitespace-pre-wrap">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground text-sm">Execute an operation to see results</p>
            )}
          </div>

          {hypercomplexResult && (
            <div className="p-4 rounded-lg bg-card border border-border">
              <SedenionVisualizer 
                components={hypercomplexResult.components} 
                size="lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ApiExamplesPage = () => {
  const exampleCode = `// Call the tinyaleph-compute edge function
const response = await fetch(
  \`\${SUPABASE_URL}/functions/v1/tinyaleph-compute\`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${SUPABASE_KEY}\`,
    },
    body: JSON.stringify({
      operation: 'hypercomplex.multiply',
      params: {
        a: [1, 0, 0, 0],
        b: [0, 1, 0, 0]
      }
    }),
  }
);

const { result } = await response.json();
console.log('Product:', result.components);
console.log('Norm:', result.norm);
console.log('Entropy:', result.entropy);`;

  return (
    <div className="pt-20">
      <main className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Examples
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-display font-bold mb-4">Backend API</h1>
            <p className="text-muted-foreground text-lg">
              Call the tinyaleph-compute edge function for server-side heavy computations.
              Offload complex operations to the backend and receive structured results.
            </p>
          </div>

          <div className="space-y-12">
            <div className="p-6 rounded-xl border border-border bg-card">
              <ApiDemo />
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg mb-4">Example Code</h3>
              <CodeBlock code={exampleCode} language="typescript" />
            </div>

            <div className="p-6 rounded-xl border border-border bg-muted/30">
              <h3 className="font-display font-semibold text-lg mb-4">Available Operations</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-primary mb-2">Hypercomplex</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• hypercomplex.create</li>
                    <li>• hypercomplex.multiply</li>
                    <li>• hypercomplex.normalize</li>
                    <li>• hypercomplex.conjugate</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-2">Prime Utilities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• prime.check</li>
                    <li>• prime.factorize</li>
                    <li>• prime.upTo</li>
                    <li>• prime.nth</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-2">Engine</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• engine.run</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiExamplesPage;
