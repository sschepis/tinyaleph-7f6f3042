import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PerspectiveType, MultiPerspectiveResponse } from '@/lib/consciousness-resonator/types';
import { PERSPECTIVE_NODES } from '@/lib/consciousness-resonator/perspective-config';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles } from 'lucide-react';

interface MultiPerspectivePanelProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  responses: MultiPerspectiveResponse | null;
  isProcessing: boolean;
}

const PERSPECTIVE_COLORS: Record<PerspectiveType, string> = {
  analytical: 'border-blue-500/60 bg-blue-500/10',
  creative: 'border-pink-500/60 bg-pink-500/10',
  ethical: 'border-green-500/60 bg-green-500/10',
  pragmatic: 'border-yellow-500/60 bg-yellow-500/10',
  emotional: 'border-orange-500/60 bg-orange-500/10',
  mediator: 'border-purple-500/60 bg-purple-500/10'
};

const PERSPECTIVE_TEXT_COLORS: Record<PerspectiveType, string> = {
  analytical: 'text-blue-400',
  creative: 'text-pink-400',
  ethical: 'text-green-400',
  pragmatic: 'text-yellow-400',
  emotional: 'text-orange-400',
  mediator: 'text-purple-400'
};

export function MultiPerspectivePanel({ 
  isEnabled, 
  onToggle, 
  responses, 
  isProcessing 
}: MultiPerspectivePanelProps) {
  const [expandedNode, setExpandedNode] = useState<PerspectiveType | null>(null);
  
  const perspectiveOrder: PerspectiveType[] = ['analytical', 'creative', 'ethical', 'pragmatic', 'emotional'];
  
  return (
    <section className="bg-black/50 border border-purple-500/60 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-400">Multi-Perspective Mode</h2>
          <p className="text-xs text-muted-foreground">
            All nodes respond simultaneously with Mediator synthesis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch
            checked={isEnabled}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Querying all perspective nodes...</span>
              </div>
            )}
            
            {/* Perspective responses grid */}
            {responses && !isProcessing && (
              <div className="space-y-4">
                {/* Individual perspectives */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perspectiveOrder.map((perspective) => {
                    const node = PERSPECTIVE_NODES[perspective];
                    const response = responses.perspectives[perspective];
                    const isExpanded = expandedNode === perspective;
                    
                    return (
                      <motion.div
                        key={perspective}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${PERSPECTIVE_COLORS[perspective]} ${isExpanded ? 'col-span-full' : ''}`}
                        onClick={() => setExpandedNode(isExpanded ? null : perspective)}
                        layout
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold ${PERSPECTIVE_TEXT_COLORS[perspective]}`}>
                            {node.name}
                          </span>
                          {response && (
                            <span className="text-[10px] text-muted-foreground">
                              {response.length} chars
                            </span>
                          )}
                        </div>
                        
                        {response ? (
                          <p className={`text-sm text-foreground/90 ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {response}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Awaiting response...
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Mediator Synthesis */}
                {responses.synthesis && (
                  <motion.div
                    className="border-2 border-purple-500/80 bg-purple-500/10 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span className="font-bold text-purple-400">Mediator Synthesis</span>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {responses.synthesis}
                    </p>
                  </motion.div>
                )}
              </div>
            )}
            
            {/* Empty state */}
            {!responses && !isProcessing && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Send a message to activate multi-perspective analysis</p>
                <p className="text-xs mt-2">All 5 perspective nodes will respond, then the Mediator will synthesize</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
