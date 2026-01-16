# DNA Encoding

TinyAleph provides tools for encoding DNA sequences using prime number representations.

## Nucleotide to Prime Mapping

The four nucleotides map to the first four primes:

| Nucleotide | Symbol | Prime | Binary |
|------------|--------|-------|--------|
| Adenine | A | 2 | 00 |
| Cytosine | C | 3 | 01 |
| Guanine | G | 5 | 10 |
| Thymine | T | 7 | 11 |

For RNA, Uracil replaces Thymine:
| Uracil | U | 7 | 11 |

## Encoding Functions

```javascript
import { BioinformaticsBackend } from '@aleph-ai/tinyaleph';

const bio = new BioinformaticsBackend();

// Encode DNA sequence
const sequence = 'ATGCGATCGA';
const encoded = bio.encodeDNA(sequence);
// Returns prime-based representation

// Decode back to nucleotides
const decoded = bio.decodeDNA(encoded);
// Returns: 'ATGCGATCGA'
```

## Codon Encoding

Three nucleotides form a codon (encoding one amino acid):

```javascript
// Codon as product of three primes
const codon_ATG = 2 * 7 * 5; // A=2, T=7, G=5 = 70
const codon_CAT = 3 * 2 * 7; // C=3, A=2, T=7 = 42

// Lookup amino acid
const aminoAcid = bio.codonToAminoAcid('ATG');
// Returns: 'Met' (Methionine, start codon)
```

## Genetic Code Table

The standard genetic code maps 64 codons to 20 amino acids:

```javascript
const GENETIC_CODE = {
  'TTT': 'Phe', 'TTC': 'Phe',
  'TTA': 'Leu', 'TTG': 'Leu',
  'TCT': 'Ser', 'TCC': 'Ser', 'TCA': 'Ser', 'TCG': 'Ser',
  'TAT': 'Tyr', 'TAC': 'Tyr',
  'TAA': 'Stop', 'TAG': 'Stop',
  'TGT': 'Cys', 'TGC': 'Cys',
  'TGA': 'Stop',
  'TGG': 'Trp',
  // ... remaining codons
  'ATG': 'Met', // Start codon
};
```

## Sequence Analysis

### GC Content
```javascript
const gcContent = bio.gcContent('ATGCGATCGA');
// Returns: 0.5 (50% G+C)
```

### Complement
```javascript
const complement = bio.complement('ATGC');
// Returns: 'TACG'

const reverseComplement = bio.reverseComplement('ATGC');
// Returns: 'GCAT'
```

### Find ORFs (Open Reading Frames)
```javascript
const orfs = bio.findORFs(sequence, { minLength: 100 });
// Returns: [{ start: 0, end: 300, frame: 0 }, ...]
```

## Prime Properties

DNA encoding preserves mathematical structure:

### Uniqueness
Each sequence has a unique prime factorization:
```javascript
const sig1 = bio.primeSignature('ATGC');
const sig2 = bio.primeSignature('GCTA');
// Different signatures for different sequences
```

### Composition
```javascript
// Concatenation = multiplication
const seq1 = bio.encode('ATG');
const seq2 = bio.encode('CAT');
const combined = seq1 * seq2;
// Equivalent to bio.encode('ATGCAT')
```

### Similarity
```javascript
// Shared primes indicate similarity
const similarity = bio.sequenceSimilarity(seq1, seq2);
```

## Restriction Enzymes

Find recognition sites:

```javascript
const sites = bio.findRestrictionSites(sequence, 'EcoRI');
// EcoRI recognizes: GAATTC
// Returns: [{ position: 45, enzyme: 'EcoRI' }, ...]
```

## PCR Simulation

```javascript
const product = bio.simulatePCR({
  template: sequence,
  forwardPrimer: 'ATGCGA',
  reversePrimer: 'TCGATC',
  cycles: 30
});
// Returns amplified region
```

## Visualization

### Gel Electrophoresis
```javascript
// Visualize fragment sizes
<GelElectrophoresis fragments={fragments} ladder="1kb" />
```

### Restriction Map
```javascript
// Show enzyme cut sites
<RestrictionMap sequence={sequence} enzymes={['EcoRI', 'BamHI']} />
```

## Applications

### 1. Sequence Hashing
```javascript
const hash = bio.semanticHash(sequence);
// Consistent prime-based hash for lookup
```

### 2. Motif Finding
```javascript
const motifs = bio.findMotifs(sequence, pattern);
// Returns all matching positions
```

### 3. Evolutionary Distance
```javascript
const distance = bio.evolutionaryDistance(seq1, seq2);
// Based on prime signature divergence
```
