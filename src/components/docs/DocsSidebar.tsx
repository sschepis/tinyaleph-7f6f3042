import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BookOpen, Zap, Package, Lightbulb, Code2, FileText, 
  Brain, Atom, Dna, Calculator, ChevronRight, Menu, X
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
}

interface DocsPage {
  path: string;
  title: string;
  sections: DocSection[];
}

const docsStructure: DocsPage[] = [
  {
    path: '/docs/getting-started',
    title: 'Getting Started',
    sections: [
      { id: 'installation', title: 'Installation', icon: Package },
      { id: 'quick-start', title: 'Quick Start', icon: Zap },
      { id: 'core-concepts', title: 'Core Concepts', icon: BookOpen },
      { id: 'next-steps', title: 'Next Steps', icon: ChevronRight },
    ],
  },
  {
    path: '/docs/user-guide',
    title: 'User Guide',
    sections: [
      { id: 'backends', title: 'Working with Backends', icon: Code2 },
      { id: 'semantic-ops', title: 'Semantic Operations', icon: Brain },
      { id: 'oscillators', title: 'Oscillator Networks', icon: Atom },
      { id: 'entropy', title: 'Entropy & Energy', icon: Zap },
      { id: 'best-practices', title: 'Best Practices', icon: Lightbulb },
    ],
  },
  {
    path: '/docs/app-ideas',
    title: 'App Ideas',
    sections: [
      { id: 'ai-ml', title: 'AI & Machine Learning', icon: Brain },
      { id: 'quantum', title: 'Quantum Computing', icon: Atom },
      { id: 'bioinformatics', title: 'Bioinformatics', icon: Dna },
      { id: 'mathematics', title: 'Mathematics & Physics', icon: Calculator },
    ],
  },
  {
    path: '/docs/reference',
    title: 'API Reference',
    sections: [
      { id: 'quick-reference', title: 'Quick Reference', icon: FileText },
      { id: 'aleph-engine', title: 'AlephEngine', icon: Code2 },
      { id: 'backend', title: 'Backend Interface', icon: Code2 },
      { id: 'types', title: 'Type Definitions', icon: FileText },
      { id: 'constants', title: 'Constants', icon: FileText },
    ],
  },
];

interface SidebarContentProps {
  onSectionClick?: () => void;
}

const SidebarContent = ({ onSectionClick }: SidebarContentProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
    onSectionClick?.();
  };

  return (
    <div className="space-y-6">
      <div className="text-sm font-semibold text-foreground mb-4">Documentation</div>
      
      {docsStructure.map((page) => {
        const isCurrentPage = currentPath === page.path;
        
        return (
          <div key={page.path} className="space-y-2">
            <Link
              to={page.path}
              onClick={onSectionClick}
              className={cn(
                "block text-sm font-medium transition-colors",
                isCurrentPage ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {page.title}
            </Link>
            
            {isCurrentPage && (
              <nav className="pl-3 border-l border-border space-y-1">
                {page.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="flex items-center gap-2 w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    <section.icon className="w-3.5 h-3.5" />
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Desktop sidebar
const DocsSidebar = () => {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24">
        <SidebarContent />
      </div>
    </aside>
  );
};

// Mobile sidebar trigger and sheet
const MobileDocsSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-20 left-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 pt-12">
          <SidebarContent onSectionClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export { DocsSidebar, MobileDocsSidebar };
export default DocsSidebar;
