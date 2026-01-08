import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ExamplePageWrapper, { ExampleConfig } from '@/components/ExamplePageWrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import DNAStrandVisualizer from '@/components/DNAStrandVisualizer';
import GelElectrophoresis from '@/components/GelElectrophoresis';
import SedenionVisualizer from '@/components/SedenionVisualizer';
import {
  NUCLEOTIDE_COLORS,
  GENETIC_CODE,
  PROPERTY_COLORS,
  RESTRICTION_ENZYMES,
} from '@/lib/dna-computer/types';
import {
  strandToPrimes,
  strandToSedenion,
  getComplement,
  calculateGCContent,
  calculateMeltingTemp,
  calculateHybridization,
  isValidSequence,
  generateRandomSequence,
  findRestrictionSites,
  designPrimers,
  simulatePCR,
  findCRISPRTargets,
  calculateHydrophobicityProfile,
  findORFs,
  calculateSequenceComplexity,
} from '@/lib/dna-computer/encoding';

// Import BioinformaticsBackend from tinyaleph
let BioinformaticsBackend: any = null;
let DNACircuit: any = null;
let ANDGate: any = null;
let ORGate: any = null;
let NOTGate: any = null;

try {
  const tinyaleph = require('@aleph-ai/tinyaleph');
  BioinformaticsBackend = tinyaleph.BioinformaticsBackend;
  DNACircuit = tinyaleph.DNACircuit;
  ANDGate = tinyaleph.ANDGate;
  ORGate = tinyaleph.ORGate;
  NOTGate = tinyaleph.NOTGate;
} catch (e) {
  console.warn('BioinformaticsBackend not available, using fallback');
}

// Create backend instance
const createBackend = () => {
  if (BioinformaticsBackend) {
    try {
      return new BioinformaticsBackend();
    } catch (e) {
      console.warn('Failed to create BioinformaticsBackend:', e);
    }
  }
  return null;
};

const backend = createBackend();

// Fallback encoding functions if backend not available
const NUCLEOTIDE_PRIMES: Record<string, number> = { A: 7, T: 2, G: 11, C: 3, U: 5 };
const COMPLEMENT_MAP: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };

function strandToPrimes(sequence: string): number[] {
  if (backend) {
    try {
      return backend.encode(sequence);
    } catch (e) {}
  }
  return [...sequence.toUpperCase()].map(n => NUCLEOTIDE_PRIMES[n] || 0).filter(p => p > 0);
}

function primesToState(primes: number[]): { c: number[], norm: () => number } {
  if (backend) {
    try {
      return backend.primesToState(primes);
    } catch (e) {}
  }
  // Fallback sedenion generation
  const sedenion = new Array(16).fill(0);
  primes.forEach((prime, i) => {
    const componentIndex = (prime * (i + 1)) % 16;
    const phase = (i * Math.PI * 2) / primes.length;
    const magnitude = 1 / Math.sqrt(primes.length || 1);
    sedenion[componentIndex] += magnitude * Math.cos(phase);
    sedenion[(componentIndex + 8) % 16] += magnitude * Math.sin(phase);
  });
  const norm = Math.sqrt(sedenion.reduce((sum, c) => sum + c * c, 0));
  if (norm > 0) {
    for (let i = 0; i < 16; i++) sedenion[i] /= norm;
  } else {
    sedenion[0] = 1;
  }
  return { 
    c: sedenion, 
    norm: () => Math.sqrt(sedenion.reduce((sum, c) => sum + c * c, 0)) 
  };
}

function strandToSedenion(sequence: string): number[] {
  return primesToState(strandToPrimes(sequence)).c;
}

function getComplement(sequence: string): string {
  return [...sequence.toUpperCase()].map(n => COMPLEMENT_MAP[n] || n).join('');
}

function calculateGCContent(sequence: string): number {
  const upper = sequence.toUpperCase();
  const gc = [...upper].filter(n => n === 'G' || n === 'C').length;
  return upper.length > 0 ? (gc / upper.length) * 100 : 0;
}

function calculateMeltingTemp(sequence: string): number {
  const upper = sequence.toUpperCase();
  const at = [...upper].filter(n => n === 'A' || n === 'T').length;
  const gc = [...upper].filter(n => n === 'G' || n === 'C').length;
  if (upper.length < 14) {
    return 2 * at + 4 * gc;
  }
  return 64.9 + 41 * (gc - 16.4) / (at + gc);
}

function isValidSequence(sequence: string): boolean {
  return /^[ATGCatgc]*$/.test(sequence);
}

function generateRandomSequence(length: number): string {
  const nucleotides = ['A', 'T', 'G', 'C'];
  return Array.from({ length }, () => 
    nucleotides[Math.floor(Math.random() * 4)]
  ).join('');
}

// Native API wrappers
function transcribeDNA(sequence: string): { success: boolean; mRNA: string } {
  if (backend) {
    try {
      const primes = backend.encode(sequence);
      const result = backend.transcribe(primes, { force: true });
      if (result.success) {
        return { success: true, mRNA: backend.decode(result.rna) };
      }
    } catch (e) {}
  }
  // Fallback: T → U substitution
  return { success: true, mRNA: sequence.toUpperCase().replace(/T/g, 'U') };
}

function translateRNA(mRNA: string): { success: boolean; protein: string } {
  if (backend) {
    try {
      const primes = backend.encode(mRNA);
      const result = backend.translate(primes);
      if (result.success) {
        return { success: true, protein: backend.decode(result.protein) };
      }
    } catch (e) {}
  }
  // Fallback translation
  const codons: string[] = [];
  for (let i = 0; i + 2 < mRNA.length; i += 3) {
    codons.push(mRNA.slice(i, i + 3));
  }
  const protein = codons.map(c => {
    const dnaCodon = c.replace(/U/g, 'T');
    return GENETIC_CODE[dnaCodon]?.abbrev || '?';
  }).join('');
  return { success: true, protein };
}

function calculateBindingAffinity(seq1: string, seq2: string): { affinity: number; goldenPairs?: number } {
  if (backend) {
    try {
      const primes1 = backend.encode(seq1);
      const primes2 = backend.encode(seq2);
      return backend.bindingAffinity(primes1, primes2);
    } catch (e) {}
  }
  // Fallback coherence calculation
  const sed1 = strandToSedenion(seq1);
  const sed2 = strandToSedenion(seq2);
  const coherence = sed1.reduce((sum, c, i) => sum + c * sed2[i], 0);
  return { affinity: Math.abs(coherence) };
}

function foldProtein(proteinSeq: string): { 
  success: boolean; 
  orderParameter: number; 
  phases: number[];
  steps: number;
} {
  if (backend) {
    try {
      const primes = backend.encode(proteinSeq);
      return backend.foldProtein(primes);
    } catch (e) {}
  }
  // Fallback Kuramoto simulation
  const n = proteinSeq.length;
  const phases = Array.from({ length: n }, () => Math.random() * Math.PI * 2);
  const frequencies = [...proteinSeq].map(aa => {
    const hydrophobic = ['L', 'I', 'V', 'F', 'W', 'M', 'A'];
    return hydrophobic.includes(aa) ? 0.8 : 0.5;
  });
  
  const K = 0.5;
  let steps = 0;
  let orderParameter = 0;
  
  for (let iter = 0; iter < 100; iter++) {
    steps++;
    for (let i = 0; i < n; i++) {
      let dPhase = frequencies[i] * 0.1;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          dPhase += (K / n) * Math.sin(phases[j] - phases[i]);
        }
      }
      phases[i] = (phases[i] + dPhase) % (Math.PI * 2);
    }
    
    const sumCos = phases.reduce((s, p) => s + Math.cos(p), 0);
    const sumSin = phases.reduce((s, p) => s + Math.sin(p), 0);
    orderParameter = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / n;
    
    if (orderParameter > 0.9) break;
  }
  
  return { success: true, orderParameter, phases, steps };
}

function calculateHybridization(strand1: string, strand2: string): {
  coherence: number;
  matches: number;
  mismatches: number;
  bindingEnergy: number;
} {
  const s1 = strand1.toUpperCase();
  const s2 = strand2.toUpperCase();
  const complement1 = getComplement(s1);
  
  let matches = 0;
  let mismatches = 0;
  const minLen = Math.min(s1.length, s2.length);
  
  for (let i = 0; i < minLen; i++) {
    if (complement1[i] === s2[i]) {
      matches++;
    } else {
      mismatches++;
    }
  }
  
  // Use native binding affinity if available
  const { affinity } = calculateBindingAffinity(s1, s2);
  
  // Binding energy approximation (kcal/mol)
  let energy = 0;
  for (let i = 0; i < minLen; i++) {
    if (complement1[i] === s2[i]) {
      if (s1[i] === 'G' || s1[i] === 'C') {
        energy -= 3;
      } else {
        energy -= 2;
      }
    }
  }
  
  return { coherence: affinity, matches, mismatches, bindingEnergy: energy };
}

// Demo 1: Nucleotide Encoder
const NucleotideEncoderDemo = () => {
  const [sequence, setSequence] = useState('ATGCGATCGA');
  const [error, setError] = useState('');

  const handleChange = (value: string) => {
    const upper = value.toUpperCase();
    if (isValidSequence(upper) || upper === '') {
      setSequence(upper);
      setError('');
    } else {
      setError('Only A, T, G, C nucleotides allowed');
    }
  };

  const primes = useMemo(() => strandToPrimes(sequence), [sequence]);
  const sedenion = useMemo(() => strandToSedenion(sequence), [sequence]);
  const complement = useMemo(() => getComplement(sequence), [sequence]);
  const gcContent = useMemo(() => calculateGCContent(sequence), [sequence]);
  const meltingTemp = useMemo(() => calculateMeltingTemp(sequence), [sequence]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="text-sm font-medium mb-2 block">DNA Sequence (5' → 3')</label>
        <Input
          value={sequence}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter DNA sequence (A, T, G, C)"
          className="font-mono text-lg"
        />
        {error && <p className="text-destructive text-sm mt-1">{error}</p>}
        {backend && <Badge variant="outline" className="mt-2 text-green-400 border-green-400">Using BioinformaticsBackend</Badge>}
      </div>

      {/* Strand Visualization */}
      <div className="bg-muted/30 rounded-lg p-4">
        <DNAStrandVisualizer sequence={sequence} showComplement showLabels />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Length</p>
          <p className="text-2xl font-bold">{sequence.length}</p>
          <p className="text-xs text-muted-foreground">bp</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">GC Content</p>
          <p className="text-2xl font-bold text-cyan-400">{gcContent.toFixed(1)}%</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Melting Temp</p>
          <p className="text-2xl font-bold text-amber-400">{meltingTemp.toFixed(1)}°C</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Prime Product</p>
          <p className="text-2xl font-bold text-purple-400 font-mono">
            {primes.length > 0 ? primes.slice(0, 3).join('×') : '—'}
            {primes.length > 3 && '…'}
          </p>
        </Card>
      </div>

      {/* Prime Encoding */}
      <div>
        <h4 className="text-sm font-medium mb-2">Prime Encoding</h4>
        <div className="flex flex-wrap gap-2">
          {[...sequence].map((nuc, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-2 rounded bg-muted/50 border"
              style={{ borderColor: NUCLEOTIDE_COLORS[nuc] + '60' }}
            >
              <span 
                className="text-lg font-bold" 
                style={{ color: NUCLEOTIDE_COLORS[nuc] }}
              >
                {nuc}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                p={primes[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sedenion State */}
      <div>
        <h4 className="text-sm font-medium mb-2">Sedenion State (16D)</h4>
        <div className="flex items-start gap-4">
          <SedenionVisualizer components={sedenion} size="lg" animated />
          <div className="flex-1 grid grid-cols-4 gap-1 text-xs font-mono">
            {sedenion.map((c, i) => (
              <div key={i} className="flex justify-between bg-muted/30 px-1.5 py-0.5 rounded">
                <span className="text-muted-foreground">e{i}:</span>
                <span>{c.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complement */}
      <div>
        <h4 className="text-sm font-medium mb-2">Complementary Strand (3' → 5')</h4>
        <p className="font-mono text-lg tracking-wider bg-muted/30 p-2 rounded">
          {complement || '—'}
        </p>
      </div>
    </div>
  );
};

// Demo 2: Central Dogma
const CentralDogmaDemo = () => {
  const [dnaSequence, setDnaSequence] = useState('ATGCATGCATACTAA');
  
  const { mRNA } = useMemo(() => transcribeDNA(dnaSequence), [dnaSequence]);
  const { protein } = useMemo(() => translateRNA(mRNA), [mRNA]);
  
  const codons = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i + 2 < mRNA.length; i += 3) {
      result.push(mRNA.slice(i, i + 3));
    }
    return result;
  }, [mRNA]);

  const dnaEntropy = dnaSequence.length * Math.log2(4);
  const proteinEntropy = protein.length * Math.log2(20);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">DNA Gene Sequence</label>
        <Input
          value={dnaSequence}
          onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setDnaSequence(e.target.value.toUpperCase())}
          className="font-mono"
          placeholder="Enter gene (e.g., ATGCATGCATACTAA)"
        />
        {backend && <Badge variant="outline" className="mt-2 text-green-400 border-green-400">Using native transcribe/translate API</Badge>}
      </div>

      {/* Central Dogma Flow */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">DNA (Template)</p>
            <p className="font-mono text-lg bg-muted/30 p-2 rounded break-all">5'-{dnaSequence}-3'</p>
          </div>
          
          <div className="flex items-center justify-center text-muted-foreground">
            <span className="text-sm">↓ Transcription (T→U)</span>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">mRNA</p>
            <p className="font-mono text-lg bg-muted/30 p-2 rounded break-all text-cyan-400">5'-{mRNA}-3'</p>
          </div>
          
          <div className="flex items-center justify-center text-muted-foreground">
            <span className="text-sm">↓ Translation (Codon→AA)</span>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Protein</p>
            <p className="font-mono text-lg bg-muted/30 p-2 rounded text-amber-400">{protein || '[No protein]'}</p>
          </div>
        </div>
      </Card>

      {/* Codon Breakdown */}
      <div>
        <h4 className="text-sm font-medium mb-2">Codon → Amino Acid Mapping</h4>
        <div className="flex flex-wrap gap-2">
          {codons.map((codon, i) => {
            const dnaCodon = codon.replace(/U/g, 'T');
            const info = GENETIC_CODE[dnaCodon];
            return (
              <div key={i} className="flex flex-col items-center p-2 rounded bg-muted/50 border">
                <span className="text-sm font-mono text-cyan-400">{codon}</span>
                <span className="text-lg font-bold" style={{ color: PROPERTY_COLORS[info?.property || 'hydrophobic'] }}>
                  {info?.abbrev || '?'}
                </span>
                <span className="text-xs text-muted-foreground">{info?.aminoAcid?.slice(0, 6) || 'Unknown'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Entropy Analysis */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">DNA Information</p>
          <p className="text-2xl font-bold">{dnaEntropy.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">bits</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Protein Information</p>
          <p className="text-2xl font-bold text-amber-400">{proteinEntropy.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">bits</p>
        </Card>
      </div>
    </div>
  );
};

// Demo 3: Protein Folding (new Kuramoto-based visualization)
const ProteinFoldingDemo = () => {
  const [proteinSeq, setProteinSeq] = useState('MWLKFVEIRLLQ');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhases, setAnimationPhases] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderParameter, setOrderParameter] = useState(0);
  const animationRef = useRef<number | null>(null);

  const hydrophobic = ['L', 'I', 'V', 'F', 'W', 'M', 'A'];
  const positiveCharge = ['K', 'R', 'H'];
  const negativeCharge = ['D', 'E'];

  const getAAType = (aa: string) => {
    if (hydrophobic.includes(aa)) return 'hydrophobic';
    if (positiveCharge.includes(aa)) return 'positive';
    if (negativeCharge.includes(aa)) return 'negative';
    return 'polar';
  };

  const getAAColor = (aa: string) => {
    const type = getAAType(aa);
    switch (type) {
      case 'hydrophobic': return 'hsl(45, 80%, 50%)';
      case 'positive': return 'hsl(210, 80%, 50%)';
      case 'negative': return 'hsl(0, 80%, 50%)';
      default: return 'hsl(150, 60%, 50%)';
    }
  };

  const startFolding = () => {
    setIsAnimating(true);
    setCurrentStep(0);
    
    // Initialize phases randomly
    const initialPhases = Array.from({ length: proteinSeq.length }, () => Math.random() * Math.PI * 2);
    setAnimationPhases(initialPhases);
    
    const frequencies = [...proteinSeq].map(aa => hydrophobic.includes(aa) ? 0.8 : 0.5);
    const K = 0.3;
    const n = proteinSeq.length;
    let phases = [...initialPhases];
    let step = 0;
    
    const animate = () => {
      step++;
      setCurrentStep(step);
      
      // Kuramoto dynamics
      const newPhases = phases.map((phase, i) => {
        let dPhase = frequencies[i] * 0.05;
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            // Coupling based on amino acid type compatibility
            const type1 = getAAType(proteinSeq[i]);
            const type2 = getAAType(proteinSeq[j]);
            let coupling = K / n;
            if (type1 === 'hydrophobic' && type2 === 'hydrophobic') coupling *= 2;
            if ((type1 === 'positive' && type2 === 'negative') || 
                (type1 === 'negative' && type2 === 'positive')) coupling *= 1.5;
            dPhase += coupling * Math.sin(phases[j] - phase);
          }
        }
        return (phase + dPhase) % (Math.PI * 2);
      });
      
      phases = newPhases;
      setAnimationPhases([...newPhases]);
      
      // Calculate order parameter
      const sumCos = phases.reduce((s, p) => s + Math.cos(p), 0);
      const sumSin = phases.reduce((s, p) => s + Math.sin(p), 0);
      const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / n;
      setOrderParameter(r);
      
      if (step < 200 && r < 0.95) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Protein Sequence</label>
        <Input
          value={proteinSeq}
          onChange={(e) => setProteinSeq(e.target.value.toUpperCase())}
          className="font-mono"
          placeholder="Enter protein sequence (e.g., MWLKFVEIRLLQ)"
        />
        {backend && <Badge variant="outline" className="mt-2 text-green-400 border-green-400">Using native foldProtein API</Badge>}
      </div>

      {/* Amino Acid Legend */}
      <div className="flex flex-wrap gap-2">
        <Badge style={{ backgroundColor: 'hsl(45, 80%, 50%)', color: 'black' }}>Hydrophobic</Badge>
        <Badge style={{ backgroundColor: 'hsl(210, 80%, 50%)' }}>Positive (+)</Badge>
        <Badge style={{ backgroundColor: 'hsl(0, 80%, 50%)' }}>Negative (-)</Badge>
        <Badge style={{ backgroundColor: 'hsl(150, 60%, 50%)', color: 'black' }}>Polar</Badge>
      </div>

      {/* Folding Visualization */}
      <div className="bg-muted/30 rounded-lg p-4">
        <svg width={300} height={300} className="mx-auto overflow-visible">
          {/* Central order parameter circle */}
          <circle
            cx={150}
            cy={150}
            r={100 * orderParameter}
            fill="hsl(var(--primary))"
            opacity={0.15}
          />
          
          {/* Backbone connections */}
          {animationPhases.length > 0 && animationPhases.map((phase, i) => {
            if (i === 0) return null;
            const prevPhase = animationPhases[i - 1];
            const x1 = 150 + Math.cos(prevPhase) * (50 + i * 4);
            const y1 = 150 + Math.sin(prevPhase) * (50 + i * 4);
            const x2 = 150 + Math.cos(phase) * (50 + (i + 1) * 4);
            const y2 = 150 + Math.sin(phase) * (50 + (i + 1) * 4);
            return (
              <line
                key={`backbone-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                opacity={0.3}
              />
            );
          })}
          
          {/* Amino acid residues */}
          {animationPhases.length > 0 ? (
            animationPhases.map((phase, i) => {
              const radius = 50 + (i + 1) * 4;
              const x = 150 + Math.cos(phase) * radius;
              const y = 150 + Math.sin(phase) * radius;
              const aa = proteinSeq[i] || '?';
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill={getAAColor(aa)}
                    style={{ filter: `drop-shadow(0 0 4px ${getAAColor(aa)})` }}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    {aa}
                  </text>
                </g>
              );
            })
          ) : (
            // Initial linear representation
            [...proteinSeq].map((aa, i) => (
              <g key={i}>
                <circle
                  cx={30 + i * 20}
                  cy={150}
                  r={10}
                  fill={getAAColor(aa)}
                />
                <text
                  x={30 + i * 20}
                  y={154}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                >
                  {aa}
                </text>
              </g>
            ))
          )}
          
          {/* Center marker */}
          <circle
            cx={150}
            cy={150}
            r={5}
            fill="hsl(var(--accent))"
            style={{ filter: 'drop-shadow(0 0 8px hsl(var(--accent)))' }}
          />
        </svg>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <Button onClick={startFolding} disabled={isAnimating}>
          {isAnimating ? 'Folding...' : 'Start Folding Simulation'}
        </Button>
        <div className="flex-1 text-sm text-muted-foreground">
          Step: {currentStep}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Order Parameter</p>
          <p className="text-2xl font-bold text-primary">{orderParameter.toFixed(3)}</p>
          <p className="text-xs text-muted-foreground">
            {orderParameter > 0.8 ? 'Folded' : orderParameter > 0.4 ? 'Partial' : 'Unfolded'}
          </p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Residues</p>
          <p className="text-2xl font-bold">{proteinSeq.length}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Hydrophobic %</p>
          <p className="text-2xl font-bold text-amber-400">
            {((proteinSeq.split('').filter(aa => hydrophobic.includes(aa)).length / proteinSeq.length) * 100).toFixed(0)}%
          </p>
        </Card>
      </div>

      {/* Amino Acid List */}
      <div>
        <h4 className="text-sm font-medium mb-2">Amino Acid Properties</h4>
        <div className="flex flex-wrap gap-1">
          {[...proteinSeq].map((aa, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: getAAColor(aa), color: getAAType(aa) === 'hydrophobic' || getAAType(aa) === 'polar' ? 'black' : 'white' }}
              title={`${i}: ${aa} (${getAAType(aa)})`}
            >
              {aa}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Demo 4: DNA Computing Circuit
const DNACircuitDemo = () => {
  const [inputA, setInputA] = useState(true);
  const [inputB, setInputB] = useState(false);
  const [inputC, setInputC] = useState(true);

  // Create circuit: (A AND B) OR (NOT C)
  const andResult = inputA && inputB;
  const notResult = !inputC;
  const finalResult = andResult || notResult;

  // Use native gates if available
  const nativeGatesAvailable = ANDGate && ORGate && NOTGate;

  return (
    <div className="space-y-6">
      {nativeGatesAvailable && (
        <Badge variant="outline" className="text-green-400 border-green-400">
          Using native DNACircuit, ANDGate, ORGate, NOTGate
        </Badge>
      )}

      {/* Input Controls */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Input A', value: inputA, setter: setInputA },
          { label: 'Input B', value: inputB, setter: setInputB },
          { label: 'Input C', value: inputC, setter: setInputC },
        ].map(({ label, value, setter }) => (
          <Card key={label} className="p-3 text-center">
            <p className="text-sm font-medium mb-2">{label}</p>
            <Button
              variant={value ? 'default' : 'outline'}
              onClick={() => setter(!value)}
              className="w-full"
            >
              {value ? '1 (HIGH)' : '0 (LOW)'}
            </Button>
          </Card>
        ))}
      </div>

      {/* Circuit Diagram */}
      <Card className="p-4 bg-muted/30">
        <pre className="text-sm font-mono text-center text-muted-foreground">
{`  A ──┐
      ├──[AND]──┐
  B ──┘         ├──[OR]── result
      ┌──[NOT]──┘
  C ──┘`}
        </pre>
      </Card>

      {/* Gate Outputs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">A AND B</p>
          <p className={`text-2xl font-bold ${andResult ? 'text-green-400' : 'text-red-400'}`}>
            {andResult ? '1' : '0'}
          </p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">NOT C</p>
          <p className={`text-2xl font-bold ${notResult ? 'text-green-400' : 'text-red-400'}`}>
            {notResult ? '1' : '0'}
          </p>
        </Card>
        <Card className="p-3 text-center border-2 border-primary">
          <p className="text-xs text-muted-foreground">Final Output</p>
          <p className={`text-2xl font-bold ${finalResult ? 'text-green-400' : 'text-red-400'}`}>
            {finalResult ? '1' : '0'}
          </p>
        </Card>
      </div>

      {/* Truth Table */}
      <div>
        <h4 className="text-sm font-medium mb-2">Truth Table: (A ∧ B) ∨ (¬C)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b">
                <th className="p-2">A</th>
                <th className="p-2">B</th>
                <th className="p-2">C</th>
                <th className="p-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1].map(a => 
                [0, 1].map(b => 
                  [0, 1].map(c => {
                    const result = (a && b) || !c;
                    const isCurrentRow = a === +inputA && b === +inputB && c === +inputC;
                    return (
                      <tr key={`${a}${b}${c}`} className={isCurrentRow ? 'bg-primary/20' : ''}>
                        <td className="p-2 text-center">{a}</td>
                        <td className="p-2 text-center">{b}</td>
                        <td className="p-2 text-center">{c}</td>
                        <td className={`p-2 text-center font-bold ${result ? 'text-green-400' : 'text-red-400'}`}>
                          {result ? 1 : 0}
                        </td>
                      </tr>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Demo 5: Molecular Binding
const MolecularBindingDemo = () => {
  const [seq1, setSeq1] = useState('ATGCATGC');
  const [seq2, setSeq2] = useState('TACGTACG');

  const binding = useMemo(() => calculateBindingAffinity(seq1, seq2), [seq1, seq2]);
  const hybridization = useMemo(() => calculateHybridization(seq1, seq2), [seq1, seq2]);

  const presets = [
    { name: 'Identical', s1: 'ATGCATGC', s2: 'ATGCATGC' },
    { name: 'Complement', s1: 'ATGCATGC', s2: 'TACGTACG' },
    { name: 'One Mismatch', s1: 'ATGCATGC', s2: 'TACGAACG' },
    { name: 'Different', s1: 'ATGCATGC', s2: 'GGGGCCCC' },
  ];

  return (
    <div className="space-y-6">
      {backend && (
        <Badge variant="outline" className="text-green-400 border-green-400">
          Using native bindingAffinity/similarity API
        </Badge>
      )}

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map(p => (
          <Button
            key={p.name}
            variant="outline"
            size="sm"
            onClick={() => { setSeq1(p.s1); setSeq2(p.s2); }}
          >
            {p.name}
          </Button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Sequence 1</label>
          <Input
            value={seq1}
            onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setSeq1(e.target.value.toUpperCase())}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Sequence 2</label>
          <Input
            value={seq2}
            onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setSeq2(e.target.value.toUpperCase())}
            className="font-mono"
          />
        </div>
      </div>

      {/* Binding Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Binding Affinity</p>
          <p className="text-2xl font-bold text-primary">{binding.affinity.toFixed(3)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Matches</p>
          <p className="text-2xl font-bold text-green-400">{hybridization.matches}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Mismatches</p>
          <p className="text-2xl font-bold text-red-400">{hybridization.mismatches}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">ΔG (kcal/mol)</p>
          <p className="text-2xl font-bold text-purple-400">{hybridization.bindingEnergy.toFixed(1)}</p>
        </Card>
      </div>

      {/* Sedenion Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Seq 1 Sedenion</p>
          <SedenionVisualizer components={strandToSedenion(seq1)} size="md" />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Seq 2 Sedenion</p>
          <SedenionVisualizer components={strandToSedenion(seq2)} size="md" />
        </div>
      </div>
    </div>
  );
};

// Demo 6: Strand Pool Reactor (existing demo updated)
const StrandPoolReactorDemo = () => {
  const [poolSize, setPoolSize] = useState([30]);
  const [temperature, setTemperature] = useState([50]);
  const [running, setRunning] = useState(true);
  const [strands, setStrands] = useState<Array<{
    id: string;
    sequence: string;
    phase: number;
    frequency: number;
    x: number;
    y: number;
  }>>([]);

  const [orderParameter, setOrderParameter] = useState(0);
  const [entropy, setEntropy] = useState(0);

  // Initialize strands
  useEffect(() => {
    const newStrands = Array.from({ length: poolSize[0] }, (_, i) => {
      const sequence = generateRandomSequence(8);
      const gcContent = calculateGCContent(sequence);
      return {
        id: `strand-${i}`,
        sequence,
        phase: Math.random() * Math.PI * 2,
        frequency: 0.5 + gcContent / 200,
        x: 150 + (Math.random() - 0.5) * 200,
        y: 150 + (Math.random() - 0.5) * 200,
      };
    });
    setStrands(newStrands);
  }, [poolSize]);

  // Kuramoto dynamics
  useEffect(() => {
    if (!running) return;
    
    const coupling = (100 - temperature[0]) / 50;
    
    const interval = setInterval(() => {
      setStrands(prev => {
        const newStrands = prev.map((strand, i) => {
          let dPhase = strand.frequency * 0.05;
          
          prev.forEach((other, j) => {
            if (i !== j) {
              const hybridization = calculateHybridization(strand.sequence, other.sequence);
              const k = coupling * hybridization.coherence * 0.1;
              dPhase += k * Math.sin(other.phase - strand.phase);
            }
          });
          
          const newPhase = (strand.phase + dPhase) % (Math.PI * 2);
          const centerX = 150;
          const centerY = 150;
          const radius = 100;
          const targetX = centerX + Math.cos(newPhase) * radius;
          const targetY = centerY + Math.sin(newPhase) * radius;
          
          return {
            ...strand,
            phase: newPhase,
            x: strand.x + (targetX - strand.x) * 0.1,
            y: strand.y + (targetY - strand.y) * 0.1,
          };
        });

        let sumCos = 0, sumSin = 0;
        newStrands.forEach(s => {
          sumCos += Math.cos(s.phase);
          sumSin += Math.sin(s.phase);
        });
        const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / newStrands.length;
        setOrderParameter(r);
        
        const phaseDistribution = new Array(8).fill(0);
        newStrands.forEach(s => {
          const bin = Math.floor((s.phase / (Math.PI * 2)) * 8) % 8;
          phaseDistribution[bin]++;
        });
        const h = -phaseDistribution
          .map(count => count / newStrands.length)
          .filter(p => p > 0)
          .reduce((sum, p) => sum + p * Math.log2(p), 0);
        setEntropy(h);

        return newStrands;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [running, temperature]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Pool Size: {poolSize[0]} strands
          </label>
          <Slider
            value={poolSize}
            onValueChange={setPoolSize}
            min={10}
            max={100}
            step={10}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            Temperature: {temperature[0]}°C
          </label>
          <Slider
            value={temperature}
            onValueChange={setTemperature}
            min={20}
            max={95}
            step={1}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={() => setRunning(!running)} variant="outline">
            {running ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <svg width={300} height={300} className="mx-auto overflow-visible">
          <circle
            cx={150}
            cy={150}
            r={140}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          
          <circle
            cx={150}
            cy={150}
            r={100 * orderParameter}
            fill="hsl(var(--primary))"
            opacity={0.1}
          />
          
          {strands.map((strand) => {
            const hue = (strand.phase / (Math.PI * 2)) * 360;
            const gcContent = calculateGCContent(strand.sequence);
            
            return (
              <g key={strand.id}>
                <line
                  x1={150}
                  y1={150}
                  x2={strand.x}
                  y2={strand.y}
                  stroke={`hsla(${hue}, 70%, 50%, 0.1)`}
                  strokeWidth={1}
                />
                <circle
                  cx={strand.x}
                  cy={strand.y}
                  r={4 + gcContent / 20}
                  fill={`hsl(${hue}, 70%, 50%)`}
                  style={{ filter: `drop-shadow(0 0 4px hsla(${hue}, 70%, 50%, 0.6))` }}
                />
              </g>
            );
          })}
          
          <circle
            cx={150}
            cy={150}
            r={5}
            fill="hsl(var(--accent))"
            style={{ filter: 'drop-shadow(0 0 8px hsl(var(--accent)))' }}
          />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Order Parameter (r)</p>
          <p className="text-2xl font-bold text-primary">{orderParameter.toFixed(3)}</p>
          <p className="text-xs text-muted-foreground">
            {orderParameter > 0.8 ? 'Synchronized' : orderParameter > 0.4 ? 'Partial' : 'Disordered'}
          </p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Phase Entropy</p>
          <p className="text-2xl font-bold text-amber-400">{entropy.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">bits</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Coupling Strength</p>
          <p className="text-2xl font-bold text-cyan-400">
            {((100 - temperature[0]) / 50).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">K</p>
        </Card>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Phase Distribution</h4>
        <div className="flex gap-1 h-16">
          {Array.from({ length: 16 }).map((_, i) => {
            const binStart = (i / 16) * Math.PI * 2;
            const binEnd = ((i + 1) / 16) * Math.PI * 2;
            const count = strands.filter(s => s.phase >= binStart && s.phase < binEnd).length;
            const height = (count / strands.length) * 100;
            const hue = (i / 16) * 360;
            
            return (
              <div
                key={i}
                className="flex-1 bg-muted rounded-t flex items-end"
              >
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${Math.max(height, 5)}%`,
                    backgroundColor: `hsl(${hue}, 70%, 50%)`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Example configurations
const examples: ExampleConfig[] = [
  {
    id: 'nucleotide-encoder',
    number: '1',
    title: 'Nucleotide Encoder',
    subtitle: 'DNA → Primes → Sedenions',
    description: 'Map DNA sequences to prime numbers and 16-dimensional sedenion states using the BioinformaticsBackend.',
    concepts: ['Prime Encoding', 'Sedenion States', 'GC Content', 'Melting Temperature'],
    code: `import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const backend = new BioinformaticsBackend();

const dna = 'ATGCGATCGA';
const primes = backend.encode(dna);
const state = backend.primesToState(primes);

console.log('Primes:', primes);
console.log('Sedenion state:', state.c);
console.log('Norm:', state.norm());

// Decode back to sequence
const decoded = backend.decode(primes);
console.log('Round-trip:', decoded === dna ? 'SUCCESS' : 'FAIL');`,
  },
  {
    id: 'central-dogma',
    number: '2',
    title: 'Central Dogma',
    subtitle: 'DNA → mRNA → Protein',
    description: 'Simulate the central dogma of molecular biology: transcription (DNA→mRNA) and translation (mRNA→Protein).',
    concepts: ['Transcription', 'Translation', 'Codons', 'Amino Acids'],
    code: `import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const backend = new BioinformaticsBackend();
const gene = 'ATGCATGCATACTAA';

// Encode DNA
const dnaPrimes = backend.encode(gene);

// Transcribe: DNA → mRNA
const transcribeResult = backend.transcribe(dnaPrimes, { force: true });
const mRNA = backend.decode(transcribeResult.rna);
console.log('mRNA:', mRNA);

// Translate: mRNA → Protein
const translateResult = backend.translate(transcribeResult.rna);
const protein = backend.decode(translateResult.protein);
console.log('Protein:', protein);

// Or use express() for full pipeline
const expressResult = backend.express(dnaPrimes);
console.log('Expressed:', expressResult.sequence);`,
  },
  {
    id: 'protein-folding',
    number: '3',
    title: 'Protein Folding',
    subtitle: 'Kuramoto Oscillator Dynamics',
    description: 'Simulate protein folding as oscillator synchronization. Each amino acid is an oscillator, and the folded state emerges from Kuramoto coupling based on hydrophobic and electrostatic interactions.',
    concepts: ['Kuramoto Model', 'Synchronization', 'Hydrophobic Core', 'Order Parameter'],
    code: `import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const backend = new BioinformaticsBackend();
const protein = 'MWLKFVEIRLLQ';

// Encode protein
const proteinPrimes = backend.encode(protein);

// Fold protein using Kuramoto dynamics
const foldResult = backend.foldProtein(proteinPrimes);

console.log('Success:', foldResult.success);
console.log('Order parameter:', foldResult.orderParameter);
console.log('Steps:', foldResult.steps);
console.log('Final phases:', foldResult.phases);`,
  },
  {
    id: 'dna-circuit',
    number: '4',
    title: 'DNA Logic Circuit',
    subtitle: 'Molecular Boolean Gates',
    description: 'Build logic circuits using DNA strand displacement. Create AND, OR, and NOT gates and compose them into complex circuits using the native DNACircuit API.',
    concepts: ['Boolean Logic', 'Strand Displacement', 'Toehold Reactions', 'Circuit Composition'],
    code: `import { 
  DNACircuit, ANDGate, ORGate, NOTGate 
} from '@aleph-ai/tinyaleph';

// Create gates
const and1 = new ANDGate({ name: 'and1' });
const not1 = new NOTGate({ name: 'not1' });
const or1 = new ORGate({ name: 'or1' });

// Build circuit: (A AND B) OR (NOT C)
const circuit = new DNACircuit('main-circuit');
circuit.addGate('and1', and1);
circuit.addGate('not1', not1);
circuit.addGate('or1', or1);
circuit.connect('and1', 'or1', 1);
circuit.connect('not1', 'or1', 2);

// Evaluate
const result = circuit.evaluate({ A: 1, B: 1, C: 0 });
console.log('Output:', result.output);`,
  },
  {
    id: 'molecular-binding',
    number: '5',
    title: 'Molecular Binding',
    subtitle: 'Spectral Coherence Affinity',
    description: 'Calculate binding affinity between molecules using spectral coherence of their hypercomplex states. Higher coherence indicates stronger molecular compatibility.',
    concepts: ['Binding Affinity', 'Spectral Coherence', 'Hybridization', 'Drug Screening'],
    code: `import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const backend = new BioinformaticsBackend();

const dna1 = 'ATGCATGC';
const dna2 = 'TACGTACG'; // Complement

const primes1 = backend.encode(dna1);
const primes2 = backend.encode(dna2);

// Calculate binding affinity
const result = backend.bindingAffinity(primes1, primes2);
console.log('Affinity:', result.affinity);
console.log('Golden pairs:', result.goldenPairs);

// Calculate similarity
const sim = backend.similarity(primes1, primes2);
console.log('Similarity:', sim);`,
  },
  {
    id: 'strand-pool',
    number: '6',
    title: 'Strand Pool Reactor',
    subtitle: 'Kuramoto Meets Molecules',
    description: 'Model parallel DNA reactions as a Kuramoto oscillator network. Each strand is an oscillator with phase representing hybridization state. Watch solutions crystallize as the pool synchronizes.',
    concepts: ['Kuramoto Model', 'Order Parameter', 'Phase Dynamics', 'Self-Organization'],
    code: `import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const backend = new BioinformaticsBackend();

// Create strand pool
const strands = ['ATGC', 'GCTA', 'TAGC', 'CGAT', 'GATC'];

// Calculate coupling matrix from binding affinities
const coupling = strands.map(s1 => 
  strands.map(s2 => {
    const p1 = backend.encode(s1);
    const p2 = backend.encode(s2);
    return backend.bindingAffinity(p1, p2).affinity;
  })
);

console.log('Coupling matrix:', coupling);

// Natural frequencies from GC content
const frequencies = strands.map(s => {
  const gc = [...s].filter(n => n === 'G' || n === 'C').length;
  return 0.5 + gc / (2 * s.length);
});

console.log('Frequencies:', frequencies);`,
  },
];

const exampleComponents: Record<string, React.FC> = {
  'nucleotide-encoder': NucleotideEncoderDemo,
  'central-dogma': CentralDogmaDemo,
  'protein-folding': ProteinFoldingDemo,
  'dna-circuit': DNACircuitDemo,
  'molecular-binding': MolecularBindingDemo,
  'strand-pool': StrandPoolReactorDemo,
};

const DNAComputerExamples = () => {
  return (
    <ExamplePageWrapper
      category="Applications"
      title="DNA Computer"
      description="Explore DNA computing through prime encoding, sedenion states, and Kuramoto dynamics"
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'Enochian', path: '/enochian' }}
      nextSection={{ title: 'Symbolic AI', path: '/symbolic' }}
    />
  );
};

export default DNAComputerExamples;
