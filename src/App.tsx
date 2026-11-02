import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Globe, Lock, ArrowRightLeft } from 'lucide-react';
const CustomerApp = React.lazy(() => import('../apps/customer-site/src/App'));
const AdminApp = React.lazy(() => import('../apps/admin-site/src/App'));

export default function App() {
  // Determine initial app: check subdomain, query param ?app=admin, path /admin, or localStorage
  const [activeApp, setActiveApp] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);

      if (hostname.startsWith('admin.') || params.get('app') === 'admin' || pathname.startsWith('/admin') || hash === '#admin') {
        return 'admin';
      }

      const stored = localStorage.getItem('atelier_preview_active_app');
      if (stored === 'admin' || stored === 'customer') {
        return stored;
      }
    }
    return 'customer';
  });

  const handleSwitchApp = (target: 'customer' | 'admin') => {
    setActiveApp(target);
    localStorage.setItem('atelier_preview_active_app', target);
    // Reset path to root of selected app
    window.history.pushState({}, '', '/');
  };

  return (
    <BrowserRouter>
      {/* Dev Switcher Bar: Enables testing both independent sites in the AI Studio environment */}
      <aside
        aria-label="App Switcher Toolbar"
        className="fixed bottom-3 right-3 z-50 bg-[#2B1B14] text-[#FAF5EC] border-2 border-[#B98A5E] shadow-2xl p-1.5 flex items-center gap-1.5 text-xs select-none"
      >
        <span className="text-[10px] font-mono text-[#E5B358] uppercase px-1.5 font-bold">
          Dual-App Mode:
        </span>
        <button
          type="button"
          onClick={() => handleSwitchApp('customer')}
          className={`px-2.5 py-1 flex items-center gap-1 transition-colors cursor-pointer ${
            activeApp === 'customer'
              ? 'bg-[#C65D3B] text-white font-bold'
              : 'text-[#FAF5EC]/70 hover:text-white'
          }`}
          title="Customer Website (cafe.com)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Customer Site</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchApp('admin')}
          className={`px-2.5 py-1 flex items-center gap-1 transition-colors cursor-pointer ${
            activeApp === 'admin'
              ? 'bg-[#C65D3B] text-white font-bold'
              : 'text-[#FAF5EC]/70 hover:text-white'
          }`}
          title="Admin & Staff Portal (admin.cafe.com)"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Admin Portal</span>
        </button>
      </aside>

      {/* Render the selected standalone application */}
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#F4EBDD] flex items-center justify-center p-4">
            <div className="paper-sheet paper-grain p-8 border border-[#B98A5E]/40 text-xs font-serif-display text-[#4A372F] tracking-wide animate-pulse">
              Unfolding Atelier Vélin...
            </div>
          </div>
        }
      >
        {activeApp === 'customer' ? <CustomerApp /> : <AdminApp />}
      </React.Suspense>
    </BrowserRouter>
  );
}
