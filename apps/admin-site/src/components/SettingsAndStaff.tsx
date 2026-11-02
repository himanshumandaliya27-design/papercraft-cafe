import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  RotateCcw,
  Save,
  Check,
  AlertTriangle,
  History,
  QrCode,
  Lock,
  Download,
  Trash2,
  Globe,
  Sparkles,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import {
  StaffUser,
  ActivityLogItem,
  CAFE_CONFIG,
  cafeStore,
  validateIndianMobile,
  validateGstin,
  validateUpiId,
  isCustomerUrlValid,
  getCustomerSiteUrl,
} from '@atelier/shared';
import { WashiTape } from './PaperElements';
import { SetupWizardModal } from './SetupWizardModal';

interface SettingsAndStaffProps {
  onOpenQRCodes: () => void;
}

export const SettingsAndStaff: React.FC<SettingsAndStaffProps> = ({ onOpenQRCodes }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'staff' | 'activity' | 'data'>('settings');
  const [staffList, setStaffList] = useState<StaffUser[]>(() => cafeStore.getStaff());
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => cafeStore.getActivityLog());
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Form State for Cafe Settings
  const [cafeName, setCafeName] = useState(CAFE_CONFIG.cafeName);
  const [tagline, setTagline] = useState(CAFE_CONFIG.tagline);
  const [phone, setPhone] = useState(CAFE_CONFIG.phone);
  const [email, setEmail] = useState(CAFE_CONFIG.email);
  const [address, setAddress] = useState(CAFE_CONFIG.address);
  const [gstin, setGstin] = useState(CAFE_CONFIG.gstin);
  const [gstPercentage, setGstPercentage] = useState(CAFE_CONFIG.gstPercentage);
  const [upiId, setUpiId] = useState(CAFE_CONFIG.upiId);
  const [receiptFooter, setReceiptFooter] = useState(CAFE_CONFIG.receiptFooterText);

  // Customer Site URL (Stored in localStorage / settings)
  const [customerSiteUrl, setCustomerSiteUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atelier_customer_site_url') || getCustomerSiteUrl() || '';
    }
    return getCustomerSiteUrl() || '';
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Delete Customer Data state
  const [showDeleteCustomerConfirm, setShowDeleteCustomerConfirm] = useState(false);
  const [deleteCustomerSuccess, setDeleteCustomerSuccess] = useState(false);

  const urlCheck = isCustomerUrlValid(customerSiteUrl);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (phone.trim()) {
      const vPhone = validateIndianMobile(phone);
      if (!vPhone.valid) errors.phone = vPhone.error || 'Invalid Indian mobile number';
    }

    if (gstin.trim()) {
      const vGst = validateGstin(gstin);
      if (!vGst.valid) errors.gstin = vGst.error || 'Invalid GSTIN format';
    }

    if (upiId.trim()) {
      const vUpi = validateUpiId(upiId);
      if (!vUpi.valid) errors.upiId = vUpi.error || 'Invalid UPI VPA ID';
    }

    if (customerSiteUrl.trim()) {
      const vUrl = isCustomerUrlValid(customerSiteUrl);
      if (!vUrl.valid && vUrl.warning) {
        errors.customerSiteUrl = vUrl.warning;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    CAFE_CONFIG.cafeName = cafeName;
    CAFE_CONFIG.tagline = tagline;
    CAFE_CONFIG.phone = phone;
    CAFE_CONFIG.email = email;
    CAFE_CONFIG.address = address;
    CAFE_CONFIG.gstin = gstin;
    CAFE_CONFIG.gstPercentage = gstPercentage;
    CAFE_CONFIG.upiId = upiId;
    CAFE_CONFIG.receiptFooterText = receiptFooter;

    if (typeof window !== 'undefined') {
      localStorage.setItem('atelier_customer_site_url', customerSiteUrl.trim());
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleConfirmReset = () => {
    cafeStore.resetToDefaults();
    setStaffList(cafeStore.getStaff());
    setActivityLogs(cafeStore.getActivityLog());
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  // Export JSON of all Cafe Data
  const handleExportAllJson = () => {
    const fullData = {
      exportedAt: new Date().toISOString(),
      cafeConfig: CAFE_CONFIG,
      customerSiteUrl,
      menuItems: cafeStore.getMenuItems(),
      tables: cafeStore.getTables(),
      orders: cafeStore.getOrders(),
      bills: cafeStore.getBills(),
      customers: cafeStore.getCustomers(),
      bookings: cafeStore.getBookings(),
      expenses: cafeStore.getExpenses(),
      dailyClosings: cafeStore.getDailyClosings(),
      activityLog: cafeStore.getActivityLog(),
    };

    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `atelier_velin_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV of Orders
  const handleExportOrdersCsv = () => {
    const orders = cafeStore.getOrders();
    let csv = 'Order ID,Date,Type,Table,Customer Name,Customer Phone,Items Count,Total Amount,Status,Payment\n';
    orders.forEach((o) => {
      csv += `"${o.id}","${o.createdAt}","${o.type}","${o.tableNumber || '-'}","${o.customerName}","${o.customerPhone}","${o.items.length}","${o.totalAmount}","${o.status}","${o.paymentStatus}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `atelier_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // GDPR / DPDP Customer Personal Data Purge
  const handleConfirmDeleteCustomerData = () => {
    // Purges personal customer records from memory / storage
    const customers = cafeStore.getCustomers();
    customers.forEach((c) => {
      cafeStore.deleteCustomer(c.id);
    });
    setShowDeleteCustomerConfirm(false);
    setDeleteCustomerSuccess(true);
    setTimeout(() => setDeleteCustomerSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 shadow-xs">
        <div>
          <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
            Owner Sovereignty & Audit
          </span>
          <h2 className="font-serif-display text-2xl font-semibold text-[#2B1B14] mt-0.5">
            System Settings, Staff & Data Governance
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2B1B14] text-[#FAF5EC] hover:bg-[#3d281f] text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5B358]" />
            <span>Launch Setup Wizard</span>
          </button>

          <button
            type="button"
            onClick={onOpenQRCodes}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 hover:border-[#2B1B14] text-[#2B1B14] text-xs font-medium cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-[#C65D3B]" />
            <span>Generate Table QR Sheets</span>
          </button>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C65D3B]/10 border border-[#C65D3B]/50 hover:bg-[#C65D3B]/20 text-[#C65D3B] text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF5EC] border border-[#C65D3B]">
              <span className="text-[11px] text-[#C65D3B] font-medium px-2">Restore sample data?</span>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-2.5 py-1 bg-[#C65D3B] text-white text-xs font-semibold cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-1 bg-neutral-200 text-neutral-800 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-[#E8F5E9] border-l-4 border-[#2E7D32] text-[#2E7D32] text-xs font-semibold flex items-center justify-between">
          <span>Pristine sample data restored successfully!</span>
          <button type="button" onClick={() => setResetSuccess(false)} className="text-xs underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#B98A5E]/30 pb-2 text-xs flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
              : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Cafe & Tax Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'staff'
              ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
              : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Accounts ({staffList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'data'
              ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
              : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Data Export & Safety</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
              : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Immutable Audit Log</span>
        </button>
      </div>

      {/* TAB A: CAFE & TAX SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="paper-sheet p-6 border border-[#B98A5E]/40 space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-[#2E7D32]/10 border border-[#2E7D32]/40 text-[#2E7D32] flex items-center gap-2 font-medium">
              <Check className="w-4 h-4" />
              <span>Settings updated and propagated across customer & admin portals!</span>
            </div>
          )}

          {/* Customer Website URL Block (Critical for table QR codes) */}
          <div className="p-4 bg-[#FAF5EC] border-2 border-[#B98A5E]/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#C65D3B]" />
                <span className="font-semibold text-sm text-[#2B1B14]">Customer Website Public URL</span>
              </div>
              {urlCheck.valid ? (
                <span className="text-[10px] px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 font-mono font-medium">
                  ✓ Valid Live Target
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 bg-[#FFEBEE] text-[#C65D3B] border border-[#C65D3B]/40 font-mono font-medium">
                  ⚠ Needs Configuration
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#4A372F]">
              The public domain where your customer-facing digital ordering app is deployed. Table QR codes will encode: <code className="font-mono bg-[#E7D6BE]/40 px-1">{customerSiteUrl || 'https://your-domain.netlify.app'}/table/:number</code>.
            </p>

            <input
              type="url"
              value={customerSiteUrl}
              onChange={(e) => setCustomerSiteUrl(e.target.value)}
              placeholder="https://ateliervelin.netlify.app"
              className="w-full px-3 py-2 bg-white border border-[#B98A5E]/60 text-xs font-mono"
            />

            {!urlCheck.valid && urlCheck.warning && (
              <div className="p-2.5 bg-[#FFF8E1] border-l-3 border-[#E5B358] text-[#7A5200] text-[11px] flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{urlCheck.warning}</span>
              </div>
            )}
            {formErrors.customerSiteUrl && (
              <span className="text-[10px] text-[#C65D3B] block">{formErrors.customerSiteUrl}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-[#4A372F] mb-1 font-semibold">Cafe Brand Name *</label>
              <input
                type="text"
                required
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-serif-display text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#4A372F] mb-1 font-semibold">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] text-[#4A372F] mb-1 font-semibold">GSTIN Number (15 Chars)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="27AABCU9603R1ZM"
                className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono uppercase"
              />
              {formErrors.gstin && (
                <span className="text-[10px] text-[#C65D3B] mt-0.5 block">{formErrors.gstin}</span>
              )}
            </div>
            <div>
              <label className="block text-[11px] text-[#4A372F] mb-1 font-semibold">GST Percentage (%) *</label>
              <input
                type="number"
                required
                min="0"
                max="28"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#4A372F] mb-1 font-semibold">UPI VPA ID for QR Code *</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="cafe@bank"
                className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono"
              />
              {formErrors.upiId && (
                <span className="text-[10px] text-[#C65D3B] mt-0.5 block">{formErrors.upiId}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-[#4A372F] mb-1 font-semibold">Official Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#4A372F] mb-1 font-semibold">Telephone Contact (India 10 digits) *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] font-mono"
              />
              {formErrors.phone && (
                <span className="text-[10px] text-[#C65D3B] mt-0.5 block">{formErrors.phone}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#4A372F] mb-1 font-semibold">80mm Thermal Receipt Footer Text</label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14]"
            />
          </div>

          <div className="pt-3 border-t border-[#B98A5E]/30 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f] cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-[#C65D3B]" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB B: STAFF ACCOUNTS */}
      {activeTab === 'staff' && (
        <div className="paper-sheet border border-[#B98A5E]/40 overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#E7D6BE]/60 border-b border-[#B98A5E]/40 text-[#4A372F] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Mobile Contact</th>
                  <th className="p-3">Access Permissions</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B98A5E]/20 text-[#2B1B14]">
                {staffList.map((st) => (
                  <tr key={st.id} className="hover:bg-[#FAF5EC]/70">
                    <td className="p-3 font-medium flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#2B1B14] text-[#FAF5EC] text-xs flex items-center justify-center font-bold">
                        {st.avatarLetter}
                      </span>
                      <span>{st.name}</span>
                    </td>
                    <td className="p-3 font-mono text-[#4A372F]">{st.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                          st.role === 'owner'
                            ? 'bg-[#C65D3B] text-white'
                            : st.role === 'manager'
                            ? 'bg-[#B98A5E] text-white'
                            : 'bg-[#4A372F] text-white'
                        }`}
                      >
                        {st.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[#4A372F]">{st.phone}</td>
                    <td className="p-3 text-[#4A372F]">
                      {st.role === 'owner'
                        ? 'Master Administrative Control'
                        : st.role === 'manager'
                        ? 'Orders, Tables, Bills, CRM'
                        : 'Kitchen Display & Live Orders'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/30 text-[10px] font-semibold">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: DATA EXPORT & SAFETY */}
      {activeTab === 'data' && (
        <div className="paper-sheet p-6 border border-[#B98A5E]/40 space-y-6 text-xs text-[#2B1B14]">
          <div>
            <h3 className="font-serif-display text-lg font-bold text-[#2B1B14]">
              Data Sovereignty & Compliance
            </h3>
            <p className="text-[11px] text-[#4A372F] mt-1">
              Export complete business archives, generate audit spreadsheets, or manage customer personal data privacy under Indian DPDP Act / GDPR rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: Export Complete JSON */}
            <div className="p-4 border border-[#B98A5E]/40 bg-[#FAF5EC] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 font-semibold text-[#2B1B14] text-sm">
                  <Download className="w-4 h-4 text-[#2E7D32]" />
                  <span>Download Full Cafe Archive (.JSON)</span>
                </div>
                <p className="text-[11px] text-[#4A372F] mt-1 leading-relaxed">
                  Complete snapshot of all menu items, orders, financial bills, tables, bookings, expenses, and system audit logs in structured format.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportAllJson}
                className="px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] hover:bg-[#3d281f] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Backup</span>
              </button>
            </div>

            {/* Action 2: Export Orders CSV */}
            <div className="p-4 border border-[#B98A5E]/40 bg-[#FAF5EC] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 font-semibold text-[#2B1B14] text-sm">
                  <FileSpreadsheet className="w-4 h-4 text-[#C65D3B]" />
                  <span>Export Orders Registry (.CSV)</span>
                </div>
                <p className="text-[11px] text-[#4A372F] mt-1 leading-relaxed">
                  Standard tabular export of all historical sales, dates, order items, customer phone numbers, and payment status for accountants.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportOrdersCsv}
                className="px-4 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 hover:bg-[#E7D6BE] text-[#2B1B14] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Orders .CSV</span>
              </button>
            </div>
          </div>

          {/* Section: Customer Data Privacy & Purge */}
          <div className="p-4 border border-[#C65D3B]/40 bg-[#FFF5F5] space-y-3">
            <div className="flex items-center gap-2 text-[#C65D3B] font-semibold text-sm">
              <Trash2 className="w-4 h-4" />
              <span>Customer Personal Data Management (Privacy Compliance)</span>
            </div>
            <p className="text-[11px] text-[#4A372F] leading-relaxed">
              In accordance with privacy mandates, this action securely purges customer names, contact numbers, and visit tallies while preserving anonymous financial order totals for book-keeping.
            </p>

            {deleteCustomerSuccess && (
              <div className="p-2.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 text-xs font-medium">
                ✓ Customer personal records purged successfully.
              </div>
            )}

            {!showDeleteCustomerConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteCustomerConfirm(true)}
                className="px-4 py-2 bg-[#C65D3B] text-white hover:bg-[#B54D2B] text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Customer Personal Records</span>
              </button>
            ) : (
              <div className="p-3 bg-white border border-[#C65D3B] space-y-2">
                <span className="text-xs font-bold text-[#C65D3B] block">
                  Confirm permanent purge of all CRM customer profiles?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmDeleteCustomerData}
                    className="px-3 py-1.5 bg-[#C65D3B] text-white text-xs font-semibold cursor-pointer"
                  >
                    Yes, Permanently Purge
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteCustomerConfirm(false)}
                    className="px-3 py-1.5 bg-neutral-200 text-neutral-800 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB D: IMMUTABLE AUDIT LOG */}
      {activeTab === 'activity' && (
        <div className="paper-sheet border border-[#B98A5E]/40 overflow-hidden text-xs">
          <div className="p-3 bg-[#FAF5EC] border-b border-[#B98A5E]/30 text-[#4A372F] text-[11px]">
            Security Audit Trail · Tracks bill creation, status transitions, discounts, and day closings
          </div>
          <div className="divide-y divide-[#B98A5E]/20 max-h-96 overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 flex items-start justify-between gap-3 hover:bg-[#FAF5EC]/70">
                <div>
                  <span className="font-semibold text-[#2B1B14]">{log.action}</span>
                  <p className="text-[#4A372F] mt-0.5">{log.details}</p>
                </div>
                <div className="text-right shrink-0 text-[11px] text-[#4A372F]">
                  <span className="font-medium text-[#2B1B14] block">{log.staffName}</span>
                  <span className="tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Wizard Modal */}
      <SetupWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={() => {
          setCafeName(CAFE_CONFIG.cafeName);
          setAddress(CAFE_CONFIG.address);
          setPhone(CAFE_CONFIG.phone);
          setGstin(CAFE_CONFIG.gstin);
          setGstPercentage(CAFE_CONFIG.gstPercentage);
          setUpiId(CAFE_CONFIG.upiId);
          if (typeof window !== 'undefined') {
            const savedUrl = localStorage.getItem('atelier_customer_site_url');
            if (savedUrl) setCustomerSiteUrl(savedUrl);
          }
        }}
      />
    </div>
  );
};
