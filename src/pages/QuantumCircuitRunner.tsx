import { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus, RotateCcw, GripVertical, Zap, Circle, BarChart3, ArrowLeft, Sparkles, Target, Download, Upload, Wand2, Layers, GitBranch, ShieldCheck, Activity, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import SedenionVisualizer from '@/components/SedenionVisualizer';

import {
  GatePalette,
  WireDisplay,
  BlochSphere,
  AmplitudePlot,
  CircuitTimeline,
  CircuitComparison,
  ParameterSweep,
  StateTomography,
} from '@/components/quantum-circuit';

import {
  GateType,
  GateInstance,
  Wire,
  ComplexNumber,
  MeasurementResult,
  VerificationError,
  NoiseSimResult,
  ComparisonResult,
  GATE_DEFINITIONS,
} from '@/lib/quantum-circuit/types';

import { ALGORITHM_PRESETS } from '@/lib/quantum-circuit/presets';

import {
  seededRandom,
  applyGateToState,
  executeCircuit,
  stateToSedenion,
  computeEntropy,
  generateCodeExample,
} from '@/lib/quantum-circuit/simulation';

const QuantumCircuitRunner = () => {
  const [wires, setWires] = useState<Wire[]>([
    { id: 1, label: 'q[0]' },
    { id: 2, label: 'q[1]' },
  ]);
  const [gates, setGates] = useState<GateInstance[]>([]);
  const [draggedGate, setDraggedGate] = useState<GateType | null>(null);
  const [executedState, setExecutedState] = useState<ComplexNumber[] | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [measurementResult, setMeasurementResult] = useState<MeasurementResult | null>(null);
  const [measurementSeed, setMeasurementSeed] = useState(42);
  const [verificationErrors, setVerificationErrors] = useState<VerificationError[]>([]);
  const [noiseResult, setNoiseResult] = useState<NoiseSimResult | null>(null);
  const [noiseLevel, setNoiseLevel] = useState(0.01);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  
  const nextGateId = useRef(1);

  const addWire = useCallback(() => {
    if (wires.length >= 4) return;
    setWires(prev => [...prev, { id: prev.length + 1, label: `q[${prev.length}]` }]);
    setHistory(prev => [...prev, `Added qubit q[${wires.length}]`]);
    setExecutedState(null);
  }, [wires.length]);

  const handleDragStart = useCallback((gateType: GateType) => {
    setDraggedGate(gateType);
  }, []);

  const handleDropGate = useCallback((wireIndex: number, position: number) => {
    if (!draggedGate) return;
    
    const existing = gates.find(g => g.wireIndex === wireIndex && g.position === position);
    if (existing) return;
    
    const isControlledGate = ['CNOT', 'CZ', 'CPHASE'].includes(draggedGate);
    const is3QubitGate = ['CCX', 'CSWAP'].includes(draggedGate);
    
    let controlWire: number | undefined;
    let controlWire2: number | undefined;
    
    if (is3QubitGate && wireIndex >= 2) {
      controlWire = wireIndex - 2;
      controlWire2 = wireIndex - 1;
    } else if (isControlledGate && wireIndex > 0) {
      controlWire = wireIndex - 1;
    }
    
    const newGate: GateInstance = {
      id: `gate-${nextGateId.current++}`,
      type: draggedGate,
      wireIndex,
      position,
      controlWire,
      controlWire2,
      parameter: draggedGate === 'RZ' ? Math.PI / 4 : undefined,
    };
    
    setGates(prev => [...prev, newGate]);
    setHistory(prev => [...prev, `Added ${draggedGate} to q[${wireIndex}]`]);
    setDraggedGate(null);
    setExecutedState(null);
  }, [draggedGate, gates]);

  const removeGate = useCallback((gateId: string) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
    setExecutedState(null);
  }, []);

  const loadPreset = useCallback((preset: typeof ALGORITHM_PRESETS[0]) => {
    const newWires = Array.from({ length: preset.numQubits }, (_, i) => ({
      id: i + 1, label: `q[${i}]`,
    }));
    setWires(newWires);
    
    const newGates: GateInstance[] = preset.gates.map((g) => ({
      id: `gate-${nextGateId.current++}`,
      type: g.type as GateType,
      wireIndex: g.wireIndex,
      position: g.position,
      controlWire: g.controlWire,
      parameter: g.parameter,
    }));
    setGates(newGates);
    setExecutedState(null);
    setHistory(prev => [...prev, `Loaded: ${preset.name}`]);
  }, []);

  const runCircuit = useCallback(() => {
    const state = executeCircuit(gates, wires.length);
    setExecutedState(state);
    setHistory(prev => [...prev, `Executed ${gates.length} gates`]);
  }, [gates, wires.length]);

  const measureState = useCallback(() => {
    if (!executedState) return;
    const numShots = 1024;
    const counts: Record<string, number> = {};
    const probs = executedState.map(s => s.real * s.real + s.imag * s.imag);
    const cumulative: number[] = [];
    let sum = 0;
    for (const p of probs) { sum += p; cumulative.push(sum); }
    
    for (let shot = 0; shot < numShots; shot++) {
      const r = seededRandom(measurementSeed + shot);
      let outcome = 0;
      for (let i = 0; i < cumulative.length; i++) {
        if (r <= cumulative[i]) { outcome = i; break; }
      }
      const label = outcome.toString(2).padStart(wires.length, '0');
      counts[label] = (counts[label] || 0) + 1;
    }
    
    const collapsed = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    setMeasurementResult({ shots: numShots, counts, collapsed });
    setMeasurementSeed(prev => prev + numShots);
  }, [executedState, wires.length, measurementSeed]);

  const resetCircuit = useCallback(() => {
    setGates([]);
    setExecutedState(null);
    setMeasurementResult(null);
    setComparisonResult(null);
    setNoiseResult(null);
  }, []);

  const circuitDepth = useMemo(() => {
    if (gates.length === 0) return { depth: 0, layers: [], avgParallelism: 0 };
    const positionGroups = new Map<number, GateInstance[]>();
    gates.forEach(g => {
      if (!positionGroups.has(g.position)) positionGroups.set(g.position, []);
      positionGroups.get(g.position)!.push(g);
    });
    const positions = Array.from(positionGroups.keys()).sort((a, b) => a - b);
    const layers = positions.map(pos => ({
      position: pos,
      gates: positionGroups.get(pos)!,
      parallelism: positionGroups.get(pos)!.length,
    }));
    return { depth: layers.length, layers, avgParallelism: gates.length / layers.length };
  }, [gates]);

  const compareCircuit = useCallback(() => {
    if (!executedState) return;
    let noisyState = executeCircuit(gates, wires.length);
    let seedOffset = measurementSeed + 1000;
    
    for (const gate of gates) {
      const is2Q = ['CNOT', 'CZ', 'CPHASE', 'SWAP'].includes(gate.type);
      const errorRate = is2Q ? noiseLevel * 2 : noiseLevel;
      if (seededRandom(seedOffset++) < errorRate) {
        const pauliGate = ['X', 'Y', 'Z'][Math.floor(seededRandom(seedOffset++) * 3)] as GateType;
        noisyState = applyGateToState(noisyState, pauliGate, gate.wireIndex, wires.length);
      }
    }
    
    const norm = Math.sqrt(noisyState.reduce((s, c) => s + c.real*c.real + c.imag*c.imag, 0)) || 1;
    noisyState = noisyState.map(c => ({ real: c.real/norm, imag: c.imag/norm }));
    
    const idealProbs = executedState.map(s => s.real*s.real + s.imag*s.imag);
    const noisyProbs = noisyState.map(s => s.real*s.real + s.imag*s.imag);
    
    let ipR = 0, ipI = 0;
    for (let i = 0; i < executedState.length; i++) {
      ipR += executedState[i].real*noisyState[i].real + executedState[i].imag*noisyState[i].imag;
      ipI += executedState[i].real*noisyState[i].imag - executedState[i].imag*noisyState[i].real;
    }
    
    setComparisonResult({
      idealState: executedState,
      noisyState,
      fidelity: Math.max(0, Math.min(1, ipR*ipR + ipI*ipI)),
      stateOverlap: idealProbs.map((p, i) => Math.min(p, noisyProbs[i]) / Math.max(p, noisyProbs[i], 0.001)),
      idealProbs,
      noisyProbs,
      probDifference: idealProbs.map((p, i) => noisyProbs[i] - p),
    });
  }, [executedState, gates, wires.length, noiseLevel, measurementSeed]);

  const sedenionState = useMemo(() => executedState ? stateToSedenion(executedState) : Array(16).fill(0), [executedState]);
  const entropy = useMemo(() => executedState ? computeEntropy(executedState) : 0, [executedState]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Link to="/quantum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Quantum Examples
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">Quantum Circuit Runner</h1>
            <p className="text-muted-foreground">Build and simulate quantum circuits with tinyaleph</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr_280px] gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Quantum Gates
              </h2>
              <GatePalette onDragStart={handleDragStart} />
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Presets
              </h2>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {ALGORITHM_PRESETS.map((preset) => (
                  <Button key={preset.name} variant="outline" size="sm" className="text-xs h-auto py-2 flex flex-col items-start"
                    onClick={() => loadPreset(preset)} title={preset.description}>
                    <span className="font-semibold">{preset.name}</span>
                    <span className="text-muted-foreground text-[10px]">{preset.numQubits}q</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold mb-4">Controls</h2>
              <div className="flex flex-col gap-2">
                <Button onClick={addWire} variant="outline" disabled={wires.length >= 4}>
                  <Plus className="w-4 h-4 mr-2" /> Add Qubit
                </Button>
                <Button onClick={runCircuit} disabled={gates.length === 0}>
                  <Play className="w-4 h-4 mr-2" /> Execute
                </Button>
                <Button onClick={measureState} variant="secondary" disabled={!executedState}>
                  <Target className="w-4 h-4 mr-2" /> Measure
                </Button>
                <Button onClick={compareCircuit} variant="outline" disabled={!executedState}>
                  <GitCompare className="w-4 h-4 mr-2" /> Compare
                </Button>
                <Button onClick={resetCircuit} variant="destructive">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <div className="pt-2 border-t border-border mt-2">
                  <label className="text-xs text-muted-foreground">Noise: {(noiseLevel * 100).toFixed(1)}%</label>
                  <input type="range" min="0" max="0.1" step="0.005" value={noiseLevel}
                    onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>

            {comparisonResult && (
              <div className="p-4 rounded-lg border border-border bg-card">
                <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <GitCompare className="w-4 h-4" /> Comparison
                </h2>
                <CircuitComparison comparison={comparisonResult} numQubits={wires.length} />
              </div>
            )}
          </div>

          {/* Center - Circuit + Code */}
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <GripVertical className="w-5 h-5" /> Circuit
              </h2>
              <div className="relative min-h-[200px]">
                <svg className="absolute inset-0 pointer-events-none z-20" style={{ overflow: 'visible' }}>
                  {gates.filter(g => ['CNOT', 'CZ', 'CPHASE'].includes(g.type) && g.controlWire !== undefined).map((gate) => {
                    const controlY = (gate.controlWire! * 66) + 33;
                    const targetY = (gate.wireIndex * 66) + 33;
                    const slotX = 80 + (gate.position * 52) + 24;
                    return (
                      <g key={`cl-${gate.id}`}>
                        <line x1={slotX} y1={Math.min(controlY,targetY)+12} x2={slotX} y2={Math.max(controlY,targetY)-12}
                          stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 2" />
                        <circle cx={slotX} cy={controlY} r="6" fill="hsl(var(--primary))" />
                        <circle cx={slotX} cy={targetY} r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                      </g>
                    );
                  })}
                </svg>
                <div className="space-y-3">
                  {wires.map((wire, idx) => (
                    <WireDisplay key={wire.id} wire={wire} wireIndex={idx}
                      gates={gates.filter(g => g.wireIndex === idx)}
                      onDropGate={(pos) => handleDropGate(idx, pos)}
                      onRemoveGate={removeGate}
                      isActive={draggedGate !== null}
                      numWires={wires.length} />
                  ))}
                </div>
              </div>
            </div>

            {/* TinyAleph Integration - moved under Circuit */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-4">TinyAleph Integration</h2>
              <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{generateCodeExample(wires.length, gates, entropy)}</code>
              </pre>
            </div>

            {/* Analysis Tools */}
            <div className="grid md:grid-cols-2 gap-4">
              <ParameterSweep gates={gates} numWires={wires.length} />
              <StateTomography gates={gates} numWires={wires.length} seed={measurementSeed} />
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5" /> Circuit Depth
              </h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-2xl font-mono text-primary">{circuitDepth.depth}</p>
                  <p className="text-[10px] text-muted-foreground">Depth</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-2xl font-mono text-primary">{gates.length}</p>
                  <p className="text-[10px] text-muted-foreground">Gates</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-2xl font-mono text-primary">{circuitDepth.avgParallelism.toFixed(1)}×</p>
                  <p className="text-[10px] text-muted-foreground">Parallel</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <CircuitTimeline gates={gates} wires={wires} />
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Circle className="w-5 h-5" /> Bloch Sphere
              </h2>
              {executedState ? <BlochSphere state={executedState} /> : (
                <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">Execute to see</div>
              )}
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Amplitudes
              </h2>
              {executedState ? <AmplitudePlot state={executedState} /> : (
                <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">Execute to see</div>
              )}
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-4">Sedenion State</h2>
              <SedenionVisualizer components={sedenionState} animated={!!executedState} size="lg" />
              <div className="mt-3 text-center">
                <p className="text-sm text-muted-foreground">Entropy</p>
                <p className="text-2xl font-mono text-primary">{entropy.toFixed(3)} bits</p>
              </div>
            </div>

            {measurementResult && (
              <div className="p-4 rounded-lg border border-border bg-card">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Measurement
                </h2>
                <div className="text-xs text-muted-foreground mb-2">
                  {measurementResult.shots} shots → |{measurementResult.collapsed}⟩
                </div>
                <div className="space-y-1">
                  {Object.entries(measurementResult.counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([state, count]) => (
                    <div key={state} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary w-12">|{state}⟩</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-primary/70" style={{ width: `${(count / measurementResult.shots) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{((count / measurementResult.shots) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumCircuitRunner;
