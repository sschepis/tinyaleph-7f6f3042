import { useState, useRef, useCallback, useEffect } from 'react';
import * as webllm from '@mlc-ai/web-llm';
import { Message, WebLLMConfig, WebLLMState, DEFAULT_CONFIG, ModelLoadProgress } from '@/lib/webllm/types';

export function useWebLLM(initialConfig: Partial<WebLLMConfig> = {}) {
  const [config, setConfig] = useState<WebLLMConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<WebLLMState>({
    isLoading: false,
    isGenerating: false,
    loadProgress: null,
    error: null,
    modelLoaded: false,
  });
  
  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize engine
  const loadModel = useCallback(async () => {
    if (state.modelLoaded || state.isLoading) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const startTime = Date.now();

    try {
      const engine = await webllm.CreateMLCEngine(config.modelId, {
        initProgressCallback: (report) => {
          const elapsed = (Date.now() - startTime) / 1000;
          setState(prev => ({
            ...prev,
            loadProgress: {
              progress: report.progress,
              text: report.text,
              timeElapsed: elapsed,
            },
          }));
        },
      });
      
      engineRef.current = engine;
      setState(prev => ({
        ...prev,
        isLoading: false,
        modelLoaded: true,
        loadProgress: null,
      }));
    } catch (error) {
      console.error('Failed to load model:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load model',
        loadProgress: null,
      }));
    }
  }, [config.modelId, state.modelLoaded, state.isLoading]);

  // Send message and get response
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!engineRef.current || state.isGenerating) return;

    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    abortControllerRef.current = new AbortController();

    try {
      // Build messages array with system prompt
      const chatMessages: webllm.ChatCompletionMessageParam[] = [
        { role: 'system', content: config.systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ];

      // Configure request
      const requestConfig: webllm.ChatCompletionRequestNonStreaming = {
        messages: chatMessages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: false,
      };

      // Add JSON mode if enabled
      if (config.jsonMode) {
        (requestConfig as any).response_format = { type: 'json_object' };
      }

      const response = await engineRef.current.chat.completions.create(requestConfig);
      
      const assistantContent = response.choices[0]?.message?.content || '';
      
      // Parse reasoning from DeepSeek R1 format (content between <think> tags)
      let reasoning: string | undefined;
      let cleanContent = assistantContent;
      
      const thinkMatch = assistantContent.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch) {
        reasoning = thinkMatch[1].trim();
        cleanContent = assistantContent.replace(/<think>[\s\S]*?<\/think>/, '').trim();
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date(),
        reasoning,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation aborted');
      } else {
        console.error('Generation error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Generation failed',
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
      abortControllerRef.current = null;
    }
  }, [config, messages, state.isGenerating]);

  // Stream message (alternative to sendMessage)
  const streamMessage = useCallback(async (userMessage: string, onToken: (token: string) => void) => {
    if (!engineRef.current || state.isGenerating) return;

    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const chatMessages: webllm.ChatCompletionMessageParam[] = [
        { role: 'system', content: config.systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ];

      const requestConfig: webllm.ChatCompletionRequestStreaming = {
        messages: chatMessages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true,
      };

      if (config.jsonMode) {
        (requestConfig as any).response_format = { type: 'json_object' };
      }

      let fullContent = '';
      const stream = await engineRef.current.chat.completions.create(requestConfig);

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        fullContent += delta;
        onToken(delta);
      }

      // Parse reasoning
      let reasoning: string | undefined;
      let cleanContent = fullContent;
      
      const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch) {
        reasoning = thinkMatch[1].trim();
        cleanContent = fullContent.replace(/<think>[\s\S]*?<\/think>/, '').trim();
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date(),
        reasoning,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Streaming error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Streaming failed',
      }));
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [config, messages, state.isGenerating]);

  // Stop generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (engineRef.current) {
      engineRef.current.interruptGenerate();
    }
    setState(prev => ({ ...prev, isGenerating: false }));
  }, []);

  // Clear conversation
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Update config
  const updateConfig = useCallback((updates: Partial<WebLLMConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        // Cleanup if needed
      }
    };
  }, []);

  return {
    // State
    config,
    messages,
    state,
    
    // Actions
    loadModel,
    sendMessage,
    streamMessage,
    stopGeneration,
    clearMessages,
    updateConfig,
  };
}
