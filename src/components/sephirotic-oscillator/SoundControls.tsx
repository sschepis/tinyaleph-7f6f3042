import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundControlsProps {
  soundEnabled: boolean;
  onToggle: () => void;
}

export function SoundControls({ soundEnabled, onToggle }: SoundControlsProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        fixed bottom-4 right-4 z-50 p-3 rounded-full border
        transition-all duration-300
        ${soundEnabled 
          ? 'bg-primary/20 border-primary text-primary' 
          : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={soundEnabled ? 'Disable sound' : 'Enable sound'}
    >
      {soundEnabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
      
      {/* Sound wave animation when enabled */}
      {soundEnabled && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full border border-primary"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border border-primary"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.5
            }}
          />
        </>
      )}
    </motion.button>
  );
}
