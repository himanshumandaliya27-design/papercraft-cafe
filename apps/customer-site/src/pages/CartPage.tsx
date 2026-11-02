import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Trash2,
  Plus,
  Minus,
  Sparkles,
  QrCode,
  CreditCard,
  Banknote,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import {
  OrderItem,
  OrderType,
  PaymentMethod,
  Order,
  formatINR,
  CAFE_CONFIG,
  cafeStore,
} from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

interface CartPageProps {
  cartItems: OrderItem[];
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  tableNumberFromUrl?: number;
}

export const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  tableNumberFromUrl,
}) => {
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<OrderType>(
    tableNumberFromUrl ? 'dine-in' : 'dine-in'
  );
  const [tableNumber, setTableNumber] = useState<number>(tableNumberFromUrl || 1);
  const [pickupTime, setPickupTime] = useState<string>('In 20 mins');

  // Customer information
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [tipAmount, setTipAmount] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Returning customer detection
  const [recognizedCustomer, setRecognizedCustomer] = useState<any>(null);

  useEffect(() => {
    if (tableNumberFromUrl) {
      setTableNumber(tableNumberFromUrl);
      setOrderType('dine-in');
    }
  }, [tableNumberFromUrl]);

  useEffect(() => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length === 10) {
      const match = cafeStore.getCustomerByPhone(clean);
      if (match) {
        setRecognizedCustomer(match);
        if (!customerName) setCustomerName(match.name);
        if (!email && match.email) setEmail(match.email);
      } else {
        setRecognizedCustomer(null);
      }
    } else {
      setRecognizedCustomer(null);
    }
  }, [phone]);

  const subtotal = cartItems.reduce((acc, i) => acc + i.itemTotal, 0);
  const gstRate = CAFE_CONFIG.gstPercentage / 100;
  const gstAmount = Number((subtotal * gstRate).toFixed(2));
  const grandTotal = Math.round(subtotal + gstAmount + tipAmount);

  // UPI deep link
  const upiLink = `upi://pay?pa=${encodeURIComponent(CAFE_CONFIG.upiId)}&pn=${encodeURIComponent(
    CAFE_CONFIG.upiPayeeName
  )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Atelier Velin Table Order')}`;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (cartItems.length === 0) {
      setValidationError('Your tray is currently empty. Please add items from the menu.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number for order verification.');
      return;
    }
    if (!customerName.trim()) {
      setValidationError('Please enter your name for the kitchen ticket.');
      return;
    }

    if (!CAFE_CONFIG.acceptingOrders) {
      setValidationError('Kitchen is currently running at capacity. Order placing is temporarily paused.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isPaid = paymentMethod === 'upi' ? upiConfirmed : paymentMethod === 'razorpay';
      const createdOrder = await cafeStore.placeOrder({
        customerId: cleanPhone,
        customerName: customerName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        pickupTime: orderType === 'pre-order' ? pickupTime : undefined,
        items: cartItems,
        subtotal,
        gst: gstAmount,
        discount: 0,
        tip: tipAmount,
        total: grandTotal,
        paymentMethod,
        paymentStatus: isPaid ? 'paid' : 'pending',
        status: 'received',
        notes: orderNotes.trim() || undefined,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#B98A5E', '#C65D3B', '#FAF5EC', '#2B1B14'],
        });
      } catch (err) {
        // ignore
      }

      onClearCart();
      navigate(`/order/${createdOrder.id}`);
    } catch (err) {
      console.error('Order creation failed', err);
      setValidationError('Unable to place order at this moment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 pb-28 lg:pb-20">
      {/* Header */}
      <div className="border-b border-[#B98A5E]/30 pb-4 mb-4">
        <span className="text-xs text-[#4A372F] tracking-wide font-mono uppercase">
          Step 02 · Checkout & Dispatch
        </span>
        <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1B14] mt-0.5">
          Table Tasting Tray & Ledger
        </h1>
      </div>

      {/* 3-Step Checkout Flow Indicator */}
      <div className="flex items-center justify-between max-w-sm mx-auto mb-6 p-2 bg-[#FAF5EC] border border-[#B98A5E]/40 text-xs shadow-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#2B1B14]">
          <span className="w-5 h-5 rounded-full bg-[#2B1B14] text-[#FAF5EC] text-[10px] flex items-center justify-center font-mono">1</span>
          <span>Tray</span>
        </div>
        <span className="text-[#B98A5E]/60">──</span>
        <div className="flex items-center gap-1.5 font-semibold text-[#C65D3B]">
          <span className="w-5 h-5 rounded-full bg-[#C65D3B] text-white text-[10px] flex items-center justify-center font-mono">2</span>
          <span>Details</span>
        </div>
        <span className="text-[#B98A5E]/60">──</span>
        <div className="flex items-center gap-1.5 font-medium text-[#4A372F]">
          <span className="w-5 h-5 rounded-full border border-[#B98A5E] text-[#4A372F] text-[10px] flex items-center justify-center font-mono">3</span>
          <span>Pay</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="paper-sheet paper-grain p-12 text-center border border-[#B98A5E]/40 max-w-md mx-auto my-8 space-y-4">
          <ShoppingBag className="w-10 h-10 text-[#B98A5E] mx-auto" />
          <h2 className="font-serif-display text-xl font-semibold text-[#2B1B14]">
            Your Tray is Empty
          </h2>
          <p className="text-xs text-[#4A372F] leading-relaxed">
            Your paper tray has no items yet. Explore our single-origin pour-overs, cold brew flights, and laminated viennoiserie.
          </p>
          <Link
            to="/menu"
            className="inline-block px-5 py-2.5 bg-[#C65D3B] text-[#FAF5EC] font-serif-display text-xs font-semibold hover:bg-[#b24f2f] cursor-pointer shadow-xs"
          >
            Explore Digital Menu →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Items & Order Type (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Order Type Segmented Toggle */}
            <div className="paper-sheet p-3 border border-[#B98A5E]/40">
              <span className="text-[11px] font-semibold text-[#4A372F] block mb-2 font-mono uppercase">
                Service Dispatch Mode:
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4EBDD] border border-[#B98A5E]/40">
                {(['dine-in', 'takeaway', 'pre-order'] as OrderType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-2 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                      orderType === type
                        ? 'bg-[#2B1B14] text-[#FAF5EC] shadow-xs font-semibold'
                        : 'text-[#4A372F] hover:text-[#2B1B14]'
                    }`}
                  >
                    {type === 'dine-in' ? 'Dine-In' : type === 'takeaway' ? 'Takeaway' : 'Pre-Order'}
                  </button>
                ))}
              </div>

              {/* Table Number Selector if Dine-in */}
              {orderType === 'dine-in' && (
                <div className="mt-3 pt-3 border-t border-dashed border-[#B98A5E]/40 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#2B1B14]">Select Table Number:</span>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(Number(e.target.value))}
                    className="px-3 py-1 bg-[#FAF5EC] border border-[#B98A5E] font-serif-display font-semibold text-[#2B1B14]"
                    aria-label="Table number"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        Table {num} {num <= 3 ? '(Window Linen)' : num <= 6 ? '(Courtyard)' : num <= 8 ? '(Roastery Bar)' : '(Reading Nook)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pickup Time if Pre-order */}
              {orderType === 'pre-order' && (
                <div className="mt-3 pt-3 border-t border-dashed border-[#B98A5E]/40 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#2B1B14]">Pickup Window:</span>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="px-3 py-1 bg-[#FAF5EC] border border-[#B98A5E] text-[#2B1B14]"
                    aria-label="Pickup window"
                  >
                    <option value="In 15 mins">In 15 mins</option>
                    <option value="In 30 mins">In 30 mins</option>
                    <option value="In 45 mins">In 45 mins</option>
                    <option value="In 1 hour">In 1 hour</option>
                  </select>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#4A372F] px-1">
                <h2 className="font-semibold text-xs text-[#2B1B14] m-0">Items on Your Tray ({cartItems.length})</h2>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="hover:text-[#C65D3B] underline underline-offset-2 cursor-pointer"
                >
                  Clear Tray
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="paper-sheet paper-grain p-4 border border-[#B98A5E]/40 flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1 flex-1">
                    <h3 className="font-serif-display text-base font-semibold text-[#2B1B14] leading-snug">
                      {item.name}
                    </h3>

                    {/* Variant or Add-ons note */}
                    {(item.selectedVariant || (item.selectedAddOns && item.selectedAddOns.length > 0)) && (
                      <div className="text-[11px] text-[#C65D3B] font-mono">
                        {item.selectedVariant && <span>[{item.selectedVariant}] </span>}
                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <span>+ {item.selectedAddOns.join(', ')}</span>
                        )}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-[#4A372F] italic">
                        “{item.notes}”
                      </p>
                    )}

                    <div className="text-xs text-[#4A372F] tabular-nums pt-1">
                      {formatINR(item.basePrice)} each
                    </div>
                  </div>

                  {/* Center: Quantity Stepper */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="flex items-center border border-[#B98A5E]/60 bg-[#FAF5EC] p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-[#4A372F] hover:text-[#2B1B14] cursor-pointer min-h-[32px] min-w-[32px]"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold tabular-nums font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#4A372F] hover:text-[#2B1B14] cursor-pointer min-h-[32px] min-w-[32px]"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-[#4A372F] hover:text-[#C65D3B] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right: Item Total */}
                  <div className="text-right sm:w-24 shrink-0 self-end sm:self-center">
                    <span className="font-serif-display text-base font-bold text-[#2B1B14] tabular-nums block">
                      {formatINR(item.itemTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Crew Gratuity */}
            <div className="paper-sheet p-3.5 border border-[#B98A5E]/40">
              <span className="text-xs font-semibold text-[#2B1B14] block mb-2">
                Specialty Roastery Crew Gratuity (Optional):
              </span>
              <div className="flex flex-wrap gap-2">
                {[0, 20, 30, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTipAmount(amt)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer tabular-nums ${
                      tipAmount === amt
                        ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                        : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40'
                    }`}
                  >
                    {amt === 0 ? 'None' : formatINR(amt)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customer Details, Payment & Submit (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Returning Customer Banner */}
            {recognizedCustomer && (
              <div className="p-3 bg-[#E8F5E9] border-l-4 border-[#2E7D32] text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#2E7D32] font-semibold">
                  <UserCheck className="w-4 h-4" />
                  <span>Welcome back, {recognizedCustomer.name}!</span>
                </div>
                <p className="text-[#4A372F]">
                  You have visited {recognizedCustomer.totalVisits} times · Favorite: {recognizedCustomer.favouriteItems.slice(0, 2).join(', ')}
                </p>
              </div>
            )}

            {/* Customer Details Form */}
            <div className="paper-sheet paper-grain p-5 border border-[#B98A5E]/40 space-y-3.5">
              <WashiTape variant="kraft" position="top-center" label="Guest Identification Slip" />

              <div className="pt-2">
                <label htmlFor="customer-phone" className="block text-xs font-semibold text-[#2B1B14] mb-1">
                  10-Digit Mobile Number (Required) *
                </label>
                <div className="flex items-center">
                  <span className="px-2.5 py-2 bg-[#E7D6BE] border border-r-0 border-[#B98A5E]/60 text-xs text-[#2B1B14] font-mono">
                    +91
                  </span>
                  <input
                    id="customer-phone"
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98200 12345"
                    className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono focus:outline-none focus:border-[#C65D3B]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="customer-name" className="block text-xs font-semibold text-[#2B1B14] mb-1">
                  Your Full Name *
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Maya Shenoy"
                  className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
                />
              </div>

              <div>
                <label htmlFor="customer-email" className="block text-xs font-medium text-[#4A372F] mb-1">
                  Email (Optional for PDF Receipt)
                </label>
                <input
                  id="customer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest@mail.com"
                  className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
                />
              </div>

              <div>
                <label htmlFor="order-kitchen-notes" className="block text-xs font-medium text-[#4A372F] mb-1">
                  Overall Order Notes:
                </label>
                <input
                  id="order-kitchen-notes"
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Please bring water glasses, leave coffee unsweetened"
                  className="w-full px-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="paper-sheet paper-grain p-5 border border-[#B98A5E]/40 space-y-3.5">
              <span className="text-xs font-semibold text-[#2B1B14] block">
                Select Settlement Mode:
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 text-xs border text-center transition-colors cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-[#C65D3B] text-white border-[#C65D3B] font-semibold'
                      : 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/50'
                  }`}
                >
                  <QrCode className="w-4 h-4 mx-auto mb-1" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 text-xs border text-center transition-colors cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-[#2B1B14] text-white border-[#2B1B14] font-semibold'
                      : 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/50'
                  }`}
                >
                  <Banknote className="w-4 h-4 mx-auto mb-1" />
                  <span>Pay Counter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-2.5 text-xs border text-center transition-colors cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'bg-[#2B1B14] text-white border-[#2B1B14] font-semibold'
                      : 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  <span>Online Card</span>
                </button>
              </div>

              {/* UPI QR Display if UPI is chosen */}
              {paymentMethod === 'upi' && (
                <div className="paper-sheet p-3.5 border border-[#B98A5E]/50 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2B1B14]">Scan & Pay via any UPI App</span>
                    <span className="font-mono text-[#C65D3B]">{CAFE_CONFIG.upiId}</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-2.5 border border-[#B98A5E]/30">
                    <div className="w-20 h-20 bg-[#FAF5EC] border border-[#2B1B14] p-1 shrink-0 flex items-center justify-center">
                      <QrCode className="w-full h-full text-[#2B1B14]" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-[#2B1B14]">GPay, PhonePe, Paytm, BHIM</p>
                      <p className="tabular-nums">Amount: <strong>{formatINR(grandTotal)}</strong></p>
                      <a
                        href={upiLink}
                        className="inline-block text-[#C65D3B] underline font-medium"
                      >
                        Deep Link to UPI App →
                      </a>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={upiConfirmed}
                      onChange={(e) => setUpiConfirmed(e.target.checked)}
                      className="text-[#C65D3B]"
                    />
                    <span>I have completed the UPI payment on my mobile app</span>
                  </label>
                </div>
              )}
            </div>

            {/* Bill Summary Ticket */}
            <div className="ticket-cutout paper-grain p-5 border border-[#B98A5E]/50 space-y-2 text-xs tabular-nums">
              <div className="flex justify-between text-[#4A372F]">
                <span>Items Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#4A372F]">
                <span>GST (5% CGST + SGST)</span>
                <span>{formatINR(gstAmount)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between text-[#4A372F]">
                  <span>Crew Gratuity</span>
                  <span>{formatINR(tipAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#2B1B14] pt-2 border-t border-[#B98A5E]/40">
                <span className="font-serif-display">Grand Total</span>
                <span className="font-serif-display text-xl text-[#C65D3B]">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3 bg-[#FAF5EC] border-l-4 border-[#C65D3B] text-[#C65D3B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{validationError}</span>
              </div>
            )}

            {/* Submit Order Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitOrder}
              className="w-full py-4 bg-[#C65D3B] text-[#FAF5EC] font-serif-display font-semibold text-base hover:bg-[#b24f2f] transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Stamping Kitchen Ticket...' : `Place ${orderType.toUpperCase()} Order (${formatINR(grandTotal)})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
