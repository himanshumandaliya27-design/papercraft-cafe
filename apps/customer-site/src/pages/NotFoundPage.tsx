import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowLeft } from 'lucide-react';
import { CAFE_CONFIG } from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="ticket-cutout paper-grain p-8 sm:p-10 border border-[#B98A5E]/50 shadow-2xl space-y-5 relative">
        <WashiTape variant="kraft" position="top-center" label="Lost Paper Page" />

        <div className="w-14 h-14 rounded-full bg-[#E7D6BE] border border-[#B98A5E]/60 flex items-center justify-center mx-auto text-[#2B1B14]">
          <Coffee className="w-7 h-7 text-[#C65D3B]" />
        </div>

        <span className="font-mono text-xs uppercase text-[#C65D3B] font-bold tracking-widest block">
          Error 404 · Unbound Page
        </span>

        <h1 className="font-serif-display text-3xl font-bold text-[#2B1B14]">
          This Page Slipped Away
        </h1>

        <p className="text-xs text-[#4A372F] leading-relaxed">
          Like a rogue receipt in the morning breeze, the ledger address you are looking for does not exist in our roastery archive.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#2B1B14] text-[#FAF5EC] font-serif-display font-semibold text-xs hover:bg-[#3d281f] flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <Link
            to="/menu"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#C65D3B] text-[#FAF5EC] font-serif-display font-semibold text-xs hover:bg-[#b24f2f] shadow-xs"
          >
            View Digital Menu
          </Link>
        </div>
      </div>
    </div>
  );
};
