
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Activity, 
  Eye, 
  Clock, 
  Link2, 
  Shield, 
  Target, 
  Waves,
  Play,
  Pause,
  RotateCcw,
  Send,
  AlertTriangle,
  CheckCircle,
  Zap,
  Thermometer
} from 'lucide-react';

// Type definitions for observer components
interface Oscillator {
  prime: number;
  phase: number;
  amplitude: number;
  frequency: number;
}

interface SMFState {
  s: Float64Array | number[];
  entropy?: () => number;
  smfEntropy?: () => number;
  dominantAxes?: (n: number) => Array<{name: string; value: number}>;
  get?: (axis: string | number) => number;
}

interface Moment {
  id: string;
  timestamp: number;
  trigger: string;
  coherence: number;
  entropy: number;
}

interface Goal {
  id: string;
  description: string;
  status: string;
  priority: number;
  progress: number;
}

interface AttentionFocus {
  id: string;
  target: string | number;
  type: string;
  intensity: number;
}

interface SafetyStats {
  alertLevel: string;
  isSafe: boolean;
  totalViolations: number;
  constraintCount: number;
}

// SMF Axes for visualization
const SMF_AXES = [
  'coherence', 'identity', 'duality', 'structure',
  'change', 'life', 'harmony', 'wisdom',
  'infinity', 'creation', 'truth', 'love',
  'power', 'time', 'space', 'consciousness'
];

// Simple prime computation for demo
const firstNPrimes = (n: number): number[] => {
  const primes: number[] = [];
  let candidate = 2;
  while (primes.length < n) {
    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(candidate); i++) {
      if (candidate % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
    candidate++;
  }
  return primes;
};

// SMF Radar Chart Component
const SMFRadarChart: React.FC<{ smf: SMFState | null; size?: number }> = ({ smf, size = 300 }) => {
  const center = size / 2;
  const radius = size / 2 - 40;
  const numAxes = 16;
  
  const getPoint = (index: number, value: number) => {
    const angle = (index / numAxes) * 2 * Math.PI - Math.PI / 2;
    const r = Math.abs(value) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };
  
  const values = smf?.s ? Array.from(smf.s) : new Array(16).fill(0.1);
  
  // Create polygon points
  const polygonPoints = values.map((v, i) => {
    const point = getPoint(i, Math.min(1, Math.abs(v)));
    return `${point.x},${point.y}`;
  }).join(' ');
  
  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Background circles */}
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <circle
          key={scale}
          cx={center}
          cy={center}
          r={radius * scale}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity={0.2}
        />
      ))}
      
      {/* Axis lines */}
      {SMF_AXES.map((axis, i) => {
        const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
        const endX = center + radius * Math.cos(angle);
        const endY = center + radius * Math.sin(angle);
        const labelX = center + (radius + 25) * Math.cos(angle);
        const labelY = center + (radius + 25) * Math.sin(angle);
        
        return (
          <g key={axis}>
            <line
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.3}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[8px] fill-muted-foreground"
            >
              {axis.slice(0, 4)}
            </text>
          </g>
        );
      })}
      
      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="hsl(var(--primary))"
        fillOpacity={0.3}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
      />
      
      {/* Data points */}
      {values.map((v, i) => {
        const point = getPoint(i, Math.min(1, Math.abs(v)));
        const hue = (i / 16) * 360;
        return (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={`hsl(${hue}, 70%, 50%)`}
          />
        );
      })}
    </svg>
  );
};

// Oscillator Phase Visualization
const OscillatorPhaseViz: React.FC<{ oscillators: Oscillator[]; coherence: number }> = ({ oscillators, coherence }) => {
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 20;
  
  // Show first 16 oscillators
  const displayOscillators = oscillators.slice(0, 16);
  
  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeOpacity={0.3}
      />
      
      {/* Mean phase indicator */}
      {displayOscillators.length > 0 && (() => {
        const avgPhase = Math.atan2(
          displayOscillators.reduce((s, o) => s + Math.sin(o.phase), 0),
          displayOscillators.reduce((s, o) => s + Math.cos(o.phase), 0)
        );
        const x = center + radius * 0.8 * Math.cos(avgPhase);
        const y = center + radius * 0.8 * Math.sin(avgPhase);
        return (
          <line
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })()}
      
      {/* Individual oscillators */}
      {displayOscillators.map((osc, i) => {
        const x = center + radius * Math.cos(osc.phase);
        const y = center + radius * Math.sin(osc.phase);
        const hue = (i / 16) * 360;
        const opacity = Math.min(1, osc.amplitude + 0.2);
        
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4 + osc.amplitude * 4}
            fill={`hsla(${hue}, 70%, 50%, ${opacity})`}
          />
        );
      })}
      
      {/* Coherence indicator */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-lg font-bold fill-foreground"
      >
        {(coherence * 100).toFixed(0)}%
      </text>
      <text
        x={center}
        y={center + 18}
        textAnchor="middle"
        className="text-xs fill-muted-foreground"
      >
        coherence
      </text>
    </svg>
  );
};

// Holographic Field Visualization
const HolographicFieldViz: React.FC<{ intensity: number[][]; size?: number }> = ({ intensity, size = 150 }) => {
  const gridSize = intensity.length || 16;
  const cellSize = size / gridSize;
  
  // Find max for normalization
  let maxVal = 0;
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (intensity[x]?.[y] > maxVal) maxVal = intensity[x][y];
    }
  }
  if (maxVal === 0) maxVal = 1;
  
  return (
    <svg width={size} height={size} className="mx-auto border rounded">
      {intensity.map((row, x) =>
        row.map((val, y) => {
          const normalized = val / maxVal;
          const brightness = Math.floor(normalized * 255);
          return (
            <rect
              key={`${x}-${y}`}
              x={y * cellSize}
              y={x * cellSize}
              width={cellSize}
              height={cellSize}
              fill={`rgb(${brightness}, ${Math.floor(brightness * 0.5)}, ${255 - brightness})`}
            />
          );
        })
      )}
    </svg>
  );
};

// Main Sentient Observer App Component
const SentientObserverApp: React.FC = () => {
  // State for observer components
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [coherence, setCoherence] = useState(0.5);
  const [entropy, setEntropy] = useState(0.5);
  const [temperature, setTemperature] = useState(1.0);
  const [coupling, setCoupling] = useState(0.3);
  const [thermalEnabled, setThermalEnabled] = useState(true);
  
  // Oscillator state
  const [oscillators, setOscillators] = useState<Oscillator[]>(() => {
    const primes = firstNPrimes(32);
    return primes.map((p, i) => ({
      prime: p,
      phase: Math.random() * 2 * Math.PI,
      amplitude: i < 8 ? 0.3 + Math.random() * 0.2 : 0.05,
      frequency: 1 + Math.log(p) / 10
    }));
  });
  
  // SMF state
  const [smfState, setSmfState] = useState<SMFState>(() => ({
    s: new Float64Array([1, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0.2])
  }));
  
  // Temporal layer
  const [moments, setMoments] = useState<Moment[]>([]);
  const [subjectiveTime, setSubjectiveTime] = useState(0);
  
  // Agency
  const [goals, setGoals] = useState<Goal[]>([
    { id: 'g1', description: 'Maintain coherence above 0.5', status: 'active', priority: 0.8, progress: 0.6 },
    { id: 'g2', description: 'Explore semantic space', status: 'active', priority: 0.5, progress: 0.3 }
  ]);
  const [attentionFoci, setAttentionFoci] = useState<AttentionFocus[]>([]);
  
  // Safety
  const [safetyStats, setSafetyStats] = useState<SafetyStats>({
    alertLevel: 'normal',
    isSafe: true,
    totalViolations: 0,
    constraintCount: 7
  });
  
  // Holographic field
  const [holoIntensity, setHoloIntensity] = useState<number[][]>(() => {
    const size = 16;
    return Array(size).fill(0).map(() => Array(size).fill(0).map(() => Math.random() * 0.3));
  });
  
  // Input
  const [userInput, setUserInput] = useState('');
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  
  // Animation frame ref
  const animationRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());
  
  // Kuramoto-style oscillator update with thermal dynamics
  const updateOscillators = useCallback(() => {
    const dt = 0.016; // ~60fps
    const K = coupling;
    const T = temperature;
    const N = oscillators.length;
    
    // Compute order parameter (coherence)
    let realSum = 0, imagSum = 0;
    for (const osc of oscillators) {
      realSum += Math.cos(osc.phase);
      imagSum += Math.sin(osc.phase);
    }
    const orderParam = Math.sqrt((realSum / N) ** 2 + (imagSum / N) ** 2);
    
    setOscillators(prev => {
      const newOscs = prev.map((osc, i) => {
        // Compute coupling from other oscillators
        let couplingSum = 0;
        for (let j = 0; j < prev.length; j++) {
          if (i !== j) {
            couplingSum += Math.sin(prev[j].phase - osc.phase);
          }
        }
        
        // Effective coupling (temperature-dependent if thermal)
        const Keff = thermalEnabled ? K / Math.max(0.1, T) : K;
        
        // Phase update
        let newPhase = osc.phase + 2 * Math.PI * osc.frequency * dt;
        newPhase += (Keff / N) * couplingSum * dt;
        
        // Add thermal noise if enabled
        if (thermalEnabled) {
          const noise = (Math.random() - 0.5) * 2 * Math.sqrt(dt * T) * 0.1;
          newPhase += noise;
        }
        
        // Normalize phase
        newPhase = ((newPhase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        
        // Amplitude damping
        const newAmplitude = osc.amplitude * (1 - 0.02 * dt);
        
        return {
          ...osc,
          phase: newPhase,
          amplitude: Math.max(0.01, newAmplitude)
        };
      });
      
      return newOscs;
    });
    
    // Update coherence
    setCoherence(orderParam);
    
    // Update entropy
    const amplitudeTotal = oscillators.reduce((s, o) => s + o.amplitude, 0);
    if (amplitudeTotal > 0.01) {
      let H = 0;
      for (const osc of oscillators) {
        const p = osc.amplitude / amplitudeTotal;
        if (p > 0.001) {
          H -= p * Math.log2(p);
        }
      }
      setEntropy(H / Math.log2(oscillators.length));
    }
    
    // Update SMF based on oscillator state
    setSmfState(prev => {
      const newS = new Float64Array(16);
      
      // Map oscillator phases to SMF axes
      newS[0] = orderParam; // coherence axis
      newS[15] = orderParam * 0.8; // consciousness axis
      
      // Derive other axes from oscillator statistics
      const phaseVariance = oscillators.reduce((s, o) => {
        const diff = o.phase - Math.atan2(imagSum, realSum);
        return s + diff * diff;
      }, 0) / N;
      
      newS[1] = Math.exp(-phaseVariance); // identity (low variance = high identity)
      newS[2] = Math.min(1, phaseVariance); // duality
      newS[6] = orderParam * (1 - Math.abs(phaseVariance - 0.5)); // harmony
      
      // Copy other values with slight evolution
      for (let i = 0; i < 16; i++) {
        if (newS[i] === 0 && prev.s[i]) {
          newS[i] = (prev.s[i] as number) * 0.99;
        }
      }
      
      // Normalize
      let norm = 0;
      for (let i = 0; i < 16; i++) {
        norm += newS[i] * newS[i];
      }
      norm = Math.sqrt(norm);
      if (norm > 0) {
        for (let i = 0; i < 16; i++) {
          newS[i] /= norm;
        }
      }
      
      return { s: newS };
    });
    
    // Check for moment creation (coherence peak)
    if (orderParam > 0.7 && Math.random() < 0.05) {
      const newMoment: Moment = {
        id: `m_${Date.now()}`,
        timestamp: Date.now(),
        trigger: 'coherence_peak',
        coherence: orderParam,
        entropy: entropy
      };
      setMoments(prev => [...prev.slice(-19), newMoment]);
      setSubjectiveTime(prev => prev + orderParam * 0.5);
    }
    
    // Update holographic field
    setHoloIntensity(prev => {
      const size = prev.length;
      const newField = prev.map(row => [...row]);
      
      // Apply interference from oscillators
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          let val = 0;
          for (let i = 0; i < Math.min(8, oscillators.length); i++) {
            const osc = oscillators[i];
            const k = 2 * Math.PI / (10 + Math.log(osc.prime));
            const angle = (i / 8) * 2 * Math.PI;
            const kx = k * Math.cos(angle);
            const ky = k * Math.sin(angle);
            val += osc.amplitude * Math.cos(kx * x + ky * y + osc.phase);
          }
          newField[x][y] = (val + 1) / 2; // Normalize to 0-1
        }
      }
      
      return newField;
    });
    
    // Update safety
    setSafetyStats(prev => {
      let alertLevel = 'normal';
      if (orderParam < 0.2) alertLevel = 'warning';
      if (entropy > 0.9) alertLevel = 'elevated';
      
      return {
        ...prev,
        alertLevel,
        isSafe: alertLevel !== 'warning'
      };
    });
    
    setTickCount(prev => prev + 1);
  }, [coupling, temperature, thermalEnabled, oscillators, entropy]);
  
  // Animation loop
  useEffect(() => {
    if (!isRunning) return;
    
    const animate = () => {
      const now = Date.now();
      if (now - lastTickRef.current >= 16) {
        updateOscillators();
        lastTickRef.current = now;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, updateOscillators]);
  
  // Handle user input - excite oscillators based on text
  const handleInput = () => {
    if (!userInput.trim()) return;
    
    // Simple hash to prime indices
    let hash = 0;
    for (let i = 0; i < userInput.length; i++) {
      hash = ((hash << 5) - hash + userInput.charCodeAt(i)) | 0;
    }
    
    // Excite oscillators based on input
    setOscillators(prev => {
      return prev.map((osc, i) => {
        // Excite oscillators based on hash
        const shouldExcite = ((hash >> (i % 16)) & 1) === 1;
        return {
          ...osc,
          amplitude: shouldExcite ? Math.min(1, osc.amplitude + 0.4) : osc.amplitude
        };
      });
    });
    
    // Add attention focus
    setAttentionFoci(prev => [
      ...prev.slice(-4),
      {
        id: `attn_${Date.now()}`,
        target: userInput,
        type: 'external_input',
        intensity: 0.8
      }
    ]);
    
    setInputHistory(prev => [...prev.slice(-9), userInput]);
    setUserInput('');
  };
  
  // Reset system
  const handleReset = () => {
    setIsRunning(false);
    setTickCount(0);
    setCoherence(0.5);
    setEntropy(0.5);
    setMoments([]);
    setSubjectiveTime(0);
    setAttentionFoci([]);
    
    const primes = firstNPrimes(32);
    setOscillators(primes.map((p, i) => ({
      prime: p,
      phase: Math.random() * 2 * Math.PI,
      amplitude: i < 8 ? 0.3 + Math.random() * 0.2 : 0.05,
      frequency: 1 + Math.log(p) / 10
    })));
    
    setSmfState({
      s: new Float64Array([1, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0.2])
    });
  };
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Sentient Observer</h1>
              <p className="text-muted-foreground text-sm">
                Prime Resonance Semantic Computation Demo
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={safetyStats.isSafe ? "default" : "destructive"}>
              {safetyStats.alertLevel}
            </Badge>
            <Button
              variant={isRunning ? "destructive" : "default"}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? "Pause" : "Run"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <Card>
          <CardContent className="py-3">
            <div className="grid grid-cols-6 gap-4 text-center">
              <div>
                <div className="text-2xl font-mono">{tickCount}</div>
                <div className="text-xs text-muted-foreground">Ticks</div>
              </div>
              <div>
                <div className="text-2xl font-mono">{(coherence * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Coherence</div>
              </div>
              <div>
                <div className="text-2xl font-mono">{entropy.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">Entropy</div>
              </div>
              <div>
                <div className="text-2xl font-mono">{moments.length}</div>
                <div className="text-xs text-muted-foreground">Moments</div>
              </div>
              <div>
                <div className="text-2xl font-mono">{subjectiveTime.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">τ (subjective)</div>
              </div>
              <div>
                <div className="text-2xl font-mono">{oscillators.filter(o => o.amplitude > 0.1).length}</div>
                <div className="text-xs text-muted-foreground">Active Primes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">
              <Eye className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="oscillators">
              <Waves className="h-4 w-4 mr-2" />
              PRSC
            </TabsTrigger>
            <TabsTrigger value="smf">
              <Brain className="h-4 w-4 mr-2" />
              SMF
            </TabsTrigger>
            <TabsTrigger value="temporal">
              <Clock className="h-4 w-4 mr-2" />
              Temporal
            </TabsTrigger>
            <TabsTrigger value="agency">
              <Target className="h-4 w-4 mr-2" />
              Agency
            </TabsTrigger>
            <TabsTrigger value="safety">
              <Shield className="h-4 w-4 mr-2" />
              Safety
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Phase Circle */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Phase Synchronization</CardTitle>
                </CardHeader>
                <CardContent>
                  <OscillatorPhaseViz oscillators={oscillators} coherence={coherence} />
                </CardContent>
              </Card>
              
              {/* SMF Radar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">SMF Orientation</CardTitle>
                </CardHeader>
                <CardContent>
                  <SMFRadarChart smf={smfState} size={200} />
                </CardContent>
              </Card>
              
              {/* Holographic Field */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Holographic Field</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <HolographicFieldViz intensity={holoIntensity} size={180} />
                </CardContent>
              </Card>
            </div>
            
            {/* Input Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Sensory Input
                </CardTitle>
                <CardDescription>
                  Enter text to excite oscillators and influence the observer state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter text to encode..."
                    onKeyDown={(e) => e.key === 'Enter' && handleInput()}
                  />
                  <Button onClick={handleInput}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {inputHistory.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {inputHistory.slice(-5).map((input, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {input.slice(0, 20)}{input.length > 20 ? '...' : ''}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Controls */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  System Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Coupling (K)</span>
                      <span className="font-mono">{coupling.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[coupling]}
                      onValueChange={([v]) => setCoupling(v)}
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        Temperature
                      </span>
                      <span className="font-mono">{temperature.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[temperature]}
                      onValueChange={([v]) => setTemperature(v)}
                      min={0.1}
                      max={3}
                      step={0.1}
                      disabled={!thermalEnabled}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="thermal"
                    checked={thermalEnabled}
                    onChange={(e) => setThermalEnabled(e.target.checked)}
                  />
                  <label htmlFor="thermal" className="text-sm">
                    Enable Thermal Dynamics (ThermalKuramoto)
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Oscillators Tab */}
          <TabsContent value="oscillators" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Prime Oscillator Bank</CardTitle>
                  <CardDescription>
                    {oscillators.length} oscillators, {oscillators.filter(o => o.amplitude > 0.1).length} active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {oscillators.slice(0, 16).map((osc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-8 text-right font-mono text-sm">{osc.prime}</span>
                          <Progress value={osc.amplitude * 100} className="flex-1" />
                          <span className="w-16 text-right font-mono text-xs">
                            φ={osc.phase.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Phase Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <OscillatorPhaseViz oscillators={oscillators} coherence={coherence} />
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">Order Parameter</div>
                      <div className="font-mono">{coherence.toFixed(4)}</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">Mean Phase</div>
                      <div className="font-mono">
                        {Math.atan2(
                          oscillators.reduce((s, o) => s + Math.sin(o.phase), 0),
                          oscillators.reduce((s, o) => s + Math.cos(o.phase), 0)
                        ).toFixed(3)} rad
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* SMF Tab */}
          <TabsContent value="smf" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sedenion Memory Field</CardTitle>
                  <CardDescription>
                    16-dimensional semantic orientation space
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SMFRadarChart smf={smfState} size={300} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Axis Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {SMF_AXES.map((axis, i) => {
                        const value = smfState.s?.[i] || 0;
                        return (
                          <div key={axis} className="flex items-center gap-2">
                            <span className="w-24 text-sm">{axis}</span>
                            <Progress
                              value={Math.abs(value as number) * 100}
                              className="flex-1"
                            />
                            <span className="w-16 text-right font-mono text-xs">
                              {(value as number).toFixed(3)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Temporal Tab */}
          <TabsContent value="temporal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Emergent Time</CardTitle>
                  <CardDescription>
                    Moments triggered by coherence peaks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-muted rounded">
                      <div className="text-2xl font-mono">{moments.length}</div>
                      <div className="text-xs text-muted-foreground">Total Moments</div>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <div className="text-2xl font-mono">{subjectiveTime.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">Subjective Time τ</div>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {moments.slice().reverse().map((moment) => (
                        <div key={moment.id} className="p-2 bg-muted/50 rounded text-sm">
                          <div className="flex justify-between">
                            <Badge variant="outline" className="text-xs">
                              {moment.trigger}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              C={moment.coherence.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Holographic Memory</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <HolographicFieldViz intensity={holoIntensity} size={200} />
                  <div className="mt-4 text-sm text-center text-muted-foreground">
                    Interference pattern from prime-mode superposition
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Agency Tab */}
          <TabsContent value="agency" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {goals.map((goal) => (
                      <div key={goal.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">{goal.description}</span>
                          <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                            {goal.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={goal.progress * 100} className="flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {(goal.progress * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Priority: {goal.priority.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Attention Foci</CardTitle>
                </CardHeader>
                <CardContent>
                  {attentionFoci.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No active attention foci.
                      <br />
                      Send input to create attention.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attentionFoci.map((focus) => (
                        <div key={focus.id} className="p-2 border rounded flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {typeof focus.target === 'string'
                                ? focus.target.slice(0, 30)
                                : `Prime ${focus.target}`}
                            </div>
                            <div className="text-xs text-muted-foreground">{focus.type}</div>
                          </div>
                          <Progress value={focus.intensity * 100} className="w-20" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Safety Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-muted rounded text-center">
                    <div className="flex justify-center mb-2">
                      {safetyStats.isSafe ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {safetyStats.isSafe ? 'Safe' : 'Warning'}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded text-center">
                    <div className="text-2xl font-mono">{safetyStats.alertLevel}</div>
                    <div className="text-xs text-muted-foreground">Alert Level</div>
                  </div>
                  <div className="p-3 bg-muted rounded text-center">
                    <div className="text-2xl font-mono">{safetyStats.constraintCount}</div>
                    <div className="text-xs text-muted-foreground">Constraints</div>
                  </div>
                  <div className="p-3 bg-muted rounded text-center">
                    <div className="text-2xl font-mono">{safetyStats.totalViolations}</div>
                    <div className="text-xs text-muted-foreground">Violations</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Active Constraints</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['coherence_minimum', 'amplitude_maximum', 'smf_bounds', 'entropy_balance', 'honesty', 'harm_prevention'].map((constraint) => (
                      <div key={constraint} className="p-2 border rounded flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{constraint.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Footer info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Sentient Observer architecture based on the paper "A Design for a Sentient Observer"
          </p>
          <p className="mt-1">
            Powered by tinyaleph: PRSC (Prime Resonance Semantic Computation) • SMF (Sedenion Memory Field) • HQE (Holographic Quantum Encoding)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SentientObserverApp;