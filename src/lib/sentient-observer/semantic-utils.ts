/**
 * Shared Semantic Utilities
 * Unified embedding, similarity, and prime-signature functions
 * used across the sentient observer's cognitive subsystems.
 */

// ============= PRIME BASIS =============

const PRIME_CACHE: number[] = [];

export function firstNPrimes(n: number): number[] {
  while (PRIME_CACHE.length < n) {
    let candidate = PRIME_CACHE.length === 0 ? 2 : PRIME_CACHE[PRIME_CACHE.length - 1] + 1;
    while (true) {
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(candidate); i++) {
        if (candidate % i === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) {
        PRIME_CACHE.push(candidate);
        break;
      }
      candidate++;
    }
  }
  return PRIME_CACHE.slice(0, n);
}

const PRIME_BASIS_64 = firstNPrimes(64);

// ============= PRIME SIGNATURES =============

/**
 * Convert text to a prime signature with amplitudes.
 * Uses word-level hashing for semantic structure and character-level
 * hashing for uniqueness. Adapted from the holographic memory approach.
 */
export function textToPrimeSignature(text: string): { primes: number[]; amplitudes: number[] } {
  const primes: number[] = [];
  const amplitudes: number[] = [];

  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = normalized.split(/\s+/).filter(w => w.length > 0);

  for (let i = 0; i < Math.min(words.length, 8); i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash + word.charCodeAt(j)) | 0;
    }

    const primeIdx = Math.abs(hash) % PRIME_BASIS_64.length;
    if (!primes.includes(PRIME_BASIS_64[primeIdx])) {
      primes.push(PRIME_BASIS_64[primeIdx]);
      amplitudes.push(0.8 - i * 0.08);
    }
  }

  for (let i = 0; i < Math.min(text.length, 10); i++) {
    const charPrime = PRIME_BASIS_64[text.charCodeAt(i) % PRIME_BASIS_64.length];
    if (!primes.includes(charPrime)) {
      primes.push(charPrime);
      amplitudes.push(0.3);
    }
  }

  return { primes, amplitudes };
}

/**
 * Jaccard similarity between two prime signatures.
 */
export function primeSignatureSimilarity(sig1: number[], sig2: number[]): number {
  const set1 = new Set(sig1);
  const set2 = new Set(sig2);

  let intersection = 0;
  set1.forEach(p => { if (set2.has(p)) intersection++; });

  const union = set1.size + set2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// ============= DENSE EMBEDDINGS =============

const EMBEDDING_DIM = 32;

/**
 * Generate a dense semantic embedding from text.
 * Uses word-level and bigram hashing for richer structure than
 * simple character hashing. 32 dimensions for reasonable discrimination.
 */
export function textToEmbedding(text: string): number[] {
  const embedding = new Array(EMBEDDING_DIM).fill(0);
  const normalized = text.toLowerCase();
  const words = normalized.split(/\s+/).filter(w => w.length > 0);

  // Word-level hashing with positional decay
  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    let wordHash = 0;
    for (let i = 0; i < word.length; i++) {
      wordHash = ((wordHash << 5) - wordHash + word.charCodeAt(i)) | 0;
    }

    // Distribute across multiple dimensions per word
    const baseIdx = Math.abs(wordHash) % EMBEDDING_DIM;
    const weight = 1 / (w + 1);
    embedding[baseIdx] += weight;
    embedding[(baseIdx + 7) % EMBEDDING_DIM] += weight * 0.5;
    embedding[(baseIdx + 13) % EMBEDDING_DIM] += weight * 0.3;

    // Character-level detail within word
    for (let i = 0; i < word.length; i++) {
      const idx = (word.charCodeAt(i) + w * 3) % EMBEDDING_DIM;
      embedding[idx] += weight / (i + 2);
    }
  }

  // Bigram hashing for word-order sensitivity
  for (let w = 0; w < words.length - 1; w++) {
    const bigram = words[w] + ' ' + words[w + 1];
    let bigramHash = 0;
    for (let i = 0; i < bigram.length; i++) {
      bigramHash = ((bigramHash << 5) - bigramHash + bigram.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(bigramHash) % EMBEDDING_DIM;
    embedding[idx] += 0.4 / (w + 1);
  }

  // L2 normalize
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) || 1;
  return embedding.map(v => v / norm);
}

/**
 * Cosine similarity between two dense embeddings.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

/**
 * Combined text similarity using both prime-signature Jaccard
 * and dense cosine similarity for robust matching.
 */
export function textSimilarity(text1: string, text2: string): number {
  const sig1 = textToPrimeSignature(text1);
  const sig2 = textToPrimeSignature(text2);
  const jaccard = primeSignatureSimilarity(sig1.primes, sig2.primes);

  const emb1 = textToEmbedding(text1);
  const emb2 = textToEmbedding(text2);
  const cosine = cosineSimilarity(emb1, emb2);

  return jaccard * 0.5 + cosine * 0.5;
}

export { EMBEDDING_DIM };
