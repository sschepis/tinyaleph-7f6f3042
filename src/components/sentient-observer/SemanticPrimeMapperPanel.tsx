/**
 * Semantic Prime Mapper Panel
 * 
 * UI for exploring and expanding the semantic prime map through triadic fusion
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { 
  Sparkles, 
  Zap, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Atom,
  Brain,
  Link2,
  Network,
  GitCompare,
  Wand2
} from 'lucide-react';
import { 
  SemanticPrimeMapper, 
  getSemanticPrimeMapper, 
  resetSemanticPrimeMapper,
  PrimeMeaning,
  SemanticField,
  SimilarityResult
} from '@/lib/sentient-observer/semantic-prime-mapper';
import { TriadicFusionGraph } from './TriadicFusionGraph';
import { cn } from '@/lib/utils';

interface SemanticPrimeMapperPanelProps {
  oscillatorPrimes?: number[];
  activeOscillatorIndices?: number[];
}

export function SemanticPrimeMapperPanel({ 
  oscillatorPrimes = [],
  activeOscillatorIndices = []
}: SemanticPrimeMapperPanelProps) {
  const [mapper] = useState(() => getSemanticPrimeMapper(128));
  const [field, setField] = useState<SemanticField>(() => mapper.getField());
  const [isExpanding, setIsExpanding] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [expandedPrimes, setExpandedPrimes] = useState<Set<number>>(new Set());
  const [recentExpansions, setRecentExpansions] = useState<PrimeMeaning[]>([]);
  const [cycleCount, setCycleCount] = useState(0);
  const [selectedPrime, setSelectedPrime] = useState<number | null>(null);
  const [similarPrimes, setSimilarPrimes] = useState<SimilarityResult[]>([]);
  const [refinedCount, setRefinedCount] = useState(0);

  // Refresh field state
  const refreshField = useCallback(() => {
    setField(mapper.getField());
  }, [mapper]);

  // Single expansion cycle with automatic LLM refinement
  const runExpansionCycle = useCallback(async () => {
    setIsExpanding(true);
    
    // Run expansion in chunks to allow UI updates
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Use async version for automatic refinement
    const result = await mapper.expandCycleAsync();
    const allMeanings = mapper.getAllMeanings();
    const recent = allMeanings.filter(m => !m.isSeeded).slice(0, 10);
    
    setRecentExpansions(recent);
    setCycleCount(c => c + 1);
    setRefinedCount(r => r + result.refined);
    refreshField();
    setIsExpanding(false);
  }, [mapper, refreshField]);

  // Auto-expand until stable with automatic LLM refinement
  const runFullExpansion = useCallback(async () => {
    setIsExpanding(true);
    
    let lastUncatalogued = field.uncataloguedCount;
    let stableCount = 0;
    let totalRefined = 0;
    
    while (stableCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use async version for automatic refinement
      const result = await mapper.expandCycleAsync();
      totalRefined += result.refined;
      
      const newField = mapper.getField();
      
      if (newField.uncataloguedCount >= lastUncatalogued) {
        stableCount++;
      } else {
        stableCount = 0;
      }
      
      lastUncatalogued = newField.uncataloguedCount;
      setCycleCount(c => c + 1);
      setField(newField);
    }
    
    setRefinedCount(r => r + totalRefined);
    const allMeanings = mapper.getAllMeanings();
    setRecentExpansions(allMeanings.filter(m => !m.isSeeded).slice(0, 10));
    setIsExpanding(false);
  }, [mapper, field.uncataloguedCount]);

  // Refine all unrefined meanings
  const handleRefineAll = useCallback(async () => {
    setIsRefining(true);
    const result = await mapper.refineMeanings();
    setRefinedCount(r => r + result.refined);
    refreshField();
    // Update recent expansions to show refined versions
    const allMeanings = mapper.getAllMeanings();
    setRecentExpansions(allMeanings.filter(m => !m.isSeeded).slice(0, 10));
    setIsRefining(false);
  }, [mapper, refreshField]);

  // Reset mapper
  const handleReset = useCallback(() => {
    resetSemanticPrimeMapper();
    const newMapper = getSemanticPrimeMapper(128);
    setField(newMapper.getField());
    setRecentExpansions([]);
    setCycleCount(0);
    setRefinedCount(0);
  }, []);

  // Toggle prime expansion in UI
  const togglePrimeExpanded = (prime: number) => {
    setExpandedPrimes(prev => {
      const next = new Set(prev);
      if (next.has(prime)) {
        next.delete(prime);
      } else {
        next.add(prime);
      }
      return next;
    });
  };

  // Handle node selection from graph
  const handleNodeSelect = useCallback((prime: number) => {
    setSelectedPrime(prime);
    const similar = mapper.findSimilar(prime, 8);
    setSimilarPrimes(similar);
  }, [mapper]);

  // Get active oscillator meanings
  const activeMeanings = oscillatorPrimes
    .filter((_, i) => activeOscillatorIndices.includes(i))
    .map(p => mapper.getMeaning(p))
    .filter(Boolean) as PrimeMeaning[];

  const coveragePercent = ((field.cataloguedCount) / 128) * 100;

  return (
    <Card className="border-primary/30 bg-background/95 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Atom className="h-5 w-5 text-primary animate-pulse" />
            Semantic Prime Mapper
          </CardTitle>
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Cycle {cycleCount}
            </Badge>
            {refinedCount > 0 && (
              <Badge variant="secondary" className="text-xs text-green-500">
                ✨ {refinedCount} refined
              </Badge>
            )}
            <Badge 
              variant={field.globalEntropy < 0.5 ? 'default' : 'secondary'}
              className="text-xs"
            >
              H: {field.globalEntropy.toFixed(3)}
            </Badge>
          </div>
        </div>
        
        {/* Coverage Progress */}
        <div className="space-y-1 mt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Prime Coverage</span>
            <span>{field.cataloguedCount}/128 ({coveragePercent.toFixed(0)}%)</span>
          </div>
          <Progress value={coveragePercent} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={runExpansionCycle}
            disabled={isExpanding || isRefining}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Fuse
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={runFullExpansion}
            disabled={isExpanding || isRefining}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-1" />
            {isExpanding ? 'Expanding...' : 'Full Expand'}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRefineAll}
            disabled={isExpanding || isRefining || mapper.getUnrefinedCount() === 0}
            title={`Refine ${mapper.getUnrefinedCount()} unrefined meanings`}
          >
            <Wand2 className={cn("h-4 w-4", isRefining && "animate-pulse")} />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleReset}
            disabled={isExpanding || isRefining}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="graph" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-8">
            <TabsTrigger value="graph" className="text-xs"><Network className="h-3 w-3" /></TabsTrigger>
            <TabsTrigger value="similar" className="text-xs"><GitCompare className="h-3 w-3" /></TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          </TabsList>
          
          {/* Fusion Network Graph */}
          <TabsContent value="graph" className="mt-2">
            <TriadicFusionGraph
              mapper={mapper}
              width={350}
              height={250}
              onNodeSelect={handleNodeSelect}
              selectedPrime={selectedPrime || undefined}
            />
          </TabsContent>
          
          {/* Similarity View */}
          <TabsContent value="similar" className="mt-2">
            <ScrollArea className="h-64">
              {selectedPrime ? (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground mb-2">
                    Similar to prime <span className="font-mono text-primary">{selectedPrime}</span>
                  </div>
                  {similarPrimes.map(sim => (
                    <div key={sim.prime} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-primary">{sim.prime}</span>
                        <span className="truncate max-w-32">{sim.meaning}</span>
                      </div>
                      <Badge variant="outline">{(sim.similarity * 100).toFixed(0)}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Select a node in the graph to see similar primes
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* Active Oscillator Meanings */}
          <TabsContent value="active" className="mt-2">
            <ScrollArea className="h-48">
              {activeMeanings.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No active oscillators with mappings
                </div>
              ) : (
                <div className="space-y-2">
                  {activeMeanings.map(meaning => (
                    <PrimeMeaningCard 
                      key={meaning.prime}
                      meaning={meaning}
                      isExpanded={expandedPrimes.has(meaning.prime)}
                      onToggle={() => togglePrimeExpanded(meaning.prime)}
                      isActive
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* Recent Expansions */}
          <TabsContent value="recent" className="mt-2">
            <ScrollArea className="h-48">
              {recentExpansions.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Run fusion to discover new meanings
                </div>
              ) : (
                <div className="space-y-2">
                  {recentExpansions.map(meaning => (
                    <PrimeMeaningCard 
                      key={meaning.prime}
                      meaning={meaning}
                      isExpanded={expandedPrimes.has(meaning.prime)}
                      onToggle={() => togglePrimeExpanded(meaning.prime)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* All Mappings */}
          <TabsContent value="all" className="mt-2">
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {mapper.getAllMeanings().slice(0, 50).map(meaning => (
                  <PrimeMeaningCard 
                    key={meaning.prime}
                    meaning={meaning}
                    isExpanded={expandedPrimes.has(meaning.prime)}
                    onToggle={() => togglePrimeExpanded(meaning.prime)}
                    compact
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Field Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-muted/50">
            <div className="text-lg font-mono text-primary">{field.cataloguedCount}</div>
            <div className="text-xs text-muted-foreground">Mapped</div>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <div className="text-lg font-mono text-yellow-500">{field.uncataloguedCount}</div>
            <div className="text-xs text-muted-foreground">Unmapped</div>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <div className="text-lg font-mono text-green-500">{(field.coherence * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Coherence</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============= PRIME MEANING CARD =============

interface PrimeMeaningCardProps {
  meaning: PrimeMeaning;
  isExpanded: boolean;
  onToggle: () => void;
  isActive?: boolean;
  compact?: boolean;
}

function PrimeMeaningCard({ meaning, isExpanded, onToggle, isActive, compact }: PrimeMeaningCardProps) {
  const confidenceColor = meaning.confidence > 0.8 
    ? 'text-green-500' 
    : meaning.confidence > 0.5 
      ? 'text-yellow-500' 
      : 'text-orange-500';

  const hasRefinement = meaning.rawMeaning && meaning.rawMeaning !== meaning.meaning;
  
  // Meaning display with hover card for refinement comparison
  const MeaningDisplay = ({ className }: { className?: string }) => (
    hasRefinement ? (
      <HoverCard>
        <HoverCardTrigger asChild>
          <span className={cn("cursor-help border-b border-dashed border-primary/40", className)}>
            {meaning.meaning}
            {meaning.isRefined && <Wand2 className="inline h-3 w-3 ml-1 text-primary/60" />}
          </span>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="top">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Wand2 className="h-3 w-3 text-primary" />
              <span>LLM Refinement</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground shrink-0">Raw:</span>
                <span className="font-mono text-orange-400 break-all">{meaning.rawMeaning}</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground shrink-0">Refined:</span>
                <span className="font-mono text-green-400">{meaning.meaning}</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    ) : (
      <span className={className}>
        {meaning.meaning}
        {!meaning.isRefined && !meaning.isSeeded && (
          <span className="text-orange-400/60 text-xs ml-1">(unrefined)</span>
        )}
      </span>
    )
  );

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center justify-between px-2 py-1 rounded text-xs",
          "bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer",
          meaning.isSeeded && "border-l-2 border-primary/50"
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-primary">{meaning.prime}</span>
          <MeaningDisplay className="text-muted-foreground truncate max-w-32" />
        </div>
        <span className={cn("font-mono", confidenceColor)}>
          {(meaning.confidence * 100).toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-lg border transition-all",
        isActive && "border-primary/50 bg-primary/5",
        !isActive && "border-border/50 bg-muted/20"
      )}
    >
      <div 
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {meaning.isSeeded ? (
            <Brain className="h-4 w-4 text-primary" />
          ) : (
            <Link2 className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-mono text-primary font-bold">{meaning.prime}</span>
          <MeaningDisplay className="text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", confidenceColor)}>
            {(meaning.confidence * 100).toFixed(0)}%
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-3 pb-2 pt-1 border-t border-border/30 space-y-2">
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground">Category:</span>
            <span>{meaning.category || 'derived'}</span>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground">Entropy:</span>
            <span className="font-mono">{meaning.entropy.toFixed(4)}</span>
          </div>
          {meaning.resonantWith.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Resonant with:</span>
              <div className="flex flex-wrap gap-1">
                {meaning.resonantWith.slice(0, 8).map(p => (
                  <Badge key={p} variant="secondary" className="text-xs font-mono">
                    {p}
                  </Badge>
                ))}
                {meaning.resonantWith.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{meaning.resonantWith.length - 8}
                  </Badge>
                )}
              </div>
            </div>
          )}
          {meaning.derivedFrom.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Derived via:</span>
              <div className="text-xs font-mono text-muted-foreground">
                {meaning.derivedFrom.map((f, i) => (
                  <div key={i}>
                    FUSE({f.p}, {f.q}, {f.r}) → {f.fusionType}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SemanticPrimeMapperPanel;
