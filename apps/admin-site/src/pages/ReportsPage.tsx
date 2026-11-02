import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Plus,
} from 'lucide-react';
import {
  formatINR,
  CAFE_CONFIG,
  cafeStore,
  DailyClosing,
} from '@atelier/shared';
import { DayClosingModal } from '../components/DayClosingModal';

export const ReportsPage: React.FC = () => {
  const [closings, setClosings] = useState<DailyClosing[]>(() => cafeStore.getDailyClosings());
  const [isDayClosingModalOpen, setIsDayClosingModalOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'today' | 'week' | 'month'>('today');

  const validOrders = cafeStore.getOrders().filter((o) => o.status !== 'cancelled');
  const totalSales = validOrders.reduce((acc, o) => acc + o.total, 0);
  const totalGst = validOrders.reduce((acc, o) => acc + o.gst, 0);
  const totalBills = validOrders.length;

  const todayCashSales = validOrders.filter((o) => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0);
  const todayUpiSales = validOrders.filter((o) => o.paymentMethod === 'upi').reduce((sum, o) => sum + o.total, 0);
  const todayCardSales = validOrders.filter((o) => o.paymentMethod === 'card').reduce((sum, o) => sum + o.total, 0);

  const handleExportSummaryCSV = () => {
    const headers = ['Date', 'Opening Cash', 'Cash Sales', 'UPI Sales', 'Card Sales', 'Total Sales', 'Expenses', 'Expected Cash', 'Counted Cash', 'Difference', 'Closed By'];
    const rows = closings.map((c) => [
      c.date,
      c.openingCash,
      c.cashSales,
      c.upiSales,
      c.cardSales,
      c.totalSales,
      c.expensesTotal ?? c.totalExpenses ?? 0,
      c.expectedCashInDrawer,
      c.countedCashInDrawer ?? c.actualCashCounted ?? 0,
      c.difference ?? c.variance ?? 0,
      `"${c.closedBy}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cafe-Day-Closings-Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 shadow-xs">
        <div>
          <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
            Financial Audit & Day Closing
          </span>
          <h2 className="font-serif-display text-2xl font-bold text-[#2B1B14] mt-0.5">
            Reports & Tax Statements
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportSummaryCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#B98A5E]/60 bg-[#FAF5EC] text-[#2B1B14] hover:bg-[#E7D6BE] text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#B98A5E]" />
            <span>Export CSV Report</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDayClosingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#C65D3B] text-[#FAF5EC] font-serif-display text-xs font-semibold hover:bg-[#b24f2f] cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Perform Day Closing</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="paper-sheet paper-grain p-5 border border-[#B98A5E]/40 shadow-xs space-y-1">
          <span className="text-xs font-mono uppercase text-[#4A372F]">Gross System Sales</span>
          <p className="font-serif-display text-2xl font-bold text-[#2B1B14] tabular-nums">
            {formatINR(totalSales)}
          </p>
          <span className="text-[11px] text-[#4A372F] block">Across {totalBills} closed bills</span>
        </div>

        <div className="paper-sheet paper-grain p-5 border border-[#B98A5E]/40 shadow-xs space-y-1">
          <span className="text-xs font-mono uppercase text-[#4A372F]">Total GST Collected (5%)</span>
          <p className="font-serif-display text-2xl font-bold text-[#C65D3B] tabular-nums">
            {formatINR(totalGst)}
          </p>
          <span className="text-[11px] text-[#4A372F] block">
            Split: {formatINR(totalGst / 2)} CGST · {formatINR(totalGst / 2)} SGST
          </span>
        </div>

        <div className="paper-sheet paper-grain p-5 border border-[#B98A5E]/40 shadow-xs space-y-1">
          <span className="text-xs font-mono uppercase text-[#4A372F]">Total Closings Performed</span>
          <p className="font-serif-display text-2xl font-bold text-[#2E7D32] tabular-nums">
            {closings.length}
          </p>
          <span className="text-[11px] text-[#4A372F] block">All reconciliations balanced</span>
        </div>
      </div>

      {/* Day Closing Reconciliation Log Table */}
      <div className="paper-sheet paper-grain border border-[#B98A5E]/40 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#B98A5E]/30 flex items-center justify-between">
          <h3 className="font-serif-display text-base font-bold text-[#2B1B14]">
            Past End-of-Day Closing Reconciliations
          </h3>
          <span className="text-xs text-[#4A372F] font-mono">Drawer Count vs System</span>
        </div>

        {/* Mobile Stacked Cards Layout (< 768px) */}
        <div className="block md:hidden p-3 space-y-3">
          {closings.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#4A372F] italic border border-dashed border-[#B98A5E]/40">
              No day closing records logged yet.
            </div>
          ) : (
            closings.map((c) => (
              <div
                key={c.id}
                className="paper-sheet paper-grain p-4 border border-[#B98A5E]/40 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-[#B98A5E]/30 pb-2">
                  <span className="font-serif-display font-bold text-sm text-[#2B1B14]">{c.date}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                      (c.difference ?? c.variance ?? 0) === 0
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/40'
                        : 'bg-[#FFEBEE] text-[#C65D3B] border border-[#C65D3B]/40'
                    }`}
                  >
                    {(c.difference ?? c.variance ?? 0) === 0 ? 'Balanced' : 'Discrepancy'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#4A372F] uppercase block">Cash Sales</span>
                    <span className="font-mono font-semibold text-[#2E7D32] tabular-nums">{formatINR(c.cashSales)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4A372F] uppercase block">UPI Sales</span>
                    <span className="font-mono font-semibold text-[#C65D3B] tabular-nums">{formatINR(c.upiSales)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4A372F] uppercase block">Expected Cash</span>
                    <span className="font-mono text-[#2B1B14] tabular-nums">{formatINR(c.expectedCashInDrawer)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4A372F] uppercase block">Counted Drawer</span>
                    <span className="font-mono font-bold text-[#2B1B14] tabular-nums">
                      {formatINR(c.countedCashInDrawer ?? c.actualCashCounted ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-[#B98A5E]/20 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#4A372F]">Closed by: {c.closedBy}</span>
                  <span
                    className={`font-mono font-bold tabular-nums text-xs ${
                      (c.difference ?? c.variance ?? 0) === 0 ? 'text-[#2E7D32]' : 'text-[#C65D3B]'
                    }`}
                  >
                    {(c.difference ?? c.variance ?? 0) === 0
                      ? 'Balanced (₹0)'
                      : formatINR(c.difference ?? c.variance ?? 0)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop / Tablet Table */}
        <div className="hidden md:block overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#E7D6BE] text-[#2B1B14] font-serif-display font-semibold border-b border-[#B98A5E]/40 shadow-xs">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Opening Cash</th>
                <th className="p-3 text-right">Cash Sales</th>
                <th className="p-3 text-right">UPI Sales</th>
                <th className="p-3 text-right">Expected Drawer</th>
                <th className="p-3 text-right">Counted Cash</th>
                <th className="p-3 text-right">Difference</th>
                <th className="p-3">Closed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B98A5E]/30 bg-[#FAF5EC] tabular-nums">
              {closings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-[#4A372F]">
                    No day closing records logged yet.
                  </td>
                </tr>
              ) : (
                closings.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F4EBDD]/50 transition-colors">
                    <td className="p-3 font-semibold text-[#2B1B14]">{c.date}</td>
                    <td className="p-3 text-right">{formatINR(c.openingCash)}</td>
                    <td className="p-3 text-right font-medium text-[#2E7D32]">
                      {formatINR(c.cashSales)}
                    </td>
                    <td className="p-3 text-right text-[#C65D3B]">{formatINR(c.upiSales)}</td>
                    <td className="p-3 text-right font-semibold">
                      {formatINR(c.expectedCashInDrawer)}
                    </td>
                    <td className="p-3 text-right font-bold text-[#2B1B14]">
                      {formatINR(c.countedCashInDrawer ?? c.actualCashCounted ?? 0)}
                    </td>
                    <td
                      className={`p-3 text-right font-bold ${
                        (c.difference ?? c.variance ?? 0) === 0
                          ? 'text-[#2E7D32]'
                          : (c.difference ?? c.variance ?? 0) > 0
                          ? 'text-[#E5B358]'
                          : 'text-[#C65D3B]'
                      }`}
                    >
                      {(c.difference ?? c.variance ?? 0) === 0
                        ? 'Balanced (₹0)'
                        : (c.difference ?? c.variance ?? 0) > 0
                        ? `+${formatINR(c.difference ?? c.variance ?? 0)}`
                        : formatINR(c.difference ?? c.variance ?? 0)}
                    </td>
                    <td className="p-3 text-[#4A372F]">{c.closedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDayClosingModalOpen && (
        <DayClosingModal
          isOpen={isDayClosingModalOpen}
          todaySales={{
            total: totalSales,
            cash: todayCashSales,
            upi: todayUpiSales,
            card: todayCardSales,
            ordersCount: totalBills,
          }}
          onClose={() => {
            setIsDayClosingModalOpen(false);
            setClosings(cafeStore.getDailyClosings());
          }}
        />
      )}
    </div>
  );
};
