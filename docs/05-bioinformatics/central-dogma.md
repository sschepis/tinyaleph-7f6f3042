# Central Dogma

TinyAleph models the central dogma of molecular biology: DNA → RNA → Protein.

## Overview

```
DNA ──transcription──→ RNA ──translation──→ Protein
         ↑
    replication
```

## Transcription

DNA is transcribed to mRNA:

```javascript
import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const bio = new BioinformaticsBackend();

// Template strand to mRNA
const dna = 'ATGCGATCGATCGATCG';
const mrna = bio.transcribe(dna);
// Returns: 'AUGCGAUCGAUCGAUCG'
// Note: T → U substitution
```

### Prime Transformation
```
DNA prime (T=7) → RNA prime (U=7)
```
Same prime preserves information.

## Translation

mRNA is translated to protein:

```javascript
// mRNA to amino acid sequence
const mrna = 'AUGUUUAAGUGA';
const protein = bio.translate(mrna);
// Returns: 'Met-Phe-Lys-Stop' or 'MFK*'

// With reading frame
const protein_frame2 = bio.translate(mrna, { frame: 1 });
```

### Codon to Amino Acid

| Codon | Amino Acid | Single Letter | Prime Product |
|-------|------------|---------------|---------------|
| AUG | Methionine | M | 2×7×5 = 70 |
| UUU | Phenylalanine | F | 7×7×7 = 343 |
| AAG | Lysine | K | 2×2×5 = 20 |
| UGA | Stop | * | 7×5×2 = 70 |

## Reading Frames

Six possible reading frames (3 forward, 3 reverse):

```javascript
// Get all reading frames
const frames = bio.allReadingFrames(sequence);
// Returns array of 6 translations

// Find longest ORF
const longestORF = bio.findLongestORF(sequence);
```

## Start and Stop Codons

| Type | Codons | Prime Products |
|------|--------|----------------|
| Start | AUG | 70 |
| Stop | UAA, UAG, UGA | 98, 70, 70 |

## Protein Properties

```javascript
// Calculate molecular weight
const mw = bio.molecularWeight(protein);

// Calculate isoelectric point
const pI = bio.isoelectricPoint(protein);

// Get hydrophobicity profile
const hydro = bio.hydrophobicityProfile(protein);
```

## Amino Acid Properties

| Amino Acid | Letter | Hydrophobicity | Charge | Prime |
|------------|--------|----------------|--------|-------|
| Alanine | A | Hydrophobic | Neutral | 2 |
| Arginine | R | Hydrophilic | + | 3 |
| Asparagine | N | Hydrophilic | Neutral | 5 |
| Aspartic Acid | D | Hydrophilic | - | 7 |
| Cysteine | C | Hydrophobic | Neutral | 11 |
| ... | ... | ... | ... | ... |

## Prime Representation

### DNA Strand
```javascript
const dnaStrands = {
  template: bio.encode(templateStrand),
  coding: bio.encode(codingStrand)
};
// Complementary strands have related prime structures
```

### RNA
```javascript
const rnaEncoding = bio.encodeRNA(mrna);
// U uses same prime as T (structural similarity)
```

### Protein
```javascript
const proteinEncoding = bio.encodeProtein(sequence);
// Each amino acid maps to unique prime
```

## Mutations

### Point Mutations
```javascript
// Synonymous (silent) mutation
const mutant = bio.mutate(sequence, { position: 10, to: 'C' });
const effect = bio.classifyMutation(original, mutant);
// Returns: 'synonymous' | 'missense' | 'nonsense'
```

### Prime Impact
Mutations change the prime signature:
```javascript
const originalPrime = bio.primeSignature(original);
const mutantPrime = bio.primeSignature(mutant);
const impact = bio.primeDistance(originalPrime, mutantPrime);
```

## Visualization

### ORF Viewer
```javascript
<ORFViewer sequence={sequence} minLength={100} />
```

### Translation Table
```javascript
<TranslationTable mrna={mrna} showPrimes={true} />
```

## Applications

### 1. Gene Finding
```javascript
const genes = bio.predictGenes(genomicSequence);
// Returns putative gene locations
```

### 2. Codon Optimization
```javascript
const optimized = bio.optimizeCodons(protein, organism='E.coli');
// Returns DNA optimized for expression
```

### 3. Expression Analysis
```javascript
const expression = bio.analyzeExpression(mrnaLevels);
// Prime-based expression pattern analysis
```
