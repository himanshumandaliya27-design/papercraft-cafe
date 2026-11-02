import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Coffee, Calendar, ShoppingBag, Receipt, MapPin, Compass } from 'lucide-react';
import { CAFE_CONFIG, useFocusTrap } from '@atelier/shared';
import { WashiTape } from './PaperElements';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  cartCount,
}) => {
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Trap focus and restore focus on close
  useFocusTrap(isOpen, drawerRef, onClose);

  if (!isOpen) return null;

  const links = [
    { path: '/', label: 'Home Page', icon: Coffee, desc: 'Roastery & fresh bakes' },
    { path: '/menu', label: 'Full Digital Menu (₹)', icon: ShoppingBag, desc: 'Order direct to table or takeaway' },
    { path: '/book', label: 'Book a Table', icon: Calendar, desc: 'Courtyard & linen seating' },
    { path: '/my-orders', label: 'My Orders & Bookings', icon: Receipt, desc: 'Check past tickets & receipts' },
    { path: '/about', label: 'Our Story', icon: Compass, desc: 'Old Quarter heritage & micro-lots' },
    { path: '/contact', label: 'Visit Us & Timings', icon: MapPin, desc: 'Map, hours, direct contact' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#2B1B14]/65 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs bg-[#FAF5EC] h-full paper-grain shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#B98A5E]/40 p-6 relative animate-in slide-in-from-right duration-200"
      >
        <WashiTape variant="terracotta" position="top-center" label="Navigation Ledger" />

        {/* Drawer Header */}
        <div className="pt-3 pb-4 border-b border-[#B98A5E]/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#4A372F] uppercase tracking-wider font-mono">
              Atelier Vélin
            </span>
            <h2 className="font-serif-display text-xl font-bold text-[#2B1B14]">
              House Directory
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#4A372F] hover:text-[#2B1B14] hover:bg-[#E7D6BE] cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Mobile Directory" className="py-6 space-y-2 flex-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-start gap-3 p-3 border transition-colors ${
                  isActive
                    ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14] shadow-xs'
                    : 'bg-[#F4EBDD]/60 hover:bg-[#F4EBDD] text-[#2B1B14] border-[#B98A5E]/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    isActive ? 'text-[#C65D3B]' : 'text-[#B98A5E]'
                  }`}
                />
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isActive ? 'text-[#FAF5EC]/70' : 'text-[#4A372F]'
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Cart Action & Hours */}
        <div className="pt-4 border-t border-[#B98A5E]/30 space-y-3">
          <Link
            to="/cart"
            className="w-full py-3 bg-[#C65D3B] text-[#FAF5EC] font-serif-display font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#b24f2f] transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open Tray ({cartCount})</span>
          </Link>

          <div className="text-[11px] text-[#4A372F] text-center space-y-0.5">
            <p className="font-semibold text-[#2B1B14]">{CAFE_CONFIG.address}</p>
            <p>Tue–Sun: 07:30 AM – 07:30 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};
