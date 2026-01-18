/**
 * Pulsar-Synchronized Semantic Transceiver Types
 */

// Pulsar catalog entry
export interface Pulsar {
  name: string;
  // Position in equatorial coordinates
  ra: number;           // Right ascension (radians)
  dec: number;          // Declination (radians)
  distance: number;     // Distance (parsecs)
  // Timing parameters
  period: number;       // Rotation period (seconds)
  periodDot: number;    // Period derivative (dimensionless)
  frequency: number;    // Derived: 1/period (Hz)
  // Reference epoch
  epoch: number;        // MJD of reference
  phase0: number;       // Phase at epoch
  // Status
  isActive: boolean;    // Currently being observed
  isReference: boolean; // Is this the reference pulsar
}

// 3D position in Galactic coordinates
export interface GalacticPosition {
  x: number;  // Toward galactic center (kpc)
  y: number;  // Direction of galactic rotation (kpc)
  z: number;  // North galactic pole (kpc)
}

// Observer location
export interface ObserverLocation {
  name: string;
  // Earth coordinates (if applicable)
  latitude?: number;
  longitude?: number;
  altitude?: number;
  // Galactic position (always computed)
  galactic: GalacticPosition;
  // Fingerprint (computed from pulsar observations)
  fingerprint?: PulsarFingerprint;
}

// Phase fingerprint for a location
export interface PulsarFingerprint {
  location: ObserverLocation;
  timestamp: number;
  phases: Map<string, number>;  // pulsar name -> phase
  referencePhase: number;       // Reference pulsar phase
  referencePulsar: string;      // Reference pulsar name
}

// Correction vector for computing phase from reference
export interface CorrectionVector {
  pulsar: string;
  deltaTau: number;       // Light travel time difference (seconds)
  dopplerCorrection: number;
  gravitationalCorrection: number;
  totalCorrection: number; // In radians
}

// Semantic map entry (prime -> meaning)
export interface SemanticMapping {
  prime: number;
  meaning: string;
  category?: string;
  quaternionHash?: string;
}

// SRC transmission event
export interface SRCTransmission {
  id: string;
  timestamp: number;
  sender: 'local' | 'remote';
  prime: number;
  meaning: string;
  phaseAtTransmit: number;
  eigenvalue: number;
  wasLocked: boolean;
}

// Phase lock status
export interface PhaseLockStatus {
  isLocked: boolean;
  phaseDifference: number;
  lockStrength: number;      // 0-1
  timeSinceLock: number;     // seconds
  lockHistory: number[];     // Recent phase differences
}

// SETI detection candidate
export interface SETICandidate {
  id: string;
  timestamp: number;
  // Source info
  pulsars: string[];
  sourceDirection?: { ra: number; dec: number };
  // Signal properties
  frequency: number;
  associatedPrime: number | null;
  correlationStrength: number;
  // Statistics
  snr: number;
  falseAlarmProbability: number;
  // Pattern analysis
  isRepeating: boolean;
  periodicity: number | null;
  structureScore: number;      // 0-1, how "structured" the signal is
  // Assessment
  intelligenceProbability: number;
  status: 'candidate' | 'analyzing' | 'verified' | 'rejected';
  notes: string;
}

// Correlation analysis result
export interface CorrelationResult {
  pulsar1: string;
  pulsar2: string;
  correlation: number;
  lag: number;
  significance: number;
  isAnomalous: boolean;
}

// Frequency spectrum analysis
export interface SpectrumAnalysis {
  frequencies: number[];
  powers: number[];
  peaks: Array<{
    frequency: number;
    power: number;
    associatedPrime: number | null;
    significance: number;
  }>;
  noiseFloor: number;
  splitPrimeMatches: number[];
}

// System state
export interface TransceiverState {
  // Configuration
  referencePulsar: Pulsar | null;
  activePulsars: Pulsar[];
  localLocation: ObserverLocation;
  remoteLocation: ObserverLocation | null;
  // Timing
  currentTime: number;
  referencePhase: number;
  // Semantic
  semanticMap: SemanticMapping[];
  // Communication
  phaseLock: PhaseLockStatus;
  transmissionHistory: SRCTransmission[];
  // SETI
  setiMode: boolean;
  setiCandidates: SETICandidate[];
  correlationMatrix: CorrelationResult[];
  spectrum: SpectrumAnalysis | null;
}

// Presets for the transceiver
export interface TransceiverPreset {
  name: string;
  description: string;
  referencePulsar: string;
  activePulsars: string[];
  semanticMap: SemanticMapping[];
  localLocation: Partial<ObserverLocation>;
}

// Simulation parameters
export interface SimulationParams {
  timeScale: number;        // Simulation speed multiplier
  noiseLevel: number;       // Phase noise (radians)
  setiInjection: boolean;   // Inject simulated alien signals
  alienSignalStrength: number;
  alienPrimes: number[];    // Primes used by simulated aliens
}
