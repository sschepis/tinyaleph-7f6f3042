import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import BackToTop from '@/components/docs/BackToTop';
import { 
  BookOpen, Atom, Brain, Dna, Calculator, Sparkles, 
  ChevronRight, ChevronDown, Menu, FileText
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Documentation structure matching ./docs folder
const docsTree = [
  {
    id: '01-foundations',
    title: 'Foundations',
    icon: BookOpen,
    files: [
      { id: 'prime-semantics', title: 'Prime Semantics' },
      { id: 'wave-interference', title: 'Wave Interference' },
      { id: 'entropy-dynamics', title: 'Entropy Dynamics' },
    ],
  },
  {
    id: '02-mathematics',
    title: 'Mathematics',
    icon: Calculator,
    files: [
      { id: 'high-dimensional-algebra', title: 'High-Dimensional Algebra' },
      { id: 'crt-homology', title: 'CRT Homology' },
      { id: 'prime-number-theory', title: 'Prime Number Theory' },
    ],
  },
  {
    id: '03-physics',
    title: 'Physics',
    icon: Atom,
    files: [
      { id: 'kuramoto-synchronization', title: 'Kuramoto Synchronization' },
      { id: 'quantum-collapse-models', title: 'Quantum Collapse Models' },
      { id: 'resonance-networks', title: 'Resonance Networks' },
    ],
  },
  {
    id: '04-symbolic-ai',
    title: 'Symbolic AI',
    icon: Brain,
    files: [
      { id: 'archetypal-databases', title: 'Archetypal Databases' },
      { id: 'concept-derivation', title: 'Concept Derivation' },
      { id: 'semantic-inference', title: 'Semantic Inference' },
    ],
  },
  {
    id: '05-bioinformatics',
    title: 'Bioinformatics',
    icon: Dna,
    files: [
      { id: 'dna-encoding', title: 'DNA Encoding' },
      { id: 'central-dogma', title: 'Central Dogma' },
      { id: 'protein-folding', title: 'Protein Folding' },
    ],
  },
  {
    id: '06-applications',
    title: 'Applications',
    icon: Sparkles,
    files: [
      { id: 'sentient-observer', title: 'Sentient Observer' },
      { id: 'consciousness-resonator', title: 'Consciousness Resonator' },
      { id: 'sephirotic-oscillator', title: 'Sephirotic Oscillator' },
      { id: 'prime-resonance', title: 'Prime Resonance' },
      { id: 'quantum-wavefunction', title: 'Quantum Wavefunction' },
    ],
  },
];

// Markdown file imports - we'll fetch these dynamically
const markdownFiles: Record<string, () => Promise<string>> = {
  // Foundations
  '01-foundations/prime-semantics': () => import('../../../docs/01-foundations/prime-semantics.md?raw').then(m => m.default),
  '01-foundations/wave-interference': () => import('../../../docs/01-foundations/wave-interference.md?raw').then(m => m.default),
  '01-foundations/entropy-dynamics': () => import('../../../docs/01-foundations/entropy-dynamics.md?raw').then(m => m.default),
  // Mathematics
  '02-mathematics/high-dimensional-algebra': () => import('../../../docs/02-mathematics/high-dimensional-algebra.md?raw').then(m => m.default),
  '02-mathematics/crt-homology': () => import('../../../docs/02-mathematics/crt-homology.md?raw').then(m => m.default),
  '02-mathematics/prime-number-theory': () => import('../../../docs/02-mathematics/prime-number-theory.md?raw').then(m => m.default),
  // Physics
  '03-physics/kuramoto-synchronization': () => import('../../../docs/03-physics/kuramoto-synchronization.md?raw').then(m => m.default),
  '03-physics/quantum-collapse-models': () => import('../../../docs/03-physics/quantum-collapse-models.md?raw').then(m => m.default),
  '03-physics/resonance-networks': () => import('../../../docs/03-physics/resonance-networks.md?raw').then(m => m.default),
  // Symbolic AI
  '04-symbolic-ai/archetypal-databases': () => import('../../../docs/04-symbolic-ai/archetypal-databases.md?raw').then(m => m.default),
  '04-symbolic-ai/concept-derivation': () => import('../../../docs/04-symbolic-ai/concept-derivation.md?raw').then(m => m.default),
  '04-symbolic-ai/semantic-inference': () => import('../../../docs/04-symbolic-ai/semantic-inference.md?raw').then(m => m.default),
  // Bioinformatics
  '05-bioinformatics/dna-encoding': () => import('../../../docs/05-bioinformatics/dna-encoding.md?raw').then(m => m.default),
  '05-bioinformatics/central-dogma': () => import('../../../docs/05-bioinformatics/central-dogma.md?raw').then(m => m.default),
  '05-bioinformatics/protein-folding': () => import('../../../docs/05-bioinformatics/protein-folding.md?raw').then(m => m.default),
  // Applications
  '06-applications/sentient-observer': () => import('../../../docs/06-applications/sentient-observer.md?raw').then(m => m.default),
  '06-applications/consciousness-resonator': () => import('../../../docs/06-applications/consciousness-resonator.md?raw').then(m => m.default),
  '06-applications/sephirotic-oscillator': () => import('../../../docs/06-applications/sephirotic-oscillator.md?raw').then(m => m.default),
  '06-applications/prime-resonance': () => import('../../../docs/06-applications/prime-resonance.md?raw').then(m => m.default),
  '06-applications/quantum-wavefunction': () => import('../../../docs/06-applications/quantum-wavefunction.md?raw').then(m => m.default),
};

interface SidebarContentProps {
  currentSection?: string;
  currentFile?: string;
  onNavigate?: () => void;
}

const SidebarContent = ({ currentSection, currentFile, onNavigate }: SidebarContentProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    currentSection ? [currentSection] : ['01-foundations']
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Concept Documentation
      </div>
      
      {docsTree.map((section) => {
        const isExpanded = expandedSections.includes(section.id);
        const isCurrentSection = currentSection === section.id;
        const Icon = section.icon;
        
        return (
          <div key={section.id} className="space-y-1">
            <button
              onClick={() => toggleSection(section.id)}
              className={cn(
                "flex items-center gap-2 w-full text-left text-sm font-medium transition-colors py-1.5 px-2 rounded-md",
                isCurrentSection 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{section.title}</span>
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            
            {isExpanded && (
              <nav className="pl-6 space-y-0.5">
                {section.files.map((file) => {
                  const isActive = currentSection === section.id && currentFile === file.id;
                  return (
                    <Link
                      key={file.id}
                      to={`/docs/concepts/${section.id}/${file.id}`}
                      onClick={onNavigate}
                      className={cn(
                        "block text-sm py-1 px-2 rounded transition-colors",
                        isActive 
                          ? "text-primary bg-primary/5 font-medium" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      {file.title}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ConceptDocs = () => {
  const { section, file } = useParams<{ section?: string; file?: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Default to first doc if no params
  const currentSection = section || '01-foundations';
  const currentFile = file || 'prime-semantics';
  const docKey = `${currentSection}/${currentFile}`;

  useEffect(() => {
    // Redirect to default if at base path
    if (!section || !file) {
      navigate('/docs/concepts/01-foundations/prime-semantics', { replace: true });
      return;
    }

    const loadContent = async () => {
      setLoading(true);
      try {
        const loader = markdownFiles[docKey];
        if (loader) {
          const md = await loader();
          setContent(md);
        } else {
          setContent(`# Document Not Found\n\nThe document \`${docKey}\` could not be found.`);
        }
      } catch (error) {
        console.error('Failed to load doc:', error);
        setContent(`# Error Loading Document\n\nFailed to load \`${docKey}\`.`);
      }
      setLoading(false);
    };

    loadContent();
  }, [docKey, section, file, navigate]);

  // Find current doc info for breadcrumb
  const currentSectionInfo = docsTree.find(s => s.id === currentSection);
  const currentFileInfo = currentSectionInfo?.files.find(f => f.id === currentFile);

  // Get prev/next navigation
  const allDocs = useMemo(() => {
    const docs: { section: string; file: string; title: string }[] = [];
    docsTree.forEach(section => {
      section.files.forEach(file => {
        docs.push({ section: section.id, file: file.id, title: file.title });
      });
    });
    return docs;
  }, []);

  const currentIndex = allDocs.findIndex(d => d.section === currentSection && d.file === currentFile);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <SidebarContent 
                  currentSection={currentSection} 
                  currentFile={currentFile} 
                />
              </ScrollArea>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/docs/getting-started" className="hover:text-foreground transition-colors">
                Docs
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground">{currentSectionInfo?.title}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{currentFileInfo?.title}</span>
            </nav>

            {/* Content */}
            <div className="bg-card/30 rounded-xl border border-border/50 p-6 md:p-8">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <MarkdownRenderer 
                  content={content} 
                  className="prose-headings:scroll-mt-24"
                />
              )}
            </div>

            {/* Prev/Next Navigation */}
            <div className="flex justify-between items-center mt-8 gap-4">
              {prevDoc ? (
                <Link
                  to={`/docs/concepts/${prevDoc.section}/${prevDoc.file}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                  <span>{prevDoc.title}</span>
                </Link>
              ) : <div />}
              
              {nextDoc ? (
                <Link
                  to={`/docs/concepts/${nextDoc.section}/${nextDoc.file}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span>{nextDoc.title}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : <div />}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed bottom-20 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pt-12">
            <ScrollArea className="h-full">
              <SidebarContent 
                currentSection={currentSection} 
                currentFile={currentFile}
                onNavigate={() => setMobileOpen(false)}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <BackToTop />
    </div>
  );
};

export default ConceptDocs;
