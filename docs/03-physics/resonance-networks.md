# Resonance Networks

Resonance networks model energy transfer between coupled semantic nodes.

## Network Structure

A resonance network consists of:
- **Nodes**: Semantic units (primes, concepts)
- **Edges**: Coupling channels with transmission properties
- **Energy**: Activation levels at each node

## Standing Waves

Nodes act as resonant cavities with characteristic frequencies:

$$f_n = \frac{n v}{2L}$$

Where:
- $n$ = mode number
- $v$ = wave velocity
- $L$ = cavity length

## Q-Factor and Damping

Each node has a quality factor $Q$:

$$Q = 2\pi \frac{\text{Energy stored}}{\text{Energy lost per cycle}}$$

High Q = sharp resonance, low damping
Low Q = broad resonance, high damping

```javascript
import { ResonatorNode } from '@aleph-ai/tinyaleph';

const node = new ResonatorNode({
  frequency: 440,
  qFactor: 100,
  impedance: 1.0
});

// Inject energy
node.excite(1.0);

// Decay over time
for (let t = 0; t < 100; t++) {
  node.step(dt);
  console.log(node.energy); // Exponential decay
}
```

## Energy Transfer

Energy flows between coupled nodes:

$$P = \frac{V^2}{Z} \cdot T(\omega)$$

Where:
- $V$ = voltage (activation)
- $Z$ = impedance
- $T(\omega)$ = transmission coefficient

## Impedance Matching

Maximum energy transfer when impedances match:

$$T = 1 - \left(\frac{Z_1 - Z_2}{Z_1 + Z_2}\right)^2$$

## Sephirotic Application

The Sephirotic Oscillator models the Tree of Life as:
- **10 Sephiroth**: Resonant cavities
- **22 Paths**: Waveguides with Hebrew letter properties

```javascript
import { SephiroticOscillator } from '@aleph-ai/tinyaleph';

const tree = new SephiroticOscillator();

// Excite Kether (Crown)
tree.excite('kether', 1.0);

// Energy flows down the tree
for (let t = 0; t < 100; t++) {
  tree.step();
  console.log(tree.getEnergies());
}
```

## Path Properties

Each Hebrew letter path has:
- **Resonant frequency**: From gematria value
- **Impedance**: From elemental/planetary association
- **Bandwidth**: From letter category

| Letter | Gematria | Element | Impedance |
|--------|----------|---------|-----------|
| Aleph | 1 | Air | Low |
| Beth | 2 | Mercury | Medium |
| Gimel | 3 | Moon | Medium |
| ... | ... | ... | ... |

## Wave Equations

Energy evolution follows:

$$\frac{\partial E}{\partial t} = -\gamma E + \sum_j T_{ij} E_j$$

Where:
- $\gamma$ = damping rate
- $T_{ij}$ = transmission from node $j$ to $i$

## Visualization

### TreeVisualization
- Nodes pulse with energy
- Paths glow with flow intensity
- Hebrew letters animate on active paths

### Path Analysis Panel
- Real-time energy flow graphs
- Transmission coefficient displays
- Frequency spectrum analysis

## Applications

### 1. Semantic Spreading Activation
```javascript
// Activate a concept
network.activate('fire');

// Related concepts light up
network.step(10);
const activated = network.getActive();
// ['fire', 'heat', 'light', 'energy', ...]
```

### 2. Meaning Resonance
```javascript
// Two concepts resonate when frequencies match
const resonance = network.resonance('love', 'heart');
// High value = strong semantic connection
```

### 3. Information Routing
```javascript
// Find path of least resistance
const path = network.optimalPath('input', 'output');
// Returns sequence of nodes for meaning transfer
```
