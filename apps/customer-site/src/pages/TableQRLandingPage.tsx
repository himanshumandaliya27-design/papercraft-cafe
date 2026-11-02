import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, AlertCircle, ArrowRight, Compass } from 'lucide-react';
import { cafeStore, CAFE_CONFIG } from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

interface TableQRLandingPageProps {
  onTableDetected: (tableNumber: number) => void;
}

export const TableQRLandingPage: React.FC<TableQRLandingPageProps> = ({ onTableDetected }) => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    const rawNum = parseInt(tableNumber || '', 10);
    const tables = cafeStore.getTables();

    // Check if table exists in real database/store
    const matchedTable = tables.find((t) => t.number === rawNum) ||
      CAFE_CONFIG.tables.find((t) => t.number === rawNum);

    if (matchedTable && !isNaN(rawNum) && rawNum > 0) {
      // Valid table session
      onTableDetected(rawNum);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('atelier_table_number', String(rawNum));
      }

      // Smooth transition redirect to /menu?dine-in
      const timer = setTimeout(() => {
        navigate('/menu?dine-in', { replace: true });
      }, 900);

      return () => clearTimeout(timer);
    } else {
      setIsValidating(false);
      setIsInvalid(true);
    }
  }, [tableNumber, navigate, onTableDetected]);

  if (isInvalid) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="paper-sheet paper-grain p-8 border-2 border-[#C65D3B]/60 shadow-xl space-y-4 relative">
          <WashiTape variant="terracotta" position="top-center" label="Table Check Required" />

          <div className="w-12 h-12 rounded-full bg-[#C65D3B]/10 border border-[#C65D3B]/40 text-[#C65D3B] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h1 className="font-serif-display text-2xl font-bold text-[#2B1B14]">
            Table "{tableNumber}" Not Found
          </h1>

          <p className="text-xs text-[#4A372F] leading-relaxed">
            We couldn't verify this table on our active roastery floor plan. Please verify the number on your tent card or proceed to the menu to select takeaway.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              to="/menu"
              className="w-full sm:w-auto px-4 py-2 bg-[#2B1B14] hover:bg-[#3d281f] text-white text-xs font-serif font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore Digital Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-4 py-2 border border-[#B98A5E]/60 text-[#2B1B14] text-xs font-serif hover:bg-[#E7D6BE] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#C65D3B]" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="ticket-cutout paper-grain p-8 border border-[#B98A5E]/50 shadow-2xl space-y-4 relative">
        <WashiTape variant="terracotta" position="top-center" label="Table Verified · Dine-In" />

        <div className="w-12 h-12 rounded-full bg-[#C65D3B] text-white flex items-center justify-center mx-auto shadow-md">
          <UtensilsCrossed className="w-6 h-6" />
        </div>

        <h1 className="font-serif-display text-2xl font-bold text-[#2B1B14]">
          Welcome to Table {tableNumber}!
        </h1>

        <p className="text-xs text-[#4A372F] leading-relaxed">
          Your table has been recognized. All items ordered during this session will be prepared fresh and served directly to your seat.
        </p>

        <div className="p-3 bg-[#FAF5EC] border border-[#B98A5E]/40 text-xs text-[#2B1B14] font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-ping" />
          <span>Opening Roastery Digital Menu...</span>
        </div>
      </div>
    </div>
  );
};
