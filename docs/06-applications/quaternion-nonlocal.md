# Quaternionic Non-Local Communication

The Quaternionic Non-Local Communication app implements a symbolic communication framework based on quaternionic embeddings of split primes.

## Overview

**Route**: `/quaternion-nonlocal`

The Quaternion Transceiver demonstrates:
- Split prime ($p \equiv 1 \mod 12$) quaternionic embeddings
- Entangled pair dynamics with twist coupling
- Phase synchronization (Δφ) detection
- Symbolic collapse via projection operators

## Mathematical Foundation

### Split Primes

A prime $p$ is called *split* in the Gaussian integers if:
$$p \equiv 1 \pmod{4}$$

And split in the Eisenstein integers if:
$$p \equiv 1 \pmod{3}$$

Primes satisfying both conditions (p ≡ 1 mod 12) have both factorizations:

#### Gaussian Factorization
$$p = \alpha \bar{\alpha} = a^2 + b^2$$

Where $\alpha = a + bi$ is a Gaussian prime.

#### Eisenstein Factorization
$$p = \beta \bar{\beta} = c^2 - cd + d^2$$

Where $\beta = c + d\omega$ and $\omega = e^{2\pi i/3}$.

### Quaternionic Embedding

For a split prime $p$ with Gaussian factor $(a, b)$ and Eisenstein factor $(c', d')$:

$$q_p = a + bi + c'j + d'k$$

The Bloch vector is derived from the imaginary components:
$$\vec{v} = \frac{(b, c', d')}{\|(b, c', d')\|}$$

## Entanglement Model

### Entangled Pair Creation
```javascript
const createEntangledPair = (alice, bob, twistCoupling) => {
  const compositeHamiltonian = quaternionMultiply(
    alice.quaternion,
    bob.quaternion
  );
  
  return {
    alice,
    bob,
    twistCoupling, // γ_pq
    compositeHamiltonian,
    phaseDifference: 0,
    isSynchronized: false
  };
};
```

### Twist Coupling (γ)

The twist coupling parameter γ ∈ [0, 1] controls entanglement strength:

$$\gamma_{pq} = \frac{\langle q_p | q_q \rangle}{\|q_p\| \|q_q\|}$$

Higher γ values lead to stronger phase correlations between Alice and Bob.

### Phase Evolution

The entangled pair evolves according to:

$$\frac{d\phi}{dt} = \omega_0 + \gamma \sin(\Delta\phi)$$

Where:
- $\omega_0$ = natural frequency
- $\gamma$ = twist coupling
- $\Delta\phi = \phi_A - \phi_B$ = phase difference

### Synchronization Condition

Phases are considered synchronized when:

$$|\Delta\phi| < \epsilon$$

Where ε is the phase threshold (configurable from 0.01 to 0.5).

## User Interface

### Prime Generator Panel
- Select split primes for Alice and Bob
- Spectrum visualization showing prime resonance
- Display Gaussian factorization $(a + bi)$

### Resonance Control Panel
- Twist coupling (γ) adjustment slider
- Real-time phase synchronization meter
- Δφ oscilloscope visualization
- Lock/unlock toggle for parameter protection

### Entropy Analysis Panel
- Real-time entropy gauge
- Correlation strength indicator
- Synchronization event counter
- Trend analysis

### Transmitter Panel
Initiate transmissions from Alice or Bob:
```javascript
const transmit = (sender, pair, time) => {
  const phase = sender === 'alice' 
    ? getAlicePhase(pair) 
    : getBobPhase(pair);
    
  return {
    timestamp: time,
    sender,
    prime: pair[sender],
    quaternionSent: pair[sender].quaternion,
    phaseAtSend: phase,
    phaseLockAchieved: pair.isSynchronized
  };
};
```

### Receiver Panel
- Incoming signal strength display
- Phase lock indicator
- Signal quality metrics
- Received projection eigenvalues

### Topological Network Panel
SVG-based network visualization:
- Alice and Bob as primary nodes
- Transmission events as peripheral nodes
- Animated entanglement wave between endpoints
- Real-time phase-based connection opacity

## Dialogs

### Prime Explorer
Interactive spiral visualization of all available split primes:
- Click to select Alice's prime
- Right-click to select Bob's prime
- Gaussian factorization table
- Prime properties (mod 12, quadratic residue)

### Topology View
Three visualization modes:
1. **Network Graph**: Quaternion components as intermediate nodes
2. **Fiber Bundle**: 3D-projected fiber strands with phase coloring
3. **Phase Space**: Trajectory in (φ₁, φ₂) space

### Advanced Controls
Extended parameter configuration:
- Phase threshold (ε)
- Twist coupling (γ)
- Decoherence rate
- Coupling strength
- Phase noise
- Measurement basis selection
- Preset management (save/load custom configurations)

## Projection Operators

### Symbolic Collapse
```javascript
const projectState = (prime, state) => {
  const eigenvalue = Math.sqrt(prime.p);
  const sign = Math.random() > 0.5 ? 1 : -1;
  
  return {
    eigenvalue: sign * eigenvalue,
    collapsedState: {
      quaternion: prime.quaternion,
      phase: state.phase,
      amplitude: 1,
      blochVector: prime.blochVector
    },
    symbolicMeaning: deriveSymbol(prime, sign * eigenvalue)
  };
};
```

### Eigenvalue Interpretation
The projection returns $\pm\sqrt{p}$:
- Positive: Constructive resonance
- Negative: Destructive resonance

## Configuration Presets

Built-in configurations for different scenarios:

| Preset | Alice | Bob | γ | ε |
|--------|-------|-----|---|---|
| Minimal Entanglement | 13 | 37 | 0.1 | 0.1 |
| Strong Coupling | 13 | 37 | 0.9 | 0.1 |
| High Tolerance | 13 | 37 | 0.5 | 0.4 |
| Eisenstein Focus | 37 | 61 | 0.6 | 0.15 |

## Implementation Details

### Available Split Primes
Primes $p \equiv 1 \pmod{12}$:
```javascript
const SPLIT_PRIMES = [13, 37, 61, 73, 97, 109, 157, 181, 193, 229, ...];
```

### State Types
```typescript
interface SplitPrime {
  p: number;
  gaussian: { a: number; b: number; norm: number };
  eisenstein: { c: number; d: number; cPrime: number; dPrime: number };
  quaternion: { a: number; b: number; c: number; d: number };
  blochVector: [number, number, number];
}

interface EntangledPair {
  alice: SplitPrime;
  bob: SplitPrime;
  twistCoupling: number;
  compositeHamiltonian: Quaternion;
  phaseDifference: number;
  isSynchronized: boolean;
  correlationStrength: number;
}
```

### System Status Footer
Real-time metrics display:
- CPU utilization
- Memory usage
- TX/RX rates
- Security status
- Uptime counter

## Usage Tips

1. **Start with low γ**: Observe natural phase drift
2. **Increase twist coupling**: Watch synchronization emerge
3. **Monitor entropy**: Lower entropy indicates stronger entanglement
4. **Use Prime Explorer**: Experiment with different prime pairs
5. **Try presets**: Compare behavior across configurations
6. **Watch the network**: Transmission nodes show communication history
7. **Explore Topology View**: Visualize the fiber bundle structure

## Theoretical Background

This app is inspired by:
- Quaternionic quantum mechanics (Adler, 1995)
- Number-theoretic entanglement analogies
- Kuramoto synchronization models
- Algebraic number theory (Gaussian/Eisenstein integers)

The split prime criterion ensures rich algebraic structure, allowing quaternionic embeddings that capture both Gaussian and Eisenstein factorizations in a unified framework.
