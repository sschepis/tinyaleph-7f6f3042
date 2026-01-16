# Consciousness Resonator

The Consciousness Resonator is a multi-perspective AI chat interface that synthesizes responses through quantum-like semantic processing.

## Overview

**Route**: `/consciousness-resonator`

The Consciousness Resonator demonstrates:
- Multi-perspective response synthesis
- Quantum semantic metrics
- Archetypal pattern detection
- I-Ching hexagram mapping

## Perspective Nodes

Six perspectives can be multi-selected:

| Perspective | Focus | Keywords |
|-------------|-------|----------|
| Philosopher | Wisdom, ethics | truth, meaning, existence |
| Scientist | Evidence, method | data, hypothesis, experiment |
| Artist | Creativity, beauty | expression, form, aesthetic |
| Mystic | Transcendence | unity, divine, consciousness |
| Coder | Implementation | logic, algorithm, system |
| Mediator | Integration | balance, synthesis, harmony |

```javascript
// Select multiple perspectives
const [perspectives, setPerspectives] = useState(['philosopher', 'scientist']);
```

## Resonance Base Layer

The visualization shows:
- Active perspective nodes
- Resonance connections between them
- Quantum probability distributions

## Quantum Metrics

### Archetype Position
Calculated from prime frequencies:
- **Universal** (left): Abstract, archetypal patterns
- **Specific** (right): Concrete, particular instances

### Prime Connections
Count of activated semantic primes in the conversation.

### Entropy Level
Information-theoretic measure of semantic uncertainty.

## Symbol Resonance

Analyzes conversation for symbolic patterns:

### Jungian Archetypes
```javascript
const ARCHETYPES = ['hero', 'shadow', 'anima', 'animus', 'self', 
                    'wise_old_man', 'great_mother', 'trickster', 'child'];

// Detection based on keywords and prime frequencies
const detected = detectArchetypes(conversation);
```

### I-Ching Hexagrams
Entropy maps to hexagram lines:
```javascript
function entropyToLine(entropy) {
  return entropy > 0.5 ? '━̶' : '━'; // broken or solid
}

const hexagram = entropies.map(entropyToLine);
```

### Tarot Correspondences
Major Arcana mapped based on semantic content.

## Chat Interface

### Message Rendering
Uses unified `AssistantMessage` component:
- Markdown with GFM support
- KaTeX math rendering (`$` and `$$`)
- Syntax-highlighted code blocks
- Copy-to-clipboard functionality

### Conversation Starters
Six preset prompts guide exploration:
- "What is the nature of consciousness?"
- "How do we know what we know?"
- "What is the relationship between mind and matter?"
- etc.

### New Conversation
Resets all quantum, semantic, and archetype states while preserving perspective selections.

## Architecture

### Quantum Analyzer
```javascript
import { QuantumAnalyzer } from '@/lib/consciousness-resonator';

const analyzer = new QuantumAnalyzer();

// Analyze conversation state
const metrics = analyzer.analyze(messages);
// Returns: { archetypePosition, primeConnections, entropy, hexagram }
```

### Archetype Analyzer
```javascript
import { ArchetypeAnalyzer } from '@/lib/consciousness-resonator';

const archetypes = ArchetypeAnalyzer.detect(text);
// Returns: { hero: 0.8, shadow: 0.3, ... }
```

### Sonic Engine
Audio feedback for resonance states:
```javascript
const sonic = new SonicEngine();
sonic.playResonance(frequency, amplitude);
```

## Edge Function

**Endpoint**: `consciousness-resonator`

```javascript
const response = await supabase.functions.invoke('consciousness-resonator', {
  body: {
    messages: conversation,
    perspectives: selectedPerspectives
  }
});
```

## Visualization Components

- **QuantumBackground**: Animated particle field
- **PerspectiveNodes**: Interactive node selection
- **WaveformVisualizer**: Audio-reactive display
- **SymbolResonanceViz**: Archetype activation chart
- **FieldIntegration**: Semantic field overlay

## Configuration

### Perspective Weights
```javascript
const PERSPECTIVE_WEIGHTS = {
  philosopher: 1.0,
  scientist: 1.0,
  artist: 0.8,
  mystic: 0.8,
  coder: 0.9,
  mediator: 1.2  // Slightly higher for integration
};
```

### Entropy Thresholds
```javascript
const LOW_ENTROPY = 0.3;   // Focused, coherent
const HIGH_ENTROPY = 0.7;  // Diffuse, exploratory
```

## Usage Tips

1. **Select multiple perspectives**: Richer synthesis emerges
2. **Watch the metrics**: They reveal semantic dynamics
3. **Use conversation starters**: Good prompts for exploration
4. **Observe the hexagram**: Entropy patterns become visible
5. **Check Symbol Resonance**: See which archetypes activate
