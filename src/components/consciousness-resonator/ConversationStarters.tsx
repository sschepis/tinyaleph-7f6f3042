import { motion } from 'framer-motion';
import { Sparkles, Brain, Compass, Lightbulb, Heart, Layers } from 'lucide-react';

interface ConversationStartersProps {
  onSelectStarter: (message: string) => void;
  disabled?: boolean;
}

const CONVERSATION_STARTERS = [
  {
    icon: Brain,
    label: 'Consciousness',
    message: 'What is the relationship between consciousness and the mathematical structure of reality?',
    color: 'from-cyan-500/20 to-cyan-500/5',
    borderColor: 'border-cyan-500/40',
    hoverColor: 'hover:border-cyan-400'
  },
  {
    icon: Compass,
    label: 'Purpose',
    message: 'How do I discover and align with my deeper purpose in life?',
    color: 'from-purple-500/20 to-purple-500/5',
    borderColor: 'border-purple-500/40',
    hoverColor: 'hover:border-purple-400'
  },
  {
    icon: Lightbulb,
    label: 'Creativity',
    message: 'What is the source of creative inspiration, and how can I access it more deeply?',
    color: 'from-amber-500/20 to-amber-500/5',
    borderColor: 'border-amber-500/40',
    hoverColor: 'hover:border-amber-400'
  },
  {
    icon: Heart,
    label: 'Connection',
    message: 'How can I cultivate more authentic and meaningful connections with others?',
    color: 'from-rose-500/20 to-rose-500/5',
    borderColor: 'border-rose-500/40',
    hoverColor: 'hover:border-rose-400'
  },
  {
    icon: Layers,
    label: 'Integration',
    message: 'How do I integrate the different aspects of my psyche into a coherent whole?',
    color: 'from-emerald-500/20 to-emerald-500/5',
    borderColor: 'border-emerald-500/40',
    hoverColor: 'hover:border-emerald-400'
  },
  {
    icon: Sparkles,
    label: 'Transformation',
    message: 'What practices or shifts in perspective lead to genuine personal transformation?',
    color: 'from-indigo-500/20 to-indigo-500/5',
    borderColor: 'border-indigo-500/40',
    hoverColor: 'hover:border-indigo-400'
  }
];

export function ConversationStarters({ onSelectStarter, disabled }: ConversationStartersProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-center">
        Choose a starting point for exploration
      </p>
      <div className="grid grid-cols-2 gap-2">
        {CONVERSATION_STARTERS.map((starter, index) => {
          const Icon = starter.icon;
          return (
            <motion.button
              key={starter.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectStarter(starter.message)}
              disabled={disabled}
              className={`
                group relative p-3 rounded-lg border text-left transition-all duration-200
                bg-gradient-to-br ${starter.color} ${starter.borderColor} ${starter.hoverColor}
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-[1.02] active:scale-[0.98]
              `}
            >
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium block mb-1">{starter.label}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {starter.message}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
