import { PhysicalQubit, CodeType } from '@/lib/qec';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Circle, AlertTriangle, Zap, RotateCcw } from 'lucide-react';

interface PhysicalQubitsVizProps {
  qubits: PhysicalQubit[];
  codeType: CodeType;
  onQubitClick?: (index: number) => void;
}

export function PhysicalQubitsViz({ qubits, codeType, onQubitClick }: PhysicalQubitsVizProps) {
  const getQubitColor = (qubit: PhysicalQubit) => {
    if (!qubit.hasError) return 'from-primary/30 to-primary/10 border-primary/50';
    switch (qubit.error) {
      case 'bit_flip':
        return 'from-red-500/30 to-red-500/10 border-red-500/50';
      case 'phase_flip':
        return 'from-blue-500/30 to-blue-500/10 border-blue-500/50';
      case 'both':
        return 'from-purple-500/30 to-purple-500/10 border-purple-500/50';
      default:
        return 'from-primary/30 to-primary/10 border-primary/50';
    }
  };
  
  const getErrorIcon = (qubit: PhysicalQubit) => {
    if (!qubit.hasError) return null;
    switch (qubit.error) {
      case 'bit_flip':
        return <Zap className="w-4 h-4 text-red-400" />;
      case 'phase_flip':
        return <RotateCcw className="w-4 h-4 text-blue-400" />;
      case 'both':
        return <AlertTriangle className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };
  
  const getLayout = () => {
    if (codeType === 'shor_9') {
      // 3x3 grid for Shor code
      return 'grid-cols-3';
    }
    if (codeType === 'steane_7') {
      // Hexagonal-ish layout
      return 'grid-cols-4';
    }
    // Linear for 3-qubit codes
    return `grid-cols-${qubits.length}`;
  };
  
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Circle className="w-4 h-4 text-cyan-400" />
          Physical Qubits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${getLayout()} gap-3`}>
          {qubits.map((qubit, i) => (
            <motion.button
              key={qubit.index}
              onClick={() => onQubitClick?.(qubit.index)}
              className={`
                relative p-4 rounded-xl border-2 bg-gradient-to-br transition-all cursor-pointer
                hover:scale-105 active:scale-95
                ${getQubitColor(qubit)}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={qubit.hasError ? { 
                boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 20px 5px rgba(239, 68, 68, 0.3)', '0 0 0 0 rgba(239, 68, 68, 0)'],
              } : {}}
              transition={qubit.hasError ? { duration: 1.5, repeat: Infinity } : {}}
            >
              <div className="text-center">
                <div className="text-lg font-mono font-bold">
                  q{qubit.index + 1}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {qubit.state[0].toFixed(2)}|0⟩ + {qubit.state[1].toFixed(2)}|1⟩
                </div>
              </div>
              
              {qubit.hasError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-background border border-border shadow-lg"
                >
                  {getErrorIcon(qubit)}
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary/50" />
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <span>Bit-flip (X)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500/50" />
            <span>Phase-flip (Z)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-500/50" />
            <span>Both (Y)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
