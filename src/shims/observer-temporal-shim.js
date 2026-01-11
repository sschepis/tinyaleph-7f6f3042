// Browser shim for observer/temporal module

export class Moment {
  constructor(data = {}) {
    this.tick = data.tick || 0;
    this.coherence = data.coherence || 0;
    this.entropy = data.entropy || 0;
    this.timestamp = Date.now();
  }
}

export class TemporalLayer {
  constructor(options = {}) {
    this.maxHistory = options.maxHistory || 100;
    this.moments = [];
    this.coherenceHistory = [];
  }
  
  update(state) {
    const moment = new Moment({
      tick: this.moments.length,
      coherence: state.coherence || 0,
      entropy: state.entropy || 0
    });
    this.moments.push(moment);
    this.coherenceHistory.push({ value: moment.coherence, tick: moment.tick });
    
    if (this.moments.length > this.maxHistory) {
      this.moments.shift();
      this.coherenceHistory.shift();
    }
    
    return moment;
  }
  
  recentMoments(n = 10) {
    return this.moments.slice(-n);
  }
}

export default { Moment, TemporalLayer };