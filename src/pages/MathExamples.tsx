import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowLeft, Grid3X3, Atom, Calculator } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

// Fano plane lines (octonion multiplication)
const FANO_LINES = [[0,1,3], [1,2,4], [2,3,5], [3,4,6], [4,5,0], [5,6,1], [6,0,2]];

const octonionMultiplyIndex = (i: number, j: number) => {
  if (i === j) return { k: 0, sign: -1 };
  for (const line of FANO_LINES) {
    const idx = line.indexOf(i);
    if (idx !== -1 && line.includes(j)) {
      const jIdx = line.indexOf(j);
      const k = line[3 - idx - jIdx];
      const sign = (jIdx - idx + 3) % 3 === 1 ? 1 : -1;
      return { k, sign };
    }
  }
  return { k: 0, sign: 1 };
};

const sedenionMultiplyIndex = octonionMultiplyIndex;

class GaussianInteger {
  constructor(public real: number, public imag: number) {}
  norm() { return this.real ** 2 + this.imag ** 2; }
  conjugate() { return new GaussianInteger(this.real, -this.imag); }
}

class EisensteinInteger {
  constructor(public a: number, public b: number) {}
  norm() { return this.a ** 2 - this.a * this.b + this.b ** 2; }
  conjugate() { return new EisensteinInteger(this.a - this.b, -this.b); }
}

const primeToFrequency = (p: number) => Math.log(p);
const primeToAngle = (p: number) => (p * 2.399963) % (2 * Math.PI);
const sumOfTwoSquares = (n: number): { a: number; b: number } | null => {
  for (let a = 0; a * a <= n; a++) {
    const bSq = n - a * a;
    const b = Math.sqrt(bSq);
    if (Number.isInteger(b)) return { a, b };
  }
  return null;
};

// Fano Plane Visualization
const FanoPlaneExample = () => {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [multiplyResult, setMultiplyResult] = useState<{
    i: number;
    j: number;
    octonion: { k: number; sign: number };
    sedenion: { k: number; sign: number };
  } | null>(null);

  const runMultiply = useCallback((i: number, j: number) => {
    const octonion = octonionMultiplyIndex(i, j);
    const sedenion = sedenionMultiplyIndex(i, j);
    setMultiplyResult({ i, j, octonion, sedenion });
  }, []);

  const points = [
    { id: 0, x: 150, y: 30, label: 'e₁' },
    { id: 1, x: 50, y: 130, label: 'e₂' },
    { id: 2, x: 250, y: 130, label: 'e₃' },
    { id: 3, x: 100, y: 80, label: 'e₄' },
    { id: 4, x: 200, y: 80, label: 'e₅' },
    { id: 5, x: 150, y: 130, label: 'e₆' },
    { id: 6, x: 150, y: 100, label: 'e₇' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-primary" />
          Fano Plane & Octonion Multiplication
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <svg viewBox="0 0 300 160" className="w-full max-w-xs mx-auto">
              {/* Lines */}
              {FANO_LINES.map((line: number[], idx: number) => {
                const isSelected = selectedLine === idx;
                const p1 = points[line[0]];
                const p2 = points[line[1]];
                const p3 = points[line[2]];
                return (
                  <g key={idx}>
                    <line
                      x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                      stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={0.5}
                    />
                    <line
                      x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y}
                      stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={0.5}
                    />
                  </g>
                );
              })}
              {/* Circle for center line */}
              <circle
                cx={150} cy={100} r={50}
                fill="none"
                stroke={selectedLine === 6 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                strokeWidth={selectedLine === 6 ? 2 : 1}
                opacity={0.5}
              />
              {/* Points */}
              {points.map((p) => (
                <g key={p.id}>
                  <circle
                    cx={p.x} cy={p.y} r={12}
                    fill="hsl(var(--primary))"
                    className="cursor-pointer hover:opacity-80"
                    onClick={() => runMultiply(p.id, (p.id + 1) % 7)}
                  />
                  <text
                    x={p.x} y={p.y + 4}
                    textAnchor="middle"
                    fill="hsl(var(--primary-foreground))"
                    fontSize={10}
                    fontWeight="bold"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
            
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {FANO_LINES.map((_: number[], idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedLine(selectedLine === idx ? null : idx)}
                  className={`px-3 py-1 rounded-md text-sm font-mono transition-colors ${
                    selectedLine === idx
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-primary/20'
                  }`}
                >
                  L{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The Fano plane defines octonion multiplication rules. Each line represents a 
              quaternionic triple where eᵢ × eⱼ = eₖ.
            </p>
            
            {selectedLine !== null && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="font-mono text-sm">
                  Line {selectedLine + 1}: [{FANO_LINES[selectedLine].map((i: number) => `e${i + 1}`).join(', ')}]
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Multiplication rule: e{FANO_LINES[selectedLine][0] + 1} × e{FANO_LINES[selectedLine][1] + 1} = e{FANO_LINES[selectedLine][2] + 1}
                </p>
              </div>
            )}

            {multiplyResult && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-semibold mb-2">e{multiplyResult.i + 1} × e{multiplyResult.j + 1}</p>
                <div className="space-y-1 text-sm">
                  <p>Octonion: {multiplyResult.octonion.sign > 0 ? '+' : '-'}e{multiplyResult.octonion.k + 1}</p>
                  <p>Sedenion: {multiplyResult.sedenion.sign > 0 ? '+' : '-'}e{multiplyResult.sedenion.k + 1}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { FANO_LINES, octonionMultiplyIndex, sedenionMultiplyIndex } from '@aleph-ai/tinyaleph';

// The 7 lines of the Fano plane
console.log(FANO_LINES);
// [[0,1,3], [1,2,4], [2,3,5], [3,4,6], [4,5,0], [5,6,1], [6,0,2]]

// Octonion multiplication: e₁ × e₂
const result = octonionMultiplyIndex(0, 1);
console.log(result); // { k: 3, sign: 1 } → e₁ × e₂ = +e₄

// Sedenion multiplication extends to 16 dimensions
const sedenion = sedenionMultiplyIndex(0, 8);
console.log(sedenion); // { k: 9, sign: 1 }`}
        language="javascript"
        title="fano-multiplication.js"
      />
    </div>
  );
};

// Gaussian & Eisenstein Integers
const AlgebraicIntegersExample = () => {
  const [gaussReal, setGaussReal] = useState(3);
  const [gaussImag, setGaussImag] = useState(4);
  const [eisenReal, setEisenReal] = useState(2);
  const [eisenOmega, setEisenOmega] = useState(3);
  const [results, setResults] = useState<{
    gauss: { norm: number; conjugate: { real: number; imag: number } };
    eisen: { norm: number; conjugate: { a: number; b: number } };
    squares: { a: number; b: number } | null;
  } | null>(null);

  const runAnalysis = useCallback(() => {
    const g = new GaussianInteger(gaussReal, gaussImag);
    const e = new EisensteinInteger(eisenReal, eisenOmega);
    const n = gaussReal * gaussReal + gaussImag * gaussImag;
    const squares = sumOfTwoSquares(n);
    
    setResults({
      gauss: {
        norm: g.norm(),
        conjugate: { real: g.conjugate().real, imag: g.conjugate().imag }
      },
      eisen: {
        norm: e.norm(),
        conjugate: { a: e.conjugate().a, b: e.conjugate().b }
      },
      squares
    });
  }, [gaussReal, gaussImag, eisenReal, eisenOmega]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Atom className="w-5 h-5 text-primary" />
          Gaussian & Eisenstein Integers
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <label className="text-sm font-medium mb-2 block">Gaussian Integer (a + bi)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={gaussReal}
                  onChange={(e) => setGaussReal(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono"
                />
                <span className="text-muted-foreground">+</span>
                <input
                  type="number"
                  value={gaussImag}
                  onChange={(e) => setGaussImag(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono"
                />
                <span className="text-muted-foreground">i</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <label className="text-sm font-medium mb-2 block">Eisenstein Integer (a + bω)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={eisenReal}
                  onChange={(e) => setEisenReal(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono"
                />
                <span className="text-muted-foreground">+</span>
                <input
                  type="number"
                  value={eisenOmega}
                  onChange={(e) => setEisenOmega(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono"
                />
                <span className="text-muted-foreground">ω</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">ω = e^(2πi/3) = (-1 + √3i)/2</p>
            </div>

            <button
              onClick={runAnalysis}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Analyze
            </button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="font-semibold mb-2">Gaussian: {gaussReal} + {gaussImag}i</p>
                <div className="text-sm space-y-1">
                  <p>Norm: <span className="text-primary font-mono">{results.gauss.norm}</span></p>
                  <p>Conjugate: <span className="font-mono">{results.gauss.conjugate.real} - {Math.abs(results.gauss.conjugate.imag)}i</span></p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="font-semibold mb-2">Eisenstein: {eisenReal} + {eisenOmega}ω</p>
                <div className="text-sm space-y-1">
                  <p>Norm: <span className="text-primary font-mono">{results.eisen.norm}</span></p>
                  <p>Conjugate: <span className="font-mono">{results.eisen.conjugate.a} + {results.eisen.conjugate.b}ω²</span></p>
                </div>
              </div>

              {results.squares && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Sum of Two Squares:</p>
                  <p className="font-mono">{results.gauss.norm} = {results.squares.a}² + {results.squares.b}²</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { GaussianInteger, EisensteinInteger, sumOfTwoSquares } from '@aleph-ai/tinyaleph';

// Gaussian integers: Z[i] = { a + bi : a, b ∈ Z }
const g = new GaussianInteger(3, 4);
console.log('Norm:', g.norm());        // 25 (= 3² + 4²)
console.log('Conjugate:', g.conjugate()); // 3 - 4i

// Eisenstein integers: Z[ω] where ω = e^(2πi/3)
const e = new EisensteinInteger(2, 3);
console.log('Norm:', e.norm());        // 7 (= a² - ab + b²)

// Factor as sum of two squares
const result = sumOfTwoSquares(25);
console.log(result); // { a: 3, b: 4 } → 25 = 3² + 4²`}
        language="javascript"
        title="algebraic-integers.js"
      />
    </div>
  );
};

// Prime Geometry
const PrimeGeometryExample = () => {
  const [primes] = useState([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const [angles, setAngles] = useState<number[]>([]);

  const runCompute = useCallback(() => {
    setFrequencies(primes.map(p => primeToFrequency(p)));
    setAngles(primes.map(p => primeToAngle(p)));
  }, [primes]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Prime Geometry
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <button
              onClick={runCompute}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-4"
            >
              <Play className="w-4 h-4" /> Compute Geometry
            </button>

            {frequencies.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Prime → Frequency & Angle Mapping</p>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Prime</th>
                        <th className="px-3 py-2 text-left">Frequency</th>
                        <th className="px-3 py-2 text-left">Angle (rad)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {primes.map((p, i) => (
                        <tr key={p} className="border-t border-border">
                          <td className="px-3 py-2 font-mono text-primary">{p}</td>
                          <td className="px-3 py-2 font-mono">{frequencies[i]?.toFixed(4)}</td>
                          <td className="px-3 py-2 font-mono">{angles[i]?.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            {angles.length > 0 && (
              <svg viewBox="0 0 200 200" className="w-48 h-48">
                <circle cx={100} cy={100} r={80} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.3} />
                {angles.map((angle, i) => {
                  const x = 100 + 70 * Math.cos(angle);
                  const y = 100 + 70 * Math.sin(angle);
                  return (
                    <g key={primes[i]}>
                      <line
                        x1={100} y1={100}
                        x2={x} y2={y}
                        stroke="hsl(var(--primary))"
                        strokeWidth={1}
                        opacity={0.5}
                      />
                      <circle cx={x} cy={y} r={6} fill="hsl(var(--primary))" />
                      <text
                        x={x} y={y - 10}
                        textAnchor="middle"
                        fill="hsl(var(--foreground))"
                        fontSize={8}
                      >
                        {primes[i]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { primeToFrequency, primeToAngle } from '@aleph-ai/tinyaleph';

// Map primes to frequencies (log-scale)
console.log(primeToFrequency(2));  // 0.6931...
console.log(primeToFrequency(7));  // 1.9459...

// Map primes to angles on unit circle
console.log(primeToAngle(2));  // Maps prime to [0, 2π)
console.log(primeToAngle(7));

// Use for phase-locked oscillator systems
// Each prime gets a unique angular frequency`}
        language="javascript"
        title="prime-geometry.js"
      />
    </div>
  );
};

const MathExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Examples
          </Link>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Mathematics</h1>
          <p className="text-muted-foreground">
            Algebraic structures, Fano plane, and prime geometry for hypercomplex computation.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              Fano Plane & Multiplication Rules
            </h2>
            <FanoPlaneExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
              Algebraic Number Fields
            </h2>
            <AlgebraicIntegersExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">3</span>
              Prime Geometry
            </h2>
            <PrimeGeometryExample />
          </section>
        </div>
      </div>
    </div>
  );
};

export default MathExamplesPage;
