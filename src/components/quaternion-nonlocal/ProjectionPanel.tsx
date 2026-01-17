import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectionResult, TransmissionEvent } from '@/lib/quaternion-nonlocal/types';
import { ArrowRight, Check, X } from 'lucide-react';

interface ProjectionPanelProps {
  lastProjection: ProjectionResult | null;
  transmissionHistory: TransmissionEvent[];
}

export function ProjectionPanel({ lastProjection, transmissionHistory }: ProjectionPanelProps) {
  const recentTransmissions = transmissionHistory.slice(-5).reverse();
  
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm">Projection & Transmission</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Last projection result */}
        <AnimatePresence mode="wait">
          {lastProjection ? (
            <motion.div
              key={lastProjection.eigenvalue}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 bg-primary/10 rounded-lg border border-primary/30"
            >
              <div className="text-xs text-muted-foreground mb-1">Collapse Result</div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={lastProjection.eigenvalue > 0 ? 'default' : 'secondary'}>
                  {lastProjection.eigenvalue > 0 ? '+' : ''}√p = {lastProjection.eigenvalue.toFixed(4)}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {lastProjection.symbolicMeaning}
              </div>
              <div className="mt-2 text-[10px] font-mono text-muted-foreground">
                Collapsed state: ({lastProjection.collapsedState.blochVector.map(v => v.toFixed(2)).join(', ')})
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-muted/20 rounded-lg text-center text-xs text-muted-foreground"
            >
              No measurement performed yet
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Transmission history */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Recent Transmissions</div>
          
          {recentTransmissions.length === 0 ? (
            <div className="text-xs text-muted-foreground/50 text-center py-2">
              No transmissions yet
            </div>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {recentTransmissions.map((tx, i) => (
                <motion.div
                  key={tx.timestamp}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-2 rounded text-xs flex items-center gap-2 ${
                    tx.phaseLockAchieved 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-muted/20'
                  }`}
                >
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      tx.sender === 'alice' 
                        ? 'border-green-500/50 text-green-400' 
                        : 'border-blue-500/50 text-blue-400'
                    }`}
                  >
                    {tx.sender === 'alice' ? 'A' : 'B'}
                  </Badge>
                  
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  
                  <span className="font-mono flex-1">
                    p={tx.prime.p}
                  </span>
                  
                  <span className="text-muted-foreground">
                    γ={tx.twistApplied.toFixed(1)}
                  </span>
                  
                  {tx.phaseLockAchieved ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <X className="w-3 h-3 text-muted-foreground" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Transmission stats */}
        {transmissionHistory.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted/20 rounded text-center">
              <div className="text-muted-foreground">Total</div>
              <div className="font-mono">{transmissionHistory.length}</div>
            </div>
            <div className="p-2 bg-muted/20 rounded text-center">
              <div className="text-muted-foreground">Locked</div>
              <div className="font-mono text-green-400">
                {transmissionHistory.filter(t => t.phaseLockAchieved).length}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
