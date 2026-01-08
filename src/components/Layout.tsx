import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import PageBreadcrumb from './PageBreadcrumb';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {!isHomePage && <PageBreadcrumb />}
      <main className={isHomePage ? 'pt-16' : ''}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
