/**
 * Types for the enhanced non-local communication system
 */

import { Octonion, PrimeAmplitude } from './octonion';
import { Quaternion, SplitPrime } from './types';

export interface NodeState {
  id: 'A' | 'B';
  quaternion: Quaternion;
  octonion: Octonion;
  blochVector: { x: number; y: number; z: number };
  twist: number;
  precession: number;
  entropy: number;
  coherence: number;
  message: string;
  primeAmplitudes: PrimeAmplitude[];
  phaseOffsets: number[];
  commChannel: number;
}

export interface CommunicationEvent {
  id: string;
  timestamp: number;
  from: 'A' | 'B';
  to: 'A' | 'B';
  message: string;
  type: 'non-local' | 'local';
  correlation: number;
  octonion?: Octonion;
}

export interface NodeCommLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'sent' | 'received';
}

export interface NonLocalSystemState {
  nodeA: NodeState;
  nodeB: NodeState;
  entanglementState: 'disconnected' | 'initializing' | 'entangled' | 'separated';
  isEvolving: boolean;
  entanglementStrength: number;
  nonLocalCorrelation: number;
  quantumCoherence: number;
  resonanceStrength: number;
  sharedQuaternion: Quaternion | null;
  communicationHistory: CommunicationEvent[];
  separationTime: number;
  evolutionStartTime: number;
}
