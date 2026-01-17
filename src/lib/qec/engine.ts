// Quantum Error Correction Engine

import {
  QECState,
  CodeType,
  PhysicalQubit,
  Syndrome,
  CorrectionOperation,
  LogicalQubit,
  ErrorType,
  CODE_INFO,
} from './types';

/**
 * Initialize QEC state for a given code type
 */
export function initializeQEC(codeType: CodeType): QECState {
  const info = CODE_INFO[codeType];
  const physicalQubits: PhysicalQubit[] = [];
  
  for (let i = 0; i < info.numPhysical; i++) {
    physicalQubits.push({
      index: i,
      state: [1, 0], // |0⟩
      error: 'none',
      hasError: false,
    });
  }
  
  return {
    codeType,
    physicalQubits,
    syndromes: getSyndromeStructure(codeType),
    logicalQubit: { alpha: 1, beta: 0, fidelity: 1, isProtected: false },
    corrections: [],
    step: 'idle',
    errorHistory: [],
    stats: { totalErrors: 0, correctedErrors: 0, uncorrectedErrors: 0 },
  };
}

/**
 * Get syndrome structure for a code type
 */
function getSyndromeStructure(codeType: CodeType): Syndrome[] {
  switch (codeType) {
    case 'bit_flip_3':
      return [
        { id: 's1', name: 'Z₁Z₂', qubits: [0, 1], value: 0, description: 'Parity of qubits 1 and 2' },
        { id: 's2', name: 'Z₂Z₃', qubits: [1, 2], value: 0, description: 'Parity of qubits 2 and 3' },
      ];
    case 'phase_flip_3':
      return [
        { id: 's1', name: 'X₁X₂', qubits: [0, 1], value: 0, description: 'Parity in X basis' },
        { id: 's2', name: 'X₂X₃', qubits: [1, 2], value: 0, description: 'Parity in X basis' },
      ];
    case 'shor_9':
      return [
        { id: 's1', name: 'Z₁Z₂', qubits: [0, 1], value: 0, description: 'Block 1 bit parity 1' },
        { id: 's2', name: 'Z₂Z₃', qubits: [1, 2], value: 0, description: 'Block 1 bit parity 2' },
        { id: 's3', name: 'Z₄Z₅', qubits: [3, 4], value: 0, description: 'Block 2 bit parity 1' },
        { id: 's4', name: 'Z₅Z₆', qubits: [4, 5], value: 0, description: 'Block 2 bit parity 2' },
        { id: 's5', name: 'Z₇Z₈', qubits: [6, 7], value: 0, description: 'Block 3 bit parity 1' },
        { id: 's6', name: 'Z₈Z₉', qubits: [7, 8], value: 0, description: 'Block 3 bit parity 2' },
        { id: 's7', name: 'X₁₂₃X₄₅₆', qubits: [0, 1, 2, 3, 4, 5], value: 0, description: 'Phase parity blocks 1-2' },
        { id: 's8', name: 'X₄₅₆X₇₈₉', qubits: [3, 4, 5, 6, 7, 8], value: 0, description: 'Phase parity blocks 2-3' },
      ];
    case 'steane_7':
      return [
        { id: 's1', name: 'Z₁Z₃Z₅Z₇', qubits: [0, 2, 4, 6], value: 0, description: 'Z stabilizer 1' },
        { id: 's2', name: 'Z₂Z₃Z₆Z₇', qubits: [1, 2, 5, 6], value: 0, description: 'Z stabilizer 2' },
        { id: 's3', name: 'Z₄Z₅Z₆Z₇', qubits: [3, 4, 5, 6], value: 0, description: 'Z stabilizer 3' },
        { id: 's4', name: 'X₁X₃X₅X₇', qubits: [0, 2, 4, 6], value: 0, description: 'X stabilizer 1' },
        { id: 's5', name: 'X₂X₃X₆X₇', qubits: [1, 2, 5, 6], value: 0, description: 'X stabilizer 2' },
        { id: 's6', name: 'X₄X₅X₆X₇', qubits: [3, 4, 5, 6], value: 0, description: 'X stabilizer 3' },
      ];
    default:
      return [];
  }
}

/**
 * Encode the logical qubit into physical qubits
 */
export function encodeLogicalQubit(
  state: QECState,
  alpha: number,
  beta: number
): QECState {
  const normalizer = Math.sqrt(alpha * alpha + beta * beta);
  const normAlpha = alpha / normalizer;
  const normBeta = beta / normalizer;
  
  const physicalQubits = state.physicalQubits.map((q, i) => ({
    ...q,
    state: [normAlpha, normBeta] as [number, number],
    error: 'none' as ErrorType,
    hasError: false,
  }));
  
  return {
    ...state,
    physicalQubits,
    logicalQubit: {
      alpha: normAlpha,
      beta: normBeta,
      fidelity: 1,
      isProtected: true,
    },
    syndromes: state.syndromes.map(s => ({ ...s, value: 0 as const })),
    corrections: [],
    step: 'encoded',
  };
}

/**
 * Inject an error on a specific qubit
 */
export function injectError(
  state: QECState,
  qubitIndex: number,
  errorType: ErrorType
): QECState {
  if (qubitIndex < 0 || qubitIndex >= state.physicalQubits.length) {
    return state;
  }
  
  const physicalQubits = state.physicalQubits.map((q, i) => {
    if (i === qubitIndex) {
      return {
        ...q,
        error: errorType,
        hasError: errorType !== 'none',
        state: applyErrorToState(q.state, errorType),
      };
    }
    return q;
  });
  
  // Calculate new fidelity based on errors
  const errorCount = physicalQubits.filter(q => q.hasError).length;
  const maxCorrectableErrors = state.codeType === 'bit_flip_3' || state.codeType === 'phase_flip_3' ? 1 : 1;
  const fidelity = errorCount <= maxCorrectableErrors ? 1 : Math.max(0, 1 - (errorCount - maxCorrectableErrors) * 0.5);
  
  return {
    ...state,
    physicalQubits,
    logicalQubit: {
      ...state.logicalQubit,
      fidelity,
    },
    step: 'error_injected',
    errorHistory: [
      ...state.errorHistory,
      { qubit: qubitIndex, type: errorType, corrected: false },
    ],
    stats: {
      ...state.stats,
      totalErrors: state.stats.totalErrors + (errorType !== 'none' ? 1 : 0),
    },
  };
}

/**
 * Apply error to qubit state
 */
function applyErrorToState(state: [number, number], errorType: ErrorType): [number, number] {
  const [alpha, beta] = state;
  switch (errorType) {
    case 'bit_flip':
      return [beta, alpha]; // X gate swaps |0⟩ and |1⟩
    case 'phase_flip':
      return [alpha, -beta]; // Z gate adds phase to |1⟩
    case 'both':
      return [-beta, alpha]; // Y = iXZ
    default:
      return state;
  }
}

/**
 * Measure syndromes to detect errors
 */
export function measureSyndromes(state: QECState): QECState {
  const syndromes = state.syndromes.map(syndrome => {
    const value = calculateSyndromeValue(state, syndrome);
    return { ...syndrome, value };
  });
  
  return {
    ...state,
    syndromes,
    step: 'syndrome_measured',
  };
}

/**
 * Calculate syndrome value based on qubit states
 */
function calculateSyndromeValue(state: QECState, syndrome: Syndrome): 0 | 1 {
  // For bit-flip code: check if odd number of qubits have bit-flip errors
  // For phase-flip code: check if odd number have phase errors
  
  let parity = 0;
  
  for (const qubitIdx of syndrome.qubits) {
    const qubit = state.physicalQubits[qubitIdx];
    if (qubit) {
      // Syndrome detects errors based on code type
      if (state.codeType === 'bit_flip_3' || state.codeType === 'shor_9') {
        if (qubit.error === 'bit_flip' || qubit.error === 'both') {
          parity ^= 1;
        }
      }
      if (state.codeType === 'phase_flip_3') {
        if (qubit.error === 'phase_flip' || qubit.error === 'both') {
          parity ^= 1;
        }
      }
    }
  }
  
  return parity as 0 | 1;
}

/**
 * Determine correction operations from syndromes
 */
export function determineCorrections(state: QECState): CorrectionOperation[] {
  const corrections: CorrectionOperation[] = [];
  
  switch (state.codeType) {
    case 'bit_flip_3': {
      const s1 = state.syndromes.find(s => s.id === 's1')?.value ?? 0;
      const s2 = state.syndromes.find(s => s.id === 's2')?.value ?? 0;
      
      if (s1 === 1 && s2 === 0) {
        corrections.push({ type: 'X', qubit: 0, reason: 'Syndrome (1,0) indicates error on qubit 1' });
      } else if (s1 === 1 && s2 === 1) {
        corrections.push({ type: 'X', qubit: 1, reason: 'Syndrome (1,1) indicates error on qubit 2' });
      } else if (s1 === 0 && s2 === 1) {
        corrections.push({ type: 'X', qubit: 2, reason: 'Syndrome (0,1) indicates error on qubit 3' });
      }
      break;
    }
    case 'phase_flip_3': {
      const s1 = state.syndromes.find(s => s.id === 's1')?.value ?? 0;
      const s2 = state.syndromes.find(s => s.id === 's2')?.value ?? 0;
      
      if (s1 === 1 && s2 === 0) {
        corrections.push({ type: 'Z', qubit: 0, reason: 'Syndrome (1,0) indicates phase error on qubit 1' });
      } else if (s1 === 1 && s2 === 1) {
        corrections.push({ type: 'Z', qubit: 1, reason: 'Syndrome (1,1) indicates phase error on qubit 2' });
      } else if (s1 === 0 && s2 === 1) {
        corrections.push({ type: 'Z', qubit: 2, reason: 'Syndrome (0,1) indicates phase error on qubit 3' });
      }
      break;
    }
    case 'shor_9':
    case 'steane_7':
      // Simplified: detect first error location
      for (let i = 0; i < state.physicalQubits.length; i++) {
        const qubit = state.physicalQubits[i];
        if (qubit.hasError) {
          if (qubit.error === 'bit_flip') {
            corrections.push({ type: 'X', qubit: i, reason: `Detected bit-flip on qubit ${i + 1}` });
          } else if (qubit.error === 'phase_flip') {
            corrections.push({ type: 'Z', qubit: i, reason: `Detected phase-flip on qubit ${i + 1}` });
          } else if (qubit.error === 'both') {
            corrections.push({ type: 'Y', qubit: i, reason: `Detected both errors on qubit ${i + 1}` });
          }
          break; // Only correct first error for simplicity
        }
      }
      break;
  }
  
  return corrections;
}

/**
 * Apply correction operations
 */
export function applyCorrections(state: QECState): QECState {
  const corrections = determineCorrections(state);
  
  if (corrections.length === 0) {
    return {
      ...state,
      corrections: [],
      step: 'corrected',
    };
  }
  
  const physicalQubits = [...state.physicalQubits];
  
  for (const correction of corrections) {
    const qubit = physicalQubits[correction.qubit];
    if (qubit) {
      // Apply inverse operation to correct
      const correctedState = applyCorrectionToState(qubit.state, correction.type);
      physicalQubits[correction.qubit] = {
        ...qubit,
        state: correctedState,
        error: 'none',
        hasError: false,
      };
    }
  }
  
  // Update error history
  const errorHistory = state.errorHistory.map(e => ({
    ...e,
    corrected: corrections.some(c => c.qubit === e.qubit),
  }));
  
  const correctedCount = corrections.length;
  
  return {
    ...state,
    physicalQubits,
    corrections,
    syndromes: state.syndromes.map(s => ({ ...s, value: 0 as const })),
    logicalQubit: {
      ...state.logicalQubit,
      fidelity: 1,
    },
    step: 'corrected',
    errorHistory,
    stats: {
      ...state.stats,
      correctedErrors: state.stats.correctedErrors + correctedCount,
    },
  };
}

/**
 * Apply correction gate to state
 */
function applyCorrectionToState(state: [number, number], gateType: 'X' | 'Z' | 'Y'): [number, number] {
  const [alpha, beta] = state;
  switch (gateType) {
    case 'X':
      return [beta, alpha];
    case 'Z':
      return [alpha, -beta];
    case 'Y':
      return [-beta, alpha];
    default:
      return state;
  }
}

/**
 * Inject random error for demonstration
 */
export function injectRandomError(state: QECState): QECState {
  const qubitIndex = Math.floor(Math.random() * state.physicalQubits.length);
  
  let errorType: ErrorType;
  if (state.codeType === 'bit_flip_3') {
    errorType = 'bit_flip';
  } else if (state.codeType === 'phase_flip_3') {
    errorType = 'phase_flip';
  } else {
    const rand = Math.random();
    if (rand < 0.4) errorType = 'bit_flip';
    else if (rand < 0.8) errorType = 'phase_flip';
    else errorType = 'both';
  }
  
  return injectError(state, qubitIndex, errorType);
}

/**
 * Reset the QEC state
 */
export function resetQEC(state: QECState): QECState {
  return initializeQEC(state.codeType);
}

/**
 * Full error correction cycle
 */
export function runCorrectionCycle(state: QECState): QECState {
  let current = state;
  
  if (current.step === 'error_injected') {
    current = measureSyndromes(current);
  }
  
  if (current.step === 'syndrome_measured') {
    current = applyCorrections(current);
  }
  
  return current;
}
