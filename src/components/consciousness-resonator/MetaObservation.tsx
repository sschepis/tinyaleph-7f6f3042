import type { MetaObservation as MetaObservationType } from '@/lib/consciousness-resonator/types';

interface MetaObservationProps {
  metaObservation: MetaObservationType;
  isProcessing: boolean;
}

export function MetaObservation({ metaObservation, isProcessing }: MetaObservationProps) {
  return (
    <section className="bg-black/50 border border-orange-500/60 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-orange-400">Meta-Observation Layer</h2>
      
      <div className="bg-secondary/30 rounded-lg p-4 mb-4">
        <table className="w-full text-xs">
          <tbody>
            <tr>
              <th className="text-left pb-2 text-muted-foreground">Assessment</th>
              <td className={`pb-2 ${isProcessing ? 'animate-pulse' : ''}`}>
                {isProcessing ? 'Observing...' : metaObservation.harmony}
              </td>
            </tr>
            <tr>
              <th className="text-left pb-2 text-muted-foreground">Dominant</th>
              <td className="pb-2">{metaObservation.dominant}</td>
            </tr>
            <tr>
              <th className="text-left pb-2 text-muted-foreground">Absent</th>
              <td className="pb-2">{metaObservation.absent}</td>
            </tr>
            <tr>
              <th className="text-left pb-2 text-muted-foreground">Evolution</th>
              <td className="pb-2">{metaObservation.evolution}</td>
            </tr>
            <tr>
              <th className="text-left pb-2 text-muted-foreground">Quality</th>
              <td>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metaObservation.quality}%` }}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="text-sm italic bg-secondary/20 p-3 rounded min-h-[40px]">
        {metaObservation.metaphor || <span className="text-muted-foreground">Generating meta-observation...</span>}
      </div>
    </section>
  );
}
