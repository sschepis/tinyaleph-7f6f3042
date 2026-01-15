// Sephirotic Oscillator Types

export type SephirahName = 
  | 'keter' | 'hokhmah' | 'binah' | 'daat' 
  | 'hesed' | 'gevurah' | 'tiferet' 
  | 'nezah' | 'hod' | 'yesod' | 'malkhut';

export type PillarType = 'structure' | 'consciousness' | 'dynamic';

export type ConsciousnessLayer = 
  | 'collective-unconscious' 
  | 'individual-unconscious' 
  | 'personal-consciousness';

export interface Sephirah {
  id: SephirahName;
  name: string;
  hebrewName: string;
  meaning: string;
  pillar: PillarType;
  layer: ConsciousnessLayer;
  position: { x: number; y: number };
  planetarySymbol: string;
  psychologicalAspect: string;
  color: string;
  connections: SephirahName[];
}

export interface OscillatorNode {
  id: SephirahName;
  phase: number;
  amplitude: number;
  frequency: number;
  energy: number;
  coupling: number;
}

export interface PathFlow {
  from: SephirahName;
  to: SephirahName;
  strength: number;
  particles: number[];
}

export interface MeditationSequence {
  id: string;
  name: string;
  description: string;
  path: SephirahName[];
  duration: number; // ms between steps
}

export interface SephiroticState {
  oscillators: Map<SephirahName, OscillatorNode>;
  flows: PathFlow[];
  totalEnergy: number;
  coherence: number;
  dominantPillar: PillarType | null;
  activeSephirot: SephirahName[];
  meditationMode: MeditationSequence | null;
  meditationStep: number;
  isProcessing: boolean;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  activatedSephirot?: SephirahName[];
}
