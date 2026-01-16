import { useState } from 'react';

/**
 * Hook to manage first-run state for app help dialogs
 * @param appKey - Unique key for the app (e.g., 'quantum-wavefunction')
 * @returns [isFirstRun, markAsSeen] - Whether this is the first run and a function to mark it as seen
 */
export const useFirstRun = (appKey: string): [boolean, () => void] => {
  const storageKey = `app-help-${appKey}`;
  const [isFirstRun, setIsFirstRun] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) !== 'seen';
  });
  
  const markAsSeen = () => {
    localStorage.setItem(storageKey, 'seen');
    setIsFirstRun(false);
  };
  
  return [isFirstRun, markAsSeen];
};
