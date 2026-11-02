import React, { useState, useRef } from 'react';
import { X, Check, Calculator, AlertTriangle, FileText, Printer, ArrowRight } from 'lucide-react';
import { CAFE_CONFIG, formatINR, useFocusTrap } from '@atelier/shared';
import { cafeStore } from '@atelier/shared';
import { WashiTape } from './PaperElements';

interface DayClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  todaySales: {
    total: number;
    cash: number;
    upi: number;
    card: number;
    ordersCount: number;
  };
}

export const DayClosingModal: React.FC<DayClosingModalProps> = ({
  isOpen,
  onClose,
  todaySales,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, modalRef, onClose);
  const todayStr = new Date().toISOString().split('T')[0];
  const [openingCash, setOpeningCash] = useState<number>(() => cafeStore.getOpeningFloat(todayStr));
  const [actualCashCounted, setActualCashCounted] = useState<number>(
    () => cafeStore.getOpeningFloat(todayStr) + todaySales.cash - 1450 // Float + cash sales - today's expenses
  );
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const todayExpenses = cafeStore
    .getExpenses()
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const expectedCashInDrawer = openingCash + todaySales.cash - todayExpenses;
  const variance = actualCashCounted - expectedCashInDrawer;

  const handleSaveClosing = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStaff = cafeStore.getCurrentStaff();
    cafeStore.recordDailyClosing({
      date: todayStr,
      openingCash,
      cashSales: todaySales.cash,
      upiSales: todaySales.upi,
      cardSales: todaySales.card,
      razorpaySales: 0,
      totalSales: todaySales.total,
      totalExpenses: todayExpenses,
      expectedCashInDrawer,
      actualCashCounted,
      variance,
      notes: notes.trim() || undefined,
      closedBy: currentStaff?.name || 'Owner',
    });
    setSavedSuccess(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-closing-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-xl paper-sheet paper-grain p-6 sm:p-8 my-8 border border-[#B98A5E]/40 shadow-2xl focus:outline-hidden"
      >
        <WashiTape variant="terracotta" position="top-center" label="Daily Ledger Closing" />

        <div className="flex items-start justify-between border-b border-[#B98A5E]/30 pb-4">
          <div>
            <p className="text-xs text-[#4A372F] tracking-wide">
              {CAFE_CONFIG.cafeName} · End-of-Day Reconciliation
            </p>
            <h2
              id="day-closing-title"
              className="font-serif-display text-2xl font-semibold text-[#2B1B14] mt-0.5"
            >
              Day Closing Ledger ({todayStr})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close day closing dialog"
            className="p-1.5 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center border border-[#2E7D32]/30">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl font-semibold text-[#2B1B14]">
              Day Closing Successfully Recorded & Stamped!
            </h3>
            <p className="font-handwritten text-lg text-[#4A372F]">
              “Drawer balanced and signed off for {todayStr}”
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-[#B98A5E]/60 bg-[#FAF5EC] text-[#2B1B14] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Audit Slip</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveClosing} className="py-4 space-y-4 text-xs">
            {/* Sales Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
                <span className="text-[10px] text-[#4A372F] uppercase">Total Sales</span>
                <p className="font-serif-display text-sm font-semibold text-[#2B1B14] tabular-nums mt-0.5">
                  {formatINR(todaySales.total)}
                </p>
              </div>
              <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
                <span className="text-[10px] text-[#4A372F] uppercase">Cash Sales</span>
                <p className="font-serif-display text-sm font-semibold text-[#2B1B14] tabular-nums mt-0.5">
                  {formatINR(todaySales.cash)}
                </p>
              </div>
              <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
                <span className="text-[10px] text-[#4A372F] uppercase">UPI Sales</span>
                <p className="font-serif-display text-sm font-semibold text-[#2B1B14] tabular-nums mt-0.5">
                  {formatINR(todaySales.upi)}
                </p>
              </div>
              <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
                <span className="text-[10px] text-[#4A372F] uppercase">Card Sales</span>
                <p className="font-serif-display text-sm font-semibold text-[#2B1B14] tabular-nums mt-0.5">
                  {formatINR(todaySales.card)}
                </p>
              </div>
            </div>

            {/* Cash Drawer Calculator */}
            <div className="paper-sheet-kraft p-4 border border-[#B98A5E]/50 space-y-3">
              <p className="font-semibold text-[#2B1B14] flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#C65D3B]" />
                Physical Cash in Drawer Audit
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="opening-cash" className="block text-[11px] text-[#4A372F] mb-1">
                    Opening Morning Float (₹)
                  </label>
                  <input
                    id="opening-cash"
                    type="number"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="actual-cash" className="block text-[11px] text-[#4A372F] mb-1">
                    Actual Physical Cash Counted (₹) *
                  </label>
                  <input
                    id="actual-cash"
                    type="number"
                    required
                    value={actualCashCounted}
                    onChange={(e) => setActualCashCounted(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] tabular-nums font-semibold"
                  />
                </div>
              </div>

              {/* Formula audit */}
              <div className="pt-2 border-t border-[#B98A5E]/30 space-y-1 text-[#4A372F] tabular-nums">
                <div className="flex justify-between">
                  <span>+ Opening Cash Float:</span>
                  <span>{formatINR(openingCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>+ Today's Cash Collections:</span>
                  <span>{formatINR(todaySales.cash)}</span>
                </div>
                <div className="flex justify-between text-[#C65D3B]">
                  <span>- Today's Paid Cash Expenses:</span>
                  <span>-{formatINR(todayExpenses)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#2B1B14] pt-1 border-t border-dashed border-[#B98A5E]/40">
                  <span>Expected Cash in Drawer:</span>
                  <span>{formatINR(expectedCashInDrawer)}</span>
                </div>
                <div className="flex justify-between font-semibold text-sm pt-1">
                  <span>Variance / Difference:</span>
                  <span
                    className={
                      variance === 0
                        ? 'text-[#2E7D32]'
                        : variance > 0
                        ? 'text-[#2E7D32]'
                        : 'text-[#C65D3B]'
                    }
                  >
                    {variance >= 0 ? `+${formatINR(variance)} (Excess)` : `-${formatINR(Math.abs(variance))} (Shortage)`}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="closing-notes" className="block text-[11px] text-[#4A372F] mb-1">
                Closing Remarks / Cashier Notes
              </label>
              <input
                id="closing-notes"
                type="text"
                placeholder="e.g., Float intact. Handed over evening bag to safe."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F4EBDD] border border-[#B98A5E]/60 text-[#2B1B14]"
              />
            </div>

            <div className="pt-3 border-t border-[#B98A5E]/30 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-[#4A372F] hover:text-[#2B1B14]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#C65D3B] text-[#FAF5EC] font-serif-display font-semibold hover:bg-[#b24f2f] cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Stamp & Save Day Closing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
