/**
 * Atelier Vélin Local Demo Service
 * Implements DataService for offline in-browser preview mode.
 * Contains rich reactive local simulation with cross-tab storage sync.
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
import { CAFE_CONFIG } from '../config/cafeConfig';
import {
  SAMPLE_MENU_ITEMS,
  SAMPLE_CUSTOMERS,
  SAMPLE_ORDERS,
  SAMPLE_BOOKINGS,
  INITIAL_TABLE_STATES,
  SAMPLE_STAFF,
  SAMPLE_EXPENSES,
} from '../data/sampleCafeData';
import { playOrderAlertChime } from '../utils/soundAlert';
import { DataService } from './dataService';

const STORAGE_KEY = 'atelier_velin_store_v1';
const CURRENT_STAFF_KEY = 'atelier_velin_staff_session';

type Listener = () => void;

export class LocalDemoService implements DataService {
  private menuItems: MenuItem[] = [];
  private orders: Order[] = [];
  private tables: TableLiveState[] = [];
  private customers: Customer[] = [];
  private bookings: Booking[] = [];
  private bills: Bill[] = [];
  private expenses: Expense[] = [];
  private dailyClosings: DailyClosing[] = [];
  private activityLog: ActivityLogItem[] = [];
  private staff: StaffUser[] = [];
  private currentStaff: StaffUser | null = null;
  private listeners: Set<Listener> = new Set();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  public isFirebaseMode(): boolean {
    return false;
  }

  public getConnectionStatus(): 'online' | 'reconnecting' | 'offline' | 'local-demo' {
    return 'local-demo';
  }

  private initialize() {
    if (this.isInitialized) return;
    this.loadFromStorage();
    this.loadCurrentStaff();

    // Listen for storage changes across tabs on same origin
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.loadFromStorage();
          this.notify();
        } else if (e.key === CURRENT_STAFF_KEY) {
          this.loadCurrentStaff();
          this.notify();
        }
      });
    }

    this.isInitialized = true;
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') {
      this.seedInitialData();
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.menuItems = parsed.menuItems || [...SAMPLE_MENU_ITEMS];
        this.orders = parsed.orders || [...SAMPLE_ORDERS];
        this.tables = parsed.tables || [...INITIAL_TABLE_STATES];
        this.customers = parsed.customers || [...SAMPLE_CUSTOMERS];
        this.bookings = parsed.bookings || [...SAMPLE_BOOKINGS];
        this.bills = parsed.bills || [];
        this.expenses = parsed.expenses || [...SAMPLE_EXPENSES];
        this.dailyClosings = parsed.dailyClosings || [];
        this.activityLog = parsed.activityLog || [];
        this.staff = parsed.staff || [...SAMPLE_STAFF];
      } else {
        this.seedInitialData();
        this.saveToStorage();
      }
      this.loadCurrentStaff();
    } catch (err) {
      console.warn('Failed to load store from localStorage', err);
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    this.menuItems = [...SAMPLE_MENU_ITEMS];
    this.orders = [...SAMPLE_ORDERS];
    this.tables = [...INITIAL_TABLE_STATES];
    this.customers = [...SAMPLE_CUSTOMERS];
    this.bookings = [...SAMPLE_BOOKINGS];
    this.expenses = [...SAMPLE_EXPENSES];
    this.staff = [...SAMPLE_STAFF];
    this.bills = [];
    this.dailyClosings = [];
    this.activityLog = [];

    // Seed initial settled bills from existing paid sample orders
    this.orders.forEach((o) => {
      if (o.paymentStatus === 'paid') {
        this.bills.push({
          id: `bill-${o.id}`,
          billNumber: `BILL-${o.orderNumber.replace('#AV-', '')}`,
          orderId: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          phone: o.phone,
          tableNumber: o.tableNumber,
          orderType: o.orderType,
          items: o.items,
          subtotal: o.subtotal,
          gst: o.gst,
          discount: o.discount || 0,
          discountReason: o.discountReason,
          tip: o.tip || 0,
          total: o.total,
          paymentMethod: o.paymentMethod,
          status: 'settled',
          cashier: o.handledBy || 'Clara Moreau',
          createdAt: o.createdAt,
        });
      }
    });

    this.logActivity('System Initialized', 'Atelier Vélin Local Demo initialized with micro-lot catalog');
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        menuItems: this.menuItems,
        orders: this.orders,
        tables: this.tables,
        customers: this.customers,
        bookings: this.bookings,
        bills: this.bills,
        expenses: this.expenses,
        dailyClosings: this.dailyClosings,
        activityLog: this.activityLog,
        staff: this.staff,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to save store to localStorage', err);
    }
  }

  private loadCurrentStaff() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(CURRENT_STAFF_KEY);
      if (saved) {
        this.currentStaff = JSON.parse(saved);
      } else {
        // Default to Clara in demo mode for frictionless testing
        this.currentStaff = this.staff[0] || null;
      }
    } catch {
      this.currentStaff = this.staff[0] || null;
    }
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.warn('Listener error', err);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // ================= GETTERS =================

  public getMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public getTables(): TableLiveState[] {
    return this.tables;
  }

  public getCustomers(): Customer[] {
    return this.customers;
  }

  public getBookings(): Booking[] {
    return this.bookings;
  }

  public getBills(): Bill[] {
    return this.bills;
  }

  public getExpenses(): Expense[] {
    return this.expenses;
  }

  public getDailyClosings(): DailyClosing[] {
    return this.dailyClosings;
  }

  public getActivityLog(): ActivityLogItem[] {
    return this.activityLog;
  }

  public getStaff(): StaffUser[] {
    return this.staff;
  }

  public getCurrentStaff(): StaffUser | null {
    return this.currentStaff;
  }

  public setCurrentStaff(staff: StaffUser | null) {
    this.currentStaff = staff;
    if (typeof window !== 'undefined') {
      if (staff) {
        localStorage.setItem(CURRENT_STAFF_KEY, JSON.stringify(staff));
      } else {
        localStorage.removeItem(CURRENT_STAFF_KEY);
      }
    }
    this.notify();
  }

  public getCustomerByPhone(phone: string): Customer | undefined {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return this.customers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
  }

  public getCustomerOrders(phone: string): Order[] {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return this.orders.filter((o) => o.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
  }

  public getOrdersByPhone(phone: string): Order[] {
    return this.getCustomerOrders(phone);
  }

  public getBookingsByPhone(phone: string): Booking[] {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return this.bookings.filter((b) => b.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  }

  public getBookingById(bookingId: string): Booking | undefined {
    return this.bookings.find((b) => b.id === bookingId || b.id === `BK-${bookingId}` || bookingId.includes(b.id));
  }

  public addStaffUser(staffData: {
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'staff';
    phone?: string;
    pin?: string;
    avatarLetter?: string;
  }): StaffUser {
    const newStaff: StaffUser = {
      id: `staff-${Date.now()}`,
      name: staffData.name,
      email: staffData.email,
      role: staffData.role,
      avatarLetter: staffData.avatarLetter || staffData.name.charAt(0).toUpperCase(),
      phone: staffData.phone || '',
      active: true,
    };
    this.staff.push(newStaff);
    this.logActivity('Staff Provisioned', `Added staff user ${newStaff.name} (${newStaff.role})`);
    this.saveToStorage();
    this.notify();
    return newStaff;
  }

  public deleteStaffUser(id: string) {
    const s = this.staff.find((st) => st.id === id);
    this.staff = this.staff.filter((st) => st.id !== id);
    if (s) {
      this.logActivity('Staff Deprovisioned', `Removed staff user ${s.name}`);
    }
    this.saveToStorage();
    this.notify();
  }

  // ================= MUTATIONS =================

  public async placeOrder(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>,
    customerUid?: string
  ): Promise<Order> {
    if (!CAFE_CONFIG.acceptingOrders) {
      throw new Error('The kitchen is currently not accepting new orders.');
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Verify stock availability and recalculate totals to prevent client-side price tampering
    let calculatedSubtotal = 0;
    const validatedItems = orderData.items.map((it) => {
      if (it.quantity <= 0) {
        throw new Error(`Invalid quantity for item ${it.name}`);
      }
      const menuItem = this.menuItems.find((m) => m.id === it.menuItemId);
      if (menuItem && menuItem.isAvailable === false) {
        throw new Error(`"${menuItem.name}" is sold out and cannot be ordered.`);
      }
      if (menuItem && menuItem.stockCount !== undefined && menuItem.stockCount < it.quantity) {
        throw new Error(`Insufficient stock for "${menuItem.name}". Only ${menuItem.stockCount} remaining in stock.`);
      }

      // Base price validation from canonical catalog
      if (menuItem && Math.abs(it.basePrice - menuItem.price) > 0.01) {
        throw new Error(`Tampered price detected for "${it.name}". Claimed: ${it.basePrice}, Actual: ${menuItem.price}`);
      }
      let unitPrice = menuItem ? menuItem.price : it.basePrice;
      if (it.selectedVariant && menuItem?.variants) {
        const vr = menuItem.variants.find((v) => v.name === it.selectedVariant);
        if (vr) unitPrice += vr.priceDelta;
      }
      if (it.selectedAddOns && menuItem?.addOns) {
        it.selectedAddOns.forEach((addonName) => {
          const ao = menuItem.addOns?.find((a) => a.name === addonName);
          if (ao) unitPrice += ao.price;
        });
      }

      const itemTotal = unitPrice * it.quantity;
      calculatedSubtotal += itemTotal;
      return {
        ...it,
        basePrice: unitPrice,
        itemTotal,
      };
    });

    const gstRate = CAFE_CONFIG.gstPercentage / 100;
    const calculatedGst = Number((calculatedSubtotal * gstRate).toFixed(2));
    const calculatedTotal = Math.round(
      calculatedSubtotal + calculatedGst + (orderData.tip || 0) - (orderData.discount || 0)
    );

    const nextSeq = this.orders.length + 140;
    const orderNumber = `#AV-0${nextSeq}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      customerUid,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      gst: calculatedGst,
      total: Math.max(0, calculatedTotal),
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(newOrder);

    // Decrement stock counts and auto-mark "Sold Out (86)" at zero
    newOrder.items.forEach((it) => {
      const menuItem = this.menuItems.find((m) => m.id === it.menuItemId);
      if (menuItem && menuItem.stockCount !== undefined) {
        menuItem.stockCount = Math.max(0, menuItem.stockCount - it.quantity);
        if (menuItem.stockCount === 0) {
          menuItem.isAvailable = false;
          this.logActivity('Auto-86 Sold Out', `${menuItem.name} reached 0 stock and was auto-marked Sold Out (86).`);
        }
      }
    });

    // Update or create customer profile
    const cleanPhone = newOrder.phone.replace(/\D/g, '').slice(-10);
    let customer = this.customers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
    const orderedNames = newOrder.items.map((i) => i.name);

    if (customer) {
      customer.name = newOrder.customerName || customer.name;
      customer.lastVisit = now.split('T')[0];
      customer.totalVisits += 1;
      // Only add to total spent if marked paid
      if (newOrder.paymentStatus === 'paid') {
        customer.totalSpent += newOrder.total;
        customer.averageBill = Number((customer.totalSpent / customer.totalVisits).toFixed(1));
      }
      customer.favoriteItems = Array.from(new Set([...customer.favoriteItems, ...orderedNames])).slice(0, 5);

      if (customer.totalSpent >= CAFE_CONFIG.vipThresholdSpend || customer.totalVisits >= CAFE_CONFIG.vipThresholdVisits) {
        if (!customer.tags.includes('VIP')) {
          customer.tags.push('VIP');
        }
      }
    } else {
      customer = {
        id: cleanPhone,
        name: newOrder.customerName,
        phone: cleanPhone,
        email: newOrder.email,
        firstVisit: now.split('T')[0],
        lastVisit: now.split('T')[0],
        totalVisits: 1,
        totalSpent: newOrder.paymentStatus === 'paid' ? newOrder.total : 0,
        averageBill: newOrder.paymentStatus === 'paid' ? newOrder.total : 0,
        favoriteItems: orderedNames.slice(0, 3),
        tags: ['New'],
      };
      this.customers.unshift(customer);
    }

    // Update Table state if Dine-in
    if (newOrder.orderType === 'dine-in' && newOrder.tableNumber) {
      const table = this.tables.find((t) => t.number === newOrder.tableNumber);
      if (table) {
        table.status = 'occupied';
        table.activeOrderId = newOrder.id;
        table.lastOccupiedAt = now;
      }
    }

    this.logActivity(
      'Order Placed',
      `${newOrder.orderNumber} (${newOrder.orderType}) · ₹${newOrder.total} · ${newOrder.customerName}`
    );

    playOrderAlertChime();
    this.saveToStorage();
    this.notify();
    return newOrder;
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus, staffName?: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Free table if completed or cancelled
    if (order.tableNumber && (status === 'completed' || status === 'cancelled')) {
      const table = this.tables.find((t) => t.number === order.tableNumber);
      if (table && table.activeOrderId === order.id) {
        table.status = status === 'completed' ? 'needs-cleaning' : 'free';
        table.activeOrderId = undefined;
      }
    }

    this.logActivity('Status Updated', `${order.orderNumber}: ${oldStatus} ➔ ${status}`, staffName);
    this.saveToStorage();
    this.notify();
  }

  public async updateOrderPayment(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentMethod?: PaymentMethod,
    staffName?: string
  ) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    order.paymentStatus = paymentStatus;
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }
    order.updatedAt = new Date().toISOString();

    if (paymentStatus === 'paid') {
      // Update customer total spend
      const cleanPhone = order.phone.replace(/\D/g, '').slice(-10);
      const customer = this.customers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
      if (customer) {
        customer.totalSpent += order.total;
        customer.averageBill = Number((customer.totalSpent / customer.totalVisits).toFixed(1));
      }

      if (!this.bills.some((b) => b.orderId === order.id)) {
        const bill: Bill = {
          id: `bill-${order.id}`,
          billNumber: `BILL-${order.orderNumber.replace('#AV-', '')}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          phone: order.phone,
          tableNumber: order.tableNumber,
          orderType: order.orderType,
          items: order.items,
          subtotal: order.subtotal,
          gst: order.gst,
          discount: order.discount,
          discountReason: order.discountReason,
          tip: order.tip,
          total: order.total,
          paymentMethod: order.paymentMethod,
          status: 'settled',
          cashier: staffName || this.currentStaff?.name || 'Counter Staff',
          createdAt: new Date().toISOString(),
        };
        this.bills.unshift(bill);
      }
    }

    this.logActivity('Payment Updated', `${order.orderNumber} marked as ${paymentStatus.toUpperCase()} (${paymentMethod || order.paymentMethod})`, staffName);
    this.saveToStorage();
    this.notify();
  }

  public async applyDiscountToOrder(
    orderId: string,
    discountAmount: number,
    discountReason?: string,
    staffName?: string
  ) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;
    order.discount = discountAmount;
    order.discountReason = discountReason || 'Courtesy Discount';
    order.total = Math.max(0, order.subtotal + order.gst - discountAmount + (order.tip || 0));
    order.updatedAt = new Date().toISOString();
    this.logActivity('Discount Applied', `Applied discount ₹${discountAmount} (${order.discountReason}) to ${order.orderNumber}`, staffName);
    this.saveToStorage();
    this.notify();
  }

  public async createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt'>,
    customerUid?: string
  ): Promise<Booking> {
    // Double booking prevention guard
    const isDoubleBooked = this.bookings.some(
      (b) =>
        b.date === bookingData.date &&
        b.timeSlot === bookingData.timeSlot &&
        b.tableNumber === bookingData.tableNumber &&
        b.status !== 'cancelled' &&
        b.status !== 'no-show'
    );
    if (isDoubleBooked) {
      throw new Error(`Table ${bookingData.tableNumber} is already booked for ${bookingData.timeSlot} on ${bookingData.date}.`);
    }

    const nextId = `BK-${Math.floor(2045 + Math.random() * 8000)}`;
    const newBooking: Booking = {
      ...bookingData,
      customerUid,
      id: nextId,
      createdAt: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);

    // If booking is for today, mark table as booked
    const todayStr = new Date().toISOString().split('T')[0];
    if (bookingData.date === todayStr) {
      const table = this.tables.find((t) => t.number === bookingData.tableNumber);
      if (table && table.status === 'free') {
        table.status = 'booked';
        table.activeBookingId = newBooking.id;
      }
    }

    this.logActivity('Table Booking Created', `${newBooking.id} for Table ${newBooking.tableNumber} on ${newBooking.date} (${newBooking.customerName})`);
    this.saveToStorage();
    this.notify();
    return newBooking;
  }

  public async updateBookingStatus(bookingId: string, status: BookingStatus, staffName?: string) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    booking.status = status;
    const table = this.tables.find((t) => t.number === booking.tableNumber);

    if (table) {
      if (status === 'seated') {
        table.status = 'occupied';
      } else if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
        if (table.activeBookingId === bookingId) {
          table.status = 'free';
          table.activeBookingId = undefined;
        }
      }
    }

    this.logActivity('Booking Updated', `${booking.id} status changed to ${status.toUpperCase()}`, staffName);
    this.saveToStorage();
    this.notify();
  }

  public async updateTableStatus(
    tableIdOrNumber: number | string,
    status: TableStatus,
    activeBookingId?: string
  ) {
    const table = this.tables.find(
      (t) => t.id === String(tableIdOrNumber) || t.number === Number(tableIdOrNumber)
    );
    if (!table) return;

    table.status = status;
    if (activeBookingId !== undefined) {
      table.activeBookingId = activeBookingId;
    }
    this.logActivity('Table Status Changed', `Table ${table.number} marked as ${status.toUpperCase()}`);
    this.saveToStorage();
    this.notify();
  }

  public async updateMenuItemAvailability(id: string, isAvailable: boolean) {
    const item = this.menuItems.find((m) => m.id === id);
    if (item) {
      item.isAvailable = isAvailable;
      this.logActivity('Menu Item Updated', `${item.name} marked as ${isAvailable ? 'IN STOCK' : 'SOLD OUT (86)'}`);
      this.saveToStorage();
      this.notify();
    }
  }

  public async toggleMenuItemAvailability(id: string, forceState?: boolean) {
    const item = this.menuItems.find((m) => m.id === id);
    if (item) {
      const nextState = forceState !== undefined ? forceState : !item.isAvailable;
      await this.updateMenuItemAvailability(id, nextState);
    }
  }

  public async updateMenuItemStock(id: string, stockCount?: number) {
    const item = this.menuItems.find((m) => m.id === id);
    if (item) {
      item.stockCount = stockCount;
      if (stockCount !== undefined && stockCount > 0 && !item.isAvailable) {
        item.isAvailable = true;
      } else if (stockCount === 0) {
        item.isAvailable = false;
      }
      this.logActivity('Stock Updated', `${item.name}: Stock set to ${stockCount !== undefined ? stockCount : 'unlimited'}`);
      this.saveToStorage();
      this.notify();
    }
  }

  public async saveMenuItem(item: MenuItem) {
    const index = this.menuItems.findIndex((m) => m.id === item.id);
    if (index >= 0) {
      this.menuItems[index] = item;
      this.logActivity('Menu Item Saved', `Updated ${item.name}`);
    } else {
      this.menuItems.push(item);
      this.logActivity('Menu Item Created', `Added ${item.name}`);
    }
    this.saveToStorage();
    this.notify();
  }

  public async deleteMenuItem(id: string) {
    const item = this.menuItems.find((m) => m.id === id);
    this.menuItems = this.menuItems.filter((m) => m.id !== id);
    if (item) {
      this.logActivity('Menu Item Deleted', `Removed ${item.name}`);
    }
    this.saveToStorage();
    this.notify();
  }

  public async voidBill(billId: string, reason: string) {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) return;
    bill.status = 'void';
    bill.voidReason = reason;

    const order = this.orders.find((o) => o.id === bill.orderId);
    if (order) {
      order.paymentStatus = 'refunded';
      order.status = 'cancelled';
    }

    this.logActivity('Bill Voided', `${bill.billNumber} voided. Reason: ${reason}`);
    this.saveToStorage();
    this.notify();
  }

  public async addExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(newExpense);
    this.logActivity('Expense Logged', `₹${newExpense.amount} for ${newExpense.description} (${newExpense.category})`);
    this.saveToStorage();
    this.notify();
    return newExpense;
  }

  public async recordDailyClosing(closingData: Omit<DailyClosing, 'id' | 'createdAt'>): Promise<DailyClosing> {
    const newClosing: DailyClosing = {
      ...closingData,
      id: `closing-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.dailyClosings.unshift(newClosing);
    this.logActivity('Day Closed', `Day closing recorded by ${newClosing.closedBy}. Variance: ₹${newClosing.variance}`);
    this.saveToStorage();
    this.notify();
    return newClosing;
  }

  public getOpeningFloat(date?: string): number {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const key = `atelier_opening_float_${targetDate}`;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) return Number(stored);
    }
    const closing = this.dailyClosings.find((c) => c.date === targetDate);
    if (closing) return closing.openingCash;
    return 3000;
  }

  public async setOpeningFloat(date: string, amount: number, staffName?: string): Promise<void> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const key = `atelier_opening_float_${targetDate}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, String(amount));
    }
    this.logActivity('Opening Float Recorded', `Morning register float set to ₹${amount} for ${targetDate}`, staffName);
    this.saveToStorage();
    this.notify();
  }

  public async mergeTables(primaryTableNumber: number, secondaryTableNumbers: number[]): Promise<void> {
    const primary = this.tables.find((t) => t.number === primaryTableNumber);
    if (!primary) return;

    const secondaries = this.tables.filter((t) => secondaryTableNumbers.includes(t.number));
    if (secondaries.length === 0) return;

    if (!primary.originalCapacity) {
      primary.originalCapacity = primary.capacity;
    }

    let combinedCapacity = primary.originalCapacity;
    const allMergedNumbers = [primaryTableNumber];

    secondaries.forEach((sec) => {
      if (!sec.originalCapacity) {
        sec.originalCapacity = sec.capacity;
      }
      combinedCapacity += sec.originalCapacity;
      sec.isMergedChild = true;
      sec.mergedWith = [primaryTableNumber];
      sec.status = primary.status;
      allMergedNumbers.push(sec.number);
    });

    primary.capacity = combinedCapacity;
    primary.mergedWith = secondaryTableNumbers;
    primary.label = `Table ${primary.number < 10 ? '0' : ''}${primary.number} + ${secondaryTableNumbers.map((n) => (n < 10 ? '0' : '') + n).join('+')}`;

    this.logActivity('Tables Merged', `Tables ${allMergedNumbers.join(', ')} merged (Combined Capacity: ${combinedCapacity} guests)`);
    this.saveToStorage();
    this.notify();
  }

  public async splitTable(tableNumber: number): Promise<void> {
    const table = this.tables.find((t) => t.number === tableNumber);
    if (!table) return;

    let primary = table;
    if (table.isMergedChild && table.mergedWith && table.mergedWith.length > 0) {
      const parentNum = table.mergedWith[0];
      const p = this.tables.find((t) => t.number === parentNum);
      if (p) primary = p;
    }

    if (primary.mergedWith && primary.mergedWith.length > 0) {
      const mergedList = [...primary.mergedWith];
      mergedList.forEach((secNum) => {
        const sec = this.tables.find((t) => t.number === secNum);
        if (sec) {
          sec.isMergedChild = false;
          sec.mergedWith = undefined;
          if (sec.originalCapacity) sec.capacity = sec.originalCapacity;
          sec.label = `Table ${sec.number < 10 ? '0' : ''}${sec.number}`;
        }
      });

      primary.mergedWith = undefined;
      primary.isMergedChild = false;
      if (primary.originalCapacity) primary.capacity = primary.originalCapacity;
      primary.label = `Table ${primary.number < 10 ? '0' : ''}${primary.number}`;

      this.logActivity('Tables Split', `Table ${primary.number} and merged tables were separated to original configurations`);
      this.saveToStorage();
      this.notify();
    }
  }

  public async deleteCustomerData(phone: string): Promise<void> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    this.customers = this.customers.filter((c) => c.phone.replace(/\D/g, '').slice(-10) !== cleanPhone);
    // Anonymize past orders for privacy compliance
    this.orders.forEach((o) => {
      if (o.phone.replace(/\D/g, '').slice(-10) === cleanPhone) {
        o.customerName = 'Redacted Customer';
        o.phone = '0000000000';
        o.email = undefined;
      }
    });
    this.bookings.forEach((b) => {
      if (b.phone.replace(/\D/g, '').slice(-10) === cleanPhone) {
        b.customerName = 'Redacted Customer';
        b.phone = '0000000000';
        b.email = undefined;
      }
    });
    this.logActivity('Customer Privacy Request', `Permanently purged data records for phone ending in ${cleanPhone.slice(-4)}`);
    this.saveToStorage();
    this.notify();
  }

  public async resetDemoData(): Promise<void> {
    this.seedInitialData();
    this.saveToStorage();
    this.notify();
  }

  public async resetToDefaults(): Promise<void> {
    await this.resetDemoData();
  }

  private logActivity(action: string, details: string, staffName?: string) {
    const staff = staffName || this.currentStaff?.name || 'System';
    const logItem: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      details,
      staffName: staff,
      staffRole: this.currentStaff?.role,
      timestamp: new Date().toISOString(),
    };
    this.activityLog.unshift(logItem);
    if (this.activityLog.length > 100) {
      this.activityLog.pop();
    }
  }
}
