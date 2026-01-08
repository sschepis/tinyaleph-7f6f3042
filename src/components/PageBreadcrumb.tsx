import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Route hierarchy mapping
const routeHierarchy: Record<string, { category: string; label: string }> = {
  // Learn
  '/docs/getting-started': { category: 'Learn', label: 'Getting Started' },
  '/docs/user-guide': { category: 'Learn', label: 'User Guide' },
  '/docs/reference': { category: 'Learn', label: 'API Reference' },
  '/docs/app-ideas': { category: 'Learn', label: 'App Ideas' },
  '/quickstart': { category: 'Learn', label: 'Quickstart Examples' },
  // Library
  '/core': { category: 'Library', label: 'Core' },
  '/backends': { category: 'Library', label: 'Backends' },
  '/engine': { category: 'Library', label: 'Engine' },
  '/semantic': { category: 'Library', label: 'Semantic' },
  '/crypto': { category: 'Library', label: 'Cryptography' },
  // Science
  '/physics': { category: 'Science', label: 'Physics' },
  '/kuramoto': { category: 'Science', label: 'Kuramoto' },
  '/quantum': { category: 'Science', label: 'Quantum' },
  '/math': { category: 'Science', label: 'Mathematics' },
  '/scientific': { category: 'Science', label: 'Scientific' },
  '/typesystem': { category: 'Science', label: 'Type System' },
  // Apps
  '/circuit-runner': { category: 'Apps', label: 'Quantum Circuits' },
  '/dna-computer': { category: 'Apps', label: 'DNA Computer' },
  '/symbolic': { category: 'Apps', label: 'Symbolic AI' },
  '/chat': { category: 'Apps', label: 'Aleph Chat' },
  '/enochian': { category: 'Apps', label: 'Enochian' },
  '/ai': { category: 'Apps', label: 'AI Integration' },
  '/ml': { category: 'Apps', label: 'ML Demos' },
};

const PageBreadcrumb = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Don't show breadcrumb on home page
  if (pathname === '/') {
    return null;
  }

  const routeInfo = routeHierarchy[pathname];

  // If route not found in hierarchy, show simple path-based breadcrumb
  if (!routeInfo) {
    const segments = pathname.split('/').filter(Boolean);
    return (
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => (
              <span key={segment} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === segments.length - 1 ? (
                    <BreadcrumbPage className="capitalize">
                      {segment.replace(/-/g, ' ')}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={`/${segments.slice(0, index + 1).join('/')}`} className="capitalize">
                        {segment.replace(/-/g, ' ')}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-muted-foreground">{routeInfo.category}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{routeInfo.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default PageBreadcrumb;
