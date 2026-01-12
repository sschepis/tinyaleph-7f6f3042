// Pre-built training scripts for automated demo mode
import { TrainingScript, NoteEvent } from './types';

// Helper to create note events
function note(noteId: string, time: number, duration: number, velocity: number = 100): NoteEvent {
  return { noteId, time, duration, velocity };
}

// Helper to create chord (multiple notes at same time)
function chord(noteIds: string[], time: number, duration: number, velocity: number = 90): NoteEvent[] {
  return noteIds.map(noteId => note(noteId, time, duration, velocity));
}

export const TRAINING_SCRIPTS: TrainingScript[] = [
  {
    id: 'blues-call-response',
    name: 'Blues Call & Response',
    description: 'Classic blues phrases with call and response patterns. The AI learns to reply to your blues licks.',
    style: 'blues',
    tempo: 90,
    key: 'A',
    sequences: [
      {
        name: 'Opening Call',
        description: 'A minor pentatonic phrase',
        inputNotes: [
          note('A3', 0, 300, 100),
          note('C4', 350, 200, 90),
          note('D4', 600, 400, 110),
        ],
        outputNotes: [
          note('E4', 0, 300, 80),
          note('G4', 350, 200, 75),
          note('A4', 600, 400, 95),
        ],
        delayMs: 800,
      },
      {
        name: 'Descending Response',
        inputNotes: [
          note('E4', 0, 200, 95),
          note('D4', 250, 200, 85),
          note('C4', 500, 300, 100),
        ],
        outputNotes: [
          note('A4', 0, 200, 80),
          note('G4', 250, 200, 75),
          note('E4', 500, 300, 90),
        ],
        delayMs: 700,
      },
      {
        name: 'Blue Note Phrase',
        inputNotes: [
          note('A3', 0, 200, 100),
          note('D#4', 250, 300, 110), // Blue note
          note('E4', 600, 400, 100),
        ],
        outputNotes: [
          note('G4', 0, 200, 85),
          note('A4', 250, 300, 90),
          note('C5', 600, 400, 80),
        ],
        delayMs: 800,
      },
      {
        name: 'Turnaround',
        inputNotes: [
          note('E4', 0, 150, 100),
          note('D4', 200, 150, 95),
          note('C4', 400, 150, 90),
          note('A3', 600, 400, 110),
        ],
        outputNotes: [
          note('A4', 0, 150, 85),
          note('G4', 200, 150, 80),
          note('E4', 400, 150, 85),
          note('D4', 600, 400, 90),
        ],
        delayMs: 900,
      },
    ],
  },
  {
    id: 'jazz-ii-v-i',
    name: 'Jazz ii-V-I Voicings',
    description: 'Learn jazz chord comping with the classic ii-V-I progression. Great for accompaniment.',
    style: 'jazz',
    tempo: 120,
    key: 'C',
    sequences: [
      {
        name: 'ii Chord (Dm7)',
        inputNotes: [note('D4', 0, 800, 80)],
        outputNotes: chord(['D3', 'F3', 'A3', 'C4'], 0, 800, 70),
        delayMs: 200,
      },
      {
        name: 'V Chord (G7)',
        inputNotes: [note('G4', 0, 800, 85)],
        outputNotes: chord(['G3', 'B3', 'D4', 'F4'], 0, 800, 72),
        delayMs: 200,
      },
      {
        name: 'I Chord (Cmaj7)',
        inputNotes: [note('C4', 0, 1200, 90)],
        outputNotes: chord(['C3', 'E3', 'G3', 'B3'], 0, 1200, 75),
        delayMs: 400,
      },
      {
        name: 'Melody over ii',
        inputNotes: [
          note('F4', 0, 300, 85),
          note('E4', 350, 300, 80),
          note('D4', 700, 400, 90),
        ],
        outputNotes: chord(['D3', 'A3', 'C4'], 0, 1100, 65),
        delayMs: 300,
      },
      {
        name: 'Melody over V',
        inputNotes: [
          note('B4', 0, 250, 90),
          note('A4', 300, 250, 85),
          note('G4', 600, 400, 95),
        ],
        outputNotes: chord(['G3', 'B3', 'F4'], 0, 1000, 68),
        delayMs: 300,
      },
    ],
  },
  {
    id: 'classical-counterpoint',
    name: 'Classical Counterpoint',
    description: 'Bach-style counterpoint with parallel thirds and sixths. Perfect for melodic harmony.',
    style: 'classical',
    tempo: 72,
    key: 'C',
    sequences: [
      {
        name: 'Ascending Thirds',
        inputNotes: [
          note('C4', 0, 400, 85),
          note('D4', 450, 400, 80),
          note('E4', 900, 400, 85),
          note('F4', 1350, 400, 80),
        ],
        outputNotes: [
          note('E4', 0, 400, 75),
          note('F4', 450, 400, 72),
          note('G4', 900, 400, 75),
          note('A4', 1350, 400, 72),
        ],
        delayMs: 600,
      },
      {
        name: 'Descending Sixths',
        inputNotes: [
          note('G4', 0, 400, 85),
          note('F4', 450, 400, 80),
          note('E4', 900, 400, 85),
          note('D4', 1350, 400, 80),
        ],
        outputNotes: [
          note('E5', 0, 400, 70),
          note('D5', 450, 400, 68),
          note('C5', 900, 400, 70),
          note('B4', 1350, 400, 68),
        ],
        delayMs: 600,
      },
      {
        name: 'Contrary Motion',
        inputNotes: [
          note('C4', 0, 500, 85),
          note('B3', 550, 500, 80),
          note('A3', 1100, 500, 85),
        ],
        outputNotes: [
          note('E4', 0, 500, 72),
          note('F4', 550, 500, 70),
          note('G4', 1100, 500, 72),
        ],
        delayMs: 700,
      },
    ],
  },
  {
    id: 'pop-chord-backing',
    name: 'Pop Chord Backing',
    description: 'Modern pop chord progressions. Play single notes and get full chord accompaniment.',
    style: 'pop',
    tempo: 100,
    key: 'G',
    sequences: [
      {
        name: 'G Major',
        inputNotes: [note('G3', 0, 1000, 90)],
        outputNotes: [
          ...chord(['G3', 'B3', 'D4'], 0, 250, 75),
          ...chord(['G3', 'B3', 'D4'], 300, 250, 70),
          ...chord(['G3', 'B3', 'D4'], 600, 350, 75),
        ],
        delayMs: 200,
      },
      {
        name: 'D Major',
        inputNotes: [note('D3', 0, 1000, 85)],
        outputNotes: [
          ...chord(['D3', 'F#3', 'A3'], 0, 250, 72),
          ...chord(['D3', 'F#3', 'A3'], 300, 250, 68),
          ...chord(['D3', 'F#3', 'A3'], 600, 350, 72),
        ],
        delayMs: 200,
      },
      {
        name: 'E Minor',
        inputNotes: [note('E3', 0, 1000, 88)],
        outputNotes: [
          ...chord(['E3', 'G3', 'B3'], 0, 250, 70),
          ...chord(['E3', 'G3', 'B3'], 300, 250, 68),
          ...chord(['E3', 'G3', 'B3'], 600, 350, 70),
        ],
        delayMs: 200,
      },
      {
        name: 'C Major',
        inputNotes: [note('C3', 0, 1000, 92)],
        outputNotes: [
          ...chord(['C3', 'E3', 'G3'], 0, 250, 75),
          ...chord(['C3', 'E3', 'G3'], 300, 250, 72),
          ...chord(['C3', 'E3', 'G3'], 600, 350, 75),
        ],
        delayMs: 300,
      },
    ],
  },
  {
    id: 'pentatonic-duet',
    name: 'Pentatonic Duet',
    description: 'Simple pentatonic phrases that interweave. Great for beginners and improvisers.',
    style: 'pentatonic',
    tempo: 85,
    key: 'A',
    sequences: [
      {
        name: 'Call Pattern 1',
        inputNotes: [
          note('A4', 0, 300, 95),
          note('C5', 350, 200, 85),
          note('D5', 600, 400, 100),
        ],
        outputNotes: [
          note('E5', 100, 250, 80),
          note('D5', 400, 200, 75),
          note('A4', 650, 350, 85),
        ],
        delayMs: 600,
      },
      {
        name: 'Call Pattern 2',
        inputNotes: [
          note('E4', 0, 250, 90),
          note('G4', 300, 250, 85),
          note('A4', 600, 350, 95),
        ],
        outputNotes: [
          note('C5', 50, 200, 78),
          note('A4', 300, 200, 75),
          note('G4', 550, 350, 82),
        ],
        delayMs: 600,
      },
      {
        name: 'Unison Break',
        inputNotes: [
          note('A4', 0, 200, 100),
          note('A4', 250, 200, 95),
          note('A4', 500, 400, 110),
        ],
        outputNotes: [
          note('A5', 0, 200, 85),
          note('A5', 250, 200, 80),
          note('A5', 500, 400, 90),
        ],
        delayMs: 700,
      },
      {
        name: 'Cascade',
        inputNotes: [
          note('A5', 0, 150, 90),
          note('G5', 200, 150, 85),
          note('E5', 400, 150, 80),
          note('D5', 600, 150, 85),
          note('C5', 800, 300, 90),
        ],
        outputNotes: [
          note('E5', 100, 150, 75),
          note('D5', 300, 150, 72),
          note('C5', 500, 150, 70),
          note('A4', 700, 150, 72),
          note('G4', 900, 300, 78),
        ],
        delayMs: 800,
      },
    ],
  },
];

// Get script by ID
export function getTrainingScript(id: string): TrainingScript | undefined {
  return TRAINING_SCRIPTS.find(s => s.id === id);
}

// Get all scripts
export function getAllTrainingScripts(): TrainingScript[] {
  return TRAINING_SCRIPTS;
}

// Get scripts by style
export function getScriptsByStyle(style: TrainingScript['style']): TrainingScript[] {
  return TRAINING_SCRIPTS.filter(s => s.style === style);
}

// Calculate total duration of a script
export function getScriptDuration(script: TrainingScript): number {
  let totalMs = 0;
  
  for (const seq of script.sequences) {
    // Find max end time in sequence
    let maxTime = 0;
    for (const n of [...seq.inputNotes, ...seq.outputNotes]) {
      const endTime = n.time + n.duration;
      if (endTime > maxTime) maxTime = endTime;
    }
    totalMs += maxTime + seq.delayMs;
  }
  
  return totalMs;
}

// Get a random mix of sequences from different scripts
export function getRandomMix(count: number = 8): TrainingScript {
  const allSequences = TRAINING_SCRIPTS.flatMap(s => 
    s.sequences.map(seq => ({ ...seq, style: s.style }))
  );
  
  // Shuffle and pick
  const shuffled = [...allSequences].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  return {
    id: 'random-mix',
    name: 'Random Mix',
    description: 'A varied mix of patterns from different styles',
    style: 'pentatonic', // Default
    tempo: 90,
    key: 'C',
    sequences: selected,
  };
}
