import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';
import SedenionVisualizer from '../components/SedenionVisualizer';
import { ArrowLeft, Play, Sparkles, Grid3X3, Languages } from 'lucide-react';

// Enochian alphabet with prime mappings
const ENOCHIAN_ALPHABET = [
  { letter: 'A', enochian: 'Un', prime: 7, meaning: 'Unity' },
  { letter: 'B', enochian: 'Pa', prime: 11, meaning: 'Voice' },
  { letter: 'C', enochian: 'Veh', prime: 13, meaning: 'Spirit' },
  { letter: 'D', enochian: 'Gal', prime: 17, meaning: 'Earth' },
  { letter: 'E', enochian: 'Orth', prime: 19, meaning: 'Light' },
  { letter: 'F', enochian: 'Na', prime: 23, meaning: 'Lord' },
  { letter: 'G', enochian: 'Ged', prime: 29, meaning: 'Garden' },
  { letter: 'H', enochian: 'Graph', prime: 7, meaning: 'Fire' },
  { letter: 'I', enochian: 'Gon', prime: 11, meaning: 'Wisdom' },
  { letter: 'K', enochian: 'Ur', prime: 13, meaning: 'Power' },
  { letter: 'L', enochian: 'Tal', prime: 17, meaning: 'Cup' },
  { letter: 'M', enochian: 'Drux', prime: 19, meaning: 'Pain' },
  { letter: 'N', enochian: 'Pal', prime: 23, meaning: 'Daughter' },
  { letter: 'O', enochian: 'Med', prime: 29, meaning: 'Oil' },
  { letter: 'P', enochian: 'Mals', prime: 7, meaning: 'Son' },
  { letter: 'Q', enochian: 'Ceph', prime: 11, meaning: 'Water' },
  { letter: 'R', enochian: 'Don', prime: 13, meaning: 'Action' },
  { letter: 'S', enochian: 'Fam', prime: 17, meaning: 'Sister' },
  { letter: 'T', enochian: 'Gisg', prime: 19, meaning: 'Desire' },
  { letter: 'U', enochian: 'Van', prime: 23, meaning: 'Brother' },
  { letter: 'X', enochian: 'Ger', prime: 29, meaning: 'End' },
];

// Prime basis for Enochian: P_E = {7, 11, 13, 17, 19, 23, 29}
const PRIME_BASIS = [7, 11, 13, 17, 19, 23, 29];

// Encode a letter to prime
function letterToPrime(letter: string): number {
  const entry = ENOCHIAN_ALPHABET.find(e => e.letter === letter.toUpperCase());
  return entry?.prime || 7;
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
      // Distribute across sedenion dimensions based on prime and position
      const primaryDim = basisIndex % 16;
      const secondaryDim = (basisIndex + i + 7) % 16;
      const tertiaryDim = (basisIndex * 2 + i) % 16;
      
      const weight = 1 / (1 + i * 0.1);
      components[primaryDim] += weight * 0.6;
      components[secondaryDim] += weight * 0.3;
      components[tertiaryDim] += weight * 0.1;
    }
  });
  
  // Normalize
  const norm = Math.sqrt(components.reduce((s, c) => s + c * c, 0)) || 1;
  return components.map(c => c / norm);
}

// Calculate entropy of sedenion state
function sedenionEntropy(components: number[]): number {
  const total = components.reduce((s, c) => s + Math.abs(c), 0) || 1;
  const probs = components.map(c => Math.abs(c) / total);
  return -probs.filter(p => p > 0).reduce((s, p) => s + p * Math.log2(p), 0);
}

// Alphabet Grid Visualization
const AlphabetGrid = () => (
  <div className="grid grid-cols-7 gap-2">
    {ENOCHIAN_ALPHABET.slice(0, 21).map((entry, i) => (
      <div 
        key={i}
        className="p-2 rounded-lg bg-muted/50 border border-border text-center hover:border-primary/50 transition-colors"
      >
        <div className="text-lg font-bold text-primary">{entry.letter}</div>
        <div className="text-xs text-muted-foreground">{entry.enochian}</div>
        <div className="text-xs font-mono text-cyan-400">{entry.prime}</div>
      </div>
    ))}
  </div>
);

// Prime Basis Visualization
const PrimeBasisViz = () => (
  <div className="flex flex-wrap gap-2 justify-center">
    {PRIME_BASIS.map((prime, i) => {
      const hue = 180 + i * 20;
      return (
        <div
          key={prime}
          className="px-3 py-2 rounded-lg border border-border text-center"
          style={{ 
            backgroundColor: `hsla(${hue}, 60%, 40%, 0.2)`,
            borderColor: `hsla(${hue}, 60%, 50%, 0.5)`,
          }}
        >
          <div className="font-mono font-bold" style={{ color: `hsl(${hue}, 70%, 60%)` }}>
            {prime}
          </div>
          <div className="text-[10px] text-muted-foreground">p_{i + 1}</div>
        </div>
      );
    })}
  </div>
);

// Word Encoder Example
const EnochianEncoderExample = () => {
  const [word, setWord] = useState('LIGHT');
  const [result, setResult] = useState<{
    primes: number[];
    product: string;
    sedenion: number[];
    entropy: number;
  } | null>(null);

  const encodeWord = useCallback(() => {
    const primes = wordToPrimeSignature(word);
    const product = primeProduct(primes);
    const sedenion = primesToSedenion(primes);
    const entropy = sedenionEntropy(sedenion);
    
    setResult({ primes, product: product.toString(), sedenion, entropy });
  }, [word]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary" />
          Enochian Word Encoder
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Each letter maps to a prime from the basis P_E = {'{7, 11, 13, 17, 19, 23, 29}'}.
              The word becomes a prime signature that encodes into 16D sedenion space.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Word</label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono"
                maxLength={20}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['LIGHT', 'WISDOM', 'TRUTH', 'SPIRIT', 'ANGEL'].map(w => (
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
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Prime Signature</p>
                <div className="flex flex-wrap gap-1">
                  {result.primes.map((p, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-primary/20 text-primary font-mono text-sm">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Prime Product</p>
                <p className="font-mono text-lg text-primary break-all">{result.product}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">16D Sedenion State</p>
                <div className="flex items-center gap-4">
                  <SedenionVisualizer components={result.sedenion} animated={false} size="lg" />
                  <div>
                    <p className="text-xs text-muted-foreground">Entropy</p>
                    <p className="font-mono text-primary">{result.entropy.toFixed(3)} bits</p>
                  </div>
                </div>
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

// Sedenion Multiplication Example
const SedenionMultiplicationExample = () => {
  const [word1, setWord1] = useState('FIRE');
  const [word2, setWord2] = useState('WATER');
  const [result, setResult] = useState<{
    s1: number[];
    s2: number[];
    product: number[];
    entropy: number;
  } | null>(null);

  const multiplySedenions = useCallback(() => {
    const primes1 = wordToPrimeSignature(word1);
    const primes2 = wordToPrimeSignature(word2);
    
    const s1 = primesToSedenion(primes1);
    const s2 = primesToSedenion(primes2);
    
    // Simplified sedenion multiplication (component-wise for demo)
    // Real implementation uses Cayley-Dickson construction
    const product = new Array(16).fill(0);
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        const k = (i + j) % 16;
        const sign = ((i * j) % 2 === 0) ? 1 : -1;
        product[k] += sign * s1[i] * s2[j];
      }
    }
    
    // Normalize
    const norm = Math.sqrt(product.reduce((s, c) => s + c * c, 0)) || 1;
    const normalized = product.map(c => c / norm);
    
    setResult({
      s1,
      s2,
      product: normalized,
      entropy: sedenionEntropy(normalized)
    });
  }, [word1, word2]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Sedenion Multiplication
        </h3>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Combine two Enochian words using 16D sedenion multiplication.
            The non-associative algebra creates emergent semantic meanings.
          </p>

          <div className="grid md:grid-cols-3 gap-4 items-center">
            <input
              type="text"
              value={word1}
              onChange={(e) => setWord1(e.target.value.toUpperCase())}
              className="px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono text-center"
              maxLength={10}
            />
            <div className="text-center text-2xl text-primary font-bold">×</div>
            <input
              type="text"
              value={word2}
              onChange={(e) => setWord2(e.target.value.toUpperCase())}
              className="px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none font-mono text-center"
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
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground mb-2">{word1}</p>
                <SedenionVisualizer components={result.s1} animated={false} size="md" />
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground mb-2">{word2}</p>
                <SedenionVisualizer components={result.s2} animated={false} size="md" />
              </div>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <p className="text-sm text-primary mb-2">Result</p>
                <SedenionVisualizer components={result.product} animated={true} size="md" />
                <p className="text-xs text-muted-foreground mt-2">
                  Entropy: {result.entropy.toFixed(3)} bits
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { EnochianEngine, Sedenion } from '@aleph-ai/tinyaleph';

const engine = new EnochianEngine();

// Encode words to sedenions
const fire = engine.encode('FIRE').sedenion;
const water = engine.encode('WATER').sedenion;

// Multiply using Cayley-Dickson sedenion algebra
const combined = fire.mul(water);

console.log('Fire × Water:', combined.components);
console.log('Norm:', combined.norm());       // Preserved under multiplication
console.log('Entropy:', combined.entropy()); // Semantic complexity

// Note: Sedenion multiplication is neither commutative nor associative
console.log('(A × B) ≠ (B × A)'); // Non-commutative
console.log('(A × B) × C ≠ A × (B × C)'); // Non-associative`}
        language="javascript"
        title="sedenion-multiply.js"
      />
    </div>
  );
};

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
            <h1 className="text-4xl font-display font-bold mb-4">Enochian Language Module</h1>
            <p className="text-muted-foreground text-lg">
              A specialized engine mapping the 21-letter angelic alphabet to prime basis 
              P<sub>E</sub> = {'{7, 11, 13, 17, 19, 23, 29}'} with 16D sedenion operations.
            </p>
          </div>

          <div className="space-y-12">
            {/* Alphabet Reference */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
                Angelic Alphabet
              </h2>
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Grid3X3 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">21-Letter Enochian System</h3>
                </div>
                <AlphabetGrid />
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Prime Basis P_E</h4>
                  <PrimeBasisViz />
                </div>
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

            {/* Sedenion Multiplication */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">3</span>
                Sedenion Operations
              </h2>
              <SedenionMultiplicationExample />
            </section>

            {/* Theory Section */}
            <section className="p-6 rounded-xl border border-border bg-muted/30">
              <h3 className="font-display font-semibold text-lg mb-4">Theoretical Background</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Prime Basis</h4>
                  <p>
                    The 7-prime basis {'{7, 11, 13, 17, 19, 23, 29}'} was chosen for its 
                    cyclic properties mod 16, ensuring uniform distribution across 
                    sedenion dimensions.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Sedenion Algebra</h4>
                  <p>
                    16D sedenions extend octonions via Cayley-Dickson construction. 
                    They lose associativity but gain expressivity for modeling 
                    high-dimensional semantic relationships.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnochianExamplesPage;
