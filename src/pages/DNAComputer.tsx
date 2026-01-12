import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import DNAStrandVisualizer from '@/components/DNAStrandVisualizer';
import GelElectrophoresis from '@/components/GelElectrophoresis';
import SedenionVisualizer from '@/components/SedenionVisualizer';
import RestrictionMap from '@/components/dna-computer/RestrictionMap';
import HydrophobicityPlot from '@/components/dna-computer/HydrophobicityPlot';
import ORFViewer from '@/components/dna-computer/ORFViewer';
import {
  NUCLEOTIDE_COLORS,
  GENETIC_CODE,
  PROPERTY_COLORS,
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
import { 
  Dna, 
  Microscope, 
  FlaskConical, 
  Cpu, 
  Scissors, 
  Target,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// ============= Utility Functions =============
const NUCLEOTIDE_PRIMES: Record<string, number> = { A: 7, T: 2, G: 11, C: 3, U: 5 };
const COMPLEMENT_MAP: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };

function strandToPrimes(sequence: string): number[] {
  return [...sequence.toUpperCase()].map(n => NUCLEOTIDE_PRIMES[n] || 0).filter(p => p > 0);
}

function primesToSedenion(primes: number[]): number[] {
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
  return sedenion;
}

function strandToSedenion(sequence: string): number[] {
  return primesToSedenion(strandToPrimes(sequence));
}

function getComplement(sequence: string): string {
  return [...sequence.toUpperCase()].map(n => COMPLEMENT_MAP[n] || n).join('');
}

function getReverseComplement(sequence: string): string {
  return getComplement(sequence).split('').reverse().join('');
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

function transcribeDNA(sequence: string): string {
  return sequence.toUpperCase().replace(/T/g, 'U');
}

function translateRNA(mRNA: string): string {
  const codons: string[] = [];
  for (let i = 0; i + 2 < mRNA.length; i += 3) {
    codons.push(mRNA.slice(i, i + 3));
  }
  return codons.map(c => {
    const dnaCodon = c.replace(/U/g, 'T');
    return GENETIC_CODE[dnaCodon]?.abbrev || '?';
  }).join('');
}

// ============= Sequence Context Type =============
interface SequenceState {
  sequence: string;
  name: string;
  description: string;
}

// ============= Main Component =============
const DNAComputer = () => {
  const [sequenceState, setSequenceState] = useState<SequenceState>({
    sequence: 'ATGCGATCGAATGCTAGCTAGCTAGCTAGCTAGCTGACTGAAGGCTT',
    name: 'Sample Gene',
    description: 'A sample DNA sequence for analysis'
  });
  const [activeTab, setActiveTab] = useState('analysis');
  const [copied, setCopied] = useState(false);

  const { sequence } = sequenceState;

  // Computed values
  const gcContent = useMemo(() => calculateGCContent(sequence), [sequence]);
  const meltingTemp = useMemo(() => calculateMeltingTemp(sequence), [sequence]);
  const sedenion = useMemo(() => strandToSedenion(sequence), [sequence]);
  const complexity = useMemo(() => calculateSequenceComplexity(sequence), [sequence]);
  const mRNA = useMemo(() => transcribeDNA(sequence), [sequence]);
  const protein = useMemo(() => translateRNA(mRNA), [mRNA]);
  const restrictionSites = useMemo(() => findRestrictionSites(sequence), [sequence]);
  const orfs = useMemo(() => findORFs(sequence), [sequence]);
  const crisprTargets = useMemo(() => findCRISPRTargets(sequence), [sequence]);
  const primers = useMemo(() => sequence.length >= 40 ? designPrimers(sequence) : null, [sequence]);

  const handleSequenceChange = useCallback((newSequence: string) => {
    const upper = newSequence.toUpperCase();
    if (isValidSequence(upper) || upper === '') {
      setSequenceState(prev => ({ ...prev, sequence: upper }));
    }
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(sequence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sequence]);

  const presetSequences = [
    { name: 'GFP Gene', seq: 'ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAGTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTGCCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTCAGCCGCTACCCCGACCACATGAAGCAGCACGACTTCTTCAAGTCCGCCATGCCCGAAGGCTACGTCCAGGAGCGCACCATCTTCTTCAAGGACGACGGCAACTACAAGACCCGCGCCGAGGTGAAGTTCGAGGGCGACACCCTGGTGAACCGCATCGAGCTGAAGGGCATCGACTTCAAGGAGGACGGCAACATCCTGGGGCACAAGCTGGAGTACAACTACAACAGCCACAACGTCTATATCATGGCCGACAAGCAGAAGAACGGCATCAAGGTGAACTTCAAGATCCGCCACAACATCGAGGACGGCAGCGTGCAGCTCGCCGACCACTACCAGCAGAACACCCCCATCGGCGACGGCCCCGTGCTGCTGCCCGACAACCACTACCTGAGCACCCAGTCCGCCCTGAGCAAAGACCCCAACGAGAAGCGCGATCACATGGTCCTGCTGGAGTTCGTGACCGCCGCCGGGATCACTCTCGGCATGGACGAGCTGTACAAGTAA' },
    { name: 'Insulin', seq: 'ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGCCGGGAGGCAGAGGACCTGCAGGTGGGGCAGGTGGAGCTGGGCGGGGGCCCTGGTGCAGGCAGCCTGCAGCCCTTGGCCCTGGAGGGGTCCCTGCAGAAGCGTGGCATTGTGGAACAATGCTGTACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAACTAG' },
    { name: 'LacZ Promoter', seq: 'TGAAATGAGCTGTTGACAATTAATCATCGGCTCGTATAATGTGTGGAATTGTGAGCGGATAACAATTTCACACAGGAAACAGCTATGACCATGATTACGGATTCACTGGCCGTCGTTTTACAACGTCGTGACTGGGAAAACCCTGGCGTTACCCAACTTAATCGCCTTGCAGCACATCCCCCTTTCGCCAGCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGCTTTGCCTGGTTTCCGGCACCAGAAGCGGTGCCGGAAAGCTGGCTGGAGTGCGATCTTCCTGAGGCCGATACTGTCGTCGTCCCCTCAAACTGGCAGATGCACGGTTACGATGCGCCCATCTACACCAACGTAACCTATCCCATTACGGTCAATCCGCCGTTTGTTCCCACGGAGAATCCGACGGGTTGTTACTCGCTCACATTTAATGTTGATGAAAGCTGGCTACAGGAAGGCCAGACGCGAATTATTTTTGATGGCGTTAACTCGGCGTTTCATCTGTGGTGCAACGGGCGCTGGGTCGGTTACGGCCAGGACAGTCGTTTGCCGTCTGAATTTGACCTGAGCGCATTTTTACGCGCCGGAGAAAACCGCCTCGCGGTGATGGTGCTGCGTTGGAGTGACGGCAGTTATCTGGAAGATCAGGATATGTGGCGGATGAGCGGCATTTTCCGTGACGTCTCGTTGCTGCATAAACCGACTACACAAATCAGCGATTTCCATGTTGCCACTCGCTTTAATGATGATTTCAGCCGCGCTGTACTGGAGGCTGAAGTTCAGATGTGCGGCGAGTTGCGTGACTACCTACGGGTAACAGTTTCTTTATGGCAGGGTGAAACGCAGGTCGCCAGCGGCACCGCGCCTTTCGGCGGTGAAATTATCGATGAGCGTGGTGGTTATGCCGATCGCGTCACACTACGTCTGAACGTCGAAAACCCGAAACTGTGGAGCGCCGAAATCCCGAATCTCTATCGTGCGGTGGTTGAACTGCACACCGCCGACGGCACGCTGATTGAAGCAGAAGCCTGCGATGTCGGTTTCCGCGAGGTGCGGATTGAAAATGGTCTGCTGCTGCTGAACGGCAAGCCGTTGCTGATTCGAGGCGTTAACCGTCACGAGCATCATCCTCTGCATGGTCAGGTCATGGATGAGCAGACGATGGTGCAGGATATCCTGCTGATGAAGCAGAACAACTTTAACGCCGTGCGCTGTTCGCATTATCCGAACCATCCGCTGTGGTACACGCTGTGCGACCGCTACGGCCTGTATGTGGTGGATGAAGCCAATATTGAAACCCACGGCATGGTGCCAATGAATCGTCTGACCGATGATCCGCGCTGGCTACCGGCGATGAGCGAACGCGTAACGCGAATGGTGCAGCGCGATCGTAATCACCCGAGTGTGATCATCTGGTCGCTGGGGAATGAATCAGGCCACGGCGCTAATCACGACGCGCTGTATCGCTGGATCAAATCTGTCGATCCTTCCCGCCCGGTGCAGTATGAAGGCGGCGGAGCCGACACCACGGCCACCGATATTATTTGCCCGATGTACGCGCGCGTGGATGAAGACCAGCCCTTCCCGGCTGTGCCGAAATGGTCCATCAAAAAATGGCTTTCGCTACCTGGAGAGACGCGCCCGCTGATCCTTTGCGAATACGCCCACGCGATGGGTAACAGTCTTGGCGGTTTCGCTAAATACTGGCAGGCGTTTCGTCAGTATCCCCGTTTACAGGGCGGCTTCGTCTGGGACTGGGTGGATCAGTCGCTGATTAAATATGATGAAAACGGCAACCCGTGGTCGGCTTACGGCGGTGATTTTGGCGATACGCCGAACGATCGCCAGTTCTGTATGAACGGTCTGGTCTTTGCCGACCGCACGCCGCATCCAGCGCTGACGGAAGCAAAACACCAGCAGCAGTTTTTCCAGTTCCGTTTATCCGGGCAAACCATCGAAGTGACCAGCGAATACCTGTTCCGTCATAGCGATAACGAGCTCCTGCACTGGATGGTGGCGCTGGATGGTAAGCCGCTGGCAAGCGGTGAAGTGCCTCTGGATGTCGCTCCACAAGGTAAACAGTTGATTGAACTGCCTGAACTACCGCAGCCGGAGAGCGCCGGGCAACTCTGGCTCACAGTACGCGTAGTGCAACCGAACGCGACCGCATGGTCAGAAGCCGGGCACATCAGCGCCTGGCAGCAGTGGCGTCTGGCGGAAAACCTCAGTGTGACGCTCCCCGCCGCGTCCCACGCCATCCCGCATCTGACCACCAGCGAAATGGATTTTTGCATCGAGCTGGGTAATAAGCGTTGGCAATTTAACCGCCAGTCAGGCTTTCTTTCACAGATGTGGATTGGCGATAAAAAACAACTGCTGACGCCGCTGCGCGATCAGTTCACCCGTGCACCGCTGGATAACGACATTGGCGTAAGTGAAGCGACCCGCATTGACCCTAACGCCTGGGTCGAACGCTGGAAGGCGGCGGGCCATTACCAGGCCGAAGCAGCGTTGTTGCAGTGCACGGCAGATACACTTGCTGATGCGGTGCTGATTACGACCGCTCACGCGTGGCAGCATCAGGGGAAAACCTTATTTATCAGCCGGAAAACCTACCGGATTGATGGTAGTGGTCAAATGGCGATTACCGTTGATGTTGAAGTGGCGAGCGATACACCGCATCCGGCGCGGATTGGCCTGAACTGCCAGCTGGCGCAGGTAGCAGAGCGGGTAAACTGGCTCGGATTAGGGCCGCAAGAAAACTATCCCGACCGCCTTACTGCCGCCTGTTTTGACCGCTGGGATCTGCCATTGTCAGACATGTATACCCCGTACGTCTTCCCGAGCGAAAACGGTCTGCGCTGCGGGACGCGCGAATTGAATTATGGCCCACACCAGTGGCGCGGCGACTTCCAGTTCAACATCAGCCGCTACAGTCAACAGCAACTGATGGAAACCAGCCATCGCCATCTGCTGCACGCGGAAGAAGGCACATGGCTGAATATCGACGGTTTCCATATGGGGATTGGTGGCGACGACTCCTGGAGCCCGTCAGTATCGGCGGAATTCCAGCTGAGCGCCGGTCGCTACCATTACCAGTTGGTCTGGTGTCAAAAATAA' },
    { name: 'Telomere Repeat', seq: 'TTAGGGTTAGGGTTAGGGTTAGGGTTAGGGTTAGGGTTAGGGTTAGGGTTAGGGTTAGGG' },
    { name: 'Palindrome', seq: 'GAATTCGAATTCGAATTCGAATTCGAATTCGAATTC' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">DNA Computer</h1>
              <p className="text-sm text-muted-foreground">Bioinformatics Analysis & Engineering Suite</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* Left Panel: Sequence Editor */}
          <div className="space-y-4">
            <Card className="p-4 border-2 border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Sequence Editor
                </h3>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={handleCopy} className="h-7 w-7">
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setSequenceState(prev => ({ ...prev, sequence: '' }))}
                    className="h-7 w-7"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Textarea
                value={sequence}
                onChange={(e) => handleSequenceChange(e.target.value)}
                placeholder="Enter DNA sequence (A, T, G, C only)"
                className="font-mono text-sm min-h-[120px] resize-none"
              />
              
              {sequence && !isValidSequence(sequence) && (
                <p className="text-destructive text-xs mt-1">Invalid characters detected</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Length</p>
                  <p className="font-bold">{sequence.length} bp</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">GC Content</p>
                  <p className="font-bold text-cyan-400">{gcContent.toFixed(1)}%</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Melting Temp</p>
                  <p className="font-bold text-amber-400">{meltingTemp.toFixed(1)}°C</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Complexity</p>
                  <p className="font-bold text-purple-400">{(complexity * 100).toFixed(0)}%</p>
                </div>
              </div>
            </Card>

            {/* Presets */}
            <Card className="p-4">
              <h4 className="text-sm font-medium mb-3">Load Example Sequence</h4>
              <div className="flex flex-wrap gap-2">
                {presetSequences.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setSequenceState(prev => ({ ...prev, sequence: preset.seq, name: preset.name }))}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </Card>

            {/* DNA Visualization */}
            {sequence.length > 0 && sequence.length <= 50 && (
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3">Double Helix</h4>
                <div className="bg-muted/30 rounded p-2 overflow-x-auto">
                  <DNAStrandVisualizer sequence={sequence} showComplement showLabels />
                </div>
              </Card>
            )}

            {/* Sedenion State */}
            {sequence.length > 0 && (
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Quantum State (16D Sedenion)
                </h4>
                <SedenionVisualizer components={sedenion} size="md" animated />
              </Card>
            )}
          </div>

          {/* Right Panel: Tool Categories */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="analysis" className="gap-2">
                  <Microscope className="w-4 h-4" />
                  <span className="hidden sm:inline">Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="engineering" className="gap-2">
                  <FlaskConical className="w-4 h-4" />
                  <span className="hidden sm:inline">Engineering</span>
                </TabsTrigger>
                <TabsTrigger value="expression" className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span className="hidden sm:inline">Expression</span>
                </TabsTrigger>
                <TabsTrigger value="simulation" className="gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Simulation</span>
                </TabsTrigger>
              </TabsList>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-4">
                <AnalysisPanel 
                  sequence={sequence} 
                  orfs={orfs}
                  restrictionSites={restrictionSites}
                  gcContent={gcContent}
                  complexity={complexity}
                />
              </TabsContent>

              {/* Engineering Tab */}
              <TabsContent value="engineering" className="space-y-4">
                <EngineeringPanel 
                  sequence={sequence}
                  crisprTargets={crisprTargets}
                  primers={primers}
                  restrictionSites={restrictionSites}
                />
              </TabsContent>

              {/* Expression Tab */}
              <TabsContent value="expression" className="space-y-4">
                <ExpressionPanel 
                  sequence={sequence}
                  mRNA={mRNA}
                  protein={protein}
                />
              </TabsContent>

              {/* Simulation Tab */}
              <TabsContent value="simulation" className="space-y-4">
                <SimulationPanel sequence={sequence} primers={primers} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= Analysis Panel =============
interface AnalysisPanelProps {
  sequence: string;
  orfs: ReturnType<typeof findORFs>;
  restrictionSites: ReturnType<typeof findRestrictionSites>;
  gcContent: number;
  complexity: number;
}

const AnalysisPanel = ({ sequence, orfs, restrictionSites, gcContent, complexity }: AnalysisPanelProps) => {
  const proteinSeq = useMemo(() => {
    const mRNA = transcribeDNA(sequence);
    return translateRNA(mRNA);
  }, [sequence]);

  const hydrophobicityProfile = useMemo(() => {
    if (proteinSeq.length < 7) return [];
    return calculateHydrophobicityProfile(proteinSeq);
  }, [proteinSeq]);

  const nucleotideCounts = useMemo(() => {
    const counts = { A: 0, T: 0, G: 0, C: 0 };
    [...sequence.toUpperCase()].forEach(n => {
      if (counts[n as keyof typeof counts] !== undefined) {
        counts[n as keyof typeof counts]++;
      }
    });
    return counts;
  }, [sequence]);

  return (
    <div className="space-y-4">
      {/* Nucleotide Composition */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Dna className="w-4 h-4 text-emerald-400" />
          Nucleotide Composition
        </h4>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(['A', 'T', 'G', 'C'] as const).map(nuc => (
            <div 
              key={nuc} 
              className="text-center p-3 rounded-lg"
              style={{ backgroundColor: `${NUCLEOTIDE_COLORS[nuc]}20` }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: NUCLEOTIDE_COLORS[nuc] }}
              >
                {nuc}
              </div>
              <div className="text-sm">{nucleotideCounts[nuc]}</div>
              <div className="text-xs text-muted-foreground">
                {sequence.length > 0 ? ((nucleotideCounts[nuc] / sequence.length) * 100).toFixed(1) : 0}%
              </div>
            </div>
          ))}
        </div>
        
        {/* Composition Bar */}
        <div className="h-4 rounded-full overflow-hidden flex">
          {(['A', 'T', 'G', 'C'] as const).map(nuc => (
            <div
              key={nuc}
              style={{ 
                width: `${sequence.length > 0 ? (nucleotideCounts[nuc] / sequence.length) * 100 : 25}%`,
                backgroundColor: NUCLEOTIDE_COLORS[nuc]
              }}
            />
          ))}
        </div>
      </Card>

      {/* Restriction Map */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Scissors className="w-4 h-4 text-red-400" />
          Restriction Sites ({restrictionSites.length})
        </h4>
        {restrictionSites.length > 0 ? (
          <>
            <RestrictionMap 
              sequence={sequence} 
              sites={restrictionSites.map(s => ({ 
                enzyme: s.enzyme.name, 
                position: s.position, 
                recognition: s.enzyme.recognition 
              }))} 
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {restrictionSites.map((site, i) => (
                <Badge key={i} variant="outline" className="font-mono">
                  {site.enzyme.name} @ {site.position}
                </Badge>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No restriction sites found</p>
        )}
      </Card>

      {/* ORFs */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          Open Reading Frames ({orfs.length})
        </h4>
        {orfs.length > 0 ? (
          <ORFViewer sequence={sequence} orfs={orfs} />
        ) : (
          <p className="text-muted-foreground text-sm">No ORFs detected (requires ATG start codon)</p>
        )}
      </Card>

      {/* Hydrophobicity */}
      {hydrophobicityProfile.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-3">Hydrophobicity Profile (Kyte-Doolittle)</h4>
          <HydrophobicityPlot profile={hydrophobicityProfile} proteinSequence={proteinSeq} />
        </Card>
      )}
    </div>
  );
};

// ============= Engineering Panel =============
interface EngineeringPanelProps {
  sequence: string;
  crisprTargets: ReturnType<typeof findCRISPRTargets>;
  primers: ReturnType<typeof designPrimers> | null;
  restrictionSites: ReturnType<typeof findRestrictionSites>;
}

const EngineeringPanel = ({ sequence, crisprTargets, primers, restrictionSites }: EngineeringPanelProps) => {
  const [selectedCrisprTarget, setSelectedCrisprTarget] = useState<number | null>(null);
  const [insertSequence, setInsertSequence] = useState('AAAA');
  const [editedSequence, setEditedSequence] = useState('');

  const handleCrisprEdit = () => {
    if (selectedCrisprTarget !== null && crisprTargets[selectedCrisprTarget]) {
      const target = crisprTargets[selectedCrisprTarget];
      const cutPosition = target.position + 17;
      const edited = sequence.slice(0, cutPosition) + insertSequence + sequence.slice(cutPosition);
      setEditedSequence(edited);
    }
  };

  return (
    <div className="space-y-4">
      {/* CRISPR Editor */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          CRISPR-Cas9 Targets ({crisprTargets.length} NGG sites)
        </h4>
        
        {crisprTargets.length > 0 ? (
          <>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {crisprTargets.map((target, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedCrisprTarget === i 
                        ? 'bg-yellow-500/20 border border-yellow-500' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedCrisprTarget(i)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">{target.sequence}_{target.pam}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">@{target.position}</Badge>
                        <Badge variant={target.score > 0.8 ? 'default' : 'destructive'}>
                          {(target.score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {selectedCrisprTarget !== null && (
              <div className="mt-4 space-y-3">
                <Separator />
                <div className="flex gap-2">
                  <Input
                    value={insertSequence}
                    onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setInsertSequence(e.target.value.toUpperCase())}
                    placeholder="Insert sequence"
                    className="font-mono flex-1"
                  />
                  <Button onClick={handleCrisprEdit}>
                    Simulate Edit
                  </Button>
                </div>
                
                {editedSequence && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Edited sequence (+{insertSequence.length}bp):</p>
                    <p className="font-mono text-xs bg-green-500/20 p-2 rounded text-green-400 break-all">
                      {editedSequence.slice(0, 100)}...
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No NGG PAM sites found in sequence</p>
        )}
      </Card>

      {/* Primer Design */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          PCR Primer Design
        </h4>
        
        {primers && primers.forward && primers.reverse ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Forward Primer (5'→3')</p>
              <p className="font-mono text-sm bg-green-500/20 p-2 rounded text-green-400">
                {primers.forward.sequence}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tm: {primers.forward.tm?.toFixed(1)}°C | GC: {primers.forward.gcContent?.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reverse Primer (5'→3')</p>
              <p className="font-mono text-sm bg-red-500/20 p-2 rounded text-red-400">
                {primers.reverse.sequence}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tm: {primers.reverse.tm?.toFixed(1)}°C | GC: {primers.reverse.gcContent?.toFixed(1)}%
              </p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Sequence must be ≥40bp for primer design
          </p>
        )}
      </Card>

      {/* Cloning Sites */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Scissors className="w-4 h-4 text-purple-400" />
          Available Cloning Sites
        </h4>
        <div className="space-y-2">
          {restrictionSites.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(restrictionSites.map(s => s.enzyme.name))).map(enzyme => {
                const count = restrictionSites.filter(s => s.enzyme.name === enzyme).length;
                return (
                  <Badge key={enzyme} variant={count === 1 ? 'default' : 'outline'}>
                    {enzyme} ({count}x)
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No common restriction sites</p>
          )}
          <p className="text-xs text-muted-foreground">
            Single-cutter enzymes (1x) are ideal for cloning
          </p>
        </div>
      </Card>
    </div>
  );
};

// ============= Expression Panel =============
interface ExpressionPanelProps {
  sequence: string;
  mRNA: string;
  protein: string;
}

const ExpressionPanel = ({ sequence, mRNA, protein }: ExpressionPanelProps) => {
  const codons = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i + 2 < mRNA.length; i += 3) {
      result.push(mRNA.slice(i, i + 3));
    }
    return result;
  }, [mRNA]);

  return (
    <div className="space-y-4">
      {/* Central Dogma Flow */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-blue-400" />
          Central Dogma: DNA → RNA → Protein
        </h4>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">DNA</Badge>
              <span className="text-xs text-muted-foreground">{sequence.length} bp</span>
            </div>
            <p className="font-mono text-xs bg-muted/30 p-2 rounded break-all max-h-20 overflow-y-auto">
              5'-{sequence || '—'}-3'
            </p>
          </div>
          
          <div className="flex justify-center">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">↓ Transcription</Badge>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400">mRNA</Badge>
              <span className="text-xs text-muted-foreground">{mRNA.length} nt</span>
            </div>
            <p className="font-mono text-xs bg-cyan-500/10 p-2 rounded text-cyan-400 break-all max-h-20 overflow-y-auto">
              5'-{mRNA || '—'}-3'
            </p>
          </div>
          
          <div className="flex justify-center">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">↓ Translation</Badge>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs text-amber-400 border-amber-400">Protein</Badge>
              <span className="text-xs text-muted-foreground">{protein.length} aa</span>
            </div>
            <p className="font-mono text-sm bg-amber-500/10 p-2 rounded text-amber-400 break-all">
              {protein || '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* Codon Table */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3">Codon Usage</h4>
        <div className="flex flex-wrap gap-1">
          {codons.slice(0, 30).map((codon, i) => {
            const dnaCodon = codon.replace(/U/g, 'T');
            const info = GENETIC_CODE[dnaCodon];
            const isStart = dnaCodon === 'ATG';
            const isStop = ['TAA', 'TAG', 'TGA'].includes(dnaCodon);
            
            return (
              <div 
                key={i} 
                className={`flex flex-col items-center p-1.5 rounded text-xs ${
                  isStart ? 'bg-green-500/20 border border-green-500/50' :
                  isStop ? 'bg-red-500/20 border border-red-500/50' :
                  'bg-muted/50'
                }`}
              >
                <span className="font-mono text-cyan-400">{codon}</span>
                <span 
                  className="font-bold"
                  style={{ color: PROPERTY_COLORS[info?.property || 'hydrophobic'] }}
                >
                  {info?.abbrev || '?'}
                </span>
              </div>
            );
          })}
          {codons.length > 30 && (
            <div className="flex items-center text-muted-foreground text-xs px-2">
              +{codons.length - 30} more
            </div>
          )}
        </div>
      </Card>

      {/* Information Content */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3">Information Content</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">DNA</p>
            <p className="text-xl font-bold">{(sequence.length * 2).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">bits</p>
          </div>
          <div className="text-center p-3 bg-cyan-500/10 rounded">
            <p className="text-xs text-muted-foreground">mRNA</p>
            <p className="text-xl font-bold text-cyan-400">{(mRNA.length * 2).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">bits</p>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded">
            <p className="text-xs text-muted-foreground">Protein</p>
            <p className="text-xl font-bold text-amber-400">{(protein.length * Math.log2(20)).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">bits</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============= Simulation Panel =============
interface SimulationPanelProps {
  sequence: string;
  primers: ReturnType<typeof designPrimers> | null;
}

const SimulationPanel = ({ sequence, primers }: SimulationPanelProps) => {
  const [pcrCycles, setPcrCycles] = useState([25]);
  
  const pcrResult = useMemo(() => {
    if (primers?.forward?.sequence && primers?.reverse?.sequence) {
      return simulatePCR(sequence, primers.forward.sequence, primers.reverse.sequence, pcrCycles[0]);
    }
    return null;
  }, [sequence, primers, pcrCycles]);

  const gelBands = useMemo(() => {
    if (!pcrResult || !pcrResult.product) return [];
    return [{ length: pcrResult.length, intensity: 1, label: 'PCR Product' }];
  }, [pcrResult]);

  return (
    <div className="space-y-4">
      {/* PCR Simulation */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-green-400" />
          PCR Amplification
        </h4>
        
        {primers?.forward && primers?.reverse ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-2">
                Cycles: {pcrCycles[0]}
              </label>
              <Slider 
                value={pcrCycles} 
                onValueChange={setPcrCycles} 
                min={10} 
                max={40} 
                step={1}
              />
            </div>

            {pcrResult && pcrResult.product && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">Product</p>
                    <p className="font-bold">{pcrResult.length} bp</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">Copies</p>
                    <p className="font-bold text-primary">{pcrResult.copies.toExponential(1)}</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">Yield</p>
                    <p className="font-bold text-amber-400">{pcrResult.yield}</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">GC</p>
                    <p className="font-bold text-cyan-400">{calculateGCContent(pcrResult.product).toFixed(1)}%</p>
                  </div>
                </div>

                <GelElectrophoresis bands={gelBands} />
              </>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Primers required for PCR simulation (sequence must be ≥40bp)
          </p>
        )}
      </Card>

      {/* Restriction Digest Simulation */}
      <RestrictionDigestSimulation sequence={sequence} />
    </div>
  );
};

// Sub-component for restriction digest
const RestrictionDigestSimulation = ({ sequence }: { sequence: string }) => {
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
      label: `${f.length}bp`
    })).sort((a, b) => b.length - a.length),
  [fragments]);

  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Scissors className="w-4 h-4 text-red-400" />
        Restriction Digest
      </h4>
      
      {restrictionSites.length > 0 ? (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Digesting with: {Array.from(new Set(restrictionSites.map(s => s.enzyme.name))).join(', ')}
          </p>
          <div className="flex flex-wrap gap-2">
            {fragments.map((f, i) => (
              <Badge key={i} variant="outline">
                Fragment {i + 1}: {f.length} bp
              </Badge>
            ))}
          </div>
          <GelElectrophoresis bands={gelBands} />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No restriction sites to digest
        </p>
      )}
    </Card>
  );
};

export default DNAComputer;
