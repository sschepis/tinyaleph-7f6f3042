import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { getSonicEngine } from '@/lib/consciousness-resonator/sonic-engine';
import type { ActivatedArchetype, ArchetypeCategory } from '@/lib/consciousness-resonator/types';

interface SonicControlsProps {
  archetypes: ActivatedArchetype[];
  hexagramLines: boolean[];
  entropy: number;
  onSoundStateChange?: (enabled: boolean) => void;
}

export function SonicControls({ 
  archetypes, 
  hexagramLines, 
  entropy,
  onSoundStateChange 
}: SonicControlsProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastArchetypeIds, setLastArchetypeIds] = useState<string>('');
  
  const sonicEngine = getSonicEngine();
  
  // Initialize audio on first enable
  const handleToggle = useCallback(async (enabled: boolean) => {
    if (enabled && !isInitialized) {
      await sonicEngine.initialize();
      setIsInitialized(true);
    }
    
    sonicEngine.setEnabled(enabled);
    setIsEnabled(enabled);
    onSoundStateChange?.(enabled);
    
    if (enabled) {
      // Play activation sound
      sonicEngine.playQuantumShift(0.5);
    }
  }, [isInitialized, sonicEngine, onSoundStateChange]);
  
  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    sonicEngine.setVolume(vol / 100);
  }, [sonicEngine]);
  
  // Play archetype resonance when archetypes change
  useEffect(() => {
    if (!isEnabled || archetypes.length === 0) return;
    
    const currentIds = archetypes.map(a => a.id).sort().join(',');
    if (currentIds !== lastArchetypeIds && lastArchetypeIds !== '') {
      // Archetypes changed, play resonance chord
      sonicEngine.playResonanceChord(archetypes);
    }
    setLastArchetypeIds(currentIds);
  }, [archetypes, isEnabled, lastArchetypeIds, sonicEngine]);
  
  // Play hexagram change sound
  useEffect(() => {
    if (!isEnabled) return;
    
    const timer = setTimeout(() => {
      sonicEngine.playHexagramChange(hexagramLines);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [hexagramLines, isEnabled, sonicEngine]);
  
  // Manual play button
  const handlePlayResonance = useCallback(() => {
    if (!isInitialized) {
      sonicEngine.initialize().then(() => {
        setIsInitialized(true);
        sonicEngine.setEnabled(true);
        setIsEnabled(true);
        sonicEngine.playResonanceChord(archetypes);
      });
    } else {
      sonicEngine.playResonanceChord(archetypes);
    }
  }, [archetypes, isInitialized, sonicEngine]);
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-14 right-0 bg-black/90 border border-primary/40 rounded-lg p-4 w-64 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Sonic Resonance
            </h3>
            
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground">
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            
            {/* Volume Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Volume</span>
                <span className="text-xs font-mono text-primary">{volume}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={5}
                className="w-full"
                disabled={!isEnabled}
              />
            </div>
            
            {/* Manual Play Button */}
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={handlePlayResonance}
              disabled={archetypes.length === 0}
            >
              <Waves className="w-3 h-3 mr-2" />
              Play Resonance Chord
            </Button>
            
            {/* Active Archetypes */}
            {archetypes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <span className="text-[10px] text-muted-foreground">Active Frequencies:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {archetypes.slice(0, 4).map(arch => (
                    <span
                      key={arch.id}
                      className="text-[10px] px-1.5 py-0.5 bg-primary/20 rounded"
                    >
                      {arch.symbol} {arch.primes.join(',')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toggle Button */}
      <motion.button
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          border transition-colors
          ${isEnabled 
            ? 'bg-primary/20 border-primary/60 text-primary' 
            : 'bg-secondary/50 border-border/40 text-muted-foreground'}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isEnabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </motion.button>
      
      {/* Pulsing indicator when enabled */}
      {isEnabled && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30 pointer-events-none"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}
