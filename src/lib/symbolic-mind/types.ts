export type InterferenceModel = 'wave' | 'quantum' | 'attractor';

// Somatic Resonance Layer Types
export type BodyRegion = 
  | 'crown' | 'third-eye' | 'throat' | 'heart' | 'solar-plexus' 
  | 'sacral' | 'root' | 'spine' | 'hands' | 'feet' 
  | 'chest' | 'belly' | 'limbs' | 'skin' | 'whole-body' | 'jaw';

export type NervousSystemState = 'sympathetic' | 'parasympathetic' | 'balanced';

export type SensationIntensity = 'subtle' | 'moderate' | 'strong';

export interface SomaticMapping {
  bodyRegions: BodyRegion[];
  sensation: string;
  nervousSystem: NervousSystemState;
  intensity: SensationIntensity;
  energyCenter?: string;
}

export interface SymbolicSymbol {
  id: string;
  name: string;
  unicode: string;
  prime: number;
  category: string;
  culture: string;
  meaning: string;
  state?: number[];
  somatic?: SomaticMapping;
}

export interface WaveState {
  symbol: SymbolicSymbol;
  wave: number[];
  amplitude: number;
  phase: number;
}

export interface ResonanceResult {
  symbol: SymbolicSymbol;
  resonance: number;
  contribution: number[];
  interference?: number;
}

export interface AttractorState {
  position: number[];
  velocity: number[];
  energy: number;
  basin: string; // Which anchor it's converging toward
}

export interface QuantumState {
  amplitudes: Map<string, number>; // Symbol ID to probability amplitude
  phase: number;
  measured: boolean;
}

export interface MindState {
  anchoringSymbols: SymbolicSymbol[];
  activeSymbols: SymbolicSymbol[];
  coherence: number;
  iteration: number;
  converged: boolean;
  superposition?: number[]; // The combined waveform
  model: InterferenceModel;
  // Model-specific state
  attractorEnergy?: number;
  quantumEntropy?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  symbols?: SymbolicSymbol[];
  coherence?: number;
  timestamp: Date;
}