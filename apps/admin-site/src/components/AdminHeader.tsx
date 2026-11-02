import React, { useState } from 'react';
import {
  Bell,
  Menu,
  Moon,
  Sun,
  Tv,
  LogOut,
  Power,
  CalendarCheck,
  Check,
  Shield,
  User,
  Volume2,
  VolumeX,
  AlertTriangle,
} from 'lucide-react';
import {
  StaffUser,
  CAFE_CONFIG,
  playOrderAlertChime,
  cafeStore,
  getChimeSoundPreference,
  unlockAudioContext,
} from '@atelier/shared';
import { SoundSelectorModal } from './SoundSelectorModal';
import { NotificationCenter, AdminNotification } from './NotificationCenter';

interface AdminHeaderProps {
  currentStaff: StaffUser;
  pageTitle: string;
  newOrdersCount: number;
  onOpenMobileSidebar: () => void;
  onOpenKDS: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  acceptingOrders: boolean;
  onToggleAcceptingOrders: () => void;
  acceptingBookings: boolean;
  onToggleAcceptingBookings: () => void;
  notifications?: AdminNotification[];
  onMarkAllAsRead?: () => void;
  onMarkAsRead?: (id: string) => void;
  onClearNotifications?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentStaff,
  pageTitle,
  newOrdersCount,
  onOpenMobileSidebar,
  onOpenKDS,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  acceptingOrders,
  onToggleAcceptingOrders,
  acceptingBookings,
  onToggleAcceptingBookings,
  notifications = [],
  onMarkAllAsRead = () => {},
  onMarkAsRead = () => {},
  onClearNotifications = () => {},
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const connStatus = cafeStore.getConnectionStatus();

  return (
    <header
      className="sticky top-0 z-30 bg-[#FAF5EC]/95 backdrop-blur-xs border-b border-[#B98A5E]/40 transition-colors"
      onClick={() => unlockAudioContext()}
    >
      {!cafeStore.isFirebaseMode() && (
        <div className="bg-[#FFF8E1] text-[#7A5200] border-b border-[#FFE082] px-4 py-1 text-center text-[11px] font-mono font-medium flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5B358]" />
          <span>DEMO MODE: data is stored only in this browser</span>
        </div>
      )}

      {/* Prominent Offline Warning Banner */}
      {cafeStore.isFirebaseMode() && connStatus === 'offline' && (
        <div className="bg-[#FFEBEE] text-[#C65D3B] border-b border-[#C65D3B]/40 px-4 py-1.5 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Working offline. Changes will sync automatically when reconnected.</span>
        </div>
      )}

      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden p-1.5 text-[#4A372F] hover:text-[#2B1B14] border border-[#B98A5E]/40 bg-[#FAF5EC]"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-display text-lg sm:text-xl font-bold text-[#2B1B14] leading-tight">
                {pageTitle}
              </h1>
              {cafeStore.isFirebaseMode() ? (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border font-mono font-medium ${
                    connStatus === 'online'
                      ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/40'
                      : connStatus === 'reconnecting'
                      ? 'bg-[#FFF8E1] text-[#7A5200] border-[#E5B358] animate-pulse'
                      : 'bg-[#FFEBEE] text-[#C65D3B] border-[#C65D3B]/40 animate-pulse'
                  }`}
                  title={
                    connStatus === 'online'
                      ? 'Live Firestore sync connected'
                      : connStatus === 'reconnecting'
                      ? 'Reconnecting to Firestore...'
                      : 'Working offline; changes queued in cache'
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      connStatus === 'online'
                        ? 'bg-[#2E7D32]'
                        : connStatus === 'reconnecting'
                        ? 'bg-[#E5B358]'
                        : 'bg-[#C65D3B]'
                    }`}
                  />
                  {connStatus === 'online'
                    ? 'Cloud Sync Online'
                    : connStatus === 'reconnecting'
                    ? 'Reconnecting...'
                    : 'Offline Cache'}
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-[#FFF8E1] text-[#7A5200] border border-[#FFE082] font-mono font-medium"
                  title="Offline Browser Sandbox"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B358]" />
                  Demo Mode
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#4A372F] hidden sm:inline font-mono">
              {todayStr}
            </span>
          </div>
        </div>

        {/* Center / Right: Operational Toggles */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Master Toggle 1: Accepting Orders ON/OFF */}
          <button
            type="button"
            onClick={onToggleAcceptingOrders}
            className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border transition-colors cursor-pointer ${
              acceptingOrders
                ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/50 font-semibold'
                : 'bg-[#FFEBEE] text-[#C65D3B] border-[#C65D3B]/50 font-semibold'
            }`}
            title="When OFF, customer site shows 'Orders paused'"
            aria-label="Toggle live ordering"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Orders: {acceptingOrders ? 'ON' : 'PAUSED'}</span>
          </button>

          {/* Master Toggle 2: Accepting Bookings ON/OFF */}
          <button
            type="button"
            onClick={onToggleAcceptingBookings}
            className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border transition-colors cursor-pointer ${
              acceptingBookings
                ? 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/50'
                : 'bg-[#FFEBEE] text-[#C65D3B] border-[#C65D3B]/50 font-semibold'
            }`}
            title="When OFF, table bookings are paused"
            aria-label="Toggle table bookings"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#B98A5E]" />
            <span>Bookings: {acceptingBookings ? 'ON' : 'OFF'}</span>
          </button>

          {/* Master Toggle 3: Fullscreen Kitchen Display Mode Switch */}
          <button
            type="button"
            onClick={onOpenKDS}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#2B1B14] text-[#FAF5EC] hover:bg-[#3d281f] border border-[#2B1B14] font-semibold cursor-pointer shadow-xs"
            title="Open Fullscreen KDS for Kitchen Station Tablet"
          >
            <Tv className="w-3.5 h-3.5 text-[#E5B358]" />
            <span className="hidden sm:inline">Kitchen Display</span>
          </button>

          {/* Live Notification Center Dropdown & Alert Chime */}
          <NotificationCenter
            notifications={notifications}
            onMarkAllAsRead={onMarkAllAsRead}
            onMarkAsRead={onMarkAsRead}
            onClearNotifications={onClearNotifications}
          />

          {/* Sound Selector Modal Toggle (3 options + mute) */}
          <button
            type="button"
            onClick={() => setIsSoundModalOpen(true)}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#4A372F] hover:text-[#2B1B14] border border-[#B98A5E]/40 bg-[#FAF5EC] cursor-pointer"
            title={`Chime Profile: ${getChimeSoundPreference()}`}
            aria-label="Select order notification sound profile"
          >
            {getChimeSoundPreference() === 'mute' ? (
              <VolumeX className="w-4 h-4 text-[#C65D3B]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#2B1B14]" />
            )}
          </button>

          {/* Dark / Light Paper Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#4A372F] hover:text-[#2B1B14] border border-[#B98A5E]/40 bg-[#FAF5EC] cursor-pointer"
            title={isDarkMode ? 'Switch to Light Paper Theme' : 'Switch to High Contrast Dark Theme'}
            aria-label="Toggle theme mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#E5B358]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Keyboard Shortcuts Help */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))}
            className="hidden md:flex p-2 min-h-[36px] min-w-[36px] items-center justify-center text-[#4A372F] hover:text-[#2B1B14] border border-[#B98A5E]/40 bg-[#FAF5EC] cursor-pointer font-mono font-bold text-xs"
            title="Keyboard Quick Keys (?)"
            aria-label="Keyboard Shortcuts"
          >
            ?
          </button>

          {/* Staff Profile Menu & Logout */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-[#B98A5E]/50 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-xs cursor-pointer"
              aria-label="Staff Profile Menu"
            >
              <span className="w-5 h-5 rounded-full bg-[#C65D3B] text-white text-[10px] flex items-center justify-center font-bold">
                {currentStaff.avatarLetter}
              </span>
              <span className="font-semibold text-[#2B1B14] hidden md:inline truncate max-w-[90px]">
                {currentStaff.name}
              </span>
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 paper-sheet paper-grain border border-[#B98A5E]/50 shadow-xl p-2 z-50 text-xs animate-in fade-in"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-2 py-1.5 border-b border-[#B98A5E]/30 mb-1">
                  <span className="font-semibold text-[#2B1B14] block truncate">
                    {currentStaff.name}
                  </span>
                  <span className="text-[10px] text-[#C65D3B] font-mono uppercase font-bold">
                    Role: {currentStaff.role}
                  </span>
                </div>

                <div className="px-2 py-1 text-[11px] text-[#4A372F]">
                  Atelier Vélin OS v2.0
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full text-left px-2 py-1.5 text-[#C65D3B] hover:bg-[#C65D3B]/10 font-medium flex items-center gap-1.5 cursor-pointer mt-1 border-t border-[#B98A5E]/30 pt-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SoundSelectorModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />
    </header>
  );
};
