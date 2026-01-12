// Harmony learning engine for Jam Partner
// Uses Markov chain-like learning to build harmonic associations

import { HarmonyWeight, ScoredNote, NoteEvent, MusicalPattern } from './types';
import { getNote, getConsonanceScore } from './note-database';

export class HarmonyEngine {
  // Matrix: inputNote -> outputNote -> weight
  private harmonyMatrix: Map<string, Map<string, number>> = new Map();
  private transitionCounts: Map<string, Map<string, number>> = new Map();
  private totalInputCounts: Map<string, number> = new Map();
  
  // Decay factor for older associations
  private decayFactor = 0.995;
  
  // Theory-based priors
  private theoryWeight = 0.3;

  constructor() {
    this.initializeWithTheory();
  }

  // Initialize with music theory priors
  private initializeWithTheory(): void {
    // Add small weights for consonant intervals
    const rootNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const octaves = [3, 4, 5];
    
    for (const octave of octaves) {
      for (let i = 0; i < rootNotes.length; i++) {
        const inputNote = `${rootNotes[i]}${octave}`;
        
        // Add weights for thirds, fifths, octaves
        const intervals = [
          { semitones: 0, weight: 0.5 },  // Unison
          { semitones: 3, weight: 0.3 },  // Minor third
          { semitones: 4, weight: 0.35 }, // Major third
          { semitones: 5, weight: 0.25 }, // Perfect fourth
          { semitones: 7, weight: 0.4 },  // Perfect fifth
          { semitones: 12, weight: 0.3 }, // Octave
        ];
        
        for (const { semitones, weight } of intervals) {
          const note = getNote(inputNote);
          if (note) {
            const targetMidi = note.midi + semitones;
            const targetNote = this.midiToNoteId(targetMidi);
            if (getNote(targetNote)) {
              this.setWeight(inputNote, targetNote, weight * this.theoryWeight);
            }
          }
        }
      }
    }
  }

  private midiToNoteId(midi: number): string {
    const SEMITONE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const semitone = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    return `${SEMITONE_NAMES[semitone]}${octave}`;
  }

  private setWeight(inputNote: string, outputNote: string, weight: number): void {
    if (!this.harmonyMatrix.has(inputNote)) {
      this.harmonyMatrix.set(inputNote, new Map());
    }
    this.harmonyMatrix.get(inputNote)!.set(outputNote, weight);
  }

  private getWeight(inputNote: string, outputNote: string): number {
    return this.harmonyMatrix.get(inputNote)?.get(outputNote) ?? 0;
  }

  // Record a single input-output pair
  recordPair(inputNote: string, outputNote: string, weight: number = 1): void {
    // Update counts
    if (!this.transitionCounts.has(inputNote)) {
      this.transitionCounts.set(inputNote, new Map());
    }
    const counts = this.transitionCounts.get(inputNote)!;
    counts.set(outputNote, (counts.get(outputNote) ?? 0) + weight);
    
    this.totalInputCounts.set(
      inputNote,
      (this.totalInputCounts.get(inputNote) ?? 0) + weight
    );

    // Update normalized weights
    this.recalculateWeights(inputNote);
  }

  // Record a full pattern (multiple input-output pairs)
  recordPattern(pattern: MusicalPattern): void {
    const { inputNotes, outputNotes } = pattern;
    
    // Create associations between temporally close notes
    for (const input of inputNotes) {
      for (const output of outputNotes) {
        // Weight by temporal proximity
        const timeDiff = Math.abs(output.time - input.time);
        const proximityWeight = Math.exp(-timeDiff / 500); // Decay over 500ms
        
        this.recordPair(input.noteId, output.noteId, proximityWeight);
      }
    }
  }

  // Record from training sequence
  recordSequence(inputNotes: NoteEvent[], outputNotes: NoteEvent[]): void {
    for (const input of inputNotes) {
      for (const output of outputNotes) {
        const timeDiff = Math.abs(output.time - input.time);
        const proximityWeight = Math.exp(-timeDiff / 500);
        this.recordPair(input.noteId, output.noteId, proximityWeight);
      }
    }
  }

  private recalculateWeights(inputNote: string): void {
    const counts = this.transitionCounts.get(inputNote);
    const total = this.totalInputCounts.get(inputNote);
    
    if (!counts || !total) return;
    
    if (!this.harmonyMatrix.has(inputNote)) {
      this.harmonyMatrix.set(inputNote, new Map());
    }
    
    const weights = this.harmonyMatrix.get(inputNote)!;
    
    for (const [outputNote, count] of counts) {
      // Combine learned weight with theory prior
      const learnedWeight = count / total;
      const theoryWeight = getConsonanceScore(inputNote, outputNote) * this.theoryWeight;
      weights.set(outputNote, Math.max(learnedWeight, theoryWeight));
    }
  }

  // Get suggested output notes for given input
  suggestOutputs(
    inputNotes: string[],
    count: number = 3,
    oscillatorResonance?: Map<string, number>
  ): ScoredNote[] {
    const scores = new Map<string, { harmony: number; resonance: number }>();
    
    // Aggregate weights from all input notes
    for (const inputNote of inputNotes) {
      const weights = this.harmonyMatrix.get(inputNote);
      if (weights) {
        for (const [outputNote, weight] of weights) {
          const existing = scores.get(outputNote) ?? { harmony: 0, resonance: 0 };
          existing.harmony += weight;
          scores.set(outputNote, existing);
        }
      }
    }
    
    // Add oscillator resonance bonus
    if (oscillatorResonance) {
      for (const [noteId, resonance] of oscillatorResonance) {
        const existing = scores.get(noteId) ?? { harmony: 0, resonance: 0 };
        existing.resonance = resonance;
        scores.set(noteId, existing);
      }
    }
    
    // Convert to scored notes and sort
    const scoredNotes: ScoredNote[] = [];
    for (const [noteId, { harmony, resonance }] of scores) {
      scoredNotes.push({
        noteId,
        score: harmony + resonance * 0.5,
        harmonyWeight: harmony,
        resonanceBonus: resonance,
      });
    }
    
    scoredNotes.sort((a, b) => b.score - a.score);
    return scoredNotes.slice(0, count);
  }

  // Get harmony strength between two notes
  getHarmonyStrength(inputNote: string, outputNote: string): number {
    const learned = this.getWeight(inputNote, outputNote);
    const theory = getConsonanceScore(inputNote, outputNote);
    return Math.max(learned, theory * this.theoryWeight);
  }

  // Get all learned weights for visualization
  getHarmonyMatrix(): Map<string, Map<string, number>> {
    return new Map(this.harmonyMatrix);
  }

  // Get condensed 12x12 matrix by semitone
  getSemitoneMatrix(): number[][] {
    const matrix: number[][] = Array(12).fill(null).map(() => Array(12).fill(0));
    
    for (const [inputNote, outputs] of this.harmonyMatrix) {
      const inputSemitone = getNote(inputNote)?.semitone;
      if (inputSemitone === undefined) continue;
      
      for (const [outputNote, weight] of outputs) {
        const outputSemitone = getNote(outputNote)?.semitone;
        if (outputSemitone === undefined) continue;
        
        matrix[inputSemitone][outputSemitone] = Math.max(
          matrix[inputSemitone][outputSemitone],
          weight
        );
      }
    }
    
    return matrix;
  }

  // Apply decay to all weights (call periodically)
  applyDecay(): void {
    for (const [, outputs] of this.harmonyMatrix) {
      for (const [outputNote, weight] of outputs) {
        outputs.set(outputNote, weight * this.decayFactor);
      }
    }
  }

  // Get statistics about learned patterns
  getStats(): { totalAssociations: number; strongAssociations: number; avgWeight: number } {
    let total = 0;
    let strong = 0;
    let sum = 0;
    
    for (const [, outputs] of this.harmonyMatrix) {
      for (const [, weight] of outputs) {
        total++;
        sum += weight;
        if (weight > 0.3) strong++;
      }
    }
    
    return {
      totalAssociations: total,
      strongAssociations: strong,
      avgWeight: total > 0 ? sum / total : 0,
    };
  }

  // Reset learned associations (keep theory priors)
  reset(): void {
    this.harmonyMatrix.clear();
    this.transitionCounts.clear();
    this.totalInputCounts.clear();
    this.initializeWithTheory();
  }
}

// Singleton instance
let harmonyEngineInstance: HarmonyEngine | null = null;

export function getHarmonyEngine(): HarmonyEngine {
  if (!harmonyEngineInstance) {
    harmonyEngineInstance = new HarmonyEngine();
  }
  return harmonyEngineInstance;
}
