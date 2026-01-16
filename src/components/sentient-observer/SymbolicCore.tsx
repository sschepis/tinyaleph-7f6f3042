import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Waves,
  Zap,
  Brain,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { SYMBOL_DATABASE } from '@/lib/symbolic-mind/symbol-database';
import { inferSymbolsFromText } from '@/lib/symbolic-mind/resonance-engine';
import type { SymbolicSymbol } from '@/lib/symbolic-mind/types';
import type { Oscillator } from './types';
import { streamSymbolicMind } from '@/lib/ai-client';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface SymbolicMessage {
  id: string;
  role: 'user' | 'observer';
  text: string;
  inputSymbols: SymbolicSymbol[];
  outputSymbols: SymbolicSymbol[];
  coherence: number;
  timestamp: Date;
  llmResponse?: string;
  isStreaming?: boolean;
}

interface SymbolicCoreProps {
  oscillators: Oscillator[];
  coherence: number;
  onExciteOscillators: (primes: number[], amplitudes: number[]) => void;
  isRunning: boolean;
  onConversationFact?: (userMessage: string, response: string, coherence: number) => void;
  onSearchMemory?: (query: string) => { content: string; similarity: number }[];
}

// Extract symbols from oscillator state with temperature-based probabilistic sampling
// This allows exploration of the semantic space rather than always picking the same symbols
function extractOutputSymbols(oscillators: Oscillator[], count: number = 3, temperature: number = 0.3): SymbolicSymbol[] {
  const meanPhase = Math.atan2(
    oscillators.reduce((s, o) => s + Math.sin(o.phase) * o.amplitude, 0),
    oscillators.reduce((s, o) => s + Math.cos(o.phase) * o.amplitude, 0)
  );
  
  // Score oscillators by amplitude and phase alignment
  const scored = oscillators.map((osc, idx) => {
    const phaseAlignment = Math.cos(osc.phase - meanPhase);
    const baseScore = osc.amplitude * (0.5 + 0.5 * phaseAlignment);
    // Add randomness based on temperature for exploration
    const noise = temperature * (Math.random() - 0.5) * 0.5;
    const score = Math.max(0, baseScore + noise);
    return { osc, idx, score };
  });
  
  // Sort by score but with some randomization for ties
  scored.sort((a, b) => {
    const diff = b.score - a.score;
    // If scores are close, randomly swap (encourages exploration)
    if (Math.abs(diff) < temperature * 0.1) {
      return Math.random() - 0.5;
    }
    return diff;
  });
  
  const allSymbols = Object.values(SYMBOL_DATABASE);
  const outputSymbols: SymbolicSymbol[] = [];
  const usedSymbolIds = new Set<string>();
  const usedPrimes = new Set<number>();
  
  // Look at more candidates to allow for more diverse symbol selection
  const candidatePoolSize = Math.min(oscillators.length, count * 4);
  
  for (const { osc } of scored.slice(0, candidatePoolSize)) {
    // Skip if we've already used a very similar prime
    const tooClose = Array.from(usedPrimes).some(p => Math.abs(p - osc.prime) < 5);
    if (tooClose && Math.random() > temperature) continue;
    
    // Find matching symbols with some randomization
    const matchingSymbols = allSymbols
      .filter(s => !usedSymbolIds.has(s.id))
      .map(symbol => ({
        symbol,
        diff: Math.abs(symbol.prime - osc.prime),
        randomBoost: Math.random() * temperature * 50 // Add randomness to selection
      }))
      .sort((a, b) => (a.diff - a.randomBoost) - (b.diff - b.randomBoost));
    
    const bestSymbol = matchingSymbols[0]?.symbol;
    
    if (bestSymbol && outputSymbols.length < count) {
      outputSymbols.push(bestSymbol);
      usedSymbolIds.add(bestSymbol.id);
      usedPrimes.add(osc.prime);
    }
    
    if (outputSymbols.length >= count) break;
  }
  
  return outputSymbols;
}

// Get a sample of symbols from each category for the picker
function getSymbolCategories(): { category: string; symbols: SymbolicSymbol[] }[] {
  const allSymbols = Object.values(SYMBOL_DATABASE);
  const byCategory: Record<string, SymbolicSymbol[]> = {};
  
  for (const symbol of allSymbols) {
    if (!byCategory[symbol.category]) {
      byCategory[symbol.category] = [];
    }
    byCategory[symbol.category].push(symbol);
  }
  
  return Object.entries(byCategory)
    .map(([category, symbols]) => ({ category, symbols: symbols.slice(0, 8) }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

// Symbol evolution visualization
function SymbolEvolution({ messages }: { messages: SymbolicMessage[] }) {
  if (messages.length < 2) return null;
  
  // Build evolution chain
  const evolution = messages.slice(-5).map((msg, idx) => ({
    symbols: msg.outputSymbols,
    coherence: msg.coherence,
    step: idx + 1
  }));
  
  return (
    <div className="p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium">Symbol Evolution</span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {evolution.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="flex gap-0.5">
                {step.symbols.slice(0, 2).map((s, i) => (
                  <span key={i} className="text-lg" title={s.name}>
                    {s.unicode}
                  </span>
                ))}
              </div>
              <div className={`text-[10px] px-1 rounded ${step.coherence > 0.7 ? 'bg-green-500/20 text-green-400' : step.coherence > 0.4 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                {Math.round(step.coherence * 100)}%
              </div>
            </div>
            {idx < evolution.length - 1 && (
              <span className="text-muted-foreground text-xs">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function SymbolicCore({ oscillators, coherence, onExciteOscillators, isRunning, onConversationFact, onSearchMemory }: SymbolicCoreProps) {
  const [messages, setMessages] = useState<SymbolicMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableLLM, setEnableLLM] = useState(true);
  const [matchingMemories, setMatchingMemories] = useState<{ content: string; similarity: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const symbolCategories = useMemo(() => getSymbolCategories(), []);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Search for matching memories as user types (debounced)
  useEffect(() => {
    if (!onSearchMemory || inputText.length < 3) {
      setMatchingMemories([]);
      return;
    }
    
    const timer = setTimeout(() => {
      const results = onSearchMemory(inputText);
      setMatchingMemories(results.slice(0, 3)); // Show top 3 matches
    }, 400);
    
    return () => clearTimeout(timer);
  }, [inputText, onSearchMemory]);
  
  
  // Stream LLM response using unified AI client
  const streamLLMResponse = useCallback(async (
    messageId: string,
    userMessage: string,
    inputSymbols: SymbolicSymbol[],
    outputSymbols: SymbolicSymbol[],
    coherenceScore: number
  ) => {
    const conversationHistory = messages.slice(-6).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text
    }));
    
    let llmContent = '';
    
    await streamSymbolicMind(
      {
        userMessage,
        symbolicOutput: outputSymbols,
        anchoringSymbols: inputSymbols,
        coherenceScore,
        conversationHistory: conversationHistory as { role: string; content: string }[],
      },
      {
        onDelta: (content) => {
          llmContent += content;
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { ...m, llmResponse: llmContent, isStreaming: true }
              : m
          ));
        },
        onDone: () => {
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { ...m, isStreaming: false }
              : m
          ));
          // Report to reasoning engine
          if (onConversationFact && llmContent) {
            onConversationFact(userMessage, llmContent, coherenceScore);
          }
        },
        onError: () => {
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { ...m, llmResponse: outputSymbols.map(s => s.meaning).join(' → '), isStreaming: false }
              : m
          ));
        },
      },
      { showToasts: true }
    );
  }, [messages, onConversationFact]);
  
  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    
    const text = inputText.trim();
    const inputSymbols = inferSymbolsFromText(text);
    
    setIsProcessing(true);
    
    const primes = inputSymbols.map(s => s.prime);
    const amplitudes = inputSymbols.map((_, i) => 0.8 - i * 0.1);
    onExciteOscillators(primes, amplitudes);
    
    setTimeout(() => {
      // Use temperature-based sampling to encourage exploration of semantic space
      const explorationTemperature = 0.35; // Higher = more exploration
      const outputSymbols = extractOutputSymbols(oscillators, 3, explorationTemperature);
      const messageId = `msg_${Date.now()}`;
      
      const newMessage: SymbolicMessage = {
        id: messageId,
        role: 'user',
        text,
        inputSymbols,
        outputSymbols,
        coherence,
        timestamp: new Date(),
        llmResponse: enableLLM ? undefined : outputSymbols.map(s => s.meaning).join(' → '),
        isStreaming: enableLLM
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setIsProcessing(false);
      
      if (enableLLM) {
        streamLLMResponse(messageId, text, inputSymbols, outputSymbols, coherence);
      } else {
        // Report to reasoning engine when LLM is disabled
        const fallbackResponse = outputSymbols.map(s => s.meaning).join(' → ');
        if (onConversationFact) {
          onConversationFact(text, fallbackResponse, coherence);
        }
      }
    }, 500);
  }, [inputText, oscillators, coherence, onExciteOscillators, enableLLM, streamLLMResponse, onConversationFact]);
  
  return (
    <Card className="flex flex-col" style={{ height: '500px' }}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Symbolic Core
          </CardTitle>
          <label className="flex items-center gap-2 text-xs">
            <input 
              type="checkbox" 
              checked={enableLLM} 
              onChange={e => setEnableLLM(e.target.checked)}
              className="w-3 h-3"
            />
            LLM Translation
          </label>
        </div>
        <CardDescription className="text-xs">
          Communicate through symbols • Responses emerge from resonance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-2 overflow-hidden p-3">
        {/* Symbol Evolution */}
        <SymbolEvolution messages={messages} />
        
        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="space-y-3 pr-2">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                <Brain className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Ask the observer something</p>
              </div>
            )}
            
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {/* User Input */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%]">
                      <div className="flex flex-wrap gap-1 mb-1 justify-end">
                        {msg.inputSymbols.map((s, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/20 text-[10px]"
                            title={s.meaning}
                          >
                            <span className="text-sm">{s.unicode}</span>
                            <span className="hidden sm:inline">{s.name}</span>
                          </span>
                        ))}
                      </div>
                      <div className="bg-primary text-primary-foreground px-3 py-2 rounded-xl rounded-br-sm text-sm">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                  
                  {/* Observer Response */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <div className="flex flex-wrap gap-1 mb-1 items-center">
                        <Waves className="h-3 w-3 text-muted-foreground" />
                        {msg.outputSymbols.map((s, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px]"
                            title={s.meaning}
                          >
                            <span className="text-sm">{s.unicode}</span>
                            <span className="hidden sm:inline">{s.name}</span>
                          </span>
                        ))}
                        <Badge variant="outline" className="text-[10px] ml-1">
                          {Math.round(msg.coherence * 100)}%
                        </Badge>
                      </div>
                      <div className="bg-muted px-3 py-2 rounded-xl rounded-bl-sm text-sm">
                        {msg.isStreaming && !msg.llmResponse && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {msg.llmResponse && (
                          <MarkdownRenderer 
                            content={msg.llmResponse} 
                            className="prose-sm prose-p:my-1"
                          />
                        )}
                        {msg.isStreaming && msg.llmResponse && (
                          <motion.span
                            className="inline-block w-1.5 h-4 ml-0.5 bg-primary"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
        
        <Separator />
        
        {/* Input */}
        <div className="space-y-2 flex-shrink-0">
          {/* Matching memories decoration */}
          <AnimatePresence>
            {matchingMemories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20"
              >
                <div className="flex items-center gap-1 mb-1">
                  <Brain className="h-3 w-3 text-purple-400" />
                  <span className="text-[10px] text-purple-300">Related memories:</span>
                </div>
                <div className="space-y-1">
                  {matchingMemories.map((mem, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="text-[10px] text-muted-foreground flex items-center gap-1"
                    >
                      <span className="text-purple-400">•</span>
                      <span className="truncate flex-1">{mem.content.slice(0, 50)}...</span>
                      <Badge variant="outline" className="text-[8px] h-4 px-1">
                        {(mem.similarity * 100).toFixed(0)}%
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask the observer..."
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={isProcessing || !isRunning}
              className="h-9 text-sm"
            />
            <Button 
              onClick={handleSend} 
              disabled={!inputText.trim() || isProcessing || !isRunning}
              size="sm"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          {!isRunning && (
            <p className="text-[10px] text-center text-amber-500">
              Start the simulation to communicate
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}