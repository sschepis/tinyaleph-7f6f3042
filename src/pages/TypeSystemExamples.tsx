import { useState, useCallback, useMemo } from 'react';
import { Play, FileCode, GitMerge, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';

// Demo type system classes based on formal-semantics from v1.6.1
class NounTerm {
  constructor(public prime: number, public name?: string) {}
  signature() { return `N(${this.prime})`; }
  isWellFormed() { return this.isPrime(this.prime); }
  private isPrime(n: number) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  }
  toString() { return this.signature(); }
}

class AdjTerm {
  constructor(public prime: number, public name?: string) {}
  signature() { return `A(${this.prime})`; }
  canApplyTo(noun: NounTerm) { return this.prime < noun.prime; }
  isWellFormed() { return this.isPrime(this.prime); }
  private isPrime(n: number) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  }
  toString() { return this.signature(); }
}

class ChainTerm {
  constructor(public adjPrimes: number[], public noun: NounTerm) {}
  signature() { return this.adjPrimes.map(p => `A(${p})`).join('') + this.noun.signature(); }
  isWellFormed() {
    // All adjective primes must be less than noun prime
    const nounPrime = this.noun.prime;
    for (const p of this.adjPrimes) {
      if (p >= nounPrime) return false;
    }
    // Adjectives must be in increasing order
    for (let i = 1; i < this.adjPrimes.length; i++) {
      if (this.adjPrimes[i] <= this.adjPrimes[i - 1]) return false;
    }
    return true;
  }
  toString() { return this.signature(); }
}

class FusionTerm {
  public p: number;
  public q: number;
  public r: number;
  constructor(p: number, q: number, r: number) {
    this.p = p;
    this.q = q;
    this.r = r;
  }
  signature() { return `FUSE(${this.p}, ${this.q}, ${this.r})`; }
  getFusedPrime() { return this.p + this.q + this.r; }
  isWellFormed() {
    // All must be odd primes (> 2) and distinct
    if (this.p === this.q || this.q === this.r || this.p === this.r) return false;
    if (this.p <= 2 || this.q <= 2 || this.r <= 2) return false;
    if (!this.isPrime(this.p) || !this.isPrime(this.q) || !this.isPrime(this.r)) return false;
    // Sum must be prime
    return this.isPrime(this.p + this.q + this.r);
  }
  private isPrime(n: number) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  }
  static findTriads(target: number): FusionTerm[] {
    const results: FusionTerm[] = [];
    const isPrime = (n: number) => {
      if (n < 2) return false;
      for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
      return true;
    };
    const primes = [];
    for (let i = 3; i < target; i += 2) {
      if (isPrime(i)) primes.push(i);
    }
    for (let i = 0; i < primes.length; i++) {
      for (let j = i + 1; j < primes.length; j++) {
        const r = target - primes[i] - primes[j];
        if (r > primes[j] && isPrime(r)) {
          results.push(new FusionTerm(primes[i], primes[j], r));
        }
      }
    }
    return results;
  }
  toString() { return this.signature(); }
}

class TypeChecker {
  inferType(term: NounTerm | AdjTerm | ChainTerm | FusionTerm): string {
    if (term instanceof NounTerm) return 'N';
    if (term instanceof AdjTerm) return 'A';
    if (term instanceof ChainTerm) return 'N';
    if (term instanceof FusionTerm) return 'N';
    return 'unknown';
  }
  check(term: NounTerm | AdjTerm | ChainTerm | FusionTerm) {
    return term.isWellFormed();
  }
}

class ReductionSystem {
  step(term: FusionTerm | ChainTerm) {
    if (term instanceof FusionTerm) {
      const sum = term.getFusedPrime();
      return {
        before: term.signature(),
        rule: 'FUSE-reduce',
        after: `N(${sum})`,
        details: { sum }
      };
    }
    if (term instanceof ChainTerm) {
      // Simulate operator application
      let result = term.noun.prime;
      for (const adj of term.adjPrimes) {
        result = this.nextPrime(result + adj);
      }
      return {
        before: term.signature(),
        rule: 'CHAIN-reduce',
        after: `N(${result})`,
        details: { result }
      };
    }
    return { before: 'unknown', rule: 'none', after: 'unknown', details: {} };
  }
  
  normalize(term: ChainTerm) {
    const steps = [];
    let current = term.signature();
    let result = term.noun.prime;
    
    for (const adj of term.adjPrimes) {
      const newResult = this.nextPrime(result + adj);
      steps.push({
        before: { signature: () => current },
        rule: `⊕-apply(${adj})`,
        after: { signature: () => `N(${newResult})` },
        details: { operator: adj, operand: result, result: newResult }
      });
      result = newResult;
      current = `N(${result})`;
    }
    
    return {
      initial: term,
      steps,
      final: { signature: () => `N(${result})` }
    };
  }
  
  evaluate(term: FusionTerm | ChainTerm) {
    if (term instanceof FusionTerm) {
      return { prime: term.getFusedPrime() };
    }
    if (term instanceof ChainTerm) {
      let result = term.noun.prime;
      for (const adj of term.adjPrimes) {
        result = this.nextPrime(result + adj);
      }
      return { prime: result };
    }
    return { prime: 0 };
  }
  
  private nextPrime(n: number): number {
    let candidate = n;
    while (!this.isPrime(candidate)) candidate++;
    return candidate;
  }
  
  private isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  }
}

const TypeSystemExample = () => {
  const [selectedPrime, setSelectedPrime] = useState(7);
  const [adjPrimes, setAdjPrimes] = useState<number[]>([2, 3]);
  const [result, setResult] = useState<{
    term: string;
    type: string;
    isWellTyped: boolean;
    signature: string;
  } | null>(null);

  const checker = useMemo(() => new TypeChecker(), []);
  
  const primeOptions = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  
  const runTypeCheck = useCallback(() => {
    const noun = new NounTerm(selectedPrime);
    const chain = new ChainTerm(adjPrimes, noun);
    const type = checker.inferType(chain);
    const isValid = checker.check(chain);

    setResult({
      term: chain.signature(),
      type,
      isWellTyped: isValid,
      signature: chain.signature()
    });
  }, [selectedPrime, adjPrimes, checker]);

  const toggleAdj = (p: number) => {
    if (adjPrimes.includes(p)) {
      setAdjPrimes(adjPrimes.filter(x => x !== p));
    } else {
      setAdjPrimes([...adjPrimes, p].sort((a, b) => a - b));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <FileCode className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Prime-Indexed Type System</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Build typed terms with N(p) nouns and A(p) adjectives.
            The constraint A(p) can apply to N(q) only if p &lt; q.
          </p>

          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Noun Prime N(p)</label>
              <div className="flex flex-wrap gap-2">
                {primeOptions.map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPrime(p)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedPrime === p 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background border hover:bg-primary/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Adjective Primes A(p) <span className="text-muted-foreground">(must be &lt; {selectedPrime})</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {primeOptions.filter(p => p < selectedPrime).map(p => (
                  <button
                    key={p}
                    onClick={() => toggleAdj(p)}
                    className={`px-3 py-1 rounded text-sm ${
                      adjPrimes.includes(p)
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-background border hover:bg-accent/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={runTypeCheck}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Check Type
          </button>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="font-mono text-xs mb-2 text-primary">Type Grammar:</p>
            <pre className="text-xs text-muted-foreground overflow-x-auto">{`N(p)       ::= Noun indexed by prime p
A(p)       ::= Adjective indexed by prime p  
A(p)N(q)   ::= Well-formed if p < q
FUSE(p,q,r)::= Well-formed if p+q+r is prime`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          {result && (
            <>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Term</p>
                <p className="font-mono text-lg">{result.term}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Inferred Type</p>
                <p className="font-mono text-2xl text-primary">{result.type}</p>
              </div>

              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                result.isWellTyped 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
              }`}>
                {result.isWellTyped ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <X className="w-5 h-5 text-red-400" />
                )}
                <span>{result.isWellTyped ? 'Well-Typed ✓' : 'Type Error: p < q constraint violated'}</span>
              </div>
            </>
          )}

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Type Rules</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-primary">Γ ⊢ N(p) : N</span>
                <span className="text-muted-foreground">— noun formation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">Γ ⊢ A(p) : A</span>
                <span className="text-muted-foreground">— adjective formation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">p &lt; q ⊢ A(p)N(q) : N</span>
                <span className="text-muted-foreground">— chain rule</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReductionExample = () => {
  const [steps, setSteps] = useState<Array<{ term: string; rule: string; details?: string }>>([]);
  const [termType, setTermType] = useState<'chain' | 'fusion'>('chain');

  const runReduction = useCallback(() => {
    const system = new ReductionSystem();
    
    if (termType === 'chain') {
      const noun = new NounTerm(7);
      const chain = new ChainTerm([2, 3], noun);
      const trace = system.normalize(chain);
      
      const stepsData = [
        { term: trace.initial.signature(), rule: 'initial', details: 'Starting term' }
      ];
      
      for (const step of trace.steps) {
        stepsData.push({
          term: step.after.signature(),
          rule: step.rule,
          details: step.details ? `${step.details.operator} ⊕ ${step.details.operand} = ${step.details.result}` : undefined
        });
      }
      
      setSteps(stepsData);
    } else {
      const fusion = new FusionTerm(3, 5, 11);
      const step = system.step(fusion);
      
      setSteps([
        { term: step.before, rule: 'initial', details: 'FUSE(3, 5, 11)' },
        { term: step.after, rule: step.rule, details: `3 + 5 + 11 = ${step.details.sum}` }
      ]);
    }
  }, [termType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <GitMerge className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Reduction Semantics</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Strong normalization: every term reaches a unique normal form.
            The size strictly decreases at each step, ensuring termination.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setTermType('chain')}
              className={`px-4 py-2 rounded-lg text-sm ${
                termType === 'chain' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
            >
              Chain: A(2)A(3)N(7)
            </button>
            <button
              onClick={() => setTermType('fusion')}
              className={`px-4 py-2 rounded-lg text-sm ${
                termType === 'fusion' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
            >
              Fusion: FUSE(3,5,11)
            </button>
          </div>

          <button
            onClick={runReduction}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Run Reduction
          </button>

          <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm">
            <p className="text-muted-foreground mb-2">Reduction Rules:</p>
            <ul className="space-y-1 text-xs">
              <li>• <span className="text-primary">⊕-apply</span>: A(p)N(q) → N(nextPrime(p+q))</li>
              <li>• <span className="text-primary">FUSE-reduce</span>: FUSE(p,q,r) → N(p+q+r)</li>
              <li>• <span className="text-primary">CHAIN-reduce</span>: Sequential ⊕ application</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="text-sm font-medium text-green-400 mb-1">Strong Normalization Theorem</p>
            <p className="text-xs text-muted-foreground">
              If e → e', then |e'| &lt; |e|. This ensures no infinite reduction sequences.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {steps.length > 0 && (
            <>
              <p className="text-sm font-medium">Reduction Trace</p>
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-1 ${
                    i === steps.length - 1 ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
                  }`}>
                    {i === steps.length - 1 ? '✓' : i}
                  </span>
                  <div className="flex-1 p-3 rounded-lg bg-muted/50">
                    <p className="font-mono text-sm">{step.term}</p>
                    {step.rule !== 'initial' && (
                      <div className="flex items-center gap-2 mt-1">
                        <ArrowRight className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary">{step.rule}</span>
                      </div>
                    )}
                    {step.details && (
                      <p className="text-xs text-muted-foreground mt-1">{step.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FusionExample = () => {
  const [targetPrime, setTargetPrime] = useState(19);
  const [triads, setTriads] = useState<FusionTerm[]>([]);
  
  const findTriads = useCallback(() => {
    const results = FusionTerm.findTriads(targetPrime);
    setTriads(results);
  }, [targetPrime]);

  const isPrime = (n: number) => {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };

  const primeTargets = [19, 23, 29, 31, 37, 41, 43, 47];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Triadic Fusion FUSE(p, q, r)</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            FUSE(p, q, r) combines three distinct odd primes where their sum is also prime.
            Multiple valid triads may exist for a target—canonical selection uses lexicographic ordering.
          </p>

          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <label className="text-sm font-medium block">Target Prime</label>
            <div className="flex flex-wrap gap-2">
              {primeTargets.map(p => (
                <button
                  key={p}
                  onClick={() => { setTargetPrime(p); setTriads([]); }}
                  className={`px-3 py-1 rounded text-sm ${
                    targetPrime === p 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background border hover:bg-primary/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded ${isPrime(targetPrime) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isPrime(targetPrime) ? 'Prime ✓' : 'Not Prime ✗'}
              </span>
            </div>
          </div>

          <button
            onClick={findTriads}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Find Triads
          </button>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Fusion Rules</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• p, q, r must be distinct odd primes (&gt; 2)</li>
              <li>• p + q + r must be prime</li>
              <li>• Canonical: p ≤ q ≤ r (lexicographic first)</li>
              <li>• FUSE(p,q,r) → N(p+q+r)</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {triads.length > 0 ? (
            <>
              <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                <p className="text-sm font-medium mb-2">Canonical Triad</p>
                <div className="flex gap-4 items-center justify-center">
                  {[triads[0].p, triads[0].q, triads[0].r].map((p, i) => (
                    <div key={i} className="text-center">
                      <div className="text-3xl font-mono text-green-400">{p}</div>
                      <div className="text-xs text-muted-foreground">
                        {i === 0 ? 'p' : i === 1 ? 'q' : 'r'}
                      </div>
                    </div>
                  ))}
                  <div className="text-2xl text-muted-foreground">=</div>
                  <div className="text-3xl font-mono text-primary">{targetPrime}</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">All Valid Triads ({triads.length})</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {triads.map((t, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center p-2 rounded font-mono text-sm ${
                        i === 0 ? 'bg-green-500/20 text-green-400' : 'bg-background'
                      }`}
                    >
                      <span>FUSE({t.p}, {t.q}, {t.r})</span>
                      <span>{i === 0 ? '← CANONICAL' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-lg bg-muted/50 text-center text-muted-foreground">
              Click "Find Triads" to discover valid FUSE decompositions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LambdaExample = () => {
  const [expression, setExpression] = useState('(λx. x + 1)(5)');
  const [reductionSteps, setReductionSteps] = useState<Array<{ expr: string; rule: string }>>([]);
  const [showReduction, setShowReduction] = useState(false);

  const runBetaReduction = useCallback(() => {
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
        { expr: '(λy. y * 2)(6)', rule: 'β-reduce inner: 3 * 2 = 6' },
        { expr: '12', rule: 'β-reduce: 6 * 2 = 12' },
      ],
      'τ(N(7))': [
        { expr: 'τ(N(7))', rule: 'initial τ-translation' },
        { expr: '7', rule: 'τ-noun: τ(N(p)) = p' },
      ],
      'τ(A(3)N(7))': [
        { expr: 'τ(A(3)N(7))', rule: 'initial τ-translation' },
        { expr: 'τ(A(3))(τ(N(7)))', rule: 'τ-chain: τ(A·N) = τ(A)(τ(N))' },
        { expr: '(λx. x ⊕ 3)(7)', rule: 'expand τ(A(3)), τ(N(7))' },
        { expr: '7 ⊕ 3', rule: 'β-reduce' },
        { expr: '11', rule: '⊕-apply: nextPrime(10) = 11' },
      ],
      'τ(FUSE(3,5,11))': [
        { expr: 'τ(FUSE(3,5,11))', rule: 'initial τ-translation' },
        { expr: '3 + 5 + 11', rule: 'τ-fuse: τ(FUSE(p,q,r)) = p+q+r' },
        { expr: '19', rule: 'arithmetic reduction' },
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
    'τ(N(7))',
    'τ(A(3)N(7))',
    'τ(FUSE(3,5,11))',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Lambda Calculus & τ-Translation</h3>
      </div>

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
                {expr.length > 20 ? expr.slice(0, 20) + '...' : expr}
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
            <pre className="text-xs text-muted-foreground overflow-x-auto">{`τ(N(p))       = p           (constant)
τ(A(p))       = λx. x ⊕ p   (operator)
τ(A·N)        = τ(A)(τ(N))  (application)
τ(FUSE(p,q,r))= p + q + r   (sum)`}</pre>
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
                  <p className="font-mono text-sm break-all">{step.expr}</p>
                  {step.rule !== 'initial' && (
                    <div className="flex items-center gap-2 mt-1">
                      <ArrowRight className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary">{step.rule}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  {
    id: 'type-system',
    number: '1',
    title: 'Typed Terms',
    subtitle: 'Prime-indexed type system',
    description: 'Build typed terms with N(p) nouns and A(p) adjectives. The constraint A(p) can apply to N(q) only if p < q ensures well-formedness.',
    concepts: ['N(p) Nouns', 'A(p) Adjectives', 'p < q Constraint', 'Type Inference'],
    code: `import { N, A, CHAIN, TypeChecker } from '@aleph-ai/tinyaleph';

// Noun terms - N(p)
const truth = N(7);      // N(7) - indexed by prime 7
const light = N(11);     // N(11) - indexed by prime 11

// Adjective terms - A(p)
const dual = A(2);       // A(2) modifier
const triple = A(3);     // A(3) modifier

// Chain: A(p) applies to N(q) only if p < q
const modified = CHAIN([2, 3, 5], N(7));  // A(2)A(3)A(5)N(7)
console.log(modified.signature());         // "A(2)A(3)A(5)N(7)"
console.log(modified.isWellFormed());      // true: all primes < 7

// Type checking
const checker = new TypeChecker();
const type = checker.inferType(modified);  // "N"
console.log(checker.check(modified));      // true`,
    codeTitle: 'formal-semantics/01-typed-terms.js',
  },
  {
    id: 'reduction',
    number: '2',
    title: 'Reduction Semantics',
    subtitle: 'Strong normalization',
    description: 'The reduction system ensures every term reaches a unique normal form. Size strictly decreases at each step, guaranteeing termination.',
    concepts: ['⊕ Operators', 'Strong Normalization', 'Size Measure', 'Confluence'],
    code: `import { 
  ReductionSystem, 
  isNormalForm, 
  termSize,
  demonstrateStrongNormalization 
} from '@aleph-ai/tinyaleph';

const chain = CHAIN([2, 3], N(7));
const system = new ReductionSystem();

// Check term properties
console.log(isNormalForm(chain));  // false (reducible)
console.log(termSize(chain));       // size for termination measure

// Step-by-step reduction
const trace = system.normalize(chain);
for (const step of trace.steps) {
  console.log(\`\${step.before} →[\${step.rule}] \${step.after}\`);
}
// A(2)A(3)N(7) →[⊕-apply(3)] N(11)
// N(11) →[⊕-apply(2)] N(13)

// Prove strong normalization
const proof = demonstrateStrongNormalization(chain);
console.log('Size sequence:', proof.sizes);  // strictly decreasing
console.log('Terminates:', proof.verified);`,
    codeTitle: 'formal-semantics/02-reduction.js',
  },
  {
    id: 'fusion',
    number: '3',
    title: 'Triadic Fusion',
    subtitle: 'FUSE(p, q, r) operation',
    description: 'FUSE combines three distinct odd primes where their sum is also prime. Canonical selection uses lexicographic ordering for determinism.',
    concepts: ['Prime Triads', 'Sum Constraint', 'Canonical Selection', 'Determinism'],
    code: `import { FUSE, canonicalTriad, FusionTerm } from '@aleph-ai/tinyaleph';

// Create fusion term
const fusion = FUSE(3, 5, 11);  // 3 + 5 + 11 = 19 (prime)
console.log(fusion.isWellFormed());  // true
console.log(fusion.getFusedPrime()); // 19

// Invalid fusion (sum not prime)
const invalid = FUSE(2, 3, 5);  // 2 + 3 + 5 = 10 (not prime)
console.log(invalid.isWellFormed()); // false

// Find all valid triads for target prime
const triads = FusionTerm.findTriads(29);
console.log(triads.length);  // multiple triads possible

// Canonical selection (lexicographic first)
const canonical = canonicalTriad(29);
console.log(canonical);  // FUSE(3, 7, 19) - smallest p, then q`,
    codeTitle: 'formal-semantics/03-canonical-fusion.js',
  },
  {
    id: 'lambda',
    number: '4',
    title: 'Lambda Calculus',
    subtitle: 'τ-translation and β-reduction',
    description: 'The τ translation maps semantic terms to λ-expressions. β-reduction evaluates these to normal form, implementing the computation.',
    concepts: ['τ Translation', 'β-Reduction', 'Denotational Semantics', 'Evaluation'],
    code: `import { 
  Translator, LambdaEvaluator,
  N, A, CHAIN, FUSE 
} from '@aleph-ai/tinyaleph';

const translator = new Translator();
const evaluator = new LambdaEvaluator();

// τ(N(p)) = p (constant)
const lambdaNoun = translator.translate(N(7));
console.log(lambdaNoun.toString());  // "7"

// τ(A(p)) = λx. x ⊕ p (operator)
const lambdaAdj = translator.translate(A(3));
console.log(lambdaAdj.toString());  // "λx.(x ⊕ 3)"

// τ(A·N) = τ(A)(τ(N))
const chain = CHAIN([2, 3], N(7));
const lambdaChain = translator.translate(chain);
// ((λx.(x ⊕ 2))((λx.(x ⊕ 3)) 7))

// Evaluate via β-reduction
const result = evaluator.evaluate(lambdaChain);
console.log(result.result);  // Normal form value`,
    codeTitle: 'formal-semantics/03-lambda-translation.js',
  },
];

const exampleComponents: Record<string, React.FC> = {
  'type-system': TypeSystemExample,
  'reduction': ReductionExample,
  'fusion': FusionExample,
  'lambda': LambdaExample,
};

const TypeSystemExamplesPage = () => {
  return (
    <ExamplePageWrapper
      category="Type System"
      title="Formal Semantics"
      description="Prime-indexed type system with typed terms, reduction semantics, triadic fusion, and lambda calculus translation."
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'Scientific', path: '/scientific' }}
      nextSection={{ title: 'Enochian', path: '/enochian' }}
    />
  );
};

export default TypeSystemExamplesPage;
