// DNA Computer Encoding Functions

import { NUCLEOTIDE_PRIMES, COMPLEMENT_MAP, GENETIC_CODE, RESTRICTION_ENZYMES, HYDROPHOBICITY, AMINO_ACID_CODES, type RestrictionEnzyme, type PCRPrimer, type CRISPRGuide } from './types';

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
 * Get the reverse complement (for primer design)
 */
export function getReverseComplement(sequence: string): string {
  return getComplement(sequence).split('').reverse().join('');
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

/**
 * Validate RNA sequence (only A, U, G, C allowed)
 */
export function isValidRNASequence(sequence: string): boolean {
  return /^[AUGCaugc]*$/.test(sequence);
}

/**
 * Find restriction enzyme cut sites in a sequence
 */
export function findRestrictionSites(sequence: string, enzymes?: RestrictionEnzyme[]): Array<{
  enzyme: RestrictionEnzyme;
  position: number;
  fragment5: string;
  fragment3: string;
}> {
  const upper = sequence.toUpperCase();
  const sites: Array<{
    enzyme: RestrictionEnzyme;
    position: number;
    fragment5: string;
    fragment3: string;
  }> = [];
  
  const enzymeList = enzymes || RESTRICTION_ENZYMES;
  
  for (const enzyme of enzymeList) {
    let pos = upper.indexOf(enzyme.recognition);
    while (pos !== -1) {
      const cutPos = pos + enzyme.cutSite;
      sites.push({
        enzyme,
        position: pos,
        fragment5: upper.slice(0, cutPos),
        fragment3: upper.slice(cutPos),
      });
      pos = upper.indexOf(enzyme.recognition, pos + 1);
    }
  }
  
  return sites.sort((a, b) => a.position - b.position);
}

/**
 * Design PCR primers for a target region
 */
export function designPrimers(sequence: string, options?: {
  primerLength?: number;
  minTm?: number;
  maxTm?: number;
  minGC?: number;
  maxGC?: number;
}): { forward: PCRPrimer; reverse: PCRPrimer } | null {
  const upper = sequence.toUpperCase();
  const len = options?.primerLength || 20;
  const minTm = options?.minTm || 55;
  const maxTm = options?.maxTm || 65;
  const minGC = options?.minGC || 40;
  const maxGC = options?.maxGC || 60;
  
  if (upper.length < len * 2) return null;
  
  // Forward primer from start
  const fwdSeq = upper.slice(0, len);
  const fwdGC = calculateGCContent(fwdSeq);
  const fwdTm = calculateMeltingTemp(fwdSeq);
  
  // Reverse primer from end (reverse complement)
  const revRegion = upper.slice(-len);
  const revSeq = getReverseComplement(revRegion);
  const revGC = calculateGCContent(revSeq);
  const revTm = calculateMeltingTemp(revSeq);
  
  return {
    forward: {
      sequence: fwdSeq,
      tm: fwdTm,
      gcContent: fwdGC,
      direction: 'forward',
    },
    reverse: {
      sequence: revSeq,
      tm: revTm,
      gcContent: revGC,
      direction: 'reverse',
    },
  };
}

/**
 * Simulate PCR amplification
 */
export function simulatePCR(template: string, forward: string, reverse: string, cycles: number = 30): {
  product: string;
  length: number;
  copies: number;
  yield: string;
} {
  const upper = template.toUpperCase();
  const fwd = forward.toUpperCase();
  const rev = reverse.toUpperCase();
  const revComp = getReverseComplement(rev);
  
  // Find primer binding sites
  const fwdPos = upper.indexOf(fwd);
  const revCompPos = upper.indexOf(revComp);
  
  if (fwdPos === -1 || revCompPos === -1 || fwdPos >= revCompPos) {
    return { product: '', length: 0, copies: 0, yield: '0 ng' };
  }
  
  const product = upper.slice(fwdPos, revCompPos + rev.length);
  const copies = Math.pow(2, cycles);
  const yieldNg = (copies * product.length * 660) / 6.022e23 * 1e9;
  
  return {
    product,
    length: product.length,
    copies,
    yield: yieldNg > 1000 ? `${(yieldNg / 1000).toFixed(2)} μg` : `${yieldNg.toFixed(2)} ng`,
  };
}

/**
 * Find CRISPR guide RNA targets (NGG PAM)
 */
export function findCRISPRTargets(sequence: string, guideLength: number = 20): CRISPRGuide[] {
  const upper = sequence.toUpperCase();
  const targets: CRISPRGuide[] = [];
  
  // Find NGG PAM sites
  for (let i = guideLength; i < upper.length - 2; i++) {
    if (upper[i + 1] === 'G' && upper[i + 2] === 'G') {
      const guideSeq = upper.slice(i - guideLength, i);
      const pam = upper.slice(i, i + 3);
      
      // Calculate a simple score based on GC content and position
      const gc = calculateGCContent(guideSeq);
      let score = 0.5;
      if (gc >= 40 && gc <= 70) score += 0.2;
      if (!guideSeq.includes('TTTT')) score += 0.1;
      if (guideSeq.startsWith('G')) score += 0.1;
      if (!guideSeq.endsWith('GG')) score += 0.1;
      
      targets.push({
        sequence: guideSeq,
        pam,
        position: i - guideLength,
        score: Math.min(1, score),
      });
    }
  }
  
  return targets.sort((a, b) => b.score - a.score);
}

/**
 * Simulate CRISPR edit (insertion or deletion)
 */
export function simulateCRISPREdit(sequence: string, guide: CRISPRGuide, editType: 'delete' | 'insert', insertSeq?: string): {
  edited: string;
  deletion?: string;
  insertion?: string;
} {
  const upper = sequence.toUpperCase();
  const cutPos = guide.position + guide.sequence.length - 3; // Cut 3bp before PAM
  
  if (editType === 'delete') {
    // Delete 3-5 bp at cut site (simple NHEJ simulation)
    const deletion = upper.slice(cutPos, cutPos + 4);
    const edited = upper.slice(0, cutPos) + upper.slice(cutPos + 4);
    return { edited, deletion };
  } else {
    // Insert sequence at cut site (HDR simulation)
    const insertion = insertSeq || 'ATCG';
    const edited = upper.slice(0, cutPos) + insertion + upper.slice(cutPos);
    return { edited, insertion };
  }
}

/**
 * Calculate protein hydrophobicity profile
 */
export function calculateHydrophobicityProfile(protein: string, windowSize: number = 7): number[] {
  const upper = protein.toUpperCase();
  const profile: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < upper.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = Math.max(0, i - halfWindow); j <= Math.min(upper.length - 1, i + halfWindow); j++) {
      const h = HYDROPHOBICITY[upper[j]];
      if (h !== undefined) {
        sum += h;
        count++;
      }
    }
    
    profile.push(count > 0 ? sum / count : 0);
  }
  
  return profile;
}

/**
 * Find open reading frames (ORFs) in a sequence
 */
export function findORFs(sequence: string, minLength: number = 30): Array<{
  start: number;
  end: number;
  frame: number;
  protein: string;
}> {
  const upper = sequence.toUpperCase();
  const orfs: Array<{
    start: number;
    end: number;
    frame: number;
    protein: string;
  }> = [];
  
  // Check all 3 reading frames
  for (let frame = 0; frame < 3; frame++) {
    let inORF = false;
    let orfStart = -1;
    let protein = '';
    
    for (let i = frame; i + 2 < upper.length; i += 3) {
      const codon = upper.slice(i, i + 3);
      const info = GENETIC_CODE[codon];
      
      if (!inORF && codon === 'ATG') {
        // Start codon
        inORF = true;
        orfStart = i;
        protein = 'M';
      } else if (inORF) {
        if (info?.property === 'stop') {
          // Stop codon
          if (protein.length >= minLength / 3) {
            orfs.push({
              start: orfStart,
              end: i + 3,
              frame,
              protein,
            });
          }
          inORF = false;
          protein = '';
        } else if (info) {
          protein += AMINO_ACID_CODES[info.abbrev] || '?';
        }
      }
    }
  }
  
  return orfs.sort((a, b) => (b.end - b.start) - (a.end - a.start));
}

/**
 * Calculate sequence complexity using Shannon entropy
 */
export function calculateSequenceComplexity(sequence: string): number {
  const upper = sequence.toUpperCase();
  const counts: Record<string, number> = {};
  
  for (const nuc of upper) {
    counts[nuc] = (counts[nuc] || 0) + 1;
  }
  
  let entropy = 0;
  for (const nuc of Object.keys(counts)) {
    const p = counts[nuc] / upper.length;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  
  // Normalize to 0-1 (max entropy for 4 nucleotides is 2 bits)
  return entropy / 2;
}
