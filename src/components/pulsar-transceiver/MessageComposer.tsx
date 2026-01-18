import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Plus, 
  X, 
  ArrowRight, 
  Sparkles, 
  Hash,
  MessageSquare,
  Shuffle,
  Trash2,
  Binary,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SemanticMapping } from '@/lib/pulsar-transceiver/types';
import { ECCMode, applyECC } from '@/lib/pulsar-transceiver/error-correction';

interface MessageComposerProps {
  semanticMap: SemanticMapping[];
  phaseLocked: boolean;
  onTransmitSequence: (primes: number[], eccMode?: ECCMode, originalLength?: number) => void;
  referencePhase: number;
}

interface PrimeToken {
  id: string;
  prime: number;
  meaning: string;
}

type EncodingMode = 'semantic' | 'binary';

// ASCII to bit array conversion
function asciiToBits(text: string): number[] {
  const bits: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    for (let b = 7; b >= 0; b--) {
      bits.push((charCode >> b) & 1);
    }
  }
  return bits;
}

// Calculate parity bit (even parity)
function calculateParity(bits: number[]): number {
  return bits.reduce((acc, bit) => acc ^ bit, 0);
}

// Calculate simple checksum (sum of bytes mod 256)
function calculateChecksum(bits: number[]): number {
  let sum = 0;
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8 && i + b < bits.length; b++) {
      byte = (byte << 1) | bits[i + b];
    }
    sum = (sum + byte) & 0xFF;
  }
  return sum;
}

// Calculate CRC-8 (simple polynomial)
function calculateCRC8(bits: number[]): number {
  let crc = 0xFF;
  const poly = 0x31;
  
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8 && i + b < bits.length; b++) {
      byte = (byte << 1) | bits[i + b];
    }
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x80) {
        crc = ((crc << 1) ^ poly) & 0xFF;
      } else {
        crc = (crc << 1) & 0xFF;
      }
    }
  }
  return crc;
}

// Pack bits into primes (7 bits per prime index)
function bitsToPrimes(bits: number[]): number[] {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 
                  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 
                  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 
                  239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
                  331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
                  421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
                  509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607,
                  613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701];
  
  const result: number[] = [];
  
  for (let i = 0; i < bits.length; i += 7) {
    let value = 0;
    for (let b = 0; b < 7 && i + b < bits.length; b++) {
      value = (value << 1) | bits[i + b];
    }
    result.push(primes[Math.min(value, primes.length - 1)]);
  }
  
  return result;
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
  const [encodingMode, setEncodingMode] = useState<EncodingMode>('semantic');
  const [textInput, setTextInput] = useState('');
  const [binaryInput, setBinaryInput] = useState('');
  const [primeSequence, setPrimeSequence] = useState<PrimeToken[]>([]);
  const [manualPrime, setManualPrime] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [includeErrorDetection, setIncludeErrorDetection] = useState(true);
  const [eccMode, setEccMode] = useState<ECCMode>('none');
  
  // Binary encoding computed values with ECC
  const binaryData = useMemo(() => {
    if (encodingMode !== 'binary' || !binaryInput.trim()) {
      return { 
        bits: [], 
        eccBits: [],
        parity: 0, 
        checksum: 0, 
        crc: 0, 
        primes: [], 
        dataBitCount: 0,
        eccInfo: { overhead: 0, description: 'No data' }
      };
    }
    
    const bits = asciiToBits(binaryInput);
    const dataBitCount = bits.length;
    const parity = calculateParity(bits);
    const checksum = calculateChecksum(bits);
    const crc = calculateCRC8(bits);
    
    // Apply ECC encoding
    const eccResult = applyECC(bits, eccMode);
    let finalBits = [...eccResult.encodedBits];
    
    // Add simple error detection on top if enabled
    if (includeErrorDetection) {
      const eccParity = calculateParity(finalBits);
      finalBits.push(eccParity);
      for (let b = 7; b >= 0; b--) {
        finalBits.push((checksum >> b) & 1);
      }
      for (let b = 7; b >= 0; b--) {
        finalBits.push((crc >> b) & 1);
      }
    }
    
    const primes = bitsToPrimes(finalBits);
    
    return { 
      bits: finalBits, 
      eccBits: eccResult.encodedBits,
      parity, 
      checksum, 
      crc, 
      primes, 
      dataBitCount,
      eccInfo: eccResult
    };
  }, [binaryInput, encodingMode, includeErrorDetection, eccMode]);
  
  const handleAnalyze = useCallback(() => {
    if (!textInput.trim()) return;
    const tokens = analyzeText(textInput, semanticMap);
    setPrimeSequence(prev => [...prev, ...tokens]);
    setTextInput('');
  }, [textInput, semanticMap]);
  
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
  
  const handleAddFromMap = useCallback((mapping: SemanticMapping) => {
    setPrimeSequence(prev => [...prev, {
      id: `map-${mapping.prime}-${Date.now()}`,
      prime: mapping.prime,
      meaning: mapping.meaning
    }]);
  }, []);
  
  const handleRemoveToken = useCallback((id: string) => {
    setPrimeSequence(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const handleShuffle = useCallback(() => {
    setPrimeSequence(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor((Math.sin(referencePhase * (i + 1)) * 0.5 + 0.5) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, [referencePhase]);
  
  const handleClear = useCallback(() => {
    setPrimeSequence([]);
    setBinaryInput('');
  }, []);
  
  const handleTransmit = useCallback(async () => {
    const primesToSend = encodingMode === 'binary' 
      ? binaryData.primes 
      : primeSequence.map(t => t.prime);
    
    if (primesToSend.length === 0) return;
    
    setIsTransmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onTransmitSequence(primesToSend, encodingMode === 'binary' ? eccMode : undefined, binaryData.dataBitCount);
    
    setIsTransmitting(false);
    if (encodingMode === 'semantic') {
      setPrimeSequence([]);
    } else {
      setBinaryInput('');
    }
  }, [encodingMode, primeSequence, binaryData.primes, onTransmitSequence]);
  
  const primeProduct = useMemo(() => {
    if (primeSequence.length === 0) return 1;
    return primeSequence.reduce((acc, t) => acc * t.prime, 1);
  }, [primeSequence]);
  
  const phaseEncoding = useMemo(() => {
    return (referencePhase / (2 * Math.PI) * primeProduct) % 1000;
  }, [referencePhase, primeProduct]);
  
  const canTransmit = encodingMode === 'binary' 
    ? binaryData.primes.length > 0 
    : primeSequence.length > 0;
  
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
        {/* Encoding Mode Toggle */}
        <Tabs value={encodingMode} onValueChange={(v) => setEncodingMode(v as EncodingMode)}>
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="semantic" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              Semantic
            </TabsTrigger>
            <TabsTrigger value="binary" className="text-xs gap-1">
              <Binary className="h-3 w-3" />
              Binary/ASCII
            </TabsTrigger>
          </TabsList>
          
          {/* Semantic Mode */}
          <TabsContent value="semantic" className="space-y-4 mt-4">
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
          </TabsContent>
          
          {/* Binary/ASCII Mode */}
          <TabsContent value="binary" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">ASCII Text Input</Label>
              <Input
                value={binaryInput}
                onChange={e => setBinaryInput(e.target.value)}
                placeholder="Enter text to encode as binary..."
                className="bg-background/50 border-border/50 text-sm font-mono"
                maxLength={64}
              />
              <div className="text-xs text-muted-foreground">
                {binaryInput.length}/64 characters • {binaryInput.length * 8} bits
              </div>
            </div>
            
            {/* ECC Mode Selector */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <Layers className="h-3 w-3" />
                Error Correction Code
              </Label>
              <Select value={eccMode} onValueChange={(v) => setEccMode(v as ECCMode)}>
                <SelectTrigger className="bg-background/50 border-border/50 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <span>None</span>
                      <span className="text-muted-foreground">- No correction</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hamming84">
                    <div className="flex items-center gap-2">
                      <span>Hamming(8,4)</span>
                      <span className="text-muted-foreground">- Corrects 1-bit errors</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="reed-solomon">
                    <div className="flex items-center gap-2">
                      <span>Reed-Solomon</span>
                      <span className="text-muted-foreground">- Corrects burst errors</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {eccMode !== 'none' && binaryData.eccInfo && (
                <div className="p-2 rounded bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="text-primary">{binaryData.eccInfo.description}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-border/30">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs">Additional Error Detection</span>
              </div>
              <Button
                size="sm"
                variant={includeErrorDetection ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => setIncludeErrorDetection(!includeErrorDetection)}
              >
                {includeErrorDetection ? (
                  <>
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Disabled
                  </>
                )}
              </Button>
            </div>
            
            {binaryData.bits.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Live Bit Stream ({binaryData.bits.length} bits → {binaryData.primes.length} primes)
                </Label>
                <div className="p-3 rounded-lg bg-black/30 border border-border/30 overflow-hidden">
                  <div className="flex flex-wrap gap-0.5 font-mono text-xs">
                    {binaryData.bits.slice(0, binaryData.dataBitCount).map((bit, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.01 }}
                        className={`w-4 h-5 flex items-center justify-center rounded ${
                          bit === 1 
                            ? 'bg-primary/30 text-primary' 
                            : 'bg-muted/20 text-muted-foreground'
                        } ${i % 8 === 7 ? 'mr-2' : ''}`}
                      >
                        {bit}
                      </motion.span>
                    ))}
                    {includeErrorDetection && binaryData.bits.length > binaryData.dataBitCount && (
                      <>
                        <span className="w-1 h-5 bg-yellow-500/50 mx-1" />
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`w-4 h-5 flex items-center justify-center rounded ${
                            binaryData.bits[binaryData.dataBitCount] === 1 
                              ? 'bg-yellow-500/30 text-yellow-400' 
                              : 'bg-yellow-500/10 text-yellow-400/50'
                          }`}
                          title="Parity bit"
                        >
                          {binaryData.bits[binaryData.dataBitCount]}
                        </motion.span>
                        <span className="w-1 h-5 bg-green-500/50 mx-1" />
                        {binaryData.bits.slice(binaryData.dataBitCount + 1, binaryData.dataBitCount + 9).map((bit, i) => (
                          <motion.span
                            key={`cs-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 + i * 0.02 }}
                            className={`w-4 h-5 flex items-center justify-center rounded ${
                              bit === 1 
                                ? 'bg-green-500/30 text-green-400' 
                                : 'bg-green-500/10 text-green-400/50'
                            }`}
                            title="Checksum"
                          >
                            {bit}
                          </motion.span>
                        ))}
                        <span className="w-1 h-5 bg-blue-500/50 mx-1" />
                        {binaryData.bits.slice(binaryData.dataBitCount + 9).map((bit, i) => (
                          <motion.span
                            key={`crc-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 + i * 0.02 }}
                            className={`w-4 h-5 flex items-center justify-center rounded ${
                              bit === 1 
                                ? 'bg-blue-500/30 text-blue-400' 
                                : 'bg-blue-500/10 text-blue-400/50'
                            }`}
                            title="CRC-8"
                          >
                            {bit}
                          </motion.span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                
                {includeErrorDetection && (
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-primary/30" />
                      <span className="text-muted-foreground">Data</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-yellow-500/30" />
                      <span className="text-muted-foreground">Parity</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-500/30" />
                      <span className="text-muted-foreground">Checksum</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-blue-500/30" />
                      <span className="text-muted-foreground">CRC-8</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {binaryData.bits.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Error Detection & Integrity</Label>
                <div className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-black/20 border border-border/30">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Parity</div>
                    <div className="flex items-center justify-center gap-1">
                      <div className={`text-sm font-mono ${binaryData.parity === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {binaryData.parity}
                      </div>
                      {binaryData.parity === 0 ? (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Checksum</div>
                    <div className="text-sm font-mono text-green-400">
                      0x{binaryData.checksum.toString(16).padStart(2, '0').toUpperCase()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">CRC-8</div>
                    <div className="text-sm font-mono text-blue-400">
                      0x{binaryData.crc.toString(16).padStart(2, '0').toUpperCase()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Integrity</div>
                    <div className="flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {binaryData.primes.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Prime Encoding ({binaryData.primes.length} primes)
                </Label>
                <ScrollArea className="h-16">
                  <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-black/20 border border-border/30">
                    {binaryData.primes.map((prime, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 text-xs font-mono rounded bg-primary/20 text-primary border border-primary/30"
                      >
                        {prime}
                      </span>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Button
          className="w-full"
          disabled={!canTransmit || isTransmitting}
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
                {encodingMode === 'binary' ? (
                  <>Transmit Binary ({binaryData.primes.length} primes)</>
                ) : (
                  <>Transmit Sequence ({primeSequence.length} primes)</>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {canTransmit && (
          <div className="relative h-8 rounded-lg bg-black/30 overflow-hidden">
            <motion.div
              className="absolute inset-0 flex items-center"
              animate={{ x: [0, -100] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
            >
              {[...(encodingMode === 'binary' ? binaryData.primes : primeSequence.map(t => t.prime)), 
                ...(encodingMode === 'binary' ? binaryData.primes : primeSequence.map(t => t.prime))].map((prime, i) => (
                <div
                  key={`flow-${i}`}
                  className="flex-shrink-0 px-4 font-mono text-xs"
                  style={{
                    color: `hsl(${(prime * 37) % 360}, 70%, 60%)`
                  }}
                >
                  {prime}
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
