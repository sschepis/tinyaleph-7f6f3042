import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, Atom, Link2, Sparkles, Zap } from 'lucide-react';
import { LearningEngineState, LearningGoal } from '@/lib/sentient-observer/learning-engine';
import { getSemanticPrimeMapper } from '@/lib/sentient-observer/semantic-prime-mapper';

interface LearningOverviewBarProps {
  learningState: LearningEngineState;
  coherence: number;
}

export const LearningOverviewBar: React.FC<LearningOverviewBarProps> = ({
  learningState,
  coherence
}) => {
  const mapper = getSemanticPrimeMapper();
  const field = mapper.getField();
  
  // Semantic Prime Mapper stats
  const totalPrimes = field.cataloguedCount + field.uncataloguedCount;
  const mappedPrimes = field.cataloguedCount;
  const coverage = totalPrimes > 0 ? (mappedPrimes / totalPrimes) * 100 : 0;
  const refinedCount = Array.from(field.primes.values()).filter(m => m.isRefined).length;
  
  // Learning Engine stats
  const { learnedSymbols, learnedRelationships, currentSession, learningQueue, isLearning } = learningState;
  const symbolCount = learnedSymbols.size;
  const relationCount = learnedRelationships.length;
  const goalsCompleted = currentSession?.goalsCompleted ?? 0;
  
  // Find the current active goal
  const currentGoal: LearningGoal | undefined = learningQueue.find(g => g.status === 'in_progress');
  
  // Recent activity (last 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const recentSymbols = Array.from(learnedSymbols.values()).filter(s => s.learnedAt > fiveMinutesAgo).length;
  const recentRelations = learnedRelationships.filter(r => r.learnedAt > fiveMinutesAgo).length;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-card/50 border border-border/50 rounded-lg backdrop-blur-sm">
      {/* Learning Status Indicator */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isLearning ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {isLearning ? 'Learning' : 'Idle'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isLearning ? `Active: ${goalsCompleted} goals completed` : 'Learning paused'}
        </TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-border" />

      {/* Semantic Prime Mapper Coverage */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Atom className="h-3.5 w-3.5 text-primary" />
            <div className="flex items-center gap-1.5">
              <Progress value={coverage} className="w-16 h-1.5" />
              <span className="text-xs font-mono text-muted-foreground">
                {coverage.toFixed(0)}%
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {mappedPrimes}/{totalPrimes}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div>Prime Coverage: {mappedPrimes} of {totalPrimes} mapped</div>
            <div>Refined: {refinedCount} meanings</div>
          </div>
        </TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-border" />

      {/* Learned Symbols */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-mono">{symbolCount}</span>
            {recentSymbols > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-blue-500/20 text-blue-400">
                +{recentSymbols}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {symbolCount} symbols learned
          {recentSymbols > 0 && ` (+${recentSymbols} in last 5 min)`}
        </TooltipContent>
      </Tooltip>

      {/* Learned Relationships */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs font-mono">{relationCount}</span>
            {recentRelations > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-green-500/20 text-green-400">
                +{recentRelations}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {relationCount} relationships discovered
          {recentRelations > 0 && ` (+${recentRelations} in last 5 min)`}
        </TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-border" />

      {/* Current Goal (if active) */}
      {currentGoal && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 max-w-[200px]">
              <Zap className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />
              <span className="text-xs text-muted-foreground truncate">
                {currentGoal.type === 'define_symbol' && `p${currentGoal.targetPrime}`}
                {currentGoal.type === 'find_relationship' && `Links for p${currentGoal.targetPrime}`}
                {currentGoal.type === 'expand_concept' && currentGoal.concepts?.[0]}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-medium">{currentGoal.description}</div>
              <div className="text-muted-foreground">Status: {currentGoal.status}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Coherence indicator */}
      <div className="ml-auto flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Sparkles className={`h-3.5 w-3.5 ${coherence > 0.7 ? 'text-green-500' : coherence > 0.4 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-mono ${coherence > 0.7 ? 'text-green-500' : coherence > 0.4 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                {(coherence * 100).toFixed(0)}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            System coherence: {(coherence * 100).toFixed(1)}%
            {coherence > 0.9 && ' — Learning enabled'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
