import { useState, useCallback } from 'react';
import {
  QECState,
  CodeType,
  ErrorType,
  initializeQEC,
  encodeLogicalQubit,
  injectError,
  injectRandomError,
  measureSyndromes,
  applyCorrections,
  resetQEC,
} from '@/lib/qec';

export function useQEC(initialCode: CodeType = 'bit_flip_3') {
  const [state, setState] = useState<QECState>(() => initializeQEC(initialCode));
  const [isAnimating, setIsAnimating] = useState(false);
  
  const changeCode = useCallback((codeType: CodeType) => {
    setState(initializeQEC(codeType));
  }, []);
  
  const encode = useCallback((alpha = 1, beta = 0) => {
    setState(prev => encodeLogicalQubit(prev, alpha, beta));
  }, []);
  
  const addError = useCallback((qubitIndex: number, errorType: ErrorType) => {
    setState(prev => injectError(prev, qubitIndex, errorType));
  }, []);
  
  const addRandomError = useCallback(() => {
    setState(prev => injectRandomError(prev));
  }, []);
  
  const measure = useCallback(() => {
    setState(prev => measureSyndromes(prev));
  }, []);
  
  const correct = useCallback(() => {
    setState(prev => applyCorrections(prev));
  }, []);
  
  const reset = useCallback(() => {
    setState(prev => resetQEC(prev));
  }, []);
  
  const runFullCycle = useCallback(async () => {
    setIsAnimating(true);
    
    // Step 1: Encode
    setState(prev => encodeLogicalQubit(prev, 1, 0));
    await new Promise(r => setTimeout(r, 500));
    
    // Step 2: Random error
    setState(prev => injectRandomError(prev));
    await new Promise(r => setTimeout(r, 700));
    
    // Step 3: Measure syndromes
    setState(prev => measureSyndromes(prev));
    await new Promise(r => setTimeout(r, 700));
    
    // Step 4: Correct
    setState(prev => applyCorrections(prev));
    
    setIsAnimating(false);
  }, []);
  
  return {
    state,
    isAnimating,
    changeCode,
    encode,
    addError,
    addRandomError,
    measure,
    correct,
    reset,
    runFullCycle,
  };
}
