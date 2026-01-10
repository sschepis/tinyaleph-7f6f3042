import { useEffect, useCallback } from 'react';
import { DebugSession, stepForward, stepBackward, runUntilBreak, initDebugSession, toggleBreakpoint } from '@/lib/quantum-circuit/debugger';

interface UseDebugKeyboardShortcutsProps {
  debugMode: boolean;
  debugSession: DebugSession | null;
  gates: { id: string }[];
  onSessionChange: (session: DebugSession) => void;
  onExitDebug: () => void;
}

export const useDebugKeyboardShortcuts = ({
  debugMode,
  debugSession,
  gates,
  onSessionChange,
  onExitDebug,
}: UseDebugKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!debugMode || !debugSession) return;
    
    // Prevent default browser behavior for function keys
    if (['F5', 'F9', 'F10', 'F11'].includes(e.key)) {
      e.preventDefault();
    }
    
    const isAtEnd = debugSession.currentStep >= debugSession.gates.length;
    const isAtStart = debugSession.currentStep <= 0;
    
    switch (e.key) {
      case 'F10': // Step forward (Step Over)
        if (!isAtEnd) {
          onSessionChange(stepForward(debugSession));
        }
        break;
        
      case 'F11': // Step backward (with Shift) or step forward
        if (e.shiftKey && !isAtStart) {
          onSessionChange(stepBackward(debugSession));
        } else if (!e.shiftKey && !isAtEnd) {
          onSessionChange(stepForward(debugSession));
        }
        break;
        
      case 'F5': // Run/Continue (or Stop with Shift)
        if (e.shiftKey) {
          onExitDebug();
        } else if (!isAtEnd) {
          onSessionChange(runUntilBreak(debugSession));
        }
        break;
        
      case 'F9': // Toggle breakpoint on current/next gate
        if (debugSession.gates.length > 0) {
          // Toggle breakpoint on the gate at current step (or first gate if at start)
          const gateIndex = Math.min(debugSession.currentStep, debugSession.gates.length - 1);
          const gateId = debugSession.gates[gateIndex].id;
          onSessionChange(toggleBreakpoint(debugSession, gateId));
        }
        break;
        
      case 'Escape': // Exit debug mode
        onExitDebug();
        break;
        
      case 'Home': // Reset to beginning
        if (e.ctrlKey || e.metaKey) {
          const newSession = initDebugSession(debugSession.gates, debugSession.numWires);
          newSession.breakpoints = debugSession.breakpoints;
          newSession.breakConditions = debugSession.breakConditions;
          onSessionChange(newSession);
        }
        break;
    }
  }, [debugMode, debugSession, onSessionChange, onExitDebug]);
  
  useEffect(() => {
    if (debugMode) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [debugMode, handleKeyDown]);
};

// Shortcut definitions for display in UI
export const DEBUG_SHORTCUTS = [
  { key: 'F10', action: 'Step Forward', description: 'Execute next gate' },
  { key: 'Shift+F11', action: 'Step Back', description: 'Go to previous state' },
  { key: 'F5', action: 'Run', description: 'Continue to next breakpoint' },
  { key: 'Shift+F5', action: 'Stop', description: 'Exit debug mode' },
  { key: 'F9', action: 'Toggle Breakpoint', description: 'Set/remove breakpoint at current gate' },
  { key: 'Esc', action: 'Exit', description: 'Exit debug mode' },
  { key: 'Ctrl+Home', action: 'Reset', description: 'Reset to beginning' },
] as const;
