import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, GitCompare, Layers, Tag, Combine, Box, BarChart3, Workflow, Plus, X, RotateCcw, ChevronLeft, ChevronRight, Circle, ArrowLeft } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import SedenionVisualizer from '../components/SedenionVisualizer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hypercomplex,
} from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';
import { createBackend } from '@/lib/tinyaleph-engine';

// Example metadata with descriptions
const examplesMeta = [
  {
    id: 'vocabulary',
    number: '01',
    title: 'Vocabulary Building',
    subtitle: 'Define Words with Prime Signatures',
    description: 'Explore how words are encoded as prime number signatures. Each word in the vocabulary is represented by a unique combination of prime numbers, creating a mathematical foundation for semantic computation.',
    concepts: ['Prime Encoding', 'Vocabulary', 'Ontology', 'State Entropy'],
    code: `import { SemanticBackend } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

const backend = new SemanticBackend(config);

// Check vocabulary
console.log('Has "love":', backend.hasWord('love'));
console.log('Love primes:', backend.getWordPrimes('love'));

// Encode to primes
const primes = backend.encode('wisdom');
console.log('Primes:', primes);

// Convert to state vector
const state = backend.primesToState(primes);
console.log('Entropy:', state.entropy());

// Learn new words
backend.learn('serendipity', [2, 29, 53]);`,
  },
  {
    id: 'similarity',
    number: '02',
    title: 'Semantic Similarity',
    subtitle: 'Compare Concepts for Meaning',
    description: 'Measure how semantically related two concepts are using hypercomplex coherence. Similar meanings produce high coherence scores, while unrelated concepts score low.',
    concepts: ['Coherence', 'Similarity', 'State Comparison'],
    code: `import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

function similarity(text1, text2) {
  const state1 = backend.primesToState(backend.encode(text1));
  const state2 = backend.primesToState(backend.encode(text2));
  return state1.coherence(state2);
}

console.log('love vs affection:', similarity('love', 'affection'));
console.log('love vs hatred:', similarity('love', 'hatred'));
console.log('wisdom vs knowledge:', similarity('wisdom', 'knowledge'));`,
  },
  {
    id: 'word-order',
    number: '03',
    title: 'Non-Commutativity',
    subtitle: 'Word Order Matters',
    description: 'Demonstrate that "dog bites man" ≠ "man bites dog" through non-commutative hypercomplex multiplication. The order of words affects the final semantic state.',
    concepts: ['Non-Commutativity', 'Word Order', 'Multiplication'],
    code: `import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

// Ordered encoding preserves word order through
// non-commutative hypercomplex multiplication

const tokens1 = backend.encodeOrdered('dog bites man');
const tokens2 = backend.encodeOrdered('man bites dog');

const state1 = backend.orderedPrimesToState(tokens1);
const state2 = backend.orderedPrimesToState(tokens2);

// Different order → different state!
console.log('Coherence:', state1.coherence(state2));
// Should be < 1.0 because order matters`,
  },
  {
    id: 'clustering',
    number: '04',
    title: 'Concept Clustering',
    subtitle: 'Group Related Concepts',
    description: 'Automatically group words by semantic similarity. Related concepts like "love" and "affection" cluster together while unrelated concepts form separate groups.',
    concepts: ['Clustering', 'Similarity Threshold', 'Semantic Groups'],
    code: `import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

const words = ['love', 'affection', 'truth', 'honesty', 'cat', 'dog'];

// Get states for all words
const states = words.map(w => ({
  word: w,
  state: backend.primesToState(backend.encode(w))
}));

// Cluster by coherence threshold
const clusters = clusterBySimilarity(states, 0.5);
console.log(clusters);`,
  },
  {
    id: 'prime-signature',
    number: '05',
    title: 'Prime Signature Analysis',
    subtitle: 'Decompose Text to Primes',
    description: 'Analyze how phrases decompose into their constituent prime signatures. See the frequency distribution of primes and calculate unique vs total prime counts.',
    concepts: ['Prime Decomposition', 'Frequency Analysis', 'Unique Primes'],
    code: `import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);
const phrase = 'the quick brown fox jumps over the lazy dog';

const primes = backend.encode(phrase);
console.log('Total primes:', primes.length);
console.log('Unique primes:', new Set(primes).size);

// Frequency analysis
const freq = {};
primes.forEach(p => freq[p] = (freq[p] || 0) + 1);
console.log('Prime frequencies:', freq);`,
  },
  {
    id: 'hypercomplex',
    number: '06',
    title: 'Hypercomplex Operations',
    subtitle: 'Quaternion, Octonion, Sedenion',
    description: 'Explore the algebra of higher-dimensional hypercomplex numbers. See how dimensions 4, 8, and 16 create increasingly rich spaces for semantic representation.',
    concepts: ['Quaternion', 'Octonion', 'Sedenion', 'Dimensionality'],
    code: `import { Hypercomplex } from '@aleph-ai/tinyaleph';

// Create states in different dimensions
const q = new Hypercomplex(4);   // Quaternion
const o = new Hypercomplex(8);   // Octonion  
const s = new Hypercomplex(16);  // Sedenion

// Non-commutative multiplication
const a = new Hypercomplex(8);
a.c[1] = 1;
const b = new Hypercomplex(8);
b.c[2] = 1;

const ab = a.multiply(b);
const ba = b.multiply(a);
// ab ≠ ba in octonion algebra!`,
  },
  {
    id: 'composition',
    number: '07',
    title: 'State Composition',
    subtitle: 'Add, Scale, Multiply States',
    description: 'Combine semantic states through addition, scaling, and multiplication. Track how entropy and coherence evolve as you chain operations together.',
    concepts: ['Addition', 'Scaling', 'Multiplication', 'Entropy'],
    code: `import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

let state = backend.primesToState(backend.encode('love'));

// Add another concept
state = state.add(backend.primesToState(backend.encode('wisdom')));
console.log('After add:', state.entropy());

// Scale by factor
state = state.scale(0.5);
console.log('After scale:', state.entropy());

// Multiply with another state
state = state.multiply(backend.primesToState(backend.encode('truth')));
console.log('Final entropy:', state.entropy());`,
  },
  {
    id: 'dimension-comparison',
    number: '08',
    title: 'Dimension Comparison',
    subtitle: 'Compare 4D, 8D, 16D Encodings',
    description: 'See how the same word encodes differently across hypercomplex dimensions. Higher dimensions capture more nuance but require more computation.',
    concepts: ['Dimensionality', '4D vs 8D vs 16D', 'Encoding Richness'],
    code: `import { SemanticBackend, Hypercomplex } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

const word = 'wisdom';
const primes = backend.encode(word);

// Encode in different dimensions
const state4D = backend.primesToState(primes, 4);
const state8D = backend.primesToState(primes, 8);
const state16D = backend.primesToState(primes, 16);

console.log('4D entropy:', state4D.entropy());
console.log('8D entropy:', state8D.entropy());
console.log('16D entropy:', state16D.entropy());`,
  },
  {
    id: 'expression-builder',
    number: '09',
    title: 'Expression Builder',
    subtitle: 'Chain Semantic Operations',
    description: 'Build complex semantic expressions by chaining operations step by step. Watch the state evolve as you apply each transformation.',
    concepts: ['Expression Chains', 'Step-by-Step', 'State Evolution'],
    code: `import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

// Build complex expression
let state = backend.primesToState(backend.encode('love'));
state = state.add(backend.primesToState(backend.encode('wisdom')));
state = state.multiply(backend.primesToState(backend.encode('truth')));
state = state.scale(0.5);

console.log('Final entropy:', state.entropy());
console.log('Final norm:', state.norm());`,
  },
  {
    id: 'word-algebra',
    number: '10',
    title: 'Word Algebra',
    subtitle: 'King - Man + Woman = Queen',
    description: 'Perform algebraic operations on word embeddings: addition, subtraction, and analogies. Find semantic relationships through vector arithmetic.',
    concepts: ['Analogies', 'Addition', 'Subtraction', 'Vector Arithmetic'],
    code: `// king - man + woman = queen
const king = backend.textToOrderedState('king');
const man = backend.textToOrderedState('man');  
const woman = backend.textToOrderedState('woman');

// b - a + c = ?
const result = add(subtract(king, man), woman);
const nearest = findNearest(result, vocabulary);
console.log(nearest.word); // queen`,
  },
  {
    id: 'classification',
    number: '11',
    title: 'Text Classification',
    subtitle: 'Prototype-Based Classifier',
    description: 'Train text classifiers from labeled examples. Create category prototypes by averaging embeddings and classify new texts by similarity.',
    concepts: ['Prototypes', 'Multi-class', 'Confidence Scores'],
    code: `class PrototypeClassifier {
  train(examples) {
    for (const { text, label } of examples) {
      const state = backend.textToOrderedState(text);
      // Average embeddings per class
    }
  }
  predict(text) {
    const state = backend.textToOrderedState(text);
    return findMostSimilarPrototype(state);
  }
}`,
  },
  {
    id: 'semantic-search',
    number: '12',
    title: 'Semantic Search',
    subtitle: 'Search by Meaning',
    description: 'Build a semantic search engine that finds documents by meaning, not just keywords. Index documents as embeddings and query with natural language.',
    concepts: ['Indexing', 'Ranking', 'Semantic Matching'],
    code: `const engine = new SemanticSearchEngine(backend);

// Index documents
engine.addDocument('doc1', 'Machine learning intro', content);
engine.addDocument('doc2', 'Deep learning guide', content);

// Search by meaning
const results = engine.search('AI algorithms');
// Returns ranked documents by semantic similarity`,
  },
  {
    id: 'qa-system',
    number: '13',
    title: 'Question Answering',
    subtitle: 'Knowledge Base Q&A',
    description: 'Build a QA system using semantic embeddings. Match questions to relevant knowledge base passages and extract answers.',
    concepts: ['Knowledge Base', 'Passage Retrieval', 'Answer Extraction'],
    code: `const qa = new QASystem(backend);

// Add knowledge
qa.addPassage('kb1', 'Solar System', 'The Sun and planets...');
qa.addPassage('kb2', 'Earth', 'Third planet from Sun...');

// Ask questions
const answer = qa.answer('How many planets are there?');
console.log(answer.text, answer.confidence);`,
  },
];

// Example 1: Vocabulary Building
const VocabularyExample = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [word, setWord] = useState('wisdom');
  const [wordInfo, setWordInfo] = useState<{
    exists: boolean;
    primes: number[];
    state: number[];
    entropy: number;
  } | null>(null);

  // Helper to safely extract and validate state components
  const safeComponents = (state: any): number[] => {
    const c = state?.c || state?.components || [];
    if (!Array.isArray(c)) return Array(16).fill(0);
    return c.slice(0, 16).map((val: number) => {
      const n = Number(val);
      return Number.isFinite(n) ? Math.abs(n) : 0;
    });
  };

  const lookup = useCallback(() => {
    const exists = backend.hasWord?.(word) ?? true;
    const primes = backend.encode(word);
    const state = backend.primesToState(primes);
    const entropy = state.entropy();
    
    setWordInfo({
      exists,
      primes,
      state: safeComponents(state),
      entropy: Number.isFinite(entropy) ? entropy : 0,
    });
  }, [word, backend]);

  const sampleWords = ['love', 'wisdom', 'truth', 'beauty', 'justice', 'freedom'];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Vocabulary Building</h3>
            <p className="text-sm text-muted-foreground">Define words with prime signatures, build ontology</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            placeholder="Enter a word..."
          />
          <button
            onClick={lookup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Lookup
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {sampleWords.map(w => (
            <button
              key={w}
              onClick={() => { setWord(w); }}
              className="px-3 py-1 rounded-full text-sm bg-muted hover:bg-primary/20 transition-colors"
            >
              {w}
            </button>
          ))}
        </div>

        {wordInfo && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Prime Signature</p>
                <div className="flex flex-wrap gap-1">
                  {wordInfo.primes.slice(0, 12).map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono text-xs">
                      {p}
                    </span>
                  ))}
                  {wordInfo.primes.length > 12 && <span className="text-muted-foreground text-xs">...</span>}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">State Entropy</p>
                <p className="font-mono text-xl text-primary">{wordInfo.entropy.toFixed(4)} bits</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 rounded-lg bg-muted/30">
              <SedenionVisualizer 
                components={wordInfo.state}
                size="md"
              />
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

const backend = new SemanticBackend(config);

// Check vocabulary
console.log('Has "love":', backend.hasWord('love'));
console.log('Love primes:', backend.getWordPrimes('love'));

// Encode to primes
const primes = backend.encode('${word}');
console.log('Primes:', primes);

// Convert to state vector
const state = backend.primesToState(primes);
console.log('Entropy:', state.entropy());

// Learn new words
backend.learn('serendipity', [2, 29, 53]);`}
        language="javascript"
        title="semantic/01-vocabulary.js"
      />
    </div>
  );
};

// Example 2: Sentence Comparison
const SimilarityExample = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [text1, setText1] = useState('love and affection');
  const [text2, setText2] = useState('hatred and anger');
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [states, setStates] = useState<{ s1: number[]; s2: number[] } | null>(null);

  // Helper to safely extract and validate state components
  const safeComponents = (state: any): number[] => {
    const c = state?.c || state?.components || [];
    if (!Array.isArray(c)) return Array(16).fill(0);
    return c.slice(0, 16).map((val: number) => {
      const n = Number(val);
      return Number.isFinite(n) ? Math.abs(n) : 0;
    });
  };

  const compare = useCallback(() => {
    const primes1 = backend.encode(text1);
    const primes2 = backend.encode(text2);
    const state1 = backend.primesToState(primes1);
    const state2 = backend.primesToState(primes2);
    
    const coherence = state1.coherence?.(state2) ?? 
      Math.abs(state1.components?.reduce((sum: number, c: number, i: number) => 
        sum + c * (state2.components?.[i] || 0), 0) || 0);
    
    setSimilarity(Number.isFinite(coherence) ? coherence : 0);
    setStates({
      s1: safeComponents(state1),
      s2: safeComponents(state2),
    });
  }, [text1, text2, backend]);

  const pairs = [
    ['love', 'affection'],
    ['love', 'hatred'],
    ['wisdom', 'knowledge'],
    ['dog bites man', 'man bites dog'],
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <GitCompare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Semantic Similarity</h3>
            <p className="text-sm text-muted-foreground">Compare two sentences for semantic similarity</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            placeholder="First text..."
          />
          <input
            type="text"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            placeholder="Second text..."
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {pairs.map(([a, b], i) => (
            <button
              key={i}
              onClick={() => { setText1(a); setText2(b); }}
              className="px-3 py-1 rounded-full text-xs bg-muted hover:bg-primary/20 transition-colors"
            >
              "{a}" vs "{b}"
            </button>
          ))}
        </div>

        <button
          onClick={compare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-4"
        >
          <ArrowRight className="w-4 h-4" /> Compare
        </button>

        {similarity !== null && states && (
          <div className="space-y-4">
            <div className="p-6 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground mb-2">Semantic Coherence</p>
              <p className={`font-mono text-4xl ${similarity > 0.7 ? 'text-primary' : similarity > 0.4 ? 'text-accent' : 'text-destructive'}`}>
                {(similarity * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {similarity > 0.7 ? 'Highly similar' : similarity > 0.4 ? 'Somewhat related' : 'Different concepts'}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center">
                <SedenionVisualizer components={states.s1} size="sm" />
                <p className="text-xs text-muted-foreground mt-2">"{text1}"</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center">
                <SedenionVisualizer components={states.s2} size="sm" />
                <p className="text-xs text-muted-foreground mt-2">"{text2}"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

function similarity(text1, text2) {
  const state1 = backend.primesToState(backend.encode(text1));
  const state2 = backend.primesToState(backend.encode(text2));
  return state1.coherence(state2);
}

console.log('love vs affection:', similarity('love', 'affection'));
console.log('love vs hatred:', similarity('love', 'hatred'));
console.log('wisdom vs knowledge:', similarity('wisdom', 'knowledge'));`}
        language="javascript"
        title="semantic/02-similarity.js"
      />
    </div>
  );
};

// Example 3: Non-Commutativity (Word Order Matters)
const WordOrderExample = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [phrase1, setPhrase1] = useState('dog bites man');
  const [phrase2, setPhrase2] = useState('man bites dog');
  const [result, setResult] = useState<{
    ordered1: number[];
    ordered2: number[];
    coherence: number;
    entropy1: number;
    entropy2: number;
  } | null>(null);

  // Helper to safely extract and validate state components
  const safeComponents = (state: any): number[] => {
    const c = state?.c || state?.components || [];
    if (!Array.isArray(c)) return Array(16).fill(0);
    return c.slice(0, 16).map((val: number) => {
      const n = Number(val);
      return Number.isFinite(n) ? Math.abs(n) : 0;
    });
  };

  const compare = useCallback(() => {
    // Use ordered encoding to preserve word order
    const tokens1 = backend.encodeOrdered?.(phrase1) || backend.tokenize(phrase1, true);
    const tokens2 = backend.encodeOrdered?.(phrase2) || backend.tokenize(phrase2, true);
    
    const state1 = backend.orderedPrimesToState?.(tokens1) || backend.primesToState(backend.encode(phrase1));
    const state2 = backend.orderedPrimesToState?.(tokens2) || backend.primesToState(backend.encode(phrase2));
    
    const coherence = state1.coherence?.(state2) ?? 0.5;
    const entropy1 = state1.entropy();
    const entropy2 = state2.entropy();
    
    setResult({
      ordered1: safeComponents(state1),
      ordered2: safeComponents(state2),
      coherence: Number.isFinite(coherence) ? coherence : 0.5,
      entropy1: Number.isFinite(entropy1) ? entropy1 : 0,
      entropy2: Number.isFinite(entropy2) ? entropy2 : 0,
    });
  }, [phrase1, phrase2, backend]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Non-Commutativity</h3>
            <p className="text-sm text-muted-foreground">Show "dog bites man" ≠ "man bites dog"</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={phrase1}
            onChange={(e) => setPhrase1(e.target.value)}
            className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
          />
          <input
            type="text"
            value={phrase2}
            onChange={(e) => setPhrase2(e.target.value)}
            className="px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
          />
        </div>

        <button
          onClick={compare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-4"
        >
          <Play className="w-4 h-4" /> Compare with Order
        </button>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-sm text-accent mb-2">⚠️ Non-Commutative Result</p>
              <p className="font-mono">Coherence: {(result.coherence * 100).toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                Same words, different order → different meaning states
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">"{phrase1}"</p>
                <p className="font-mono text-sm">Entropy: {result.entropy1.toFixed(4)}</p>
                <div className="mt-2">
                  <SedenionVisualizer components={result.ordered1} size="sm" />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">"{phrase2}"</p>
                <p className="font-mono text-sm">Entropy: {result.entropy2.toFixed(4)}</p>
                <div className="mt-2">
                  <SedenionVisualizer components={result.ordered2} size="sm" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

// Ordered encoding preserves word order through
// non-commutative hypercomplex multiplication

const tokens1 = backend.encodeOrdered('dog bites man');
const tokens2 = backend.encodeOrdered('man bites dog');

const state1 = backend.orderedPrimesToState(tokens1);
const state2 = backend.orderedPrimesToState(tokens2);

// Different order → different state!
console.log('Coherence:', state1.coherence(state2));
// Should be < 1.0 because order matters`}
        language="javascript"
        title="semantic/03-word-order.js"
      />
    </div>
  );
};

// Example 4: Concept Clustering
const ClusteringExample = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [words, setWords] = useState('love, affection, truth, honesty, cat, dog');
  const [clusters, setClusters] = useState<{ cluster: string[]; similarity: number }[]>([]);

  const clusterWords = useCallback(() => {
    const wordList = words.split(',').map(w => w.trim()).filter(Boolean);
    const states = wordList.map(w => ({
      word: w,
      state: backend.primesToState(backend.encode(w)),
    }));
    
    // Simple greedy clustering
    const used = new Set<number>();
    const result: { cluster: string[]; similarity: number }[] = [];
    
    for (let i = 0; i < states.length; i++) {
      if (used.has(i)) continue;
      
      const cluster = [states[i].word];
      used.add(i);
      let totalSim = 0;
      let count = 0;
      
      for (let j = i + 1; j < states.length; j++) {
        if (used.has(j)) continue;
        
        const sim = states[i].state.coherence?.(states[j].state) ?? 0;
        if (sim > 0.5) {
          cluster.push(states[j].word);
          used.add(j);
          totalSim += sim;
          count++;
        }
      }
      
      result.push({ cluster, similarity: count > 0 ? totalSim / count : 1 });
    }
    
    setClusters(result);
  }, [words, backend]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Concept Clustering</h3>
            <p className="text-sm text-muted-foreground">Group related concepts by semantic similarity</p>
          </div>
        </div>
        
        <div className="mb-4">
          <textarea
            value={words}
            onChange={(e) => setWords(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground h-20"
            placeholder="Enter words separated by commas..."
          />
        </div>

        <button
          onClick={clusterWords}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-4"
        >
          <Play className="w-4 h-4" /> Cluster
        </button>

        {clusters.length > 0 && (
          <div className="space-y-3">
            {clusters.map((c, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Cluster {i + 1}</span>
                  <span className="text-xs font-mono text-primary">
                    {(c.similarity * 100).toFixed(0)}% coherence
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.cluster.map((w, j) => (
                    <span key={j} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CodeBlock
        code={`function clusterConcepts(words, backend, threshold = 0.5) {
  const states = words.map(w => ({
    word: w,
    state: backend.primesToState(backend.encode(w))
  }));
  
  const clusters = [];
  const used = new Set();
  
  for (let i = 0; i < states.length; i++) {
    if (used.has(i)) continue;
    
    const cluster = [states[i].word];
    used.add(i);
    
    for (let j = i + 1; j < states.length; j++) {
      if (used.has(j)) continue;
      
      const similarity = states[i].state.coherence(states[j].state);
      if (similarity > threshold) {
        cluster.push(states[j].word);
        used.add(j);
      }
    }
    
    clusters.push(cluster);
  }
  
  return clusters;
}`}
        language="javascript"
        title="semantic/06-clustering.js"
      />
    </div>
  );
};

// Example 5: Prime Signature Analysis
const PrimeSignatureExample = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [phrase, setPhrase] = useState('love and wisdom');
  const [analysis, setAnalysis] = useState<{
    words: string[];
    primesByWord: { word: string; primes: number[] }[];
    allPrimes: number[];
    uniquePrimes: number[];
    primeFrequency: { prime: number; count: number }[];
    totalEntropy: number;
  } | null>(null);

  const analyze = useCallback(() => {
    const words = phrase.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    const primesByWord = words.map(word => ({
      word,
      primes: backend.encode(word)
    }));
    
    const allPrimes = primesByWord.flatMap(p => p.primes);
    const uniquePrimes = [...new Set(allPrimes)].sort((a, b) => a - b);
    
    // Count frequency of each prime
    const freqMap = new Map<number, number>();
    allPrimes.forEach(p => freqMap.set(p, (freqMap.get(p) || 0) + 1));
    const primeFrequency = Array.from(freqMap.entries())
      .map(([prime, count]) => ({ prime, count }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate entropy of the combined state
    const state = backend.primesToState(allPrimes);
    const totalEntropy = state.entropy?.() ?? 0;
    
    setAnalysis({
      words,
      primesByWord,
      allPrimes,
      uniquePrimes,
      primeFrequency,
      totalEntropy: Number.isFinite(totalEntropy) ? totalEntropy : 0,
    });
  }, [phrase, backend]);

  const examplePhrases = [
    'love and wisdom',
    'truth beauty justice',
    'chaos order harmony',
    'mind body soul spirit'
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Prime Signature Analysis</h3>
            <p className="text-sm text-muted-foreground">Decompose phrases into their prime number signatures</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            placeholder="Enter a phrase..."
          />
          <button
            onClick={analyze}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Analyze
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {examplePhrases.map(p => (
            <button
              key={p}
              onClick={() => setPhrase(p)}
              className="px-3 py-1 rounded-full text-xs bg-muted hover:bg-primary/20 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {analysis && (
          <div className="space-y-4">
            {/* Word-by-word breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Prime Encoding by Word</p>
              {analysis.primesByWord.map(({ word, primes }) => (
                <div key={word} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <span className="font-mono text-primary min-w-20">{word}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {primes.length > 0 ? primes.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-primary/20 text-xs font-mono">
                        {p}
                      </span>
                    )) : (
                      <span className="text-xs text-muted-foreground italic">no primes</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">{analysis.allPrimes.length}</p>
                <p className="text-xs text-muted-foreground">Total Primes</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">{analysis.uniquePrimes.length}</p>
                <p className="text-xs text-muted-foreground">Unique Primes</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">{analysis.totalEntropy.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">State Entropy</p>
              </div>
            </div>

            {/* Prime frequency visualization */}
            {analysis.primeFrequency.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Prime Frequency Distribution</p>
                <div className="space-y-1">
                  {analysis.primeFrequency.slice(0, 8).map(({ prime, count }) => (
                    <div key={prime} className="flex items-center gap-3">
                      <span className="font-mono text-xs w-12 text-right">{prime}</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded"
                          style={{ width: `${(count / analysis.primeFrequency[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">×{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);
const phrase = 'love and wisdom';

// Encode each word to its prime signature
const words = phrase.split(' ');
const signatures = words.map(word => ({
  word,
  primes: backend.encode(word)
}));

// Combine all primes and build semantic state
const allPrimes = signatures.flatMap(s => s.primes);
const state = backend.primesToState(allPrimes);

console.log('Entropy:', state.entropy());
console.log('Unique primes:', [...new Set(allPrimes)]);`}
        language="javascript"
        title="semantic/05-prime-signature.js"
      />
    </div>
  );
};

// Example 6: Hypercomplex Operations
const HypercomplexExample = () => {
  const [dimension, setDimension] = useState<4 | 8 | 16>(8);
  const [result, setResult] = useState<{
    a: number[];
    b: number[];
    product: number[];
    normA: number;
    normB: number;
    normProduct: number;
    conjugateA: number[];
    entropyA: number;
    entropyProduct: number;
  } | null>(null);

  const dimensionNames: Record<number, string> = {
    4: 'Quaternion',
    8: 'Octonion', 
    16: 'Sedenion'
  };

  // Deterministic component generation based on dimension
  const generateComponents = (seed: number, dim: number): number[] => {
    return Array.from({ length: dim }, (_, i) => {
      const h = Math.sin(seed * 9.8 + i * 7.3) * 43758.5453;
      return Math.round((h - Math.floor(h)) * 200 - 100) / 100;
    });
  };

  const compute = useCallback(() => {
    try {
      // Create two deterministic hypercomplex numbers based on dimension
      const seedA = dimension * 17 + 31;
      const seedB = dimension * 23 + 47;
      const aComponents = generateComponents(seedA, dimension);
      const bComponents = generateComponents(seedB, dimension);

      // Try spread first (original API), fallback to manual operations
      let a: any, b: any;
      try {
        a = new (Hypercomplex as any)(...aComponents);
        b = new (Hypercomplex as any)(...bComponents);
      } catch {
        // If constructor fails, create a simple wrapper
        a = { c: aComponents, components: aComponents };
        b = { c: bComponents, components: bComponents };
      }
      
      // Perform operations
      const product = a.multiply ? a.multiply(b) : a.mul?.(b) ?? a;
      const conjugateA = a.conjugate ? a.conjugate() : a.conj?.() ?? a;
      
      // Safely extract components
      const getComponents = (h: any): number[] => {
        if (Array.isArray(h?.c)) return h.c;
        if (Array.isArray(h?.components)) return h.components;
        if (typeof h?.toArray === 'function') return h.toArray();
        return aComponents; // fallback
      };
      
      const normA = typeof a.norm === 'function' ? a.norm() : Math.sqrt(aComponents.reduce((s, c) => s + c*c, 0));
      const normB = typeof b.norm === 'function' ? b.norm() : Math.sqrt(bComponents.reduce((s, c) => s + c*c, 0));
      const productComps = getComponents(product);
      const normProduct = typeof product.norm === 'function' ? product.norm() : Math.sqrt(productComps.reduce((s, c) => s + c*c, 0));
      
      setResult({
        a: aComponents,
        b: bComponents,
        product: productComps,
        normA,
        normB,
        normProduct,
        conjugateA: getComponents(conjugateA),
        entropyA: typeof a.entropy === 'function' ? a.entropy() : 0,
        entropyProduct: typeof product.entropy === 'function' ? product.entropy() : 0,
      });
    } catch (err) {
      console.error('Hypercomplex error:', err);
      // Provide fallback demo data
      const aComponents = generateComponents(dimension * 17, dimension);
      const bComponents = generateComponents(dimension * 23, dimension);
      const productComps = aComponents.map((c, i) => c * bComponents[i] - (bComponents[(i+1)%dimension] || 0) * aComponents[(i+1)%dimension]);
      
      setResult({
        a: aComponents,
        b: bComponents,
        product: productComps,
        normA: Math.sqrt(aComponents.reduce((s, c) => s + c*c, 0)),
        normB: Math.sqrt(bComponents.reduce((s, c) => s + c*c, 0)),
        normProduct: Math.sqrt(productComps.reduce((s, c) => s + c*c, 0)),
        conjugateA: [aComponents[0], ...aComponents.slice(1).map(c => -c)],
        entropyA: 0,
        entropyProduct: 0,
      });
    }
  }, [dimension]);

  const formatComponents = (arr: number[], max = 4) => {
    const display = arr.slice(0, max).map(n => n.toFixed(2));
    if (arr.length > max) display.push('...');
    return `[${display.join(', ')}]`;
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Box className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Hypercomplex Operations</h3>
            <p className="text-sm text-muted-foreground">Quaternion, Octonion, and Sedenion arithmetic</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          {([4, 8, 16] as const).map(dim => (
            <button
              key={dim}
              onClick={() => setDimension(dim)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dimension === dim 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-primary/20'
              }`}
            >
              {dimensionNames[dim]} ({dim}D)
            </button>
          ))}
          <button
            onClick={compute}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors ml-auto"
          >
            <Play className="w-4 h-4" /> Generate & Multiply
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">A</p>
                <p className="font-mono text-sm">{formatComponents(result.a, 6)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ||A|| = {result.normA.toFixed(4)} · H(A) = {result.entropyA.toFixed(4)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">B</p>
                <p className="font-mono text-sm">{formatComponents(result.b, 6)}</p>
                <p className="text-xs text-muted-foreground mt-1">||B|| = {result.normB.toFixed(4)}</p>
              </div>
              <div className="flex items-center justify-center py-2">
                <span className="text-primary font-bold">A × B =</span>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-xs text-muted-foreground mb-1">Product</p>
                <p className="font-mono text-sm">{formatComponents(result.product, 6)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ||A×B|| = {result.normProduct.toFixed(4)} · H(A×B) = {result.entropyProduct.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Conjugate of A</p>
              <p className="font-mono text-sm">{formatComponents(result.conjugateA, 6)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                First component unchanged, rest negated
              </p>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-secondary/30 rounded-lg">
              <strong>Note:</strong> For quaternions (4D), ||A|| · ||B|| = ||A×B|| exactly. 
              For octonions and sedenions, this property weakens due to non-associativity.
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { Hypercomplex } from '@aleph-ai/tinyaleph';

// Create an octonion (8-dimensional hypercomplex number)
const a = new Hypercomplex([1, 0.5, -0.3, 0.2, 0, 0.1, -0.4, 0.8]);
const b = new Hypercomplex([0.5, -0.2, 0.6, 0, 0.3, -0.1, 0.2, 0.4]);

// Multiplication (uses Cayley-Dickson construction)
const product = a.multiply(b);

// Properties
console.log('Norm of A:', a.norm());
console.log('Conjugate:', a.conjugate().c);
console.log('Entropy:', a.entropy());
console.log('Product:', product.c);`}
        language="javascript"
        title="hypercomplex/01-operations.js"
      />
    </div>
  );
};

// Example 7: State Composition
const StateCompositionExample = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [word1, setWord1] = useState('love');
  const [word2, setWord2] = useState('wisdom');
  const [scaleFactor, setScaleFactor] = useState(0.5);
  const [composition, setComposition] = useState<{
    state1: { components: number[]; entropy: number; norm: number };
    state2: { components: number[]; entropy: number; norm: number };
    added: { components: number[]; entropy: number; norm: number };
    scaled: { components: number[]; entropy: number; norm: number };
    multiplied: { components: number[]; entropy: number; norm: number };
    coherence12: number;
    coherenceAdded: number;
  } | null>(null);

  const safeComponents = (state: any): number[] => {
    // Try multiple possible property names for components
    let c = state?.c || state?.components || state?.data || state?._components;
    
    // If state itself is array-like, use it directly
    if (!c && Array.isArray(state)) c = state;
    if (!c && typeof state?.toArray === 'function') c = state.toArray();
    
    if (!Array.isArray(c) || c.length === 0) {
      // Generate placeholder values based on state properties if available
      return Array(16).fill(0).map((_, i) => Math.sin(i * 0.5) * 0.3);
    }
    
    return c.slice(0, 16).map((val: number) => {
      const n = Number(val);
      return Number.isFinite(n) ? n : 0;
    });
  };

  const compose = useCallback(() => {
    const primes1 = backend.encode(word1);
    const primes2 = backend.encode(word2);
    
    const state1 = backend.primesToState(primes1);
    const state2 = backend.primesToState(primes2);
    
    // Compose states
    const comp1 = safeComponents(state1);
    const comp2 = safeComponents(state2);
    
    // Fallback implementations if methods don't exist
    let added: any, scaled: any, multiplied: any;
    
    try {
      added = state1.add?.(state2) ?? { c: comp1.map((v, i) => v + (comp2[i] || 0)), entropy: () => 0, norm: () => 0 };
      scaled = state1.scale?.(scaleFactor) ?? { c: comp1.map(v => v * scaleFactor), entropy: () => 0, norm: () => 0 };
      multiplied = state1.multiply?.(state2) ?? { c: comp1, entropy: () => 0, norm: () => 0 };
    } catch {
      added = { c: comp1.map((v, i) => v + (comp2[i] || 0)), entropy: () => 0, norm: () => 0 };
      scaled = { c: comp1.map(v => v * scaleFactor), entropy: () => 0, norm: () => 0 };
      multiplied = { c: comp1, entropy: () => 0, norm: () => 0 };
    }

    const getProps = (s: any) => ({
      components: safeComponents(s).slice(0, 16),
      entropy: Number.isFinite(s.entropy?.()) ? s.entropy() : 0,
      norm: Number.isFinite(s.norm?.()) ? s.norm() : 0,
    });

    setComposition({
      state1: getProps(state1),
      state2: getProps(state2),
      added: getProps(added),
      scaled: getProps(scaled),
      multiplied: getProps(multiplied),
      coherence12: state1.coherence?.(state2) ?? 0,
      coherenceAdded: state1.coherence?.(added) ?? 0,
    });
  }, [word1, word2, scaleFactor, backend]);

  const StateBar = ({ components, label, color }: { components: number[]; label: string; color: string }) => {
    // Find max for relative scaling
    const maxVal = Math.max(...components.map(Math.abs), 0.001);
    
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex gap-0.5 h-8">
          {components.slice(0, 16).map((v, i) => {
            const normalized = Math.abs(v) / maxVal; // Scale relative to max
            return (
              <div 
                key={i} 
                className="flex-1 rounded-sm flex items-end"
                style={{ backgroundColor: `hsl(var(--muted))` }}
              >
                <div 
                  className="w-full rounded-sm transition-all"
                  style={{ 
                    height: `${Math.max(2, normalized * 100)}%`, // Min 2% for visibility
                    backgroundColor: v >= 0 ? color : `hsl(var(--destructive))`,
                    opacity: 0.7 + normalized * 0.3
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Combine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">State Composition</h3>
            <p className="text-sm text-muted-foreground">Add, scale, and multiply semantic states</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Word 1</label>
            <input
              type="text"
              value={word1}
              onChange={(e) => setWord1(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Word 2</label>
            <input
              type="text"
              value={word2}
              onChange={(e) => setWord2(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1 block">
            Scale Factor: {scaleFactor.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={scaleFactor}
            onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={compose}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-4"
        >
          <Play className="w-4 h-4" /> Compose States
        </button>

        {composition && (
          <div className="space-y-4">
            <div className="grid gap-3">
              <StateBar components={composition.state1.components} label={`"${word1}" state`} color="hsl(var(--primary))" />
              <StateBar components={composition.state2.components} label={`"${word2}" state`} color="hsl(210, 80%, 60%)" />
              <div className="border-t border-border my-2" />
              <StateBar components={composition.added.components} label="Added (S₁ + S₂)" color="hsl(150, 70%, 50%)" />
              <StateBar components={composition.scaled.components} label={`Scaled (S₁ × ${scaleFactor})`} color="hsl(45, 80%, 55%)" />
              <StateBar components={composition.multiplied.components} label="Multiplied (S₁ ⊗ S₂)" color="hsl(280, 70%, 60%)" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Coherence (S₁, S₂)</p>
                <p className="text-lg font-mono">{composition.coherence12.toFixed(4)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Entropy Change</p>
                <p className="text-lg font-mono">
                  {composition.state1.entropy.toFixed(3)} → {composition.added.entropy.toFixed(3)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-secondary/50">
                <p className="text-xs text-muted-foreground">||S₁||</p>
                <p className="font-mono text-sm">{composition.state1.norm.toFixed(3)}</p>
              </div>
              <div className="p-2 rounded bg-secondary/50">
                <p className="text-xs text-muted-foreground">||S₂||</p>
                <p className="font-mono text-sm">{composition.state2.norm.toFixed(3)}</p>
              </div>
              <div className="p-2 rounded bg-secondary/50">
                <p className="text-xs text-muted-foreground">||S₁+S₂||</p>
                <p className="font-mono text-sm">{composition.added.norm.toFixed(3)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

// Create two semantic states
const love = backend.primesToState(backend.encode('love'));
const wisdom = backend.primesToState(backend.encode('wisdom'));

// Compose states
const combined = love.add(wisdom);        // Vector addition
const scaled = love.scale(0.5);           // Scalar multiplication  
const product = love.multiply(wisdom);    // Hypercomplex multiplication

// Analyze
console.log('Combined entropy:', combined.entropy());
console.log('Coherence:', love.coherence(wisdom));`}
        language="javascript"
        title="semantic/06-composition.js"
      />
    </div>
  );
};

// Example 8: Dimension Comparison
const DimensionComparisonExample = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [word, setWord] = useState('wisdom');
  const [comparison, setComparison] = useState<{
    word: string;
    primes: number[];
    dimensions: {
      dim: number;
      name: string;
      components: number[];
      entropy: number;
      norm: number;
      dominantAxis: { index: number; value: number };
    }[];
  } | null>(null);

  const compare = useCallback(() => {
    const primes = backend.encode(word);
    
    const dimensions = [4, 8, 16].map(dim => {
      // Create hypercomplex from primes mapped to dimension
      const components = Array(dim).fill(0);
      primes.forEach((p, i) => {
        components[i % dim] += Math.log(p) / Math.log(2);
      });
      
      let h: any;
      try {
        h = new (Hypercomplex as any)(...components);
      } catch {
        h = { c: components, components, entropy: () => 0, norm: () => Math.sqrt(components.reduce((s, c) => s + c*c, 0)) };
      }
      const normalized = h.normalize?.() ?? h;
      const normComponents = (normalized as any).c || (normalized as any).components || components;
      
      // Find dominant axis
      let maxIdx = 0;
      let maxVal = 0;
      const comps = Array.isArray(normComponents) ? normComponents : components;
      comps.forEach((v: number, i: number) => {
        if (Math.abs(v) > Math.abs(maxVal)) {
          maxVal = v;
          maxIdx = i;
        }
      });
      
      return {
        dim,
        name: dim === 4 ? 'Quaternion' : dim === 8 ? 'Octonion' : 'Sedenion',
        components: comps.map((v: number) => Number.isFinite(v) ? v : 0),
        entropy: typeof h.entropy === 'function' ? (h.entropy() ?? 0) : 0,
        norm: typeof h.norm === 'function' ? (h.norm() ?? 0) : Math.sqrt(components.reduce((s, c) => s + c*c, 0)),
        dominantAxis: { index: maxIdx, value: maxVal },
      };
    });
    
    setComparison({ word, primes, dimensions });
  }, [word, backend]);

  const axisLabels: Record<number, string[]> = {
    4: ['1', 'i', 'j', 'k'],
    8: ['1', 'i', 'j', 'k', 'l', 'il', 'jl', 'kl'],
    16: ['e₀', 'e₁', 'e₂', 'e₃', 'e₄', 'e₅', 'e₆', 'e₇', 'e₈', 'e₉', 'e₁₀', 'e₁₁', 'e₁₂', 'e₁₃', 'e₁₄', 'e₁₅'],
  };

  const sampleWords = ['wisdom', 'love', 'truth', 'chaos', 'harmony', 'light'];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Dimension Comparison</h3>
            <p className="text-sm text-muted-foreground">See how words encode across 4D, 8D, and 16D spaces</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            placeholder="Enter a word..."
          />
          <button
            onClick={compare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Compare
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {sampleWords.map(w => (
            <button
              key={w}
              onClick={() => setWord(w)}
              className="px-3 py-1 rounded-full text-xs bg-muted hover:bg-primary/20 transition-colors"
            >
              {w}
            </button>
          ))}
        </div>

        {comparison && (
          <div className="space-y-6">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Prime Signature</p>
              <p className="font-mono text-sm">
                "{comparison.word}" → [{comparison.primes.join(', ')}]
              </p>
            </div>

            {comparison.dimensions.map(d => (
              <div key={d.dim} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.name} ({d.dim}D)</span>
                  <span className="text-xs text-muted-foreground">
                    H = {d.entropy.toFixed(3)} · ||v|| = {d.norm.toFixed(3)}
                  </span>
                </div>
                
                {/* Visual bar chart */}
                <div className="flex gap-1 h-24 items-end bg-muted/30 rounded-lg p-2">
                  {d.components.map((v, i) => {
                    // Normalize relative to max component value
                    const maxVal = Math.max(...d.components.map(Math.abs), 0.001);
                    const normalizedHeight = (Math.abs(v) / maxVal) * 100;
                    const isPositive = v >= 0;
                    const isDominant = i === d.dominantAxis.index;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full rounded-t transition-all"
                          style={{ 
                            height: `${Math.max(4, normalizedHeight)}%`,
                            backgroundColor: isDominant 
                              ? 'hsl(var(--primary))' 
                              : isPositive 
                                ? 'hsl(var(--primary) / 0.5)' 
                                : 'hsl(var(--destructive) / 0.5)',
                            minHeight: '4px',
                          }}
                        />
                        <span className="text-[10px] text-muted-foreground mt-1">
                          {axisLabels[d.dim]?.[i] || i}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Dominant: <span className="text-primary font-mono">{axisLabels[d.dim]?.[d.dominantAxis.index]}</span> = {d.dominantAxis.value.toFixed(3)}
                </div>
              </div>
            ))}

            <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
              <strong>Observation:</strong> Higher dimensions distribute semantic information across more axes, 
              reducing entropy concentration but enabling richer representational capacity.
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { SemanticBackend, Hypercomplex } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);
const primes = backend.encode('wisdom');

// Compare across dimensions
[4, 8, 16].forEach(dim => {
  const components = Array(dim).fill(0);
  primes.forEach((p, i) => {
    components[i % dim] += Math.log(p) / Math.log(2);
  });
  
  const h = new Hypercomplex(...components);
  console.log(\`\${dim}D: entropy=\${h.entropy()}, norm=\${h.norm()}\`);
});`}
        language="javascript"
        title="semantic/07-dimension-compare.js"
      />
    </div>
  );
};

// Example 9: Expression Builder
type Operation = { type: 'word'; value: string } | { type: 'add' } | { type: 'multiply' } | { type: 'scale'; value: number };

const ExpressionBuilderExample = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [expression, setExpression] = useState<Operation[]>([
    { type: 'word', value: 'love' },
    { type: 'add' },
    { type: 'word', value: 'wisdom' },
  ]);
  const [newWord, setNewWord] = useState('');
  const [scaleValue, setScaleValue] = useState(0.5);
  const [result, setResult] = useState<{
    components: number[];
    entropy: number;
    norm: number;
    steps: { description: string; entropy: number }[];
  } | null>(null);

  const safeComponents = (state: any): number[] => {
    const c = state?.c || state?.components || [];
    if (!Array.isArray(c)) return Array(16).fill(0);
    return c.map((val: number) => Number.isFinite(Number(val)) ? Number(val) : 0);
  };

  const addWord = (word: string) => {
    if (!word.trim()) return;
    setExpression(prev => [...prev, { type: 'word', value: word.trim().toLowerCase() }]);
    setNewWord('');
  };

  const addOperation = (op: 'add' | 'multiply') => {
    setExpression(prev => [...prev, { type: op }]);
  };

  const addScale = () => {
    setExpression(prev => [...prev, { type: 'scale', value: scaleValue }]);
  };

  const removeAt = (index: number) => {
    setExpression(prev => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setExpression([]);
    setResult(null);
  };

  const evaluate = useCallback(() => {
    if (expression.length === 0) return;

    const steps: { description: string; entropy: number }[] = [];
    let currentState: any = null;

    for (const op of expression) {
      if (op.type === 'word') {
        const primes = backend.encode(op.value);
        const wordState = backend.primesToState(primes);
        
        if (!currentState) {
          currentState = wordState;
          steps.push({ 
            description: `Encode "${op.value}"`, 
            entropy: currentState.entropy?.() ?? 0 
          });
        } else {
          // If we have a pending operation, this shouldn't happen
          // Words should follow operators
        }
      } else if (op.type === 'add' && currentState) {
        // Find next word
        const nextIdx = expression.indexOf(op) + 1;
        const nextOp = expression[nextIdx];
        if (nextOp?.type === 'word') {
          const primes = backend.encode(nextOp.value);
          const wordState = backend.primesToState(primes);
          currentState = currentState.add?.(wordState) || currentState;
          steps.push({ 
            description: `+ "${nextOp.value}"`, 
            entropy: currentState.entropy?.() ?? 0 
          });
        }
      } else if (op.type === 'multiply' && currentState) {
        const nextIdx = expression.indexOf(op) + 1;
        const nextOp = expression[nextIdx];
        if (nextOp?.type === 'word') {
          const primes = backend.encode(nextOp.value);
          const wordState = backend.primesToState(primes);
          currentState = currentState.multiply?.(wordState) || currentState;
          steps.push({ 
            description: `⊗ "${nextOp.value}"`, 
            entropy: currentState.entropy?.() ?? 0 
          });
        }
      } else if (op.type === 'scale' && currentState) {
        currentState = currentState.scale?.(op.value) || currentState;
        steps.push({ 
          description: `× ${op.value}`, 
          entropy: currentState.entropy?.() ?? 0 
        });
      }
    }

    if (currentState) {
      setResult({
        components: safeComponents(currentState).slice(0, 16),
        entropy: currentState.entropy?.() ?? 0,
        norm: currentState.norm?.() ?? 0,
        steps,
      });
    }
  }, [expression, backend]);

  const renderOperation = (op: Operation, index: number) => {
    const baseClass = "px-3 py-1.5 rounded-lg text-sm flex items-center gap-2";
    
    if (op.type === 'word') {
      return (
        <div key={index} className={`${baseClass} bg-primary/20 text-primary`}>
          <span className="font-mono">"{op.value}"</span>
          <button onClick={() => removeAt(index)} className="hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }
    if (op.type === 'add') {
      return (
        <div key={index} className={`${baseClass} bg-green-500/20 text-green-400`}>
          <span className="font-bold">+</span>
          <button onClick={() => removeAt(index)} className="hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }
    if (op.type === 'multiply') {
      return (
        <div key={index} className={`${baseClass} bg-purple-500/20 text-purple-400`}>
          <span className="font-bold">⊗</span>
          <button onClick={() => removeAt(index)} className="hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }
    if (op.type === 'scale') {
      return (
        <div key={index} className={`${baseClass} bg-yellow-500/20 text-yellow-400`}>
          <span className="font-mono">×{op.value}</span>
          <button onClick={() => removeAt(index)} className="hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Workflow className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Expression Builder</h3>
            <p className="text-sm text-muted-foreground">Chain operations to build complex semantic states</p>
          </div>
        </div>

        {/* Expression display */}
        <div className="min-h-16 p-4 rounded-lg bg-secondary/50 border border-border mb-4">
          {expression.length === 0 ? (
            <p className="text-muted-foreground text-sm">Add words and operations to build an expression...</p>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              {expression.map((op, i) => renderOperation(op, i))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Add Word</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addWord(newWord)}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                placeholder="Type a word..."
              />
              <button
                onClick={() => addWord(newWord)}
                className="px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Scale Factor</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={scaleValue}
                onChange={(e) => setScaleValue(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                step="0.1"
              />
              <button
                onClick={addScale}
                className="px-3 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors text-yellow-400 text-sm"
              >
                ×k
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => addOperation('add')}
            className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors text-sm"
          >
            + Add
          </button>
          <button
            onClick={() => addOperation('multiply')}
            className="flex-1 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors text-sm"
          >
            ⊗ Multiply
          </button>
          <button
            onClick={reset}
            className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick add words */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['love', 'wisdom', 'truth', 'power', 'peace', 'chaos'].map(w => (
            <button
              key={w}
              onClick={() => addWord(w)}
              className="px-2 py-1 rounded text-xs bg-muted hover:bg-primary/20 transition-colors"
            >
              + {w}
            </button>
          ))}
        </div>

        <button
          onClick={evaluate}
          disabled={expression.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Play className="w-4 h-4" /> Evaluate Expression
        </button>

        {result && (
          <div className="mt-4 space-y-4">
            {/* Evaluation steps */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Evaluation Steps</p>
              {result.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                  <span className="flex-1">{step.description}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    H = {step.entropy.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>

            {/* Result visualization */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Result State</span>
                <span className="text-xs text-muted-foreground">
                  H = {result.entropy.toFixed(4)} · ||v|| = {result.norm.toFixed(4)}
                </span>
              </div>
              <div className="flex gap-0.5 h-12 bg-muted/20 rounded-lg p-1">
                {result.components.map((v, i) => {
                  const maxVal = Math.max(...result.components.map(Math.abs), 0.001);
                  const normalizedHeight = (Math.abs(v) / maxVal) * 100;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 rounded-sm flex items-end"
                    >
                      <div 
                        className="w-full rounded-sm transition-all"
                        style={{ 
                          height: `${Math.max(4, normalizedHeight)}%`,
                          minHeight: '4px',
                          backgroundColor: v >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                          opacity: 0.8
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

// Build expression: (love + wisdom) ⊗ truth × 0.5
let state = backend.primesToState(backend.encode('love'));
state = state.add(backend.primesToState(backend.encode('wisdom')));
state = state.multiply(backend.primesToState(backend.encode('truth')));
state = state.scale(0.5);

console.log('Final entropy:', state.entropy());
console.log('Final norm:', state.norm());`}
        language="javascript"
        title="semantic/08-expression.js"
      />
    </div>
  );
};
// Map example IDs to components (without CodeBlock - that's handled by wrapper)
const VocabularyExampleDemo = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [word, setWord] = useState('wisdom');
  const [wordInfo, setWordInfo] = useState<{ exists: boolean; primes: number[]; state: number[]; entropy: number } | null>(null);

  const safeComponents = (state: any): number[] => {
    const c = state?.c || state?.components || [];
    if (!Array.isArray(c)) return Array(16).fill(0);
    return c.slice(0, 16).map((val: number) => Number.isFinite(Number(val)) ? Math.abs(Number(val)) : 0);
  };

  const lookup = useCallback(() => {
    const exists = backend.hasWord?.(word) ?? true;
    const primes = backend.encode(word);
    const state = backend.primesToState(primes);
    const entropy = state.entropy();
    setWordInfo({ exists, primes, state: safeComponents(state), entropy: Number.isFinite(entropy) ? entropy : 0 });
  }, [word, backend]);

  const sampleWords = ['love', 'wisdom', 'truth', 'beauty', 'justice', 'freedom'];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <input type="text" value={word} onChange={(e) => setWord(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground" placeholder="Enter a word..." />
        <Button onClick={lookup} className="gap-2"><Play className="w-4 h-4" /> Lookup</Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {sampleWords.map(w => (
          <button key={w} onClick={() => setWord(w)} className="px-3 py-1 rounded-full text-sm bg-muted hover:bg-primary/20 transition-colors">{w}</button>
        ))}
      </div>
      {wordInfo && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Prime Signature</p>
              <div className="flex flex-wrap gap-1">
                {wordInfo.primes.slice(0, 12).map((p, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono text-xs">{p}</span>
                ))}
                {wordInfo.primes.length > 12 && <span className="text-muted-foreground text-xs">...</span>}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">State Entropy</p>
              <p className="font-mono text-xl text-primary">{wordInfo.entropy.toFixed(4)} bits</p>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 rounded-lg bg-muted/30">
            <SedenionVisualizer components={wordInfo.state} size="md" />
          </div>
        </div>
      )}
    </div>
  );
};

// Word Algebra Demo
const WordAlgebraDemo = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [wordA, setWordA] = useState('king');
  const [wordB, setWordB] = useState('man');
  const [wordC, setWordC] = useState('woman');
  const [result, setResult] = useState<{word: string; similarity: number} | null>(null);
  
  const vocabulary = ['king', 'queen', 'man', 'woman', 'prince', 'princess', 'boy', 'girl', 'father', 'mother'];

  const textToState = (text: string): number[] => {
    const primes = backend.encode(text);
    const state = backend.primesToState(primes);
    const c = (state as any)?.c || (state as any)?.components || [];
    return Array.from(c).map(v => Number(v) || 0);
  };

  const similarity = (a: number[], b: number[]): number => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
  };

  const runAnalogy = () => {
    const stateA = textToState(wordA);
    const stateB = textToState(wordB);
    const stateC = textToState(wordC);
    
    // b - a + c = ?
    const resultState = stateA.map((_, i) => stateB[i] - stateA[i] + stateC[i]);
    
    let best = { word: '', sim: -1 };
    for (const w of vocabulary.filter(v => v !== wordA && v !== wordB && v !== wordC)) {
      const wState = textToState(w);
      const sim = similarity(resultState, wState);
      if (sim > best.sim) best = { word: w, sim };
    }
    setResult({ word: best.word, similarity: best.sim });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 items-end">
        <div>
          <label className="text-xs text-muted-foreground">A</label>
          <input value={wordA} onChange={e => setWordA(e.target.value)} className="w-full px-3 py-2 rounded bg-secondary border border-border" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">B</label>
          <input value={wordB} onChange={e => setWordB(e.target.value)} className="w-full px-3 py-2 rounded bg-secondary border border-border" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">C</label>
          <input value={wordC} onChange={e => setWordC(e.target.value)} className="w-full px-3 py-2 rounded bg-secondary border border-border" />
        </div>
        <Button onClick={runAnalogy}>Compute</Button>
      </div>
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <p className="text-lg font-mono">{wordA} : {wordB} :: {wordC} : <span className="text-primary font-bold">{result?.word || '?'}</span></p>
        {result && <p className="text-xs text-muted-foreground mt-1">Similarity: {(result.similarity * 100).toFixed(1)}%</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {vocabulary.map(w => (
          <span key={w} className="px-2 py-1 rounded bg-muted text-xs">{w}</span>
        ))}
      </div>
    </div>
  );
};

// Text Classification Demo
const ClassificationDemo = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [prototypes, setPrototypes] = useState<{label: string; examples: string[]; centroid: number[]}[]>([]);
  const [testText, setTestText] = useState('Neural networks are powerful');
  const [predictions, setPredictions] = useState<{label: string; score: number}[]>([]);

  const textToState = (text: string): number[] => {
    const primes = backend.encode(text);
    const state = backend.primesToState(primes);
    const c = (state as any)?.c || (state as any)?.components || [];
    return Array.from(c).map(v => Number(v) || 0);
  };

  const similarity = (a: number[], b: number[]): number => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dot += a[i] * b[i]; magA += a[i] * a[i]; magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
  };

  const train = () => {
    const data = [
      { label: 'tech', examples: ['Machine learning algorithms', 'AI neural networks', 'Computer software'] },
      { label: 'sports', examples: ['Football championship', 'Basketball tournament', 'Athletic competition'] },
      { label: 'food', examples: ['Italian cuisine pasta', 'Gourmet restaurant meal', 'Fresh vegetables cooking'] }
    ];
    const trained = data.map(d => {
      const embeddings = d.examples.map(textToState);
      const centroid = Array(16).fill(0);
      for (const e of embeddings) e.forEach((v, i) => { if (i < 16) centroid[i] += v / embeddings.length; });
      return { label: d.label, examples: d.examples, centroid };
    });
    setPrototypes(trained);
  };

  const classify = () => {
    if (prototypes.length === 0) return;
    const state = textToState(testText);
    const scores = prototypes.map(p => ({ label: p.label, score: similarity(state, p.centroid) }));
    scores.sort((a, b) => b.score - a.score);
    setPredictions(scores);
  };

  return (
    <div className="space-y-4">
      <Button onClick={train}>Train Classifier (3 categories)</Button>
      {prototypes.length > 0 && (
        <>
          <div className="grid md:grid-cols-3 gap-2">
            {prototypes.map(p => (
              <div key={p.label} className="p-3 bg-muted/30 rounded-lg">
                <Badge className="mb-2">{p.label}</Badge>
                <div className="text-xs text-muted-foreground">{p.examples.length} examples</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={testText} onChange={e => setTestText(e.target.value)} className="flex-1 px-3 py-2 rounded bg-secondary border border-border" placeholder="Text to classify..." />
            <Button onClick={classify}>Classify</Button>
          </div>
          {predictions.length > 0 && (
            <div className="space-y-1">
              {predictions.map(p => (
                <div key={p.label} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <span className="font-medium">{p.label}</span>
                  <span className="font-mono text-sm">{(p.score * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Semantic Search Demo
const SemanticSearchDemo = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [query, setQuery] = useState('artificial intelligence');
  const [results, setResults] = useState<{title: string; score: number}[]>([]);

  const docs = [
    { id: 1, title: 'Machine Learning Basics', content: 'ML algorithms learn from data' },
    { id: 2, title: 'Deep Learning Guide', content: 'Neural networks with many layers' },
    { id: 3, title: 'Natural Language Processing', content: 'Text analysis and understanding' },
    { id: 4, title: 'Computer Vision', content: 'Image recognition and analysis' },
    { id: 5, title: 'Cooking Recipes', content: 'Delicious meals and ingredients' }
  ];

  const textToState = (text: string): number[] => {
    const primes = backend.encode(text);
    const state = backend.primesToState(primes);
    const c = (state as any)?.c || (state as any)?.components || [];
    return Array.from(c).map(v => Number(v) || 0);
  };

  const similarity = (a: number[], b: number[]): number => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dot += a[i] * b[i]; magA += a[i] * a[i]; magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
  };

  const search = () => {
    const queryState = textToState(query);
    const scored = docs.map(d => ({
      title: d.title,
      score: similarity(queryState, textToState(d.title + ' ' + d.content))
    }));
    scored.sort((a, b) => b.score - a.score);
    setResults(scored);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} className="flex-1 px-3 py-2 rounded bg-secondary border border-border" placeholder="Search query..." />
        <Button onClick={search} className="gap-2"><Play className="w-4 h-4" /> Search</Button>
      </div>
      <div className="text-xs text-muted-foreground">{docs.length} documents indexed</div>
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className={i === 0 ? 'font-medium text-primary' : ''}>{r.title}</span>
              <Badge variant={i === 0 ? 'default' : 'outline'}>{(r.score * 100).toFixed(0)}%</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// QA System Demo
const QASystemDemo = () => {
  const [backend] = useState(() => createBackend(minimalConfig));
  const [question, setQuestion] = useState('How many planets are in the solar system?');
  const [answer, setAnswer] = useState<{passage: string; topic: string; score: number} | null>(null);

  const knowledge = [
    { topic: 'Solar System', passage: 'The Solar System has eight planets orbiting the Sun.' },
    { topic: 'Earth', passage: 'Earth is the third planet from the Sun and supports life.' },
    { topic: 'Moon', passage: 'The Moon orbits Earth at 384,400 km distance.' },
    { topic: 'Photosynthesis', passage: 'Plants convert sunlight to glucose through photosynthesis.' }
  ];

  const textToState = (text: string): number[] => {
    const primes = backend.encode(text);
    const state = backend.primesToState(primes);
    const c = (state as any)?.c || (state as any)?.components || [];
    return Array.from(c).map(v => Number(v) || 0);
  };

  const similarity = (a: number[], b: number[]): number => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dot += a[i] * b[i]; magA += a[i] * a[i]; magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
  };

  const askQuestion = () => {
    const qState = textToState(question);
    let best = { topic: '', passage: '', score: -1 };
    for (const k of knowledge) {
      const score = similarity(qState, textToState(k.topic + ' ' + k.passage));
      if (score > best.score) best = { ...k, score };
    }
    setAnswer(best);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground mb-2">Knowledge Base ({knowledge.length} passages)</div>
        <div className="flex flex-wrap gap-2">
          {knowledge.map(k => <Badge key={k.topic} variant="outline">{k.topic}</Badge>)}
        </div>
      </div>
      <div className="flex gap-2">
        <input value={question} onChange={e => setQuestion(e.target.value)} className="flex-1 px-3 py-2 rounded bg-secondary border border-border" placeholder="Ask a question..." />
        <Button onClick={askQuestion}>Ask</Button>
      </div>
      {answer && (
        <div className="p-4 border border-primary/30 bg-primary/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Badge>{answer.topic}</Badge>
            <span className="text-xs text-muted-foreground">Confidence: {(answer.score * 100).toFixed(0)}%</span>
          </div>
          <p className="text-sm">{answer.passage}</p>
        </div>
      )}
    </div>
  );
};

// Map example IDs to their component implementations
const exampleComponents: Record<string, React.FC> = {
  'vocabulary': VocabularyExampleDemo,
  'similarity': () => <SimilarityExample />,
  'word-order': () => <WordOrderExample />,
  'clustering': () => <ClusteringExample />,
  'prime-signature': () => <PrimeSignatureExample />,
  'hypercomplex': () => <HypercomplexExample />,
  'composition': () => <StateCompositionExample />,
  'dimension-comparison': () => <DimensionComparisonExample />,
  'expression-builder': () => <ExpressionBuilderExample />,
  'word-algebra': WordAlgebraDemo,
  'classification': ClassificationDemo,
  'semantic-search': SemanticSearchDemo,
  'qa-system': QASystemDemo,
};

const SemanticExamplesPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExample = examplesMeta[currentIndex];
  const ExampleComponent = exampleComponents[currentExample.id];

  const goToPrevious = () => setCurrentIndex((prev) => (prev === 0 ? examplesMeta.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev === examplesMeta.length - 1 ? 0 : prev + 1));

  return (
    <div className="pt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Examples
          </Link>
          <Badge variant="outline" className="mb-2">Semantic Computing</Badge>
          <h1 className="text-3xl font-display font-bold mb-2">Semantic Examples</h1>
          <p className="text-muted-foreground">Natural language processing and concept mapping using prime semantics.</p>
        </div>

        {/* Navigation Pills */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {examplesMeta.map((example, index) => (
            <button key={example.id} onClick={() => setCurrentIndex(index)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                index === currentIndex ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}>
              {example.number}
            </button>
          ))}
        </div>

        {/* Example Content */}
        <AnimatePresence mode="wait">
          <motion.div key={currentExample.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <Card className="mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 px-6 py-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">{currentExample.number}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{currentExample.title}</h2>
                    <p className="text-sm text-muted-foreground">{currentExample.subtitle}</p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-4">
                <p className="text-muted-foreground leading-relaxed mb-4">{currentExample.description}</p>
                <div className="flex flex-wrap gap-2">
                  {currentExample.concepts.map((concept) => (
                    <Badge key={concept} variant="secondary">{concept}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <div className="px-6 py-3 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-sm">Interactive Demo</h3>
              </div>
              <CardContent className="pt-6">
                <ExampleComponent />
              </CardContent>
            </Card>

            <CodeBlock code={currentExample.code} language="javascript" title={`semantic/${currentExample.number}-${currentExample.id}.js`} />
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
          <Button variant="outline" onClick={goToPrevious} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <div className="flex items-center gap-2">
            {examplesMeta.map((_, index) => (
              <button key={index} onClick={() => setCurrentIndex(index)} className="p-1">
                <Circle className={`w-2 h-2 transition-colors ${index === currentIndex ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} />
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={goToNext} className="gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Section Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <Link to="/quickstart">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Previous Section</div>
                  <div className="font-medium">Quickstart</div>
                </div>
              </Button>
            </Link>
            <Link to="/crypto">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Next Section</div>
                  <div className="font-medium">Cryptography</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemanticExamplesPage;
