import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hypercomplex number operations (Quaternion, Octonion, Sedenion)
class Hypercomplex {
  components: number[];
  
  constructor(components: number[]) {
    // Pad to power of 2
    const dim = Math.pow(2, Math.ceil(Math.log2(Math.max(components.length, 1))));
    this.components = [...components, ...Array(dim - components.length).fill(0)];
  }
  
  get dim(): number {
    return this.components.length;
  }
  
  norm(): number {
    return Math.sqrt(this.components.reduce((sum, c) => sum + c * c, 0));
  }
  
  entropy(): number {
    const n = this.norm();
    if (n === 0) return 0;
    const probs = this.components.map(c => (c * c) / (n * n));
    return -probs.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
  }
  
  coherence(): number {
    const maxEntropy = Math.log2(this.dim);
    return maxEntropy > 0 ? 1 - this.entropy() / maxEntropy : 1;
  }
  
  dominantAxes(topK = 3): { index: number; value: number; magnitude: number }[] {
    return this.components
      .map((v, i) => ({ index: i, value: v, magnitude: Math.abs(v) }))
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, topK);
  }
  
  normalize(): Hypercomplex {
    const n = this.norm();
    if (n === 0) return new Hypercomplex(this.components);
    return new Hypercomplex(this.components.map(c => c / n));
  }
  
  conjugate(): Hypercomplex {
    return new Hypercomplex([this.components[0], ...this.components.slice(1).map(c => -c)]);
  }
  
  add(other: Hypercomplex): Hypercomplex {
    const maxDim = Math.max(this.dim, other.dim);
    const a = [...this.components, ...Array(maxDim - this.dim).fill(0)];
    const b = [...other.components, ...Array(maxDim - other.dim).fill(0)];
    return new Hypercomplex(a.map((v, i) => v + b[i]));
  }
  
  scale(s: number): Hypercomplex {
    return new Hypercomplex(this.components.map(c => c * s));
  }
  
  // Cayley-Dickson multiplication
  multiply(other: Hypercomplex): Hypercomplex {
    const maxDim = Math.max(this.dim, other.dim);
    if (maxDim === 1) {
      return new Hypercomplex([this.components[0] * other.components[0]]);
    }
    
    const halfDim = maxDim / 2;
    const a = new Hypercomplex(this.components.slice(0, halfDim));
    const b = new Hypercomplex(this.components.slice(halfDim, maxDim) || Array(halfDim).fill(0));
    const c = new Hypercomplex(other.components.slice(0, halfDim));
    const d = new Hypercomplex(other.components.slice(halfDim, maxDim) || Array(halfDim).fill(0));
    
    // (a, b) * (c, d) = (ac - d*b, da + bc*)
    const dConj = d.conjugate();
    const cConj = c.conjugate();
    
    const real = a.multiply(c).add(dConj.multiply(b).scale(-1));
    const imag = d.multiply(a).add(b.multiply(cConj));
    
    return new Hypercomplex([...real.components, ...imag.components]);
  }
  
  toJSON() {
    return {
      components: this.components,
      dim: this.dim,
      norm: this.norm(),
      entropy: this.entropy(),
      coherence: this.coherence(),
      dominantAxes: this.dominantAxes(3)
    };
  }
}

// Prime number utilities
function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function factorize(n: number): number[] {
  if (n < 2) return [];
  const factors: number[] = [];
  let remaining = n;
  for (let p = 2; p <= Math.sqrt(remaining); p++) {
    while (remaining % p === 0) {
      factors.push(p);
      remaining /= p;
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

function primesUpTo(limit: number): number[] {
  const sieve = new Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i <= Math.sqrt(limit); i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) {
        sieve[j] = false;
      }
    }
  }
  return sieve.map((isPrime, i) => isPrime ? i : -1).filter(n => n > 0);
}

function nthPrime(n: number): number {
  if (n < 1) return 2;
  let count = 0;
  let candidate = 1;
  while (count < n) {
    candidate++;
    if (isPrime(candidate)) count++;
  }
  return candidate;
}

// Semantic engine (simplified version for backend)
interface EngineConfig {
  dims?: number;
  maxSteps?: number;
  collapseCoherence?: number;
  collapseEntropy?: number;
}

function runSemanticEngine(input: string, config: EngineConfig = {}) {
  const dims = config.dims || 16;
  const maxSteps = config.maxSteps || 100;
  const collapseCoherence = config.collapseCoherence || 0.85;
  const collapseEntropy = config.collapseEntropy || 0.5;
  
  // Initialize state from input hash
  const components = Array(dims).fill(0).map((_, i) => {
    const hash = input.split('').reduce((h, c, j) => h + c.charCodeAt(0) * (i + j + 1), 0);
    return Math.sin(hash) * 0.5;
  });
  
  let state = new Hypercomplex(components);
  const steps: { step: number; entropy: number; coherence: number }[] = [];
  
  // Evolution loop
  for (let step = 0; step < maxSteps; step++) {
    const entropy = state.entropy();
    const coherence = state.coherence();
    
    steps.push({ step, entropy, coherence });
    
    // Check collapse conditions
    if (coherence >= collapseCoherence || entropy <= collapseEntropy) {
      break;
    }
    
    // Apply evolution operator (rotation + contraction)
    const rotated = new Hypercomplex(
      state.components.map((c, i) => {
        const phase = (i / dims) * Math.PI * 2;
        return c * Math.cos(0.1) + state.components[(i + 1) % dims] * Math.sin(0.1) * Math.cos(phase);
      })
    );
    
    // Contract toward dominant axis
    const dominant = rotated.dominantAxes(1)[0];
    const contracted = rotated.components.map((c, i) => {
      const factor = i === dominant.index ? 1.05 : 0.98;
      return c * factor;
    });
    
    state = new Hypercomplex(contracted).normalize().scale(state.norm());
  }
  
  // Generate output from final state
  const dominant = state.dominantAxes(3);
  const output = dominant.map(d => `axis_${d.index}`).join(' ');
  
  return {
    input,
    output,
    finalState: state.toJSON(),
    steps,
    totalSteps: steps.length,
    converged: steps.length < maxSteps
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, params } = await req.json();
    
    console.log(`Processing operation: ${operation}`, params);
    
    let result: unknown;
    
    switch (operation) {
      case 'hypercomplex.create': {
        const h = new Hypercomplex(params.components || [1, 0, 0, 0]);
        result = h.toJSON();
        break;
      }
      
      case 'hypercomplex.multiply': {
        const a = new Hypercomplex(params.a || [1, 0, 0, 0]);
        const b = new Hypercomplex(params.b || [1, 0, 0, 0]);
        result = a.multiply(b).toJSON();
        break;
      }
      
      case 'hypercomplex.normalize': {
        const h = new Hypercomplex(params.components || [1, 0, 0, 0]);
        result = h.normalize().toJSON();
        break;
      }
      
      case 'hypercomplex.conjugate': {
        const h = new Hypercomplex(params.components || [1, 0, 0, 0]);
        result = h.conjugate().toJSON();
        break;
      }
      
      case 'prime.check': {
        result = { n: params.n, isPrime: isPrime(params.n) };
        break;
      }
      
      case 'prime.factorize': {
        result = { n: params.n, factors: factorize(params.n) };
        break;
      }
      
      case 'prime.upTo': {
        const limit = Math.min(params.limit || 100, 100000);
        result = { limit, primes: primesUpTo(limit) };
        break;
      }
      
      case 'prime.nth': {
        const n = Math.min(params.n || 1, 10000);
        result = { n, prime: nthPrime(n) };
        break;
      }
      
      case 'engine.run': {
        result = runSemanticEngine(params.input || '', {
          dims: params.dims,
          maxSteps: params.maxSteps,
          collapseCoherence: params.collapseCoherence,
          collapseEntropy: params.collapseEntropy
        });
        break;
      }
      
      default:
        return new Response(
          JSON.stringify({ 
            error: 'Unknown operation', 
            availableOperations: [
              'hypercomplex.create',
              'hypercomplex.multiply', 
              'hypercomplex.normalize',
              'hypercomplex.conjugate',
              'prime.check',
              'prime.factorize',
              'prime.upTo',
              'prime.nth',
              'engine.run'
            ]
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    console.log(`Operation ${operation} completed successfully`);
    
    return new Response(
      JSON.stringify({ success: true, operation, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in tinyaleph-compute:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
