/**
 * TinyAleph Compatibility Layer
 * 
 * This module re-exports tinyaleph functionality in a way that's compatible
 * with Vite's ESM handling. The library uses CommonJS internally, which can
 * cause named export resolution issues in browser ESM environments.
 * 
 * We use `as any` casting because the library's TypeScript definitions are
 * incomplete relative to what's actually exported at runtime.
 */

// Import the entire module as namespace (handles both CJS and ESM)
import * as tinyalephModule from '@aleph-ai/tinyaleph';

// Cast to any for accessing runtime exports not in type definitions
const tinyaleph = tinyalephModule as any;

// Re-export core mathematical classes
export const Hypercomplex = tinyaleph.Hypercomplex;
export const Quaternion = tinyaleph.Quaternion;
export const Complex = tinyaleph.Complex;
export const GaussianInteger = tinyaleph.GaussianInteger;
export const EisensteinInteger = tinyaleph.EisensteinInteger;

// Re-export prime utilities
export const isPrime = tinyaleph.isPrime;
export const factorize = tinyaleph.factorize;
export const primesUpTo = tinyaleph.primesUpTo;
export const nthPrime = tinyaleph.nthPrime;
export const primeSignature = tinyaleph.primeSignature;
export const firstNPrimes = tinyaleph.firstNPrimes;
export const primeGenerator = tinyaleph.primeGenerator;
export const DEFAULT_PRIMES = tinyaleph.DEFAULT_PRIMES;
export const primeToFrequency = tinyaleph.primeToFrequency;
export const primeToAngle = tinyaleph.primeToAngle;
export const sumOfTwoSquares = tinyaleph.sumOfTwoSquares;

// Re-export hypercomplex algebra utilities
export const FANO_LINES = tinyaleph.FANO_LINES;
export const octonionMultiplyIndex = tinyaleph.octonionMultiplyIndex;
export const sedenionMultiplyIndex = tinyaleph.sedenionMultiplyIndex;
export const multiplyIndices = tinyaleph.multiplyIndices;
export const buildMultiplicationTable = tinyaleph.buildMultiplicationTable;

// Re-export physics classes
export const Oscillator = tinyaleph.Oscillator;
export const OscillatorBank = tinyaleph.OscillatorBank;
export const KuramotoModel = tinyaleph.KuramotoModel;
export const NetworkKuramoto = tinyaleph.NetworkKuramoto;
export const AdaptiveKuramoto = tinyaleph.AdaptiveKuramoto;
export const SakaguchiKuramoto = tinyaleph.SakaguchiKuramoto;
export const SmallWorldKuramoto = tinyaleph.SmallWorldKuramoto;

// Re-export entropy and measurement utilities
export const shannonEntropy = tinyaleph.shannonEntropy;
export const stateEntropy = tinyaleph.stateEntropy;
export const coherence = tinyaleph.coherence;
export const mutualInformation = tinyaleph.mutualInformation;
export const relativeEntropy = tinyaleph.relativeEntropy;
export const jointEntropy = tinyaleph.jointEntropy;
export const oscillatorEntropy = tinyaleph.oscillatorEntropy;
export const estimateLyapunov = tinyaleph.estimateLyapunov;
export const classifyStability = tinyaleph.classifyStability;
export const collapseProbability = tinyaleph.collapseProbability;
export const shouldCollapse = tinyaleph.shouldCollapse;
export const measureState = tinyaleph.measureState;
export const collapseToIndex = tinyaleph.collapseToIndex;
export const bornMeasurement = tinyaleph.bornMeasurement;
export const partialCollapse = tinyaleph.partialCollapse;
export const applyDecoherence = tinyaleph.applyDecoherence;

// Re-export Prime Hilbert Space
export const PrimeState = tinyaleph.PrimeState;
export const ResonanceOperators = tinyaleph.ResonanceOperators;
export const EntropyDrivenEvolution = tinyaleph.EntropyDrivenEvolution;
export const encodeMemory = tinyaleph.encodeMemory;
export const symbolicCompute = tinyaleph.symbolicCompute;

// Re-export Prime Resonance Network constants
export const PHI = tinyaleph.PHI;
export const PHI_CONJ = tinyaleph.PHI_CONJ;
export const DELTA_S = tinyaleph.DELTA_S;
export const QuaternionPrime = tinyaleph.QuaternionPrime;
export const PrimeResonanceIdentity = tinyaleph.PrimeResonanceIdentity;
export const PhaseLockedRing = tinyaleph.PhaseLockedRing;
export const HolographicField = tinyaleph.HolographicField;
export const EntangledNode = tinyaleph.EntangledNode;
export const ResonantFragment = tinyaleph.ResonantFragment;

// Re-export ResoFormer ML primitives
export const SparsePrimeState = tinyaleph.SparsePrimeState;
export const resonanceScore = tinyaleph.resonanceScore;
export const resonantAttention = tinyaleph.resonantAttention;
export const hamiltonCompose = tinyaleph.hamiltonCompose;
export const measureNonCommutativity = tinyaleph.measureNonCommutativity;
export const computeCoherence = tinyaleph.computeCoherence;
export const haltingDecision = tinyaleph.haltingDecision;
export const coherenceGatedCompute = tinyaleph.coherenceGatedCompute;
export const EntropyCollapseHead = tinyaleph.EntropyCollapseHead;
export const generateAttractorCodebook = tinyaleph.generateAttractorCodebook;
export const PRGraphMemory = tinyaleph.PRGraphMemory;
export const applyResonanceOperator = tinyaleph.applyResonanceOperator;

// Re-export backends
export const Backend = tinyaleph.Backend;
export const SemanticBackend = tinyaleph.SemanticBackend;
export const CryptographicBackend = tinyaleph.CryptographicBackend;
export const ScientificBackend = tinyaleph.ScientificBackend;
export const BioinformaticsBackend = tinyaleph.BioinformaticsBackend;

// Re-export bioinformatics operators
export const TranscriptionOperator = tinyaleph.TranscriptionOperator;
export const TranslationOperator = tinyaleph.TranslationOperator;
export const FoldingTransform = tinyaleph.FoldingTransform;
export const BindingAffinityCalculator = tinyaleph.BindingAffinityCalculator;
export const MolecularDocker = tinyaleph.MolecularDocker;
export const DNAStrand = tinyaleph.DNAStrand;
export const DNACircuit = tinyaleph.DNACircuit;
export const ANDGate = tinyaleph.ANDGate;
export const ORGate = tinyaleph.ORGate;
export const NOTGate = tinyaleph.NOTGate;

// Re-export engine
export const AlephEngine = tinyaleph.AlephEngine;
export const createEngine = tinyaleph.createEngine;
export const LLM = tinyaleph.LLM;

// Re-export Primeon Z-Ladder
export const PrimeonZLadderU = tinyaleph.PrimeonZLadderU;
export const createPrimeonLadder = tinyaleph.createPrimeonLadder;
export const shannonEntropyNats = tinyaleph.shannonEntropyNats;
export const probsOf = tinyaleph.probsOf;
export const normalizeComplex = tinyaleph.normalizeComplex;
export const ZChannel = tinyaleph.ZChannel;
export const PrimeonZLadderMulti = tinyaleph.PrimeonZLadderMulti;
export const createMultiChannelLadder = tinyaleph.createMultiChannelLadder;
export const createAdiabaticSchedule = tinyaleph.createAdiabaticSchedule;
export const KuramotoCoupledLadder = tinyaleph.KuramotoCoupledLadder;
export const createKuramotoLadder = tinyaleph.createKuramotoLadder;
export const runCollapsePressureExperiment = tinyaleph.runCollapsePressureExperiment;
export const kuramotoOrderParameter = tinyaleph.kuramotoOrderParameter;
export const getPhase = tinyaleph.getPhase;

// Re-export Enochian
export const Enochian = tinyaleph.Enochian;
export const EnochianVocabulary = tinyaleph.EnochianVocabulary;
export const enochian = tinyaleph.enochian;
export const enochianVocabulary = tinyaleph.enochianVocabulary;

// Default export for destructuring convenience
export default tinyaleph;
