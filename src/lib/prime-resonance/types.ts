// Prime Resonance Formalism Types

export interface ComplexNumber {
  re: number;
  im: number;
}

export interface PrimeAmplitude {
  prime: number;
  amplitude: ComplexNumber;
  phase: number;
  magnitude: number;
}

export interface PrimeState {
  amplitudes: Map<number, ComplexNumber>;
  primes: number[];
}

export interface EvolutionState {
  time: number;
  entropy: number;
  collapseProb: number;
  dominant: number[];
  collapsed: boolean;
}

export interface ResonanceOperator {
  name: string;
  symbol: string;
  description: string;
  apply: (state: PrimeState) => PrimeState;
}

export interface MeasurementResult {
  prime: number;
  probability: number;
  collapsed: boolean;
}

export interface EvolutionParams {
  lambda: number;      // Damping coefficient
  rStable: number;     // Stable resonance target
  dt: number;          // Time step
}

export interface ResonanceScore {
  jaccard: number;
  phaseCoherence: number;
  total: number;
}

export const FIRST_64_PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53,
  59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131,
  137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223,
  227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311
];
