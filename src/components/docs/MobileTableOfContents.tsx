import { useLocation, Link } from 'react-router-dom';
import { ChevronDown, BookOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { docsStructure } from './DocsSidebar';

const MobileTableOfContents = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentPage = docsStructure.find(page => page.path === currentPath);

  if (!currentPage) return null;

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
  };

  return (
    <div className="lg:hidden mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              On this page
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-md" align="start">
          <DropdownMenuLabel>{currentPage.title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {currentPage.sections.map((section) => (
            <DropdownMenuItem
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <section.icon className="w-4 h-4 text-muted-foreground" />
              {section.title}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Other pages</DropdownMenuLabel>
          {docsStructure
            .filter(page => page.path !== currentPath)
            .map((page) => (
              <DropdownMenuItem key={page.path} asChild>
                <Link to={page.path} className="cursor-pointer">
                  {page.title}
                </Link>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileTableOfContents;
