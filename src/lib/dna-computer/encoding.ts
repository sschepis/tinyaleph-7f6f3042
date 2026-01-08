// DNA Computer Encoding Functions

import { NUCLEOTIDE_PRIMES, COMPLEMENT_MAP, GENETIC_CODE } from './types';

/**
 * Convert a DNA sequence to an array of prime numbers
 */
export function strandToPrimes(sequence: string): number[] {
  return [...sequence.toUpperCase()].map(n => NUCLEOTIDE_PRIMES[n] || 0).filter(p => p > 0);
}

/**
 * Get the complementary DNA strand (Watson-Crick base pairing)
 */
export function getComplement(sequence: string): string {
  return [...sequence.toUpperCase()].map(n => COMPLEMENT_MAP[n] || n).join('');
}

/**
 * Calculate GC content (percentage of G and C nucleotides)
 */
export function calculateGCContent(sequence: string): number {
  const upper = sequence.toUpperCase();
  const gc = [...upper].filter(n => n === 'G' || n === 'C').length;
  return upper.length > 0 ? (gc / upper.length) * 100 : 0;
}

/**
 * Estimate melting temperature using the Wallace rule
 * Tm = 2(A+T) + 4(G+C) for sequences < 14bp
 * More accurate: Tm = 64.9 + 41*(nG+nC-16.4)/(nA+nT+nG+nC)
 */
export function calculateMeltingTemp(sequence: string): number {
  const upper = sequence.toUpperCase();
  const at = [...upper].filter(n => n === 'A' || n === 'T').length;
  const gc = [...upper].filter(n => n === 'G' || n === 'C').length;
  
  if (upper.length < 14) {
    return 2 * at + 4 * gc;
  }
  return 64.9 + 41 * (gc - 16.4) / (at + gc);
}

/**
 * Convert prime array to sedenion components (16D)
 * Uses prime factorization and modular arithmetic
 */
export function primesToSedenion(primes: number[]): number[] {
  const sedenion = new Array(16).fill(0);
  
  primes.forEach((prime, i) => {
    // Map prime to sedenion component based on position and value
    const componentIndex = (prime * (i + 1)) % 16;
    const phase = (i * Math.PI * 2) / primes.length;
    const magnitude = 1 / Math.sqrt(primes.length || 1);
    
    sedenion[componentIndex] += magnitude * Math.cos(phase);
    sedenion[(componentIndex + 8) % 16] += magnitude * Math.sin(phase);
  });
  
  // Normalize
  const norm = Math.sqrt(sedenion.reduce((sum, c) => sum + c * c, 0));
  if (norm > 0) {
    return sedenion.map(c => c / norm);
  }
  
  // Default to unit sedenion if empty
  sedenion[0] = 1;
  return sedenion;
}

/**
 * Convert DNA strand directly to sedenion state
 */
export function strandToSedenion(sequence: string): number[] {
  return primesToSedenion(strandToPrimes(sequence));
}

/**
 * Calculate codon prime product
 */
export function codonToPrimeProduct(codon: string): number {
  const primes = strandToPrimes(codon);
  return primes.reduce((product, p) => product * p, 1);
}

/**
 * Translate DNA sequence to amino acids
 */
export function translateSequence(sequence: string): Array<{ codon: string; aminoAcid: string; abbrev: string }> {
  const upper = sequence.toUpperCase();
  const result: Array<{ codon: string; aminoAcid: string; abbrev: string }> = [];
  
  for (let i = 0; i + 2 < upper.length; i += 3) {
    const codon = upper.slice(i, i + 3);
    const info = GENETIC_CODE[codon];
    if (info) {
      result.push({ codon, aminoAcid: info.aminoAcid, abbrev: info.abbrev });
      if (info.property === 'stop') break;
    }
  }
  
  return result;
}

/**
 * Calculate hybridization coherence between two strands
 * Returns a value between 0 (no match) and 1 (perfect complement)
 */
export function calculateHybridization(strand1: string, strand2: string): {
  coherence: number;
  matches: number;
  mismatches: number;
  bindingEnergy: number;
} {
  const s1 = strand1.toUpperCase();
  const s2 = strand2.toUpperCase();
  const complement1 = getComplement(s1);
  
  let matches = 0;
  let mismatches = 0;
  const minLen = Math.min(s1.length, s2.length);
  
  for (let i = 0; i < minLen; i++) {
    if (complement1[i] === s2[i]) {
      matches++;
    } else {
      mismatches++;
    }
  }
  
  // Calculate sedenion coherence (dot product)
  const sed1 = strandToSedenion(s1);
  const sed2 = strandToSedenion(s2);
  const dotProduct = sed1.reduce((sum, c, i) => sum + c * sed2[i], 0);
  
  // Binding energy approximation (kcal/mol)
  // G-C pairs contribute ~-3 kcal/mol, A-T pairs ~-2 kcal/mol
  let energy = 0;
  for (let i = 0; i < minLen; i++) {
    if (complement1[i] === s2[i]) {
      if (s1[i] === 'G' || s1[i] === 'C') {
        energy -= 3;
      } else {
        energy -= 2;
      }
    }
  }
  
  return {
    coherence: Math.abs(dotProduct),
    matches,
    mismatches,
    bindingEnergy: energy,
  };
}

/**
 * Generate a random DNA sequence
 */
export function generateRandomSequence(length: number): string {
  const nucleotides = ['A', 'T', 'G', 'C'];
  return Array.from({ length }, () => 
    nucleotides[Math.floor(Math.random() * 4)]
  ).join('');
}

/**
 * Validate DNA sequence (only A, T, G, C allowed)
 */
export function isValidSequence(sequence: string): boolean {
  return /^[ATGCatgc]*$/.test(sequence);
}
