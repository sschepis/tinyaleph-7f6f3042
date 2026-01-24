/**
 * Learning Debug Stats Hook
 * 
 * Tracks deduplication statistics and learning efficiency over time.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { LearningEngineState, LearningGoal } from '@/lib/sentient-observer/learning-engine';

export interface DeduplicationStats {
  totalGoalsCreated: number;
  goalsSkippedDuplicate: number;
  goalsProcessed: number;
  goalsFailed: number;
  uniquePrimesTargeted: Set<number>;
  efficiencyOverTime: { timestamp: number; efficiency: number }[];
}

export interface UseLearningDebugStatsReturn {
  stats: DeduplicationStats;
  isDebugVisible: boolean;
  toggleDebugVisibility: () => void;
  recordGoalCreated: (goal: LearningGoal) => void;
  recordGoalSkipped: (prime: number, reason: string) => void;
  recordGoalCompleted: (goal: LearningGoal) => void;
  recordGoalFailed: (goal: LearningGoal) => void;
  reset: () => void;
}

const STORAGE_KEY = 'sentient-observer-debug-stats';
const EFFICIENCY_SAMPLE_INTERVAL = 30000; // 30 seconds

function createInitialStats(): DeduplicationStats {
  return {
    totalGoalsCreated: 0,
    goalsSkippedDuplicate: 0,
    goalsProcessed: 0,
    goalsFailed: 0,
    uniquePrimesTargeted: new Set(),
    efficiencyOverTime: []
  };
}

function loadStatsFromStorage(): DeduplicationStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        ...data,
        uniquePrimesTargeted: new Set(data.uniquePrimesTargeted || []),
        efficiencyOverTime: data.efficiencyOverTime || []
      };
    }
  } catch (e) {
    console.warn('[useLearningDebugStats] Failed to load from storage:', e);
  }
  return createInitialStats();
}

function saveStatsToStorage(stats: DeduplicationStats): void {
  try {
    const data = {
      ...stats,
      uniquePrimesTargeted: Array.from(stats.uniquePrimesTargeted),
      savedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[useLearningDebugStats] Failed to save to storage:', e);
  }
}

export function useLearningDebugStats(learningState: LearningEngineState): UseLearningDebugStatsReturn {
  const [stats, setStats] = useState<DeduplicationStats>(() => loadStatsFromStorage());
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const lastEfficiencySampleRef = useRef(Date.now());
  const prevQueueRef = useRef<Map<string, LearningGoal['status']>>(new Map());

  // Automatically track goal status changes
  useEffect(() => {
    const currentQueue = new Map(
      learningState.learningQueue.map(g => [g.id, g.status])
    );
    const prevQueue = prevQueueRef.current;

    for (const goal of learningState.learningQueue) {
      const prevStatus = prevQueue.get(goal.id);
      
      // New goal created
      if (!prevStatus && goal.status === 'pending') {
        setStats(prev => {
          const updated = {
            ...prev,
            totalGoalsCreated: prev.totalGoalsCreated + 1,
            uniquePrimesTargeted: goal.targetPrime 
              ? new Set([...prev.uniquePrimesTargeted, goal.targetPrime])
              : prev.uniquePrimesTargeted
          };
          saveStatsToStorage(updated);
          return updated;
        });
      }
      
      // Goal completed
      if (prevStatus === 'in_progress' && goal.status === 'completed') {
        setStats(prev => {
          const updated = {
            ...prev,
            goalsProcessed: prev.goalsProcessed + 1
          };
          saveStatsToStorage(updated);
          return updated;
        });
      }
      
      // Goal failed
      if (prevStatus === 'in_progress' && goal.status === 'failed') {
        setStats(prev => {
          const updated = {
            ...prev,
            goalsFailed: prev.goalsFailed + 1
          };
          saveStatsToStorage(updated);
          return updated;
        });
      }
    }

    prevQueueRef.current = currentQueue;
  }, [learningState.learningQueue]);

  // Sample efficiency over time
  useEffect(() => {
    const now = Date.now();
    if (now - lastEfficiencySampleRef.current >= EFFICIENCY_SAMPLE_INTERVAL) {
      lastEfficiencySampleRef.current = now;
      
      const total = stats.goalsProcessed + stats.goalsSkippedDuplicate + stats.goalsFailed;
      const efficiency = total > 0 ? (stats.goalsProcessed / total) * 100 : 100;
      
      setStats(prev => {
        const updated = {
          ...prev,
          efficiencyOverTime: [
            ...prev.efficiencyOverTime.slice(-30), // Keep last 30 samples (15 minutes)
            { timestamp: now, efficiency }
          ]
        };
        saveStatsToStorage(updated);
        return updated;
      });
    }
  }, [stats.goalsProcessed, stats.goalsSkippedDuplicate, stats.goalsFailed]);

  const toggleDebugVisibility = useCallback(() => {
    setIsDebugVisible(prev => !prev);
  }, []);

  const recordGoalCreated = useCallback((goal: LearningGoal) => {
    setStats(prev => {
      const updated = {
        ...prev,
        totalGoalsCreated: prev.totalGoalsCreated + 1,
        uniquePrimesTargeted: goal.targetPrime 
          ? new Set([...prev.uniquePrimesTargeted, goal.targetPrime])
          : prev.uniquePrimesTargeted
      };
      saveStatsToStorage(updated);
      return updated;
    });
  }, []);

  const recordGoalSkipped = useCallback((prime: number, _reason: string) => {
    setStats(prev => {
      const updated = {
        ...prev,
        goalsSkippedDuplicate: prev.goalsSkippedDuplicate + 1
      };
      console.log(`[Debug] Skipped duplicate goal for prime ${prime}`);
      saveStatsToStorage(updated);
      return updated;
    });
  }, []);

  const recordGoalCompleted = useCallback((_goal: LearningGoal) => {
    setStats(prev => {
      const updated = {
        ...prev,
        goalsProcessed: prev.goalsProcessed + 1
      };
      saveStatsToStorage(updated);
      return updated;
    });
  }, []);

  const recordGoalFailed = useCallback((_goal: LearningGoal) => {
    setStats(prev => {
      const updated = {
        ...prev,
        goalsFailed: prev.goalsFailed + 1
      };
      saveStatsToStorage(updated);
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    const initial = createInitialStats();
    setStats(initial);
    localStorage.removeItem(STORAGE_KEY);
    prevQueueRef.current = new Map();
  }, []);

  return {
    stats,
    isDebugVisible,
    toggleDebugVisibility,
    recordGoalCreated,
    recordGoalSkipped,
    recordGoalCompleted,
    recordGoalFailed,
    reset
  };
}
