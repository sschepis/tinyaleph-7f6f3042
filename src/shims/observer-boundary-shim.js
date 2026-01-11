// Browser shim for observer/boundary module

export class BoundaryLayer {
  constructor(options = {}) {
    this.inputGate = options.inputGate !== false;
    this.outputGate = options.outputGate !== false;
    this.inputFilters = [];
    this.outputFilters = [];
  }
  
  addInputFilter(filter) {
    this.inputFilters.push(filter);
  }
  
  addOutputFilter(filter) {
    this.outputFilters.push(filter);
  }
  
  processInput(data) {
    if (!this.inputGate) return null;
    let result = data;
    for (const filter of this.inputFilters) {
      result = filter(result);
      if (result === null) break;
    }
    return result;
  }
  
  processOutput(data) {
    if (!this.outputGate) return null;
    let result = data;
    for (const filter of this.outputFilters) {
      result = filter(result);
      if (result === null) break;
    }
    return result;
  }
}

export default { BoundaryLayer };