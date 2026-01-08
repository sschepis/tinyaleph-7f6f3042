import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus, RotateCcw, GripVertical, Zap, Circle, BarChart3, ArrowLeft, Sparkles, Target, Download, Upload, Wand2, Layers, GitBranch, ShieldCheck, Activity, GitCompare, Bug, HelpCircle, Share2, Check, Link2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import SedenionVisualizer from '@/components/SedenionVisualizer';
import CodeBlock from '@/components/CodeBlock';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  GatePalette,
  WireDisplay,
  BlochSphere,
  AmplitudePlot,
  CircuitTimeline,
  CircuitComparison,
  ParameterSweep,
  StateTomography,
  DebugPanel,
  HelpDialog,
  useFirstRun,
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

import {
  DebugSession,
  initDebugSession,
  toggleBreakpoint,
} from '@/lib/quantum-circuit/debugger';

const QuantumCircuitRunner = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
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
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Debug mode state
  const [debugMode, setDebugMode] = useState(false);
  const [debugSession, setDebugSession] = useState<DebugSession | null>(null);
  
  // Help dialog state
  const [isFirstRun, markAsSeen] = useFirstRun('help-seen');
  const [showHelp, setShowHelp] = useState(false);
  
  // Show help on first run
  useEffect(() => {
    if (isFirstRun) {
      setShowHelp(true);
      markAsSeen();
    }
  }, [isFirstRun, markAsSeen]);
  
  const nextGateId = useRef(1);
  const hasLoadedFromUrl = useRef(false);

  // Encode circuit to URL-safe string
  const encodeCircuit = useCallback(() => {
    const circuitData = {
      q: wires.length,
      g: gates.map(g => ({
        t: g.type,
        w: g.wireIndex,
        p: g.position,
        c: g.controlWire,
        c2: g.controlWire2,
        r: g.parameter,
      })),
    };
    return btoa(JSON.stringify(circuitData));
  }, [wires.length, gates]);

  // Decode circuit from URL string
  const decodeCircuit = useCallback((encoded: string) => {
    try {
      const circuitData = JSON.parse(atob(encoded));
      const newWires = Array.from({ length: circuitData.q }, (_, i) => ({
        id: i + 1,
        label: `q[${i}]`,
      }));
      const newGates: GateInstance[] = circuitData.g.map((g: any, idx: number) => ({
        id: `gate-${idx + 1}`,
        type: g.t as GateType,
        wireIndex: g.w,
        position: g.p,
        controlWire: g.c,
        controlWire2: g.c2,
        parameter: g.r,
      }));
      nextGateId.current = newGates.length + 1;
      return { wires: newWires, gates: newGates };
    } catch {
      return null;
    }
  }, []);

  // Load circuit from URL on mount
  useEffect(() => {
    if (hasLoadedFromUrl.current) return;
    const circuitParam = searchParams.get('circuit');
    if (circuitParam) {
      const decoded = decodeCircuit(circuitParam);
      if (decoded) {
        setWires(decoded.wires);
        setGates(decoded.gates);
        setHistory(['Loaded circuit from shared link']);
        hasLoadedFromUrl.current = true;
      }
    }
  }, [searchParams, decodeCircuit]);

  // Share circuit link
  const shareCircuit = useCallback(async () => {
    const encoded = encodeCircuit();
    const url = new URL(window.location.href);
    url.searchParams.set('circuit', encoded);
    
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);
      toast({
        title: "Link copied!",
        description: "Circuit link copied to clipboard",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast({
        title: "Share link",
        description: url.toString(),
      });
    }
  }, [encodeCircuit]);

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

  // Debug mode functions
  const enterDebugMode = useCallback(() => {
    if (gates.length === 0) return;
    const session = initDebugSession(gates, wires.length);
    setDebugSession(session);
    setDebugMode(true);
  }, [gates, wires.length]);

  const exitDebugMode = useCallback(() => {
    setDebugMode(false);
    // Keep the final state from debug session
    if (debugSession && debugSession.history.length > 0) {
      const finalState = debugSession.history[debugSession.history.length - 1].state;
      setExecutedState(finalState);
    }
    setDebugSession(null);
  }, [debugSession]);

  const handleToggleBreakpoint = useCallback((gateId: string) => {
    if (debugSession) {
      setDebugSession(toggleBreakpoint(debugSession, gateId));
    }
  }, [debugSession]);

  // Get current debug gate ID for highlighting
  const currentDebugGateId = useMemo(() => {
    if (!debugMode || !debugSession || debugSession.currentStep === 0) return null;
    const currentHistoryEntry = debugSession.history[debugSession.history.length - 1];
    return currentHistoryEntry.gate?.id ?? null;
  }, [debugMode, debugSession]);

  // State to display (either from debug session or executed state)
  const displayState = useMemo(() => {
    if (debugMode && debugSession && debugSession.history.length > 0) {
      return debugSession.history[debugSession.history.length - 1].state;
    }
    return executedState;
  }, [debugMode, debugSession, executedState]);

  const sedenionState = useMemo(() => displayState ? stateToSedenion(displayState) : Array(16).fill(0), [displayState]);
  const entropy = useMemo(() => displayState ? computeEntropy(displayState) : 0, [displayState]);

  return (
    <div className="min-h-screen bg-background">
      {/* Help Dialog */}
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/quantum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4" /> Back to Quantum Examples
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
                    <HelpCircle className="w-4 h-4 mr-2" /> Help
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show getting started guide</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
              Quantum Circuit Runner
            </h1>
            <p className="text-muted-foreground">Build and simulate quantum circuits with tinyaleph</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr_280px] gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                Quantum Gates
              </h2>
              <GatePalette onDragStart={handleDragStart} />
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                Presets
              </h2>
              <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
                {ALGORITHM_PRESETS.map((preset) => (
                  <TooltipProvider key={preset.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs h-auto py-2 flex flex-col items-start hover:bg-primary/5 hover:border-primary/30 transition-colors"
                          onClick={() => loadPreset(preset)}>
                          <span className="font-semibold">{preset.name}</span>
                          <span className="text-muted-foreground text-[10px]">{preset.numQubits}q</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[200px]">
                        <p className="text-xs">{preset.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary" />
                </div>
                Controls
              </h2>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={addWire} variant="outline" size="sm" disabled={wires.length >= 4} className="h-9">
                    <Plus className="w-3 h-3 mr-1" /> Qubit
                  </Button>
                  <Button onClick={runCircuit} size="sm" disabled={gates.length === 0} className="h-9">
                    <Play className="w-3 h-3 mr-1" /> Execute
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={measureState} variant="secondary" size="sm" disabled={!executedState} className="h-9">
                    <Target className="w-3 h-3 mr-1" /> Measure
                  </Button>
                  <Button onClick={compareCircuit} variant="outline" size="sm" disabled={!executedState} className="h-9">
                    <GitCompare className="w-3 h-3 mr-1" /> Compare
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border mt-1">
                  <Button 
                    onClick={debugMode ? exitDebugMode : enterDebugMode} 
                    variant={debugMode ? "default" : "outline"}
                    size="sm"
                    className={`h-9 ${debugMode ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                    disabled={gates.length === 0 && !debugMode}
                  >
                    <Bug className="w-3 h-3 mr-1" /> {debugMode ? 'Exit' : 'Debug'}
                  </Button>
                  <Button onClick={resetCircuit} variant="destructive" size="sm" className="h-9">
                    <RotateCcw className="w-3 h-3 mr-1" /> Reset
                  </Button>
                </div>
                <div className="pt-2 border-t border-border mt-1">
                  <Button 
                    onClick={shareCircuit} 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-9"
                    disabled={gates.length === 0}
                  >
                    {linkCopied ? (
                      <><Check className="w-3 h-3 mr-1 text-green-500" /> Copied!</>
                    ) : (
                      <><Share2 className="w-3 h-3 mr-1" /> Share Circuit</>
                    )}
                  </Button>
                </div>
                <div className="pt-3 border-t border-border mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-muted-foreground">Noise Level</label>
                    <span className="text-xs font-mono text-primary">{(noiseLevel * 100).toFixed(1)}%</span>
                  </div>
                  <input type="range" min="0" max="0.1" step="0.005" value={noiseLevel}
                    onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary" />
                </div>
              </div>
            </div>

            {/* Debug Panel */}
            {debugMode && debugSession && (
              <div className="p-4 rounded-xl border-2 border-yellow-500/50 bg-yellow-500/5 shadow-lg shadow-yellow-500/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-500">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Bug className="w-4 h-4 text-yellow-500" />
                  </div>
                  Debug Mode
                </h2>
                <DebugPanel 
                  session={debugSession}
                  onSessionChange={setDebugSession}
                  onExit={exitDebugMode}
                />
              </div>
            )}

            {comparisonResult && (
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-primary" /> Comparison
                </h2>
                <CircuitComparison comparison={comparisonResult} numQubits={wires.length} />
              </div>
            )}
          </div>

          {/* Center - Circuit + Code */}
          <div className="space-y-4">
            <div className={`p-5 rounded-xl border-2 bg-card shadow-sm ${debugMode ? 'border-yellow-500/50 shadow-yellow-500/10' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${debugMode ? 'bg-yellow-500/20' : 'bg-primary/10'}`}>
                    <GripVertical className={`w-4 h-4 ${debugMode ? 'text-yellow-500' : 'text-primary'}`} />
                  </div>
                  Circuit Editor
                </h2>
                {debugMode && (
                  <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                    Click gates to set breakpoints
                  </span>
                )}
              </div>
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
                      numWires={wires.length}
                      debugMode={debugMode}
                      breakpoints={debugSession?.breakpoints}
                      onToggleBreakpoint={handleToggleBreakpoint}
                      currentDebugGateId={currentDebugGateId}
                    />
                  ))}
                </div>
                {gates.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-muted-foreground/50">
                      <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Drag gates from the palette</p>
                      <p className="text-xs">or load a preset to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TinyAleph Integration */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                TinyAleph Integration
              </h2>
              <CodeBlock 
                code={generateCodeExample(wires.length, gates, entropy)} 
                language="typescript"
                title="circuit.ts"
              />
            </div>

            {/* Analysis Tools */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <ParameterSweep gates={gates} numWires={wires.length} />
              </div>
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <StateTomography gates={gates} numWires={wires.length} seed={measurementSeed} />
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Circuit Metrics
              </h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/10">
                  <p className="text-2xl font-mono font-bold text-primary">{circuitDepth.depth}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Depth</p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/10">
                  <p className="text-2xl font-mono font-bold text-primary">{gates.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gates</p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/10">
                  <p className="text-2xl font-mono font-bold text-primary">{circuitDepth.avgParallelism.toFixed(1)}×</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Parallel</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <CircuitTimeline gates={gates} wires={wires} />
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Circle className="w-4 h-4" /> Bloch Sphere
              </h2>
              {displayState ? <BlochSphere state={displayState} /> : (
                <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border">
                  <div className="text-center">
                    <Circle className="w-6 h-6 mx-auto mb-1 opacity-30" />
                    <span className="text-xs">Execute to visualize</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Amplitudes
              </h2>
              {displayState ? <AmplitudePlot state={displayState} /> : (
                <div className="h-28 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border">
                  <div className="text-center">
                    <BarChart3 className="w-6 h-6 mx-auto mb-1 opacity-30" />
                    <span className="text-xs">Execute to see amplitudes</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h2 className="text-sm font-semibold text-primary mb-3">Sedenion State</h2>
              <SedenionVisualizer components={sedenionState} animated={!!displayState} size="lg" />
              <div className="mt-3 p-2 rounded-lg bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Von Neumann Entropy</p>
                <p className="text-xl font-mono font-bold text-primary">{entropy.toFixed(3)} <span className="text-sm font-normal text-muted-foreground">bits</span></p>
              </div>
            </div>

            {measurementResult && (
              <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5 shadow-sm">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-green-500">
                  <Target className="w-4 h-4" /> Measurement Results
                </h2>
                <div className="text-xs text-muted-foreground mb-3 p-2 rounded bg-background/50">
                  <span className="font-mono">{measurementResult.shots}</span> shots → collapsed to <span className="font-mono text-green-500">|{measurementResult.collapsed}⟩</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(measurementResult.counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([state, count]) => (
                    <div key={state} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary w-12">|{state}⟩</span>
                      <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300" 
                          style={{ width: `${(count / measurementResult.shots) * 100}%` }} 
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-14 text-right">{((count / measurementResult.shots) * 100).toFixed(1)}%</span>
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
