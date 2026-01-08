import { ReactNode } from 'react';
import DocsSidebar from './DocsSidebar';
import BackToTop from './BackToTop';

interface DocsLayoutProps {
  children: ReactNode;
}

const DocsLayout = ({ children }: DocsLayoutProps) => {
  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-12">
          <DocsSidebar />
          <main className="flex-1 min-w-0 max-w-4xl space-y-12">
            {children}
          </main>
        </div>
      </div>
      <BackToTop />
    </div>
  );
};

export default DocsLayout;
