import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Play, Languages, Grid3X3, Wand2, RotateCcw, Zap, Sparkles, Scale, Layers, Circle } from 'lucide-react';
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

const ELEMENT_COLORS: Record<string, string> = {
  'Air': 'text-yellow-400',
  'Earth': 'text-green-400',
  'Fire': 'text-red-400',
  'Water': 'text-blue-400',
  'Spirit': 'text-purple-400',
};

const ELEMENT_HEX: Record<string, string> = {
  'Air': '#facc15',
  'Earth': '#4ade80',
  'Fire': '#f87171',
  'Water': '#60a5fa',
  'Spirit': '#c084fc',
};

const ELEMENT_BG: Record<string, string> = {
  'Air': 'bg-yellow-400/20',
  'Earth': 'bg-green-400/20',
  'Fire': 'bg-red-400/20',
  'Water': 'bg-blue-400/20',
  'Spirit': 'bg-purple-400/20',
};

const letterToPrime = (letter: string) => ENOCHIAN_ALPHABET.find(e => e.letter === letter.toUpperCase())?.prime || 7;
const letterToElement = (letter: string) => ENOCHIAN_ALPHABET.find(e => e.letter === letter.toUpperCase())?.element || 'Spirit';

const primesToSedenion = (primes: number[]) => {
  const c = new Array(16).fill(0);
  primes.forEach((p, i) => { 
    const idx = (p % 16);
    c[idx] += 1 / (1 + i * 0.1); 
  });
  const norm = Math.sqrt(c.reduce((s, v) => s + v * v, 0)) || 1;
  return c.map(v => v / norm);
};

// Sedenion multiplication (simplified Cayley-Dickson)
const sedenionMul = (a: number[], b: number[]): number[] => {
  const result = new Array(16).fill(0);
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      const k = (i + j) % 16;
      const sign = ((i & j) & 8) ? -1 : 1;
      result[k] += sign * a[i] * b[j];
    }
  }
  const norm = Math.sqrt(result.reduce((s, v) => s + v * v, 0)) || 1;
  return result.map(v => v / norm);
};

// Compute entropy of sedenion state
const sedenionEntropy = (s: number[]): number => {
  const probs = s.map(v => v * v);
  const sum = probs.reduce((a, b) => a + b, 0) || 1;
  return -probs.reduce((h, p) => {
    const normalized = p / sum;
    return normalized > 0 ? h + normalized * Math.log2(normalized) : h;
  }, 0);
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

const SedenionMultiplication = () => {
  const [word1, setWord1] = useState('FIRE');
  const [word2, setWord2] = useState('WATER');
  const [result, setResult] = useState<{ s1: number[]; s2: number[]; product: number[]; nonCommutativity: number } | null>(null);

  const multiply = useCallback(() => {
    const s1 = primesToSedenion(word1.toUpperCase().split('').map(letterToPrime));
    const s2 = primesToSedenion(word2.toUpperCase().split('').map(letterToPrime));
    const ab = sedenionMul(s1, s2);
    const ba = sedenionMul(s2, s1);
    // Non-commutativity = ||AB - BA||
    const diff = ab.map((v, i) => v - ba[i]);
    const nonComm = Math.sqrt(diff.reduce((s, v) => s + v * v, 0));
    setResult({ s1, s2, product: ab, nonCommutativity: nonComm });
  }, [word1, word2]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Sedenion Multiplication</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Sedenions are non-commutative: A×B ≠ B×A. See the interference between word states.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <input 
          type="text" 
          value={word1} 
          onChange={(e) => setWord1(e.target.value.toUpperCase())} 
          className="px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
          maxLength={8} 
        />
        <input 
          type="text" 
          value={word2} 
          onChange={(e) => setWord2(e.target.value.toUpperCase())} 
          className="px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
          maxLength={8} 
        />
      </div>
      <button onClick={multiply} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
        <Zap className="w-4 h-4" /> Multiply
      </button>
      
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-muted/50">
              <p className="text-xs text-muted-foreground">Word A</p>
              <p className="font-mono text-primary">{word1}</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <p className="text-xs text-muted-foreground">×</p>
              <p className="text-2xl">⊗</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <p className="text-xs text-muted-foreground">Word B</p>
              <p className="font-mono text-primary">{word2}</p>
            </div>
          </div>
          <SedenionVisualizer components={result.product} animated={false} size="lg" />
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <p className="text-sm text-muted-foreground">Non-Commutativity ||A×B - B×A||</p>
            <p className="text-2xl font-mono font-bold text-primary">{result.nonCommutativity.toFixed(4)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {result.nonCommutativity > 0.5 ? 'High interference' : result.nonCommutativity > 0.2 ? 'Moderate interference' : 'Low interference'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const InvocationBuilder = () => {
  const [letters, setLetters] = useState<string[]>(['L', 'I', 'G', 'H', 'T']);
  const [sedenion, setSedenion] = useState<number[]>(Array(16).fill(0));
  const [elementBalance, setElementBalance] = useState<Record<string, number>>({});

  const build = useCallback(() => {
    const primes = letters.map(letterToPrime);
    setSedenion(primesToSedenion(primes));
    const balance: Record<string, number> = { Air: 0, Earth: 0, Fire: 0, Water: 0, Spirit: 0 };
    letters.forEach(l => {
      const el = letterToElement(l);
      balance[el] = (balance[el] || 0) + 1;
    });
    setElementBalance(balance);
  }, [letters]);

  const addLetter = (l: string) => {
    if (letters.length < 12) {
      setLetters([...letters, l]);
    }
  };

  const removeLetter = (idx: number) => {
    setLetters(letters.filter((_, i) => i !== idx));
  };

  const clear = () => setLetters([]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Invocation Builder</h3>
      </div>
      
      <div className="p-4 rounded-lg bg-muted/50 min-h-[60px] flex flex-wrap gap-2 items-center">
        {letters.length === 0 ? (
          <span className="text-muted-foreground text-sm">Click letters below to build invocation...</span>
        ) : (
          letters.map((l, i) => (
            <button 
              key={i} 
              onClick={() => removeLetter(i)} 
              className={`px-3 py-1 rounded ${ELEMENT_BG[letterToElement(l)]} border border-border hover:border-destructive transition-colors`}
            >
              <span className="font-mono font-bold">{l}</span>
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {ENOCHIAN_ALPHABET.map((e, i) => (
          <button 
            key={i} 
            onClick={() => addLetter(e.letter)} 
            className="p-2 rounded border border-border hover:border-primary/50 text-center transition-colors"
          >
            <span className="text-sm font-bold text-primary">{e.letter}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={build} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="w-4 h-4" /> Build
        </button>
        <button onClick={clear} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
          <RotateCcw className="w-4 h-4" /> Clear
        </button>
      </div>

      {Object.keys(elementBalance).length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {['Air', 'Earth', 'Fire', 'Water', 'Spirit'].map(el => (
            <div key={el} className={`p-2 rounded text-center ${ELEMENT_BG[el]}`}>
              <p className={`text-xs ${ELEMENT_COLORS[el]}`}>{el}</p>
              <p className="text-lg font-bold">{elementBalance[el] || 0}</p>
            </div>
          ))}
        </div>
      )}

      <SedenionVisualizer components={sedenion} animated={false} size="lg" />
    </div>
  );
};

const ElementalBalance = () => {
  const [word, setWord] = useState('BALANCE');
  const [analysis, setAnalysis] = useState<{ 
    elements: Record<string, number>; 
    dominant: string; 
    entropy: number;
    sedenion: number[];
  } | null>(null);

  const analyze = useCallback(() => {
    const letters = word.toUpperCase().split('').filter(l => ENOCHIAN_ALPHABET.some(e => e.letter === l));
    const elements: Record<string, number> = { Air: 0, Earth: 0, Fire: 0, Water: 0, Spirit: 0 };
    letters.forEach(l => {
      const el = letterToElement(l);
      elements[el] = (elements[el] || 0) + 1;
    });
    const dominant = Object.entries(elements).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    const primes = letters.map(letterToPrime);
    const sed = primesToSedenion(primes);
    const entropy = sedenionEntropy(sed);
    setAnalysis({ elements, dominant, entropy, sedenion: sed });
  }, [word]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Elemental Balance</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Analyze the elemental composition and entropy of any Enochian word.
      </p>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={word} 
          onChange={(e) => setWord(e.target.value.toUpperCase())} 
          className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
          maxLength={12} 
        />
        <button onClick={analyze} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
          <Scale className="w-4 h-4" /> Analyze
        </button>
      </div>

      {analysis && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {['Air', 'Earth', 'Fire', 'Water', 'Spirit'].map(el => (
              <div key={el} className={`p-3 rounded text-center ${analysis.dominant === el ? 'ring-2 ring-primary' : ''} ${ELEMENT_BG[el]}`}>
                <p className={`text-xs ${ELEMENT_COLORS[el]}`}>{el}</p>
                <p className="text-xl font-bold">{analysis.elements[el] || 0}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">Dominant Element</p>
              <p className={`text-2xl font-bold ${ELEMENT_COLORS[analysis.dominant]}`}>{analysis.dominant}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">State Entropy</p>
              <p className="text-2xl font-mono font-bold text-primary">{analysis.entropy.toFixed(2)} bits</p>
            </div>
          </div>
          
          <SedenionVisualizer components={analysis.sedenion} animated={false} size="md" />
        </div>
      )}
    </div>
  );
};

const WordTransformation = () => {
  const [word, setWord] = useState('CHAOS');
  const [steps, setSteps] = useState<{ word: string; sedenion: number[]; operation: string }[]>([]);

  const transform = useCallback(() => {
    const letters = word.toUpperCase().split('').filter(l => ENOCHIAN_ALPHABET.some(e => e.letter === l));
    const newSteps: typeof steps = [];
    
    // Original
    const original = primesToSedenion(letters.map(letterToPrime));
    newSteps.push({ word: letters.join(''), sedenion: original, operation: 'Original' });
    
    // Reverse
    const reversed = [...letters].reverse();
    const reversedSed = primesToSedenion(reversed.map(letterToPrime));
    newSteps.push({ word: reversed.join(''), sedenion: reversedSed, operation: 'Reversed' });
    
    // Rotation (shift letters)
    const rotated = [...letters.slice(1), letters[0]];
    const rotatedSed = primesToSedenion(rotated.map(letterToPrime));
    newSteps.push({ word: rotated.join(''), sedenion: rotatedSed, operation: 'Rotated' });
    
    // Combined (original × reversed)
    const combined = sedenionMul(original, reversedSed);
    newSteps.push({ word: `(${letters.join('')} × ${reversed.join('')})`, sedenion: combined, operation: 'Combined' });
    
    setSteps(newSteps);
  }, [word]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Word Transformations</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        See how transformations (reverse, rotate, combine) affect the sedenion state.
      </p>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={word} 
          onChange={(e) => setWord(e.target.value.toUpperCase())} 
          className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
          maxLength={8} 
        />
        <button onClick={transform} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
          <Layers className="w-4 h-4" /> Transform
        </button>
      </div>

      {steps.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">{step.operation}</span>
                <span className="font-mono text-sm">{step.word}</span>
              </div>
              <SedenionVisualizer components={step.sedenion} animated={false} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ZeroDivisorSearch = () => {
  const [seed, setSeed] = useState(1);
  const [results, setResults] = useState<{ word1: string; word2: string; product: number; isZero: boolean }[]>([]);

  const search = useCallback(() => {
    const words = ['FIRE', 'WATER', 'AIR', 'EARTH', 'LIGHT', 'DARK', 'CHAOS', 'ORDER'];
    const newResults: typeof results = [];
    
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const s1 = primesToSedenion(words[i].split('').map(letterToPrime));
        const s2 = primesToSedenion(words[j].split('').map(letterToPrime));
        const product = sedenionMul(s1, s2);
        const magnitude = Math.sqrt(product.reduce((s, v) => s + v * v, 0));
        const isZero = magnitude < 0.1;
        newResults.push({ word1: words[i], word2: words[j], product: magnitude, isZero });
      }
    }
    
    newResults.sort((a, b) => a.product - b.product);
    setResults(newResults);
    setSeed(s => s + 1);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Zero Divisor Search</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Sedenions contain zero divisors: non-zero elements that multiply to (near) zero. These represent "semantic cancellation."
      </p>
      <button onClick={search} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
        <Zap className="w-4 h-4" /> Search (Seed #{seed})
      </button>

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.slice(0, 10).map((r, i) => (
            <div key={i} className={`p-3 rounded-lg flex justify-between items-center ${r.isZero ? 'bg-destructive/20 border border-destructive/50' : 'bg-muted/50'}`}>
              <span className="font-mono text-sm">{r.word1} × {r.word2}</span>
              <span className={`font-mono ${r.isZero ? 'text-destructive' : 'text-muted-foreground'}`}>
                ||A×B|| = {r.product.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GlyphMandala = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedLetter, setSelectedLetter] = useState<typeof ENOCHIAN_ALPHABET[0] | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [animating, setAnimating] = useState(true);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef(0);

  const elementGroups = useMemo(() => ({
    Spirit: ENOCHIAN_ALPHABET.filter(l => l.element === 'Spirit'),
    Fire: ENOCHIAN_ALPHABET.filter(l => l.element === 'Fire'),
    Air: ENOCHIAN_ALPHABET.filter(l => l.element === 'Air'),
    Water: ENOCHIAN_ALPHABET.filter(l => l.element === 'Water'),
    Earth: ENOCHIAN_ALPHABET.filter(l => l.element === 'Earth'),
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;

    const drawMandala = (rotation: number) => {
      ctx.clearRect(0, 0, size, size);
      
      // Background glow
      const bgGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
      bgGradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
      bgGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
      bgGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, size, size);

      // Draw concentric rings
      const rings = [40, 90, 130, 170];
      rings.forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 - i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Position letters
      const letterPositions: { letter: typeof ENOCHIAN_ALPHABET[0]; x: number; y: number }[] = [];
      
      // Spirit in center
      elementGroups.Spirit.forEach((l) => {
        letterPositions.push({ letter: l, x: cx, y: cy });
      });

      // Fire ring (radius 50)
      elementGroups.Fire.forEach((l, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2 + rotation;
        letterPositions.push({ letter: l, x: cx + Math.cos(angle) * 50, y: cy + Math.sin(angle) * 50 });
      });

      // Air ring (radius 90)
      elementGroups.Air.forEach((l, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2 - rotation * 0.7;
        letterPositions.push({ letter: l, x: cx + Math.cos(angle) * 90, y: cy + Math.sin(angle) * 90 });
      });

      // Water ring (radius 130)
      elementGroups.Water.forEach((l, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2 + rotation * 0.5;
        letterPositions.push({ letter: l, x: cx + Math.cos(angle) * 130, y: cy + Math.sin(angle) * 130 });
      });

      // Earth ring (radius 170)
      elementGroups.Earth.forEach((l, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2 - rotation * 0.3;
        letterPositions.push({ letter: l, x: cx + Math.cos(angle) * 170, y: cy + Math.sin(angle) * 170 });
      });

      // Draw connections between same-element letters
      if (showConnections) {
        Object.values(elementGroups).forEach(group => {
          if (group.length > 1) {
            const positions = letterPositions.filter(p => group.includes(p.letter));
            ctx.beginPath();
            ctx.strokeStyle = ELEMENT_HEX[group[0].element] + '40';
            ctx.lineWidth = 1;
            positions.forEach((p, i) => {
              positions.slice(i + 1).forEach(p2 => {
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
              });
            });
            ctx.stroke();
          }
        });
      }

      // Draw prime-based connections (letters whose primes differ by 2 - twin primes)
      if (showConnections) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        letterPositions.forEach((p1, i) => {
          letterPositions.slice(i + 1).forEach(p2 => {
            if (Math.abs(p1.letter.prime - p2.letter.prime) === 2) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });
        });
      }

      // Draw letters
      letterPositions.forEach(({ letter, x, y }) => {
        const isSelected = selectedLetter?.letter === letter.letter;
        const primeScale = 0.3 + (letter.prime / 89) * 0.7;
        const radius = 12 * primeScale + (isSelected ? 4 : 0);
        
        // Glow effect
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        glow.addColorStop(0, ELEMENT_HEX[letter.element] + (isSelected ? '80' : '40'));
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Letter circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? ELEMENT_HEX[letter.element] : ELEMENT_HEX[letter.element] + '60';
        ctx.fill();
        ctx.strokeStyle = ELEMENT_HEX[letter.element];
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Letter text
        ctx.fillStyle = isSelected ? '#000' : '#fff';
        ctx.font = `${isSelected ? 'bold ' : ''}${10 + primeScale * 4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter.letter, x, y);
      });
    };

    const animate = () => {
      if (animating) {
        rotationRef.current += 0.003;
      }
      drawMandala(rotationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [elementGroups, selectedLetter, showConnections, animating]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Circle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Glyph Mandala</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Sacred geometry: 21 letters arranged by element (Spirit→Fire→Air→Water→Earth). Size reflects prime magnitude.
      </p>
      
      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={() => setShowConnections(!showConnections)} 
          className={`px-3 py-1 rounded-md text-xs ${showConnections ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
        >
          {showConnections ? 'Hide' : 'Show'} Connections
        </button>
        <button 
          onClick={() => setAnimating(!animating)} 
          className={`px-3 py-1 rounded-md text-xs ${animating ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
        >
          {animating ? 'Pause' : 'Animate'}
        </button>
      </div>

      <div className="flex justify-center">
        <canvas 
          ref={canvasRef} 
          className="rounded-xl border border-border bg-background/50"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      <div className="flex flex-wrap gap-1 justify-center">
        {ENOCHIAN_ALPHABET.map((l, i) => (
          <button 
            key={i}
            onClick={() => setSelectedLetter(selectedLetter?.letter === l.letter ? null : l)}
            className={`w-8 h-8 rounded text-xs font-mono transition-colors ${
              selectedLetter?.letter === l.letter 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {l.letter}
          </button>
        ))}
      </div>

      {selectedLetter && (
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <span className="font-mono text-primary text-lg">{selectedLetter.letter}</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-sm">{selectedLetter.enochian}</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className={`text-sm ${ELEMENT_COLORS[selectedLetter.element]}`}>{selectedLetter.element}</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="font-mono text-xs">p={selectedLetter.prime}</span>
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
  { 
    id: 'multiplication', 
    number: '4', 
    title: 'Sedenion Multiplication', 
    subtitle: 'Non-commutative algebra', 
    description: 'Sedenions are non-commutative: A×B ≠ B×A. Multiply two word states and measure the interference between them.', 
    concepts: ['Sedenion Algebra', 'Non-Commutativity', 'Cayley-Dickson'], 
    code: `const s1 = primesToSedenion(encode('FIRE'));
const s2 = primesToSedenion(encode('WATER'));

const ab = sedenionMul(s1, s2);
const ba = sedenionMul(s2, s1);

// Measure non-commutativity
const diff = ab.map((v, i) => v - ba[i]);
const nonComm = Math.sqrt(diff.reduce((s, v) => s + v * v, 0));
console.log('||AB - BA||:', nonComm);`, 
    codeTitle: 'enochian/04-multiplication.js' 
  },
  { 
    id: 'invocation', 
    number: '5', 
    title: 'Invocation Builder', 
    subtitle: 'Compose semantic states', 
    description: 'Build invocations by selecting letters and see the resulting elemental balance and sedenion state.', 
    concepts: ['Composition', 'Elemental Balance', 'State Building'], 
    code: `const invocation = ['L', 'I', 'G', 'H', 'T'];
const primes = invocation.map(letterToPrime);
const state = primesToSedenion(primes);

// Count elemental balance
const elements = { Air: 0, Earth: 0, Fire: 0, Water: 0 };
invocation.forEach(l => {
  elements[letterToElement(l)]++;
});
console.log('Balance:', elements);`, 
    codeTitle: 'enochian/05-invocation.js' 
  },
  { 
    id: 'balance', 
    number: '6', 
    title: 'Elemental Balance', 
    subtitle: 'Composition analysis', 
    description: 'Analyze the elemental composition, dominant element, and entropy of any Enochian word.', 
    concepts: ['Element Analysis', 'Entropy', 'State Properties'], 
    code: `const word = 'BALANCE';
const letters = word.split('');

// Count elements
const elements = letters.reduce((acc, l) => {
  acc[letterToElement(l)]++;
  return acc;
}, { Air: 0, Earth: 0, Fire: 0, Water: 0, Spirit: 0 });

// Calculate entropy
const state = primesToSedenion(letters.map(letterToPrime));
const entropy = sedenionEntropy(state);
console.log('Entropy:', entropy, 'bits');`, 
    codeTitle: 'enochian/06-balance.js' 
  },
  { 
    id: 'transformations', 
    number: '7', 
    title: 'Word Transformations', 
    subtitle: 'State evolution', 
    description: 'See how transformations (reverse, rotate, combine) affect the sedenion state of a word.', 
    concepts: ['Transformations', 'State Evolution', 'Symmetry'], 
    code: `const word = 'CHAOS';
const letters = word.split('');

// Original state
const original = primesToSedenion(letters.map(letterToPrime));

// Reversed state
const reversed = [...letters].reverse();
const reversedState = primesToSedenion(reversed.map(letterToPrime));

// Combined: original × reversed
const combined = sedenionMul(original, reversedState);
console.log('Combined state:', combined);`, 
    codeTitle: 'enochian/07-transformations.js' 
  },
  { 
    id: 'zerodivisors', 
    number: '8', 
    title: 'Zero Divisor Search', 
    subtitle: 'Semantic cancellation', 
    description: 'Sedenions contain zero divisors: non-zero elements that multiply to zero. Find word pairs that semantically cancel.', 
    concepts: ['Zero Divisors', 'Cancellation', 'Sedenion Properties'], 
    code: `const words = ['FIRE', 'WATER', 'AIR', 'EARTH'];

// Search for zero divisors
for (let i = 0; i < words.length; i++) {
  for (let j = i + 1; j < words.length; j++) {
    const s1 = encode(words[i]);
    const s2 = encode(words[j]);
    const product = sedenionMul(s1, s2);
    const magnitude = norm(product);
    if (magnitude < 0.1) {
      console.log('Zero divisor:', words[i], '×', words[j]);
    }
  }
}`, 
    codeTitle: 'enochian/08-zerodivisors.js' 
  },
  { 
    id: 'mandala', 
    number: '9', 
    title: 'Glyph Mandala', 
    subtitle: 'Geometric visualization', 
    description: 'A sacred geometric representation of the 21 Enochian letters arranged by elemental affinity with prime-based sizing.', 
    concepts: ['Sacred Geometry', 'Visualization', 'Elemental Patterns'], 
    code: `// Arrange letters in concentric rings by element
const rings = {
  center: letters.filter(l => l.element === 'Spirit'),
  ring1: letters.filter(l => l.element === 'Fire'),
  ring2: letters.filter(l => l.element === 'Air'),
  ring3: letters.filter(l => l.element === 'Water'),
  ring4: letters.filter(l => l.element === 'Earth'),
};

// Size each glyph based on its prime magnitude
const primeScale = letter.prime / 89;  // 89 is max
const radius = baseRadius * (0.3 + primeScale * 0.7);

// Draw connections between same-element letters
// and between twin primes (primes differing by 2)`, 
    codeTitle: 'enochian/09-mandala.js' 
  },
];

const exampleComponents: Record<string, React.FC> = { 
  'alphabet': AlphabetGrid, 
  'encoder': EncoderExample,
  'resonance': ResonanceExample,
  'multiplication': SedenionMultiplication,
  'invocation': InvocationBuilder,
  'balance': ElementalBalance,
  'transformations': WordTransformation,
  'zerodivisors': ZeroDivisorSearch,
  'mandala': GlyphMandala,
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