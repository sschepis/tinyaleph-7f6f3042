import { useEffect, useState } from 'react';
import { ArrowDown, Sparkles, Zap, Brain } from 'lucide-react';
import SedenionVisualizer from './SedenionVisualizer';

const Hero = () => {
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number }[]>([]);
  
  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  const scrollToContent = () => {
    document.getElementById('core')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      {/* Floating particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${4 + Math.random() * 4}s`
          }}
        />
      ))}

      {/* Orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[600px] h-[600px]">
          <div className="absolute inset-0 border border-primary/10 rounded-full animate-spin-slow" />
          <div className="absolute inset-8 border border-primary/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
          <div className="absolute inset-16 border border-primary/10 rounded-full animate-spin-slow" style={{ animationDuration: '40s' }} />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">Prime-Resonant Semantic Computing</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="gradient-text">@aleph-ai/</span>
          <br />
          <span className="glow-text">tinyaleph</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
          A novel computational paradigm that encodes meaning as prime number signatures, 
          embeds them in hypercomplex space, and performs reasoning through entropy minimization.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {[
            { icon: Zap, label: '16D Sedenion Space' },
            { icon: Brain, label: 'Kuramoto Sync' },
            { icon: Sparkles, label: 'Prime Semantics' }
          ].map((feature, i) => (
            <div 
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Visualizer preview */}
        <div className="flex justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
            <SedenionVisualizer 
              components={[0.8, 0.2, 0.5, 0.1, 0.6, 0.3, 0.7, 0.4, 0.2, 0.5, 0.3, 0.6, 0.4, 0.1, 0.8, 0.2]}
              size="lg"
            />
            <p className="text-xs text-muted-foreground mt-4 font-mono">SedenionState visualization</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <button 
          onClick={scrollToContent}
          className="animate-bounce cursor-pointer p-3 rounded-full border border-border hover:border-primary/50 transition-colors"
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
