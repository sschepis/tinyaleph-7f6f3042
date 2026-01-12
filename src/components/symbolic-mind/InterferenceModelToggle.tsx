import React from 'react';
import { motion } from 'framer-motion';
import { Waves, Target, Atom } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type InterferenceModel = 'wave' | 'quantum' | 'attractor';

interface InterferenceModelToggleProps {
  model: InterferenceModel;
  onModelChange: (model: InterferenceModel) => void;
}

const MODELS = [
  {
    id: 'wave' as const,
    icon: Waves,
    name: 'Wave Interference',
    description: 'Symbols superpose as waves. Constructive interference amplifies meaning, destructive cancels.',
  },
  {
    id: 'quantum' as const,
    icon: Atom,
    name: 'Quantum Collapse',
    description: 'Symbols exist in superposition until measured. Probability amplitudes determine which meanings collapse into reality.',
  },
  {
    id: 'attractor' as const,
    icon: Target,
    name: 'Attractor Basin',
    description: 'Symbols flow toward stable fixed points in meaning-space. Energy dissipates until the system settles.',
  },
];

export function InterferenceModelToggle({ model, onModelChange }: InterferenceModelToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-1 bg-background/50 rounded-lg border border-border/40">
        {MODELS.map((m) => {
          const Icon = m.icon;
          const isActive = model === m.id;
          
          return (
            <Tooltip key={m.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onModelChange(m.id)}
                  className={`relative h-8 px-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-model"
                      className="absolute inset-0 bg-primary/15 rounded-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
