// Type definitions for the Sentient Observer system

export interface Oscillator {
  prime: number;
  phase: number;
  amplitude: number;
  frequency: number;
}

export interface SMFState {
  s: Float64Array | number[];
  entropy?: () => number;
  smfEntropy?: () => number;
  dominantAxes?: (n: number) => Array<{ name: string; value: number }>;
  get?: (axis: string | number) => number;
}

export interface Moment {
  id: string;
  timestamp: number;
  trigger: string;
  coherence: number;
  entropy: number;
}

export interface Goal {
  id: string;
  description: string;
  status: string;
  priority: number;
  progress: number;
}

export interface AttentionFocus {
  id: string;
  target: string | number;
  type: string;
  intensity: number;
}

export interface SafetyStats {
  alertLevel: string;
  isSafe: boolean;
  totalViolations: number;
  constraintCount: number;
}

export interface ObserverState {
  isRunning: boolean;
  tickCount: number;
  coherence: number;
  entropy: number;
  temperature: number;
  coupling: number;
  thermalEnabled: boolean;
  oscillators: Oscillator[];
  smfState: SMFState;
  moments: Moment[];
  subjectiveTime: number;
  goals: Goal[];
  attentionFoci: AttentionFocus[];
  safetyStats: SafetyStats;
  holoIntensity: number[][];
  userInput: string;
  inputHistory: string[];
}

// SMF Axes for visualization - represents 16 dimensions of semantic orientation
export const SMF_AXES = [
  'coherence',
  'identity', 
  'duality',
  'structure',
  'change',
  'life',
  'harmony',
  'wisdom',
  'infinity',
  'creation',
  'truth',
  'love',
  'power',
  'time',
  'space',
  'consciousness'
] as const;

export type SMFAxis = typeof SMF_AXES[number];

// Simple prime computation
export const firstNPrimes = (n: number): number[] => {
  const primes: number[] = [];
  let candidate = 2;
  while (primes.length < n) {
    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(candidate); i++) {
      if (candidate % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
    candidate++;
  }
  return primes;
};
