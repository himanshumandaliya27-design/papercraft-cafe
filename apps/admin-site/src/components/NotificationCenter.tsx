import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  ShoppingBag,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface AdminNotification {
  id: string;
  type: 'order' | 'booking' | 'cancellation' | 'payment' | 'stock';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
  targetRoute?: string;
}

interface NotificationCenterProps {
  notifications: AdminNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onClearNotifications: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onClearNotifications,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleNotificationClick = (item: AdminNotification) => {
    onMarkAsRead(item.id);
    setIsOpen(false);
    if (item.targetRoute) {
      navigate(item.targetRoute);
    }
  };

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-3.5 h-3.5 text-[#C65D3B]" />;
      case 'booking':
        return <CalendarCheck className="w-3.5 h-3.5 text-[#2E7D32]" />;
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-[#B98A5E]" />;
      case 'cancellation':
      case 'stock':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#C65D3B]" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-[#4A372F]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#4A372F] hover:text-[#2B1B14] border border-[#B98A5E]/40 bg-[#FAF5EC] cursor-pointer transition-colors"
        title="Live Activity & Notifications"
        aria-label={`Notifications: ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C65D3B] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C65D3B] text-white text-[9px] font-bold items-center justify-center tabular-nums">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 paper-sheet paper-grain border border-[#B98A5E]/60 shadow-2xl p-0 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3 bg-[#FAF5EC] border-b border-[#B98A5E]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif-display font-bold text-[#2B1B14] text-sm">
                Activity Center
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#C65D3B] text-white font-mono text-[10px] font-bold">
                  {unreadCount} NEW
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-[11px] text-[#2E7D32] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark Read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearNotifications}
                  className="text-[11px] text-[#4A372F] hover:text-[#C65D3B] cursor-pointer"
                  title="Clear notification list"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#B98A5E]/20">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#4A372F]/70 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-[#B98A5E]/40" />
                <p className="font-serif-display text-xs font-semibold text-[#2B1B14]">
                  No Notifications
                </p>
                <p className="text-[10px]">
                  Incoming orders, table bookings, and UPI payments will appear here in real-time.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-[#FAF5EC] ${
                    !n.read ? 'bg-[#FAF5EC]/90 border-l-3 border-[#C65D3B]' : 'bg-transparent opacity-85'
                  }`}
                >
                  <div className="p-1.5 bg-[#E7D6BE]/40 border border-[#B98A5E]/30 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-[#2B1B14] truncate block">
                        {n.title}
                      </span>
                      <span className="text-[9px] text-[#4A372F] shrink-0 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A372F] mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    {n.targetRoute && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#C65D3B] mt-1 font-medium hover:underline">
                        <span>View Details</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

