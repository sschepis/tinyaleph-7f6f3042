// Browser shim for observer/prsc module
// Provides stub implementations for PRSCLayer

export class PRSCLayer {
  constructor(primes = [2, 3, 5, 7, 11], options = {}) {
    this.primes = primes;
    this.coupling = options.coupling || 0.3;
    this.oscillators = primes.map(p => ({
      prime: p,
      phase: Math.random() * 2 * Math.PI,
      frequency: 1 / p,
      amplitude: 0.8
    }));
  }
  
  tick(dt = 0.1) {
    const N = this.oscillators.length;
    this.oscillators.forEach((osc, i) => {
      let couplingSum = 0;
      this.oscillators.forEach((other, j) => {
        if (i !== j) couplingSum += Math.sin(other.phase - osc.phase);
      });
      osc.phase = (osc.phase + osc.frequency * dt + (this.coupling / N) * couplingSum * dt) % (2 * Math.PI);
    });
  }
  
  orderParameter() {
    let sx = 0, sy = 0;
    this.oscillators.forEach(osc => {
      sx += Math.cos(osc.phase);
      sy += Math.sin(osc.phase);
    });
    return Math.sqrt(sx * sx + sy * sy) / this.oscillators.length;
  }
  
  globalCoherence() {
    return this.orderParameter();
  }
  
  getPhases() {
    return this.oscillators.map(osc => osc.phase);
  }
  
  activePrimes() {
    return this.primes.filter((_, i) => this.oscillators[i].amplitude > 0.5);
  }
}

export const coherenceKernel = (phases) => {
  const N = phases.length;
  let sx = 0, sy = 0;
  phases.forEach(p => {
    sx += Math.cos(p);
    sy += Math.sin(p);
  });
  return Math.sqrt(sx * sx + sy * sy) / N;
};

export default { PRSCLayer, coherenceKernel };