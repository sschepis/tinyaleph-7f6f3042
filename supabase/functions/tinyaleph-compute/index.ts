import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Rate limiting storage (in-memory, resets on function restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

// Import shared CORS config
import { getCorsHeaders, handleCorsPreflightIfNeeded } from '../_shared/cors.ts';

// Input validation constants
const MAX_ARRAY_SIZE = 1000;
const MAX_DIMS = 64;
const MAX_PRIME_LIMIT = 10000;
const MAX_NTH_PRIME = 1000;
const MAX_ENGINE_STEPS = 100;
const MAX_INPUT_LENGTH = 1000;

// Allowed operations whitelist
const ALLOWED_OPERATIONS = [
  'hypercomplex.create',
  'hypercomplex.multiply',
  'hypercomplex.normalize',
  'hypercomplex.conjugate',
  'prime.check',
  'prime.factorize',
  'prime.upTo',
  'prime.nth',
  'engine.run'
];

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
  const dims = Math.min(config.dims || 16, MAX_DIMS);
  const maxSteps = Math.min(config.maxSteps || 100, MAX_ENGINE_STEPS);
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
    input: input.substring(0, 100), // Truncate in response
    output,
    finalState: state.toJSON(),
    steps,
    totalSteps: steps.length,
    converged: steps.length < maxSteps
  };
}

// Input validation helper
function validateParams(operation: string, params: Record<string, unknown>): { valid: boolean; error?: string } {
  switch (operation) {
    case 'hypercomplex.create':
    case 'hypercomplex.normalize':
    case 'hypercomplex.conjugate': {
      const components = params.components as number[] | undefined;
      if (components && (!Array.isArray(components) || components.length > MAX_ARRAY_SIZE)) {
        return { valid: false, error: `Components array must have at most ${MAX_ARRAY_SIZE} elements` };
      }
      if (components && !components.every(c => typeof c === 'number' && isFinite(c))) {
        return { valid: false, error: 'All components must be finite numbers' };
      }
      break;
    }
    case 'hypercomplex.multiply': {
      const a = params.a as number[] | undefined;
      const b = params.b as number[] | undefined;
      if ((a && a.length > MAX_ARRAY_SIZE) || (b && b.length > MAX_ARRAY_SIZE)) {
        return { valid: false, error: `Arrays must have at most ${MAX_ARRAY_SIZE} elements` };
      }
      break;
    }
    case 'prime.check':
    case 'prime.factorize': {
      const n = params.n as number;
      if (typeof n !== 'number' || !isFinite(n) || n < 0 || n > 1e9) {
        return { valid: false, error: 'n must be a positive number <= 1 billion' };
      }
      break;
    }
    case 'prime.upTo': {
      const limit = params.limit as number;
      if (typeof limit !== 'number' || limit > MAX_PRIME_LIMIT) {
        return { valid: false, error: `limit must be at most ${MAX_PRIME_LIMIT}` };
      }
      break;
    }
    case 'prime.nth': {
      const n = params.n as number;
      if (typeof n !== 'number' || n > MAX_NTH_PRIME) {
        return { valid: false, error: `n must be at most ${MAX_NTH_PRIME}` };
      }
      break;
    }
    case 'engine.run': {
      const input = params.input as string;
      if (typeof input !== 'string' || input.length > MAX_INPUT_LENGTH) {
        return { valid: false, error: `input must be a string with at most ${MAX_INPUT_LENGTH} characters` };
      }
      break;
    }
  }
  return { valid: true };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(req);
  const { allowed, remaining } = checkRateLimit(rateLimitKey);
  
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60'
        } 
      }
    );
  }

  try {
    const body = await req.text();
    if (body.length > 50000) {
      return new Response(
        JSON.stringify({ error: 'Request body too large' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { operation, params = {} } = JSON.parse(body);
    
    // Validate operation is allowed
    if (!operation || typeof operation !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Operation is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!ALLOWED_OPERATIONS.includes(operation)) {
      return new Response(
        JSON.stringify({ 
          error: 'Unknown operation', 
          availableOperations: ALLOWED_OPERATIONS
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate params
    const validation = validateParams(operation, params);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing operation: ${operation}`);
    
    let result: unknown;
    
    switch (operation) {
      case 'hypercomplex.create': {
        const components = (params.components || [1, 0, 0, 0]).slice(0, MAX_ARRAY_SIZE);
        const h = new Hypercomplex(components);
        result = h.toJSON();
        break;
      }
      
      case 'hypercomplex.multiply': {
        const a = new Hypercomplex((params.a || [1, 0, 0, 0]).slice(0, MAX_ARRAY_SIZE));
        const b = new Hypercomplex((params.b || [1, 0, 0, 0]).slice(0, MAX_ARRAY_SIZE));
        result = a.multiply(b).toJSON();
        break;
      }
      
      case 'hypercomplex.normalize': {
        const components = (params.components || [1, 0, 0, 0]).slice(0, MAX_ARRAY_SIZE);
        const h = new Hypercomplex(components);
        result = h.normalize().toJSON();
        break;
      }
      
      case 'hypercomplex.conjugate': {
        const components = (params.components || [1, 0, 0, 0]).slice(0, MAX_ARRAY_SIZE);
        const h = new Hypercomplex(components);
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
        const limit = Math.min(params.limit || 100, MAX_PRIME_LIMIT);
        result = { limit, primes: primesUpTo(limit) };
        break;
      }
      
      case 'prime.nth': {
        const n = Math.min(params.n || 1, MAX_NTH_PRIME);
        result = { n, prime: nthPrime(n) };
        break;
      }
      
      case 'engine.run': {
        const input = (params.input || '').substring(0, MAX_INPUT_LENGTH);
        result = runSemanticEngine(input, {
          dims: Math.min(params.dims || 16, MAX_DIMS),
          maxSteps: Math.min(params.maxSteps || 100, MAX_ENGINE_STEPS),
          collapseCoherence: params.collapseCoherence,
          collapseEntropy: params.collapseEntropy
        });
        break;
      }
    }
    
    console.log(`Operation ${operation} completed successfully`);
    
    return new Response(
      JSON.stringify({ success: true, operation, result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(remaining)
        } 
      }
    );
    
  } catch (error) {
    console.error('Error in tinyaleph-compute:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
