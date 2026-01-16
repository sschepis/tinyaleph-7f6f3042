# High-Dimensional Algebra

TinyAleph uses hypercomplex number systems to represent semantic states with increasing richness.

## The Cayley-Dickson Construction

Each algebra is built from the previous:

```
Real (1D) → Complex (2D) → Quaternion (4D) → Octonion (8D) → Sedenion (16D)
```

At each step:
- Dimension doubles
- New properties emerge
- Some algebraic properties are lost

## Quaternions (4D)

$$q = w + xi + yj + zk$$

Where: $i^2 = j^2 = k^2 = ijk = -1$

### Properties
- Non-commutative: $ij \neq ji$
- Associative: $(ab)c = a(bc)$
- Division algebra: Every non-zero element has inverse

### Applications
- 3D rotations without gimbal lock
- Smooth interpolation (SLERP)
- Spatial semantic relationships

```javascript
import { Quaternion } from '@aleph-ai/tinyaleph';

const q1 = Quaternion.create(1, 0, 1, 0);
const q2 = Quaternion.create(0, 1, 0, 1);

const product = Quaternion.multiply(q1, q2);
const rotated = Quaternion.rotate(vector, q1);
```

## Octonions (8D)

$$o = e_0 + e_1 i_1 + e_2 i_2 + \ldots + e_7 i_7$$

### Properties
- Non-commutative
- **Non-associative**: $(ab)c \neq a(bc)$
- Alternative: $a(ab) = a^2 b$ and $(ab)b = ab^2$
- Still a division algebra

### Applications
- Exceptional Lie groups (G₂, F₄, E₆, E₇, E₈)
- String theory compactifications
- Rich semantic relationships

```javascript
import { Octonion } from '@aleph-ai/tinyaleph';

const o1 = Octonion.create([1, 0, 1, 0, 1, 0, 1, 0]);
const o2 = Octonion.create([0, 1, 0, 1, 0, 1, 0, 1]);

const product = Octonion.multiply(o1, o2);
// Note: Octonion.multiply(o1, o2) ≠ Octonion.multiply(o2, o1)
```

## Sedenions (16D)

$$s = \sum_{i=0}^{15} s_i e_i$$

### Properties
- Non-commutative
- Non-associative
- **Not a division algebra**: Has zero divisors
- Power-associative: $a^m a^n = a^{m+n}$

### Applications
- Full cognitive state representation
- 16-dimensional semantic space
- Maximum expressiveness for concepts

```javascript
import { Sedenion } from '@aleph-ai/tinyaleph';

const state = Sedenion.fromPrimes([2, 3, 5, 7, 11, 13]);
const components = Sedenion.getComponents(state);
// Returns array of 16 values
```

## Visualization

The SedenionVisualizer displays:
- 16 bars representing each component
- Height = magnitude
- Color = sign (positive/negative)
- Normalization relative to maximum

## Zero Divisors

In sedenions, non-zero elements can multiply to zero:

$$a \cdot b = 0 \text{ where } a \neq 0 \text{ and } b \neq 0$$

This models **semantic annihilation** - concepts that cancel each other.

## Norm and Conjugate

For any hypercomplex number:

$$|x| = \sqrt{x \cdot \bar{x}}$$

$$\bar{x} = x_0 - x_1 e_1 - x_2 e_2 - \ldots$$

## Coherence Metric

```javascript
// Coherence from sedenion state
const coherence = Sedenion.coherence(state);
// Returns value in [0, 1]
// 1 = perfectly aligned, 0 = maximally spread
```

## Summary Table

| Algebra | Dim | Commutative | Associative | Division | Zero Divisors |
|---------|-----|-------------|-------------|----------|---------------|
| Real | 1 | ✓ | ✓ | ✓ | ✗ |
| Complex | 2 | ✓ | ✓ | ✓ | ✗ |
| Quaternion | 4 | ✗ | ✓ | ✓ | ✗ |
| Octonion | 8 | ✗ | ✗ | ✓ | ✗ |
| Sedenion | 16 | ✗ | ✗ | ✗ | ✓ |
