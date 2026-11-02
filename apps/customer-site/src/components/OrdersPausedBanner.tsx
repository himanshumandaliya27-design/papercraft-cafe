import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export const OrdersPausedBanner: React.FC = () => {
  return (
    <aside aria-label="Order Status Notice" className="bg-[#FAF5EC] border-b border-[#C65D3B]/40 px-4 py-2.5 text-xs text-[#2B1B14] shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C65D3B] animate-pulse" />
          <span className="font-semibold text-[#C65D3B]">Live Orders Currently Paused:</span>
          <span>Our counter bar is experiencing high volume. You may browse items, and order placing will resume shortly.</span>
        </div>
        <span className="font-mono text-[10px] text-[#4A372F] hidden sm:inline">
          Table Browsing Active
        </span>
      </div>
    </aside>
  );
};
