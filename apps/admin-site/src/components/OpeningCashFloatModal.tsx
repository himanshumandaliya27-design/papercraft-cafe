import React, { useState, useRef } from 'react';
import { Banknote, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import { CAFE_CONFIG, formatINR, useFocusTrap, cafeStore } from '@atelier/shared';
import { WashiTape } from './PaperElements';

interface OpeningCashFloatModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName?: string;
}

export const OpeningCashFloatModal: React.FC<OpeningCashFloatModalProps> = ({
  isOpen,
  onClose,
  staffName = 'Staff',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, modalRef, onClose);

  const todayStr = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState<number>(() => cafeStore.getOpeningFloat(todayStr));
  const [denominations, setDenominations] = useState<{ [denom: number]: number }>({
    500: 2, // 1000
    200: 5, // 1000
    100: 8, // 800
    50: 3,  // 150
    20: 2,  // 40
    10: 1,  // 10
  });

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    cafeStore.setOpeningFloat(todayStr, Number(amount), staffName);
    localStorage.setItem(`atelier_opening_float_prompted_${todayStr}`, 'true');
    onClose();
  };

  const handleDenomChange = (denom: number, count: number) => {
    const updated = { ...denominations, [denom]: Math.max(0, count) };
    setDenominations(updated);
    const sum = Object.entries(updated).reduce(
      (acc, [d, c]) => acc + Number(d) * Number(c),
      0
    );
    setAmount(sum);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opening-float-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg paper-sheet paper-grain p-6 sm:p-8 my-8 border border-[#B98A5E]/40 shadow-2xl focus:outline-hidden"
      >
        <WashiTape variant="terracotta" position="top-center" label="Morning Register Audit" />

        <div className="border-b border-[#B98A5E]/30 pb-4 mb-4">
          <div className="flex items-center gap-2 text-xs text-[#C65D3B] font-mono uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Shift Opening · First Login of the Day ({todayStr})</span>
          </div>
          <h2 id="opening-float-title" className="font-serif-display text-2xl font-bold text-[#2B1B14]">
            Opening Cash Float
          </h2>
          <p className="text-xs text-[#4A372F] mt-1 leading-relaxed">
            Welcome to counter duty, <strong>{staffName}</strong>. Please count and verify the physical opening cash in the drawer before accepting guest transactions.
          </p>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          {/* Total Amount Input */}
          <div className="p-4 bg-[#FAF5EC] border border-[#B98A5E]/60 space-y-2">
            <label htmlFor="float-amount" className="block text-xs font-semibold text-[#2B1B14]">
              Total Verified Opening Cash (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#4A372F]">
                ₹
              </span>
              <input
                id="float-amount"
                type="number"
                required
                min={0}
                step={10}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 bg-white border border-[#B98A5E]/60 font-mono text-base font-bold text-[#2B1B14] focus:outline-hidden focus:border-[#C65D3B]"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#4A372F]">
              <span>Standard Opening Float: {formatINR(3000)}</span>
              <button
                type="button"
                onClick={() => setAmount(3000)}
                className="text-[#C65D3B] underline underline-offset-2 hover:text-[#2B1B14] cursor-pointer"
              >
                Set Default ₹3,000
              </button>
            </div>
          </div>

          {/* Quick Denomination Counter (Collapsible/Optional) */}
          <div className="border border-[#B98A5E]/30 p-3 bg-[#F4EBDD]/50 text-xs space-y-2">
            <span className="font-semibold text-[11px] text-[#4A372F] uppercase font-mono block">
              Denomination Breakdown (Bills & Coins):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[500, 200, 100, 50, 20, 10].map((denom) => (
                <div key={denom} className="flex items-center justify-between p-1.5 bg-white border border-[#B98A5E]/40 text-[11px]">
                  <span className="font-mono text-[#4A372F]">₹{denom}:</span>
                  <input
                    type="number"
                    min={0}
                    value={denominations[denom] || 0}
                    onChange={(e) => handleDenomChange(denom, Number(e.target.value))}
                    className="w-12 text-center border-b border-gray-300 font-mono font-semibold"
                    aria-label={`Count of ${denom} rupee notes`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#E8F5E9] border-l-4 border-[#2E7D32] text-xs text-[#2E7D32] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              This float will be automatically preserved and reconciled in the End-of-Day Closing Ledger.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#C65D3B] text-white text-xs font-serif-display font-semibold hover:bg-[#b24f2f] cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm Opening Float ({formatINR(amount)}) & Open Register</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
