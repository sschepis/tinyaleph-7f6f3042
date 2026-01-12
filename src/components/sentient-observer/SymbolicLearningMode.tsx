import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Sparkles, 
  Play,
  Plus,
  Trash2,
  GraduationCap,
  Wand2,
  Save,
  RotateCcw,
  ChevronRight,
  Brain,
  Loader2,
  Network
} from 'lucide-react';
import { TransitionNetworkGraph } from './TransitionNetworkGraph';
import { SYMBOL_DATABASE } from '@/lib/symbolic-mind/symbol-database';
import type { SymbolicSymbol } from '@/lib/symbolic-mind/types';
import type { Oscillator } from './types';
import { supabase } from '@/integrations/supabase/client';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface NarrativePattern {
  id: string;
  name: string;
  description: string;
  sequence: SymbolicSymbol[];
  transitions: { from: string; to: string; weight: number }[];
}

interface LearnedModel {
  patterns: NarrativePattern[];
  transitionMatrix: Map<string, Map<string, number>>;
  startSymbols: Map<string, number>;
}

interface SymbolicLearningModeProps {
  oscillators: Oscillator[];
  coherence: number;
  onExciteOscillators: (primes: number[], amplitudes: number[]) => void;
  isRunning: boolean;
}

// Get symbol categories for picker
function getSymbolCategories(): { category: string; symbols: SymbolicSymbol[] }[] {
  const allSymbols = Object.values(SYMBOL_DATABASE);
  const byCategory: Record<string, SymbolicSymbol[]> = {};
  
  for (const symbol of allSymbols) {
    if (!byCategory[symbol.category]) {
      byCategory[symbol.category] = [];
    }
    byCategory[symbol.category].push(symbol);
  }
  
  return Object.entries(byCategory)
    .map(([category, symbols]) => ({ category, symbols: symbols.slice(0, 12) }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

// Preset narrative structures
const NARRATIVE_TEMPLATES: Omit<NarrativePattern, 'id'>[] = [
  {
    name: "Hero's Journey",
    description: "The classic monomyth pattern of departure, initiation, and return",
    sequence: [
      SYMBOL_DATABASE.child,
      SYMBOL_DATABASE.threshold,
      SYMBOL_DATABASE.hero,
      SYMBOL_DATABASE.descent,
      SYMBOL_DATABASE.shadow,
      SYMBOL_DATABASE.fire,
      SYMBOL_DATABASE.ascent,
      SYMBOL_DATABASE.self,
      SYMBOL_DATABASE.return,
    ].filter(Boolean),
    transitions: []
  },
  {
    name: "Death & Rebirth",
    description: "Transformation through symbolic death and renewal",
    sequence: [
      SYMBOL_DATABASE.self,
      SYMBOL_DATABASE.chaos,
      SYMBOL_DATABASE.death,
      SYMBOL_DATABASE.void,
      SYMBOL_DATABASE.star,
      SYMBOL_DATABASE.creation,
      SYMBOL_DATABASE.child,
    ].filter(Boolean),
    transitions: []
  },
  {
    name: "Love Story",
    description: "The journey of connection and union",
    sequence: [
      SYMBOL_DATABASE.anima,
      SYMBOL_DATABASE.animus,
      SYMBOL_DATABASE.threshold,
      SYMBOL_DATABASE.lovers,
      SYMBOL_DATABASE.fire,
      SYMBOL_DATABASE.water,
      SYMBOL_DATABASE.unity,
      SYMBOL_DATABASE.love,
    ].filter(Boolean),
    transitions: []
  },
  {
    name: "Wisdom Quest",
    description: "Seeking knowledge and enlightenment",
    sequence: [
      SYMBOL_DATABASE.fool,
      SYMBOL_DATABASE.path,
      SYMBOL_DATABASE.hermit,
      SYMBOL_DATABASE.serpent,
      SYMBOL_DATABASE.eye,
      SYMBOL_DATABASE.lotus,
      SYMBOL_DATABASE.sage,
      SYMBOL_DATABASE.wisdom,
    ].filter(Boolean),
    transitions: []
  },
];

export function SymbolicLearningMode({ oscillators, coherence, onExciteOscillators, isRunning }: SymbolicLearningModeProps) {
  const [mode, setMode] = useState<'teach' | 'generate' | 'network'>('teach');
  const [patterns, setPatterns] = useState<NarrativePattern[]>([]);
  const [currentSequence, setCurrentSequence] = useState<SymbolicSymbol[]>([]);
  const [patternName, setPatternName] = useState('');
  const [patternDescription, setPatternDescription] = useState('');
  const [generatedStory, setGeneratedStory] = useState<SymbolicSymbol[]>([]);
  const [llmNarrative, setLlmNarrative] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyLength, setStoryLength] = useState(7);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const symbolCategories = useMemo(() => getSymbolCategories(), []);
  
  // Build transition model from patterns
  const learnedModel = useMemo((): LearnedModel => {
    const transitionMatrix = new Map<string, Map<string, number>>();
    const startSymbols = new Map<string, number>();
    
    for (const pattern of patterns) {
      // Track starting symbols
      if (pattern.sequence.length > 0) {
        const startId = pattern.sequence[0].id;
        startSymbols.set(startId, (startSymbols.get(startId) || 0) + 1);
      }
      
      // Build transition counts
      for (let i = 0; i < pattern.sequence.length - 1; i++) {
        const from = pattern.sequence[i].id;
        const to = pattern.sequence[i + 1].id;
        
        if (!transitionMatrix.has(from)) {
          transitionMatrix.set(from, new Map());
        }
        const toMap = transitionMatrix.get(from)!;
        toMap.set(to, (toMap.get(to) || 0) + 1);
      }
    }
    
    return { patterns, transitionMatrix, startSymbols };
  }, [patterns]);
  
  const addSymbolToSequence = useCallback((symbol: SymbolicSymbol) => {
    setCurrentSequence(prev => [...prev, symbol]);
  }, []);
  
  const removeFromSequence = useCallback((index: number) => {
    setCurrentSequence(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const savePattern = useCallback(() => {
    if (currentSequence.length < 2 || !patternName.trim()) return;
    
    const newPattern: NarrativePattern = {
      id: `pattern_${Date.now()}`,
      name: patternName.trim(),
      description: patternDescription.trim() || 'Custom narrative pattern',
      sequence: currentSequence,
      transitions: []
    };
    
    setPatterns(prev => [...prev, newPattern]);
    setCurrentSequence([]);
    setPatternName('');
    setPatternDescription('');
  }, [currentSequence, patternName, patternDescription]);
  
  const addPresetPattern = useCallback((template: Omit<NarrativePattern, 'id'>) => {
    const newPattern: NarrativePattern = {
      ...template,
      id: `pattern_${Date.now()}`
    };
    setPatterns(prev => [...prev, newPattern]);
  }, []);
  
  const removePattern = useCallback((id: string) => {
    setPatterns(prev => prev.filter(p => p.id !== id));
  }, []);
  
  // Generate story based on learned patterns
  const generateStory = useCallback(async () => {
    if (patterns.length === 0) return;
    
    setIsGenerating(true);
    const story: SymbolicSymbol[] = [];
    const allSymbols = Object.values(SYMBOL_DATABASE);
    
    // Pick starting symbol based on learned distribution
    const startEntries = Array.from(learnedModel.startSymbols.entries());
    if (startEntries.length > 0) {
      const totalStarts = startEntries.reduce((s, [, c]) => s + c, 0);
      let r = Math.random() * totalStarts;
      for (const [symbolId, count] of startEntries) {
        r -= count;
        if (r <= 0) {
          const sym = allSymbols.find(s => s.id === symbolId);
          if (sym) story.push(sym);
          break;
        }
      }
    }
    
    // If no start found, pick random from first pattern
    if (story.length === 0 && patterns[0]?.sequence[0]) {
      story.push(patterns[0].sequence[0]);
    }
    
    // Generate rest of story using Markov chain + oscillator influence
    while (story.length < storyLength) {
      const lastSymbol = story[story.length - 1];
      const transitions = learnedModel.transitionMatrix.get(lastSymbol.id);
      
      let nextSymbol: SymbolicSymbol | null = null;
      
      if (transitions && transitions.size > 0) {
        // Use learned transitions with oscillator bias
        const entries = Array.from(transitions.entries());
        const total = entries.reduce((s, [, c]) => s + c, 0);
        
        // Add oscillator influence
        const oscillatorBias = oscillators
          .filter(o => o.amplitude > 0.3)
          .sort((a, b) => b.amplitude - a.amplitude)
          .slice(0, 5)
          .map(o => o.prime);
        
        // Weight by both transitions and oscillator resonance
        const weighted = entries.map(([symbolId, count]) => {
          const sym = allSymbols.find(s => s.id === symbolId);
          let weight = count / total;
          if (sym && oscillatorBias.includes(sym.prime)) {
            weight *= 2; // Boost symbols that resonate with active oscillators
          }
          return { symbolId, weight };
        });
        
        const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
        let r = Math.random() * totalWeight;
        
        for (const { symbolId, weight } of weighted) {
          r -= weight;
          if (r <= 0) {
            nextSymbol = allSymbols.find(s => s.id === symbolId) || null;
            break;
          }
        }
      }
      
      // Fallback: use oscillator-influenced random selection
      if (!nextSymbol) {
        const activeOscillators = oscillators
          .filter(o => o.amplitude > 0.2)
          .sort((a, b) => b.amplitude - a.amplitude)
          .slice(0, 10);
        
        if (activeOscillators.length > 0) {
          const targetPrime = activeOscillators[Math.floor(Math.random() * activeOscillators.length)].prime;
          nextSymbol = allSymbols.find(s => s.prime === targetPrime) || 
                       allSymbols[Math.floor(Math.random() * allSymbols.length)];
        } else {
          nextSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
        }
      }
      
      if (nextSymbol) {
        story.push(nextSymbol);
        
        // Excite oscillators as we generate
        onExciteOscillators([nextSymbol.prime], [0.5]);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    setGeneratedStory(story);
    
    // Get LLM to narrate the story
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/symbolic-mind`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userMessage: `Create a short narrative or story based on this symbolic sequence. Each symbol represents a story beat. Make it poetic and meaningful: ${story.map(s => `${s.unicode} ${s.name} (${s.meaning})`).join(' → ')}`,
          symbolicOutput: story,
          anchoringSymbols: story.slice(0, 3),
          coherenceScore: coherence,
          conversationHistory: [],
          systemPromptOverride: "You are a mythic storyteller. Transform symbolic sequences into evocative micro-narratives. Be poetic, use metaphor, and honor the archetypal meanings. Keep it to 2-3 paragraphs."
        }),
      });
      
      if (resp.ok && resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let narrative = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          textBuffer += decoder.decode(value, { stream: true });
          
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                narrative += content;
                setLlmNarrative(narrative);
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("Narrative generation error:", error);
      setLlmNarrative(story.map(s => s.meaning).join('. '));
    }
    
    setIsGenerating(false);
  }, [patterns, learnedModel, oscillators, storyLength, coherence, onExciteOscillators]);
  
  const resetGeneration = useCallback(() => {
    setGeneratedStory([]);
    setLlmNarrative('');
  }, []);
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Symbolic Learning
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {patterns.length} patterns
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Teach narrative patterns • Generate symbolic stories
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden p-3">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'teach' | 'generate' | 'network')}>
          <TabsList className="w-full grid grid-cols-3 h-8">
            <TabsTrigger value="teach" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Teach
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs">
              <Network className="h-3 w-3 mr-1" />
              Network
            </TabsTrigger>
            <TabsTrigger value="generate" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              Generate
            </TabsTrigger>
          </TabsList>
          
          {/* TEACH MODE */}
          <TabsContent value="teach" className="mt-2 flex-1 flex flex-col gap-2 overflow-hidden">
            {/* Preset Templates */}
            <div className="flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-1">Quick Add Templates:</p>
              <div className="flex flex-wrap gap-1">
                {NARRATIVE_TEMPLATES.map((template, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => addPresetPattern(template)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Current Sequence Builder */}
            <div className="flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-1">Build Custom Pattern:</p>
              <div className="flex gap-2 mb-2">
                <Input
                  value={patternName}
                  onChange={e => setPatternName(e.target.value)}
                  placeholder="Pattern name..."
                  className="h-7 text-xs flex-1"
                />
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  disabled={currentSequence.length < 2 || !patternName.trim()}
                  onClick={savePattern}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
              
              {currentSequence.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 rounded-lg mb-2">
                  {currentSequence.map((s, i) => (
                    <React.Fragment key={i}>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer text-xs"
                        onClick={() => removeFromSequence(i)}
                      >
                        <span className="text-base mr-1">{s.unicode}</span>
                        {s.name}
                      </Badge>
                      {i < currentSequence.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            
            {/* Symbol Picker */}
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {symbolCategories.map(({ category, symbols }) => (
                  <div key={category}>
                    <button
                      onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground capitalize flex items-center gap-1"
                    >
                      <ChevronRight className={`h-3 w-3 transition-transform ${selectedCategory === category ? 'rotate-90' : ''}`} />
                      {category}
                    </button>
                    <AnimatePresence>
                      {selectedCategory === category && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-1 mt-1 mb-2">
                            {symbols.map(symbol => (
                              <Button
                                key={symbol.id}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => addSymbolToSequence(symbol)}
                                title={symbol.meaning}
                              >
                                <span className="text-base mr-1">{symbol.unicode}</span>
                                {symbol.name}
                              </Button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <Separator />
            
            {/* Saved Patterns */}
            {patterns.length > 0 && (
              <ScrollArea className="max-h-32">
                <div className="space-y-1 pr-2">
                  {patterns.map(pattern => (
                    <div key={pattern.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{pattern.name}</p>
                        <div className="flex items-center gap-0.5">
                          {pattern.sequence.slice(0, 5).map((s, i) => (
                            <span key={i} className="text-sm" title={s.name}>{s.unicode}</span>
                          ))}
                          {pattern.sequence.length > 5 && (
                            <span className="text-xs text-muted-foreground">+{pattern.sequence.length - 5}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removePattern(pattern.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          {/* NETWORK VIEW MODE */}
          <TabsContent value="network" className="mt-2 flex-1 flex flex-col gap-2 overflow-hidden">
            {patterns.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                <Network className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">No patterns to visualize</p>
                <p className="text-[10px]">Add patterns in the Teach tab first</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <p className="text-xs text-muted-foreground mb-2">
                  Transition probabilities between symbols. Thicker lines = stronger connections.
                </p>
                <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg border min-h-[280px]">
                  <TransitionNetworkGraph
                    transitionMatrix={learnedModel.transitionMatrix}
                    startSymbols={learnedModel.startSymbols}
                    width={360}
                    height={280}
                  />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  <span className="font-medium">{learnedModel.transitionMatrix.size}</span> source nodes • 
                  <span className="font-medium ml-1">{Array.from(learnedModel.transitionMatrix.values()).reduce((s, m) => s + m.size, 0)}</span> transitions
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* GENERATE MODE */}
          <TabsContent value="generate" className="mt-2 flex-1 flex flex-col gap-2 overflow-hidden">
            {patterns.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                <Brain className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">Teach some patterns first!</p>
                <p className="text-[10px]">The observer needs to learn narrative structures</p>
              </div>
            ) : (
              <>
                {/* Generation Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="text-xs text-muted-foreground">Length:</label>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    value={storyLength}
                    onChange={e => setStoryLength(Number(e.target.value))}
                    className="flex-1 h-1"
                  />
                  <span className="text-xs w-4">{storyLength}</span>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    disabled={isGenerating || !isRunning}
                    onClick={generateStory}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    Generate
                  </Button>
                  {generatedStory.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={resetGeneration}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {/* Generated Story */}
                {generatedStory.length > 0 && (
                  <ScrollArea className="flex-1">
                    <div className="space-y-3 pr-2">
                      {/* Symbol Sequence */}
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs font-medium mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Generated Sequence
                        </p>
                        <div className="flex flex-wrap items-center gap-1">
                          {generatedStory.map((s, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center"
                            >
                              <Badge variant="outline" className="text-xs">
                                <span className="text-base mr-1">{s.unicode}</span>
                                {s.name}
                              </Badge>
                              {i < generatedStory.length - 1 && (
                                <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Narrative */}
                      {(llmNarrative || isGenerating) && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs font-medium mb-2 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Narrative
                          </p>
                          {isGenerating && !llmNarrative && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-xs">Weaving narrative...</span>
                            </div>
                          )}
                          {llmNarrative && (
                            <MarkdownRenderer 
                              content={llmNarrative} 
                              className="prose-sm prose-p:my-1"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
