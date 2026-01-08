import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Github, ExternalLink, Boxes, ChevronDown, BookOpen, Beaker, Cpu, Sparkles } from 'lucide-react';

// Reorganized navigation with clear categories
const navGroups = [
  {
    label: 'Learn',
    icon: BookOpen,
    description: 'Documentation & tutorials',
    items: [
      { id: 'getting-started', label: 'Getting Started', path: '/docs/getting-started', desc: 'Quick intro' },
      { id: 'user-guide', label: 'User Guide', path: '/docs/user-guide', desc: 'In-depth tutorials' },
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
    ],
  },
  {
    label: 'Apps',
    icon: Sparkles,
    description: 'Interactive applications',
    items: [
      { id: 'circuit-runner', label: 'Quantum Circuits', path: '/circuit-runner', desc: 'Build & simulate' },
      { id: 'dna-computer', label: 'DNA Computer', path: '/dna-computer', desc: 'Bioinformatics' },
      { id: 'symbolic', label: 'Symbolic AI', path: '/symbolic', desc: 'Symbol reasoning' },
      { id: 'chat', label: 'Aleph Chat', path: '/chat', desc: 'AI assistant' },
      { id: 'enochian', label: 'Enochian', path: '/enochian', desc: 'Language model' },
      { id: 'ai', label: 'AI Integration', path: '/ai', desc: 'ML examples' },
      { id: 'ml', label: 'ML Demos', path: '/ml', desc: 'Neural networks' },
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
                  
                  {openDropdown === group.label && (
                    <div 
                      className="absolute top-full left-0 mt-1 py-2 min-w-[220px] rounded-xl border border-border bg-background/95 backdrop-blur-xl shadow-xl"
                      onMouseEnter={() => handleMouseEnter(group.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-xs font-medium text-muted-foreground">{group.description}</p>
                      </div>
                      {group.items.map(item => (
                        <Link
                          key={item.id}
                          to={item.path}
                          className={`
                            flex items-center justify-between px-3 py-2 mx-1 rounded-lg text-sm transition-all
                            ${location.pathname === item.path 
                              ? 'text-primary bg-primary/10' 
                              : 'text-foreground hover:bg-secondary'
                            }
                          `}
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-muted-foreground">{item.desc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
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
              href="https://github.com/aleph-ai/tinyaleph"
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
      {isOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-6">
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
                  href="https://github.com/aleph-ai/tinyaleph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  GitHub <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
