/**
 * Atelier Vélin Resilient Hybrid Firestore Service
 * Implements DataService with:
 * 1. Optimistic, zero-latency local-first execution (mutations apply immediately to in-memory state & localStorage)
 * 2. Cross-tab and cross-window real-time synchronization via BroadcastChannel ('atelier_cafe_sync') and storage events
 * 3. Graceful asynchronous Firestore cloud sync (persists to Firestore if database is available; never rejects/crashes user operations if cloud returns 404 or is offline)
 * 4. Real-time Firebase Firestore onSnapshot listeners for multi-device sync
 */

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
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
import { db, auth } from './firebase';
import { DataService } from './dataService';

type Listener = () => void;

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    // For arrays, if stored is empty and fallback has items (e.g. menu items or tables), prefer fallback so UI isn't empty
    if (Array.isArray(fallback) && fallback.length > 0 && Array.isArray(parsed) && parsed.length === 0) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[Storage] Failed to save key "${key}":`, err);
  }
}

export class FirestoreService implements DataService {
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
  private unsubs: Unsubscribe[] = [];
  private connectionStatus: 'online' | 'reconnecting' | 'offline' | 'local-demo' = 'online';
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    // 1. Initial immediate hydration from storage or Indian Cafe starter datasets
    this.menuItems = loadFromStorage('atelier_v2_menu', [...SAMPLE_MENU_ITEMS]);
    this.tables = loadFromStorage('atelier_v2_tables', [...INITIAL_TABLE_STATES]);
    this.orders = loadFromStorage('atelier_v2_orders', [...SAMPLE_ORDERS]);
    this.bookings = loadFromStorage('atelier_v2_bookings', [...SAMPLE_BOOKINGS]);
    this.customers = loadFromStorage('atelier_v2_customers', [...SAMPLE_CUSTOMERS]);
    this.bills = loadFromStorage('atelier_v2_bills', []);
    this.expenses = loadFromStorage('atelier_v2_expenses', [...SAMPLE_EXPENSES]);
    this.dailyClosings = loadFromStorage('atelier_v2_closings', []);
    this.activityLog = loadFromStorage('atelier_v2_activity', []);
    this.staff = loadFromStorage('atelier_v2_staff', [...SAMPLE_STAFF]);

    // Ensure baseline storage is populated immediately
    saveToStorage('atelier_v2_menu', this.menuItems);
    saveToStorage('atelier_v2_tables', this.tables);
    saveToStorage('atelier_v2_orders', this.orders);
    saveToStorage('atelier_v2_bookings', this.bookings);
    saveToStorage('atelier_v2_staff', this.staff);

    this.setupSyncBus();
    this.initializeListeners();
    this.monitorConnection();
  }

  public isFirebaseMode(): boolean {
    return true;
  }

  public getConnectionStatus(): 'online' | 'reconnecting' | 'offline' | 'local-demo' {
    return this.connectionStatus;
  }

  private monitorConnection() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.connectionStatus = 'online';
        this.notify();
      });
      window.addEventListener('offline', () => {
        this.connectionStatus = 'offline';
        this.notify();
      });
    }
  }

  private setupSyncBus() {
    if (typeof window === 'undefined') return;

    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('atelier_cafe_sync');
        this.broadcastChannel.onmessage = (event) => {
          this.handleSyncMessage(event.data);
        };
      }
    } catch (e) {
      console.warn('[SyncBus] BroadcastChannel not supported, using storage events:', e);
    }

    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('atelier_v2_')) {
        this.reloadFromStorageKey(e.key);
        this.notify();
      }
    });
  }

  private broadcastSync(key: string) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'STORE_UPDATE', key, timestamp: Date.now() });
      } catch {}
    }
  }

  private handleSyncMessage(msg: any) {
    if (msg?.type === 'STORE_UPDATE' && msg.key) {
      this.reloadFromStorageKey(msg.key);
      this.notify();
    }
  }

  private reloadFromStorageKey(key: string) {
    switch (key) {
      case 'atelier_v2_orders':
        this.orders = loadFromStorage('atelier_v2_orders', this.orders);
        break;
      case 'atelier_v2_bookings':
        this.bookings = loadFromStorage('atelier_v2_bookings', this.bookings);
        break;
      case 'atelier_v2_tables':
        this.tables = loadFromStorage('atelier_v2_tables', this.tables);
        break;
      case 'atelier_v2_menu':
        this.menuItems = loadFromStorage('atelier_v2_menu', this.menuItems);
        break;
      case 'atelier_v2_bills':
        this.bills = loadFromStorage('atelier_v2_bills', this.bills);
        break;
      case 'atelier_v2_customers':
        this.customers = loadFromStorage('atelier_v2_customers', this.customers);
        break;
      case 'atelier_v2_staff':
        this.staff = loadFromStorage('atelier_v2_staff', this.staff);
        break;
    }
  }

  private initializeListeners() {
    if (!db) return;

    try {
      // 1. Menu items listener
      const menuUnsub = onSnapshot(
        collection(db, 'menuItems'),
        (snap) => {
          if (!snap.empty) {
            this.menuItems = snap.docs.map((d) => d.data() as MenuItem);
            saveToStorage('atelier_v2_menu', this.menuItems);
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Menu items sync notice (using local store):', err?.message || err);
          this.notify();
        }
      );
      this.unsubs.push(menuUnsub);

      // 2. Tables listener
      const tablesUnsub = onSnapshot(
        collection(db, 'tables'),
        (snap) => {
          if (!snap.empty) {
            this.tables = snap.docs.map((d) => d.data() as TableLiveState);
            saveToStorage('atelier_v2_tables', this.tables);
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Tables sync notice (using local store):', err?.message || err);
          this.notify();
        }
      );
      this.unsubs.push(tablesUnsub);

      // 3. Orders listener
      let isOrdersInitialLoad = true;
      const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
      const ordersUnsub = onSnapshot(
        ordersQ,
        (snap) => {
          if (!snap.empty) {
            this.orders = snap.docs.map((d) => d.data() as Order);
            saveToStorage('atelier_v2_orders', this.orders);
          }

          if (isOrdersInitialLoad) {
            isOrdersInitialLoad = false;
          } else {
            snap.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const newOrder = change.doc.data() as Order;
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('atelier:live_alert', {
                      detail: {
                        type: 'order',
                        title: `New Order Placed: ${newOrder.orderNumber}`,
                        message: `${newOrder.customerName} • ₹${newOrder.total} (${newOrder.orderType})`,
                        targetRoute: '/orders',
                        targetId: newOrder.id,
                      },
                    })
                  );
                }
                playOrderAlertChime();
              }
            });
          }

          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Orders sync notice (using local store):', err?.message || err);
          this.notify();
        }
      );
      this.unsubs.push(ordersUnsub);

      // 4. Bookings listener
      let isBookingsInitialLoad = true;
      const bookingsQ = query(collection(db, 'bookings'), orderBy('date', 'desc'), limit(100));
      const bookingsUnsub = onSnapshot(
        bookingsQ,
        (snap) => {
          if (!snap.empty) {
            this.bookings = snap.docs.map((d) => d.data() as Booking);
            saveToStorage('atelier_v2_bookings', this.bookings);
          }

          if (isBookingsInitialLoad) {
            isBookingsInitialLoad = false;
          } else {
            snap.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const newBooking = change.doc.data() as Booking;
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('atelier:live_alert', {
                      detail: {
                        type: 'booking',
                        title: `New Table Reservation`,
                        message: `${newBooking.customerName} • Table ${newBooking.tableNumber || 'Auto'} for ${newBooking.guests || newBooking.partySize || 2} guests`,
                        targetRoute: '/bookings',
                        targetId: newBooking.id,
                      },
                    })
                  );
                }
              }
            });
          }

          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Bookings sync notice (using local store):', err?.message || err);
          this.notify();
        }
      );
      this.unsubs.push(bookingsUnsub);

      // 5. Customers listener
      const custQ = query(collection(db, 'customers'), orderBy('totalSpent', 'desc'), limit(100));
      const custUnsub = onSnapshot(
        custQ,
        (snap) => {
          if (!snap.empty) {
            this.customers = snap.docs.map((d) => d.data() as Customer);
            saveToStorage('atelier_v2_customers', this.customers);
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Customers sync notice (using local store):', err?.message || err);
          this.notify();
        }
      );
      this.unsubs.push(custUnsub);

      // 6. Bills listener
      const billsQ = query(collection(db, 'bills'), orderBy('createdAt', 'desc'), limit(100));
      const billsUnsub = onSnapshot(
        billsQ,
        (snap) => {
          if (!snap.empty) {
            this.bills = snap.docs.map((d) => d.data() as Bill);
            saveToStorage('atelier_v2_bills', this.bills);
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Bills sync notice (using local store):', err?.message || err);
          this.notify();
        }
      );
      this.unsubs.push(billsUnsub);

      // 7. Staff listener
      const staffUnsub = onSnapshot(
        collection(db, 'staff'),
        (snap) => {
          if (!snap.empty) {
            this.staff = snap.docs.map((d) => d.data() as StaffUser);
            saveToStorage('atelier_v2_staff', this.staff);
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Staff sync notice (using local store):', err?.message || err);
          this.notify();
        }
      );
      this.unsubs.push(staffUnsub);
    } catch (err) {
      console.warn('[Firestore] Real-time listeners setup encountered fallback:', err);
    }
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.warn('Listener error:', err);
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
    return this.menuItems.length ? this.menuItems : SAMPLE_MENU_ITEMS;
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public getTables(): TableLiveState[] {
    return this.tables.length ? this.tables : INITIAL_TABLE_STATES;
  }

  public getCustomers(): Customer[] {
    return this.customers.length ? this.customers : SAMPLE_CUSTOMERS;
  }

  public getBookings(): Booking[] {
    return this.bookings;
  }

  public getBills(): Bill[] {
    return this.bills;
  }

  public getExpenses(): Expense[] {
    return this.expenses.length ? this.expenses : SAMPLE_EXPENSES;
  }

  public getDailyClosings(): DailyClosing[] {
    return this.dailyClosings;
  }

  public getActivityLog(): ActivityLogItem[] {
    return this.activityLog;
  }

  public getStaff(): StaffUser[] {
    return this.staff.length ? this.staff : SAMPLE_STAFF;
  }

  public getCurrentStaff(): StaffUser | null {
    return this.currentStaff;
  }

  public setCurrentStaff(staff: StaffUser | null) {
    this.currentStaff = staff;
    this.notify();
  }

  public getCustomerByPhone(phone: string): Customer | undefined {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return this.customers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
  }

  public getOrdersByPhone(phone: string): Order[] {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return this.orders.filter((o) => o.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
  }

  public getCustomerOrders(phone: string): Order[] {
    return this.getOrdersByPhone(phone);
  }

  public getBookingsByPhone(phone: string): Booking[] {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return this.bookings.filter((b) => b.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  }

  public getBookingById(bookingId: string): Booking | undefined {
    return this.bookings.find(
      (b) => b.id === bookingId || b.id === `BK-${bookingId}` || bookingId.includes(b.id)
    );
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

    let calculatedSubtotal = 0;
    const validatedItems = orderData.items.map((it) => {
      if (it.quantity <= 0) {
        throw new Error(`Invalid quantity for item ${it.name}`);
      }
      const menuItem = this.menuItems.find((m) => m.id === it.menuItemId);
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

    const nextSeq = this.orders.length + 150;
    const orderNumber = `#AV-0${nextSeq}`;
    const now = new Date().toISOString();
    const orderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      ...orderData,
      customerUid: customerUid || auth?.currentUser?.uid || undefined,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      gst: calculatedGst,
      total: Math.max(0, calculatedTotal),
      id: orderId,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Optimistic Local State Update
    this.orders.unshift(newOrder);

    // Update table occupancy if dine-in
    if (newOrder.orderType === 'dine-in' && newOrder.tableNumber) {
      const table = this.tables.find((t) => t.number === Number(newOrder.tableNumber));
      if (table) {
        table.status = 'occupied';
        table.activeOrderId = orderId;
        table.lastOccupiedAt = now;
      }
      saveToStorage('atelier_v2_tables', this.tables);
    }

    // Decrement inventory counts
    for (const it of newOrder.items) {
      const menuItem = this.menuItems.find((m) => m.id === it.menuItemId);
      if (menuItem && menuItem.stockCount !== undefined) {
        const newStock = Math.max(0, menuItem.stockCount - it.quantity);
        menuItem.stockCount = newStock;
        if (newStock === 0) menuItem.isAvailable = false;
      }
    }

    saveToStorage('atelier_v2_orders', this.orders);
    saveToStorage('atelier_v2_menu', this.menuItems);
    this.broadcastSync('atelier_v2_orders');
    this.broadcastSync('atelier_v2_tables');
    this.broadcastSync('atelier_v2_menu');

    this.logActivity('Order Placed', `${orderNumber} (${newOrder.orderType.toUpperCase()}) - ₹${newOrder.total}`);
    playOrderAlertChime();
    this.notify();

    // 2. Safe Asynchronous Cloud Sync (Non-blocking)
    if (db) {
      (async () => {
        try {
          await setDoc(doc(db, 'orders', orderId), newOrder);
          if (newOrder.orderType === 'dine-in' && newOrder.tableNumber) {
            await updateDoc(doc(db, 'tables', String(newOrder.tableNumber)), {
              status: 'occupied',
              activeOrderId: orderId,
              lastOccupiedAt: now,
            }).catch(() => {});
          }
          for (const it of newOrder.items) {
            const menuItem = this.menuItems.find((m) => m.id === it.menuItemId);
            if (menuItem && menuItem.stockCount !== undefined) {
              await updateDoc(doc(db, 'menuItems', it.menuItemId), {
                stockCount: menuItem.stockCount,
                isAvailable: menuItem.isAvailable,
              }).catch(() => {});
            }
          }
        } catch (err) {
          console.warn('[Firestore] Cloud sync skipped (order safely saved locally):', err);
        }
      })();
    }

    return newOrder;
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus, staffName?: string) {
    const order = this.orders.find((o) => o.id === orderId);
    const now = new Date().toISOString();

    if (order) {
      order.status = status;
      order.updatedAt = now;
    }

    if (order?.tableNumber && (status === 'completed' || status === 'cancelled')) {
      const table = this.tables.find((t) => t.number === Number(order.tableNumber));
      if (table) {
        table.status = status === 'completed' ? 'needs-cleaning' : 'free';
        table.activeOrderId = null;
      }
      saveToStorage('atelier_v2_tables', this.tables);
      this.broadcastSync('atelier_v2_tables');
    }

    saveToStorage('atelier_v2_orders', this.orders);
    this.broadcastSync('atelier_v2_orders');

    this.logActivity('Status Updated', `${order?.orderNumber || orderId}: ➔ ${status}`, staffName);
    this.notify();

    if (db) {
      (async () => {
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            status,
            updatedAt: now,
          });
          if (order?.tableNumber && (status === 'completed' || status === 'cancelled')) {
            await updateDoc(doc(db, 'tables', String(order.tableNumber)), {
              status: status === 'completed' ? 'needs-cleaning' : 'free',
              activeOrderId: null,
            }).catch(() => {});
          }
        } catch (err) {
          console.warn('[Firestore] Async order status update failed:', err);
        }
      })();
    }
  }

  public async updateOrderPayment(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentMethod?: PaymentMethod,
    staffName?: string
  ) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;
    const now = new Date().toISOString();

    order.paymentStatus = paymentStatus;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    order.updatedAt = now;

    if (paymentStatus === 'paid') {
      const billId = `bill-${Date.now()}`;
      const billNumber = `INV-${new Date().getFullYear()}-${this.bills.length + 101}`;
      const bill: Bill = {
        id: billId,
        billNumber,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        phone: order.phone,
        tableNumber: order.tableNumber,
        orderType: order.orderType,
        items: order.items,
        subtotal: order.subtotal,
        gst: order.gst,
        discount: order.discount || 0,
        tip: order.tip || 0,
        total: order.total,
        paymentMethod: paymentMethod || order.paymentMethod,
        status: 'settled',
        cashier: staffName || this.currentStaff?.name || 'Counter Staff',
        createdAt: now,
      };
      this.bills.unshift(bill);
      saveToStorage('atelier_v2_bills', this.bills);
      this.broadcastSync('atelier_v2_bills');

      // Update customer stats
      const cleanPhone = order.phone.replace(/\D/g, '').slice(-10);
      const existingCust = this.customers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
      if (existingCust) {
        existingCust.totalSpent += order.total;
        existingCust.totalVisits += 1;
        existingCust.lastVisit = now.split('T')[0];
      } else {
        this.customers.push({
          id: cleanPhone,
          name: order.customerName,
          phone: cleanPhone,
          email: order.email,
          firstVisit: now.split('T')[0],
          lastVisit: now.split('T')[0],
          totalVisits: 1,
          totalSpent: order.total,
          averageBill: order.total,
          favoriteItems: [order.items[0]?.name || 'House Special'],
          tags: ['New'],
        });
      }
      saveToStorage('atelier_v2_customers', this.customers);
      this.broadcastSync('atelier_v2_customers');
    }

    saveToStorage('atelier_v2_orders', this.orders);
    this.broadcastSync('atelier_v2_orders');

    this.logActivity('Payment Updated', `${order.orderNumber} marked as ${paymentStatus.toUpperCase()}`, staffName);
    this.notify();

    if (db) {
      (async () => {
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            paymentStatus,
            paymentMethod: paymentMethod || order.paymentMethod,
            updatedAt: now,
          });
        } catch (err) {
          console.warn('[Firestore] Async payment update failed:', err);
        }
      })();
    }
  }

  public async applyDiscountToOrder(
    orderId: string,
    discountAmount: number,
    discountReason?: string,
    staffName?: string
  ) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;
    const newTotal = Math.max(0, order.subtotal + order.gst - discountAmount + (order.tip || 0));
    const now = new Date().toISOString();
    const reason = discountReason || 'Courtesy Discount';

    order.discount = discountAmount;
    order.discountReason = reason;
    order.total = newTotal;
    order.updatedAt = now;

    saveToStorage('atelier_v2_orders', this.orders);
    this.broadcastSync('atelier_v2_orders');
    this.notify();

    if (db) {
      (async () => {
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            discount: discountAmount,
            discountReason: reason,
            total: newTotal,
            updatedAt: now,
          });
        } catch (err) {
          console.warn('[Firestore] Async discount update failed:', err);
        }
      })();
    }
  }

  public async createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt'>,
    customerUid?: string
  ): Promise<Booking> {
    const isDoubleBooked = this.bookings.some(
      (b) =>
        b.tableNumber === bookingData.tableNumber &&
        b.date === bookingData.date &&
        b.timeSlot === bookingData.timeSlot &&
        b.status !== 'cancelled' &&
        b.status !== 'no-show'
    );
    if (isDoubleBooked) {
      throw new Error(
        `Table ${bookingData.tableNumber} is already booked for ${bookingData.timeSlot} on ${bookingData.date}.`
      );
    }

    const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();
    const newBooking: Booking = {
      ...bookingData,
      customerUid: customerUid || auth?.currentUser?.uid || undefined,
      id: bookingId,
      createdAt: now,
    };

    // 1. Optimistic Local State Update
    this.bookings.unshift(newBooking);

    const todayStr = now.split('T')[0];
    if (bookingData.date === todayStr) {
      const table = this.tables.find((t) => t.number === Number(bookingData.tableNumber));
      if (table) {
        table.status = 'booked';
        table.activeBookingId = bookingId;
      }
      saveToStorage('atelier_v2_tables', this.tables);
      this.broadcastSync('atelier_v2_tables');
    }

    saveToStorage('atelier_v2_bookings', this.bookings);
    this.broadcastSync('atelier_v2_bookings');

    this.logActivity('Booking Created', `${bookingId} for Table ${newBooking.tableNumber} on ${newBooking.date}`);
    this.notify();

    // 2. Safe Asynchronous Cloud Sync
    if (db) {
      (async () => {
        try {
          await setDoc(doc(db, 'bookings', bookingId), newBooking);
          if (bookingData.date === todayStr) {
            await updateDoc(doc(db, 'tables', String(bookingData.tableNumber)), {
              status: 'booked',
              activeBookingId: bookingId,
            }).catch(() => {});
          }
        } catch (err) {
          console.warn('[Firestore] Cloud sync skipped (booking safely saved locally):', err);
        }
      })();
    }

    return newBooking;
  }

  public async updateBookingStatus(bookingId: string, status: BookingStatus, staffName?: string) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (booking) {
      booking.status = status;
      if (booking.tableNumber) {
        const table = this.tables.find((t) => t.number === Number(booking.tableNumber));
        if (table) {
          if (status === 'seated') {
            table.status = 'occupied';
          } else if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
            table.status = 'free';
            table.activeBookingId = null;
          }
        }
        saveToStorage('atelier_v2_tables', this.tables);
        this.broadcastSync('atelier_v2_tables');
      }
    }

    saveToStorage('atelier_v2_bookings', this.bookings);
    this.broadcastSync('atelier_v2_bookings');

    this.logActivity('Booking Status', `${bookingId} ➔ ${status.toUpperCase()}`, staffName);
    this.notify();

    if (db) {
      (async () => {
        try {
          await updateDoc(doc(db, 'bookings', bookingId), { status });
          if (booking?.tableNumber) {
            if (status === 'seated') {
              await updateDoc(doc(db, 'tables', String(booking.tableNumber)), { status: 'occupied' }).catch(() => {});
            } else if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
              await updateDoc(doc(db, 'tables', String(booking.tableNumber)), { status: 'free', activeBookingId: null }).catch(() => {});
            }
          }
        } catch (err) {
          console.warn('[Firestore] Async booking status update failed:', err);
        }
      })();
    }
  }

  public async updateTableStatus(
    tableIdOrNumber: number | string,
    status: TableStatus,
    activeBookingId?: string
  ) {
    const table = this.tables.find(
      (t) => t.id === String(tableIdOrNumber) || t.number === Number(tableIdOrNumber)
    );
    if (table) {
      table.status = status;
      if (activeBookingId !== undefined) {
        table.activeBookingId = activeBookingId;
      }
      if (status === 'free') {
        table.activeOrderId = null;
        table.activeBookingId = null;
      }
    }

    saveToStorage('atelier_v2_tables', this.tables);
    this.broadcastSync('atelier_v2_tables');
    this.notify();

    const num = table ? table.number : Number(tableIdOrNumber);
    if (db && !isNaN(num)) {
      (async () => {
        try {
          await updateDoc(doc(db, 'tables', String(num)), {
            status,
            activeBookingId: activeBookingId || null,
          });
        } catch (err) {
          console.warn('[Firestore] Async table status update failed:', err);
        }
      })();
    }
  }

  public async updateMenuItemAvailability(id: string, isAvailable: boolean) {
    const item = this.menuItems.find((m) => m.id === id);
    if (item) {
      item.isAvailable = isAvailable;
    }
    saveToStorage('atelier_v2_menu', this.menuItems);
    this.broadcastSync('atelier_v2_menu');
    this.notify();

    if (db) {
      (async () => {
        try {
          await updateDoc(doc(db, 'menuItems', id), { isAvailable });
        } catch (err) {
          console.warn('[Firestore] Async menu availability update failed:', err);
        }
      })();
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
    }
    saveToStorage('atelier_v2_menu', this.menuItems);
    this.broadcastSync('atelier_v2_menu');
    this.notify();

    if (db) {
      (async () => {
        try {
          await updateDoc(doc(db, 'menuItems', id), {
            stockCount,
            isAvailable: item?.isAvailable,
          });
        } catch (err) {
          console.warn('[Firestore] Async stock update failed:', err);
        }
      })();
    }
  }

  public async saveMenuItem(item: MenuItem) {
    const idx = this.menuItems.findIndex((m) => m.id === item.id);
    if (idx >= 0) {
      this.menuItems[idx] = item;
    } else {
      this.menuItems.push(item);
    }
    saveToStorage('atelier_v2_menu', this.menuItems);
    this.broadcastSync('atelier_v2_menu');
    this.notify();

    if (db) {
      (async () => {
        try {
          await setDoc(doc(db, 'menuItems', item.id), item);
        } catch (err) {
          console.warn('[Firestore] Async save menu item failed:', err);
        }
      })();
    }
  }

  public async deleteMenuItem(id: string) {
    this.menuItems = this.menuItems.filter((m) => m.id !== id);
    saveToStorage('atelier_v2_menu', this.menuItems);
    this.broadcastSync('atelier_v2_menu');
    this.notify();

    if (db) {
      (async () => {
        try {
          await deleteDoc(doc(db, 'menuItems', id));
        } catch (err) {
          console.warn('[Firestore] Async delete menu item failed:', err);
        }
      })();
    }
  }

  public async voidBill(billId: string, reason: string) {
    const bill = this.bills.find((b) => b.id === billId);
    if (bill) {
      bill.status = 'void';
      bill.voidReason = reason;
    }
    saveToStorage('atelier_v2_bills', this.bills);
    this.broadcastSync('atelier_v2_bills');
    this.notify();

    if (db) {
      (async () => {
        try {
          await updateDoc(doc(db, 'bills', billId), {
            status: 'void',
            voidReason: reason,
          });
        } catch (err) {
          console.warn('[Firestore] Async void bill failed:', err);
        }
      })();
    }
  }

  public async addExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const expenseId = `exp-${Date.now()}`;
    const newExpense: Expense = {
      ...expenseData,
      id: expenseId,
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(newExpense);
    saveToStorage('atelier_v2_expenses', this.expenses);
    this.notify();

    if (db) {
      (async () => {
        try {
          await setDoc(doc(db, 'expenses', expenseId), newExpense);
        } catch (err) {
          console.warn('[Firestore] Async add expense failed:', err);
        }
      })();
    }
    return newExpense;
  }

  public async recordDailyClosing(
    closingData: Omit<DailyClosing, 'id' | 'createdAt'>
  ): Promise<DailyClosing> {
    const closingId = `closing-${Date.now()}`;
    const newClosing: DailyClosing = {
      ...closingData,
      id: closingId,
      createdAt: new Date().toISOString(),
    };
    this.dailyClosings.unshift(newClosing);
    saveToStorage('atelier_v2_closings', this.dailyClosings);
    this.notify();

    if (db) {
      (async () => {
        try {
          await setDoc(doc(db, 'dailyClosings', closingId), newClosing);
        } catch (err) {
          console.warn('[Firestore] Async record closing failed:', err);
        }
      })();
    }
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
    this.notify();

    if (db) {
      (async () => {
        try {
          await setDoc(doc(db, 'settings', `float_${targetDate}`), {
            date: targetDate,
            amount,
            staffName: staffName || 'Staff',
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('[Firestore] Async float update failed:', err);
        }
      })();
    }
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
    secondaries.forEach((sec) => {
      if (!sec.originalCapacity) sec.originalCapacity = sec.capacity;
      combinedCapacity += sec.originalCapacity;
      sec.isMergedChild = true;
      sec.mergedWith = [primaryTableNumber];
      sec.status = primary.status;
    });

    primary.capacity = combinedCapacity;
    primary.mergedWith = secondaryTableNumbers;
    primary.label = `Table ${primary.number < 10 ? '0' : ''}${primary.number} + ${secondaryTableNumbers.map((n) => (n < 10 ? '0' : '') + n).join('+')}`;

    saveToStorage('atelier_v2_tables', this.tables);
    this.broadcastSync('atelier_v2_tables');
    this.notify();

    if (db) {
      (async () => {
        try {
          await updateDoc(doc(db, 'tables', String(primary.number)), {
            capacity: combinedCapacity,
            mergedWith: secondaryTableNumbers,
            label: primary.label,
            originalCapacity: primary.originalCapacity,
          }).catch(() => {});

          for (const sec of secondaries) {
            await updateDoc(doc(db, 'tables', String(sec.number)), {
              isMergedChild: true,
              mergedWith: [primaryTableNumber],
              originalCapacity: sec.originalCapacity,
              status: primary.status,
            }).catch(() => {});
          }
        } catch (err) {
          console.warn('[Firestore] Async table merge failed:', err);
        }
      })();
    }
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

      saveToStorage('atelier_v2_tables', this.tables);
      this.broadcastSync('atelier_v2_tables');
      this.notify();

      if (db) {
        (async () => {
          try {
            await updateDoc(doc(db, 'tables', String(primary.number)), {
              mergedWith: null,
              isMergedChild: false,
              capacity: primary.capacity,
              label: primary.label,
            }).catch(() => {});

            for (const secNum of mergedList) {
              await updateDoc(doc(db, 'tables', String(secNum)), {
                mergedWith: null,
                isMergedChild: false,
                label: `Table ${secNum < 10 ? '0' : ''}${secNum}`,
              }).catch(() => {});
            }
          } catch (err) {
            console.warn('[Firestore] Async table split failed:', err);
          }
        })();
      }
    }
  }

  public async addStaffUser(staffData: {
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'staff';
    phone?: string;
    pin?: string;
    avatarLetter?: string;
  }): Promise<StaffUser> {
    const staffId = `staff-${Date.now()}`;
    const newStaff: StaffUser = {
      id: staffId,
      name: staffData.name,
      email: staffData.email,
      role: staffData.role,
      avatarLetter: staffData.avatarLetter || staffData.name.charAt(0).toUpperCase(),
      phone: staffData.phone || '',
      active: true,
    };
    this.staff.push(newStaff);
    saveToStorage('atelier_v2_staff', this.staff);
    this.notify();

    if (db) {
      (async () => {
        try {
          await setDoc(doc(db, 'staff', staffId), newStaff);
        } catch (err) {
          console.warn('[Firestore] Async add staff failed:', err);
        }
      })();
    }
    return newStaff;
  }

  public async deleteStaffUser(id: string) {
    this.staff = this.staff.filter((s) => s.id !== id);
    saveToStorage('atelier_v2_staff', this.staff);
    this.notify();

    if (db) {
      (async () => {
        try {
          await deleteDoc(doc(db, 'staff', id));
        } catch (err) {
          console.warn('[Firestore] Async delete staff failed:', err);
        }
      })();
    }
  }

  public async deleteCustomerData(phone: string): Promise<void> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    this.customers = this.customers.filter((c) => c.phone.replace(/\D/g, '').slice(-10) !== cleanPhone);
    saveToStorage('atelier_v2_customers', this.customers);
    this.notify();

    if (db) {
      (async () => {
        try {
          await deleteDoc(doc(db, 'customers', cleanPhone));
        } catch (err) {
          console.warn('[Firestore] Async delete customer failed:', err);
        }
      })();
    }
  }

  public async resetDemoData(): Promise<void> {
    this.menuItems = [...SAMPLE_MENU_ITEMS];
    this.tables = [...INITIAL_TABLE_STATES];
    this.orders = [...SAMPLE_ORDERS];
    this.bookings = [...SAMPLE_BOOKINGS];
    this.customers = [...SAMPLE_CUSTOMERS];
    this.staff = [...SAMPLE_STAFF];

    saveToStorage('atelier_v2_menu', this.menuItems);
    saveToStorage('atelier_v2_tables', this.tables);
    saveToStorage('atelier_v2_orders', this.orders);
    saveToStorage('atelier_v2_bookings', this.bookings);
    saveToStorage('atelier_v2_customers', this.customers);
    saveToStorage('atelier_v2_staff', this.staff);

    this.broadcastSync('atelier_v2_menu');
    this.broadcastSync('atelier_v2_tables');
    this.broadcastSync('atelier_v2_orders');
    this.broadcastSync('atelier_v2_bookings');

    this.notify();

    if (db) {
      (async () => {
        try {
          const batch = writeBatch(db);
          SAMPLE_MENU_ITEMS.forEach((it) => {
            batch.set(doc(db, 'menuItems', it.id), it);
          });
          INITIAL_TABLE_STATES.forEach((t) => {
            batch.set(doc(db, 'tables', String(t.number)), t);
          });
          await batch.commit();
        } catch (err) {
          console.warn('[Firestore] Async batch reset failed:', err);
        }
      })();
    }
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
    if (this.activityLog.length > 50) this.activityLog.pop();
    saveToStorage('atelier_v2_activity', this.activityLog);

    if (db) {
      setDoc(doc(db, 'activityLog', logItem.id), logItem).catch(() => {});
    }
  }
}
