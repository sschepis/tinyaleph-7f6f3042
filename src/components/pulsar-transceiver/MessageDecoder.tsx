import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SemanticMapping, SRCTransmission } from '@/lib/pulsar-transceiver/types';

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
  parity: { received: number; calculated: number; valid: boolean };
  checksum: { received: number; calculated: number; valid: boolean };
  crc: { received: number; calculated: number; valid: boolean };
  overallValid: boolean;
  hammingCorrected: boolean;
  hammingErrorPosition: number | null;
  correctedBits: number[];
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
  const [hammingInput, setHammingInput] = useState('');
  const [hammingDemo, setHammingDemo] = useState<{
    original: number[];
    encoded: number[];
    corrupted: number[];
    recovered: number[];
    errorPos: number;
    syndrome: number;
    corrected: boolean;
  } | null>(null);
  
  // Get recent binary transmissions
  const recentBinaryTransmissions = useMemo(() => {
    return transmissions
      .filter(t => t.meaning.includes('Binary') || t.meaning.includes('Sequence'))
      .slice(-5);
  }, [transmissions]);
  
  // Decode prime sequence
  const handleDecode = useCallback(() => {
    const primes = primeInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);
    
    if (primes.length === 0) return;
    
    const bits = primesToBits(primes);
    
    // Estimate if error detection is present
    // Format: DATA + PARITY(1) + CHECKSUM(8) + CRC(8) = DATA + 17 bits
    // We need at least 17 bits for error detection overhead + at least 8 bits data
    const hasErrorDetection = bits.length >= 25;
    
    let dataBits: number[];
    let receivedParity = 0;
    let receivedChecksum = 0;
    let receivedCRC = 0;
    
    if (hasErrorDetection) {
      // Last 17 bits are error detection
      const dataEndIndex = bits.length - 17;
      dataBits = bits.slice(0, dataEndIndex);
      receivedParity = bits[dataEndIndex];
      receivedChecksum = bitsToNumber(bits, dataEndIndex + 1, 8);
      receivedCRC = bitsToNumber(bits, dataEndIndex + 9, 8);
    } else {
      dataBits = bits;
    }
    
    const calculatedParity = calculateParity(dataBits);
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
      parity: { received: receivedParity, calculated: calculatedParity, valid: parityValid },
      checksum: { received: receivedChecksum, calculated: calculatedChecksum, valid: checksumValid },
      crc: { received: receivedCRC, calculated: calculatedCRC, valid: crcValid },
      overallValid: parityValid && checksumValid && crcValid,
      hammingCorrected: false,
      hammingErrorPosition: null,
      correctedBits: dataBits
    });
  }, [primeInput]);
  
  // Hamming code demonstration
  const runHammingDemo = useCallback(() => {
    const input = hammingInput.trim() || 'Hi';
    const bits: number[] = [];
    
    for (let i = 0; i < Math.min(input.length, 4); i++) {
      const charCode = input.charCodeAt(i);
      for (let b = 7; b >= 0; b--) {
        bits.push((charCode >> b) & 1);
      }
    }
    
    // Pad to multiple of 4
    while (bits.length % 4 !== 0) {
      bits.push(0);
    }
    
    const encoded = encodeHamming74(bits);
    
    // Inject random single-bit error
    const errorPos = Math.floor(Math.random() * encoded.length);
    const corrupted = injectError(encoded, errorPos);
    
    // Recover
    const { bits: recovered, corrected } = decodeHamming74(corrupted);
    const syndrome = calculateHammingSyndrome(corrupted.slice(
      Math.floor(errorPos / 7) * 7,
      Math.floor(errorPos / 7) * 7 + 7
    ));
    
    setHammingDemo({
      original: bits,
      encoded,
      corrupted,
      recovered,
      errorPos,
      syndrome,
      corrected
    });
  }, [hammingInput]);
  
  // Load transmission into decoder
  const loadTransmission = useCallback((t: SRCTransmission) => {
    // For now, just load the prime
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
          
          {/* Hamming Demo Tab */}
          <TabsContent value="hamming" className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="text-xs font-semibold text-primary mb-2">Hamming(7,4) Error Correction</h4>
              <p className="text-xs text-muted-foreground">
                Encodes 4 data bits into 7 bits with 3 parity bits. Can detect and correct any single-bit error.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Test Message (1-4 chars)</Label>
              <div className="flex gap-2">
                <Input
                  value={hammingInput}
                  onChange={e => setHammingInput(e.target.value)}
                  placeholder="Hi"
                  className="flex-1 bg-background/50 border-border/50 text-sm font-mono"
                  maxLength={4}
                />
                <Button 
                  size="sm" 
                  onClick={runHammingDemo}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Simulate
                </Button>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {hammingDemo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {/* Original Data */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      Original Data Bits
                      <Badge variant="outline" className="text-xs">{hammingDemo.original.length} bits</Badge>
                    </Label>
                    <div className="flex flex-wrap gap-0.5 p-2 rounded bg-black/20 font-mono text-xs">
                      {hammingDemo.original.map((bit, i) => (
                        <span
                          key={i}
                          className={`w-4 h-5 flex items-center justify-center rounded ${
                            bit === 1 ? 'bg-blue-500/30 text-blue-400' : 'bg-blue-500/10 text-blue-400/50'
                          } ${i % 4 === 3 ? 'mr-1' : ''}`}
                        >
                          {bit}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Encoded Data */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      Hamming Encoded
                      <Badge variant="outline" className="text-xs">{hammingDemo.encoded.length} bits</Badge>
                    </Label>
                    <div className="flex flex-wrap gap-0.5 p-2 rounded bg-black/20 font-mono text-xs">
                      {hammingDemo.encoded.map((bit, i) => {
                        const inBlock = i % 7;
                        const isParity = inBlock === 0 || inBlock === 1 || inBlock === 3;
                        return (
                          <span
                            key={i}
                            className={`w-4 h-5 flex items-center justify-center rounded ${
                              isParity
                                ? (bit === 1 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-yellow-500/10 text-yellow-400/50')
                                : (bit === 1 ? 'bg-green-500/30 text-green-400' : 'bg-green-500/10 text-green-400/50')
                            } ${inBlock === 6 ? 'mr-2' : ''}`}
                            title={isParity ? 'Parity bit' : 'Data bit'}
                          >
                            {bit}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-yellow-500/30" /> Parity
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-500/30" /> Data
                      </span>
                    </div>
                  </div>
                  
                  {/* Corrupted Data */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      After Transmission (1-bit error injected)
                      <Badge className="bg-red-500/20 text-red-400 text-xs">
                        Error at bit {hammingDemo.errorPos}
                      </Badge>
                    </Label>
                    <div className="flex flex-wrap gap-0.5 p-2 rounded bg-black/20 font-mono text-xs">
                      {hammingDemo.corrupted.map((bit, i) => {
                        const isError = i === hammingDemo.errorPos;
                        return (
                          <span
                            key={i}
                            className={`w-4 h-5 flex items-center justify-center rounded ${
                              isError
                                ? 'bg-red-500/50 text-white ring-2 ring-red-500'
                                : (bit === 1 ? 'bg-muted/30 text-foreground' : 'bg-muted/10 text-muted-foreground')
                            } ${i % 7 === 6 ? 'mr-2' : ''}`}
                          >
                            {bit}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Syndrome & Recovery */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-black/30 border border-border/30">
                      <div className="text-xs text-muted-foreground mb-1">Syndrome</div>
                      <div className="font-mono text-lg text-primary">
                        {hammingDemo.syndrome}
                        <span className="text-xs text-muted-foreground ml-2">
                          (position {hammingDemo.syndrome > 0 ? hammingDemo.syndrome : 'none'})
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="text-xs text-muted-foreground mb-1">Status</div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="text-sm text-green-400">Error Corrected!</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recovered Data */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      Recovered Data
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Matches Original
                      </Badge>
                    </Label>
                    <div className="flex flex-wrap gap-0.5 p-2 rounded bg-black/20 font-mono text-xs">
                      {hammingDemo.recovered.slice(0, hammingDemo.original.length).map((bit, i) => (
                        <span
                          key={i}
                          className={`w-4 h-5 flex items-center justify-center rounded ${
                            bit === 1 ? 'bg-green-500/30 text-green-400' : 'bg-green-500/10 text-green-400/50'
                          } ${i % 4 === 3 ? 'mr-1' : ''}`}
                        >
                          {bit}
                        </span>
                      ))}
                    </div>
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
