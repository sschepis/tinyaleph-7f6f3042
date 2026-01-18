/**
 * Pulsar Transceiver Library
 * Exports for pulsar-synchronized semantic communication
 */

// Types
export * from './types';
export * from './pulsar-catalog';
export * from './star-catalog';
export * from './fingerprint-engine';
export * from './seti-analyzer';
export * from './error-correction';

// Pulsar catalog and split primes
export {
  PULSAR_CATALOG,
  SPLIT_PRIMES,
  DEFAULT_SEMANTIC_MAP,
  getReferencePulsar,
  getActivePulsars,
  getPulsarByName,
  equatorialToGalactic,
  isSplitPrime
} from './pulsar-catalog';

// Fingerprint computation
export {
  computeFingerprint,
  computeCorrectionVector,
  computeLightTravelTime,
  derivePhaseFromReference,
  evolveReferencePhase,
  compareFingerprints,
  createEarthLocation,
  createGalacticLocation,
  computeAllCorrections
} from './fingerprint-engine';

// SETI analysis
export {
  generateTimingResiduals,
  computeCrossCorrelation,
  computeSpectrum,
  analyzeSpectrum,
  matchSplitPrime,
  scanForCandidates,
  injectAlienSignal,
  generateTestDataset
} from './seti-analyzer';
