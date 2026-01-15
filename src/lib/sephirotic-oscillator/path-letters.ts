// The 22 Hebrew Letter Paths of the Tree of Life
// Each path connects two Sephirot and has transmission properties
// derived from gematria value and elemental/planetary associations

import type { SephirahName } from './types';

export type ElementType = 'fire' | 'water' | 'air' | 'earth';
export type PlanetaryType = 'saturn' | 'jupiter' | 'mars' | 'sun' | 'venus' | 'mercury' | 'moon';
export type ZodiacType = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 
                         'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface HebrewPath {
  id: string;
  letter: string;           // Hebrew letter
  letterName: string;       // Transliterated name
  gematria: number;         // Numerical value
  from: SephirahName;       // Source Sephirah
  to: SephirahName;         // Target Sephirah
  association: ElementType | PlanetaryType | ZodiacType;
  meaning: string;          // Letter meaning
  // Transmission properties derived from associations
  impedance: number;        // Resistance to energy flow (0-1)
  resonantFreq: number;     // Path's resonant frequency
  bandwidth: number;        // How broad the resonance is
}

// Elemental frequencies (based on traditional correspondences)
const ELEMENT_FREQ: Record<ElementType, number> = {
  fire: 528,    // Transformation
  water: 396,   // Liberation
  air: 639,     // Connection
  earth: 174    // Foundation
};

// Planetary frequencies (based on orbital harmonics, conceptual)
const PLANET_FREQ: Record<PlanetaryType, number> = {
  saturn: 147.85,
  jupiter: 183.58,
  mars: 289.44,
  sun: 126.22,
  venus: 221.23,
  mercury: 141.27,
  moon: 210.42
};

// Zodiac frequencies (derived from ruling planets + elemental modulation)
const ZODIAC_FREQ: Record<ZodiacType, number> = {
  aries: 319,
  taurus: 241,
  gemini: 161,
  cancer: 230,
  leo: 146,
  virgo: 161,
  libra: 241,
  scorpio: 309,
  sagittarius: 204,
  capricorn: 168,
  aquarius: 168,
  pisces: 204
};

// Element/planet impedance (affects how easily energy flows)
const ELEMENT_IMPEDANCE: Record<ElementType, number> = {
  fire: 0.2,   // Low resistance - fire transforms quickly
  water: 0.4,  // Medium - water flows but has mass
  air: 0.15,   // Very low - air moves freely
  earth: 0.7   // High - earth is solid, resistant
};

const PLANET_IMPEDANCE: Record<PlanetaryType, number> = {
  saturn: 0.8,   // Restriction, limitation
  jupiter: 0.2,  // Expansion, flow
  mars: 0.35,    // Force, but direct
  sun: 0.25,     // Central, radiant
  venus: 0.3,    // Attraction, receptive
  mercury: 0.15, // Quick, messenger
  moon: 0.5      // Reflective, cyclical
};

const ZODIAC_IMPEDANCE: Record<ZodiacType, number> = {
  aries: 0.25, taurus: 0.6, gemini: 0.2, cancer: 0.5,
  leo: 0.3, virgo: 0.45, libra: 0.35, scorpio: 0.55,
  sagittarius: 0.25, capricorn: 0.65, aquarius: 0.3, pisces: 0.45
};

function getFrequency(assoc: ElementType | PlanetaryType | ZodiacType): number {
  if (assoc in ELEMENT_FREQ) return ELEMENT_FREQ[assoc as ElementType];
  if (assoc in PLANET_FREQ) return PLANET_FREQ[assoc as PlanetaryType];
  return ZODIAC_FREQ[assoc as ZodiacType];
}

function getImpedance(assoc: ElementType | PlanetaryType | ZodiacType): number {
  if (assoc in ELEMENT_IMPEDANCE) return ELEMENT_IMPEDANCE[assoc as ElementType];
  if (assoc in PLANET_IMPEDANCE) return PLANET_IMPEDANCE[assoc as PlanetaryType];
  return ZODIAC_IMPEDANCE[assoc as ZodiacType];
}

// The 22 paths according to traditional Kircher/Golden Dawn arrangement
export const HEBREW_PATHS: HebrewPath[] = [
  // Three Mother Letters (Elements)
  {
    id: 'aleph', letter: 'א', letterName: 'Aleph', gematria: 1,
    from: 'keter', to: 'hokhmah', association: 'air',
    meaning: 'Ox, Breath',
    impedance: getImpedance('air'),
    resonantFreq: getFrequency('air') * (1 + 1/22), // Modulated by position
    bandwidth: 0.3 // Air is broad
  },
  {
    id: 'mem', letter: 'מ', letterName: 'Mem', gematria: 40,
    from: 'gevurah', to: 'hod', association: 'water',
    meaning: 'Water',
    impedance: getImpedance('water'),
    resonantFreq: getFrequency('water') * (1 + 13/22),
    bandwidth: 0.25
  },
  {
    id: 'shin', letter: 'ש', letterName: 'Shin', gematria: 300,
    from: 'hod', to: 'malkhut', association: 'fire',
    meaning: 'Tooth, Fire',
    impedance: getImpedance('fire'),
    resonantFreq: getFrequency('fire') * (1 + 21/22),
    bandwidth: 0.2
  },
  
  // Seven Double Letters (Planets)
  {
    id: 'beth', letter: 'ב', letterName: 'Beth', gematria: 2,
    from: 'keter', to: 'binah', association: 'mercury',
    meaning: 'House',
    impedance: getImpedance('mercury'),
    resonantFreq: getFrequency('mercury') * (1 + 2/22),
    bandwidth: 0.15
  },
  {
    id: 'gimel', letter: 'ג', letterName: 'Gimel', gematria: 3,
    from: 'keter', to: 'tiferet', association: 'moon',
    meaning: 'Camel',
    impedance: getImpedance('moon'),
    resonantFreq: getFrequency('moon') * (1 + 3/22),
    bandwidth: 0.2
  },
  {
    id: 'daleth', letter: 'ד', letterName: 'Daleth', gematria: 4,
    from: 'hokhmah', to: 'binah', association: 'venus',
    meaning: 'Door',
    impedance: getImpedance('venus'),
    resonantFreq: getFrequency('venus') * (1 + 4/22),
    bandwidth: 0.2
  },
  {
    id: 'kaph', letter: 'כ', letterName: 'Kaph', gematria: 20,
    from: 'hesed', to: 'nezah', association: 'jupiter',
    meaning: 'Palm',
    impedance: getImpedance('jupiter'),
    resonantFreq: getFrequency('jupiter') * (1 + 11/22),
    bandwidth: 0.25
  },
  {
    id: 'pe', letter: 'פ', letterName: 'Pe', gematria: 80,
    from: 'nezah', to: 'hod', association: 'mars',
    meaning: 'Mouth',
    impedance: getImpedance('mars'),
    resonantFreq: getFrequency('mars') * (1 + 17/22),
    bandwidth: 0.15
  },
  {
    id: 'resh', letter: 'ר', letterName: 'Resh', gematria: 200,
    from: 'hod', to: 'yesod', association: 'sun',
    meaning: 'Head',
    impedance: getImpedance('sun'),
    resonantFreq: getFrequency('sun') * (1 + 20/22),
    bandwidth: 0.2
  },
  {
    id: 'tav', letter: 'ת', letterName: 'Tav', gematria: 400,
    from: 'yesod', to: 'malkhut', association: 'saturn',
    meaning: 'Cross, Mark',
    impedance: getImpedance('saturn'),
    resonantFreq: getFrequency('saturn') * (1 + 22/22),
    bandwidth: 0.1
  },
  
  // Twelve Simple Letters (Zodiac)
  {
    id: 'he', letter: 'ה', letterName: 'He', gematria: 5,
    from: 'hokhmah', to: 'tiferet', association: 'aries',
    meaning: 'Window',
    impedance: getImpedance('aries'),
    resonantFreq: getFrequency('aries') * (1 + 5/22),
    bandwidth: 0.15
  },
  {
    id: 'vav', letter: 'ו', letterName: 'Vav', gematria: 6,
    from: 'hokhmah', to: 'hesed', association: 'taurus',
    meaning: 'Nail, Hook',
    impedance: getImpedance('taurus'),
    resonantFreq: getFrequency('taurus') * (1 + 6/22),
    bandwidth: 0.2
  },
  {
    id: 'zayin', letter: 'ז', letterName: 'Zayin', gematria: 7,
    from: 'binah', to: 'tiferet', association: 'gemini',
    meaning: 'Sword',
    impedance: getImpedance('gemini'),
    resonantFreq: getFrequency('gemini') * (1 + 7/22),
    bandwidth: 0.15
  },
  {
    id: 'cheth', letter: 'ח', letterName: 'Cheth', gematria: 8,
    from: 'binah', to: 'gevurah', association: 'cancer',
    meaning: 'Fence',
    impedance: getImpedance('cancer'),
    resonantFreq: getFrequency('cancer') * (1 + 8/22),
    bandwidth: 0.2
  },
  {
    id: 'teth', letter: 'ט', letterName: 'Teth', gematria: 9,
    from: 'hesed', to: 'gevurah', association: 'leo',
    meaning: 'Serpent',
    impedance: getImpedance('leo'),
    resonantFreq: getFrequency('leo') * (1 + 9/22),
    bandwidth: 0.15
  },
  {
    id: 'yod', letter: 'י', letterName: 'Yod', gematria: 10,
    from: 'hesed', to: 'tiferet', association: 'virgo',
    meaning: 'Hand',
    impedance: getImpedance('virgo'),
    resonantFreq: getFrequency('virgo') * (1 + 10/22),
    bandwidth: 0.15
  },
  {
    id: 'lamed', letter: 'ל', letterName: 'Lamed', gematria: 30,
    from: 'gevurah', to: 'tiferet', association: 'libra',
    meaning: 'Ox Goad',
    impedance: getImpedance('libra'),
    resonantFreq: getFrequency('libra') * (1 + 12/22),
    bandwidth: 0.2
  },
  {
    id: 'nun', letter: 'נ', letterName: 'Nun', gematria: 50,
    from: 'tiferet', to: 'nezah', association: 'scorpio',
    meaning: 'Fish',
    impedance: getImpedance('scorpio'),
    resonantFreq: getFrequency('scorpio') * (1 + 14/22),
    bandwidth: 0.15
  },
  {
    id: 'samekh', letter: 'ס', letterName: 'Samekh', gematria: 60,
    from: 'tiferet', to: 'yesod', association: 'sagittarius',
    meaning: 'Prop, Support',
    impedance: getImpedance('sagittarius'),
    resonantFreq: getFrequency('sagittarius') * (1 + 15/22),
    bandwidth: 0.2
  },
  {
    id: 'ayin', letter: 'ע', letterName: 'Ayin', gematria: 70,
    from: 'tiferet', to: 'hod', association: 'capricorn',
    meaning: 'Eye',
    impedance: getImpedance('capricorn'),
    resonantFreq: getFrequency('capricorn') * (1 + 16/22),
    bandwidth: 0.15
  },
  {
    id: 'tzaddi', letter: 'צ', letterName: 'Tzaddi', gematria: 90,
    from: 'nezah', to: 'yesod', association: 'aquarius',
    meaning: 'Fish Hook',
    impedance: getImpedance('aquarius'),
    resonantFreq: getFrequency('aquarius') * (1 + 18/22),
    bandwidth: 0.2
  },
  {
    id: 'qoph', letter: 'ק', letterName: 'Qoph', gematria: 100,
    from: 'nezah', to: 'malkhut', association: 'pisces',
    meaning: 'Back of Head',
    impedance: getImpedance('pisces'),
    resonantFreq: getFrequency('pisces') * (1 + 19/22),
    bandwidth: 0.2
  }
];

// Helper to find path between two sephirot
export function getPathBetween(from: SephirahName, to: SephirahName): HebrewPath | undefined {
  return HEBREW_PATHS.find(p => 
    (p.from === from && p.to === to) || 
    (p.from === to && p.to === from)
  );
}

// Get all paths connected to a sephirah
export function getPathsForSephirah(sephirahId: SephirahName): HebrewPath[] {
  return HEBREW_PATHS.filter(p => p.from === sephirahId || p.to === sephirahId);
}

// Calculate transmission coefficient through a path based on input frequency
export function calculatePathTransmission(
  path: HebrewPath, 
  inputFreq: number
): number {
  // Lorentzian response curve
  const detuning = Math.abs(inputFreq - path.resonantFreq);
  const halfWidth = path.resonantFreq * path.bandwidth;
  const resonanceResponse = 1 / (1 + Math.pow(detuning / halfWidth, 2));
  
  // Combine with impedance
  return resonanceResponse * (1 - path.impedance);
}

// Get association color for visualization
export function getAssociationColor(assoc: ElementType | PlanetaryType | ZodiacType): string {
  const colors: Record<string, string> = {
    // Elements
    fire: '#ef4444',
    water: '#3b82f6',
    air: '#fbbf24',
    earth: '#78716c',
    // Planets
    saturn: '#1e293b',
    jupiter: '#7c3aed',
    mars: '#dc2626',
    sun: '#f59e0b',
    venus: '#10b981',
    mercury: '#06b6d4',
    moon: '#94a3b8',
    // Zodiac (grouped by element)
    aries: '#f87171', leo: '#fb923c', sagittarius: '#fbbf24',
    taurus: '#4ade80', virgo: '#34d399', capricorn: '#a3e635',
    gemini: '#38bdf8', libra: '#22d3ee', aquarius: '#67e8f9',
    cancer: '#a78bfa', scorpio: '#c084fc', pisces: '#e879f9'
  };
  return colors[assoc] || '#ffffff';
}
