# Concept Derivation

TinyAleph can automatically discover new concepts by combining existing semantic primes.

## The Derivation Engine

The Semantic Prime Mapper expands meaning through:
1. **Fusion**: Combining primes to create new meanings
2. **Inference**: Deriving relationships from patterns
3. **Validation**: Checking coherence of derived concepts

## Fusion Process

Two or more primes fuse when their combination yields coherent meaning:

```javascript
import { SemanticPrimeMapper } from '@aleph-ai/tinyaleph';

const mapper = new SemanticPrimeMapper();

// Register base meanings
mapper.setMeaning(2, 'existence');
mapper.setMeaning(3, 'motion');
mapper.setMeaning(5, 'quality');

// Fusion creates new meaning
// existence + motion = becoming
mapper.fuse([2, 3], 'becoming', 0.85);
```

## Coherence Threshold

Derivations only persist if coherence exceeds threshold:

$$\text{coherence} = \frac{\langle \phi_{\text{derived}} | \phi_{\text{sources}} \rangle}{|\phi_{\text{derived}}| \cdot |\phi_{\text{sources}}|}$$

```javascript
const MIN_COHERENCE = 0.7;

if (derivation.coherence > MIN_COHERENCE) {
  mapper.addDerived(derivation);
}
```

## Derivation Chains

Complex concepts emerge through multiple derivation steps:

```
existence (2) + motion (3) → becoming (6)
becoming (6) + quality (5) → growth (30)
growth (30) + negation (7) → decay (210)
```

## Learning Chaperone

The AI-powered Learning Chaperone discovers relationships:

```javascript
import { LearningEngine } from '@aleph-ai/tinyaleph';

const learner = new LearningEngine({
  model: 'gemini-3-pro-preview',
  coherenceThreshold: 0.7
});

// Identify knowledge gaps
const gaps = learner.findGaps(currentKnowledge);

// Query AI for relationships
const discoveries = await learner.discover(gaps);

// Validate and integrate
for (const discovery of discoveries) {
  if (discovery.coherence > 0.7) {
    mapper.addDerived(discovery);
  }
}
```

## Triadic Fusion

Special case: three-way combination for complex concepts:

```javascript
// subject + verb + object pattern
const action = mapper.triadicFuse(
  agent,    // Who
  process,  // Does what
  patient   // To whom/what
);
```

## Visualization

### Triadic Fusion Graph
- Nodes: Source primes and derived concept
- Edges: Contribution weights
- Colors: Coherence levels

### Learned Relationships Graph
- Force-directed layout
- Interactive exploration
- Derivation chain highlighting

## Active Learning

The system actively seeks new knowledge:

```javascript
// Autonomous expansion cycle
async function expandKnowledge() {
  while (true) {
    const frontier = mapper.getFrontier();
    const candidates = await learner.explore(frontier);
    
    for (const candidate of candidates) {
      if (isCoherent(candidate)) {
        mapper.integrate(candidate);
      }
    }
    
    await sleep(EXPANSION_INTERVAL);
  }
}
```

## Persistence

Derived meanings persist across sessions:

```javascript
// Save to localStorage
mapper.save('semantic-knowledge');

// Restore on load
mapper.load('semantic-knowledge');
```

## Quality Metrics

### Precision
How many derivations are semantically valid:

$$\text{Precision} = \frac{\text{Valid derivations}}{\text{Total derivations}}$$

### Coverage
How much of semantic space is mapped:

$$\text{Coverage} = \frac{\text{Derived concepts}}{\text{Possible combinations}}$$

### Coherence Distribution
Distribution of coherence scores should be high:

```javascript
const coherences = mapper.getAllCoherences();
const mean = average(coherences);
const std = standardDeviation(coherences);
// Good: mean > 0.8, std < 0.15
```

## Applications

### 1. Ontology Building
Automatically construct semantic hierarchies:
```javascript
const ontology = mapper.buildOntology();
// Returns tree of derived concepts
```

### 2. Analogy Completion
Find missing fourth term:
```javascript
// A:B :: C:?
const D = mapper.completeAnalogy(A, B, C);
```

### 3. Concept Blending
Create novel concepts from existing ones:
```javascript
const blend = mapper.blend('horse', 'bird');
// Might derive: 'pegasus', 'winged-creature'
```
