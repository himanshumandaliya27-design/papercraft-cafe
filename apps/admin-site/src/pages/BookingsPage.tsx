import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Filter,
  Search,
  Check,
  User,
  Phone,
} from 'lucide-react';
import { Booking, CAFE_CONFIG, cafeStore } from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(() => cafeStore.getBookings());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Walk-in modal
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInGuests, setWalkInGuests] = useState(2);
  const [walkInTable, setWalkInTable] = useState(1);
  const [walkInSlot, setWalkInSlot] = useState('11:00 AM');

  useEffect(() => {
    const unsub = cafeStore.subscribe(() => {
      setBookings([...cafeStore.getBookings()]);
    });
    return unsub;
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (selectedDate && b.date !== selectedDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = (bookingId: string, status: Booking['status']) => {
    cafeStore.updateBookingStatus(bookingId, status);
  };

  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInPhone.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    cafeStore.createBooking({
      customerName: walkInName.trim(),
      phone: walkInPhone.replace(/\D/g, '').slice(-10),
      date: todayStr,
      timeSlot: walkInSlot,
      guests: walkInGuests,
      tableNumber: walkInTable,
      occasion: 'Casual',
      status: 'seated',
      specialRequest: 'Walk-in guest logged at counter',
    });

    setShowWalkInModal(false);
    setWalkInName('');
    setWalkInPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Walk-In Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 shadow-xs">
        <div>
          <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
            Table Reservations Ledger
          </span>
          <h2 className="font-serif-display text-2xl font-bold text-[#2B1B14] mt-0.5">
            Bookings & Guest Calendar
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowWalkInModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] font-serif-display text-xs font-semibold hover:bg-[#3d281f] cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#E5B358]" />
          <span>Manual Walk-In Entry</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="paper-sheet p-3.5 border border-[#B98A5E]/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#B98A5E] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, booking ID..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF5EC] border border-[#B98A5E]/50 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
            />
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1.5 bg-[#FAF5EC] border border-[#B98A5E]/50 text-[#2B1B14] font-mono"
            title="Filter by specific date"
          />
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate('')}
              className="text-[#C65D3B] underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {['all', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 uppercase text-[10px] font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                  : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40 hover:border-[#2B1B14]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Stacked Cards Layout (< 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="paper-sheet p-8 text-center text-xs text-[#4A372F] italic border border-dashed border-[#B98A5E]/40">
            No bookings found matching filters.
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="paper-sheet paper-grain p-4 border border-[#B98A5E]/40 space-y-2.5 shadow-xs"
            >
              <div className="flex items-start justify-between border-b border-[#B98A5E]/30 pb-2">
                <div>
                  <span className="font-mono font-bold text-xs text-[#C65D3B]">#{b.id}</span>
                  <span className="font-serif-display font-semibold text-base text-[#2B1B14] block">
                    {b.customerName}
                  </span>
                  <span className="text-xs text-[#4A372F] font-mono">{b.phone}</span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    b.status === 'confirmed'
                      ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/30'
                      : b.status === 'seated'
                      ? 'bg-[#E5B358]/20 text-[#8E5D1E] border border-[#E5B358]/40'
                      : b.status === 'completed'
                      ? 'bg-[#2B1B14]/10 text-[#2B1B14]'
                      : 'bg-[#C65D3B]/10 text-[#C65D3B]'
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#4A372F] uppercase block">Slot</span>
                  <span className="font-mono text-[#2B1B14] font-medium">{b.date} · {b.timeSlot}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#4A372F] uppercase block">Seating</span>
                  <span className="font-semibold text-[#2B1B14]">Table {b.tableNumber} ({b.guests}p)</span>
                </div>
              </div>

              {b.specialRequest && (
                <div className="p-1.5 bg-[#FAF5EC] border-l-2 border-[#B98A5E] text-[11px] text-[#4A372F]">
                  {b.specialRequest}
                </div>
              )}

              <div className="pt-2 border-t border-[#B98A5E]/20 flex items-center justify-end gap-2 flex-wrap">
                {b.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'seated')}
                    className="px-3 py-1.5 min-h-[36px] bg-[#2E7D32] text-white text-xs font-semibold hover:bg-[#256629] cursor-pointer"
                  >
                    Seat Guest
                  </button>
                )}
                {b.status === 'seated' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'completed')}
                    className="px-3 py-1.5 min-h-[36px] bg-[#2B1B14] text-white text-xs font-semibold hover:bg-[#3d281f] cursor-pointer"
                  >
                    Mark Done
                  </button>
                )}
                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                    className="px-3 py-1.5 min-h-[36px] bg-[#E7D6BE] text-[#2B1B14] text-xs hover:bg-[#d8c3a5] cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bookings Table Ledger (Desktop / Tablet) */}
      <div className="hidden md:block paper-sheet paper-grain border border-[#B98A5E]/40 overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#E7D6BE] text-[#2B1B14] font-serif-display font-semibold border-b border-[#B98A5E]/40 shadow-xs">
              <tr>
                <th className="p-3">Ref ID</th>
                <th className="p-3">Date & Slot</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Table</th>
                <th className="p-3">Guests</th>
                <th className="p-3">Occasion</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B98A5E]/30 bg-[#FAF5EC]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#4A372F]">
                    No bookings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F4EBDD]/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#C65D3B]">#{b.id}</td>
                    <td className="p-3 font-mono">
                      <div>{b.date}</div>
                      <div className="text-[11px] text-[#4A372F]">{b.timeSlot}</div>
                    </td>
                    <td className="p-3 font-semibold text-[#2B1B14]">{b.customerName}</td>
                    <td className="p-3 font-mono text-[#4A372F]">{b.phone}</td>
                    <td className="p-3 font-bold text-[#2B1B14]">Table {b.tableNumber}</td>
                    <td className="p-3">{b.guests} Guests</td>
                    <td className="p-3 text-[#4A372F]">{b.occasion}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          b.status === 'confirmed'
                            ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/30'
                            : b.status === 'seated'
                            ? 'bg-[#E5B358]/20 text-[#8E5D1E] border border-[#E5B358]/40'
                            : b.status === 'completed'
                            ? 'bg-[#2B1B14]/10 text-[#2B1B14]'
                            : 'bg-[#C65D3B]/10 text-[#C65D3B]'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      {b.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(b.id, 'seated')}
                          className="px-2 py-1 bg-[#2E7D32] text-white text-[10px] font-semibold hover:bg-[#256629] cursor-pointer"
                        >
                          Seat Guest
                        </button>
                      )}
                      {b.status === 'seated' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(b.id, 'completed')}
                          className="px-2 py-1 bg-[#2B1B14] text-white text-[10px] font-semibold hover:bg-[#3d281f] cursor-pointer"
                        >
                          Mark Done
                        </button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                          className="px-2 py-1 bg-neutral-200 text-neutral-700 text-[10px] hover:bg-neutral-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Walk-in Modal */}
      {showWalkInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md paper-sheet paper-grain p-6 border border-[#B98A5E]/50 shadow-2xl space-y-4">
            <WashiTape variant="terracotta" position="top-center" label="Walk-In Door Entry" />

            <div className="flex items-center justify-between border-b border-[#B98A5E]/40 pb-3 pt-2">
              <h3 className="font-serif-display text-xl font-bold text-[#2B1B14]">
                Register Walk-In Guest
              </h3>
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                className="text-[#4A372F] hover:text-[#2B1B14]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2B1B14] mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Vikram Seth"
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B1B14] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="98200 12345"
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[#2B1B14] mb-1">Guests</label>
                  <select
                    value={walkInGuests}
                    onChange={(e) => setWalkInGuests(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1B14] mb-1">Table</label>
                  <select
                    value={walkInTable}
                    onChange={(e) => setWalkInTable(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
                      <option key={t} value={t}>
                        Table {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B1B14] mb-1">Slot</label>
                  <input
                    type="text"
                    value={walkInSlot}
                    onChange={(e) => setWalkInSlot(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-3 py-1.5 border border-[#B98A5E]/40 text-[#4A372F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2B1B14] text-[#FAF5EC] font-serif-display font-semibold hover:bg-[#3d281f]"
                >
                  Seat Walk-In Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
