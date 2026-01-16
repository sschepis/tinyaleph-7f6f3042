import { useState, useRef, useCallback, useEffect } from 'react';
import * as webllm from '@mlc-ai/web-llm';
import { 
  Message, 
  WebLLMConfig, 
  WebLLMState, 
  DEFAULT_CONFIG, 
  PerformanceStats 
} from '@/lib/webllm/types';

export function useWebLLM(initialConfig: Partial<WebLLMConfig> = {}) {
  const [config, setConfig] = useState<WebLLMConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<WebLLMState>({
    isLoading: false,
    isGenerating: false,
    loadProgress: null,
    error: null,
    modelLoaded: false,
    performanceStats: null,
  });
  
  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadStartTimeRef = useRef<number>(0);

  // Get memory usage if available
  const getMemoryUsage = useCallback((): number | null => {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return Math.round(mem.usedJSHeapSize / 1024 / 1024);
    }
    return null;
  }, []);

  // Initialize engine
  const loadModel = useCallback(async (modelId?: string) => {
    const targetModelId = modelId || config.modelId;
    
    // If switching models, unload the current one
    if (state.modelLoaded && engineRef.current && modelId && modelId !== config.modelId) {
      engineRef.current = null;
      setState(prev => ({ ...prev, modelLoaded: false }));
    }
    
    if (state.isLoading) return;
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      performanceStats: null,
    }));
    loadStartTimeRef.current = Date.now();

    try {
      const engine = await webllm.CreateMLCEngine(targetModelId, {
        initProgressCallback: (report) => {
          const elapsed = (Date.now() - loadStartTimeRef.current) / 1000;
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
      const loadTimeMs = Date.now() - loadStartTimeRef.current;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        modelLoaded: true,
        loadProgress: null,
        performanceStats: {
          tokensPerSecond: 0,
          totalTokens: 0,
          promptTokens: 0,
          completionTokens: 0,
          inferenceTimeMs: 0,
          loadTimeMs,
          memoryUsedMB: getMemoryUsage(),
        },
      }));
      
      // Update config with the new model ID
      if (modelId) {
        setConfig(prev => ({ ...prev, modelId: targetModelId }));
      }
    } catch (error) {
      console.error('Failed to load model:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load model',
        loadProgress: null,
      }));
    }
  }, [config.modelId, state.modelLoaded, state.isLoading, getMemoryUsage]);

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
    const inferenceStart = Date.now();

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
      // WebLLM expects schema as a non-empty string; empty/null should omit schema entirely
      if (config.jsonMode) {
        const schemaString = config.jsonSchema?.trim();
        if (schemaString) {
          (requestConfig as any).response_format = { 
            type: 'json_object',
            schema: schemaString
          };
        } else {
          (requestConfig as any).response_format = { type: 'json_object' };
        }
      }

      const response = await engineRef.current.chat.completions.create(requestConfig);
      const inferenceTimeMs = Date.now() - inferenceStart;
      
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

      // Update performance stats
      const usage = response.usage;
      if (usage) {
        const completionTokens = usage.completion_tokens || 0;
        const tokensPerSecond = completionTokens / (inferenceTimeMs / 1000);
        
        setState(prev => ({
          ...prev,
          performanceStats: {
            ...prev.performanceStats!,
            tokensPerSecond: Math.round(tokensPerSecond * 10) / 10,
            totalTokens: usage.total_tokens || 0,
            promptTokens: usage.prompt_tokens || 0,
            completionTokens,
            inferenceTimeMs,
            memoryUsedMB: getMemoryUsage(),
          },
        }));
      }
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
  }, [config, messages, state.isGenerating, getMemoryUsage]);

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

    const inferenceStart = Date.now();
    let tokenCount = 0;

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

      // Add JSON mode if enabled
      // WebLLM expects schema as a non-empty string; empty/null should omit schema entirely
      if (config.jsonMode) {
        const schemaString = config.jsonSchema?.trim();
        if (schemaString) {
          (requestConfig as any).response_format = { 
            type: 'json_object',
            schema: schemaString
          };
        } else {
          (requestConfig as any).response_format = { type: 'json_object' };
        }
      }

      let fullContent = '';
      const stream = await engineRef.current.chat.completions.create(requestConfig);

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        fullContent += delta;
        tokenCount++;
        onToken(delta);
        
        // Update live performance stats
        const elapsed = Date.now() - inferenceStart;
        if (elapsed > 0) {
          setState(prev => ({
            ...prev,
            performanceStats: prev.performanceStats ? {
              ...prev.performanceStats,
              tokensPerSecond: Math.round((tokenCount / (elapsed / 1000)) * 10) / 10,
              completionTokens: tokenCount,
              inferenceTimeMs: elapsed,
              memoryUsedMB: getMemoryUsage(),
            } : null,
          }));
        }
      }

      const inferenceTimeMs = Date.now() - inferenceStart;

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

      // Final stats update
      setState(prev => ({
        ...prev,
        performanceStats: prev.performanceStats ? {
          ...prev.performanceStats,
          tokensPerSecond: Math.round((tokenCount / (inferenceTimeMs / 1000)) * 10) / 10,
          completionTokens: tokenCount,
          inferenceTimeMs,
          memoryUsedMB: getMemoryUsage(),
        } : null,
      }));
    } catch (error) {
      console.error('Streaming error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Streaming failed',
      }));
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [config, messages, state.isGenerating, getMemoryUsage]);

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
