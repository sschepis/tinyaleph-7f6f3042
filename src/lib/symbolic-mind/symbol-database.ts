import type { SymbolicSymbol } from './types';

// ============= COMPREHENSIVE SYMBOL DATABASE =============
// Symbols from multiple wisdom traditions, each with a unique prime for wave interference

export const SYMBOL_DATABASE: Record<string, SymbolicSymbol> = {
  // ============= JUNGIAN ARCHETYPES =============
  self: { id: 'self', name: 'The Self', unicode: '☯', prime: 2, category: 'archetype', culture: 'jungian', meaning: 'Wholeness and integration of consciousness' },
  shadow: { id: 'shadow', name: 'The Shadow', unicode: '🌑', prime: 3, category: 'archetype', culture: 'jungian', meaning: 'Hidden aspects of the psyche' },
  anima: { id: 'anima', name: 'Anima', unicode: '🌙', prime: 5, category: 'archetype', culture: 'jungian', meaning: 'Feminine aspect within' },
  animus: { id: 'animus', name: 'Animus', unicode: '☀', prime: 7, category: 'archetype', culture: 'jungian', meaning: 'Masculine aspect within' },
  hero: { id: 'hero', name: 'The Hero', unicode: '⚔', prime: 11, category: 'archetype', culture: 'jungian', meaning: 'Courage and transformation through trial' },
  sage: { id: 'sage', name: 'The Sage', unicode: '📚', prime: 13, category: 'archetype', culture: 'jungian', meaning: 'Wisdom and understanding' },
  trickster: { id: 'trickster', name: 'The Trickster', unicode: '🃏', prime: 17, category: 'archetype', culture: 'jungian', meaning: 'Chaos, change, and boundary-crossing' },
  mother: { id: 'mother', name: 'The Mother', unicode: '🌍', prime: 19, category: 'archetype', culture: 'jungian', meaning: 'Nurturing, creation, and life' },
  father: { id: 'father', name: 'The Father', unicode: '⚡', prime: 23, category: 'archetype', culture: 'jungian', meaning: 'Authority, order, and protection' },
  child: { id: 'child', name: 'The Child', unicode: '🌱', prime: 29, category: 'archetype', culture: 'jungian', meaning: 'Innocence, potential, and new beginnings' },

  // ============= TAROT MAJOR ARCANA =============
  fool: { id: 'fool', name: 'The Fool', unicode: '🎭', prime: 211, category: 'tarot', culture: 'hermetic', meaning: 'New beginnings, innocence, spontaneity, leap of faith' },
  magician: { id: 'magician', name: 'The Magician', unicode: '🪄', prime: 223, category: 'tarot', culture: 'hermetic', meaning: 'Manifestation, willpower, skill, concentration' },
  highPriestess: { id: 'highPriestess', name: 'High Priestess', unicode: '🌙', prime: 227, category: 'tarot', culture: 'hermetic', meaning: 'Intuition, mystery, hidden knowledge, inner voice' },
  empress: { id: 'empress', name: 'The Empress', unicode: '👑', prime: 229, category: 'tarot', culture: 'hermetic', meaning: 'Fertility, abundance, nature, nurturing' },
  emperor: { id: 'emperor', name: 'The Emperor', unicode: '🏛', prime: 233, category: 'tarot', culture: 'hermetic', meaning: 'Authority, structure, control, leadership' },
  hierophant: { id: 'hierophant', name: 'The Hierophant', unicode: '📿', prime: 239, category: 'tarot', culture: 'hermetic', meaning: 'Tradition, conformity, spiritual guidance' },
  lovers: { id: 'lovers', name: 'The Lovers', unicode: '💕', prime: 241, category: 'tarot', culture: 'hermetic', meaning: 'Love, harmony, relationships, choices' },
  chariot: { id: 'chariot', name: 'The Chariot', unicode: '🎠', prime: 251, category: 'tarot', culture: 'hermetic', meaning: 'Victory, willpower, determination, control' },
  strength: { id: 'strength', name: 'Strength', unicode: '🦁', prime: 257, category: 'tarot', culture: 'hermetic', meaning: 'Courage, patience, inner strength, compassion' },
  hermit: { id: 'hermit', name: 'The Hermit', unicode: '🏔', prime: 263, category: 'tarot', culture: 'hermetic', meaning: 'Soul-searching, introspection, solitude, guidance' },
  wheelOfFortune: { id: 'wheelOfFortune', name: 'Wheel of Fortune', unicode: '🎡', prime: 269, category: 'tarot', culture: 'hermetic', meaning: 'Change, cycles, fate, destiny' },
  justice: { id: 'justice', name: 'Justice', unicode: '⚖', prime: 271, category: 'tarot', culture: 'hermetic', meaning: 'Fairness, truth, law, cause and effect' },
  hangedMan: { id: 'hangedMan', name: 'The Hanged Man', unicode: '🙃', prime: 277, category: 'tarot', culture: 'hermetic', meaning: 'Surrender, letting go, new perspective' },
  tarotDeath: { id: 'tarotDeath', name: 'Death', unicode: '🦋', prime: 281, category: 'tarot', culture: 'hermetic', meaning: 'Endings, transformation, transition, rebirth' },
  temperance: { id: 'temperance', name: 'Temperance', unicode: '⚗', prime: 283, category: 'tarot', culture: 'hermetic', meaning: 'Balance, moderation, patience, purpose' },
  devil: { id: 'devil', name: 'The Devil', unicode: '⛓', prime: 293, category: 'tarot', culture: 'hermetic', meaning: 'Bondage, materialism, shadow self, addiction' },
  tower: { id: 'tower', name: 'The Tower', unicode: '🗼', prime: 307, category: 'tarot', culture: 'hermetic', meaning: 'Sudden upheaval, revelation, awakening' },
  tarotStar: { id: 'tarotStar', name: 'The Star', unicode: '⭐', prime: 311, category: 'tarot', culture: 'hermetic', meaning: 'Hope, faith, renewal, spirituality' },
  tarotMoon: { id: 'tarotMoon', name: 'The Moon', unicode: '🌕', prime: 313, category: 'tarot', culture: 'hermetic', meaning: 'Illusion, fear, subconscious, intuition' },
  tarotSun: { id: 'tarotSun', name: 'The Sun', unicode: '🌞', prime: 317, category: 'tarot', culture: 'hermetic', meaning: 'Joy, success, vitality, positivity' },
  judgement: { id: 'judgement', name: 'Judgement', unicode: '📯', prime: 331, category: 'tarot', culture: 'hermetic', meaning: 'Reflection, reckoning, awakening, absolution' },
  world: { id: 'world', name: 'The World', unicode: '🌍', prime: 337, category: 'tarot', culture: 'hermetic', meaning: 'Completion, achievement, wholeness, travel' },

  // ============= I-CHING TRIGRAMS =============
  heaven: { id: 'heaven', name: 'Qián (Heaven)', unicode: '☰', prime: 401, category: 'iching', culture: 'chinese', meaning: 'Creative force, strength, initiative, leadership' },
  lake: { id: 'lake', name: 'Duì (Lake)', unicode: '☱', prime: 409, category: 'iching', culture: 'chinese', meaning: 'Joy, pleasure, openness, expression' },
  ichingFire: { id: 'ichingFire', name: 'Lí (Fire)', unicode: '☲', prime: 419, category: 'iching', culture: 'chinese', meaning: 'Clarity, illumination, awareness, attachment' },
  thunder: { id: 'thunder', name: 'Zhèn (Thunder)', unicode: '☳', prime: 421, category: 'iching', culture: 'chinese', meaning: 'Arousal, shock, initiative, movement' },
  wind: { id: 'wind', name: 'Xùn (Wind)', unicode: '☴', prime: 431, category: 'iching', culture: 'chinese', meaning: 'Gentle penetration, flexibility, influence' },
  ichingWater: { id: 'ichingWater', name: 'Kǎn (Water)', unicode: '☵', prime: 433, category: 'iching', culture: 'chinese', meaning: 'Danger, depth, flow, adaptability' },
  mountain: { id: 'mountain', name: 'Gèn (Mountain)', unicode: '☶', prime: 439, category: 'iching', culture: 'chinese', meaning: 'Stillness, meditation, stopping, boundary' },
  ichingEarth: { id: 'ichingEarth', name: 'Kūn (Earth)', unicode: '☷', prime: 443, category: 'iching', culture: 'chinese', meaning: 'Receptive, yielding, nurturing, devotion' },

  // ============= PLANETARY SYMBOLS =============
  planetSun: { id: 'planetSun', name: 'Sol (Sun)', unicode: '☉', prime: 503, category: 'planetary', culture: 'astrological', meaning: 'Vitality, ego, consciousness, self-expression' },
  planetMoon: { id: 'planetMoon', name: 'Luna (Moon)', unicode: '☽', prime: 509, category: 'planetary', culture: 'astrological', meaning: 'Emotions, instincts, subconscious, nurturing' },
  mercury: { id: 'mercury', name: 'Mercury', unicode: '☿', prime: 521, category: 'planetary', culture: 'astrological', meaning: 'Communication, intellect, adaptability, travel' },
  venus: { id: 'venus', name: 'Venus', unicode: '♀', prime: 523, category: 'planetary', culture: 'astrological', meaning: 'Love, beauty, harmony, values, attraction' },
  mars: { id: 'mars', name: 'Mars', unicode: '♂', prime: 541, category: 'planetary', culture: 'astrological', meaning: 'Action, desire, aggression, energy, courage' },
  jupiter: { id: 'jupiter', name: 'Jupiter', unicode: '♃', prime: 547, category: 'planetary', culture: 'astrological', meaning: 'Expansion, luck, wisdom, abundance, growth' },
  saturn: { id: 'saturn', name: 'Saturn', unicode: '♄', prime: 557, category: 'planetary', culture: 'astrological', meaning: 'Limitation, discipline, structure, karma, time' },
  uranus: { id: 'uranus', name: 'Uranus', unicode: '♅', prime: 563, category: 'planetary', culture: 'astrological', meaning: 'Innovation, rebellion, sudden change, genius' },
  neptune: { id: 'neptune', name: 'Neptune', unicode: '♆', prime: 569, category: 'planetary', culture: 'astrological', meaning: 'Dreams, illusion, spirituality, transcendence' },
  pluto: { id: 'pluto', name: 'Pluto', unicode: '♇', prime: 571, category: 'planetary', culture: 'astrological', meaning: 'Transformation, power, death/rebirth, shadow' },

  // ============= SACRED GEOMETRY =============
  vesicaPiscis: { id: 'vesicaPiscis', name: 'Vesica Piscis', unicode: '◍', prime: 601, category: 'geometry', culture: 'sacred', meaning: 'Union of opposites, creation, the womb of form' },
  seedOfLife: { id: 'seedOfLife', name: 'Seed of Life', unicode: '❀', prime: 607, category: 'geometry', culture: 'sacred', meaning: 'Creation, fertility, the seven days of creation' },
  flowerOfLife: { id: 'flowerOfLife', name: 'Flower of Life', unicode: '✿', prime: 613, category: 'geometry', culture: 'sacred', meaning: 'Interconnection, the fabric of creation, sacred pattern' },
  treeOfLife: { id: 'treeOfLife', name: 'Tree of Life', unicode: '🌳', prime: 617, category: 'geometry', culture: 'kabbalistic', meaning: 'Divine emanation, spiritual path, cosmic structure' },
  metatronsCube: { id: 'metatronsCube', name: "Metatron's Cube", unicode: '⬡', prime: 619, category: 'geometry', culture: 'sacred', meaning: 'Platonic solids, creation matrix, archangelic power' },
  tetrahedron: { id: 'tetrahedron', name: 'Tetrahedron', unicode: '△', prime: 631, category: 'geometry', culture: 'platonic', meaning: 'Fire element, stability, manifestation, foundation' },
  hexahedron: { id: 'hexahedron', name: 'Hexahedron (Cube)', unicode: '◻', prime: 641, category: 'geometry', culture: 'platonic', meaning: 'Earth element, solidity, grounding, material world' },
  octahedron: { id: 'octahedron', name: 'Octahedron', unicode: '◇', prime: 643, category: 'geometry', culture: 'platonic', meaning: 'Air element, integration, reflection, balance' },
  dodecahedron: { id: 'dodecahedron', name: 'Dodecahedron', unicode: '⬠', prime: 647, category: 'geometry', culture: 'platonic', meaning: 'Aether element, universe, spirit, ascension' },
  icosahedron: { id: 'icosahedron', name: 'Icosahedron', unicode: '⬢', prime: 653, category: 'geometry', culture: 'platonic', meaning: 'Water element, flow, transformation, emotions' },
  merkaba: { id: 'merkaba', name: 'Merkaba', unicode: '✡', prime: 659, category: 'geometry', culture: 'sacred', meaning: 'Light body, ascension vehicle, interdimensional travel' },
  torus: { id: 'torus', name: 'Torus', unicode: '◎', prime: 661, category: 'geometry', culture: 'sacred', meaning: 'Energy flow, self-sustaining system, eternal return' },
  fibonacci: { id: 'fibonacci', name: 'Golden Spiral', unicode: '🌀', prime: 673, category: 'geometry', culture: 'sacred', meaning: 'Natural growth, divine proportion, harmonic expansion' },
  
  // ============= ELEMENTS =============
  fire: { id: 'fire', name: 'Fire', unicode: '🔥', prime: 31, category: 'element', culture: 'universal', meaning: 'Transformation, passion, energy' },
  water: { id: 'water', name: 'Water', unicode: '💧', prime: 37, category: 'element', culture: 'universal', meaning: 'Emotion, intuition, flow' },
  earth: { id: 'earth', name: 'Earth', unicode: '🪨', prime: 41, category: 'element', culture: 'universal', meaning: 'Stability, grounding, material' },
  air: { id: 'air', name: 'Air', unicode: '💨', prime: 43, category: 'element', culture: 'universal', meaning: 'Thought, communication, freedom' },
  aether: { id: 'aether', name: 'Aether', unicode: '✨', prime: 47, category: 'element', culture: 'universal', meaning: 'Spirit, quintessence, transcendence' },

  // ============= CONCEPTS =============
  love: { id: 'love', name: 'Love', unicode: '❤', prime: 53, category: 'concept', culture: 'universal', meaning: 'Connection, unity, devotion' },
  death: { id: 'death', name: 'Death', unicode: '💀', prime: 59, category: 'concept', culture: 'universal', meaning: 'Ending, transformation, rebirth' },
  time: { id: 'time', name: 'Time', unicode: '⏳', prime: 61, category: 'concept', culture: 'universal', meaning: 'Change, cycles, impermanence' },
  truth: { id: 'truth', name: 'Truth', unicode: '⚖', prime: 67, category: 'concept', culture: 'universal', meaning: 'Reality, clarity, authenticity' },
  chaos: { id: 'chaos', name: 'Chaos', unicode: '🌀', prime: 71, category: 'concept', culture: 'universal', meaning: 'Disorder, potential, creativity' },
  order: { id: 'order', name: 'Order', unicode: '📐', prime: 73, category: 'concept', culture: 'universal', meaning: 'Structure, harmony, pattern' },
  wisdom: { id: 'wisdom', name: 'Wisdom', unicode: '🦉', prime: 179, category: 'concept', culture: 'universal', meaning: 'Deep knowing, discernment, insight' },
  power: { id: 'power', name: 'Power', unicode: '⚡', prime: 181, category: 'concept', culture: 'universal', meaning: 'Force, authority, capability' },
  freedom: { id: 'freedom', name: 'Freedom', unicode: '🕊', prime: 191, category: 'concept', culture: 'universal', meaning: 'Liberation, autonomy, release' },
  unity: { id: 'unity', name: 'Unity', unicode: '∞', prime: 193, category: 'concept', culture: 'universal', meaning: 'Oneness, connection, wholeness' },
  duality: { id: 'duality', name: 'Duality', unicode: '☯', prime: 197, category: 'concept', culture: 'universal', meaning: 'Opposition, balance, complementarity' },
  creation: { id: 'creation', name: 'Creation', unicode: '💫', prime: 199, category: 'concept', culture: 'universal', meaning: 'Bringing into being, manifestation' },

  // ============= CELESTIAL =============
  sun: { id: 'sun', name: 'Sun', unicode: '☉', prime: 79, category: 'celestial', culture: 'universal', meaning: 'Consciousness, vitality, illumination' },
  moon: { id: 'moon', name: 'Moon', unicode: '☽', prime: 83, category: 'celestial', culture: 'universal', meaning: 'Subconscious, reflection, cycles' },
  star: { id: 'star', name: 'Star', unicode: '⭐', prime: 89, category: 'celestial', culture: 'universal', meaning: 'Guidance, hope, aspiration' },
  void: { id: 'void', name: 'Void', unicode: '◯', prime: 97, category: 'celestial', culture: 'universal', meaning: 'Emptiness, potential, the unknown' },

  // ============= JOURNEY =============
  path: { id: 'path', name: 'The Path', unicode: '🛤', prime: 101, category: 'journey', culture: 'universal', meaning: 'Direction, purpose, progression' },
  threshold: { id: 'threshold', name: 'Threshold', unicode: '🚪', prime: 103, category: 'journey', culture: 'universal', meaning: 'Transition, choice, opportunity' },
  descent: { id: 'descent', name: 'Descent', unicode: '⬇', prime: 107, category: 'journey', culture: 'universal', meaning: 'Going inward, facing darkness' },
  ascent: { id: 'ascent', name: 'Ascent', unicode: '⬆', prime: 109, category: 'journey', culture: 'universal', meaning: 'Rising, achievement, enlightenment' },
  return: { id: 'return', name: 'Return', unicode: '🔄', prime: 113, category: 'journey', culture: 'universal', meaning: 'Integration, coming home, completion' },

  // ============= WISDOM SYMBOLS =============
  serpent: { id: 'serpent', name: 'Serpent', unicode: '🐍', prime: 127, category: 'wisdom', culture: 'universal', meaning: 'Wisdom, renewal, kundalini' },
  tree: { id: 'tree', name: 'World Tree', unicode: '🌳', prime: 131, category: 'wisdom', culture: 'universal', meaning: 'Connection of realms, growth, life' },
  lotus: { id: 'lotus', name: 'Lotus', unicode: '🪷', prime: 137, category: 'wisdom', culture: 'eastern', meaning: 'Enlightenment rising from mud' },
  eye: { id: 'eye', name: 'All-Seeing Eye', unicode: '👁', prime: 139, category: 'wisdom', culture: 'universal', meaning: 'Awareness, perception, insight' },
  spiral: { id: 'spiral', name: 'Spiral', unicode: '🌀', prime: 149, category: 'wisdom', culture: 'universal', meaning: 'Evolution, expansion, return' },

  // ============= EMOTIONS =============
  joy: { id: 'joy', name: 'Joy', unicode: '😊', prime: 151, category: 'emotion', culture: 'universal', meaning: 'Happiness, fulfillment, lightness' },
  sorrow: { id: 'sorrow', name: 'Sorrow', unicode: '😢', prime: 157, category: 'emotion', culture: 'universal', meaning: 'Grief, depth, compassion' },
  fear: { id: 'fear', name: 'Fear', unicode: '😨', prime: 163, category: 'emotion', culture: 'universal', meaning: 'Warning, protection, survival' },
  anger: { id: 'anger', name: 'Anger', unicode: '😠', prime: 167, category: 'emotion', culture: 'universal', meaning: 'Boundary, power, injustice' },
  peace: { id: 'peace', name: 'Peace', unicode: '☮', prime: 173, category: 'emotion', culture: 'universal', meaning: 'Harmony, stillness, acceptance' },
};

// Keywords that map to symbols - expanded for all traditions
export const KEYWORD_MAP: Record<string, string[]> = {
  // Archetypes
  self: ['self', 'identity', 'who am i', 'myself', 'wholeness', 'integration', 'ego'],
  shadow: ['shadow', 'dark', 'hidden', 'secret', 'unconscious', 'repressed', 'denied'],
  anima: ['feminine', 'receptive', 'intuitive', 'anima', 'yin', 'goddess'],
  animus: ['masculine', 'active', 'rational', 'animus', 'yang', 'god'],
  hero: ['hero', 'brave', 'courage', 'warrior', 'fight', 'battle', 'challenge', 'quest'],
  sage: ['wisdom', 'wise', 'knowledge', 'understand', 'learn', 'teach', 'sage', 'mentor'],
  trickster: ['trick', 'fool', 'chaos', 'change', 'unexpected', 'joke', 'mischief'],
  mother: ['mother', 'nurture', 'care', 'birth', 'create', 'womb', 'maternal'],
  father: ['father', 'authority', 'rule', 'protect', 'structure', 'law', 'paternal'],
  child: ['child', 'innocent', 'new', 'begin', 'potential', 'play', 'wonder', 'pure'],
  
  // Tarot
  fool: ['fool', 'beginning', 'leap', 'risk', 'adventure', 'spontaneous'],
  magician: ['magic', 'manifest', 'will', 'skill', 'tool', 'ability', 'create'],
  highPriestess: ['mystery', 'intuition', 'secret', 'hidden knowledge', 'inner voice'],
  empress: ['fertility', 'abundance', 'nature', 'sensual', 'creative'],
  emperor: ['control', 'structure', 'empire', 'rule', 'authority', 'father figure'],
  hierophant: ['tradition', 'institution', 'conformity', 'religion', 'ceremony'],
  lovers: ['love', 'choice', 'relationship', 'union', 'partnership', 'harmony'],
  chariot: ['victory', 'determination', 'drive', 'ambition', 'willpower'],
  strength: ['courage', 'patience', 'inner strength', 'compassion', 'gentle'],
  hermit: ['solitude', 'introspection', 'searching', 'withdrawal', 'guidance'],
  wheelOfFortune: ['destiny', 'fate', 'cycle', 'luck', 'fortune', 'karma'],
  justice: ['fairness', 'balance', 'law', 'truth', 'accountability'],
  hangedMan: ['surrender', 'letting go', 'sacrifice', 'suspension', 'perspective'],
  tarotDeath: ['ending', 'transformation', 'transition', 'rebirth', 'metamorphosis'],
  temperance: ['moderation', 'patience', 'purpose', 'balance', 'alchemy'],
  devil: ['bondage', 'addiction', 'materialism', 'temptation', 'shadow'],
  tower: ['upheaval', 'revelation', 'awakening', 'destruction', 'lightning'],
  tarotStar: ['hope', 'faith', 'renewal', 'inspiration', 'serenity'],
  tarotMoon: ['illusion', 'fear', 'anxiety', 'subconscious', 'intuition'],
  tarotSun: ['joy', 'success', 'vitality', 'happiness', 'clarity'],
  judgement: ['reckoning', 'absolution', 'calling', 'rebirth', 'judgement'],
  world: ['completion', 'integration', 'accomplishment', 'travel', 'wholeness'],
  
  // I-Ching
  heaven: ['heaven', 'creative', 'strong', 'initiative', 'leader'],
  lake: ['lake', 'joy', 'pleasure', 'marsh', 'youngest daughter'],
  ichingFire: ['fire', 'clarity', 'illumination', 'awareness', 'clinging'],
  thunder: ['thunder', 'shock', 'arousing', 'eldest son', 'movement'],
  wind: ['wind', 'gentle', 'penetrating', 'eldest daughter', 'wood'],
  ichingWater: ['water', 'danger', 'abyss', 'middle son', 'gorge'],
  mountain: ['mountain', 'stillness', 'keeping still', 'meditation', 'youngest son'],
  ichingEarth: ['earth', 'receptive', 'yielding', 'devotion', 'mother'],
  
  // Planetary
  planetSun: ['sun', 'ego', 'vitality', 'self-expression', 'identity'],
  planetMoon: ['moon', 'emotions', 'instincts', 'mother', 'nurturing'],
  mercury: ['mercury', 'communication', 'intellect', 'travel', 'messages'],
  venus: ['venus', 'love', 'beauty', 'harmony', 'values', 'pleasure'],
  mars: ['mars', 'action', 'desire', 'aggression', 'energy', 'warrior'],
  jupiter: ['jupiter', 'expansion', 'luck', 'growth', 'abundance', 'wisdom'],
  saturn: ['saturn', 'limitation', 'discipline', 'karma', 'time', 'structure'],
  uranus: ['uranus', 'innovation', 'rebellion', 'sudden change', 'genius'],
  neptune: ['neptune', 'dreams', 'illusion', 'spirituality', 'transcendence'],
  pluto: ['pluto', 'transformation', 'power', 'death', 'rebirth', 'underworld'],
  
  // Sacred Geometry
  vesicaPiscis: ['vesica', 'union', 'womb', 'intersection', 'creation'],
  seedOfLife: ['seed', 'creation', 'fertility', 'genesis', 'origin'],
  flowerOfLife: ['flower of life', 'interconnection', 'sacred pattern', 'unity'],
  treeOfLife: ['tree of life', 'kabbalah', 'sephiroth', 'emanation'],
  metatronsCube: ['metatron', 'cube', 'platonic', 'archangel', 'matrix'],
  tetrahedron: ['tetrahedron', 'pyramid', 'fire solid', 'foundation'],
  hexahedron: ['cube', 'hexahedron', 'earth solid', 'grounding'],
  octahedron: ['octahedron', 'air solid', 'integration', 'balance'],
  dodecahedron: ['dodecahedron', 'universe', 'aether solid', 'cosmos'],
  icosahedron: ['icosahedron', 'water solid', 'flow', 'emotion'],
  merkaba: ['merkaba', 'light body', 'ascension', 'star tetrahedron'],
  torus: ['torus', 'donut', 'energy flow', 'self-sustaining'],
  fibonacci: ['fibonacci', 'golden ratio', 'spiral', 'phi', 'golden'],
  
  // Elements
  fire: ['fire', 'burn', 'passion', 'energy', 'transform', 'heat', 'flame'],
  water: ['water', 'flow', 'emotion', 'feel', 'river', 'ocean', 'tears'],
  earth: ['earth', 'ground', 'stable', 'solid', 'body', 'material', 'physical'],
  air: ['air', 'breath', 'think', 'mind', 'wind', 'speak', 'communicate'],
  aether: ['spirit', 'soul', 'transcend', 'divine', 'essence', 'ethereal', 'quintessence'],
  
  // Concepts
  love: ['love', 'heart', 'connect', 'care', 'relationship', 'bond', 'devotion'],
  death: ['death', 'die', 'end', 'loss', 'grief', 'mortality', 'finish'],
  time: ['time', 'past', 'future', 'present', 'age', 'memory', 'moment'],
  truth: ['truth', 'real', 'honest', 'authentic', 'genuine', 'clarity'],
  chaos: ['chaos', 'disorder', 'random', 'uncertain', 'confused', 'mess'],
  order: ['order', 'organize', 'structure', 'pattern', 'system', 'arrange'],
  wisdom: ['wisdom', 'insight', 'discernment', 'understanding', 'enlightened'],
  power: ['power', 'force', 'strength', 'authority', 'capability', 'potency'],
  freedom: ['freedom', 'free', 'liberation', 'autonomy', 'release', 'independence'],
  unity: ['unity', 'oneness', 'connection', 'wholeness', 'togetherness'],
  duality: ['duality', 'opposition', 'polarity', 'two', 'either', 'both'],
  creation: ['creation', 'create', 'manifest', 'bring forth', 'genesis'],
  
  // Celestial
  sun: ['sun', 'light', 'day', 'conscious', 'awake', 'clarity', 'shine'],
  moon: ['moon', 'night', 'dream', 'subconscious', 'reflect', 'cycle'],
  star: ['star', 'hope', 'guide', 'aspire', 'goal', 'destiny', 'wish'],
  void: ['void', 'empty', 'nothing', 'space', 'unknown', 'infinite'],
  
  // Journey
  path: ['path', 'way', 'journey', 'direction', 'road', 'course'],
  threshold: ['threshold', 'door', 'gate', 'choice', 'decide', 'crossroad'],
  descent: ['descend', 'down', 'fall', 'deep', 'inner', 'below'],
  ascent: ['ascend', 'rise', 'up', 'climb', 'achieve', 'elevate'],
  return: ['return', 'home', 'back', 'complete', 'integrate', 'cycle'],
  
  // Wisdom
  serpent: ['serpent', 'snake', 'kundalini', 'wisdom', 'renewal', 'shed'],
  tree: ['tree', 'root', 'branch', 'grow', 'life', 'nature', 'axis'],
  lotus: ['lotus', 'flower', 'bloom', 'enlighten', 'pure', 'awaken'],
  eye: ['eye', 'see', 'vision', 'perceive', 'aware', 'watch', 'insight'],
  spiral: ['spiral', 'evolve', 'expand', 'grow', 'return', 'progress'],
  
  // Emotions
  joy: ['joy', 'happy', 'glad', 'delight', 'celebrate', 'bliss'],
  sorrow: ['sorrow', 'sad', 'grief', 'mourn', 'melancholy', 'weep'],
  fear: ['fear', 'afraid', 'scare', 'anxiety', 'worry', 'terror'],
  anger: ['anger', 'angry', 'rage', 'fury', 'upset', 'frustrate'],
  peace: ['peace', 'calm', 'serene', 'tranquil', 'still', 'quiet'],
};

// Category-based resonance relationships
export const CATEGORY_RESONANCE: Record<string, string[]> = {
  archetype: ['tarot', 'emotion', 'concept'],
  tarot: ['archetype', 'planetary', 'journey'],
  iching: ['element', 'concept', 'celestial'],
  planetary: ['tarot', 'celestial', 'archetype'],
  geometry: ['concept', 'celestial', 'element'],
  element: ['iching', 'emotion', 'geometry'],
  concept: ['archetype', 'geometry', 'wisdom'],
  celestial: ['planetary', 'iching', 'journey'],
  journey: ['tarot', 'archetype', 'celestial'],
  wisdom: ['concept', 'archetype', 'geometry'],
  emotion: ['archetype', 'element', 'tarot'],
};

export function getAllSymbols(): SymbolicSymbol[] {
  return Object.values(SYMBOL_DATABASE);
}

export function getSymbolById(id: string): SymbolicSymbol | undefined {
  return SYMBOL_DATABASE[id];
}

export function getSymbolsByCategory(category: string): SymbolicSymbol[] {
  return Object.values(SYMBOL_DATABASE).filter(s => s.category === category);
}

export function getSymbolsByPrimeRange(min: number, max: number): SymbolicSymbol[] {
  return Object.values(SYMBOL_DATABASE).filter(s => s.prime >= min && s.prime <= max);
}
