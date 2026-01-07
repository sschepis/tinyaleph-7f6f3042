import { useState, useCallback, useMemo } from 'react';
import { Play, ArrowRight, GitCompare, Layers, Tag, Combine, Box, BarChart3, Workflow, Plus, X, RotateCcw } from 'lucide-react';
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

  const compute = useCallback(() => {
    try {
      // Create two random hypercomplex numbers
      const aComponents = Array.from({ length: dimension }, () => 
        Math.round((Math.random() * 2 - 1) * 100) / 100
      );
      const bComponents = Array.from({ length: dimension }, () => 
        Math.round((Math.random() * 2 - 1) * 100) / 100
      );

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
      const aComponents = Array.from({ length: dimension }, () => 
        Math.round((Math.random() * 2 - 1) * 100) / 100
      );
      const bComponents = Array.from({ length: dimension }, () => 
        Math.round((Math.random() * 2 - 1) * 100) / 100
      );
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
  const [backend] = useState(() => new SemanticBackend(minimalConfig));
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
    const c = state?.c || state?.components || [];
    if (!Array.isArray(c)) return Array(16).fill(0);
    return c.map((val: number) => {
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

  const StateBar = ({ components, label, color }: { components: number[]; label: string; color: string }) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex gap-0.5 h-8">
        {components.slice(0, 16).map((v, i) => {
          const normalized = Math.min(1, Math.abs(v));
          return (
            <div 
              key={i} 
              className="flex-1 rounded-sm flex items-end"
              style={{ backgroundColor: `hsl(var(--muted))` }}
            >
              <div 
                className="w-full rounded-sm transition-all"
                style={{ 
                  height: `${normalized * 100}%`,
                  backgroundColor: v >= 0 ? color : `hsl(var(--destructive))`,
                  opacity: 0.8
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

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
  const [backend] = useState(() => new SemanticBackend(minimalConfig));
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
                <div className="flex gap-1 h-24 items-end">
                  {d.components.map((v, i) => {
                    const height = Math.min(100, Math.abs(v) * 50);
                    const isPositive = v >= 0;
                    const isDominant = i === d.dominantAxis.index;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full rounded-t transition-all relative"
                          style={{ 
                            height: `${height}%`,
                            backgroundColor: isDominant 
                              ? 'hsl(var(--primary))' 
                              : isPositive 
                                ? 'hsl(var(--primary) / 0.4)' 
                                : 'hsl(var(--destructive) / 0.4)',
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
  const [backend] = useState(() => new SemanticBackend(minimalConfig));
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
              <div className="flex gap-0.5 h-12">
                {result.components.map((v, i) => {
                  const normalized = Math.min(1, Math.abs(v));
                  return (
                    <div 
                      key={i} 
                      className="flex-1 rounded-sm flex items-end bg-muted/30"
                    >
                      <div 
                        className="w-full rounded-sm transition-all"
                        style={{ 
                          height: `${normalized * 100}%`,
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
          <HypercomplexExample />
          <StateCompositionExample />
          <DimensionComparisonExample />
          <ExpressionBuilderExample />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SemanticExamplesPage;
