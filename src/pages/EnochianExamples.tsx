import { useState, useCallback } from 'react';
import { Play, Languages, Grid3X3 } from 'lucide-react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import SedenionVisualizer from '../components/SedenionVisualizer';

const ENOCHIAN_ALPHABET = [
  { letter: 'A', enochian: 'Un', prime: 7 }, { letter: 'B', enochian: 'Pa', prime: 11 }, { letter: 'C', enochian: 'Veh', prime: 13 },
  { letter: 'D', enochian: 'Gal', prime: 17 }, { letter: 'E', enochian: 'Orth', prime: 19 }, { letter: 'F', enochian: 'Na', prime: 23 },
  { letter: 'G', enochian: 'Ged', prime: 29 },
];
const PRIME_BASIS = [7, 11, 13, 17, 19, 23, 29];

const letterToPrime = (letter: string) => ENOCHIAN_ALPHABET.find(e => e.letter === letter.toUpperCase())?.prime || 7;
const primesToSedenion = (primes: number[]) => {
  const c = new Array(16).fill(0);
  primes.forEach((p, i) => { const idx = PRIME_BASIS.indexOf(p) % 16; c[idx] += 1 / (1 + i * 0.1); });
  const norm = Math.sqrt(c.reduce((s, v) => s + v * v, 0)) || 1;
  return c.map(v => v / norm);
};

const AlphabetGrid = () => {
  const [selected, setSelected] = useState<typeof ENOCHIAN_ALPHABET[0] | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4"><Grid3X3 className="w-5 h-5 text-primary" /><h3 className="font-semibold">Angelic Alphabet</h3></div>
      <div className="grid grid-cols-7 gap-2">
        {ENOCHIAN_ALPHABET.map((e, i) => (<button key={i} onClick={() => setSelected(e)} className={`p-3 rounded-lg border text-center ${selected?.letter === e.letter ? 'border-primary bg-primary/20' : 'border-border'}`}><div className="text-lg font-bold text-primary">{e.letter}</div><div className="text-xs text-muted-foreground">{e.enochian}</div><div className="text-xs font-mono text-cyan-400">p={e.prime}</div></button>))}
      </div>
      {selected && (<div className="p-4 rounded-lg bg-primary/10"><p><strong>{selected.letter}</strong> ({selected.enochian}) → prime {selected.prime}</p></div>)}
    </div>
  );
};

const EncoderExample = () => {
  const [word, setWord] = useState('LIGHT');
  const [sedenion, setSedenion] = useState<number[]>(Array(16).fill(0));

  const encode = useCallback(() => {
    const primes = word.toUpperCase().split('').map(letterToPrime);
    setSedenion(primesToSedenion(primes));
  }, [word]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4"><Languages className="w-5 h-5 text-primary" /><h3 className="font-semibold">Word Encoder</h3></div>
      <div className="flex gap-2">
        <input type="text" value={word} onChange={(e) => setWord(e.target.value.toUpperCase())} className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border font-mono" maxLength={12} />
        <button onClick={encode} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"><Play className="w-4 h-4" /> Encode</button>
      </div>
      <SedenionVisualizer components={sedenion} animated={false} size="lg" />
    </div>
  );
};

const examples: ExampleConfig[] = [
  { id: 'alphabet', number: '1', title: 'Alphabet Grid', subtitle: '21 angelic letters', description: 'The 21-letter Enochian alphabet mapped to the prime basis P_E = {7, 11, 13, 17, 19, 23, 29}.', concepts: ['Enochian', 'Prime Encoding', 'Symbolic Algebra'], code: `const PRIME_BASIS = [7, 11, 13, 17, 19, 23, 29];\nconst letterToPrime = { A: 7, B: 11, C: 13, D: 17, E: 19, F: 23, G: 29 };`, codeTitle: 'enochian/01-alphabet.js' },
  { id: 'encoder', number: '2', title: 'Word Encoder', subtitle: 'Sedenion mapping', description: 'Encode words into 16D sedenion space using prime factorization.', concepts: ['Sedenions', 'Semantic Encoding', 'Word Vectors'], code: `const word = 'LIGHT';\nconst primes = word.split('').map(letterToPrime);\nconst sedenion = primesToSedenion(primes);\nconsole.log('State:', sedenion);`, codeTitle: 'enochian/02-encoder.js' },
];

const exampleComponents: Record<string, React.FC> = { 'alphabet': AlphabetGrid, 'encoder': EncoderExample };

export default function EnochianExamplesPage() {
  return <ExamplePageWrapper category="Enochian" title="Enochian Module" description="Angelic alphabet with prime-based sedenion encoding." examples={examples} exampleComponents={exampleComponents} previousSection={{ title: 'Type System', path: '/type-system' }} nextSection={{ title: 'Quantum', path: '/quantum' }} />;
}
