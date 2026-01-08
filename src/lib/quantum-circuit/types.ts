// Gate definitions with colors, descriptions, and unitary matrices
export const GATE_DEFINITIONS = {
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
  RZ: {
    name: 'Rz(θ)',
    color: 'bg-violet-500',
    description: 'Z-rotation by θ',
    matrix: '[[1, 0], [0, e^(iθ)]]'
  },
} as const;

export type GateType = keyof typeof GATE_DEFINITIONS;

export interface GateInstance {
  id: string;
  type: GateType;
  wireIndex: number;
  position: number;
  controlWire?: number;
  controlWire2?: number;
  parameter?: number; // For parameterized gates like RZ
}

export interface Wire {
  id: number;
  label: string;
}

export interface ComplexNumber {
  real: number;
  imag: number;
}

export interface MeasurementResult {
  shots: number;
  counts: Record<string, number>;
  collapsed: string;
}

export interface AlgorithmPreset {
  name: string;
  description: string;
  numQubits: number;
  gates: Array<{ type: string; wireIndex: number; position: number; controlWire?: number; controlWire2?: number; parameter?: number }>;
  category?: 'basic' | 'algorithms' | 'error-correction' | 'variational' | 'communication' | 'gates';
}

export interface CircuitMetrics {
  gateCount: number;
  depth: number;
  twoQubitGates: number;
  estimatedTimeNs: number; // Estimated execution time in nanoseconds
}

// Gate execution times in nanoseconds (typical superconducting qubit values)
const GATE_TIMES: Record<string, number> = {
  H: 20, X: 20, Y: 20, Z: 10, S: 10, T: 10,
  RZ: 10, RX: 20, RY: 20,
  CNOT: 40, CZ: 40, CPHASE: 40, SWAP: 120,
  CCX: 200, CSWAP: 300,
};

export function calculateCircuitMetrics(preset: AlgorithmPreset): CircuitMetrics {
  const gates = preset.gates;
  const gateCount = gates.length;
  
  // Calculate depth by finding max position + 1
  const depth = gates.length > 0 ? Math.max(...gates.map(g => g.position)) + 1 : 0;
  
  // Count two-qubit (and three-qubit) gates
  const multiQubitGates = ['CNOT', 'CZ', 'CPHASE', 'SWAP', 'CCX', 'CSWAP'];
  const twoQubitGates = gates.filter(g => multiQubitGates.includes(g.type)).length;
  
  // Estimate execution time (simplified: assume sequential execution per layer)
  // Group gates by position for parallel execution estimation
  const layers: Map<number, string[]> = new Map();
  gates.forEach(g => {
    const existing = layers.get(g.position) || [];
    existing.push(g.type);
    layers.set(g.position, existing);
  });
  
  let estimatedTimeNs = 0;
  layers.forEach(layerGates => {
    // Take the max time in each layer (parallel execution)
    const layerTime = Math.max(...layerGates.map(type => GATE_TIMES[type] || 20));
    estimatedTimeNs += layerTime;
  });
  
  return { gateCount, depth, twoQubitGates, estimatedTimeNs };
}

export interface VerificationError {
  gateId: string;
  type: 'error' | 'warning';
  message: string;
}

export interface NoiseSimResult {
  fidelity: number;
  errorRate: number;
  decoherenceEffect: number;
  noisyState: ComplexNumber[] | null;
}

export interface ComparisonResult {
  idealState: ComplexNumber[];
  noisyState: ComplexNumber[];
  fidelity: number;
  stateOverlap: number[];
  idealProbs: number[];
  noisyProbs: number[];
  probDifference: number[];
}

export interface CircuitDepthInfo {
  depth: number;
  layers: Array<{ position: number; gates: GateInstance[]; parallelism: number }>;
  criticalPath: number;
  totalOps: number;
  avgParallelism: number;
}

export interface ParameterSweepResult {
  parameterValues: number[];
  energies: number[];
  minEnergy: number;
  optimalParameter: number;
}

export interface TomographyResult {
  densityMatrix: ComplexNumber[][];
  purity: number;
  vonNeumannEntropy: number;
  xBasisProbs: number[];
  yBasisProbs: number[];
  zBasisProbs: number[];
}
