import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Send, 
  Sparkles, 
  Waves,
  MessageCircle,
  Zap,
  Brain
} from 'lucide-react';
import { SYMBOL_DATABASE } from '@/lib/symbolic-mind/symbol-database';
import { inferSymbolsFromText } from '@/lib/symbolic-mind/resonance-engine';
import type { SymbolicSymbol } from '@/lib/symbolic-mind/types';
import type { Oscillator } from './types';

interface SymbolicMessage {
  id: string;
  role: 'user' | 'observer';
  text: string;
  inputSymbols: SymbolicSymbol[];
  outputSymbols: SymbolicSymbol[];
  coherence: number;
  timestamp: Date;
}

interface SymbolicCoreProps {
  oscillators: Oscillator[];
  coherence: number;
  onExciteOscillators: (primes: number[], amplitudes: number[]) => void;
  isRunning: boolean;
}

// Map from symbol primes to oscillator indices
function findOscillatorByPrime(oscillators: Oscillator[], prime: number): number {
  // Find closest prime oscillator
  let bestIdx = 0;
  let bestDiff = Infinity;
  
  for (let i = 0; i < oscillators.length; i++) {
    const diff = Math.abs(oscillators[i].prime - prime);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  
  return bestIdx;
}

// Extract symbols from oscillator state based on phase coherence
function extractOutputSymbols(oscillators: Oscillator[], count: number = 3): SymbolicSymbol[] {
  // Find oscillators with highest amplitude and most coherent phases
  const meanPhase = Math.atan2(
    oscillators.reduce((s, o) => s + Math.sin(o.phase) * o.amplitude, 0),
    oscillators.reduce((s, o) => s + Math.cos(o.phase) * o.amplitude, 0)
  );
  
  // Score oscillators by their alignment to mean phase + amplitude
  const scored = oscillators.map((osc, idx) => {
    const phaseAlignment = Math.cos(osc.phase - meanPhase);
    const score = osc.amplitude * (0.5 + 0.5 * phaseAlignment);
    return { osc, idx, score };
  });
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  // Map top oscillators to symbols
  const allSymbols = Object.values(SYMBOL_DATABASE);
  const outputSymbols: SymbolicSymbol[] = [];
  const usedSymbolIds = new Set<string>();
  
  for (const { osc } of scored.slice(0, count * 2)) {
    // Find symbol with closest prime
    let bestSymbol: SymbolicSymbol | null = null;
    let bestDiff = Infinity;
    
    for (const symbol of allSymbols) {
      if (usedSymbolIds.has(symbol.id)) continue;
      const diff = Math.abs(symbol.prime - osc.prime);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSymbol = symbol;
      }
    }
    
    if (bestSymbol && outputSymbols.length < count) {
      outputSymbols.push(bestSymbol);
      usedSymbolIds.add(bestSymbol.id);
    }
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

export function SymbolicCore({ oscillators, coherence, onExciteOscillators, isRunning }: SymbolicCoreProps) {
  const [messages, setMessages] = useState<SymbolicMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolicSymbol[]>([]);
  const [inputMode, setInputMode] = useState<'text' | 'symbols'>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const symbolCategories = useMemo(() => getSymbolCategories(), []);
  
  // Toggle symbol selection
  const toggleSymbol = useCallback((symbol: SymbolicSymbol) => {
    setSelectedSymbols(prev => {
      const exists = prev.find(s => s.id === symbol.id);
      if (exists) {
        return prev.filter(s => s.id !== symbol.id);
      }
      return [...prev, symbol].slice(0, 5); // Max 5 symbols
    });
  }, []);
  
  // Process input and generate response
  const handleSend = useCallback(() => {
    let inputSymbols: SymbolicSymbol[];
    let text: string;
    
    if (inputMode === 'text' && inputText.trim()) {
      text = inputText.trim();
      inputSymbols = inferSymbolsFromText(text);
    } else if (inputMode === 'symbols' && selectedSymbols.length > 0) {
      inputSymbols = selectedSymbols;
      text = selectedSymbols.map(s => s.name).join(' + ');
    } else {
      return;
    }
    
    setIsProcessing(true);
    
    // Excite oscillators based on input symbols
    const primes = inputSymbols.map(s => s.prime);
    const amplitudes = inputSymbols.map((_, i) => 0.8 - i * 0.1); // Decreasing amplitude
    onExciteOscillators(primes, amplitudes);
    
    // Wait for resonance to develop, then read output
    setTimeout(() => {
      const outputSymbols = extractOutputSymbols(oscillators, 3);
      
      const newMessage: SymbolicMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        text,
        inputSymbols,
        outputSymbols,
        coherence,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setSelectedSymbols([]);
      setIsProcessing(false);
    }, 500);
  }, [inputMode, inputText, selectedSymbols, oscillators, coherence, onExciteOscillators]);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Symbolic Core Communication
        </CardTitle>
        <CardDescription>
          Communicate with the observer through symbols
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Messages area */}
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Send symbols to communicate with the observer.</p>
                <p className="text-xs mt-1">Your input excites oscillators; the response emerges from resonance.</p>
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
                  {/* Input */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="flex flex-wrap gap-1 mb-1 justify-end">
                        {msg.inputSymbols.map((s, i) => (
                          <motion.span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-xs"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            title={s.meaning}
                          >
                            <span className="text-base">{s.unicode}</span>
                            <span>{s.name}</span>
                          </motion.span>
                        ))}
                      </div>
                      <div className="bg-primary text-primary-foreground px-3 py-2 rounded-2xl rounded-br-md text-sm">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                  
                  {/* Output */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <div className="flex flex-wrap gap-1 mb-1">
                        <span className="text-xs text-muted-foreground mr-1">
                          <Waves className="h-3 w-3 inline" /> resonance:
                        </span>
                        {msg.outputSymbols.map((s, i) => (
                          <motion.span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            title={s.meaning}
                          >
                            <span className="text-base">{s.unicode}</span>
                            <span>{s.name}</span>
                          </motion.span>
                        ))}
                        <Badge variant="outline" className="text-xs ml-auto">
                          {Math.round(msg.coherence * 100)}%
                        </Badge>
                      </div>
                      <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-md text-sm">
                        <p className="italic text-muted-foreground">
                          {msg.outputSymbols.map(s => s.meaning).join(' → ')}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
        
        {/* Input area */}
        <div className="border-t pt-3 space-y-2">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'text' | 'symbols')}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="text">
                <MessageCircle className="h-3 w-3 mr-1" />
                Text
              </TabsTrigger>
              <TabsTrigger value="symbols">
                <Sparkles className="h-3 w-3 mr-1" />
                Symbols
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="mt-2">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Describe your query..."
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={isProcessing || !isRunning}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!inputText.trim() || isProcessing || !isRunning}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="symbols" className="mt-2 space-y-2">
              {/* Selected symbols */}
              {selectedSymbols.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-lg">
                  {selectedSymbols.map(s => (
                    <Badge 
                      key={s.id} 
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => toggleSymbol(s)}
                    >
                      {s.unicode} {s.name} ×
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Symbol picker */}
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {symbolCategories.slice(0, 4).map(({ category, symbols }) => (
                    <div key={category}>
                      <div className="text-xs text-muted-foreground capitalize mb-1">{category}</div>
                      <div className="flex flex-wrap gap-1">
                        {symbols.map(s => (
                          <button
                            key={s.id}
                            onClick={() => toggleSymbol(s)}
                            className={`
                              text-lg p-1 rounded hover:bg-accent transition-colors
                              ${selectedSymbols.find(sel => sel.id === s.id) ? 'bg-primary/20 ring-1 ring-primary' : ''}
                            `}
                            title={`${s.name}: ${s.meaning}`}
                          >
                            {s.unicode}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <Button 
                onClick={handleSend} 
                disabled={selectedSymbols.length === 0 || isProcessing || !isRunning}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Send {selectedSymbols.length} Symbol{selectedSymbols.length !== 1 ? 's' : ''}
              </Button>
            </TabsContent>
          </Tabs>
          
          {!isRunning && (
            <p className="text-xs text-center text-amber-500">
              Start the simulation to communicate
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}