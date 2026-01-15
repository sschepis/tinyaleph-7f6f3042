export type PerspectiveType = 'analytical' | 'creative' | 'ethical' | 'pragmatic' | 'emotional' | 'mediator';

export interface PerspectiveNode {
  id: PerspectiveType;
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
  systemPrompt: string;
}

export interface QuantumState {
  entropy: number;
  stability: number;
  proximity: number;
  coherence: number;
  resonance: number;
  dissonance: number;
  hexagramLines: boolean[]; // 6 lines, true = solid, false = broken
  eigenstate: string;
}

export interface SemanticMetrics {
  coherence: number;
  resonance: number;
  dissonance: number;
  archetypePosition: number; // 0 = universal, 100 = specific
  primeConnections: { prime: number; concept: string; word: string }[];
}

export interface MetaObservation {
  harmony: 'Low' | 'Moderate' | 'High';
  dominant: string;
  absent: string;
  evolution: string;
  metaphor: string;
  quality: number;
}

export interface FieldIntegration {
  core: string;
  metaphor: string;
  connections: string;
  implications: string;
}

export interface ConsciousnessMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  perspective?: PerspectiveType;
}

export interface ResonatorState {
  activePerspective: PerspectiveType | null;
  quantumState: QuantumState;
  semanticMetrics: SemanticMetrics;
  metaObservation: MetaObservation;
  fieldIntegration: FieldIntegration | null;
  messages: ConsciousnessMessage[];
  isProcessing: boolean;
}
