import { useMemo, useState, useEffect, useRef } from 'react';
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
  Activity,
  Zap
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
      initial={isNew ? { opacity: 0, scale: 0.9, x: -20 } : false}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      className={`p-2 rounded-lg border ${sourceColors[fact.source]} ${isNew ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-background' : ''}`}
    >
      {/* New fact pulse indicator */}
      {isNew && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ duration: 1, repeat: 3 }}
        />
      )}
      <div className="flex items-start justify-between gap-2 relative">
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-sm">{sourceIcons[fact.source]}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{fact.name}</span>
            {isNew && (
              <Badge variant="default" className="text-[8px] px-1 py-0 h-3 ml-1 animate-pulse bg-primary">
                NEW
              </Badge>
            )}
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

function InferenceChain({ step, isNew }: { step: ReasoningStep; isNew?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`p-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20 relative overflow-hidden ${isNew ? 'ring-2 ring-primary/40' : ''}`}
    >
      {/* Shimmer effect for new inferences */}
      {isNew && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1, repeat: 2 }}
        />
      )}
      <div className="flex items-center gap-1 mb-1.5 relative">
        <Network className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-medium">{step.ruleName}</span>
        {isNew && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <Zap className="h-3 w-3 text-yellow-500 ml-1" />
          </motion.div>
        )}
      </div>
      
      <div className="flex items-center gap-1 text-[10px] relative">
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
      
      <div className="mt-1 text-[9px] text-muted-foreground relative">
        Confidence: {(step.confidence * 100).toFixed(0)}%
      </div>
    </motion.div>
  );
}

// Notification banner for new inferences
function InferenceNotification({ count, onDismiss }: { count: number; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute top-0 left-0 right-0 z-10 mx-2 mt-2"
    >
      <div className="flex items-center justify-center gap-2 p-2 bg-primary/90 text-primary-foreground rounded-lg shadow-lg">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <Zap className="h-4 w-4" />
        </motion.div>
        <span className="text-xs font-medium">
          {count} new fact{count > 1 ? 's' : ''} inferred!
        </span>
      </div>
    </motion.div>
  );
}

export function ReasoningPanel({
  engine,
  isSimulationRunning
}: ReasoningPanelProps) {
  // Track previous counts to detect new facts
  const prevFactCountRef = useRef(engine.facts.size);
  const prevStepCountRef = useRef(engine.reasoningHistory.length);
  const [newFactIds, setNewFactIds] = useState<Set<string>>(new Set());
  const [newStepIds, setNewStepIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ count: number } | null>(null);

  // Detect new facts and steps
  useEffect(() => {
    const currentFactCount = engine.facts.size;
    const currentStepCount = engine.reasoningHistory.length;
    
    // Check for new inferred facts
    if (currentFactCount > prevFactCountRef.current) {
      const allFacts = Array.from(engine.facts.values());
      const newInferredFacts = allFacts
        .slice(-5)
        .filter(f => f.source === 'inferred');
      
      if (newInferredFacts.length > 0) {
        const newIds = new Set(newInferredFacts.map(f => f.id));
        setNewFactIds(newIds);
        setNotification({ count: newInferredFacts.length });
        
        // Clear new fact highlighting after 5 seconds
        setTimeout(() => setNewFactIds(new Set()), 5000);
      }
    }
    
    // Check for new reasoning steps
    if (currentStepCount > prevStepCountRef.current) {
      const newSteps = engine.reasoningHistory.slice(-3);
      const newIds = new Set(newSteps.map(s => s.id));
      setNewStepIds(newIds);
      
      // Clear new step highlighting after 5 seconds
      setTimeout(() => setNewStepIds(new Set()), 5000);
    }
    
    prevFactCountRef.current = currentFactCount;
    prevStepCountRef.current = currentStepCount;
  }, [engine.facts, engine.reasoningHistory]);

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
    <Card className="relative overflow-hidden">
      {/* Notification Banner */}
      <AnimatePresence>
        {notification && (
          <InferenceNotification 
            count={notification.count} 
            onDismiss={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>
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
              {newStepIds.size > 0 && (
                <motion.span 
                  className="text-[10px] text-primary ml-auto"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  ⚡ New
                </motion.span>
              )}
            </div>
            <ScrollArea className="h-28">
              <div className="space-y-1.5 pr-2">
                {recentSteps.map(step => (
                  <InferenceChain 
                    key={step.id} 
                    step={step} 
                    isNew={newStepIds.has(step.id)} 
                  />
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
            {newFactIds.size > 0 && (
              <motion.span 
                className="text-[10px] text-green-500 ml-auto"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                💡 {newFactIds.size} new
              </motion.span>
            )}
          </div>
          <ScrollArea className="h-36">
            <div className="space-y-1.5 pr-2">
              <AnimatePresence>
                {facts.map((fact) => (
                  <FactNode 
                    key={fact.id} 
                    fact={fact} 
                    isNew={newFactIds.has(fact.id)} 
                  />
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