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
  findRestrictionSites,
  designPrimers,
  simulatePCR,
  findCRISPRTargets,
  calculateHydrophobicityProfile,
  findORFs,
  calculateSequenceComplexity,
} from '@/lib/dna-computer/encoding';
import RestrictionMap from '@/components/dna-computer/RestrictionMap';
import HydrophobicityPlot from '@/components/dna-computer/HydrophobicityPlot';
import ORFViewer from '@/components/dna-computer/ORFViewer';

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

// Demo 7: PCR Simulation
const PCRSimulationDemo = () => {
  const [template, setTemplate] = useState('ATGCGATCGAATGCTAGCTAGCTAGCTAGCTAGCTGACTGA');
  const [primerStatus, setPrimerStatus] = useState<string>('');
  const [pcrResult, setPcrResult] = useState<ReturnType<typeof simulatePCR> | null>(null);
  const [cycles, setCycles] = useState([25]);

  const primers = useMemo(() => designPrimers(template), [template]);

  useEffect(() => {
    if (template.length >= 40 && primers) {
      const result = simulatePCR(template, primers.forward.sequence, primers.reverse.sequence, cycles[0]);
      setPcrResult(result);
      setPrimerStatus(result.product.length > 0 ? 'Valid primers designed' : 'Primer design failed');
    } else {
      setPrimerStatus('Template too short (min 40bp)');
      setPcrResult(null);
    }
  }, [template, primers, cycles]);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Template DNA (≥40bp)</label>
        <Input
          value={template}
          onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setTemplate(e.target.value.toUpperCase())}
          className="font-mono text-sm"
          placeholder="Enter template sequence"
        />
        <p className="text-xs text-muted-foreground mt-1">{primerStatus}</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">PCR Cycles: {cycles[0]}</label>
        <Slider value={cycles} onValueChange={setCycles} min={10} max={40} step={1} />
      </div>

      {primers && primers.forward && primers.reverse && (
        <Card className="p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Forward Primer (5'→3')</p>
            <p className="font-mono text-sm bg-green-500/20 p-2 rounded text-green-400">{primers.forward.sequence}</p>
            <p className="text-xs text-muted-foreground mt-1">Tm: {primers.forward.tm?.toFixed(1)}°C | GC: {primers.forward.gcContent?.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Reverse Primer (5'→3')</p>
            <p className="font-mono text-sm bg-red-500/20 p-2 rounded text-red-400">{primers.reverse.sequence}</p>
            <p className="text-xs text-muted-foreground mt-1">Tm: {primers.reverse.tm?.toFixed(1)}°C | GC: {primers.reverse.gcContent?.toFixed(1)}%</p>
          </div>
        </Card>
      )}

      {pcrResult && pcrResult.product.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Product Length</p>
              <p className="text-2xl font-bold">{pcrResult.length}</p>
              <p className="text-xs text-muted-foreground">bp</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Copies</p>
              <p className="text-2xl font-bold text-primary">{pcrResult.copies.toExponential(2)}</p>
              <p className="text-xs text-muted-foreground">molecules</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">GC Content</p>
              <p className="text-2xl font-bold text-cyan-400">{calculateGCContent(pcrResult.product).toFixed(1)}%</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Yield</p>
              <p className="text-2xl font-bold text-amber-400">{pcrResult.yield}</p>
            </Card>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">PCR Product</h4>
            <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
              <DNAStrandVisualizer sequence={pcrResult.product} showComplement />
            </div>
          </div>

          <GelElectrophoresis 
            bands={[{ length: pcrResult.length, intensity: 1, label: 'PCR Product' }]} 
          />
        </>
      )}
    </div>
  );
};

// Demo 8: CRISPR Editor
const CRISPREditorDemo = () => {
  const [sequence, setSequence] = useState('ATGCGATCGAATGCTAGCTAGCTAGCTAGCTAGCTGACTGAAGG');
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [insertSequence, setInsertSequence] = useState('AAAA');
  const [editedSequence, setEditedSequence] = useState('');

  const targets = useMemo(() => findCRISPRTargets(sequence), [sequence]);

  const handleEdit = () => {
    if (selectedTarget !== null && targets[selectedTarget]) {
      const target = targets[selectedTarget];
      const cutPosition = target.position + 17; // Cas9 cuts ~3bp upstream of PAM
      const edited = sequence.slice(0, cutPosition) + insertSequence + sequence.slice(cutPosition);
      setEditedSequence(edited);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Target DNA Sequence</label>
        <Input
          value={sequence}
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            if (isValidSequence(val)) {
              setSequence(val);
              setEditedSequence('');
              setSelectedTarget(null);
            }
          }}
          className="font-mono text-sm"
        />
      </div>

      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3">CRISPR-Cas9 Targets (NGG PAM)</h4>
        {targets.length === 0 ? (
          <p className="text-muted-foreground text-sm">No NGG PAM sites found</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {targets.map((target, i) => (
              <div
                key={i}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedTarget === i ? 'bg-primary/20 border border-primary' : 'bg-muted/30 hover:bg-muted/50'
                }`}
                onClick={() => setSelectedTarget(i)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">{target.sequence}_{target.pam}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">Pos: {target.position}</Badge>
                    <Badge variant={target.score > 0.8 ? 'default' : 'destructive'}>
                      Score: {target.score.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedTarget !== null && (
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Insert Sequence</label>
              <Input
                value={insertSequence}
                onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setInsertSequence(e.target.value.toUpperCase())}
                className="font-mono"
                placeholder="Sequence to insert at cut site"
              />
            </div>
            <Button onClick={handleEdit}>Simulate Edit</Button>
          </div>
        </div>
      )}

      {editedSequence && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Original Sequence</h4>
            <p className="font-mono text-sm bg-muted/30 p-2 rounded break-all">{sequence}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 text-green-400">Edited Sequence (+{insertSequence.length}bp)</h4>
            <p className="font-mono text-sm bg-green-500/20 p-2 rounded break-all">{editedSequence}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Original Length</p>
              <p className="text-2xl font-bold">{sequence.length} bp</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Edited Length</p>
              <p className="text-2xl font-bold text-green-400">{editedSequence.length} bp</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// Demo 9: Restriction Enzyme Digestion
const RestrictionDigestDemo = () => {
  const [sequence, setSequence] = useState('ATGAATTCGATCGGATCCTAGCTCGAGAATGCAAGCTTGATCGA');
  
  const restrictionSites = useMemo(() => findRestrictionSites(sequence), [sequence]);
  
  const fragments = useMemo(() => {
    if (restrictionSites.length === 0) return [{ sequence, length: sequence.length }];
    
    const sortedSites = [...restrictionSites].sort((a, b) => a.position - b.position);
    const frags: Array<{ sequence: string; length: number }> = [];
    let lastPos = 0;
    
    sortedSites.forEach(site => {
      if (site.position > lastPos) {
        const fragSeq = sequence.slice(lastPos, site.position);
        frags.push({ sequence: fragSeq, length: fragSeq.length });
      }
      lastPos = site.position + site.enzyme.recognition.length;
    });
    
    if (lastPos < sequence.length) {
      const fragSeq = sequence.slice(lastPos);
      frags.push({ sequence: fragSeq, length: fragSeq.length });
    }
    
    return frags;
  }, [sequence, restrictionSites]);

  const gelBands = useMemo(() => 
    fragments.map((f, i) => ({
      length: f.length,
      intensity: 0.8,
      label: `Fragment ${i + 1}`
    })).sort((a, b) => b.length - a.length),
  [fragments]);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">DNA Sequence</label>
        <Input
          value={sequence}
          onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setSequence(e.target.value.toUpperCase())}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Detects: EcoRI (GAATTC), BamHI (GGATCC), HindIII (AAGCTT), XhoI (CTCGAG), NotI (GCGGCCGC), SalI (GTCGAC)
        </p>
      </div>

      <RestrictionMap sequence={sequence} sites={restrictionSites.map(s => ({ enzyme: s.enzyme.name, position: s.position, recognition: s.enzyme.recognition }))} />

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-3">Restriction Sites Found</h4>
          {restrictionSites.length === 0 ? (
            <p className="text-muted-foreground text-sm">No restriction sites found</p>
          ) : (
            <div className="space-y-2">
              {restrictionSites.map((site, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="font-bold text-primary">{site.enzyme.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{site.enzyme.recognition}</Badge>
                    <Badge>@{site.position}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-medium mb-3">Digest Fragments ({fragments.length})</h4>
          <div className="space-y-2">
            {fragments.sort((a, b) => b.length - a.length).map((frag, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span className="font-mono text-sm truncate max-w-[150px]">{frag.sequence.slice(0, 10)}...</span>
                <Badge>{frag.length} bp</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Gel Electrophoresis (Virtual)</h4>
        <GelElectrophoresis bands={gelBands} />
      </div>
    </div>
  );
};

// Demo 10: Sequence Analysis Suite
const SequenceAnalysisDemo = () => {
  const [sequence, setSequence] = useState('ATGAAACCCGGGTTTATGCGATCGAATGCTAGCTAGCTAGCTAGCTAGCTGACTGAAGG');
  
  const complexity = useMemo(() => calculateSequenceComplexity(sequence), [sequence]);
  const hydrophobicity = useMemo(() => {
    const { mRNA } = transcribeDNA(sequence);
    const { protein } = translateRNA(mRNA);
    return calculateHydrophobicityProfile(protein);
  }, [sequence]);
  
  const orfs = useMemo(() => findORFs(sequence), [sequence]);
  
  const { mRNA } = useMemo(() => transcribeDNA(sequence), [sequence]);
  const { protein } = useMemo(() => translateRNA(mRNA), [mRNA]);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">DNA Sequence</label>
        <Input
          value={sequence}
          onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setSequence(e.target.value.toUpperCase())}
          className="font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Length</p>
          <p className="text-2xl font-bold">{sequence.length}</p>
          <p className="text-xs text-muted-foreground">bp</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">GC Content</p>
          <p className="text-2xl font-bold text-cyan-400">{calculateGCContent(sequence).toFixed(1)}%</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Complexity</p>
          <p className="text-2xl font-bold text-purple-400">{complexity.toFixed(2)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">ORFs Found</p>
          <p className="text-2xl font-bold text-amber-400">{orfs.length}</p>
        </Card>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Open Reading Frames</h4>
        <ORFViewer sequence={sequence} orfs={orfs} />
      </div>

      {protein.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Hydrophobicity Profile (Kyte-Doolittle)</h4>
          <HydrophobicityPlot profile={hydrophobicity} proteinSequence={protein} />
        </div>
      )}
    </div>
  );
};

// ============================================
// MOLECULAR DYNAMICS DEMO
// ============================================
const MolecularDynamicsDemo = () => {
  const [proteinSeq, setProteinSeq] = useState('MWLKFVEIRLLQ');
  const [dnaSeq, setDnaSeq] = useState('ATGCGATCGAATGC');
  const [coupling, setCoupling] = useState(0.5);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [bindingState, setBindingState] = useState<{
    proteinPhases: number[];
    dnaPhases: number[];
    orderParameter: number;
    bindingEnergy: number;
    contacts: { proteinIdx: number; dnaIdx: number; strength: number }[];
  } | null>(null);
  const animationRef = useRef<number>();

  // Initialize phases
  const initializeSystem = useCallback(() => {
    const proteinPhases = proteinSeq.split('').map((_, i) => (i * 2 * Math.PI) / proteinSeq.length);
    const dnaPhases = dnaSeq.split('').map((_, i) => (i * 2 * Math.PI) / dnaSeq.length + Math.PI);
    
    // Calculate initial contacts based on sequence compatibility
    const contacts: { proteinIdx: number; dnaIdx: number; strength: number }[] = [];
    for (let i = 0; i < Math.min(proteinSeq.length, dnaSeq.length); i++) {
      const strength = Math.abs(Math.sin(proteinPhases[i] - dnaPhases[i]));
      if (strength > 0.3) {
        contacts.push({ proteinIdx: i, dnaIdx: i, strength });
      }
    }

    setBindingState({
      proteinPhases,
      dnaPhases,
      orderParameter: 0,
      bindingEnergy: 0,
      contacts,
    });
    setTime(0);
  }, [proteinSeq, dnaSeq]);

  useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  // Kuramoto evolution
  useEffect(() => {
    if (!isRunning || !bindingState) return;

    const dt = 0.05;
    let lastTime = performance.now();

    const evolve = (currentTime: number) => {
      const elapsed = (currentTime - lastTime) / 1000;
      if (elapsed < 0.016) {
        animationRef.current = requestAnimationFrame(evolve);
        return;
      }
      lastTime = currentTime;

      setBindingState(prev => {
        if (!prev) return prev;

        const newProteinPhases = [...prev.proteinPhases];
        const newDnaPhases = [...prev.dnaPhases];

        // Protein-DNA coupling (attractive when complementary)
        for (let i = 0; i < newProteinPhases.length; i++) {
          let dTheta = 0;
          // Intra-protein coupling
          for (let j = 0; j < newProteinPhases.length; j++) {
            if (i !== j) {
              dTheta += coupling * 0.3 * Math.sin(newProteinPhases[j] - newProteinPhases[i]);
            }
          }
          // Protein-DNA coupling
          for (let j = 0; j < newDnaPhases.length; j++) {
            const dist = Math.abs(i - j);
            const k = coupling * Math.exp(-dist * 0.2);
            dTheta += k * Math.sin(newDnaPhases[j] - newProteinPhases[i]);
          }
          newProteinPhases[i] += (0.5 + dTheta) * dt;
        }

        // DNA phase evolution
        for (let i = 0; i < newDnaPhases.length; i++) {
          let dTheta = 0;
          // Intra-DNA coupling
          for (let j = 0; j < newDnaPhases.length; j++) {
            if (i !== j) {
              dTheta += coupling * 0.5 * Math.sin(newDnaPhases[j] - newDnaPhases[i]);
            }
          }
          // DNA-protein coupling
          for (let j = 0; j < newProteinPhases.length; j++) {
            const dist = Math.abs(i - j);
            const k = coupling * Math.exp(-dist * 0.2);
            dTheta += k * Math.sin(newProteinPhases[j] - newDnaPhases[i]);
          }
          newDnaPhases[i] += (0.3 + dTheta) * dt;
        }

        // Calculate order parameter (combined system)
        const allPhases = [...newProteinPhases, ...newDnaPhases];
        const cosSum = allPhases.reduce((s, p) => s + Math.cos(p), 0);
        const sinSum = allPhases.reduce((s, p) => s + Math.sin(p), 0);
        const orderParameter = Math.sqrt(cosSum * cosSum + sinSum * sinSum) / allPhases.length;

        // Calculate binding energy based on phase coherence
        let bindingEnergy = 0;
        const newContacts: { proteinIdx: number; dnaIdx: number; strength: number }[] = [];
        for (let i = 0; i < newProteinPhases.length; i++) {
          for (let j = 0; j < newDnaPhases.length; j++) {
            const phaseDiff = Math.abs(Math.cos(newProteinPhases[i] - newDnaPhases[j]));
            if (phaseDiff > 0.7) {
              const strength = phaseDiff;
              bindingEnergy += strength;
              newContacts.push({ proteinIdx: i, dnaIdx: j, strength });
            }
          }
        }

        return {
          proteinPhases: newProteinPhases,
          dnaPhases: newDnaPhases,
          orderParameter,
          bindingEnergy: bindingEnergy / (newProteinPhases.length * newDnaPhases.length),
          contacts: newContacts.slice(0, 10), // Keep top contacts
        };
      });

      setTime(t => t + dt);
      animationRef.current = requestAnimationFrame(evolve);
    };

    animationRef.current = requestAnimationFrame(evolve);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, coupling, bindingState]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Protein Sequence</label>
          <Input
            value={proteinSeq}
            onChange={(e) => setProteinSeq(e.target.value.toUpperCase().replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, ''))}
            className="font-mono"
            placeholder="Enter protein sequence"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">DNA Binding Site</label>
          <Input
            value={dnaSeq}
            onChange={(e) => setDnaSeq(e.target.value.toUpperCase().replace(/[^ATGC]/g, ''))}
            className="font-mono"
            placeholder="Enter DNA sequence"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Coupling Strength: {coupling.toFixed(2)}
        </label>
        <Slider
          value={[coupling]}
          onValueChange={([v]) => setCoupling(v)}
          min={0.1}
          max={2}
          step={0.05}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setIsRunning(!isRunning)} variant={isRunning ? "destructive" : "default"}>
          {isRunning ? 'Pause' : 'Start'} Simulation
        </Button>
        <Button variant="outline" onClick={initializeSystem}>Reset</Button>
      </div>

      {/* Phase Visualization */}
      {bindingState && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Molecular Phase Dynamics (t = {time.toFixed(1)})</h4>
          
          <svg viewBox="0 0 400 200" className="w-full h-48 bg-muted/20 rounded">
            {/* Protein phases (top row) */}
            <text x="10" y="30" className="fill-current text-xs">Protein</text>
            {bindingState.proteinPhases.map((phase, i) => {
              const x = 80 + (i * 25);
              const y = 40;
              return (
                <g key={`p-${i}`}>
                  <circle cx={x} cy={y} r={10} className="fill-primary/30 stroke-primary" strokeWidth={2} />
                  <line
                    x1={x}
                    y1={y}
                    x2={x + 8 * Math.cos(phase)}
                    y2={y + 8 * Math.sin(phase)}
                    className="stroke-primary"
                    strokeWidth={2}
                  />
                  <text x={x} y={y + 25} className="fill-current text-xs" textAnchor="middle">
                    {proteinSeq[i]}
                  </text>
                </g>
              );
            })}

            {/* DNA phases (bottom row) */}
            <text x="10" y="130" className="fill-current text-xs">DNA</text>
            {bindingState.dnaPhases.map((phase, i) => {
              const x = 80 + (i * 25);
              const y = 140;
              return (
                <g key={`d-${i}`}>
                  <circle cx={x} cy={y} r={10} className="fill-cyan-500/30 stroke-cyan-500" strokeWidth={2} />
                  <line
                    x1={x}
                    y1={y}
                    x2={x + 8 * Math.cos(phase)}
                    y2={y + 8 * Math.sin(phase)}
                    className="stroke-cyan-500"
                    strokeWidth={2}
                  />
                  <text x={x} y={y + 25} className="fill-current text-xs" textAnchor="middle">
                    {dnaSeq[i]}
                  </text>
                </g>
              );
            })}

            {/* Contact lines */}
            {bindingState.contacts.slice(0, 5).map((contact, i) => {
              const x1 = 80 + (contact.proteinIdx * 25);
              const x2 = 80 + (contact.dnaIdx * 25);
              return (
                <line
                  key={`c-${i}`}
                  x1={x1}
                  y1={60}
                  x2={x2}
                  y2={120}
                  stroke={`rgba(255, 200, 100, ${contact.strength})`}
                  strokeWidth={2}
                  strokeDasharray="4,2"
                />
              );
            })}
          </svg>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Order Parameter</p>
              <p className="text-2xl font-bold text-primary">{bindingState.orderParameter.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Binding Energy</p>
              <p className="text-2xl font-bold text-amber-400">{bindingState.bindingEnergy.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Active Contacts</p>
              <p className="text-2xl font-bold text-cyan-400">{bindingState.contacts.length}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Binding Interpretation */}
      {bindingState && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Binding Analysis</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <Badge variant={bindingState.orderParameter > 0.6 ? "default" : "secondary"}>
                {bindingState.orderParameter > 0.6 ? 'Strong Binding' : bindingState.orderParameter > 0.3 ? 'Moderate Binding' : 'Weak Binding'}
              </Badge>
            </p>
            <p className="mt-2">
              Phase coherence between protein and DNA indicates binding affinity. 
              High order parameter suggests stable protein-DNA complex formation.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================
// GENE EXPRESSION CALCULATOR DEMO
// ============================================
const GeneExpressionCalculatorDemo = () => {
  const [geneSequence, setGeneSequence] = useState('ATGAAACCCGGGTTTATGCGATCGATCGATCGATCGTAA');
  
  // Codon Adaptation Index (CAI) - E. coli optimal codons
  const optimalCodons: Record<string, string> = {
    'A': 'GCG', 'R': 'CGT', 'N': 'AAC', 'D': 'GAT', 'C': 'TGC',
    'Q': 'CAG', 'E': 'GAA', 'G': 'GGT', 'H': 'CAC', 'I': 'ATC',
    'L': 'CTG', 'K': 'AAA', 'M': 'ATG', 'F': 'TTC', 'P': 'CCG',
    'S': 'AGC', 'T': 'ACC', 'W': 'TGG', 'Y': 'TAC', 'V': 'GTG',
  };

  // Relative Synonymous Codon Usage (RSCU) weights for E. coli
  const codonWeights: Record<string, number> = {
    'TTT': 0.58, 'TTC': 1.42, 'TTA': 0.14, 'TTG': 0.13, 'CTT': 0.12, 'CTC': 0.10,
    'CTA': 0.04, 'CTG': 5.47, 'ATT': 0.51, 'ATC': 2.35, 'ATA': 0.13, 'ATG': 1.00,
    'GTT': 1.09, 'GTC': 0.15, 'GTA': 0.76, 'GTG': 2.00, 'TCT': 0.86, 'TCC': 0.88,
    'TCA': 0.12, 'TCG': 0.15, 'AGT': 0.16, 'AGC': 2.83, 'CCT': 0.16, 'CCC': 0.12,
    'CCA': 0.20, 'CCG': 3.52, 'ACT': 0.17, 'ACC': 2.69, 'ACA': 0.14, 'ACG': 1.00,
    'GCT': 0.19, 'GCC': 0.26, 'GCA': 0.22, 'GCG': 3.33, 'TAT': 0.59, 'TAC': 1.41,
    'CAT': 0.57, 'CAC': 1.43, 'CAA': 0.15, 'CAG': 1.85, 'AAT': 0.49, 'AAC': 1.51,
    'AAA': 1.74, 'AAG': 0.26, 'GAT': 0.63, 'GAC': 1.37, 'GAA': 1.69, 'GAG': 0.31,
    'TGT': 0.46, 'TGC': 1.54, 'TGG': 1.00, 'CGT': 3.80, 'CGC': 1.98, 'CGA': 0.06,
    'CGG': 0.10, 'AGA': 0.04, 'AGG': 0.02, 'GGT': 2.22, 'GGC': 1.66, 'GGA': 0.11,
    'GGG': 0.02, 'TAA': 1.50, 'TAG': 0.30, 'TGA': 1.20,
  };

  const analysis = useMemo(() => {
    if (geneSequence.length < 6) {
      return null;
    }

    // Extract codons
    const codons: string[] = [];
    for (let i = 0; i + 2 < geneSequence.length; i += 3) {
      codons.push(geneSequence.slice(i, i + 3));
    }

    // Calculate GC content
    const gc = (geneSequence.match(/[GC]/g)?.length || 0) / geneSequence.length;

    // Calculate GC at each codon position
    const gc1 = codons.filter(c => 'GC'.includes(c[0])).length / codons.length;
    const gc2 = codons.filter(c => 'GC'.includes(c[1])).length / codons.length;
    const gc3 = codons.filter(c => 'GC'.includes(c[2])).length / codons.length;

    // Calculate Codon Adaptation Index (geometric mean of weights)
    const weights = codons.map(c => codonWeights[c] || 0.5);
    const cai = Math.exp(weights.reduce((s, w) => s + Math.log(Math.max(w, 0.01)), 0) / weights.length);

    // Calculate tRNA availability score
    const rareCodons = codons.filter(c => (codonWeights[c] || 0.5) < 0.3);
    const rareCodonRatio = rareCodons.length / codons.length;

    // mRNA stability estimation (based on GC content and structure)
    const mRNAHalfLife = 5 + (gc * 10) + (gc3 * 5); // minutes

    // Protein expression level estimation (relative units)
    const expressionScore = cai * (1 - rareCodonRatio) * (mRNAHalfLife / 20);
    
    // Translation elongation rate
    const elongationRate = 15 * (1 - rareCodonRatio * 0.5); // codons per second

    // Protein folding efficiency (based on codon harmony)
    const codonHarmony = 1 - Math.abs(gc3 - 0.5); // optimal around 50% GC3
    
    // Final protein yield estimation (arbitrary units normalized to 100)
    const proteinYield = Math.min(100, expressionScore * codonHarmony * 100);

    // Get protein sequence
    let protein = '';
    for (const codon of codons) {
      const aaData = GENETIC_CODE[codon as keyof typeof GENETIC_CODE];
      if (!aaData) continue;
      const aa = typeof aaData === 'string' ? aaData : aaData.abbrev;
      if (aa === '*' || aa === 'Stop') break;
      if (aa) protein += aa;
    }

    // Identify limiting factors
    const limitingFactors: string[] = [];
    if (cai < 0.5) limitingFactors.push('Low codon optimization');
    if (rareCodonRatio > 0.2) limitingFactors.push('High rare codon content');
    if (gc < 0.35 || gc > 0.65) limitingFactors.push('Suboptimal GC content');
    if (mRNAHalfLife < 8) limitingFactors.push('Predicted low mRNA stability');

    return {
      codons,
      gc,
      gc1,
      gc2,
      gc3,
      cai,
      rareCodonRatio,
      rareCodons,
      mRNAHalfLife,
      expressionScore,
      elongationRate,
      codonHarmony,
      proteinYield,
      protein,
      limitingFactors,
    };
  }, [geneSequence]);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Gene Sequence (DNA)</label>
        <Input
          value={geneSequence}
          onChange={(e) => {
            const val = e.target.value.toUpperCase().replace(/[^ATGC]/g, '');
            setGeneSequence(val);
          }}
          className="font-mono"
          placeholder="Enter gene sequence (start with ATG)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Length: {geneSequence.length} bp | Codons: {Math.floor(geneSequence.length / 3)}
        </p>
      </div>

      {analysis && (
        <>
          {/* Primary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Protein Yield</p>
              <p className="text-3xl font-bold" style={{ color: `hsl(${analysis.proteinYield * 1.2}, 70%, 50%)` }}>
                {analysis.proteinYield.toFixed(0)}%
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">CAI Score</p>
              <p className="text-3xl font-bold text-primary">{analysis.cai.toFixed(2)}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">GC Content</p>
              <p className="text-3xl font-bold text-cyan-400">{(analysis.gc * 100).toFixed(1)}%</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">mRNA t½</p>
              <p className="text-3xl font-bold text-amber-400">{analysis.mRNAHalfLife.toFixed(1)} min</p>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-4">Expression Parameters</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GC Position 1:</span>
                  <span>{(analysis.gc1 * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GC Position 2:</span>
                  <span>{(analysis.gc2 * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GC Position 3:</span>
                  <span>{(analysis.gc3 * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rare Codons:</span>
                  <span>{(analysis.rareCodonRatio * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Elongation Rate:</span>
                  <span>{analysis.elongationRate.toFixed(1)} aa/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Codon Harmony:</span>
                  <span>{(analysis.codonHarmony * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Codon Usage Visualization */}
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-4">Codon Optimization Profile</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.codons.map((codon, i) => {
                const weight = codonWeights[codon] || 0.5;
                const isRare = weight < 0.3;
                const color = isRare ? 'bg-red-500/50' : weight > 1 ? 'bg-green-500/50' : 'bg-yellow-500/50';
                return (
                  <div
                    key={i}
                    className={`px-2 py-1 rounded font-mono text-xs ${color}`}
                    title={`${codon} (weight: ${weight.toFixed(2)})`}
                  >
                    {codon}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500/50 rounded" /> Optimal</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500/50 rounded" /> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500/50 rounded" /> Rare</span>
            </div>
          </Card>

          {/* Protein Output */}
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-2">Predicted Protein</h4>
            <p className="font-mono text-lg bg-muted/30 p-2 rounded break-all text-amber-400">
              {analysis.protein || '[No valid ORF]'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Length: {analysis.protein.length} amino acids | MW: ~{(analysis.protein.length * 110 / 1000).toFixed(1)} kDa
            </p>
          </Card>

          {/* Limiting Factors */}
          {analysis.limitingFactors.length > 0 && (
            <Card className="p-4 border-amber-500/30">
              <h4 className="text-sm font-medium mb-2 text-amber-400">⚠️ Expression Limiting Factors</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {analysis.limitingFactors.map((factor, i) => (
                  <li key={i}>• {factor}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Yield Meter */}
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-4">Expected Yield Gauge</h4>
            <div className="relative h-8 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="absolute h-full rounded-full transition-all duration-500"
                style={{
                  width: `${analysis.proteinYield}%`,
                  background: `linear-gradient(90deg, hsl(0, 70%, 50%), hsl(60, 70%, 50%), hsl(120, 70%, 50%))`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {analysis.proteinYield.toFixed(0)}% Yield
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
          </Card>
        </>
      )}
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
console.log('Sedenion state:', state.c);`,
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

const dnaPrimes = backend.encode(gene);
const transcribeResult = backend.transcribe(dnaPrimes, { force: true });
const translateResult = backend.translate(transcribeResult.rna);

console.log('Protein:', backend.decode(translateResult.protein));`,
  },
  {
    id: 'protein-folding',
    number: '3',
    title: 'Protein Folding',
    subtitle: 'Kuramoto Oscillator Dynamics',
    description: 'Simulate protein folding as oscillator synchronization using Kuramoto coupling based on hydrophobic and electrostatic interactions.',
    concepts: ['Kuramoto Model', 'Synchronization', 'Hydrophobic Core', 'Order Parameter'],
    code: `import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const backend = new BioinformaticsBackend();
const protein = 'MWLKFVEIRLLQ';
const proteinPrimes = backend.encode(protein);
const foldResult = backend.foldProtein(proteinPrimes);

console.log('Order parameter:', foldResult.orderParameter);`,
  },
  {
    id: 'dna-circuit',
    number: '4',
    title: 'DNA Logic Circuit',
    subtitle: 'Molecular Boolean Gates',
    description: 'Build logic circuits using DNA strand displacement with AND, OR, and NOT gates.',
    concepts: ['Boolean Logic', 'Strand Displacement', 'Toehold Reactions', 'Circuit Composition'],
    code: `import { DNACircuit, ANDGate, ORGate, NOTGate } from '@aleph-ai/tinyaleph';

const circuit = new DNACircuit('main-circuit');
circuit.addGate('and1', new ANDGate({ name: 'and1' }));
circuit.addGate('not1', new NOTGate({ name: 'not1' }));
circuit.addGate('or1', new ORGate({ name: 'or1' }));

const result = circuit.evaluate({ A: 1, B: 1, C: 0 });
console.log('Output:', result.output);`,
  },
  {
    id: 'molecular-binding',
    number: '5',
    title: 'Molecular Binding',
    subtitle: 'Spectral Coherence Affinity',
    description: 'Calculate binding affinity between molecules using spectral coherence of their hypercomplex states.',
    concepts: ['Binding Affinity', 'Spectral Coherence', 'Hybridization', 'Drug Screening'],
    code: `import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const backend = new BioinformaticsBackend();
const primes1 = backend.encode('ATGCATGC');
const primes2 = backend.encode('TACGTACG');

const result = backend.bindingAffinity(primes1, primes2);
console.log('Affinity:', result.affinity);`,
  },
  {
    id: 'strand-pool',
    number: '6',
    title: 'Strand Pool Reactor',
    subtitle: 'Kuramoto Meets Molecules',
    description: 'Model parallel DNA reactions as a Kuramoto oscillator network. Watch solutions crystallize as the pool synchronizes.',
    concepts: ['Kuramoto Model', 'Order Parameter', 'Phase Dynamics', 'Self-Organization'],
    code: `import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const backend = new BioinformaticsBackend();
const strands = ['ATGC', 'GCTA', 'TAGC', 'CGAT'];

const coupling = strands.map(s1 => 
  strands.map(s2 => backend.bindingAffinity(
    backend.encode(s1), backend.encode(s2)
  ).affinity)
);
console.log('Coupling matrix:', coupling);`,
  },
  {
    id: 'pcr-simulation',
    number: '7',
    title: 'PCR Simulation',
    subtitle: 'Polymerase Chain Reaction',
    description: 'Design primers and simulate PCR amplification. Automatically calculates melting temperatures and predicts amplicon.',
    concepts: ['Primer Design', 'Annealing', 'Amplification', 'Gel Electrophoresis'],
    code: `import { designPrimers, simulatePCR } from '@/lib/dna-computer/encoding';

const template = 'ATGCGATCGAATGCTAGCTAGCTAGCTAGCTAGCTGACTGA';
const primers = designPrimers(template);
const result = simulatePCR(template, primers.forward, primers.reverse, 25);

console.log('Product:', result.product);
console.log('Amplification:', result.amplification);`,
  },
  {
    id: 'crispr-editor',
    number: '8',
    title: 'CRISPR Editor',
    subtitle: 'Cas9 Target Finder',
    description: 'Find CRISPR-Cas9 target sites (NGG PAM) and simulate gene editing with custom insertions.',
    concepts: ['Guide RNA', 'PAM Sequence', 'Off-target Score', 'Gene Editing'],
    code: `import { findCRISPRTargets } from '@/lib/dna-computer/encoding';

const sequence = 'ATGCGATCGAATGCTAGCTAGCTAGCTAAGGNGG';
const targets = findCRISPRTargets(sequence);

targets.forEach(t => {
  console.log('Guide:', t.guide, 'PAM:', t.pam);
  console.log('Off-target score:', t.offtargetScore);
});`,
  },
  {
    id: 'restriction-digest',
    number: '9',
    title: 'Restriction Digest',
    subtitle: 'Enzyme Mapping',
    description: 'Find restriction enzyme cut sites and simulate digestion. Visualize fragments with virtual gel electrophoresis.',
    concepts: ['Restriction Enzymes', 'Digestion', 'Fragment Analysis', 'Gel Electrophoresis'],
    code: `import { findRestrictionSites } from '@/lib/dna-computer/encoding';

const sequence = 'ATGAATTCGATCGGATCCTAGCTCGAGAATGC';
const sites = findRestrictionSites(sequence);

sites.forEach(s => {
  console.log(s.enzyme.name, '@', s.position, s.enzyme.site);
});`,
  },
  {
    id: 'sequence-analysis',
    number: '10',
    title: 'Sequence Analysis',
    subtitle: 'Comprehensive Suite',
    description: 'Full sequence analysis: ORF finding, hydrophobicity plots, complexity metrics, and more.',
    concepts: ['ORF Detection', 'Hydrophobicity', 'Sequence Complexity', 'Kyte-Doolittle'],
    code: `import { findORFs, calculateSequenceComplexity, calculateHydrophobicityProfile } from '@/lib/dna-computer/encoding';

const sequence = 'ATGAAACCCGGGTTTATGCGATCGA';
const orfs = findORFs(sequence);
const complexity = calculateSequenceComplexity(sequence);

console.log('ORFs found:', orfs.length);
console.log('Complexity:', complexity);`,
  },
  {
    id: 'molecular-dynamics',
    number: '11',
    title: 'Molecular Dynamics',
    subtitle: 'Protein-DNA Binding',
    description: 'Simulate protein-DNA binding using Kuramoto-coupled oscillators. Watch phase synchronization drive molecular recognition.',
    concepts: ['Kuramoto Model', 'Binding Dynamics', 'Phase Coherence', 'Molecular Recognition'],
    code: `// Protein-DNA binding as coupled oscillator dynamics
const proteinPhases = protein.split('').map((_, i) => i * 2 * Math.PI / n);
const dnaPhases = dna.split('').map((_, i) => i * 2 * Math.PI / n);

// Kuramoto coupling evolution
dTheta_i = sum_j { K * sin(theta_j - theta_i) }

// Order parameter indicates binding strength
r = |1/N * sum(e^(i*theta))| // 0=unbound, 1=tight complex`,
  },
  {
    id: 'gene-expression',
    number: '12',
    title: 'Gene Expression Calculator',
    subtitle: 'Protein Yield Estimation',
    description: 'Predict protein expression levels from DNA sequences using codon adaptation index, GC content, and mRNA stability.',
    concepts: ['CAI Score', 'Codon Bias', 'mRNA Stability', 'Translation Rate'],
    code: `// Codon Adaptation Index calculation
const weights = codons.map(c => codonWeights[c]);
const cai = Math.exp(sum(log(weights)) / n);

// mRNA half-life estimation
const halfLife = 5 + gc * 10 + gc3 * 5; // minutes

// Protein yield
const yield = cai * (1 - rareCodonRatio) * stability;`,
  },
];

const exampleComponents: Record<string, React.FC> = {
  'nucleotide-encoder': NucleotideEncoderDemo,
  'central-dogma': CentralDogmaDemo,
  'protein-folding': ProteinFoldingDemo,
  'dna-circuit': DNACircuitDemo,
  'molecular-binding': MolecularBindingDemo,
  'strand-pool': StrandPoolReactorDemo,
  'pcr-simulation': PCRSimulationDemo,
  'crispr-editor': CRISPREditorDemo,
  'restriction-digest': RestrictionDigestDemo,
  'sequence-analysis': SequenceAnalysisDemo,
  'molecular-dynamics': MolecularDynamicsDemo,
  'gene-expression': GeneExpressionCalculatorDemo,
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
