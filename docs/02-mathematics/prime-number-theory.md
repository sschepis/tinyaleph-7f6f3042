# Prime Number Theory

TinyAleph leverages deep properties of prime numbers for semantic computation.

## Fundamental Theorem of Arithmetic

Every positive integer $n > 1$ has a unique prime factorization:

$$n = p_1^{a_1} \cdot p_2^{a_2} \cdots p_k^{a_k}$$

This provides the basis for compositional semantics.

## Prime Factorization

```javascript
import { primeFactorize } from '@aleph-ai/tinyaleph';

const factors = primeFactorize(360);
// Returns: Map { 2 => 3, 3 => 2, 5 => 1 }
// Because: 360 = 2³ × 3² × 5
```

## Prime Distribution

The Prime Number Theorem states:

$$\pi(x) \sim \frac{x}{\ln x}$$

Where $\pi(x)$ is the count of primes up to $x$.

### Prime Gaps
The gap $g_n = p_{n+1} - p_n$ has rich structure:
- Average gap ≈ $\ln p_n$
- Gaps modulate the wavefunction

```javascript
import { primeGap } from '@aleph-ai/tinyaleph';

const gap = primeGap(97); // Gap after 97
// Returns: 4 (next prime is 101)
```

## The Riemann Hypothesis

The Riemann zeta function:

$$\zeta(s) = \sum_{n=1}^{\infty} \frac{1}{n^s}$$

Has zeros at:
- Trivial zeros: $s = -2, -4, -6, \ldots$
- Non-trivial zeros: $s = \frac{1}{2} + i\gamma_n$ (conjectured)

### Riemann Zeros in TinyAleph

```javascript
const RIEMANN_ZEROS = [
  14.134725142, // γ₁
  21.022039639, // γ₂
  25.010857580, // γ₃
  // ...
];

// Use in wavefunction
const psi = computeWavefunction(x, { t: RIEMANN_ZEROS[0] });
```

## Prime Resonance

Primes create resonance patterns when used as frequencies:

$$R(x) = \sum_p e^{2\pi i x / p}$$

Peaks occur at positions related to prime structure.

## Gaussian Primes

In the Gaussian integers $\mathbb{Z}[i]$:
- $2 = (1+i)(1-i)$ splits
- $5 = (2+i)(2-i)$ splits
- $3$ remains prime

```javascript
import { isGaussianPrime, factorGaussian } from '@aleph-ai/tinyaleph';

isGaussianPrime(3);        // true
isGaussianPrime(5);        // false
factorGaussian(5);         // [(2, 1), (2, -1)]
```

## Applications in TinyAleph

### 1. Prime Signatures
Each concept maps to a set of primes:
```javascript
const wisdom = [2, 7, 13, 23]; // Prime signature
```

### 2. Composite States
```javascript
import { compositeState } from '@aleph-ai/tinyaleph';

// Create state from factorization of 360
const state = compositeState(360);
// Activates primes 2, 3, 5 with weights from exponents
```

### 3. Prime Hilbert Space
```javascript
// Basis states are primes
const |2⟩ = basisState(2);
const |3⟩ = basisState(3);

// Superposition
const |ψ⟩ = (|2⟩ + |3⟩) / √2;
```

## The First 64 Primes

```javascript
const FIRST_64_PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53,
  59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131,
  137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223,
  227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311
];
```

## Primality Testing

```javascript
import { isPrime, millerRabin } from '@aleph-ai/tinyaleph';

isPrime(97);          // true (deterministic for small n)
millerRabin(10007);   // true (probabilistic for large n)
```
