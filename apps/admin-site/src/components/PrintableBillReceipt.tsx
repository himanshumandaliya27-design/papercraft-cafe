import React, { useState, useRef } from 'react';
import { X, Printer, Download, Check, Coffee, Share2, FileText } from 'lucide-react';
import { Order } from '@atelier/shared';
import { CAFE_CONFIG, formatINR, useFocusTrap, generateA4PdfInvoice, getWhatsAppShareInvoiceUrl } from '@atelier/shared';
import { WashiTape } from './PaperElements';

interface PrintableBillReceiptProps {
  order: Order;
  onClose: () => void;
}

export const PrintableBillReceipt: React.FC<PrintableBillReceiptProps> = ({
  order,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, modalRef, onClose);
  const [printFormat, setPrintFormat] = useState<'80mm' | 'A4'>('80mm');
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setPdfGenerating(true);
    try {
      generateA4PdfInvoice(order);
    } finally {
      setTimeout(() => setPdfGenerating(false), 1000);
    }
  };

  const handleShareWhatsApp = () => {
    const url = getWhatsAppShareInvoiceUrl(order);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const halfGst = (order.gst / 2).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Printable Bill & Tax Invoice"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-xl paper-sheet paper-grain p-6 sm:p-8 my-8 border border-[#B98A5E]/40 shadow-2xl focus:outline-hidden"
      >
        <WashiTape variant="kraft" position="top-center" label="Invoice Audit" />

        {/* Modal Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#B98A5E]/30 pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#4A372F]">Format:</span>
            <button
              type="button"
              onClick={() => setPrintFormat('80mm')}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                printFormat === '80mm'
                  ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                  : 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/40'
              }`}
            >
              80mm Thermal Slip
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('A4')}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                printFormat === 'A4'
                  ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                  : 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/40'
              }`}
            >
              A4 Tax Invoice
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2B1B14] text-[#FAF5EC] text-xs font-medium cursor-pointer shadow-xs hover:bg-[#3d271d] disabled:opacity-50"
              title="Download A4 PDF Tax Invoice"
            >
              <Download className="w-3.5 h-3.5 text-[#E5B358]" />
              <span>{pdfGenerating ? 'Generating...' : 'PDF Invoice'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-medium cursor-pointer shadow-xs hover:bg-[#256829]"
              title="Share invoice breakdown directly to customer via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C65D3B] text-white text-xs font-medium cursor-pointer shadow-xs hover:bg-[#b24f2f]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close printable receipt modal"
              className="p-1 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Body */}
        <div
          id="printable-receipt"
          className={`mx-auto bg-white text-[#1A1A1A] p-6 shadow-inner border border-dashed border-[#B98A5E]/50 font-mono text-xs ${
            printFormat === '80mm' ? 'max-w-[340px]' : 'w-full'
          }`}
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-gray-400">
            <h2 className="font-serif-display text-lg font-bold tracking-tight text-gray-900">
              {CAFE_CONFIG.cafeName}
            </h2>
            <p className="text-[10px] text-gray-600">{CAFE_CONFIG.tagline}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{CAFE_CONFIG.address}, {CAFE_CONFIG.city}</p>
            <p className="text-[10px] text-gray-600">Ph: {CAFE_CONFIG.phone} · GSTIN: {CAFE_CONFIG.gstin}</p>
          </div>

          {/* Meta Info */}
          <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Invoice: #{order.orderNumber.replace('#AV-', 'BILL-')}</span>
              <span>{order.createdAt.split('T')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span>Guest: {order.customerName}</span>
              <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Type: {order.orderType === 'dine-in' ? `Table ${order.tableNumber}` : 'Takeaway'}</span>
              <span>Cashier: {order.handledBy || 'Arjun'}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-2.5 border-b border-dashed border-gray-400">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="pb-1">Item</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Rate</th>
                  <th className="pb-1 text-right">Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-1 pr-1">
                      <div className="font-medium text-gray-900">{it.name}</div>
                      {it.selectedVariant && (
                        <div className="text-[9px] text-gray-500">[{it.selectedVariant}]</div>
                      )}
                    </td>
                    <td className="py-1 text-center tabular-nums">{it.quantity}</td>
                    <td className="py-1 text-right tabular-nums">
                      {(it.itemTotal / it.quantity).toFixed(0)}
                    </td>
                    <td className="py-1 text-right tabular-nums font-semibold">
                      {it.itemTotal.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px] tabular-nums">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[10px]">
              <span>CGST (2.5%):</span>
              <span>₹{halfGst}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-[10px]">
              <span>SGST (2.5%):</span>
              <span>₹{halfGst}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount ({order.discountReason || 'Promo'}):</span>
                <span>-{formatINR(order.discount)}</span>
              </div>
            )}
            {order.tip > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Crew Gratuity / Tip:</span>
                <span>{formatINR(order.tip)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1.5 border-t border-gray-400">
              <span>GRAND TOTAL:</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>

          {/* Payment & Footer */}
          <div className="pt-2.5 text-center text-[10px] text-gray-600 space-y-1">
            <p className="font-bold text-gray-800">
              PAYMENT MODE: {order.paymentMethod.toUpperCase()} · STATUS: {order.paymentStatus.toUpperCase()}
            </p>
            <p className="pt-1 italic">{CAFE_CONFIG.receiptFooterText}</p>
            <p className="font-mono text-[9px] text-gray-400">Atelier Vélin POS Engine · Thank You</p>
          </div>
        </div>
      </div>
    </div>
  );
};
