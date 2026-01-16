# Semantic Inference

TinyAleph supports multiple forms of reasoning using prime-based semantic representations.

## Inference Types

### 1. Analogical Reasoning
Find the fourth term: A:B :: C:?

```javascript
import { analogicalReason } from '@aleph-ai/tinyaleph';

// king:queen :: man:?
const result = analogicalReason('king', 'queen', 'man');
// Returns: 'woman' (or semantically similar)

// Algorithm: D = C + (B - A)
// In prime space: diff = B ⊖ A, result = C ⊕ diff
```

### 2. Semantic Entailment
Does premise entail conclusion?

```javascript
import { entails } from '@aleph-ai/tinyaleph';

const premise = encode('All birds can fly');
const conclusion = encode('Sparrows can fly');

const result = entails(premise, conclusion);
// Returns: { entails: true, confidence: 0.85 }
```

### 3. Contradiction Detection
Are two statements incompatible?

```javascript
import { contradicts } from '@aleph-ai/tinyaleph';

const s1 = encode('The ball is red');
const s2 = encode('The ball is blue');

const result = contradicts(s1, s2);
// Returns: { contradicts: true, reason: 'color conflict' }
```

## Formal Logic

### Syllogisms
```javascript
import { syllogism } from '@aleph-ai/tinyaleph';

// All A are B, All B are C ⊢ All A are C
const valid = syllogism(
  { type: 'all', subject: 'men', predicate: 'mortal' },
  { type: 'all', subject: 'Socrates', predicate: 'men' }
);
// Concludes: All Socrates are mortal
```

### Modus Ponens
```javascript
// P → Q, P ⊢ Q
const result = modusPonens(
  conditional('rain', 'wet'),
  fact('rain')
);
// Returns: fact('wet')
```

### Modus Tollens
```javascript
// P → Q, ¬Q ⊢ ¬P
const result = modusTollens(
  conditional('rain', 'wet'),
  negation('wet')
);
// Returns: negation('rain')
```

## Chain of Thought

Break complex reasoning into steps:

```javascript
import { chainOfThought } from '@aleph-ai/tinyaleph';

const problem = "If it's raining and I go outside, I'll get wet. It's raining.";
const query = "Will I get wet if I go outside?";

const chain = chainOfThought(problem, query);
// Returns: [
//   { step: 1, thought: "It's raining (given)" },
//   { step: 2, thought: "Rain + outside → wet (given)" },
//   { step: 3, thought: "Therefore, going outside → wet" }
// ]
```

## Semantic Networks

### Knowledge Graph
```javascript
import { KnowledgeGraph } from '@aleph-ai/tinyaleph';

const kg = new KnowledgeGraph();

kg.addTriple('cat', 'is-a', 'mammal');
kg.addTriple('mammal', 'has', 'fur');

// Inference: cat has fur
const inferred = kg.query('cat', 'has', '?');
// Returns: ['fur'] (via transitivity)
```

### Spreading Activation
```javascript
// Activate a concept, see what lights up
kg.activate('dog');
const activated = kg.getActivated(threshold=0.5);
// Returns: ['canine', 'pet', 'loyal', 'bark', ...]
```

## Prime Algebra for Inference

### Union (OR)
```javascript
// Concepts share primes
const bird_or_plane = union(primes('bird'), primes('plane'));
// Both can fly
```

### Intersection (AND)
```javascript
// Common properties
const common = intersection(primes('cat'), primes('dog'));
// Returns primes for: pet, mammal, four-legged
```

### Difference (NOT)
```javascript
// What makes cats different from dogs
const catness = difference(primes('cat'), primes('dog'));
// Returns primes for: feline, independent, meow
```

## Coherence-Based Reasoning

Accept inferences that maintain semantic coherence:

```javascript
import { coherentInference } from '@aleph-ai/tinyaleph';

const premises = [
  encode('Water is essential for life'),
  encode('Mars may have water')
];

const candidates = [
  encode('Mars may support life'),
  encode('Mars is made of cheese')
];

const valid = coherentInference(premises, candidates);
// Returns: ['Mars may support life']
// (Rejects incoherent conclusions)
```

## Uncertainty Reasoning

### Probabilistic Inference
```javascript
const belief = infer(evidence, hypothesis);
// Returns probability of hypothesis given evidence
```

### Fuzzy Logic
```javascript
const membership = fuzzyMembership('warm', temperature);
// Returns degree of membership in 'warm' set
```

## Visualization

The Concept Graph component shows:
- Nodes as concepts
- Edges as relationships
- Draggable for exploration
- Click to inspect sedenion states

## Applications

### 1. Question Answering
```javascript
const answer = qa.answer(context, question);
// Uses semantic inference to find answers
```

### 2. Argument Analysis
```javascript
const analysis = analyzeArgument(text);
// Returns: premises, conclusions, validity, fallacies
```

### 3. Common Sense Reasoning
```javascript
const plausible = commonsense.check('Birds can fly');
// Returns: { plausible: true, exceptions: ['penguins', 'ostriches'] }
```
