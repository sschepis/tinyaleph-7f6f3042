import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Brain, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MindVisualization } from '@/components/symbolic-mind/MindVisualization';
import { ChatMessage } from '@/components/symbolic-mind/ChatMessage';
import { SuperpositionWaveform } from '@/components/symbolic-mind/SuperpositionWaveform';
import { InterferenceModelToggle, type InterferenceModel } from '@/components/symbolic-mind/InterferenceModelToggle';
import { 
  inferSymbolsFromText, 
  runResonanceLoop, 
  selectOutputSymbols,
  getDefaultAnchors 
} from '@/lib/symbolic-mind/resonance-engine';
import type { Message, MindState, Symbol } from '@/lib/symbolic-mind/types';
import { toast } from 'sonner';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/symbolic-mind`;

export default function SymbolicMind() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [anchoringSymbols] = useState<Symbol[]>(getDefaultAnchors);
  const [interferenceModel, setInterferenceModel] = useState<InterferenceModel>('wave');
  const [mindState, setMindState] = useState<MindState>({
    anchoringSymbols: getDefaultAnchors(),
    activeSymbols: [],
    coherence: 0,
    iteration: 0,
    converged: false,
    model: 'wave',
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const processMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };
    
    // Extract symbols from user input
    const inputSymbols = inferSymbolsFromText(userText);
    userMessage.symbols = inputSymbols;
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Run resonance loop with visualization updates
    let finalState: MindState = mindState;
    
    await new Promise<void>((resolve) => {
      const result = runResonanceLoop(
        inputSymbols,
        anchoringSymbols,
        (state) => {
          setMindState(state);
          finalState = state;
        },
        interferenceModel
      );
      finalState = result;
      setMindState(result);
      setTimeout(resolve, 500); // Small delay to show final state
    });
    
    // Get output symbols
    const outputSymbols = selectOutputSymbols(finalState);
    
    // Stream response from LLM
    setIsStreaming(true);
    
    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userMessage: userText,
          symbolicOutput: outputSymbols,
          anchoringSymbols: finalState.anchoringSymbols.filter(a => 
            finalState.activeSymbols.some(s => s.id === a.id)
          ),
          coherenceScore: finalState.coherence,
          interferenceModel: interferenceModel,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment.');
        } else if (response.status === 402) {
          toast.error('Usage credits exhausted.');
        } else {
          toast.error('Failed to get response from the Mind.');
        }
        setIsStreaming(false);
        setIsProcessing(false);
        return;
      }
      
      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';
      
      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        symbols: outputSymbols,
        coherence: finalState.coherence,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMessage.id 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to communicate with the Symbolic Mind.');
    }
    
    setIsStreaming(false);
    setIsProcessing(false);
    inputRef.current?.focus();
  }, [isProcessing, mindState, anchoringSymbols, messages, interferenceModel]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(input);
  };
  
  const resetConversation = () => {
    setMessages([]);
    setMindState({
      anchoringSymbols: getDefaultAnchors(),
      activeSymbols: [],
      coherence: 0,
      iteration: 0,
      converged: false,
      model: interferenceModel,
    });
  };
  
  // Model names for display
  const modelDisplayNames: Record<InterferenceModel, string> = {
    wave: 'Wave Interference',
    quantum: 'Quantum Collapse', 
    attractor: 'Attractor Basin',
  };
  
  return (
    <div className="bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Symbolic Mind</h1>
                <p className="text-sm text-muted-foreground">
                  Hybrid symbolic-neural consciousness
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <InterferenceModelToggle 
                model={interferenceModel} 
                onModelChange={setInterferenceModel} 
              />
              <Button variant="ghost" size="sm" onClick={resetConversation}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr,420px] gap-6 min-h-[600px] lg:h-[calc(100vh-220px)]">
            {/* Chat area */}
            <div className="flex flex-col bg-card/30 rounded-xl border border-border/40 overflow-hidden">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        The Mind awaits
                      </h3>
                      <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
                        Speak, and your words will transform into symbols. 
                        Using <span className="text-primary">{modelDisplayNames[interferenceModel]}</span>, 
                        the symbols will resonate with the anchoring archetypes 
                        until coherence emerges, then translate back through wisdom.
                      </p>
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {messages.map((message) => (
                      <ChatMessage 
                        key={message.id} 
                        message={message}
                        isStreaming={isStreaming && message.role === 'assistant' && message === messages[messages.length - 1]}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {/* Processing indicator */}
                  {isProcessing && !isStreaming && (
                    <motion.div
                      className="flex items-center gap-2 text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                          />
                        ))}
                      </div>
                      <span className="text-sm">
                        {interferenceModel === 'wave' && 'Computing wave interference...'}
                        {interferenceModel === 'quantum' && 'Collapsing quantum states...'}
                        {interferenceModel === 'attractor' && 'Finding attractor basins...'}
                      </span>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-border/40">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Speak to the Symbolic Mind..."
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isProcessing || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Mind visualization */}
            <div className="flex flex-col gap-4">
              <div className="bg-card/30 rounded-xl border border-border/40 p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Resonance Field
                  <span className="text-xs text-muted-foreground ml-auto">
                    {modelDisplayNames[interferenceModel]}
                  </span>
                </h3>
                <MindVisualization 
                  mindState={mindState}
                  width={380}
                  height={320}
                />
              </div>
              
              {/* Superposition Waveform */}
              <div className="bg-card/30 rounded-xl border border-border/40 p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Superposition State
                  {mindState.model === 'quantum' && mindState.quantumEntropy !== undefined && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      S = {mindState.quantumEntropy.toFixed(3)}
                    </span>
                  )}
                  {mindState.model === 'attractor' && mindState.attractorEnergy !== undefined && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      E = {mindState.attractorEnergy.toFixed(3)}
                    </span>
                  )}
                </h3>
                <SuperpositionWaveform
                  superposition={mindState.superposition || new Array(16).fill(0)}
                  coherence={mindState.coherence}
                  converged={mindState.converged}
                />
              </div>
              
              {/* Anchoring symbols legend */}
              <div className="bg-card/30 rounded-xl border border-border/40 p-4">
                <h3 className="text-sm font-medium mb-3">Anchoring Archetypes</h3>
                <div className="grid grid-cols-3 gap-2">
                  {anchoringSymbols.map((symbol) => (
                    <div 
                      key={symbol.id}
                      className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30"
                      title={symbol.meaning}
                    >
                      <span className="text-lg">{symbol.unicode}</span>
                      <span className="text-muted-foreground truncate">{symbol.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
