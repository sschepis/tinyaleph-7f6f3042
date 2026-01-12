// Type definitions for the Jam Partner music AI system

export interface MusicalNote {
  id: string;           // e.g., "C4", "D#5"
  name: string;         // e.g., "Middle C"
  midi: number;         // MIDI note number (21-108 for 88-key piano)
  frequency: number;    // Hz (A4 = 440)
  prime: number;        // Unique prime for oscillator mapping
  octave: number;       // 0-8
  semitone: number;     // 0-11 (C=0, C#=1, etc.)
  isBlack: boolean;     // Sharp/flat key
}

export interface NoteEvent {
  noteId: string;       // Reference to MusicalNote.id
  time: number;         // Time offset in ms from start
  duration: number;     // Note length in ms
  velocity: number;     // 0-127 (MIDI velocity)
}

export interface MusicalOscillator {
  noteId: string;
  prime: number;
  phase: number;
  amplitude: number;
  frequency: number;
  lastTriggered: number;
}

export interface HarmonyWeight {
  inputNote: string;
  outputNote: string;
  weight: number;
  count: number;
}

export interface MusicalPattern {
  id: string;
  name: string;
  inputNotes: NoteEvent[];
  outputNotes: NoteEvent[];
  createdAt: number;
}

export interface TrainingSequence {
  name: string;
  description?: string;
  inputNotes: NoteEvent[];
  outputNotes: NoteEvent[];
  delayMs: number;
}

export interface TrainingScript {
  id: string;
  name: string;
  description: string;
  style: 'blues' | 'jazz' | 'classical' | 'pop' | 'pentatonic';
  tempo: number;
  key: string;
  sequences: TrainingSequence[];
}

export interface ScoredNote {
  noteId: string;
  score: number;
  harmonyWeight: number;
  resonanceBonus: number;
}

export type JamMode = 'training' | 'auto-train' | 'jamming';

export interface JamPartnerState {
  mode: JamMode;
  isPlaying: boolean;
  tempo: number;
  keySignature: string;
  scale: string;
  coherence: number;
  activeInputNotes: Set<string>;
  activeOutputNotes: Set<string>;
  oscillators: MusicalOscillator[];
  harmonyMatrix: Map<string, Map<string, number>>;
  patterns: MusicalPattern[];
  autoTrainProgress: number;
  autoTrainScript: TrainingScript | null;
}

// MIDI types
export interface MIDIDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  state: 'connected' | 'disconnected';
}

export interface MIDIMessage {
  type: 'noteon' | 'noteoff' | 'cc';
  note?: number;
  velocity?: number;
  controller?: number;
  value?: number;
  timestamp: number;
}

// Audio engine types
export interface SynthSettings {
  waveform: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  masterVolume: number;
}

export const DEFAULT_SYNTH_SETTINGS: SynthSettings = {
  waveform: 'triangle',
  attack: 0.01,
  decay: 0.1,
  sustain: 0.6,
  release: 0.2,
  masterVolume: 0.7,
};

// Semitone names for display
export const SEMITONE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Scale patterns (semitone intervals from root)
export const SCALE_PATTERNS: Record<string, number[]> = {
  'major': [0, 2, 4, 5, 7, 9, 11],
  'minor': [0, 2, 3, 5, 7, 8, 10],
  'pentatonic': [0, 2, 4, 7, 9],
  'blues': [0, 3, 5, 6, 7, 10],
  'dorian': [0, 2, 3, 5, 7, 9, 10],
  'mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

// Musical intervals for harmony calculations
export const CONSONANT_INTERVALS = [0, 3, 4, 5, 7, 8, 9, 12]; // unison, m3, M3, P4, P5, m6, M6, octave
export const PERFECT_INTERVALS = [0, 5, 7, 12]; // unison, P4, P5, octave
