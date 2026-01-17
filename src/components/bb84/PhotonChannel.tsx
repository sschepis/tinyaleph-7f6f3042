import { useMemo } from 'react';
import { TransmittedPhoton } from '@/lib/bb84/types';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotonChannelProps {
  photons: TransmittedPhoton[];
  currentIndex: number;
  isAnimating: boolean;
}

function getBasisSymbol(basis: 'rectilinear' | 'diagonal'): string {
  return basis === 'rectilinear' ? '+' : '×';
}

function getPolarizationAngle(bit: 0 | 1, basis: 'rectilinear' | 'diagonal'): number {
  if (basis === 'rectilinear') {
    return bit === 0 ? 0 : 90; // horizontal or vertical
  } else {
    return bit === 0 ? 45 : 135; // diagonal
  }
}

export function PhotonChannel({ photons, currentIndex, isAnimating }: PhotonChannelProps) {
  const visiblePhotons = useMemo(() => 
    photons.slice(0, currentIndex).slice(-20), // Show last 20 photons
    [photons, currentIndex]
  );
  
  return (
    <div className="relative w-full h-full min-h-[300px] bg-gradient-to-b from-background/80 to-background rounded-lg border border-primary/20 overflow-hidden">
      {/* Alice's Station */}
      <div className="absolute left-4 top-4 bottom-4 w-24 bg-blue-500/20 rounded-lg border border-blue-500/40 flex flex-col items-center justify-center p-2">
        <div className="text-blue-400 font-bold text-sm mb-1">ALICE</div>
        <div className="text-xs text-muted-foreground text-center">Sender</div>
        <div className="w-8 h-8 mt-2 rounded-full bg-blue-500/30 border border-blue-400 flex items-center justify-center">
          📡
        </div>
      </div>
      
      {/* Eve's Station (if intercepting) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10">
        <div className="bg-red-500/20 rounded-lg border border-red-500/40 px-3 py-1 flex items-center gap-2">
          <span className="text-red-400 font-bold text-xs">EVE</span>
          <span className="text-xs text-muted-foreground">Eavesdropper</span>
          👁️
        </div>
      </div>
      
      {/* Bob's Station */}
      <div className="absolute right-4 top-4 bottom-4 w-24 bg-green-500/20 rounded-lg border border-green-500/40 flex flex-col items-center justify-center p-2">
        <div className="text-green-400 font-bold text-sm mb-1">BOB</div>
        <div className="text-xs text-muted-foreground text-center">Receiver</div>
        <div className="w-8 h-8 mt-2 rounded-full bg-green-500/30 border border-green-400 flex items-center justify-center">
          📡
        </div>
      </div>
      
      {/* Quantum Channel */}
      <div className="absolute left-32 right-32 top-1/2 -translate-y-1/2 h-16 flex items-center">
        {/* Channel line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-blue-500/50 via-primary/30 to-green-500/50" />
        
        {/* Photons */}
        <AnimatePresence mode="popLayout">
          {visiblePhotons.map((photon, idx) => {
            const polarization = getPolarizationAngle(photon.aliceBit, photon.aliceBasis);
            const isLatest = idx === visiblePhotons.length - 1;
            
            return (
              <motion.div
                key={photon.index}
                initial={{ x: 0, opacity: 0, scale: 0 }}
                animate={{ 
                  x: `${(idx / 20) * 100}%`,
                  opacity: isLatest ? 1 : 0.5,
                  scale: isLatest ? 1.2 : 0.8
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute flex flex-col items-center"
                style={{ left: 0 }}
              >
                {/* Photon visualization */}
                <div 
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${photon.intercepted 
                      ? 'bg-red-500/30 border border-red-400 text-red-300' 
                      : 'bg-primary/30 border border-primary text-primary-foreground'}
                    ${photon.basisMatch ? 'ring-2 ring-green-400/50' : ''}
                  `}
                  style={{ transform: `rotate(${polarization}deg)` }}
                >
                  {photon.aliceBit}
                </div>
                
                {/* Basis indicator */}
                <div className="text-[10px] text-muted-foreground mt-1">
                  {getBasisSymbol(photon.aliceBasis)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Progress indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        {currentIndex} / {photons.length} photons
      </div>
    </div>
  );
}
