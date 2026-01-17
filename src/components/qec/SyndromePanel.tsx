import { Syndrome } from '@/lib/qec';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

interface SyndromePanelProps {
  syndromes: Syndrome[];
  measured: boolean;
}

export function SyndromePanel({ syndromes, measured }: SyndromePanelProps) {
  const hasAnyError = syndromes.some(s => s.value === 1);
  
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          Syndrome Measurements
          {measured && (
            <Badge 
              variant="outline" 
              className={`ml-auto text-xs ${hasAnyError ? 'border-red-500/50 text-red-400' : 'border-green-500/50 text-green-400'}`}
            >
              {hasAnyError ? 'Error Detected' : 'No Errors'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {syndromes.map((syndrome, i) => (
            <motion.div
              key={syndrome.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                flex items-center justify-between p-3 rounded-lg border
                ${measured && syndrome.value === 1 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-muted/30 border-border/50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm font-semibold">
                  {syndrome.name}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({syndrome.qubits.map(q => `q${q + 1}`).join(', ')})
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {measured ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold
                        ${syndrome.value === 1 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                        }
                      `}
                    >
                      {syndrome.value}
                    </motion.div>
                    {syndrome.value === 1 ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
                    ?
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {!measured && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Inject an error, then measure syndromes to detect it
          </p>
        )}
        
        {measured && hasAnyError && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-300">
              Syndrome pattern: ({syndromes.map(s => s.value).join(', ')})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
