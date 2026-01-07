import { useState, useCallback } from 'react';
import { Play, Grid3X3, Atom } from 'lucide-react';
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
  { id: 'fano', number: '1', title: 'Fano Plane', subtitle: 'Octonion geometry', description: 'The Fano plane encodes the multiplication table for octonions. Click lines to see the corresponding multiplication rules.', concepts: ['Fano Plane', 'Octonions', 'Non-associative Algebra'], code: `const FANO_LINES = [[0,1,3], [1,2,4], [2,3,5], [3,4,6], [4,5,0], [5,6,1], [6,0,2]];\n\n// Octonion multiplication: e₁ × e₂ = e₄\nconst result = octonionMultiplyIndex(0, 1);\nconsole.log(result); // { k: 3, sign: 1 }`, codeTitle: 'math/01-fano.js' },
  { id: 'algebraic', number: '2', title: 'Algebraic Integers', subtitle: 'Gaussian & Eisenstein', description: 'Gaussian integers (a + bi) and Eisenstein integers (a + bω) with their norms and conjugates.', concepts: ['Gaussian Integers', 'Norm', 'Number Rings'], code: `const g = new GaussianInteger(3, 4);\nconsole.log('Norm:', g.norm()); // 25\nconsole.log('Conjugate:', g.conjugate()); // 3 - 4i`, codeTitle: 'math/02-algebraic.js' },
];

const exampleComponents: Record<string, React.FC> = { 'fano': FanoPlaneExample, 'algebraic': AlgebraicExample };

export default function MathExamplesPage() {
  return <ExamplePageWrapper category="Mathematics" title="Mathematical Foundations" description="Fano plane geometry, algebraic integers, and number theory." examples={examples} exampleComponents={exampleComponents} previousSection={{ title: 'Engine', path: '/engine' }} nextSection={{ title: 'ML', path: '/ml' }} />;
}
