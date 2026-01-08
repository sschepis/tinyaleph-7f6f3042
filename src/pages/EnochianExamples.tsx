import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Play, Languages, Grid3X3, Wand2, RotateCcw, Zap, Sparkles, Scale, Layers, Circle, Loader2 } from 'lucide-react';
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

// Sedenion multiplication (simplified Cayley-Dickson) - normalized for most uses
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

// Sedenion multiplication WITHOUT normalization - for zero divisor detection
const sedenionMulRaw = (a: number[], b: number[]): number[] => {
  const result = new Array(16).fill(0);
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      const k = (i + j) % 16;
      const sign = ((i & j) & 8) ? -1 : 1;
      result[k] += sign * a[i] * b[j];
    }
  }
  return result;
};

// Sedenion conjugate (negate indices 1-15)
const sedenionConj = (a: number[]): number[] => {
  return a.map((v, i) => i === 0 ? v : -v);
};

// Sedenion inverse (conjugate / norm^2)
const sedenionInverse = (a: number[]): number[] => {
  const normSq = a.reduce((s, v) => s + v * v, 0) || 1;
  const conj = sedenionConj(a);
  return conj.map(v => v / normSq);
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
  const [isSearching, setIsSearching] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [results, setResults] = useState<{ word1: string; word2: string; product: number; isZero: boolean }[]>([]);
  const [foundZero, setFoundZero] = useState<{ word1: string; word2: string; product: number; s1: number[]; s2: number[]; productVec: number[] } | null>(null);
  const [showVisualization, setShowVisualization] = useState(true);
  const searchRef = useRef<number | null>(null);

  const BASIS_LABELS = ['e₀', 'e₁', 'e₂', 'e₃', 'e₄', 'e₅', 'e₆', 'e₇', 'e₈', 'e₉', 'e₁₀', 'e₁₁', 'e₁₂', 'e₁₃', 'e₁₄', 'e₁₅'];

  // Generate a random Enochian word of given length
  const generateWord = useCallback((length: number, seed: number): string => {
    const letters = ENOCHIAN_ALPHABET.map(e => e.letter);
    let word = '';
    let s = seed;
    for (let i = 0; i < length; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      word += letters[s % letters.length];
    }
    return word;
  }, []);

  // Create unnormalized sedenion for zero-divisor detection
  const wordToSedenionRaw = useCallback((word: string): number[] => {
    const c = new Array(16).fill(0);
    word.split('').forEach((letter, i) => {
      const p = letterToPrime(letter);
      const idx = p % 16;
      c[idx] += 1 / (1 + i * 0.1);
    });
    return c; // No normalization!
  }, []);

  const searchOnce = useCallback((seed: number): { word1: string; word2: string; product: number; isZero: boolean; s1: number[]; s2: number[]; productVec: number[] } => {
    const len1 = 3 + (seed % 4);
    const len2 = 3 + ((seed * 7) % 4);
    const word1 = generateWord(len1, seed);
    const word2 = generateWord(len2, seed * 31337);
    
    const s1 = wordToSedenionRaw(word1);
    const s2 = wordToSedenionRaw(word2);
    const productVec = sedenionMulRaw(s1, s2);
    const magnitude = Math.sqrt(productVec.reduce((s, v) => s + v * v, 0));
    
    const norm1 = Math.sqrt(s1.reduce((s, v) => s + v * v, 0));
    const norm2 = Math.sqrt(s2.reduce((s, v) => s + v * v, 0));
    const expectedMag = norm1 * norm2;
    const ratio = magnitude / expectedMag;
    
    return { word1, word2, product: ratio, isZero: ratio < 0.15, s1, s2, productVec };
  }, [generateWord, wordToSedenionRaw]);

  const startSearch = useCallback(() => {
    setIsSearching(true);
    setFoundZero(null);
    setResults([]);
    setAttempts(0);
    
    let currentAttempt = 0;
    const allResults: typeof results = [];
    
    const runBatch = () => {
      const batchSize = 100;
      
      for (let i = 0; i < batchSize; i++) {
        currentAttempt++;
        const result = searchOnce(Date.now() + currentAttempt * 17);
        allResults.push(result);
        
        if (result.isZero) {
          setFoundZero({ 
            word1: result.word1, 
            word2: result.word2, 
            product: result.product,
            s1: result.s1,
            s2: result.s2,
            productVec: result.productVec
          });
          setAttempts(currentAttempt);
          allResults.sort((a, b) => a.product - b.product);
          setResults(allResults.slice(0, 10));
          setIsSearching(false);
          return;
        }
      }
      
      setAttempts(currentAttempt);
      allResults.sort((a, b) => a.product - b.product);
      setResults(allResults.slice(0, 10));
      
      if (currentAttempt < 10000) {
        searchRef.current = requestAnimationFrame(runBatch);
      } else {
        setIsSearching(false);
      }
    };
    
    searchRef.current = requestAnimationFrame(runBatch);
  }, [searchOnce]);

  const stopSearch = useCallback(() => {
    if (searchRef.current) {
      cancelAnimationFrame(searchRef.current);
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    return () => {
      if (searchRef.current) cancelAnimationFrame(searchRef.current);
    };
  }, []);

  // Visualization component for basis vectors
  const BasisVisualization = ({ s1, s2, productVec, word1, word2 }: { s1: number[]; s2: number[]; productVec: number[]; word1: string; word2: string }) => {
    const maxVal = Math.max(...s1.map(Math.abs), ...s2.map(Math.abs), 0.01);
    const maxProduct = Math.max(...productVec.map(Math.abs), 0.01);
    
    // Find which basis indices are active (non-zero) in each vector
    const activeInS1 = s1.map((v, i) => ({ idx: i, val: v })).filter(x => Math.abs(x.val) > 0.01);
    const activeInS2 = s2.map((v, i) => ({ idx: i, val: v })).filter(x => Math.abs(x.val) > 0.01);
    
    // Calculate cancellation contributions
    const contributions: { i: number; j: number; k: number; contribution: number; sign: number }[] = [];
    for (let i = 0; i < 16; i++) {
      if (Math.abs(s1[i]) < 0.001) continue;
      for (let j = 0; j < 16; j++) {
        if (Math.abs(s2[j]) < 0.001) continue;
        const k = (i + j) % 16;
        const sign = ((i & j) & 8) ? -1 : 1;
        const contribution = sign * s1[i] * s2[j];
        contributions.push({ i, j, k, contribution, sign });
      }
    }
    
    // Group contributions by target index k
    const contributionsByK: { [k: number]: typeof contributions } = {};
    contributions.forEach(c => {
      if (!contributionsByK[c.k]) contributionsByK[c.k] = [];
      contributionsByK[c.k].push(c);
    });

    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVisualization(!showVisualization)}
            className="text-xs text-primary hover:underline"
          >
            {showVisualization ? 'Hide' : 'Show'} Basis Analysis
          </button>
        </div>

        {showVisualization && (
          <div className="space-y-6 p-4 rounded-lg bg-background/50 border border-border">
            {/* Word A basis vectors */}
            <div>
              <div className="text-sm font-medium mb-2 text-cyan-400">
                A = "{word1}" basis components
              </div>
              <div className="flex gap-1 items-end h-16">
                {s1.map((val, i) => {
                  const height = Math.abs(val) / maxVal * 100;
                  const isActive = Math.abs(val) > 0.01;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div 
                        className={`w-full rounded-t transition-all ${isActive ? 'bg-cyan-500' : 'bg-muted/30'}`}
                        style={{ height: `${Math.max(height, isActive ? 4 : 1)}%` }}
                        title={`${BASIS_LABELS[i]}: ${val.toFixed(3)}`}
                      />
                      <span className="text-[8px] text-muted-foreground mt-1">{i}</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Active: {activeInS1.map(x => BASIS_LABELS[x.idx]).join(', ')}
              </div>
            </div>

            {/* Word B basis vectors */}
            <div>
              <div className="text-sm font-medium mb-2 text-orange-400">
                B = "{word2}" basis components
              </div>
              <div className="flex gap-1 items-end h-16">
                {s2.map((val, i) => {
                  const height = Math.abs(val) / maxVal * 100;
                  const isActive = Math.abs(val) > 0.01;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div 
                        className={`w-full rounded-t transition-all ${isActive ? 'bg-orange-500' : 'bg-muted/30'}`}
                        style={{ height: `${Math.max(height, isActive ? 4 : 1)}%` }}
                        title={`${BASIS_LABELS[i]}: ${val.toFixed(3)}`}
                      />
                      <span className="text-[8px] text-muted-foreground mt-1">{i}</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Active: {activeInS2.map(x => BASIS_LABELS[x.idx]).join(', ')}
              </div>
            </div>

            {/* Product result */}
            <div>
              <div className="text-sm font-medium mb-2 text-green-400">
                A × B = Product (near zero!)
              </div>
              <div className="flex gap-1 items-end h-16">
                {productVec.map((val, i) => {
                  const height = Math.abs(val) / maxProduct * 100;
                  const isNearZero = Math.abs(val) < 0.05;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div 
                        className={`w-full rounded-t transition-all ${isNearZero ? 'bg-green-500/30' : val > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${BASIS_LABELS[i]}: ${val.toFixed(4)}`}
                      />
                      <span className="text-[8px] text-muted-foreground mt-1">{i}</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ||A×B|| = {Math.sqrt(productVec.reduce((s, v) => s + v * v, 0)).toFixed(6)}
              </div>
            </div>

            {/* Cancellation explanation */}
            <div className="p-3 rounded-lg bg-muted/30 border border-muted">
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4" /> Why They Cancel
              </div>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  In sedenion multiplication, each output component e<sub>k</sub> receives contributions 
                  from pairs (e<sub>i</sub>, e<sub>j</sub>) where i + j ≡ k (mod 16).
                </p>
                <p>
                  Zero divisors occur when positive and negative contributions cancel:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                  {Object.entries(contributionsByK)
                    .filter(([_, contribs]) => contribs.length > 1)
                    .slice(0, 4)
                    .map(([k, contribs]) => {
                      const total = contribs.reduce((s, c) => s + c.contribution, 0);
                      return (
                        <div key={k} className="font-mono text-[10px] p-2 bg-background/50 rounded">
                          <span className="text-primary">{BASIS_LABELS[parseInt(k)]}</span>: {' '}
                          {contribs.map((c, i) => (
                            <span key={i}>
                              {i > 0 && ' + '}
                              <span className={c.sign > 0 ? 'text-green-400' : 'text-red-400'}>
                                ({c.sign > 0 ? '+' : '-'}{Math.abs(c.contribution).toFixed(2)})
                              </span>
                            </span>
                          ))}
                          {' = '}
                          <span className={Math.abs(total) < 0.1 ? 'text-yellow-400' : ''}>
                            {total.toFixed(3)}
                          </span>
                          {Math.abs(total) < 0.1 && ' ≈ 0 ✓'}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Zero Divisor Search</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Sedenions contain zero divisors: non-zero elements that multiply to (near) zero. These represent "semantic cancellation."
        The search loops automatically until it finds one.
      </p>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={isSearching ? stopSearch : startSearch} 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isSearching ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Stop Search
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Start Search
            </>
          )}
        </button>
        {attempts > 0 && (
          <span className="text-sm text-muted-foreground">
            {attempts.toLocaleString()} pairs tested
          </span>
        )}
      </div>

      {foundZero && (
        <>
          <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
            <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
              <Sparkles className="w-4 h-4" /> Zero Divisor Found!
            </div>
            <div className="font-mono text-lg">
              {foundZero.word1} × {foundZero.word2}
            </div>
            <div className="font-mono text-sm text-muted-foreground">
              ||A×B|| / (||A|| × ||B||) = {foundZero.product.toFixed(6)}
            </div>
          </div>
          
          <BasisVisualization 
            s1={foundZero.s1} 
            s2={foundZero.s2} 
            productVec={foundZero.productVec}
            word1={foundZero.word1}
            word2={foundZero.word2}
          />
        </>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <div className="text-xs text-muted-foreground mb-2">Closest pairs (lowest product ratio):</div>
          {results.map((r, i) => (
            <div key={i} className={`p-3 rounded-lg flex justify-between items-center ${r.isZero ? 'bg-green-500/20 border border-green-500/50' : 'bg-muted/50'}`}>
              <span className="font-mono text-sm">{r.word1} × {r.word2}</span>
              <span className={`font-mono text-sm ${r.isZero ? 'text-green-400' : 'text-muted-foreground'}`}>
                ratio = {r.product.toFixed(4)}
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

const SandwichProduct = () => {
  const [rotator, setRotator] = useState('FIRE');
  const [target, setTarget] = useState('WATER');
  const [result, setResult] = useState<{
    a: number[];
    b: number[];
    rotated: number[];
    normB: number;
    normRotated: number;
    angleDiff: number;
  } | null>(null);

  const compute = useCallback(() => {
    const a = primesToSedenion(rotator.toUpperCase().split('').map(letterToPrime));
    const b = primesToSedenion(target.toUpperCase().split('').map(letterToPrime));
    
    // Compute A⁻¹
    const aInv = sedenionInverse(a);
    
    // Sandwich product: A × B × A⁻¹
    const ab = sedenionMul(a, b);
    const rotated = sedenionMul(ab, aInv);
    
    // Norms
    const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    const normRotated = Math.sqrt(rotated.reduce((s, v) => s + v * v, 0));
    
    // Angle between original and rotated (via dot product)
    const dot = b.reduce((s, v, i) => s + v * rotated[i], 0);
    const angleDiff = Math.acos(Math.min(1, Math.max(-1, dot / (normB * normRotated)))) * (180 / Math.PI);
    
    setResult({ a, b, rotated, normB, normRotated, angleDiff });
  }, [rotator, target]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <RotateCcw className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Sandwich Product</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        The formula A × B × A⁻¹ rotates B's semantic direction while preserving its norm.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Rotator (A)</label>
          <input 
            type="text" 
            value={rotator} 
            onChange={(e) => setRotator(e.target.value.toUpperCase())} 
            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
            maxLength={8} 
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Target (B)</label>
          <input 
            type="text" 
            value={target} 
            onChange={(e) => setTarget(e.target.value.toUpperCase())} 
            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
            maxLength={8} 
          />
        </div>
      </div>
      
      <button onClick={compute} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
        <RotateCcw className="w-4 h-4" /> Compute Rotation
      </button>
      
      {result && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Formula: {rotator} × {target} × {rotator}⁻¹</p>
            <div className="flex items-center gap-2 font-mono text-sm flex-wrap">
              <span className="text-primary">{rotator}</span>
              <span>×</span>
              <span className="text-cyan-400">{target}</span>
              <span>×</span>
              <span className="text-primary">{rotator}⁻¹</span>
              <span>=</span>
              <span className="text-green-400">Rotated</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-xs text-muted-foreground mb-2">Original B</p>
              <SedenionVisualizer components={result.b} animated={false} size="md" />
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-xs text-muted-foreground mb-2">Rotated (A×B×A⁻¹)</p>
              <SedenionVisualizer components={result.rotated} animated={false} size="md" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">||B||</p>
              <p className="text-lg font-mono text-primary">{result.normB.toFixed(4)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">||Rotated||</p>
              <p className="text-lg font-mono text-green-400">{result.normRotated.toFixed(4)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Angle Δ</p>
              <p className="text-lg font-mono text-yellow-400">{result.angleDiff.toFixed(1)}°</p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Norm preserved: {Math.abs(result.normB - result.normRotated) < 0.01 ? '✓ Yes' : '≈ Approximately'}
          </p>
        </div>
      )}
    </div>
  );
};

const PhraseBuilder = () => {
  const [words, setWords] = useState<string[]>(['LIGHT', 'OF', 'FIRE']);
  const [newWord, setNewWord] = useState('');
  const [result, setResult] = useState<{
    states: number[][];
    combined: number[];
    entropy: number;
    elements: Record<string, number>;
  } | null>(null);

  const addWord = useCallback(() => {
    if (newWord.trim() && words.length < 8) {
      setWords([...words, newWord.toUpperCase().trim()]);
      setNewWord('');
    }
  }, [newWord, words]);

  const removeWord = (idx: number) => {
    setWords(words.filter((_, i) => i !== idx));
  };

  const build = useCallback(() => {
    if (words.length === 0) return;
    
    const states = words.map(w => 
      primesToSedenion(w.toUpperCase().split('').map(letterToPrime))
    );
    
    // Multiply all word states together
    let combined = states[0];
    for (let i = 1; i < states.length; i++) {
      combined = sedenionMul(combined, states[i]);
    }
    
    // Entropy
    const entropy = sedenionEntropy(combined);
    
    // Element count across all words
    const elements: Record<string, number> = { Air: 0, Earth: 0, Fire: 0, Water: 0, Spirit: 0 };
    words.forEach(w => {
      w.toUpperCase().split('').forEach(l => {
        const el = letterToElement(l);
        elements[el] = (elements[el] || 0) + 1;
      });
    });
    
    setResult({ states, combined, entropy, elements });
  }, [words]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Phrase Builder</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Build multi-word invocations. Each word's state is multiplied with the previous to form a unified semantic phrase.
      </p>
      
      {/* Current phrase */}
      <div className="p-4 rounded-lg bg-muted/50 min-h-[60px] flex flex-wrap gap-2 items-center">
        {words.length === 0 ? (
          <span className="text-muted-foreground text-sm">Add words to build a phrase...</span>
        ) : (
          words.map((w, i) => (
            <div key={i} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/20 border border-primary/30">
              <span className="font-mono text-sm">{w}</span>
              <button onClick={() => removeWord(i)} className="text-muted-foreground hover:text-destructive ml-1">
                <X className="w-3 h-3" />
              </button>
              {i < words.length - 1 && <span className="ml-2 text-muted-foreground">×</span>}
            </div>
          ))
        )}
      </div>
      
      {/* Add word input */}
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newWord} 
          onChange={(e) => setNewWord(e.target.value.toUpperCase())} 
          onKeyDown={(e) => e.key === 'Enter' && addWord()}
          className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border font-mono" 
          maxLength={12}
          placeholder="Enter word..."
        />
        <button onClick={addWord} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:border-primary">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      
      {/* Quick word buttons */}
      <div className="flex flex-wrap gap-1">
        {['LIGHT', 'DARK', 'FIRE', 'WATER', 'SPIRIT', 'OF', 'AND', 'THE'].map(w => (
          <button 
            key={w}
            onClick={() => { if (words.length < 8) setWords([...words, w]); }}
            className="px-2 py-1 rounded text-xs bg-secondary hover:bg-primary/20"
          >
            {w}
          </button>
        ))}
      </div>
      
      <button onClick={build} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="w-4 h-4" /> Build Phrase
      </button>
      
      {result && (
        <div className="space-y-4">
          {/* Individual word states */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Word States:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {result.states.map((s, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs font-mono text-primary mb-1">{words[i]}</p>
                  <SedenionVisualizer components={s} animated={false} size="sm" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Combined result */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-muted-foreground mb-2">Combined Phrase State:</p>
            <SedenionVisualizer components={result.combined} animated={false} size="lg" />
          </div>
          
          {/* Element balance */}
          <div className="grid grid-cols-5 gap-2">
            {['Air', 'Earth', 'Fire', 'Water', 'Spirit'].map(el => (
              <div key={el} className={`p-2 rounded text-center ${ELEMENT_BG[el]}`}>
                <p className={`text-xs ${ELEMENT_COLORS[el]}`}>{el}</p>
                <p className="text-lg font-bold">{result.elements[el] || 0}</p>
              </div>
            ))}
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Phrase Entropy</p>
            <p className="text-xl font-mono text-primary">{result.entropy.toFixed(3)} bits</p>
          </div>
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
  { 
    id: 'sandwich', 
    number: '10', 
    title: 'Sandwich Product', 
    subtitle: 'Sedenion rotations', 
    description: 'Use the sandwich product A × B × A⁻¹ to rotate one semantic state by another. This preserves the norm of B while transforming its direction.', 
    concepts: ['Rotation', 'Conjugation', 'Sandwich Product'], 
    code: `const a = primesToSedenion(encode('FIRE'));
const b = primesToSedenion(encode('WATER'));

// Compute A⁻¹ (inverse)
const aInv = sedenionInverse(a);

// Sandwich product: A × B × A⁻¹
const ab = sedenionMul(a, b);
const rotated = sedenionMul(ab, aInv);

// The result has same norm as B but rotated direction
console.log('Original norm:', norm(b));
console.log('Rotated norm:', norm(rotated));`, 
    codeTitle: 'enochian/10-sandwich.js' 
  },
  { 
    id: 'phrasebuilder', 
    number: '11', 
    title: 'Phrase Builder', 
    subtitle: 'Multi-word composition', 
    description: 'Compose multi-word invocations and see how each word combines via sedenion multiplication to form a unified semantic state.', 
    concepts: ['Composition', 'Multi-Word', 'State Accumulation'], 
    code: `const phrase = ['LIGHT', 'OF', 'FIRE'];

// Start with identity-like state
let state = primesToSedenion(encode(phrase[0]));

// Multiply each subsequent word
for (let i = 1; i < phrase.length; i++) {
  const wordState = primesToSedenion(encode(phrase[i]));
  state = sedenionMul(state, wordState);
}

// Final composed state
console.log('Phrase state:', state);
console.log('Total entropy:', entropy(state));`, 
    codeTitle: 'enochian/11-phrasebuilder.js' 
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
  'sandwich': SandwichProduct,
  'phrasebuilder': PhraseBuilder,
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