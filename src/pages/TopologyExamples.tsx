
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import { useState, useCallback } from 'react';

// TWIST_108 simulated implementation for UI
const TWIST_108 = {
  value: 108,
  binary: 4, // 2²
  ternary: 27, // 3³
  mod30Boundary: 3,
  resonates: (n: number) => n > 0 && n % 108 === 0
};

const twistAngle = (p: number) => 360 / p;
const totalTwist = (primes: number[]) => primes.reduce((sum, p) => sum + twistAngle(p), 0);
const isTwistClosed = (primes: number[]) => {
  const total = totalTwist(primes);
  return Math.abs(total - Math.round(total / 360) * 360) < 0.001;
};

const Invariant108Example = () => {
  const [selectedPrimes, setSelectedPrimes] = useState<number[]>([3, 3, 3]);
  const availablePrimes = [2, 3, 5, 7, 11, 13, 17, 19];
  
  const total = totalTwist(selectedPrimes);
  const closed = isTwistClosed(selectedPrimes);
  
  const addPrime = (p: number) => {
    setSelectedPrimes([...selectedPrimes, p]);
  };
  
  const removeLast = () => {
    if (selectedPrimes.length > 0) {
      setSelectedPrimes(selectedPrimes.slice(0, -1));
    }
  };
  
  const reset = () => {
    setSelectedPrimes([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">The 108 Invariant</h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span>Value:</span>
                <span className="text-primary">108 = 2² × 3³</span>
              </div>
              <div className="flex justify-between">
                <span>Binary factor:</span>
                <span>{TWIST_108.binary}</span>
              </div>
              <div className="flex justify-between">
                <span>Ternary factor:</span>
                <span>{TWIST_108.ternary}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Twist Angles κ(p) = 360°/p</h4>
            <div className="grid grid-cols-4 gap-2">
              {availablePrimes.map(p => (
                <div key={p} className="text-center p-2 bg-background rounded">
                  <div className="font-mono text-lg">{p}</div>
                  <div className="text-xs text-muted-foreground">{twistAngle(p).toFixed(1)}°</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Build Twist Sequence</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {availablePrimes.map(p => (
                <button
                  key={p}
                  onClick={() => addPrime(p)}
                  className="px-3 py-1.5 rounded-md bg-primary/20 hover:bg-primary/30 text-sm font-mono"
                >
                  +{p}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={removeLast} className="px-3 py-1.5 rounded-md bg-secondary text-sm">
                Remove Last
              </button>
              <button onClick={reset} className="px-3 py-1.5 rounded-md bg-secondary text-sm">
                Clear
              </button>
            </div>
            
            <div className="p-3 bg-background rounded">
              <div className="text-sm text-muted-foreground mb-1">Sequence:</div>
              <div className="font-mono">
                [{selectedPrimes.join(', ') || 'empty'}]
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${closed ? 'bg-green-500/20 border border-green-500/50' : 'bg-orange-500/20 border border-orange-500/50'}`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Twist:</span>
              <span className="font-mono text-2xl">{total.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>Status:</span>
              <span className={closed ? 'text-green-500' : 'text-orange-500'}>
                {closed ? '✓ CLOSED' : '✗ Open'}
              </span>
            </div>
            {closed && (
              <div className="mt-2 text-sm text-muted-foreground">
                Twists complete {Math.round(total / 360)} full rotation(s)
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Physical Significance</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-primary">•</span> SU(3) × SU(2) × U(1) gauge group from 108 factorization
          </div>
          <div>
            <span className="text-primary">•</span> Fine structure: α⁻¹ = 108 + 29 = 137
          </div>
          <div>
            <span className="text-primary">•</span> Mass ratio: 17 × 108 = 1836 (proton/electron)
          </div>
          <div>
            <span className="text-primary">•</span> Pentagon interior angle = 108°
          </div>
        </div>
      </div>
    </div>
  );
};

const TrefoilConstantsExample = () => {
  const trefoil = {
    name: 'Trefoil',
    crossings: 3,
    sticks: 6,
    bridge: 2,
    unknotting: 1,
    complexity: function() {
      return this.sticks * this.crossings - this.bridge + this.unknotting;
    },
    deriveMassRatio: function() {
      return this.complexity() * 108;
    }
  };
  
  const physicalConstants = {
    protonElectron: {
      derived: 17 * 108,
      experimental: 1836.15267,
      relativeError: Math.abs(17 * 108 - 1836.15267) / 1836.15267
    },
    fineStructure: {
      derived: 108 + 29,
      experimental: 137.036,
      relativeError: Math.abs(137 - 137.036) / 137.036
    },
    higgsMass: {
      derived: Math.pow(5, 3),
      experimental: 125.25,
      relativeError: Math.abs(125 - 125.25) / 125.25
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Trefoil Knot (3₁) Invariants</h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span>Crossing number (c):</span>
                <span>{trefoil.crossings}</span>
              </div>
              <div className="flex justify-between">
                <span>Stick number (s):</span>
                <span>{trefoil.sticks}</span>
              </div>
              <div className="flex justify-between">
                <span>Bridge number (b):</span>
                <span>{trefoil.bridge}</span>
              </div>
              <div className="flex justify-between">
                <span>Unknotting number (u):</span>
                <span>{trefoil.unknotting}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <h4 className="text-sm font-medium mb-2">Complexity Calculation</h4>
            <div className="font-mono text-sm space-y-1">
              <div>T = s·c - b + u</div>
              <div>T = {trefoil.sticks}×{trefoil.crossings} - {trefoil.bridge} + {trefoil.unknotting}</div>
              <div>T = {trefoil.sticks * trefoil.crossings} - {trefoil.bridge} + {trefoil.unknotting}</div>
              <div className="text-2xl font-bold text-primary">T = {trefoil.complexity()}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Physical Constants Derivation</h4>
          
          {/* Proton-Electron Mass Ratio */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Proton-Electron Mass Ratio</div>
            <div className="font-mono text-sm mt-1">17 × 108 = {physicalConstants.protonElectron.derived}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Experimental: {physicalConstants.protonElectron.experimental}
            </div>
            <div className={`text-xs mt-1 ${physicalConstants.protonElectron.relativeError < 0.01 ? 'text-green-500' : 'text-orange-500'}`}>
              Error: {(physicalConstants.protonElectron.relativeError * 100).toFixed(3)}%
            </div>
          </div>
          
          {/* Fine Structure Constant */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Fine Structure Constant Inverse</div>
            <div className="font-mono text-sm mt-1">108 + 29 = {physicalConstants.fineStructure.derived}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Experimental: {physicalConstants.fineStructure.experimental}
            </div>
            <div className={`text-xs mt-1 ${physicalConstants.fineStructure.relativeError < 0.01 ? 'text-green-500' : 'text-orange-500'}`}>
              Error: {(physicalConstants.fineStructure.relativeError * 100).toFixed(3)}%
            </div>
          </div>
          
          {/* Higgs Mass */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Higgs Boson Mass</div>
            <div className="font-mono text-sm mt-1">5³ = {physicalConstants.higgsMass.derived} GeV</div>
            <div className="text-xs text-muted-foreground mt-1">
              Experimental: {physicalConstants.higgsMass.experimental} GeV
            </div>
            <div className={`text-xs mt-1 ${physicalConstants.higgsMass.relativeError < 0.01 ? 'text-green-500' : 'text-orange-500'}`}>
              Error: {(physicalConstants.higgsMass.relativeError * 100).toFixed(3)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Trefoil Visualization */}
      <div className="flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="trefoilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Simplified trefoil knot visualization */}
          <path
            d="M100,30 
               C150,30 170,80 140,120 
               C110,160 50,160 30,120 
               C10,80 30,30 100,30
               M100,50
               C130,50 150,80 130,110
               C110,140 60,140 50,110
               C40,80 60,50 100,50"
            fill="none"
            stroke="url(#trefoilGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="3" fill="hsl(var(--primary))" />
        </svg>
      </div>
    </div>
  );
};

const GaugeSymmetryExample = () => {
  const gaugeGroup = {
    SU3: { generators: 8, description: 'Color symmetry (QCD)' },
    SU2: { generators: 3, description: 'Weak isospin' },
    U1: { generators: 1, description: 'Electromagnetic' },
    totalDimension: 12
  };
  
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-4">Standard Model Gauge Group from 108</h4>
        <div className="font-mono text-center text-xl mb-4">
          SU(3) × SU(2) × U(1) ← 2² × 3³ = 108
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="font-bold text-red-400">SU(3)</div>
            <div className="text-sm mt-1">From 3³ = 27</div>
            <div className="text-xs text-muted-foreground">{gaugeGroup.SU3.generators} generators</div>
            <div className="text-xs text-muted-foreground mt-1">{gaugeGroup.SU3.description}</div>
          </div>
          
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="font-bold text-blue-400">SU(2)</div>
            <div className="text-sm mt-1">From 2² = 4</div>
            <div className="text-xs text-muted-foreground">{gaugeGroup.SU2.generators} generators</div>
            <div className="text-xs text-muted-foreground mt-1">{gaugeGroup.SU2.description}</div>
          </div>
          
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="font-bold text-yellow-400">U(1)</div>
            <div className="text-sm mt-1">From 108 total</div>
            <div className="text-xs text-muted-foreground">{gaugeGroup.U1.generators} generator</div>
            <div className="text-xs text-muted-foreground mt-1">{gaugeGroup.U1.description}</div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Total gauge dimension: {gaugeGroup.totalDimension}
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Factorization Decomposition</h4>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between p-2 bg-background rounded">
            <span>108</span>
            <span>= 2² × 3³</span>
            <span>Full symmetry</span>
          </div>
          <div className="flex justify-between p-2 bg-background rounded">
            <span>27</span>
            <span>= 3³</span>
            <span>SU(3) origin</span>
          </div>
          <div className="flex justify-between p-2 bg-background rounded">
            <span>4</span>
            <span>= 2²</span>
            <span>SU(2) origin</span>
          </div>
          <div className="flex justify-between p-2 bg-background rounded">
            <span>1</span>
            <span>= 108/108</span>
            <span>U(1) origin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FreeEnergyExample = () => {
  const [alpha, setAlpha] = useState(0.1);
  const [beta, setBeta] = useState(-0.5);
  const [gamma, setGamma] = useState(-0.1);
  const [psi, setPsi] = useState(0.5);
  
  // F(ψ) = αψ²/2 + βψ³/3 + γψ⁴/4
  const freeEnergy = (p: number) => {
    return (alpha * p * p / 2) + (beta * p * p * p / 3) + (gamma * p * p * p * p / 4);
  };
  
  // dF/dψ = αψ + βψ² + γψ³
  const gradient = (p: number) => {
    return alpha * p + beta * p * p + gamma * p * p * p;
  };
  
  // Generate energy landscape
  const points: { psi: number; energy: number }[] = [];
  for (let x = -2; x <= 2; x += 0.05) {
    points.push({ psi: x, energy: freeEnergy(x) });
  }
  
  const minEnergy = Math.min(...points.map(p => p.energy));
  const maxEnergy = Math.max(...points.map(p => p.energy));
  const energyRange = maxEnergy - minEnergy || 1;
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-3">Cubic Free Energy Dynamics</h4>
            <div className="font-mono text-sm mb-4">
              dψ/dt = αψ + βψ² + γψ³
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  α (linear): {alpha.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={alpha}
                  onChange={(e) => setAlpha(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  β (quadratic): {beta.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={beta}
                  onChange={(e) => setBeta(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  γ (cubic): {gamma.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={gamma}
                  onChange={(e) => setGamma(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Current State</h4>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                ψ = {psi.toFixed(2)}
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={psi}
                onChange={(e) => setPsi(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3 font-mono text-sm">
              <div>
                <span className="text-muted-foreground">F(ψ) = </span>
                <span className="text-primary">{freeEnergy(psi).toFixed(4)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">dF/dψ = </span>
                <span className="text-primary">{gradient(psi).toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Energy Landscape F(ψ)</h4>
          <svg width="100%" height="200" viewBox="0 0 300 200" className="overflow-visible">
            {/* Axes */}
            <line x1="50" y1="180" x2="280" y2="180" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
            <line x1="50" y1="20" x2="50" y2="180" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
            
            {/* Labels */}
            <text x="280" y="195" fill="hsl(var(--muted-foreground))" fontSize="10">ψ</text>
            <text x="30" y="20" fill="hsl(var(--muted-foreground))" fontSize="10">F</text>
            
            {/* Energy curve */}
            <path
              d={points.map((p, i) => {
                const x = 50 + (p.psi + 2) / 4 * 230;
                const y = 180 - (p.energy - minEnergy) / energyRange * 140;
                return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(20, Math.min(180, y))}`;
              }).join(' ')}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            
            {/* Current position marker */}
            <circle
              cx={50 + (psi + 2) / 4 * 230}
              cy={Math.max(20, Math.min(180, 180 - (freeEnergy(psi) - minEnergy) / energyRange * 140))}
              r="6"
              fill="hsl(var(--accent))"
            />
          </svg>
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Observer Hierarchy</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="p-2">Level</th>
                <th className="p-2">Scale (m)</th>
                <th className="p-2">Capacity (bits/s)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="p-2">Cellular</td>
                <td className="p-2">10⁻⁶</td>
                <td className="p-2">10⁶</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-2">Neural</td>
                <td className="p-2">10⁻³</td>
                <td className="p-2">10⁹</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-2">Cognitive</td>
                <td className="p-2">1</td>
                <td className="p-2">10¹²</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-2">Collective</td>
                <td className="p-2">10⁶</td>
                <td className="p-2">10¹⁵</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-2">Cosmic</td>
                <td className="p-2">10²⁶</td>
                <td className="p-2">10²¹</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  {
    id: '108-invariant',
    number: '1',
    title: 'The 108 Invariant',
    subtitle: 'Minimal closed twist configuration',
    description: 'The fundamental 108 = 2² × 3³ invariant that generates gauge symmetries and physical constants through twist angles κ(p) = 360°/p.',
    concepts: ['Twist Angles', 'Closure Detection', '108 Resonance', 'Gauge Symmetry Origins'],
    code: `import { TWIST_108, twistAngle, isTwistClosed } from '@aleph-ai/tinyaleph';

// Basic properties
console.log(TWIST_108.value);           // 108
console.log(TWIST_108.factorization);   // { twos: 2, threes: 3 }

// Twist angles κ(p) = 360°/p
console.log(twistAngle(3));   // 120°
console.log(twistAngle(5));   // 72°

// Check for closure (sum must be multiple of 360°)
console.log(isTwistClosed([3, 3, 3]));  // true (360°)
console.log(isTwistClosed([2, 2]));     // true (360°)

// 108-resonance detection
console.log(TWIST_108.resonates(216));  // true (2 × 108)`,
    codeTitle: 'topology/01-108-invariant.js'
  },
  {
    id: 'trefoil-constants',
    number: '2',
    title: 'Trefoil Constants',
    subtitle: 'Physical constant derivation',
    description: 'The Trefoil knot (3₁) is the minimal stable structure. Its complexity T = s·c - b + u = 17 combines with 108 to derive physical constants.',
    concepts: ['Knot Invariants', 'Complexity T=17', 'Proton/Electron Ratio', 'Fine Structure α⁻¹'],
    code: `import { TREFOIL, PhysicalConstants } from '@aleph-ai/tinyaleph';

// Trefoil knot invariants
console.log(TREFOIL.crossings);     // 3
console.log(TREFOIL.sticks);        // 6
console.log(TREFOIL.complexity());  // 17

// Physical constants derivation
const massRatio = PhysicalConstants.protonElectronRatio();
console.log(massRatio.derived);     // 1836 (17 × 108)
console.log(massRatio.experimental); // 1836.15267

const alpha = PhysicalConstants.fineStructureInverse();
console.log(alpha.derived);          // 137 (108 + 29)`,
    codeTitle: 'topology/02-trefoil-constants.js'
  },
  {
    id: 'gauge-symmetry',
    number: '3',
    title: 'Gauge Symmetry',
    subtitle: 'Standard Model from 108',
    description: 'The 108 factorization 2² × 3³ generates the Standard Model gauge group SU(3) × SU(2) × U(1).',
    concepts: ['SU(3) Color', 'SU(2) Weak Isospin', 'U(1) Electromagnetic', 'Gauge Group'],
    code: `import { GaugeSymmetry } from '@aleph-ai/tinyaleph';

const sm = GaugeSymmetry.standardModel();
console.log(sm.name);           // 'SU(3) × SU(2) × U(1)'
console.log(sm.generators);     // { SU3: 8, SU2: 3, U1: 1 }
console.log(sm.totalDimension); // 12

// Decomposition from 108
// SU(3) from 3³ = 27 (color force)
// SU(2) from 2² = 4 (weak force)
// U(1) from full 108 (electromagnetic)`,
    codeTitle: 'topology/03-gauge-symmetry.js'
  },
  {
    id: 'free-energy',
    number: '4',
    title: 'Free Energy Dynamics',
    subtitle: 'Cubic FEP model',
    description: 'Consciousness modeled as entropy minimization using cubic free energy dynamics dψ/dt = αψ + βψ² + γψ³.',
    concepts: ['Free Energy Principle', 'Fixed Points', 'Attractor Dynamics', 'Observer Hierarchy'],
    code: `import { FreeEnergyDynamics, OBSERVER_HIERARCHY } from '@aleph-ai/tinyaleph';

const fep = new FreeEnergyDynamics({
  alpha: 0.1,   // Linear coefficient
  beta: -0.5,   // Quadratic coefficient
  gamma: -0.1   // Cubic coefficient
});

// Evaluate free energy at belief state ψ
const energy = fep.freeEnergy(0.5);
const gradient = fep.gradient(0.5);

// Find stable states (local minima)
const fixedPoints = fep.findMinima();

// Observer capacity scales
OBSERVER_HIERARCHY.forEach(level => {
  console.log(level.name, level.scale, level.capacity);
});`,
    codeTitle: 'topology/04-free-energy-dynamics.js'
  }
];

const exampleComponents: Record<string, React.FC> = {
  '108-invariant': Invariant108Example,
  'trefoil-constants': TrefoilConstantsExample,
  'gauge-symmetry': GaugeSymmetryExample,
  'free-energy': FreeEnergyExample
};

export default function TopologyExamplesPage() {
  return (
    <ExamplePageWrapper
      category="Topology"
      title="Topological Invariants"
      description="The 108 invariant, knot theory, and physical constant derivation from topological morphogenesis."
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'Physics', path: '/physics' }}
      nextSection={{ title: 'CRT-Homology', path: '/crt-homology' }}
    />
  );
}