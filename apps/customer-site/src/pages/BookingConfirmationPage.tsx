import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Share2,
  CalendarPlus,
  ArrowLeft,
  XCircle,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import {
  Booking,
  CAFE_CONFIG,
  cafeStore,
} from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(() => {
    return bookingId ? cafeStore.getBookingById(bookingId) || null : null;
  });

  const [verifyPhone, setVerifyPhone] = useState('');
  const [showCancelSection, setShowCancelSection] = useState(false);
  const [cancelStatusMsg, setCancelStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    const unsub = cafeStore.subscribe(() => {
      const b = cafeStore.getBookingById(bookingId);
      if (b) setBooking(b);
    });
    return unsub;
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="paper-sheet paper-grain p-8 border border-[#B98A5E]/40 shadow-md">
          <Calendar className="w-8 h-8 text-[#B98A5E] mx-auto mb-2" />
          <h2 className="font-serif-display text-xl font-bold text-[#2B1B14]">
            Reservation Not Found
          </h2>
          <p className="text-xs text-[#4A372F] mt-1">
            Could not find booking #{bookingId}. Please check the reference code sent via SMS.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              to="/book"
              className="px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold"
            >
              Make New Reservation
            </Link>
            <Link
              to="/my-orders"
              className="text-xs text-[#C65D3B] underline underline-offset-2"
            >
              Look up all my bookings →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generate .ics Calendar Download
  const handleDownloadICS = () => {
    const startDateTime = `${booking.date.replace(/-/g, '')}T093000`;
    const endDateTime = `${booking.date.replace(/-/g, '')}T110000`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Atelier Velin//Cafe Reservation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Table Reservation at ${CAFE_CONFIG.cafeName}`,
      `DESCRIPTION:Table ${booking.tableNumber} for ${booking.guests} guests. Occasion: ${booking.occasion}. Booking Ref: #${booking.id}`,
      `LOCATION:${CAFE_CONFIG.address}, ${CAFE_CONFIG.city}`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Reservation-${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppShareUrl = () => {
    const msg =
      `*Reservation Confirmed at ${CAFE_CONFIG.cafeName}*\n\n` +
      `📅 Date: ${booking.date}\n` +
      `⏰ Time Slot: ${booking.timeSlot} (90 mins)\n` +
      `🪑 Table: ${booking.tableNumber} (${booking.guests} Guests)\n` +
      `🔖 Booking Reference: #${booking.id}\n` +
      `📍 Location: ${CAFE_CONFIG.address}, ${CAFE_CONFIG.city}\n\n` +
      `Looking forward to artisan pour-overs and warm pastries!`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const handleCancelBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setCancelStatusMsg(null);
    const cleanPhone = verifyPhone.replace(/\D/g, '').slice(-10);
    const bookingPhone = booking.phone.replace(/\D/g, '').slice(-10);

    if (cleanPhone !== bookingPhone) {
      setCancelStatusMsg('Phone number does not match this reservation.');
      return;
    }

    cafeStore.updateBookingStatus(booking.id, 'cancelled');
    setCancelStatusMsg('Reservation cancelled successfully.');
    setShowCancelSection(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-20">
      <Link
        to="/book"
        className="inline-flex items-center gap-1.5 text-xs text-[#4A372F] hover:text-[#2B1B14] mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Table Booking</span>
      </Link>

      <div className="ticket-cutout paper-grain p-6 sm:p-8 border border-[#B98A5E]/50 shadow-2xl space-y-6 relative">
        <WashiTape variant="terracotta" position="top-center" label="Table Ledger Confirmation" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#B98A5E]/40 pb-4 pt-2">
          <div>
            <span className="text-[11px] text-[#4A372F] uppercase font-mono tracking-wider">
              {CAFE_CONFIG.cafeName} · Reservation Ledger
            </span>
            <h1 className="font-serif-display text-3xl font-bold text-[#2B1B14] mt-0.5">
              Table Reserved
            </h1>
            <p className="text-xs text-[#4A372F] mt-0.5">
              Guest: <strong>{booking.customerName}</strong> ({booking.phone})
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#4A372F] uppercase block font-mono">Reference</span>
            <span className="font-serif-display text-2xl font-bold text-[#C65D3B] tabular-nums">
              #{booking.id}
            </span>
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                booking.status === 'confirmed'
                  ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/40'
                  : booking.status === 'cancelled'
                  ? 'bg-[#C65D3B]/10 text-[#C65D3B] border border-[#C65D3B]/40'
                  : 'bg-[#FAF5EC] text-[#2B1B14]'
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        {/* Reservation Details Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-dashed border-[#B98A5E]/40 text-center">
          <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
            <span className="text-[10px] text-[#4A372F] uppercase block font-mono">Date</span>
            <p className="font-serif-display text-sm font-semibold text-[#2B1B14] mt-0.5 tabular-nums">
              {booking.date}
            </p>
          </div>
          <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
            <span className="text-[10px] text-[#4A372F] uppercase block font-mono">Time Slot</span>
            <p className="font-serif-display text-sm font-semibold text-[#2B1B14] mt-0.5">
              {booking.timeSlot}
            </p>
          </div>
          <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
            <span className="text-[10px] text-[#4A372F] uppercase block font-mono">Table No.</span>
            <p className="font-serif-display text-sm font-semibold text-[#C65D3B] mt-0.5">
              Table {booking.tableNumber}
            </p>
          </div>
          <div className="paper-sheet p-2.5 border border-[#B98A5E]/30">
            <span className="text-[10px] text-[#4A372F] uppercase block font-mono">Party Size</span>
            <p className="font-serif-display text-sm font-semibold text-[#2B1B14] mt-0.5">
              {booking.guests} Guests
            </p>
          </div>
        </div>

        {/* Occasion & Address */}
        <div className="space-y-2 text-xs text-[#4A372F] border-b border-dashed border-[#B98A5E]/40 pb-4">
          <p>
            <strong className="text-[#2B1B14]">Occasion:</strong> {booking.occasion}
          </p>
          {booking.specialRequest && (
            <p>
              <strong className="text-[#2B1B14]">Special Request:</strong> “{booking.specialRequest}”
            </p>
          )}
          <p className="flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-[#B98A5E] shrink-0" />
            <span>
              {CAFE_CONFIG.address}, {CAFE_CONFIG.city} {CAFE_CONFIG.pincode}
            </span>
          </p>
        </div>

        {/* Action Buttons: Add to Calendar & WhatsApp Share */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadICS}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#2B1B14] text-[#FAF5EC] hover:bg-[#3d281f] cursor-pointer shadow-xs"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-[#E5B358]" />
            <span>Add to Calendar (.ics)</span>
          </button>

          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#2E7D32]/50 bg-[#FAF5EC] hover:bg-[#E8F5E9] text-[#2E7D32] cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on WhatsApp</span>
          </a>

          {booking.status === 'confirmed' && (
            <button
              type="button"
              onClick={() => setShowCancelSection((prev) => !prev)}
              className="text-xs text-[#4A372F] hover:text-[#C65D3B] underline underline-offset-2 ml-auto cursor-pointer"
            >
              Cancel Reservation
            </button>
          )}
        </div>

        {/* Cancel / Reschedule Verification Section */}
        {showCancelSection && booking.status === 'confirmed' && (
          <form onSubmit={handleCancelBooking} className="p-4 bg-[#FAF5EC] border border-[#C65D3B]/40 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C65D3B]">
              <XCircle className="w-4 h-4" />
              <span>Cancel Reservation Ledger</span>
            </div>
            <p className="text-[11px] text-[#4A372F]">
              To release this table for other guests, please verify the 10-digit mobile number used when booking:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                required
                maxLength={10}
                value={verifyPhone}
                onChange={(e) => setVerifyPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit phone"
                className="px-3 py-1.5 text-xs bg-[#F4EBDD] border border-[#B98A5E] text-[#2B1B14] font-mono focus:outline-none focus:border-[#C65D3B]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#C65D3B] text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Cancellation
              </button>
              <button
                type="button"
                onClick={() => setShowCancelSection(false)}
                className="px-2.5 py-1.5 text-xs text-[#4A372F] cursor-pointer"
              >
                Close
              </button>
            </div>
          </form>
        )}

        {cancelStatusMsg && (
          <div className="p-3 bg-[#FAF5EC] border-l-4 border-[#C65D3B] text-xs text-[#C65D3B] font-semibold">
            {cancelStatusMsg}
          </div>
        )}
      </div>
    </div>
  );
};
