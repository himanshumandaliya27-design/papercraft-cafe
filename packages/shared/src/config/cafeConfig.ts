/**
 * Master Configuration for Atelier Vélin Cafe Management System
 * Rebrand for any client in minutes by editing this single file!
 */

export interface CafeTheme {
  creamPaper: string;
  creamSheet: string;
  kraftBrown: string;
  espresso: string;
  terracotta: string;
  charcoalSoft: string;
}

export interface TableConfig {
  id: string;
  number: number;
  label: string;
  capacity: number;
  zone: 'Courtyard' | 'Window Linen' | 'Roastery Bar' | 'Reading Nook';
  x: number; // percentage in floor plan
  y: number; // percentage in floor plan
  shape: 'circle' | 'rect';
}

export interface CafeConfig {
  cafeName: string;
  tagline: string;
  description: string;
  establishedYear: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  customerSiteUrl?: string;
  gstin: string;
  gstPercentage: number; // e.g. 5 for 5% GST
  serviceChargePercentage: number; // 0 for optional/none
  currency: string;
  currencySymbol: string;
  upiId: string;
  upiPayeeName: string;
  razorpayKeyId?: string;
  acceptingOrders: boolean; // Master switch: when false, customer site shows "Orders Paused"
  acceptingBookings: boolean; // Master switch: when false, bookings are paused
  openingHours: {
    weekdays: string;
    weekends: string;
    mondayRoastDay: string;
    openTimeHour: number; // 24-hr format (e.g. 7.5 for 07:30)
    closeTimeHour: number; // 24-hr format (e.g. 19.5 for 19:30)
  };
  bookingRules: {
    slotDurationMinutes: number; // 90 min default
    maxAdvanceDays: number; // 14 days
    minPartySize: number;
    maxPartySize: number;
    blockedDates: string[]; // YYYY-MM-DD
  };
  vipThresholdSpend: number; // ₹5,000
  vipThresholdVisits: number; // 5 visits
  receiptFooterText: string;
  theme: CafeTheme;
  tables: TableConfig[];
}

export const CAFE_CONFIG: CafeConfig = {
  cafeName: 'Atelier Vélin',
  tagline: 'Specialty Coffee & Paper Roastery',
  description:
    'A tactile boutique coffee roastery where small-batch roasts meet hand-laminated viennoiserie, pressed into warm paper.',
  establishedYear: 2019,
  address: '14 Passage des Papetiers, Old Quarter',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  phone: '+91 98201 45890',
  email: 'bonjour@ateliervelin.coffee',
  website: 'https://ateliervelin.coffee',
  customerSiteUrl: 'https://ateliervelin.coffee',
  gstin: '27AABCV1234F1Z5',
  gstPercentage: 5, // 5% GST (2.5% CGST + 2.5% SGST)
  serviceChargePercentage: 0,
  currency: 'INR',
  currencySymbol: '₹',
  upiId: 'ateliervelin@okhdfcbank',
  upiPayeeName: 'Atelier Velin Roastery',
  razorpayKeyId: 'rzp_test_AtelierVelin2026',
  acceptingOrders: true,
  acceptingBookings: true,
  openingHours: {
    weekdays: 'Tuesday – Friday: 07:30 AM – 06:30 PM',
    weekends: 'Saturday – Sunday: 08:00 AM – 07:30 PM',
    mondayRoastDay: 'Monday (Roast & Cupping): 08:00 AM – 03:00 PM',
    openTimeHour: 7.5,
    closeTimeHour: 19.5,
  },
  bookingRules: {
    slotDurationMinutes: 90,
    maxAdvanceDays: 14,
    minPartySize: 1,
    maxPartySize: 8,
    blockedDates: ['2026-12-25', '2026-01-01'],
  },
  vipThresholdSpend: 5000,
  vipThresholdVisits: 5,
  receiptFooterText: 'Handmade coffee · Good thoughts · Thank you for visiting our paper house',
  theme: {
    creamPaper: '#F4EBDD',
    creamSheet: '#FAF5EC',
    kraftBrown: '#B98A5E',
    espresso: '#2B1B14',
    terracotta: '#C65D3B',
    charcoalSoft: '#4A372F',
  },
  tables: [
    { id: 'T1', number: 1, label: 'Table 01', capacity: 2, zone: 'Window Linen', x: 15, y: 22, shape: 'circle' },
    { id: 'T2', number: 2, label: 'Table 02', capacity: 2, zone: 'Window Linen', x: 34, y: 22, shape: 'circle' },
    { id: 'T3', number: 3, label: 'Table 03', capacity: 2, zone: 'Window Linen', x: 53, y: 22, shape: 'circle' },
    { id: 'T4', number: 4, label: 'Table 04', capacity: 4, zone: 'Courtyard', x: 18, y: 55, shape: 'rect' },
    { id: 'T5', number: 5, label: 'Table 05', capacity: 4, zone: 'Courtyard', x: 42, y: 55, shape: 'rect' },
    { id: 'T6', number: 6, label: 'Table 06', capacity: 4, zone: 'Courtyard', x: 66, y: 55, shape: 'rect' },
    { id: 'T7', number: 7, label: 'Table 07', capacity: 4, zone: 'Roastery Bar', x: 85, y: 35, shape: 'rect' },
    { id: 'T8', number: 8, label: 'Table 08', capacity: 4, zone: 'Roastery Bar', x: 85, y: 65, shape: 'rect' },
    { id: 'T9', number: 9, label: 'Table 09', capacity: 6, zone: 'Reading Nook', x: 26, y: 84, shape: 'rect' },
    { id: 'T10', number: 10, label: 'Table 10', capacity: 6, zone: 'Reading Nook', x: 62, y: 84, shape: 'rect' },
  ],
};
