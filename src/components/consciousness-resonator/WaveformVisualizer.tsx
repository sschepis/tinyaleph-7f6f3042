import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getSonicEngine } from '@/lib/consciousness-resonator/sonic-engine';

interface WaveformVisualizerProps {
  isEnabled: boolean;
  className?: string;
}

export function WaveformVisualizer({ isEnabled, className = '' }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Connect to audio context
  const connectAnalyser = useCallback(() => {
    const sonicEngine = getSonicEngine();
    const state = sonicEngine.getState();
    
    if (!state.enabled) return;
    
    // Access the audio context from sonic engine
    const audioContext = (sonicEngine as any).audioContext as AudioContext | null;
    const masterGain = (sonicEngine as any).masterGain as GainNode | null;
    
    if (!audioContext || !masterGain) return;
    
    // Create analyser if not exists
    if (!analyserRef.current) {
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      // Connect master gain to analyser (analyser doesn't block audio)
      masterGain.connect(analyserRef.current);
      setIsConnected(true);
    }
  }, []);
  
  // Draw waveform
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    if (!canvas || !analyser || !dataArray) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get frequency data
    analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);
    
    const bufferLength = dataArray.length;
    const barWidth = (width / bufferLength) * 2;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.9;
      
      // Create gradient based on frequency
      const hue = (i / bufferLength) * 60 + 180; // Cyan to purple range
      const saturation = 80;
      const lightness = 50 + (dataArray[i] / 255) * 30;
      
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      
      // Draw mirrored bars
      const yTop = (height - barHeight) / 2;
      ctx.fillRect(x, yTop, barWidth - 1, barHeight);
      
      // Add glow effect for high amplitude
      if (dataArray[i] > 200) {
        ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, yTop, barWidth - 1, barHeight);
        ctx.shadowBlur = 0;
      }
      
      x += barWidth;
    }
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    animationRef.current = requestAnimationFrame(draw);
  }, []);
  
  // Start/stop animation based on enabled state
  useEffect(() => {
    if (isEnabled) {
      connectAnalyser();
      animationRef.current = requestAnimationFrame(draw);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isEnabled, draw, connectAnalyser]);
  
  // Retry connection when enabled changes
  useEffect(() => {
    if (isEnabled && !isConnected) {
      const interval = setInterval(() => {
        connectAnalyser();
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isEnabled, isConnected, connectAnalyser]);
  
  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      }
    });
    
    resizeObserver.observe(canvas.parentElement!);
    
    return () => resizeObserver.disconnect();
  }, []);
  
  return (
    <motion.div 
      className={`relative overflow-hidden rounded-lg bg-black/30 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isEnabled ? 1 : 0.3 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Overlay when disabled */}
      {!isEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-xs text-muted-foreground">
            Enable sound to see waveforms
          </span>
        </div>
      )}
      
      {/* Corner label */}
      <div className="absolute top-2 left-2 text-[10px] text-primary/60 font-mono">
        FREQ SPECTRUM
      </div>
    </motion.div>
  );
}
