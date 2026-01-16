# Prime Resonance

The Prime Resonance App demonstrates quantum-like dynamics using prime numbers as basis states.

## Overview

**Route**: `/prime-resonance`

The Prime Resonance App demonstrates:
- Prime Hilbert space representation
- Quantum-inspired operators
- Born rule measurement
- Entropy-driven evolution

## Mathematical Foundation

### Prime Hilbert Space
States are superpositions over prime basis:

$$|\psi\rangle = \sum_p \alpha_p |p\rangle$$

Where:
- $|p\rangle$ = basis state for prime $p$
- $\alpha_p \in \mathbb{C}$ = complex amplitude
- $\sum_p |\alpha_p|^2 = 1$ (normalization)

### Operators

#### Prime Operator $\hat{P}$
Weights amplitudes by prime index:
```javascript
const applyPrimeOperator = (state) => {
  return state.map(({ prime, amplitude }) => ({
    prime,
    amplitude: scale(amplitude, primeIndex(prime))
  }));
};
```

#### Rotation Operator $\hat{R}(n)$
Rotates phases by angle proportional to prime:
```javascript
const applyRotation = (state, n) => {
  return state.map(({ prime, amplitude }) => ({
    prime,
    amplitude: rotate(amplitude, n * prime * Math.PI / 180)
  }));
};
```

#### Coupling Operator $\hat{C}(n)$
Couples primes through multiplication:
```javascript
const applyCoupling = (state, n) => {
  // Primes divisible by n couple together
};
```

#### Hadamard-like Operator $\hat{H}$
Creates superposition by spreading amplitude:
```javascript
const applyHadamard = (state) => {
  // Distribute amplitude across all primes
};
```

## User Interface

### Hilbert Space Visualization
- Primes positioned on unit circle
- Angle = prime index
- Radius = amplitude magnitude
- Color = phase

### Operator Buttons
Apply operators with single click:
- P̂: Prime weighting
- R̂(n): Rotation
- Ĉ(n): Coupling
- Ĥ: Hadamard

### Probability Bars
Born rule probabilities for each prime:
$$P(p) = |\alpha_p|^2$$

### Entropy Timeline
- Entropy curve (Shannon entropy)
- Collapse probability curve
- Collapse events marked

## Measurement

### Born Rule Sampling
```javascript
import { measure } from '@/lib/prime-resonance';

const result = measure(state);
// Returns: { prime: 7, probability: 0.3, collapsed: true }
```

### Measurement Statistics
Tracks:
- KL divergence from theoretical distribution
- Observed vs expected frequencies
- Chi-squared goodness of fit

## Evolution

### Damped Dynamics
```javascript
const evolve = (state, params) => {
  const { lambda, rStable, dt } = params;
  
  return state.map(({ prime, amplitude }) => ({
    prime,
    amplitude: {
      re: amplitude.re - lambda * (amplitude.re - rStable) * dt,
      im: amplitude.im * Math.exp(-lambda * dt)
    }
  }));
};
```

### Entropy Calculation
```javascript
const entropy = (state) => {
  const probs = state.map(s => magnitude(s.amplitude) ** 2);
  return -probs.reduce((H, p) => p > 0 ? H + p * Math.log(p) : H, 0);
};
```

## Resonance Comparison

Compare two arbitrary states:

### Inner Product
$$\langle\psi_1|\psi_2\rangle = \sum_p \bar{\alpha}_{1,p} \alpha_{2,p}$$

### Jaccard Similarity
$$J = \frac{|S_1 \cap S_2|}{|S_1 \cup S_2|}$$

Where $S_i$ = set of primes with significant amplitude.

### Phase Coherence
$$\gamma = \left|\frac{1}{N}\sum_p e^{i(\phi_{1,p} - \phi_{2,p})}\right|$$

## Formalism Panel

Explains the mathematical foundations:
- State representation
- Operator definitions
- Measurement postulates
- Evolution equations

## Implementation

### State Creation
```javascript
import { uniformSuperposition, conceptState } from '@/lib/prime-resonance';

// Uniform over first 16 primes
const uniform = uniformSuperposition(16);

// From specific primes
const concept = conceptState([2, 3, 5, 7]);
```

### State Manipulation
```javascript
import { normalize, innerProduct } from '@/lib/prime-resonance';

const normalized = normalize(state);
const overlap = innerProduct(state1, state2);
```

## Configuration

### First 64 Primes
```javascript
const FIRST_64_PRIMES = [2, 3, 5, 7, 11, 13, ...];
```

### Evolution Parameters
```javascript
const DEFAULT_PARAMS = {
  lambda: 0.1,    // Damping coefficient
  rStable: 0.8,   // Target amplitude
  dt: 0.05        // Time step
};
```

## Usage Tips

1. **Start with uniform**: See how operators differentiate
2. **Apply operators sequentially**: Watch state evolution
3. **Measure multiple times**: Verify Born rule statistics
4. **Compare states**: Use Resonance Comparison panel
5. **Track entropy**: Watch approach to collapse
