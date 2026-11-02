import React, { useState } from 'react';
import {
  Store,
  Grid3X3,
  Utensils,
  CreditCard,
  Globe,
  Users,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Download,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import {
  CAFE_CONFIG,
  cafeStore,
  validateIndianMobile,
  validateGstin,
  validateUpiId,
  isCustomerUrlValid,
  TableLiveState,
  MenuItem,
  StaffUser,
} from '@atelier/shared';
import { WashiTape } from './PaperElements';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: 'Cafe Profile', icon: Store, desc: 'Identity, contact & tax' },
  { id: 2, title: 'Tables', icon: Grid3X3, desc: 'Dine-in floor plan' },
  { id: 3, title: 'Menu Items', icon: Utensils, desc: 'Offerings & pricing' },
  { id: 4, title: 'Payments', icon: CreditCard, desc: 'UPI & cash settlement' },
  { id: 5, title: 'Public URL & QRs', icon: Globe, desc: 'Live domain & table QRs' },
  { id: 6, title: 'Staff Accounts', icon: Users, desc: 'Team & role access' },
  { id: 7, title: 'Review & Go Live', icon: Rocket, desc: 'Final launch verification' },
];

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('atelier_setup_wizard_step');
      return savedStep ? Math.min(Math.max(1, parseInt(savedStep, 10)), 7) : 1;
    }
    return 1;
  });

  // Step 1: Cafe Profile State
  const [cafeName, setCafeName] = useState(CAFE_CONFIG.cafeName || 'Atelier Vélin');
  const [tagline, setTagline] = useState(CAFE_CONFIG.tagline || 'Artisan Papercraft Coffee Roastery');
  const [address, setAddress] = useState(CAFE_CONFIG.address || '');
  const [phone, setPhone] = useState(CAFE_CONFIG.phone || '');
  const [email, setEmail] = useState(CAFE_CONFIG.email || '');
  const [gstin, setGstin] = useState(CAFE_CONFIG.gstin || '');
  const [gstPercent, setGstPercent] = useState<number>(CAFE_CONFIG.gstPercentage || 5);
  const [serviceCharge, setServiceCharge] = useState<number>(CAFE_CONFIG.serviceChargePercentage || 0);

  // Step 2: Tables State
  const [tableCount, setTableCount] = useState<number>(10);
  const [defaultSeats, setDefaultSeats] = useState<number>(4);

  // Step 3: Menu State
  const [sampleMenuChoice, setSampleMenuChoice] = useState<'blank' | 'starter'>('starter');

  // Step 4: Payments State
  const [upiId, setUpiId] = useState(CAFE_CONFIG.upiId || '');
  const [acceptCash, setAcceptCash] = useState<boolean>(true);

  // Step 5: Public Website URL State
  const [customerUrl, setCustomerUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atelier_customer_site_url') || '';
    }
    return '';
  });

  // Step 6: Staff Email State
  const [managerEmail, setManagerEmail] = useState('');
  const [baristaEmail, setBaristaEmail] = useState('');

  // Step Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const saveCurrentProgress = (nextStep: number) => {
    setCurrentStep(nextStep);
    if (typeof window !== 'undefined') {
      localStorage.setItem('atelier_setup_wizard_step', String(nextStep));
    }
  };

  const validateStep = (step: number): boolean => {
    const errs: { [key: string]: string } = {};

    if (step === 1) {
      if (!cafeName.trim()) errs.cafeName = 'Cafe name is required.';
      if (!address.trim()) errs.address = 'Cafe address is required.';
      if (phone.trim()) {
        const vPhone = validateIndianMobile(phone);
        if (!vPhone.valid) errs.phone = vPhone.error || 'Invalid Indian mobile number.';
      }
      if (gstin.trim()) {
        const vGst = validateGstin(gstin);
        if (!vGst.valid) errs.gstin = vGst.error || 'Invalid GSTIN format.';
      }
    } else if (step === 4) {
      if (upiId.trim()) {
        const vUpi = validateUpiId(upiId);
        if (!vUpi.valid) errs.upiId = vUpi.error || 'Invalid UPI VPA ID format.';
      }
    } else if (step === 5) {
      if (customerUrl.trim()) {
        const vUrl = isCustomerUrlValid(customerUrl);
        if (!vUrl.valid && vUrl.warning) {
          errs.customerUrl = vUrl.warning;
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 7) {
      saveCurrentProgress(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      saveCurrentProgress(currentStep - 1);
    }
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent =
      'id,name,category,price,description,isVegetarian,isVegan,isGlutenFree,spiceLevel,available\n' +
      'm1,Signature Pour-Over,Hot Coffee,240,Single-origin washed Ethiopian Yirgacheffe,true,true,true,0,true\n' +
      'm2,Espresso Tonic,Cold Coffee,260,Double espresso pulled over artisan tonic & lime,true,true,true,0,true\n' +
      'm3,Almond Croissant,Pastries,210,Twice-baked butter croissant with frangipane,true,false,false,0,true\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'atelier_menu_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFinishAndGoLive = () => {
    // 1. Commit Cafe Config
    CAFE_CONFIG.cafeName = cafeName;
    CAFE_CONFIG.tagline = tagline;
    CAFE_CONFIG.address = address;
    if (phone) CAFE_CONFIG.phone = phone;
    if (email) CAFE_CONFIG.email = email;
    if (gstin) CAFE_CONFIG.gstin = gstin;
    CAFE_CONFIG.gstPercentage = gstPercent;
    CAFE_CONFIG.serviceChargePercentage = serviceCharge;
    if (upiId) CAFE_CONFIG.upiId = upiId;

    // 2. Commit Customer Site URL to LocalStorage & Config
    if (customerUrl.trim()) {
      localStorage.setItem('atelier_customer_site_url', customerUrl.trim());
    }

    // 3. Mark setup wizard completed
    localStorage.setItem('atelier_setup_wizard_completed', 'true');
    localStorage.removeItem('atelier_setup_wizard_step');

    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2B1B14]/75 backdrop-blur-xs">
      <div className="paper-sheet paper-grain border-2 border-[#B98A5E]/70 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <WashiTape variant="terracotta" position="top-center" label="Onboarding Protocol" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#B98A5E]/30 flex items-center justify-between bg-[#FAF5EC]/80">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#C65D3B] font-semibold">
              First-Time Business Setup Wizard • Step {currentStep} of 7
            </span>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2B1B14]">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-xs text-[#4A372F] mt-0.5">
              {STEPS[currentStep - 1].desc}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#4A372F] hover:text-[#2B1B14] hover:bg-[#E7D6BE]/50 border border-[#B98A5E]/40 cursor-pointer"
            aria-label="Close setup wizard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-[#E7D6BE]/40 px-4 py-2 border-b border-[#B98A5E]/20 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[550px] gap-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isPast = s.id < currentStep;
              const isCurr = s.id === currentStep;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => s.id < currentStep && saveCurrentProgress(s.id)}
                  disabled={s.id > currentStep}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition-colors ${
                    isCurr
                      ? 'bg-[#2B1B14] text-[#FAF5EC] font-semibold shadow-xs'
                      : isPast
                      ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/30 cursor-pointer'
                      : 'text-[#4A372F]/50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {isPast ? (
                    <Check className="w-3 h-3 text-[#2E7D32]" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  <span>{s.id}. {s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Step Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs text-[#2B1B14]">
          {/* STEP 1: CAFE PROFILE */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-[#FAF5EC] border-l-3 border-[#C65D3B] text-[11px] text-[#4A372F]">
                Configure your cafe brand, contact coordinates, and statutory taxation settings. Real values will appear on all printed thermal receipts and customer portals.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    Cafe Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-sm font-serif-display font-semibold"
                    placeholder="e.g. Atelier Vélin Coffee Roasters"
                  />
                  {errors.cafeName && (
                    <span className="text-[10px] text-[#C65D3B] mt-0.5 block">{errors.cafeName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60"
                    placeholder="e.g. Tactile Papercraft Roastery"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                  Physical Cafe Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60"
                  placeholder="e.g. 14 Mill Lane, Old Quarter, Fort, Mumbai 400001"
                />
                {errors.address && (
                  <span className="text-[10px] text-[#C65D3B] mt-0.5 block">{errors.address}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    Official Mobile Contact (India)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 font-mono"
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <span className="text-[10px] text-[#C65D3B] mt-0.5 block">{errors.phone}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    Customer Support Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 font-mono"
                    placeholder="concierge@ateliervelin.in"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#B98A5E]/20">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    GSTIN Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 font-mono uppercase"
                    placeholder="27AABCU9603R1ZM"
                  />
                  {errors.gstin && (
                    <span className="text-[10px] text-[#C65D3B] mt-0.5 block">{errors.gstin}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    GST Rate (%) (Fixed ₹ currency)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    Service Charge (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 tabular-nums"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TABLES */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-[#FAF5EC] border-l-3 border-[#C65D3B] text-[11px] text-[#4A372F]">
                Define the physical table count for your dine-in seating. Each table will have a unique scannable QR code generated automatically.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    Total Number of Tables
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tableCount}
                    onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 tabular-nums font-mono font-bold text-sm"
                  />
                  <span className="text-[10px] text-[#4A372F] mt-1 block">
                    Tables 1 through {tableCount} will be created in the live seating floor plan.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    Default Seating Capacity per Table
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={defaultSeats}
                    onChange={(e) => setDefaultSeats(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 tabular-nums"
                  />
                </div>
              </div>

              <div className="border border-[#B98A5E]/30 p-3 bg-[#FAF5EC]/60 space-y-2">
                <span className="text-[11px] font-semibold text-[#2B1B14] block">Floor Plan Preview</span>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {Array.from({ length: Math.min(tableCount, 20) }, (_, i) => (
                    <div
                      key={i + 1}
                      className="p-2 border border-[#B98A5E]/40 text-center bg-[#FAF5EC] shadow-xs"
                    >
                      <div className="text-[10px] font-bold text-[#2B1B14]">T-{i + 1}</div>
                      <div className="text-[9px] text-[#4A372F]">{defaultSeats} seats</div>
                    </div>
                  ))}
                </div>
                {tableCount > 20 && (
                  <p className="text-[10px] text-[#4A372F] italic">+ {tableCount - 20} more tables</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: MENU ITEMS */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-[#FAF5EC] border-l-3 border-[#C65D3B] text-[11px] text-[#4A372F]">
                Populate your initial menu catalog. You can start with our curated artisan coffee & pastry foundation, or start completely blank. You can import CSV items at any time.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`p-4 border-2 cursor-pointer transition-colors block ${
                    sampleMenuChoice === 'starter'
                      ? 'border-[#2B1B14] bg-[#FAF5EC]'
                      : 'border-[#B98A5E]/40 bg-[#FAF5EC]/40 opacity-70'
                  }`}
                >
                  <input
                    type="radio"
                    name="menuChoice"
                    checked={sampleMenuChoice === 'starter'}
                    onChange={() => setSampleMenuChoice('starter')}
                    className="sr-only"
                  />
                  <div className="font-semibold text-sm text-[#2B1B14] mb-1">
                    ★ Load Foundation Menu Catalog
                  </div>
                  <p className="text-[11px] text-[#4A372F] leading-relaxed">
                    Includes 20+ real artisan items: Single-Origin Pour-Overs, Nitro Cold Brew, Artisan Pastries, and Toasties with pricing. You can upload photos immediately in Menu Manager.
                  </p>
                </label>

                <label
                  className={`p-4 border-2 cursor-pointer transition-colors block ${
                    sampleMenuChoice === 'blank'
                      ? 'border-[#2B1B14] bg-[#FAF5EC]'
                      : 'border-[#B98A5E]/40 bg-[#FAF5EC]/40 opacity-70'
                  }`}
                >
                  <input
                    type="radio"
                    name="menuChoice"
                    checked={sampleMenuChoice === 'blank'}
                    onChange={() => setSampleMenuChoice('blank')}
                    className="sr-only"
                  />
                  <div className="font-semibold text-sm text-[#2B1B14] mb-1">
                    Start with Blank Catalog
                  </div>
                  <p className="text-[11px] text-[#4A372F] leading-relaxed">
                    Zero starter items. You will build your categories and offerings manually or import via CSV bulk upload.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-[#B98A5E]/40 bg-[#FAF5EC]">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#2E7D32]" />
                  <div>
                    <div className="font-semibold text-[11px] text-[#2B1B14]">Download Menu CSV Template</div>
                    <div className="text-[10px] text-[#4A372F]">Format items in Excel or Google Sheets for 1-click import</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="px-3 py-1.5 text-xs bg-[#2B1B14] text-[#FAF5EC] hover:bg-[#3d281f] flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENTS */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-[#FAF5EC] border-l-3 border-[#C65D3B] text-[11px] text-[#4A372F]">
                Configure settlement channels. Atelier Vélin supports instant customer dynamic UPI payment QR codes directly to your merchant account.
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                  Merchant UPI Virtual Payment Address (VPA) *
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 font-mono text-sm"
                  placeholder="e.g. ateliervelin@icici or merchant@upi"
                />
                <span className="text-[10px] text-[#4A372F] mt-1 block">
                  Customers scan dynamic UPI QR codes on their table to pay without cashiers.
                </span>
                {errors.upiId && (
                  <span className="text-[10px] text-[#C65D3B] mt-0.5 block">{errors.upiId}</span>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 border border-[#B98A5E]/40 bg-[#FAF5EC]">
                <input
                  type="checkbox"
                  id="acceptCash"
                  checked={acceptCash}
                  onChange={(e) => setAcceptCash(e.target.checked)}
                  className="w-4 h-4 accent-[#2B1B14] cursor-pointer"
                />
                <label htmlFor="acceptCash" className="cursor-pointer">
                  <span className="font-semibold text-[11px] text-[#2B1B14] block">
                    Accept Cash on Delivery / Counter Settlement
                  </span>
                  <span className="text-[10px] text-[#4A372F]">
                    Allows customers to choose 'Pay at Cashier Counter' when finalizing orders.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: PUBLIC WEBSITE URL & QR CODES */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-[#FAF5EC] border-l-3 border-[#C65D3B] text-[11px] text-[#4A372F]">
                Set your deployed customer website URL. The table QR code generator binds directly to this URL so customers can scan physical paper stands and land on Table 1, 2, etc.
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                  Customer Website Live URL (HTTPS)
                </label>
                <input
                  type="url"
                  value={customerUrl}
                  onChange={(e) => setCustomerUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 font-mono text-xs"
                  placeholder="https://ateliervelin.netlify.app"
                />
                {errors.customerUrl ? (
                  <div className="p-2.5 mt-2 bg-[#FFEBEE] border border-[#C65D3B]/40 text-[#C65D3B] text-[11px] flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{errors.customerUrl}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-[#4A372F] mt-1 block">
                    Example QR payload: <code className="font-mono bg-[#E7D6BE]/40 px-1">{customerUrl || 'https://your-domain.netlify.app'}/table/1</code>
                  </span>
                )}
              </div>

              <div className="p-3 border border-[#B98A5E]/40 bg-[#FAF5EC] text-[11px] text-[#4A372F] space-y-1">
                <span className="font-semibold text-[#2B1B14] block">Ready for Print:</span>
                <p>
                  Once setup is finished, navigate to the <strong>Tables</strong> tab to download or print the 6-cards-per-page A4 cut-sheet for your table cardholders.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: STAFF ACCOUNTS */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-[#FAF5EC] border-l-3 border-[#C65D3B] text-[11px] text-[#4A372F]">
                Invite your operational team. You can configure individual passwords and pin codes in the Staff management section later.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    Floor Manager Email Address
                  </label>
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 font-mono text-xs"
                    placeholder="manager@ateliervelin.in"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#2B1B14] mb-1">
                    Head Barista / Chef Email Address
                  </label>
                  <input
                    type="email"
                    value={baristaEmail}
                    onChange={(e) => setBaristaEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 font-mono text-xs"
                    placeholder="barista@ateliervelin.in"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & GO LIVE */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-[#E8F5E9] border border-[#2E7D32]/40 text-[#2E7D32] space-y-1">
                <div className="flex items-center gap-2 font-serif-display font-bold text-sm">
                  <Check className="w-4 h-4" />
                  <span>Ready to Go Live!</span>
                </div>
                <p className="text-[11px] text-[#2E7D32]/90">
                  Your business configuration is verified. Clicking "Go Live" will activate real-time order listening and update your store settings.
                </p>
              </div>

              <div className="border border-[#B98A5E]/40 p-4 bg-[#FAF5EC] space-y-2 text-xs">
                <div className="font-semibold text-[#2B1B14] border-b border-[#B98A5E]/30 pb-1">
                  Launch Summary
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#4A372F]">Brand:</span> <span className="font-semibold">{cafeName}</span>
                  </div>
                  <div>
                    <span className="text-[#4A372F]">Tax / Currency:</span> <span className="font-semibold">{gstPercent}% GST (₹ INR)</span>
                  </div>
                  <div>
                    <span className="text-[#4A372F]">Seating Capacity:</span> <span className="font-semibold">{tableCount} Tables</span>
                  </div>
                  <div>
                    <span className="text-[#4A372F]">Merchant UPI:</span> <span className="font-mono">{upiId || 'Not configured'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#4A372F]">Public Customer URL:</span>{' '}
                    <span className="font-mono text-[10px]">{customerUrl || 'Not set (using default fallback)'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Controls */}
        <div className="p-4 sm:p-5 border-t border-[#B98A5E]/30 flex items-center justify-between bg-[#FAF5EC]">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-4 py-2 border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed border-transparent text-[#4A372F]'
                : 'border-[#B98A5E]/60 text-[#2B1B14] hover:bg-[#E7D6BE] cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-semibold hover:bg-[#3d281f] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishAndGoLive}
              className="px-6 py-2 bg-[#C65D3B] text-white text-xs font-serif-display font-bold hover:bg-[#B54D2B] flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Rocket className="w-4 h-4" />
              <span>Complete Setup & Go Live</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
