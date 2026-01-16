# Kuramoto Synchronization

The Kuramoto model describes how coupled oscillators spontaneously synchronize—a key mechanism in TinyAleph's semantic dynamics.

## The Kuramoto Model

For $N$ oscillators with phases $\theta_i$ and natural frequencies $\omega_i$:

$$\frac{d\theta_i}{dt} = \omega_i + \frac{K}{N} \sum_{j=1}^{N} \sin(\theta_j - \theta_i)$$

Where:
- $\omega_i$ = natural frequency of oscillator $i$
- $K$ = coupling strength
- The sum represents mean-field coupling

## Order Parameter

The complex order parameter measures synchronization:

$$r e^{i\psi} = \frac{1}{N} \sum_{j=1}^{N} e^{i\theta_j}$$

Where:
- $r \in [0, 1]$ = synchronization level
- $\psi$ = average phase
- $r = 1$: Perfect sync
- $r = 0$: No coherence

## Phase Transition

At critical coupling $K_c$:
- $K < K_c$: Oscillators run independently ($r \to 0$)
- $K > K_c$: Partial synchronization ($r > 0$)
- $K \gg K_c$: Full synchronization ($r \to 1$)

$$K_c = \frac{2}{\pi g(0)}$$

Where $g(\omega)$ is the frequency distribution.

## Implementation

```javascript
import { KuramotoModel } from '@aleph-ai/tinyaleph';

// Create coupled oscillator system
const kuramoto = new KuramotoModel({
  n: 10,                    // Number of oscillators
  coupling: 2.0,            // Coupling strength K
  frequencies: 'normal',    // Distribution type
  dt: 0.01                  // Time step
});

// Evolve system
for (let t = 0; t < 100; t++) {
  kuramoto.step();
  console.log(`r = ${kuramoto.orderParameter()}`);
}
```

## Semantic Application

### Oscillators as Concepts
Each prime in a semantic state is an oscillator:
- **Natural frequency** ∝ prime value
- **Phase** = semantic orientation
- **Coupling** = semantic relatedness

### Synchronization as Agreement
When concepts synchronize:
- Related ideas align in phase
- Coherent meaning emerges
- Order parameter rises

```javascript
import { semanticKuramoto } from '@aleph-ai/tinyaleph';

// Create semantic oscillator network
const network = semanticKuramoto({
  concepts: ['wisdom', 'knowledge', 'understanding'],
  coupling: 1.5
});

// Evolve until synchronized
while (network.orderParameter() < 0.9) {
  network.step();
}

// Synchronized meaning emerges
const coherentMeaning = network.extractMeaning();
```

## Visualization

The OscillatorPhaseViz component shows:
- Oscillators on unit circle
- Real-time phase evolution
- Order parameter magnitude
- Synchronization clusters

## Extended Models

### Weighted Coupling
```javascript
// Non-uniform coupling
const K_ij = semanticSimilarity(concept_i, concept_j);
```

### Delayed Coupling
```javascript
// Time-delayed interaction
const delay = propagationTime(i, j);
dθ_i/dt = ω_i + Σ K_ij sin(θ_j(t - delay) - θ_i)
```

### Multi-layer Networks
```javascript
// Different coupling per semantic layer
const layers = {
  visual: { coupling: 2.0 },
  auditory: { coupling: 1.5 },
  conceptual: { coupling: 3.0 }
};
```

## Connection to Brain Dynamics

The Kuramoto model approximates neural synchronization:
- Gamma oscillations (30-100 Hz): Feature binding
- Theta oscillations (4-8 Hz): Memory encoding
- Alpha oscillations (8-12 Hz): Attention gating

## Sephirotic Oscillator

The Sephirotic Oscillator app uses Kuramoto dynamics:
- 10 Sephiroth as oscillators
- 22 Hebrew letter paths as coupling channels
- Resonance patterns reveal Kabbalistic meanings
