import { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus, RotateCcw, GripVertical, Zap, Circle, BarChart3, ArrowLeft, Sparkles, Target, Download, Upload, Wand2, Layers, GitBranch, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import SedenionVisualizer from '@/components/SedenionVisualizer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Seeded random for deterministic behavior
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Algorithm presets
interface AlgorithmPreset {
  name: string;
  description: string;
  numQubits: number;
  gates: Array<{ type: string; wireIndex: number; position: number; controlWire?: number }>;
}

const ALGORITHM_PRESETS: AlgorithmPreset[] = [
  {
    name: 'Bell State',
    description: 'Creates maximally entangled |Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
    numQubits: 2,
    gates: [
      { type: 'H', wireIndex: 0, position: 0 },
      { type: 'CNOT', wireIndex: 1, position: 1, controlWire: 0 },
    ],
  },
  {
    name: 'GHZ State',
    description: '3-qubit entangled state (|000⟩ + |111⟩)/√2',
    numQubits: 3,
    gates: [
      { type: 'H', wireIndex: 0, position: 0 },
      { type: 'CNOT', wireIndex: 1, position: 1, controlWire: 0 },
      { type: 'CNOT', wireIndex: 2, position: 2, controlWire: 1 },
    ],
  },
  {
    name: "Grover's (2-qubit)",
    description: 'Quantum search amplifying |11⟩ state',
    numQubits: 2,
    gates: [
      // Initialize superposition
      { type: 'H', wireIndex: 0, position: 0 },
      { type: 'H', wireIndex: 1, position: 0 },
      // Oracle (marks |11⟩)
      { type: 'Z', wireIndex: 0, position: 1 },
      { type: 'Z', wireIndex: 1, position: 1 },
      // Diffusion operator
      { type: 'H', wireIndex: 0, position: 2 },
      { type: 'H', wireIndex: 1, position: 2 },
      { type: 'X', wireIndex: 0, position: 3 },
      { type: 'X', wireIndex: 1, position: 3 },
      { type: 'H', wireIndex: 1, position: 4 },
      { type: 'CNOT', wireIndex: 1, position: 5, controlWire: 0 },
      { type: 'H', wireIndex: 1, position: 6 },
      { type: 'X', wireIndex: 0, position: 7 },
      { type: 'X', wireIndex: 1, position: 7 },
      { type: 'H', wireIndex: 0, position: 8 },
      { type: 'H', wireIndex: 1, position: 8 },
    ],
  },
  {
    name: 'Teleportation',
    description: 'Quantum teleportation: transfers state from q[0] to q[2]',
    numQubits: 3,
    gates: [
      // Prepare state to teleport (e.g., |+⟩ on q0)
      { type: 'H', wireIndex: 0, position: 0 },
      // Create Bell pair between q1 and q2
      { type: 'H', wireIndex: 1, position: 1 },
      { type: 'CNOT', wireIndex: 2, position: 2, controlWire: 1 },
      // Bell measurement on q0, q1
      { type: 'CNOT', wireIndex: 1, position: 3, controlWire: 0 },
      { type: 'H', wireIndex: 0, position: 4 },
      // Corrections (conditioned on measurement - simplified)
      { type: 'CNOT', wireIndex: 2, position: 5, controlWire: 1 },
      { type: 'Z', wireIndex: 2, position: 6 },
    ],
  },
  {
    name: 'Superposition',
    description: 'Equal superposition of all basis states',
    numQubits: 3,
    gates: [
      { type: 'H', wireIndex: 0, position: 0 },
      { type: 'H', wireIndex: 1, position: 0 },
      { type: 'H', wireIndex: 2, position: 0 },
    ],
  },
  {
    name: 'QFT (3-qubit)',
    description: 'Quantum Fourier Transform: basis for phase estimation',
    numQubits: 3,
    gates: [
      // QFT on 3 qubits
      { type: 'H', wireIndex: 0, position: 0 },
      { type: 'S', wireIndex: 0, position: 1 },
      { type: 'T', wireIndex: 0, position: 2 },
      { type: 'H', wireIndex: 1, position: 3 },
      { type: 'S', wireIndex: 1, position: 4 },
      { type: 'H', wireIndex: 2, position: 5 },
      // SWAP for bit-reversal
      { type: 'SWAP', wireIndex: 0, position: 6 },
    ],
  },
  {
    name: 'Phase Estimation',
    description: 'Estimates eigenvalue phase of a unitary operator',
    numQubits: 3,
    gates: [
      // Initialize counting qubits in superposition
      { type: 'H', wireIndex: 0, position: 0 },
      { type: 'H', wireIndex: 1, position: 0 },
      // Apply controlled-U operations (simulated with controlled phase)
      { type: 'CNOT', wireIndex: 2, position: 1, controlWire: 1 },
      { type: 'S', wireIndex: 2, position: 2 },
      { type: 'CNOT', wireIndex: 2, position: 3, controlWire: 0 },
      { type: 'T', wireIndex: 2, position: 4 },
      // Inverse QFT on counting qubits
      { type: 'H', wireIndex: 1, position: 5 },
      { type: 'S', wireIndex: 0, position: 6 },
      { type: 'H', wireIndex: 0, position: 7 },
    ],
  },
];

interface MeasurementResult {
  shots: number;
  counts: Record<string, number>;
  collapsed: string;
}
// Gate definitions with colors, descriptions, and unitary matrices
const GATE_DEFINITIONS = {
  H: { 
    name: 'Hadamard', 
    color: 'bg-blue-500', 
    description: 'Creates superposition',
    matrix: '1/√2 × [[1, 1], [1, -1]]'
  },
  X: { 
    name: 'Pauli-X', 
    color: 'bg-red-500', 
    description: 'Bit flip (NOT)',
    matrix: '[[0, 1], [1, 0]]'
  },
  Y: { 
    name: 'Pauli-Y', 
    color: 'bg-green-500', 
    description: 'Bit & phase flip',
    matrix: '[[0, -i], [i, 0]]'
  },
  Z: { 
    name: 'Pauli-Z', 
    color: 'bg-purple-500', 
    description: 'Phase flip',
    matrix: '[[1, 0], [0, -1]]'
  },
  S: { 
    name: 'S Gate', 
    color: 'bg-cyan-500', 
    description: 'π/2 phase',
    matrix: '[[1, 0], [0, i]]'
  },
  T: { 
    name: 'T Gate', 
    color: 'bg-orange-500', 
    description: 'π/4 phase',
    matrix: '[[1, 0], [0, e^(iπ/4)]]'
  },
  CNOT: { 
    name: 'CNOT', 
    color: 'bg-pink-500', 
    description: 'Controlled NOT',
    matrix: '[[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]'
  },
  CZ: { 
    name: 'CZ', 
    color: 'bg-indigo-500', 
    description: 'Controlled-Z',
    matrix: '[[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,-1]]'
  },
  CPHASE: { 
    name: 'CPHASE', 
    color: 'bg-teal-500', 
    description: 'Controlled π/4 phase',
    matrix: '[[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,e^(iπ/4)]]'
  },
  SWAP: { 
    name: 'SWAP', 
    color: 'bg-yellow-500', 
    description: 'Swap qubits',
    matrix: '[[1,0,0,0], [0,0,1,0], [0,1,0,0], [0,0,0,1]]'
  },
  CCX: { 
    name: 'Toffoli', 
    color: 'bg-rose-600', 
    description: 'Controlled-Controlled-X (3-qubit)',
    matrix: 'I⊗I⊗|11⟩⟨11| + X⊗|11⟩⟨11|'
  },
  CSWAP: { 
    name: 'Fredkin', 
    color: 'bg-amber-600', 
    description: 'Controlled-SWAP (3-qubit)',
    matrix: 'I⊗I + SWAP⊗|1⟩⟨1|'
  },
};

type GateType = keyof typeof GATE_DEFINITIONS;

interface GateInstance {
  id: string;
  type: GateType;
  wireIndex: number;
  position: number;
  controlWire?: number; // For controlled gates
  controlWire2?: number; // Second control for 3-qubit gates (CCX, CSWAP)
}

interface Wire {
  id: number;
  label: string;
}

interface ComplexNumber {
  real: number;
  imag: number;
}

// Quantum state simulation using tinyaleph-inspired sedenion encoding
const applyGateToState = (
  state: ComplexNumber[],
  gateType: GateType,
  wireIndex: number,
  numWires: number,
  controlWire?: number,
  controlWire2?: number
): ComplexNumber[] => {
  const newState = state.map(s => ({ ...s }));
  const wirePositionMask = 1 << (numWires - 1 - wireIndex);
  
  switch (gateType) {
    case 'H':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) === 0) {
          const j = i | wirePositionMask;
          const temp = {
            real: (state[i].real + state[j].real) / Math.SQRT2,
            imag: (state[i].imag + state[j].imag) / Math.SQRT2,
          };
          newState[j] = {
            real: (state[i].real - state[j].real) / Math.SQRT2,
            imag: (state[i].imag - state[j].imag) / Math.SQRT2,
          };
          newState[i] = temp;
        }
      }
      break;
      
    case 'X':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) === 0) {
          const j = i | wirePositionMask;
          [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
        }
      }
      break;
      
    case 'Y':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) === 0) {
          const j = i | wirePositionMask;
          newState[i] = { real: state[j].imag, imag: -state[j].real };
          newState[j] = { real: -state[i].imag, imag: state[i].real };
        }
      }
      break;
      
    case 'Z':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) !== 0) {
          newState[i] = { real: -state[i].real, imag: -state[i].imag };
        }
      }
      break;
      
    case 'S':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) !== 0) {
          newState[i] = { real: -state[i].imag, imag: state[i].real };
        }
      }
      break;
      
    case 'T':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) !== 0) {
          const cos = Math.cos(Math.PI / 4);
          const sin = Math.sin(Math.PI / 4);
          newState[i] = {
            real: state[i].real * cos - state[i].imag * sin,
            imag: state[i].real * sin + state[i].imag * cos,
          };
        }
      }
      break;
      
    case 'CNOT':
      if (controlWire !== undefined) {
        const controlMask = 1 << (numWires - 1 - controlWire);
        for (let i = 0; i < state.length; i++) {
          if ((i & controlMask) !== 0 && (i & wirePositionMask) === 0) {
            const j = i | wirePositionMask;
            [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
          }
        }
      }
      break;
    
    case 'CZ':
      if (controlWire !== undefined) {
        const controlMask = 1 << (numWires - 1 - controlWire);
        for (let i = 0; i < state.length; i++) {
          // Apply -1 phase when both control and target are |1⟩
          if ((i & controlMask) !== 0 && (i & wirePositionMask) !== 0) {
            newState[i] = { real: -state[i].real, imag: -state[i].imag };
          }
        }
      }
      break;
    
    case 'CPHASE':
      if (controlWire !== undefined) {
        const controlMask = 1 << (numWires - 1 - controlWire);
        const cos = Math.cos(Math.PI / 4);
        const sin = Math.sin(Math.PI / 4);
        for (let i = 0; i < state.length; i++) {
          // Apply e^(iπ/4) phase when both control and target are |1⟩
          if ((i & controlMask) !== 0 && (i & wirePositionMask) !== 0) {
            newState[i] = {
              real: state[i].real * cos - state[i].imag * sin,
              imag: state[i].real * sin + state[i].imag * cos,
            };
          }
        }
      }
      break;
      
    case 'SWAP':
      if (wireIndex < numWires - 1) {
        const otherWireMask = 1 << (numWires - 2 - wireIndex);
        for (let i = 0; i < state.length; i++) {
          const bit1 = (i & wirePositionMask) !== 0;
          const bit2 = (i & otherWireMask) !== 0;
          if (bit1 !== bit2) {
            const j = i ^ wirePositionMask ^ otherWireMask;
            if (i < j) {
              [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
            }
          }
        }
      }
      break;
    
    case 'CCX': // Toffoli gate
      if (controlWire !== undefined && controlWire2 !== undefined) {
        const control1Mask = 1 << (numWires - 1 - controlWire);
        const control2Mask = 1 << (numWires - 1 - controlWire2);
        for (let i = 0; i < state.length; i++) {
          // Apply X when both controls are |1⟩
          if ((i & control1Mask) !== 0 && (i & control2Mask) !== 0 && (i & wirePositionMask) === 0) {
            const j = i | wirePositionMask;
            [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
          }
        }
      }
      break;
    
    case 'CSWAP': // Fredkin gate
      if (controlWire !== undefined && wireIndex < numWires - 1) {
        const controlMask = 1 << (numWires - 1 - controlWire);
        const target2Mask = 1 << (numWires - 2 - wireIndex); // Second swap target
        for (let i = 0; i < state.length; i++) {
          // Swap targets when control is |1⟩
          if ((i & controlMask) !== 0) {
            const bit1 = (i & wirePositionMask) !== 0;
            const bit2 = (i & target2Mask) !== 0;
            if (bit1 !== bit2) {
              const j = i ^ wirePositionMask ^ target2Mask;
              if (i < j) {
                [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
              }
            }
          }
        }
      }
      break;
  }
  
  return newState;
};

// Convert state to sedenion for visualization
const stateToSedenion = (state: ComplexNumber[]): number[] => {
  const components = new Array(16).fill(0);
  state.forEach((s, i) => {
    const amplitude = Math.sqrt(s.real * s.real + s.imag * s.imag);
    components[i % 16] += amplitude;
  });
  const norm = Math.sqrt(components.reduce((sum, v) => sum + v * v, 0)) || 1;
  return components.map(v => v / norm);
};

// Compute entropy from state
const computeEntropy = (state: ComplexNumber[]): number => {
  const probs = state.map(s => s.real * s.real + s.imag * s.imag);
  const total = probs.reduce((a, b) => a + b, 0) || 1;
  return -probs.reduce((h, p) => {
    const normalized = p / total;
    return normalized > 0 ? h + normalized * Math.log2(normalized) : h;
  }, 0);
};

// Generate code example
const generateCodeExample = (numQubits: number, gates: GateInstance[], entropy: number): string => {
  const gateList = gates.map(g => g.type).join(' → ') || 'none';
  const gateCode = gates.length > 0 
    ? gates.map(g => `applyGate(stateVector, '${g.type}', ${g.wireIndex});`).join('\n')
    : '// Add gates to the circuit above';
  
  return `// Build quantum circuit with tinyaleph
import { Hypercomplex, PrimeState } from '@aleph-ai/tinyaleph';

// Initialize quantum state as sedenion
const numQubits = ${numQubits};
const stateVector = new Hypercomplex(16);

// Apply gates: ${gateList}
${gateCode}

// Measure entropy and coherence
const entropy = stateVector.entropy();    // ${entropy.toFixed(3)} bits
const coherence = stateVector.coherence();`;
};

const GatePalette = ({ onDragStart }: { onDragStart: (gate: GateType) => void }) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(GATE_DEFINITIONS) as GateType[]).map((gateType) => {
          const gate = GATE_DEFINITIONS[gateType];
          return (
            <Tooltip key={gateType}>
              <TooltipTrigger asChild>
                <div
                  draggable
                  onDragStart={() => onDragStart(gateType)}
                  className={`${gate.color} text-white p-3 rounded-lg text-center cursor-grab hover:opacity-90 transition-all hover:-translate-y-0.5 select-none`}
                >
                  <div className="font-bold text-lg">{gateType}</div>
                  <div className="text-[10px] opacity-80">{gate.name}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px]">
                <p className="font-semibold">{gate.name}</p>
                <p className="text-xs text-muted-foreground">{gate.description}</p>
                <p className="text-xs font-mono mt-1 text-primary">{gate.matrix}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

const WireDisplay = ({
  wire,
  gates,
  onDropGate,
  onRemoveGate,
  isActive,
  numWires,
  wireIndex,
}: {
  wire: Wire;
  gates: GateInstance[];
  onDropGate: (position: number) => void;
  onRemoveGate: (gateId: string) => void;
  isActive: boolean;
  numWires: number;
  wireIndex: number;
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    onDropGate(position);
  };

  const slots = 10; // Number of gate slots per wire
  
  return (
    <div className={`relative flex items-center gap-2 p-3 rounded-lg border ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
      {/* Wire label */}
      <div className="w-16 px-2 py-1 bg-primary text-primary-foreground rounded text-center text-sm font-mono">
        q[{wireIndex}]
      </div>
      
      {/* Wire line */}
      <div className="absolute left-20 right-4 h-0.5 bg-primary/30 top-1/2 -translate-y-1/2 pointer-events-none" />
      
      {/* Gate slots */}
      <div className="flex gap-1 flex-1 relative z-10">
        {Array.from({ length: slots }).map((_, slotIdx) => {
          const gateAtSlot = gates.find(g => g.position === slotIdx);
          
          return (
            <div
              key={slotIdx}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slotIdx)}
              className={`w-12 h-12 rounded border-2 border-dashed flex items-center justify-center transition-all ${
                gateAtSlot 
                  ? 'border-transparent' 
                  : 'border-border/50 hover:border-primary/50 hover:bg-primary/10'
              }`}
            >
            {gateAtSlot ? (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`${GATE_DEFINITIONS[gateAtSlot.type].color} text-white w-10 h-10 rounded flex items-center justify-center font-bold cursor-pointer hover:scale-105 transition-transform relative group`}
                        onClick={() => onRemoveGate(gateAtSlot.id)}
                      >
                        {gateAtSlot.type}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          ×
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{GATE_DEFINITIONS[gateAtSlot.type].name}</p>
                      <p className="text-xs font-mono text-primary">{GATE_DEFINITIONS[gateAtSlot.type].matrix}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-muted-foreground/30 text-xs">{slotIdx}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BlochSphere = ({ state }: { state: ComplexNumber[] }) => {
  // Calculate Bloch sphere coordinates from first qubit
  const alpha = state[0] || { real: 1, imag: 0 };
  const beta = state[1] || { real: 0, imag: 0 };
  
  const alphaAbs = Math.sqrt(alpha.real * alpha.real + alpha.imag * alpha.imag);
  const betaAbs = Math.sqrt(beta.real * beta.real + beta.imag * beta.imag);
  
  const theta = 2 * Math.acos(Math.min(1, alphaAbs));
  const phi = Math.atan2(beta.imag, beta.real) - Math.atan2(alpha.imag, alpha.real);
  
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
  
  return (
    <div className="aspect-square bg-muted/30 rounded-lg border border-border p-4">
      <svg viewBox="-1.5 -1.5 3 3" className="w-full h-full">
        {/* Sphere outline */}
        <circle cx="0" cy="0" r="1" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.02" />
        <ellipse cx="0" cy="0" rx="1" ry="0.3" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.015" />
        
        {/* Axes */}
        <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.01" />
        <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.01" />
        
        {/* Axis labels */}
        <text x="0" y="-1.1" textAnchor="middle" fontSize="0.12" fill="currentColor" opacity="0.5">|0⟩</text>
        <text x="0" y="1.18" textAnchor="middle" fontSize="0.12" fill="currentColor" opacity="0.5">|1⟩</text>
        <text x="1.1" y="0.04" textAnchor="start" fontSize="0.1" fill="currentColor" opacity="0.5">|+⟩</text>
        <text x="-1.1" y="0.04" textAnchor="end" fontSize="0.1" fill="currentColor" opacity="0.5">|-⟩</text>
        
        {/* State vector */}
        <line x1="0" y1="0" x2={x} y2={-z} stroke="hsl(var(--primary))" strokeWidth="0.03" />
        <circle cx={x} cy={-z} r="0.06" fill="hsl(var(--primary))" />
      </svg>
    </div>
  );
};

const AmplitudePlot = ({ state }: { state: ComplexNumber[] }) => {
  const maxAmp = Math.max(...state.map(s => Math.sqrt(s.real * s.real + s.imag * s.imag)), 0.01);
  
  return (
    <div className="bg-muted/30 rounded-lg border border-border p-4">
      <div className="flex items-end gap-1 h-24">
        {state.slice(0, 8).map((s, i) => {
          const amplitude = Math.sqrt(s.real * s.real + s.imag * s.imag);
          const heightPercent = (amplitude / maxAmp) * 100;
          const phase = Math.atan2(s.imag, s.real);
          const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full rounded-t transition-all duration-300"
                style={{ 
                  height: `${Math.max(4, heightPercent)}%`,
                  backgroundColor: `hsl(${hue}, 70%, 50%)`,
                }}
                title={`|${i.toString(2).padStart(Math.ceil(Math.log2(state.length)), '0')}⟩: ${amplitude.toFixed(3)}`}
              />
              <span className="text-[8px] text-muted-foreground font-mono">|{i}⟩</span>
            </div>
          );
        })}
      </div>
      <div className="text-center text-xs text-muted-foreground mt-2">Amplitude (color = phase)</div>
    </div>
  );
};

// Verification error interface
interface VerificationError {
  gateId: string;
  type: 'error' | 'warning';
  message: string;
}

// Noise simulation result
interface NoiseSimResult {
  fidelity: number;
  errorRate: number;
  decoherenceEffect: number;
  noisyState: ComplexNumber[] | null;
}

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
  const [noiseLevel, setNoiseLevel] = useState(0.01); // 1% gate error rate
  
  const nextGateId = useRef(1);

  const addWire = useCallback(() => {
    if (wires.length >= 4) return;
    const newId = wires.length + 1;
    setWires(prev => [...prev, { id: newId, label: `q[${prev.length}]` }]);
    setHistory(prev => [...prev, `Added qubit q[${wires.length}]`]);
    setExecutedState(null);
    setMeasurementResult(null);
  }, [wires.length]);

  const removeWire = useCallback((wireId: number) => {
    if (wires.length <= 1) return;
    setWires(prev => prev.filter(w => w.id !== wireId));
    setGates(prev => prev.filter(g => g.wireIndex !== wires.findIndex(w => w.id === wireId)));
    setHistory(prev => [...prev, `Removed qubit`]);
    setExecutedState(null);
    setMeasurementResult(null);
  }, [wires]);

  const handleDragStart = useCallback((gateType: GateType) => {
    setDraggedGate(gateType);
  }, []);

  const handleDropGate = useCallback((wireIndex: number, position: number) => {
    if (!draggedGate) return;
    
    const existing = gates.find(g => g.wireIndex === wireIndex && g.position === position);
    if (existing) return;
    
    // Controlled gates get a control wire (one qubit above if possible)
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
    };
    
    setGates(prev => [...prev, newGate]);
    setHistory(prev => [...prev, `Added ${draggedGate} gate to q[${wireIndex}] at position ${position}`]);
    setDraggedGate(null);
    setExecutedState(null);
    setMeasurementResult(null);
  }, [draggedGate, gates]);

  const removeGate = useCallback((gateId: string) => {
    const gate = gates.find(g => g.id === gateId);
    setGates(prev => prev.filter(g => g.id !== gateId));
    if (gate) {
      setHistory(prev => [...prev, `Removed ${gate.type} gate`]);
    }
    setExecutedState(null);
    setMeasurementResult(null);
  }, [gates]);

  const loadPreset = useCallback((preset: AlgorithmPreset) => {
    // Set up wires
    const newWires = Array.from({ length: preset.numQubits }, (_, i) => ({
      id: i + 1,
      label: `q[${i}]`,
    }));
    setWires(newWires);
    
    // Set up gates
    const newGates: GateInstance[] = preset.gates.map((g, i) => ({
      id: `gate-${nextGateId.current++}`,
      type: g.type as GateType,
      wireIndex: g.wireIndex,
      position: g.position,
      controlWire: g.controlWire,
    }));
    setGates(newGates);
    setExecutedState(null);
    setMeasurementResult(null);
    setHistory(prev => [...prev, `Loaded preset: ${preset.name}`]);
  }, []);

  const executeCircuit = useCallback(() => {
    const numWires = wires.length;
    const dimensions = Math.pow(2, numWires);
    
    let state: ComplexNumber[] = Array.from({ length: dimensions }, (_, i) => 
      i === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
    );
    
    const sortedGates = [...gates].sort((a, b) => a.position - b.position);
    
    for (const gate of sortedGates) {
      state = applyGateToState(state, gate.type, gate.wireIndex, numWires, gate.controlWire, gate.controlWire2);
    }
    
    setExecutedState(state);
    setMeasurementResult(null);
    setHistory(prev => [...prev, `Executed circuit with ${gates.length} gates`]);
  }, [wires.length, gates]);

  const measureState = useCallback(() => {
    if (!executedState) return;
    
    const numShots = 1024;
    const counts: Record<string, number> = {};
    const probs = executedState.map(s => s.real * s.real + s.imag * s.imag);
    
    // Create cumulative distribution
    const cumulative: number[] = [];
    let sum = 0;
    for (const p of probs) {
      sum += p;
      cumulative.push(sum);
    }
    
    // Sample with seeded random
    for (let shot = 0; shot < numShots; shot++) {
      const r = seededRandom(measurementSeed + shot);
      let outcome = 0;
      for (let i = 0; i < cumulative.length; i++) {
        if (r <= cumulative[i]) {
          outcome = i;
          break;
        }
      }
      const binaryLabel = outcome.toString(2).padStart(wires.length, '0');
      counts[binaryLabel] = (counts[binaryLabel] || 0) + 1;
    }
    
    // Find most likely outcome for "collapsed" state
    const collapsed = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    setMeasurementResult({ shots: numShots, counts, collapsed });
    setMeasurementSeed(prev => prev + numShots); // Advance seed for next measurement
    setHistory(prev => [...prev, `Measured ${numShots} shots → most likely: |${collapsed}⟩`]);
  }, [executedState, wires.length, measurementSeed]);

  const resetCircuit = useCallback(() => {
    setGates([]);
    setExecutedState(null);
    setMeasurementResult(null);
    setHistory(prev => [...prev, 'Reset circuit']);
  }, []);

  // Export circuit as JSON
  const exportCircuit = useCallback(() => {
    const circuitData = {
      version: '1.0',
      numQubits: wires.length,
      gates: gates.map(g => ({
        type: g.type,
        wireIndex: g.wireIndex,
        position: g.position,
        controlWire: g.controlWire,
      })),
    };
    const blob = new Blob([JSON.stringify(circuitData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum-circuit.json';
    a.click();
    URL.revokeObjectURL(url);
    setHistory(prev => [...prev, 'Exported circuit to JSON']);
  }, [wires.length, gates]);

  // Import circuit from JSON
  const importCircuit = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.numQubits && data.gates) {
          const newWires = Array.from({ length: data.numQubits }, (_, i) => ({
            id: i + 1,
            label: `q[${i}]`,
          }));
          setWires(newWires);

          const newGates: GateInstance[] = data.gates.map((g: any, i: number) => ({
            id: `gate-${nextGateId.current++}`,
            type: g.type as GateType,
            wireIndex: g.wireIndex,
            position: g.position,
            controlWire: g.controlWire,
          }));
          setGates(newGates);
          setExecutedState(null);
          setMeasurementResult(null);
          setHistory(prev => [...prev, `Imported circuit: ${data.numQubits} qubits, ${data.gates.length} gates`]);
        }
      } catch (err) {
        setHistory(prev => [...prev, 'Failed to import circuit: invalid JSON']);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }, []);

  // Optimize circuit by simplifying gate sequences
  const optimizeCircuit = useCallback(() => {
    if (gates.length < 2) return;
    
    let optimized = [...gates];
    let removedCount = 0;
    let changed = true;
    
    while (changed) {
      changed = false;
      const toRemove = new Set<string>();
      
      // Group gates by wire and position
      const gatesByWirePos = new Map<string, GateInstance[]>();
      for (const gate of optimized) {
        const key = `${gate.wireIndex}`;
        if (!gatesByWirePos.has(key)) gatesByWirePos.set(key, []);
        gatesByWirePos.get(key)!.push(gate);
      }
      
      // Check each wire for optimizable sequences
      for (const [, wireGates] of gatesByWirePos) {
        // Sort by position
        const sorted = wireGates.sort((a, b) => a.position - b.position);
        
        for (let i = 0; i < sorted.length - 1; i++) {
          const g1 = sorted[i];
          const g2 = sorted[i + 1];
          
          // Check if gates are adjacent (consecutive positions)
          if (g2.position - g1.position !== 1) continue;
          
          // Skip controlled gates for now
          if (g1.controlWire !== undefined || g2.controlWire !== undefined) continue;
          
          // H·H = I (identity)
          if (g1.type === 'H' && g2.type === 'H') {
            toRemove.add(g1.id);
            toRemove.add(g2.id);
            changed = true;
          }
          // X·X = I
          else if (g1.type === 'X' && g2.type === 'X') {
            toRemove.add(g1.id);
            toRemove.add(g2.id);
            changed = true;
          }
          // Y·Y = I
          else if (g1.type === 'Y' && g2.type === 'Y') {
            toRemove.add(g1.id);
            toRemove.add(g2.id);
            changed = true;
          }
          // Z·Z = I
          else if (g1.type === 'Z' && g2.type === 'Z') {
            toRemove.add(g1.id);
            toRemove.add(g2.id);
            changed = true;
          }
          // S·S = Z (replace both with Z)
          else if (g1.type === 'S' && g2.type === 'S') {
            // Replace g1 with Z, remove g2
            g1.type = 'Z';
            toRemove.add(g2.id);
            changed = true;
          }
        }
      }
      
      if (toRemove.size > 0) {
        removedCount += toRemove.size;
        optimized = optimized.filter(g => !toRemove.has(g.id));
      }
    }
    
    // Compact positions (remove gaps)
    const byWire = new Map<number, GateInstance[]>();
    for (const gate of optimized) {
      if (!byWire.has(gate.wireIndex)) byWire.set(gate.wireIndex, []);
      byWire.get(gate.wireIndex)!.push(gate);
    }
    
    for (const [, wireGates] of byWire) {
      wireGates.sort((a, b) => a.position - b.position);
      wireGates.forEach((g, idx) => { g.position = idx; });
    }
    
    setGates(optimized);
    setExecutedState(null);
    setMeasurementResult(null);
    
    if (removedCount > 0) {
      setHistory(prev => [...prev, `Optimized: removed ${removedCount} gate(s) (identity cancellations)`]);
    } else {
      setHistory(prev => [...prev, 'Optimization: no simplifications found']);
    }
  }, [gates]);

  // Transpile circuit to universal gate set (H, T, CNOT)
  const transpileCircuit = useCallback(() => {
    if (gates.length === 0) return;
    
    const transpiled: GateInstance[] = [];
    let pos = 0;
    
    const addGate = (type: GateType, wireIndex: number, controlWire?: number, controlWire2?: number) => {
      transpiled.push({
        id: `gate-${nextGateId.current++}`,
        type,
        wireIndex,
        position: pos,
        controlWire,
        controlWire2,
      });
      pos++;
    };
    
    for (const gate of [...gates].sort((a, b) => a.position - b.position)) {
      switch (gate.type) {
        case 'H':
        case 'T':
        case 'CNOT':
          // Already in universal set
          addGate(gate.type, gate.wireIndex, gate.controlWire, gate.controlWire2);
          break;
          
        case 'X':
          // X = H·Z·H, and Z = S·S = T·T·T·T, so X ≈ H·T·T·T·T·H
          addGate('H', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('H', gate.wireIndex);
          break;
          
        case 'Z':
          // Z = T^4 (four T gates = π phase)
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          break;
          
        case 'S':
          // S = T^2 (two T gates = π/2 phase)
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          break;
          
        case 'Y':
          // Y = S·X·S† ≈ T·T·(H·T·T·T·T·H)·T†·T† 
          // Simplified: Y ≈ S·H·Z·H·S†
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('H', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('T', gate.wireIndex);
          addGate('H', gate.wireIndex);
          break;
          
        case 'CZ':
          // CZ = (I⊗H)·CNOT·(I⊗H)
          if (gate.controlWire !== undefined) {
            addGate('H', gate.wireIndex);
            addGate('CNOT', gate.wireIndex, gate.controlWire);
            addGate('H', gate.wireIndex);
          }
          break;
          
        case 'CPHASE':
          // CPHASE(π/4) ≈ controlled-T, decomposed to CNOTs and T
          if (gate.controlWire !== undefined) {
            addGate('CNOT', gate.wireIndex, gate.controlWire);
            addGate('T', gate.wireIndex);
            addGate('CNOT', gate.wireIndex, gate.controlWire);
          }
          break;
          
        case 'SWAP':
          // SWAP = CNOT·CNOT·CNOT (alternating control/target)
          const swapTarget = gate.wireIndex < wires.length - 1 ? gate.wireIndex + 1 : gate.wireIndex - 1;
          addGate('CNOT', swapTarget, gate.wireIndex);
          addGate('CNOT', gate.wireIndex, swapTarget);
          addGate('CNOT', swapTarget, gate.wireIndex);
          break;
          
        case 'CCX': // Toffoli decomposition (simplified)
          // Toffoli requires many gates; simplified decomposition
          if (gate.controlWire !== undefined && gate.controlWire2 !== undefined) {
            addGate('H', gate.wireIndex);
            addGate('CNOT', gate.wireIndex, gate.controlWire2);
            addGate('T', gate.wireIndex);
            addGate('CNOT', gate.wireIndex, gate.controlWire);
            addGate('T', gate.wireIndex);
            addGate('CNOT', gate.wireIndex, gate.controlWire2);
            addGate('T', gate.wireIndex);
            addGate('CNOT', gate.wireIndex, gate.controlWire);
            addGate('T', gate.wireIndex);
            addGate('H', gate.wireIndex);
            addGate('T', gate.controlWire2);
            addGate('CNOT', gate.controlWire2, gate.controlWire);
            addGate('T', gate.controlWire2);
            addGate('CNOT', gate.controlWire2, gate.controlWire);
          }
          break;
          
        case 'CSWAP': // Fredkin = CNOT + Toffoli + CNOT (simplified)
          if (gate.controlWire !== undefined) {
            const target2 = gate.wireIndex < wires.length - 1 ? gate.wireIndex + 1 : gate.wireIndex - 1;
            addGate('CNOT', target2, gate.wireIndex);
            // Simplified Toffoli in middle
            addGate('H', gate.wireIndex);
            addGate('CNOT', gate.wireIndex, target2);
            addGate('T', gate.wireIndex);
            addGate('CNOT', gate.wireIndex, gate.controlWire);
            addGate('T', gate.wireIndex);
            addGate('CNOT', gate.wireIndex, target2);
            addGate('H', gate.wireIndex);
            addGate('CNOT', target2, gate.wireIndex);
          }
          break;
          
        default:
          // Keep unknown gates as-is
          addGate(gate.type, gate.wireIndex, gate.controlWire, gate.controlWire2);
      }
    }
    
    const originalCount = gates.length;
    setGates(transpiled);
    setExecutedState(null);
    setMeasurementResult(null);
    setHistory(prev => [...prev, `Transpiled: ${originalCount} gates → ${transpiled.length} gates (H, T, CNOT)`]);
  }, [gates, wires.length]);

  // Circuit verification - check for common errors
  const verifyCircuit = useCallback(() => {
    const errors: VerificationError[] = [];
    
    for (const gate of gates) {
      // Check if target wire exists
      if (gate.wireIndex < 0 || gate.wireIndex >= wires.length) {
        errors.push({
          gateId: gate.id,
          type: 'error',
          message: `${gate.type} gate targets non-existent qubit q[${gate.wireIndex}]`,
        });
      }
      
      // Check control wire for controlled gates
      if (gate.controlWire !== undefined) {
        if (gate.controlWire < 0 || gate.controlWire >= wires.length) {
          errors.push({
            gateId: gate.id,
            type: 'error',
            message: `${gate.type} control wire q[${gate.controlWire}] doesn't exist`,
          });
        }
        if (gate.controlWire === gate.wireIndex) {
          errors.push({
            gateId: gate.id,
            type: 'error',
            message: `${gate.type} control and target cannot be same qubit`,
          });
        }
      }
      
      // Check second control wire for 3-qubit gates
      if (gate.controlWire2 !== undefined) {
        if (gate.controlWire2 < 0 || gate.controlWire2 >= wires.length) {
          errors.push({
            gateId: gate.id,
            type: 'error',
            message: `${gate.type} second control q[${gate.controlWire2}] doesn't exist`,
          });
        }
        if (gate.controlWire2 === gate.wireIndex || gate.controlWire2 === gate.controlWire) {
          errors.push({
            gateId: gate.id,
            type: 'error',
            message: `${gate.type} requires 3 distinct qubits`,
          });
        }
      }
      
      // Check 3-qubit gates have enough qubits
      if (['CCX', 'CSWAP'].includes(gate.type) && wires.length < 3) {
        errors.push({
          gateId: gate.id,
          type: 'error',
          message: `${gate.type} requires at least 3 qubits`,
        });
      }
      
      // Warning for controlled gates without control wire set
      if (['CNOT', 'CZ', 'CPHASE'].includes(gate.type) && gate.controlWire === undefined) {
        errors.push({
          gateId: gate.id,
          type: 'warning',
          message: `${gate.type} has no control wire set`,
        });
      }
    }
    
    // Check for duplicate gates at same position/wire
    const positionMap = new Map<string, GateInstance[]>();
    for (const gate of gates) {
      const key = `${gate.wireIndex}-${gate.position}`;
      if (!positionMap.has(key)) positionMap.set(key, []);
      positionMap.get(key)!.push(gate);
    }
    for (const [key, gatesAtPos] of positionMap) {
      if (gatesAtPos.length > 1) {
        errors.push({
          gateId: gatesAtPos[1].id,
          type: 'warning',
          message: `Multiple gates at position ${key}`,
        });
      }
    }
    
    setVerificationErrors(errors);
    
    const errorCount = errors.filter(e => e.type === 'error').length;
    const warningCount = errors.filter(e => e.type === 'warning').length;
    
    if (errors.length === 0) {
      setHistory(prev => [...prev, '✓ Circuit verified: no issues found']);
    } else {
      setHistory(prev => [...prev, `⚠ Verification: ${errorCount} error(s), ${warningCount} warning(s)`]);
    }
  }, [gates, wires.length]);

  // Circuit depth analysis (defined before simulateNoise which depends on it)
  const circuitDepth = useMemo(() => {
    if (gates.length === 0) return { depth: 0, layers: [], criticalPath: 0, totalOps: 0, avgParallelism: 0 };
    
    // Group gates by position (parallel layer)
    const positionGroups = new Map<number, GateInstance[]>();
    gates.forEach(g => {
      const pos = g.position;
      if (!positionGroups.has(pos)) positionGroups.set(pos, []);
      positionGroups.get(pos)!.push(g);
    });
    
    const positions = Array.from(positionGroups.keys()).sort((a, b) => a - b);
    const layers = positions.map(pos => ({
      position: pos,
      gates: positionGroups.get(pos)!,
      parallelism: positionGroups.get(pos)!.length,
    }));
    
    const depth = layers.length;
    const totalOps = gates.length;
    const avgParallelism = depth > 0 ? totalOps / depth : 0;
    
    return { depth, layers, criticalPath: depth, totalOps, avgParallelism };
  }, [gates]);

  // Noise simulation - model gate errors and decoherence
  const simulateNoise = useCallback(() => {
    if (!executedState) return;
    
    const numWires = wires.length;
    const dimensions = Math.pow(2, numWires);
    
    // Start from initial |0...0⟩ state
    let noisyState: ComplexNumber[] = Array.from({ length: dimensions }, (_, i) => 
      i === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
    );
    
    const sortedGates = [...gates].sort((a, b) => a.position - b.position);
    let totalErrorProb = 0;
    let seedOffset = measurementSeed;
    
    for (const gate of sortedGates) {
      // Apply ideal gate
      noisyState = applyGateToState(noisyState, gate.type, gate.wireIndex, numWires, gate.controlWire, gate.controlWire2);
      
      // Apply depolarizing noise with probability = noiseLevel
      // Two-qubit gates have higher error rate
      const is2QubitGate = ['CNOT', 'CZ', 'CPHASE', 'SWAP'].includes(gate.type);
      const is3QubitGate = ['CCX', 'CSWAP'].includes(gate.type);
      const gateErrorRate = is3QubitGate ? noiseLevel * 5 : is2QubitGate ? noiseLevel * 2 : noiseLevel;
      
      totalErrorProb += gateErrorRate * (1 - totalErrorProb); // Accumulated error
      
      // Apply random Pauli error with small probability
      const rand = seededRandom(seedOffset++);
      if (rand < gateErrorRate) {
        // Apply random X, Y, or Z error
        const errorType = Math.floor(seededRandom(seedOffset++) * 3);
        const pauliGate: GateType = ['X', 'Y', 'Z'][errorType] as GateType;
        noisyState = applyGateToState(noisyState, pauliGate, gate.wireIndex, numWires);
      }
    }
    
    // Apply T2 decoherence (phase damping)
    const decoherenceRate = noiseLevel * circuitDepth.depth * 0.05;
    for (let i = 0; i < noisyState.length; i++) {
      const dampingFactor = 1 - decoherenceRate * seededRandom(seedOffset + i);
      // Phase randomization (simplified)
      const phaseNoise = (seededRandom(seedOffset + i + 1000) - 0.5) * decoherenceRate * Math.PI;
      const cos = Math.cos(phaseNoise);
      const sin = Math.sin(phaseNoise);
      noisyState[i] = {
        real: (noisyState[i].real * cos - noisyState[i].imag * sin) * dampingFactor,
        imag: (noisyState[i].real * sin + noisyState[i].imag * cos) * dampingFactor,
      };
    }
    
    // Renormalize
    const norm = Math.sqrt(noisyState.reduce((sum, s) => sum + s.real * s.real + s.imag * s.imag, 0)) || 1;
    noisyState = noisyState.map(s => ({ real: s.real / norm, imag: s.imag / norm }));
    
    // Calculate fidelity: |⟨ideal|noisy⟩|²
    let innerProductReal = 0;
    let innerProductImag = 0;
    for (let i = 0; i < executedState.length; i++) {
      innerProductReal += executedState[i].real * noisyState[i].real + executedState[i].imag * noisyState[i].imag;
      innerProductImag += executedState[i].real * noisyState[i].imag - executedState[i].imag * noisyState[i].real;
    }
    const fidelity = innerProductReal * innerProductReal + innerProductImag * innerProductImag;
    
    setNoiseResult({
      fidelity: Math.max(0, Math.min(1, fidelity)),
      errorRate: totalErrorProb,
      decoherenceEffect: decoherenceRate,
      noisyState,
    });
    
    setHistory(prev => [...prev, `Noise sim: fidelity=${(fidelity * 100).toFixed(1)}%, error rate=${(totalErrorProb * 100).toFixed(2)}%`]);
  }, [executedState, gates, wires.length, noiseLevel, measurementSeed, circuitDepth.depth]);

  const sedenionState = useMemo(() => {
    if (!executedState) return Array(16).fill(0);
    return stateToSedenion(executedState);
  }, [executedState]);

  const entropy = useMemo(() => {
    if (!executedState) return 0;
    return computeEntropy(executedState);
  }, [executedState]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/quantum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Quantum Examples
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">Quantum Circuit Runner</h1>
            <p className="text-muted-foreground">
              Build and simulate quantum circuits with tinyaleph's hypercomplex state representation
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr_280px] gap-6">
          {/* Left Panel - Gates & Controls */}
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Quantum Gates
              </h2>
              <GatePalette onDragStart={handleDragStart} />
              <p className="text-xs text-muted-foreground mt-3">Drag gates onto the circuit wires</p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Presets
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {ALGORITHM_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 flex flex-col items-start"
                    onClick={() => loadPreset(preset)}
                    title={preset.description}
                  >
                    <span className="font-semibold">{preset.name}</span>
                    <span className="text-muted-foreground text-[10px]">{preset.numQubits}q</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold mb-4">Controls</h2>
              <div className="flex flex-col gap-2">
                <Button onClick={addWire} variant="outline" className="w-full" disabled={wires.length >= 4}>
                  <Plus className="w-4 h-4 mr-2" /> Add Qubit
                </Button>
                <Button onClick={executeCircuit} className="w-full" disabled={gates.length === 0}>
                  <Play className="w-4 h-4 mr-2" /> Execute
                </Button>
                <Button 
                  onClick={measureState} 
                  variant="secondary" 
                  className="w-full" 
                  disabled={!executedState}
                >
                  <Target className="w-4 h-4 mr-2" /> Measure (1024 shots)
                </Button>
                <Button onClick={optimizeCircuit} variant="outline" className="w-full" disabled={gates.length < 2}>
                  <Wand2 className="w-4 h-4 mr-2" /> Optimize
                </Button>
                <Button onClick={transpileCircuit} variant="outline" className="w-full" disabled={gates.length === 0}>
                  <GitBranch className="w-4 h-4 mr-2" /> Transpile (H,T,CNOT)
                </Button>
                <div className="flex gap-2 pt-2 border-t border-border mt-2">
                  <Button onClick={verifyCircuit} variant="outline" size="sm" className="flex-1" disabled={gates.length === 0}>
                    <ShieldCheck className="w-4 h-4 mr-1" /> Verify
                  </Button>
                  <Button onClick={simulateNoise} variant="outline" size="sm" className="flex-1" disabled={!executedState}>
                    <Activity className="w-4 h-4 mr-1" /> Noise
                  </Button>
                </div>
                <Button onClick={resetCircuit} variant="destructive" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <div className="flex gap-2 pt-2 border-t border-border mt-2">
                  <Button onClick={exportCircuit} variant="outline" size="sm" className="flex-1" disabled={gates.length === 0}>
                    <Download className="w-4 h-4 mr-1" /> Export
                  </Button>
                  <label className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-1" /> Import
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importCircuit}
                      className="hidden"
                    />
                  </label>
                </div>
                {/* Noise level slider */}
                <div className="pt-2 border-t border-border mt-2">
                  <label className="text-xs text-muted-foreground">
                    Gate Error Rate: {(noiseLevel * 100).toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.1"
                    step="0.005"
                    value={noiseLevel}
                    onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Verification Results */}
            {verificationErrors.length > 0 && (
              <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                <h2 className="text-sm font-semibold mb-2 flex items-center gap-2 text-destructive">
                  <ShieldCheck className="w-4 h-4" /> Verification Issues
                </h2>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {verificationErrors.map((err, i) => (
                    <div 
                      key={i} 
                      className={`text-xs py-1 px-2 rounded ${
                        err.type === 'error' ? 'bg-destructive/20 text-destructive' : 'bg-yellow-500/20 text-yellow-600'
                      }`}
                    >
                      {err.type === 'error' ? '✗' : '⚠'} {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Noise Simulation Results */}
            {noiseResult && (
              <div className="p-4 rounded-lg border border-border bg-card">
                <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Noise Simulation
                </h2>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-muted/30 rounded p-2">
                    <p className={`text-lg font-mono ${noiseResult.fidelity > 0.9 ? 'text-green-500' : noiseResult.fidelity > 0.7 ? 'text-yellow-500' : 'text-destructive'}`}>
                      {(noiseResult.fidelity * 100).toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Fidelity</p>
                  </div>
                  <div className="bg-muted/30 rounded p-2">
                    <p className="text-lg font-mono text-muted-foreground">
                      {(noiseResult.errorRate * 100).toFixed(2)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Error Rate</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Decoherence: {(noiseResult.decoherenceEffect * 100).toFixed(3)}%
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg border border-border bg-card max-h-48 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-2">History</h2>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No actions yet</p>
              ) : (
                <div className="space-y-1">
                  {history.slice(-8).map((item, i) => (
                    <div key={i} className="text-xs text-muted-foreground py-1 border-b border-border/50 last:border-0">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center - Circuit Builder */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <GripVertical className="w-5 h-5" /> Circuit
            </h2>
            <div className="relative min-h-[300px]">
              {/* Control Lines Overlay for controlled gates */}
              <svg className="absolute inset-0 pointer-events-none z-20" style={{ overflow: 'visible' }}>
                {/* 2-qubit controlled gates */}
                {gates.filter(g => ['CNOT', 'CZ', 'CPHASE'].includes(g.type) && g.controlWire !== undefined).map((gate) => {
                  const controlY = (gate.controlWire! * 66) + 33;
                  const targetY = (gate.wireIndex * 66) + 33;
                  const slotX = 80 + (gate.position * 52) + 24;
                  const minY = Math.min(controlY, targetY);
                  const maxY = Math.max(controlY, targetY);
                  
                  const isCNOT = gate.type === 'CNOT';
                  const strokeColor = gate.type === 'CZ' ? 'hsl(239, 84%, 67%)' : 
                                     gate.type === 'CPHASE' ? 'hsl(168, 76%, 42%)' : 
                                     'hsl(var(--primary))';
                  
                  return (
                    <g key={`control-line-${gate.id}`}>
                      <line x1={slotX} y1={minY + 12} x2={slotX} y2={maxY - 12}
                        stroke={strokeColor} strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx={slotX} cy={controlY} r="6" fill={strokeColor}
                        stroke="hsl(var(--primary-foreground))" strokeWidth="1" />
                      {isCNOT ? (
                        <>
                          <circle cx={slotX} cy={targetY} r="8" fill="none" stroke={strokeColor} strokeWidth="2" />
                          <line x1={slotX - 6} y1={targetY} x2={slotX + 6} y2={targetY} stroke={strokeColor} strokeWidth="2" />
                          <line x1={slotX} y1={targetY - 6} x2={slotX} y2={targetY + 6} stroke={strokeColor} strokeWidth="2" />
                        </>
                      ) : (
                        <circle cx={slotX} cy={targetY} r="6" fill={strokeColor}
                          stroke="hsl(var(--primary-foreground))" strokeWidth="1" />
                      )}
                    </g>
                  );
                })}
                
                {/* 3-qubit controlled gates (CCX, CSWAP) */}
                {gates.filter(g => ['CCX', 'CSWAP'].includes(g.type) && g.controlWire !== undefined).map((gate) => {
                  const control1Y = (gate.controlWire! * 66) + 33;
                  const control2Y = gate.controlWire2 !== undefined ? (gate.controlWire2 * 66) + 33 : control1Y;
                  const targetY = (gate.wireIndex * 66) + 33;
                  const slotX = 80 + (gate.position * 52) + 24;
                  const minY = Math.min(control1Y, control2Y, targetY);
                  const maxY = Math.max(control1Y, control2Y, targetY);
                  
                  const isCCX = gate.type === 'CCX';
                  const strokeColor = isCCX ? 'hsl(351, 74%, 47%)' : 'hsl(38, 92%, 50%)';
                  
                  return (
                    <g key={`control-line-${gate.id}`}>
                      <line x1={slotX} y1={minY + 12} x2={slotX} y2={maxY - 12}
                        stroke={strokeColor} strokeWidth="2" strokeDasharray="4 2" />
                      {/* First control dot */}
                      <circle cx={slotX} cy={control1Y} r="6" fill={strokeColor}
                        stroke="hsl(var(--primary-foreground))" strokeWidth="1" />
                      {/* Second control dot */}
                      {gate.controlWire2 !== undefined && (
                        <circle cx={slotX} cy={control2Y} r="6" fill={strokeColor}
                          stroke="hsl(var(--primary-foreground))" strokeWidth="1" />
                      )}
                      {isCCX ? (
                        <>
                          <circle cx={slotX} cy={targetY} r="8" fill="none" stroke={strokeColor} strokeWidth="2" />
                          <line x1={slotX - 6} y1={targetY} x2={slotX + 6} y2={targetY} stroke={strokeColor} strokeWidth="2" />
                          <line x1={slotX} y1={targetY - 6} x2={slotX} y2={targetY + 6} stroke={strokeColor} strokeWidth="2" />
                        </>
                      ) : (
                        /* CSWAP - show X markers for swap targets */
                        <>
                          <line x1={slotX - 5} y1={targetY - 5} x2={slotX + 5} y2={targetY + 5} stroke={strokeColor} strokeWidth="2" />
                          <line x1={slotX - 5} y1={targetY + 5} x2={slotX + 5} y2={targetY - 5} stroke={strokeColor} strokeWidth="2" />
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
              
              {/* Wire rows */}
              <div className="space-y-3">
                {wires.map((wire, idx) => (
                  <WireDisplay
                    key={wire.id}
                    wire={wire}
                    wireIndex={idx}
                    gates={gates.filter(g => g.wireIndex === idx)}
                    onDropGate={(pos) => handleDropGate(idx, pos)}
                    onRemoveGate={removeGate}
                    isActive={draggedGate !== null}
                    numWires={wires.length}
                  />
                ))}
              </div>
            </div>
            
            {gates.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">Drag gates from the left panel onto the wires</p>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            {/* Circuit Depth Analysis */}
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
                  <p className="text-2xl font-mono text-primary">
                    {circuitDepth.avgParallelism ? circuitDepth.avgParallelism.toFixed(1) : '0'}×
                  </p>
                  <p className="text-[10px] text-muted-foreground">Parallelism</p>
                </div>
              </div>
              {circuitDepth.layers.length > 0 && (
                <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
                  {circuitDepth.layers.map((layer, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-6 bg-primary/20 rounded text-center text-[10px] font-mono"
                      style={{ height: `${Math.max(16, layer.parallelism * 12)}px` }}
                      title={`Layer ${layer.position}: ${layer.parallelism} gate(s)`}
                    >
                      {layer.parallelism}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Circle className="w-5 h-5" /> Bloch Sphere
              </h2>
              {executedState ? (
                <BlochSphere state={executedState} />
              ) : (
                <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                  Execute to see
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Amplitudes
              </h2>
              {executedState ? (
                <AmplitudePlot state={executedState} />
              ) : (
                <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                  Execute to see
                </div>
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

            {executedState && (
              <div className="p-4 rounded-lg border border-border bg-card">
                <h2 className="text-sm font-semibold mb-2">State Vector</h2>
                <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                  {executedState.map((s, i) => {
                    const amp = Math.sqrt(s.real * s.real + s.imag * s.imag);
                    if (amp < 0.001) return null;
                    const binaryLabel = i.toString(2).padStart(wires.length, '0');
                    return (
                      <div key={i} className="flex justify-between text-muted-foreground">
                        <span className="text-primary">|{binaryLabel}⟩</span>
                        <span>{s.real >= 0 ? '+' : ''}{s.real.toFixed(3)}{s.imag >= 0 ? '+' : ''}{s.imag.toFixed(3)}i</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {measurementResult && (
              <div className="p-4 rounded-lg border border-border bg-card">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Measurement Results
                </h2>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground mb-2">
                    {measurementResult.shots} shots → collapsed to |{measurementResult.collapsed}⟩
                  </div>
                  <div className="space-y-1">
                    {Object.entries(measurementResult.counts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([state, count]) => {
                        const percentage = (count / measurementResult.shots) * 100;
                        return (
                          <div key={state} className="flex items-center gap-2">
                            <span className="font-mono text-xs text-primary w-12">|{state}⟩</span>
                            <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                              <div 
                                className="h-full bg-primary/70 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-16 text-right">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Code Example */}
          <div className="mt-8 p-4 rounded-lg border border-border bg-card">
            <h2 className="text-lg font-semibold text-primary mb-4">TinyAleph Integration</h2>
            <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{generateCodeExample(wires.length, gates, entropy)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumCircuitRunner;
