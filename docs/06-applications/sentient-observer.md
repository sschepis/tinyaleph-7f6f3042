# Sentient Observer

The Sentient Observer is an autonomous meaning-discovery environment that combines symbolic AI with language models.

## Overview

**Route**: `/sentient-observer`

The Sentient Observer demonstrates:
- Autonomous semantic expansion
- AI-powered concept derivation
- Real-time learning visualization
- Holographic memory architecture

## Core Components

### 1. Semantic Prime Mapper
Automatically expands meaning through prime fusion:

```javascript
import { SemanticPrimeMapper } from '@/lib/sentient-observer';

const mapper = getSemanticPrimeMapper();

// Set base meanings
mapper.setMeaning(2, 'existence');
mapper.setMeaning(3, 'motion');

// Automatic fusion discovers: existence + motion = becoming
mapper.startExpansion();
```

### 2. Learning Engine
AI-powered relationship discovery:

```javascript
import { LearningEngine } from '@/lib/sentient-observer';

const learner = new LearningEngine({
  coherenceThreshold: 0.7,
  model: 'gemini-3-pro-preview'
});

// Triggers when coherence > 90%
learner.on('session-start', () => {
  toast.success('Learning session started');
});
```

### 3. Symbolic Core
Chat interface for symbolic reasoning:

- Text-only input (symbols inferred automatically)
- Cognitive subtabs: Logic, Memory, Agency
- Collapse visualization for semantic resolution

### 4. Holographic Memory
Distributed memory architecture:

```javascript
import { HolographicMemory } from '@/lib/sentient-observer';

const memory = new HolographicMemory();

// Store holographically
memory.encode('The sky is blue', context);

// Retrieve by pattern
const matches = memory.retrieve('color of sky');
```

## User Interface

### Active Symbols Panel
- Displays current semantic primes
- Shows derived meanings with ✦ indicator
- Tooltip reveals derivation chain: `From: meaning(prime) + meaning(prime)`
- 2-second refresh cycle for live updates

### Learning Chaperone Panel
- Responsive height (300-600px)
- Force-directed relationship graph
- Autonomous gap identification
- Real-time discovery notifications

### Results Panel
- Triadic fusion graph
- Transition network visualization
- SMF radar chart
- Exploration heatmap

## Cognitive Tabs

### Logic Tab
Inference and reasoning visualization:
- Syllogism validation
- Modus ponens/tollens
- Chain of thought display

### Memory Tab
Holographic memory browser:
- Pattern-based retrieval
- Memory re-injection (daydream mode)
- Association strength display

### Agency Tab
Autonomous behavior monitoring:
- Goal tracking
- Action history
- Decision explanations

## Data Persistence

Knowledge persists to localStorage:

```javascript
// Automatic save on derivation
mapper.on('derivation', () => {
  localStorage.setItem('semantic-knowledge', mapper.serialize());
});

// Restore on mount
useEffect(() => {
  const saved = localStorage.getItem('semantic-knowledge');
  if (saved) mapper.deserialize(saved);
}, []);
```

## Edge Function

The Learning Chaperone uses a backend function:

**Endpoint**: `symbol-chaperone`

```javascript
// Identify knowledge gaps and discover relationships
const response = await supabase.functions.invoke('symbol-chaperone', {
  body: { symbols: currentSymbols, gaps: identifiedGaps }
});
```

## Configuration

### Coherence Threshold
```javascript
const MIN_COHERENCE = 0.7; // Derivations below this are rejected
```

### Expansion Interval
```javascript
const EXPANSION_INTERVAL = 5000; // ms between expansion cycles
```

### Learning Trigger
```javascript
const LEARNING_TRIGGER = 0.9; // Coherence threshold to start learning
```

## Visualization Components

- **TriadicFusionGraph**: Three-way prime combinations
- **TransitionNetworkGraph**: State transition visualization
- **LearnedRelationshipsGraph**: Force-directed knowledge graph
- **HolographicFieldViz**: Memory distribution display
- **ExplorationHeatmap**: Semantic space coverage

## Usage Tips

1. **Let it run**: The system discovers meaning autonomously
2. **Watch the Active Symbols**: New derivations appear with ✦
3. **Check tooltips**: Hover to see derivation chains
4. **Use the chat**: Ask questions to trigger semantic collapse
5. **Explore Memory Browser**: Enable daydream mode for re-injection
