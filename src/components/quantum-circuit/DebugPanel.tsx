import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, Pause, SkipForward, SkipBack, StepForward, StepBack,
  Circle, AlertCircle, Target, Trash2, Plus
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DebugSession,
  BreakCondition,
  stepForward,
  stepBackward,
  runUntilBreak,
  addBreakCondition,
  removeBreakCondition,
  getQubitProbability,
} from '@/lib/quantum-circuit/debugger';
import { computeEntropy } from '@/lib/quantum-circuit/simulation';
import { GATE_DEFINITIONS } from '@/lib/quantum-circuit/types';

interface DebugPanelProps {
  session: DebugSession;
  onSessionChange: (session: DebugSession) => void;
  onExit: () => void;
}

export const DebugPanel = ({ session, onSessionChange, onExit }: DebugPanelProps) => {
  const [conditionType, setConditionType] = useState<'probability' | 'entropy'>('probability');
  const [conditionQubit, setConditionQubit] = useState(0);
  const [conditionThreshold, setConditionThreshold] = useState(0.5);
  const [conditionComparison, setConditionComparison] = useState<'above' | 'below'>('above');
  
  const currentState = session.history[session.history.length - 1];
  const isAtEnd = session.currentStep >= session.gates.length;
  const isAtStart = session.currentStep <= 0;
  
  const handleStep = () => onSessionChange(stepForward(session));
  const handleStepBack = () => onSessionChange(stepBackward(session));
  const handleRun = () => onSessionChange(runUntilBreak(session));
  const handleReset = () => {
    const { initDebugSession } = require('@/lib/quantum-circuit/debugger');
    const newSession = initDebugSession(session.gates, session.numWires);
    newSession.breakpoints = session.breakpoints;
    newSession.breakConditions = session.breakConditions;
    onSessionChange(newSession);
  };
  
  const handleAddCondition = () => {
    const condition: BreakCondition = {
      type: conditionType,
      qubit: conditionType === 'probability' ? conditionQubit : undefined,
      threshold: conditionThreshold,
      comparison: conditionComparison,
    };
    onSessionChange(addBreakCondition(session, condition));
  };
  
  const handleRemoveCondition = (index: number) => {
    onSessionChange(removeBreakCondition(session, index));
  };
  
  // Calculate qubit probabilities for current state
  const qubitProbs = Array.from({ length: session.numWires }, (_, i) =>
    getQubitProbability(currentState.state, i, session.numWires)
  );
  
  return (
    <div className="space-y-4">
      {/* Debug Mode Banner */}
      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="font-semibold text-yellow-500 text-sm">Debug Mode Active</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isAtStart && session.gates.length > 0 ? (
            <>Use <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Step →</kbd> to execute gates one at a time, or click any gate in the circuit to set a breakpoint.</>
          ) : isAtEnd ? (
            <>Circuit complete! Use <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">← Step</kbd> to go back or <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Reset</kbd> to start over.</>
          ) : (
            <>Stepping through circuit. Click gates to toggle breakpoints, or use <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Run ▶</kbd> to continue to next breakpoint.</>
          )}
        </p>
      </div>

      {/* Transport Controls */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Controls</p>
        <div className="grid grid-cols-5 gap-1">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                  <SkipBack className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset to beginning</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleStepBack} disabled={isAtStart} className="w-full">
                  <StepBack className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Step backward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="sm" onClick={handleRun} disabled={isAtEnd} className="w-full">
                  <Play className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Run until breakpoint</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleStep} disabled={isAtEnd} className="w-full">
                  <StepForward className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Step forward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" size="sm" onClick={onExit} className="w-full">
                  <Pause className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exit debug mode</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Progress</span>
          <span className="text-sm font-mono text-primary">
            {session.currentStep} / {session.gates.length}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${session.gates.length > 0 ? (session.currentStep / session.gates.length) * 100 : 0}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {isAtStart ? 'Not started' : isAtEnd ? 'Complete' : 'In progress'}
        </p>
      </div>
      
      {/* Current Gate Info */}
      {currentState.gate && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded ${GATE_DEFINITIONS[currentState.gate.type].color} flex items-center justify-center text-white text-xs font-bold`}>
              {currentState.gate.type.charAt(0)}
            </div>
            <span className="font-medium">{GATE_DEFINITIONS[currentState.gate.type].name}</span>
            <span className="text-xs text-muted-foreground">on q[{currentState.gate.wireIndex}]</span>
          </div>
          <p className="text-xs text-muted-foreground">{GATE_DEFINITIONS[currentState.gate.type].description}</p>
        </div>
      )}
      
      {/* Break Alerts */}
      {session.hitBreakpoint && (
        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
          <Circle className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm text-yellow-500">Hit breakpoint</span>
        </div>
      )}
      {session.hitCondition && (
        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-orange-500">
            {session.hitCondition.type === 'probability' 
              ? `q[${session.hitCondition.qubit}] P(|1⟩) ${session.hitCondition.comparison} ${session.hitCondition.threshold}`
              : `Entropy ${session.hitCondition.comparison} ${session.hitCondition.threshold}`
            }
          </span>
        </div>
      )}
      
      {/* State Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-muted/30 text-center">
          <p className="text-[10px] text-muted-foreground">Entropy</p>
          <p className="text-lg font-mono text-primary">{currentState.entropy.toFixed(3)}</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/30 text-center">
          <p className="text-[10px] text-muted-foreground">States</p>
          <p className="text-lg font-mono text-primary">{currentState.state.length}</p>
        </div>
      </div>
      
      {/* Qubit Probabilities */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Qubit States</h4>
        {qubitProbs.map((probs, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs font-mono w-10">q[{idx}]</span>
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${probs.prob0 * 100}%` }}
                title={`|0⟩: ${(probs.prob0 * 100).toFixed(1)}%`}
              />
              <div 
                className="h-full bg-red-500 transition-all duration-200"
                style={{ width: `${probs.prob1 * 100}%` }}
                title={`|1⟩: ${(probs.prob1 * 100).toFixed(1)}%`}
              />
            </div>
            <span className="text-[10px] font-mono w-14 text-right">
              {(probs.prob1 * 100).toFixed(0)}% |1⟩
            </span>
          </div>
        ))}
      </div>
      
      {/* Breakpoints List */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Circle className="w-3 h-3 text-red-500 fill-red-500" /> Gate Breakpoints
        </h4>
        {session.breakpoints.size > 0 ? (
          <div className="text-xs text-muted-foreground p-2 bg-red-500/5 rounded border border-red-500/20">
            {session.breakpoints.size} breakpoint(s) set — execution will pause before these gates
          </div>
        ) : (
          <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded border border-dashed border-border">
            <span className="text-yellow-500">Tip:</span> Click any gate in the circuit to set a breakpoint
          </div>
        )}
      </div>
      
      {/* Conditional Breaks */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Target className="w-3 h-3" /> Conditions
        </h4>
        
        {session.breakConditions.map((cond, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
            <span className="flex-1">
              {cond.type === 'probability' 
                ? `q[${cond.qubit}] P(|1⟩) ${cond.comparison} ${cond.threshold}`
                : `Entropy ${cond.comparison} ${cond.threshold}`
              }
            </span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemoveCondition(idx)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        {/* Add Condition Form */}
        <div className="p-2 rounded border border-dashed border-border space-y-2">
          <div className="flex gap-2">
            <select 
              className="flex-1 text-xs bg-background border border-input rounded px-2 py-1"
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value as 'probability' | 'entropy')}
            >
              <option value="probability">Probability</option>
              <option value="entropy">Entropy</option>
            </select>
            {conditionType === 'probability' && (
              <select
                className="w-16 text-xs bg-background border border-input rounded px-2 py-1"
                value={conditionQubit}
                onChange={(e) => setConditionQubit(parseInt(e.target.value))}
              >
                {Array.from({ length: session.numWires }, (_, i) => (
                  <option key={i} value={i}>q[{i}]</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <select
              className="w-20 text-xs bg-background border border-input rounded px-2 py-1"
              value={conditionComparison}
              onChange={(e) => setConditionComparison(e.target.value as 'above' | 'below')}
            >
              <option value="above">above</option>
              <option value="below">below</option>
            </select>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              className="flex-1 text-xs bg-background border border-input rounded px-2 py-1"
              value={conditionThreshold}
              onChange={(e) => setConditionThreshold(parseFloat(e.target.value))}
            />
            <Button variant="outline" size="sm" className="h-7" onClick={handleAddCondition}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
