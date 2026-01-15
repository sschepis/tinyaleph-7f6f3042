// Hebrew Word Recognition
// Maps common Hebrew words and their meanings for the word analysis panel

import type { SephirahName } from './types';

export interface HebrewWord {
  letters: string;      // Hebrew letters
  transliteration: string;
  meaning: string;
  category: 'divine' | 'mystical' | 'elemental' | 'action' | 'state';
}

// Common Hebrew/Kabbalistic words that can form from the path letters
export const HEBREW_WORDS: HebrewWord[] = [
  // Divine names and concepts
  { letters: 'אב', transliteration: 'Av', meaning: 'Father', category: 'divine' },
  { letters: 'אם', transliteration: 'Em', meaning: 'Mother', category: 'divine' },
  { letters: 'אל', transliteration: 'El', meaning: 'God', category: 'divine' },
  { letters: 'יה', transliteration: 'Yah', meaning: 'Divine Name', category: 'divine' },
  { letters: 'שם', transliteration: 'Shem', meaning: 'Name', category: 'divine' },
  { letters: 'אש', transliteration: 'Esh', meaning: 'Fire', category: 'elemental' },
  { letters: 'מים', transliteration: 'Mayim', meaning: 'Water', category: 'elemental' },
  { letters: 'רוח', transliteration: 'Ruach', meaning: 'Spirit/Wind', category: 'elemental' },
  
  // Mystical terms
  { letters: 'אור', transliteration: 'Or', meaning: 'Light', category: 'mystical' },
  { letters: 'חי', transliteration: 'Chai', meaning: 'Life', category: 'mystical' },
  { letters: 'לב', transliteration: 'Lev', meaning: 'Heart', category: 'mystical' },
  { letters: 'נר', transliteration: 'Ner', meaning: 'Candle/Light', category: 'mystical' },
  { letters: 'דם', transliteration: 'Dam', meaning: 'Blood', category: 'mystical' },
  { letters: 'גן', transliteration: 'Gan', meaning: 'Garden', category: 'mystical' },
  { letters: 'עץ', transliteration: 'Etz', meaning: 'Tree', category: 'mystical' },
  { letters: 'פה', transliteration: 'Peh', meaning: 'Mouth', category: 'mystical' },
  { letters: 'יד', transliteration: 'Yad', meaning: 'Hand', category: 'mystical' },
  { letters: 'עין', transliteration: 'Ayin', meaning: 'Eye', category: 'mystical' },
  
  // States and qualities
  { letters: 'טוב', transliteration: 'Tov', meaning: 'Good', category: 'state' },
  { letters: 'רע', transliteration: 'Ra', meaning: 'Evil/Bad', category: 'state' },
  { letters: 'שלם', transliteration: 'Shalem', meaning: 'Complete/Whole', category: 'state' },
  { letters: 'קדש', transliteration: 'Kadosh', meaning: 'Holy', category: 'state' },
  { letters: 'חכם', transliteration: 'Chakham', meaning: 'Wise', category: 'state' },
  { letters: 'צדק', transliteration: 'Tzedek', meaning: 'Justice', category: 'state' },
  
  // Actions
  { letters: 'בא', transliteration: 'Ba', meaning: 'Come', category: 'action' },
  { letters: 'הלך', transliteration: 'Halakh', meaning: 'Walk/Go', category: 'action' },
  { letters: 'נתן', transliteration: 'Natan', meaning: 'Give', category: 'action' },
  { letters: 'שמע', transliteration: 'Shema', meaning: 'Hear/Listen', category: 'action' },
  { letters: 'ראה', transliteration: 'Raah', meaning: 'See', category: 'action' },
  
  // Two-letter combinations from paths
  { letters: 'אמ', transliteration: 'Am', meaning: 'Nation/People', category: 'mystical' },
  { letters: 'בג', transliteration: 'Bag', meaning: 'Pattern', category: 'mystical' },
  { letters: 'גד', transliteration: 'Gad', meaning: 'Fortune', category: 'mystical' },
  { letters: 'דה', transliteration: 'Dah', meaning: 'This', category: 'mystical' },
  { letters: 'הו', transliteration: 'Hav', meaning: 'Give!', category: 'action' },
  { letters: 'זח', transliteration: 'Zach', meaning: 'Pure', category: 'state' },
  { letters: 'טי', transliteration: 'Ti', meaning: 'Clay', category: 'elemental' },
  { letters: 'כל', transliteration: 'Kol', meaning: 'All/Every', category: 'mystical' },
  { letters: 'מן', transliteration: 'Man', meaning: 'Manna/From', category: 'divine' },
  { letters: 'נס', transliteration: 'Nes', meaning: 'Miracle', category: 'divine' },
  { letters: 'עפ', transliteration: 'Af', meaning: 'Also/Anger', category: 'state' },
  { letters: 'פצ', transliteration: 'Patz', meaning: 'Burst', category: 'action' },
  { letters: 'קר', transliteration: 'Kar', meaning: 'Cold', category: 'state' },
  { letters: 'רש', transliteration: 'Rash', meaning: 'Poor/Head', category: 'state' },
  { letters: 'שת', transliteration: 'Shet', meaning: 'Foundation', category: 'mystical' },
];

// Find words in a letter stream
export function findWordsInStream(letterStream: string[]): { word: HebrewWord; startIndex: number; endIndex: number }[] {
  const found: { word: HebrewWord; startIndex: number; endIndex: number }[] = [];
  const stream = letterStream.join('');
  
  // Sort words by length (longer first) to find longer matches
  const sortedWords = [...HEBREW_WORDS].sort((a, b) => b.letters.length - a.letters.length);
  
  for (const word of sortedWords) {
    let searchStart = 0;
    let index = stream.indexOf(word.letters, searchStart);
    
    while (index !== -1) {
      // Check if this position is already covered by a longer word
      const alreadyCovered = found.some(f => 
        (index >= f.startIndex && index < f.endIndex) ||
        (index + word.letters.length > f.startIndex && index + word.letters.length <= f.endIndex)
      );
      
      if (!alreadyCovered) {
        found.push({
          word,
          startIndex: index,
          endIndex: index + word.letters.length
        });
      }
      
      searchStart = index + 1;
      index = stream.indexOf(word.letters, searchStart);
    }
  }
  
  // Sort by position
  return found.sort((a, b) => a.startIndex - b.startIndex);
}

// Track path activations to build letter stream
export interface PathActivation {
  pathId: string;
  letter: string;
  letterName: string;
  timestamp: number;
  energy: number;
  from: SephirahName;
  to: SephirahName;
  sequence?: number; // Order in which letter was added to stream
}

// Get category color
export function getCategoryColor(category: HebrewWord['category']): string {
  const colors = {
    divine: '#fbbf24',
    mystical: '#a855f7',
    elemental: '#06b6d4',
    action: '#22c55e',
    state: '#f97316'
  };
  return colors[category];
}
