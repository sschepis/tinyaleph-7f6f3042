import { ReactNode } from 'react';
import { DocsSidebar, MobileDocsSidebar } from './DocsSidebar';
import MobileTableOfContents from './MobileTableOfContents';
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
          <main className="flex-1 min-w-0 max-w-4xl">
            <MobileTableOfContents />
            <div className="space-y-12">
              {children}
            </div>
          </main>
        </div>
      </div>
      <MobileDocsSidebar />
      <BackToTop />
    </div>
  );
};

export default DocsLayout;
