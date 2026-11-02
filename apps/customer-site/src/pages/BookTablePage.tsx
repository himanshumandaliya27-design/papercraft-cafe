import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  Check,
  AlertCircle,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  Booking,
  OrderItem,
  CAFE_CONFIG,
  cafeStore,
} from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

const TIME_SLOTS = [
  '08:00 AM',
  '09:30 AM',
  '11:00 AM',
  '12:30 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
];

const OCCASIONS: ('Casual' | 'Birthday' | 'Date' | 'Meeting' | 'Anniversary' | 'Other')[] = [
  'Casual',
  'Birthday',
  'Date',
  'Meeting',
  'Anniversary',
  'Other',
];

export const BookTablePage: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Form State
  const [date, setDate] = useState<string>(todayStr);
  const [timeSlot, setTimeSlot] = useState<string>('09:30 AM');
  const [guests, setGuests] = useState<number>(2);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [occasion, setOccasion] = useState<
    'Casual' | 'Birthday' | 'Date' | 'Meeting' | 'Anniversary' | 'Other'
  >('Casual');
  const [specialRequest, setSpecialRequest] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Existing bookings for chosen date & time to prevent double-booking
  const existingBookings = useMemo(() => {
    return cafeStore
      .getBookings()
      .filter(
        (b) =>
          b.date === date &&
          b.timeSlot === timeSlot &&
          b.status !== 'cancelled' &&
          b.status !== 'no-show'
      );
  }, [date, timeSlot]);

  // Check if a specific table is available
  const isTableAvailable = (tableNum: number) => {
    return !existingBookings.some((b) => b.tableNumber === tableNum);
  };

  const handleSelectTable = (tableNum: number, capacity: number) => {
    setValidationError(null);
    if (capacity < guests) {
      setValidationError(
        `Table ${tableNum} seats ${capacity} guests. Please choose a table that fits your party of ${guests}.`
      );
      return;
    }
    if (!isTableAvailable(tableNum)) {
      setValidationError(
        `Table ${tableNum} is already reserved for ${timeSlot} on ${date}. Please select an open table or another time.`
      );
      return;
    }
    setSelectedTableNumber(tableNum);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!CAFE_CONFIG.acceptingBookings) {
      setValidationError('Table bookings are currently paused for a private event.');
      return;
    }

    // Check blocked dates from config
    if (CAFE_CONFIG.bookingRules.blockedDates.includes(date)) {
      setValidationError('The cafe is closed for cupping or holiday on the selected date.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number for confirmation.');
      return;
    }
    if (!customerName.trim()) {
      setValidationError('Please enter your full name for the reservation ledger.');
      return;
    }

    if (!isTableAvailable(selectedTableNumber)) {
      setValidationError('Selected table was just booked. Please pick another available table.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await cafeStore.createBooking({
        customerName: customerName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        date,
        timeSlot,
        guests,
        tableNumber: selectedTableNumber,
        occasion,
        specialRequest: specialRequest.trim() || undefined,
        status: 'confirmed',
      });

      navigate(`/booking/${created.id}`);
    } catch (err) {
      console.error('Booking failed', err);
      setValidationError('Could not complete reservation at this time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 pb-20">
      {/* Header */}
      <div className="border-b border-[#B98A5E]/30 pb-4 mb-6">
        <span className="text-xs text-[#4A372F] tracking-wide font-mono uppercase">
          Courtyard & Linen Seating
        </span>
        <h1 className="font-serif-display text-3xl font-bold text-[#2B1B14] mt-0.5">
          Reserve a Table at the Roastery
        </h1>
        <p className="text-xs sm:text-sm text-[#4A372F] mt-1 leading-relaxed">
          Book up to 14 days in advance. 90-minute slow seating with personal roaster cupping notes and linen water service.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Date, Time & Party Size */}
        <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 space-y-5">
          <WashiTape variant="terracotta" position="top-center" label="Step 01 · Schedule & Party Size" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label htmlFor="booking-date" className="block text-xs font-semibold text-[#2B1B14] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#B98A5E]" />
                <span>Date:</span>
              </label>
              <input
                id="booking-date"
                type="date"
                min={todayStr}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono focus:outline-none focus:border-[#C65D3B]"
              />
            </div>

            <div>
              <label htmlFor="booking-time-slot" className="block text-xs font-semibold text-[#2B1B14] mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#B98A5E]" />
                <span>90-Min Time Slot:</span>
              </label>
              <select
                id="booking-time-slot"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono focus:outline-none focus:border-[#C65D3B]"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="booking-party-size" className="block text-xs font-semibold text-[#2B1B14] mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#B98A5E]" />
                <span>Number of Guests:</span>
              </label>
              <select
                id="booking-party-size"
                value={guests}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setGuests(num);
                  // Auto-switch table if current capacity is too small
                  const currentTable = CAFE_CONFIG.tables.find((t) => t.number === selectedTableNumber);
                  if (currentTable && currentTable.capacity < num) {
                    const fitting = CAFE_CONFIG.tables.find((t) => t.capacity >= num && isTableAvailable(t.number));
                    if (fitting) setSelectedTableNumber(fitting.number);
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono focus:outline-none focus:border-[#C65D3B]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <option key={g} value={g}>
                    {g} {g === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Interactive Visual Table Picker */}
        <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 space-y-4">
          <WashiTape variant="kraft" position="top-center" label="Step 02 · Interactive Table Map" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-b border-dashed border-[#B98A5E]/40 pb-3">
            <div>
              <span className="text-xs font-semibold text-[#2B1B14] block">
                Select Your Desired Table:
              </span>
              <span className="text-[11px] text-[#4A372F]">
                Showing real-time availability for <strong>{timeSlot}</strong> on <strong>{date}</strong>
              </span>
            </div>

            {/* Map Legend */}
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#2E7D32] rounded-full" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#C65D3B] rounded-full" />
                <span>Reserved</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#2B1B14] rounded-full" />
                <span>Selected</span>
              </span>
            </div>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CAFE_CONFIG.tables.map((table) => {
              const available = isTableAvailable(table.number);
              const fits = table.capacity >= guests;
              const isSelected = selectedTableNumber === table.number;

              return (
                <button
                  key={table.id}
                  type="button"
                  disabled={!available || !fits}
                  onClick={() => handleSelectTable(table.number, table.capacity)}
                  className={`p-3.5 text-left border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14] shadow-md ring-2 ring-[#C65D3B]'
                      : available && fits
                      ? 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/50 hover:border-[#2B1B14] hover:bg-[#FAF5EC]'
                      : 'bg-neutral-200/50 text-neutral-400 border-neutral-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{table.label}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected
                          ? 'bg-[#E5B358]'
                          : available && fits
                          ? 'bg-[#2E7D32]'
                          : 'bg-[#C65D3B]'
                      }`}
                    />
                  </div>

                  <div className="text-[11px] opacity-80 mt-1">
                    <span>Seats {table.capacity}</span> · <span>{table.zone}</span>
                  </div>

                  {!available && (
                    <span className="text-[9px] uppercase font-mono text-[#C65D3B] block mt-1 font-bold">
                      Booked
                    </span>
                  )}
                  {available && !fits && (
                    <span className="text-[9px] uppercase font-mono text-neutral-500 block mt-1">
                      Too Small
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Guest Dossier & Occasion */}
        <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 space-y-4">
          <WashiTape variant="terracotta" position="top-center" label="Step 03 · Guest Ledger Entry" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="guest-full-name" className="block text-xs font-semibold text-[#2B1B14] mb-1">
                Guest Name (For Table Card) *
              </label>
              <input
                id="guest-full-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Maya Shenoy"
                className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
              />
            </div>

            <div>
              <label htmlFor="guest-mobile-phone" className="block text-xs font-semibold text-[#2B1B14] mb-1">
                10-Digit Mobile Number (For SMS Confirmation) *
              </label>
              <input
                id="guest-mobile-phone"
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98200 12345"
                className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono focus:outline-none focus:border-[#C65D3B]"
              />
            </div>

            <div>
              <label htmlFor="guest-email" className="block text-xs font-medium text-[#4A372F] mb-1">
                Email Address (Optional for Calendar Invite)
              </label>
              <input
                id="guest-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@mail.com"
                className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
              />
            </div>

            <div>
              <label htmlFor="guest-occasion" className="block text-xs font-medium text-[#4A372F] mb-1">
                Occasion / Purpose
              </label>
              <select
                id="guest-occasion"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
              >
                {OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="guest-special-notes" className="block text-xs font-medium text-[#4A372F] mb-1">
              Special Requests (High chair, quiet corner, oat milk preference, etc.):
            </label>
            <textarea
              id="guest-special-notes"
              rows={2}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Tell our floor team anything we can do to make your coffee session comfortable..."
              className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
            />
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 bg-[#FAF5EC] border-l-4 border-[#C65D3B] text-[#C65D3B] text-xs flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Confirm Reservation Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-[#4A372F] text-center sm:text-left">
            <span>Instant confirmation on paper ledger. No deposit required.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#C65D3B] text-[#FAF5EC] font-serif-display font-semibold text-sm hover:bg-[#b24f2f] transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Stamping Reservation...' : 'Confirm Table Reservation'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
