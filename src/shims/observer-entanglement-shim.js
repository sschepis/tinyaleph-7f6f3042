// Browser shim for observer/entanglement module

export class EntangledPair {
  constructor(a, b, strength = 1.0) {
    this.a = a;
    this.b = b;
    this.strength = strength;
  }
}

export class EntanglementLayer {
  constructor() {
    this.pairs = [];
    this.conceptMap = new Map();
  }
  
  addPair(a, b, strength = 1.0) {
    const pair = new EntangledPair(a, b, strength);
    this.pairs.push(pair);
    return pair;
  }
  
  getEntanglements(concept) {
    return this.pairs.filter(p => p.a === concept || p.b === concept);
  }
  
  getStrength(a, b) {
    const pair = this.pairs.find(p => 
      (p.a === a && p.b === b) || (p.a === b && p.b === a)
    );
    return pair ? pair.strength : 0;
  }
}

export default { EntangledPair, EntanglementLayer };