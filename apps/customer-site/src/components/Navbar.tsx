import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, CalendarCheck, UtensilsCrossed, Receipt, Clock } from 'lucide-react';
import { CAFE_CONFIG } from '@atelier/shared';

interface NavbarProps {
  cartCount: number;
  lang: 'EN' | 'HI' | 'GU';
  onLangChange: (lang: 'EN' | 'HI' | 'GU') => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  lang,
  onLangChange,
  onOpenMobileMenu,
}) => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu (₹)' },
    { path: '/book', label: 'Book a Table' },
    { path: '/about', label: 'Our Story' },
    { path: '/contact', label: 'Visit Us' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F4EBDD]/95 backdrop-blur-xs border-b border-[#B98A5E]/35 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark */}
        <Link
          to="/"
          className="font-serif-display text-xl sm:text-2xl font-semibold tracking-tight text-[#2B1B14] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>{CAFE_CONFIG.cafeName}</span>
          <span className="hidden sm:inline-block text-[11px] font-sans font-normal text-[#C65D3B] uppercase tracking-wider px-1.5 py-0.5 border border-[#C65D3B]/40 bg-[#FAF5EC]">
            Roastery
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav
          aria-label="Customer Primary"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4A372F]"
        >
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#C65D3B] font-semibold underline underline-offset-4 decoration-2'
                    : 'hover:text-[#2B1B14] hover:underline underline-offset-4'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Language, Cart & My Orders */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <div
            className="flex items-center text-[11px] font-medium border border-[#B98A5E]/40 p-0.5 bg-[#FAF5EC]"
            role="group"
            aria-label="Language selector"
          >
            {(['EN', 'HI', 'GU'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onLangChange(l)}
                className={`px-1.5 py-0.5 cursor-pointer transition-colors ${
                  lang === l
                    ? 'bg-[#2B1B14] text-[#FAF5EC] font-semibold'
                    : 'text-[#4A372F] hover:text-[#2B1B14]'
                }`}
                aria-pressed={lang === l}
              >
                {l}
              </button>
            ))}
          </div>

          {/* My Orders / Guest Ticket Lookup */}
          <Link
            to="/my-orders"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4A372F] hover:text-[#2B1B14] border border-[#B98A5E]/40 bg-[#FAF5EC] hover:bg-[#E7D6BE] transition-colors whitespace-nowrap"
            title="View past orders & bookings"
          >
            <Receipt className="w-3.5 h-3.5 text-[#B98A5E]" />
            <span>My Orders</span>
          </Link>

          {/* Cart / Tray Link */}
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FAF5EC] text-[#2B1B14] border border-[#B98A5E]/60 hover:border-[#2B1B14] transition-colors whitespace-nowrap cursor-pointer shadow-xs tabular-nums"
            aria-label={`Shopping tray with ${cartCount} items`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C65D3B]" />
            <span className="hidden sm:inline">Tray</span>
            {cartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#C65D3B] text-white text-[10px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-[#4A372F] hover:text-[#2B1B14] border border-[#B98A5E]/40 bg-[#FAF5EC] hover:bg-[#E7D6BE] cursor-pointer"
            aria-label="Open mobile navigation drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
