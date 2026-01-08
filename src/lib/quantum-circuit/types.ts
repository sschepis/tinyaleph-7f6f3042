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
  gates: Array<{ type: string; wireIndex: number; position: number; controlWire?: number; parameter?: number }>;
  category?: 'basic' | 'error-correction' | 'variational';
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
