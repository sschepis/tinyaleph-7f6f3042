# Archetypal Databases

TinyAleph includes databases of universal symbolic patterns from mythology, psychology, and esoteric traditions.

## Jungian Archetypes

Carl Jung identified universal patterns in the collective unconscious:

| Archetype | Description | Keywords | Prime Signature |
|-----------|-------------|----------|-----------------|
| Hero | Courage, transformation | brave, quest, victory | [2, 7, 11] |
| Shadow | Repressed aspects | dark, hidden, fear | [3, 13, 23] |
| Anima/Animus | Contrasexual soul | feminine, masculine, union | [5, 17, 29] |
| Self | Wholeness, integration | center, unity, mandala | [7, 19, 31] |
| Wise Old Man | Wisdom, guidance | sage, mentor, knowledge | [11, 23, 37] |
| Great Mother | Nurturing, nature | earth, birth, abundance | [13, 29, 41] |
| Trickster | Chaos, transformation | fool, change, boundary | [17, 31, 43] |
| Child | Innocence, potential | new, pure, beginning | [19, 37, 47] |

## Archetype Detection

```javascript
import { ArchetypeAnalyzer } from '@aleph-ai/tinyaleph';

const analyzer = new ArchetypeAnalyzer();

// Analyze text for archetypal patterns
const result = analyzer.analyze("The hero ventured into the dark forest");

// Returns activated archetypes with strengths
// { hero: 0.85, shadow: 0.6, threshold: 0.4 }
```

## I-Ching Trigrams

The eight trigrams encode fundamental patterns:

| Trigram | Name | Image | Lines | Prime |
|---------|------|-------|-------|-------|
| ☰ | Qian | Heaven | ━ ━ ━ | 2 |
| ☱ | Dui | Lake | ━ ━ ━̶ | 3 |
| ☲ | Li | Fire | ━ ━̶ ━ | 5 |
| ☳ | Zhen | Thunder | ━̶ ━ ━ | 7 |
| ☴ | Xun | Wind | ━ ━̶ ━̶ | 11 |
| ☵ | Kan | Water | ━̶ ━ ━̶ | 13 |
| ☶ | Gen | Mountain | ━̶ ━̶ ━ | 17 |
| ☷ | Kun | Earth | ━̶ ━̶ ━̶ | 19 |

## Hexagram Mapping

Entropy maps to hexagram lines:
- High entropy → broken line (yin)
- Low entropy → solid line (yang)

```javascript
import { entropyToHexagram } from '@aleph-ai/tinyaleph';

const entropies = [0.2, 0.8, 0.3, 0.7, 0.1, 0.9];
const hexagram = entropyToHexagram(entropies);
// Returns: "━ ━̶ ━ ━̶ ━ ━̶" (hexagram pattern)
```

## Tarot Correspondences

Major Arcana map to semantic states:

| Card | Number | Hebrew Letter | Element | Meaning |
|------|--------|---------------|---------|---------|
| Fool | 0 | Aleph | Air | Potential |
| Magician | 1 | Beth | Mercury | Will |
| High Priestess | 2 | Gimel | Moon | Intuition |
| Empress | 3 | Daleth | Venus | Abundance |
| Emperor | 4 | Heh | Aries | Structure |
| ... | ... | ... | ... | ... |

## Symbol Database

```javascript
import { SYMBOL_DATABASE } from '@aleph-ai/tinyaleph';

// Lookup symbol meaning
const sun = SYMBOL_DATABASE.get('sun');
// { meaning: 'consciousness, vitality', primes: [2, 7, 13] }

// Find symbols by prime
const symbols = SYMBOL_DATABASE.findByPrime(7);
// ['sun', 'gold', 'lion', 'king']
```

## Archetypal Resonance

Calculate how strongly a semantic state resonates with archetypes:

```javascript
import { archetypeResonance } from '@aleph-ai/tinyaleph';

const state = conceptState(['courage', 'journey', 'transformation']);
const resonance = archetypeResonance(state);

// Returns: { hero: 0.9, threshold: 0.7, shadow: 0.3 }
```

## Applications

### 1. Narrative Analysis
```javascript
// Identify story patterns
const story = analyzeNarrative(text);
// Returns: Hero's Journey stages, active archetypes
```

### 2. Dream Interpretation
```javascript
// Map dream symbols to archetypes
const dream = interpretDream(dreamText);
// Returns: Archetypal themes, psychological meaning
```

### 3. Consciousness Resonator
The app uses archetypes for perspective synthesis:
- Detect archetypal patterns in conversation
- Map to I-Ching hexagrams
- Visualize in Symbol Resonance panel

## Cultural Universals

Archetypes appear across cultures:
- **Hero**: Hercules, Gilgamesh, Arjuna
- **Great Mother**: Isis, Demeter, Kuan Yin
- **Trickster**: Loki, Coyote, Anansi
- **Wise Old Man**: Merlin, Gandalf, Obi-Wan

## Integration with Prime Semantics

Each archetype has a prime signature that:
- Enables arithmetic on archetypes
- Measures archetypal similarity
- Supports composition and blending
