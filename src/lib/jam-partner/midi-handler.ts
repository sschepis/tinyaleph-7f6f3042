// Web MIDI API handler for Jam Partner
import { MIDIDeviceInfo, MIDIMessage } from './types';

type NoteCallback = (note: number, velocity: number) => void;
type NoteOffCallback = (note: number) => void;

export class MIDIHandler {
  private midiAccess: MIDIAccess | null = null;
  private selectedInput: MIDIInput | null = null;
  private selectedOutput: MIDIOutput | null = null;
  private noteOnCallbacks: NoteCallback[] = [];
  private noteOffCallbacks: NoteOffCallback[] = [];
  private deviceChangeCallbacks: (() => void)[] = [];
  private isSupported = false;

  constructor() {
    this.isSupported = 'requestMIDIAccess' in navigator;
  }

  get supported(): boolean {
    return this.isSupported;
  }

  get connected(): boolean {
    return this.midiAccess !== null;
  }

  get hasInput(): boolean {
    return this.selectedInput !== null;
  }

  get hasOutput(): boolean {
    return this.selectedOutput !== null;
  }

  async requestAccess(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Web MIDI API not supported in this browser');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      
      // Listen for device changes
      this.midiAccess.onstatechange = () => {
        this.deviceChangeCallbacks.forEach(cb => cb());
      };

      // Auto-select first available input/output
      this.autoSelectDevices();
      
      return true;
    } catch (error) {
      console.error('Failed to get MIDI access:', error);
      return false;
    }
  }

  private autoSelectDevices(): void {
    if (!this.midiAccess) return;

    // Select first input if none selected
    if (!this.selectedInput) {
      for (const input of this.midiAccess.inputs.values()) {
        this.selectInput(input.id);
        break;
      }
    }

    // Select first output if none selected
    if (!this.selectedOutput) {
      for (const output of this.midiAccess.outputs.values()) {
        this.selectOutput(output.id);
        break;
      }
    }
  }

  getInputDevices(): MIDIDeviceInfo[] {
    if (!this.midiAccess) return [];
    
    const devices: MIDIDeviceInfo[] = [];
    for (const input of this.midiAccess.inputs.values()) {
      devices.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown',
        state: input.state as 'connected' | 'disconnected',
      });
    }
    return devices;
  }

  getOutputDevices(): MIDIDeviceInfo[] {
    if (!this.midiAccess) return [];
    
    const devices: MIDIDeviceInfo[] = [];
    for (const output of this.midiAccess.outputs.values()) {
      devices.push({
        id: output.id,
        name: output.name || 'Unknown Device',
        manufacturer: output.manufacturer || 'Unknown',
        state: output.state as 'connected' | 'disconnected',
      });
    }
    return devices;
  }

  selectInput(deviceId: string): boolean {
    if (!this.midiAccess) return false;

    // Disconnect previous input
    if (this.selectedInput) {
      this.selectedInput.onmidimessage = null;
    }

    const input = this.midiAccess.inputs.get(deviceId);
    if (!input) return false;

    this.selectedInput = input;
    this.selectedInput.onmidimessage = this.handleMIDIMessage.bind(this);
    return true;
  }

  selectOutput(deviceId: string): boolean {
    if (!this.midiAccess) return false;

    const output = this.midiAccess.outputs.get(deviceId);
    if (!output) return false;

    this.selectedOutput = output;
    return true;
  }

  getSelectedInput(): MIDIDeviceInfo | null {
    if (!this.selectedInput) return null;
    return {
      id: this.selectedInput.id,
      name: this.selectedInput.name || 'Unknown',
      manufacturer: this.selectedInput.manufacturer || 'Unknown',
      state: this.selectedInput.state as 'connected' | 'disconnected',
    };
  }

  getSelectedOutput(): MIDIDeviceInfo | null {
    if (!this.selectedOutput) return null;
    return {
      id: this.selectedOutput.id,
      name: this.selectedOutput.name || 'Unknown',
      manufacturer: this.selectedOutput.manufacturer || 'Unknown',
      state: this.selectedOutput.state as 'connected' | 'disconnected',
    };
  }

  private handleMIDIMessage(event: MIDIMessageEvent): void {
    if (!event.data || event.data.length < 2) return;

    const [status, note, velocity] = event.data;
    const channel = status & 0x0F;
    const command = status & 0xF0;

    // Note On (0x90) with velocity > 0
    if (command === 0x90 && velocity > 0) {
      this.noteOnCallbacks.forEach(cb => cb(note, velocity));
    }
    // Note Off (0x80) or Note On with velocity 0
    else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      this.noteOffCallbacks.forEach(cb => cb(note));
    }
  }

  onNoteOn(callback: NoteCallback): () => void {
    this.noteOnCallbacks.push(callback);
    return () => {
      const index = this.noteOnCallbacks.indexOf(callback);
      if (index > -1) this.noteOnCallbacks.splice(index, 1);
    };
  }

  onNoteOff(callback: NoteOffCallback): () => void {
    this.noteOffCallbacks.push(callback);
    return () => {
      const index = this.noteOffCallbacks.indexOf(callback);
      if (index > -1) this.noteOffCallbacks.splice(index, 1);
    };
  }

  onDeviceChange(callback: () => void): () => void {
    this.deviceChangeCallbacks.push(callback);
    return () => {
      const index = this.deviceChangeCallbacks.indexOf(callback);
      if (index > -1) this.deviceChangeCallbacks.splice(index, 1);
    };
  }

  sendNoteOn(note: number, velocity: number = 100): void {
    if (!this.selectedOutput) return;
    this.selectedOutput.send([0x90, note, velocity]);
  }

  sendNoteOff(note: number): void {
    if (!this.selectedOutput) return;
    this.selectedOutput.send([0x80, note, 0]);
  }

  disconnect(): void {
    if (this.selectedInput) {
      this.selectedInput.onmidimessage = null;
      this.selectedInput = null;
    }
    this.selectedOutput = null;
  }

  dispose(): void {
    this.disconnect();
    this.noteOnCallbacks = [];
    this.noteOffCallbacks = [];
    this.deviceChangeCallbacks = [];
    this.midiAccess = null;
  }
}

// Singleton instance
let midiHandlerInstance: MIDIHandler | null = null;

export function getMIDIHandler(): MIDIHandler {
  if (!midiHandlerInstance) {
    midiHandlerInstance = new MIDIHandler();
  }
  return midiHandlerInstance;
}
