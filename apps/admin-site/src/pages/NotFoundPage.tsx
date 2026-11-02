import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { WashiTape } from '../components/PaperElements';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <div className="ticket-cutout paper-grain p-8 border border-[#B98A5E]/50 shadow-2xl space-y-4 relative">
        <WashiTape variant="kraft" position="top-center" label="Missing Route" />

        <div className="w-12 h-12 rounded-full bg-[#E7D6BE] border border-[#B98A5E]/40 flex items-center justify-center mx-auto text-[#2B1B14]">
          <FileQuestion className="w-6 h-6 text-[#B98A5E]" />
        </div>

        <h1 className="font-serif-display text-2xl font-bold text-[#2B1B14]">
          Operational View Not Found
        </h1>

        <p className="text-xs text-[#4A372F] leading-relaxed">
          The admin route you requested is not indexed in the house system.
        </p>

        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
