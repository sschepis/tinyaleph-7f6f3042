import type { SephirahName } from './types';

// Frequencies inspired by musical harmonics and Kabbalistic correspondences
// Using a pentatonic-like scale mapped to the Tree
const SEPHIRAH_FREQUENCIES: Record<SephirahName, number> = {
  keter: 528,      // Crown - "Miracle" frequency
  hokhmah: 396,    // Wisdom - Liberation
  binah: 417,      // Understanding - Transformation
  daat: 444,       // Knowledge - Hidden (slightly above A)
  hesed: 639,      // Mercy - Connection
  gevurah: 741,    // Severity - Expression
  tiferet: 852,    // Beauty - Awakening
  nezah: 285,      // Victory - Quantum cognition
  hod: 174,        // Glory - Foundation
  yesod: 963,      // Foundation - Higher consciousness
  malkhut: 256     // Kingdom - Earth (C4)
};

// Timbre/waveform per pillar for sonic variety
const PILLAR_WAVEFORMS: Record<string, OscillatorType> = {
  structure: 'triangle',
  consciousness: 'sine',
  dynamic: 'square'
};

export class SephiroticSonicEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscillators: Map<string, { oscillator: OscillatorNode; gain: GainNode }> = new Map();
  private isEnabled: boolean = false;

  async initialize(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);
  }

  async enable(): Promise<void> {
    await this.initialize();
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
    this.stopAll();
  }

  get enabled(): boolean {
    return this.isEnabled;
  }

  setVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  // Play a tone when a sephirah is energized
  playSephirahTone(
    sephirahId: SephirahName, 
    pillar: 'structure' | 'consciousness' | 'dynamic',
    energy: number = 0.5,
    duration: number = 0.8
  ): void {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const frequency = SEPHIRAH_FREQUENCIES[sephirahId];
    const waveform = PILLAR_WAVEFORMS[pillar];
    const key = `${sephirahId}-${Date.now()}`;

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;

    // Create gain envelope
    const gainNode = this.audioContext.createGain();
    const now = this.audioContext.currentTime;
    
    // ADSR envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(energy * 0.5, now + 0.05); // Attack
    gainNode.gain.linearRampToValueAtTime(energy * 0.3, now + 0.15); // Decay
    gainNode.gain.linearRampToValueAtTime(energy * 0.3, now + duration - 0.2); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

    // Add slight detune for richness
    oscillator.detune.value = (Math.random() - 0.5) * 10;

    // Connect and play
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + duration);

    this.activeOscillators.set(key, { oscillator, gain: gainNode });

    oscillator.onended = () => {
      this.activeOscillators.delete(key);
    };
  }

  // Play a resonance chord when multiple sephirot are active
  playResonanceChord(sephirotIds: SephirahName[], duration: number = 1.5): void {
    if (!this.isEnabled || sephirotIds.length === 0) return;

    // Play each tone with slight delay for cascading effect
    sephirotIds.forEach((id, index) => {
      setTimeout(() => {
        this.playSephirahTone(id, 'consciousness', 0.3, duration);
      }, index * 50);
    });
  }

  // Play meditation step sound with longer sustain
  playMeditationStep(
    sephirahId: SephirahName,
    pillar: 'structure' | 'consciousness' | 'dynamic',
    stepIndex: number,
    totalSteps: number
  ): void {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const frequency = SEPHIRAH_FREQUENCIES[sephirahId];
    const waveform = PILLAR_WAVEFORMS[pillar];
    const duration = 2.5;

    // Create main oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;

    // Create sub-oscillator for depth
    const subOsc = this.audioContext.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = frequency / 2;

    // Create filter for warmth
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    // Create gains
    const mainGain = this.audioContext.createGain();
    const subGain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    // Slow envelope for meditation
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.4, now + 0.3);
    mainGain.gain.linearRampToValueAtTime(0.3, now + 1);
    mainGain.gain.linearRampToValueAtTime(0, now + duration);

    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.2, now + 0.5);
    subGain.gain.linearRampToValueAtTime(0, now + duration);

    // Connect
    oscillator.connect(filter);
    subOsc.connect(subGain);
    filter.connect(mainGain);
    mainGain.connect(this.masterGain);
    subGain.connect(this.masterGain);

    oscillator.start(now);
    subOsc.start(now);
    oscillator.stop(now + duration);
    subOsc.stop(now + duration);
  }

  // Ambient drone for background
  startAmbientDrone(baseFreq: number = 136.1): { stop: () => void } {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) {
      return { stop: () => {} };
    }

    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = baseFreq; // Om frequency

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.05;

    // LFO for subtle movement
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 3;

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    lfo.start();

    return {
      stop: () => {
        const now = this.audioContext?.currentTime || 0;
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        setTimeout(() => {
          oscillator.stop();
          lfo.stop();
        }, 600);
      }
    };
  }

  stopAll(): void {
    this.activeOscillators.forEach(({ oscillator, gain }) => {
      try {
        const now = this.audioContext?.currentTime || 0;
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        setTimeout(() => oscillator.stop(), 150);
      } catch {
        // Already stopped
      }
    });
    this.activeOscillators.clear();
  }

  dispose(): void {
    this.stopAll();
    this.audioContext?.close();
    this.audioContext = null;
    this.masterGain = null;
  }
}

// Singleton instance
export const sephiroticSonicEngine = new SephiroticSonicEngine();
