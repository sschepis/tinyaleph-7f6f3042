import { useConsciousnessResonator } from '@/hooks/useConsciousnessResonator';
import { useState, useEffect } from 'react';
import {
  PerspectiveNodes,
  FieldIntegration,
  MetaObservation,
  QuantumProbability,
  SemanticLayer,
  QuantumBackground,
  ArchitectureFlow,
  SymbolResonanceViz,
  SonicControls,
  ConversationStarters,
  TypingIndicator
} from '@/components/consciousness-resonator';
import { WaveformVisualizer } from '@/components/consciousness-resonator/WaveformVisualizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw } from 'lucide-react';
import { AppHelpDialog, HelpButton, useFirstRun } from '@/components/app-help';
import { helpSteps } from '@/components/consciousness-resonator/HelpContent';
import { AssistantMessage } from '@/components/AssistantMessage';
export default function QuantumConsciousnessResonator() {
  const { state, togglePerspective, sendMessage, resetConversation } = useConsciousnessResonator();
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const [isFirstRun, markAsSeen] = useFirstRun('consciousness-resonator');
  const [helpOpen, setHelpOpen] = useState(isFirstRun);
  
  useEffect(() => {
    if (isFirstRun) {
      setHelpOpen(true);
    }
  }, [isFirstRun]);
  
  const handleHelpClose = (open: boolean) => {
    setHelpOpen(open);
    if (!open && isFirstRun) {
      markAsSeen();
    }
  };

  const hasActivePerspectives = state.activePerspectives.length > 0;
  const hasConversation = state.messages.length > 1; // More than just the init message
  return (
    <div className="min-h-screen relative">
      <QuantumBackground />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Compact Header */}
        <header className="text-center mb-6 relative">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 glow-text">
            Quantum Consciousness Resonator
          </h1>
          <p className="text-sm text-muted-foreground">
            Multi-layered resonance architecture • Powered by TinyAleph
          </p>
          <div className="absolute right-0 top-0">
            <HelpButton onClick={() => setHelpOpen(true)} />
          </div>
        </header>
        
        <AppHelpDialog
          open={helpOpen}
          onOpenChange={handleHelpClose}
          steps={helpSteps}
          appName="Consciousness Resonator"
        />

        {/* Main Layout: Chat-Centric */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar - Compact Controls */}
          <div className="lg:col-span-3 space-y-4">
            {/* Perspective Nodes - Multi-select */}
            <PerspectiveNodes
              activePerspectives={state.activePerspectives}
              onTogglePerspective={togglePerspective}
              hexagramLines={state.quantumState.hexagramLines}
            />
            
            {/* Quantum State - Compact */}
            <QuantumProbability quantumState={state.quantumState} />
            
            {/* Waveform Visualizer */}
            <div className="bg-black/50 border border-primary/40 rounded-lg p-3">
              <h3 className="text-xs font-bold text-primary mb-2">Sonic Waveform</h3>
              <WaveformVisualizer 
                isEnabled={soundEnabled} 
                className="h-24"
              />
            </div>
          </div>
          
          {/* Center - Primary Chat Interface */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Chat - Prominent */}
            <section className="bg-black/60 border-2 border-primary/50 rounded-lg p-4 shadow-lg shadow-primary/10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-primary">Conscious Observer</h2>
                <div className="flex items-center gap-2">
                  {hasConversation && (
                    <button
                      onClick={resetConversation}
                      disabled={state.isProcessing}
                      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      title="New Conversation"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>New</span>
                    </button>
                  )}
                  {hasActivePerspectives && (
                    <div className="flex gap-1 flex-wrap justify-end">
                      {state.activePerspectives.map(p => (
                        <span 
                          key={p}
                          className="text-[10px] px-1.5 py-0.5 bg-primary/20 rounded text-primary capitalize"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Chat Messages - Larger */}
              <div className="h-[45vh] overflow-y-auto mb-4 bg-secondary/10 rounded-lg p-4 space-y-3 border border-border/30">
                {state.messages.length === 0 && hasActivePerspectives ? (
                  <ConversationStarters 
                    onSelectStarter={(message) => sendMessage(message)}
                    disabled={state.isProcessing}
                  />
                ) : state.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">
                      Select perspective nodes on the left to begin exploring
                    </p>
                  </div>
                ) : (
                  <>
                    {state.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`${message.role === 'user' ? 'text-right' : 'text-left'} animate-fade-in`}
                      >
                        <div
                          className={`
                            inline-block max-w-[85%] px-4 py-2 rounded-lg text-sm
                            ${message.role === 'user' 
                              ? 'bg-primary/80 text-primary-foreground' 
                              : message.role === 'system'
                                ? 'bg-muted/80 text-muted-foreground'
                                : 'bg-secondary/80 text-foreground'}
                          `}
                        >
                          {message.role === 'assistant' ? (
                            <AssistantMessage 
                              content={message.content} 
                              showCopyButton={true}
                            />
                          ) : (
                            <span dangerouslySetInnerHTML={{ __html: message.content }} />
                          )}
                        </div>
                      </div>
                    ))}
                    {state.isProcessing && (
                      <div className="text-left animate-fade-in">
                        <TypingIndicator />
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Input - Prominent */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('query') as HTMLInputElement;
                  if (input.value.trim() && !state.isProcessing) {
                    sendMessage(input.value.trim());
                    input.value = '';
                  }
                }} 
                className="flex gap-2"
              >
                <input
                  name="query"
                  placeholder={hasActivePerspectives 
                    ? `Ask a question (${state.activePerspectives.length} perspective${state.activePerspectives.length > 1 ? 's' : ''} active)...` 
                    : "Select perspective nodes to begin..."}
                  disabled={state.isProcessing || !hasActivePerspectives}
                  className="flex-1 bg-secondary/30 border border-primary/30 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={state.isProcessing || !hasActivePerspectives}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </section>
            
            {/* Field Integration - Below Chat */}
            <FieldIntegration
              fieldIntegration={state.fieldIntegration}
              isProcessing={state.isProcessing}
            />
          </div>
          
          {/* Right Sidebar - Analysis Panels */}
          <div className="lg:col-span-3 space-y-4">
            <Tabs defaultValue="symbols" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-8">
                <TabsTrigger value="symbols" className="text-xs">Symbols</TabsTrigger>
                <TabsTrigger value="meta" className="text-xs">Meta</TabsTrigger>
                <TabsTrigger value="semantic" className="text-xs">Semantic</TabsTrigger>
              </TabsList>
              
              <TabsContent value="symbols" className="mt-3">
                <SymbolResonanceViz
                  archetypes={state.activatedArchetypes}
                  fieldStrength={state.symbolicField.fieldStrength}
                  dominantCategory={state.symbolicField.dominantCategory}
                  trigrams={state.trigrams}
                  tarot={state.tarot}
                />
              </TabsContent>
              
              <TabsContent value="meta" className="mt-3">
                <MetaObservation
                  metaObservation={state.metaObservation}
                  isProcessing={state.isProcessing}
                />
              </TabsContent>
              
              <TabsContent value="semantic" className="mt-3">
                <SemanticLayer semanticMetrics={state.semanticMetrics} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Architecture Flow - Collapsible at bottom */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            View Architecture Flow
          </summary>
          <div className="mt-4">
            <ArchitectureFlow />
          </div>
        </details>
      </div>
      
      {/* Sonic Controls - Fixed position */}
      <SonicControls
        archetypes={state.activatedArchetypes}
        hexagramLines={state.quantumState.hexagramLines}
        entropy={state.quantumState.entropy}
        onSoundStateChange={setSoundEnabled}
      />
    </div>
  );
}
