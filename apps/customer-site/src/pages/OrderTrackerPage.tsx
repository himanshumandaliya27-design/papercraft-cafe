import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Coffee,
  Check,
  ShoppingBag,
  ArrowLeft,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  Order,
  OrderStatus,
  formatINR,
  formatDateTime,
  CAFE_CONFIG,
  cafeStore,
  playOrderAlertChime,
} from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

const ORDER_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'received', label: 'Ticket Received', desc: 'Order stamped & placed in kitchen queue' },
  { key: 'preparing', label: 'Artisan Preparing', desc: 'Grinding beans, blooming pour-overs & deck baking' },
  { key: 'ready', label: 'Ready for Service', desc: 'Plated and ready for pickup or table dispatch' },
  { key: 'served', label: 'Served & Enjoyed', desc: 'Delivered to your table with warm greetings' },
];

export const OrderTrackerPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(() => {
    return orderId ? cafeStore.getOrderById(orderId) || null : null;
  });

  // Subscribe to real-time order status updates (matching Firestore onSnapshot)
  useEffect(() => {
    if (!orderId) return;

    const syncOrder = () => {
      const live = cafeStore.getOrderById(orderId);
      if (live) {
        if (order && order.status !== live.status && live.status === 'ready') {
          playOrderAlertChime();
        }
        setOrder(live);
      }
    };

    const unsub = cafeStore.subscribe(syncOrder);
    syncOrder();

    return unsub;
  }, [orderId]);

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="paper-sheet paper-grain p-8 border border-[#B98A5E]/40 shadow-md">
          <Clock className="w-8 h-8 text-[#B98A5E] mx-auto mb-2" />
          <h2 className="font-serif-display text-xl font-bold text-[#2B1B14]">
            Order Ticket Not Found
          </h2>
          <p className="text-xs text-[#4A372F] mt-1">
            Could not retrieve active ticket #{orderId}. It may have been archived or entered under a different identifier.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              to="/menu"
              className="px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold"
            >
              Back to Menu
            </Link>
            <Link
              to="/my-orders"
              className="text-xs text-[#C65D3B] underline underline-offset-2"
            >
              Look up with phone number →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-20">
      <Link
        to="/menu"
        className="inline-flex items-center gap-1.5 text-xs text-[#4A372F] hover:text-[#2B1B14] mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Menu</span>
      </Link>

      {/* Ticket-Stub Container */}
      <div className="ticket-cutout paper-grain p-6 sm:p-8 border border-[#B98A5E]/50 shadow-2xl relative">
        <WashiTape variant="terracotta" position="top-center" label="Live Kitchen Order Tracker" />

        {/* Ticket Header */}
        <div className="flex items-start justify-between border-b border-[#B98A5E]/40 pb-4 pt-2">
          <div>
            <span className="text-[11px] text-[#4A372F] uppercase font-mono tracking-wider">
              {CAFE_CONFIG.cafeName} · Kitchen Ticket
            </span>
            <h1 className="font-serif-display text-3xl font-bold text-[#2B1B14] tabular-nums mt-0.5">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-[#4A372F] mt-0.5">
              Guest: <strong>{order.customerName}</strong> ({order.phone})
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#4A372F] uppercase block">Service Type</span>
            <span className="px-2.5 py-1 bg-[#2B1B14] text-[#FAF5EC] text-xs font-semibold uppercase tracking-wider">
              {order.orderType === 'dine-in' ? `Table ${order.tableNumber}` : order.orderType}
            </span>
          </div>
        </div>

        {/* Real-time Order Progress Timeline */}
        <div className="py-6 border-b border-dashed border-[#B98A5E]/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#2B1B14] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-ping" />
              <span>Real-Time Kitchen Progress</span>
            </span>
            <span className="text-[10px] text-[#4A372F] font-mono">
              Live WebSocket / onSnapshot
            </span>
          </div>

          <div className="space-y-4 pt-3">
            {ORDER_STEPS.map((step, idx) => {
              const isPassed = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {/* Vertical connector line */}
                  {idx < ORDER_STEPS.length - 1 && (
                    <div
                      aria-hidden="true"
                      className={`absolute left-[13px] top-[26px] bottom-[-16px] w-0.5 ${
                        idx < activeIndex ? 'bg-[#2E7D32]' : 'bg-[#B98A5E]/30'
                      }`}
                    />
                  )}

                  {/* Step Icon Badge */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border z-10 ${
                      isPassed
                        ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                        : isCurrent
                        ? 'bg-[#C65D3B] text-white border-[#C65D3B] animate-pulse ring-4 ring-[#C65D3B]/20'
                        : 'bg-[#FAF5EC] text-[#B98A5E] border-[#B98A5E]/40'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isCurrent ? (
                      <Coffee className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-xs font-mono">{idx + 1}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h3
                        className={`text-sm font-semibold ${
                          isCurrent
                            ? 'text-[#C65D3B] font-serif-display text-base'
                            : isPassed
                            ? 'text-[#2B1B14]'
                            : 'text-[#4A372F]/70'
                        }`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#C65D3B]/10 text-[#C65D3B] font-semibold uppercase tracking-wider">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4A372F] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Itemized Order Details */}
        <div className="py-4 border-b border-dashed border-[#B98A5E]/40 space-y-2.5">
          <span className="text-xs font-semibold text-[#2B1B14] block">
            Items Hand-Crafted on this Ticket:
          </span>
          <div className="space-y-1.5 text-xs text-[#2B1B14]">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-semibold">{item.quantity}x </span>
                  <span>{item.name}</span>
                  {item.selectedVariant && (
                    <span className="text-[#C65D3B] ml-1">({item.selectedVariant})</span>
                  )}
                  {item.notes && (
                    <span className="block text-[11px] text-[#4A372F] italic">
                      Note: {item.notes}
                    </span>
                  )}
                </div>
                <span className="tabular-nums font-mono">{formatINR(item.itemTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="py-3 text-xs space-y-1 tabular-nums border-b border-[#B98A5E]/30 text-[#4A372F]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span>{formatINR(order.gst)}</span>
          </div>
          {order.tip > 0 && (
            <div className="flex justify-between">
              <span>Crew Tip</span>
              <span>{formatINR(order.tip)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-[#2B1B14] pt-1">
            <span className="font-serif-display">Total Paid / Settled</span>
            <span className="text-[#C65D3B] font-serif-display text-lg">
              {formatINR(order.total)}
            </span>
          </div>
        </div>

        {/* Ticket Footer Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-[#4A372F] text-center sm:text-left">
            <span>Placed at {formatDateTime(order.createdAt)}</span>
            <span className="block text-[#2B1B14] font-medium">Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus.toUpperCase()})</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/menu"
              className="px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f] cursor-pointer"
            >
              Order More Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
