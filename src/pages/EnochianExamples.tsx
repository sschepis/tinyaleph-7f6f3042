import { useState, useCallback } from 'react';
import { Play, Languages, Grid3X3 } from 'lucide-react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import SedenionVisualizer from '../components/SedenionVisualizer';

// Full 21-letter Enochian alphabet with prime mappings
const ENOCHIAN_ALPHABET = [
  { letter: 'A', enochian: 'Un', prime: 7, element: 'Air' },
  { letter: 'B', enochian: 'Pa', prime: 11, element: 'Earth' },
  { letter: 'C', enochian: 'Veh', prime: 13, element: 'Fire' },
  { letter: 'D', enochian: 'Gal', prime: 17, element: 'Water' },
  { letter: 'E', enochian: 'Orth', prime: 19, element: 'Air' },
  { letter: 'F', enochian: 'Na', prime: 23, element: 'Earth' },
  { letter: 'G', enochian: 'Ged', prime: 29, element: 'Fire' },
  { letter: 'H', enochian: 'Graph', prime: 31, element: 'Water' },
  { letter: 'I', enochian: 'Gon', prime: 37, element: 'Air' },
  { letter: 'K', enochian: 'Ur', prime: 41, element: 'Earth' },
  { letter: 'L', enochian: 'Tal', prime: 43, element: 'Fire' },
  { letter: 'M', enochian: 'Mals', prime: 47, element: 'Water' },
  { letter: 'N', enochian: 'Drun', prime: 53, element: 'Air' },
  { letter: 'O', enochian: 'Med', prime: 59, element: 'Earth' },
  { letter: 'P', enochian: 'Ger', prime: 61, element: 'Fire' },
  { letter: 'Q', enochian: 'Don', prime: 67, element: 'Water' },
  { letter: 'R', enochian: 'Ceph', prime: 71, element: 'Air' },
  { letter: 'S', enochian: 'Van', prime: 73, element: 'Earth' },
  { letter: 'T', enochian: 'Fam', prime: 79, element: 'Fire' },
  { letter: 'U', enochian: 'Gisg', prime: 83, element: 'Water' },
  { letter: 'X', enochian: 'Pal', prime: 89, element: 'Spirit' },
];

const PRIME_BASIS = [7, 11, 13, 17, 19, 23, 29];
const ELEMENT_COLORS: Record<string, string> = {
  'Air': 'text-yellow-400',
  'Earth': 'text-green-400',
  'Fire': 'text-red-400',
  'Water': 'text-blue-400',
  'Spirit': 'text-purple-400',
};

const letterToPrime = (letter: string) => ENOCHIAN_ALPHABET.find(e => e.letter === letter.toUpperCase())?.prime || 7;

const primesToSedenion = (primes: number[]) => {
  const c = new Array(16).fill(0);
  primes.forEach((p, i) => { 
    const idx = (p % 16);
    c[idx] += 1 / (1 + i * 0.1); 
  });
  const norm = Math.sqrt(c.reduce((s, v) => s + v * v, 0)) || 1;
  return c.map(v => v / norm);
};

const AlphabetGrid = () => {
  const [selected, setSelected] = useState<typeof ENOCHIAN_ALPHABET[0] | null>(null);
  const [filterElement, setFilterElement] = useState<string | null>(null);

  const filteredAlphabet = filterElement 
    ? ENOCHIAN_ALPHABET.filter(e => e.element === filterElement)
    : ENOCHIAN_ALPHABET;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Grid3X3 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Angelic Alphabet (21 Letters)</h3>
      </div>
      
      {/* Element filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={() => setFilterElement(null)}
          className={`px-3 py-1 rounded-md text-xs ${!filterElement ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
        >
          All
        </button>
        {['Air', 'Earth', 'Fire', 'Water', 'Spirit'].map(el => (
          <button 
            key={el}
            onClick={() => setFilterElement(el)}
            className={`px-3 py-1 rounded-md text-xs ${filterElement === el ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
          >
            {el}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {filteredAlphabet.map((e, i) => (
          <button 
            key={i} 
            onClick={() => setSelected(e)} 
            className={`p-3 rounded-lg border text-center transition-colors ${selected?.letter === e.letter ? 'border-primary bg-primary/20' : 'border-border hover:border-primary/50'}`}
          >
            <div className="text-lg font-bold text-primary">{e.letter}</div>
            <div className="text-xs text-muted-foreground">{e.enochian}</div>
            <div className="text-xs font-mono text-cyan-400">p={e.prime}</div>
            <div className={`text-[10px] ${ELEMENT_COLORS[e.element]}`}>{e.element}</div>
          </button>
        ))}
      </div>
      
      {selected && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Letter</p>
              <p className="text-2xl font-bold text-primary">{selected.letter}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enochian Name</p>
              <p className="text-xl font-semibold">{selected.enochian}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prime</p>
              <p className="font-mono text-primary">{selected.prime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Element</p>
              <p className={ELEMENT_COLORS[selected.element]}>{selected.element}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EncoderExample = () => {
  const [word, setWord] = useState('LIGHT');
  const [sedenion, setSedenion] = useState<number[]>(Array(16).fill(0));
  const [primeBreakdown, setPrimeBreakdown] = useState<{letter: string; prime: number}[]>([]);

  const encode = useCallback(() => {
    const letters = word.toUpperCase().split('').filter(l => ENOCHIAN_ALPHABET.some(e => e.letter === l));
    const breakdown = letters.map(l => ({ letter: l, prime: letterToPrime(l) }));
    const primes = breakdown.map(b => b.prime);
    setPrimeBreakdown(breakdown);
    setSedenion(primesToSedenion(primes));
  }, [word]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Languages className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Word Encoder</h3>
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={word} 
          onChange={(e) => setWord(e.target.value.toUpperCase())} 
          className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
          maxLength={12} 
          placeholder="Enter word..."
        />
        <button onClick={encode} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
          <Play className="w-4 h-4" /> Encode
        </button>
      </div>
      
      {primeBreakdown.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-2">Prime Breakdown:</p>
          <div className="flex flex-wrap gap-2">
            {primeBreakdown.map((b, i) => (
              <span key={i} className="px-2 py-1 rounded bg-primary/20 text-sm font-mono">
                {b.letter} → {b.prime}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <SedenionVisualizer components={sedenion} animated={false} size="lg" />
    </div>
  );
};

const ResonanceExample = () => {
  const [word1, setWord1] = useState('LIGHT');
  const [word2, setWord2] = useState('DARK');
  const [resonance, setResonance] = useState<number | null>(null);

  const compare = useCallback(() => {
    const primes1 = word1.toUpperCase().split('').map(letterToPrime);
    const primes2 = word2.toUpperCase().split('').map(letterToPrime);
    const s1 = primesToSedenion(primes1);
    const s2 = primesToSedenion(primes2);
    // Compute dot product (coherence)
    const dot = s1.reduce((sum, v, i) => sum + v * s2[i], 0);
    setResonance(dot);
  }, [word1, word2]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Languages className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Word Resonance</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input 
          type="text" 
          value={word1} 
          onChange={(e) => setWord1(e.target.value.toUpperCase())} 
          className="px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
          maxLength={12} 
        />
        <input 
          type="text" 
          value={word2} 
          onChange={(e) => setWord2(e.target.value.toUpperCase())} 
          className="px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
          maxLength={12} 
        />
      </div>
      <button onClick={compare} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
        <Play className="w-4 h-4" /> Compare
      </button>
      {resonance !== null && (
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Resonance (Coherence)</p>
          <p className="text-3xl font-mono font-bold text-primary">{(resonance * 100).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {resonance > 0.7 ? 'High resonance' : resonance > 0.3 ? 'Moderate resonance' : 'Low resonance'}
          </p>
        </div>
      )}
    </div>
  );
};

const examples: ExampleConfig[] = [
  { 
    id: 'alphabet', 
    number: '1', 
    title: 'Alphabet Grid', 
    subtitle: '21 angelic letters', 
    description: 'The complete 21-letter Enochian alphabet mapped to prime numbers. Each letter is associated with one of the classical elements (Air, Earth, Fire, Water) plus Spirit.', 
    concepts: ['Enochian', 'Prime Encoding', 'Elements', 'Symbolic Algebra'], 
    code: `// The 21 Enochian letters mapped to primes
const ALPHABET = [
  { letter: 'A', enochian: 'Un', prime: 7, element: 'Air' },
  { letter: 'B', enochian: 'Pa', prime: 11, element: 'Earth' },
  // ... 21 letters total
  { letter: 'X', enochian: 'Pal', prime: 89, element: 'Spirit' },
];

const letterToPrime = (l) => ALPHABET.find(e => e.letter === l)?.prime;`, 
    codeTitle: 'enochian/01-alphabet.js' 
  },
  { 
    id: 'encoder', 
    number: '2', 
    title: 'Word Encoder', 
    subtitle: 'Sedenion mapping', 
    description: 'Encode Enochian words into 16D sedenion space using prime factorization. See the prime breakdown and resulting state vector.', 
    concepts: ['Sedenions', 'Semantic Encoding', 'Word Vectors'], 
    code: `const word = 'LIGHT';
const primes = word.split('').map(letterToPrime);
// primes = [43, 37, 29, 31, 79]

const sedenion = primesToSedenion(primes);
console.log('State:', sedenion);`, 
    codeTitle: 'enochian/02-encoder.js' 
  },
  { 
    id: 'resonance', 
    number: '3', 
    title: 'Word Resonance', 
    subtitle: 'Semantic comparison', 
    description: 'Compare two Enochian words by computing the coherence (dot product) of their sedenion encodings.', 
    concepts: ['Coherence', 'Semantic Similarity', 'State Comparison'], 
    code: `const s1 = primesToSedenion(encode('LIGHT'));
const s2 = primesToSedenion(encode('DARK'));

// Coherence = dot product of normalized states
const coherence = s1.reduce((sum, v, i) => sum + v * s2[i], 0);
console.log('Resonance:', coherence);`, 
    codeTitle: 'enochian/03-resonance.js' 
  },
];

const exampleComponents: Record<string, React.FC> = { 
  'alphabet': AlphabetGrid, 
  'encoder': EncoderExample,
  'resonance': ResonanceExample,
};

export default function EnochianExamplesPage() {
  return (
    <ExamplePageWrapper 
      category="Enochian" 
      title="Enochian Module" 
      description="The complete 21-letter angelic alphabet with prime-based sedenion encoding and elemental associations." 
      examples={examples} 
      exampleComponents={exampleComponents} 
      previousSection={{ title: 'Type System', path: '/type-system' }} 
      nextSection={{ title: 'Quantum', path: '/quantum' }} 
    />
  );
}