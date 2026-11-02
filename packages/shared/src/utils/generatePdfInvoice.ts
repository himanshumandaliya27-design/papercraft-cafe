import { jsPDF } from 'jspdf';
import { Order, Bill } from '../types/cafe';
import { CAFE_CONFIG } from '../config/cafeConfig';

export function generateA4PdfInvoice(order: Order, bill?: Bill) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(43, 27, 20); // Atelier deep charcoal/roast
  doc.text(CAFE_CONFIG.cafeName.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 7;
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(110, 80, 60);
  doc.text(CAFE_CONFIG.tagline, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 55, 47);
  doc.text(`${CAFE_CONFIG.address}, ${CAFE_CONFIG.city} · Ph: ${CAFE_CONFIG.phone}`, pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.text(`GSTIN: ${CAFE_CONFIG.gstin} · FSSAI Lic: 11524021000189`, pageWidth / 2, y, { align: 'center' });

  y += 8;
  doc.setDrawColor(185, 138, 94);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(198, 93, 59); // Terracotta
  doc.text('GST TAX INVOICE', pageWidth / 2, y, { align: 'center' });

  // Invoice Details Grid
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(43, 27, 20);
  doc.text('Invoice Details:', margin, y);
  doc.text('Billed To:', margin + contentWidth / 2, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 50, 45);
  const invNumber = bill?.billNumber || order.orderNumber.replace('#AV-', 'BILL-');
  doc.text(`Invoice No: ${invNumber}`, margin, y);
  doc.text(`Customer: ${order.customerName}`, margin + contentWidth / 2, y);

  y += 4.5;
  doc.text(`Order Ref: ${order.orderNumber}`, margin, y);
  doc.text(`Mobile: +91 ${order.phone}`, margin + contentWidth / 2, y);

  y += 4.5;
  doc.text(`Date & Time: ${new Date(order.createdAt).toLocaleString('en-IN')}`, margin, y);
  doc.text(`Service: ${order.orderType === 'dine-in' ? `Dine-In (Table ${order.tableNumber})` : 'Takeaway'}`, margin + contentWidth / 2, y);

  y += 4.5;
  doc.text(`Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})`, margin, y);
  doc.text(`Cashier / Attendant: ${order.handledBy || 'Staff'}`, margin + contentWidth / 2, y);

  // Table Header
  y += 8;
  doc.setFillColor(244, 235, 221);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(43, 27, 20);

  doc.text('#', margin + 3, y + 5);
  doc.text('Item Description', margin + 12, y + 5);
  doc.text('Qty', margin + 105, y + 5, { align: 'center' });
  doc.text('Rate (INR)', margin + 135, y + 5, { align: 'right' });
  doc.text('Amount (INR)', margin + contentWidth - 4, y + 5, { align: 'right' });

  // Line Items
  y += 7;
  doc.setFont('helvetica', 'normal');
  let idx = 1;
  order.items.forEach((item) => {
    doc.setDrawColor(230, 220, 205);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);

    doc.text(String(idx++), margin + 3, y + 4.5);
    const itemDesc = item.selectedVariant ? `${item.name} (${item.selectedVariant})` : item.name;
    doc.text(itemDesc.slice(0, 48), margin + 12, y + 4.5);
    doc.text(String(item.quantity), margin + 105, y + 4.5, { align: 'center' });
    doc.text((item.itemTotal / item.quantity).toFixed(2), margin + 135, y + 4.5, { align: 'right' });
    doc.text(item.itemTotal.toFixed(2), margin + contentWidth - 4, y + 4.5, { align: 'right' });

    y += 7;
  });

  // Financial Breakdown Box
  y += 6;
  const halfGst = (order.gst / 2).toFixed(2);
  const startTotalsX = margin + contentWidth - 75;

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', startTotalsX, y);
  doc.text(`INR ${order.subtotal.toFixed(2)}`, margin + contentWidth - 4, y, { align: 'right' });

  y += 5;
  doc.text('CGST (2.5%):', startTotalsX, y);
  doc.text(`INR ${halfGst}`, margin + contentWidth - 4, y, { align: 'right' });

  y += 5;
  doc.text('SGST (2.5%):', startTotalsX, y);
  doc.text(`INR ${halfGst}`, margin + contentWidth - 4, y, { align: 'right' });

  if (order.discount > 0) {
    y += 5;
    doc.setTextColor(46, 125, 50);
    doc.text(`Discount (${order.discountReason || 'Courtesy'}):`, startTotalsX, y);
    doc.text(`- INR ${order.discount.toFixed(2)}`, margin + contentWidth - 4, y, { align: 'right' });
    doc.setTextColor(60, 50, 45);
  }

  if (order.tip > 0) {
    y += 5;
    doc.text('Crew Gratuity / Tip:', startTotalsX, y);
    doc.text(`INR ${order.tip.toFixed(2)}`, margin + contentWidth - 4, y, { align: 'right' });
  }

  y += 6;
  doc.setFillColor(43, 27, 20);
  doc.rect(startTotalsX - 4, y - 4, 79, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(250, 245, 236);
  doc.text('GRAND TOTAL:', startTotalsX, y + 1.5);
  doc.text(`INR ${order.total.toFixed(2)}`, margin + contentWidth - 4, y + 1.5, { align: 'right' });

  // Terms and Footer
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 90, 85);
  doc.text('Notes & Declarations:', margin, y);
  doc.text('1. All confectionery and roasted beans are prepared freshly on premises.', margin, y + 4);
  doc.text('2. Computer-generated tax invoice issued under CGST/SGST Rules 2017.', margin, y + 8);
  doc.text(`3. ${CAFE_CONFIG.receiptFooterText}`, margin, y + 12);

  doc.text('For Atelier Vélin Roastery', margin + contentWidth - 40, y + 8, { align: 'center' });
  doc.text('(Authorized Signatory)', margin + contentWidth - 40, y + 15, { align: 'center' });

  // Save the PDF
  doc.save(`AtelierVelin-TaxInvoice-${order.orderNumber.replace('#', '')}.pdf`);
}

export function getWhatsAppShareInvoiceUrl(order: Order, bill?: Bill): string {
  const invNumber = bill?.billNumber || order.orderNumber.replace('#AV-', 'BILL-');
  const itemsText = order.items
    .map((i) => `• ${i.quantity}x ${i.name} - ₹${i.itemTotal}`)
    .join('\n');

  const text = `*Atelier Vélin — Tax Invoice ${invNumber}*
Thank you for visiting, ${order.customerName}!

*Order Summary:*
${itemsText}

Subtotal: ₹${order.subtotal}
GST (5%): ₹${order.gst}
${order.discount ? `Discount: -₹${order.discount}\n` : ''}${order.tip ? `Tip: ₹${order.tip}\n` : ''}*Grand Total: ₹${order.total}*
Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})

View digital menu & reserve tables: ${CAFE_CONFIG.customerSiteUrl || 'https://ateliervelin.coffee'}`;

  const cleanPhone = order.phone.replace(/\D/g, '').slice(-10);
  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
}
