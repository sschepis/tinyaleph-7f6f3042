# Prime Semantics

The foundation of TinyAleph's semantic system is the mapping of concepts to prime numbers.

## Core Principle

Every meaningful concept corresponds to a unique prime factorization:

```
concept → prime signature → semantic operations
```

## The Fundamental Theorem of Arithmetic

Since every positive integer has a unique prime factorization:

$$n = p_1^{a_1} \cdot p_2^{a_2} \cdot \ldots \cdot p_k^{a_k}$$

We can use this to create **compositional semantics**:
- Simple concepts → single primes
- Complex concepts → products of primes

## Encoding Process

### 1. Hash-Based Prime Assignment

```javascript
import { SemanticKernel } from '@aleph-ai/tinyaleph';

const kernel = new SemanticKernel();

// Each word deterministically maps to primes
const sunPrimes = kernel.encode('sun');    // e.g., [2, 7, 13]
const moonPrimes = kernel.encode('moon');  // e.g., [3, 11, 17]
```

### 2. Semantic Signature

The prime signature captures:
- **Denotation**: Core meaning (largest primes)
- **Connotation**: Associated meanings (smaller primes)
- **Context**: Relational primes (shared factors)

## Similarity Metrics

### Jaccard Similarity
```javascript
// Overlap of prime sets
similarity(A, B) = |A ∩ B| / |A ∪ B|
```

### Resonance Score
```javascript
// Phase-weighted similarity
resonance(A, B) = Σ cos(φ_a - φ_b) / max(|A|, |B|)
```

## Composition Operations

### Union (OR)
```javascript
// Combine meanings
compose(sun, light) = union(primes(sun), primes(light))
```

### Intersection (AND)
```javascript
// Find common ground
overlap(wisdom, knowledge) = intersection(primes(wisdom), primes(knowledge))
```

### Difference (NOT)
```javascript
// Semantic subtraction
distinguish(cat, dog) = difference(primes(cat), primes(dog))
```

## Mathematical Properties

1. **Determinism**: Same input always produces same output
2. **Compositionality**: Complex meanings from simple parts
3. **Reversibility**: Prime signature can be decoded
4. **Metric Space**: Similarity satisfies triangle inequality

## Applications

- **Semantic Memory**: Store and retrieve by meaning
- **Analogical Reasoning**: A:B :: C:? via prime algebra
- **Concept Blending**: Multiply signatures for fusion
- **Contradiction Detection**: Check for incompatible primes

## Example: Word Algebra

```javascript
const king = kernel.encode('king');
const man = kernel.encode('man');
const woman = kernel.encode('woman');

// king - man + woman ≈ queen
const queenVector = subtract(add(king, woman), man);
const nearest = kernel.nearest(queenVector);
// Returns 'queen' or semantically similar concepts
```
