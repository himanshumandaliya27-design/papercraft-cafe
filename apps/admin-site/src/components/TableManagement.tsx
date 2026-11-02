import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Check,
  X,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import { TableLiveState, Booking, Order, TableStatus } from '@atelier/shared';
import { CAFE_CONFIG, formatINR } from '@atelier/shared';
import { cafeStore } from '@atelier/shared';
import { PrintableBillReceipt } from './PrintableBillReceipt';

export const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<TableLiveState[]>(() => cafeStore.getTables());
  const [bookings, setBookings] = useState<Booking[]>(() => cafeStore.getBookings());
  const [selectedTable, setSelectedTable] = useState<TableLiveState | null>(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  // Manual booking form state
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualGuests, setManualGuests] = useState(2);
  const [manualTable, setManualTable] = useState(3);
  const [manualTime, setManualTime] = useState('02:00 PM');
  const [manualOccasion, setManualOccasion] = useState<any>('Casual');

  // Table Merge & Split State
  const [isMerging, setIsMerging] = useState(false);
  const [mergeTargetNumbers, setMergeTargetNumbers] = useState<number[]>([]);

  useEffect(() => {
    const unsub = cafeStore.subscribe(() => {
      setTables([...cafeStore.getTables()]);
      setBookings([...cafeStore.getBookings()]);
    });
    return unsub;
  }, []);

  const handleExecuteMerge = async (primaryNumber: number) => {
    if (mergeTargetNumbers.length === 0) return;
    await cafeStore.mergeTables(primaryNumber, mergeTargetNumbers);
    setIsMerging(false);
    setMergeTargetNumbers([]);
    const updated = cafeStore.getTables().find((t) => t.number === primaryNumber);
    if (updated) setSelectedTable(updated);
  };

  const handleSplitTable = async (tableNumber: number) => {
    await cafeStore.splitTable(tableNumber);
    const updated = cafeStore.getTables().find((t) => t.number === tableNumber);
    if (updated) setSelectedTable(updated);
  };

  const handleUpdateTableStatus = (tableId: string, status: TableStatus) => {
    cafeStore.updateTableStatus(tableId, status);
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleSaveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) return;

    await cafeStore.createBooking({
      customerName: manualName.trim(),
      phone: manualPhone.replace(/\D/g, '').slice(-10),
      date: selectedBookingDate,
      timeSlot: manualTime,
      guests: manualGuests,
      tableNumber: manualTable,
      occasion: manualOccasion,
      status: 'confirmed',
    });

    setIsManualBookingOpen(false);
    setManualName('');
    setManualPhone('');
  };

  const activeOrderForSelectedTable = selectedTable?.activeOrderId
    ? cafeStore.getOrders().find((o) => o.id === selectedTable.activeOrderId)
    : null;

  const filteredBookings = bookings.filter((b) => b.date === selectedBookingDate);

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'free':
        return <span className="px-2 py-0.5 bg-[#FAF5EC] border border-[#2E7D32] text-[#2E7D32] text-[10px] font-semibold uppercase">Free</span>;
      case 'occupied':
        return <span className="px-2 py-0.5 bg-[#C65D3B] text-white text-[10px] font-semibold uppercase">Occupied</span>;
      case 'booked':
        return <span className="px-2 py-0.5 bg-[#B98A5E] text-white text-[10px] font-semibold uppercase">Booked</span>;
      case 'needs-cleaning':
        return <span className="px-2 py-0.5 bg-[#4A372F] text-white text-[10px] font-semibold uppercase">Needs Cleaning</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 shadow-xs">
        <div>
          <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
            Spatial Architecture
          </span>
          <h2 className="font-serif-display text-2xl font-semibold text-[#2B1B14] mt-0.5">
            Live Table Map & Floor Plan Ledger
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManualBookingOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Walk-in / Phone Booking</span>
          </button>
        </div>
      </div>

      {/* Grid: Left 8 Cols (Interactive Floor Plan) + Right 4 Cols (Table Detail Sheet) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Visual Floor Plan */}
        <div className="lg:col-span-8 paper-sheet p-5 border border-[#B98A5E]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs">
            <span className="font-semibold text-[#2B1B14]">
              Courtyard & Roastery Floor Plan (Tap Table for Order/Status)
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FAF5EC] border border-[#2E7D32]" /> Free
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C65D3B]" /> Occupied
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B98A5E]" /> Booked
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4A372F]" /> Needs Cleaning
              </span>
            </div>
          </div>

          {/* Interactive Layout Viewport */}
          <div className="relative w-full h-80 sm:h-96 bg-[#E8DAC2] border border-[#B98A5E]/50 overflow-hidden p-3 select-none">
            <span className="absolute top-2 left-3 text-[10px] text-[#4A372F]/70 tracking-widest uppercase font-mono">
              WINDOW LINEN CORRIDOR
            </span>
            <span className="absolute top-1/2 -translate-y-1/2 left-3 text-[10px] text-[#4A372F]/70 tracking-widest uppercase font-mono">
              SUNLIT COURTYARD
            </span>
            <span className="absolute bottom-2 left-3 text-[10px] text-[#4A372F]/70 tracking-widest uppercase font-mono">
              READING NOOK
            </span>
            <span className="absolute top-3 right-3 text-[10px] text-[#4A372F]/70 tracking-widest uppercase font-mono">
              ROASTERY BAR
            </span>

            {CAFE_CONFIG.tables.map((tConfig) => {
              const liveState = tables.find((t) => t.number === tConfig.number);
              const status: TableStatus = liveState?.status || 'free';
              const isSelected = selectedTable?.number === tConfig.number;

              return (
                <button
                  key={tConfig.id}
                  type="button"
                  onClick={() => setSelectedTable(liveState || null)}
                  style={{
                    left: `${tConfig.x}%`,
                    top: `${tConfig.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute p-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                    tConfig.shape === 'circle' ? 'rounded-full w-14 h-14' : 'rounded-xs w-16 h-14'
                  } ${
                    isSelected
                      ? 'ring-4 ring-[#2B1B14] shadow-lg scale-105'
                      : 'shadow-xs hover:scale-103'
                  } ${
                    status === 'occupied'
                      ? 'bg-[#C65D3B] text-white'
                      : status === 'booked'
                      ? 'bg-[#B98A5E] text-white'
                      : status === 'needs-cleaning'
                      ? 'bg-[#4A372F] text-white'
                      : 'bg-[#FAF5EC] text-[#2B1B14] border border-[#B98A5E]'
                  }`}
                  title={`${tConfig.label} (${tConfig.capacity}p) - ${status.toUpperCase()}`}
                >
                  <span className="font-serif-display font-bold text-xs tabular-nums">
                    T{tConfig.number}
                  </span>
                  <span className="text-[10px] opacity-80 tabular-nums">
                    {tConfig.capacity}p
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Selected Table Dossier & Quick Actions */}
        <div className="lg:col-span-4 paper-sheet-kraft p-5 border border-[#B98A5E]/50 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#B98A5E]/40 pb-3 mb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#4A372F] uppercase">Table Dossier</span>
                <h3 className="font-serif-display text-xl font-semibold text-[#2B1B14]">
                  {selectedTable ? selectedTable.label : 'Select a Table'}
                </h3>
              </div>
              {selectedTable && getStatusBadge(selectedTable.status)}
            </div>

            {selectedTable ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[#4A372F]">
                  <div>
                    <span className="block text-[10px]">Zone</span>
                    <span className="font-semibold text-[#2B1B14]">{selectedTable.zone}</span>
                  </div>
                  <div>
                    <span className="block text-[10px]">Max Capacity</span>
                    <span className="font-semibold text-[#2B1B14] tabular-nums">
                      {selectedTable.capacity} Guests
                    </span>
                  </div>
                </div>

                {/* Active Order Details if Occupied */}
                {activeOrderForSelectedTable ? (
                  <div className="paper-sheet p-3.5 border border-[#B98A5E]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#2B1B14]">
                        {activeOrderForSelectedTable.orderNumber}
                      </span>
                      <span className="font-serif-display text-sm font-bold text-[#C65D3B] tabular-nums">
                        {formatINR(activeOrderForSelectedTable.total)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A372F]">
                      Guest: {activeOrderForSelectedTable.customerName} ({activeOrderForSelectedTable.phone})
                    </p>

                    <div className="border-t border-dashed border-[#B98A5E]/30 pt-1.5 space-y-1">
                      {activeOrderForSelectedTable.items.map((i) => (
                        <div key={i.id} className="flex justify-between text-[11px]">
                          <span>{i.quantity}x {i.name}</span>
                          <span className="tabular-nums">{formatINR(i.itemTotal)}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewingReceiptOrder(activeOrderForSelectedTable)}
                      className="w-full mt-2 py-1.5 bg-[#2B1B14] text-[#FAF5EC] text-xs font-medium cursor-pointer"
                    >
                      Print Bill / Settle
                    </button>
                  </div>
                ) : (
                  <p className="text-[#4A372F] italic py-2">
                    No active kitchen order on this table.
                  </p>
                )}

                {/* Quick Status Control Buttons */}
                <div className="pt-2 border-t border-[#B98A5E]/40 space-y-1.5">
                  <span className="block text-[10px] text-[#4A372F] uppercase">
                    Change Status
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateTableStatus(selectedTable.id, 'free')}
                      className="px-2 py-1.5 bg-[#FAF5EC] border border-[#2E7D32] text-[#2E7D32] font-medium hover:bg-[#E8F5E9] cursor-pointer"
                    >
                      Mark Free
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTableStatus(selectedTable.id, 'occupied')}
                      className="px-2 py-1.5 bg-[#FAF5EC] border border-[#C65D3B] text-[#C65D3B] font-medium hover:bg-[#FBE9E7] cursor-pointer"
                    >
                      Mark Occupied
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTableStatus(selectedTable.id, 'booked')}
                      className="px-2 py-1.5 bg-[#FAF5EC] border border-[#B98A5E] text-[#B98A5E] font-medium hover:bg-[#EFE3CF] cursor-pointer"
                    >
                      Mark Booked
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTableStatus(selectedTable.id, 'needs-cleaning')}
                      className="px-2 py-1.5 bg-[#FAF5EC] border border-[#4A372F] text-[#4A372F] font-medium hover:bg-[#D7CCC8] cursor-pointer"
                    >
                      Needs Cleaning
                    </button>
                  </div>
                </div>

                {/* Large Party Merge / Split Controls */}
                <div className="pt-2 border-t border-[#B98A5E]/40 space-y-1.5">
                  <span className="block text-[10px] text-[#4A372F] uppercase">
                    Large Party Merge & Split
                  </span>

                  {(selectedTable.mergedWith && selectedTable.mergedWith.length > 0) || selectedTable.isMergedChild ? (
                    <div className="p-2.5 bg-[#FAF5EC] border border-[#C65D3B]/40 space-y-2">
                      <div className="text-[11px] text-[#4A372F]">
                        <span className="font-semibold text-[#C65D3B]">Merged Party Table</span>
                        <p className="mt-0.5">
                          {selectedTable.isMergedChild
                            ? `Slaved to parent Table ${selectedTable.mergedWith?.[0]}`
                            : `Joined with Table(s): ${selectedTable.mergedWith?.join(', ')}`}
                          {` (Total capacity: ${selectedTable.capacity} guests)`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSplitTable(selectedTable.number)}
                        className="w-full py-1.5 bg-[#FAF5EC] border border-[#C65D3B] text-[#C65D3B] font-medium hover:bg-[#FBE9E7] cursor-pointer text-xs flex items-center justify-center gap-1"
                      >
                        <span>Unmerge & Split Tables</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {!isMerging ? (
                        <button
                          type="button"
                          onClick={() => setIsMerging(true)}
                          className="w-full py-1.5 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-medium hover:bg-[#E7D6BE] cursor-pointer text-xs flex items-center justify-center gap-1"
                        >
                          <span>Merge with Table for Large Party...</span>
                        </button>
                      ) : (
                        <div className="p-2.5 bg-[#FAF5EC] border border-[#B98A5E]/60 space-y-2">
                          <span className="text-[11px] font-semibold text-[#2B1B14] block">
                            Select adjacent table to merge with T{selectedTable.number}:
                          </span>
                          <div className="grid grid-cols-3 gap-1">
                            {tables
                              .filter((t) => t.number !== selectedTable.number && !t.isMergedChild && (!t.mergedWith || t.mergedWith.length === 0))
                              .map((otherTable) => {
                                const isPicked = mergeTargetNumbers.includes(otherTable.number);
                                return (
                                  <button
                                    key={otherTable.number}
                                    type="button"
                                    onClick={() => {
                                      setMergeTargetNumbers((prev) =>
                                        prev.includes(otherTable.number)
                                          ? prev.filter((n) => n !== otherTable.number)
                                          : [...prev, otherTable.number]
                                      );
                                    }}
                                    className={`p-1.5 text-[11px] border text-center font-mono cursor-pointer ${
                                      isPicked
                                        ? 'bg-[#C65D3B] text-white border-[#C65D3B]'
                                        : 'bg-white text-[#2B1B14] border-[#B98A5E]/40 hover:bg-[#F4EBDD]'
                                    }`}
                                  >
                                    T{otherTable.number} ({otherTable.capacity}p)
                                  </button>
                                );
                              })}
                          </div>
                          <div className="flex gap-1.5 pt-1">
                            <button
                              type="button"
                              disabled={mergeTargetNumbers.length === 0}
                              onClick={() => handleExecuteMerge(selectedTable.number)}
                              className="flex-1 py-1 bg-[#2B1B14] text-[#FAF5EC] font-semibold text-xs cursor-pointer disabled:opacity-40"
                            >
                              Confirm ({mergeTargetNumbers.length + 1} Tables)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsMerging(false);
                                setMergeTargetNumbers([]);
                              }}
                              className="px-2 py-1 border border-[#B98A5E]/50 text-xs text-[#4A372F] cursor-pointer hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#4A372F] italic py-6 text-center">
                Click any table on the floor plan to inspect bill or update status.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Ledger Calendar / List View */}
      <div className="paper-sheet p-5 sm:p-6 border border-[#B98A5E]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[10px] text-[#4A372F] uppercase tracking-wider font-mono">
              Reservations Roster
            </span>
            <h3 className="font-serif-display text-xl font-semibold text-[#2B1B14]">
              Table Bookings for {selectedBookingDate}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#4A372F]">Select Date:</span>
            <input
              type="date"
              value={selectedBookingDate}
              onChange={(e) => setSelectedBookingDate(e.target.value)}
              className="px-2.5 py-1 bg-[#FAF5EC] border border-[#B98A5E]/50 text-[#2B1B14] tabular-nums"
            />
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8C7A70] italic border border-dashed border-[#B98A5E]/40">
            No table reservations scheduled for {selectedBookingDate}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E7D6BE]/60 border-b border-[#B98A5E]/40 text-[#4A372F] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5">Ref ID</th>
                  <th className="p-2.5">Guest</th>
                  <th className="p-2.5">Mobile</th>
                  <th className="p-2.5">Time Slot</th>
                  <th className="p-2.5">Table</th>
                  <th className="p-2.5">Party</th>
                  <th className="p-2.5">Occasion</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B98A5E]/20 text-[#2B1B14]">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF5EC]/70">
                    <td className="p-2.5 font-mono font-semibold">#{b.id}</td>
                    <td className="p-2.5 font-medium">{b.customerName}</td>
                    <td className="p-2.5 font-mono text-[#4A372F]">{b.phone}</td>
                    <td className="p-2.5 tabular-nums">{b.timeSlot}</td>
                    <td className="p-2.5 font-semibold text-[#C65D3B]">Table {b.tableNumber}</td>
                    <td className="p-2.5 tabular-nums">{b.guests} guests</td>
                    <td className="p-2.5">{b.occasion}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                          b.status === 'confirmed'
                            ? 'bg-[#2E7D32] text-white'
                            : b.status === 'seated'
                            ? 'bg-[#C65D3B] text-white'
                            : 'bg-[#4A372F] text-white'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right space-x-1">
                      {b.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => cafeStore.updateBookingStatus(b.id, 'seated')}
                          className="px-2 py-0.5 bg-[#2B1B14] text-[#FAF5EC] text-[10px] cursor-pointer hover:bg-[#3d281f]"
                        >
                          Seat Guest
                        </button>
                      )}
                      {b.status === 'seated' && (
                        <button
                          type="button"
                          onClick={() => cafeStore.updateBookingStatus(b.id, 'completed')}
                          className="px-2 py-0.5 bg-[#2E7D32] text-white text-[10px] cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Booking Entry Modal */}
      {isManualBookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs"
          role="dialog"
        >
          <div className="relative w-full max-w-md paper-sheet paper-grain p-6">
            <div className="flex items-start justify-between border-b border-[#B98A5E]/40 pb-3">
              <div>
                <span className="text-xs text-[#4A372F]">Counter Walk-in / Phone Inbound</span>
                <h3 className="font-serif-display text-xl font-semibold text-[#2B1B14]">
                  Record Manual Reservation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualBookingOpen(false)}
                className="p-1 text-[#4A372F] hover:text-[#2B1B14]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualBooking} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#4A372F] mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Roy"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#4A372F] mb-1">Mobile Contact *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9820199999"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] tabular-nums"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-[#4A372F] mb-1">Guests</label>
                  <select
                    value={manualGuests}
                    onChange={(e) => setManualGuests(Number(e.target.value))}
                    className="w-full px-2 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                      <option key={n} value={n}>{n} Guests</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#4A372F] mb-1">Table</label>
                  <select
                    value={manualTable}
                    onChange={(e) => setManualTable(Number(e.target.value))}
                    className="w-full px-2 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                  >
                    {CAFE_CONFIG.tables.map((t) => (
                      <option key={t.id} value={t.number}>Table {t.number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#4A372F] mb-1">Slot</label>
                  <input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full px-2 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#B98A5E]/30 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualBookingOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#4A372F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C65D3B] text-white text-xs font-serif-display font-semibold cursor-pointer"
                >
                  Save Booking
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
