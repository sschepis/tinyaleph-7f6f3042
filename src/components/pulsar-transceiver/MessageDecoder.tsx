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
  Download,
  Binary,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
  Zap,
  FileText,
  Layers,
  RefreshCw
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
  injectErrors
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

// Prime to 7-bit value
function primeToValue(prime: number): number {
  const index = PRIMES.indexOf(prime);
  return index >= 0 ? index : 0;
}

// Primes to bits
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

// Bits to ASCII
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
      // Null terminator
      break;
    } else {
      text += '?';
    }
  }
  return text;
}

// Calculate parity
function calculateParity(bits: number[]): number {
  return bits.reduce((acc, bit) => acc ^ bit, 0);
}

// Calculate checksum
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

// Calculate CRC-8
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

// Extract byte from bits
function bitsToNumber(bits: number[], start: number, length: number): number {
  let value = 0;
  for (let i = 0; i < length && start + i < bits.length; i++) {
    value = (value << 1) | bits[start + i];
  }
  return value;
}

// ========== HAMMING CODE ERROR CORRECTION ==========

// Hamming(7,4) - encodes 4 data bits into 7 bits with 3 parity bits
// Bit positions: p1, p2, d1, p3, d2, d3, d4 (1-indexed)

// Hamming syndrome calculation for (7,4) code
function calculateHammingSyndrome(block: number[]): number {
  if (block.length !== 7) return -1;
  
  // Syndrome bits
  const s1 = block[0] ^ block[2] ^ block[4] ^ block[6]; // positions 1,3,5,7
  const s2 = block[1] ^ block[2] ^ block[5] ^ block[6]; // positions 2,3,6,7
  const s3 = block[3] ^ block[4] ^ block[5] ^ block[6]; // positions 4,5,6,7
  
  return s1 + (s2 << 1) + (s3 << 2);
}

// Apply Hamming(7,4) encoding to data
function encodeHamming74(dataBits: number[]): number[] {
  const encoded: number[] = [];
  
  for (let i = 0; i + 3 < dataBits.length; i += 4) {
    const d1 = dataBits[i];
    const d2 = dataBits[i + 1];
    const d3 = dataBits[i + 2];
    const d4 = dataBits[i + 3];
    
    const p1 = d1 ^ d2 ^ d4;
    const p2 = d1 ^ d3 ^ d4;
    const p3 = d2 ^ d3 ^ d4;
    
    encoded.push(p1, p2, d1, p3, d2, d3, d4);
  }
  
  return encoded;
}

// Decode Hamming(7,4) with error correction
function decodeHamming74(encodedBits: number[]): { bits: number[]; corrected: boolean; errorPosition: number | null; correctedBits: number[] } {
  const decoded: number[] = [];
  let corrected = false;
  let errorPosition: number | null = null;
  const correctedBits = [...encodedBits];
  
  for (let i = 0; i + 6 < encodedBits.length; i += 7) {
    const block = encodedBits.slice(i, i + 7);
    const syndrome = calculateHammingSyndrome(block);
    
    if (syndrome !== 0) {
      // Error detected at position (syndrome - 1)
      const errPos = syndrome - 1;
      if (errPos >= 0 && errPos < 7) {
        correctedBits[i + errPos] = correctedBits[i + errPos] ^ 1; // Flip the bit
        block[errPos] = block[errPos] ^ 1;
        corrected = true;
        errorPosition = i + errPos;
      }
    }
    
    // Extract data bits (positions 3, 5, 6, 7 in 1-indexed = indices 2, 4, 5, 6)
    decoded.push(block[2], block[4], block[5], block[6]);
  }
  
  return { bits: decoded, corrected, errorPosition, correctedBits };
}

// Inject random single-bit error for demonstration
function injectError(bits: number[], position: number): number[] {
  const corrupted = [...bits];
  if (position >= 0 && position < bits.length) {
    corrupted[position] = corrupted[position] ^ 1;
  }
  return corrupted;
}

export default function MessageDecoder({
  semanticMap,
  transmissions
}: MessageDecoderProps) {
  const [primeInput, setPrimeInput] = useState('');
  const [decodingResult, setDecodingResult] = useState<DecodingResult | null>(null);
  const [selectedEccMode, setSelectedEccMode] = useState<ECCMode>('none');
  const [eccDemo, setEccDemo] = useState<{
    mode: ECCMode;
    original: number[];
    encoded: number[];
    corrupted: number[];
    recovered: number[];
    errorPositions: number[];
    errorCount: number;
    corrected: boolean;
    uncorrectable: boolean;
  } | null>(null);
  const [demoInput, setDemoInput] = useState('');
  const [errorCount, setErrorCount] = useState(1);
  const [burstLength, setBurstLength] = useState(1);
  
  // Get recent binary transmissions
  const recentBinaryTransmissions = useMemo(() => {
    return transmissions
      .filter(t => t.meaning.includes('Binary') || t.meaning.includes('Sequence'))
      .slice(-5);
  }, [transmissions]);
  
  // Decode prime sequence with ECC
  const handleDecode = useCallback(() => {
    const primes = primeInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);
    
    if (primes.length === 0) return;
    
    const bits = primesToBits(primes);
    
    // Estimate if error detection is present (last 17 bits)
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
    
    // Apply ECC decoding
    const eccResult = decodeECC(eccBits, selectedEccMode);
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
        uncorrectable: eccResult.uncorrectable
      },
      parity: { received: receivedParity, calculated: calculatedParity, valid: parityValid },
      checksum: { received: receivedChecksum, calculated: calculatedChecksum, valid: checksumValid },
      crc: { received: receivedCRC, calculated: calculatedCRC, valid: crcValid },
      overallValid: parityValid && checksumValid && crcValid && !eccResult.uncorrectable
    });
  }, [primeInput, selectedEccMode]);
  
  // ECC demonstration
  const runEccDemo = useCallback(() => {
    const input = demoInput.trim() || 'Test';
    const bits: number[] = [];
    
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i);
      for (let b = 7; b >= 0; b--) {
        bits.push((charCode >> b) & 1);
      }
    }
    
    // Pad to multiple of 4 for Hamming
    while (bits.length % 4 !== 0) {
      bits.push(0);
    }
    
    let encoded: number[];
    let mode: ECCMode = selectedEccMode;
    
    if (mode === 'hamming84') {
      encoded = encodeHamming84(bits);
    } else if (mode === 'reed-solomon') {
      // Convert to bytes for RS
      const bytes = bitsToBytes(bits);
      const nsym = Math.min(8, Math.max(4, Math.ceil(bytes.length * 0.25)));
      const rsEncoded = encodeReedSolomon(bytes, nsym);
      encoded = bytesToBits(rsEncoded);
    } else {
      encoded = [...bits];
    }
    
    // Inject errors
    const { corrupted, errorPositions } = injectErrors(encoded, errorCount, burstLength);
    
    // Recover
    let recovered: number[];
    let corrected = false;
    let uncorrectable = false;
    
    if (mode === 'hamming84') {
      const result = decodeHamming84(corrupted);
      recovered = result.bits;
      corrected = result.corrected;
      uncorrectable = result.uncorrectable;
    } else if (mode === 'reed-solomon') {
      const bytes = bitsToBytes(corrupted);
      const nsym = Math.min(8, Math.max(4, Math.ceil((bytes.length * 0.8) * 0.25)));
      const result = decodeReedSolomon(bytes, nsym);
      recovered = bytesToBits(result.data);
      corrected = result.corrected;
      uncorrectable = result.uncorrectable;
    } else {
      recovered = [...corrupted];
    }
    
    setEccDemo({
      mode,
      original: bits,
      encoded,
      corrupted,
      recovered,
      errorPositions,
      errorCount: errorPositions.length,
      corrected,
      uncorrectable
    });
  }, [demoInput, selectedEccMode, errorCount, burstLength]);
  
  // Load transmission into decoder
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
            Error Correction
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="decode">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="decode" className="text-xs gap-1">
              <FileText className="h-3 w-3" />
              Decode
            </TabsTrigger>
            <TabsTrigger value="hamming" className="text-xs gap-1">
              <Wrench className="h-3 w-3" />
              Hamming Demo
            </TabsTrigger>
          </TabsList>
          
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
                  
                  {/* Bit Stream */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Data Bits ({decodingResult.dataBits.length})
                    </Label>
                    <div className="p-2 rounded-lg bg-black/20 border border-border/30 overflow-hidden">
                      <div className="flex flex-wrap gap-0.5 font-mono text-xs">
                        {decodingResult.dataBits.slice(0, 64).map((bit, i) => (
                          <span
                            key={i}
                            className={`w-4 h-5 flex items-center justify-center rounded ${
                              bit === 1 
                                ? 'bg-primary/30 text-primary' 
                                : 'bg-muted/20 text-muted-foreground'
                            } ${i % 8 === 7 ? 'mr-2' : ''}`}
                          >
                            {bit}
                          </span>
                        ))}
                        {decodingResult.dataBits.length > 64 && (
                          <span className="text-muted-foreground">+{decodingResult.dataBits.length - 64} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
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
                          {!decodingResult.checksum.valid && (
                            <div className="text-xs text-muted-foreground">
                              (expected 0x{decodingResult.checksum.calculated.toString(16).padStart(2, '0').toUpperCase()})
                            </div>
                          )}
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
                          {!decodingResult.crc.valid && (
                            <div className="text-xs text-muted-foreground">
                              (expected 0x{decodingResult.crc.calculated.toString(16).padStart(2, '0').toUpperCase()})
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          
          {/* ECC Demo Tab */}
          <TabsContent value="hamming" className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="text-xs font-semibold text-primary mb-2">Error Correction Demo</h4>
              <p className="text-xs text-muted-foreground">
                Test Hamming(8,4) for single-bit errors or Reed-Solomon for burst errors.
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
              <div className="flex gap-1">
                <Input
                  type="number"
                  value={errorCount}
                  onChange={e => setErrorCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-8 text-xs"
                  min={1}
                  max={10}
                />
                <span className="text-xs text-muted-foreground self-center">errors</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={demoInput}
                onChange={e => setDemoInput(e.target.value)}
                placeholder="Test"
                className="flex-1 bg-background/50 text-sm font-mono"
                maxLength={8}
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
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded bg-black/20 text-center">
                      <div className="text-xs text-muted-foreground">Errors Injected</div>
                      <div className="font-mono text-red-400">{eccDemo.errorCount}</div>
                    </div>
                    <div className={`p-2 rounded text-center ${eccDemo.uncorrectable ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className={`font-mono ${eccDemo.uncorrectable ? 'text-red-400' : 'text-green-400'}`}>
                        {eccDemo.uncorrectable ? 'Uncorrectable' : eccDemo.corrected ? 'Corrected!' : 'No Errors'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {eccDemo.mode === 'hamming84' && 'Hamming(8,4): Corrects 1-bit errors, detects 2-bit errors'}
                    {eccDemo.mode === 'reed-solomon' && 'Reed-Solomon: Corrects burst errors across multiple bytes'}
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
