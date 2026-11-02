import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  MessageCircle,
  Download,
  X,
  Plus,
  Receipt,
  Crown,
} from 'lucide-react';
import { Customer, Order, Booking, OrderItem } from '@atelier/shared';
import { CAFE_CONFIG, formatINR } from '@atelier/shared';
import { cafeStore } from '@atelier/shared';
import { PrintableBillReceipt } from './PrintableBillReceipt';

export const CustomerCRM: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(() => cafeStore.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<'All' | 'VIP' | 'Regular' | 'New'>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (tagFilter !== 'All' && !c.tags.includes(tagFilter as any)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [customers, tagFilter, searchQuery]);

  // Customer order history & bookings
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return cafeStore.getCustomerOrders(selectedCustomer.phone);
  }, [selectedCustomer]);

  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    const cleanPhone = selectedCustomer.phone.replace(/\D/g, '').slice(-10);
    return cafeStore
      .getBookings()
      .filter((b) => b.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
  }, [selectedCustomer]);

  const getCustomerWhatsAppUrl = (cust: Customer) => {
    const text = `Hello ${cust.name}! Greetings from ${CAFE_CONFIG.cafeName}. We would love to welcome you back for our freshly bloomed Worka Sakaro pour-overs and warm Kouign-Amann! Reserve your favorite table anytime.`;
    return `https://wa.me/91${cust.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(text)}`;
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;
    selectedCustomer.notes = selectedCustomer.notes
      ? `${selectedCustomer.notes} | ${newNote.trim()}`
      : newNote.trim();
    setNewNote('');
    // Trigger store update
    setCustomers([...cafeStore.getCustomers()]);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Total Visits', 'Lifetime Spend (INR)', 'Average Bill (INR)', 'First Visit', 'Last Visit', 'Tags', 'Notes'];
    const rows = filteredCustomers.map((c) => [
      `"${c.name}"`,
      c.phone,
      c.email || '',
      c.totalVisits,
      c.totalSpent,
      c.averageBill,
      c.firstVisit,
      c.lastVisit,
      `"${c.tags.join(', ')}"`,
      `"${c.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AtelierVelin-Customers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 shadow-xs">
        <div>
          <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
            Relationship Registry
          </span>
          <h2 className="font-serif-display text-2xl font-semibold text-[#2B1B14] mt-0.5">
            Customer Database & Mini CRM
          </h2>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] text-xs font-medium cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#B98A5E]" />
          <span>Export Customer Directory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF5EC] p-3 border border-[#B98A5E]/30 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B98A5E]" />
          <input
            type="text"
            placeholder="Search patron by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F4EBDD] border border-[#B98A5E]/50 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#4A372F] mr-1">Filter Tag:</span>
          {(['All', 'VIP', 'Regular', 'New'] as const).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTagFilter(tag)}
              className={`px-3 py-1 border transition-colors cursor-pointer ${
                tagFilter === tag
                  ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                  : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40 hover:border-[#2B1B14]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Stacked Cards Layout (< 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="paper-sheet p-8 text-center text-xs text-[#8C7A70] border border-dashed border-[#B98A5E]/40">
            No patrons found matching your search.
          </div>
        ) : (
          filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="paper-sheet paper-grain p-4 border border-[#B98A5E]/40 space-y-3 shadow-xs cursor-pointer hover:border-[#2B1B14] transition-colors"
            >
              <div className="flex items-start justify-between border-b border-[#B98A5E]/30 pb-2">
                <div>
                  <span className="font-serif-display font-semibold text-base text-[#2B1B14] block">
                    {cust.name}
                  </span>
                  <span className="text-xs text-[#4A372F] font-mono tabular-nums">{cust.phone}</span>
                </div>
                {cust.tags.includes('VIP') ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#C65D3B] text-white text-[10px] font-semibold uppercase">
                    <Crown className="w-3 h-3" />
                    VIP
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-[#FAF5EC] border border-[#B98A5E]/50 text-[#2B1B14] text-[10px] font-medium">
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
                  <span className="text-[10px] text-[#4A372F] uppercase block">Lifetime</span>
                  <span className="font-serif-display font-bold text-[#C65D3B] tabular-nums">{formatINR(cust.totalSpent)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#B98A5E]/20 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-[#4A372F]">Last: {cust.lastVisit}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={getCustomerWhatsAppUrl(cust)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#2E7D32]/50 bg-[#FAF5EC] text-[#2E7D32] hover:bg-[#E8F5E9] cursor-pointer"
                    title="Send WhatsApp Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${cust.phone}`}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#B98A5E]/50 bg-[#FAF5EC] text-[#2B1B14] hover:bg-[#E7D6BE] cursor-pointer"
                    title="Call Customer"
                  >
                    <Phone className="w-4 h-4 text-[#B98A5E]" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Customers Table (Desktop/Tablet) */}
      <div className="hidden md:block paper-sheet border border-[#B98A5E]/40 overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#E7D6BE] border-b border-[#B98A5E]/40 text-[#4A372F] uppercase tracking-wider text-[10px] shadow-xs">
              <tr>
                <th className="p-3">Patron Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3 text-center">Visits</th>
                <th className="p-3 text-right">Lifetime Spend</th>
                <th className="p-3 text-right">Avg Bill</th>
                <th className="p-3">Last Visit</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B98A5E]/20 text-[#2B1B14]">
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="hover:bg-[#FAF5EC]/70 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-serif-display font-semibold text-sm">
                    {cust.name}
                  </td>
                  <td className="p-3 font-mono text-[#4A372F] tabular-nums">
                    {cust.phone}
                  </td>
                  <td className="p-3 text-[#4A372F] truncate max-w-[160px]">
                    {cust.email || '—'}
                  </td>
                  <td className="p-3 text-center tabular-nums font-semibold">
                    {cust.totalVisits}
                  </td>
                  <td className="p-3 text-right tabular-nums font-bold text-[#C65D3B]">
                    {formatINR(cust.totalSpent)}
                  </td>
                  <td className="p-3 text-right tabular-nums text-[#4A372F]">
                    {formatINR(cust.averageBill)}
                  </td>
                  <td className="p-3 text-[#4A372F] tabular-nums">
                    {cust.lastVisit}
                  </td>
                  <td className="p-3">
                    {cust.tags.includes('VIP') ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#C65D3B] text-white text-[10px] font-semibold uppercase">
                        <Crown className="w-3 h-3" />
                        VIP
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-[#FAF5EC] border border-[#B98A5E]/50 text-[#2B1B14] text-[10px]">
                        Regular
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={getCustomerWhatsAppUrl(cust)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block p-1.5 border border-[#2E7D32]/50 bg-[#FAF5EC] text-[#2E7D32] hover:bg-[#E8F5E9] cursor-pointer"
                      title="Send WhatsApp Message"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`tel:${cust.phone}`}
                      className="inline-block p-1.5 border border-[#B98A5E]/50 bg-[#FAF5EC] text-[#2B1B14] hover:bg-[#E7D6BE] cursor-pointer"
                      title="Call Customer"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#B98A5E]" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Deep-Dive Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs overflow-y-auto"
          role="dialog"
        >
          <div className="relative w-full max-w-2xl paper-sheet paper-grain p-6 sm:p-8 my-8 border border-[#B98A5E]/40 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#B98A5E]/40 pb-4">
              <div>
                <span className="text-xs text-[#4A372F]">Patron Profile Dossier</span>
                <h3 className="font-serif-display text-2xl font-semibold text-[#2B1B14]">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-[#4A372F] mt-0.5 font-mono">
                  {selectedCustomer.phone} {selectedCustomer.email ? `· ${selectedCustomer.email}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getCustomerWhatsAppUrl(selectedCustomer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-medium cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 text-[#4A372F] hover:text-[#2B1B14]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-dashed border-[#B98A5E]/40 text-center">
              <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
                <span className="text-[10px] text-[#4A372F] uppercase">Lifetime Spend</span>
                <p className="font-serif-display text-lg font-bold text-[#C65D3B] tabular-nums mt-0.5">
                  {formatINR(selectedCustomer.totalSpent)}
                </p>
              </div>
              <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
                <span className="text-[10px] text-[#4A372F] uppercase">Total Visits</span>
                <p className="font-serif-display text-lg font-bold text-[#2B1B14] tabular-nums mt-0.5">
                  {selectedCustomer.totalVisits}
                </p>
              </div>
              <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
                <span className="text-[10px] text-[#4A372F] uppercase">Average Bill</span>
                <p className="font-serif-display text-lg font-bold text-[#2B1B14] tabular-nums mt-0.5">
                  {formatINR(selectedCustomer.averageBill)}
                </p>
              </div>
              <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
                <span className="text-[10px] text-[#4A372F] uppercase">Member Status</span>
                <p className="font-serif-display text-sm font-semibold text-[#2B1B14] mt-1">
                  {selectedCustomer.tags.join(' · ')}
                </p>
              </div>
            </div>

            {/* Favorite Items */}
            {selectedCustomer.favoriteItems && selectedCustomer.favoriteItems.length > 0 && (
              <div className="py-3 border-b border-dashed border-[#B98A5E]/40">
                <span className="text-xs font-semibold text-[#2B1B14] block mb-1.5">
                  Favorite Brews & Viennoiserie:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCustomer.favoriteItems.map((fav) => (
                    <span key={fav} className="px-2.5 py-1 bg-[#FAF5EC] border border-[#B98A5E]/40 text-xs text-[#2B1B14]">
                      {fav}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="py-3 border-b border-dashed border-[#B98A5E]/40 space-y-2">
              <span className="text-xs font-semibold text-[#2B1B14] block">
                Barista Marginalia & Patron Preferences:
              </span>
              <p className="font-handwritten text-lg text-[#4A372F] bg-[#FAF5EC] p-3 border border-[#B98A5E]/30">
                {selectedCustomer.notes || 'No custom notes recorded yet.'}
              </p>

              <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add note (e.g. prefers table 02, dairy allergic, birthday in Dec)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#FAF5EC] border border-[#B98A5E]/50 text-[#2B1B14]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#2B1B14] text-[#FAF5EC] text-xs font-medium cursor-pointer"
                >
                  Append Note
                </button>
              </form>
            </div>

            {/* Past Orders History */}
            <div className="pt-4 space-y-2">
              <span className="text-xs font-semibold text-[#2B1B14] block">
                Complete Bill History ({customerOrders.length} records)
              </span>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {customerOrders.map((ord: Order) => (
                  <div
                    key={ord.id}
                    onClick={() => setViewingReceiptOrder(ord)}
                    className="paper-sheet p-3 border border-[#B98A5E]/40 flex items-center justify-between text-xs hover:border-[#2B1B14] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2B1B14]">{ord.orderNumber}</span>
                        <span className="text-[#4A372F] tabular-nums">{ord.createdAt.split('T')[0]}</span>
                        <span className="text-[10px] uppercase text-[#C65D3B]">
                          {ord.orderType === 'dine-in' ? `Table ${ord.tableNumber}` : 'Takeaway'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4A372F] mt-0.5 truncate max-w-sm">
                        {ord.items.map((i: OrderItem) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-serif-display font-semibold text-sm text-[#2B1B14] tabular-nums block">
                        {formatINR(ord.total)}
                      </span>
                      <span className="text-[10px] text-[#2E7D32] uppercase font-semibold">
                        {ord.paymentStatus} ({ord.paymentMethod})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
