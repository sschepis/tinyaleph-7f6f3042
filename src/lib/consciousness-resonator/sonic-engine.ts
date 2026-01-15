import type { ActivatedArchetype, ArchetypeCategory } from './types';

// Base frequency for prime-to-frequency conversion (A4 = 440Hz)
const BASE_FREQUENCY = 220; // A3 for warmer tones

// Golden ratio for harmonic relationships
const PHI = (1 + Math.sqrt(5)) / 2;

// Category-specific waveform and envelope settings
const CATEGORY_SOUNDS: Record<ArchetypeCategory, {
  waveform: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterFreq: number;
  filterQ: number;
}> = {
  action: {
    waveform: 'sawtooth',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.6,
    release: 0.3,
    filterFreq: 2000,
    filterQ: 2
  },
  wisdom: {
    waveform: 'sine',
    attack: 0.2,
    decay: 0.3,
    sustain: 0.5,
    release: 0.8,
    filterFreq: 1200,
    filterQ: 1
  },
  emotion: {
    waveform: 'triangle',
    attack: 0.15,
    decay: 0.2,
    sustain: 0.7,
    release: 0.5,
    filterFreq: 1800,
    filterQ: 1.5
  },
  transformation: {
    waveform: 'square',
    attack: 0.05,
    decay: 0.15,
    sustain: 0.4,
    release: 0.4,
    filterFreq: 1500,
    filterQ: 3
  },
  creation: {
    waveform: 'triangle',
    attack: 0.1,
    decay: 0.2,
    sustain: 0.6,
    release: 0.6,
    filterFreq: 2500,
    filterQ: 1
  },
  spirit: {
    waveform: 'sine',
    attack: 0.3,
    decay: 0.4,
    sustain: 0.8,
    release: 1.0,
    filterFreq: 800,
    filterQ: 0.5
  },
  shadow: {
    waveform: 'sawtooth',
    attack: 0.05,
    decay: 0.3,
    sustain: 0.3,
    release: 0.5,
    filterFreq: 600,
    filterQ: 4
  }
};

/**
 * Convert prime number to musical frequency using harmonic ratios
 */
function primeToFrequency(prime: number): number {
  // Use log relationship for musical intervals
  // Primes map to frequencies in harmonic series
  const octave = Math.floor(Math.log2(prime));
  const position = (prime / Math.pow(2, octave)) - 1;
  
  // Map to frequency with golden ratio influence
  return BASE_FREQUENCY * Math.pow(2, octave / 4) * (1 + position * 0.5);
}

/**
 * Sonic Engine for generating archetype-based audio feedback
 */
export class SonicEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private isEnabled: boolean = false;
  private volume: number = 0.3;
  
  constructor() {
    // AudioContext will be created on first user interaction
  }
  
  /**
   * Initialize the audio context (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.audioContext) return;
    
    this.audioContext = new AudioContext();
    
    // Create master gain
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.audioContext.destination);
    
    // Create simple reverb using delay network
    await this.createReverb();
    
    this.isEnabled = true;
  }
  
  /**
   * Create a simple algorithmic reverb
   */
  private async createReverb(): Promise<void> {
    if (!this.audioContext || !this.masterGain) return;
    
    // Create a simple delay-based reverb
    const delayNode = this.audioContext.createDelay(0.5);
    delayNode.delayTime.value = 0.15;
    
    const feedbackGain = this.audioContext.createGain();
    feedbackGain.gain.value = 0.3;
    
    const wetGain = this.audioContext.createGain();
    wetGain.gain.value = 0.2;
    
    // Connect delay feedback loop
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    delayNode.connect(wetGain);
    wetGain.connect(this.masterGain);
  }
  
  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }
  
  /**
   * Enable/disable sound
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  /**
   * Get current state
   */
  getState(): { enabled: boolean; volume: number } {
    return { enabled: this.isEnabled, volume: this.volume };
  }
  
  /**
   * Play a tone for a single archetype
   */
  playArchetypeTone(archetype: ActivatedArchetype, delay: number = 0): void {
    if (!this.audioContext || !this.masterGain || !this.isEnabled) return;
    
    const settings = CATEGORY_SOUNDS[archetype.category];
    const now = this.audioContext.currentTime + delay;
    
    // Play chord from archetype's primes
    archetype.primes.forEach((prime, index) => {
      const frequency = primeToFrequency(prime);
      this.playNote(frequency, settings, now + index * 0.05, archetype.activation);
    });
  }
  
  /**
   * Play a single note with ADSR envelope
   */
  private playNote(
    frequency: number,
    settings: typeof CATEGORY_SOUNDS[ArchetypeCategory],
    startTime: number,
    intensity: number
  ): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const { waveform, attack, decay, sustain, release, filterFreq, filterQ } = settings;
    const duration = attack + decay + 0.2 + release;
    
    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    
    // Create filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq * intensity;
    filter.Q.value = filterQ;
    
    // Create envelope gain
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;
    
    // ADSR envelope
    const peakGain = 0.15 * intensity;
    const sustainGain = peakGain * sustain;
    
    envelope.gain.setValueAtTime(0, startTime);
    envelope.gain.linearRampToValueAtTime(peakGain, startTime + attack);
    envelope.gain.linearRampToValueAtTime(sustainGain, startTime + attack + decay);
    envelope.gain.setValueAtTime(sustainGain, startTime + attack + decay + 0.2);
    envelope.gain.linearRampToValueAtTime(0, startTime + duration);
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.masterGain);
    
    // Play
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.1);
  }
  
  /**
   * Play resonance chord for multiple archetypes
   */
  playResonanceChord(archetypes: ActivatedArchetype[]): void {
    if (!this.isEnabled || archetypes.length === 0) return;
    
    // Initialize if needed
    if (!this.audioContext) {
      this.initialize().then(() => {
        this.playResonanceChordInternal(archetypes);
      });
    } else {
      this.playResonanceChordInternal(archetypes);
    }
  }
  
  private playResonanceChordInternal(archetypes: ActivatedArchetype[]): void {
    // Play each archetype with slight delay for arpeggio effect
    archetypes.slice(0, 4).forEach((archetype, index) => {
      this.playArchetypeTone(archetype, index * 0.15);
    });
  }
  
  /**
   * Play a "quantum shift" sound for state changes
   */
  playQuantumShift(entropy: number): void {
    if (!this.audioContext || !this.masterGain || !this.isEnabled) return;
    
    const now = this.audioContext.currentTime;
    
    // Create ascending or descending sweep based on entropy
    const startFreq = entropy > 0.5 ? 400 : 200;
    const endFreq = entropy > 0.5 ? 200 : 400;
    
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + 0.3);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }
  
  /**
   * Play hexagram change sound
   */
  playHexagramChange(lines: boolean[]): void {
    if (!this.audioContext || !this.masterGain || !this.isEnabled) return;
    
    const now = this.audioContext.currentTime;
    
    // Play tones based on line states
    lines.forEach((isSolid, index) => {
      const baseFreq = 200 + index * 50;
      const freq = isSolid ? baseFreq : baseFreq * PHI;
      
      const oscillator = this.audioContext!.createOscillator();
      oscillator.type = isSolid ? 'sine' : 'triangle';
      oscillator.frequency.value = freq;
      
      const gain = this.audioContext!.createGain();
      const startTime = now + index * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      
      oscillator.connect(gain);
      gain.connect(this.masterGain!);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.35);
    });
  }
  
  /**
   * Play perspective activation sound
   */
  playPerspectiveActivation(category: ArchetypeCategory): void {
    if (!this.audioContext || !this.masterGain || !this.isEnabled) return;
    
    const settings = CATEGORY_SOUNDS[category];
    const now = this.audioContext.currentTime;
    
    // Play characteristic chord for the category
    const baseFreq = 220;
    [1, 1.25, 1.5].forEach((ratio, index) => {
      this.playNote(baseFreq * ratio, settings, now + index * 0.1, 0.7);
    });
  }
  
  /**
   * Cleanup
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
let sonicEngineInstance: SonicEngine | null = null;

export function getSonicEngine(): SonicEngine {
  if (!sonicEngineInstance) {
    sonicEngineInstance = new SonicEngine();
  }
  return sonicEngineInstance;
}
