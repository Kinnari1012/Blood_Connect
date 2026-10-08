import React from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../store/AuthContext';

interface PageLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageLayout({ children, showNav = true, title, subtitle, actions }: PageLayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="h-[100dvh] w-full flex bg-gray-50 overflow-hidden" style={{ backgroundColor: 'var(--c-background)' }}>
      {/* Desktop Sidebar */}
      {isAuthenticated && showNav && <Sidebar />}

      {/* Main content area */}
      <div className={`flex-1 min-w-0 flex flex-col ${isAuthenticated ? 'pb-20 lg:pb-0' : ''}`}>
        
        {/* Top Header */}
        {isAuthenticated && showNav && <TopHeader />}

        {/* Page body */}
        <main className="flex-1 overflow-auto px-4 pt-4 pb-6 md:px-6 md:pt-6 md:pb-8 flex flex-col gap-6">
          <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6">
            {(title || actions) && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  {title && <h1 className="text-2xl font-black text-gray-900">{title}</h1>}
                  {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex-shrink-0">{actions}</div>}
              </div>
            )}
            <div className="flex flex-col gap-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && showNav && <BottomNav />}
    </div>
  );
}
