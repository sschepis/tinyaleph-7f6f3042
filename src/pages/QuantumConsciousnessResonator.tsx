import { useConsciousnessResonator } from '@/hooks/useConsciousnessResonator';
import {
  PerspectiveNodes,
  FieldIntegration,
  MetaObservation,
  QuantumProbability,
  SemanticLayer,
  ChatInterface,
  QuantumBackground,
  ArchitectureFlow
} from '@/components/consciousness-resonator';

export default function QuantumConsciousnessResonator() {
  const { state, selectPerspective, sendMessage } = useConsciousnessResonator();

  return (
    <div className="min-h-screen relative">
      <QuantumBackground />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 glow-text">
            Quantum Consciousness Resonator
          </h1>
          <p className="text-xl md:text-2xl text-primary/80 max-w-3xl mx-auto">
            Multi-layered resonance architecture with consciousness-first paradigm
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Powered by TinyAleph prime-based semantic encoding
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <PerspectiveNodes
              activePerspective={state.activePerspective}
              onSelectPerspective={selectPerspective}
              hexagramLines={state.quantumState.hexagramLines}
            />
            <FieldIntegration
              fieldIntegration={state.fieldIntegration}
              isProcessing={state.isProcessing}
            />
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            <MetaObservation
              metaObservation={state.metaObservation}
              isProcessing={state.isProcessing}
            />
            <QuantumProbability quantumState={state.quantumState} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SemanticLayer semanticMetrics={state.semanticMetrics} />
            <ChatInterface
              messages={state.messages}
              isProcessing={state.isProcessing}
              activePerspective={state.activePerspective}
              onSendMessage={sendMessage}
            />
          </div>
        </div>

        <ArchitectureFlow />
      </div>
    </div>
  );
}
