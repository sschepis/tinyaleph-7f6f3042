import { useState, useEffect, useMemo, useCallback } from 'react';
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
  strandToPrimes,
  strandToSedenion,
  getComplement,
  calculateGCContent,
  calculateMeltingTemp,
  calculateHybridization,
  generateRandomSequence,
  isValidSequence,
  codonToPrimeProduct,
  translateSequence,
} from '@/lib/dna-computer/encoding';
import {
  NUCLEOTIDE_COLORS,
  GENETIC_CODE,
  PROPERTY_COLORS,
  DNA_ALPHABET,
} from '@/lib/dna-computer/types';

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

// Demo 2: Codon Table
const CodonTableDemo = () => {
  const [selectedCodon, setSelectedCodon] = useState<string | null>('ATG');
  
  const nucleotides = ['T', 'C', 'A', 'G'];
  
  const getCodon = (first: string, second: string, third: string) => first + second + third;

  return (
    <div className="space-y-6">
      {/* Codon Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1"></th>
              <th className="p-1"></th>
              {nucleotides.map(n3 => (
                <th key={n3} className="p-1 text-center" style={{ color: NUCLEOTIDE_COLORS[n3] }}>
                  {n3}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nucleotides.map((n1, i1) => (
              nucleotides.map((n2, i2) => (
                <tr key={`${n1}-${n2}`}>
                  {i2 === 0 && (
                    <td 
                      rowSpan={4} 
                      className="p-2 text-center font-bold border-r"
                      style={{ color: NUCLEOTIDE_COLORS[n1] }}
                    >
                      {n1}
                    </td>
                  )}
                  <td 
                    className="p-1 text-center font-medium"
                    style={{ color: NUCLEOTIDE_COLORS[n2] }}
                  >
                    {n2}
                  </td>
                  {nucleotides.map(n3 => {
                    const codon = getCodon(n1, n2, n3);
                    const info = GENETIC_CODE[codon];
                    const isSelected = selectedCodon === codon;
                    
                    return (
                      <td 
                        key={n3}
                        className={`
                          p-1 text-center cursor-pointer transition-all border
                          ${isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}
                        `}
                        style={{ 
                          backgroundColor: info ? PROPERTY_COLORS[info.property] + '20' : undefined,
                          borderColor: info ? PROPERTY_COLORS[info.property] + '40' : 'transparent',
                        }}
                        onClick={() => setSelectedCodon(codon)}
                      >
                        <div className="font-mono text-[10px] text-muted-foreground">{codon}</div>
                        <div className="font-medium" style={{ color: PROPERTY_COLORS[info?.property || 'hydrophobic'] }}>
                          {info?.abbrev || '?'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Codon Details */}
      {selectedCodon && GENETIC_CODE[selectedCodon] && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Codon</p>
              <p className="text-2xl font-mono font-bold">{selectedCodon}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Prime Product</p>
              <p className="text-2xl font-mono font-bold text-primary">
                {codonToPrimeProduct(selectedCodon)}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {strandToPrimes(selectedCodon).join(' × ')}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground">Amino Acid</p>
              <p className="text-lg font-bold">{GENETIC_CODE[selectedCodon].aminoAcid}</p>
              <Badge style={{ backgroundColor: PROPERTY_COLORS[GENETIC_CODE[selectedCodon].property] }}>
                {GENETIC_CODE[selectedCodon].property}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sedenion</p>
              <SedenionVisualizer components={strandToSedenion(selectedCodon)} size="sm" />
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PROPERTY_COLORS).map(([prop, color]) => (
          <Badge key={prop} variant="outline" style={{ borderColor: color, color }}>
            {prop}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Demo 3: Hybridization Simulator
const HybridizationDemo = () => {
  const [probe, setProbe] = useState('ATGCGATCGA');
  const [target, setTarget] = useState('TACGCTAGCT');
  const [temperature, setTemperature] = useState([37]);

  const hybridization = useMemo(() => 
    calculateHybridization(probe, target), 
    [probe, target]
  );

  const probeSedenion = useMemo(() => strandToSedenion(probe), [probe]);
  const targetSedenion = useMemo(() => strandToSedenion(target), [target]);

  const generateComplement = () => {
    setTarget(getComplement(probe));
  };

  const generateRandom = () => {
    setTarget(generateRandomSequence(probe.length));
  };

  // Temperature affects binding stringency
  const effectiveCoherence = useMemo(() => {
    const tempFactor = 1 - Math.max(0, (temperature[0] - 50)) / 100;
    return hybridization.coherence * tempFactor;
  }, [hybridization.coherence, temperature]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Probe Strand</label>
          <Input
            value={probe}
            onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setProbe(e.target.value.toUpperCase())}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Target Strand</label>
          <Input
            value={target}
            onChange={(e) => isValidSequence(e.target.value.toUpperCase()) && setTarget(e.target.value.toUpperCase())}
            className="font-mono"
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={generateComplement}>
              Perfect Match
            </Button>
            <Button size="sm" variant="outline" onClick={generateRandom}>
              Random
            </Button>
          </div>
        </div>
      </div>

      {/* Temperature Control */}
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
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Higher temperature reduces binding stringency
        </p>
      </div>

      {/* Base Pair Visualization */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex justify-center gap-1 font-mono text-sm mb-2">
          <span className="text-muted-foreground">5'</span>
          {[...probe].map((nuc, i) => (
            <span key={i} style={{ color: NUCLEOTIDE_COLORS[nuc] }}>{nuc}</span>
          ))}
          <span className="text-muted-foreground">3'</span>
        </div>
        <div className="flex justify-center gap-1 text-xs text-muted-foreground mb-2">
          <span className="w-4"></span>
          {[...probe].map((nuc, i) => {
            const complement = getComplement(nuc);
            const targetNuc = target[i];
            const isMatch = complement === targetNuc;
            return (
              <span key={i} className={isMatch ? 'text-green-400' : 'text-red-400'}>
                {isMatch ? '|' : '×'}
              </span>
            );
          })}
        </div>
        <div className="flex justify-center gap-1 font-mono text-sm">
          <span className="text-muted-foreground">3'</span>
          {[...target].map((nuc, i) => (
            <span key={i} style={{ color: NUCLEOTIDE_COLORS[nuc] }}>{nuc}</span>
          ))}
          <span className="text-muted-foreground">5'</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Matches</p>
          <p className="text-2xl font-bold text-green-400">{hybridization.matches}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Mismatches</p>
          <p className="text-2xl font-bold text-red-400">{hybridization.mismatches}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Coherence</p>
          <p className="text-2xl font-bold text-cyan-400">{effectiveCoherence.toFixed(3)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">ΔG (kcal/mol)</p>
          <p className="text-2xl font-bold text-purple-400">{hybridization.bindingEnergy.toFixed(1)}</p>
        </Card>
      </div>

      {/* Sedenion Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Probe Sedenion</p>
          <SedenionVisualizer components={probeSedenion} size="md" />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Target Sedenion</p>
          <SedenionVisualizer components={targetSedenion} size="md" />
        </div>
      </div>
    </div>
  );
};

// Demo 4: Hamiltonian Path Solver
const HamiltonianPathDemo = () => {
  const [vertices, setVertices] = useState([
    { id: 'A', sequence: 'ATGC', x: 150, y: 50 },
    { id: 'B', sequence: 'GCTA', x: 50, y: 150 },
    { id: 'C', sequence: 'TAGC', x: 250, y: 150 },
    { id: 'D', sequence: 'CGAT', x: 100, y: 250 },
    { id: 'E', sequence: 'GATC', x: 200, y: 250 },
  ]);
  
  const edges = [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'C', to: 'D' },
    { from: 'C', to: 'E' },
    { from: 'D', to: 'E' },
  ];

  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [solutionPath, setSolutionPath] = useState<string[]>([]);

  const steps = [
    { name: 'Encode Vertices', description: 'Assign DNA sequences to graph vertices' },
    { name: 'Generate Linkers', description: 'Create edge linkers from vertex sequences' },
    { name: 'Mix Pool', description: 'Combine all strands in reaction vessel' },
    { name: 'Anneal', description: 'Allow complementary strands to hybridize' },
    { name: 'Ligate', description: 'Join adjacent strands with DNA ligase' },
    { name: 'PCR Amplify', description: 'Amplify paths starting at A, ending at E' },
    { name: 'Gel Separation', description: 'Filter by path length (5 vertices)' },
    { name: 'Extract Solution', description: 'Read the Hamiltonian path' },
  ];

  // Find Hamiltonian path (simple DFS for demo)
  const findPath = useCallback(() => {
    const visited = new Set<string>();
    const path: string[] = [];
    
    const dfs = (node: string): boolean => {
      visited.add(node);
      path.push(node);
      
      if (path.length === vertices.length) {
        return true;
      }
      
      const neighbors = edges
        .filter(e => e.from === node && !visited.has(e.to))
        .map(e => e.to);
      
      for (const next of neighbors) {
        if (dfs(next)) return true;
      }
      
      path.pop();
      visited.delete(node);
      return false;
    };
    
    dfs('A');
    return path;
  }, [vertices.length]);

  const runSimulation = () => {
    setRunning(true);
    setStep(0);
    setSolutionPath([]);
    
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setRunning(false);
          setSolutionPath(findPath());
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Generate linker for edge
  const getLinker = (fromId: string, toId: string) => {
    const fromVertex = vertices.find(v => v.id === fromId);
    const toVertex = vertices.find(v => v.id === toId);
    if (!fromVertex || !toVertex) return '';
    
    const lastHalf = fromVertex.sequence.slice(-2);
    const firstHalf = toVertex.sequence.slice(0, 2);
    return getComplement(lastHalf) + getComplement(firstHalf);
  };

  return (
    <div className="space-y-6">
      {/* Graph Visualization */}
      <div className="bg-muted/30 rounded-lg p-4">
        <svg width={300} height={300} className="mx-auto">
          {/* Edges */}
          {edges.map(edge => {
            const from = vertices.find(v => v.id === edge.from)!;
            const to = vertices.find(v => v.id === edge.to)!;
            const isInSolution = solutionPath.length > 0 && 
              solutionPath.findIndex(id => id === edge.from) === solutionPath.findIndex(id => id === edge.to) - 1;
            
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isInSolution ? '#22c55e' : 'hsl(var(--border))'}
                strokeWidth={isInSolution ? 3 : 2}
              />
            );
          })}
          
          {/* Vertices */}
          {vertices.map((v, i) => {
            const isInSolution = solutionPath.includes(v.id);
            const solutionIndex = solutionPath.indexOf(v.id);
            
            return (
              <g key={v.id}>
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={25}
                  fill={isInSolution ? '#22c55e20' : 'hsl(var(--muted))'}
                  stroke={isInSolution ? '#22c55e' : 'hsl(var(--border))'}
                  strokeWidth={2}
                />
                <text
                  x={v.x}
                  y={v.y - 5}
                  textAnchor="middle"
                  className="fill-foreground font-bold text-sm"
                >
                  {v.id}
                </text>
                <text
                  x={v.x}
                  y={v.y + 10}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[8px] font-mono"
                >
                  {v.sequence}
                </text>
                {solutionIndex >= 0 && (
                  <circle
                    cx={v.x + 20}
                    cy={v.y - 20}
                    r={10}
                    fill="#22c55e"
                  >
                    <text
                      x={v.x + 20}
                      y={v.y - 16}
                      textAnchor="middle"
                      className="fill-white text-xs font-bold"
                    >
                      {solutionIndex + 1}
                    </text>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <Button onClick={runSimulation} disabled={running}>
          {running ? 'Running...' : 'Start DNA Computation'}
        </Button>
        <div className="flex-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-2 gap-2">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`
              p-3 rounded border transition-all
              ${i < step ? 'bg-green-500/10 border-green-500/30' : ''}
              ${i === step ? 'bg-primary/10 border-primary ring-2 ring-primary/50' : ''}
              ${i > step ? 'opacity-50' : ''}
            `}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="font-medium text-sm">{s.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-7">{s.description}</p>
          </div>
        ))}
      </div>

      {/* Solution */}
      {solutionPath.length > 0 && (
        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <h4 className="font-bold text-green-400 mb-2">✓ Hamiltonian Path Found!</h4>
          <p className="text-2xl font-mono">
            {solutionPath.join(' → ')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            DNA sequence: {solutionPath.map(id => vertices.find(v => v.id === id)?.sequence).join('-')}
          </p>
        </Card>
      )}

      {/* Gel Electrophoresis */}
      {step >= 6 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Gel Electrophoresis Results</h4>
          <GelElectrophoresis
            bands={[
              { length: 100, label: '2-path', intensity: 0.4 },
              { length: 150, label: '3-path', intensity: 0.6 },
              { length: 200, label: '4-path', intensity: 0.5 },
              { length: 250, label: '5-path', intensity: 0.9 },
            ]}
            maxLength={300}
            highlightIndex={3}
          />
        </div>
      )}
    </div>
  );
};

// Demo 5: Strand Pool Reactor
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
        frequency: 0.5 + gcContent / 200, // Higher GC = higher frequency
        x: 150 + (Math.random() - 0.5) * 200,
        y: 150 + (Math.random() - 0.5) * 200,
      };
    });
    setStrands(newStrands);
  }, [poolSize]);

  // Kuramoto dynamics
  useEffect(() => {
    if (!running) return;
    
    const coupling = (100 - temperature[0]) / 50; // Lower temp = higher coupling
    
    const interval = setInterval(() => {
      setStrands(prev => {
        const newStrands = prev.map((strand, i) => {
          // Kuramoto phase update
          let dPhase = strand.frequency * 0.05;
          
          prev.forEach((other, j) => {
            if (i !== j) {
              // Coupling based on sequence similarity
              const hybridization = calculateHybridization(strand.sequence, other.sequence);
              const k = coupling * hybridization.coherence * 0.1;
              dPhase += k * Math.sin(other.phase - strand.phase);
            }
          });
          
          const newPhase = (strand.phase + dPhase) % (Math.PI * 2);
          
          // Position update based on phase
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

        // Calculate order parameter
        let sumCos = 0, sumSin = 0;
        newStrands.forEach(s => {
          sumCos += Math.cos(s.phase);
          sumSin += Math.sin(s.phase);
        });
        const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / newStrands.length;
        setOrderParameter(r);
        
        // Entropy (rough approximation based on phase distribution)
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
      {/* Controls */}
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

      {/* Reactor Visualization */}
      <div className="bg-muted/30 rounded-lg p-4">
        <svg width={300} height={300} className="mx-auto overflow-visible">
          {/* Vessel */}
          <circle
            cx={150}
            cy={150}
            r={140}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          
          {/* Order parameter circle */}
          <circle
            cx={150}
            cy={150}
            r={100 * orderParameter}
            fill="hsl(var(--primary))"
            opacity={0.1}
          />
          
          {/* Strands */}
          {strands.map((strand, i) => {
            const hue = (strand.phase / (Math.PI * 2)) * 360;
            const gcContent = calculateGCContent(strand.sequence);
            
            return (
              <g key={strand.id}>
                {/* Connection to center based on coherence */}
                <line
                  x1={150}
                  y1={150}
                  x2={strand.x}
                  y2={strand.y}
                  stroke={`hsla(${hue}, 70%, 50%, 0.1)`}
                  strokeWidth={1}
                />
                {/* Strand dot */}
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
          
          {/* Center point */}
          <circle
            cx={150}
            cy={150}
            r={5}
            fill="hsl(var(--accent))"
            style={{ filter: 'drop-shadow(0 0 8px hsl(var(--accent)))' }}
          />
        </svg>
      </div>

      {/* Metrics */}
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

      {/* Phase Distribution */}
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
    description: 'Map DNA sequences to prime numbers and 16-dimensional sedenion states. See how the Watson-Crick base pairs (A-T, G-C) correspond to prime factors, and watch the resulting hypercomplex state evolve.',
    concepts: ['Prime Encoding', 'Sedenion States', 'GC Content', 'Melting Temperature'],
    code: `import { Sedenion, primes } from '@aleph-ai/tinyaleph';

// DNA nucleotide prime encoding
const DNA_PRIMES = { A: 2, T: 3, G: 5, C: 7 };

function strandToPrimes(sequence) {
  return [...sequence].map(n => DNA_PRIMES[n]);
}

function strandToSedenion(sequence) {
  const p = strandToPrimes(sequence);
  const sed = Sedenion.zero();
  
  p.forEach((prime, i) => {
    const idx = (prime * (i + 1)) % 16;
    const phase = (i * Math.PI * 2) / p.length;
    sed.c[idx] += Math.cos(phase) / Math.sqrt(p.length);
    sed.c[(idx + 8) % 16] += Math.sin(phase) / Math.sqrt(p.length);
  });
  
  return sed.normalize();
}

const dna = 'ATGCGATCGA';
const state = strandToSedenion(dna);
console.log('Sedenion state:', state.c);`,
  },
  {
    id: 'codon-table',
    number: '2',
    title: 'Codon Table & Translation',
    subtitle: 'Triplets → Amino Acids',
    description: 'Explore the 64-codon genetic code table. Each triplet of nucleotides encodes an amino acid with a unique prime product signature. See how codons map to sedenion subspaces based on their chemical properties.',
    concepts: ['Genetic Code', 'Prime Products', 'Amino Acids', 'Degeneracy'],
    code: `// Codon prime product calculation
function codonToPrimeProduct(codon) {
  const primes = { A: 2, T: 3, G: 5, C: 7 };
  return [...codon].reduce((prod, n) => prod * primes[n], 1);
}

// Examples
console.log('ATG (Met/Start):', codonToPrimeProduct('ATG')); // 2×3×5 = 30
console.log('TAA (Stop):', codonToPrimeProduct('TAA'));       // 3×2×2 = 12
console.log('GGG (Gly):', codonToPrimeProduct('GGG'));       // 5×5×5 = 125

// Translation
function translate(sequence) {
  const result = [];
  for (let i = 0; i + 2 < sequence.length; i += 3) {
    const codon = sequence.slice(i, i + 3);
    const aa = GENETIC_CODE[codon];
    if (aa.property === 'stop') break;
    result.push(aa.abbrev);
  }
  return result.join('-');
}`,
  },
  {
    id: 'hybridization',
    number: '3',
    title: 'Hybridization Simulator',
    subtitle: 'Watson-Crick Coherence',
    description: 'Simulate DNA hybridization as sedenion coherence. Perfect Watson-Crick complements have maximum coherence, while mismatches reduce binding affinity. Temperature affects stringency.',
    concepts: ['Base Pairing', 'Coherence', 'Binding Energy', 'Stringency'],
    code: `import { Sedenion } from '@aleph-ai/tinyaleph';

function calculateHybridization(strand1, strand2) {
  const complement = s => [...s].map(n => 
    ({ A: 'T', T: 'A', G: 'C', C: 'G' })[n]
  ).join('');
  
  const comp1 = complement(strand1);
  const sed1 = strandToSedenion(strand1);
  const sed2 = strandToSedenion(strand2);
  
  // Count matches
  let matches = 0, mismatches = 0;
  for (let i = 0; i < Math.min(comp1.length, strand2.length); i++) {
    if (comp1[i] === strand2[i]) matches++;
    else mismatches++;
  }
  
  // Coherence = dot product of sedenion states
  const coherence = sed1.dot(sed2);
  
  return { matches, mismatches, coherence };
}

const probe = 'ATGCGATCGA';
const target = 'TACGCTAGCT'; // Perfect complement
console.log(calculateHybridization(probe, target));`,
  },
  {
    id: 'hamiltonian-path',
    number: '4',
    title: 'Hamiltonian Path Solver',
    subtitle: "Adleman's DNA Computer",
    description: 'Visualize the DNA computing algorithm that solved the Hamiltonian path problem. Graph vertices are encoded as DNA strands, edges as linker oligos, and the solution emerges through molecular operations.',
    concepts: ['NP-Complete', 'Molecular Computing', 'Gel Electrophoresis', 'PCR'],
    code: `// Adleman's 1994 DNA computing algorithm
// Encode graph: vertices → DNA strands, edges → linkers

const vertices = {
  A: 'ATGC', B: 'GCTA', C: 'TAGC', D: 'CGAT', E: 'GATC'
};

const edges = [
  ['A', 'B'], ['A', 'C'], ['B', 'D'], 
  ['C', 'D'], ['C', 'E'], ['D', 'E']
];

// Edge linker = complement of last half of source + 
//               complement of first half of target
function getLinker(from, to) {
  const fromSeq = vertices[from];
  const toSeq = vertices[to];
  const comp = s => [...s].map(n => 
    ({ A: 'T', T: 'A', G: 'C', C: 'G' })[n]
  ).join('');
  
  return comp(fromSeq.slice(-2)) + comp(toSeq.slice(0, 2));
}

// DNA computation steps:
// 1. Mix all vertex strands + edge linkers
// 2. Anneal (hybridization)
// 3. Ligate (DNA ligase joins adjacent strands)
// 4. PCR amplify paths starting at A, ending at E
// 5. Gel electrophoresis: select length = 5 vertices
// 6. Sequence remaining strand = solution`,
  },
  {
    id: 'strand-pool',
    number: '5',
    title: 'Strand Pool Reactor',
    subtitle: 'Kuramoto Meets Molecules',
    description: 'Model parallel DNA reactions as a Kuramoto oscillator network. Each strand is an oscillator with phase representing hybridization state. Watch solutions crystallize as the pool synchronizes.',
    concepts: ['Kuramoto Model', 'Order Parameter', 'Phase Dynamics', 'Self-Organization'],
    code: `import { KuramotoNetwork } from '@aleph-ai/tinyaleph';

// Model DNA strand pool as oscillator network
class StrandPool extends KuramotoNetwork {
  constructor(strands) {
    // Coupling matrix from hybridization affinity
    const coupling = strands.map((s1, i) => 
      strands.map((s2, j) => 
        i === j ? 0 : calculateHybridization(s1, s2).coherence
      )
    );
    
    // Natural frequency from GC content (affects melting temp)
    const frequencies = strands.map(s => {
      const gc = [...s].filter(n => n === 'G' || n === 'C').length;
      return 0.5 + gc / (2 * s.length);
    });
    
    super({ frequencies, coupling });
  }
  
  // High order parameter = solution crystallized
  get solutionFound() {
    return this.getOrderParameter() > 0.9;
  }
}

const strands = ['ATGC', 'GCTA', 'TAGC', 'CGAT', 'GATC'];
const pool = new StrandPool(strands);

// Run simulation until synchronized
while (!pool.solutionFound) {
  pool.step(0.01);
}
console.log('Solution emerged at r =', pool.getOrderParameter());`,
  },
];

const exampleComponents: Record<string, React.FC> = {
  'nucleotide-encoder': NucleotideEncoderDemo,
  'codon-table': CodonTableDemo,
  'hybridization': HybridizationDemo,
  'hamiltonian-path': HamiltonianPathDemo,
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
      nextSection={{ title: 'Quickstart', path: '/quickstart' }}
    />
  );
};

export default DNAComputerExamples;
