# Entropy Dynamics

Entropy in TinyAleph governs the evolution of semantic states from superposition toward definite meaning.

## Shannon Entropy

For a probability distribution over primes:

$$H = -\sum_p P(p) \log P(p)$$

Where $P(p) = |\alpha_p|^2$ is the Born rule probability.

## Entropy in Semantic States

### High Entropy
- Many primes with similar amplitudes
- Meaning is ambiguous/undefined
- Maximum creativity/possibility

### Low Entropy
- Few primes dominate
- Meaning is focused/clear
- Approaching collapse

## Entropy Evolution

States evolve according to damped dynamics:

$$\frac{d\alpha_p}{dt} = -\lambda(\alpha_p - r_{\text{stable}})$$

Where:
- $\lambda$ = damping coefficient
- $r_{\text{stable}}$ = target stable amplitude

```javascript
import { evolve } from '@aleph-ai/tinyaleph';

const params = {
  lambda: 0.1,      // Damping rate
  rStable: 0.8,     // Target amplitude
  dt: 0.1           // Time step
};

const { state, entropy, collapseProb } = evolve(currentState, params);
```

## Collapse Probability

The probability of collapse increases as entropy decreases:

$$P_{\text{collapse}} = e^{-\beta H}$$

When $P_{\text{collapse}}$ exceeds threshold, measurement occurs.

## The Entropy Timeline

The EntropyTimeline component visualizes:
- Entropy over time (blue curve)
- Collapse probability (red curve)
- Collapse events (vertical markers)

## Thermodynamic Analogy

| Physical System | Semantic System |
|-----------------|-----------------|
| Temperature | Entropy |
| Energy minimum | Meaning focus |
| Phase transition | Concept collapse |
| Heat bath | Noise/ambiguity |

## Free Energy Principle

The system minimizes semantic free energy:

$$F = E - TS$$

Where:
- $E$ = energy (deviation from coherent meaning)
- $T$ = temperature (exploration parameter)
- $S$ = entropy (uncertainty)

## Information Geometry

Semantic states form a statistical manifold where:
- Distance = KL divergence
- Geodesics = optimal meaning transitions
- Curvature = semantic complexity

## Applications

### 1. Controlled Collapse
```javascript
// Gradually reduce entropy until collapse
while (entropy > threshold) {
  state = evolve(state, params);
  if (collapseProb > 0.95) {
    return measure(state);
  }
}
```

### 2. Entropy-Based Sampling
```javascript
// High entropy = more diverse outputs
const creative = sample(state, { temperature: 2.0 });

// Low entropy = more focused outputs
const focused = sample(state, { temperature: 0.5 });
```

### 3. Semantic Annealing
```javascript
// Start hot (high entropy), cool down gradually
for (let T = 1.0; T > 0.01; T *= 0.99) {
  state = anneal(state, T);
}
// Final state is refined meaning
```

## Measurement Statistics

The MeasurementStats panel tracks:
- KL divergence from Born distribution
- Actual vs expected measurement frequencies
- Chi-squared goodness of fit
