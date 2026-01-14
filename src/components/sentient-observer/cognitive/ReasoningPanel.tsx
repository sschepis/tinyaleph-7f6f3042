import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Network,
  Lightbulb,
  ArrowRight,
  Sparkles,
  BookOpen,
  Activity
} from 'lucide-react';
import type { 
  ReasoningEngine, 
  Fact, 
  ReasoningStep 
} from '@/lib/sentient-observer/reasoning-engine';

interface ReasoningPanelProps {
  engine: ReasoningEngine;
  isSimulationRunning?: boolean;
}

function FactNode({ fact, isNew }: { fact: Fact; isNew?: boolean }) {
  const sourceColors = {
    input: 'border-blue-500/30 bg-blue-500/5',
    inferred: 'border-green-500/30 bg-green-500/5',
    observation: 'border-purple-500/30 bg-purple-500/5'
  };
  
  const sourceIcons = {
    input: '📝',
    inferred: '💡',
    observation: '👁️'
  };
  
  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.9 } : false}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-2 rounded-lg border ${sourceColors[fact.source]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-sm">{sourceIcons[fact.source]}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{fact.name}</span>
          </div>
          <p className="text-xs">{fact.statement}</p>
        </div>
        <Badge 
          variant="outline" 
          className={`text-[10px] shrink-0 ${
            fact.confidence > 0.8 ? 'border-green-500 text-green-500' :
            fact.confidence > 0.5 ? 'border-yellow-500 text-yellow-500' :
            'border-red-500 text-red-500'
          }`}
        >
          {(fact.confidence * 100).toFixed(0)}%
        </Badge>
      </div>
      {fact.derivedFrom.length > 0 && (
        <div className="mt-1 text-[9px] text-muted-foreground">
          Derived from {fact.derivedFrom.length} fact(s)
        </div>
      )}
    </motion.div>
  );
}

function InferenceChain({ step }: { step: ReasoningStep }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20"
    >
      <div className="flex items-center gap-1 mb-1.5">
        <Network className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-medium">{step.ruleName}</span>
      </div>
      
      <div className="flex items-center gap-1 text-[10px]">
        {/* Input facts */}
        <div className="flex flex-wrap gap-1">
          {step.inputFacts.slice(0, 2).map((fact) => (
            <Badge key={fact.id} variant="secondary" className="text-[9px]">
              {fact.name.slice(0, 15)}
            </Badge>
          ))}
        </div>
        
        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
        
        {/* Output fact */}
        <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">
          {step.outputFact.name.slice(0, 20)}
        </Badge>
      </div>
      
      <div className="mt-1 text-[9px] text-muted-foreground">
        Confidence: {(step.confidence * 100).toFixed(0)}%
      </div>
    </motion.div>
  );
}

export function ReasoningPanel({
  engine,
  isSimulationRunning
}: ReasoningPanelProps) {
  const facts = useMemo(() => 
    Array.from(engine.facts.values()).slice(-12).reverse(),
    [engine.facts]
  );
  
  const recentSteps = useMemo(() => 
    engine.reasoningHistory.slice(-6).reverse(),
    [engine.reasoningHistory]
  );
  
  const stats = useMemo(() => ({
    totalFacts: engine.facts.size,
    inputFacts: Array.from(engine.facts.values()).filter(f => f.source === 'input').length,
    inferredFacts: Array.from(engine.facts.values()).filter(f => f.source === 'inferred').length,
    observationFacts: Array.from(engine.facts.values()).filter(f => f.source === 'observation').length,
    ruleCount: engine.rules.length
  }), [engine]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Reasoning Engine
          {isSimulationRunning && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1 ml-auto"
            >
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-[10px] text-green-500">Auto-reasoning</span>
            </motion.div>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          Autonomous fact inference from conversation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-1.5 bg-muted/50 rounded">
            <div className="text-sm font-mono">{stats.totalFacts}</div>
            <div className="text-[9px] text-muted-foreground">Facts</div>
          </div>
          <div className="p-1.5 bg-muted/50 rounded">
            <div className="text-sm font-mono text-blue-500">{stats.inputFacts}</div>
            <div className="text-[9px] text-muted-foreground">Input</div>
          </div>
          <div className="p-1.5 bg-muted/50 rounded">
            <div className="text-sm font-mono text-green-500">{stats.inferredFacts}</div>
            <div className="text-[9px] text-muted-foreground">Inferred</div>
          </div>
          <div className="p-1.5 bg-muted/50 rounded">
            <div className="text-sm font-mono text-purple-500">{stats.observationFacts}</div>
            <div className="text-[9px] text-muted-foreground">Observed</div>
          </div>
        </div>
        
        {/* Recent Inferences */}
        {recentSteps.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Recent Inferences
            </div>
            <ScrollArea className="h-28">
              <div className="space-y-1.5 pr-2">
                {recentSteps.map(step => (
                  <InferenceChain key={step.id} step={step} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Facts List */}
        <div className="space-y-1.5">
          <div className="text-xs font-medium flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Knowledge Base
          </div>
          <ScrollArea className="h-36">
            <div className="space-y-1.5 pr-2">
              <AnimatePresence>
                {facts.map((fact, idx) => (
                  <FactNode key={fact.id} fact={fact} isNew={idx === 0} />
                ))}
              </AnimatePresence>
              {facts.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-4">
                  Start a conversation to populate the knowledge base
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReasoningPanel;