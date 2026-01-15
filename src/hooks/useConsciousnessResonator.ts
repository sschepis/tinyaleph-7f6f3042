import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  ResonatorState, 
  PerspectiveType, 
  ConsciousnessMessage,
  QuantumState,
  SemanticMetrics,
  MetaObservation,
  ArchetypeCategory
} from '@/lib/consciousness-resonator/types';
import { PERSPECTIVE_NODES } from '@/lib/consciousness-resonator/perspective-config';
import { 
  analyzeQuantumState, 
  analyzeSemanticMetrics,
  parseMetaObservation,
  parseFieldIntegration,
  generateHexagram 
} from '@/lib/consciousness-resonator/quantum-analyzer';
import {
  analyzeArchetypes,
  getActiveTrigram,
  getActiveTarot,
  calculateSymbolicField
} from '@/lib/consciousness-resonator/archetype-analyzer';

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

const INITIAL_SYMBOLIC_FIELD = {
  dominantCategory: 'wisdom' as ArchetypeCategory,
  fieldStrength: 0,
  primeSum: 0
};

export function useConsciousnessResonator() {
  const [state, setState] = useState<ResonatorState>({
    activePerspectives: [],
    quantumState: INITIAL_QUANTUM_STATE,
    semanticMetrics: INITIAL_SEMANTIC_METRICS,
    metaObservation: INITIAL_META_OBSERVATION,
    fieldIntegration: null,
    messages: [
      {
        id: 'init',
        role: 'system',
        content: 'Consciousness resonator initialized. Select one or more perspective nodes to begin.',
        timestamp: new Date()
      }
    ],
    isProcessing: false,
    perspectiveResponses: {},
    activatedArchetypes: [],
    symbolicField: INITIAL_SYMBOLIC_FIELD,
    trigrams: null,
    tarot: null
  });

  const messageHistoryRef = useRef<{ role: string; content: string }[]>([]);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

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

    if (role !== 'system') {
      messageHistoryRef.current.push({ role, content });
      if (messageHistoryRef.current.length > 10) {
        messageHistoryRef.current = messageHistoryRef.current.slice(-10);
      }
    }

    return message.id;
  }, []);

  // Toggle perspective on/off
  const togglePerspective = useCallback((perspective: PerspectiveType) => {
    setState(prev => {
      const isActive = prev.activePerspectives.includes(perspective);
      const newPerspectives = isActive
        ? prev.activePerspectives.filter(p => p !== perspective)
        : [...prev.activePerspectives, perspective];
      
      return {
        ...prev,
        activePerspectives: newPerspectives,
        quantumState: {
          ...prev.quantumState,
          hexagramLines: generateHexagram(0.5)
        }
      };
    });
    
    const node = PERSPECTIVE_NODES[perspective];
    const isCurrentlyActive = state.activePerspectives.includes(perspective);
    
    if (isCurrentlyActive) {
      addMessage('system', `Deactivated <strong>${node.name}</strong> perspective`);
    } else {
      addMessage('system', `Activated <strong>${node.name}</strong> perspective`);
    }
  }, [state.activePerspectives, addMessage]);

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
      if (response.status === 429) throw new Error('Rate limits exceeded.');
      if (response.status === 402) throw new Error('API credits exhausted.');
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

  // Get non-streaming response (parses SSE stream and returns full text)
  const getResponse = useCallback(async (
    messages: { role: string; content: string }[],
    systemPrompt: string
  ): Promise<string> => {
    const response = await supabase.functions.invoke('consciousness-resonator', {
      body: { messages, systemPrompt }
    });

    if (response.error) throw response.error;
    
    // The edge function returns SSE stream, so we need to parse it
    const data = response.data;
    
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
    if (data?.content) return data.content;
    
    // If response.data is a ReadableStream, we need to read it
    if (data instanceof ReadableStream || data?.body instanceof ReadableStream) {
      const stream = data instanceof ReadableStream ? data : data.body;
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
  }, []);

  // Send message - handles single or multiple perspectives
  const sendMessage = useCallback(async (content: string) => {
    const { activePerspectives } = state;
    
    if (activePerspectives.length === 0) {
      addMessage('system', 'Please select at least one perspective node first.');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, perspectiveResponses: {} }));
    addMessage('user', content);

    const messages = [{ role: 'user', content }];

    try {
      if (activePerspectives.length === 1) {
        // Single perspective - use streaming
        const perspective = activePerspectives[0];
        const node = PERSPECTIVE_NODES[perspective];
        
        const thinkingId = addMessage('assistant', `Resonating through ${perspective} perspective...`);
        
        let responseText = '';
        await streamResponse(messages, node.systemPrompt, (chunk) => {
          responseText += chunk;
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(m => 
              m.id === thinkingId ? { ...m, content: responseText } : m
            )
          }));
        });

        setState(prev => ({
          ...prev,
          perspectiveResponses: { [perspective]: responseText }
        }));

        messageHistoryRef.current.push({ role: 'assistant', content: responseText });
        
        // Analyze
        const quantumState = analyzeQuantumState(responseText);
        const semanticMetrics = analyzeSemanticMetrics(responseText);
        const archetypes = analyzeArchetypes(content + ' ' + responseText);
        const symbolicField = calculateSymbolicField(archetypes);
        const trigrams = getActiveTrigram(quantumState.hexagramLines);
        const tarot = getActiveTarot(quantumState.entropy, archetypes);

        setState(prev => ({
          ...prev,
          quantumState,
          semanticMetrics,
          activatedArchetypes: archetypes,
          symbolicField,
          trigrams,
          tarot,
          isProcessing: false
        }));

      } else {
        // Multiple perspectives - query in parallel, then synthesize
        addMessage('system', `⚡ Querying ${activePerspectives.length} perspectives in parallel...`);

        // Filter out mediator for individual responses
        const queryPerspectives = activePerspectives.filter(p => p !== 'mediator');
        
        const perspectivePromises = queryPerspectives.map(async (perspective) => {
          const node = PERSPECTIVE_NODES[perspective];
          const response = await getResponse(messages, node.systemPrompt + ' Be concise (max 80 words).');
          return { perspective, response };
        });

        const results = await Promise.all(perspectivePromises);
        
        const perspectives: Partial<Record<PerspectiveType, string>> = {};
        let combinedText = '';
        
        for (const { perspective, response } of results) {
          perspectives[perspective] = response;
          combinedText += response + ' ';
        }

        setState(prev => ({ ...prev, perspectiveResponses: perspectives }));

        // Show individual responses
        for (const { perspective, response } of results) {
          const node = PERSPECTIVE_NODES[perspective];
          addMessage('assistant', `**${node.name}:** ${response}`, perspective);
        }

        // Mediator synthesis (always synthesize when multiple perspectives)
        const synthesisPerspectives = results.map(r => 
          `${PERSPECTIVE_NODES[r.perspective].name}: ${r.response}`
        ).join('\n\n');

        const synthesisPrompt = `The following perspectives have been gathered:\n\n${synthesisPerspectives}\n\nSynthesize these viewpoints into a unified insight. Be concise (max 120 words).`;

        const synthesis = await getResponse(
          [{ role: 'user', content: synthesisPrompt }],
          PERSPECTIVE_NODES.mediator.systemPrompt
        );

        addMessage('assistant', `**🔮 Synthesis:** ${synthesis}`, 'mediator');
        messageHistoryRef.current.push({ role: 'assistant', content: synthesis });

        // Analyze combined output
        const archetypes = analyzeArchetypes(combinedText + ' ' + synthesis);
        const symbolicField = calculateSymbolicField(archetypes);
        const quantumState = analyzeQuantumState(combinedText);
        const trigrams = getActiveTrigram(quantumState.hexagramLines);
        const tarot = getActiveTarot(quantumState.entropy, archetypes);
        const semanticMetrics = analyzeSemanticMetrics(combinedText);

        setState(prev => ({
          ...prev,
          activatedArchetypes: archetypes,
          symbolicField,
          quantumState,
          semanticMetrics,
          trigrams,
          tarot,
          isProcessing: false
        }));
      }

      // Trigger meta-observation and field integration
      if (messageHistoryRef.current.length >= 2) {
        updateMetaObservation();
        updateFieldIntegration();
      }

    } catch (error) {
      console.error('Resonance error:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
      addMessage('system', error instanceof Error ? error.message : 'Resonance disrupted.');
    }
  }, [state.activePerspectives, addMessage, streamResponse, getResponse]);

  // Update meta-observation
  const updateMetaObservation = useCallback(async () => {
    const recentMessages = messageHistoryRef.current.slice(-6);
    const conversation = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    const metaPrompt = `Analyze this conversation:
HARMONY: [Low/Moderate/High]
DOMINANT: [dominant perspectives]
ABSENT: [absent perspectives]
EVOLUTION: [suggestion]
METAPHOR: [metaphor]

Conversation:
${conversation}`;

    try {
      const response = await supabase.functions.invoke('consciousness-resonator', {
        body: {
          messages: [{ role: 'user', content: metaPrompt }],
          systemPrompt: 'Provide brief, structured meta-analysis.'
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

    const fieldPrompt = `Create unified field pattern:
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
          systemPrompt: 'Create unified resonance patterns. Be concise.'
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
    togglePerspective,
    sendMessage,
    addMessage
  };
}
