import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Github, ExternalLink, Boxes, ChevronDown } from 'lucide-react';

const navGroups = [
  {
    label: 'Docs',
    items: [
      { id: 'getting-started', label: 'Getting Started', path: '/docs/getting-started' },
      { id: 'user-guide', label: 'User Guide', path: '/docs/user-guide' },
      { id: 'app-ideas', label: 'App Ideas', path: '/docs/app-ideas' },
      { id: 'reference', label: 'Reference', path: '/docs/reference' },
    ],
  },
  {
    label: 'Examples',
    items: [
      { id: 'quickstart', label: 'Quickstart', path: '/quickstart' },
      { id: 'semantic', label: 'Semantic', path: '/semantic' },
      { id: 'crypto', label: 'Crypto', path: '/crypto' },
    ],
  },
  {
    label: 'Core',
    items: [
      { id: 'core', label: 'Core', path: '/core' },
      { id: 'physics', label: 'Physics', path: '/physics' },
      { id: 'quantum', label: 'Quantum', path: '/quantum' },
      { id: 'kuramoto', label: 'Kuramoto', path: '/kuramoto' },
    ],
  },
  {
    label: 'Advanced',
    items: [
      { id: 'backends', label: 'Backends', path: '/backends' },
      { id: 'engine', label: 'Engine', path: '/engine' },
    ],
  },
  {
    label: 'Specialized',
    items: [
      { id: 'math', label: 'Math', path: '/math' },
      { id: 'ml', label: 'ML', path: '/ml' },
      { id: 'resoformer', label: 'ResoFormer', path: '/resoformer' },
      { id: 'scientific', label: 'Scientific', path: '/scientific' },
      { id: 'typesystem', label: 'Type System', path: '/typesystem' },
    ],
  },
  {
    label: 'Applications',
    items: [
      { id: 'chat', label: 'Chat', path: '/chat' },
      { id: 'enochian', label: 'Enochian', path: '/enochian' },
      { id: 'dna-computer', label: 'DNA Computer', path: '/dna-computer' },
      { id: 'symbolic', label: 'Symbolic AI', path: '/symbolic' },
      { id: 'ai', label: 'AI Integration', path: '/ai' },
      { id: 'circuit-runner', label: 'Circuit Runner', path: '/circuit-runner' },
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
            {navGroups.map(group => (
              <div key={group.label} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === group.label ? null : group.label)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1
                    ${isActiveGroup(group) 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  {group.label}
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === group.label ? 'rotate-180' : ''}`} />
                </button>
                
                {openDropdown === group.label && (
                  <div className="absolute top-full left-0 mt-1 py-2 min-w-[160px] rounded-lg border border-border bg-background/95 backdrop-blur-xl shadow-lg">
                    {group.items.map(item => (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`
                          block px-4 py-2 text-sm transition-all
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
                )}
              </div>
            ))}
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
          <div className="px-4 py-4 space-y-4">
            {navGroups.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`
                        block w-full px-4 py-2 rounded-lg text-left text-sm font-medium transition-all
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
            ))}
            
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
