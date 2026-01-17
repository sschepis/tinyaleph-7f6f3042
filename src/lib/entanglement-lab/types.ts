// Quantum Entanglement Lab Types

export type BellState = 'Φ+' | 'Φ-' | 'Ψ+' | 'Ψ-';

export interface ComplexNumber {
  re: number;
  im: number;
}

export interface QubitState {
  // Amplitudes for |00⟩, |01⟩, |10⟩, |11⟩
  amplitudes: [ComplexNumber, ComplexNumber, ComplexNumber, ComplexNumber];
}

export interface MeasurementResult {
  alice: 0 | 1;
  bob: 0 | 1;
  aliceAngle: number;
  bobAngle: number;
  correlation: number;
}

export interface MeasurementStats {
  total: number;
  outcomes: {
    '00': number;
    '01': number;
    '10': number;
    '11': number;
  };
  correlation: number;
}

export interface CHSHResult {
  S: number;
  classicalBound: number;
  quantumBound: number;
  violation: boolean;
  correlations: {
    E_ab: number;
    E_ab_prime: number;
    E_a_prime_b: number;
    E_a_prime_b_prime: number;
  };
  angles: {
    a: number;
    a_prime: number;
    b: number;
    b_prime: number;
  };
}

export interface CorrelationPoint {
  aliceAngle: number;
  bobAngle: number;
  theoretical: number;
  measured: number;
  samples: number;
}

export const BELL_STATE_INFO: Record<BellState, {
  name: string;
  latex: string;
  description: string;
  amplitudes: [ComplexNumber, ComplexNumber, ComplexNumber, ComplexNumber];
}> = {
  'Φ+': {
    name: 'Phi Plus',
    latex: '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
    description: 'Maximally entangled state with same-basis correlations',
    amplitudes: [
      { re: 1 / Math.sqrt(2), im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: 1 / Math.sqrt(2), im: 0 }
    ]
  },
  'Φ-': {
    name: 'Phi Minus',
    latex: '|Φ⁻⟩ = (|00⟩ - |11⟩)/√2',
    description: 'Maximally entangled state with anti-correlations',
    amplitudes: [
      { re: 1 / Math.sqrt(2), im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: -1 / Math.sqrt(2), im: 0 }
    ]
  },
  'Ψ+': {
    name: 'Psi Plus',
    latex: '|Ψ⁺⟩ = (|01⟩ + |10⟩)/√2',
    description: 'Maximally entangled state with opposite outcomes',
    amplitudes: [
      { re: 0, im: 0 },
      { re: 1 / Math.sqrt(2), im: 0 },
      { re: 1 / Math.sqrt(2), im: 0 },
      { re: 0, im: 0 }
    ]
  },
  'Ψ-': {
    name: 'Psi Minus',
    latex: '|Ψ⁻⟩ = (|01⟩ - |10⟩)/√2',
    description: 'Singlet state - perfectly anti-correlated',
    amplitudes: [
      { re: 0, im: 0 },
      { re: 1 / Math.sqrt(2), im: 0 },
      { re: -1 / Math.sqrt(2), im: 0 },
      { re: 0, im: 0 }
    ]
  }
};
