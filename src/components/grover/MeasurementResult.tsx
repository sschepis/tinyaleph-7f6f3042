import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { formatBinary } from '@/lib/grover';

interface MeasurementResultProps {
  result: { result: number; isMarked: boolean } | null;
  numQubits: number;
  probabilityMarked: number;
}

export function MeasurementResult({
  result,
  numQubits,
  probabilityMarked,
}: MeasurementResultProps) {
  if (!result) {
    return (
      <div className="bg-secondary/20 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Measurement</h3>
        <p className="text-xs text-muted-foreground">
          Run iterations to amplify marked states, then measure to collapse the superposition.
        </p>
        <div className="mt-3 p-3 bg-secondary/30 rounded text-center">
          <div className="text-muted-foreground text-xs">Expected success rate</div>
          <div className="font-mono text-lg">
            {(probabilityMarked * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-secondary/20 rounded-lg p-4">
      <h3 className="text-sm font-medium mb-2">Measurement Result</h3>
      
      <motion.div
        className={`p-4 rounded-lg border-2 ${
          result.isMarked
            ? 'bg-green-500/10 border-green-500'
            : 'bg-red-500/10 border-red-500'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Measured state</div>
            <div className="font-mono text-xl">
              |{formatBinary(result.result, numQubits)}⟩
            </div>
            <div className="text-xs text-muted-foreground">
              = {result.result} (decimal)
            </div>
          </div>
          
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            result.isMarked ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {result.isMarked ? (
              <Check className="w-6 h-6 text-white" />
            ) : (
              <X className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
        
        <div className={`mt-3 text-sm font-medium ${
          result.isMarked ? 'text-green-400' : 'text-red-400'
        }`}>
          {result.isMarked ? 'SUCCESS! Found a marked state.' : 'Not a marked state.'}
        </div>
      </motion.div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        <p>
          The quantum state collapsed to a single classical outcome. 
          With {(probabilityMarked * 100).toFixed(1)}% probability of success,
          this demonstrates the quadratic speedup of Grover's algorithm.
        </p>
      </div>
    </div>
  );
}
