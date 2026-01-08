import { useState, useMemo } from 'react';
import ExamplePageWrapper, { ExampleConfig } from '@/components/ExamplePageWrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SedenionVisualizer from '@/components/SedenionVisualizer';

// Symbol database from tinyaleph 1.3.0
const SYMBOL_DATABASE: Record<string, {
  name: string;
  prime: number;
  category: string;
  culture: string;
  meaning: string;
  element?: string;
}> = {
  // Jungian Archetypes
  'THE_SELF': { name: 'The Self', prime: 2, category: 'archetype', culture: 'jungian', meaning: 'Unity and wholeness of personality' },
  'THE_SHADOW': { name: 'The Shadow', prime: 3, category: 'archetype', culture: 'jungian', meaning: 'Repressed aspects of personality' },
  'THE_ANIMA': { name: 'The Anima', prime: 5, category: 'archetype', culture: 'jungian', meaning: 'Feminine aspect in male psyche' },
  'THE_ANIMUS': { name: 'The Animus', prime: 7, category: 'archetype', culture: 'jungian', meaning: 'Masculine aspect in female psyche' },
  'THE_PERSONA': { name: 'The Persona', prime: 11, category: 'archetype', culture: 'jungian', meaning: 'Social mask presented to world' },
  'THE_WISE_OLD_MAN': { name: 'The Wise Old Man', prime: 13, category: 'archetype', culture: 'jungian', meaning: 'Knowledge, wisdom, guidance' },
  'THE_GREAT_MOTHER': { name: 'The Great Mother', prime: 17, category: 'archetype', culture: 'jungian', meaning: 'Nurturing, fertility, creation' },
  'THE_TRICKSTER': { name: 'The Trickster', prime: 19, category: 'archetype', culture: 'jungian', meaning: 'Chaos, change, rule-breaking' },
  'THE_HERO': { name: 'The Hero', prime: 23, category: 'archetype', culture: 'jungian', meaning: 'Courage, transformation, triumph' },
  'THE_CHILD': { name: 'The Child', prime: 29, category: 'archetype', culture: 'jungian', meaning: 'Innocence, potential, beginnings' },
  
  // Major Arcana (Tarot)
  'THE_FOOL': { name: 'The Fool', prime: 31, category: 'tarot', culture: 'western', meaning: 'New beginnings, innocence, spontaneity' },
  'THE_MAGICIAN': { name: 'The Magician', prime: 37, category: 'tarot', culture: 'western', meaning: 'Manifestation, willpower, skill' },
  'THE_HIGH_PRIESTESS': { name: 'The High Priestess', prime: 41, category: 'tarot', culture: 'western', meaning: 'Intuition, mystery, inner knowledge' },
  'THE_EMPRESS': { name: 'The Empress', prime: 43, category: 'tarot', culture: 'western', meaning: 'Abundance, fertility, nature' },
  'THE_EMPEROR': { name: 'The Emperor', prime: 47, category: 'tarot', culture: 'western', meaning: 'Authority, structure, control' },
  'THE_HIEROPHANT': { name: 'The Hierophant', prime: 53, category: 'tarot', culture: 'western', meaning: 'Tradition, conformity, spiritual wisdom' },
  'THE_LOVERS': { name: 'The Lovers', prime: 59, category: 'tarot', culture: 'western', meaning: 'Relationships, choices, harmony' },
  'THE_CHARIOT': { name: 'The Chariot', prime: 61, category: 'tarot', culture: 'western', meaning: 'Determination, willpower, victory' },
  'STRENGTH': { name: 'Strength', prime: 67, category: 'tarot', culture: 'western', meaning: 'Courage, inner power, compassion' },
  'THE_HERMIT': { name: 'The Hermit', prime: 71, category: 'tarot', culture: 'western', meaning: 'Soul-searching, introspection, guidance' },
  'WHEEL_OF_FORTUNE': { name: 'Wheel of Fortune', prime: 73, category: 'tarot', culture: 'western', meaning: 'Cycles, fate, turning points' },
  'JUSTICE': { name: 'Justice', prime: 79, category: 'tarot', culture: 'western', meaning: 'Fairness, truth, cause and effect' },
  'THE_HANGED_MAN': { name: 'The Hanged Man', prime: 83, category: 'tarot', culture: 'western', meaning: 'Sacrifice, release, new perspective' },
  'DEATH': { name: 'Death', prime: 89, category: 'tarot', culture: 'western', meaning: 'Endings, transformation, transition' },
  'TEMPERANCE': { name: 'Temperance', prime: 97, category: 'tarot', culture: 'western', meaning: 'Balance, moderation, patience' },
  'THE_DEVIL': { name: 'The Devil', prime: 101, category: 'tarot', culture: 'western', meaning: 'Shadow self, attachment, materialism' },
  'THE_TOWER': { name: 'The Tower', prime: 103, category: 'tarot', culture: 'western', meaning: 'Sudden change, revelation, upheaval' },
  'THE_STAR': { name: 'The Star', prime: 107, category: 'tarot', culture: 'western', meaning: 'Hope, inspiration, serenity' },
  'THE_MOON': { name: 'The Moon', prime: 109, category: 'tarot', culture: 'western', meaning: 'Illusion, intuition, unconscious' },
  'THE_SUN': { name: 'The Sun', prime: 113, category: 'tarot', culture: 'western', meaning: 'Joy, success, vitality' },
  'JUDGEMENT': { name: 'Judgement', prime: 127, category: 'tarot', culture: 'western', meaning: 'Rebirth, calling, absolution' },
  'THE_WORLD': { name: 'The World', prime: 131, category: 'tarot', culture: 'western', meaning: 'Completion, integration, accomplishment' },
  
  // I-Ching Trigrams
  'QIAN_HEAVEN': { name: 'Qián (Heaven)', prime: 137, category: 'iching', culture: 'chinese', meaning: 'Creative, strong, active', element: 'metal' },
  'KUN_EARTH': { name: 'Kūn (Earth)', prime: 139, category: 'iching', culture: 'chinese', meaning: 'Receptive, yielding, devoted', element: 'earth' },
  'ZHEN_THUNDER': { name: 'Zhèn (Thunder)', prime: 149, category: 'iching', culture: 'chinese', meaning: 'Arousing, movement, shock', element: 'wood' },
  'KAN_WATER': { name: 'Kǎn (Water)', prime: 151, category: 'iching', culture: 'chinese', meaning: 'Abysmal, danger, flow', element: 'water' },
  'GEN_MOUNTAIN': { name: 'Gèn (Mountain)', prime: 157, category: 'iching', culture: 'chinese', meaning: 'Keeping still, meditation, rest', element: 'earth' },
  'XUN_WIND': { name: 'Xùn (Wind)', prime: 163, category: 'iching', culture: 'chinese', meaning: 'Gentle, penetrating, wood', element: 'wood' },
  'LI_FIRE': { name: 'Lí (Fire)', prime: 167, category: 'iching', culture: 'chinese', meaning: 'Clinging, clarity, brightness', element: 'fire' },
  'DUI_LAKE': { name: 'Duì (Lake)', prime: 173, category: 'iching', culture: 'chinese', meaning: 'Joyous, pleasure, openness', element: 'metal' },
  
  // Egyptian Hieroglyphs
  'ANKH': { name: 'Ankh', prime: 179, category: 'hieroglyph', culture: 'egyptian', meaning: 'Eternal life, breath of life' },
  'EYE_OF_HORUS': { name: 'Eye of Horus', prime: 181, category: 'hieroglyph', culture: 'egyptian', meaning: 'Protection, royal power, health' },
  'SCARAB': { name: 'Scarab', prime: 191, category: 'hieroglyph', culture: 'egyptian', meaning: 'Transformation, rebirth, sun' },
  'DJED': { name: 'Djed', prime: 193, category: 'hieroglyph', culture: 'egyptian', meaning: 'Stability, Osiris, backbone' },
  'WAS_SCEPTER': { name: 'Was Scepter', prime: 197, category: 'hieroglyph', culture: 'egyptian', meaning: 'Power, dominion, authority' },
  'FEATHER_OF_MAAT': { name: 'Feather of Maat', prime: 199, category: 'hieroglyph', culture: 'egyptian', meaning: 'Truth, justice, cosmic order' },
  
  // Universal Symbols
  'YIN_YANG': { name: 'Yin-Yang', prime: 211, category: 'universal', culture: 'chinese', meaning: 'Balance, duality, harmony' },
  'OM': { name: 'Om', prime: 223, category: 'universal', culture: 'hindu', meaning: 'Universal sound, consciousness, creation' },
  'LOTUS': { name: 'Lotus', prime: 227, category: 'universal', culture: 'buddhist', meaning: 'Purity, enlightenment, rebirth' },
  'TREE_OF_LIFE': { name: 'Tree of Life', prime: 229, category: 'universal', culture: 'kabbalah', meaning: 'Creation, wisdom, divine structure' },
  'OUROBOROS': { name: 'Ouroboros', prime: 233, category: 'universal', culture: 'alchemical', meaning: 'Eternity, cycles, self-reflection' },
  'GOLDEN_SPIRAL': { name: 'Golden Spiral', prime: 239, category: 'universal', culture: 'mathematical', meaning: 'Divine proportion, natural growth' },
};

// Golden ratio for resonance detection
const PHI = (1 + Math.sqrt(5)) / 2;

// Helper to convert symbol to sedenion state
function symbolToState(symbolKey: string): number[] {
  const symbol = SYMBOL_DATABASE[symbolKey];
  if (!symbol) return new Array(16).fill(0);
  
  const sedenion = new Array(16).fill(0);
  const prime = symbol.prime;
  
  // Map prime to sedenion components
  for (let i = 0; i < 16; i++) {
    const phase = (i * prime * Math.PI) / 8;
    sedenion[i] = Math.cos(phase) / Math.sqrt(16);
  }
  
  // Normalize
  const norm = Math.sqrt(sedenion.reduce((sum, c) => sum + c * c, 0));
  return norm > 0 ? sedenion.map(c => c / norm) : sedenion;
}

// Calculate resonance between two symbols
function calculateResonance(s1: string, s2: string): number {
  const sym1 = SYMBOL_DATABASE[s1];
  const sym2 = SYMBOL_DATABASE[s2];
  if (!sym1 || !sym2) return 0;
  
  const state1 = symbolToState(s1);
  const state2 = symbolToState(s2);
  
  // Dot product coherence
  const coherence = state1.reduce((sum, c, i) => sum + c * state2[i], 0);
  
  // Golden ratio resonance check
  const ratio = Math.max(sym1.prime, sym2.prime) / Math.min(sym1.prime, sym2.prime);
  const goldenProximity = 1 - Math.abs(ratio - PHI) / PHI;
  
  return Math.abs(coherence) * (1 + Math.max(0, goldenProximity) * 0.5);
}

// Demo 1: Symbol Database Browser
const SymbolDatabaseDemo = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>('THE_FOOL');

  const categories = ['all', 'archetype', 'tarot', 'iching', 'hieroglyph', 'universal'];
  
  const filteredSymbols = useMemo(() => {
    return Object.entries(SYMBOL_DATABASE).filter(([key, symbol]) => {
      const matchesCategory = selectedCategory === 'all' || symbol.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        symbol.meaning.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  const selectedSymbolData = selectedSymbol ? SYMBOL_DATABASE[selectedSymbol] : null;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search symbols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredSymbols.length} symbols found (400+ in full database)
      </p>

      {/* Symbol Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
        {filteredSymbols.map(([key, symbol]) => (
          <Card
            key={key}
            className={`p-2 cursor-pointer transition-all ${
              selectedSymbol === key ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => setSelectedSymbol(key)}
          >
            <p className="text-sm font-medium truncate">{symbol.name}</p>
            <p className="text-xs text-muted-foreground">p={symbol.prime}</p>
          </Card>
        ))}
      </div>

      {/* Selected Symbol Details */}
      {selectedSymbolData && (
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold">{selectedSymbolData.name}</h3>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{selectedSymbolData.category}</Badge>
                <Badge variant="outline" className="capitalize">{selectedSymbolData.culture}</Badge>
                {selectedSymbolData.element && (
                  <Badge variant="outline" className="capitalize">{selectedSymbolData.element}</Badge>
                )}
              </div>
              <p className="mt-2 text-muted-foreground">{selectedSymbolData.meaning}</p>
              <p className="mt-2 font-mono text-primary">Prime: {selectedSymbolData.prime}</p>
            </div>
            <div>
              <SedenionVisualizer components={symbolToState(selectedSymbol!)} size="lg" animated />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Demo 2: Archetype Analysis
const ArchetypeAnalysisDemo = () => {
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>(['THE_HERO', 'THE_SHADOW']);

  const archetypes = Object.entries(SYMBOL_DATABASE)
    .filter(([, s]) => s.category === 'archetype');

  const toggleArchetype = (key: string) => {
    if (selectedArchetypes.includes(key)) {
      setSelectedArchetypes(selectedArchetypes.filter(a => a !== key));
    } else if (selectedArchetypes.length < 4) {
      setSelectedArchetypes([...selectedArchetypes, key]);
    }
  };

  const resonanceMatrix = useMemo(() => {
    return selectedArchetypes.map(a1 => 
      selectedArchetypes.map(a2 => calculateResonance(a1, a2))
    );
  }, [selectedArchetypes]);

  // Compose selected archetypes
  const composedState = useMemo(() => {
    if (selectedArchetypes.length === 0) return new Array(16).fill(0);
    
    const states = selectedArchetypes.map(a => symbolToState(a));
    const composed = new Array(16).fill(0);
    
    for (let i = 0; i < 16; i++) {
      composed[i] = states.reduce((sum, s) => sum + s[i], 0) / states.length;
    }
    
    const norm = Math.sqrt(composed.reduce((sum, c) => sum + c * c, 0));
    return norm > 0 ? composed.map(c => c / norm) : composed;
  }, [selectedArchetypes]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Select up to 4 Jungian archetypes to analyze their resonance patterns
      </p>

      {/* Archetype Selection */}
      <div className="flex flex-wrap gap-2">
        {archetypes.map(([key, symbol]) => (
          <Button
            key={key}
            variant={selectedArchetypes.includes(key) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleArchetype(key)}
          >
            {symbol.name}
          </Button>
        ))}
      </div>

      {selectedArchetypes.length >= 2 && (
        <>
          {/* Resonance Matrix */}
          <div>
            <h4 className="text-sm font-medium mb-2">Resonance Matrix</h4>
            <div className="overflow-x-auto">
              <table className="text-sm">
                <thead>
                  <tr>
                    <th className="p-2"></th>
                    {selectedArchetypes.map(a => (
                      <th key={a} className="p-2 text-xs">
                        {SYMBOL_DATABASE[a].name.replace('The ', '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedArchetypes.map((a1, i) => (
                    <tr key={a1}>
                      <td className="p-2 text-xs font-medium">
                        {SYMBOL_DATABASE[a1].name.replace('The ', '')}
                      </td>
                      {selectedArchetypes.map((a2, j) => (
                        <td 
                          key={a2} 
                          className="p-2 text-center font-mono"
                          style={{
                            backgroundColor: `hsl(${resonanceMatrix[i][j] * 120}, 70%, 50%, ${resonanceMatrix[i][j] * 0.5})`
                          }}
                        >
                          {resonanceMatrix[i][j].toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Composed State */}
          <div>
            <h4 className="text-sm font-medium mb-2">Composed Archetype State</h4>
            <div className="flex items-center gap-4">
              <SedenionVisualizer components={composedState} size="lg" animated />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Combined sedenion state from selected archetypes
                </p>
                <p className="text-xs font-mono mt-2">
                  Prime product: {selectedArchetypes.reduce((p, a) => p * SYMBOL_DATABASE[a].prime, 1)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Demo 3: Tarot Reading
const TarotReadingDemo = () => {
  const [spread, setSpread] = useState<string[]>([]);
  
  const tarotCards = Object.entries(SYMBOL_DATABASE)
    .filter(([, s]) => s.category === 'tarot');

  const drawSpread = () => {
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    setSpread(shuffled.slice(0, 3).map(([key]) => key));
  };

  const positions = ['Past', 'Present', 'Future'];

  return (
    <div className="space-y-6">
      <Button onClick={drawSpread}>Draw 3-Card Spread</Button>

      {spread.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {spread.map((key, i) => {
            const card = SYMBOL_DATABASE[key];
            return (
              <Card key={i} className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">{positions[i]}</p>
                <h3 className="text-lg font-bold">{card.name}</h3>
                <SedenionVisualizer components={symbolToState(key)} size="sm" animated />
                <p className="text-sm text-muted-foreground mt-2">{card.meaning}</p>
                <Badge variant="outline" className="mt-2">p={card.prime}</Badge>
              </Card>
            );
          })}
        </div>
      )}

      {spread.length === 3 && (
        <Card className="p-4">
          <h4 className="font-medium mb-2">Spread Resonance Analysis</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Past↔Present</p>
              <p className="text-lg font-bold text-primary">
                {calculateResonance(spread[0], spread[1]).toFixed(3)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Present↔Future</p>
              <p className="text-lg font-bold text-primary">
                {calculateResonance(spread[1], spread[2]).toFixed(3)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Past↔Future</p>
              <p className="text-lg font-bold text-primary">
                {calculateResonance(spread[0], spread[2]).toFixed(3)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Demo 4: I-Ching Consultation
const IChingDemo = () => {
  const [hexagram, setHexagram] = useState<string[]>([]);
  
  const trigrams = Object.entries(SYMBOL_DATABASE)
    .filter(([, s]) => s.category === 'iching');

  const castHexagram = () => {
    const shuffled = [...trigrams].sort(() => Math.random() - 0.5);
    setHexagram([shuffled[0][0], shuffled[1][0]]);
  };

  return (
    <div className="space-y-6">
      <Button onClick={castHexagram}>Cast Hexagram</Button>

      {hexagram.length === 2 && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {hexagram.map((key, i) => {
              const trigram = SYMBOL_DATABASE[key];
              return (
                <Card key={i} className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {i === 0 ? 'Lower Trigram' : 'Upper Trigram'}
                  </p>
                  <h3 className="text-lg font-bold">{trigram.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge>{trigram.element}</Badge>
                    <Badge variant="outline">p={trigram.prime}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{trigram.meaning}</p>
                  <SedenionVisualizer components={symbolToState(key)} size="sm" animated />
                </Card>
              );
            })}
          </div>

          <Card className="p-4">
            <h4 className="font-medium mb-2">Hexagram Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Combined prime: {SYMBOL_DATABASE[hexagram[0]].prime * SYMBOL_DATABASE[hexagram[1]].prime}
            </p>
            <p className="text-sm text-muted-foreground">
              Resonance: {calculateResonance(hexagram[0], hexagram[1]).toFixed(3)}
            </p>
          </Card>
        </>
      )}
    </div>
  );
};

// Demo 5: Cross-Cultural Mapping
const CrossCulturalDemo = () => {
  const [sourceSymbol, setSourceSymbol] = useState('THE_HERO');

  const allSymbols = Object.entries(SYMBOL_DATABASE);

  const resonances = useMemo(() => {
    return allSymbols
      .filter(([key]) => key !== sourceSymbol)
      .map(([key, symbol]) => ({
        key,
        symbol,
        resonance: calculateResonance(sourceSymbol, key)
      }))
      .sort((a, b) => b.resonance - a.resonance)
      .slice(0, 10);
  }, [sourceSymbol]);

  const sourceData = SYMBOL_DATABASE[sourceSymbol];

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Source Symbol</label>
        <select
          value={sourceSymbol}
          onChange={(e) => setSourceSymbol(e.target.value)}
          className="w-full p-2 rounded border bg-background"
        >
          {allSymbols.map(([key, symbol]) => (
            <option key={key} value={key}>{symbol.name} ({symbol.culture})</option>
          ))}
        </select>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <SedenionVisualizer components={symbolToState(sourceSymbol)} size="md" animated />
          <div>
            <h3 className="font-bold">{sourceData.name}</h3>
            <p className="text-sm text-muted-foreground">{sourceData.meaning}</p>
            <div className="flex gap-2 mt-2">
              <Badge className="capitalize">{sourceData.culture}</Badge>
              <Badge variant="outline">p={sourceData.prime}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h4 className="text-sm font-medium mb-2">Top 10 Resonant Symbols (Cross-Cultural)</h4>
        <div className="space-y-2">
          {resonances.map(({ key, symbol, resonance }) => (
            <div 
              key={key} 
              className="flex items-center justify-between p-2 rounded bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{symbol.name}</span>
                <Badge variant="outline" className="capitalize text-xs">{symbol.culture}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 rounded"
                  style={{
                    width: `${resonance * 100}px`,
                    backgroundColor: `hsl(${resonance * 120}, 70%, 50%)`
                  }}
                />
                <span className="font-mono text-sm">{resonance.toFixed(3)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Demo 6: Compound Symbol Builder
const CompoundSymbolDemo = () => {
  const [components, setComponents] = useState<string[]>(['THE_HERO', 'THE_SHADOW']);

  const allSymbols = Object.entries(SYMBOL_DATABASE);

  const addComponent = (key: string) => {
    if (!components.includes(key) && components.length < 4) {
      setComponents([...components, key]);
    }
  };

  const removeComponent = (key: string) => {
    setComponents(components.filter(c => c !== key));
  };

  const compoundPrime = components.reduce((p, c) => p * SYMBOL_DATABASE[c].prime, 1);

  const compoundState = useMemo(() => {
    if (components.length === 0) return new Array(16).fill(0);
    
    // Multiply sedenion states (simplified)
    let result = symbolToState(components[0]);
    
    for (let i = 1; i < components.length; i++) {
      const other = symbolToState(components[i]);
      const newResult = new Array(16).fill(0);
      
      // Simplified sedenion multiplication
      for (let j = 0; j < 16; j++) {
        for (let k = 0; k < 16; k++) {
          newResult[(j + k) % 16] += result[j] * other[k];
        }
      }
      
      const norm = Math.sqrt(newResult.reduce((sum, c) => sum + c * c, 0));
      result = norm > 0 ? newResult.map(c => c / norm) : newResult;
    }
    
    return result;
  }, [components]);

  // Check for golden ratio resonance
  const goldenCheck = useMemo(() => {
    if (components.length < 2) return null;
    
    const pairs: Array<{ s1: string; s2: string; ratio: number; isGolden: boolean }> = [];
    
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const p1 = SYMBOL_DATABASE[components[i]].prime;
        const p2 = SYMBOL_DATABASE[components[j]].prime;
        const ratio = Math.max(p1, p2) / Math.min(p1, p2);
        const isGolden = Math.abs(ratio - PHI) < 0.1;
        pairs.push({
          s1: SYMBOL_DATABASE[components[i]].name,
          s2: SYMBOL_DATABASE[components[j]].name,
          ratio,
          isGolden
        });
      }
    }
    
    return pairs;
  }, [components]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Build compound symbols by multiplying prime signatures (up to 4 components)
      </p>

      {/* Selected Components */}
      <div className="flex flex-wrap gap-2">
        {components.map(key => (
          <Badge 
            key={key} 
            variant="default"
            className="cursor-pointer"
            onClick={() => removeComponent(key)}
          >
            {SYMBOL_DATABASE[key].name} (p={SYMBOL_DATABASE[key].prime}) ×
          </Badge>
        ))}
      </div>

      {/* Add Symbol */}
      <select
        onChange={(e) => { addComponent(e.target.value); e.target.value = ''; }}
        className="w-full p-2 rounded border bg-background"
        value=""
      >
        <option value="">Add symbol...</option>
        {allSymbols
          .filter(([key]) => !components.includes(key))
          .map(([key, symbol]) => (
            <option key={key} value={key}>{symbol.name} (p={symbol.prime})</option>
          ))
        }
      </select>

      {/* Compound Result */}
      <Card className="p-4">
        <h4 className="font-medium mb-2">Compound Symbol</h4>
        <div className="flex items-center gap-4">
          <SedenionVisualizer components={compoundState} size="lg" animated />
          <div>
            <p className="font-mono text-2xl text-primary">{compoundPrime}</p>
            <p className="text-sm text-muted-foreground">Compound prime</p>
            <p className="text-xs font-mono mt-2">
              = {components.map(c => SYMBOL_DATABASE[c].prime).join(' × ')}
            </p>
          </div>
        </div>
      </Card>

      {/* Golden Ratio Check */}
      {goldenCheck && goldenCheck.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-2">Golden Ratio Resonance (φ ≈ 1.618)</h4>
          <div className="space-y-2 text-sm">
            {goldenCheck.map((pair, i) => (
              <div 
                key={i} 
                className={`flex justify-between p-2 rounded ${pair.isGolden ? 'bg-amber-500/20' : 'bg-muted/30'}`}
              >
                <span>{pair.s1} ↔ {pair.s2}</span>
                <span className={`font-mono ${pair.isGolden ? 'text-amber-400 font-bold' : ''}`}>
                  {pair.ratio.toFixed(3)} {pair.isGolden && '✦ Golden!'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Example configurations
const examples: ExampleConfig[] = [
  {
    id: 'symbol-database',
    number: '1',
    title: 'Symbol Database',
    subtitle: '400+ Sacred Symbols',
    description: 'Browse the comprehensive symbol database featuring Jungian archetypes, Tarot Major Arcana, I-Ching trigrams, Egyptian hieroglyphs, and universal symbols. Each symbol has a unique prime assignment for hypercomplex encoding.',
    concepts: ['Prime Assignment', 'Symbol Categories', 'Cultural Tags', 'Sedenion States'],
    code: `import { SymbolDatabase } from '@aleph-ai/tinyaleph';

// Access 400+ symbols with prime assignments
const symbols = SymbolDatabase.all();

// Filter by category
const archetypes = SymbolDatabase.byCategory('archetype');
const tarot = SymbolDatabase.byCategory('tarot');
const iching = SymbolDatabase.byCategory('iching');

// Get symbol details
const hero = SymbolDatabase.get('THE_HERO');
console.log(hero.name);    // "The Hero"
console.log(hero.prime);   // 23
console.log(hero.meaning); // "Courage, transformation, triumph"`,
  },
  {
    id: 'archetype-analysis',
    number: '2',
    title: 'Archetype Analysis',
    subtitle: 'Jungian Psychology',
    description: 'Analyze resonance patterns between Jungian archetypes. See how The Hero relates to The Shadow, The Anima, and other fundamental patterns of the collective unconscious.',
    concepts: ['Jungian Archetypes', 'Resonance Matrix', 'State Composition', 'Golden Ratio'],
    code: `import { SymbolDatabase, Sedenion } from '@aleph-ai/tinyaleph';

const hero = SymbolDatabase.get('THE_HERO');
const shadow = SymbolDatabase.get('THE_SHADOW');

// Get sedenion states
const heroState = hero.toSedenion();
const shadowState = shadow.toSedenion();

// Calculate resonance (inner product)
const resonance = heroState.dot(shadowState);
console.log('Hero-Shadow resonance:', resonance);

// Compose archetypes
const composed = heroState.add(shadowState).normalize();
console.log('Composed state:', composed.c);`,
  },
  {
    id: 'tarot-reading',
    number: '3',
    title: 'Tarot Reading',
    subtitle: 'Major Arcana Spreads',
    description: 'Draw Tarot spreads and analyze the resonance patterns between cards. Past, Present, and Future positions reveal how archetypal energies interact across time.',
    concepts: ['Tarot Major Arcana', 'Spread Analysis', 'Temporal Resonance', 'Symbolic Narrative'],
    code: `import { TarotDeck, SpreadAnalyzer } from '@aleph-ai/tinyaleph';

const deck = new TarotDeck();

// Draw 3-card spread
const spread = deck.draw(3);
const [past, present, future] = spread;

console.log('Past:', past.name);
console.log('Present:', present.name);
console.log('Future:', future.name);

// Analyze spread resonance
const analysis = SpreadAnalyzer.analyze(spread);
console.log('Past→Present:', analysis.resonance(0, 1));
console.log('Present→Future:', analysis.resonance(1, 2));`,
  },
  {
    id: 'iching',
    number: '4',
    title: 'I-Ching Consultation',
    subtitle: 'Trigram Combinations',
    description: 'Cast hexagrams from the 8 trigrams of the I-Ching. Each trigram represents elemental forces (Heaven, Earth, Thunder, Water, Mountain, Wind, Fire, Lake) with associated prime encodings.',
    concepts: ['I-Ching Trigrams', 'Hexagram Formation', 'Elemental Balance', 'Chinese Philosophy'],
    code: `import { IChing } from '@aleph-ai/tinyaleph';

const iching = new IChing();

// Cast hexagram (two trigrams)
const hexagram = iching.cast();

console.log('Lower:', hexagram.lower.name);
console.log('Upper:', hexagram.upper.name);
console.log('Combined prime:', hexagram.prime);

// Elemental analysis
console.log('Lower element:', hexagram.lower.element);
console.log('Upper element:', hexagram.upper.element);`,
  },
  {
    id: 'cross-cultural',
    number: '5',
    title: 'Cross-Cultural Mapping',
    subtitle: 'Universal Resonance',
    description: 'Find resonant symbols across different cultures. Discover how The Hero archetype resonates with Tarot\'s The Chariot, I-Ching\'s Heaven trigram, and the Egyptian Scarab.',
    concepts: ['Cross-Cultural Analysis', 'Resonance Ranking', 'Universal Patterns', 'Cultural Tags'],
    code: `import { SymbolDatabase, ResonanceAnalyzer } from '@aleph-ai/tinyaleph';

const hero = SymbolDatabase.get('THE_HERO');

// Find resonant symbols across all cultures
const resonances = ResonanceAnalyzer.findResonant(hero, {
  crossCultural: true,
  topK: 10
});

resonances.forEach(({ symbol, resonance }) => {
  console.log(\`\${symbol.name} (\${symbol.culture}): \${resonance.toFixed(3)}\`);
});`,
  },
  {
    id: 'compound-symbols',
    number: '6',
    title: 'Compound Symbols',
    subtitle: 'Prime Multiplication',
    description: 'Build compound symbols by multiplying prime signatures. The compound prime captures the unique semantic intersection of multiple symbols. Golden ratio detection highlights harmonious combinations.',
    concepts: ['Prime Multiplication', 'Symbol Composition', 'Golden Ratio', 'Semantic Intersection'],
    code: `import { SymbolDatabase, CompoundSymbol } from '@aleph-ai/tinyaleph';

const hero = SymbolDatabase.get('THE_HERO');     // p=23
const shadow = SymbolDatabase.get('THE_SHADOW'); // p=3

// Create compound symbol
const compound = CompoundSymbol.create([hero, shadow]);

console.log('Compound prime:', compound.prime); // 23 × 3 = 69
console.log('Sedenion state:', compound.toSedenion().c);

// Check for golden ratio resonance
const PHI = 1.618033988749895;
const ratio = 23 / 3; // ≈ 7.67
console.log('Golden proximity:', Math.abs(ratio - PHI));`,
  },
];

const exampleComponents: Record<string, React.FC> = {
  'symbol-database': SymbolDatabaseDemo,
  'archetype-analysis': ArchetypeAnalysisDemo,
  'tarot-reading': TarotReadingDemo,
  'iching': IChingDemo,
  'cross-cultural': CrossCulturalDemo,
  'compound-symbols': CompoundSymbolDemo,
};

const SymbolicAIExamples = () => {
  return (
    <ExamplePageWrapper
      category="Applications"
      title="Symbolic AI"
      description="Explore the 400+ symbol database featuring Jungian archetypes, Tarot, I-Ching, and cross-cultural resonance analysis from tinyaleph 1.3.0"
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'DNA Computer', path: '/dna-computer' }}
      nextSection={{ title: 'Circuit Runner', path: '/circuit-runner' }}
    />
  );
};

export default SymbolicAIExamples;
