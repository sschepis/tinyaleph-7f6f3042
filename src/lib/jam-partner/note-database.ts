// Musical note database mapping 88 piano keys to prime numbers
import { MusicalNote, SEMITONE_NAMES } from './types';

// First 88 prime numbers for oscillator mapping
const PRIMES_88 = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
  239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
  331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
  421, 431, 433, 439, 443, 449, 457
];

// Calculate frequency from MIDI note number (A4 = 440Hz = MIDI 69)
function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Generate note ID from MIDI number
function midiToNoteId(midi: number): string {
  const semitone = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${SEMITONE_NAMES[semitone]}${octave}`;
}

// Generate friendly name
function midiToNoteName(midi: number): string {
  const semitone = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteName = SEMITONE_NAMES[semitone];
  
  // Special names for common notes
  if (midi === 60) return 'Middle C';
  if (midi === 69) return 'Concert A';
  
  return `${noteName}${octave}`;
}

// Check if it's a black key
function isBlackKey(midi: number): boolean {
  const semitone = midi % 12;
  return [1, 3, 6, 8, 10].includes(semitone); // C#, D#, F#, G#, A#
}

// Build the complete note database (88 keys: A0 to C8, MIDI 21-108)
function buildNoteDatabase(): Map<string, MusicalNote> {
  const notes = new Map<string, MusicalNote>();
  
  for (let i = 0; i < 88; i++) {
    const midi = i + 21; // A0 starts at MIDI 21
    const id = midiToNoteId(midi);
    
    const note: MusicalNote = {
      id,
      name: midiToNoteName(midi),
      midi,
      frequency: midiToFrequency(midi),
      prime: PRIMES_88[i],
      octave: Math.floor(midi / 12) - 1,
      semitone: midi % 12,
      isBlack: isBlackKey(midi),
    };
    
    notes.set(id, note);
  }
  
  return notes;
}

// The main note database
export const NOTE_DATABASE = buildNoteDatabase();

// Helper functions
export function getNote(noteId: string): MusicalNote | undefined {
  return NOTE_DATABASE.get(noteId);
}

export function getNoteByMidi(midi: number): MusicalNote | undefined {
  const id = midiToNoteId(midi);
  return NOTE_DATABASE.get(id);
}

export function getAllNotes(): MusicalNote[] {
  return Array.from(NOTE_DATABASE.values());
}

export function getNotesInRange(startMidi: number, endMidi: number): MusicalNote[] {
  return getAllNotes().filter(n => n.midi >= startMidi && n.midi <= endMidi);
}

export function getNotesInOctave(octave: number): MusicalNote[] {
  return getAllNotes().filter(n => n.octave === octave);
}

// Get notes in a specific scale
export function getNotesInScale(root: string, scalePattern: number[]): MusicalNote[] {
  const rootNote = getNote(root);
  if (!rootNote) return [];
  
  const rootSemitone = rootNote.semitone;
  const notes: MusicalNote[] = [];
  
  for (const note of getAllNotes()) {
    const interval = (note.semitone - rootSemitone + 12) % 12;
    if (scalePattern.includes(interval)) {
      notes.push(note);
    }
  }
  
  return notes;
}

// Calculate interval between two notes (in semitones)
export function getInterval(note1: string, note2: string): number {
  const n1 = getNote(note1);
  const n2 = getNote(note2);
  if (!n1 || !n2) return 0;
  return Math.abs(n2.midi - n1.midi);
}

// Check if interval is consonant
export function isConsonantInterval(note1: string, note2: string): boolean {
  const interval = getInterval(note1, note2) % 12;
  return [0, 3, 4, 5, 7, 8, 9].includes(interval);
}

// Get consonance score (0-1)
export function getConsonanceScore(note1: string, note2: string): number {
  const interval = getInterval(note1, note2) % 12;
  
  // Perfect consonances
  if ([0, 7, 5].includes(interval)) return 1.0;
  // Imperfect consonances
  if ([3, 4, 8, 9].includes(interval)) return 0.8;
  // Mild dissonance
  if ([2, 10].includes(interval)) return 0.5;
  // Dissonance
  return 0.3;
}

// Common chord definitions
export const CHORD_PATTERNS: Record<string, number[]> = {
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
  '7': [0, 4, 7, 10],
  'maj7': [0, 4, 7, 11],
  'min7': [0, 3, 7, 10],
  'dim7': [0, 3, 6, 9],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
};

// Get chord notes from root
export function getChordNotes(rootId: string, chordType: keyof typeof CHORD_PATTERNS): MusicalNote[] {
  const root = getNote(rootId);
  if (!root) return [];
  
  const pattern = CHORD_PATTERNS[chordType];
  const notes: MusicalNote[] = [];
  
  for (const interval of pattern) {
    const targetMidi = root.midi + interval;
    const note = getNoteByMidi(targetMidi);
    if (note) notes.push(note);
  }
  
  return notes;
}
