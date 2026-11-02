import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Crown,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Receipt,
  MessageCircle,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  Customer,
  Order,
  Booking,
  formatINR,
  formatDateTime,
  CAFE_CONFIG,
  cafeStore,
} from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

export const CustomerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (!id) return;
    const cleanPhone = id.replace(/\D/g, '').slice(-10);
    const c = cafeStore.getCustomerByPhone(cleanPhone);
    if (c) {
      setCustomer(c);
      setOrders(cafeStore.getOrdersByPhone(cleanPhone));
      setBookings(cafeStore.getBookingsByPhone(cleanPhone));
    }
  }, [id]);

  if (!customer) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <h2 className="font-serif-display text-xl font-bold text-[#2B1B14]">
          Customer Record Not Found
        </h2>
        <p className="text-xs text-[#4A372F]">
          No customer profile matching identifier #{id}.
        </p>
        <Link
          to="/customers"
          className="inline-block px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-semibold"
        >
          Return to Customer CRM
        </Link>
      </div>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    customer.notes = customer.notes
      ? `${customer.notes} | ${newNote.trim()}`
      : newNote.trim();

    setNewNote('');
    setCustomer({ ...customer });
  };

  const getWhatsAppUrl = () => {
    const text = `Hello ${customer.name}! Greetings from ${CAFE_CONFIG.cafeName}. We would love to welcome you back for our freshly bloomed pour-overs and warm Kouign-Amann!`;
    return `https://wa.me/91${customer.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/customers"
        className="inline-flex items-center gap-1.5 text-xs text-[#4A372F] hover:text-[#2B1B14]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Customer Directory</span>
      </Link>

      {/* Main Profile Card */}
      <div className="paper-sheet paper-grain p-6 sm:p-8 border border-[#B98A5E]/40 shadow-md space-y-6 relative">
        <WashiTape variant="terracotta" position="top-center" label="Patron CRM Ledger" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B98A5E]/30 pb-4 pt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-display text-3xl font-bold text-[#2B1B14]">
                {customer.name}
              </h1>
              {customer.tags.includes('VIP') && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#C65D3B] text-white text-[10px] font-bold uppercase tracking-wider">
                  <Crown className="w-3 h-3" />
                  VIP Guest
                </span>
              )}
            </div>
            <p className="text-xs text-[#4A372F] mt-1 font-mono">
              +91 {customer.phone} {customer.email ? `· ${customer.email}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-semibold hover:bg-[#256629] cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </a>
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-xs font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-[#B98A5E]" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Lifetime Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="paper-sheet p-3 border border-[#B98A5E]/30">
            <span className="text-[10px] uppercase font-mono text-[#4A372F]">Lifetime Spend</span>
            <p className="font-serif-display text-xl font-bold text-[#C65D3B] tabular-nums mt-0.5">
              {formatINR(customer.totalSpent)}
            </p>
          </div>
          <div className="paper-sheet p-3 border border-[#B98A5E]/30">
            <span className="text-[10px] uppercase font-mono text-[#4A372F]">Total Visits</span>
            <p className="font-serif-display text-xl font-bold text-[#2B1B14] tabular-nums mt-0.5">
              {customer.totalVisits}
            </p>
          </div>
          <div className="paper-sheet p-3 border border-[#B98A5E]/30">
            <span className="text-[10px] uppercase font-mono text-[#4A372F]">Average Bill</span>
            <p className="font-serif-display text-xl font-bold text-[#2B1B14] tabular-nums mt-0.5">
              {formatINR(customer.averageBill)}
            </p>
          </div>
          <div className="paper-sheet p-3 border border-[#B98A5E]/30">
            <span className="text-[10px] uppercase font-mono text-[#4A372F]">First Visit</span>
            <p className="font-serif-display text-xs font-semibold text-[#2B1B14] mt-2">
              {customer.firstVisit}
            </p>
          </div>
        </div>

        {/* Favorite Items & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#B98A5E]/30 pt-4 text-xs">
          <div>
            <span className="font-semibold text-[#2B1B14] block mb-1">
              Favorite Roasts & Pastries:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(customer.favoriteItems || customer.favouriteItems || []).map((it) => (
                <span
                  key={it}
                  className="px-2.5 py-1 bg-[#FAF5EC] border border-[#B98A5E]/40 text-[#2B1B14]"
                >
                  {it}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-semibold text-[#2B1B14] block mb-1">Staff Ledger Notes:</span>
            <p className="text-[#4A372F] italic">
              {customer.notes || 'No specialized preferences noted yet.'}
            </p>

            <form onSubmit={handleAddNote} className="mt-2 flex gap-1.5">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add barista note..."
                className="flex-1 px-2.5 py-1 bg-[#FAF5EC] border border-[#B98A5E]/50 text-xs text-[#2B1B14]"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#2B1B14] text-[#FAF5EC] text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Complete Order History */}
      <div className="space-y-3">
        <h2 className="font-serif-display text-xl font-bold text-[#2B1B14] flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#C65D3B]" />
          <span>Every Bill & Transaction ({orders.length})</span>
        </h2>

        <div className="paper-sheet border border-[#B98A5E]/40 divide-y divide-[#B98A5E]/20 text-xs">
          {orders.length === 0 ? (
            <div className="p-6 text-center text-[#4A372F]">No past orders found.</div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2B1B14]">{ord.orderNumber}</span>
                    <span className="text-[#4A372F]">{formatDateTime(ord.createdAt)}</span>
                    <span className="px-1.5 py-0.5 bg-[#FAF5EC] border border-[#B98A5E]/40 text-[10px] uppercase font-mono">
                      {ord.orderType}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4A372F]">
                    {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-serif-display font-bold text-sm text-[#2B1B14] tabular-nums block">
                    {formatINR(ord.total)}
                  </span>
                  <span className="text-[10px] text-[#2E7D32] uppercase font-semibold">
                    Paid ({ord.paymentMethod})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
