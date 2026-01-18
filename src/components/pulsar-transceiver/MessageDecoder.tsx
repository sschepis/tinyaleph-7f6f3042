import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Download,
  Binary,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  Wrench,
  FileText,
  RefreshCw,
  Layers,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SemanticMapping, SRCTransmission } from '@/lib/pulsar-transceiver/types';
import { 
  ECCMode, 
  decodeECC, 
  encodeHamming84, 
  decodeHamming84,
  encodeReedSolomon,
  decodeReedSolomon,
  bitsToBytes,
  bytesToBits,
  injectErrors,
  interleave,
  deinterleave,
  calculateInterleavingConfig,
  InterleavingConfig
} from '@/lib/pulsar-transceiver/error-correction';

interface MessageDecoderProps {
  semanticMap: SemanticMapping[];
  transmissions: SRCTransmission[];
}

interface DecodingResult {
  originalPrimes: number[];
  bits: number[];
  dataBits: number[];
  text: string;
  hasErrorDetection: boolean;
  eccMode: ECCMode;
  eccResult: {
    corrected: boolean;
    errorCount: number;
    errorPositions: number[];
    correctedPositions: number[];
    uncorrectable: boolean;
  };
  parity: { received: number; calculated: number; valid: boolean };
  checksum: { received: number; calculated: number; valid: boolean };
  crc: { received: number; calculated: number; valid: boolean };
  overallValid: boolean;
}

// Prime list (must match encoder)
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 
  239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
  331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
  421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
  509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607,
  613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701];

function primeToValue(prime: number): number {
  const index = PRIMES.indexOf(prime);
  return index >= 0 ? index : 0;
}

function primesToBits(primes: number[]): number[] {
  const bits: number[] = [];
  for (const prime of primes) {
    const value = primeToValue(prime);
    for (let b = 6; b >= 0; b--) {
      bits.push((value >> b) & 1);
    }
  }
  return bits;
}

function bitsToAscii(bits: number[]): string {
  let text = '';
  for (let i = 0; i + 7 <= bits.length; i += 8) {
    let charCode = 0;
    for (let b = 0; b < 8; b++) {
      charCode = (charCode << 1) | bits[i + b];
    }
    if (charCode >= 32 && charCode <= 126) {
      text += String.fromCharCode(charCode);
    } else if (charCode === 0) {
      break;
    } else {
      text += '?';
    }
  }
  return text;
}

function calculateParity(bits: number[]): number {
  return bits.reduce((acc, bit) => acc ^ bit, 0);
}

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

function bitsToNumber(bits: number[], start: number, length: number): number {
  let value = 0;
  for (let i = 0; i < length && start + i < bits.length; i++) {
    value = (value << 1) | bits[start + i];
  }
  return value;
}

// Bit Stream Visualization Component
interface BitStreamVizProps {
  originalBits: number[];
  correctedBits: number[];
  errorPositions: number[];
  correctedPositions: number[];
  label: string;
  maxBits?: number;
}

function BitStreamVisualization({ 
  originalBits, 
  correctedBits, 
  errorPositions, 
  correctedPositions, 
  label,
  maxBits = 128
}: BitStreamVizProps) {
  const displayBits = correctedBits.slice(0, maxBits);
  const errorSet = new Set(errorPositions);
  const correctedSet = new Set(correctedPositions);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500/50 border border-red-500"></span>
            Error
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500/50 border border-green-500"></span>
            Corrected
          </span>
        </div>
      </div>
      <div className="p-2 rounded-lg bg-black/30 border border-border/30 overflow-hidden">
        <div className="flex flex-wrap gap-0.5 font-mono text-[10px]">
          {displayBits.map((bit, i) => {
            const isError = errorSet.has(i);
            const isCorrected = correctedSet.has(i);
            
            let bgClass = bit === 1 ? 'bg-primary/30' : 'bg-muted/20';
            let textClass = bit === 1 ? 'text-primary' : 'text-muted-foreground';
            let borderClass = 'border-transparent';
            
            if (isCorrected) {
              bgClass = 'bg-green-500/30';
              textClass = 'text-green-400';
              borderClass = 'border-green-500';
            } else if (isError) {
              bgClass = 'bg-red-500/30';
              textClass = 'text-red-400';
              borderClass = 'border-red-500';
            }
            
            return (
              <motion.span
                key={i}
                initial={isCorrected ? { scale: 1.5 } : {}}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 flex items-center justify-center rounded border ${bgClass} ${textClass} ${borderClass} ${i % 8 === 7 ? 'mr-1.5' : ''}`}
                title={`Bit ${i}${isError ? ' (error)' : ''}${isCorrected ? ' (corrected)' : ''}`}
              >
                {bit}
              </motion.span>
            );
          })}
          {correctedBits.length > maxBits && (
            <span className="text-muted-foreground ml-1">+{correctedBits.length - maxBits} more</span>
          )}
        </div>
      </div>
      {correctedPositions.length > 0 && (
        <div className="text-xs text-green-400">
          ✓ Corrected {correctedPositions.length} bit(s) at position(s): {correctedPositions.slice(0, 8).join(', ')}{correctedPositions.length > 8 ? '...' : ''}
        </div>
      )}
    </div>
  );
}

export default function MessageDecoder({
  semanticMap,
  transmissions
}: MessageDecoderProps) {
  const [primeInput, setPrimeInput] = useState('');
  const [decodingResult, setDecodingResult] = useState<DecodingResult | null>(null);
  const [selectedEccMode, setSelectedEccMode] = useState<ECCMode>('hamming84');
  const [useInterleaving, setUseInterleaving] = useState(false);
  const [eccDemo, setEccDemo] = useState<{
    mode: ECCMode;
    useInterleaving: boolean;
    original: number[];
    encoded: number[];
    corrupted: number[];
    recovered: number[];
    correctedBits: number[];
    errorPositions: number[];
    correctedPositions: number[];
    errorCount: number;
    corrected: boolean;
    uncorrectable: boolean;
    originalText: string;
    recoveredText: string;
  } | null>(null);
  const [demoInput, setDemoInput] = useState('Hello');
  const [errorCount, setErrorCount] = useState(1);
  const [burstLength, setBurstLength] = useState(1);
  
  const recentBinaryTransmissions = useMemo(() => {
    return transmissions
      .filter(t => t.meaning.includes('Binary') || t.meaning.includes('Sequence'))
      .slice(-5);
  }, [transmissions]);
  
  const handleDecode = useCallback(() => {
    const primes = primeInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);
    
    if (primes.length === 0) return;
    
    const bits = primesToBits(primes);
    const hasErrorDetection = bits.length >= 25;
    
    let eccBits: number[];
    let receivedParity = 0;
    let receivedChecksum = 0;
    let receivedCRC = 0;
    
    if (hasErrorDetection) {
      const dataEndIndex = bits.length - 17;
      eccBits = bits.slice(0, dataEndIndex);
      receivedParity = bits[dataEndIndex];
      receivedChecksum = bitsToNumber(bits, dataEndIndex + 1, 8);
      receivedCRC = bitsToNumber(bits, dataEndIndex + 9, 8);
    } else {
      eccBits = bits;
    }
    
    const interleavingConfig = useInterleaving ? calculateInterleavingConfig(eccBits.length, selectedEccMode) : undefined;
    const eccResult = decodeECC(eccBits, selectedEccMode, undefined, interleavingConfig);
    const dataBits = eccResult.dataBits;
    
    const calculatedParity = calculateParity(eccBits);
    const calculatedChecksum = calculateChecksum(dataBits);
    const calculatedCRC = calculateCRC8(dataBits);
    
    const parityValid = !hasErrorDetection || receivedParity === calculatedParity;
    const checksumValid = !hasErrorDetection || receivedChecksum === calculatedChecksum;
    const crcValid = !hasErrorDetection || receivedCRC === calculatedCRC;
    
    const text = bitsToAscii(dataBits);
    
    setDecodingResult({
      originalPrimes: primes,
      bits,
      dataBits,
      text,
      hasErrorDetection,
      eccMode: selectedEccMode,
      eccResult: {
        corrected: eccResult.corrected,
        errorCount: eccResult.errorCount,
        errorPositions: eccResult.errorPositions,
        correctedPositions: eccResult.correctedPositions,
        uncorrectable: eccResult.uncorrectable
      },
      parity: { received: receivedParity, calculated: calculatedParity, valid: parityValid },
      checksum: { received: receivedChecksum, calculated: calculatedChecksum, valid: checksumValid },
      crc: { received: receivedCRC, calculated: calculatedCRC, valid: crcValid },
      overallValid: parityValid && checksumValid && crcValid && !eccResult.uncorrectable
    });
  }, [primeInput, selectedEccMode, useInterleaving]);
  
  const runEccDemo = useCallback(() => {
    const input = demoInput.trim() || 'Test';
    const bits: number[] = [];
    
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i);
      for (let b = 7; b >= 0; b--) {
        bits.push((charCode >> b) & 1);
      }
    }
    
    while (bits.length % 4 !== 0) {
      bits.push(0);
    }
    
    let encoded: number[];
    let mode: ECCMode = selectedEccMode;
    let interleavingConfig: InterleavingConfig | undefined;
    
    if (mode === 'hamming84') {
      encoded = encodeHamming84(bits);
    } else if (mode === 'reed-solomon') {
      const bytes = bitsToBytes(bits);
      const nsym = Math.min(8, Math.max(4, Math.ceil(bytes.length * 0.25)));
      const rsEncoded = encodeReedSolomon(bytes, nsym);
      encoded = bytesToBits(rsEncoded);
    } else {
      encoded = [...bits];
    }
    
    // Apply interleaving if enabled
    if (useInterleaving && mode !== 'none') {
      interleavingConfig = calculateInterleavingConfig(bits.length, mode);
      const { interleaved } = interleave(encoded, interleavingConfig);
      encoded = interleaved;
    }
    
    // Inject errors
    const { corrupted, errorPositions } = injectErrors(encoded, errorCount, burstLength);
    
    // Recover using the decodeECC which handles deinterleaving
    const result = decodeECC(corrupted, mode, bits.length, interleavingConfig);
    
    // Recover text
    const recoveredText = bitsToAscii(result.dataBits);
    
    setEccDemo({
      mode,
      useInterleaving,
      original: bits,
      encoded,
      corrupted,
      recovered: result.dataBits,
      correctedBits: result.correctedBits,
      errorPositions,
      correctedPositions: result.correctedPositions,
      errorCount: errorPositions.length,
      corrected: result.corrected,
      uncorrectable: result.uncorrectable,
      originalText: input,
      recoveredText
    });
  }, [demoInput, selectedEccMode, errorCount, burstLength, useInterleaving]);
  
  const loadTransmission = useCallback((t: SRCTransmission) => {
    setPrimeInput(t.prime.toString());
  }, []);
  
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Download className="h-4 w-4 text-primary" />
          Message Decoder
          <Badge variant="outline" className="ml-auto text-xs">
            ECC + Interleaving
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="demo">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="demo" className="text-xs gap-1">
              <Wrench className="h-3 w-3" />
              ECC Demo
            </TabsTrigger>
            <TabsTrigger value="decode" className="text-xs gap-1">
              <FileText className="h-3 w-3" />
              Decode
            </TabsTrigger>
          </TabsList>
          
          {/* ECC Demo Tab */}
          <TabsContent value="demo" className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Error Correction Demo
              </h4>
              <p className="text-xs text-muted-foreground">
                Test ECC with visual bit-stream showing corrected bits. Enable interleaving for burst error resistance.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedEccMode} onValueChange={(v) => setSelectedEccMode(v as ECCMode)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="ECC Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hamming84">Hamming(8,4)</SelectItem>
                  <SelectItem value="reed-solomon">Reed-Solomon</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="interleaving"
                  checked={useInterleaving}
                  onCheckedChange={setUseInterleaving}
                />
                <Label htmlFor="interleaving" className="text-xs flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Interleave
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Errors: {errorCount}</Label>
                <Slider
                  value={[errorCount]}
                  onValueChange={([v]) => setErrorCount(v)}
                  min={1}
                  max={selectedEccMode === 'reed-solomon' ? 10 : 5}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Burst Length: {burstLength}</Label>
                <Slider
                  value={[burstLength]}
                  onValueChange={([v]) => setBurstLength(v)}
                  min={1}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={demoInput}
                onChange={e => setDemoInput(e.target.value)}
                placeholder="Hello"
                className="flex-1 bg-background/50 text-sm font-mono"
                maxLength={16}
              />
              <Button size="sm" onClick={runEccDemo} disabled={selectedEccMode === 'none'}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Test
              </Button>
            </div>
            
            <AnimatePresence mode="wait">
              {eccDemo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Status Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded bg-black/30 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase">Injected</div>
                      <div className="font-mono text-red-400 text-lg">{eccDemo.errorCount}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {burstLength > 1 ? `${burstLength}-bit bursts` : 'random bits'}
                      </div>
                    </div>
                    <div className={`p-2 rounded text-center ${eccDemo.uncorrectable ? 'bg-red-500/20' : eccDemo.corrected ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                      <div className="text-[10px] text-muted-foreground uppercase">Status</div>
                      <div className={`font-mono text-lg ${eccDemo.uncorrectable ? 'text-red-400' : eccDemo.corrected ? 'text-green-400' : 'text-blue-400'}`}>
                        {eccDemo.uncorrectable ? '✗' : eccDemo.corrected ? '✓' : '○'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {eccDemo.uncorrectable ? 'Failed' : eccDemo.corrected ? 'Corrected' : 'Clean'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-black/30 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase">Mode</div>
                      <div className="font-mono text-primary text-sm">
                        {eccDemo.mode === 'hamming84' ? 'H(8,4)' : 'RS'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {eccDemo.useInterleaving ? '+Interleave' : 'Direct'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Text Comparison */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-black/20 border border-border/30">
                      <div className="text-[10px] text-muted-foreground uppercase mb-1">Original</div>
                      <div className="font-mono text-primary">{eccDemo.originalText}</div>
                    </div>
                    <div className={`p-2 rounded border ${eccDemo.originalText === eccDemo.recoveredText ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="text-[10px] text-muted-foreground uppercase mb-1">Recovered</div>
                      <div className={`font-mono ${eccDemo.originalText === eccDemo.recoveredText ? 'text-green-400' : 'text-red-400'}`}>
                        {eccDemo.recoveredText || '(empty)'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bit Stream Visualization */}
                  <BitStreamVisualization
                    originalBits={eccDemo.encoded}
                    correctedBits={eccDemo.correctedBits}
                    errorPositions={eccDemo.errorPositions}
                    correctedPositions={eccDemo.correctedPositions}
                    label={`Encoded Stream (${eccDemo.encoded.length} bits)${eccDemo.useInterleaving ? ' - Interleaved' : ''}`}
                  />
                  
                  {/* Info */}
                  <div className="text-xs text-muted-foreground p-2 rounded bg-black/20 border border-border/30">
                    {eccDemo.mode === 'hamming84' && (
                      <div>
                        <strong>Hamming(8,4)</strong>: Corrects any 1-bit error, detects 2-bit errors per 8-bit block.
                        {eccDemo.useInterleaving && ' Interleaving spreads burst errors across blocks.'}
                      </div>
                    )}
                    {eccDemo.mode === 'reed-solomon' && (
                      <div>
                        <strong>Reed-Solomon</strong>: Corrects multiple byte errors using Galois Field arithmetic.
                        {eccDemo.useInterleaving && ' Interleaving distributes burst errors for better recovery.'}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          
          {/* Decode Tab */}
          <TabsContent value="decode" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Prime Sequence</Label>
              <div className="flex gap-2">
                <Input
                  value={primeInput}
                  onChange={e => setPrimeInput(e.target.value)}
                  placeholder="Enter primes (e.g., 2, 3, 5, 7, 11...)"
                  className="flex-1 bg-background/50 border-border/50 text-sm font-mono"
                />
                <Button 
                  size="sm" 
                  onClick={handleDecode}
                  disabled={!primeInput.trim()}
                >
                  <Binary className="h-4 w-4 mr-1" />
                  Decode
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedEccMode} onValueChange={(v) => setSelectedEccMode(v as ECCMode)}>
                <SelectTrigger className="h-8 text-xs w-36">
                  <SelectValue placeholder="ECC Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No ECC</SelectItem>
                  <SelectItem value="hamming84">Hamming(8,4)</SelectItem>
                  <SelectItem value="reed-solomon">Reed-Solomon</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="decode-interleaving"
                  checked={useInterleaving}
                  onCheckedChange={setUseInterleaving}
                />
                <Label htmlFor="decode-interleaving" className="text-xs">Deinterleave</Label>
              </div>
            </div>
            
            {recentBinaryTransmissions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Recent Transmissions</Label>
                <ScrollArea className="h-16">
                  <div className="flex flex-wrap gap-1">
                    {recentBinaryTransmissions.map(t => (
                      <Button
                        key={t.id}
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs px-2"
                        onClick={() => loadTransmission(t)}
                      >
                        {t.prime}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            <AnimatePresence mode="wait">
              {decodingResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {/* Decoded Text */}
                  <div className="p-3 rounded-lg bg-black/30 border border-border/30">
                    <Label className="text-xs text-muted-foreground mb-2 block">Decoded Text</Label>
                    <div className="font-mono text-lg text-primary break-all">
                      {decodingResult.text || <span className="text-muted-foreground italic">No readable text</span>}
                    </div>
                  </div>
                  
                  {/* ECC Result */}
                  {decodingResult.eccMode !== 'none' && decodingResult.eccResult.corrected && (
                    <BitStreamVisualization
                      originalBits={decodingResult.bits}
                      correctedBits={decodingResult.dataBits}
                      errorPositions={decodingResult.eccResult.errorPositions}
                      correctedPositions={decodingResult.eccResult.correctedPositions}
                      label="Decoded Stream (with corrections)"
                      maxBits={64}
                    />
                  )}
                  
                  {/* Error Detection Status */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {decodingResult.hasErrorDetection ? (
                        decodingResult.overallValid ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Integrity Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <ShieldX className="h-3 w-3 mr-1" />
                            Errors Detected
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <ShieldAlert className="h-3 w-3 mr-1" />
                          No Error Detection
                        </Badge>
                      )}
                      
                      {decodingResult.eccResult.corrected && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {decodingResult.eccResult.errorCount} Error(s) Corrected
                        </Badge>
                      )}
                      
                      {decodingResult.eccResult.uncorrectable && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <XCircle className="h-3 w-3 mr-1" />
                          Uncorrectable Errors
                        </Badge>
                      )}
                    </div>
                    
                    {decodingResult.hasErrorDetection && (
                      <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-black/20 border border-border/30">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Parity</div>
                          <div className="flex items-center justify-center gap-1">
                            <span className={`text-sm font-mono ${decodingResult.parity.valid ? 'text-green-400' : 'text-red-400'}`}>
                              {decodingResult.parity.received}
                            </span>
                            {decodingResult.parity.valid ? (
                              <CheckCircle2 className="h-3 w-3 text-green-400" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Checksum</div>
                          <div className="flex items-center justify-center gap-1">
                            <span className={`text-sm font-mono ${decodingResult.checksum.valid ? 'text-green-400' : 'text-red-400'}`}>
                              0x{decodingResult.checksum.received.toString(16).padStart(2, '0').toUpperCase()}
                            </span>
                            {decodingResult.checksum.valid ? (
                              <CheckCircle2 className="h-3 w-3 text-green-400" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">CRC-8</div>
                          <div className="flex items-center justify-center gap-1">
                            <span className={`text-sm font-mono ${decodingResult.crc.valid ? 'text-green-400' : 'text-red-400'}`}>
                              0x{decodingResult.crc.received.toString(16).padStart(2, '0').toUpperCase()}
                            </span>
                            {decodingResult.crc.valid ? (
                              <CheckCircle2 className="h-3 w-3 text-green-400" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
