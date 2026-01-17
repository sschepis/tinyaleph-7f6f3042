import { CorrectionOperation } from '@/lib/qec';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, CheckCircle } from 'lucide-react';

interface CorrectionPanelProps {
  corrections: CorrectionOperation[];
  step: string;
}

export function CorrectionPanel({ corrections, step }: CorrectionPanelProps) {
  const showCorrections = step === 'corrected' && corrections.length > 0;
  const noErrorsFound = step === 'corrected' && corrections.length === 0;
  
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wrench className="w-4 h-4 text-green-400" />
          Error Correction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {showCorrections && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {corrections.map((correction, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Apply {correction.type}
                    </Badge>
                    <span className="text-sm font-mono">on q{correction.qubit + 1}</span>
                    <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {correction.reason}
                  </p>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-green-400 font-medium"
              >
                ✓ Logical qubit restored to original state
              </motion.div>
            </motion.div>
          )}
          
          {noErrorsFound && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-green-400">No errors detected</p>
              <p className="text-xs text-muted-foreground mt-1">
                Syndrome measurements indicate no correction needed
              </p>
            </motion.div>
          )}
          
          {step !== 'corrected' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 text-muted-foreground"
            >
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                {step === 'idle' && 'Encode a logical qubit to begin'}
                {step === 'encoded' && 'Inject an error to test correction'}
                {step === 'error_injected' && 'Measure syndromes to locate error'}
                {step === 'syndrome_measured' && 'Apply correction to fix error'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
