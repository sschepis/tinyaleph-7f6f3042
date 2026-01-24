/**
 * Semantic Prime Mapper
 * 
 * Uses triadic prime fusion to discover meanings for uncatalogued primes.
 * The existing symbol database serves as the "seed crystal" for expansion.
 * Once initial assignments are made, entropy minimization refines them.
 * LLM-based refinement automatically converts raw fusions into clear meanings.
 */

import { SYMBOL_DATABASE } from '@/lib/symbolic-mind/symbol-database';
import { minimalConfig } from '@/lib/tinyaleph-config';
import { supabase } from '@/integrations/supabase/client';

// ============= TYPES =============

export interface PrimeMeaning {
  prime: number;
  meaning: string;
  rawMeaning?: string; // Original unrefined meaning
  confidence: number; // 0-1, how certain the assignment is
  derivedFrom: TriadicFusion[];
  entropy: number; // Local semantic entropy
  isSeeded: boolean; // True if from original database
  isRefined: boolean; // True if LLM-refined
  category?: string;
  resonantWith: number[]; // Other primes it resonates with
  primeSignature?: number[]; // Prime signature from vocabulary
}

export interface TriadicFusion {
  p: number;
  q: number;
  r: number;
  result: string;
  fusionType: 'additive' | 'multiplicative' | 'harmonic';
  strength: number;
}

export interface SimilarityResult {
  prime: number;
  meaning: string;
  similarity: number;
  sharedPrimes: number[];
}

export interface SemanticField {
  primes: Map<number, PrimeMeaning>;
  globalEntropy: number;
  coherence: number;
  uncataloguedCount: number;
  cataloguedCount: number;
}

// ============= PRIME UTILITIES =============

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function firstNPrimes(n: number): number[] {
  const primes: number[] = [];
  let candidate = 2;
  while (primes.length < n) {
    if (isPrime(candidate)) primes.push(candidate);
    candidate++;
  }
  return primes;
}

function gcd(a: number, b: number): number {
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// ============= SEED EXTRACTION =============

/**
 * Extract seed meanings from existing databases
 * Priority: Symbol database > first prime of vocabulary words
 * This prevents duplicate meanings from vocabulary word arrays
 */
function extractSeeds(): Map<number, PrimeMeaning> {
  const seeds = new Map<number, PrimeMeaning>();
  
  // First pass: Symbol database (highest priority - unique meanings per prime)
  for (const [id, symbol] of Object.entries(SYMBOL_DATABASE)) {
    seeds.set(symbol.prime, {
      prime: symbol.prime,
      meaning: symbol.meaning,
      confidence: 1.0,
      derivedFrom: [],
      entropy: 0,
      isSeeded: true,
      isRefined: true,
      category: symbol.category,
      resonantWith: []
    });
  }
  
  // Second pass: Vocabulary - only assign to primes without meanings
  // Use the word itself as meaning only for the FIRST prime in each word's array
  // Track which meanings have been used to avoid duplicates
  const usedMeanings = new Set<string>();
  
  // Collect all symbol database meanings to avoid
  for (const symbol of Object.values(SYMBOL_DATABASE)) {
    usedMeanings.add(symbol.meaning.toLowerCase());
  }
  
  for (const [word, primes] of Object.entries(minimalConfig.vocabulary)) {
    // Only assign meaning to the first prime that doesn't already have one
    // This prevents the same word being assigned to multiple primes
    let assigned = false;
    
    for (const p of primes) {
      if (!seeds.has(p) && !assigned) {
        seeds.set(p, {
          prime: p,
          meaning: word,
          confidence: 0.9,
          derivedFrom: [],
          entropy: 0.1,
          isSeeded: true,
          isRefined: true,
          resonantWith: primes.filter(q => q !== p)
        });
        assigned = true;
      } else if (seeds.has(p)) {
        // Enhance existing with resonance info from vocabulary
        const existing = seeds.get(p)!;
        existing.resonantWith = [...new Set([...existing.resonantWith, ...primes.filter(q => q !== p)])];
      }
    }
  }
  
  return seeds;
}

// ============= TRIADIC FUSION ENGINE =============

/**
 * Check if a triadic fusion is valid (sum is prime)
 */
function isValidFusion(p: number, q: number, r: number): boolean {
  if (p === q || q === r || p === r) return false;
  return isPrime(p + q + r);
}

/**
 * Find semantic meaning through triadic resonance
 */
function triadicFuse(
  p: number, 
  q: number, 
  r: number, 
  seeds: Map<number, PrimeMeaning>
): TriadicFusion | null {
  if (!isValidFusion(p, q, r)) return null;
  
  const pMeaning = seeds.get(p);
  const qMeaning = seeds.get(q);
  const rMeaning = seeds.get(r);
  
  // At least 2 must be known for inference
  const known = [pMeaning, qMeaning, rMeaning].filter(Boolean);
  if (known.length < 2) return null;
  
  // Compute fusion strength based on prime relationships
  const sum = p + q + r;
  const harmonicMean = 3 / (1/p + 1/q + 1/r);
  const primeGap = Math.abs(p - q) + Math.abs(q - r) + Math.abs(r - p);
  const strength = Math.exp(-primeGap / (p + q + r)) * (isPrime(sum) ? 1.5 : 0.5);
  
  // Combine meanings
  const meanings = known.map(k => k!.meaning);
  const fusedMeaning = combineMeanings(meanings, p, q, r);
  
  return {
    p, q, r,
    result: fusedMeaning,
    fusionType: gcd(gcd(p, q), r) > 1 ? 'harmonic' : (isPrime(sum) ? 'additive' : 'multiplicative'),
    strength
  };
}

/**
 * Combine meanings using semantic rules
 */
function combineMeanings(meanings: string[], p: number, q: number, r: number): string {
  // Extract key concepts from meanings
  const words = meanings.join(' ').toLowerCase().split(/[,.\s]+/).filter(w => w.length > 3);
  const uniqueWords = [...new Set(words)];
  
  // Use prime ratios to weight combination
  const total = p + q + r;
  const weights = [p/total, q/total, r/total];
  
  // Simple semantic combination rules
  const prefixes = ['meta-', 'proto-', 'trans-', 'hyper-', 'neo-'];
  const suffixes = ['-essence', '-nature', '-force', '-aspect', '-resonance'];
  
  // Select based on prime characteristics
  const prefix = prefixes[p % prefixes.length];
  const suffix = suffixes[r % suffixes.length];
  
  if (uniqueWords.length >= 2) {
    return `${prefix}${uniqueWords[0]}-${uniqueWords[1]}${suffix}`;
  } else if (uniqueWords.length === 1) {
    return `${prefix}${uniqueWords[0]}${suffix}`;
  }
  
  return `resonance-${p}-${q}-${r}`;
}

// ============= ENTROPY CALCULATIONS =============

/**
 * Calculate semantic entropy for a prime meaning assignment
 */
function calculateLocalEntropy(meaning: PrimeMeaning, field: Map<number, PrimeMeaning>): number {
  if (meaning.isSeeded) return 0; // Seeds have zero entropy
  
  // Entropy based on confidence and derivation depth
  const confidenceEntropy = -Math.log2(Math.max(0.001, meaning.confidence));
  
  // Check resonance with neighbors
  let resonanceSum = 0;
  for (const neighborPrime of meaning.resonantWith) {
    const neighbor = field.get(neighborPrime);
    if (neighbor) {
      // Semantic similarity would be computed here
      // For now, use prime-based heuristic
      const similarity = 1 / (1 + Math.abs(Math.log(meaning.prime / neighborPrime)));
      resonanceSum += similarity * neighbor.confidence;
    }
  }
  
  const resonanceEntropy = meaning.resonantWith.length > 0 
    ? -Math.log2(Math.max(0.001, resonanceSum / meaning.resonantWith.length))
    : 1;
  
  // Derivation chain length affects entropy
  const derivationEntropy = Math.log2(1 + meaning.derivedFrom.length) * 0.1;
  
  return (confidenceEntropy + resonanceEntropy + derivationEntropy) / 3;
}

/**
 * Calculate global semantic field entropy
 */
function calculateGlobalEntropy(field: Map<number, PrimeMeaning>): number {
  let totalEntropy = 0;
  let count = 0;
  
  for (const meaning of field.values()) {
    totalEntropy += meaning.entropy;
    count++;
  }
  
  return count > 0 ? totalEntropy / count : 1;
}

// ============= SEMANTIC PRIME MAPPER CLASS =============

export class SemanticPrimeMapper {
  private field: Map<number, PrimeMeaning>;
  private targetPrimes: number[];
  private globalEntropy: number;
  private coherence: number;
  
  constructor(numPrimes: number = 128) {
    this.targetPrimes = firstNPrimes(numPrimes);
    this.field = extractSeeds();
    this.globalEntropy = 1;
    this.coherence = 0;
    
    this.updateMetrics();
  }
  
  /**
   * Get uncatalogued primes that need meaning assignment
   */
  getUncataloguedPrimes(): number[] {
    return this.targetPrimes.filter(p => !this.field.has(p));
  }
  
  /**
   * Get current semantic field state
   */
  getField(): SemanticField {
    return {
      primes: this.field,
      globalEntropy: this.globalEntropy,
      coherence: this.coherence,
      uncataloguedCount: this.getUncataloguedPrimes().length,
      cataloguedCount: this.field.size
    };
  }
  
  /**
   * Expand the semantic field using triadic fusion
   */
  expandByFusion(): { expanded: number; newMeanings: PrimeMeaning[] } {
    const uncatalogued = this.getUncataloguedPrimes();
    const newMeanings: PrimeMeaning[] = [];
    
    for (const target of uncatalogued) {
      // Try to fuse target with two known primes
      const candidates = this.findFusionCandidates(target);
      
      if (candidates.length > 0) {
        // Use best candidate
        const best = candidates.reduce((a, b) => a.strength > b.strength ? a : b);
        
        const meaning: PrimeMeaning = {
          prime: target,
          meaning: best.result,
          rawMeaning: best.result, // Store original for refinement
          confidence: Math.min(0.8, best.strength),
          derivedFrom: [best],
          entropy: 0.5,
          isSeeded: false,
          isRefined: false, // Not yet refined by LLM
          resonantWith: [best.p, best.q, best.r].filter(p => p !== target)
        };
        
        // Calculate local entropy
        meaning.entropy = calculateLocalEntropy(meaning, this.field);
        
        this.field.set(target, meaning);
        newMeanings.push(meaning);
      }
    }
    
    this.updateMetrics();
    return { expanded: newMeanings.length, newMeanings };
  }
  
  /**
   * Find valid fusion candidates for a target prime
   */
  private findFusionCandidates(target: number): TriadicFusion[] {
    const candidates: TriadicFusion[] = [];
    const knownPrimes = Array.from(this.field.keys()).filter(p => this.field.get(p)!.confidence > 0.5);
    
    // Try different fusion approaches
    for (let i = 0; i < knownPrimes.length; i++) {
      for (let j = i + 1; j < knownPrimes.length; j++) {
        const p = knownPrimes[i];
        const q = knownPrimes[j];
        
        // Check if target could be involved in fusion with p and q
        // Additive: target = sum - p - q (if target is the sum result)
        // Or target is one of the components
        
        const fusion = triadicFuse(target, p, q, this.field);
        if (fusion && fusion.strength > 0.1) {
          candidates.push(fusion);
        }
      }
    }
    
    return candidates.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }
  
  /**
   * Entropy minimization pass - reorganize assignments for lower entropy
   */
  minimizeEntropy(): { improved: number; entropyDelta: number } {
    const initialEntropy = this.globalEntropy;
    let improvements = 0;
    
    // For each non-seeded meaning, try to find better derivations
    for (const [prime, meaning] of this.field) {
      if (meaning.isSeeded) continue;
      
      // Find alternative fusion paths
      const alternatives = this.findFusionCandidates(prime);
      
      for (const alt of alternatives) {
        // Create test meaning
        const testMeaning: PrimeMeaning = {
          ...meaning,
          derivedFrom: [...meaning.derivedFrom, alt],
          resonantWith: [...new Set([...meaning.resonantWith, alt.p, alt.q, alt.r].filter(p => p !== prime))]
        };
        
        const newEntropy = calculateLocalEntropy(testMeaning, this.field);
        
        // Accept if entropy is lower
        if (newEntropy < meaning.entropy) {
          testMeaning.entropy = newEntropy;
          testMeaning.confidence = Math.min(0.95, meaning.confidence + 0.05 * alt.strength);
          this.field.set(prime, testMeaning);
          improvements++;
        }
      }
    }
    
    this.updateMetrics();
    return { 
      improved: improvements, 
      entropyDelta: this.globalEntropy - initialEntropy 
    };
  }
  
  /**
   * Refine unrefined meanings using LLM
   * Automatically called after expansion
   */
  async refineMeanings(): Promise<{ refined: number; errors: string[] }> {
    const unrefinedMeanings = Array.from(this.field.values())
      .filter(m => !m.isRefined && !m.isSeeded);
    
    if (unrefinedMeanings.length === 0) {
      return { refined: 0, errors: [] };
    }
    
    // Batch in groups of 10 for API efficiency
    const batches: PrimeMeaning[][] = [];
    for (let i = 0; i < unrefinedMeanings.length; i += 10) {
      batches.push(unrefinedMeanings.slice(i, i + 10));
    }
    
    let totalRefined = 0;
    const errors: string[] = [];
    
    for (const batch of batches) {
      try {
        const meaningsToRefine = batch.map(m => ({
          prime: m.prime,
          rawMeaning: m.meaning,
          derivedFrom: m.derivedFrom.map(f => ({
            meaning: this.field.get(f.p)?.meaning || `prime-${f.p}`,
            prime: f.p
          })),
          resonantPrimes: m.resonantWith.slice(0, 5)
        }));
        
        const result = await supabase.functions.invoke('refine-meanings', {
          body: { meanings: meaningsToRefine }
        });
        
        if (result.error) {
          errors.push(`Refinement error: ${result.error.message}`);
          continue;
        }
        
        const refinements = result.data?.refinements || [];
        
        for (const r of refinements) {
          const meaning = this.field.get(r.prime);
          if (meaning && r.refined) {
            meaning.rawMeaning = meaning.meaning;
            meaning.meaning = r.refined;
            meaning.isRefined = true;
            meaning.confidence = Math.min(0.95, meaning.confidence + 0.1);
            totalRefined++;
          }
        }
      } catch (err) {
        errors.push(`Batch error: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }
    
    this.updateMetrics();
    return { refined: totalRefined, errors };
  }
  
  /**
   * Get count of unrefined meanings
   */
  getUnrefinedCount(): number {
    return Array.from(this.field.values()).filter(m => !m.isRefined && !m.isSeeded).length;
  }
  
  /**
   * Full expansion cycle: fusion + entropy minimization + automatic LLM refinement
   */
  async expandCycleAsync(): Promise<{ expanded: number; improved: number; refined: number; globalEntropy: number }> {
    const { expanded } = this.expandByFusion();
    const { improved } = this.minimizeEntropy();
    const { refined } = await this.refineMeanings();
    
    return { expanded, improved, refined, globalEntropy: this.globalEntropy };
  }
  
  /**
   * Synchronous expansion cycle (for backwards compatibility)
   */
  expandCycle(): { expanded: number; improved: number; globalEntropy: number } {
    const { expanded } = this.expandByFusion();
    const { improved } = this.minimizeEntropy();
    
    // Trigger async refinement in background
    this.refineMeanings().catch(console.error);
    
    return { expanded, improved, globalEntropy: this.globalEntropy };
  }
  
  /**
   * Add a learned meaning from the LearningEngine
   * This syncs LLM-discovered meanings back into the semantic field
   */
  addLearnedMeaning(prime: number, meaning: string, confidence: number = 0.8, category?: string): void {
    // Don't overwrite existing seeded meanings
    const existing = this.field.get(prime);
    if (existing?.isSeeded) {
      console.log(`[SemanticPrimeMapper] Skipping learned meaning for seeded prime ${prime}`);
      return;
    }
    
    const newMeaning: PrimeMeaning = {
      prime,
      meaning,
      confidence: Math.max(0.5, Math.min(0.95, confidence)),
      derivedFrom: existing?.derivedFrom || [],
      entropy: 0.1, // Low entropy for learned meanings
      isSeeded: false,
      isRefined: true, // Already refined by LLM
      category,
      resonantWith: existing?.resonantWith || []
    };
    
    this.field.set(prime, newMeaning);
    this.updateMetrics();
  }
  
  /**
   * Get meaning for a specific prime
   */
  getMeaning(prime: number): PrimeMeaning | undefined {
    return this.field.get(prime);
  }
  
  /**
   * Get all meanings sorted by confidence
   */
  getAllMeanings(): PrimeMeaning[] {
    return Array.from(this.field.values()).sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Calculate semantic similarity between two primes using their prime signatures
   * Uses Jaccard similarity on resonant primes + weighted cosine on vocabulary overlaps
   */
  calculateSimilarity(prime1: number, prime2: number): number {
    const m1 = this.field.get(prime1);
    const m2 = this.field.get(prime2);
    
    if (!m1 || !m2) return 0;
    
    // Jaccard similarity on resonant primes
    const set1 = new Set(m1.resonantWith);
    const set2 = new Set(m2.resonantWith);
    
    const intersection = [...set1].filter(p => set2.has(p)).length;
    const union = new Set([...set1, ...set2]).size;
    
    const jaccardSim = union > 0 ? intersection / union : 0;
    
    // Prime proximity (logarithmic distance)
    const primeSim = 1 / (1 + Math.abs(Math.log(prime1 / prime2)));
    
    // Fusion chain overlap
    const fusions1 = new Set(m1.derivedFrom.flatMap(f => [f.p, f.q, f.r]));
    const fusions2 = new Set(m2.derivedFrom.flatMap(f => [f.p, f.q, f.r]));
    const fusionIntersection = [...fusions1].filter(p => fusions2.has(p)).length;
    const fusionUnion = new Set([...fusions1, ...fusions2]).size;
    const fusionSim = fusionUnion > 0 ? fusionIntersection / fusionUnion : 0;
    
    // Weighted combination
    return (jaccardSim * 0.5 + primeSim * 0.3 + fusionSim * 0.2);
  }
  
  /**
   * Find most similar primes to a given prime
   */
  findSimilar(prime: number, topK: number = 10): SimilarityResult[] {
    const results: SimilarityResult[] = [];
    const targetMeaning = this.field.get(prime);
    
    if (!targetMeaning) return results;
    
    for (const [p, meaning] of this.field) {
      if (p === prime) continue;
      
      const similarity = this.calculateSimilarity(prime, p);
      
      // Find shared primes
      const targetResonant = new Set(targetMeaning.resonantWith);
      const sharedPrimes = meaning.resonantWith.filter(rp => targetResonant.has(rp));
      
      results.push({
        prime: p,
        meaning: meaning.meaning,
        similarity,
        sharedPrimes
      });
    }
    
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
  
  /**
   * Get similarity matrix for a set of primes
   */
  getSimilarityMatrix(primes: number[]): { primes: number[]; matrix: number[][] } {
    const matrix: number[][] = [];
    
    for (let i = 0; i < primes.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < primes.length; j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else if (j < i) {
          matrix[i][j] = matrix[j][i]; // Symmetric
        } else {
          matrix[i][j] = this.calculateSimilarity(primes[i], primes[j]);
        }
      }
    }
    
    return { primes, matrix };
  }
  
  /**
   * Cluster similar primes together using similarity threshold
   */
  clusterBySimilarity(threshold: number = 0.3): Map<number, number[]> {
    const clusters = new Map<number, number[]>();
    const assigned = new Set<number>();
    
    const allPrimes = Array.from(this.field.keys());
    
    for (const prime of allPrimes) {
      if (assigned.has(prime)) continue;
      
      // Start a new cluster
      const cluster = [prime];
      assigned.add(prime);
      
      // Find all similar primes
      for (const otherPrime of allPrimes) {
        if (assigned.has(otherPrime)) continue;
        
        const sim = this.calculateSimilarity(prime, otherPrime);
        if (sim >= threshold) {
          cluster.push(otherPrime);
          assigned.add(otherPrime);
        }
      }
      
      clusters.set(prime, cluster);
    }
    
    return clusters;
  }
  
  /**
   * Get vocabulary prime signature for a word
   */
  getVocabularySignature(word: string): number[] | undefined {
    const vocab = minimalConfig.vocabulary as Record<string, number[]>;
    return vocab[word.toLowerCase()];
  }
  
  /**
   * Find primes that match a vocabulary word's signature
   */
  findByVocabulary(word: string): PrimeMeaning[] {
    const signature = this.getVocabularySignature(word);
    if (!signature) return [];
    
    return signature
      .map(p => this.field.get(p))
      .filter((m): m is PrimeMeaning => m !== undefined);
  }
  
  /**
   * Export for serialization
   */
  export(): Record<number, { meaning: string; confidence: number; isSeeded: boolean }> {
    const result: Record<number, { meaning: string; confidence: number; isSeeded: boolean }> = {};
    for (const [prime, meaning] of this.field) {
      result[prime] = {
        meaning: meaning.meaning,
        confidence: meaning.confidence,
        isSeeded: meaning.isSeeded
      };
    }
    return result;
  }
  
  private updateMetrics(): void {
    // Update entropy for all meanings
    for (const [prime, meaning] of this.field) {
      meaning.entropy = calculateLocalEntropy(meaning, this.field);
    }
    
    this.globalEntropy = calculateGlobalEntropy(this.field);
    
    // Coherence = inverse of entropy, scaled
    this.coherence = Math.exp(-this.globalEntropy);
  }
}

// ============= SINGLETON INSTANCE =============

let mapperInstance: SemanticPrimeMapper | null = null;

export function getSemanticPrimeMapper(numPrimes: number = 128): SemanticPrimeMapper {
  if (!mapperInstance || mapperInstance.getField().primes.size < numPrimes) {
    mapperInstance = new SemanticPrimeMapper(numPrimes);
  }
  return mapperInstance;
}

export function resetSemanticPrimeMapper(): void {
  mapperInstance = null;
}
