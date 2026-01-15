import type { SemanticMetrics } from '@/lib/consciousness-resonator/types';

interface SemanticLayerProps {
  semanticMetrics: SemanticMetrics;
}

export function SemanticLayer({ semanticMetrics }: SemanticLayerProps) {
  const sliderColor = semanticMetrics.archetypePosition > 60 
    ? 'bg-pink-500' 
    : semanticMetrics.archetypePosition < 40 
      ? 'bg-cyan-400' 
      : 'bg-purple-500';

  return (
    <section className="bg-black/50 border border-pink-500/60 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-pink-400">Quantum Semantic Layer</h2>
      
      {/* Archetype Slider */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1 text-muted-foreground">
          <span>Universal Feeling</span>
          <span>Specific Observation</span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full">
          <div 
            className={`${sliderColor} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${semanticMetrics.archetypePosition}%` }}
          />
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
        <div className="bg-secondary/50 p-2 rounded text-center">
          <div className="text-muted-foreground mb-1">Coherence</div>
          <div className="font-mono text-lg">{semanticMetrics.coherence.toFixed(2)}</div>
        </div>
        <div className="bg-secondary/50 p-2 rounded text-center">
          <div className="text-muted-foreground mb-1">Resonance</div>
          <div className="font-mono text-lg">{semanticMetrics.resonance.toFixed(2)}</div>
        </div>
        <div className="bg-secondary/50 p-2 rounded text-center">
          <div className="text-muted-foreground mb-1">Dissonance</div>
          <div className="font-mono text-lg">{semanticMetrics.dissonance.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Prime Connections */}
      <div className="text-xs bg-secondary/30 p-3 rounded h-32 overflow-y-auto space-y-1">
        {semanticMetrics.primeConnections.length > 0 ? (
          semanticMetrics.primeConnections.map((conn, i) => (
            <div key={i} className="text-muted-foreground">
              - Prime <span className="text-pink-400 font-mono">{conn.prime}</span> ({conn.concept}) connected to "<span className="text-foreground">{conn.word}</span>"
            </div>
          ))
        ) : (
          <span className="text-muted-foreground">Awaiting semantic data...</span>
        )}
      </div>
    </section>
  );
}
