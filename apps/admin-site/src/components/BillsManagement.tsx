import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Download,
  Printer,
  Percent,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  CreditCard,
  QrCode,
  Banknote,
  Share2,
  FileText,
} from 'lucide-react';
import { Bill, Order } from '@atelier/shared';
import { CAFE_CONFIG, formatINR, generateA4PdfInvoice, getWhatsAppShareInvoiceUrl } from '@atelier/shared';
import { cafeStore } from '@atelier/shared';
import { PrintableBillReceipt } from './PrintableBillReceipt';

export const BillsManagement: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>(() => cafeStore.getBills());
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  // Discount modal
  const [discountingBill, setDiscountingBill] = useState<Bill | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(50);
  const [discountReason, setDiscountReason] = useState<string>('Patron Courtesy');

  // Void modal
  const [voidingBill, setVoidingBill] = useState<Bill | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (paymentFilter !== 'All' && b.paymentMethod !== paymentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.billNumber.toLowerCase().includes(q) ||
          b.orderNumber.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.phone.includes(q)
        );
      }
      return true;
    });
  }, [bills, paymentFilter, searchQuery]);

  const handleOpenReceiptForBill = (bill: Bill) => {
    const order = cafeStore.getOrders().find((o) => o.id === bill.orderId);
    if (order) {
      setViewingReceiptOrder(order);
    }
  };

  const handleDownloadPdf = (bill: Bill) => {
    const order = cafeStore.getOrders().find((o) => o.id === bill.orderId);
    if (order) {
      generateA4PdfInvoice(order, bill);
    }
  };

  const handleShareWhatsApp = (bill: Bill) => {
    const order = cafeStore.getOrders().find((o) => o.id === bill.orderId);
    if (order) {
      const url = getWhatsAppShareInvoiceUrl(order, bill);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountingBill) return;
    cafeStore.applyDiscountToOrder(discountingBill.orderId, discountAmount, discountReason);
    setBills([...cafeStore.getBills()]);
    setDiscountingBill(null);
  };

  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingBill || !voidReason.trim()) return;
    cafeStore.voidBill(voidingBill.id, voidReason.trim());
    setBills([...cafeStore.getBills()]);
    setVoidingBill(null);
    setVoidReason('');
  };

  const handleExportCSV = () => {
    const headers = ['Bill Number', 'Order Number', 'Date', 'Customer', 'Phone', 'Table', 'Subtotal', 'GST', 'Discount', 'Total', 'Payment Mode', 'Status', 'Cashier'];
    const rows = filteredBills.map((b) => [
      b.billNumber,
      b.orderNumber,
      b.createdAt,
      `"${b.customerName}"`,
      b.phone,
      b.tableNumber || 'Takeaway',
      b.subtotal,
      b.gst,
      b.discount,
      b.total,
      b.paymentMethod,
      b.status,
      b.cashier,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AtelierVelin-Bills-Ledger.csv`);
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
            Fiscal Audit Ledger
          </span>
          <h2 className="font-serif-display text-2xl font-semibold text-[#2B1B14] mt-0.5">
            Settled Bills & Payment Vouchers
          </h2>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] text-xs font-medium cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#B98A5E]" />
          <span>Export All Bills</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF5EC] p-3 border border-[#B98A5E]/30 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B98A5E]" />
          <input
            type="text"
            placeholder="Search by bill #, order #, patron..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F4EBDD] border border-[#B98A5E]/50 text-[#2B1B14]"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[#4A372F] mr-1">Payment Mode:</span>
          {(['All', 'upi', 'cash', 'card'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPaymentFilter(mode)}
              className={`px-3 py-1 border transition-colors cursor-pointer ${
                paymentFilter === mode
                  ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                  : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Stacked Cards Layout (< 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredBills.length === 0 ? (
          <div className="paper-sheet p-8 text-center text-xs text-[#8C7A70] border border-dashed border-[#B98A5E]/40">
            No bills found matching your search.
          </div>
        ) : (
          filteredBills.map((bill) => (
            <div
              key={bill.id}
              className="paper-sheet paper-grain p-4 border border-[#B98A5E]/40 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between border-b border-[#B98A5E]/30 pb-2">
                <div>
                  <span className="font-mono font-bold text-sm text-[#2B1B14] block">
                    {bill.billNumber}
                  </span>
                  <span className="text-[10px] text-[#4A372F] font-mono">
                    {bill.createdAt.split('T')[0]} · {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                    bill.status === 'settled'
                      ? 'bg-[#2E7D32] text-white'
                      : 'bg-[#C65D3B] text-white'
                  }`}
                >
                  {bill.status}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-serif-display font-semibold text-sm text-[#2B1B14] block">
                    {bill.customerName}
                  </span>
                  <span className="text-[11px] text-[#4A372F] font-mono">{bill.phone}</span>
                </div>
                <span className="font-semibold text-xs text-[#C65D3B]">
                  {bill.tableNumber ? `Table ${bill.tableNumber}` : 'Takeaway'}
                </span>
              </div>

              <div className="pt-2 border-t border-dashed border-[#B98A5E]/30 flex justify-between items-baseline text-xs">
                <span className="text-[#4A372F] uppercase text-[10px]">
                  Mode: <span className="font-semibold text-[#2B1B14]">{bill.paymentMethod.toUpperCase()}</span>
                </span>
                <div className="text-right">
                  <span className="text-[10px] text-[#4A372F] block">Settled Total</span>
                  <span className="font-serif-display text-lg font-bold text-[#2B1B14] tabular-nums">
                    {formatINR(bill.total)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#B98A5E]/20 flex items-center justify-end gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(bill)}
                  className="px-3 py-1.5 min-h-[36px] border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] text-xs font-medium cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-[#2B1B14]" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(bill)}
                  className="px-3 py-1.5 min-h-[36px] border border-[#2E7D32]/40 bg-[#FAF5EC] hover:bg-[#E8F5E9] text-[#2E7D32] text-xs font-medium cursor-pointer flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenReceiptForBill(bill)}
                  className="px-3.5 py-1.5 min-h-[36px] bg-[#2B1B14] text-[#FAF5EC] hover:bg-[#3d271d] text-xs font-serif-display font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-[#E5B358]" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Bills Table */}
      <div className="hidden md:block paper-sheet border border-[#B98A5E]/40 overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#E7D6BE] border-b border-[#B98A5E]/40 text-[#4A372F] uppercase tracking-wider text-[10px] shadow-xs">
              <tr>
                <th className="p-3">Bill Number</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Guest</th>
                <th className="p-3">Table / Type</th>
                <th className="p-3 text-right">Subtotal</th>
                <th className="p-3 text-right">GST</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B98A5E]/20 text-[#2B1B14]">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-[#FAF5EC]/70">
                  <td className="p-3 font-mono font-semibold text-[#2B1B14]">
                    {bill.billNumber}
                  </td>
                  <td className="p-3 text-[#4A372F] tabular-nums">
                    {bill.createdAt.split('T')[0]} {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 font-medium font-serif-display text-sm">
                    {bill.customerName}
                    <span className="text-[10px] text-[#4A372F] block font-mono">
                      {bill.phone}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-[#C65D3B]">
                      {bill.tableNumber ? `Table ${bill.tableNumber}` : 'Takeaway'}
                    </span>
                  </td>
                  <td className="p-3 text-right tabular-nums text-[#4A372F]">
                    {formatINR(bill.subtotal)}
                  </td>
                  <td className="p-3 text-right tabular-nums text-[#4A372F]">
                    {formatINR(bill.gst)}
                  </td>
                  <td className="p-3 text-right tabular-nums font-bold text-sm text-[#2B1B14]">
                    {formatINR(bill.total)}
                  </td>
                  <td className="p-3">
                    <span className="uppercase font-semibold text-[10px] bg-[#FAF5EC] px-2 py-0.5 border border-[#B98A5E]/40">
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                        bill.status === 'settled'
                          ? 'bg-[#2E7D32] text-white'
                          : 'bg-[#C65D3B] text-white'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(bill)}
                      className="p-1.5 border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] cursor-pointer"
                      title="Download A4 PDF Tax Invoice"
                      aria-label="Download A4 PDF Tax Invoice"
                    >
                      <Download className="w-3.5 h-3.5 text-[#2B1B14]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(bill)}
                      className="p-1.5 border border-[#2E7D32]/40 bg-[#FAF5EC] hover:bg-[#E8F5E9] text-[#2E7D32] cursor-pointer"
                      title="Share Tax Invoice on WhatsApp"
                      aria-label="Share Tax Invoice on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenReceiptForBill(bill)}
                      className="p-1.5 border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] cursor-pointer"
                      title="Print 80mm / A4 Bill"
                      aria-label="Print 80mm / A4 Bill"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C65D3B]" />
                    </button>
                    {bill.status === 'settled' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setDiscountingBill(bill)}
                          className="p-1.5 border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] cursor-pointer"
                          title="Apply Courtesy Discount"
                        >
                          <Percent className="w-3.5 h-3.5 text-[#B98A5E]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoidingBill(bill)}
                          className="p-1.5 border border-[#C65D3B]/40 bg-[#FAF5EC] text-[#C65D3B] hover:bg-[#C65D3B]/10 cursor-pointer"
                          title="Void / Refund Bill"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Discount Modal */}
      {discountingBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs"
          role="dialog"
        >
          <div className="relative w-full max-w-sm paper-sheet paper-grain p-6">
            <h3 className="font-serif-display text-lg font-semibold text-[#2B1B14]">
              Apply Discount to {discountingBill.billNumber}
            </h3>
            <p className="text-xs text-[#4A372F] mt-0.5">
              Current Bill: {formatINR(discountingBill.total)}
            </p>

            <form onSubmit={handleApplyDiscount} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#4A372F] mb-1">
                  Discount Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={discountingBill.total}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#4A372F] mb-1">
                  Audit Reason *
                </label>
                <input
                  type="text"
                  required
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="e.g. Regular Guest Courtesy 10%"
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountingBill(null)}
                  className="px-3 py-1.5 text-xs text-[#4A372F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C65D3B] text-white text-xs font-semibold cursor-pointer"
                >
                  Apply & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void / Refund Modal */}
      {voidingBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs"
          role="dialog"
        >
          <div className="relative w-full max-w-sm paper-sheet paper-grain p-6">
            <h3 className="font-serif-display text-lg font-semibold text-[#C65D3B]">
              Void Bill {voidingBill.billNumber}
            </h3>
            <p className="text-xs text-[#4A372F] mt-0.5">
              This action will mark the bill refunded/void and log an immutable audit entry.
            </p>

            <form onSubmit={handleConfirmVoid} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#4A372F] mb-1">
                  Reason for Void / Refund *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Wrong table entered by cashier, guest re-order..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVoidingBill(null)}
                  className="px-3 py-1.5 text-xs text-[#4A372F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2B1B14] text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Void
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Receipt Modal */}
      {viewingReceiptOrder && (
        <PrintableBillReceipt
          order={viewingReceiptOrder}
          onClose={() => setViewingReceiptOrder(null)}
        />
      )}
    </div>
  );
};
