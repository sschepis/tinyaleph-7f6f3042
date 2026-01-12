// Web Audio API synthesizer for Jam Partner
import { SynthSettings, DEFAULT_SYNTH_SETTINGS } from './types';
import { getNote } from './note-database';

interface ActiveNote {
  oscillator: OscillatorNode;
  gainNode: GainNode;
  startTime: number;
}

export class JamAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNotes: Map<string, ActiveNote> = new Map();
  private settings: SynthSettings = { ...DEFAULT_SYNTH_SETTINGS };
  private isInitialized = false;

  constructor() {
    // AudioContext created on first user interaction
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.settings.masterVolume;
      this.masterGain.connect(this.audioContext.destination);
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  setSettings(settings: Partial<SynthSettings>): void {
    this.settings = { ...this.settings, ...settings };
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.masterVolume;
    }
  }

  getSettings(): SynthSettings {
    return { ...this.settings };
  }

  playNote(noteId: string, velocity: number = 100, duration?: number): void {
    if (!this.audioContext || !this.masterGain) {
      console.warn('Audio engine not initialized');
      return;
    }

    const note = getNote(noteId);
    if (!note) {
      console.warn(`Note not found: ${noteId}`);
      return;
    }

    // Stop existing note if playing
    this.stopNote(noteId);

    const now = this.audioContext.currentTime;
    const velocityGain = (velocity / 127) * 0.5; // Scale velocity to reasonable volume

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = this.settings.waveform;
    oscillator.frequency.value = note.frequency;

    // Create gain node for envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;

    // Connect: oscillator -> gain -> master
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // ADSR envelope
    const { attack, decay, sustain, release } = this.settings;
    
    // Attack
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocityGain, now + attack);
    
    // Decay to sustain
    gainNode.gain.linearRampToValueAtTime(velocityGain * sustain, now + attack + decay);

    // Start oscillator
    oscillator.start(now);

    // Store reference
    this.activeNotes.set(noteId, {
      oscillator,
      gainNode,
      startTime: now,
    });

    // Auto-release if duration specified
    if (duration !== undefined) {
      setTimeout(() => this.stopNote(noteId), duration);
    }
  }

  stopNote(noteId: string): void {
    const active = this.activeNotes.get(noteId);
    if (!active || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const { release } = this.settings;

    // Release envelope
    active.gainNode.gain.cancelScheduledValues(now);
    active.gainNode.gain.setValueAtTime(active.gainNode.gain.value, now);
    active.gainNode.gain.linearRampToValueAtTime(0, now + release);

    // Stop and cleanup after release
    setTimeout(() => {
      try {
        active.oscillator.stop();
        active.oscillator.disconnect();
        active.gainNode.disconnect();
      } catch (e) {
        // Already stopped
      }
    }, release * 1000 + 50);

    this.activeNotes.delete(noteId);
  }

  stopAllNotes(): void {
    for (const noteId of this.activeNotes.keys()) {
      this.stopNote(noteId);
    }
  }

  isNotePlaying(noteId: string): boolean {
    return this.activeNotes.has(noteId);
  }

  getActiveNotes(): string[] {
    return Array.from(this.activeNotes.keys());
  }

  // Play a sequence of notes with timing
  async playSequence(
    notes: Array<{ noteId: string; time: number; duration: number; velocity: number }>,
    onNoteStart?: (noteId: string) => void,
    onNoteEnd?: (noteId: string) => void
  ): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }
    await this.resume();

    for (const event of notes) {
      setTimeout(() => {
        this.playNote(event.noteId, event.velocity, event.duration);
        onNoteStart?.(event.noteId);
        
        setTimeout(() => {
          onNoteEnd?.(event.noteId);
        }, event.duration);
      }, event.time);
    }
  }

  dispose(): void {
    this.stopAllNotes();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.masterGain = null;
    this.isInitialized = false;
  }
}

// Singleton instance
let audioEngineInstance: JamAudioEngine | null = null;

export function getAudioEngine(): JamAudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new JamAudioEngine();
  }
  return audioEngineInstance;
}
