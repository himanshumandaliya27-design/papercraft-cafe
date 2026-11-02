/**
 * Atelier Vélin Firestore Service
 * Implements DataService using live Firebase Firestore with real-time onSnapshot listeners,
 * atomic transactions for billing and booking, and offline cache persistence.
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
  runTransaction,
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
import { isProductionMode } from '../config/appMode';

type Listener = () => void;

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
  private connectionStatus: 'online' | 'reconnecting' | 'offline' = 'online';

  constructor() {
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

  private initializeListeners() {
    if (!db) return;

    try {
      // 1. Menu items listener
      const menuUnsub = onSnapshot(
        collection(db, 'menuItems'),
        (snap) => {
          if (!snap.empty) {
            this.menuItems = snap.docs.map((d) => d.data() as MenuItem);
          } else {
            this.menuItems = isProductionMode() ? [] : [...SAMPLE_MENU_ITEMS];
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Menu items sync warning:', err);
          this.connectionStatus = 'reconnecting';
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
          } else {
            this.tables = [...INITIAL_TABLE_STATES];
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Tables sync warning:', err);
          this.connectionStatus = 'reconnecting';
          this.notify();
        }
      );
      this.unsubs.push(tablesUnsub);

      // 3. Orders listener (Bounded to 100 most recent for fast hydration)
      let isOrdersInitialLoad = true;
      const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
      const ordersUnsub = onSnapshot(
        ordersQ,
        (snap) => {
          if (!snap.empty) {
            this.orders = snap.docs.map((d) => d.data() as Order);
          } else {
            this.orders = isProductionMode() ? [] : [...SAMPLE_ORDERS];
          }

          if (isOrdersInitialLoad) {
            isOrdersInitialLoad = false;
          } else {
            // Check for newly added orders to fire live alarms and notification events
            snap.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const newOrder = change.doc.data() as Order;
                if (typeof window !== 'undefined') {
                  playOrderAlertChime();
                  window.dispatchEvent(
                    new CustomEvent('atelier:live_alert', {
                      detail: {
                        type: 'order',
                        title: `New Order #${newOrder.orderNumber}`,
                        message: `${newOrder.customerName} • ${newOrder.items.length} items (${newOrder.type}) • ₹${newOrder.totalAmount}`,
                        targetRoute: '/live-orders',
                        targetId: newOrder.id,
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
          console.warn('[Firestore] Orders sync warning:', err);
          this.connectionStatus = 'reconnecting';
          this.notify();
        }
      );
      this.unsubs.push(ordersUnsub);

      // 4. Bookings listener (Bounded to 100)
      let isBookingsInitialLoad = true;
      const bookingsQ = query(collection(db, 'bookings'), orderBy('date', 'desc'), limit(100));
      const bookingsUnsub = onSnapshot(
        bookingsQ,
        (snap) => {
          if (!snap.empty) {
            this.bookings = snap.docs.map((d) => d.data() as Booking);
          } else {
            this.bookings = isProductionMode() ? [] : [...SAMPLE_BOOKINGS];
          }

          if (isBookingsInitialLoad) {
            isBookingsInitialLoad = false;
          } else {
            // Check for newly added bookings
            snap.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const newBooking = change.doc.data() as Booking;
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('atelier:live_alert', {
                      detail: {
                        type: 'booking',
                        title: `New Table Reservation`,
                        message: `${newBooking.customerName} • Table ${newBooking.tableNumber || 'Auto'} for ${newBooking.partySize} guests`,
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
          console.warn('[Firestore] Bookings sync warning:', err);
          this.connectionStatus = 'reconnecting';
          this.notify();
        }
      );
      this.unsubs.push(bookingsUnsub);

      // 5. Customers listener (Bounded to 100 top VIP/regulars)
      const custQ = query(collection(db, 'customers'), orderBy('totalSpent', 'desc'), limit(100));
      const custUnsub = onSnapshot(
        custQ,
        (snap) => {
          if (!snap.empty) {
            this.customers = snap.docs.map((d) => d.data() as Customer);
          } else {
            this.customers = isProductionMode() ? [] : [...SAMPLE_CUSTOMERS];
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Customers sync warning:', err);
          this.connectionStatus = 'reconnecting';
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
          } else {
            this.bills = [];
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Bills sync warning:', err);
          this.connectionStatus = 'reconnecting';
          this.notify();
        }
      );
      this.unsubs.push(billsUnsub);

      // 7. Staff accounts listener
      const staffUnsub = onSnapshot(
        collection(db, 'staff'),
        (snap) => {
          if (!snap.empty) {
            this.staff = snap.docs.map((d) => d.data() as StaffUser);
          } else {
            this.staff = isProductionMode() ? [] : [...SAMPLE_STAFF];
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Staff sync warning:', err);
          this.connectionStatus = 'reconnecting';
          this.notify();
        }
      );
      this.unsubs.push(staffUnsub);

      // 8. Daily closings
      const closingQ = query(collection(db, 'dailyClosings'), orderBy('date', 'desc'), limit(30));
      const closingUnsub = onSnapshot(
        closingQ,
        (snap) => {
          if (!snap.empty) {
            this.dailyClosings = snap.docs.map((d) => d.data() as DailyClosing);
          } else {
            this.dailyClosings = [];
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Daily closings sync warning:', err);
          this.connectionStatus = 'reconnecting';
          this.notify();
        }
      );
      this.unsubs.push(closingUnsub);

      // 9. Activity Log
      const logQ = query(collection(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(50));
      const logUnsub = onSnapshot(
        logQ,
        (snap) => {
          if (!snap.empty) {
            this.activityLog = snap.docs.map((d) => d.data() as ActivityLogItem);
          } else {
            this.activityLog = [];
          }
          this.connectionStatus = 'online';
          this.notify();
        },
        (err) => {
          console.warn('[Firestore] Activity log sync warning:', err);
          this.connectionStatus = 'reconnecting';
          this.notify();
        }
      );
      this.unsubs.push(logUnsub);
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

  public destroy() {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    this.listeners.clear();
  }

  // ================= GETTERS =================

  public getMenuItems(): MenuItem[] {
    return this.menuItems.length ? this.menuItems : SAMPLE_MENU_ITEMS;
  }

  public getOrders(): Order[] {
    return this.orders.length ? this.orders : SAMPLE_ORDERS;
  }

  public getTables(): TableLiveState[] {
    return this.tables.length ? this.tables : INITIAL_TABLE_STATES;
  }

  public getCustomers(): Customer[] {
    return this.customers.length ? this.customers : SAMPLE_CUSTOMERS;
  }

  public getBookings(): Booking[] {
    return this.bookings.length ? this.bookings : SAMPLE_BOOKINGS;
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
    return this.bookings.find((b) => b.id === bookingId || b.id === `BK-${bookingId}` || bookingId.includes(b.id));
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

    // Server-side price recalculation & stock verification
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

    if (db) {
      await setDoc(doc(db, 'orders', orderId), newOrder);

      // Update table occupancy if dine-in
      if (newOrder.orderType === 'dine-in' && newOrder.tableNumber) {
        await updateDoc(doc(db, 'tables', String(newOrder.tableNumber)), {
          status: 'occupied',
          activeOrderId: orderId,
          lastOccupiedAt: now,
        }).catch(() => {});
      }
    } else {
      this.orders.unshift(newOrder);
    }

    // Decrement inventory counts & auto-mark Sold Out (86) at zero
    for (const it of newOrder.items) {
      const menuItem = this.menuItems.find((m) => m.id === it.menuItemId);
      if (menuItem && menuItem.stockCount !== undefined) {
        const newStock = Math.max(0, menuItem.stockCount - it.quantity);
        const should86 = newStock === 0;
        menuItem.stockCount = newStock;
        if (should86) menuItem.isAvailable = false;

        if (db) {
          await updateDoc(doc(db, 'menuItems', it.menuItemId), {
            stockCount: newStock,
            isAvailable: should86 ? false : menuItem.isAvailable,
          }).catch(() => {});
        }
      }
    }

    playOrderAlertChime();
    this.notify();
    return newOrder;
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus, staffName?: string) {
    const order = this.orders.find((o) => o.id === orderId);
    const now = new Date().toISOString();

    if (db) {
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
    } else if (order) {
      order.status = status;
      order.updatedAt = now;
    }

    this.logActivity('Status Updated', `${order?.orderNumber || orderId}: ➔ ${status}`, staffName);
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
    const now = new Date().toISOString();

    const firestore = db;
    if (firestore) {
      await runTransaction(firestore, async (txn) => {
        const orderRef = doc(firestore, 'orders', orderId);
        txn.update(orderRef, {
          paymentStatus,
          paymentMethod: paymentMethod || order.paymentMethod,
          updatedAt: now,
        });

        if (paymentStatus === 'paid') {
          const billId = `bill-${orderId}`;
          const billRef = doc(firestore, 'bills', billId);
          const bill: Bill = {
            id: billId,
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
            discount: order.discount || 0,
            tip: order.tip || 0,
            total: order.total,
            paymentMethod: paymentMethod || order.paymentMethod,
            status: 'settled',
            cashier: staffName || this.currentStaff?.name || 'Counter Staff',
            createdAt: now,
          };
          txn.set(billRef, bill);

          // Update customer lifetime spend
          const cleanPhone = order.phone.replace(/\D/g, '').slice(-10);
          const custRef = doc(firestore, 'customers', cleanPhone);
          const existingCust = this.customers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

          if (existingCust) {
            txn.update(custRef, {
              totalSpent: existingCust.totalSpent + order.total,
              totalVisits: existingCust.totalVisits + 1,
              lastVisit: now.split('T')[0],
            });
          }
        }
      });
    } else {
      order.paymentStatus = paymentStatus;
      if (paymentMethod) order.paymentMethod = paymentMethod;
      order.updatedAt = now;
    }

    this.logActivity('Payment Updated', `${order.orderNumber} marked as ${paymentStatus.toUpperCase()}`, staffName);
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
    const newTotal = Math.max(0, order.subtotal + order.gst - discountAmount + (order.tip || 0));
    const now = new Date().toISOString();
    const reason = discountReason || 'Courtesy Discount';
    const firestore = db;
    if (firestore) {
      await updateDoc(doc(firestore, 'orders', orderId), {
        discount: discountAmount,
        discountReason: reason,
        total: newTotal,
        updatedAt: now,
      }).catch(() => {});
    }
    order.discount = discountAmount;
    order.discountReason = reason;
    order.total = newTotal;
    order.updatedAt = now;
    this.logActivity('Discount Applied', `Applied discount ₹${discountAmount} (${reason}) to ${order.orderNumber}`, staffName);
    this.notify();
  }

  public async createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt'>,
    customerUid?: string
  ): Promise<Booking> {
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

    const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();
    const newBooking: Booking = {
      ...bookingData,
      customerUid: customerUid || auth?.currentUser?.uid || undefined,
      id: bookingId,
      createdAt: now,
    };

    if (db) {
      await setDoc(doc(db, 'bookings', bookingId), newBooking);

      const todayStr = now.split('T')[0];
      if (bookingData.date === todayStr) {
        await updateDoc(doc(db, 'tables', String(bookingData.tableNumber)), {
          status: 'booked',
          activeBookingId: bookingId,
        }).catch(() => {});
      }
    } else {
      this.bookings.unshift(newBooking);
    }

    this.logActivity('Booking Created', `${bookingId} for Table ${newBooking.tableNumber} on ${newBooking.date}`);
    this.notify();
    return newBooking;
  }

  public async updateBookingStatus(bookingId: string, status: BookingStatus, staffName?: string) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (db) {
      await updateDoc(doc(db, 'bookings', bookingId), { status });
      if (booking?.tableNumber) {
        if (status === 'seated') {
          await updateDoc(doc(db, 'tables', String(booking.tableNumber)), { status: 'occupied' }).catch(() => {});
        } else if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
          await updateDoc(doc(db, 'tables', String(booking.tableNumber)), { status: 'free', activeBookingId: null }).catch(() => {});
        }
      }
    } else if (booking) {
      booking.status = status;
    }

    this.logActivity('Booking Status', `${bookingId} ➔ ${status.toUpperCase()}`, staffName);
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
    const num = table ? table.number : Number(tableIdOrNumber);
    const firestore = db;
    if (firestore) {
      await updateDoc(doc(firestore, 'tables', String(num)), {
        status,
        activeBookingId: activeBookingId || null,
      });
    } else {
      if (table) {
        table.status = status;
        if (activeBookingId !== undefined) table.activeBookingId = activeBookingId;
      }
    }
    this.notify();
  }

  public async updateMenuItemAvailability(id: string, isAvailable: boolean) {
    const firestore = db;
    if (firestore) {
      await updateDoc(doc(firestore, 'menuItems', id), { isAvailable });
    } else {
      const item = this.menuItems.find((m) => m.id === id);
      if (item) item.isAvailable = isAvailable;
    }
    this.notify();
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
    const updates: Partial<MenuItem> = { stockCount };
    if (stockCount !== undefined && stockCount > 0 && item && !item.isAvailable) {
      updates.isAvailable = true;
    } else if (stockCount === 0) {
      updates.isAvailable = false;
    }

    if (item) {
      Object.assign(item, updates);
    }

    if (db) {
      await updateDoc(doc(db, 'menuItems', id), updates).catch(() => {});
    }
    this.notify();
  }

  public async saveMenuItem(item: MenuItem) {
    if (db) {
      await setDoc(doc(db, 'menuItems', item.id), item);
    } else {
      const idx = this.menuItems.findIndex((m) => m.id === item.id);
      if (idx >= 0) this.menuItems[idx] = item;
      else this.menuItems.push(item);
    }
    this.notify();
  }

  public async deleteMenuItem(id: string) {
    if (db) {
      await deleteDoc(doc(db, 'menuItems', id));
    } else {
      this.menuItems = this.menuItems.filter((m) => m.id !== id);
    }
    this.notify();
  }

  public async voidBill(billId: string, reason: string) {
    if (db) {
      await updateDoc(doc(db, 'bills', billId), {
        status: 'void',
        voidReason: reason,
      });
    } else {
      const bill = this.bills.find((b) => b.id === billId);
      if (bill) {
        bill.status = 'void';
        bill.voidReason = reason;
      }
    }
    this.notify();
  }

  public async addExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const expenseId = `exp-${Date.now()}`;
    const newExpense: Expense = {
      ...expenseData,
      id: expenseId,
      createdAt: new Date().toISOString(),
    };
    if (db) {
      await setDoc(doc(db, 'expenses', expenseId), newExpense);
    } else {
      this.expenses.unshift(newExpense);
    }
    this.notify();
    return newExpense;
  }

  public async recordDailyClosing(closingData: Omit<DailyClosing, 'id' | 'createdAt'>): Promise<DailyClosing> {
    const closingId = `closing-${Date.now()}`;
    const newClosing: DailyClosing = {
      ...closingData,
      id: closingId,
      createdAt: new Date().toISOString(),
    };
    if (db) {
      await setDoc(doc(db, 'dailyClosings', closingId), newClosing);
    } else {
      this.dailyClosings.unshift(newClosing);
    }
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
    if (db) {
      await setDoc(doc(db, 'settings', `float_${targetDate}`), {
        date: targetDate,
        amount,
        staffName: staffName || 'Staff',
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }
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

    if (db) {
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
    }
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

      if (db) {
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
      }
      this.notify();
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
    if (db) {
      await setDoc(doc(db, 'staff', staffId), newStaff);
    } else {
      this.staff.push(newStaff);
    }
    this.notify();
    return newStaff;
  }

  public async deleteStaffUser(id: string) {
    if (db) {
      await deleteDoc(doc(db, 'staff', id));
    } else {
      this.staff = this.staff.filter((s) => s.id !== id);
    }
    this.notify();
  }

  public async deleteCustomerData(phone: string): Promise<void> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (db) {
      await deleteDoc(doc(db, 'customers', cleanPhone)).catch(() => {});
    }
    this.customers = this.customers.filter((c) => c.phone.replace(/\D/g, '').slice(-10) !== cleanPhone);
    this.notify();
  }

  public async resetDemoData(): Promise<void> {
    const firestore = db;
    if (!firestore) return;
    const batch = writeBatch(firestore);

    SAMPLE_MENU_ITEMS.forEach((it) => {
      batch.set(doc(firestore, 'menuItems', it.id), it);
    });
    INITIAL_TABLE_STATES.forEach((t) => {
      batch.set(doc(firestore, 'tables', String(t.number)), t);
    });

    await batch.commit();
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
    if (db) {
      setDoc(doc(db, 'activityLog', logItem.id), logItem).catch(() => {});
    } else {
      this.activityLog.unshift(logItem);
    }
  }
}
