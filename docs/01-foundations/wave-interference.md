# Wave Interference

TinyAleph represents semantic states as complex wave functions, enabling quantum-like superposition and interference.

## Wave Representation

Each prime in a semantic signature carries:
- **Amplitude**: Strength of association
- **Phase**: Relational orientation

$$|\psi\rangle = \sum_p \alpha_p e^{i\phi_p} |p\rangle$$

Where:
- $|p\rangle$ = basis state for prime $p$
- $\alpha_p$ = amplitude (real, positive)
- $\phi_p$ = phase angle

## Superposition

Multiple concepts can exist in superposition:

```javascript
import { uniformSuperposition, conceptState } from '@aleph-ai/tinyaleph';

// Equal superposition of first 16 primes
const uniform = uniformSuperposition(16);

// Weighted superposition from concept
const wisdom = conceptState([2, 3, 5, 7]);
```

## Interference Patterns

### Constructive Interference
When phases align, amplitudes add:

$$\psi_1 + \psi_2 = 2\alpha \cos(\Delta\phi/2)$$

This represents **semantic agreement**.

### Destructive Interference
When phases oppose, amplitudes cancel:

$$\psi_1 + \psi_2 = 2\alpha \sin(\Delta\phi/2)$$

This represents **semantic contradiction**.

## Inner Product

The inner product measures overlap:

```javascript
import { innerProduct } from '@aleph-ai/tinyaleph';

const overlap = innerProduct(state1, state2);
// Returns ComplexNumber with re and im parts

const similarity = Math.sqrt(overlap.re ** 2 + overlap.im ** 2);
```

## Phase Coherence

Phase coherence measures how aligned the phases are:

$$\gamma = \left| \frac{1}{N} \sum_j e^{i\phi_j} \right|$$

- $\gamma = 1$: Perfect coherence (all phases aligned)
- $\gamma = 0$: No coherence (random phases)

## Operators

### Rotation Operator $\hat{R}(n)$
Rotates phases by angle proportional to prime index:

```javascript
const rotated = applyRotationOperator(state, 3);
```

### Hadamard-like Operator $\hat{H}$
Creates superposition by spreading amplitude:

```javascript
const spread = applyHadamardOperator(state);
```

## Resonance Visualization

The HilbertSpaceViz component displays:
- Prime positions on unit circle (angle = prime index)
- Amplitude as radial distance
- Phase as color hue

## Applications

1. **Semantic Blending**: Interfere two concepts to find synthesis
2. **Ambiguity Resolution**: Collapse superposition through measurement
3. **Analogy Detection**: Match interference patterns
4. **Creative Generation**: Sample from superposition states

## Code Example

```javascript
import { createState, evolve, measure } from '@aleph-ai/tinyaleph';

// Create superposition of "light" and "dark"
const light = createState([2, 5, 11]);
const dark = createState([3, 7, 13]);

// Interfere them
const superposition = superpose(light, dark);

// Measure to collapse
const result = measure(superposition);
// Probabilistically returns one concept
```
