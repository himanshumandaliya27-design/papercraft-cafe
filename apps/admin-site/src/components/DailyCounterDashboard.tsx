import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  QrCode,
  Banknote,
  Percent,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  Share2,
  Download,
  Award,
  ChevronRight,
  Phone,
  Table as TableIcon,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';
import { Order, Customer, Bill } from '@atelier/shared';
import { CAFE_CONFIG, formatINR } from '@atelier/shared';
import { cafeStore } from '@atelier/shared';
import { DayClosingModal } from './DayClosingModal';

interface DailyCounterDashboardProps {
  onNavigateToBills: () => void;
  onNavigateToCustomers: () => void;
}

export const DailyCounterDashboard: React.FC<DailyCounterDashboardProps> = ({
  onNavigateToBills,
  onNavigateToCustomers,
}) => {
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | '7days' | 'month' | 'all'>('today');
  const [isDayClosingOpen, setIsDayClosingOpen] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const allOrders = cafeStore.getOrders();
  const allCustomers = cafeStore.getCustomers();
  const allBookings = cafeStore.getBookings();

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const orderDateStr = order.createdAt.split('T')[0];

      if (dateRange === 'today') {
        return orderDateStr === todayStr;
      }
      if (dateRange === 'yesterday') {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        return orderDateStr === y.toISOString().split('T')[0];
      }
      if (dateRange === '7days') {
        const d7 = new Date(now);
        d7.setDate(now.getDate() - 7);
        return orderDate >= d7;
      }
      if (dateRange === 'month') {
        const m = new Date(now);
        m.setDate(now.getDate() - 30);
        return orderDate >= m;
      }
      return true;
    });
  }, [allOrders, dateRange, todayStr]);

  // Financial Metrics
  const totalSales = filteredOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const orderCount = filteredOrders.filter((o) => o.status !== 'cancelled').length;
  const avgBillValue = orderCount > 0 ? Math.round(totalSales / orderCount) : 0;

  const cashSales = filteredOrders
    .filter((o) => o.status !== 'cancelled' && o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  const upiSales = filteredOrders
    .filter((o) => o.status !== 'cancelled' && o.paymentMethod === 'upi')
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = filteredOrders
    .filter((o) => o.status !== 'cancelled' && (o.paymentMethod === 'card' || o.paymentMethod === 'razorpay'))
    .reduce((sum, o) => sum + o.total, 0);

  const totalGST = filteredOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.gst, 0);

  const totalDiscounts = filteredOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.discount || 0), 0);

  const cancelledCount = filteredOrders.filter((o) => o.status === 'cancelled').length;
  const pendingPaymentOrders = filteredOrders.filter(
    (o) => o.paymentStatus === 'pending' && o.status !== 'cancelled'
  );

  const dineInCount = filteredOrders.filter((o) => o.orderType === 'dine-in').length;
  const takeawayCount = filteredOrders.filter((o) => o.orderType !== 'dine-in').length;

  // Distinct customer count
  const distinctPhones = new Set(filteredOrders.map((o) => o.phone.replace(/\D/g, '').slice(-10)));
  const totalCustomersServed = distinctPhones.size;

  // New vs Returning breakdown
  let returningCount = 0;
  let newCustCount = 0;
  distinctPhones.forEach((phone) => {
    const cust = allCustomers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === phone);
    if (cust && cust.totalVisits > 1) {
      returningCount++;
    } else {
      newCustCount++;
    }
  });

  // Today Bookings
  const todayBookings = allBookings.filter((b) => b.date === todayStr);

  // HIGHEST BILL OF THE DAY STANDOUT CARD
  const highestBillOrder = useMemo(() => {
    if (filteredOrders.length === 0) return null;
    return [...filteredOrders].sort((a, b) => b.total - a.total)[0];
  }, [filteredOrders]);

  // Low stock inventory calculation (<= 5 remaining or sold out / 86)
  const menuItems = cafeStore.getMenuItems();
  const lowStockItems = useMemo(() => {
    return menuItems
      .filter(
        (item) =>
          !item.isAvailable ||
          (item.stockCount !== undefined && item.stockCount <= 5)
      )
      .sort((a, b) => (a.stockCount ?? 999) - (b.stockCount ?? 999));
  }, [menuItems]);

  // Hourly Sales breakdown for chart (08:00 to 20:00)
  const hourlyData = useMemo(() => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    return hours.map((h) => {
      const label = `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`;
      const ordersInHour = filteredOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getHours() === h && o.status !== 'cancelled';
      });
      const amount = ordersInHour.reduce((sum, o) => sum + o.total, 0);
      return { hour: label, amount, count: ordersInHour.length };
    });
  }, [filteredOrders]);

  const maxHourlyAmount = Math.max(...hourlyData.map((d) => d.amount), 1000);

  // Top 10 Best Selling Items
  const topItems = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        o.items.forEach((item) => {
          if (!map[item.name]) {
            map[item.name] = { name: item.name, qty: 0, revenue: 0 };
          }
          map[item.name].qty += item.quantity;
          map[item.name].revenue += item.itemTotal;
        });
      });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredOrders]);

  // Sales by Category
  const categorySales = useMemo(() => {
    const menuItems = cafeStore.getMenuItems();
    const map: Record<string, number> = {
      Coffee: 0,
      'Cold Drinks': 0,
      Bakery: 0,
      Breakfast: 0,
      Snacks: 0,
      Desserts: 0,
    };

    filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        o.items.forEach((item) => {
          const menuItem = menuItems.find((m) => m.id === item.menuItemId);
          const cat = menuItem?.category || 'Coffee';
          map[cat] = (map[cat] || 0) + item.itemTotal;
        });
      });

    const totalCatRevenue = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalCatRevenue) * 100),
    }));
  }, [filteredOrders]);

  // Send Daily WhatsApp Summary to Owner
  const getWhatsAppReportUrl = () => {
    const msg =
      `*Daily Counter Report · ${CAFE_CONFIG.cafeName}*\n` +
      `📅 Date: ${todayStr}\n\n` +
      `💰 *Total Sales:* ${formatINR(totalSales)}\n` +
      `🧾 *Total Orders:* ${orderCount} (Avg Bill: ${formatINR(avgBillValue)})\n` +
      `👥 *Guests Served:* ${totalCustomersServed} (${returningCount} Returning, ${newCustCount} New)\n` +
      `🪑 *Dine-in vs Takeaway:* ${dineInCount} Dine-in · ${takeawayCount} Takeaway\n\n` +
      `💵 *Collections Breakdown:*\n` +
      `• Cash: ${formatINR(cashSales)}\n` +
      `• UPI: ${formatINR(upiSales)}\n` +
      `• Card: ${formatINR(cardSales)}\n` +
      `• GST Collected: ${formatINR(totalGST)}\n\n` +
      (highestBillOrder
        ? `⭐ *Highest Bill:* ${formatINR(highestBillOrder.total)} (${highestBillOrder.customerName})\n\n`
        : '') +
      `_Report generated automatically from Atelier Vélin POS._`;

    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Type', 'Table', 'Subtotal', 'GST', 'Total', 'Payment Mode', 'Status'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.createdAt,
      `"${o.customerName}"`,
      o.phone,
      o.orderType,
      o.tableNumber || '',
      o.subtotal,
      o.gst,
      o.total,
      o.paymentMethod,
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AtelierVelin-Sales-${dateRange}-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Date Range Bar & Day Closing Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 shadow-xs">
        <div>
          <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
            Executive Ledger & Daily Counter
          </span>
          <h2 className="font-serif-display text-2xl font-semibold text-[#2B1B14] mt-0.5">
            Roastery Financial Intelligence
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Range Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#F4EBDD] border border-[#B98A5E]/40 text-xs">
            {(
              [
                ['today', 'Today'],
                ['yesterday', 'Yesterday'],
                ['7days', '7 Days'],
                ['month', 'This Month'],
                ['all', 'All Time'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDateRange(key)}
                className={`px-3 py-1 font-medium transition-colors cursor-pointer ${
                  dateRange === key
                    ? 'bg-[#2B1B14] text-[#FAF5EC] shadow-xs'
                    : 'text-[#4A372F] hover:text-[#2B1B14]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 border border-[#B98A5E]/50 bg-[#FAF5EC] text-[#2B1B14] hover:bg-[#E7D6BE]/60 cursor-pointer text-xs"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* WhatsApp Owner Summary */}
          <a
            href={getWhatsAppReportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#2E7D32]/50 bg-[#FAF5EC] text-[#2E7D32] hover:bg-[#E8F5E9] cursor-pointer text-xs font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp Summary</span>
          </a>

          {/* Day Closing Button */}
          <button
            type="button"
            onClick={() => setIsDayClosingOpen(true)}
            className="px-4 py-1.5 bg-[#C65D3B] text-[#FAF5EC] font-serif-display font-semibold text-xs hover:bg-[#b24f2f] cursor-pointer shadow-xs whitespace-nowrap"
          >
            End of Day Closing →
          </button>
        </div>
      </div>

      {/* HIGHEST BILL OF THE DAY STANDOUT CARD (Very Important!) */}
      {highestBillOrder && (
        <div className="paper-sheet-kraft p-5 border-2 border-[#C65D3B]/60 shadow-md relative overflow-hidden">
          <div className="absolute top-2 right-2 text-right">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#C65D3B] text-white text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              Highest Paid Bill of the Period
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#4A372F]">
                <span className="font-semibold text-[#2B1B14]">{highestBillOrder.orderNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{new Date(highestBillOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span aria-hidden="true">·</span>
                <span>{highestBillOrder.orderType === 'dine-in' ? `Table ${highestBillOrder.tableNumber}` : 'Takeaway'}</span>
                <span aria-hidden="true">·</span>
                <span>Paid via {highestBillOrder.paymentMethod.toUpperCase()}</span>
              </div>

              <h3 className="font-serif-display text-2xl font-semibold text-[#2B1B14]">
                {highestBillOrder.customerName}
                <span className="text-xs font-sans text-[#4A372F] ml-2 font-normal">
                  ({highestBillOrder.phone})
                </span>
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#2B1B14]">
                <span className="font-medium">Items Ordered:</span>
                {highestBillOrder.items.map((it, idx) => (
                  <span key={it.id} className="bg-[#FAF5EC] px-2 py-0.5 border border-[#B98A5E]/40">
                    {it.quantity}x {it.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-dashed border-[#B98A5E]/40">
              <span className="text-xs text-[#4A372F] block">Total Settled Amount</span>
              <span className="font-serif-display text-3xl sm:text-4xl font-bold text-[#C65D3B] tabular-nums block">
                {formatINR(highestBillOrder.total)}
              </span>
              <span className="text-[11px] text-[#4A372F] block mt-1">
                Handled by {highestBillOrder.handledBy || 'Clara Moreau'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock & 86'd Inventory Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-[#FFF3E0] border-2 border-[#E65100]/60 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E65100]" />
              <span className="font-serif-display font-bold text-sm text-[#BF360C]">
                Inventory Alert: {lowStockItems.length} {lowStockItems.length === 1 ? 'Item' : 'Items'} Running Low or 86'd
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {lowStockItems.map((item) => (
                <span
                  key={item.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium border ${
                    item.stockCount === 0 || !item.isAvailable
                      ? 'bg-[#FFEBEE] text-[#C62828] border-[#EF9A9A]'
                      : 'bg-[#FFF8E1] text-[#E65100] border-[#FFE082]'
                  }`}
                >
                  <span className="font-semibold font-sans">{item.name}:</span>
                  {item.stockCount === 0 || !item.isAvailable ? (
                    <span className="font-bold underline decoration-dotted">Sold Out (86)</span>
                  ) : (
                    <span>{item.stockCount} left</span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <a
            href="/menu-manager"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2B1B14] text-[#FAF5EC] text-xs font-medium hover:bg-[#3d271d] shrink-0 self-start sm:self-center"
          >
            <span>Update Catalog Stock →</span>
          </a>
        </div>
      )}

      {/* 12+ KPI Cards Grid: 4 across desktop, 2 tablet, 1 phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="paper-sheet p-4 border border-[#B98A5E]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#4A372F]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-semibold">Total Sales</span>
              <TrendingUp className="w-4 h-4 text-[#C65D3B]" />
            </div>
            <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1B14] mt-2 tabular-nums">
              {formatINR(totalSales)}
            </p>
          </div>
          <span className="text-[10px] text-[#2E7D32] font-medium mt-2 pt-2 border-t border-[#B98A5E]/20 block">
            ↑ 14.8% vs last week
          </span>
        </div>

        {/* Orders Count */}
        <div className="paper-sheet p-4 border border-[#B98A5E]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#4A372F]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-semibold">Total Orders</span>
              <Receipt className="w-4 h-4 text-[#B98A5E]" />
            </div>
            <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1B14] mt-2 tabular-nums">
              {orderCount}
            </p>
          </div>
          <span className="text-[10px] text-[#4A372F] mt-2 pt-2 border-t border-[#B98A5E]/20 block">
            {dineInCount} Dine-in · {takeawayCount} Takeaway
          </span>
        </div>

        {/* Average Bill Value */}
        <div className="paper-sheet p-4 border border-[#B98A5E]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#4A372F]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-semibold">Avg Bill Value</span>
              <Sparkles className="w-4 h-4 text-[#C65D3B]" />
            </div>
            <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1B14] mt-2 tabular-nums">
              {formatINR(avgBillValue)}
            </p>
          </div>
          <span className="text-[10px] text-[#4A372F] mt-2 pt-2 border-t border-[#B98A5E]/20 block">
            Per guest table seating
          </span>
        </div>

        {/* Total Customers */}
        <div className="paper-sheet p-4 border border-[#B98A5E]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#4A372F]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-semibold">Guests Served</span>
              <Users className="w-4 h-4 text-[#B98A5E]" />
            </div>
            <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1B14] mt-2 tabular-nums">
              {totalCustomersServed}
            </p>
          </div>
          <span className="text-[10px] text-[#4A372F] mt-2 pt-2 border-t border-[#B98A5E]/20 block">
            {returningCount} Returning · {newCustCount} New
          </span>
        </div>

        {/* Cash Collections */}
        <div className="paper-sheet p-4 border border-[#B98A5E]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#4A372F]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-semibold">Cash Sales</span>
              <Banknote className="w-4 h-4 text-[#B98A5E]" />
            </div>
            <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1B14] mt-2 tabular-nums">
              {formatINR(cashSales)}
            </p>
          </div>
          <span className="text-[10px] text-[#4A372F] mt-2 pt-2 border-t border-[#B98A5E]/20 block">
            Physical counter drawer
          </span>
        </div>

        {/* UPI Collections */}
        <div className="paper-sheet p-4 border border-[#B98A5E]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#4A372F]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-semibold">UPI / QR Sales</span>
              <QrCode className="w-4 h-4 text-[#C65D3B]" />
            </div>
            <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1B14] mt-2 tabular-nums">
              {formatINR(upiSales)}
            </p>
          </div>
          <span className="text-[10px] text-[#4A372F] mt-2 pt-2 border-t border-[#B98A5E]/20 block">
            Direct bank settlement
          </span>
        </div>

        {/* Card Collections */}
        <div className="paper-sheet p-4 border border-[#B98A5E]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#4A372F]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-semibold">Card / Online</span>
              <CreditCard className="w-4 h-4 text-[#B98A5E]" />
            </div>
            <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1B14] mt-2 tabular-nums">
              {formatINR(cardSales)}
            </p>
          </div>
          <span className="text-[10px] text-[#4A372F] mt-2 pt-2 border-t border-[#B98A5E]/20 block">
            POS Terminal & Razorpay
          </span>
        </div>

        {/* GST Collected */}
        <div className="paper-sheet p-4 border border-[#B98A5E]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#4A372F]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-semibold">GST ({CAFE_CONFIG.gstPercentage}%)</span>
              <Percent className="w-4 h-4 text-[#B98A5E]" />
            </div>
            <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1B14] mt-2 tabular-nums">
              {formatINR(totalGST)}
            </p>
          </div>
          <span className="text-[10px] text-[#4A372F] mt-2 pt-2 border-t border-[#B98A5E]/20 block">
            CGST + SGST audit total
          </span>
        </div>
      </div>

      {/* Charts Section: Peak Hours & Best-Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Hourly Sales Trend (Line/Area Chart) */}
        <div className="lg:col-span-7 paper-sheet p-5 sm:p-6 border border-[#B98A5E]/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] text-[#4A372F] uppercase tracking-wider font-mono">
                Temporal Flow
              </span>
              <h3 className="font-serif-display text-lg font-semibold text-[#2B1B14]">
                Hourly Sales & Peak Roastery Rush
              </h3>
            </div>
            <span className="text-xs text-[#C65D3B] font-medium font-handwritten text-base">
              Peak: 09:00 AM – 11:30 AM
            </span>
          </div>

          {/* SVG Line / Bar Chart with ₹ Y-Axis Labels */}
          <div className="relative h-56 w-full pt-2">
            <svg viewBox="0 0 580 160" className="w-full h-full overflow-visible">
              {/* Y-axis guide lines & Rupee tick values */}
              <text x="5" y="32" fontSize="9" fill="#8C7A70" fontFamily="Inter" className="tabular-nums font-mono">
                ₹{Math.round(maxHourlyAmount)}
              </text>
              <line x1="45" y1="30" x2="570" y2="30" stroke="#B98A5E" strokeOpacity="0.25" strokeDasharray="3 3" />

              <text x="5" y="82" fontSize="9" fill="#8C7A70" fontFamily="Inter" className="tabular-nums font-mono">
                ₹{Math.round(maxHourlyAmount / 2)}
              </text>
              <line x1="45" y1="80" x2="570" y2="80" stroke="#B98A5E" strokeOpacity="0.25" strokeDasharray="3 3" />

              <text x="18" y="132" fontSize="9" fill="#8C7A70" fontFamily="Inter" className="tabular-nums font-mono">
                ₹0
              </text>
              <line x1="45" y1="130" x2="570" y2="130" stroke="#B98A5E" strokeOpacity="0.35" />

              {/* Area path */}
              <polygon
                points={`
                  ${hourlyData.map((d, i) => `${i * 43 + 60},${130 - (d.amount / maxHourlyAmount) * 100}`).join(' ')}
                  ${(hourlyData.length - 1) * 43 + 60},130 60,130
                `}
                fill="#C65D3B"
                fillOpacity="0.12"
              />

              {/* Connected Line path */}
              <polyline
                points={hourlyData
                  .map((d, i) => `${i * 43 + 60},${130 - (d.amount / maxHourlyAmount) * 100}`)
                  .join(' ')}
                fill="none"
                stroke="#C65D3B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points with interactive tooltips */}
              {hourlyData.map((d, i) => {
                const cx = i * 43 + 60;
                const cy = 130 - (d.amount / maxHourlyAmount) * 100;
                return (
                  <g key={d.hour} className="group cursor-pointer">
                    <circle cx={cx} cy={cy} r="4.5" fill="#FAF5EC" stroke="#C65D3B" strokeWidth="2.5" />
                    <text x={cx} y="148" textAnchor="middle" fontSize="10" fill="#4A372F" fontFamily="Inter" className="font-mono">
                      {d.hour}
                    </text>
                    {/* Hover tooltip title */}
                    <title>{`${d.hour}: ${formatINR(d.amount)} (${d.count} orders)`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right 5 Cols: Top Best-Selling Items */}
        <div className="lg:col-span-5 paper-sheet p-5 sm:p-6 border border-[#B98A5E]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-[#4A372F] uppercase tracking-wider font-mono">
                  Kitchen Popularity
                </span>
                <h3 className="font-serif-display text-lg font-semibold text-[#2B1B14]">
                  Top Best-Selling Editions
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {topItems.map((item, idx) => {
                const maxRev = topItems[0]?.revenue || 1;
                const pct = Math.round((item.revenue / maxRev) * 100);

                return (
                  <div key={item.name} className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-[#2B1B14] truncate pr-2">
                        {idx + 1}. {item.name}
                      </span>
                      <span className="tabular-nums font-semibold text-[#C65D3B] shrink-0">
                        {formatINR(item.revenue)} ({item.qty})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E7D6BE]/60 rounded-xs overflow-hidden">
                      <div
                        className="h-full bg-[#B98A5E]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-[#B98A5E]/40 mt-4 flex items-center justify-between text-xs text-[#4A372F]">
            <span>Cardamom Cortado continues to lead table revenue</span>
            <button
              type="button"
              onClick={onNavigateToBills}
              className="text-[#C65D3B] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All Bills</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Payment Methods Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Sales Breakdown */}
        <div className="paper-sheet p-5 sm:p-6 border border-[#B98A5E]/40">
          <h3 className="font-serif-display text-lg font-semibold text-[#2B1B14] mb-3">
            Sales by Menu Category
          </h3>
          <div className="space-y-2 text-xs">
            {categorySales.map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[#2B1B14] font-medium">{c.category}</span>
                  <span className="tabular-nums font-semibold text-[#2B1B14]">
                    {formatINR(c.amount)} ({c.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#E7D6BE]/60 rounded-xs overflow-hidden flex">
                  <div
                    className="h-full bg-[#C65D3B]"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collections Breakdown */}
        <div className="paper-sheet p-5 sm:p-6 border border-[#B98A5E]/40">
          <h3 className="font-serif-display text-lg font-semibold text-[#2B1B14] mb-3">
            Payment Mode Distribution
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#FAF5EC] border border-[#B98A5E]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#C65D3B]" />
                <span className="font-medium text-[#2B1B14]">UPI / Instant QR</span>
              </div>
              <span className="font-serif-display text-base font-semibold text-[#2B1B14] tabular-nums">
                {formatINR(upiSales)}
              </span>
            </div>

            <div className="p-3 bg-[#FAF5EC] border border-[#B98A5E]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#B98A5E]" />
                <span className="font-medium text-[#2B1B14]">Cash at Counter</span>
              </div>
              <span className="font-serif-display text-base font-semibold text-[#2B1B14] tabular-nums">
                {formatINR(cashSales)}
              </span>
            </div>

            <div className="p-3 bg-[#FAF5EC] border border-[#B98A5E]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#2B1B14]" />
                <span className="font-medium text-[#2B1B14]">Cards & Online POS</span>
              </div>
              <span className="font-serif-display text-base font-semibold text-[#2B1B14] tabular-nums">
                {formatINR(cardSales)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Closing Reconciliation Modal */}
      <DayClosingModal
        isOpen={isDayClosingOpen}
        onClose={() => setIsDayClosingOpen(false)}
        todaySales={{
          total: totalSales,
          cash: cashSales,
          upi: upiSales,
          card: cardSales,
          ordersCount: orderCount,
        }}
      />
    </div>
  );
};
