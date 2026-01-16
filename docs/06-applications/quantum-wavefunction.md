# Quantum Wavefunction Explorer

The Quantum Prime Wavefunction Explorer visualizes prime number patterns through quantum mechanical wave functions.

## Overview

**Route**: `/quantum-wavefunction`

The Quantum Wavefunction Explorer demonstrates:
- Three-component wave function model
- Riemann zero parameterization
- Prime correlation analysis
- 3D complex helix visualization

## Wave Function Components

### 1. Basic Wave
Fundamental oscillation at Riemann zero frequency:

$$\psi_{\text{basic}}(x) = e^{i t \ln x}$$

Where $t$ = Riemann zero (e.g., $\gamma_1 = 14.134...$)

### 2. Prime Resonance
Gaussian peaks at prime locations:

$$R(x) = \sum_p e^{-(x-p)^2 / 2\sigma^2}$$

### 3. Gap Modulation
Rhythm from prime spacing:

$$G(x) = \prod_p \cos\left(\frac{\pi x}{g_p}\right)$$

Where $g_p = p_{n+1} - p_n$ = gap after prime $p$.

## Complete Wave Function

$$\psi(x) = \psi_{\text{basic}}(x) \cdot (1 + V_0 R(x)) \cdot (1 + G(x)) + T(x)$$

Where:
- $V_0$ = potential strength
- $T(x)$ = quantum tunneling term

## Parameters

| Parameter | Symbol | Description | Default |
|-----------|--------|-------------|---------|
| Riemann Zero | $t$ | Frequency parameter | 14.135 |
| Potential | $V_0$ | Prime resonance strength | 0.1 |
| Epsilon | $\epsilon$ | Tunneling/regularization | 0.2 |
| Beta | $\beta$ | Spectral parameter | 0.1 |
| Width | $\sigma$ | Gaussian resonance width | 0.5 |

## Riemann Zero Presets

| Zero | Value | Character |
|------|-------|-----------|
| γ₁ | 14.135 | First, fundamental |
| γ₂ | 21.022 | Wider oscillation |
| γ₃ | 25.011 | Complex pattern |
| γ₄ | 30.425 | Richer structure |
| γ₅ | 32.935 | Fine detail |

## Visualizations

### 2D Wavefunction Plot
- Real and imaginary parts
- Magnitude envelope
- Prime markers on x-axis

### 3D Complex Helix
Using React Three Fiber:
- x-axis: Input value
- y-axis: Real part
- z-axis: Imaginary part
- Color: Phase angle

### Phase Portrait
Color-coded phase map:
$$\text{arg}(\psi(x)) \rightarrow \text{HSL hue}$$

### Fourier Spectrum
Frequency analysis of $|\psi(x)|$:
- Reveals periodic structures
- Shows dominant frequencies
- Spectral peaks at prime-related values

### Fourier Spectrogram
Tracks frequency shifts across Riemann zeros:
- x-axis: Riemann zero
- y-axis: Frequency
- Color: Amplitude

## Correlation Analysis

### Wave-Prime Correlation
Point-biserial correlation between:
- $|\psi(x)|$ (continuous)
- isPrime(x) (binary)

### Resonance Correlation
Correlation between:
- $R(x)$ resonance values
- Prime indicator function

### Significance Levels
- **Low**: $|r| < 0.3$
- **Medium**: $0.3 \leq |r| < 0.5$
- **High**: $0.5 \leq |r| < 0.7$
- **Very High**: $|r| \geq 0.7$

## Quantum Tunneling

Tunneling amplitude between prime pairs:

$$T(x) = \sum_{p_1 < p_2} \frac{e^{-\beta(p_2 - p_1)}}{\sqrt{|x - p_1| + \epsilon} \cdot \sqrt{|x - p_2| + \epsilon}}$$

## Implementation

### Engine Functions
```javascript
import { analyzeSpectrum, getWaveAtPrimes } from '@/lib/quantum-wavefunction';

// Full spectrum analysis
const analysis = analyzeSpectrum(0, 100, 1000, params);
// Returns: { points, stats, primes, maxMagnitude }

// Wave values at primes only
const primeValues = getWaveAtPrimes(params, 100);
// Returns: [{ prime, magnitude, phase }, ...]
```

### Parameter Controls
```javascript
<ParameterControls
  params={params}
  onParamsChange={setParams}
  riemannZeros={RIEMANN_ZEROS}
/>
```

## Additional Panels

### Prime Gap Analysis
Visualizes gap distribution and its effect on modulation.

### Wavefunction Comparison
Overlay wavefunctions from different Riemann zeros.

### Prime Wave Table
Numerical values at each prime location.

## Usage Tips

1. **Start with γ₁**: The first Riemann zero shows clearest patterns
2. **Adjust V₀**: Higher values enhance prime peaks
3. **Watch correlations**: Look for significance indicators
4. **Compare zeros**: Use Comparison panel to see evolution
5. **Explore 3D**: Rotate the helix to see phase structure
