# CRT Homology

The Chinese Remainder Theorem (CRT) provides powerful tools for semantic encoding and recovery.

## Chinese Remainder Theorem

For pairwise coprime moduli $m_1, m_2, \ldots, m_k$:

$$x \equiv a_1 \pmod{m_1}$$
$$x \equiv a_2 \pmod{m_2}$$
$$\vdots$$
$$x \equiv a_k \pmod{m_k}$$

Has a unique solution modulo $M = m_1 \cdot m_2 \cdots m_k$.

## Semantic Application

Each prime modulus encodes a different "view" of a concept:

```javascript
import { CRT } from '@aleph-ai/tinyaleph';

// Encode concept with multiple views
const concept = {
  visual: 3,      // mod 5
  auditory: 2,    // mod 7
  semantic: 4,    // mod 11
  emotional: 1    // mod 13
};

const encoded = CRT.encode(concept, [5, 7, 11, 13]);
// Returns unique integer representing all views

const decoded = CRT.decode(encoded, [5, 7, 11, 13]);
// Recovers: [3, 2, 4, 1]
```

## Residue Classes

The residue $a \mod p$ captures the "shadow" of $a$ in the prime field $\mathbb{Z}_p$.

### Properties
- **Homomorphism**: $(a + b) \mod p = (a \mod p + b \mod p) \mod p$
- **Preserves structure**: Multiplication and addition work mod p
- **Lossy but consistent**: Can't recover original, but residue is stable

## Homological Perspective

The collection of residues forms a **chain complex**:

$$0 \to \mathbb{Z} \xrightarrow{\phi} \prod_p \mathbb{Z}_p \xrightarrow{\partial} \text{coker}(\phi) \to 0$$

Where:
- $\phi(n) = (n \mod p_1, n \mod p_2, \ldots)$
- $\partial$ measures how residues fail to lift

## Applications

### 1. Multi-Modal Encoding
```javascript
// Same concept, different modalities
const dog = {
  visual: encodePrime('furry'),      // mod 101
  sound: encodePrime('bark'),        // mod 103
  concept: encodePrime('canine')     // mod 107
};

const unified = CRT.unify(dog);
```

### 2. Error Detection
```javascript
// Redundant encoding for error correction
const original = 42;
const encoded = CRT.encode(original, [7, 11, 13, 17]);

// If one residue corrupted, can detect
const corrupted = [0, 9, 3, 8]; // Should be [0, 9, 3, 8]
const valid = CRT.verify(corrupted, [7, 11, 13, 17]);
```

### 3. Semantic Hashing
```javascript
// Create semantic hash using prime residues
function semanticHash(text) {
  const primes = [31, 37, 41, 43, 47];
  return primes.map(p => hashCode(text) % p);
}

// Similar texts have similar residue patterns
```

## Lifting and Projection

### Projection
```javascript
// Project to prime field
const proj = n => n % p;
```

### Lifting
```javascript
// Lift from residues back to integer
const lift = CRT.solve(residues, moduli);
```

## Connection to Prime Semantics

CRT provides:
1. **Decomposition**: Split meaning across prime dimensions
2. **Reconstruction**: Recover full meaning from partial views
3. **Compatibility**: Check if views are consistent

## Visualization

The CRT Homology examples visualize:
- Residue patterns across primes
- Lifting/projection operations
- Coherence of multi-view encodings
