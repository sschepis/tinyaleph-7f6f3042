import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import PageBreadcrumb from './PageBreadcrumb';

interface LayoutProps {
  children: ReactNode;
}

// Pages that are full-app experiences and don't need the standard footer
const FULL_APP_PAGES = ['/sentient-observer', '/symbolic-mind', '/dna-computer', '/quantum-circuit', '/jam-partner', '/consciousness-resonator', '/sephirotic-oscillator', '/prime-resonance', '/quantum-wavefunction', '/entanglement-lab', '/bb84', '/grover-search'];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isFullAppPage = FULL_APP_PAGES.some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      {!isHomePage && !isFullAppPage && <PageBreadcrumb />}
      <main className={`flex-1 ${isHomePage ? 'pt-16' : ''} ${isFullAppPage ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!isFullAppPage && <Footer />}
    </div>
  );
};

export default Layout;
