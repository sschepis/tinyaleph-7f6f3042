import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import CodeBlock from '../components/CodeBlock';
import { ArrowLeft, Play, Pause, RotateCcw, Network, Activity } from 'lucide-react';

// Watts-Strogatz Small World Network
interface NetworkEdge {
  from: number;
  to: number;
}

function createWattsStrogatz(n: number, k: number, p: number): NetworkEdge[] {
  const edges: Set<string> = new Set();
  const addEdge = (a: number, b: number) => {
    if (a !== b) {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      edges.add(key);
    }
  };

  // Create ring lattice
  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= k / 2; j++) {
      addEdge(i, (i + j) % n);
    }
  }

  // Rewire edges with probability p
  const edgeArray = Array.from(edges);
  for (const edge of edgeArray) {
    if (Math.random() < p) {
      const [a, b] = edge.split('-').map(Number);
      edges.delete(edge);
      // Find new random target
      let newTarget = Math.floor(Math.random() * n);
      let attempts = 0;
      while ((newTarget === a || edges.has(a < newTarget ? `${a}-${newTarget}` : `${newTarget}-${a}`)) && attempts < 100) {
        newTarget = Math.floor(Math.random() * n);
        attempts++;
      }
      if (attempts < 100) {
        addEdge(a, newTarget);
      } else {
        edges.add(edge); // Restore if can't rewire
      }
    }
  }

  return Array.from(edges).map(e => {
    const [from, to] = e.split('-').map(Number);
    return { from, to };
  });
}

function computeNetworkStats(n: number, edges: NetworkEdge[]): { clustering: number; pathLength: number } {
  // Build adjacency list
  const adj: Set<number>[] = Array.from({ length: n }, () => new Set());
  for (const { from, to } of edges) {
    adj[from].add(to);
    adj[to].add(from);
  }

  // Clustering coefficient
  let totalClustering = 0;
  for (let i = 0; i < n; i++) {
    const neighbors = Array.from(adj[i]);
    const k = neighbors.length;
    if (k < 2) continue;
    let triangles = 0;
    for (let a = 0; a < k; a++) {
      for (let b = a + 1; b < k; b++) {
        if (adj[neighbors[a]].has(neighbors[b])) triangles++;
      }
    }
    totalClustering += (2 * triangles) / (k * (k - 1));
  }
  const clustering = totalClustering / n;

  // Average path length (BFS from sample nodes)
  const sampleSize = Math.min(n, 20);
  const samples = Array.from({ length: sampleSize }, (_, i) => Math.floor(i * n / sampleSize));
  let totalPath = 0;
  let pathCount = 0;
  
  for (const start of samples) {
    const dist = Array(n).fill(-1);
    dist[start] = 0;
    const queue = [start];
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const v of adj[u]) {
        if (dist[v] === -1) {
          dist[v] = dist[u] + 1;
          queue.push(v);
        }
      }
    }
    for (let i = 0; i < n; i++) {
      if (dist[i] > 0) {
        totalPath += dist[i];
        pathCount++;
      }
    }
  }

  const pathLength = pathCount > 0 ? totalPath / pathCount : 0;
  return { clustering, pathLength };
}

// Kuramoto model on the network
interface KuramotoState {
  phases: number[];
  naturalFreqs: number[];
}

function stepKuramoto(
  state: KuramotoState,
  edges: NetworkEdge[],
  coupling: number,
  dt: number
): KuramotoState {
  const n = state.phases.length;
  const dPhase = Array(n).fill(0);
  
  // Build adjacency
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const { from, to } of edges) {
    adj[from].push(to);
    adj[to].push(from);
  }

  // Kuramoto dynamics
  for (let i = 0; i < n; i++) {
    dPhase[i] = state.naturalFreqs[i];
    for (const j of adj[i]) {
      dPhase[i] += (coupling / adj[i].length) * Math.sin(state.phases[j] - state.phases[i]);
    }
  }

  const newPhases = state.phases.map((p, i) => (p + dPhase[i] * dt) % (2 * Math.PI));
  return { ...state, phases: newPhases };
}

function computeOrderParameter(phases: number[]): { r: number; psi: number } {
  let sumCos = 0, sumSin = 0;
  for (const p of phases) {
    sumCos += Math.cos(p);
    sumSin += Math.sin(p);
  }
  const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / phases.length;
  const psi = Math.atan2(sumSin, sumCos);
  return { r, psi };
}

// Network Visualization Component
const NetworkViz = ({ 
  n, 
  edges, 
  phases 
}: { 
  n: number; 
  edges: NetworkEdge[]; 
  phases: number[];
}) => {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;

  const positions = useMemo(() => 
    Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    }), [n]
  );

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Edges */}
      {edges.map(({ from, to }, i) => (
        <line
          key={i}
          x1={positions[from].x}
          y1={positions[from].y}
          x2={positions[to].x}
          y2={positions[to].y}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}
      
      {/* Nodes */}
      {positions.map((pos, i) => {
        const hue = ((phases[i] / (2 * Math.PI)) * 360 + 180) % 360;
        return (
          <circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={n > 30 ? 4 : 6}
            fill={`hsl(${hue}, 70%, 50%)`}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
};

// Phase Distribution Visualization
const PhaseDistribution = ({ phases }: { phases: number[] }) => {
  const bins = 24;
  const histogram = Array(bins).fill(0);
  for (const p of phases) {
    const bin = Math.floor(((p % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * bins);
    histogram[bin]++;
  }
  const maxCount = Math.max(...histogram, 1);

  return (
    <div className="flex items-end gap-0.5 h-16">
      {histogram.map((count, i) => {
        const hue = (i / bins) * 360;
        return (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${(count / maxCount) * 100}%`,
              backgroundColor: `hsl(${hue}, 70%, 50%)`,
              minHeight: count > 0 ? '2px' : '0',
            }}
          />
        );
      })}
    </div>
  );
};

const KuramotoDemo = () => {
  const [n, setN] = useState(30);
  const [k, setK] = useState(4);
  const [p, setP] = useState(0.1);
  const [coupling, setCoupling] = useState(2);
  const [running, setRunning] = useState(false);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [state, setState] = useState<KuramotoState | null>(null);
  const [stats, setStats] = useState({ clustering: 0, pathLength: 0 });
  const animationRef = useRef<number>();

  const initNetwork = useCallback(() => {
    const newEdges = createWattsStrogatz(n, k, p);
    setEdges(newEdges);
    setStats(computeNetworkStats(n, newEdges));
    
    // Initialize oscillator state
    const phases = Array.from({ length: n }, () => Math.random() * 2 * Math.PI);
    const naturalFreqs = Array.from({ length: n }, () => (Math.random() - 0.5) * 0.5);
    setState({ phases, naturalFreqs });
    setRunning(false);
  }, [n, k, p]);

  useEffect(() => {
    initNetwork();
  }, []);

  useEffect(() => {
    if (!running || !state) return;
    
    const step = () => {
      setState(prev => prev ? stepKuramoto(prev, edges, coupling, 0.05) : null);
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [running, edges, coupling, state]);

  const orderParam = state ? computeOrderParameter(state.phases) : { r: 0, psi: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">Watts-Strogatz Kuramoto Network</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Nodes (N): {n}</label>
            <Slider value={[n]} onValueChange={([v]) => setN(v)} min={10} max={100} step={5} />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Neighbors (k): {k}</label>
            <Slider value={[k]} onValueChange={([v]) => setK(v)} min={2} max={10} step={2} />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Rewiring (p): {p.toFixed(2)}</label>
            <Slider value={[p * 100]} onValueChange={([v]) => setP(v / 100)} min={0} max={100} step={1} />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Coupling (K): {coupling.toFixed(1)}</label>
            <Slider value={[coupling * 10]} onValueChange={([v]) => setCoupling(v / 10)} min={0} max={50} step={1} />
          </div>

          <div className="flex gap-2">
            <Button onClick={initNetwork} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button onClick={() => setRunning(!running)} className="flex-1">
              {running ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Run</>}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted border border-border text-center">
              <div className="text-lg font-mono font-bold text-primary">{stats.clustering.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">Clustering</div>
            </div>
            <div className="p-3 rounded-lg bg-muted border border-border text-center">
              <div className="text-lg font-mono font-bold text-primary">{stats.pathLength.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Avg Path</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            {state && <NetworkViz n={n} edges={edges} phases={state.phases} />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted border border-border text-center">
              <div className="text-2xl font-mono font-bold text-primary">{orderParam.r.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">Order Parameter r</div>
            </div>
            <div className="p-3 rounded-lg bg-muted border border-border text-center">
              <div className="text-2xl font-mono font-bold text-primary">{edges.length}</div>
              <div className="text-xs text-muted-foreground">Edges</div>
            </div>
          </div>

          {state && (
            <div className="p-3 rounded-lg bg-muted border border-border">
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Phase Distribution
              </div>
              <PhaseDistribution phases={state.phases} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KuramotoExamplesPage = () => {
  const networkCode = `// Create Watts-Strogatz small-world network
const n = 30;  // number of nodes
const k = 4;   // each node connects to k nearest neighbors
const p = 0.1; // rewiring probability

const edges = createWattsStrogatz(n, k, p);

// Compute network statistics
const { clustering, pathLength } = computeNetworkStats(n, edges);
console.log(\`Clustering: \${clustering}, Avg Path: \${pathLength}\`);`;

  const kuramotoCode = `// Initialize Kuramoto oscillators
const phases = Array.from({ length: n }, () => Math.random() * 2 * Math.PI);
const naturalFreqs = Array.from({ length: n }, () => (Math.random() - 0.5) * 0.5);

// Step the simulation
const coupling = 2.0;
const dt = 0.05;
const newState = stepKuramoto({ phases, naturalFreqs }, edges, coupling, dt);

// Measure synchronization
const { r, psi } = computeOrderParameter(newState.phases);
console.log(\`Order parameter r = \${r}\`); // r → 1 means synchronized`;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Examples
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-display font-bold mb-4">Kuramoto Network Dynamics</h1>
            <p className="text-muted-foreground text-lg">
              Explore Watts-Strogatz small-world networks with Kuramoto oscillator synchronization.
              Adjust network topology and coupling strength to observe phase transitions.
            </p>
          </div>

          <div className="space-y-12">
            <div className="p-6 rounded-xl border border-border bg-card">
              <KuramotoDemo />
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg mb-4">Network Generation</h3>
              <CodeBlock code={networkCode} language="typescript" />
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg mb-4">Kuramoto Dynamics</h3>
              <CodeBlock code={kuramotoCode} language="typescript" />
            </div>

            <div className="p-6 rounded-xl border border-border bg-muted/30">
              <h3 className="font-display font-semibold text-lg mb-4">Small-World Properties</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Rewiring Probability (p)</h4>
                  <ul className="space-y-1">
                    <li>• p = 0: Regular ring lattice (high clustering, long paths)</li>
                    <li>• p ≈ 0.1: Small-world regime (high clustering, short paths)</li>
                    <li>• p = 1: Random graph (low clustering, short paths)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Order Parameter (r)</h4>
                  <ul className="space-y-1">
                    <li>• r → 0: Incoherent, phases uniformly distributed</li>
                    <li>• r → 1: Synchronized, all oscillators in phase</li>
                    <li>• Critical coupling Kc depends on network structure</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KuramotoExamplesPage;
