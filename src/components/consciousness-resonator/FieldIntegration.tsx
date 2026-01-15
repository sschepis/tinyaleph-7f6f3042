import type { FieldIntegration as FieldIntegrationType } from '@/lib/consciousness-resonator/types';

interface FieldIntegrationProps {
  fieldIntegration: FieldIntegrationType | null;
  isProcessing: boolean;
}

export function FieldIntegration({ fieldIntegration, isProcessing }: FieldIntegrationProps) {
  const defaultPrompt = `Create unified field resonance pattern integrating all nodes. 
OUTPUT FORMAT: CORE: [essence] METAPHOR: [central metaphor] CONNECTIONS: [key relationships] IMPLICATIONS: [significance]`;

  return (
    <section className="bg-black/50 border border-purple-500/60 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-purple-400">Field Integration Layer</h2>
      
      <textarea
        readOnly
        value={defaultPrompt}
        className="w-full bg-secondary/50 text-xs p-3 mb-3 h-28 rounded border border-border resize-none"
      />
      
      <div className="text-sm bg-secondary/30 p-3 rounded min-h-[80px]">
        {isProcessing ? (
          <span className="text-muted-foreground animate-pulse">Integrating field...</span>
        ) : fieldIntegration ? (
          <div className="space-y-1">
            {fieldIntegration.core && (
              <p><span className="text-purple-400 font-semibold">CORE:</span> {fieldIntegration.core}</p>
            )}
            {fieldIntegration.metaphor && (
              <p><span className="text-purple-400 font-semibold">METAPHOR:</span> {fieldIntegration.metaphor}</p>
            )}
            {fieldIntegration.connections && (
              <p><span className="text-purple-400 font-semibold">CONNECTIONS:</span> {fieldIntegration.connections}</p>
            )}
            {fieldIntegration.implications && (
              <p><span className="text-purple-400 font-semibold">IMPLICATIONS:</span> {fieldIntegration.implications}</p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">Awaiting resonance data...</span>
        )}
      </div>
    </section>
  );
}
