# Protein Folding

TinyAleph models protein structure using prime-based representations of amino acid interactions.

## Protein Structure Levels

### Primary Structure
Linear sequence of amino acids:
```javascript
const sequence = 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSH';
const encoded = bio.encodeProtein(sequence);
```

### Secondary Structure
Local folding patterns:
- **α-helix**: Right-handed coil
- **β-sheet**: Extended strands
- **Turn**: Direction changes
- **Coil**: Unstructured regions

```javascript
const secondary = bio.predictSecondaryStructure(sequence);
// Returns: 'HHHHHHCCCCEEEEEECCHHHHHHCCCEEEEEECCC...'
// H=helix, E=strand, C=coil
```

### Tertiary Structure
3D arrangement of the entire chain.

### Quaternary Structure
Multi-chain complexes.

## Amino Acid Properties

| Property | Description | Range |
|----------|-------------|-------|
| Hydrophobicity | Water aversion | -4.5 to +4.5 |
| Charge | Electric charge | -1, 0, +1 |
| Size | Side chain volume | Small to Large |
| Flexibility | Backbone freedom | Rigid to Flexible |

## Hydrophobicity Profile

```javascript
const profile = bio.hydrophobicityProfile(sequence);
// Returns array of hydrophobicity values

// Kyte-Doolittle scale
const KD_SCALE = {
  'A': 1.8, 'R': -4.5, 'N': -3.5, 'D': -3.5,
  'C': 2.5, 'E': -3.5, 'Q': -3.5, 'G': -0.4,
  'H': -3.2, 'I': 4.5, 'L': 3.8, 'K': -3.9,
  'M': 1.9, 'F': 2.8, 'P': -1.6, 'S': -0.8,
  'T': -0.7, 'W': -0.9, 'Y': -1.3, 'V': 4.2
};
```

## Folding Energy

The free energy of folding:

$$\Delta G = \Delta H - T\Delta S$$

Prime-based energy approximation:
```javascript
const foldingEnergy = bio.estimateFoldingEnergy(sequence);
// Negative = stable fold
// Positive = unfavorable
```

## Contact Maps

Residue-residue contacts in 3D:

```javascript
const contacts = bio.predictContacts(sequence);
// Returns matrix of contact probabilities

// Visualization
<ContactMap sequence={sequence} contacts={contacts} />
```

## Prime-Based Structure Prediction

### Coarse-Grained Model
```javascript
// Each residue as a prime with properties
const model = bio.coarseGrainModel(sequence);

// Simulate folding
const trajectory = bio.simulateFolding(model, {
  temperature: 300,
  steps: 10000
});
```

### Energy Function
```javascript
// Prime-based potential
function primePotential(residue1, residue2, distance) {
  const p1 = aminoAcidPrime(residue1);
  const p2 = aminoAcidPrime(residue2);
  
  // Hydrophobic interaction
  const hydro = hydrophobicity(p1) * hydrophobicity(p2);
  
  // Electrostatic
  const elec = charge(p1) * charge(p2) / distance;
  
  return hydro + elec;
}
```

## Molecular Binding

Predict binding affinity:

```javascript
const affinity = bio.predictBinding(protein, ligand);
// Returns binding free energy estimate

// Binding site prediction
const sites = bio.predictBindingSites(protein);
// Returns probable binding pocket locations
```

## Visualization

### Hydrophobicity Plot
```javascript
<HydrophobicityPlot 
  sequence={sequence}
  windowSize={9}
  scale="kyte-doolittle"
/>
```

### Secondary Structure Diagram
```javascript
<SecondaryStructure 
  sequence={sequence}
  prediction={secondary}
/>
```

## Applications

### 1. Transmembrane Prediction
```javascript
const tmHelices = bio.predictTransmembrane(sequence);
// Returns predicted membrane-spanning regions
```

### 2. Domain Detection
```javascript
const domains = bio.detectDomains(sequence);
// Returns structural domains
```

### 3. Stability Prediction
```javascript
const stability = bio.predictStability(sequence, mutations);
// Returns ΔΔG for mutations
```

## Prime Signatures for Folds

Common folds have characteristic prime patterns:

| Fold | Description | Prime Pattern |
|------|-------------|---------------|
| TIM Barrel | α/β barrel | Alternating high/low |
| Immunoglobulin | β sandwich | Paired primes |
| Rossmann | α/β/α | Gradient pattern |
| Helix Bundle | All-α | Consecutive high |

## Machine Learning Integration

```javascript
// Use prime features for ML
const features = bio.extractPrimeFeatures(sequence);
// Returns: [hydro_mean, charge_sum, size_variance, ...]

// Feed to predictor
const structure = model.predict(features);
```
