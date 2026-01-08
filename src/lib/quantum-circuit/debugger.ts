import { ComplexNumber, GateInstance } from './types';
import { applyGateToState, computeEntropy } from './simulation';

export interface DebugState {
  stepIndex: number;
  state: ComplexNumber[];
  gate: GateInstance | null;
  entropy: number;
  probabilities: number[];
}

export interface BreakCondition {
  type: 'probability' | 'entropy' | 'entanglement';
  qubit?: number;
  threshold: number;
  comparison: 'above' | 'below';
}

export interface DebugSession {
  gates: GateInstance[];
  numWires: number;
  breakpoints: Set<string>; // gate IDs
  breakConditions: BreakCondition[];
  history: DebugState[];
  currentStep: number;
  isRunning: boolean;
  hitBreakpoint: string | null;
  hitCondition: BreakCondition | null;
}

// Initialize a fresh debug session
export const initDebugSession = (
  gates: GateInstance[],
  numWires: number
): DebugSession => {
  const dimensions = Math.pow(2, numWires);
  const initialState: ComplexNumber[] = Array.from({ length: dimensions }, (_, i) =>
    i === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
  );
  const probs = initialState.map(s => s.real * s.real + s.imag * s.imag);
  
  return {
    gates: [...gates].sort((a, b) => a.position - b.position),
    numWires,
    breakpoints: new Set(),
    breakConditions: [],
    history: [{
      stepIndex: 0,
      state: initialState,
      gate: null,
      entropy: 0,
      probabilities: probs,
    }],
    currentStep: 0,
    isRunning: false,
    hitBreakpoint: null,
    hitCondition: null,
  };
};

// Execute a single step
export const stepForward = (session: DebugSession): DebugSession => {
  if (session.currentStep >= session.gates.length) {
    return session; // Already at end
  }
  
  const nextGateIndex = session.currentStep;
  const gate = session.gates[nextGateIndex];
  const prevState = session.history[session.history.length - 1].state;
  
  const newState = applyGateToState(
    prevState,
    gate.type,
    gate.wireIndex,
    session.numWires,
    gate.controlWire,
    gate.controlWire2,
    gate.parameter
  );
  
  const probs = newState.map(s => s.real * s.real + s.imag * s.imag);
  const entropy = computeEntropy(newState);
  
  const debugState: DebugState = {
    stepIndex: nextGateIndex + 1,
    state: newState,
    gate,
    entropy,
    probabilities: probs,
  };
  
  return {
    ...session,
    history: [...session.history, debugState],
    currentStep: session.currentStep + 1,
    hitBreakpoint: null,
    hitCondition: null,
  };
};

// Step backward (use history)
export const stepBackward = (session: DebugSession): DebugSession => {
  if (session.currentStep <= 0) {
    return session; // Already at start
  }
  
  return {
    ...session,
    history: session.history.slice(0, -1),
    currentStep: session.currentStep - 1,
    hitBreakpoint: null,
    hitCondition: null,
  };
};

// Check if a condition is met
const checkCondition = (
  condition: BreakCondition,
  state: ComplexNumber[],
  numWires: number
): boolean => {
  const probs = state.map(s => s.real * s.real + s.imag * s.imag);
  
  if (condition.type === 'probability' && condition.qubit !== undefined) {
    // Calculate probability of |1⟩ on the specified qubit
    const mask = 1 << (numWires - 1 - condition.qubit);
    let prob1 = 0;
    for (let i = 0; i < probs.length; i++) {
      if ((i & mask) !== 0) prob1 += probs[i];
    }
    
    return condition.comparison === 'above' 
      ? prob1 > condition.threshold 
      : prob1 < condition.threshold;
  }
  
  if (condition.type === 'entropy') {
    const entropy = computeEntropy(state);
    return condition.comparison === 'above'
      ? entropy > condition.threshold
      : entropy < condition.threshold;
  }
  
  if (condition.type === 'entanglement') {
    // Check for entanglement using entropy of reduced density matrix approximation
    const entropy = computeEntropy(state);
    return condition.comparison === 'above'
      ? entropy > condition.threshold
      : entropy < condition.threshold;
  }
  
  return false;
};

// Run until breakpoint or condition
export const runUntilBreak = (session: DebugSession): DebugSession => {
  let current = { ...session, isRunning: true, hitBreakpoint: null, hitCondition: null };
  
  while (current.currentStep < current.gates.length) {
    const nextGate = current.gates[current.currentStep];
    
    // Check gate breakpoint BEFORE executing
    if (current.breakpoints.has(nextGate.id)) {
      return { ...current, isRunning: false, hitBreakpoint: nextGate.id };
    }
    
    // Execute the gate
    current = stepForward(current);
    
    // Check conditions AFTER executing
    const latestState = current.history[current.history.length - 1].state;
    for (const condition of current.breakConditions) {
      if (checkCondition(condition, latestState, current.numWires)) {
        return { ...current, isRunning: false, hitCondition: condition };
      }
    }
  }
  
  return { ...current, isRunning: false };
};

// Run to a specific gate index
export const runToGate = (session: DebugSession, gateIndex: number): DebugSession => {
  let current = { ...session };
  
  // If we need to go backward, reset to beginning
  if (gateIndex < current.currentStep) {
    current = initDebugSession(session.gates, session.numWires);
    current.breakpoints = session.breakpoints;
    current.breakConditions = session.breakConditions;
  }
  
  while (current.currentStep < gateIndex && current.currentStep < current.gates.length) {
    current = stepForward(current);
  }
  
  return current;
};

// Toggle breakpoint on a gate
export const toggleBreakpoint = (session: DebugSession, gateId: string): DebugSession => {
  const breakpoints = new Set(session.breakpoints);
  if (breakpoints.has(gateId)) {
    breakpoints.delete(gateId);
  } else {
    breakpoints.add(gateId);
  }
  return { ...session, breakpoints };
};

// Add a conditional break
export const addBreakCondition = (
  session: DebugSession,
  condition: BreakCondition
): DebugSession => {
  return {
    ...session,
    breakConditions: [...session.breakConditions, condition],
  };
};

// Remove a conditional break
export const removeBreakCondition = (
  session: DebugSession,
  index: number
): DebugSession => {
  return {
    ...session,
    breakConditions: session.breakConditions.filter((_, i) => i !== index),
  };
};

// Get qubit probability at current state
export const getQubitProbability = (
  state: ComplexNumber[],
  qubit: number,
  numWires: number
): { prob0: number; prob1: number } => {
  const probs = state.map(s => s.real * s.real + s.imag * s.imag);
  const mask = 1 << (numWires - 1 - qubit);
  let prob1 = 0;
  for (let i = 0; i < probs.length; i++) {
    if ((i & mask) !== 0) prob1 += probs[i];
  }
  return { prob0: 1 - prob1, prob1 };
};
