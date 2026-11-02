/**
 * DataService Interface
 * Unified contract implemented by both FirestoreService (production cloud)
 * and LocalDemoService (in-browser offline fallback).
 */

import {
  MenuItem,
  Customer,
  Order,
  Booking,
  TableLiveState,
  StaffUser,
  Bill,
  Expense,
  DailyClosing,
  ActivityLogItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  BookingStatus,
  TableStatus,
} from '../types/cafe';

export interface DataService {
  isFirebaseMode(): boolean;
  getConnectionStatus(): 'online' | 'reconnecting' | 'offline' | 'local-demo';
  subscribe(listener: () => void): () => void;

  // Menu items
  getMenuItems(): MenuItem[];
  updateMenuItemAvailability(id: string, isAvailable: boolean): Promise<void>;
  toggleMenuItemAvailability(id: string, forceState?: boolean): Promise<void>;
  updateMenuItemStock(id: string, stockCount?: number): Promise<void>;
  saveMenuItem(item: MenuItem): Promise<void>;
  deleteMenuItem(id: string): Promise<void>;

  // Orders
  getOrders(): Order[];
  getOrderById(orderId: string): Order | undefined;
  getOrdersByPhone(phone: string): Order[];
  getCustomerOrders(phone: string): Order[];
  placeOrder(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>,
    customerUid?: string
  ): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus, staffName?: string): Promise<void>;
  updateOrderPayment(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentMethod?: PaymentMethod,
    staffName?: string
  ): Promise<void>;
  applyDiscountToOrder(
    orderId: string,
    discountAmount: number,
    discountReason?: string,
    staffName?: string
  ): Promise<void>;

  // Tables
  getTables(): TableLiveState[];
  updateTableStatus(
    tableIdOrNumber: number | string,
    status: TableStatus,
    activeBookingId?: string
  ): Promise<void>;

  // Bookings
  getBookings(): Booking[];
  getBookingById(id: string): Booking | undefined;
  getBookingsByPhone(phone: string): Booking[];
  createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt'>,
    customerUid?: string
  ): Promise<Booking>;
  updateBookingStatus(id: string, status: BookingStatus, staffName?: string): Promise<void>;

  // Customers
  getCustomers(): Customer[];
  getCustomerByPhone(phone: string): Customer | undefined;
  deleteCustomerData(phone: string): Promise<void>;

  // Bills
  getBills(): Bill[];
  voidBill(billId: string, reason: string): Promise<void>;

  // Expenses
  getExpenses(): Expense[];
  addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense>;

  // Daily closings & Cash Float
  getDailyClosings(): DailyClosing[];
  recordDailyClosing(closing: Omit<DailyClosing, 'id' | 'createdAt'>): Promise<DailyClosing>;
  getOpeningFloat(date?: string): number;
  setOpeningFloat(date: string, amount: number, staffName?: string): Promise<void>;

  // Tables Merge & Split
  mergeTables(primaryTableNumber: number, secondaryTableNumbers: number[]): Promise<void>;
  splitTable(tableNumber: number): Promise<void>;

  // Staff
  getStaff(): StaffUser[];
  getCurrentStaff(): StaffUser | null;
  setCurrentStaff(staff: StaffUser | null): void;
  addStaffUser(staff: {
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'staff';
    phone?: string;
    pin?: string;
    avatarLetter?: string;
  }): Promise<StaffUser> | StaffUser;
  deleteStaffUser(id: string): Promise<void> | void;

  // Activity log
  getActivityLog(): ActivityLogItem[];

  // Settings & Maintenance
  resetDemoData(): Promise<void>;
  resetToDefaults(): Promise<void>;
}
