import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// TensorFlow.js operations implemented natively for edge runtime
// Since tf.js has heavy dependencies, we implement core tensor operations directly

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
const MAX_ARRAY_SIZE = 10000;
const MAX_TENSOR_ELEMENTS = 100000;
const MAX_LAYERS = 10;
const MAX_SVD_COMPONENTS = 50;
const MAX_ITERATIONS = 100;

// Allowed operations whitelist
const ALLOWED_OPERATIONS = [
  'tensor.create', 'tensor.zeros', 'tensor.ones', 'tensor.random', 'tensor.randomNormal',
  'tensor.add', 'tensor.sub', 'tensor.mul', 'tensor.matmul', 'tensor.transpose',
  'activation.relu', 'activation.sigmoid', 'activation.tanh', 'activation.softmax',
  'nn.dense', 'nn.sequential',
  'loss.mse', 'loss.crossEntropy',
  'conv.conv1d', 'pool.max1d', 'pool.avg1d',
  'decomposition.svd', 'decomposition.pca',
  'stats.describe'
];

// Tensor class for matrix operations
class Tensor {
  data: number[];
  shape: number[];

  constructor(data: number[] | number[][], shape?: number[]) {
    if (Array.isArray(data[0])) {
      // 2D array input
      const flat = (data as number[][]).flat();
      this.data = flat;
      this.shape = [(data as number[][]).length, (data as number[][])[0].length];
    } else {
      this.data = data as number[];
      this.shape = shape || [data.length];
    }
  }

  static zeros(shape: number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    return new Tensor(new Array(size).fill(0), shape);
  }

  static ones(shape: number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    return new Tensor(new Array(size).fill(1), shape);
  }

  static random(shape: number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    return new Tensor(Array.from({ length: size }, () => Math.random()), shape);
  }

  static randomNormal(shape: number[], mean = 0, stdDev = 1): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    const data: number[] = [];
    for (let i = 0; i < size; i++) {
      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      data.push(mean + z * stdDev);
    }
    return new Tensor(data, shape);
  }

  add(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      return new Tensor(this.data.map(x => x + other), this.shape);
    }
    return new Tensor(this.data.map((x, i) => x + other.data[i]), this.shape);
  }

  sub(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      return new Tensor(this.data.map(x => x - other), this.shape);
    }
    return new Tensor(this.data.map((x, i) => x - other.data[i]), this.shape);
  }

  mul(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      return new Tensor(this.data.map(x => x * other), this.shape);
    }
    return new Tensor(this.data.map((x, i) => x * other.data[i]), this.shape);
  }

  div(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      return new Tensor(this.data.map(x => x / other), this.shape);
    }
    return new Tensor(this.data.map((x, i) => x / other.data[i]), this.shape);
  }

  matmul(other: Tensor): Tensor {
    if (this.shape.length !== 2 || other.shape.length !== 2) {
      throw new Error('matmul requires 2D tensors');
    }
    if (this.shape[1] !== other.shape[0]) {
      throw new Error(`Shape mismatch: ${this.shape} vs ${other.shape}`);
    }

    const [m, n] = this.shape;
    const p = other.shape[1];
    const result: number[] = [];

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < p; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += this.data[i * n + k] * other.data[k * p + j];
        }
        result.push(sum);
      }
    }

    return new Tensor(result, [m, p]);
  }

  transpose(): Tensor {
    if (this.shape.length !== 2) {
      throw new Error('transpose requires 2D tensor');
    }
    const [rows, cols] = this.shape;
    const result: number[] = [];
    for (let j = 0; j < cols; j++) {
      for (let i = 0; i < rows; i++) {
        result.push(this.data[i * cols + j]);
      }
    }
    return new Tensor(result, [cols, rows]);
  }

  reshape(newShape: number[]): Tensor {
    const size = this.shape.reduce((a, b) => a * b, 1);
    const newSize = newShape.reduce((a, b) => a * b, 1);
    if (size !== newSize) {
      throw new Error(`Cannot reshape ${this.shape} to ${newShape}`);
    }
    return new Tensor([...this.data], newShape);
  }

  sum(): number {
    return this.data.reduce((a, b) => a + b, 0);
  }

  mean(): number {
    return this.sum() / this.data.length;
  }

  max(): number {
    return Math.max(...this.data);
  }

  min(): number {
    return Math.min(...this.data);
  }

  argmax(): number {
    let maxIdx = 0;
    let maxVal = this.data[0];
    for (let i = 1; i < this.data.length; i++) {
      if (this.data[i] > maxVal) {
        maxVal = this.data[i];
        maxIdx = i;
      }
    }
    return maxIdx;
  }

  toJSON() {
    return {
      data: this.data,
      shape: this.shape,
      size: this.data.length,
    };
  }
}

// Activation functions
const activations = {
  relu: (x: number) => Math.max(0, x),
  sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
  tanh: (x: number) => Math.tanh(x),
  softmax: (data: number[]): number[] => {
    const max = Math.max(...data);
    const exps = data.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
  },
  leakyRelu: (x: number, alpha = 0.01) => x > 0 ? x : alpha * x,
};

// Simple dense layer
class DenseLayer {
  weights: Tensor;
  bias: Tensor;
  activation: string;

  constructor(inputSize: number, outputSize: number, activation = 'relu') {
    // Xavier initialization
    const scale = Math.sqrt(2 / (inputSize + outputSize));
    this.weights = Tensor.randomNormal([inputSize, outputSize], 0, scale);
    this.bias = Tensor.zeros([outputSize]);
    this.activation = activation;
  }

  forward(input: Tensor): Tensor {
    // Ensure input is 2D [batch, features]
    let x = input;
    if (input.shape.length === 1) {
      x = input.reshape([1, input.shape[0]]);
    }

    // Linear transformation
    let output = x.matmul(this.weights);
    output = output.add(this.bias);

    // Apply activation
    if (this.activation === 'softmax') {
      const softmaxData = activations.softmax(output.data);
      return new Tensor(softmaxData, output.shape);
    }

    const activationFn = activations[this.activation as keyof typeof activations];
    if (activationFn && typeof activationFn === 'function') {
      return new Tensor(output.data.map(x => (activationFn as (x: number) => number)(x)), output.shape);
    }

    return output;
  }

  toJSON() {
    return {
      weights: this.weights.toJSON(),
      bias: this.bias.toJSON(),
      activation: this.activation,
    };
  }
}

// Simple sequential model
class Sequential {
  layers: DenseLayer[] = [];

  addLayer(inputSize: number, outputSize: number, activation = 'relu') {
    this.layers.push(new DenseLayer(inputSize, outputSize, activation));
  }

  predict(input: Tensor): Tensor {
    let x = input;
    for (const layer of this.layers) {
      x = layer.forward(x);
    }
    return x;
  }

  toJSON() {
    return {
      layers: this.layers.map(l => l.toJSON()),
      numLayers: this.layers.length,
    };
  }
}

// Loss functions
const losses = {
  mse: (predicted: Tensor, actual: Tensor): number => {
    const diff = predicted.sub(actual);
    const squared = diff.mul(diff);
    return squared.mean();
  },
  crossEntropy: (predicted: Tensor, actual: Tensor): number => {
    const epsilon = 1e-7;
    let loss = 0;
    for (let i = 0; i < predicted.data.length; i++) {
      const p = Math.max(epsilon, Math.min(1 - epsilon, predicted.data[i]));
      loss -= actual.data[i] * Math.log(p);
    }
    return loss / predicted.data.length;
  },
};

// Convolution operation (1D)
function conv1d(input: number[], kernel: number[], stride = 1): number[] {
  const outputLength = Math.floor((input.length - kernel.length) / stride) + 1;
  const output: number[] = [];
  for (let i = 0; i < outputLength; i++) {
    let sum = 0;
    for (let j = 0; j < kernel.length; j++) {
      sum += input[i * stride + j] * kernel[j];
    }
    output.push(sum);
  }
  return output;
}

// Pooling operations
function maxPool1d(input: number[], poolSize: number, stride?: number): number[] {
  const s = stride || poolSize;
  const outputLength = Math.floor((input.length - poolSize) / s) + 1;
  const output: number[] = [];
  for (let i = 0; i < outputLength; i++) {
    const window = input.slice(i * s, i * s + poolSize);
    output.push(Math.max(...window));
  }
  return output;
}

function avgPool1d(input: number[], poolSize: number, stride?: number): number[] {
  const s = stride || poolSize;
  const outputLength = Math.floor((input.length - poolSize) / s) + 1;
  const output: number[] = [];
  for (let i = 0; i < outputLength; i++) {
    const window = input.slice(i * s, i * s + poolSize);
    output.push(window.reduce((a, b) => a + b, 0) / poolSize);
  }
  return output;
}

// SVD approximation using power iteration
function svdApprox(matrix: Tensor, numComponents = 2, iterations = 100): { U: Tensor; S: number[]; V: Tensor } {
  const [m, n] = matrix.shape;
  const U: number[][] = [];
  const S: number[] = [];
  const V: number[][] = [];

  let A = new Tensor([...matrix.data], matrix.shape);

  for (let k = 0; k < numComponents; k++) {
    // Power iteration
    let v = Tensor.random([n]);
    
    for (let iter = 0; iter < iterations; iter++) {
      // u = A * v
      const u_data: number[] = [];
      for (let i = 0; i < m; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          sum += A.data[i * n + j] * v.data[j];
        }
        u_data.push(sum);
      }
      const u = new Tensor(u_data, [m]);
      const u_norm = Math.sqrt(u.data.reduce((a, b) => a + b * b, 0));
      const u_normalized = u.div(u_norm || 1);

      // v = A^T * u
      const v_data: number[] = [];
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let i = 0; i < m; i++) {
          sum += A.data[i * n + j] * u_normalized.data[i];
        }
        v_data.push(sum);
      }
      v = new Tensor(v_data, [n]);
      const v_norm = Math.sqrt(v.data.reduce((a, b) => a + b * b, 0));
      v = v.div(v_norm || 1);
    }

    // Compute singular value
    const Av: number[] = [];
    for (let i = 0; i < m; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += A.data[i * n + j] * v.data[j];
      }
      Av.push(sum);
    }
    const sigma = Math.sqrt(Av.reduce((a, b) => a + b * b, 0));
    const u_final = new Tensor(Av.map(x => x / (sigma || 1)), [m]);

    U.push(u_final.data);
    S.push(sigma);
    V.push(v.data);

    // Deflate matrix
    const newData: number[] = [];
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        newData.push(A.data[i * n + j] - sigma * u_final.data[i] * v.data[j]);
      }
    }
    A = new Tensor(newData, [m, n]);
  }

  return {
    U: new Tensor(U.flat(), [m, numComponents]),
    S,
    V: new Tensor(V.flat(), [numComponents, n]),
  };
}

// PCA using SVD
function pca(data: Tensor, numComponents = 2): { transformed: Tensor; components: Tensor; explainedVariance: number[] } {
  const [n, d] = data.shape;
  
  // Center the data
  const means: number[] = [];
  for (let j = 0; j < d; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += data.data[i * d + j];
    }
    means.push(sum / n);
  }
  
  const centered: number[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      centered.push(data.data[i * d + j] - means[j]);
    }
  }
  const centeredTensor = new Tensor(centered, [n, d]);
  
  // SVD
  const { U, S, V } = svdApprox(centeredTensor, numComponents);
  
  // Transform data
  const transformed = centeredTensor.matmul(V.transpose());
  
  // Explained variance
  const totalVar = S.reduce((a, b) => a + b * b, 0);
  const explainedVariance = S.map(s => (s * s) / totalVar);
  
  return { transformed, components: V, explainedVariance };
}

// Input validation helper
function validateTensorParams(params: Record<string, unknown>, operation: string): { valid: boolean; error?: string } {
  // Validate shape if present
  if (params.shape) {
    const shape = params.shape as number[];
    if (!Array.isArray(shape) || shape.length === 0 || shape.length > 4) {
      return { valid: false, error: 'Shape must be an array of 1-4 dimensions' };
    }
    const totalElements = shape.reduce((a: number, b: number) => a * b, 1);
    if (totalElements > MAX_TENSOR_ELEMENTS) {
      return { valid: false, error: `Tensor size exceeds maximum of ${MAX_TENSOR_ELEMENTS} elements` };
    }
  }
  
  // Validate data arrays
  if (params.data) {
    const data = params.data as number[];
    if (!Array.isArray(data) || data.length > MAX_ARRAY_SIZE) {
      return { valid: false, error: `Data array must have at most ${MAX_ARRAY_SIZE} elements` };
    }
  }
  
  // Validate tensor inputs for operations
  if (params.a && typeof params.a === 'object') {
    const a = params.a as { data?: number[]; shape?: number[] };
    if (a.data && a.data.length > MAX_ARRAY_SIZE) {
      return { valid: false, error: `Input tensor a exceeds maximum size` };
    }
  }
  if (params.b && typeof params.b === 'object') {
    const b = params.b as { data?: number[]; shape?: number[] };
    if (b.data && b.data.length > MAX_ARRAY_SIZE) {
      return { valid: false, error: `Input tensor b exceeds maximum size` };
    }
  }
  
  // Validate neural network params
  if (operation === 'nn.sequential') {
    const layers = params.layers as Array<{ inputSize: number; outputSize: number }>;
    if (!Array.isArray(layers) || layers.length > MAX_LAYERS) {
      return { valid: false, error: `Sequential model can have at most ${MAX_LAYERS} layers` };
    }
  }
  
  // Validate SVD/PCA params
  if (operation === 'decomposition.svd' || operation === 'decomposition.pca') {
    const numComponents = params.numComponents as number;
    if (numComponents && numComponents > MAX_SVD_COMPONENTS) {
      return { valid: false, error: `numComponents cannot exceed ${MAX_SVD_COMPONENTS}` };
    }
  }
  
  // Validate input arrays for conv/pool
  if (params.input && Array.isArray(params.input)) {
    if ((params.input as number[]).length > MAX_ARRAY_SIZE) {
      return { valid: false, error: `Input array exceeds maximum size` };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
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
    if (body.length > 100000) {
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
        JSON.stringify({ error: 'Unknown operation', availableOperations: ALLOWED_OPERATIONS }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate input parameters
    const validation = validateTensorParams(params, operation);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing operation: ${operation}`);
    
    let result: unknown;

    switch (operation) {
      // Tensor creation
      case 'tensor.create': {
        const tensor = new Tensor(params.data, params.shape);
        result = tensor.toJSON();
        break;
      }
      case 'tensor.zeros': {
        const tensor = Tensor.zeros(params.shape);
        result = tensor.toJSON();
        break;
      }
      case 'tensor.ones': {
        const tensor = Tensor.ones(params.shape);
        result = tensor.toJSON();
        break;
      }
      case 'tensor.random': {
        const tensor = Tensor.random(params.shape);
        result = tensor.toJSON();
        break;
      }
      case 'tensor.randomNormal': {
        const tensor = Tensor.randomNormal(params.shape, params.mean, params.stdDev);
        result = tensor.toJSON();
        break;
      }

      // Tensor operations
      case 'tensor.add': {
        const a = new Tensor(params.a.data, params.a.shape);
        const b = typeof params.b === 'number' ? params.b : new Tensor(params.b.data, params.b.shape);
        result = a.add(b).toJSON();
        break;
      }
      case 'tensor.sub': {
        const a = new Tensor(params.a.data, params.a.shape);
        const b = typeof params.b === 'number' ? params.b : new Tensor(params.b.data, params.b.shape);
        result = a.sub(b).toJSON();
        break;
      }
      case 'tensor.mul': {
        const a = new Tensor(params.a.data, params.a.shape);
        const b = typeof params.b === 'number' ? params.b : new Tensor(params.b.data, params.b.shape);
        result = a.mul(b).toJSON();
        break;
      }
      case 'tensor.matmul': {
        const a = new Tensor(params.a.data, params.a.shape);
        const b = new Tensor(params.b.data, params.b.shape);
        result = a.matmul(b).toJSON();
        break;
      }
      case 'tensor.transpose': {
        const tensor = new Tensor(params.data, params.shape);
        result = tensor.transpose().toJSON();
        break;
      }

      // Activations
      case 'activation.relu': {
        const data = params.data.map((x: number) => activations.relu(x));
        result = { data, shape: params.shape || [data.length] };
        break;
      }
      case 'activation.sigmoid': {
        const data = params.data.map((x: number) => activations.sigmoid(x));
        result = { data, shape: params.shape || [data.length] };
        break;
      }
      case 'activation.tanh': {
        const data = params.data.map((x: number) => activations.tanh(x));
        result = { data, shape: params.shape || [data.length] };
        break;
      }
      case 'activation.softmax': {
        const data = activations.softmax(params.data);
        result = { data, shape: params.shape || [data.length] };
        break;
      }

      // Neural network
      case 'nn.dense': {
        const layer = new DenseLayer(params.inputSize, params.outputSize, params.activation);
        const input = new Tensor(params.input, [params.inputSize]);
        const output = layer.forward(input);
        result = { output: output.toJSON(), layer: layer.toJSON() };
        break;
      }
      case 'nn.sequential': {
        const model = new Sequential();
        const layers = (params.layers as Array<{ inputSize: number; outputSize: number; activation?: string }>).slice(0, MAX_LAYERS);
        for (const layer of layers) {
          model.addLayer(layer.inputSize, layer.outputSize, layer.activation);
        }
        const input = new Tensor(params.input, [layers[0].inputSize]);
        const output = model.predict(input);
        result = { output: output.toJSON(), model: model.toJSON() };
        break;
      }

      // Losses
      case 'loss.mse': {
        const predicted = new Tensor(params.predicted, params.shape);
        const actual = new Tensor(params.actual, params.shape);
        result = { loss: losses.mse(predicted, actual) };
        break;
      }
      case 'loss.crossEntropy': {
        const predicted = new Tensor(params.predicted, params.shape);
        const actual = new Tensor(params.actual, params.shape);
        result = { loss: losses.crossEntropy(predicted, actual) };
        break;
      }

      // Convolution and pooling
      case 'conv.conv1d': {
        const output = conv1d(params.input, params.kernel, params.stride);
        result = { data: output, shape: [output.length] };
        break;
      }
      case 'pool.max1d': {
        const output = maxPool1d(params.input, params.poolSize, params.stride);
        result = { data: output, shape: [output.length] };
        break;
      }
      case 'pool.avg1d': {
        const output = avgPool1d(params.input, params.poolSize, params.stride);
        result = { data: output, shape: [output.length] };
        break;
      }

      // Dimensionality reduction
      case 'decomposition.svd': {
        const matrix = new Tensor(params.data, params.shape);
        const numComponents = Math.min(params.numComponents || 2, MAX_SVD_COMPONENTS);
        const iterations = Math.min(params.iterations || 100, MAX_ITERATIONS);
        const { U, S, V } = svdApprox(matrix, numComponents, iterations);
        result = { U: U.toJSON(), S, V: V.toJSON() };
        break;
      }
      case 'decomposition.pca': {
        const data = new Tensor(params.data, params.shape);
        const numComponents = Math.min(params.numComponents || 2, MAX_SVD_COMPONENTS);
        const { transformed, components, explainedVariance } = pca(data, numComponents);
        result = { transformed: transformed.toJSON(), components: components.toJSON(), explainedVariance };
        break;
      }

      // Statistics
      case 'stats.describe': {
        const tensor = new Tensor(params.data, params.shape);
        result = {
          sum: tensor.sum(),
          mean: tensor.mean(),
          min: tensor.min(),
          max: tensor.max(),
          shape: tensor.shape,
          size: tensor.data.length,
        };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown operation: ${operation}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log(`Operation ${operation} completed successfully`);

    return new Response(JSON.stringify({ result }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(remaining)
      },
    });
  } catch (error) {
    console.error('tensorflow-compute error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
