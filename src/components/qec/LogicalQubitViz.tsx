import { LogicalQubit as LogicalQubitType } from '@/lib/qec';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface LogicalQubitVizProps {
  logicalQubit: LogicalQubitType;
  step: string;
}

export function LogicalQubitViz({ logicalQubit, step }: LogicalQubitVizProps) {
  const isProtected = logicalQubit.isProtected && logicalQubit.fidelity > 0.9;
  
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {isProtected ? (
            <ShieldCheck className="w-4 h-4 text-green-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          )}
          Logical Qubit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Bloch sphere representation (simplified) */}
          <motion.div
            className={`
              relative w-32 h-32 rounded-full border-2 
              ${isProtected 
                ? 'border-green-500/50 bg-gradient-to-br from-green-500/20 to-green-500/5' 
                : 'border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-amber-500/5'
              }
            `}
            animate={logicalQubit.fidelity < 1 ? { 
              scale: [1, 1.02, 1],
              opacity: [1, 0.8, 1],
            } : {}}
            transition={{ duration: 1, repeat: logicalQubit.fidelity < 1 ? Infinity : 0 }}
          >
            {/* Center point */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className={`w-4 h-4 rounded-full ${isProtected ? 'bg-green-400' : 'bg-amber-400'}`}
                animate={{ 
                  y: logicalQubit.alpha > logicalQubit.beta ? -20 : 20,
                }}
              />
            </div>
            
            {/* Axes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-full h-px bg-muted-foreground/20" />
              <div className="absolute w-px h-full bg-muted-foreground/20" />
            </div>
            
            {/* Labels */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">|0⟩</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">|1⟩</div>
          </motion.div>
          
          {/* State display */}
          <div className="text-center space-y-2">
            <div className="font-mono text-lg">
              <span className="text-primary">{logicalQubit.alpha.toFixed(3)}</span>
              |0⟩<sub>L</sub> + 
              <span className="text-cyan-400"> {logicalQubit.beta.toFixed(3)}</span>
              |1⟩<sub>L</sub>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fidelity</span>
                <span className={logicalQubit.fidelity > 0.9 ? 'text-green-400' : 'text-amber-400'}>
                  {(logicalQubit.fidelity * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={logicalQubit.fidelity * 100} 
                className="h-2"
              />
            </div>
          </div>
          
          {/* Status */}
          <div className={`
            px-3 py-1.5 rounded-full text-xs font-medium
            ${step === 'idle' ? 'bg-muted text-muted-foreground' : ''}
            ${step === 'encoded' ? 'bg-primary/20 text-primary' : ''}
            ${step === 'error_injected' ? 'bg-red-500/20 text-red-400' : ''}
            ${step === 'syndrome_measured' ? 'bg-amber-500/20 text-amber-400' : ''}
            ${step === 'corrected' ? 'bg-green-500/20 text-green-400' : ''}
          `}>
            {step === 'idle' && 'Not Encoded'}
            {step === 'encoded' && 'Protected'}
            {step === 'error_injected' && 'Error Present'}
            {step === 'syndrome_measured' && 'Error Located'}
            {step === 'corrected' && 'Error Corrected'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
