/**
 * Thermodynamic Semantics Types
 * Visualizing entropy reduction, meaning emergence, and computational efficiency
 */

// Semantic state with thermodynamic properties
export interface SemanticState {
  id: string;
  content: string;
  entropy: number; // Information entropy (bits)
  freeEnergy: number; // Helmholtz free energy
  temperature: number; // Effective temperature
  coherence: number; // 0-1
  meaning: number; // Extracted meaning measure
}

// Entropy-meaning relationship
export interface EntropyMeaningPoint {
  entropy: number;
  meaning: number;
  efficiency: number;
  timestamp: number;
}

// Computational process
export interface ComputationProcess {
  id: string;
  name: string;
  entropyIn: number;
  entropyOut: number;
  meaningGain: number;
  energyCost: number; // kT ln(2) units
  landauerCost: number; // Theoretical minimum
  efficiency: number;
  steps: ProcessStep[];
}

// Single step in a process
export interface ProcessStep {
  name: string;
  entropyChange: number;
  meaningChange: number;
  energyUsed: number;
  isReversible: boolean;
}

// Free energy landscape
export interface EnergyLandscape {
  states: LandscapeState[];
  barriers: EnergyBarrier[];
  minima: LocalMinimum[];
  globalMinimum: LocalMinimum | null;
}

export interface LandscapeState {
  x: number;
  y: number;
  energy: number;
  entropy: number;
  meaning: number;
}

export interface EnergyBarrier {
  from: string;
  to: string;
  height: number;
  width: number;
}

export interface LocalMinimum {
  id: string;
  position: [number, number];
  energy: number;
  meaning: number;
  stability: number;
}

// Landauer principle metrics
export interface LandauerMetrics {
  temperature: number; // Kelvin
  kT: number; // Thermal energy
  landauerLimit: number; // kT ln(2)
  actualCost: number;
  efficiency: number;
  bitsErased: number;
  irreversibleFraction: number;
}

// Maxwell's demon analysis
export interface DemonMetrics {
  informationGained: number; // bits
  entropyExported: number;
  workExtracted: number;
  netGain: number;
  isViolating: boolean; // Should always be false
}

// Meaning emergence model
export interface MeaningEmergence {
  rawEntropy: number;
  structuredEntropy: number;
  mutualInformation: number;
  integratedInformation: number; // Φ
  emergentMeaning: number;
  compressionRatio: number;
}

// Time series for tracking
export interface ThermodynamicTimeSeries {
  timestamps: number[];
  entropy: number[];
  meaning: number[];
  efficiency: number[];
  freeEnergy: number[];
}

// System configuration
export interface SystemConfig {
  temperature: number;
  noiseLevel: number;
  couplingStrength: number;
  measurementRate: number;
}

// Dashboard state
export interface ThermodynamicSemanticState {
  processes: ComputationProcess[];
  landscape: EnergyLandscape;
  landauer: LandauerMetrics;
  demon: DemonMetrics;
  emergence: MeaningEmergence;
  timeSeries: ThermodynamicTimeSeries;
  config: SystemConfig;
  activeProcess: string | null;
  mode: 'overview' | 'process' | 'landscape' | 'demon';
  isRunning: boolean;
  time: number;
}

// Preset scenarios
export interface ThermodynamicPreset {
  name: string;
  description: string;
  processes: Omit<ComputationProcess, 'steps'>[];
  config: Partial<SystemConfig>;
}
