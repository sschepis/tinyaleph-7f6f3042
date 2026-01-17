// BB84 Protocol Hook

import { useState, useCallback } from 'react';
import { BB84State, TransmittedPhoton } from '@/lib/bb84/types';
import { runBB84Protocol, theoreticalErrorRate, formatKeyAsHex, keyMatchPercentage } from '@/lib/bb84/protocol';

interface UseBB84Return {
  // State
  state: BB84State | null;
  keyLength: number;
  evePresent: boolean;
  eveInterceptionRate: number;
  animationSpeed: number;
  currentPhotonIndex: number;
  isAnimating: boolean;
  
  // Setters
  setKeyLength: (n: number) => void;
  setEvePresent: (v: boolean) => void;
  setEveInterceptionRate: (r: number) => void;
  setAnimationSpeed: (s: number) => void;
  
  // Actions
  runProtocol: () => void;
  runWithAnimation: () => void;
  reset: () => void;
  stepForward: () => void;
  
  // Computed values
  visiblePhotons: TransmittedPhoton[];
  aliceKeyHex: string;
  bobKeyHex: string;
  keyMatch: number;
  theoreticalError: number;
}

export function useBB84(): UseBB84Return {
  const [state, setState] = useState<BB84State | null>(null);
  const [keyLength, setKeyLength] = useState(16);
  const [evePresent, setEvePresent] = useState(false);
  const [eveInterceptionRate, setEveInterceptionRate] = useState(1.0);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [currentPhotonIndex, setCurrentPhotonIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const runProtocol = useCallback(() => {
    const result = runBB84Protocol(keyLength, evePresent, eveInterceptionRate);
    setState(result);
    setCurrentPhotonIndex(result.photons.length);
  }, [keyLength, evePresent, eveInterceptionRate]);
  
  const runWithAnimation = useCallback(() => {
    const result = runBB84Protocol(keyLength, evePresent, eveInterceptionRate);
    setState(result);
    setCurrentPhotonIndex(0);
    setIsAnimating(true);
    
    // Animate photon transmission
    const totalPhotons = result.photons.length;
    let index = 0;
    
    const interval = setInterval(() => {
      index++;
      setCurrentPhotonIndex(index);
      
      if (index >= totalPhotons) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, animationSpeed);
    
    return () => clearInterval(interval);
  }, [keyLength, evePresent, eveInterceptionRate, animationSpeed]);
  
  const reset = useCallback(() => {
    setState(null);
    setCurrentPhotonIndex(0);
    setIsAnimating(false);
  }, []);
  
  const stepForward = useCallback(() => {
    if (state && currentPhotonIndex < state.photons.length) {
      setCurrentPhotonIndex(i => i + 1);
    }
  }, [state, currentPhotonIndex]);
  
  // Computed values
  const visiblePhotons = state?.photons.slice(0, currentPhotonIndex) ?? [];
  const aliceKeyHex = state ? formatKeyAsHex(state.siftedKeyAlice) : '';
  const bobKeyHex = state ? formatKeyAsHex(state.siftedKeyBob) : '';
  const keyMatch = state ? keyMatchPercentage(state.siftedKeyAlice, state.siftedKeyBob) : 0;
  const theoreticalError = theoreticalErrorRate(evePresent ? eveInterceptionRate : 0);
  
  return {
    state,
    keyLength,
    evePresent,
    eveInterceptionRate,
    animationSpeed,
    currentPhotonIndex,
    isAnimating,
    setKeyLength,
    setEvePresent,
    setEveInterceptionRate,
    setAnimationSpeed,
    runProtocol,
    runWithAnimation,
    reset,
    stepForward,
    visiblePhotons,
    aliceKeyHex,
    bobKeyHex,
    keyMatch,
    theoreticalError
  };
}
