import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatINR } from '@atelier/shared';

interface FloatingCartButtonProps {
  cartCount: number;
  cartTotal: number;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  cartCount,
  cartTotal,
}) => {
  const location = useLocation();

  // Don't show floating button on the cart page itself
  if (cartCount === 0 || location.pathname === '/cart') {
    return null;
  }

  return (
    <aside aria-label="Floating Cart Quick Access" className="md:hidden fixed bottom-5 left-4 right-4 z-40">
      <Link
        to="/cart"
        className="w-full bg-[#2B1B14] text-[#FAF5EC] p-3.5 border-2 border-[#B98A5E]/80 shadow-2xl flex items-center justify-between gap-3 active:scale-98 transition-transform cursor-pointer"
        aria-label={`View Cart: ${cartCount} items, total ${formatINR(cartTotal)}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#C65D3B]" />
            <span className="absolute -top-1.5 -right-2 bg-[#C65D3B] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </div>
          <div className="text-left">
            <span className="font-serif-display text-sm font-semibold block leading-tight">
              Table Tasting Tray
            </span>
            <span className="text-[11px] text-[#FAF5EC]/70">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-serif-display text-base font-bold text-[#E5B358] tabular-nums">
            {formatINR(cartTotal)}
          </span>
          <ArrowRight className="w-4 h-4 text-[#FAF5EC]" />
        </div>
      </Link>
    </aside>
  );
};
