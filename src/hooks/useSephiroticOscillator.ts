import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  SephiroticState, 
  SephirahName, 
  ChatMessage, 
  MeditationSequence
} from '@/lib/sephirotic-oscillator/types';
import { 
  initializeResonators,
  energizeResonator,
  propagateResonance,
  calculateResonatorCoherence,
  calculateTotalStoredEnergy,
  getResonatorDominantPillar,
  getActiveResonators,
  RESONATOR_PROPERTIES,
  type ResonatorNode
} from '@/lib/sephirotic-oscillator/resonator-physics';
import {
  analyzeSemanticActivation,
  buildSystemPrompt
} from '@/lib/sephirotic-oscillator/semantic-analyzer';
import { SEPHIROT } from '@/lib/sephirotic-oscillator/tree-config';
import { sephiroticSonicEngine } from '@/lib/sephirotic-oscillator/sonic-engine';

// Extend state to use resonator nodes
interface ResonatorState extends Omit<SephiroticState, 'oscillators'> {
  oscillators: Map<SephirahName, ResonatorNode>;
}

const INITIAL_STATE: ResonatorState = {
  oscillators: initializeResonators(),
  flows: [],
  totalEnergy: 0,
  coherence: 0,
  dominantPillar: null,
  activeSephirot: [],
  meditationMode: null,
  meditationStep: 0,
  isProcessing: false,
  messages: [{
    id: 'init',
    role: 'system',
    content: 'The Tree of Life awaits. Each Sephirah is a resonant cavity—click to inject energy, or ask a question to activate semantic resonance across the paths.',
    timestamp: new Date()
  }]
};

export function useSephiroticOscillator() {
  const [state, setState] = useState<ResonatorState>(INITIAL_STATE);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const animationRef = useRef<number | null>(null);
  const meditationTimerRef = useRef<number | null>(null);
  const messageHistoryRef = useRef<{ role: string; content: string }[]>([]);

  // Animation loop for cavity resonator propagation
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      setState(prev => {
        const { resonators, flows } = propagateResonance(prev.oscillators, dt * 2);
        return {
          ...prev,
          oscillators: resonators,
          flows,
          totalEnergy: calculateTotalStoredEnergy(resonators),
          coherence: calculateResonatorCoherence(resonators),
          dominantPillar: getResonatorDominantPillar(resonators),
          activeSephirot: getActiveResonators(resonators)
        };
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Handle meditation mode stepping
  useEffect(() => {
    if (!state.meditationMode) return;
    
    const sequence = state.meditationMode;
    
    if (state.meditationStep >= sequence.path.length) {
      // Meditation complete
      setState(prev => ({
        ...prev,
        meditationMode: null,
        meditationStep: 0
      }));
      return;
    }
    
    meditationTimerRef.current = window.setTimeout(() => {
      const currentSephirah = sequence.path[state.meditationStep];
      const sephirah = SEPHIROT[currentSephirah];
      const props = RESONATOR_PROPERTIES[currentSephirah];
      
      // Play meditation tone at the sephirah's resonant frequency
      if (soundEnabled) {
        sephiroticSonicEngine.playMeditationStep(
          currentSephirah,
          sephirah.pillar,
          state.meditationStep,
          sequence.path.length
        );
      }
      
      // Inject energy at the cavity's resonant frequency for maximum absorption
      setState(prev => ({
        ...prev,
        oscillators: energizeResonator(prev.oscillators, currentSephirah, 0.8, props.resonantFreq),
        meditationStep: prev.meditationStep + 1
      }));
    }, sequence.duration);
    
    return () => {
      if (meditationTimerRef.current) {
        clearTimeout(meditationTimerRef.current);
      }
    };
  }, [state.meditationMode, state.meditationStep, soundEnabled]);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Toggle sound
  const toggleSound = useCallback(async () => {
    if (soundEnabled) {
      sephiroticSonicEngine.disable();
      setSoundEnabled(false);
    } else {
      await sephiroticSonicEngine.enable();
      setSoundEnabled(true);
    }
  }, [soundEnabled]);

  // Click to energize a sephirah's cavity
  const clickSephirah = useCallback((sephirahId: SephirahName) => {
    const sephirah = SEPHIROT[sephirahId];
    const props = RESONATOR_PROPERTIES[sephirahId];
    
    // Play sound at resonant frequency
    if (soundEnabled) {
      sephiroticSonicEngine.playSephirahTone(sephirahId, sephirah.pillar, 0.6);
    }
    
    // Inject energy at resonant frequency for optimal absorption
    setState(prev => ({
      ...prev,
      oscillators: energizeResonator(prev.oscillators, sephirahId, 0.6, props.resonantFreq)
    }));
  }, [soundEnabled]);

  // Start a meditation sequence
  const startMeditation = useCallback((sequence: MeditationSequence) => {
    setState(prev => ({
      ...prev,
      meditationMode: sequence,
      meditationStep: 0,
      oscillators: initializeResonators()
    }));
  }, []);

  // Stop meditation
  const stopMeditation = useCallback(() => {
    if (meditationTimerRef.current) {
      clearTimeout(meditationTimerRef.current);
    }
    setState(prev => ({
      ...prev,
      meditationMode: null,
      meditationStep: 0
    }));
  }, []);

  // Parse SSE stream response - handles ReadableStream from edge function
  const parseSSEResponse = async (data: unknown): Promise<string> => {
    // If it's already a string with SSE format, parse it
    if (typeof data === 'string') {
      let fullText = '';
      const lines = data.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullText += content;
          } catch {
            // Skip non-JSON lines
          }
        }
      }
      return fullText || data;
    }
    
    // If response.data has a content property
    if (data && typeof data === 'object' && 'content' in data) {
      return String((data as { content: string }).content);
    }
    
    // If response.data is a ReadableStream, we need to read it
    if (data instanceof ReadableStream || (data && typeof data === 'object' && 'body' in data && (data as { body: unknown }).body instanceof ReadableStream)) {
      const stream = data instanceof ReadableStream ? data : (data as { body: ReadableStream }).body;
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullText += content;
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
      return fullText;
    }
    
    return String(data || '');
  };

  // Send message and get AI response
  const sendMessage = useCallback(async (content: string) => {
    const { activated, energyMap } = analyzeSemanticActivation(content);
    
    // Energize activated sephirot cavities
    let newOscillators = state.oscillators;
    energyMap.forEach((energy, sephirahId) => {
      if (energy > 0.1) {
        const props = RESONATOR_PROPERTIES[sephirahId];
        // Inject at a slightly detuned frequency to simulate natural input
        const inputFreq = props.resonantFreq * (0.9 + Math.random() * 0.2);
        newOscillators = energizeResonator(newOscillators, sephirahId, energy, inputFreq);
        
        // Play resonance sounds for activated sephirot
        if (soundEnabled && energy > 0.2) {
          const sephirah = SEPHIROT[sephirahId];
          setTimeout(() => {
            sephiroticSonicEngine.playSephirahTone(sephirahId, sephirah.pillar, energy * 0.5, 1.2);
          }, Math.random() * 200);
        }
      }
    });
    
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      activatedSephirot: activated
    };
    
    setState(prev => ({
      ...prev,
      oscillators: newOscillators,
      messages: [...prev.messages, userMessage],
      isProcessing: true
    }));
    
    messageHistoryRef.current.push({ role: 'user', content });
    
    try {
      const systemPrompt = buildSystemPrompt(activated);
      
      const response = await supabase.functions.invoke('sephirotic-oracle', {
        body: {
          messages: messageHistoryRef.current,
          systemPrompt,
          activeSephirot: activated
        }
      });
      
      if (response.error) throw response.error;
      
      const assistantContent = await parseSSEResponse(response.data);
      
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };
      
      messageHistoryRef.current.push({ role: 'assistant', content: assistantContent });
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isProcessing: false
      }));
    } catch (error) {
      console.error('Sephirotic oracle error:', error);
      
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'system',
        content: 'The Tree\'s voice is momentarily obscured. Please try again.',
        timestamp: new Date()
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isProcessing: false
      }));
    }
  }, [state.oscillators, soundEnabled]);

  // Reset the system
  const reset = useCallback(() => {
    messageHistoryRef.current = [];
    setState({
      ...INITIAL_STATE,
      oscillators: initializeResonators()
    });
  }, []);

  return {
    state,
    soundEnabled,
    toggleSound,
    clickSephirah,
    startMeditation,
    stopMeditation,
    sendMessage,
    reset
  };
}
