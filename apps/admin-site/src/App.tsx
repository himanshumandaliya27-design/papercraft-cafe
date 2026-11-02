import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  StaffUser,
  CAFE_CONFIG,
  cafeStore,
  playOrderAlertChime,
  unlockAudioContext,
  isProductionMode,
  isDemoMode,
  isFirebaseConfigured,
  MissingConfigScreen,
} from '@atelier/shared';

import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { KitchenDisplaySystem } from './components/KitchenDisplaySystem';
import { OpeningCashFloatModal } from './components/OpeningCashFloatModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { AdminNotification } from './components/NotificationCenter';
import { SetupWizardModal } from './components/SetupWizardModal';

const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const LiveOrdersPage = React.lazy(() => import('./pages/LiveOrdersPage').then((m) => ({ default: m.LiveOrdersPage })));
const BookingsPage = React.lazy(() => import('./pages/BookingsPage').then((m) => ({ default: m.BookingsPage })));
const TablesPage = React.lazy(() => import('./pages/TablesPage').then((m) => ({ default: m.TablesPage })));
const BillsPage = React.lazy(() => import('./pages/BillsPage').then((m) => ({ default: m.BillsPage })));
const TopBillsPage = React.lazy(() => import('./pages/TopBillsPage').then((m) => ({ default: m.TopBillsPage })));
const CustomersPage = React.lazy(() => import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const CustomerProfilePage = React.lazy(() => import('./pages/CustomerProfilePage').then((m) => ({ default: m.CustomerProfilePage })));
const MenuManagerPage = React.lazy(() => import('./pages/MenuManagerPage').then((m) => ({ default: m.MenuManagerPage })));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const StaffPage = React.lazy(() => import('./pages/StaffPage').then((m) => ({ default: m.StaffPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AccessDeniedPage = React.lazy(() => import('./pages/AccessDeniedPage').then((m) => ({ default: m.AccessDeniedPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export function AdminApp() {
  const location = useLocation();
  const navigate = useNavigate();

  // If in production mode but Firebase is not configured, show clear configuration error
  if (isProductionMode() && !isFirebaseConfigured) {
    return <MissingConfigScreen siteName="Admin POS & Management" siteType="admin" />;
  }

  // Current logged in staff
  const [currentStaff, setCurrentStaff] = useState<StaffUser | null>(() =>
    cafeStore.getCurrentStaff()
  );

  // Sidebar collapsed state (remembered in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atelier_admin_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isKDSOpen, setIsKDSOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Master switches
  const [acceptingOrders, setAcceptingOrders] = useState<boolean>(
    CAFE_CONFIG.acceptingOrders
  );
  const [acceptingBookings, setAcceptingBookings] = useState<boolean>(
    CAFE_CONFIG.acceptingBookings
  );

  // Opening Cash Float Prompt on First Login of the Day
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [isOpeningFloatModalOpen, setIsOpeningFloatModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const prompted = localStorage.getItem(`atelier_opening_float_prompted_${todayDateStr}`);
      return !prompted;
    }
    return false;
  });

  // Active uncompleted orders count
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [newOrdersCount, setNewOrdersCount] = useState<number>(() => {
    return cafeStore.getOrders().filter((o) => o.status === 'received').length;
  });

  // In-App Activity Notifications Center
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('atelier_admin_notifications');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  });

  // Setup Wizard automatic prompt for owner on first login
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('atelier_setup_wizard_completed');
      return !completed;
    }
    return false;
  });

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('atelier_admin_notifications', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      if (typeof window !== 'undefined') {
        localStorage.setItem('atelier_admin_notifications', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('atelier_admin_notifications');
    }
  };

  // Listen to live alerts emitted by FirestoreService
  useEffect(() => {
    const handleLiveAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      const newNotif: AdminNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: detail.type || 'order',
        title: detail.title || 'Live Activity Alert',
        message: detail.message || '',
        timestamp: new Date().toISOString(),
        read: false,
        targetId: detail.targetId,
        targetRoute: detail.targetRoute,
      };

      setNotifications((prev) => {
        const next = [newNotif, ...prev].slice(0, 50);
        if (typeof window !== 'undefined') {
          localStorage.setItem('atelier_admin_notifications', JSON.stringify(next));
        }
        return next;
      });
    };

    window.addEventListener('atelier:live_alert', handleLiveAlert);
    return () => window.removeEventListener('atelier:live_alert', handleLiveAlert);
  }, []);

  // Background Page Title Flashing for new orders
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    let intervalId: any = null;
    const originalTitle = 'Atelier Vélin — Papercraft POS & Cafe Admin';

    if (unreadCount > 0 && typeof document !== 'undefined') {
      let altState = false;
      intervalId = setInterval(() => {
        if (document.hidden) {
          document.title = altState
            ? `(${unreadCount}) New Order — Atelier Vélin`
            : originalTitle;
          altState = !altState;
        } else {
          document.title = originalTitle;
        }
      }, 1200);
    } else if (typeof document !== 'undefined') {
      document.title = originalTitle;
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.title = originalTitle;
      }
    };
  }, [notifications]);

  // Audio Context Unlock on First User Click/Keypress
  useEffect(() => {
    const handleUserGesture = () => {
      unlockAudioContext();
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
    window.addEventListener('click', handleUserGesture);
    window.addEventListener('keydown', handleUserGesture);
    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, []);

  useEffect(() => {
    const unsub = cafeStore.subscribe(() => {
      setCurrentStaff(cafeStore.getCurrentStaff());
      const unserved = cafeStore
        .getOrders()
        .filter((o) => o.status === 'received').length;
      setNewOrdersCount((prev) => {
        if (unserved > prev) {
          setLiveAnnouncement(`New order alert: ${unserved} orders awaiting preparation.`);
        }
        return unserved;
      });
    });
    return unsub;
  }, []);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('atelier_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleToggleAcceptingOrders = () => {
    setAcceptingOrders((prev) => {
      const next = !prev;
      CAFE_CONFIG.acceptingOrders = next;
      return next;
    });
  };

  const handleToggleAcceptingBookings = () => {
    setAcceptingBookings((prev) => {
      const next = !prev;
      CAFE_CONFIG.acceptingBookings = next;
      return next;
    });
  };

  const handleLogout = () => {
    cafeStore.setCurrentStaff(null);
    setCurrentStaff(null);
    navigate('/login');
  };

  // Auto-logout after configurable idle time (15 minutes of inactivity)
  useEffect(() => {
    if (!currentStaff) return;

    let idleTimer: ReturnType<typeof setTimeout>;
    const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        handleLogout();
      }, IDLE_TIMEOUT_MS);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [currentStaff]);

  // Route titles
  const getPageTitle = (path: string): string => {
    if (path.startsWith('/dashboard')) return 'Daily Counter Dashboard';
    if (path.startsWith('/orders')) return 'Live Kitchen & Bar Kanban';
    if (path.startsWith('/bookings')) return 'Table Reservations & Calendar';
    if (path.startsWith('/tables')) return 'Floor Plan & Standee QR Codes';
    if (path.startsWith('/bills')) return 'Invoicing & GST Receipts';
    if (path.startsWith('/top-bills')) return 'Highest Paid Bills Leaderboard';
    if (path.startsWith('/customers')) return 'Guest CRM Database';
    if (path.startsWith('/menu-manager')) return 'Menu Catalog & Stock (86)';
    if (path.startsWith('/reports')) return 'Day Closing & Tax Audit';
    if (path.startsWith('/staff')) return 'Staff Access & Activity Logs';
    if (path.startsWith('/settings')) return 'Owner System Settings';
    return 'Cafe Management Suite';
  };

  // Scroll to top, update document title, and persist active tab
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${getPageTitle(location.pathname)} · Operations Portal`;
    if (currentStaff && location.pathname !== '/login' && location.pathname !== '/access-denied') {
      localStorage.setItem(`atelier_admin_last_tab_${currentStaff.id}`, location.pathname);
    }
  }, [location.pathname, currentStaff]);

  // Global Admin Speed Keyboard Shortcuts (N, D, B, T, K, /, ?)
  useEffect(() => {
    if (!currentStaff) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if (e.key === 'Escape') {
        setIsShortcutsModalOpen(false);
        setIsKDSOpen(false);
        setIsMobileSidebarOpen(false);
        return;
      }

      if (isInput) return;

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="text"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'n' || e.key === 'N') {
        navigate('/orders');
      } else if (e.key === 'd' || e.key === 'D') {
        if (currentStaff.role === 'manager' || currentStaff.role === 'owner') {
          navigate('/dashboard');
        }
      } else if (e.key === 'b' || e.key === 'B') {
        if (currentStaff.role === 'manager' || currentStaff.role === 'owner') {
          navigate('/bills');
        }
      } else if (e.key === 't' || e.key === 'T') {
        navigate('/tables');
      } else if (e.key === 'k' || e.key === 'K') {
        setIsKDSOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStaff, navigate]);

  // Protected Route Guard with RBAC
  const ProtectedRoute = ({
    children,
    minRole,
  }: {
    children: React.ReactNode;
    minRole: 'staff' | 'manager' | 'owner';
  }) => {
    if (!currentStaff) {
      return <Navigate to="/login" replace />;
    }

    if (minRole === 'owner' && currentStaff.role !== 'owner') {
      return <Navigate to="/access-denied" replace />;
    }

    if (
      minRole === 'manager' &&
      currentStaff.role !== 'owner' &&
      currentStaff.role !== 'manager'
    ) {
      return <Navigate to="/access-denied" replace />;
    }

    return <>{children}</>;
  };

  // If not authenticated, show login page
  if (!currentStaff) {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-[100dvh] bg-[#F4EBDD] flex items-center justify-center p-4">
            <div className="paper-sheet paper-grain p-8 border border-[#B98A5E]/40 text-xs font-serif-display text-[#4A372F] animate-pulse">
              Loading authentication clearance...
            </div>
          </div>
        }
      >
        <LoginPage
          onLoginSuccess={(staffUser) => {
            setCurrentStaff(staffUser);
            const prompted = localStorage.getItem(`atelier_opening_float_prompted_${todayDateStr}`);
            if (!prompted) {
              setIsOpeningFloatModalOpen(true);
            }
            const rememberedTab = localStorage.getItem(`atelier_admin_last_tab_${staffUser.id}`);
            const targetRoute = rememberedTab || (staffUser.role === 'staff' ? '/orders' : '/dashboard');
            navigate(targetRoute);
          }}
        />
      </React.Suspense>
    );
  }

  return (
    <div
      className={`min-h-[100dvh] flex ${
        isDarkMode ? 'dark bg-[#19120E] text-[#FAF5EC]' : 'bg-[#F4EBDD] text-[#2B1B14]'
      } paper-grain transition-colors duration-200`}
    >
      {/* Accessibility Skip Link */}
      <a
        href="#main-admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2B1B14] focus:text-[#FAF5EC] focus:font-mono focus:text-xs focus:ring-2 focus:ring-[#C65D3B] focus:outline-hidden"
      >
        Skip to administrative content
      </a>

      {/* Screen Reader Live Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Collapsible Sidebar */}
      <AdminSidebar
        currentStaff={currentStaff}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Permanent Demo Ribbon */}
        {isDemoMode() && (
          <div className="bg-[#E5B358] text-[#2B1B14] px-4 py-1 text-center text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2B1B14]" />
            <span>★ DEMO DATA MODE — Running in Local Sandbox ★</span>
          </div>
        )}

        <AdminHeader
          currentStaff={currentStaff}
          pageTitle={getPageTitle(location.pathname)}
          newOrdersCount={newOrdersCount}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenKDS={() => setIsKDSOpen(true)}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
          acceptingOrders={acceptingOrders}
          onToggleAcceptingOrders={handleToggleAcceptingOrders}
          acceptingBookings={acceptingBookings}
          onToggleAcceptingBookings={handleToggleAcceptingBookings}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onMarkAsRead={handleMarkNotificationAsRead}
          onClearNotifications={handleClearNotifications}
        />

        <main id="main-admin-content" tabIndex={-1} className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto focus:outline-hidden">
          <React.Suspense
            fallback={
              <div className="py-20 text-center">
                <div className="inline-block px-5 py-3 paper-sheet paper-grain border border-[#B98A5E]/40 text-xs font-serif-display text-[#4A372F] animate-pulse">
                  Unfolding operations ledger...
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute minRole="manager">
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders"
                element={
                  <ProtectedRoute minRole="staff">
                    <LiveOrdersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <ProtectedRoute minRole="staff">
                    <BookingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tables"
                element={
                  <ProtectedRoute minRole="staff">
                    <TablesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bills"
                element={
                  <ProtectedRoute minRole="manager">
                    <BillsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/top-bills"
                element={
                  <ProtectedRoute minRole="manager">
                    <TopBillsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customers"
                element={
                  <ProtectedRoute minRole="manager">
                    <CustomersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customers/:id"
                element={
                  <ProtectedRoute minRole="manager">
                    <CustomerProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/menu-manager"
                element={
                  <ProtectedRoute minRole="manager">
                    <MenuManagerPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute minRole="manager">
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff"
                element={
                  <ProtectedRoute minRole="owner">
                    <StaffPage currentStaff={currentStaff} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute minRole="owner">
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/access-denied" element={<AccessDeniedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>

      {/* Fullscreen Kitchen Display System Modal */}
      {isKDSOpen && <KitchenDisplaySystem onClose={() => setIsKDSOpen(false)} />}

      {/* Morning Opening Cash Float Prompt */}
      {isOpeningFloatModalOpen && currentStaff && (
        <OpeningCashFloatModal
          isOpen={isOpeningFloatModalOpen}
          onClose={() => setIsOpeningFloatModalOpen(false)}
          staffName={currentStaff.name}
        />
      )}

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* First-Time Business Setup Wizard Modal */}
      {isSetupWizardOpen && currentStaff?.role === 'owner' && (
        <SetupWizardModal
          isOpen={isSetupWizardOpen}
          onClose={() => setIsSetupWizardOpen(false)}
          onComplete={() => setIsSetupWizardOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminApp;
