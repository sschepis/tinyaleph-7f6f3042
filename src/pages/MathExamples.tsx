import { useState, useCallback, useMemo } from 'react';
import { Play, Grid3X3, Atom, Rotate3D, Box, Calculator, Binary, Sparkles } from 'lucide-react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';

const FANO_LINES = [[0,1,3], [1,2,4], [2,3,5], [3,4,6], [4,5,0], [5,6,1], [6,0,2]];

const FanoPlaneExample = () => {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const points = [{ id: 0, x: 150, y: 30 }, { id: 1, x: 50, y: 130 }, { id: 2, x: 250, y: 130 }, { id: 3, x: 100, y: 80 }, { id: 4, x: 200, y: 80 }, { id: 5, x: 150, y: 130 }, { id: 6, x: 150, y: 100 }];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <svg viewBox="0 0 300 160" className="w-full max-w-xs mx-auto">
          {FANO_LINES.map((line, idx) => {
            const p1 = points[line[0]], p2 = points[line[1]];
            return <line key={idx} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={selectedLine === idx ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} strokeWidth={selectedLine === idx ? 2 : 1} opacity={0.5} />;
          })}
          <circle cx={150} cy={100} r={50} fill="none" stroke="hsl(var(--muted-foreground))" opacity={0.5} />
          {points.map(p => (<circle key={p.id} cx={p.x} cy={p.y} r={12} fill="hsl(var(--primary))" />))}
        </svg>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {FANO_LINES.map((_, idx) => (<button key={idx} onClick={() => setSelectedLine(selectedLine === idx ? null : idx)} className={`px-3 py-1 rounded-md text-sm font-mono ${selectedLine === idx ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>L{idx + 1}</button>))}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">The Fano plane defines octonion multiplication rules. Each line represents a quaternionic triple.</p>
        {selectedLine !== null && (<div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30"><p className="font-mono text-sm">Line {selectedLine + 1}: e{FANO_LINES[selectedLine][0]+1} × e{FANO_LINES[selectedLine][1]+1} = e{FANO_LINES[selectedLine][2]+1}</p></div>)}
      </div>
    </div>
  );
};

// Quaternion Example
const QuaternionExample = () => {
  const [q1, setQ1] = useState({ w: 1, x: 2, y: 3, z: 4 });
  const [q2, setQ2] = useState({ w: 2, x: -1, y: 1, z: 3 });
  
  const hamiltonProduct = useMemo(() => {
    const { w: w1, x: x1, y: y1, z: z1 } = q1;
    const { w: w2, x: x2, y: y2, z: z2 } = q2;
    return {
      w: w1*w2 - x1*x2 - y1*y2 - z1*z2,
      x: w1*x2 + x1*w2 + y1*z2 - z1*y2,
      y: w1*y2 - x1*z2 + y1*w2 + z1*x2,
      z: w1*z2 + x1*y2 - y1*x2 + z1*w2
    };
  }, [q1, q2]);

  const reverseProduct = useMemo(() => {
    const { w: w1, x: x1, y: y1, z: z1 } = q2;
    const { w: w2, x: x2, y: y2, z: z2 } = q1;
    return {
      w: w1*w2 - x1*x2 - y1*y2 - z1*z2,
      x: w1*x2 + x1*w2 + y1*z2 - z1*y2,
      y: w1*y2 - x1*z2 + y1*w2 + z1*x2,
      z: w1*z2 + x1*y2 - y1*x2 + z1*w2
    };
  }, [q1, q2]);

  const norm1 = Math.sqrt(q1.w**2 + q1.x**2 + q1.y**2 + q1.z**2);
  const norm2 = Math.sqrt(q2.w**2 + q2.x**2 + q2.y**2 + q2.z**2);

  const formatQ = (q: typeof q1) => {
    const parts = [];
    if (q.w !== 0) parts.push(q.w.toFixed(1));
    if (q.x !== 0) parts.push(`${q.x >= 0 && parts.length ? '+' : ''}${q.x.toFixed(1)}i`);
    if (q.y !== 0) parts.push(`${q.y >= 0 && parts.length ? '+' : ''}${q.y.toFixed(1)}j`);
    if (q.z !== 0) parts.push(`${q.z >= 0 && parts.length ? '+' : ''}${q.z.toFixed(1)}k`);
    return parts.join('') || '0';
  };

  const isCommutative = hamiltonProduct.w === reverseProduct.w && hamiltonProduct.x === reverseProduct.x && 
                        hamiltonProduct.y === reverseProduct.y && hamiltonProduct.z === reverseProduct.z;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Rotate3D className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quaternion Algebra</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">q₁ = w + xi + yj + zk</label>
            <div className="grid grid-cols-4 gap-2">
              {(['w', 'x', 'y', 'z'] as const).map(k => (
                <input key={k} type="number" value={q1[k]} onChange={(e) => setQ1({...q1, [k]: Number(e.target.value)})}
                  className="px-2 py-1 rounded bg-secondary border border-border font-mono text-sm" placeholder={k} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">q₂ = w + xi + yj + zk</label>
            <div className="grid grid-cols-4 gap-2">
              {(['w', 'x', 'y', 'z'] as const).map(k => (
                <input key={k} type="number" value={q2[k]} onChange={(e) => setQ2({...q2, [k]: Number(e.target.value)})}
                  className="px-2 py-1 rounded bg-secondary border border-border font-mono text-sm" placeholder={k} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">|q₁|</p>
              <p className="font-mono text-primary">{norm1.toFixed(3)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">|q₂|</p>
              <p className="font-mono text-primary">{norm2.toFixed(3)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm font-medium mb-2">Hamilton Product q₁ × q₂</p>
            <p className="font-mono text-lg text-primary">{formatQ(hamiltonProduct)}</p>
          </div>
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <p className="text-sm font-medium mb-2">Reverse q₂ × q₁</p>
            <p className="font-mono text-lg text-orange-400">{formatQ(reverseProduct)}</p>
          </div>
          <div className={`p-3 rounded-lg ${isCommutative ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <p className="text-sm font-medium">{isCommutative ? '✓ Commutative (rare!)' : '✗ Non-commutative (q₁×q₂ ≠ q₂×q₁)'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Octonion Example
const OctonionExample = () => {
  const [o1, setO1] = useState([1, 2, 0, 0, 1, 0, 0, 0]);
  const [o2, setO2] = useState([0, 1, 1, 0, 0, 1, 0, 1]);
  
  const labels = ['1', 'e₁', 'e₂', 'e₃', 'e₄', 'e₅', 'e₆', 'e₇'];
  
  const norm1 = Math.sqrt(o1.reduce((s, v) => s + v*v, 0));
  const norm2 = Math.sqrt(o2.reduce((s, v) => s + v*v, 0));
  
  const sum = o1.map((v, i) => v + o2[i]);
  const conjugate1 = [o1[0], ...o1.slice(1).map(v => -v)];

  const formatO = (o: number[]) => {
    const parts: string[] = [];
    o.forEach((v, i) => {
      if (Math.abs(v) > 0.001) {
        const sign = v >= 0 && parts.length > 0 ? '+' : '';
        parts.push(`${sign}${v.toFixed(1)}${labels[i] === '1' ? '' : labels[i]}`);
      }
    });
    return parts.join('') || '0';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Box className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Octonion Algebra (8D)</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">o₁ components (8 dimensions)</label>
            <div className="grid grid-cols-4 gap-2">
              {o1.map((v, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-muted-foreground">{labels[i]}</p>
                  <input type="number" value={v} onChange={(e) => { const n = [...o1]; n[i] = Number(e.target.value); setO1(n); }}
                    className="w-full px-2 py-1 rounded bg-secondary border border-border font-mono text-sm text-center" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">o₂ components</label>
            <div className="grid grid-cols-4 gap-2">
              {o2.map((v, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-muted-foreground">{labels[i]}</p>
                  <input type="number" value={v} onChange={(e) => { const n = [...o2]; n[i] = Number(e.target.value); setO2(n); }}
                    className="w-full px-2 py-1 rounded bg-secondary border border-border font-mono text-sm text-center" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">|o₁|</p>
              <p className="font-mono text-primary">{norm1.toFixed(3)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">|o₂|</p>
              <p className="font-mono text-primary">{norm2.toFixed(3)}</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm font-medium mb-2">Sum o₁ + o₂</p>
            <p className="font-mono text-sm text-primary break-all">{formatO(sum)}</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm font-medium mb-2">Conjugate o₁*</p>
            <p className="font-mono text-sm text-blue-400 break-all">{formatO(conjugate1)}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10">
            <p className="text-xs text-muted-foreground">⚠️ Octonions are non-associative: (ab)c ≠ a(bc)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prime Factorization Example
const PrimeFactorizationExample = () => {
  const [number, setNumber] = useState(360);
  
  const factorize = (n: number): number[] => {
    if (n < 2) return [];
    const factors: number[] = [];
    let d = 2;
    while (n > 1) {
      while (n % d === 0) { factors.push(d); n = n / d; }
      d++;
      if (d * d > n && n > 1) { factors.push(n); break; }
    }
    return factors;
  };

  const sieve = useMemo(() => {
    const limit = 100;
    const s = new Array(limit + 1).fill(true);
    s[0] = s[1] = false;
    for (let i = 2; i * i <= limit; i++) {
      if (s[i]) for (let j = i * i; j <= limit; j += i) s[j] = false;
    }
    return s.map((v, i) => v ? i : 0).filter(Boolean);
  }, []);

  const factors = useMemo(() => factorize(number), [number]);
  const factorCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    factors.forEach(f => counts[f] = (counts[f] || 0) + 1);
    return counts;
  }, [factors]);

  const formatFactorization = () => {
    return Object.entries(factorCounts)
      .map(([p, e]) => e === 1 ? p : `${p}^${e}`)
      .join(' × ');
  };

  const isPrime = factors.length === 1 && factors[0] === number;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Prime Factorization</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Enter a number</label>
            <input type="number" value={number} onChange={(e) => setNumber(Math.max(2, parseInt(e.target.value) || 2))}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border font-mono" min={2} />
          </div>

          <div className="flex flex-wrap gap-2">
            {[12, 60, 100, 360, 1001, 2310].map(n => (
              <button key={n} onClick={() => setNumber(n)} className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm font-mono">{n}</button>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Primes up to 100</p>
            <p className="font-mono text-xs text-muted-foreground break-all">{sieve.join(', ')}</p>
            <p className="text-xs text-muted-foreground mt-2">Count: {sieve.length} primes</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${isPrime ? 'bg-green-500/10 border border-green-500/30' : 'bg-primary/10 border border-primary/30'}`}>
            <p className="text-sm font-medium mb-2">{isPrime ? '✓ Prime Number!' : 'Factorization'}</p>
            <p className="font-mono text-xl text-primary">{number} = {formatFactorization()}</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Factor Distribution</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(factorCounts).map(([p, count]) => (
                <div key={p} className="px-3 py-2 rounded-lg bg-primary/20 text-center">
                  <p className="font-mono text-lg text-primary">{p}</p>
                  <p className="text-xs text-muted-foreground">×{count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10">
            <p className="text-xs">Unique prime factors: <span className="font-mono text-blue-400">{Object.keys(factorCounts).length}</span></p>
            <p className="text-xs">Total prime factors: <span className="font-mono text-blue-400">{factors.length}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vector Spaces Example
const VectorSpaceExample = () => {
  const [v1, setV1] = useState([1, 2, 3, 4]);
  const [v2, setV2] = useState([2, -1, 0, 3]);
  const [scalar, setScalar] = useState(2.5);

  const sum = v1.map((v, i) => v + v2[i]);
  const scaled = v1.map(v => v * scalar);
  const dot = v1.reduce((s, v, i) => s + v * v2[i], 0);
  const norm1 = Math.sqrt(v1.reduce((s, v) => s + v*v, 0));
  const norm2 = Math.sqrt(v2.reduce((s, v) => s + v*v, 0));
  const cosAngle = dot / (norm1 * norm2);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Binary className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Vector Space Operations</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Vector v₁ ∈ ℝ⁴</label>
            <div className="grid grid-cols-4 gap-2">
              {v1.map((v, i) => (
                <input key={i} type="number" value={v} onChange={(e) => { const n = [...v1]; n[i] = Number(e.target.value); setV1(n); }}
                  className="px-2 py-1 rounded bg-secondary border border-border font-mono text-sm" />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Vector v₂ ∈ ℝ⁴</label>
            <div className="grid grid-cols-4 gap-2">
              {v2.map((v, i) => (
                <input key={i} type="number" value={v} onChange={(e) => { const n = [...v2]; n[i] = Number(e.target.value); setV2(n); }}
                  className="px-2 py-1 rounded bg-secondary border border-border font-mono text-sm" />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Scalar α = {scalar}</label>
            <input type="range" min={-3} max={3} step={0.1} value={scalar} onChange={(e) => setScalar(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">|v₁|</p>
              <p className="font-mono text-primary">{norm1.toFixed(3)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">|v₂|</p>
              <p className="font-mono text-primary">{norm2.toFixed(3)}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm font-medium mb-2">v₁ + v₂</p>
            <p className="font-mono">[{sum.map(v => v.toFixed(2)).join(', ')}]</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm font-medium mb-2">α × v₁</p>
            <p className="font-mono">[{scaled.map(v => v.toFixed(2)).join(', ')}]</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-green-500/10 text-center">
              <p className="text-xs text-muted-foreground">Dot Product</p>
              <p className="font-mono text-green-400">{dot.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10 text-center">
              <p className="text-xs text-muted-foreground">Angle</p>
              <p className="font-mono text-orange-400">{angle.toFixed(1)}°</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Gaussian Primes Example
const GaussianPrimesExample = () => {
  const [gaussReal, setGaussReal] = useState(3);
  const [gaussImag, setGaussImag] = useState(4);
  const norm = gaussReal * gaussReal + gaussImag * gaussImag;

  const isGaussianPrime = (a: number, b: number): boolean => {
    const n = a * a + b * b;
    if (n < 2) return false;
    if (b === 0) {
      const absA = Math.abs(a);
      if (absA % 4 !== 3) return false;
      for (let i = 2; i * i <= absA; i++) if (absA % i === 0) return false;
      return true;
    }
    if (a === 0) {
      const absB = Math.abs(b);
      if (absB % 4 !== 3) return false;
      for (let i = 2; i * i <= absB; i++) if (absB % i === 0) return false;
      return true;
    }
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return n > 1;
  };

  const primeCheck = isGaussianPrime(gaussReal, gaussImag);

  // Generate some Gaussian primes for display
  const sampleGaussianPrimes = useMemo(() => {
    const primes: string[] = [];
    for (let a = -5; a <= 5; a++) {
      for (let b = -5; b <= 5; b++) {
        if (isGaussianPrime(a, b) && primes.length < 12) {
          const sign = b >= 0 ? '+' : '';
          primes.push(`${a}${sign}${b}i`);
        }
      }
    }
    return primes;
  }, []);

  const formatGaussian = (a: number, b: number) => {
    if (b === 0) return a.toString();
    if (a === 0) return b === 1 ? 'i' : b === -1 ? '-i' : `${b}i`;
    const sign = b > 0 ? ' + ' : ' - ';
    const absB = Math.abs(b);
    return `${a}${sign}${absB === 1 ? '' : absB}i`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Gaussian Integers & Primes</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Gaussian integers ℤ[i] = {'{'}a + bi : a, b ∈ ℤ{'}'}</p>
          
          <div className="flex gap-2 items-center">
            <input type="number" value={gaussReal} onChange={(e) => setGaussReal(Number(e.target.value))} className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border font-mono" />
            <span>+</span>
            <input type="number" value={gaussImag} onChange={(e) => setGaussImag(Number(e.target.value))} className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border font-mono" />
            <span>i</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[[3, 2], [2, 1], [1, 1], [3, 0], [2, 3]].map(([a, b]) => (
              <button key={`${a}-${b}`} onClick={() => { setGaussReal(a); setGaussImag(b); }}
                className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm font-mono">{a}+{b}i</button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-muted-foreground">Gaussian Integer</p>
            <p className="font-mono text-2xl text-primary">{formatGaussian(gaussReal, gaussImag)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Norm N(z)</p>
              <p className="font-mono text-lg text-primary">{norm}</p>
              <p className="text-[10px] text-muted-foreground">{gaussReal}² + {gaussImag}²</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Conjugate z*</p>
              <p className="font-mono text-lg text-primary">{formatGaussian(gaussReal, -gaussImag)}</p>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${primeCheck ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
            <p className="font-medium">{primeCheck ? '✓ Gaussian Prime' : '✗ Not a Gaussian Prime'}</p>
            <p className="text-xs text-muted-foreground mt-1">{primeCheck ? 'Cannot be factored further in ℤ[i]' : 'Can be factored in ℤ[i]'}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Sample Gaussian Primes</p>
            <p className="font-mono text-xs break-all">{sampleGaussianPrimes.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlgebraicExample = () => {
  const [gaussReal, setGaussReal] = useState(3);
  const [gaussImag, setGaussImag] = useState(4);
  const norm = gaussReal * gaussReal + gaussImag * gaussImag;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4"><Atom className="w-5 h-5 text-primary" /><h3 className="font-semibold">Gaussian Integer</h3></div>
      <div className="flex gap-2 items-center">
        <input type="number" value={gaussReal} onChange={(e) => setGaussReal(Number(e.target.value))} className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border font-mono" />
        <span>+</span>
        <input type="number" value={gaussImag} onChange={(e) => setGaussImag(Number(e.target.value))} className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border font-mono" />
        <span>i</span>
      </div>
      <div className="p-4 rounded-lg bg-primary/10"><p>Norm: <span className="text-primary font-mono">{norm}</span> = {gaussReal}² + {gaussImag}²</p></div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  { id: 'quaternions', number: '1', title: 'Quaternions', subtitle: '4D hypercomplex algebra', description: 'Explore quaternion algebra with Hamilton product multiplication. Quaternions are non-commutative and essential for 3D rotations.', concepts: ['Hamilton Product', 'Non-commutativity', '3D Rotations', 'Norm'], code: `const { Hypercomplex } = require('tinyaleph');

// Create quaternion q = a + bi + cj + dk
function createQuaternion(a, b, c, d) {
  const q = Hypercomplex.zero(4);
  q.c = [a, b, c, d];
  return q;
}

const q1 = createQuaternion(1, 2, 3, 4);
const q2 = createQuaternion(2, -1, 1, 3);

// Hamilton product (non-commutative!)
const product = quaternionMul(q1, q2);
console.log('q1 × q2 ≠ q2 × q1');`, codeTitle: 'math/01-quaternions.js' },
  
  { id: 'octonions', number: '2', title: 'Octonions', subtitle: '8D non-associative algebra', description: 'Explore 8-dimensional octonions, extending quaternions with 7 imaginary units. Octonions are non-associative and appear in string theory.', concepts: ['Non-associativity', '7 Imaginary Units', 'Fano Plane', 'Exceptional Lie Groups'], code: `const { Hypercomplex } = require('tinyaleph');

// Octonion: o = a₀ + a₁e₁ + a₂e₂ + ... + a₇e₇
const o1 = Hypercomplex.zero(8);
o1.c = [1, 2, 0, 0, 1, 0, 0, 0];

// Warning: (ab)c ≠ a(bc) for octonions!
console.log('Octonions are non-associative');`, codeTitle: 'math/02-octonions.js' },

  { id: 'prime-factorization', number: '3', title: 'Prime Factorization', subtitle: 'Unique decomposition', description: 'Factor integers into their prime components. The Fundamental Theorem of Arithmetic guarantees uniqueness.', concepts: ['Prime Numbers', 'Unique Factorization', 'Sieve of Eratosthenes'], code: `function factorize(n) {
  const factors = [];
  let d = 2;
  while (n > 1) {
    while (n % d === 0) {
      factors.push(d);
      n = n / d;
    }
    d++;
    if (d * d > n && n > 1) {
      factors.push(n);
      break;
    }
  }
  return factors;
}

console.log(factorize(360)); // [2, 2, 2, 3, 3, 5]`, codeTitle: 'math/03-prime-factorization.js' },

  { id: 'vector-spaces', number: '4', title: 'Vector Spaces', subtitle: 'Linear algebra foundations', description: 'Explore vector operations: addition, scalar multiplication, dot products, and angles between vectors.', concepts: ['Vector Addition', 'Scalar Multiplication', 'Dot Product', 'Norm'], code: `const v1 = [1, 2, 3, 4];
const v2 = [2, -1, 0, 3];

// Vector addition
const sum = v1.map((v, i) => v + v2[i]);

// Dot product
const dot = v1.reduce((s, v, i) => s + v * v2[i], 0);

// Angle between vectors
const norm1 = Math.sqrt(v1.reduce((s, v) => s + v*v, 0));
const norm2 = Math.sqrt(v2.reduce((s, v) => s + v*v, 0));
const angle = Math.acos(dot / (norm1 * norm2));`, codeTitle: 'math/04-vector-spaces.js' },

  { id: 'gaussian-primes', number: '5', title: 'Gaussian Primes', subtitle: 'Complex number primes', description: 'Explore primes in the Gaussian integers ℤ[i]. Different from regular primes, related to sums of two squares.', concepts: ['Gaussian Integers', 'Complex Primes', 'Norm', 'Factorization in ℤ[i]'], code: `// Gaussian integer: a + bi where a, b ∈ ℤ
const z = { real: 3, imag: 4 };

// Norm: N(a + bi) = a² + b²
const norm = z.real**2 + z.imag**2; // 25

// Gaussian prime check
function isGaussianPrime(a, b) {
  const n = a*a + b*b;
  // If b=0, check if |a| is prime and |a| ≡ 3 (mod 4)
  // Otherwise, check if n is prime
  return isPrime(n);
}`, codeTitle: 'math/05-gaussian-primes.js' },

  { id: 'fano', number: '6', title: 'Fano Plane', subtitle: 'Octonion geometry', description: 'The Fano plane encodes the multiplication table for octonions. Click lines to see the corresponding multiplication rules.', concepts: ['Fano Plane', 'Octonions', 'Non-associative Algebra'], code: `const FANO_LINES = [[0,1,3], [1,2,4], [2,3,5], [3,4,6], [4,5,0], [5,6,1], [6,0,2]];

// Octonion multiplication: e₁ × e₂ = e₄
const result = octonionMultiplyIndex(0, 1);
console.log(result); // { k: 3, sign: 1 }`, codeTitle: 'math/06-fano.js' },

  { id: 'algebraic', number: '7', title: 'Algebraic Integers', subtitle: 'Gaussian & Eisenstein', description: 'Gaussian integers (a + bi) and Eisenstein integers (a + bω) with their norms and conjugates.', concepts: ['Gaussian Integers', 'Norm', 'Number Rings'], code: `const g = new GaussianInteger(3, 4);
console.log('Norm:', g.norm()); // 25
console.log('Conjugate:', g.conjugate()); // 3 - 4i`, codeTitle: 'math/07-algebraic.js' },
];

const exampleComponents: Record<string, React.FC> = { 
  'quaternions': QuaternionExample,
  'octonions': OctonionExample,
  'prime-factorization': PrimeFactorizationExample,
  'vector-spaces': VectorSpaceExample,
  'gaussian-primes': GaussianPrimesExample,
  'fano': FanoPlaneExample, 
  'algebraic': AlgebraicExample 
};

export default function MathExamplesPage() {
  return <ExamplePageWrapper category="Mathematics" title="Mathematical Foundations" description="Quaternions, octonions, prime factorization, vector spaces, and algebraic integers." examples={examples} exampleComponents={exampleComponents} previousSection={{ title: 'Engine', path: '/engine' }} nextSection={{ title: 'ML', path: '/ml' }} />;
}
