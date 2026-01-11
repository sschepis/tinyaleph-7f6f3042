import type { Symbol } from './types';

// Core symbol database - archetypal symbols across cultures
export const SYMBOL_DATABASE: Record<string, Symbol> = {
  // Jungian Archetypes
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
  
  // Elements
  fire: { id: 'fire', name: 'Fire', unicode: '🔥', prime: 31, category: 'element', culture: 'universal', meaning: 'Transformation, passion, energy' },
  water: { id: 'water', name: 'Water', unicode: '💧', prime: 37, category: 'element', culture: 'universal', meaning: 'Emotion, intuition, flow' },
  earth: { id: 'earth', name: 'Earth', unicode: '🪨', prime: 41, category: 'element', culture: 'universal', meaning: 'Stability, grounding, material' },
  air: { id: 'air', name: 'Air', unicode: '💨', prime: 43, category: 'element', culture: 'universal', meaning: 'Thought, communication, freedom' },
  aether: { id: 'aether', name: 'Aether', unicode: '✨', prime: 47, category: 'element', culture: 'universal', meaning: 'Spirit, quintessence, transcendence' },
  
  // Concepts
  love: { id: 'love', name: 'Love', unicode: '❤', prime: 53, category: 'concept', culture: 'universal', meaning: 'Connection, unity, devotion' },
  death: { id: 'death', name: 'Death', unicode: '💀', prime: 59, category: 'concept', culture: 'universal', meaning: 'Ending, transformation, rebirth' },
  time: { id: 'time', name: 'Time', unicode: '⏳', prime: 61, category: 'concept', culture: 'universal', meaning: 'Change, cycles, impermanence' },
  truth: { id: 'truth', name: 'Truth', unicode: '⚖', prime: 67, category: 'concept', culture: 'universal', meaning: 'Reality, clarity, authenticity' },
  chaos: { id: 'chaos', name: 'Chaos', unicode: '🌀', prime: 71, category: 'concept', culture: 'universal', meaning: 'Disorder, potential, creativity' },
  order: { id: 'order', name: 'Order', unicode: '📐', prime: 73, category: 'concept', culture: 'universal', meaning: 'Structure, harmony, pattern' },
  
  // Celestial
  sun: { id: 'sun', name: 'Sun', unicode: '☉', prime: 79, category: 'celestial', culture: 'universal', meaning: 'Consciousness, vitality, illumination' },
  moon: { id: 'moon', name: 'Moon', unicode: '☽', prime: 83, category: 'celestial', culture: 'universal', meaning: 'Subconscious, reflection, cycles' },
  star: { id: 'star', name: 'Star', unicode: '⭐', prime: 89, category: 'celestial', culture: 'universal', meaning: 'Guidance, hope, aspiration' },
  void: { id: 'void', name: 'Void', unicode: '◯', prime: 97, category: 'celestial', culture: 'universal', meaning: 'Emptiness, potential, the unknown' },
  
  // Journey
  path: { id: 'path', name: 'The Path', unicode: '🛤', prime: 101, category: 'journey', culture: 'universal', meaning: 'Direction, purpose, progression' },
  threshold: { id: 'threshold', name: 'Threshold', unicode: '🚪', prime: 103, category: 'journey', culture: 'universal', meaning: 'Transition, choice, opportunity' },
  descent: { id: 'descent', name: 'Descent', unicode: '⬇', prime: 107, category: 'journey', culture: 'universal', meaning: 'Going inward, facing darkness' },
  ascent: { id: 'ascent', name: 'Ascent', unicode: '⬆', prime: 109, category: 'journey', culture: 'universal', meaning: 'Rising, achievement, enlightenment' },
  return: { id: 'return', name: 'Return', unicode: '🔄', prime: 113, category: 'journey', culture: 'universal', meaning: 'Integration, coming home, completion' },
  
  // Wisdom traditions
  serpent: { id: 'serpent', name: 'Serpent', unicode: '🐍', prime: 127, category: 'wisdom', culture: 'universal', meaning: 'Wisdom, renewal, kundalini' },
  tree: { id: 'tree', name: 'World Tree', unicode: '🌳', prime: 131, category: 'wisdom', culture: 'universal', meaning: 'Connection of realms, growth, life' },
  lotus: { id: 'lotus', name: 'Lotus', unicode: '🪷', prime: 137, category: 'wisdom', culture: 'eastern', meaning: 'Enlightenment rising from mud' },
  eye: { id: 'eye', name: 'All-Seeing Eye', unicode: '👁', prime: 139, category: 'wisdom', culture: 'universal', meaning: 'Awareness, perception, insight' },
  spiral: { id: 'spiral', name: 'Spiral', unicode: '🌀', prime: 149, category: 'wisdom', culture: 'universal', meaning: 'Evolution, expansion, return' },
  
  // Emotions
  joy: { id: 'joy', name: 'Joy', unicode: '😊', prime: 151, category: 'emotion', culture: 'universal', meaning: 'Happiness, fulfillment, lightness' },
  sorrow: { id: 'sorrow', name: 'Sorrow', unicode: '😢', prime: 157, category: 'emotion', culture: 'universal', meaning: 'Grief, depth, compassion' },
  fear: { id: 'fear', name: 'Fear', unicode: '😨', prime: 163, category: 'emotion', culture: 'universal', meaning: 'Warning, protection, survival' },
  anger: { id: 'anger', name: 'Anger', unicode: '😠', prime: 167, category: 'emotion', culture: 'universal', meaning: 'Boundary, power, injustice' },
  peace: { id: 'peace', name: 'Peace', unicode: '☮', prime: 173, category: 'emotion', culture: 'universal', meaning: 'Harmony, stillness, acceptance' },
};

// Keywords that map to symbols
export const KEYWORD_MAP: Record<string, string[]> = {
  self: ['self', 'identity', 'who am i', 'myself', 'wholeness', 'integration'],
  shadow: ['shadow', 'dark', 'hidden', 'secret', 'unconscious', 'repressed'],
  anima: ['feminine', 'receptive', 'intuitive', 'anima', 'yin'],
  animus: ['masculine', 'active', 'rational', 'animus', 'yang'],
  hero: ['hero', 'brave', 'courage', 'warrior', 'fight', 'battle', 'challenge'],
  sage: ['wisdom', 'wise', 'knowledge', 'understand', 'learn', 'teach', 'sage'],
  trickster: ['trick', 'fool', 'chaos', 'change', 'unexpected', 'joke'],
  mother: ['mother', 'nurture', 'care', 'birth', 'create', 'womb', 'earth'],
  father: ['father', 'authority', 'rule', 'protect', 'structure', 'law'],
  child: ['child', 'innocent', 'new', 'begin', 'potential', 'play', 'wonder'],
  fire: ['fire', 'burn', 'passion', 'energy', 'transform', 'heat', 'flame'],
  water: ['water', 'flow', 'emotion', 'feel', 'river', 'ocean', 'tears'],
  earth: ['earth', 'ground', 'stable', 'solid', 'body', 'material', 'physical'],
  air: ['air', 'breath', 'think', 'mind', 'wind', 'speak', 'communicate'],
  aether: ['spirit', 'soul', 'transcend', 'divine', 'essence', 'ethereal'],
  love: ['love', 'heart', 'connect', 'care', 'relationship', 'bond', 'devotion'],
  death: ['death', 'die', 'end', 'loss', 'grief', 'mortality', 'finish'],
  time: ['time', 'past', 'future', 'present', 'age', 'memory', 'moment'],
  truth: ['truth', 'real', 'honest', 'authentic', 'genuine', 'clarity'],
  chaos: ['chaos', 'disorder', 'random', 'uncertain', 'confused', 'mess'],
  order: ['order', 'organize', 'structure', 'pattern', 'system', 'arrange'],
  sun: ['sun', 'light', 'day', 'conscious', 'awake', 'clarity', 'shine'],
  moon: ['moon', 'night', 'dream', 'subconscious', 'reflect', 'cycle'],
  star: ['star', 'hope', 'guide', 'aspire', 'goal', 'destiny', 'wish'],
  void: ['void', 'empty', 'nothing', 'space', 'unknown', 'infinite'],
  path: ['path', 'way', 'journey', 'direction', 'road', 'course'],
  threshold: ['threshold', 'door', 'gate', 'choice', 'decide', 'crossroad'],
  descent: ['descend', 'down', 'fall', 'deep', 'inner', 'below'],
  ascent: ['ascend', 'rise', 'up', 'climb', 'achieve', 'elevate'],
  return: ['return', 'home', 'back', 'complete', 'integrate', 'cycle'],
  serpent: ['serpent', 'snake', 'kundalini', 'wisdom', 'renewal', 'shed'],
  tree: ['tree', 'root', 'branch', 'grow', 'life', 'nature', 'axis'],
  lotus: ['lotus', 'flower', 'bloom', 'enlighten', 'pure', 'awaken'],
  eye: ['eye', 'see', 'vision', 'perceive', 'aware', 'watch', 'insight'],
  spiral: ['spiral', 'evolve', 'expand', 'grow', 'return', 'progress'],
  joy: ['joy', 'happy', 'glad', 'delight', 'celebrate', 'bliss'],
  sorrow: ['sorrow', 'sad', 'grief', 'mourn', 'melancholy', 'weep'],
  fear: ['fear', 'afraid', 'scare', 'anxiety', 'worry', 'terror'],
  anger: ['anger', 'angry', 'rage', 'fury', 'upset', 'frustrate'],
  peace: ['peace', 'calm', 'serene', 'tranquil', 'still', 'quiet'],
};

export function getAllSymbols(): Symbol[] {
  return Object.values(SYMBOL_DATABASE);
}

export function getSymbolById(id: string): Symbol | undefined {
  return SYMBOL_DATABASE[id];
}

export function getSymbolsByCategory(category: string): Symbol[] {
  return Object.values(SYMBOL_DATABASE).filter(s => s.category === category);
}
