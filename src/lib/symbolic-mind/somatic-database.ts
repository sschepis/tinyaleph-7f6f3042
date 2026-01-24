import type { SomaticMapping, BodyRegion, NervousSystemState, SensationIntensity } from './types';

/**
 * Somatic Resonance Database
 * Maps each symbol's prime to physical body sensations, regions, and nervous system states.
 * This creates an "embodied interpretation layer" for symbolic analysis.
 */

export interface SomaticEntry {
  prime: number;
  symbolId: string;
  somatic: SomaticMapping;
}

// Helper to create entries
const s = (
  prime: number,
  symbolId: string,
  bodyRegions: BodyRegion[],
  sensation: string,
  nervousSystem: NervousSystemState,
  intensity: SensationIntensity,
  energyCenter?: string
): SomaticEntry => ({
  prime,
  symbolId,
  somatic: { bodyRegions, sensation, nervousSystem, intensity, energyCenter }
});

export const SOMATIC_DATABASE: SomaticEntry[] = [
  // ============= JUNGIAN ARCHETYPES =============
  s(2, 'self', ['heart', 'whole-body'], 'fullness, centered warmth', 'balanced', 'moderate', 'heart'),
  s(3, 'shadow', ['belly', 'root'], 'heaviness, contraction', 'parasympathetic', 'strong', 'root'),
  s(5, 'anima', ['heart', 'sacral'], 'softening, receptive opening', 'parasympathetic', 'moderate', 'sacral'),
  s(7, 'animus', ['solar-plexus', 'chest'], 'expansion, forward thrust', 'sympathetic', 'moderate', 'solar-plexus'),
  s(11, 'hero', ['spine', 'chest', 'hands'], 'tension, readiness, grip', 'sympathetic', 'strong', 'solar-plexus'),
  s(13, 'sage', ['third-eye', 'crown'], 'stillness, clarity, spaciousness', 'balanced', 'subtle', 'third-eye'),
  s(17, 'trickster', ['belly', 'feet'], 'fluttering, quickening, instability', 'sympathetic', 'moderate', 'sacral'),
  s(19, 'mother', ['chest', 'belly', 'hands'], 'warmth, enveloping, nurturing', 'parasympathetic', 'moderate', 'heart'),
  s(23, 'father', ['spine', 'solar-plexus'], 'uprightness, firm boundary', 'sympathetic', 'moderate', 'solar-plexus'),
  s(29, 'child', ['heart', 'hands', 'feet'], 'lightness, tingling, openness', 'balanced', 'subtle', 'heart'),

  // ============= TAROT MAJOR ARCANA =============
  s(211, 'fool', ['feet', 'belly'], 'butterflies, lightness, vertigo', 'sympathetic', 'moderate', 'sacral'),
  s(223, 'magician', ['hands', 'solar-plexus', 'third-eye'], 'charged, electric, focused', 'sympathetic', 'strong', 'solar-plexus'),
  s(227, 'highPriestess', ['third-eye', 'throat'], 'stillness, depth, cool', 'parasympathetic', 'subtle', 'third-eye'),
  s(229, 'empress', ['belly', 'chest', 'sacral'], 'fullness, fertility, sensual warmth', 'parasympathetic', 'moderate', 'sacral'),
  s(233, 'emperor', ['spine', 'solar-plexus'], 'rigidity, command, grounded power', 'sympathetic', 'strong', 'solar-plexus'),
  s(239, 'hierophant', ['throat', 'crown'], 'solemnity, resonance, density', 'balanced', 'moderate', 'throat'),
  s(241, 'lovers', ['heart', 'sacral'], 'flutter, warmth, merging', 'parasympathetic', 'moderate', 'heart'),
  s(251, 'chariot', ['hands', 'solar-plexus', 'feet'], 'surge, momentum, control', 'sympathetic', 'strong', 'solar-plexus'),
  s(257, 'strength', ['heart', 'hands', 'belly'], 'contained power, steady warmth', 'balanced', 'moderate', 'heart'),
  s(263, 'hermit', ['third-eye', 'feet'], 'withdrawal, stillness, cool detachment', 'parasympathetic', 'subtle', 'third-eye'),
  s(269, 'wheelOfFortune', ['belly', 'whole-body'], 'spinning, disorientation, flux', 'balanced', 'moderate', 'sacral'),
  s(271, 'justice', ['throat', 'hands', 'spine'], 'balance, precision, clarity', 'balanced', 'subtle', 'throat'),
  s(277, 'hangedMan', ['crown', 'feet'], 'inversion, suspension, floating', 'parasympathetic', 'moderate', 'crown'),
  s(281, 'tarotDeath', ['whole-body', 'spine'], 'release, dissolving, cold wave', 'parasympathetic', 'strong', 'root'),
  s(283, 'temperance', ['heart', 'hands'], 'flow, blending, equilibrium', 'balanced', 'subtle', 'heart'),
  s(293, 'devil', ['root', 'sacral', 'belly'], 'weight, binding, hot pressure', 'sympathetic', 'strong', 'root'),
  s(307, 'tower', ['spine', 'whole-body'], 'shock, shattering, electric surge', 'sympathetic', 'strong', 'root'),
  s(311, 'tarotStar', ['heart', 'crown', 'skin'], 'lightness, hope, cool radiance', 'parasympathetic', 'subtle', 'crown'),
  s(313, 'tarotMoon', ['belly', 'third-eye'], 'unease, shifting, watery depth', 'parasympathetic', 'moderate', 'third-eye'),
  s(317, 'tarotSun', ['solar-plexus', 'heart', 'skin'], 'warmth, expansion, radiance', 'sympathetic', 'moderate', 'solar-plexus'),
  s(331, 'judgement', ['throat', 'spine', 'whole-body'], 'rising, calling, vibration', 'balanced', 'strong', 'throat'),
  s(337, 'world', ['heart', 'whole-body'], 'completion, fullness, integration', 'balanced', 'moderate', 'heart'),

  // ============= I-CHING TRIGRAMS =============
  s(401, 'heaven', ['crown', 'spine'], 'upward expansion, lightness', 'sympathetic', 'moderate', 'crown'),
  s(409, 'lake', ['throat', 'heart'], 'openness, joy, bubbling', 'balanced', 'subtle', 'throat'),
  s(419, 'ichingFire', ['solar-plexus', 'third-eye'], 'heat, clarity, intensity', 'sympathetic', 'strong', 'solar-plexus'),
  s(421, 'thunder', ['spine', 'solar-plexus', 'root'], 'jolt, surge, awakening shock', 'sympathetic', 'strong', 'root'),
  s(431, 'wind', ['skin', 'chest'], 'gentle penetration, subtle movement', 'parasympathetic', 'subtle', 'heart'),
  s(433, 'ichingWater', ['belly', 'sacral'], 'depth, flow, adaptive coolness', 'parasympathetic', 'moderate', 'sacral'),
  s(439, 'mountain', ['root', 'spine'], 'stillness, solidity, boundary', 'balanced', 'moderate', 'root'),
  s(443, 'ichingEarth', ['belly', 'root', 'whole-body'], 'receptivity, heaviness, support', 'parasympathetic', 'moderate', 'root'),

  // ============= PLANETARY SYMBOLS =============
  s(503, 'planetSun', ['solar-plexus', 'heart'], 'radiance, warmth, vitality', 'sympathetic', 'moderate', 'solar-plexus'),
  s(509, 'planetMoon', ['belly', 'chest'], 'softening, heaviness, tidal pull', 'parasympathetic', 'moderate', 'sacral'),
  s(521, 'mercury', ['throat', 'hands', 'third-eye'], 'quickness, tingling, mental agility', 'sympathetic', 'subtle', 'throat'),
  s(523, 'venus', ['heart', 'sacral', 'skin'], 'warmth, attraction, softness', 'parasympathetic', 'moderate', 'heart'),
  s(541, 'mars', ['solar-plexus', 'hands', 'spine'], 'heat, aggression, muscular tension', 'sympathetic', 'strong', 'solar-plexus'),
  s(547, 'jupiter', ['chest', 'belly'], 'expansion, abundance, generosity', 'balanced', 'moderate', 'solar-plexus'),
  s(557, 'saturn', ['spine', 'root'], 'restriction, weight, cold density', 'parasympathetic', 'moderate', 'root'),
  s(563, 'uranus', ['crown', 'spine', 'skin'], 'electric shock, sudden awakening', 'sympathetic', 'strong', 'crown'),
  s(569, 'neptune', ['third-eye', 'whole-body'], 'dissolution, dreaminess, floating', 'parasympathetic', 'subtle', 'third-eye'),
  s(571, 'pluto', ['root', 'belly'], 'deep pressure, transformation, intensity', 'sympathetic', 'strong', 'root'),

  // ============= SACRED GEOMETRY =============
  s(601, 'vesicaPiscis', ['sacral', 'heart'], 'union, creation, womb warmth', 'balanced', 'subtle', 'sacral'),
  s(607, 'seedOfLife', ['belly', 'heart'], 'germination, potential, subtle pulse', 'balanced', 'subtle', 'sacral'),
  s(613, 'flowerOfLife', ['heart', 'whole-body'], 'interconnection, expansion, coherence', 'balanced', 'moderate', 'heart'),
  s(617, 'treeOfLife', ['spine', 'crown', 'root'], 'vertical alignment, channel flow', 'balanced', 'moderate', 'heart'),
  s(619, 'metatronsCube', ['third-eye', 'crown'], 'geometric precision, crystalline clarity', 'balanced', 'subtle', 'third-eye'),
  s(631, 'tetrahedron', ['solar-plexus', 'hands'], 'stability, fire, upward thrust', 'sympathetic', 'moderate', 'solar-plexus'),
  s(641, 'hexahedron', ['root', 'feet'], 'solidity, groundedness, weight', 'parasympathetic', 'moderate', 'root'),
  s(643, 'octahedron', ['heart', 'chest'], 'balance, air, lightness', 'balanced', 'subtle', 'heart'),
  s(647, 'dodecahedron', ['crown', 'whole-body'], 'cosmic expansion, transcendence', 'balanced', 'subtle', 'crown'),
  s(653, 'icosahedron', ['belly', 'sacral'], 'flow, water, emotional depth', 'parasympathetic', 'moderate', 'sacral'),
  s(659, 'merkaba', ['heart', 'crown', 'spine'], 'spinning, ascending, light body activation', 'balanced', 'strong', 'heart'),
  s(661, 'torus', ['whole-body', 'heart'], 'circulation, self-sustaining flow', 'balanced', 'moderate', 'heart'),
  s(673, 'fibonacci', ['whole-body', 'spine'], 'spiraling growth, harmonic unfolding', 'balanced', 'subtle', 'heart'),

  // ============= ELEMENTS =============
  s(31, 'fire', ['solar-plexus', 'hands'], 'heat, burning, activation', 'sympathetic', 'strong', 'solar-plexus'),
  s(37, 'water', ['belly', 'sacral'], 'flow, cooling, release', 'parasympathetic', 'moderate', 'sacral'),
  s(41, 'earth', ['root', 'feet'], 'heaviness, stability, grounding', 'parasympathetic', 'moderate', 'root'),
  s(43, 'air', ['chest', 'throat'], 'lightness, breath, expansion', 'balanced', 'subtle', 'throat'),
  s(47, 'aether', ['crown', 'whole-body'], 'transcendence, dissolution, spaciousness', 'balanced', 'subtle', 'crown'),

  // ============= CONCEPTS =============
  s(53, 'love', ['heart', 'chest'], 'warmth, expansion, tenderness', 'parasympathetic', 'moderate', 'heart'),
  s(59, 'death', ['whole-body', 'root'], 'coldness, release, dissolution', 'parasympathetic', 'strong', 'root'),
  s(61, 'time', ['belly', 'chest'], 'passage, rhythm, impermanence', 'balanced', 'subtle', 'heart'),
  s(67, 'truth', ['throat', 'solar-plexus'], 'clarity, alignment, resonance', 'balanced', 'moderate', 'throat'),
  s(71, 'chaos', ['belly', 'whole-body'], 'turbulence, disorientation, flux', 'sympathetic', 'moderate', 'sacral'),
  s(73, 'order', ['spine', 'third-eye'], 'alignment, structure, calm', 'parasympathetic', 'subtle', 'third-eye'),
  s(179, 'wisdom', ['third-eye', 'crown'], 'stillness, depth, knowing', 'balanced', 'subtle', 'third-eye'),
  s(181, 'power', ['solar-plexus', 'hands'], 'charge, force, intensity', 'sympathetic', 'strong', 'solar-plexus'),
  s(191, 'freedom', ['chest', 'limbs'], 'lightness, release, openness', 'balanced', 'moderate', 'heart'),
  s(193, 'unity', ['heart', 'whole-body'], 'merging, connection, warmth', 'balanced', 'moderate', 'heart'),
  s(197, 'duality', ['hands', 'feet'], 'polarity, tension, balance', 'balanced', 'subtle', 'heart'),
  s(199, 'creation', ['sacral', 'hands'], 'surge, fertility, outward flow', 'sympathetic', 'moderate', 'sacral'),

  // ============= CELESTIAL =============
  s(79, 'sun', ['solar-plexus', 'skin'], 'warmth, radiance, vitality', 'sympathetic', 'moderate', 'solar-plexus'),
  s(83, 'moon', ['belly', 'chest'], 'softness, reflection, tidal rhythm', 'parasympathetic', 'subtle', 'sacral'),
  s(89, 'star', ['crown', 'heart'], 'lightness, aspiration, cool radiance', 'balanced', 'subtle', 'crown'),
  s(97, 'void', ['whole-body', 'crown'], 'emptiness, spaciousness, stillness', 'parasympathetic', 'subtle', 'crown'),

  // ============= JOURNEY =============
  s(101, 'path', ['feet', 'spine'], 'direction, forward momentum', 'balanced', 'subtle', 'root'),
  s(103, 'threshold', ['belly', 'chest'], 'anticipation, pause, trembling', 'sympathetic', 'moderate', 'heart'),
  s(107, 'descent', ['belly', 'root'], 'sinking, heaviness, compression', 'parasympathetic', 'moderate', 'root'),
  s(109, 'ascent', ['spine', 'crown'], 'rising, lightening, uplift', 'sympathetic', 'moderate', 'crown'),
  s(113, 'return', ['heart', 'belly'], 'homecoming, settling, warmth', 'parasympathetic', 'subtle', 'heart'),

  // ============= WISDOM SYMBOLS =============
  s(127, 'serpent', ['spine', 'root', 'sacral'], 'coiling, rising energy, kundalini', 'balanced', 'strong', 'root'),
  s(131, 'tree', ['spine', 'feet', 'crown'], 'rooted extension, vertical flow', 'balanced', 'moderate', 'heart'),
  s(137, 'lotus', ['crown', 'heart'], 'opening, rising purity', 'balanced', 'subtle', 'crown'),
  s(139, 'eye', ['third-eye', 'skin'], 'awareness, perception, alertness', 'sympathetic', 'subtle', 'third-eye'),
  s(149, 'spiral', ['whole-body', 'belly'], 'rotation, expansion, dizziness', 'balanced', 'moderate', 'sacral'),

  // ============= EMOTIONS =============
  s(151, 'joy', ['heart', 'chest', 'skin'], 'lightness, warmth, bubbling', 'sympathetic', 'moderate', 'heart'),
  s(157, 'sorrow', ['chest', 'throat', 'belly'], 'heaviness, ache, contraction', 'parasympathetic', 'strong', 'heart'),
  s(163, 'fear', ['belly', 'spine'], 'cold, gripping, freeze', 'sympathetic', 'strong', 'root'),
  s(167, 'anger', ['solar-plexus', 'hands', 'jaw'], 'heat, tension, surge', 'sympathetic', 'strong', 'solar-plexus'),
  s(173, 'peace', ['heart', 'whole-body'], 'stillness, softness, warmth', 'parasympathetic', 'subtle', 'heart'),
];

// Build lookup maps for quick access
const primeToSomatic = new Map<number, SomaticEntry>();
const idToSomatic = new Map<string, SomaticEntry>();

SOMATIC_DATABASE.forEach(entry => {
  primeToSomatic.set(entry.prime, entry);
  idToSomatic.set(entry.symbolId, entry);
});

export function getSomaticByPrime(prime: number): SomaticMapping | undefined {
  return primeToSomatic.get(prime)?.somatic;
}

export function getSomaticById(id: string): SomaticMapping | undefined {
  return idToSomatic.get(id)?.somatic;
}

export function getAllSomaticEntries(): SomaticEntry[] {
  return SOMATIC_DATABASE;
}

// Aggregate somatic state from multiple symbols
export interface AggregateSomaticState {
  dominantRegions: { region: BodyRegion; intensity: number }[];
  nervousSystemBalance: number; // -1 = full parasympathetic, +1 = full sympathetic, 0 = balanced
  activeSensations: { sensation: string; intensity: SensationIntensity; regions: BodyRegion[] }[];
  overallIntensity: number; // 0-1
  activeEnergyCenters: string[];
}

export function aggregateSomaticState(primes: number[], amplitudes: number[]): AggregateSomaticState {
  const regionScores = new Map<BodyRegion, number>();
  const sensationMap = new Map<string, { intensity: SensationIntensity; regions: Set<BodyRegion>; score: number }>();
  const energyCenters = new Set<string>();
  
  let sympatheticScore = 0;
  let parasympatheticScore = 0;
  let balancedScore = 0;
  let totalIntensity = 0;
  let activeCount = 0;
  
  const intensityValue = { 'subtle': 0.3, 'moderate': 0.6, 'strong': 1.0 };
  
  primes.forEach((prime, i) => {
    const amplitude = amplitudes[i] || 0;
    if (amplitude < 0.1) return;
    
    const somatic = getSomaticByPrime(prime);
    if (!somatic) return;
    
    activeCount++;
    const weight = amplitude * intensityValue[somatic.intensity];
    
    // Accumulate region scores
    somatic.bodyRegions.forEach(region => {
      regionScores.set(region, (regionScores.get(region) || 0) + weight);
    });
    
    // Track sensations
    if (!sensationMap.has(somatic.sensation)) {
      sensationMap.set(somatic.sensation, { intensity: somatic.intensity, regions: new Set(), score: 0 });
    }
    const sensEntry = sensationMap.get(somatic.sensation)!;
    sensEntry.score += weight;
    somatic.bodyRegions.forEach(r => sensEntry.regions.add(r));
    if (intensityValue[somatic.intensity] > intensityValue[sensEntry.intensity]) {
      sensEntry.intensity = somatic.intensity;
    }
    
    // Nervous system balance
    if (somatic.nervousSystem === 'sympathetic') sympatheticScore += weight;
    else if (somatic.nervousSystem === 'parasympathetic') parasympatheticScore += weight;
    else balancedScore += weight;
    
    // Energy centers
    if (somatic.energyCenter) energyCenters.add(somatic.energyCenter);
    
    totalIntensity += weight;
  });
  
  // Normalize and sort regions
  const maxRegionScore = Math.max(...regionScores.values(), 1);
  const dominantRegions = Array.from(regionScores.entries())
    .map(([region, score]) => ({ region, intensity: score / maxRegionScore }))
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 7);
  
  // Calculate nervous system balance
  const totalNS = sympatheticScore + parasympatheticScore + balancedScore;
  let nervousSystemBalance = 0;
  if (totalNS > 0) {
    nervousSystemBalance = (sympatheticScore - parasympatheticScore) / totalNS;
  }
  
  // Sort sensations by score
  const activeSensations = Array.from(sensationMap.entries())
    .map(([sensation, data]) => ({
      sensation,
      intensity: data.intensity,
      regions: Array.from(data.regions)
    }))
    .sort((a, b) => sensationMap.get(b.sensation)!.score - sensationMap.get(a.sensation)!.score)
    .slice(0, 5);
  
  return {
    dominantRegions,
    nervousSystemBalance,
    activeSensations,
    overallIntensity: activeCount > 0 ? Math.min(totalIntensity / activeCount, 1) : 0,
    activeEnergyCenters: Array.from(energyCenters)
  };
}
