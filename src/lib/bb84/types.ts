// BB84 Quantum Key Distribution Types

export type Basis = 'rectilinear' | 'diagonal'; // + or ×
export type Bit = 0 | 1;
export type Photon = { bit: Bit; basis: Basis };

export interface TransmittedPhoton {
  index: number;
  aliceBit: Bit;
  aliceBasis: Basis;
  bobBasis: Basis;
  bobMeasurement: Bit;
  basisMatch: boolean;
  intercepted: boolean;
  eveIntroducedError: boolean;
}

export interface BB84State {
  keyLength: number;
  evePresent: boolean;
  eveInterceptionRate: number;
  photons: TransmittedPhoton[];
  siftedKeyAlice: Bit[];
  siftedKeyBob: Bit[];
  errorRate: number;
  secureKeyEstablished: boolean;
  phase: 'idle' | 'transmitting' | 'sifting' | 'error-checking' | 'complete';
}

export interface ProtocolStep {
  step: number;
  title: string;
  description: string;
}

export const PROTOCOL_STEPS: ProtocolStep[] = [
  { step: 1, title: 'Quantum Transmission', description: 'Alice sends random bits encoded in random bases (rectilinear + or diagonal ×)' },
  { step: 2, title: 'Measurement', description: 'Bob measures each photon using a randomly chosen basis' },
  { step: 3, title: 'Basis Reconciliation', description: 'Alice and Bob publicly compare bases, keeping only matching measurements' },
  { step: 4, title: 'Error Estimation', description: 'They sacrifice some bits to estimate the error rate' },
  { step: 5, title: 'Security Decision', description: 'If error rate < 11%, the key is secure. Higher rates indicate eavesdropping!' },
];

// Error rate threshold - above this, Eve is likely present
export const SECURITY_THRESHOLD = 0.11; // 11%

// For visualization
export interface PhotonVisualization {
  x: number;
  y: number;
  polarization: number; // degrees
  color: string;
  opacity: number;
}
