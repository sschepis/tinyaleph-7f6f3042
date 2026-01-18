import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { CommunicationEvent } from '@/lib/quaternion-nonlocal/communication-types';

interface CommunicationLogProps {
  history: CommunicationEvent[];
  isPoweredOn: boolean;
}

export function CommunicationLog({ history, isPoweredOn }: CommunicationLogProps) {
  const logRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [history]);
  
  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
        <Zap className="w-4 h-4 text-amber-400" />
        Non-Local Communication Log
      </h3>
      
      <div 
        ref={logRef}
        className="h-48 overflow-y-auto border border-border rounded-lg p-2 bg-muted/30"
      >
        {!isPoweredOn || history.length === 0 ? (
          <div className="text-muted-foreground text-center py-8 text-sm">
            No non-local communications yet. Enable the system and try sending messages!
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((comm) => (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg border-l-4 border-amber-500 bg-amber-500/10"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">
                      Node {comm.from} → Node {comm.to}
                      <span className="ml-2 text-[10px] text-amber-400 font-normal">
                        [NON-LOCAL]
                      </span>
                    </div>
                    <div className="text-sm mt-1">{comm.message}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 flex gap-3">
                      <span>{new Date(comm.timestamp).toLocaleTimeString()}</span>
                      <span className="text-primary">
                        Correlation: {comm.correlation.toFixed(3)}
                      </span>
                    </div>
                  </div>
                  <div className="text-amber-400 text-xl">⚡</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
