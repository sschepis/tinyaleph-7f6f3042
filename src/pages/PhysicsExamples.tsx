import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import { OscillatorBank, Hypercomplex } from '@aleph-ai/tinyaleph';

const KuramotoExample = () => {
  const [oscillatorCount, setOscillatorCount] = useState(12);
  const [coupling, setCoupling] = useState(0.3);
  const [running, setRunning] = useState(false);
  const [phases, setPhases] = useState<number[]>([]);
  const [orderParameter, setOrderParameter] = useState(0);
  const [initMode, setInitMode] = useState<'even' | 'clustered' | 'seeded'>('even');
  const [seed, setSeed] = useState(1);
  const bankRef = useRef<OscillatorBank | null>(null);

  const initializePhases = useCallback((mode: 'even' | 'clustered' | 'seeded', seedVal: number) => {
    if (!bankRef.current) return;
    bankRef.current.oscillators.forEach((osc, i) => {
      switch (mode) {
        case 'even':
          osc.phase = (i / oscillatorCount) * 2 * Math.PI;
          break;
        case 'clustered':
          osc.phase = (i % 3) * (2 * Math.PI / 3) + (i * 0.1);
          break;
        case 'seeded':
          const h = Math.sin(seedVal * 12.9898 + i * 78.233) * 43758.5453;
          osc.phase = (h - Math.floor(h)) * 2 * Math.PI;
          break;
      }
      osc.amplitude = 0.8;
    });
  }, [oscillatorCount]);

  useEffect(() => {
    const frequencies = Array.from({ length: oscillatorCount }, (_, i) => 1 + (i - oscillatorCount / 2) * 0.1);
    bankRef.current = new OscillatorBank(frequencies as any);
    initializePhases(initMode, seed);
    updateState();
  }, [oscillatorCount]);

  const updateState = () => {
    if (!bankRef.current) return;
    const oscillators = bankRef.current.oscillators;
    setPhases(oscillators.map((osc: any) => osc.phase));
    let sx = 0, sy = 0;
    oscillators.forEach((osc: any) => { sx += Math.cos(osc.phase); sy += Math.sin(osc.phase); });
    setOrderParameter(Math.sqrt(sx * sx + sy * sy) / oscillators.length);
  };

  useEffect(() => {
    if (!running || !bankRef.current) return;
    const interval = setInterval(() => {
      const bank = bankRef.current!;
      const N = bank.oscillators.length;
      bank.oscillators.forEach((osc, i) => {
        let couplingSum = 0;
        bank.oscillators.forEach((other, j) => { if (i !== j) couplingSum += Math.sin(other.phase - osc.phase); });
        osc.phase = (osc.phase + (1 + (i - N / 2) * 0.1) * 0.05 + (coupling / N) * couplingSum * 0.05) % (2 * Math.PI);
      });
      updateState();
    }, 30);
    return () => clearInterval(interval);
  }, [running, coupling]);

  const resetPhases = (mode: 'even' | 'clustered' | 'seeded') => {
    setInitMode(mode);
    if (mode === 'seeded') setSeed(s => s + 1);
    initializePhases(mode, mode === 'seeded' ? seed + 1 : seed);
    updateState();
  };

  const centerX = 120, centerY = 120, radius = 90;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Oscillators: {oscillatorCount}</label>
          <input type="range" min="4" max="24" value={oscillatorCount} onChange={(e) => { setOscillatorCount(Number(e.target.value)); setRunning(false); }} className="w-full" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Coupling (K): {coupling.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.05" value={coupling} onChange={(e) => setCoupling(Number(e.target.value))} className="w-full" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRunning(!running)} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${running ? 'bg-accent' : 'bg-primary'} text-primary-foreground`}>
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {running ? 'Pause' : 'Start'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Reset:</span>
          <button onClick={() => resetPhases('even')} className={`px-3 py-1 rounded-md text-xs ${initMode === 'even' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Even</button>
          <button onClick={() => resetPhases('clustered')} className={`px-3 py-1 rounded-md text-xs ${initMode === 'clustered' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Clustered</button>
          <button onClick={() => resetPhases('seeded')} className="px-3 py-1 rounded-md text-xs bg-secondary flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Seed #{seed}
          </button>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm">
          <div className="flex justify-between"><span>Order Parameter (r):</span><span className={orderParameter > 0.7 ? 'text-primary' : ''}>{orderParameter.toFixed(4)}</span></div>
          <div className="flex justify-between"><span>Status:</span><span>{orderParameter > 0.8 ? 'Synchronized' : orderParameter > 0.5 ? 'Partial' : 'Desynchronized'}</span></div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <svg width="240" height="240">
          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="hsl(var(--border))" strokeDasharray="4 4" />
          <circle cx={centerX} cy={centerY} r={radius * orderParameter} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity={0.3} />
          {phases.map((phase, i) => (<circle key={i} cx={centerX + Math.cos(phase) * radius} cy={centerY + Math.sin(phase) * radius} r={6} fill={`hsl(${180 + (i / oscillatorCount) * 40}, 70%, 50%)`} />))}
        </svg>
      </div>
    </div>
  );
};

const EntropyExample = () => {
  const [components, setComponents] = useState<number[]>([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [entropy, setEntropy] = useState(0);
  const presets = [
    { name: 'Pure e₀', components: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Uniform', components: Array(16).fill(0.25) },
    { name: 'Diagonal', components: [0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Spread', components: [0.4, 0.3, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Alternating', components: Array(16).fill(0).map((_, i) => i % 2 === 0 ? 0.35 : 0) },
  ];
  const calculateEntropy = useCallback((c: number[]) => {
    const state = new Hypercomplex(16);
    c.forEach((v, i) => { (state as any).c[i] = v; });
    setEntropy(state.entropy());
    setComponents(c);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{presets.map((preset, i) => (<button key={i} onClick={() => calculateEntropy(preset.components)} className="px-3 py-1.5 rounded-md bg-secondary hover:bg-primary/20 text-sm">{preset.name}</button>))}</div>
      <div className="p-4 rounded-lg bg-muted/50 text-center">
        <span className="text-sm text-muted-foreground">Entropy</span>
        <p className="text-4xl font-mono font-bold text-primary mt-2">{entropy.toFixed(4)}</p>
        <p className="text-sm text-muted-foreground mt-1">bits</p>
      </div>
      <div className="grid grid-cols-8 gap-1">
        {components.slice(0, 16).map((c, i) => (
          <div key={i} className="text-center">
            <div className="h-12 bg-primary/20 rounded relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 bg-primary transition-all" style={{ height: `${Math.abs(c) * 100}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">e{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  { id: 'kuramoto', number: '1', title: 'Kuramoto Synchronization', subtitle: 'Coupled oscillators', description: 'Simulate coupled oscillators that synchronize when coupling strength exceeds a critical threshold.', concepts: ['Oscillator Networks', 'Synchronization', 'Order Parameter'], code: `import { OscillatorBank } from '@aleph-ai/tinyaleph';\n\nconst bank = new OscillatorBank(12);\nbank.oscillators.forEach(osc => { osc.phase = Math.random() * 2 * Math.PI; });\n\n// Kuramoto dynamics: dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ - θᵢ)\nconst K = 0.3; // Coupling strength\nconsole.log('Order parameter:', bank.orderParameter());`, codeTitle: 'physics/01-kuramoto.js' },
  { id: 'entropy', number: '2', title: 'Shannon Entropy', subtitle: 'Information measure', description: 'Compute entropy of hypercomplex states. Pure states have low entropy; mixed states have high entropy.', concepts: ['Entropy', 'Information Theory', 'State Purity'], code: `import { Hypercomplex } from '@aleph-ai/tinyaleph';\n\nconst pure = new Hypercomplex(16);\npure.c[0] = 1;\nconsole.log('Pure entropy:', pure.entropy()); // ~0\n\nconst uniform = new Hypercomplex(16);\nfor (let i = 0; i < 16; i++) uniform.c[i] = 0.25;\nconsole.log('Uniform entropy:', uniform.entropy()); // ~4 bits`, codeTitle: 'physics/02-entropy.js' },
];

const exampleComponents: Record<string, React.FC> = { 'kuramoto': KuramotoExample, 'entropy': EntropyExample };

export default function PhysicsExamplesPage() {
  return <ExamplePageWrapper category="Physics" title="Physics Simulations" description="Oscillator dynamics, synchronization, and entropy measures." examples={examples} exampleComponents={exampleComponents} previousSection={{ title: 'Core', path: '/core' }} nextSection={{ title: 'Engine', path: '/engine' }} />;
}
