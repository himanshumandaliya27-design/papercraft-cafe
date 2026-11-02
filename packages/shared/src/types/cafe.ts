/**
 * Complete Data Model Types for Cafe Management System
 * Shared between customer-site and admin-site
 */

export type MenuCategory =
  | 'Coffee'
  | 'Cold Drinks'
  | 'Bakery'
  | 'Breakfast'
  | 'Snacks'
  | 'Desserts';

export interface MenuItemVariant {
  name: string;
  priceDelta: number;
}

export interface MenuItemAddOn {
  id?: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: number; // in INR (₹)
  isVeg: boolean;
  tags?: ('Bestseller' | 'New' | 'Chef Special' | 'Spicy' | 'Signature' | 'Gluten-Free')[];
  isAvailable: boolean;
  image: string;
  imageUrl?: string;
  thumbUrl?: string;
  prepTime: string;
  originNotes?: string;
  variants?: MenuItemVariant[];
  addOns?: MenuItemAddOn[];
  stockCount?: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  basePrice: number;
  selectedVariant?: string;
  selectedAddOns?: string[];
  notes?: string;
  itemTotal: number;
}

export type OrderType = 'dine-in' | 'takeaway' | 'pre-order';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Order {
  id: string;
  orderNumber: string; // e.g. #AV-0142
  customerId: string; // phone number
  customerName: string;
  phone: string;
  email?: string;
  orderType: OrderType;
  tableNumber?: number;
  pickupTime?: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  discount: number;
  discountReason?: string;
  tip: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  handledBy?: string;
  customerUid?: string;
  createdAt: string; // ISO string
  updatedAt?: string;
}

export interface Customer {
  id: string; // phone number
  name: string;
  phone: string;
  email?: string;
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  totalSpent: number;
  averageBill: number;
  favoriteItems: string[];
  favouriteItems?: string[];
  birthday?: string;
  tags: ('VIP' | 'Regular' | 'New')[];
  notes?: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Booking {
  id: string; // e.g. BK-2041
  customerName: string;
  phone: string;
  email?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 AM"
  guests: number;
  tableNumber: number;
  occasion: 'Casual' | 'Birthday' | 'Date' | 'Meeting' | 'Anniversary' | 'Other';
  specialRequest?: string;
  status: BookingStatus;
  preOrderItems?: OrderItem[];
  customerUid?: string;
  createdAt: string;
}

export type TableStatus = 'free' | 'booked' | 'occupied' | 'needs-cleaning' | 'available' | 'reserved';

export interface TableLiveState {
  id: string;
  number: number;
  tableNumber?: number;
  label: string;
  capacity: number;
  zone: string;
  status: TableStatus;
  activeOrderId?: string;
  currentOrderId?: string;
  activeBookingId?: string;
  lastOccupiedAt?: string;
  mergedWith?: number[]; // Array of table numbers merged together
  isMergedChild?: boolean; // Flag if this table is slaved to a merged parent
  originalCapacity?: number; // Preserved capacity before merging
}

export interface Bill {
  id: string;
  billNumber: string; // e.g. BILL-9821
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  tableNumber?: number;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  cgst?: number;
  sgst?: number;
  totalGst?: number;
  discount: number;
  discountReason?: string;
  tip: number;
  total: number;
  grandTotal?: number;
  paymentMethod: PaymentMethod;
  status: 'settled' | 'refunded' | 'void';
  voidReason?: string;
  cashier: string;
  cashierName?: string;
  gstin?: string;
  date?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  paidBy?: string;
  paidVia?: PaymentMethod;
  date: string;
  createdAt?: string;
}

export interface DailyClosing {
  id: string;
  date: string;
  openingCash: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  razorpaySales: number;
  totalSales: number;
  totalExpenses: number;
  expensesTotal?: number;
  expectedCashInDrawer: number;
  actualCashCounted: number;
  countedCashInDrawer?: number;
  variance: number;
  difference?: number;
  notes?: string;
  closedBy: string;
  createdAt: string;
}

export type StaffRole = 'owner' | 'manager' | 'staff';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  phone?: string;
  active?: boolean;
  avatarLetter: string;
  pin?: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  staffName: string;
  staffRole?: string;
  timestamp: string;
}

export type ActivityLog = ActivityLogItem;
