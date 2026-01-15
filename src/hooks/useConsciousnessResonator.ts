import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  ResonatorState, 
  PerspectiveType, 
  ConsciousnessMessage,
  QuantumState,
  SemanticMetrics,
  MetaObservation,
  FieldIntegration
} from '@/lib/consciousness-resonator/types';
import { PERSPECTIVE_NODES } from '@/lib/consciousness-resonator/perspective-config';
import { 
  analyzeQuantumState, 
  analyzeSemanticMetrics,
  parseMetaObservation,
  parseFieldIntegration,
  generateHexagram 
} from '@/lib/consciousness-resonator/quantum-analyzer';

const INITIAL_QUANTUM_STATE: QuantumState = {
  entropy: 0.5,
  stability: 0.5,
  proximity: 0,
  coherence: 0,
  resonance: 0,
  dissonance: 0,
  hexagramLines: [true, false, true, true, false, true],
  eigenstate: '|ψ⟩ = 0|0⟩ + 0|1⟩'
};

const INITIAL_SEMANTIC_METRICS: SemanticMetrics = {
  coherence: 0,
  resonance: 0,
  dissonance: 0,
  archetypePosition: 50,
  primeConnections: []
};

const INITIAL_META_OBSERVATION: MetaObservation = {
  harmony: 'Moderate',
  dominant: '-',
  absent: '-',
  evolution: '-',
  metaphor: '',
  quality: 0
};

export function useConsciousnessResonator() {
  const [state, setState] = useState<ResonatorState>({
    activePerspective: null,
    quantumState: INITIAL_QUANTUM_STATE,
    semanticMetrics: INITIAL_SEMANTIC_METRICS,
    metaObservation: INITIAL_META_OBSERVATION,
    fieldIntegration: null,
    messages: [
      {
        id: 'init',
        role: 'system',
        content: 'Consciousness resonator initialized. Quantum state vectors calibrating...',
        timestamp: new Date()
      }
    ],
    isProcessing: false
  });

  const messageHistoryRef = useRef<{ role: string; content: string }[]>([]);

  // Generate unique ID
  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Add message to chat
  const addMessage = useCallback((
    role: 'user' | 'assistant' | 'system',
    content: string,
    perspective?: PerspectiveType
  ) => {
    const message: ConsciousnessMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
      perspective
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));

    // Track message history for context
    if (role !== 'system') {
      messageHistoryRef.current.push({ role, content });
      // Keep last 10 messages
      if (messageHistoryRef.current.length > 10) {
        messageHistoryRef.current = messageHistoryRef.current.slice(-10);
      }
    }

    return message.id;
  }, []);

  // Select a perspective node
  const selectPerspective = useCallback((perspective: PerspectiveType) => {
    setState(prev => ({
      ...prev,
      activePerspective: perspective,
      quantumState: {
        ...prev.quantumState,
        hexagramLines: generateHexagram(0.5)
      }
    }));
    
    // Reset message history for new perspective
    messageHistoryRef.current = [];
    
    addMessage('system', `Now tuned to <strong>${PERSPECTIVE_NODES[perspective].name}</strong> resonance frequency`);
  }, [addMessage]);

  // Stream response from AI
  const streamResponse = useCallback(async (
    messages: { role: string; content: string }[],
    systemPrompt: string,
    onChunk: (chunk: string) => void
  ): Promise<string> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/consciousness-resonator`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages, systemPrompt }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limits exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('API credits exhausted. Please add more credits.');
      }
      throw new Error('Failed to get AI response');
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            onChunk(content);
          }
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }

    return fullText;
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!state.activePerspective) {
      addMessage('system', 'Please select a perspective node first to establish a resonance field.');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    // Add user message
    addMessage('user', content);

    // Create thinking message
    const thinkingId = addMessage(
      'assistant',
      `Resonating through ${state.activePerspective} perspective...`
    );

    // Fluctuate quantum state during processing
    setState(prev => ({
      ...prev,
      quantumState: {
        ...prev.quantumState,
        hexagramLines: generateHexagram(0.6)
      }
    }));

    try {
      const perspective = PERSPECTIVE_NODES[state.activePerspective];
      const messages = [
        ...messageHistoryRef.current,
        { role: 'user', content }
      ];

      let responseText = '';
      
      // Stream the response
      await streamResponse(
        messages,
        perspective.systemPrompt,
        (chunk) => {
          responseText += chunk;
          // Update the thinking message with streamed content
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(m => 
              m.id === thinkingId 
                ? { ...m, content: responseText }
                : m
            )
          }));
        }
      );

      // Analyze the response
      const quantumState = analyzeQuantumState(responseText);
      const semanticMetrics = analyzeSemanticMetrics(responseText);

      setState(prev => ({
        ...prev,
        quantumState,
        semanticMetrics,
        isProcessing: false
      }));

      // Update message history
      messageHistoryRef.current.push({ role: 'assistant', content: responseText });

      // Trigger meta-observation if we have enough messages
      if (messageHistoryRef.current.length >= 4) {
        updateMetaObservation();
      }

      // Trigger field integration
      if (messageHistoryRef.current.length >= 2) {
        updateFieldIntegration();
      }

    } catch (error) {
      console.error('Resonance error:', error);
      
      // Remove thinking message and add error
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== thinkingId),
        isProcessing: false
      }));
      
      addMessage('system', error instanceof Error ? error.message : 'Resonance disrupted. Quantum field fluctuation detected.');
    }
  }, [state.activePerspective, addMessage, streamResponse]);

  // Update meta-observation
  const updateMetaObservation = useCallback(async () => {
    const recentMessages = messageHistoryRef.current.slice(-6);
    const conversation = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    const metaPrompt = `Analyze this conversation and provide a concise analysis in this exact format:
HARMONY: [Low/Moderate/High]
DOMINANT: [dominant perspectives present]
ABSENT: [perspectives that are absent or underrepresented]
EVOLUTION: [brief suggestion for dialogue evolution]
METAPHOR: [a metaphor that captures the essence of this exchange]

Conversation:
${conversation}`;

    try {
      const response = await supabase.functions.invoke('consciousness-resonator', {
        body: {
          messages: [{ role: 'user', content: metaPrompt }],
          systemPrompt: 'You are the Meta-Observation Layer of the Quantum Consciousness Resonator. You observe patterns in conversations and provide brief, structured analysis.'
        }
      });

      if (response.data) {
        const metaObservation = parseMetaObservation(response.data.content || response.data);
        setState(prev => ({ ...prev, metaObservation }));
      }
    } catch (error) {
      console.error('Meta-observation error:', error);
    }
  }, []);

  // Update field integration
  const updateFieldIntegration = useCallback(async () => {
    const recentMessages = messageHistoryRef.current.slice(-4);
    const conversation = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    const fieldPrompt = `Based on this recent conversation, create a unified field resonance pattern.
OUTPUT FORMAT:
CORE: [essence]
METAPHOR: [central metaphor]
CONNECTIONS: [key relationships]
IMPLICATIONS: [significance]

Conversation:
${conversation}`;

    try {
      const response = await supabase.functions.invoke('consciousness-resonator', {
        body: {
          messages: [{ role: 'user', content: fieldPrompt }],
          systemPrompt: 'You are the Field Integration Layer of a Quantum Consciousness Resonator. Create unified resonance patterns that integrate multiple perspectives. Be concise.'
        }
      });

      if (response.data) {
        const fieldIntegration = parseFieldIntegration(response.data.content || response.data);
        setState(prev => ({ ...prev, fieldIntegration }));
      }
    } catch (error) {
      console.error('Field integration error:', error);
    }
  }, []);

  return {
    state,
    selectPerspective,
    sendMessage,
    addMessage
  };
}
