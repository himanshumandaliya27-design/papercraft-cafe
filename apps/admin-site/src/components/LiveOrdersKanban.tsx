import React, { useState, useEffect } from 'react';
import {
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  X,
  Volume2,
  Tv,
  AlertCircle,
  Coffee,
  RotateCcw,
} from 'lucide-react';
import { Order, OrderStatus } from '@atelier/shared';
import { CAFE_CONFIG, formatINR } from '@atelier/shared';
import { cafeStore } from '@atelier/shared';
import { PrintableBillReceipt } from './PrintableBillReceipt';

interface LiveOrdersKanbanProps {
  onOpenKitchenDisplay: () => void;
}

const COLUMNS: { status: OrderStatus; label: string; headerColor: string }[] = [
  { status: 'received', label: 'New Orders', headerColor: 'border-l-4 border-[#C65D3B]' },
  { status: 'preparing', label: 'In Kitchen / Roasting', headerColor: 'border-l-4 border-[#B98A5E]' },
  { status: 'ready', label: 'Ready for Service', headerColor: 'border-l-4 border-[#2E7D32]' },
  { status: 'completed', label: 'Completed & Billed', headerColor: 'border-l-4 border-[#4A372F]' },
];

export const LiveOrdersKanban: React.FC<LiveOrdersKanbanProps> = ({
  onOpenKitchenDisplay,
}) => {
  const [orders, setOrders] = useState<Order[]>(() => cafeStore.getOrders());
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cafeStore.subscribe(() => {
      setOrders([...cafeStore.getOrders()]);
    });
    return unsub;
  }, []);

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    const nextMap: Record<OrderStatus, OrderStatus | null> = {
      received: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: 'completed',
      completed: null,
      cancelled: null,
    };
    const next = nextMap[currentStatus];
    if (next) {
      cafeStore.updateOrderStatus(orderId, next);
    }
  };

  const handlePreviousStatus = (orderId: string, currentStatus: OrderStatus) => {
    const prevMap: Record<OrderStatus, OrderStatus | null> = {
      received: null,
      preparing: 'received',
      ready: 'preparing',
      served: 'ready',
      completed: 'served',
      cancelled: null,
    };
    const prev = prevMap[currentStatus];
    if (prev) {
      cafeStore.updateOrderStatus(orderId, prev);
    }
  };

  const handleMarkPaid = (orderId: string) => {
    cafeStore.updateOrderPayment(orderId, 'paid');
  };

  const handleCancelOrder = (orderId: string) => {
    cafeStore.updateOrderStatus(orderId, 'cancelled');
    setCancellingOrderId(null);
  };

  const getMinutesAgo = (isoDate: string) => {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000));
    return `${diff}m ago`;
  };

  const getUrgency = (createdAt: string, status: OrderStatus) => {
    if (status === 'completed' || status === 'cancelled') return 'normal';
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (minutes >= 25) return 'critical';
    if (minutes >= 12) return 'warning';
    return 'normal';
  };

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse" />
            <h2 className="font-serif-display text-2xl font-semibold text-[#2B1B14]">
              Live Kitchen & Bar Kanban
            </h2>
            <span className="px-2 py-0.5 bg-[#C65D3B] text-white text-xs font-semibold tabular-nums">
              {activeOrdersCount} Active
            </span>
          </div>
          <p className="text-xs text-[#4A372F] mt-0.5">
            Real-time multi-stage order workflow with auditory order alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Kitchen Display System Mode */}
          <button
            type="button"
            onClick={onOpenKitchenDisplay}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f] cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Tv className="w-4 h-4 text-[#C65D3B]" />
            <span>Launch Kitchen Display (KDS)</span>
          </button>
        </div>
      </div>

      {/* 4 Kanban Columns Grid with Horizontal Swipe on Mobile/Tablet */}
      <div className="flex overflow-x-auto snap-x md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 scrollbar-thin">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className="min-w-[285px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start bg-[#EFE3CF]/70 p-3 border border-[#B98A5E]/40 min-h-[560px] flex flex-col"
            >
              {/* Sticky Column Header */}
              <div
                className={`sticky top-0 z-10 p-2.5 bg-[#FAF5EC] border border-[#B98A5E]/30 mb-3 flex items-center justify-between shadow-xs ${col.headerColor}`}
              >
                <span className="font-serif-display text-sm font-semibold text-[#2B1B14]">
                  {col.label}
                </span>
                <span className="w-5 h-5 rounded-full bg-[#2B1B14] text-[#FAF5EC] text-xs font-semibold flex items-center justify-center tabular-nums">
                  {colOrders.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colOrders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8C7A70] italic border border-dashed border-[#B98A5E]/40 bg-[#FAF5EC]/50">
                    No orders currently in this stage.
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const urgency = getUrgency(order.createdAt, order.status);

                    return (
                      <div
                        key={order.id}
                        className={`relative paper-sheet p-3.5 border transition-all space-y-2.5 text-xs shadow-xs ${
                          urgency === 'critical'
                            ? 'border-2 border-[#C65D3B] ring-2 ring-[#C65D3B]/30 bg-[#FFF5F2]'
                            : urgency === 'warning'
                            ? 'border-2 border-[#B98A5E] bg-[#FFFBF5]'
                            : 'border border-[#B98A5E]/40 hover:border-[#2B1B14]'
                        }`}
                      >
                        {/* Urgency Badge if Delayed */}
                        {urgency === 'critical' && (
                          <div className="bg-[#C65D3B] text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Urgent Attention: {getMinutesAgo(order.createdAt)}</span>
                          </div>
                        )}
                        {urgency === 'warning' && (
                          <div className="bg-[#B98A5E] text-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Queued: {getMinutesAgo(order.createdAt)}</span>
                          </div>
                        )}

                        {/* Card Header: Order No, Table, Timer */}
                        <div className="flex items-start justify-between border-b border-[#B98A5E]/30 pb-2">
                        <div>
                          <span className="font-serif-display font-semibold text-sm text-[#2B1B14]">
                            {order.orderNumber}
                          </span>
                          <span className="text-[11px] text-[#4A372F] block">
                            {order.customerName} ({order.phone})
                          </span>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              order.orderType === 'dine-in'
                                ? 'bg-[#C65D3B] text-white'
                                : 'bg-[#B98A5E] text-white'
                            }`}
                          >
                            {order.orderType === 'dine-in'
                              ? `Table ${order.tableNumber || 1}`
                              : 'Takeaway'}
                          </span>
                          <span className="text-[10px] text-[#4A372F] block mt-0.5 tabular-nums">
                            {getMinutesAgo(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Line Items */}
                      <div className="space-y-1.5 py-1">
                        {order.items.map((it) => (
                          <div key={it.id} className="flex justify-between items-start text-xs">
                            <span className="font-medium text-[#2B1B14]">
                              {it.quantity}x {it.name}
                              {it.selectedVariant && (
                                <span className="text-[#C65D3B] text-[10px] block">
                                  {it.selectedVariant}
                                </span>
                              )}
                              {it.notes && (
                                <span className="font-handwritten text-xs text-[#4A372F] block">
                                  “{it.notes}”
                                </span>
                              )}
                            </span>
                            <span className="tabular-nums text-[#4A372F] shrink-0 ml-1">
                              {formatINR(it.itemTotal)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="p-1.5 bg-[#F4EBDD] border-l-2 border-[#C65D3B] text-[11px] text-[#2B1B14]">
                          Kitchen note: {order.notes}
                        </div>
                      )}

                      {/* Payment & Total */}
                      <div className="pt-2 border-t border-dashed border-[#B98A5E]/30 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-[#2B1B14] tabular-nums">
                            {formatINR(order.total)}
                          </span>
                          <span className="text-[10px] text-[#4A372F] block uppercase">
                            {order.paymentMethod} ·{' '}
                            <span
                              className={
                                order.paymentStatus === 'paid'
                                  ? 'text-[#2E7D32] font-semibold'
                                  : 'text-[#C65D3B] font-semibold'
                              }
                            >
                              {order.paymentStatus}
                            </span>
                          </span>
                        </div>

                        {order.paymentStatus !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(order.id)}
                            className="px-2 py-0.5 bg-[#FAF5EC] border border-[#2E7D32] text-[#2E7D32] text-[10px] font-medium hover:bg-[#E8F5E9] cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>

                      {/* Actions: Prev stage, Next stage, Print */}
                      <div className="pt-2 flex items-center justify-between gap-1 border-t border-[#B98A5E]/20">
                        <div className="flex items-center gap-1">
                          {col.status !== 'received' && (
                            <button
                              type="button"
                              onClick={() => handlePreviousStatus(order.id, order.status)}
                              className="p-1 bg-[#FAF5EC] border border-[#B98A5E]/40 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
                              title="Move back"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setViewingReceiptOrder(order)}
                            className="p-1 bg-[#FAF5EC] border border-[#B98A5E]/40 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
                            title="Print KOT / Bill Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {col.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(order.id, order.status)}
                              className="px-2.5 py-1 bg-[#2B1B14] text-[#FAF5EC] font-medium text-[11px] hover:bg-[#3d281f] cursor-pointer flex items-center gap-1"
                            >
                              <span>
                                {col.status === 'received'
                                  ? 'Prepare'
                                  : col.status === 'preparing'
                                  ? 'Ready'
                                  : 'Complete'}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {col.status === 'received' && (
                            cancellingOrderId === order.id ? (
                              <div className="flex items-center gap-1 bg-[#FAF5EC] p-0.5 border border-[#C65D3B]">
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="px-2 py-0.5 bg-[#C65D3B] text-white text-[10px] font-bold cursor-pointer"
                                  title="Confirm cancellation"
                                >
                                  Void
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCancellingOrderId(null)}
                                  className="px-1.5 py-0.5 bg-[#E7D6BE] text-[#2B1B14] text-[10px] cursor-pointer"
                                  title="Keep ticket"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCancellingOrderId(order.id)}
                                className="p-1 text-[#C65D3B] hover:bg-[#C65D3B]/10 cursor-pointer"
                                title="Reject / Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          );
        })}
      </div>

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
