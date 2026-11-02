import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { WashiTape } from '../components/PaperElements';

export const AccessDeniedPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <div className="ticket-cutout paper-grain p-8 border border-[#B98A5E]/50 shadow-2xl space-y-4 relative">
        <WashiTape variant="terracotta" position="top-center" label="Security Check" />

        <div className="w-12 h-12 rounded-full bg-[#C65D3B]/10 border border-[#C65D3B]/40 flex items-center justify-center mx-auto text-[#C65D3B]">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h1 className="font-serif-display text-2xl font-bold text-[#2B1B14]">
          Clearance Level Insufficient
        </h1>

        <p className="text-xs text-[#4A372F] leading-relaxed">
          This section requires Owner or Manager privileges. Please check with your supervisor or switch to an authorized staff profile.
        </p>

        <div className="pt-2">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Live Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
