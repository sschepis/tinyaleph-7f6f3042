import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Github, ExternalLink, Boxes, ChevronDown, BookOpen, Beaker, Cpu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Reorganized navigation with clear categories
const navGroups = [
  {
    label: 'Learn',
    icon: BookOpen,
    description: 'Documentation & tutorials',
    items: [
      { id: 'getting-started', label: 'Getting Started', path: '/docs/getting-started', desc: 'Quick intro' },
      { id: 'user-guide', label: 'User Guide', path: '/docs/user-guide', desc: 'In-depth tutorials' },
      { id: 'concept-docs', label: 'Concept Docs', path: '/docs/concepts', desc: 'Theory & math' },
      { id: 'reference', label: 'API Reference', path: '/docs/reference', desc: 'Full API docs' },
      { id: 'app-ideas', label: 'App Ideas', path: '/docs/app-ideas', desc: 'Inspiration' },
      { id: 'quickstart', label: 'Quickstart Examples', path: '/quickstart', desc: 'Code samples' },
    ],
  },
  {
    label: 'Library',
    icon: Beaker,
    description: 'Core modules & backends',
    items: [
      { id: 'core', label: 'Core', path: '/core', desc: 'Hypercomplex & primes' },
      { id: 'backends', label: 'Backends', path: '/backends', desc: 'Semantic, Crypto, Bio' },
      { id: 'engine', label: 'Engine', path: '/engine', desc: 'Symbol database' },
      { id: 'semantic', label: 'Semantic', path: '/semantic', desc: 'Word embeddings' },
      { id: 'crypto', label: 'Cryptography', path: '/crypto', desc: 'Hashing & HMAC' },
    ],
  },
  {
    label: 'Science',
    icon: Cpu,
    description: 'Physics & quantum simulation',
    items: [
      { id: 'physics', label: 'Physics', path: '/physics', desc: 'Oscillators & chaos' },
      { id: 'kuramoto', label: 'Kuramoto', path: '/kuramoto', desc: 'Synchronization' },
      { id: 'quantum', label: 'Quantum', path: '/quantum', desc: 'State simulation' },
      { id: 'math', label: 'Mathematics', path: '/math', desc: 'Quaternions & primes' },
      { id: 'scientific', label: 'Scientific', path: '/scientific', desc: 'Wavefunction & more' },
      { id: 'typesystem', label: 'Type System', path: '/typesystem', desc: 'Lambda calculus' },
      { id: 'topology', label: 'Topology', path: '/topology', desc: '108 invariant & knots' },
      { id: 'arithmetic-topology', label: 'Arithmetic Topology', path: '/arithmetic-topology', desc: 'Primes as knots' },
      { id: 'crt-homology', label: 'CRT-Homology', path: '/crt-homology', desc: 'Residue encoding' },
      { id: 'discrete', label: 'Discrete', path: '/discrete', desc: 'Integer dynamics' },
    ],
  },
  {
    label: 'Apps',
    icon: Sparkles,
    description: 'Interactive applications',
    items: [
      { id: 'prime-resonance', label: 'Prime Resonance', path: '/prime-resonance', desc: 'Quantum formalism' },
      { id: 'quantum-wavefunction', label: 'Quantum Wavefunction', path: '/quantum-wavefunction', desc: 'Prime patterns' },
      { id: 'sentient-observer', label: 'Sentient Observer', path: '/sentient-observer', desc: 'Consciousness sim' },
      { id: 'circuit-runner', label: 'Quantum Circuits', path: '/circuit-runner', desc: 'Build & simulate' },
      { id: 'dna-computer', label: 'DNA Computer', path: '/dna-computer', desc: 'Bioinformatics' },
      { id: 'symbolic-mind', label: 'Symbolic Mind', path: '/symbolic-mind', desc: 'Resonance oracle' },
      { id: 'consciousness-resonator', label: 'Consciousness Resonator', path: '/consciousness-resonator', desc: 'Multi-perspective AI' },
      { id: 'sephirotic-oscillator', label: 'Sephirotic Oscillator', path: '/sephirotic-oscillator', desc: 'Tree of Life' },
      { id: 'chat', label: 'Aleph Chat', path: '/chat', desc: 'AI assistant' },
      { id: 'enochian', label: 'Enochian', path: '/enochian', desc: 'Language model' },
      { id: 'jam-partner', label: 'Jam Partner', path: '/jam-partner', desc: 'Music AI' },
      { id: 'entanglement-lab', label: 'Entanglement Lab', path: '/entanglement-lab', desc: 'Bell states & CHSH' },
      { id: 'bb84', label: 'BB84 QKD', path: '/bb84', desc: 'Quantum cryptography' },
      { id: 'grover-search', label: "Grover's Search", path: '/grover-search', desc: 'Quantum search' },
    ],
  },
];

// Flat list for mobile
const allNavItems = navGroups.flatMap(group => group.items);

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const isActiveGroup = (group: typeof navGroups[0]) => {
    return group.items.some(item => location.pathname === item.path);
  };

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled 
        ? 'bg-background/80 backdrop-blur-xl border-b border-border' 
        : 'bg-background/50 backdrop-blur-sm'
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Boxes className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg">
              <span className="text-primary">tiny</span>aleph
            </span>
          </Link>

          {/* Desktop Nav with Dropdowns */}
          <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {navGroups.map(group => {
              const Icon = group.icon;
              return (
                <div 
                  key={group.label} 
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(group.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                      ${isActiveGroup(group) 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {group.label}
                    <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === group.label ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {openDropdown === group.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full left-0 mt-1 py-2 w-[320px] rounded-xl border border-border bg-background backdrop-blur-xl shadow-xl z-50"
                        onMouseEnter={() => handleMouseEnter(group.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="px-4 py-2 border-b border-border mb-1">
                          <p className="text-xs font-medium text-muted-foreground">{group.description}</p>
                        </div>
                        {group.items.map(item => (
                          <Link
                            key={item.id}
                            to={item.path}
                            className={`
                              flex items-center justify-between gap-4 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all
                              ${location.pathname === item.path 
                                ? 'text-primary bg-primary/10' 
                                : 'text-foreground hover:bg-secondary'
                              }
                            `}
                          >
                            <span className="font-medium">{item.label}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{item.desc}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* External Links */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://www.npmjs.com/package/@aleph-ai/tinyaleph"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
            >
              npm
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/sschepis/tinyaleph"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-6 max-h-[80vh] overflow-y-auto">
              {navGroups.map(group => {
                const Icon = group.icon;
                return (
                  <div key={group.label}>
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">
                        {group.label}
                      </p>
                      <span className="text-xs text-muted-foreground">— {group.description}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {group.items.map(item => (
                        <Link
                          key={item.id}
                          to={item.path}
                          className={`
                            block px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${location.pathname === item.path 
                              ? 'text-primary bg-primary/10' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }
                          `}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Mobile external links */}
              <div className="pt-4 border-t border-border">
                <div className="flex gap-2">
                  <a
                    href="https://www.npmjs.com/package/@aleph-ai/tinyaleph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                  >
                    npm <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://github.com/sschepis/tinyaleph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                  >
                    GitHub <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
