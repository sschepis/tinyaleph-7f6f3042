import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';
import SedenionVisualizer from '../components/SedenionVisualizer';
import { ArrowLeft, Play, Sparkles, Grid3X3, Languages, Compass, Zap, BookOpen, RotateCcw, Eye, Layers } from 'lucide-react';

// Enochian alphabet with prime mappings and extended metadata
const ENOCHIAN_ALPHABET = [
  { letter: 'A', enochian: 'Un', prime: 7, meaning: 'Unity', element: 'Spirit', glyph: '𐤀' },
  { letter: 'B', enochian: 'Pa', prime: 11, meaning: 'Voice', element: 'Air', glyph: '𐤁' },
  { letter: 'C', enochian: 'Veh', prime: 13, meaning: 'Spirit', element: 'Fire', glyph: '𐤂' },
  { letter: 'D', enochian: 'Gal', prime: 17, meaning: 'Earth', element: 'Earth', glyph: '𐤃' },
  { letter: 'E', enochian: 'Orth', prime: 19, meaning: 'Light', element: 'Spirit', glyph: '𐤄' },
  { letter: 'F', enochian: 'Na', prime: 23, meaning: 'Lord', element: 'Fire', glyph: '𐤅' },
  { letter: 'G', enochian: 'Ged', prime: 29, meaning: 'Garden', element: 'Earth', glyph: '𐤆' },
  { letter: 'H', enochian: 'Graph', prime: 7, meaning: 'Fire', element: 'Fire', glyph: '𐤇' },
  { letter: 'I', enochian: 'Gon', prime: 11, meaning: 'Wisdom', element: 'Water', glyph: '𐤈' },
  { letter: 'K', enochian: 'Ur', prime: 13, meaning: 'Power', element: 'Fire', glyph: '𐤉' },
  { letter: 'L', enochian: 'Tal', prime: 17, meaning: 'Cup', element: 'Water', glyph: '𐤊' },
  { letter: 'M', enochian: 'Drux', prime: 19, meaning: 'Pain', element: 'Earth', glyph: '𐤋' },
  { letter: 'N', enochian: 'Pal', prime: 23, meaning: 'Daughter', element: 'Water', glyph: '𐤌' },
  { letter: 'O', enochian: 'Med', prime: 29, meaning: 'Oil', element: 'Spirit', glyph: '𐤍' },
  { letter: 'P', enochian: 'Mals', prime: 7, meaning: 'Son', element: 'Air', glyph: '𐤎' },
  { letter: 'Q', enochian: 'Ceph', prime: 11, meaning: 'Water', element: 'Water', glyph: '𐤏' },
  { letter: 'R', enochian: 'Don', prime: 13, meaning: 'Action', element: 'Fire', glyph: '𐤐' },
  { letter: 'S', enochian: 'Fam', prime: 17, meaning: 'Sister', element: 'Air', glyph: '𐤑' },
  { letter: 'T', enochian: 'Gisg', prime: 19, meaning: 'Desire', element: 'Fire', glyph: '𐤒' },
  { letter: 'U', enochian: 'Van', prime: 23, meaning: 'Brother', element: 'Air', glyph: '𐤓' },
  { letter: 'X', enochian: 'Ger', prime: 29, meaning: 'End', element: 'Spirit', glyph: '𐤔' },
];

// Prime basis for Enochian: P_E = {7, 11, 13, 17, 19, 23, 29}
const PRIME_BASIS = [7, 11, 13, 17, 19, 23, 29];

// Element colors
const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'hsl(15, 80%, 50%)',
  Water: 'hsl(200, 80%, 50%)',
  Earth: 'hsl(35, 60%, 40%)',
  Air: 'hsl(50, 70%, 50%)',
  Spirit: 'hsl(280, 60%, 60%)',
};

// Encode a letter to prime
function letterToPrime(letter: string): number {
  const entry = ENOCHIAN_ALPHABET.find(e => e.letter === letter.toUpperCase());
  return entry?.prime || 7;
}

// Get letter entry
function getLetterEntry(letter: string) {
  return ENOCHIAN_ALPHABET.find(e => e.letter === letter.toUpperCase());
}

// Encode word to prime signature
function wordToPrimeSignature(word: string): number[] {
  return word.toUpperCase().split('').filter(c => c.match(/[A-Z]/)).map(letterToPrime);
}

// Calculate prime product
function primeProduct(primes: number[]): bigint {
  return primes.reduce((acc, p) => acc * BigInt(p), BigInt(1));
}

// Map prime signature to 16D sedenion components
function primesToSedenion(primes: number[]): number[] {
  const components = new Array(16).fill(0);
  
  primes.forEach((prime, i) => {
    const basisIndex = PRIME_BASIS.indexOf(prime);
    if (basisIndex !== -1) {
      const primaryDim = basisIndex % 16;
      const secondaryDim = (basisIndex + i + 7) % 16;
      const tertiaryDim = (basisIndex * 2 + i) % 16;
      
      const weight = 1 / (1 + i * 0.1);
      components[primaryDim] += weight * 0.6;
      components[secondaryDim] += weight * 0.3;
      components[tertiaryDim] += weight * 0.1;
    }
  });
  
  const norm = Math.sqrt(components.reduce((s, c) => s + c * c, 0)) || 1;
  return components.map(c => c / norm);
}

// Calculate entropy of sedenion state
function sedenionEntropy(components: number[]): number {
  const total = components.reduce((s, c) => s + Math.abs(c), 0) || 1;
  const probs = components.map(c => Math.abs(c) / total);
  return -probs.filter(p => p > 0).reduce((s, p) => s + p * Math.log2(p), 0);
}

// Calculate resonance between two sedenion states
function sedenionResonance(s1: number[], s2: number[]): number {
  const dot = s1.reduce((s, v, i) => s + v * s2[i], 0);
  const norm1 = Math.sqrt(s1.reduce((s, v) => s + v * v, 0));
  const norm2 = Math.sqrt(s2.reduce((s, v) => s + v * v, 0));
  return dot / (norm1 * norm2 || 1);
}

// Get elemental composition of a word
function getElementalComposition(word: string): Record<string, number> {
  const composition: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0, Spirit: 0 };
  word.toUpperCase().split('').forEach(c => {
    const entry = getLetterEntry(c);
    if (entry) composition[entry.element]++;
  });
  return composition;
}

// ==================== Interactive Alphabet Grid ====================

const InteractiveAlphabetGrid = () => {
  const [selected, setSelected] = useState<typeof ENOCHIAN_ALPHABET[0] | null>(null);
  
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Grid3X3 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">21-Letter Angelic Alphabet</h3>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-6">
        {ENOCHIAN_ALPHABET.map((entry, i) => (
          <button 
            key={i}
            onClick={() => setSelected(entry)}
            className={`
              p-3 rounded-lg border text-center transition-all hover:scale-105
              ${selected?.letter === entry.letter 
                ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20' 
                : 'border-border bg-muted/50 hover:border-primary/50'
              }
            `}
          >
            <div className="text-2xl mb-1" style={{ color: ELEMENT_COLORS[entry.element] }}>
              {entry.glyph}
            </div>
            <div className="text-lg font-bold text-primary">{entry.letter}</div>
            <div className="text-xs text-muted-foreground">{entry.enochian}</div>
            <div className="text-xs font-mono text-cyan-400">p={entry.prime}</div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <div 
              className="text-5xl p-4 rounded-xl"
              style={{ backgroundColor: `${ELEMENT_COLORS[selected.element]}20`, color: ELEMENT_COLORS[selected.element] }}
            >
              {selected.glyph}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Letter</p>
                <p className="text-2xl font-bold text-primary">{selected.letter}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Enochian Name</p>
                <p className="text-lg font-semibold">{selected.enochian}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prime Value</p>
                <p className="font-mono text-cyan-400">{selected.prime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Element</p>
                <p style={{ color: ELEMENT_COLORS[selected.element] }}>{selected.element}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Meaning</p>
                <p className="text-lg">{selected.meaning}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Prime Basis Visualization ====================

const PrimeBasisViz = () => (
  <div className="p-4 rounded-lg bg-muted/30">
    <h4 className="text-sm font-medium mb-3">Prime Basis P<sub>E</sub></h4>
    <div className="flex flex-wrap gap-3 justify-center">
      {PRIME_BASIS.map((prime, i) => {
        const hue = 180 + i * 25;
        const letters = ENOCHIAN_ALPHABET.filter(e => e.prime === prime).map(e => e.letter);
        return (
          <div
            key={prime}
            className="px-4 py-3 rounded-xl border text-center min-w-[80px]"
            style={{ 
              backgroundColor: `hsla(${hue}, 60%, 40%, 0.15)`,
              borderColor: `hsla(${hue}, 60%, 50%, 0.4)`,
            }}
          >
            <div className="font-mono text-2xl font-bold" style={{ color: `hsl(${hue}, 70%, 60%)` }}>
              {prime}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">p<sub>{i + 1}</sub></div>
            <div className="text-xs text-muted-foreground mt-1">{letters.join(', ')}</div>
          </div>
        );
      })}
    </div>
  </div>
);

// ==================== Enhanced Word Encoder ====================

const EnochianEncoderExample = () => {
  const [word, setWord] = useState('LIGHT');
  const [result, setResult] = useState<{
    primes: number[];
    product: string;
    sedenion: number[];
    entropy: number;
    elements: Record<string, number>;
    letterDetails: { letter: string; entry: typeof ENOCHIAN_ALPHABET[0] | undefined }[];
  } | null>(null);

  const encodeWord = useCallback(() => {
    const primes = wordToPrimeSignature(word);
    const product = primeProduct(primes);
    const sedenion = primesToSedenion(primes);
    const entropy = sedenionEntropy(sedenion);
    const elements = getElementalComposition(word);
    const letterDetails = word.toUpperCase().split('').map(letter => ({
      letter,
      entry: getLetterEntry(letter)
    }));
    
    setResult({ primes, product: product.toString(), sedenion, entropy, elements, letterDetails });
  }, [word]);

  useEffect(() => {
    encodeWord();
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary" />
          Enochian Word Encoder
        </h3>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Each letter maps to a prime from the basis P<sub>E</sub>.
              The word becomes a prime signature that encodes into 16D sedenion space.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Word</label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono text-xl tracking-widest"
                maxLength={12}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['LIGHT', 'WISDOM', 'TRUTH', 'SPIRIT', 'ANGEL', 'POWER', 'HEAVEN'].map(w => (
                <button
                  key={w}
                  onClick={() => setWord(w)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    word === w ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/20'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            <button
              onClick={encodeWord}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Encode
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              {/* Letter breakdown */}
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-3">Letter Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  {result.letterDetails.filter(d => d.entry).map((d, i) => (
                    <div 
                      key={i} 
                      className="px-3 py-2 rounded-lg border border-border bg-card text-center"
                    >
                      <div className="text-lg" style={{ color: ELEMENT_COLORS[d.entry!.element] }}>
                        {d.entry!.glyph}
                      </div>
                      <div className="font-bold text-primary">{d.letter}</div>
                      <div className="text-xs text-muted-foreground">{d.entry!.enochian}</div>
                      <div className="text-xs font-mono text-cyan-400">p={d.entry!.prime}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elemental composition */}
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Elemental Composition</p>
                <div className="flex gap-2">
                  {Object.entries(result.elements).filter(([, count]) => count > 0).map(([element, count]) => (
                    <div 
                      key={element}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: `${ELEMENT_COLORS[element]}30`, color: ELEMENT_COLORS[element] }}
                    >
                      {element}: {count}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Prime Product</p>
                  <p className="font-mono text-lg text-primary break-all">{result.product}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Entropy</p>
                  <p className="font-mono text-2xl text-primary">{result.entropy.toFixed(3)}</p>
                  <p className="text-xs text-muted-foreground">bits</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">16D Sedenion State</p>
                <SedenionVisualizer components={result.sedenion} animated={false} size="lg" />
              </div>
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { EnochianEngine, enochianAlphabet } from '@aleph-ai/tinyaleph';

// Create Enochian engine with prime basis P_E = {7, 11, 13, 17, 19, 23, 29}
const engine = new EnochianEngine();

// Encode a word into 16D sedenion space
const word = 'LIGHT';
const result = engine.encode(word);

console.log('Prime signature:', result.primes);      // [17, 11, 13, 7, 19]
console.log('Product:', result.product);             // 340561n
console.log('Sedenion:', result.sedenion.components);
console.log('Entropy:', result.entropy);             // ~3.2 bits

// Get elemental composition
const elements = engine.analyzeElements(word);
console.log('Elements:', elements);  // { Fire: 1, Spirit: 2, ... }

// Lookup letter meanings
for (const letter of word) {
  const entry = enochianAlphabet.get(letter);
  console.log(\`\${letter} → \${entry.enochian} (p=\${entry.prime}): \${entry.meaning}\`);
}`}
        language="javascript"
        title="enochian-encoder.js"
      />
    </div>
  );
};

// ==================== Word Resonance Comparison ====================

const WordResonanceExample = () => {
  const [word1, setWord1] = useState('LIGHT');
  const [word2, setWord2] = useState('TRUTH');
  const [result, setResult] = useState<{
    s1: number[];
    s2: number[];
    resonance: number;
    sharedPrimes: number[];
    e1: Record<string, number>;
    e2: Record<string, number>;
  } | null>(null);

  const compare = useCallback(() => {
    const primes1 = wordToPrimeSignature(word1);
    const primes2 = wordToPrimeSignature(word2);
    const s1 = primesToSedenion(primes1);
    const s2 = primesToSedenion(primes2);
    const resonance = sedenionResonance(s1, s2);
    const sharedPrimes = primes1.filter(p => primes2.includes(p));
    
    setResult({
      s1, s2, resonance,
      sharedPrimes: [...new Set(sharedPrimes)],
      e1: getElementalComposition(word1),
      e2: getElementalComposition(word2)
    });
  }, [word1, word2]);

  useEffect(() => { compare(); }, []);

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Compass className="w-5 h-5 text-primary" />
        Word Resonance Comparison
      </h3>

      <p className="text-sm text-muted-foreground mb-4">
        Compare two words to measure their semantic resonance in sedenion space.
        Words with shared prime signatures resonate more strongly.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Word 1</label>
          <input
            type="text"
            value={word1}
            onChange={(e) => setWord1(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono"
            maxLength={12}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Word 2</label>
          <input
            type="text"
            value={word2}
            onChange={(e) => setWord2(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono"
            maxLength={12}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          ['LIGHT', 'TRUTH'], ['FIRE', 'WATER'], ['WISDOM', 'POWER'], 
          ['ANGEL', 'SPIRIT'], ['HEAVEN', 'EARTH']
        ].map(([w1, w2]) => (
          <button
            key={`${w1}-${w2}`}
            onClick={() => { setWord1(w1); setWord2(w2); }}
            className="px-2 py-1 rounded text-xs bg-muted hover:bg-primary/20 transition-colors"
          >
            {w1} ↔ {w2}
          </button>
        ))}
      </div>

      <button
        onClick={compare}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-6"
      >
        <Zap className="w-4 h-4" /> Compare
      </button>

      {result && (
        <div className="space-y-4">
          {/* Resonance meter */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Resonance Score</span>
              <span className="font-mono text-2xl text-primary">{(result.resonance * 100).toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-primary to-purple-500 transition-all duration-500"
                style={{ width: `${Math.abs(result.resonance) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {result.resonance > 0.8 ? '⚡ Strong harmonic resonance' :
               result.resonance > 0.5 ? '🔗 Moderate semantic connection' :
               result.resonance > 0.2 ? '〰️ Weak resonance' : '🔇 Minimal connection'}
            </p>
          </div>

          {/* Shared primes */}
          {result.sharedPrimes.length > 0 && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-sm font-medium text-purple-400 mb-2">Shared Prime Factors</p>
              <div className="flex gap-2">
                {result.sharedPrimes.map(p => (
                  <span key={p} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Side by side visualization */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
              <p className="font-mono text-lg text-cyan-400 mb-3">{word1}</p>
              <SedenionVisualizer components={result.s1} animated={false} size="md" />
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
              <p className="font-mono text-lg text-emerald-400 mb-3">{word2}</p>
              <SedenionVisualizer components={result.s2} animated={false} size="md" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Sedenion Multiplication ====================

const SedenionMultiplicationExample = () => {
  const [word1, setWord1] = useState('FIRE');
  const [word2, setWord2] = useState('WATER');
  const [result, setResult] = useState<{
    s1: number[];
    s2: number[];
    product: number[];
    entropy: number;
    reverseProduct: number[];
    reverseEntropy: number;
    commutativeDiff: number;
  } | null>(null);

  const multiplySedenions = useCallback(() => {
    const primes1 = wordToPrimeSignature(word1);
    const primes2 = wordToPrimeSignature(word2);
    
    const s1 = primesToSedenion(primes1);
    const s2 = primesToSedenion(primes2);
    
    // Sedenion multiplication (simplified Cayley-Dickson)
    const multiply = (a: number[], b: number[]): number[] => {
      const result = new Array(16).fill(0);
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
          const k = (i + j) % 16;
          const sign = ((i * j) % 3 === 0) ? 1 : (i > j ? -1 : 1);
          result[k] += sign * a[i] * b[j];
        }
      }
      const norm = Math.sqrt(result.reduce((s, c) => s + c * c, 0)) || 1;
      return result.map(c => c / norm);
    };
    
    const product = multiply(s1, s2);
    const reverseProduct = multiply(s2, s1);
    
    // Measure non-commutativity
    const commutativeDiff = Math.sqrt(
      product.reduce((s, v, i) => s + (v - reverseProduct[i]) ** 2, 0)
    );
    
    setResult({
      s1, s2, product,
      entropy: sedenionEntropy(product),
      reverseProduct,
      reverseEntropy: sedenionEntropy(reverseProduct),
      commutativeDiff
    });
  }, [word1, word2]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Sedenion Multiplication
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          Combine two Enochian words using 16D sedenion multiplication.
          The non-associative, non-commutative algebra creates emergent semantic meanings.
        </p>

        <div className="grid md:grid-cols-3 gap-4 items-center mb-4">
          <input
            type="text"
            value={word1}
            onChange={(e) => setWord1(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            className="px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono text-xl text-center tracking-wide"
            maxLength={10}
          />
          <div className="text-center text-3xl text-primary font-bold">×</div>
          <input
            type="text"
            value={word2}
            onChange={(e) => setWord2(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            className="px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono text-xl text-center tracking-wide"
            maxLength={10}
          />
        </div>

        <button
          onClick={multiplySedenions}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mx-auto"
        >
          <Play className="w-4 h-4" /> Multiply
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            {/* Operands and results */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
                <p className="text-sm text-cyan-400 mb-2">{word1}</p>
                <SedenionVisualizer components={result.s1} animated={false} size="sm" />
              </div>
              
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                <p className="text-sm text-emerald-400 mb-2">{word2}</p>
                <SedenionVisualizer components={result.s2} animated={false} size="sm" />
              </div>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <p className="text-sm text-primary mb-2">{word1} × {word2}</p>
                <SedenionVisualizer components={result.product} animated={true} size="sm" />
                <p className="text-xs text-muted-foreground mt-1">H = {result.entropy.toFixed(2)}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
                <p className="text-sm text-purple-400 mb-2">{word2} × {word1}</p>
                <SedenionVisualizer components={result.reverseProduct} animated={true} size="sm" />
                <p className="text-xs text-muted-foreground mt-1">H = {result.reverseEntropy.toFixed(2)}</p>
              </div>
            </div>

            {/* Non-commutativity indicator */}
            <div className={`p-4 rounded-lg ${result.commutativeDiff > 0.1 ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Non-Commutativity</span>
                <span className="font-mono text-lg">Δ = {result.commutativeDiff.toFixed(4)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {result.commutativeDiff > 0.1 
                  ? `⚠️ A × B ≠ B × A — Order matters! The meaning changes based on which word comes first.`
                  : `✓ Nearly commutative for these words.`
                }
              </p>
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { EnochianEngine, Sedenion } from '@aleph-ai/tinyaleph';

const engine = new EnochianEngine();

// Encode words to sedenions
const fire = engine.encode('FIRE').sedenion;
const water = engine.encode('WATER').sedenion;

// Multiply using Cayley-Dickson sedenion algebra
const combined = fire.mul(water);
const reversed = water.mul(fire);

console.log('Fire × Water:', combined.components);
console.log('Water × Fire:', reversed.components);

// Measure non-commutativity
const diff = combined.sub(reversed).norm();
console.log('Non-commutativity:', diff); // > 0 means order matters!

// Note: Sedenion multiplication is neither commutative nor associative
// This creates rich semantic interference patterns`}
        language="javascript"
        title="sedenion-multiply.js"
      />
    </div>
  );
};

// ==================== Invocation Builder ====================

const InvocationBuilder = () => {
  const [words, setWords] = useState<string[]>(['LIGHT', 'WISDOM', 'TRUTH']);
  const [newWord, setNewWord] = useState('');
  const [result, setResult] = useState<{
    combinedSedenion: number[];
    totalEntropy: number;
    elementalBalance: Record<string, number>;
    primeSpectrum: Record<number, number>;
  } | null>(null);

  const addWord = () => {
    if (newWord && words.length < 7) {
      setWords([...words, newWord.toUpperCase()]);
      setNewWord('');
    }
  };

  const removeWord = (idx: number) => {
    setWords(words.filter((_, i) => i !== idx));
  };

  const buildInvocation = useCallback(() => {
    if (words.length === 0) return;

    // Combine all sedenions
    let combined = new Array(16).fill(0);
    const primeSpectrum: Record<number, number> = {};
    const elementalBalance: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0, Spirit: 0 };

    words.forEach((word, wordIdx) => {
      const primes = wordToPrimeSignature(word);
      const sedenion = primesToSedenion(primes);
      const elements = getElementalComposition(word);
      
      // Weight by position (earlier words have more influence)
      const weight = 1 / (1 + wordIdx * 0.2);
      
      combined = combined.map((v, i) => v + sedenion[i] * weight);
      
      primes.forEach(p => primeSpectrum[p] = (primeSpectrum[p] || 0) + 1);
      Object.entries(elements).forEach(([e, count]) => elementalBalance[e] += count);
    });

    // Normalize
    const norm = Math.sqrt(combined.reduce((s, c) => s + c * c, 0)) || 1;
    combined = combined.map(c => c / norm);

    setResult({
      combinedSedenion: combined,
      totalEntropy: sedenionEntropy(combined),
      elementalBalance,
      primeSpectrum
    });
  }, [words]);

  useEffect(() => { buildInvocation(); }, [buildInvocation]);

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        Invocation Builder
      </h3>

      <p className="text-sm text-muted-foreground mb-4">
        Construct multi-word invocations by combining Enochian words.
        The combined sedenion represents the composite semantic field.
      </p>

      {/* Current words */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
        {words.map((word, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/20 border border-primary/30"
          >
            <span className="font-mono text-primary">{word}</span>
            <button 
              onClick={() => removeWord(idx)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        {words.length === 0 && (
          <span className="text-muted-foreground italic">Add words to build an invocation...</span>
        )}
      </div>

      {/* Add word input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && addWord()}
          placeholder="Add word..."
          className="flex-1 px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono"
          maxLength={10}
        />
        <button
          onClick={addWord}
          disabled={!newWord || words.length >= 7}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Add
        </button>
        <button
          onClick={() => setWords([])}
          className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          ['LIGHT', 'WISDOM', 'TRUTH'],
          ['FIRE', 'SPIRIT', 'POWER'],
          ['ANGEL', 'HEAVEN', 'LIGHT'],
        ].map((preset, i) => (
          <button
            key={i}
            onClick={() => setWords(preset)}
            className="px-2 py-1 rounded text-xs bg-muted hover:bg-primary/20 transition-colors"
          >
            {preset.join(' + ')}
          </button>
        ))}
      </div>

      {result && words.length > 0 && (
        <div className="space-y-4">
          {/* Combined sedenion */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30">
            <p className="text-sm font-medium mb-3">Combined Semantic Field</p>
            <div className="flex items-center gap-6">
              <SedenionVisualizer components={result.combinedSedenion} animated={true} size="lg" />
              <div>
                <p className="text-xs text-muted-foreground">Total Entropy</p>
                <p className="font-mono text-2xl text-primary">{result.totalEntropy.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">bits</p>
              </div>
            </div>
          </div>

          {/* Elemental balance */}
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-3">Elemental Balance</p>
            <div className="space-y-2">
              {Object.entries(result.elementalBalance).filter(([, v]) => v > 0).map(([element, count]) => {
                const maxCount = Math.max(...Object.values(result.elementalBalance));
                return (
                  <div key={element} className="flex items-center gap-3">
                    <span className="w-16 text-sm" style={{ color: ELEMENT_COLORS[element] }}>{element}</span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${(count / maxCount) * 100}%`,
                          backgroundColor: ELEMENT_COLORS[element]
                        }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-sm">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prime spectrum */}
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-3">Prime Spectrum</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.primeSpectrum)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .map(([prime, count]) => (
                  <div 
                    key={prime}
                    className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-sm"
                  >
                    {prime}<sup>×{count}</sup>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Glyph Visualizer ====================

const GlyphVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [word, setWord] = useState('ANGEL');
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear
    ctx.fillStyle = 'hsl(220, 25%, 8%)';
    ctx.fillRect(0, 0, w, h);

    const letters = word.toUpperCase().split('').filter(c => getLetterEntry(c));
    if (letters.length === 0) return;

    const sedenion = primesToSedenion(wordToPrimeSignature(word));
    
    // Draw background circles
    ctx.strokeStyle = 'hsla(220, 20%, 30%, 0.3)';
    ctx.lineWidth = 1;
    [0.3, 0.5, 0.7, 0.9].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * Math.min(w, h) / 2 * 0.9, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw letter glyphs in a circle
    const radius = Math.min(w, h) * 0.35;
    letters.forEach((letter, i) => {
      const entry = getLetterEntry(letter);
      if (!entry) return;

      const angle = (i / letters.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      // Draw glyph
      ctx.font = '32px serif';
      ctx.fillStyle = ELEMENT_COLORS[entry.element];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(entry.glyph, x, y);

      // Draw connection to center
      ctx.strokeStyle = `${ELEMENT_COLORS[entry.element]}40`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw center sedenion representation
    const maxComp = Math.max(...sedenion.map(Math.abs)) || 1;
    sedenion.slice(0, 8).forEach((comp, i) => {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const len = (Math.abs(comp) / maxComp) * 50;
      const x = cx + Math.cos(angle) * len;
      const y = cy + Math.sin(angle) * len;

      ctx.fillStyle = `hsla(${180 + i * 20}, 70%, 60%, 0.8)`;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Center point
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    
  }, [word]);

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-primary" />
        Glyph Mandala Visualizer
      </h3>

      <p className="text-sm text-muted-foreground mb-4">
        Visualize the geometric arrangement of Enochian glyphs and their elemental connections.
      </p>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
          className="flex-1 px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono"
          maxLength={12}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['ANGEL', 'SPIRIT', 'WISDOM', 'HEAVEN', 'LIGHT'].map(w => (
          <button
            key={w}
            onClick={() => setWord(w)}
            className={`px-3 py-1 rounded text-sm ${word === w ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/20'}`}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          className="rounded-xl border border-border"
        />
      </div>
    </div>
  );
};

// ==================== Main Page ====================

const EnochianExamplesPage = () => {
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
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20">
                <Layers className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold">Enochian Language Module</h1>
                <p className="text-muted-foreground">
                  The 21-letter angelic alphabet in 16D sedenion space
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              A specialized engine mapping the angelic alphabet to prime basis 
              P<sub>E</sub> = {'{7, 11, 13, 17, 19, 23, 29}'}, enabling hypercomplex 
              semantic operations through non-associative sedenion algebra.
            </p>
          </div>

          <div className="space-y-12">
            {/* Alphabet Reference */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
                Angelic Alphabet
              </h2>
              <InteractiveAlphabetGrid />
              <div className="mt-4">
                <PrimeBasisViz />
              </div>
            </section>

            {/* Word Encoder */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
                Word Encoding
              </h2>
              <EnochianEncoderExample />
            </section>

            {/* Word Resonance */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">3</span>
                Word Resonance
              </h2>
              <WordResonanceExample />
            </section>

            {/* Sedenion Multiplication */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">4</span>
                Sedenion Operations
              </h2>
              <SedenionMultiplicationExample />
            </section>

            {/* Invocation Builder */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">5</span>
                Invocation Builder
              </h2>
              <InvocationBuilder />
            </section>

            {/* Glyph Visualizer */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">6</span>
                Glyph Visualization
              </h2>
              <GlyphVisualizer />
            </section>

            {/* Theory Section */}
            <section className="p-6 rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/20">
              <h3 className="font-display font-semibold text-xl mb-6 gradient-text">Theoretical Background</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" /> Prime Basis Selection
                    </h4>
                    <p className="text-muted-foreground">
                      The 7-prime basis {'{7, 11, 13, 17, 19, 23, 29}'} was chosen for its 
                      cyclic properties mod 16, ensuring uniform distribution across 
                      sedenion dimensions while maintaining unique factorization.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" /> Cayley-Dickson Construction
                    </h4>
                    <p className="text-muted-foreground">
                      Sedenions (16D) extend octonions via the Cayley-Dickson construction:
                      (a, b) × (c, d) = (ac - d*b, da + bc*). Each doubling loses algebraic
                      properties: associativity at octonions, alternativity at sedenions.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" /> Semantic Interference
                    </h4>
                    <p className="text-muted-foreground">
                      Non-commutativity creates semantic interference patterns: "FIRE × WATER" 
                      differs from "WATER × FIRE". This models how word order affects meaning
                      in natural language.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" /> Zero Divisors
                    </h4>
                    <p className="text-muted-foreground">
                      Sedenions contain zero divisors: non-zero elements a, b where ab = 0.
                      These represent semantic "annihilations" where combining certain concepts
                      produces null meaning—useful for modeling contradictions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-card/50 border border-border">
                <h4 className="font-medium mb-2">Historical Context</h4>
                <p className="text-sm text-muted-foreground">
                  The Enochian alphabet was developed by John Dee and Edward Kelley in the 16th century,
                  purportedly received through angelic communication. This implementation maps their
                  symbolic system onto modern hypercomplex algebra, creating a bridge between esoteric
                  tradition and computational semantics.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnochianExamplesPage;
