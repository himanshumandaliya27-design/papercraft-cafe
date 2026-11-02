import React, { useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Calendar,
  Table as TableIcon,
  Receipt,
  Crown,
  FileSpreadsheet,
  Users,
  Shield,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Coffee,
  X,
} from 'lucide-react';
import { StaffUser, CAFE_CONFIG, useFocusTrap } from '@atelier/shared';

interface AdminSidebarProps {
  currentStaff: StaffUser;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  minRole: 'staff' | 'manager' | 'owner';
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentStaff,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isMobileOpen, mobileDrawerRef, onCloseMobile);

  const isOwner = currentStaff.role === 'owner';
  const isManagerOrOwner = currentStaff.role === 'owner' || currentStaff.role === 'manager';

  const navGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { path: '/dashboard', label: 'Counter Dashboard', icon: LayoutDashboard, minRole: 'manager' },
      ],
    },
    {
      group: 'Operations',
      items: [
        { path: '/orders', label: 'Live Orders Kanban', icon: UtensilsCrossed, minRole: 'staff' },
        { path: '/bookings', label: 'Table Bookings', icon: Calendar, minRole: 'staff' },
        { path: '/tables', label: 'Floor Plan & Tables', icon: TableIcon, minRole: 'staff' },
      ],
    },
    {
      group: 'Money & Sales',
      items: [
        { path: '/bills', label: 'Bills & Invoicing', icon: Receipt, minRole: 'manager' },
        { path: '/top-bills', label: 'Highest Bills / VIP', icon: Crown, minRole: 'manager' },
        { path: '/reports', label: 'Reports & Day Closing', icon: FileSpreadsheet, minRole: 'manager' },
      ],
    },
    {
      group: 'People & CRM',
      items: [
        { path: '/customers', label: 'Customer Database', icon: Users, minRole: 'manager' },
        { path: '/staff', label: 'Staff & Audit Logs', icon: Shield, minRole: 'owner' },
      ],
    },
    {
      group: 'Setup',
      items: [
        { path: '/menu-manager', label: 'Menu & Stock (86)', icon: BookOpen, minRole: 'manager' },
        { path: '/settings', label: 'Store Settings & QR', icon: Settings, minRole: 'owner' },
      ],
    },
  ];

  const filterItem = (item: NavItem) => {
    if (item.minRole === 'owner') return isOwner;
    if (item.minRole === 'manager') return isManagerOrOwner;
    return true; // staff
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF5EC] border-r border-[#B98A5E]/40 select-none paper-grain">
      {/* Brand & Collapse Header */}
      <div className="p-4 border-b border-[#B98A5E]/30 flex items-center justify-between gap-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-7 h-7 rounded-full bg-[#2B1B14] text-[#FAF5EC] flex items-center justify-center font-serif-display font-bold text-xs shrink-0">
              AV
            </span>
            <div className="truncate">
              <span className="font-serif-display font-bold text-sm text-[#2B1B14] block leading-tight truncate">
                {CAFE_CONFIG.cafeName}
              </span>
              <span className="text-[10px] text-[#C65D3B] font-mono uppercase tracking-wider block">
                Manager Portal
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <span className="w-8 h-8 mx-auto rounded-full bg-[#2B1B14] text-[#FAF5EC] flex items-center justify-center font-serif-display font-bold text-xs">
            AV
          </span>
        )}

        {/* Toggle Collapse Button on Desktop */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:inline-flex p-1.5 text-[#4A372F] hover:text-[#2B1B14] hover:bg-[#E7D6BE] rounded-xs cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar to Icon Rail'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav aria-label="Admin Navigation" className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(filterItem);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#B98A5E] font-semibold">
                  {group.group}
                </div>
              )}

              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onCloseMobile()}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors border ${
                      isActive
                        ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14] shadow-xs font-semibold'
                        : 'bg-transparent text-[#4A372F] border-transparent hover:bg-[#E7D6BE]/50 hover:text-[#2B1B14]'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#C65D3B]' : 'text-[#B98A5E]'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Staff User Footer Badge */}
      <div className="p-3 border-t border-[#B98A5E]/30 bg-[#FAF5EC]">
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-[#C65D3B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {currentStaff.avatarLetter}
          </div>
          {!isCollapsed && (
            <div className="truncate text-xs">
              <span className="font-semibold text-[#2B1B14] block leading-tight truncate">
                {currentStaff.name}
              </span>
              <span className="text-[10px] font-mono text-[#C65D3B] uppercase font-bold">
                Role: {currentStaff.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        aria-label="Desktop Sidebar"
        className={`hidden md:block shrink-0 transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-[100dvh]">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden bg-[#2B1B14]/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={onCloseMobile}
        >
          <div
            ref={mobileDrawerRef}
            tabIndex={-1}
            className="w-72 max-w-[85vw] h-[100dvh] shadow-2xl animate-in slide-in-from-left duration-200 focus:outline-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
