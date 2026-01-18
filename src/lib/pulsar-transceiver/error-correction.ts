/**
 * Error Correction Codes for Pulsar Transceiver
 * - Extended Hamming(8,4): Single-bit error correction + double-bit detection
 * - Reed-Solomon: Burst error correction
 */

export type ECCMode = 'none' | 'hamming84' | 'reed-solomon';

// ========== EXTENDED HAMMING(8,4) ==========
// Encodes 4 data bits into 8 bits (3 parity + 1 overall parity)
// Can correct any single-bit error and detect double-bit errors

/**
 * Encode 4 data bits to 8 bits using Extended Hamming(8,4)
 * Bit positions: p1, p2, d1, p3, d2, d3, d4, p4(overall)
 */
export function encodeHamming84(dataBits: number[]): number[] {
  const encoded: number[] = [];
  
  // Pad to multiple of 4
  const padded = [...dataBits];
  while (padded.length % 4 !== 0) {
    padded.push(0);
  }
  
  for (let i = 0; i < padded.length; i += 4) {
    const d1 = padded[i];
    const d2 = padded[i + 1];
    const d3 = padded[i + 2];
    const d4 = padded[i + 3];
    
    // Calculate parity bits
    const p1 = d1 ^ d2 ^ d4;        // Covers positions 1,3,5,7
    const p2 = d1 ^ d3 ^ d4;        // Covers positions 2,3,6,7
    const p3 = d2 ^ d3 ^ d4;        // Covers positions 4,5,6,7
    
    // Arrange: p1, p2, d1, p3, d2, d3, d4
    const block = [p1, p2, d1, p3, d2, d3, d4];
    
    // Overall parity (p4) - XOR of all 7 bits
    const p4 = block.reduce((a, b) => a ^ b, 0);
    
    encoded.push(...block, p4);
  }
  
  return encoded;
}

/**
 * Calculate syndrome for Hamming(7,4) portion
 */
function calculateSyndrome(block: number[]): number {
  const s1 = block[0] ^ block[2] ^ block[4] ^ block[6]; // positions 1,3,5,7
  const s2 = block[1] ^ block[2] ^ block[5] ^ block[6]; // positions 2,3,6,7
  const s3 = block[3] ^ block[4] ^ block[5] ^ block[6]; // positions 4,5,6,7
  return s1 + (s2 << 1) + (s3 << 2);
}

/**
 * Decode Extended Hamming(8,4) with error correction
 */
export function decodeHamming84(encodedBits: number[]): {
  bits: number[];
  corrected: boolean;
  errorPositions: number[];
  uncorrectable: boolean;
  correctedBits: number[];
} {
  const decoded: number[] = [];
  let corrected = false;
  const errorPositions: number[] = [];
  let uncorrectable = false;
  const correctedBits = [...encodedBits];
  
  for (let i = 0; i + 7 < encodedBits.length; i += 8) {
    const block = encodedBits.slice(i, i + 8);
    const syndrome = calculateSyndrome(block.slice(0, 7));
    const overallParity = block.reduce((a, b) => a ^ b, 0);
    
    if (syndrome === 0 && overallParity === 0) {
      // No error
    } else if (syndrome !== 0 && overallParity === 1) {
      // Single-bit error - correctable
      const errPos = syndrome - 1;
      if (errPos >= 0 && errPos < 7) {
        correctedBits[i + errPos] ^= 1;
        block[errPos] ^= 1;
        corrected = true;
        errorPositions.push(i + errPos);
      }
    } else if (syndrome === 0 && overallParity === 1) {
      // Error in overall parity bit only
      correctedBits[i + 7] ^= 1;
      corrected = true;
      errorPositions.push(i + 7);
    } else {
      // Double-bit error detected - uncorrectable
      uncorrectable = true;
    }
    
    // Extract data bits (positions 3, 5, 6, 7 in 1-indexed = indices 2, 4, 5, 6)
    decoded.push(block[2], block[4], block[5], block[6]);
  }
  
  return { bits: decoded, corrected, errorPositions, uncorrectable, correctedBits };
}


// ========== REED-SOLOMON GF(2^8) ==========
// RS(255, 223) shortened - can correct up to 16 byte errors
// Simplified implementation for demonstration

// GF(2^8) primitive polynomial: x^8 + x^4 + x^3 + x^2 + 1 = 0x11D
const GF_POLY = 0x11D;
const GF_SIZE = 256;

// Precomputed exp and log tables for GF(2^8)
const gfExp: number[] = new Array(512);
const gfLog: number[] = new Array(256);

// Initialize GF tables
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    gfExp[i] = x;
    gfLog[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= GF_POLY;
    }
  }
  for (let i = 255; i < 512; i++) {
    gfExp[i] = gfExp[i - 255];
  }
  gfLog[0] = -1; // undefined, but we'll handle it
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return gfExp[gfLog[a] + gfLog[b]];
}

function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero in GF");
  if (a === 0) return 0;
  return gfExp[(gfLog[a] - gfLog[b] + 255) % 255];
}

function gfPow(x: number, power: number): number {
  return gfExp[(gfLog[x] * power) % 255];
}

function gfInverse(x: number): number {
  return gfExp[255 - gfLog[x]];
}

// Polynomial operations in GF(2^8)
function polyMul(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

// Generate RS generator polynomial for t error correction
function rsGeneratorPoly(nsym: number): number[] {
  let g = [1];
  for (let i = 0; i < nsym; i++) {
    g = polyMul(g, [1, gfPow(2, i)]);
  }
  return g;
}

// RS encoding
export function encodeReedSolomon(data: number[], nsym: number = 8): number[] {
  const gen = rsGeneratorPoly(nsym);
  const padded = [...data, ...new Array(nsym).fill(0)];
  
  for (let i = 0; i < data.length; i++) {
    const coef = padded[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        padded[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  
  // Return data + parity
  return [...data, ...padded.slice(data.length)];
}

// Calculate syndromes
function rsSyndromes(msg: number[], nsym: number): number[] {
  const synd = [0];
  for (let i = 0; i < nsym; i++) {
    let s = 0;
    for (let j = 0; j < msg.length; j++) {
      s = gfMul(s, gfPow(2, i)) ^ msg[j];
    }
    synd.push(s);
  }
  return synd;
}

// Check if message has errors
function rsCheckSyndromes(synd: number[]): boolean {
  return synd.slice(1).every(s => s === 0);
}

// Berlekamp-Massey algorithm for error locator polynomial
function rsBerlekampMassey(synd: number[], nsym: number): number[] {
  let errLoc = [1];
  let oldLoc = [1];
  
  for (let i = 0; i < nsym; i++) {
    let delta = synd[i + 1];
    for (let j = 1; j < errLoc.length; j++) {
      delta ^= gfMul(errLoc[j], synd[i + 1 - j]);
    }
    
    oldLoc = [...oldLoc, 0];
    
    if (delta !== 0) {
      if (oldLoc.length > errLoc.length) {
        const newLoc = oldLoc.map(c => gfMul(c, delta));
        oldLoc = errLoc.map(c => gfMul(c, gfInverse(delta)));
        errLoc = newLoc;
      }
      for (let j = 0; j < oldLoc.length; j++) {
        errLoc[j] ^= gfMul(oldLoc[j], delta);
      }
    }
  }
  
  // Remove leading zeros
  while (errLoc.length > 1 && errLoc[0] === 0) {
    errLoc.shift();
  }
  
  return errLoc;
}

// Find error positions using Chien search
function rsChienSearch(errLoc: number[], msgLen: number): number[] {
  const errs = errLoc.length - 1;
  const errPos: number[] = [];
  
  for (let i = 0; i < msgLen; i++) {
    let sum = 0;
    for (let j = 0; j < errLoc.length; j++) {
      sum ^= gfMul(errLoc[j], gfPow(2, (errLoc.length - 1 - j) * i));
    }
    if (sum === 0) {
      errPos.push(msgLen - 1 - i);
    }
  }
  
  if (errPos.length !== errs) {
    return []; // Failed to find all errors
  }
  
  return errPos;
}

// Forney algorithm for error values
function rsForney(synd: number[], errPos: number[], errLoc: number[], msgLen: number): number[] {
  // Calculate error evaluator polynomial
  const errEval: number[] = [1];
  
  // Simplified error magnitude calculation
  const errMag: number[] = [];
  
  for (const pos of errPos) {
    const xi = gfPow(2, msgLen - 1 - pos);
    let xiInv = gfInverse(xi);
    
    // Calculate error magnitude
    let errLocPrime = 0;
    for (let i = 0; i < errPos.length; i++) {
      if (errPos[i] !== pos) {
        errLocPrime ^= gfMul(1, gfMul(gfPow(2, msgLen - 1 - errPos[i]), xiInv) ^ 1);
      }
    }
    if (errLocPrime === 0) errLocPrime = 1;
    
    // Simplified magnitude
    let mag = synd[1];
    for (let j = 1; j < errLoc.length; j++) {
      mag ^= gfMul(errLoc[j], gfPow(xi, j));
    }
    
    errMag.push(gfDiv(mag, errLocPrime) || 0);
  }
  
  return errMag;
}

// Full RS decode with error correction
export function decodeReedSolomon(msg: number[], nsym: number = 8): {
  data: number[];
  corrected: boolean;
  errorCount: number;
  uncorrectable: boolean;
  errorPositions: number[];
} {
  const synd = rsSyndromes(msg, nsym);
  
  if (rsCheckSyndromes(synd)) {
    return {
      data: msg.slice(0, msg.length - nsym),
      corrected: false,
      errorCount: 0,
      uncorrectable: false,
      errorPositions: []
    };
  }
  
  const errLoc = rsBerlekampMassey(synd, nsym);
  const errPos = rsChienSearch(errLoc, msg.length);
  
  if (errPos.length === 0 || errPos.length > nsym / 2) {
    return {
      data: msg.slice(0, msg.length - nsym),
      corrected: false,
      errorCount: 0,
      uncorrectable: true,
      errorPositions: []
    };
  }
  
  // Calculate error magnitudes (simplified)
  const corrected = [...msg];
  for (const pos of errPos) {
    // For binary channel, just flip the byte (simplified)
    // In full implementation, use Forney algorithm
    const xi = gfPow(2, msg.length - 1 - pos);
    let errMag = 0;
    for (let i = 1; i <= nsym; i++) {
      errMag ^= gfMul(synd[i], gfPow(xi, i - 1));
    }
    corrected[pos] ^= errMag || 1;
  }
  
  return {
    data: corrected.slice(0, msg.length - nsym),
    corrected: true,
    errorCount: errPos.length,
    uncorrectable: false,
    errorPositions: errPos
  };
}

// ========== UTILITY FUNCTIONS ==========

// Convert bits to bytes for RS encoding
export function bitsToBytes(bits: number[]): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8 && i + b < bits.length; b++) {
      byte = (byte << 1) | bits[i + b];
    }
    bytes.push(byte);
  }
  return bytes;
}

// Convert bytes to bits
export function bytesToBits(bytes: number[]): number[] {
  const bits: number[] = [];
  for (const byte of bytes) {
    for (let b = 7; b >= 0; b--) {
      bits.push((byte >> b) & 1);
    }
  }
  return bits;
}

// ========== INTERLEAVING ==========
// Spreads bits across codewords to resist burst errors

export interface InterleavingConfig {
  rows: number; // Number of codewords
  cols: number; // Bits per codeword
}

/**
 * Interleave bits - write rows, read columns
 * This spreads burst errors across multiple codewords
 */
export function interleave(bits: number[], config: InterleavingConfig): {
  interleaved: number[];
  paddingBits: number;
} {
  const { rows, cols } = config;
  const totalSize = rows * cols;
  
  // Pad to fill the matrix
  const padded = [...bits];
  const paddingBits = (totalSize - (bits.length % totalSize)) % totalSize;
  for (let i = 0; i < paddingBits; i++) {
    padded.push(0);
  }
  
  // Create matrix (write row by row)
  const matrix: number[][] = [];
  for (let r = 0; r < rows; r++) {
    matrix.push(padded.slice(r * cols, (r + 1) * cols));
  }
  
  // Read column by column
  const interleaved: number[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      interleaved.push(matrix[r][c]);
    }
  }
  
  return { interleaved, paddingBits };
}

/**
 * Deinterleave bits - reverse the interleaving process
 */
export function deinterleave(bits: number[], config: InterleavingConfig): number[] {
  const { rows, cols } = config;
  
  // Create matrix (write column by column)
  const matrix: number[][] = Array.from({ length: rows }, () => []);
  let idx = 0;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      matrix[r][c] = bits[idx++] || 0;
    }
  }
  
  // Read row by row
  const deinterleaved: number[] = [];
  for (let r = 0; r < rows; r++) {
    deinterleaved.push(...matrix[r]);
  }
  
  return deinterleaved;
}

/**
 * Calculate interleaving config based on data size
 */
export function calculateInterleavingConfig(dataLength: number, eccMode: ECCMode): InterleavingConfig {
  if (eccMode === 'hamming84') {
    // Each Hamming(8,4) codeword is 8 bits
    const codewordSize = 8;
    const numCodewords = Math.ceil(dataLength / 4); // 4 data bits per codeword
    return { rows: numCodewords, cols: codewordSize };
  } else if (eccMode === 'reed-solomon') {
    // For RS, interleave at byte level
    const byteCount = Math.ceil(dataLength / 8);
    const rows = Math.min(16, Math.max(4, byteCount)); // 4-16 rows
    const cols = Math.ceil(byteCount * 8 / rows);
    return { rows, cols: cols + (cols % 8 === 0 ? 0 : 8 - cols % 8) };
  }
  return { rows: 1, cols: dataLength };
}

// Apply ECC encoding with optional interleaving
export function applyECC(dataBits: number[], mode: ECCMode, useInterleaving: boolean = false): {
  encodedBits: number[];
  overhead: number;
  description: string;
  interleavingConfig?: InterleavingConfig;
} {
  switch (mode) {
    case 'hamming84': {
      const encoded = encodeHamming84(dataBits);
      
      if (useInterleaving) {
        const config = calculateInterleavingConfig(dataBits.length, mode);
        const { interleaved } = interleave(encoded, config);
        return {
          encodedBits: interleaved,
          overhead: encoded.length - dataBits.length,
          description: `Hamming(8,4)+Interleave: ${dataBits.length} → ${interleaved.length} bits (burst resistant)`,
          interleavingConfig: config
        };
      }
      
      return {
        encodedBits: encoded,
        overhead: encoded.length - dataBits.length,
        description: `Hamming(8,4): ${dataBits.length} → ${encoded.length} bits (100% overhead, corrects 1-bit errors)`
      };
    }
    case 'reed-solomon': {
      // Pad bits to byte boundary
      const padded = [...dataBits];
      while (padded.length % 8 !== 0) padded.push(0);
      
      const bytes = bitsToBytes(padded);
      const nsym = Math.min(16, Math.max(4, Math.ceil(bytes.length * 0.25))); // 25% parity
      const encoded = encodeReedSolomon(bytes, nsym);
      let encodedBits = bytesToBits(encoded);
      
      if (useInterleaving) {
        const config = calculateInterleavingConfig(dataBits.length, mode);
        const { interleaved } = interleave(encodedBits, config);
        return {
          encodedBits: interleaved,
          overhead: interleaved.length - dataBits.length,
          description: `RS(${encoded.length},${bytes.length})+Interleave: burst resistant (corrects ${Math.floor(nsym/2)} byte errors)`,
          interleavingConfig: config
        };
      }
      
      return {
        encodedBits,
        overhead: encodedBits.length - dataBits.length,
        description: `RS(${encoded.length},${bytes.length}): ${dataBits.length} → ${encodedBits.length} bits (corrects ${Math.floor(nsym/2)} byte errors)`
      };
    }
    default:
      return {
        encodedBits: dataBits,
        overhead: 0,
        description: 'No ECC applied'
      };
  }
}

// Apply ECC decoding with optional deinterleaving
export function decodeECC(
  encodedBits: number[], 
  mode: ECCMode, 
  originalDataLength?: number,
  interleavingConfig?: InterleavingConfig
): {
  dataBits: number[];
  corrected: boolean;
  errorCount: number;
  errorPositions: number[];
  correctedPositions: number[]; // Positions in the encoded stream that were corrected
  uncorrectable: boolean;
  correctedBits: number[]; // The corrected encoded bits
} {
  let bitsToProcess = encodedBits;
  
  // Deinterleave if config provided
  if (interleavingConfig) {
    bitsToProcess = deinterleave(encodedBits, interleavingConfig);
  }
  
  switch (mode) {
    case 'hamming84': {
      const result = decodeHamming84(bitsToProcess);
      return {
        dataBits: originalDataLength ? result.bits.slice(0, originalDataLength) : result.bits,
        corrected: result.corrected,
        errorCount: result.errorPositions.length,
        errorPositions: result.errorPositions,
        correctedPositions: result.errorPositions,
        uncorrectable: result.uncorrectable,
        correctedBits: result.correctedBits
      };
    }
    case 'reed-solomon': {
      const bytes = bitsToBytes(bitsToProcess);
      const nsym = Math.min(16, Math.max(4, Math.ceil((bytes.length * 0.8) * 0.25)));
      const result = decodeReedSolomon(bytes, nsym);
      const dataBits = bytesToBits(result.data);
      
      // Convert byte error positions to bit positions
      const bitErrorPositions = result.errorPositions.flatMap(pos => 
        Array.from({ length: 8 }, (_, i) => pos * 8 + i)
      );
      
      return {
        dataBits: originalDataLength ? dataBits.slice(0, originalDataLength) : dataBits,
        corrected: result.corrected,
        errorCount: result.errorCount,
        errorPositions: result.errorPositions,
        correctedPositions: bitErrorPositions,
        uncorrectable: result.uncorrectable,
        correctedBits: bytesToBits(result.corrected ? [...result.data, ...bytes.slice(result.data.length)] : bytes)
      };
    }
    default:
      return {
        dataBits: encodedBits,
        corrected: false,
        errorCount: 0,
        errorPositions: [],
        correctedPositions: [],
        uncorrectable: false,
        correctedBits: encodedBits
      };
  }
}

// Inject errors for testing
export function injectErrors(bits: number[], count: number, burstLength: number = 1): {
  corrupted: number[];
  errorPositions: number[];
} {
  const corrupted = [...bits];
  const errorPositions: number[] = [];
  
  for (let i = 0; i < count; i++) {
    const startPos = Math.floor(Math.random() * (bits.length - burstLength));
    for (let j = 0; j < burstLength && startPos + j < bits.length; j++) {
      if (!errorPositions.includes(startPos + j)) {
        corrupted[startPos + j] ^= 1;
        errorPositions.push(startPos + j);
      }
    }
  }
  
  return { corrupted, errorPositions: errorPositions.sort((a, b) => a - b) };
}
