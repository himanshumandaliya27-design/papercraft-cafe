import React, { useState, useMemo } from 'react';
import {
  Award,
  Crown,
  Search,
  Download,
  Calendar,
  Phone,
  User,
  Coffee,
  Receipt,
  ArrowUpRight,
  ChevronRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Order, Customer, Bill } from '@atelier/shared';
import { CAFE_CONFIG, formatINR } from '@atelier/shared';
import { cafeStore } from '@atelier/shared';
import { WashiTape } from './PaperElements';
import { PrintableBillReceipt } from './PrintableBillReceipt';

export const TopBillsAndCustomers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bills' | 'customers'>('bills');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingBillOrder, setViewingBillOrder] = useState<Order | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const allOrders = cafeStore.getOrders();
  const allCustomers = cafeStore.getCustomers();

  // Filter orders by time window
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return allOrders.filter((o) => {
      if (o.status === 'cancelled') return false;
      const d = new Date(o.createdAt);
      const dStr = o.createdAt.split('T')[0];

      if (timeFilter === 'today') return dStr === todayStr;
      if (timeFilter === 'week') {
        const w = new Date(now);
        w.setDate(now.getDate() - 7);
        return d >= w;
      }
      if (timeFilter === 'month') {
        const m = new Date(now);
        m.setDate(now.getDate() - 30);
        return d >= m;
      }
      return true;
    });
  }, [allOrders, timeFilter, todayStr]);

  // Ranked Top Bills Leaderboard
  const topBills = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => b.total - a.total)
      .filter((o) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.orderNumber.toLowerCase().includes(q)
        );
      });
  }, [filteredOrders, searchQuery]);

  // Ranked Top Customers
  const topCustomers = useMemo(() => {
    return [...allCustomers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.phone.includes(q);
      });
  }, [allCustomers, searchQuery]);

  // Export CSV
  const handleExportBillsCSV = () => {
    const headers = ['Rank', 'Order Number', 'Customer Name', 'Phone', 'Amount (INR)', 'Date', 'Type', 'Table', 'Handled By'];
    const rows = topBills.map((b, idx) => [
      idx + 1,
      b.orderNumber,
      `"${b.customerName}"`,
      b.phone,
      b.total,
      b.createdAt,
      b.orderType,
      b.tableNumber || 'Takeaway',
      b.handledBy || 'Staff',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AtelierVelin-TopBills-${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCustomersCSV = () => {
    const headers = ['Rank', 'Name', 'Phone', 'Total Visits', 'Total Spent (INR)', 'Avg Bill (INR)', 'Last Visit', 'VIP Status'];
    const rows = topCustomers.map((c, idx) => [
      idx + 1,
      `"${c.name}"`,
      c.phone,
      c.totalVisits,
      c.totalSpent,
      c.averageBill,
      c.lastVisit,
      c.tags.includes('VIP') ? 'VIP' : 'Regular',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AtelierVelin-TopCustomers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Leaderboard Selector */}
      <div className="bg-[#FAF5EC] p-5 sm:p-6 border border-[#B98A5E]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
            Prestige Registry
          </span>
          <h2 className="font-serif-display text-2xl font-semibold text-[#2B1B14] mt-0.5">
            Highest Paid Bills & VIP Patrons
          </h2>
          <p className="font-handwritten text-base text-[#C65D3B] mt-0.5">
            “The finest patrons and highest-value table banquets recorded on paper”
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4EBDD] border border-[#B98A5E]/40 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bills'
                ? 'bg-[#2B1B14] text-[#FAF5EC] shadow-xs'
                : 'text-[#4A372F] hover:text-[#2B1B14]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Highest Paid Bills ({topBills.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'customers'
                ? 'bg-[#2B1B14] text-[#FAF5EC] shadow-xs'
                : 'text-[#4A372F] hover:text-[#2B1B14]'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-[#C65D3B]" />
            <span>Top Patrons CRM ({topCustomers.length})</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF5EC] p-3 border border-[#B98A5E]/30 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B98A5E]" />
          <input
            type="text"
            placeholder={activeTab === 'bills' ? 'Search customer, phone, bill #...' : 'Search patron name or phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F4EBDD] border border-[#B98A5E]/50 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
          />
        </div>

        {/* Time filters for bills */}
        {activeTab === 'bills' && (
          <div className="flex items-center gap-1">
            <span className="text-[#4A372F] mr-1">Period:</span>
            {(['today', 'week', 'month', 'all'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeFilter(t)}
                className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                  timeFilter === t
                    ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                    : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40 hover:border-[#2B1B14]'
                }`}
              >
                {t === 'today' ? 'Today' : t === 'week' ? 'Week' : t === 'month' ? 'Month' : 'All Time'}
              </button>
            ))}
          </div>
        )}

        {/* CSV Export Button */}
        <button
          type="button"
          onClick={activeTab === 'bills' ? handleExportBillsCSV : handleExportCustomersCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#B98A5E]/50 bg-[#F4EBDD] hover:bg-[#E7D6BE] text-[#2B1B14] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#B98A5E]" />
          <span>Export Leaderboard</span>
        </button>
      </div>

      {/* VIEW A: TOP BILLS LEADERBOARD */}
      {activeTab === 'bills' && (
        <div className="space-y-3">
          {topBills.length === 0 ? (
            <div className="paper-sheet p-8 text-center border border-[#B98A5E]/40 text-xs">
              No bills found for this search or period.
            </div>
          ) : (
            topBills.map((order, index) => {
              // Stamp badges for #1 Gold, #2 Silver, #3 Bronze
              const isGold = index === 0;
              const isSilver = index === 1;
              const isBronze = index === 2;

              return (
                <div
                  key={order.id}
                  onClick={() => setViewingBillOrder(order)}
                  className={`paper-sheet paper-sheet-hover p-4 sm:p-5 border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isGold
                      ? 'border-[#C65D3B] bg-[#FFFBF5] shadow-md ring-1 ring-[#C65D3B]/30'
                      : 'border-[#B98A5E]/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Stamp Badge */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 font-serif-display font-bold text-sm ${
                        isGold
                          ? 'bg-[#E5B358] text-[#2B1B14] border-[#B8860B] shadow-sm'
                          : isSilver
                          ? 'bg-[#D6D6D6] text-[#2B1B14] border-[#9E9E9E]'
                          : isBronze
                          ? 'bg-[#CD7F32] text-white border-[#8B4513]'
                          : 'bg-[#F4EBDD] text-[#4A372F] border-[#B98A5E]/50'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Customer & Bill Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A372F]">
                        <span className="font-semibold text-[#2B1B14]">{order.orderNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>{order.createdAt.split('T')[0]}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#C65D3B] font-medium">
                          {order.orderType === 'dine-in' ? `Table ${order.tableNumber}` : 'Takeaway'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase">{order.paymentMethod}</span>
                      </div>

                      <h3 className="font-serif-display text-lg font-semibold text-[#2B1B14] mt-0.5">
                        {order.customerName}
                        <span className="text-xs font-sans text-[#4A372F] font-normal ml-2">
                          ({order.phone})
                        </span>
                      </h3>

                      {/* Items ordered summary */}
                      <p className="text-xs text-[#4A372F] mt-1 line-clamp-1">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' · ')}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Amount & Cashier */}
                  <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-2 md:pt-0 border-dashed border-[#B98A5E]/40">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-[#4A372F] uppercase block">Total Bill</span>
                      <span className="font-serif-display text-2xl font-bold text-[#C65D3B] tabular-nums block">
                        {formatINR(order.total)}
                      </span>
                      <span className="text-[11px] text-[#4A372F] block">
                        Host: {order.handledBy || 'Arjun Mehta'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-2 border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] cursor-pointer"
                      title="View & Print Bill Receipt"
                    >
                      <Receipt className="w-4 h-4 text-[#C65D3B]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW B: TOP CUSTOMERS LEADERBOARD */}
      {activeTab === 'customers' && (
        <div className="space-y-3">
          {/* Mobile Stacked Cards Layout (< 768px) */}
          <div className="block md:hidden space-y-3">
            {topCustomers.map((cust, idx) => (
              <div
                key={cust.id}
                className="paper-sheet paper-grain p-4 border border-[#B98A5E]/40 space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between border-b border-[#B98A5E]/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-bold font-serif-display ${
                        idx === 0
                          ? 'bg-[#E5B358] text-[#2B1B14]'
                          : idx === 1
                          ? 'bg-[#D6D6D6] text-[#2B1B14]'
                          : idx === 2
                          ? 'bg-[#CD7F32] text-white'
                          : 'bg-[#FAF5EC] text-[#4A372F] border border-[#B98A5E]/40'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-serif-display font-semibold text-base text-[#2B1B14] block">
                        {cust.name}
                      </span>
                      <span className="text-xs text-[#4A372F] font-mono">{cust.phone}</span>
                    </div>
                  </div>
                  {cust.tags.includes('VIP') ? (
                    <span className="px-2 py-0.5 bg-[#C65D3B] text-white text-[10px] font-semibold uppercase tracking-wider">
                      VIP
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#FAF5EC] border border-[#B98A5E]/40 text-[#4A372F] text-[10px]">
                      Regular
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-[#4A372F] uppercase block">Visits</span>
                    <span className="font-mono font-bold text-[#2B1B14] tabular-nums">{cust.totalVisits}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4A372F] uppercase block">Avg Bill</span>
                    <span className="font-mono font-medium text-[#4A372F] tabular-nums">{formatINR(cust.averageBill)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#4A372F] uppercase block">Total Spent</span>
                    <span className="font-serif-display font-bold text-sm text-[#C65D3B] tabular-nums">
                      {formatINR(cust.totalSpent)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-[#B98A5E]/20 text-[11px] text-[#4A372F] flex items-center justify-between">
                  <span>Fav: {cust.favoriteItems[0] || 'Cardamom Cortado'}</span>
                  <span>Last: {cust.lastVisit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / Tablet Table */}
          <div className="hidden md:block paper-sheet border border-[#B98A5E]/40 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#E7D6BE] border-b border-[#B98A5E]/40 text-[#4A372F] uppercase tracking-wider text-[10px] shadow-xs">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Mobile Contact</th>
                    <th className="p-3 text-center">Visits</th>
                    <th className="p-3 text-right">Lifetime Spend</th>
                    <th className="p-3 text-right">Avg Bill</th>
                    <th className="p-3">Top Favorite Item</th>
                    <th className="p-3 text-center">Patron Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B98A5E]/20 text-[#2B1B14]">
                  {topCustomers.map((cust, idx) => (
                    <tr key={cust.id} className="hover:bg-[#FAF5EC]/70 transition-colors">
                      <td className="p-3 font-semibold tabular-nums text-center">
                        {idx === 0 ? (
                          <span className="inline-block px-2 py-0.5 bg-[#E5B358] text-[#2B1B14] font-bold">#1</span>
                        ) : idx === 1 ? (
                          <span className="inline-block px-2 py-0.5 bg-[#D6D6D6] text-[#2B1B14] font-bold">#2</span>
                        ) : idx === 2 ? (
                          <span className="inline-block px-2 py-0.5 bg-[#CD7F32] text-white font-bold">#3</span>
                        ) : (
                          `#${idx + 1}`
                        )}
                      </td>
                      <td className="p-3 font-medium font-serif-display text-sm">
                        {cust.name}
                      </td>
                      <td className="p-3 font-mono text-[#4A372F] tabular-nums">
                        {cust.phone}
                      </td>
                      <td className="p-3 text-center tabular-nums font-semibold">
                        {cust.totalVisits}
                      </td>
                      <td className="p-3 text-right tabular-nums font-bold text-[#C65D3B] text-sm">
                        {formatINR(cust.totalSpent)}
                      </td>
                      <td className="p-3 text-right tabular-nums text-[#4A372F]">
                        {formatINR(cust.averageBill)}
                      </td>
                      <td className="p-3 text-[#4A372F] truncate max-w-[200px]">
                        {cust.favoriteItems[0] || 'Cardamom Cortado'}
                      </td>
                      <td className="p-3 text-center">
                        {cust.tags.includes('VIP') ? (
                          <span className="px-2 py-0.5 bg-[#C65D3B] text-white text-[10px] font-semibold uppercase tracking-wider">
                            VIP Patron
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#FAF5EC] border border-[#B98A5E]/40 text-[#4A372F] text-[10px]">
                            Regular
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* Printable Receipt Modal */}
      {viewingBillOrder && (
        <PrintableBillReceipt
          order={viewingBillOrder}
          onClose={() => setViewingBillOrder(null)}
        />
      )}
    </div>
  );
};
