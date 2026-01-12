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

export interface MindState {
  anchoringSymbols: Symbol[];
  activeSymbols: Symbol[];
  coherence: number;
  iteration: number;
  converged: boolean;
  superposition?: number[]; // The combined waveform
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  symbols?: Symbol[];
  coherence?: number;
  timestamp: Date;
}
