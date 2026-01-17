/**
 * Quaternionic Non-Local Communication Types
 * Based on: "Quaternionically-Enhanced Symbolic Non-Local Communication"
 */

// Complex number representation
export interface Complex {
  re: number;
  im: number;
}

// Quaternion: q = a + bi + cj + dk
export interface Quaternion {
  a: number; // real/scalar
  b: number; // i component
  c: number; // j component  
  d: number; // k component
}

// Gaussian prime factor: α = a + bi where p = |α|²
export interface GaussianFactor {
  a: number;
  b: number;
  norm: number; // a² + b²
}

// Eisenstein prime factor: β = c + dω where ω = (-1 + i√3)/2
export interface EisensteinFactor {
  c: number;
  d: number;
  // Converted to Cartesian: c' + d'i
  cPrime: number;
  dPrime: number;
  norm: number;
}

// Split prime with both factorizations
export interface SplitPrime {
  p: number;
  gaussian: GaussianFactor;
  eisenstein: EisensteinFactor;
  quaternion: Quaternion;
  blochVector: [number, number, number]; // (b, c', d') normalized
}

// Quaternionic quantum state
export interface QuaternionState {
  quaternion: Quaternion;
  phase: number;
  amplitude: number;
  blochVector: [number, number, number];
}

// Entangled quaternionic pair
export interface EntangledPair {
  alice: SplitPrime;
  bob: SplitPrime;
  twistCoupling: number; // γ_pq
  compositeHamiltonian: Quaternion;
  phaseDifference: number; // Δφ_q
  isSynchronized: boolean;
  correlationStrength: number;
}

// Measurement result from projection operator
export interface ProjectionResult {
  eigenvalue: number; // ±√p
  collapsedState: QuaternionState;
  symbolicMeaning: string;
}

// Transmission event
export interface TransmissionEvent {
  timestamp: number;
  sender: 'alice' | 'bob';
  prime: SplitPrime;
  quaternionSent: Quaternion;
  phaseAtSend: number;
  receivedPhase: number;
  phaseLockAchieved: boolean;
  twistApplied: number;
}

// System state
export interface NonlocalSystemState {
  splitPrimes: SplitPrime[];
  selectedPrimeAlice: SplitPrime | null;
  selectedPrimeBob: SplitPrime | null;
  entangledPair: EntangledPair | null;
  time: number;
  epsilon: number; // Phase lock threshold
  transmissionHistory: TransmissionEvent[];
  isRunning: boolean;
}

// Visualization data
export interface BlochTrajectory {
  points: Array<{
    x: number;
    y: number;
    z: number;
    t: number;
  }>;
  currentPoint: [number, number, number];
}

export interface PhaseData {
  alicePhase: number;
  bobPhase: number;
  difference: number;
  isLocked: boolean;
}

// Preset configurations
export interface PresetConfig {
  name: string;
  description: string;
  primeAlice: number;
  primeBob: number;
  twistCoupling: number;
  epsilon: number;
}
