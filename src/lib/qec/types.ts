// Quantum Error Correction Types

export type ErrorType = 'none' | 'bit_flip' | 'phase_flip' | 'both';

export type CodeType = 'bit_flip_3' | 'phase_flip_3' | 'shor_9' | 'steane_7';

export interface PhysicalQubit {
  index: number;
  state: [number, number]; // [α, β] for α|0⟩ + β|1⟩
  error: ErrorType;
  hasError: boolean;
}

export interface Syndrome {
  id: string;
  name: string;
  qubits: number[]; // Which qubits are measured
  value: 0 | 1;
  description: string;
}

export interface CorrectionOperation {
  type: 'X' | 'Z' | 'Y';
  qubit: number;
  reason: string;
}

export interface LogicalQubit {
  alpha: number;
  beta: number;
  fidelity: number;
  isProtected: boolean;
}

export interface QECState {
  codeType: CodeType;
  physicalQubits: PhysicalQubit[];
  syndromes: Syndrome[];
  logicalQubit: LogicalQubit;
  corrections: CorrectionOperation[];
  step: 'idle' | 'encoded' | 'error_injected' | 'syndrome_measured' | 'corrected';
  errorHistory: { qubit: number; type: ErrorType; corrected: boolean }[];
  stats: {
    totalErrors: number;
    correctedErrors: number;
    uncorrectedErrors: number;
  };
}

export interface CodeInfo {
  type: CodeType;
  name: string;
  numPhysical: number;
  numLogical: number;
  distance: number;
  correctable: string;
  description: string;
}

export const CODE_INFO: Record<CodeType, CodeInfo> = {
  bit_flip_3: {
    type: 'bit_flip_3',
    name: '3-Qubit Bit-Flip Code',
    numPhysical: 3,
    numLogical: 1,
    distance: 3,
    correctable: 'Single X error',
    description: 'Encodes |0⟩→|000⟩, |1⟩→|111⟩. Detects and corrects single bit-flip (X) errors using parity checks.',
  },
  phase_flip_3: {
    type: 'phase_flip_3',
    name: '3-Qubit Phase-Flip Code',
    numPhysical: 3,
    numLogical: 1,
    distance: 3,
    correctable: 'Single Z error',
    description: 'Encodes |0⟩→|+++⟩, |1⟩→|---⟩. Detects and corrects single phase-flip (Z) errors.',
  },
  shor_9: {
    type: 'shor_9',
    name: 'Shor 9-Qubit Code',
    numPhysical: 9,
    numLogical: 1,
    distance: 3,
    correctable: 'Any single-qubit error',
    description: 'Combines bit-flip and phase-flip codes. Can correct any single-qubit error (X, Z, or Y).',
  },
  steane_7: {
    type: 'steane_7',
    name: 'Steane 7-Qubit Code',
    numPhysical: 7,
    numLogical: 1,
    distance: 3,
    correctable: 'Any single-qubit error',
    description: 'CSS code based on Hamming [7,4,3] code. Efficient for fault-tolerant computation.',
  },
};
