import React, { ReactNode } from 'react';
import '../styles/layout.css';

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <div className="layout">
      {title && (
        <header className="layout-header">
          <h1>{title}</h1>
        </header>
      )}
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
