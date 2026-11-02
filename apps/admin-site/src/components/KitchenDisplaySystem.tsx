import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Check, Bell, Flame, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Order, CAFE_CONFIG, cafeStore, playOrderAlertChime, useFocusTrap } from '@atelier/shared';

interface KitchenDisplaySystemProps {
  onClose: () => void;
}

export const KitchenDisplaySystem: React.FC<KitchenDisplaySystemProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, containerRef, onClose);

  const [orders, setOrders] = useState<Order[]>(() =>
    cafeStore
      .getOrders()
      .filter((o) => o.status === 'received' || o.status === 'preparing')
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const unsub = cafeStore.subscribe(() => {
      const active = cafeStore
        .getOrders()
        .filter((o) => o.status === 'received' || o.status === 'preparing');
      setOrders([...active]);
    });
    return unsub;
  }, []);

  const getElapsedMinutes = (createdAt: string) => {
    return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  };

  const handleBump = (orderId: string, currentStatus: string) => {
    if (currentStatus === 'received') {
      cafeStore.updateOrderStatus(orderId, 'preparing', 'Kitchen KDS');
    } else {
      cafeStore.updateOrderStatus(orderId, 'ready', 'Kitchen KDS');
      if (soundEnabled) playOrderAlertChime();
    }
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Kitchen Display System (KDS)"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-[#1F140E] text-[#F4EBDD] flex flex-col overflow-hidden font-sans select-none focus:outline-hidden"
    >
      {/* Top KDS Control Bar */}
      <div className="bg-[#2B1B14] px-6 py-3 border-b border-[#B98A5E]/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-[#2E7D32] animate-ping" />
          <h1 className="font-serif-display text-xl font-bold tracking-wide text-[#FAF5EC]">
            {CAFE_CONFIG.cafeName} · Kitchen Display System (KDS)
          </h1>
          <span className="px-2.5 py-0.5 bg-[#C65D3B] text-white text-xs font-bold rounded-xs tabular-nums">
            {orders.length} Active Tickets
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="p-2 border border-[#B98A5E]/50 text-[#F4EBDD] hover:bg-[#3d281f] cursor-pointer"
            title={soundEnabled ? 'Mute Alert Chime' : 'Enable Alert Chime'}
            aria-label={soundEnabled ? 'Mute Alert Chime' : 'Enable Alert Chime'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-[#C65D3B]" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF5EC] text-[#2B1B14] text-xs font-bold uppercase tracking-wider hover:bg-[#E7D6BE] cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Exit KDS</span>
          </button>
        </div>
      </div>

      {/* Grid of Kitchen Tickets */}
      <div className="flex-1 p-6 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#B98A5E]/70 space-y-3">
            <Check className="w-16 h-16 text-[#2E7D32]" />
            <h2 className="font-serif-display text-3xl font-semibold text-[#FAF5EC]">
              All Kitchen Orders Cleared & Served
            </h2>
            <p className="font-handwritten text-2xl text-[#C65D3B]">
              “Counter is peaceful · Waiting for next roast order”
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order) => {
              const minutes = getElapsedMinutes(order.createdAt);
              const isUrgent = minutes >= 15;
              const isWarning = minutes >= 10 && minutes < 15;

              return (
                <div
                  key={order.id}
                  className={`bg-[#2B1B14] rounded-xs border-2 shadow-xl flex flex-col justify-between overflow-hidden ${
                    isUrgent
                      ? 'border-[#C65D3B] ring-2 ring-[#C65D3B]/40'
                      : isWarning
                      ? 'border-[#E5B358]'
                      : 'border-[#B98A5E]/60'
                  }`}
                >
                  {/* Ticket Header */}
                  <div
                    className={`p-3.5 flex items-center justify-between border-b ${
                      order.status === 'received' ? 'bg-[#3D281F]' : 'bg-[#4A3225]'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xl font-bold text-[#FAF5EC]">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-[#E7D6BE] block">
                        {order.customerName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 text-sm font-bold uppercase ${
                          order.orderType === 'dine-in'
                            ? 'bg-[#C65D3B] text-white'
                            : 'bg-[#B98A5E] text-[#1F140E]'
                        }`}
                      >
                        {order.orderType === 'dine-in'
                          ? `TABLE ${order.tableNumber || 1}`
                          : 'TAKEAWAY'}
                      </span>
                      <div className="flex items-center justify-end gap-1 text-xs mt-1 tabular-nums font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#E5B358]" />
                        <span
                          className={
                            isUrgent
                              ? 'text-[#FF5252] font-bold'
                              : isWarning
                              ? 'text-[#E5B358] font-bold'
                              : 'text-[#E7D6BE]'
                          }
                        >
                          {minutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                    {order.items.map((it) => (
                      <div key={it.id} className="border-b border-[#3D281F] pb-2 last:border-b-0">
                        <div className="flex items-baseline justify-between">
                          <span className="text-lg font-bold text-white">
                            {it.quantity}x {it.name}
                          </span>
                        </div>
                        {it.selectedVariant && (
                          <div className="text-xs text-[#E5B358] font-semibold mt-0.5">
                            Edition: {it.selectedVariant}
                          </div>
                        )}
                        {it.selectedAddOns && it.selectedAddOns.length > 0 && (
                          <div className="text-xs text-[#B98A5E]">
                            Add-ons: {it.selectedAddOns.join(', ')}
                          </div>
                        )}
                        {it.notes && (
                          <div className="mt-1 p-1 bg-[#1A110B] border-l-2 border-[#C65D3B] text-xs text-[#E7D6BE] italic">
                            “{it.notes}”
                          </div>
                        )}
                      </div>
                    ))}

                    {order.notes && (
                      <div className="mt-2 p-2 bg-[#3D281F] border border-[#C65D3B] text-xs text-[#FAF5EC] font-semibold">
                        GUEST NOTE: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* One-Tap Action Bump Button */}
                  <div className="p-3 bg-[#1A110B] border-t border-[#3D281F]">
                    <button
                      type="button"
                      onClick={() => handleBump(order.id, order.status)}
                      className={`w-full py-3 font-serif-display font-bold text-sm uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 ${
                        order.status === 'received'
                          ? 'bg-[#B98A5E] text-[#1F140E] hover:bg-[#d6a576]'
                          : 'bg-[#2E7D32] text-white hover:bg-[#388e3c]'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                      <span>{order.status === 'received' ? 'Start Preparing' : 'Mark Ready & Served'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
