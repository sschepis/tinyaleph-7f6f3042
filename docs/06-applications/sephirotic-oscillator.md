# Sephirotic Oscillator

The Sephirotic Oscillator models the Kabbalistic Tree of Life as a system of coupled resonators.

## Overview

**Route**: `/sephirotic-oscillator`

The Sephirotic Oscillator demonstrates:
- Cavity resonator physics
- Hebrew letter waveguides
- Gematria-based frequencies
- Real-time energy flow visualization

## The Tree of Life

### 10 Sephiroth (Nodes)

| Sephirah | Meaning | Pillar | Q-Factor |
|----------|---------|--------|----------|
| Kether | Crown | Middle | Very High |
| Chokmah | Wisdom | Right | High |
| Binah | Understanding | Left | High |
| Chesed | Mercy | Right | Medium |
| Geburah | Strength | Left | Medium |
| Tiphareth | Beauty | Middle | High |
| Netzach | Victory | Right | Medium |
| Hod | Splendor | Left | Medium |
| Yesod | Foundation | Middle | Medium |
| Malkuth | Kingdom | Middle | Low |

### 22 Paths (Edges)

Each path corresponds to a Hebrew letter with specific properties:

| Letter | Gematria | Element | Path |
|--------|----------|---------|------|
| Aleph | 1 | Air | Kether-Chokmah |
| Beth | 2 | Mercury | Kether-Binah |
| Gimel | 3 | Moon | Kether-Tiphareth |
| Daleth | 4 | Venus | Chokmah-Binah |
| ... | ... | ... | ... |

## Physics Model

### Cavity Resonators
Each Sephirah acts as a resonant cavity:

```javascript
const resonator = {
  frequency: baseFreq * gematriaValue,
  qFactor: pillarQFactor[pillar],
  impedance: elementalImpedance[element],
  energy: 0
};
```

### Standing Wave Modes
```javascript
const mode = n => (n * waveVelocity) / (2 * cavityLength);
```

### Energy Decay
```javascript
// Q-factor determines decay rate
dE/dt = -ω * E / Q

// High Q = slow decay, sustained resonance
// Low Q = fast decay, quick damping
```

## Waveguide Properties

Paths transmit energy based on:

### Impedance Matching
```javascript
const transmission = 1 - ((Z1 - Z2) / (Z1 + Z2)) ** 2;
```

### Resonant Frequency
```javascript
const pathFreq = letterGematria * baseUnit;
```

### Elemental Association
- **Fire letters**: High energy, fast transmission
- **Water letters**: Absorptive, slow transmission
- **Air letters**: Balanced, medium transmission
- **Earth letters**: Grounding, energy sink

## User Interface

### Tree Visualization
- Nodes pulse with energy intensity
- Paths glow based on flow rate
- Hebrew letters animate on active paths
- Color-coding by elemental association

### Path Analysis Panel
- Real-time energy flow graphs
- Transmission coefficient display
- Frequency spectrum analysis

### Word Analysis Panel
- Temporal letter stream from energy dissipation
- Kabbalistic word recognition
- Gematria calculations

## Sound Design

### Pillar Waveforms
```javascript
const PILLAR_WAVEFORMS = {
  right: 'sine',      // Mercy - smooth
  left: 'square',     // Severity - sharp
  middle: 'triangle'  // Balance - intermediate
};
```

### Frequency Mapping
```javascript
const freq = baseFreq * sephirahGematria;
// Kether (1) = 110 Hz
// Malkuth (10) = 1100 Hz
```

## Implementation

### Oscillator Engine
```javascript
import { OscillatorEngine } from '@/lib/sephirotic-oscillator';

const engine = new OscillatorEngine();

// Excite a Sephirah
engine.excite('tiphareth', 1.0);

// Step simulation
engine.step(dt);

// Get current state
const energies = engine.getEnergies();
const flows = engine.getFlows();
```

### Resonator Physics
```javascript
import { calculateTransmission } from '@/lib/sephirotic-oscillator';

const T = calculateTransmission(
  sephirah1.impedance,
  sephirah2.impedance,
  path.frequency,
  inputFrequency
);
```

## Configuration

### Fade Threshold
```javascript
const FADE_THRESHOLD = 0.01; // Energy below this triggers letter emission
```

### Time Step
```javascript
const DT = 0.016; // ~60 FPS
```

### Base Frequency
```javascript
const BASE_FREQ = 110; // A2
```

## Visualization Components

- **TreeVisualization**: Main SVG tree display
- **PathAnalysisPanel**: Energy flow analytics
- **WordAnalysisPanel**: Letter stream recognition
- **SystemMetrics**: Q-factor and impedance readouts
- **SoundControls**: Audio output settings

## Usage Tips

1. **Click nodes**: Inject energy into Sephiroth
2. **Watch paths**: Energy flows along Hebrew letter channels
3. **Listen**: Each Sephirah has a distinct tone
4. **Check Word Analysis**: Letters emerge from energy patterns
5. **Experiment**: Different starting points create different flows
