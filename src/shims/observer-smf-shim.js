// Browser shim for observer/smf module
// Provides stub implementations for SedenionMemoryField

export const SMF_AXES = [
  { name: 'Attention', index: 0 },
  { name: 'Valence', index: 1 },
  { name: 'Arousal', index: 2 },
  { name: 'Novelty', index: 3 },
  { name: 'Relevance', index: 4 },
  { name: 'Certainty', index: 5 },
  { name: 'Agency', index: 6 },
  { name: 'Social', index: 7 },
  { name: 'Temporal', index: 8 },
  { name: 'Spatial', index: 9 },
  { name: 'Causal', index: 10 },
  { name: 'Abstract', index: 11 },
  { name: 'Embodied', index: 12 },
  { name: 'Self', index: 13 },
  { name: 'Other', index: 14 },
  { name: 'Meta', index: 15 }
];

export class SedenionMemoryField {
  constructor() {
    this.s = new Array(16).fill(0.25);
  }
  
  static uniform() {
    return new SedenionMemoryField();
  }
  
  normalize() {
    const norm = Math.sqrt(this.s.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      this.s = this.s.map(v => v / norm);
    }
    return this;
  }
  
  toJSON() {
    const norm = Math.sqrt(this.s.reduce((sum, v) => sum + v * v, 0));
    const normalized = this.s.map(v => (v * v) / (norm * norm || 1));
    const entropy = -normalized.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
    return {
      s: this.s,
      norm,
      entropy,
      coherenceCoeff: norm / 4
    };
  }
  
  nearestCodebook() {
    return {
      attractor: { name: 'NEUTRAL', index: 0 },
      distance: 0
    };
  }
}

export default { SedenionMemoryField, SMF_AXES };