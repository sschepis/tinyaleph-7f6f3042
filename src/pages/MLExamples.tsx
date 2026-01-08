import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import {
  ResonantAttentionDemo,
  GradientDescentDemo,
  ArchitectureDemo,
  AdaptiveDepthDemo,
  PrimeResonanceDemo,
  QuaternionDemo,
} from '../components/ml-demos';

const examples: ExampleConfig[] = [
  {
    id: 'attention',
    number: '1',
    title: 'Resonant Attention',
    subtitle: 'Prime-based attention',
    description: 'Compute attention weights using prime resonance instead of dot-product similarity. Edit tokens and observe how shared character primes create semantic connections.',
    concepts: ['Attention Weights', 'Jaccard Similarity', 'Softmax Normalization'],
    code: `import { ResoFormer, resonantAttention } from '@aleph-ai/tinyaleph';

const tokens = ['wisdom', 'ancient', 'truth', 'knowledge'];

// Prime resonance replaces dot-product attention
const attention = resonantAttention({
  query: tokens,
  keys: tokens,
  values: tokens,
  resonanceFn: 'jaccard'  // |P_q ∩ P_k| / |P_q ∪ P_k|
});

console.log('Attention matrix:', attention);
// Tokens with shared letters/primes get higher attention weights`,
    codeTitle: 'ml/01-attention.js'
  },
  {
    id: 'gradient',
    number: '2',
    title: 'Gradient Descent',
    subtitle: 'Optimization visualization',
    description: 'Visualize gradient descent optimization on a loss landscape. Watch the loss decrease over steps with occasional local variations.',
    concepts: ['Optimization', 'Learning Rate', 'Loss Function', 'Convergence'],
    code: `import { train, GradientOptimizer } from '@aleph-ai/tinyaleph';

const optimizer = new GradientOptimizer({
  learningRate: 0.1,
  momentum: 0.9
});

// Training loop
for (let step = 0; step < 100; step++) {
  const loss = computeLoss(params);
  const gradients = computeGradients(params);
  
  params = optimizer.step(params, gradients);
  console.log(\`Step \${step}: Loss = \${loss.toFixed(4)}\`);
}`,
    codeTitle: 'ml/02-gradient.js'
  },
  {
    id: 'architecture',
    number: '3',
    title: 'ResoFormer Architecture',
    subtitle: 'Transformer pipeline',
    description: 'Explore the ResoFormer architecture: a transformer that replaces dot-product attention with prime resonance, uses quaternion rotations, and features adaptive depth.',
    concepts: ['Prime Encoding', 'Resonant Attention', 'Quaternion Mixing', 'Coherence Gating'],
    code: `import { ResoFormer } from '@aleph-ai/tinyaleph';

const model = new ResoFormer({
  layers: 12,
  hiddenDim: 512,
  numHeads: 8,
  coherenceThreshold: 0.9,
  primeVocabSize: 32768
});

// Forward pass with adaptive depth
const result = model.forward(input, {
  maxLayers: 12,
  returnTrace: true
});

console.log('Layers used:', result.layersUsed);
console.log('Final coherence:', result.coherence);`,
    codeTitle: 'ml/03-architecture.js'
  },
  {
    id: 'adaptive-depth',
    number: '4',
    title: 'Adaptive Depth',
    subtitle: 'Coherence-gated halting',
    description: 'Run a multi-layer forward pass with coherence-gated early stopping. When state coherence exceeds the threshold, processing halts—simple inputs use fewer layers.',
    concepts: ['Adaptive Computation', 'Early Stopping', 'Coherence Metric', 'Entropy Collapse'],
    code: `import { ResoFormer, coherenceGatedCompute } from '@aleph-ai/tinyaleph';

const model = new ResoFormer({ coherenceThreshold: 0.85 });

const result = coherenceGatedCompute({
  input: 'the ancient wisdom speaks',
  maxLayers: 12,
  threshold: 0.85
});

// Simple inputs halt early
console.log('Halted at layer:', result.haltedAt);
console.log('Final coherence:', result.coherence);
console.log('Output token:', result.output);`,
    codeTitle: 'ml/04-adaptive-depth.js'
  },
  {
    id: 'prime-resonance',
    number: '5',
    title: 'Prime Resonance',
    subtitle: 'Semantic similarity via primes',
    description: 'Explore how words map to prime signatures and compute resonance scores. Shared character primes indicate semantic overlap, creating interpretable attention patterns.',
    concepts: ['Prime Encoding', 'Jaccard Index', 'Semantic Overlap', 'Algebraic Signatures'],
    code: `import { PrimeEncoder, primeResonance } from '@aleph-ai/tinyaleph';

const encoder = new PrimeEncoder();

// Map words to prime signatures
const p1 = encoder.encode('wisdom');   // [83, 23, 67, 7, 47, 41]
const p2 = encoder.encode('knowledge'); // [31, 43, 47, 83, 37, 11, 7, 17, 11]

// Compute resonance (Jaccard similarity of primes)
const overlap = p1.filter(p => p2.includes(p));
const union = new Set([...p1, ...p2]);
const resonance = overlap.length / union.size;

console.log('Resonance:', resonance.toFixed(4));`,
    codeTitle: 'ml/05-prime-resonance.js'
  },
  {
    id: 'quaternion',
    number: '6',
    title: 'Quaternion Rotation',
    subtitle: '4D semantic mixing',
    description: 'Visualize how ResoFormer uses Hamilton quaternion multiplication to rotate semantic states in 4D hypercomplex space, enabling non-commutative transformations that preserve magnitude.',
    concepts: ['Quaternions', 'Hamilton Product', 'Hypercomplex Rotation', 'Magnitude Preservation'],
    code: `import { Quaternion, hamiltonProduct } from '@aleph-ai/tinyaleph';

// Create rotation quaternion
const angle = Math.PI / 4;  // 45 degrees
const q = new Quaternion(
  Math.cos(angle / 2),
  Math.sin(angle / 2) * 0.577,  // x
  Math.sin(angle / 2) * 0.577,  // y
  Math.sin(angle / 2) * 0.577   // z
);

// Rotate semantic state
const state = new Quaternion(1, 0.5, 0.3, 0.2);
const rotated = hamiltonProduct(q, state);

console.log('Magnitude preserved:', state.magnitude() === rotated.magnitude());`,
    codeTitle: 'ml/06-quaternion.js'
  },
];

const exampleComponents: Record<string, React.FC> = {
  'attention': ResonantAttentionDemo,
  'gradient': GradientDescentDemo,
  'architecture': ArchitectureDemo,
  'adaptive-depth': AdaptiveDepthDemo,
  'prime-resonance': PrimeResonanceDemo,
  'quaternion': QuaternionDemo,
};

export default function MLExamplesPage() {
  return (
    <ExamplePageWrapper
      category="ML"
      title="Machine Learning"
      description="Explore ResoFormer: a transformer architecture with prime-based resonant attention, quaternion semantic mixing, and coherence-gated adaptive depth"
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'Math', path: '/math' }}
      nextSection={{ title: 'Scientific', path: '/scientific' }}
    />
  );
}
