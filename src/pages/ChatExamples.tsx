/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Activity, Loader2 } from 'lucide-react';
import SedenionVisualizer from '../components/SedenionVisualizer';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { supabase } from '@/integrations/supabase/client';
import { minimalConfig } from '@/lib/tinyaleph-config';
import { createSemanticEngine } from '@/lib/tinyaleph-engine';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  semantic?: {
    primes: number[];
    entropy: number;
    coherence: number;
  };
}

interface SemanticData {
  user: { primes: number[]; entropy: number; coherence: number };
  response: { primes: number[]; entropy: number; coherence: number };
  crossCoherence: number;
}

const ChatExamples = () => {
  const [engine] = useState(() => createSemanticEngine(minimalConfig));
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestSemantic, setLatestSemantic] = useState<SemanticData | null>(null);
  const [showSemantics, setShowSemantics] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get state components from backend for visualization
  const getStateComponents = useCallback((text: string): number[] => {
    try {
      const backend = engine.backend;
      const primes = backend.encode(text);
      const state = backend.primesToState(primes);
      // Access components via different possible property names
      const c = (state as any)?.c || (state as any)?.components || [];
      if (!Array.isArray(c)) return Array(16).fill(0);
      return c.slice(0, 16).map((val: number) => {
        const n = Number(val);
        return Number.isFinite(n) ? n : 0;
      });
    } catch {
      return Array(16).fill(0);
    }
  }, [engine]);

  // Retry with exponential backoff
  const invokeWithRetry = async (
    body: { messages: { role: string; content: string }[]; temperature: number },
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<{ data: any; error: any }> => {
    let lastError: any = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await supabase.functions.invoke('aleph-chat', { body });
        
        if (!result.error) {
          return result;
        }
        
        // Don't retry on client errors (4xx)
        const status = result.error?.status || result.error?.code;
        if (status && status >= 400 && status < 500 && status !== 429) {
          return result;
        }
        
        lastError = result.error;
      } catch (err) {
        lastError = err;
      }
      
      // Wait before retrying (exponential backoff with jitter)
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return { data: null, error: lastError };
  };

  // Format error message for display
  const formatErrorMessage = (error: any): string => {
    if (!error) return 'An unknown error occurred.';
    
    // Handle rate limiting
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return '⏳ Rate limit exceeded. Please wait a moment before trying again.';
    }
    
    // Handle network errors
    if (error.message?.includes('fetch') || error.message?.includes('network') || error.name === 'TypeError') {
      return '🌐 Network error. Please check your connection and try again.';
    }
    
    // Handle service unavailable
    if (error.status === 502 || error.status === 503 || error.message?.includes('unavailable')) {
      return '🔧 The AI service is temporarily unavailable. Please try again in a few moments.';
    }
    
    // Handle timeout
    if (error.message?.includes('timeout')) {
      return '⏱️ Request timed out. Please try again.';
    }
    
    // Handle configuration errors
    if (error.status === 500 && error.message?.includes('configuration')) {
      return '⚙️ Service configuration error. Please contact support.';
    }
    
    // Handle validation errors
    if (error.status === 400) {
      return `⚠️ Invalid request: ${error.message || 'Please check your input.'}`;
    }
    
    // Generic error with details
    const details = error.message || error.toString();
    return `❌ Error: ${details.length > 100 ? details.substring(0, 100) + '...' : details}`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await invokeWithRetry({
        messages: conversationHistory,
        temperature: 0.7,
      });

      if (error) {
        throw error;
      }

      if (!data?.content) {
        throw new Error('Empty response received from AI');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        semantic: data.semantic?.response,
      };

      // Update user message with semantic data
      setMessages(prev => prev.map(m => 
        m.id === userMessage.id 
          ? { ...m, semantic: data.semantic?.user }
          : m
      ));
      setMessages(prev => [...prev, assistantMessage]);
      setLatestSemantic(data.semantic);

    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formatErrorMessage(error),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const examplePrompts = [
    'What is the relationship between wisdom and truth?',
    'Explain how prime numbers encode meaning',
    'Tell me about harmony and chaos',
    'How does semantic entropy work?',
  ];

  return (
    <div className="pt-20">
      <main className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-4">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Aleph Chat</span>
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Semantic AI Chat
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chat with an AI that understands meaning through prime-based hypercomplex algebra.
              Watch the semantic state evolve in real-time.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Panel */}
            <div className="lg:col-span-2 flex flex-col h-[600px] rounded-xl border border-border bg-card overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-6">
                      Start a conversation with Aleph
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {examplePrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(prompt)}
                          className="px-3 py-2 text-sm rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${message.role === 'user' ? 'bg-primary/20' : 'bg-secondary'}
                    `}>
                      {message.role === 'user' 
                        ? <User className="w-4 h-4 text-primary" />
                        : <Bot className="w-4 h-4 text-muted-foreground" />
                      }
                    </div>
                    <div className={`
                      flex-1 max-w-[80%] p-4 rounded-xl
                      ${message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary'
                      }
                    `}>
                      {message.role === 'assistant' ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      {showSemantics && message.semantic && (
                        <div className={`
                          mt-2 pt-2 border-t text-xs flex gap-4
                          ${message.role === 'user' 
                            ? 'border-primary-foreground/20 text-primary-foreground/70' 
                            : 'border-border text-muted-foreground'
                          }
                        `}>
                          <span>H: {message.semantic.entropy.toFixed(2)}</span>
                          <span>C: {message.semantic.coherence.toFixed(2)}</span>
                          <span>P: {message.semantic.primes.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <Bot className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-secondary p-4 rounded-xl">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary/50 focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Semantic Panel */}
            <div className="space-y-4">
              {/* Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <span className="text-sm font-medium">Show Semantics</span>
                <button
                  onClick={() => setShowSemantics(!showSemantics)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${showSemantics ? 'bg-primary' : 'bg-secondary'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform
                    ${showSemantics ? 'translate-x-6' : 'translate-x-0.5'}
                  `} />
                </button>
              </div>

              {/* Current State Visualizer */}
              {messages.length > 0 && (
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Latest Message State</span>
                  </div>
                  <SedenionVisualizer 
                    components={getStateComponents(messages[messages.length - 1]?.content || '')}
                    size="lg"
                  />
                </div>
              )}

              {/* Cross-Coherence */}
              {latestSemantic && (
                <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                  <h4 className="text-sm font-medium">Semantic Analysis</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cross-Coherence</span>
                      <span className="font-mono">{latestSemantic.crossCoherence.toFixed(3)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${latestSemantic.crossCoherence * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">User Entropy</span>
                      <div className="font-mono text-sm">{latestSemantic.user.entropy.toFixed(3)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Response Entropy</span>
                      <div className="font-mono text-sm">{latestSemantic.response.entropy.toFixed(3)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">User Coherence</span>
                      <div className="font-mono text-sm">{latestSemantic.user.coherence.toFixed(3)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Response Coherence</span>
                      <div className="font-mono text-sm">{latestSemantic.response.coherence.toFixed(3)}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">User Primes</span>
                    <div className="font-mono text-xs mt-1 text-primary">
                      [{latestSemantic.user.primes.slice(0, 8).join(', ')}{latestSemantic.user.primes.length > 8 ? '...' : ''}]
                    </div>
                  </div>
                </div>
              )}

              {/* Info Card */}
              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="text-sm font-medium mb-2">How It Works</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Messages are encoded as prime signatures</li>
                  <li>• Primes map to 16D sedenion states</li>
                  <li>• Entropy measures semantic focus</li>
                  <li>• Coherence measures meaning alignment</li>
                  <li>• Cross-coherence shows semantic resonance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatExamples;
