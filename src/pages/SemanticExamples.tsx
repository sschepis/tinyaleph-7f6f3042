import { useState, useCallback } from 'react';
import { Play, ArrowRight, GitCompare, Layers, Tag, Brain } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SedenionVisualizer from '../components/SedenionVisualizer';
import {
  SemanticBackend,
  Hypercomplex,
} from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';

// Example 1: Vocabulary Building
const VocabularyExample = () => {
  const [backend] = useState(() => new SemanticBackend(minimalConfig));
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
  const [backend] = useState(() => new SemanticBackend(minimalConfig));
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
  const [backend] = useState(() => new SemanticBackend(minimalConfig));
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
  const [backend] = useState(() => new SemanticBackend(minimalConfig));
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
  const [backend] = useState(() => new SemanticBackend(minimalConfig));
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

const SemanticExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Semantic Computing Examples</h1>
          <p className="text-muted-foreground">
            Natural language processing and concept mapping using prime semantics.
          </p>
        </div>

        <div className="space-y-12">
          <VocabularyExample />
          <SimilarityExample />
          <WordOrderExample />
          <ClusteringExample />
          <PrimeSignatureExample />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SemanticExamplesPage;
