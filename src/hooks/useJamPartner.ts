// Main hook for Jam Partner - adapts the Observer pattern for music
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MusicalOscillator,
  MusicalPattern,
  JamMode,
  NoteEvent,
  TrainingScript,
  ScoredNote,
} from '@/lib/jam-partner/types';
import { getAllNotes, getNote, getNoteByMidi } from '@/lib/jam-partner/note-database';
import { getAudioEngine } from '@/lib/jam-partner/audio-engine';
import { getMIDIHandler } from '@/lib/jam-partner/midi-handler';
import { getHarmonyEngine } from '@/lib/jam-partner/harmony-engine';

export interface UseJamPartnerReturn {
  // State
  mode: JamMode;
  isPlaying: boolean;
  tempo: number;
  keySignature: string;
  scale: string;
  coherence: number;
  
  // Active notes
  activeInputNotes: Set<string>;
  activeOutputNotes: Set<string>;
  
  // Oscillators
  oscillators: MusicalOscillator[];
  
  // Harmony
  harmonyMatrix: number[][];
  
  // Patterns
  patterns: MusicalPattern[];
  
  // Auto-train state
  autoTrainProgress: number;
  autoTrainScript: TrainingScript | null;
  isAutoTraining: boolean;
  autoTrainSequenceIndex: number;
  
  // MIDI state
  midiConnected: boolean;
  midiInputs: Array<{ id: string; name: string }>;
  midiOutputs: Array<{ id: string; name: string }>;
  
  // Actions
  noteOn: (noteId: string, velocity?: number, isOutput?: boolean) => void;
  noteOff: (noteId: string, isOutput?: boolean) => void;
  setMode: (mode: JamMode) => void;
  setTempo: (bpm: number) => void;
  setKeySignature: (key: string) => void;
  setScale: (scale: string) => void;
  
  // Training
  recordPattern: (input: NoteEvent[], output: NoteEvent[]) => void;
  startAutoTrain: (script: TrainingScript) => void;
  stopAutoTrain: () => void;
  
  // MIDI
  connectMIDI: () => Promise<boolean>;
  selectMIDIInput: (deviceId: string) => void;
  selectMIDIOutput: (deviceId: string) => void;
  
  // Jam mode
  generateResponse: () => ScoredNote[];
  
  // Reset
  reset: () => void;
}

// Initialize 88 oscillators (one per piano key)
function createInitialOscillators(): MusicalOscillator[] {
  const notes = getAllNotes();
  return notes.map(note => ({
    noteId: note.id,
    prime: note.prime,
    phase: Math.random() * Math.PI * 2,
    amplitude: 0.1,
    frequency: 1 + Math.random() * 0.5,
    lastTriggered: 0,
  }));
}

export function useJamPartner(): UseJamPartnerReturn {
  // Core state
  const [mode, setMode] = useState<JamMode>('training');
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(90);
  const [keySignature, setKeySignature] = useState('C');
  const [scale, setScale] = useState('major');
  const [coherence, setCoherence] = useState(0);
  
  // Notes state
  const [activeInputNotes, setActiveInputNotes] = useState<Set<string>>(new Set());
  const [activeOutputNotes, setActiveOutputNotes] = useState<Set<string>>(new Set());
  
  // Oscillators
  const [oscillators, setOscillators] = useState<MusicalOscillator[]>(createInitialOscillators);
  
  // Patterns
  const [patterns, setPatterns] = useState<MusicalPattern[]>([]);
  
  // Auto-train state
  const [autoTrainProgress, setAutoTrainProgress] = useState(0);
  const [autoTrainScript, setAutoTrainScript] = useState<TrainingScript | null>(null);
  const [isAutoTraining, setIsAutoTraining] = useState(false);
  const [autoTrainSequenceIndex, setAutoTrainSequenceIndex] = useState(0);
  
  // MIDI state
  const [midiConnected, setMidiConnected] = useState(false);
  const [midiInputs, setMidiInputs] = useState<Array<{ id: string; name: string }>>([]);
  const [midiOutputs, setMidiOutputs] = useState<Array<{ id: string; name: string }>>([]);
  
  // Refs for engines
  const audioEngineRef = useRef(getAudioEngine());
  const midiHandlerRef = useRef(getMIDIHandler());
  const harmonyEngineRef = useRef(getHarmonyEngine());
  const animationRef = useRef<number>();
  const autoTrainTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Harmony matrix for visualization (12x12 semitones)
  const harmonyMatrix = useMemo(() => {
    return harmonyEngineRef.current.getSemitoneMatrix();
  }, [patterns, autoTrainProgress]);
  
  // Initialize audio on first interaction
  useEffect(() => {
    const initAudio = async () => {
      await audioEngineRef.current.initialize();
    };
    initAudio();
    
    return () => {
      audioEngineRef.current.dispose();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (autoTrainTimeoutRef.current) clearTimeout(autoTrainTimeoutRef.current);
    };
  }, []);
  
  // MIDI input handling
  useEffect(() => {
    if (!midiConnected) return;
    
    const handler = midiHandlerRef.current;
    
    const unsubNoteOn = handler.onNoteOn((midi, velocity) => {
      const note = getNoteByMidi(midi);
      if (note) {
        noteOn(note.id, velocity);
      }
    });
    
    const unsubNoteOff = handler.onNoteOff((midi) => {
      const note = getNoteByMidi(midi);
      if (note) {
        noteOff(note.id);
      }
    });
    
    return () => {
      unsubNoteOn();
      unsubNoteOff();
    };
  }, [midiConnected]);
  
  // Oscillator animation loop
  useEffect(() => {
    if (!isPlaying && !isAutoTraining) return;
    
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      setOscillators(prev => {
        const updated = prev.map(osc => {
          // Kuramoto-style phase update
          let phaseChange = osc.frequency * dt * Math.PI * 2;
          
          // Coupling with active notes
          for (const activeNote of activeInputNotes) {
            const activeOsc = prev.find(o => o.noteId === activeNote);
            if (activeOsc && activeOsc.noteId !== osc.noteId) {
              const coupling = 0.1 * activeOsc.amplitude;
              phaseChange += coupling * Math.sin(activeOsc.phase - osc.phase) * dt;
            }
          }
          
          // Amplitude decay
          let newAmplitude = osc.amplitude * 0.995;
          if (activeInputNotes.has(osc.noteId) || activeOutputNotes.has(osc.noteId)) {
            newAmplitude = Math.min(1, osc.amplitude + dt * 2);
          }
          
          return {
            ...osc,
            phase: (osc.phase + phaseChange) % (Math.PI * 2),
            amplitude: newAmplitude,
          };
        });
        
        // Calculate coherence (order parameter)
        let sumCos = 0, sumSin = 0;
        let activeCount = 0;
        for (const osc of updated) {
          if (osc.amplitude > 0.2) {
            sumCos += osc.amplitude * Math.cos(osc.phase);
            sumSin += osc.amplitude * Math.sin(osc.phase);
            activeCount++;
          }
        }
        if (activeCount > 0) {
          const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / activeCount;
          setCoherence(r);
        }
        
        return updated;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, isAutoTraining, activeInputNotes, activeOutputNotes]);
  
  // Note off handler (defined first so noteOn can reference it)
  const noteOff = useCallback((noteId: string, isOutput: boolean = false) => {
    audioEngineRef.current.stopNote(noteId);
    
    if (isOutput) {
      setActiveOutputNotes(prev => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    } else {
      setActiveInputNotes(prev => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    }
  }, []);

  // Note on handler
  const noteOn = useCallback((noteId: string, velocity: number = 100, isOutput: boolean = false) => {
    audioEngineRef.current.playNote(noteId, velocity);
    
    if (isOutput) {
      setActiveOutputNotes(prev => new Set(prev).add(noteId));
    } else {
      setActiveInputNotes(prev => new Set(prev).add(noteId));
      
      // In jam mode, generate AI response based on THIS note
      if (mode === 'jamming') {
        // Capture the current note immediately for the delayed response
        const inputForResponse = [noteId];
        
        setTimeout(() => {
          // Query harmony engine directly with the captured input note
          const suggestions = harmonyEngineRef.current.suggestOutputs(inputForResponse, 5);
          
          // Play top 2 suggestions that aren't the input note
          const toPlay = suggestions
            .filter(s => s.noteId !== noteId && s.score > 0.1)
            .slice(0, 2);
          
          for (const suggestion of toPlay) {
            noteOn(suggestion.noteId, 80, true);
            setTimeout(() => noteOff(suggestion.noteId, true), 400);
          }
        }, 100 + Math.random() * 100);
      }
    }
    
    // Excite corresponding oscillator
    setOscillators(prev => prev.map(osc => 
      osc.noteId === noteId 
        ? { ...osc, amplitude: 1, lastTriggered: Date.now() }
        : osc
    ));
    
    setIsPlaying(true);
  }, [mode, noteOff]);
  
  // Record a pattern
  const recordPattern = useCallback((input: NoteEvent[], output: NoteEvent[]) => {
    const pattern: MusicalPattern = {
      id: `pattern-${Date.now()}`,
      name: `Pattern ${patterns.length + 1}`,
      inputNotes: input,
      outputNotes: output,
      createdAt: Date.now(),
    };
    
    setPatterns(prev => [...prev, pattern]);
    harmonyEngineRef.current.recordSequence(input, output);
  }, [patterns]);
  
  // Generate response in jam mode
  const generateResponse = useCallback((): ScoredNote[] => {
    const inputNotes = Array.from(activeInputNotes);
    
    // Get oscillator resonance
    const resonance = new Map<string, number>();
    for (const osc of oscillators) {
      if (osc.amplitude > 0.3) {
        resonance.set(osc.noteId, osc.amplitude);
      }
    }
    
    return harmonyEngineRef.current.suggestOutputs(inputNotes, 5, resonance);
  }, [activeInputNotes, oscillators]);
  
  // Start auto-training
  const startAutoTrain = useCallback((script: TrainingScript) => {
    setAutoTrainScript(script);
    setAutoTrainProgress(0);
    setAutoTrainSequenceIndex(0);
    setIsAutoTraining(true);
    setMode('auto-train');
    
    const runSequence = (index: number) => {
      if (index >= script.sequences.length) {
        setIsAutoTraining(false);
        setAutoTrainProgress(100);
        setMode('jamming');
        return;
      }
      
      const seq = script.sequences[index];
      setAutoTrainSequenceIndex(index);
      
      // Play input notes
      const inputEndTime = Math.max(...seq.inputNotes.map(n => n.time + n.duration));
      
      for (const n of seq.inputNotes) {
        setTimeout(() => {
          noteOn(n.noteId, n.velocity, false);
          setTimeout(() => noteOff(n.noteId, false), n.duration);
        }, n.time);
      }
      
      // Play output notes after input
      setTimeout(() => {
        for (const n of seq.outputNotes) {
          setTimeout(() => {
            noteOn(n.noteId, n.velocity, true);
            setTimeout(() => noteOff(n.noteId, true), n.duration);
          }, n.time);
        }
        
        // Record to harmony engine
        harmonyEngineRef.current.recordSequence(seq.inputNotes, seq.outputNotes);
        
        const outputEndTime = Math.max(...seq.outputNotes.map(n => n.time + n.duration));
        
        // Move to next sequence
        autoTrainTimeoutRef.current = setTimeout(() => {
          setAutoTrainProgress(((index + 1) / script.sequences.length) * 100);
          runSequence(index + 1);
        }, outputEndTime + seq.delayMs);
        
      }, inputEndTime + 200);
    };
    
    runSequence(0);
  }, [noteOn, noteOff]);
  
  // Stop auto-training
  const stopAutoTrain = useCallback(() => {
    setIsAutoTraining(false);
    if (autoTrainTimeoutRef.current) {
      clearTimeout(autoTrainTimeoutRef.current);
    }
    audioEngineRef.current.stopAllNotes();
    setActiveInputNotes(new Set());
    setActiveOutputNotes(new Set());
  }, []);
  
  // MIDI connection
  const connectMIDI = useCallback(async () => {
    const success = await midiHandlerRef.current.requestAccess();
    if (success) {
      setMidiConnected(true);
      setMidiInputs(midiHandlerRef.current.getInputDevices().map(d => ({ id: d.id, name: d.name })));
      setMidiOutputs(midiHandlerRef.current.getOutputDevices().map(d => ({ id: d.id, name: d.name })));
    }
    return success;
  }, []);
  
  const selectMIDIInput = useCallback((deviceId: string) => {
    midiHandlerRef.current.selectInput(deviceId);
  }, []);
  
  const selectMIDIOutput = useCallback((deviceId: string) => {
    midiHandlerRef.current.selectOutput(deviceId);
  }, []);
  
  // Reset
  const reset = useCallback(() => {
    stopAutoTrain();
    setPatterns([]);
    setOscillators(createInitialOscillators());
    setCoherence(0);
    setAutoTrainProgress(0);
    setAutoTrainScript(null);
    setMode('training');
    harmonyEngineRef.current.reset();
  }, [stopAutoTrain]);
  
  return {
    mode,
    isPlaying,
    tempo,
    keySignature,
    scale,
    coherence,
    activeInputNotes,
    activeOutputNotes,
    oscillators,
    harmonyMatrix,
    patterns,
    autoTrainProgress,
    autoTrainScript,
    isAutoTraining,
    autoTrainSequenceIndex,
    midiConnected,
    midiInputs,
    midiOutputs,
    noteOn,
    noteOff,
    setMode,
    setTempo,
    setKeySignature,
    setScale,
    recordPattern,
    startAutoTrain,
    stopAutoTrain,
    connectMIDI,
    selectMIDIInput,
    selectMIDIOutput,
    generateResponse,
    reset,
  };
}
