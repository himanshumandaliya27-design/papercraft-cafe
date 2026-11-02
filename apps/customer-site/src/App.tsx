import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuItem,
  OrderItem,
  Order,
  MenuEdition,
  CAFE_CONFIG,
  cafeStore,
  isProductionMode,
  isDemoMode,
  isFirebaseConfigured,
  MissingConfigScreen,
} from '@atelier/shared';

import { Navbar } from './components/Navbar';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { FloatingCartButton } from './components/FloatingCartButton';
import { Footer } from './components/Footer';
import { OrdersPausedBanner } from './components/OrdersPausedBanner';

const HomePage = React.lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const MenuPage = React.lazy(() => import('./pages/MenuPage').then((m) => ({ default: m.MenuPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const OrderTrackerPage = React.lazy(() => import('./pages/OrderTrackerPage').then((m) => ({ default: m.OrderTrackerPage })));
const BookTablePage = React.lazy(() => import('./pages/BookTablePage').then((m) => ({ default: m.BookTablePage })));
const BookingConfirmationPage = React.lazy(() => import('./pages/BookingConfirmationPage').then((m) => ({ default: m.BookingConfirmationPage })));
const MyOrdersPage = React.lazy(() => import('./pages/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const TableQRLandingPage = React.lazy(() => import('./pages/TableQRLandingPage').then((m) => ({ default: m.TableQRLandingPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export function CustomerApp() {
  const location = useLocation();
  const navigate = useNavigate();

  // If in production mode but Firebase is not configured, show clear configuration error
  if (isProductionMode() && !isFirebaseConfigured) {
    return <MissingConfigScreen siteName="Customer Site" siteType="customer" />;
  }

  // Redirect legacy /?table=<n> query parameter to canonical /table/<n> route
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tbl = params.get('table');
    if (tbl) {
      const num = parseInt(tbl, 10);
      if (!isNaN(num) && num >= 1 && num <= 10) {
        navigate(`/table/${num}`, { replace: true });
      }
    }
  }, [location.search, navigate]);

  // Scroll to top and sync document title on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    const routeTitles: Record<string, string> = {
      '/': `${CAFE_CONFIG.cafeName} — Specialty Coffee & Paper Roastery`,
      '/menu': `Artisan Digital Menu · ${CAFE_CONFIG.cafeName}`,
      '/cart': `Tasting Tray & Checkout · ${CAFE_CONFIG.cafeName}`,
      '/book': `Reserve a Table · ${CAFE_CONFIG.cafeName}`,
      '/my-orders': `My Orders & Reorder · ${CAFE_CONFIG.cafeName}`,
      '/about': `Our Roastery Story · ${CAFE_CONFIG.cafeName}`,
      '/contact': `Visit Us & Timings · ${CAFE_CONFIG.cafeName}`,
    };
    if (location.pathname.startsWith('/order/')) {
      document.title = `Live Order Status · ${CAFE_CONFIG.cafeName}`;
    } else if (location.pathname.startsWith('/booking/')) {
      document.title = `Reservation Confirmed · ${CAFE_CONFIG.cafeName}`;
    } else if (location.pathname.startsWith('/table/')) {
      document.title = `Table Session · ${CAFE_CONFIG.cafeName}`;
    } else {
      document.title = routeTitles[location.pathname] || `${CAFE_CONFIG.cafeName} — Specialty Coffee`;
    }
  }, [location.pathname]);

  // Multi-Language Toggle
  const [lang, setLang] = useState<'EN' | 'HI' | 'GU'>('EN');

  // Mobile Menu Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scanned Table Number (from QR code URL or session)
  const [scannedTableNumber, setScannedTableNumber] = useState<number | undefined>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tbl = params.get('table');
      if (tbl) {
        const num = parseInt(tbl, 10);
        if (!isNaN(num) && num >= 1 && num <= 10) return num;
      }
      const stored = sessionStorage.getItem('atelier_table_number');
      if (stored) {
        const num = parseInt(stored, 10);
        if (!isNaN(num) && num >= 1 && num <= 10) return num;
      }
    }
    return undefined;
  });

  // Cart State (persisted in localStorage)
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('atelier_customer_cart');
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('atelier_customer_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Live Menu Items reactive from cafeStore
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => cafeStore.getMenuItems());

  useEffect(() => {
    const unsub = cafeStore.subscribe(() => {
      setMenuItems([...cafeStore.getMenuItems()]);
    });
    return unsub;
  }, []);

  // Add Item to Tray
  // Screen reader live announcements for cart actions and updates
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const handleAddToCart = (
    item: MenuItem,
    variantName?: string,
    addOns?: string[],
    notes?: string
  ) => {
    let finalPrice = item.price;
    setLiveAnnouncement(`${item.name} added to cart`);
    if (variantName && item.variants) {
      const v = item.variants.find((vr) => vr.name === variantName);
      if (v) finalPrice += v.priceDelta;
    }
    if (addOns && item.addOns) {
      addOns.forEach((addonName) => {
        const a = item.addOns?.find((ao) => ao.name === addonName);
        if (a) finalPrice += a.price;
      });
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.menuItemId === item.id &&
          i.selectedVariant === variantName &&
          JSON.stringify(i.selectedAddOns || []) === JSON.stringify(addOns || [])
      );

      if (existing) {
        return prev.map((i) =>
          i === existing
            ? { ...i, quantity: i.quantity + 1, itemTotal: (i.quantity + 1) * finalPrice }
            : i
        );
      }

      const newItem: OrderItem = {
        id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: item.id,
        name: item.name,
        quantity: 1,
        basePrice: finalPrice,
        selectedVariant: variantName,
        selectedAddOns: addOns,
        notes,
        itemTotal: finalPrice,
      };
      return [...prev, newItem];
    });
  };

  const handleAddSignatureEditionToCart = (edition: MenuEdition) => {
    // Map MenuEdition to OrderItem
    const newItem: OrderItem = {
      id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: edition.id,
      name: edition.name,
      quantity: 1,
      basePrice: edition.price,
      notes: edition.editionNumber,
      itemTotal: edition.price,
    };

    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === edition.id);
      if (existing) {
        return prev.map((i) =>
          i === existing
            ? { ...i, quantity: i.quantity + 1, itemTotal: (i.quantity + 1) * edition.price }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const handleUpdateCartQty = (orderItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === orderItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * item.basePrice,
            };
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveCartItem = (orderItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== orderItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleReorder = (order: Order) => {
    setCartItems((prev) => [...prev, ...order.items]);
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, i) => acc + i.itemTotal, 0);

  return (
    <div className="min-h-screen bg-[#F4EBDD] text-[#2B1B14] paper-grain flex flex-col justify-between selection:bg-[#B98A5E]/30 selection:text-[#2B1B14]">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2B1B14] focus:text-[#FAF5EC] focus:font-mono focus:text-xs focus:ring-2 focus:ring-[#C65D3B] focus:outline-hidden"
      >
        Skip to main content
      </a>

      {/* Screen Reader Live Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <div>
        {/* Table QR Active Banner if scanned */}
        {scannedTableNumber && (
          <div className="bg-[#FAF5EC] border-b-2 border-[#B98A5E]/60 px-4 py-2 text-xs flex items-center justify-between text-[#2B1B14] shadow-xs">
            <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse" />
                <span className="font-serif-display font-bold text-sm text-[#2B1B14]">
                  You are ordering for Table {scannedTableNumber}
                </span>
                <span className="text-[11px] text-[#6B5A4E] font-mono hidden md:inline">
                  (Dine-In Session)
                </span>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    const promptVal = window.prompt('Enter new table number (1-10):', String(scannedTableNumber));
                    if (promptVal) {
                      const num = parseInt(promptVal, 10);
                      if (!isNaN(num) && num > 0 && num <= 10) {
                        setScannedTableNumber(num);
                        sessionStorage.setItem('atelier_table_number', String(num));
                      }
                    }
                  }}
                  className="text-xs font-mono font-semibold text-[#C65D3B] hover:text-[#2B1B14] underline cursor-pointer"
                >
                  Change Table
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScannedTableNumber(undefined);
                    sessionStorage.removeItem('atelier_table_number');
                  }}
                  className="text-xs font-mono text-[#8C7A70] hover:text-[#2B1B14] cursor-pointer"
                >
                  Switch to Takeaway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Demo Mode Notice Banner if running in demo mode */}
        {isDemoMode() && (
          <div className="bg-[#E5B358] text-[#2B1B14] px-4 py-1 text-center text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2B1B14]" />
            <span>★ DEMO DATA MODE — Running in Local Sandbox ★</span>
          </div>
        )}

        {/* Master Switch: Orders Paused Banner */}
        {!CAFE_CONFIG.acceptingOrders && <OrdersPausedBanner />}

        {/* Top Navbar */}
        <Navbar
          cartCount={totalCartCount}
          lang={lang}
          onLangChange={setLang}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Main Routed Content */}
        <main id="main-content" tabIndex={-1} className="focus:outline-hidden">
          <React.Suspense
            fallback={
              <div className="py-24 text-center">
                <div className="inline-block px-6 py-4 paper-sheet paper-grain border border-[#B98A5E]/40 text-xs font-serif-display text-[#4A372F] tracking-wide animate-pulse">
                  Unfolding tactile paper page...
                </div>
              </div>
            }
          >
            <Routes>
              <Route
                path="/"
                element={<HomePage onAddToCart={handleAddSignatureEditionToCart} />}
              />
              <Route
                path="/menu"
                element={
                  <MenuPage
                    menuItems={menuItems}
                    cartItems={cartItems}
                    onAddToCart={handleAddToCart}
                    onOpenCart={() => {}}
                  />
                }
              />
              <Route
                path="/cart"
                element={
                  <CartPage
                    cartItems={cartItems}
                    onUpdateQty={handleUpdateCartQty}
                    onRemoveItem={handleRemoveCartItem}
                    onClearCart={handleClearCart}
                    tableNumberFromUrl={scannedTableNumber}
                  />
                }
              />
              <Route path="/order/:orderId" element={<OrderTrackerPage />} />
              <Route path="/book" element={<BookTablePage />} />
              <Route path="/booking/:bookingId" element={<BookingConfirmationPage />} />
              <Route
                path="/my-orders"
                element={<MyOrdersPage onReorder={handleReorder} />}
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/table/:tableNumber"
                element={
                  <TableQRLandingPage
                    onTableDetected={(num) => setScannedTableNumber(num)}
                  />
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Slide-in Navigation Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        cartCount={totalCartCount}
      />

      {/* Mobile Floating Cart Trigger */}
      <FloatingCartButton
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
      />
    </div>
  );
}

export default CustomerApp;
