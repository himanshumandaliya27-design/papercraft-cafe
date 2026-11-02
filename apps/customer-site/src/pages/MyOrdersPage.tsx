import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  KeyRound,
  Receipt,
  Calendar,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  Order,
  Booking,
  MenuItem,
  formatINR,
  formatDateTime,
  CAFE_CONFIG,
  cafeStore,
} from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

interface MyOrdersPageProps {
  onReorder: (order: Order) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onReorder }) => {
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Results
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [reorderedOrderId, setReorderedOrderId] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (cleanPhone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsOtpSent(true);
    setOtpCode('1234'); // Pre-fill mock OTP for smooth immediate testing
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (otpCode !== '1234' && otpCode.length < 4) {
      setValidationError('Invalid code. Please use demo code: 1234');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const orders = cafeStore.getOrdersByPhone(cleanPhone);
    const bookings = cafeStore.getBookingsByPhone(cleanPhone);

    setCustomerOrders(orders);
    setCustomerBookings(bookings);
    setIsVerified(true);
  };

  const handleReorderClick = (order: Order) => {
    onReorder(order);
    setReorderedOrderId(order.id);
    setTimeout(() => setReorderedOrderId(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 pb-20">
      {/* Header */}
      <div className="border-b border-[#B98A5E]/30 pb-4 mb-6">
        <span className="text-xs text-[#4A372F] tracking-wide font-mono uppercase">
          Guest Portal
        </span>
        <h1 className="font-serif-display text-3xl font-bold text-[#2B1B14] mt-0.5">
          My Orders & Table Bookings
        </h1>
        <p className="text-xs sm:text-sm text-[#4A372F] mt-1 leading-relaxed">
          Access your past bills, reorder favorite coffee blends, and inspect confirmed table reservations.
        </p>
      </div>

      {!isVerified ? (
        /* Phone & OTP Authentication Card */
        <div className="max-w-md mx-auto paper-sheet paper-grain p-6 sm:p-8 border border-[#B98A5E]/40 shadow-lg space-y-5">
          <WashiTape variant="terracotta" position="top-center" label="Secure Mobile Access" />

          <div className="text-center pt-2">
            <Receipt className="w-8 h-8 text-[#B98A5E] mx-auto mb-2" />
            <h2 className="font-serif-display text-xl font-bold text-[#2B1B14]">
              Look up Your Paper Tickets
            </h2>
            <p className="text-xs text-[#4A372F] mt-1">
              Enter your 10-digit mobile number to view tickets placed online or at the table counter.
            </p>
          </div>

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="lookup-phone" className="block text-xs font-semibold text-[#2B1B14] mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-[#E7D6BE] border border-r-0 border-[#B98A5E]/60 text-xs font-mono text-[#2B1B14]">
                    +91
                  </span>
                  <input
                    id="lookup-phone"
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98200 12345 (Try sample: 98201 11223)"
                    className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono focus:outline-none focus:border-[#C65D3B]"
                  />
                </div>
              </div>

              {validationError && (
                <div className="p-2.5 bg-[#FAF5EC] border-l-4 border-[#C65D3B] text-xs text-[#C65D3B]">
                  {validationError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#2B1B14] text-[#FAF5EC] font-serif-display font-semibold text-xs hover:bg-[#3d281f] transition-colors cursor-pointer shadow-xs"
              >
                Send Verification OTP →
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-2.5 bg-[#E8F5E9] border border-[#2E7D32]/40 text-xs text-[#2E7D32] flex items-center justify-between">
                <span>Demo OTP Code: <strong>1234</strong></span>
                <span className="text-[10px] uppercase font-mono">Auto-generated</span>
              </div>

              <div>
                <label htmlFor="otp-verification-code" className="block text-xs font-semibold text-[#2B1B14] mb-1">
                  Enter 4-Digit Code
                </label>
                <input
                  id="otp-verification-code"
                  type="text"
                  required
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="1234"
                  className="w-full text-center tracking-widest text-lg font-mono py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
                />
              </div>

              {validationError && (
                <div className="p-2.5 bg-[#FAF5EC] border-l-4 border-[#C65D3B] text-xs text-[#C65D3B]">
                  {validationError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="px-3 py-2.5 text-xs border border-[#B98A5E]/40 text-[#4A372F] hover:bg-[#E7D6BE]"
                >
                  Change Number
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#C65D3B] text-[#FAF5EC] font-serif-display font-semibold text-xs hover:bg-[#b24f2f] cursor-pointer shadow-xs"
                >
                  Verify & Access Records →
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Verified Customer Dashboard */
        <div className="space-y-8">
          {/* Top Bar */}
          <div className="paper-sheet p-4 border border-[#B98A5E]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-[#4A372F]">Ledger Account Verified</span>
              <p className="font-serif-display text-lg font-bold text-[#2B1B14]">
                +91 {phone}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsVerified(false);
                setIsOtpSent(false);
              }}
              className="text-xs text-[#C65D3B] underline underline-offset-2 cursor-pointer self-start sm:self-auto"
            >
              Sign Out / Switch Phone Number
            </button>
          </div>

          {reorderedOrderId && (
            <div className="p-3 bg-[#E8F5E9] border-l-4 border-[#2E7D32] text-xs text-[#2E7D32] font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Items added to your tray! <Link to="/cart" className="underline font-bold">Open Tray & Checkout →</Link></span>
            </div>
          )}

          {/* Section A: Past Orders & Live Trackers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#B98A5E]/30 pb-2">
              <h2 className="font-serif-display text-xl font-bold text-[#2B1B14] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C65D3B]" />
                <span>Past & Active Orders ({customerOrders.length})</span>
              </h2>
              <Link to="/menu" className="text-xs text-[#C65D3B] hover:underline">
                Browse Menu +
              </Link>
            </div>

            {customerOrders.length === 0 ? (
              <div className="paper-sheet p-6 text-center text-xs text-[#4A372F] border border-[#B98A5E]/30">
                No orders recorded yet under this phone number.
              </div>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="paper-sheet paper-grain p-5 border border-[#B98A5E]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif-display text-base font-bold text-[#2B1B14]">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs text-[#4A372F]">· {formatDateTime(ord.createdAt)}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            ord.status === 'served'
                              ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/30'
                              : 'bg-[#C65D3B]/10 text-[#C65D3B] border border-[#C65D3B]/30'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#2B1B14]">
                        {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(' · ')}
                      </div>

                      <div className="text-xs text-[#4A372F] tabular-nums">
                        <span>Total: <strong>{formatINR(ord.total)}</strong></span> ·{' '}
                        <span>Type: {ord.orderType}</span> ·{' '}
                        <span>Payment: {ord.paymentMethod.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/order/${ord.id}`}
                        className="px-3 py-1.5 border border-[#B98A5E]/60 bg-[#FAF5EC] text-[#2B1B14] hover:bg-[#E7D6BE] text-xs font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#B98A5E]" />
                        <span>Live Tracker</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleReorderClick(ord)}
                        className="px-3.5 py-1.5 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f] flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#E5B358]" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Table Bookings */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-[#B98A5E]/30 pb-2">
              <h2 className="font-serif-display text-xl font-bold text-[#2B1B14] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#B98A5E]" />
                <span>Table Reservations ({customerBookings.length})</span>
              </h2>
              <Link to="/book" className="text-xs text-[#C65D3B] hover:underline">
                Book a Table +
              </Link>
            </div>

            {customerBookings.length === 0 ? (
              <div className="paper-sheet p-6 text-center text-xs text-[#4A372F] border border-[#B98A5E]/30">
                No table bookings found under this phone number.
              </div>
            ) : (
              <div className="space-y-3">
                {customerBookings.map((b) => (
                  <div
                    key={b.id}
                    className="paper-sheet paper-grain p-5 border border-[#B98A5E]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif-display text-base font-bold text-[#2B1B14]">
                          #{b.id}
                        </span>
                        <span className="text-xs font-semibold text-[#C65D3B]">
                          Table {b.tableNumber} ({b.guests} Guests)
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-[#2E7D32]/10 text-[#2E7D32]'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#4A372F]">
                        <span>Date: <strong>{b.date}</strong></span> ·{' '}
                        <span>Slot: <strong>{b.timeSlot}</strong></span> ·{' '}
                        <span>Occasion: {b.occasion}</span>
                      </div>
                    </div>

                    <Link
                      to={`/booking/${b.id}`}
                      className="px-3.5 py-1.5 border border-[#B98A5E]/60 bg-[#FAF5EC] text-[#2B1B14] hover:bg-[#E7D6BE] text-xs font-medium flex items-center gap-1 self-start sm:self-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#B98A5E]" />
                      <span>Ledger Ticket</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
