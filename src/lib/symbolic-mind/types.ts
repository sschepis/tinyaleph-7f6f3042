export type InterferenceModel = 'wave' | 'quantum' | 'attractor';

export interface Symbol {
  id: string;
  name: string;
  unicode: string;
  prime: number;
  category: string;
  culture: string;
  meaning: string;
  state?: number[];
}

export interface WaveState {
  symbol: Symbol;
  wave: number[];
  amplitude: number;
  phase: number;
}

export interface ResonanceResult {
  symbol: Symbol;
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
  anchoringSymbols: Symbol[];
  activeSymbols: Symbol[];
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
  symbols?: Symbol[];
  coherence?: number;
  timestamp: Date;
}
