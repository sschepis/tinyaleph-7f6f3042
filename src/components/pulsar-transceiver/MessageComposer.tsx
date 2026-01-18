import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Plus, 
  X, 
  ArrowRight, 
  Sparkles, 
  Hash,
  MessageSquare,
  Shuffle,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SemanticMapping, SRCTransmission } from '@/lib/pulsar-transceiver/types';

interface MessageComposerProps {
  semanticMap: SemanticMapping[];
  phaseLocked: boolean;
  onTransmitSequence: (primes: number[]) => void;
  referencePhase: number;
}

interface PrimeToken {
  id: string;
  prime: number;
  meaning: string;
}

// Hash function to generate deterministic prime from text
function textToPrime(text: string): number {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return primes[Math.abs(hash) % primes.length];
}

// Break text into semantic components
function analyzeText(text: string, semanticMap: SemanticMapping[]): PrimeToken[] {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const tokens: PrimeToken[] = [];
  
  words.forEach((word, index) => {
    // First check if word matches any meaning in semantic map
    const mapping = semanticMap.find(m => 
      m.meaning.toLowerCase().includes(word) || 
      word.includes(m.meaning.toLowerCase())
    );
    
    if (mapping) {
      tokens.push({
        id: `${word}-${index}-${Date.now()}`,
        prime: mapping.prime,
        meaning: mapping.meaning
      });
    } else {
      // Generate prime from word hash
      const prime = textToPrime(word);
      tokens.push({
        id: `${word}-${index}-${Date.now()}`,
        prime,
        meaning: word
      });
    }
  });
  
  return tokens;
}

export default function MessageComposer({
  semanticMap,
  phaseLocked,
  onTransmitSequence,
  referencePhase
}: MessageComposerProps) {
  const [textInput, setTextInput] = useState('');
  const [primeSequence, setPrimeSequence] = useState<PrimeToken[]>([]);
  const [manualPrime, setManualPrime] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  
  // Analyze text and add to sequence
  const handleAnalyze = useCallback(() => {
    if (!textInput.trim()) return;
    const tokens = analyzeText(textInput, semanticMap);
    setPrimeSequence(prev => [...prev, ...tokens]);
    setTextInput('');
  }, [textInput, semanticMap]);
  
  // Add manual prime
  const handleAddManualPrime = useCallback(() => {
    const prime = parseInt(manualPrime);
    if (isNaN(prime) || prime < 2) return;
    
    const mapping = semanticMap.find(m => m.prime === prime);
    setPrimeSequence(prev => [...prev, {
      id: `manual-${prime}-${Date.now()}`,
      prime,
      meaning: mapping?.meaning || `Prime(${prime})`
    }]);
    setManualPrime('');
  }, [manualPrime, semanticMap]);
  
  // Add from semantic map
  const handleAddFromMap = useCallback((mapping: SemanticMapping) => {
    setPrimeSequence(prev => [...prev, {
      id: `map-${mapping.prime}-${Date.now()}`,
      prime: mapping.prime,
      meaning: mapping.meaning
    }]);
  }, []);
  
  // Remove token
  const handleRemoveToken = useCallback((id: string) => {
    setPrimeSequence(prev => prev.filter(t => t.id !== id));
  }, []);
  
  // Shuffle sequence
  const handleShuffle = useCallback(() => {
    setPrimeSequence(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        // Use deterministic shuffle based on phase
        const j = Math.floor((Math.sin(referencePhase * (i + 1)) * 0.5 + 0.5) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, [referencePhase]);
  
  // Clear all
  const handleClear = useCallback(() => {
    setPrimeSequence([]);
  }, []);
  
  // Transmit sequence
  const handleTransmit = useCallback(async () => {
    if (primeSequence.length === 0) return;
    
    setIsTransmitting(true);
    const primes = primeSequence.map(t => t.prime);
    
    // Animate transmission
    await new Promise(resolve => setTimeout(resolve, 500));
    onTransmitSequence(primes);
    
    setIsTransmitting(false);
    setPrimeSequence([]);
  }, [primeSequence, onTransmitSequence]);
  
  // Computed product
  const primeProduct = useMemo(() => {
    if (primeSequence.length === 0) return 1;
    return primeSequence.reduce((acc, t) => acc * t.prime, 1);
  }, [primeSequence]);
  
  // Phase-adjusted encoding
  const phaseEncoding = useMemo(() => {
    return (referencePhase / (2 * Math.PI) * primeProduct) % 1000;
  }, [referencePhase, primeProduct]);
  
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4 text-primary" />
          Multi-Prime Message Composer
          {phaseLocked && (
            <Badge variant="outline" className="ml-auto text-xs text-green-400 border-green-400/50">
              Phase Locked
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Semantic Text Input</Label>
          <div className="flex gap-2">
            <Input
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Enter message to encode..."
              className="flex-1 bg-background/50 border-border/50 text-sm"
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
            <Button 
              size="sm" 
              onClick={handleAnalyze}
              disabled={!textInput.trim()}
              variant="outline"
              className="border-primary/50"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Encode
            </Button>
          </div>
        </div>
        
        {/* Manual Prime Input */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Manual Prime Entry</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={manualPrime}
              onChange={e => setManualPrime(e.target.value)}
              placeholder="Enter prime number..."
              className="flex-1 bg-background/50 border-border/50 text-sm"
              onKeyDown={e => e.key === 'Enter' && handleAddManualPrime()}
            />
            <Button 
              size="sm" 
              onClick={handleAddManualPrime}
              disabled={!manualPrime}
              variant="outline"
              className="border-secondary/50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
        
        {/* Quick Add from Semantic Map */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick Add from Semantic Map</Label>
          <ScrollArea className="h-24">
            <div className="flex flex-wrap gap-1">
              {semanticMap.slice(0, 20).map(mapping => (
                <Button
                  key={mapping.prime}
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2 hover:bg-primary/20"
                  onClick={() => handleAddFromMap(mapping)}
                >
                  <Hash className="h-3 w-3 mr-1 text-primary" />
                  {mapping.prime}
                  <span className="ml-1 text-muted-foreground truncate max-w-16">
                    {mapping.meaning}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Prime Sequence Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Composed Sequence ({primeSequence.length} primes)
            </Label>
            {primeSequence.length > 0 && (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleShuffle}>
                  <Shuffle className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleClear}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="min-h-20 p-3 rounded-lg bg-black/30 border border-border/30">
            {primeSequence.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                No primes in sequence. Add primes using the inputs above.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {primeSequence.map((token, index) => (
                    <motion.div
                      key={token.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                      className="group relative"
                    >
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/20 border border-primary/30">
                        <span className="text-xs font-mono text-primary font-semibold">
                          {token.prime}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {token.meaning}
                        </span>
                        <button
                          onClick={() => handleRemoveToken(token.id)}
                          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                      {index < primeSequence.length - 1 && (
                        <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        
        {/* Encoding Stats */}
        {primeSequence.length > 0 && (
          <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-black/20 border border-border/30">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Product</div>
              <div className="text-sm font-mono text-primary">
                {primeProduct > 1e6 ? primeProduct.toExponential(2) : primeProduct}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Phase Encoding</div>
              <div className="text-sm font-mono text-secondary">
                {phaseEncoding.toFixed(4)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Bits</div>
              <div className="text-sm font-mono text-accent">
                {Math.ceil(Math.log2(primeProduct + 1))}
              </div>
            </div>
          </div>
        )}
        
        {/* Transmit Button */}
        <Button
          className="w-full"
          disabled={primeSequence.length === 0 || isTransmitting}
          onClick={handleTransmit}
        >
          <AnimatePresence mode="wait">
            {isTransmitting ? (
              <motion.div
                key="transmitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Send className="h-4 w-4" />
                </motion.div>
                Transmitting...
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Transmit Sequence ({primeSequence.length} primes)
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {/* Visual Prime Flow */}
        {primeSequence.length > 0 && (
          <div className="relative h-8 rounded-lg bg-black/30 overflow-hidden">
            <motion.div
              className="absolute inset-0 flex items-center"
              animate={{ x: [0, -100] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
            >
              {[...primeSequence, ...primeSequence].map((token, i) => (
                <div
                  key={`flow-${i}`}
                  className="flex-shrink-0 px-4 font-mono text-xs"
                  style={{
                    color: `hsl(${(token.prime * 37) % 360}, 70%, 60%)`
                  }}
                >
                  {token.prime}
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
