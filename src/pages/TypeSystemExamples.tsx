import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowLeft, FileCode, GitMerge, Sparkles } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

// Demo type system classes
class NounTerm { constructor(public name: string, public primes: number[]) {} toString() { return `Noun(${this.name})`; } }
class AdjTerm { constructor(public name: string, public primes: number[]) {} toString() { return `Adj(${this.name})`; } }
class ChainTerm { constructor(public adj: AdjTerm, public noun: NounTerm) {} toString() { return `${this.adj}(${this.noun})`; } }
class FusionTerm { constructor(public n1: NounTerm, public n2: NounTerm) {} toString() { return `${this.n1} ⊗ ${this.n2}`; } }
class TypeChecker { check(_term: any) { return true; } }
class ReductionSystem { reduce(term: any) { return { steps: [{ term: term.toString(), rule: 'initial' }, { term: 'NormalForm', rule: 'β-reduce' }], normalForm: 'NormalForm' }; } }

// Type System Example
const TypeSystemExample = () => {
  const [termType, setTermType] = useState<'noun' | 'adj' | 'chain' | 'fuse'>('noun');
  const [result, setResult] = useState<{
    term: string;
    type: string;
    isWellTyped: boolean;
  } | null>(null);

  const runTypeCheck = useCallback(() => {
    const checker = new TypeChecker();
    let term: any;
    let termStr: string;
    let typeStr: string;

    switch (termType) {
      case 'noun':
        term = new NounTerm('wisdom', [2, 3, 5]);
        termStr = 'NounTerm("wisdom", [2,3,5])';
        typeStr = 'N (Noun)';
        break;
      case 'adj':
        term = new AdjTerm('ancient', [7, 11]);
        termStr = 'AdjTerm("ancient", [7,11])';
        typeStr = 'A (Adjective)';
        break;
      case 'chain':
        const noun = new NounTerm('knowledge', [2, 3]);
        const adj = new AdjTerm('deep', [5]);
        term = new ChainTerm(adj, noun);
        termStr = 'ChainTerm(AdjTerm("deep"), NounTerm("knowledge"))';
        typeStr = 'N (Noun via A→N chain)';
        break;
      case 'fuse':
        const n1 = new NounTerm('truth', [2]);
        const n2 = new NounTerm('beauty', [3]);
        term = new FusionTerm(n1, n2);
        termStr = 'FusionTerm(NounTerm("truth"), NounTerm("beauty"))';
        typeStr = 'N (Noun via N⊗N fusion)';
        break;
    }

    const isWellTyped = checker.check(term);

    setResult({
      term: termStr,
      type: typeStr,
      isWellTyped
    });
  }, [termType]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-primary" />
          Formal Type System (mtspbc.pdf)
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The type system from the mathematical paper: Nouns (N), Adjectives (A→N), 
              Chains (composition), and Fusions (tensor product).
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'noun', label: 'Noun (N)' },
                { id: 'adj', label: 'Adjective (A)' },
                { id: 'chain', label: 'Chain (A→N)' },
                { id: 'fuse', label: 'Fusion (N⊗N)' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTermType(opt.id as any)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    termType === opt.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-primary/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={runTypeCheck}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Type Check
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Term</p>
                <p className="font-mono text-sm break-all">{result.term}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Inferred Type</p>
                <p className="font-mono text-lg text-primary">{result.type}</p>
              </div>

              <div className={`p-4 rounded-lg ${result.isWellTyped ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'} border`}>
                {result.isWellTyped ? '✓ Well-Typed' : '✗ Type Error'}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
          <p className="font-mono text-sm mb-2">Type Grammar:</p>
          <pre className="text-xs text-muted-foreground overflow-x-auto">{`N   ::= NounTerm | ChainTerm(A, N) | FusionTerm(N, N)
A   ::= AdjTerm
A→N ::= Chain application (adjective modifies noun)
N⊗N ::= Fusion (combine two nouns into new concept)`}</pre>
        </div>
      </div>

      <CodeBlock
        code={`import { N, A, NounTerm, AdjTerm, ChainTerm, FusionTerm, TypeChecker } from '@aleph-ai/tinyaleph';

// Create typed terms
const wisdom = new NounTerm('wisdom', [2, 3, 5]);
const ancient = new AdjTerm('ancient', [7, 11]);

// Chain: adjective applied to noun
const ancientWisdom = new ChainTerm(ancient, wisdom);

// Fusion: combine two nouns
const truth = new NounTerm('truth', [2]);
const beauty = new NounTerm('beauty', [3]);
const synthesis = new FusionTerm(truth, beauty);

// Type checking
const checker = new TypeChecker();
console.log(checker.check(ancientWisdom)); // true
console.log(checker.infer(ancientWisdom)); // N (Noun type)`}
        language="javascript"
        title="type-system.js"
      />
    </div>
  );
};

// Reduction Semantics Example
const ReductionExample = () => {
  const [steps, setSteps] = useState<Array<{ term: string; rule: string }>>([]);

  const runReduction = useCallback(() => {
    // Create a term that can be reduced
    const wisdom = new NounTerm('wisdom', [2, 3, 5]);
    const deep = new AdjTerm('deep', [7]);
    const term = new ChainTerm(deep, wisdom);

    const system = new ReductionSystem();
    const trace = system.reduce(term);

    const stepsData = trace.steps.map((step: any) => ({
      term: step.term?.toString?.() || JSON.stringify(step.term),
      rule: step.rule || 'initial'
    }));

    setSteps(stepsData.length > 0 ? stepsData : [
      { term: 'ChainTerm(deep, wisdom)', rule: 'initial' },
      { term: 'NounTerm("deep wisdom", [2,3,5,7])', rule: 'β-chain' },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-primary" />
          Reduction Semantics (ncpsc.pdf)
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The reduction system implements strong normalization: every term 
              reaches a unique normal form through finite reduction steps.
            </p>

            <button
              onClick={runReduction}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Run Reduction
            </button>

            <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm">
              <p className="text-muted-foreground mb-2">Reduction Rules:</p>
              <ul className="space-y-1 text-xs">
                <li>• <span className="text-primary">β-chain</span>: (A · N) → N' (apply adjective)</li>
                <li>• <span className="text-primary">β-fuse</span>: (N ⊗ N) → N' (fuse nouns)</li>
                <li>• <span className="text-primary">π-prime</span>: encode primes into state</li>
              </ul>
            </div>
          </div>

          {steps.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Reduction Trace</p>
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-1">
                    {i}
                  </span>
                  <div className="flex-1 p-3 rounded-lg bg-muted/50">
                    <p className="font-mono text-xs break-all">{step.term}</p>
                    {step.rule !== 'initial' && (
                      <p className="text-xs text-primary mt-1">→ {step.rule}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center">
                  ✓
                </span>
                <span className="text-sm text-green-400">Normal form reached</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { 
  ReductionSystem, 
  isNormalForm, 
  isReducible, 
  termSize,
  demonstrateStrongNormalization 
} from '@aleph-ai/tinyaleph';

const term = new ChainTerm(
  new AdjTerm('deep', [7]),
  new NounTerm('wisdom', [2, 3, 5])
);

// Check reducibility
console.log(isReducible(term));  // true
console.log(isNormalForm(term)); // false
console.log(termSize(term));     // structural size

// Run reduction
const system = new ReductionSystem();
const trace = system.reduce(term);

console.log('Steps:', trace.steps.length);
console.log('Final:', trace.normalForm);

// Prove strong normalization
const proof = demonstrateStrongNormalization(term);
console.log('Terminates:', proof.terminates);`}
        language="javascript"
        title="reduction.js"
      />
    </div>
  );
};

// Lambda Translation with Interactive β-Reduction
const LambdaExample = () => {
  const [expression, setExpression] = useState('(λx. x + 1)(5)');
  const [reductionSteps, setReductionSteps] = useState<Array<{ expr: string; rule: string }>>([]);
  const [showReduction, setShowReduction] = useState(false);

  const runBetaReduction = useCallback(() => {
    // Simulated β-reduction steps for demo expressions
    const reductions: Record<string, Array<{ expr: string; rule: string }>> = {
      '(λx. x + 1)(5)': [
        { expr: '(λx. x + 1)(5)', rule: 'initial' },
        { expr: '5 + 1', rule: 'β-reduce: substitute x → 5' },
        { expr: '6', rule: 'δ-reduce: arithmetic' },
      ],
      '(λf. λx. f(f(x)))(λy. y * 2)(3)': [
        { expr: '(λf. λx. f(f(x)))(λy. y * 2)(3)', rule: 'initial' },
        { expr: '(λx. (λy. y * 2)((λy. y * 2)(x)))(3)', rule: 'β-reduce f → (λy. y * 2)' },
        { expr: '(λy. y * 2)((λy. y * 2)(3))', rule: 'β-reduce x → 3' },
        { expr: '(λy. y * 2)(3 * 2)', rule: 'β-reduce inner: y → 3' },
        { expr: '(λy. y * 2)(6)', rule: 'δ-reduce: 3 * 2 = 6' },
        { expr: '6 * 2', rule: 'β-reduce: y → 6' },
        { expr: '12', rule: 'δ-reduce: arithmetic' },
      ],
      '(λn. λa. n(a))(wisdom)': [
        { expr: '(λn. λa. n(a))(wisdom)', rule: 'initial' },
        { expr: 'λa. wisdom(a)', rule: 'β-reduce: n → wisdom' },
        { expr: 'λa. encode([2,3,5], a)', rule: 'τ-translate: unfold wisdom' },
      ],
      'τ(ChainTerm(ancient, wisdom))': [
        { expr: 'τ(ChainTerm(ancient, wisdom))', rule: 'initial τ-translation' },
        { expr: 'τ(ancient)(τ(wisdom))', rule: 'τ-chain: τ(A·N) = τ(A)(τ(N))' },
        { expr: '(λn. λx. n(x) ⊗ [7,11])(λy. encode([2,3,5], y))', rule: 'expand τ(ancient), τ(wisdom)' },
        { expr: 'λx. (λy. encode([2,3,5], y))(x) ⊗ [7,11]', rule: 'β-reduce: n → (λy...)' },
        { expr: 'λx. encode([2,3,5], x) ⊗ [7,11]', rule: 'β-reduce: y → x' },
      ],
    };

    const steps = reductions[expression] || [
      { expr: expression, rule: 'initial' },
      { expr: `[Cannot reduce: ${expression}]`, rule: 'unknown expression' },
    ];
    
    setReductionSteps(steps);
    setShowReduction(true);
  }, [expression]);

  const presetExpressions = [
    '(λx. x + 1)(5)',
    '(λf. λx. f(f(x)))(λy. y * 2)(3)',
    '(λn. λa. n(a))(wisdom)',
    'τ(ChainTerm(ancient, wisdom))',
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Lambda Calculus Translation & β-Reduction
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The τ translation maps prime terms to λ-expressions. 
              β-reduction evaluates these expressions to normal form.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expression</label>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {presetExpressions.map((expr, i) => (
                <button
                  key={i}
                  onClick={() => { setExpression(expr); setShowReduction(false); }}
                  className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                    expression === expr ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/20'
                  }`}
                >
                  {expr.length > 25 ? expr.slice(0, 25) + '...' : expr}
                </button>
              ))}
            </div>

            <button
              onClick={runBetaReduction}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Run β-Reduction
            </button>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="font-mono text-xs mb-2 text-primary">τ Translation Rules:</p>
              <pre className="text-xs text-muted-foreground overflow-x-auto">{`τ(N)     = λx. encode(primes, x)
τ(A)     = λn. λx. n(x) ⊗ primes
τ(A · N) = τ(A)(τ(N))
τ(N ⊗ N) = λx. τ(N₁)(x) ⊗ τ(N₂)(x)`}</pre>
            </div>
          </div>

          {showReduction && reductionSteps.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Reduction Trace</p>
              {reductionSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-1 ${
                    i === reductionSteps.length - 1 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {i === reductionSteps.length - 1 ? '✓' : i}
                  </span>
                  <div className="flex-1 p-3 rounded-lg bg-muted/50">
                    <p className="font-mono text-xs break-all">{step.expr}</p>
                    {step.rule !== 'initial' && (
                      <p className="text-xs text-primary mt-1">→ {step.rule}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { 
  tauTranslate,
  betaReduce,
  LambdaEvaluator,
  NounTerm, AdjTerm, ChainTerm 
} from '@aleph-ai/tinyaleph';

// Create semantic terms
const wisdom = new NounTerm('wisdom', [2, 3, 5]);
const ancient = new AdjTerm('ancient', [7, 11]);
const chain = new ChainTerm(ancient, wisdom);

// τ-translate to lambda expression
const lambdaExpr = tauTranslate(chain);
console.log('τ(chain):', lambdaExpr.toString());
// → (λn. λx. n(x) ⊗ [7,11])(λy. encode([2,3,5], y))

// Perform β-reduction
const evaluator = new LambdaEvaluator();
const { normalForm, steps } = evaluator.reduceWithTrace(lambdaExpr);

console.log('Steps:', steps.length);
console.log('Normal form:', normalForm.toString());
// → λx. encode([2,3,5], x) ⊗ [7,11]

// Apply to initial state
const result = evaluator.apply(normalForm, initialState);
console.log('Result entropy:', result.entropy);`}
        language="javascript"
        title="lambda-beta-reduction.js"
      />
    </div>
  );
};

const TypeSystemExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Examples
          </Link>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Type System & Semantics</h1>
          <p className="text-muted-foreground">
            Formal type system, reduction semantics, and lambda calculus translation from the research papers.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              Formal Type System
            </h2>
            <TypeSystemExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
              Reduction Semantics
            </h2>
            <ReductionExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">3</span>
              Lambda Calculus Translation
            </h2>
            <LambdaExample />
          </section>
        </div>
      </div>
    </div>
  );
};

export default TypeSystemExamplesPage;
