import React, { useState } from 'react';
import { Lock, Mail, Key, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  StaffUser,
  CAFE_CONFIG,
  cafeStore,
  staffSignInWithEmail,
  staffSendPasswordReset,
} from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

interface LoginPageProps {
  onLoginSuccess: (user: StaffUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [usePinMode, setUsePinMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const isDemo = !cafeStore.isFirebaseMode();
  const staffList = cafeStore.getStaff();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!isDemo) {
        // PRODUCTION MODE: Real Firebase Authentication
        if (usePinMode) {
          // In production, PIN is only permitted for device screen-unlock after initial email sign-in
          const screenLock = localStorage.getItem('atelier_screen_lock');
          if (!screenLock) {
            setErrorMessage('PIN unlock requires initial staff email sign-in on this device.');
            setIsSubmitting(false);
            return;
          }
          const parsed = JSON.parse(screenLock);
          // Verify hash
          const { verifyPin } = await import('@atelier/shared');
          const isValid = await verifyPin(pin, parsed.salt, parsed.hash);
          if (isValid && parsed.staff) {
            cafeStore.setCurrentStaff(parsed.staff);
            onLoginSuccess(parsed.staff);
            return;
          } else {
            setErrorMessage('Incorrect counter PIN for this terminal.');
            setIsSubmitting(false);
            return;
          }
        }

        if (!email.trim() || !password.trim()) {
          setErrorMessage('Please provide both staff email and account password.');
          setIsSubmitting(false);
          return;
        }

        const authUser = await staffSignInWithEmail(email, password);
        const matchedStaff: StaffUser = staffList.find(
          (s) => s.email.toLowerCase() === authUser.email.toLowerCase()
        ) || {
          id: authUser.uid,
          name: authUser.email.split('@')[0],
          email: authUser.email,
          role: authUser.role,
          avatarLetter: authUser.email.charAt(0).toUpperCase(),
          active: true,
        };

        cafeStore.setCurrentStaff(matchedStaff);
        onLoginSuccess(matchedStaff);
      } else {
        // DEMO MODE: Sandbox verification
        if (usePinMode) {
          if (!pin.trim()) {
            setErrorMessage('Please enter your 4-digit staff PIN.');
            setIsSubmitting(false);
            return;
          }
          // Demo PIN check (1234, 2345, 3456)
          const roleByPin: Record<string, 'owner' | 'manager' | 'staff'> = {
            '1234': 'owner',
            '2345': 'manager',
            '3456': 'staff',
          };
          const demoRole = roleByPin[pin.trim()];
          if (!demoRole) {
            setErrorMessage('Invalid demo PIN. Use demo codes: 1234 (Owner), 2345 (Manager), 3456 (Kitchen)');
            setIsSubmitting(false);
            return;
          }
          const match = staffList.find((s) => s.role === demoRole) || staffList[0];
          cafeStore.setCurrentStaff(match);
          onLoginSuccess(match);
        } else {
          if (!email.trim() || !password.trim()) {
            setErrorMessage('Please enter both email and password.');
            setIsSubmitting(false);
            return;
          }
          const match = staffList.find(
            (s) => s.email.toLowerCase() === email.trim().toLowerCase()
          );
          if (match) {
            cafeStore.setCurrentStaff(match);
            onLoginSuccess(match);
          } else {
            setErrorMessage('Staff account not found in demo registry. Use Quick-Switch buttons below.');
          }
        }
      }
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/user-not-found') {
        setErrorMessage('Invalid staff email address or password.');
      } else if (fbErr.code === 'auth/too-many-requests') {
        setErrorMessage('Access temporarily locked due to repeated failed attempts. Please reset password or wait 15 minutes.');
      } else {
        setErrorMessage(fbErr.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your staff email above to receive password reset instructions.');
      return;
    }
    try {
      if (!isDemo) {
        await staffSendPasswordReset(email);
      }
      setResetEmailSent(true);
      setErrorMessage(null);
    } catch (err: unknown) {
      const fbErr = err as { message?: string };
      setErrorMessage(fbErr.message || 'Failed to dispatch password reset email.');
    }
  };

  const handleQuickLogin = (role: 'owner' | 'manager' | 'staff') => {
    const staff = staffList.find((s) => s.role === role);
    if (staff) {
      cafeStore.setCurrentStaff(staff);
      onLoginSuccess(staff);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EBDD] flex items-center justify-center p-4 paper-grain">
      <div className="w-full max-w-md paper-sheet paper-grain p-8 border border-[#B98A5E]/50 shadow-2xl space-y-6 relative">
        <WashiTape
          variant="terracotta"
          position="top-center"
          label={isDemo ? 'Restricted Access · Demo Mode' : 'Restricted Staff Portal'}
        />

        {/* Brand Header */}
        <div className="text-center pt-2">
          <div className="w-12 h-12 rounded-full bg-[#2B1B14] text-[#FAF5EC] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-6 h-6 text-[#E5B358]" />
          </div>
          <h1 className="font-serif-display text-2xl font-bold text-[#2B1B14]">
            {CAFE_CONFIG.cafeName}
          </h1>
          <p className="text-xs font-mono uppercase text-[#C65D3B] tracking-wider mt-0.5 font-semibold">
            Operations & POS Workspace
          </p>
        </div>

        {/* Environment Badge */}
        {isDemo ? (
          <div className="p-2.5 bg-[#FFF8E1] border border-[#FFE082] text-xs text-[#7A5200] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E5B358]" />
            <span className="text-[11px] font-mono leading-tight">
              DEMO MODE: Running in browser sandbox. Connect Firebase for real cloud authentication.
            </span>
          </div>
        ) : (
          <div className="p-2.5 bg-[#E8F5E9] border border-[#2E7D32]/40 text-xs text-[#2E7D32] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
            <span className="text-[11px] font-mono leading-tight">
              PRODUCTION CLOUD: Secured by Firebase Authentication & Custom Claims.
            </span>
          </div>
        )}

        {/* Login Mode Toggle */}
        <div className="grid grid-cols-2 p-1 bg-[#F4EBDD] border border-[#B98A5E]/40 text-xs">
          <button
            type="button"
            onClick={() => {
              setUsePinMode(false);
              setErrorMessage(null);
            }}
            className={`py-1.5 font-medium transition-colors cursor-pointer ${
              !usePinMode
                ? 'bg-[#2B1B14] text-[#FAF5EC] shadow-xs'
                : 'text-[#4A372F] hover:text-[#2B1B14]'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => {
              setUsePinMode(true);
              setErrorMessage(null);
            }}
            className={`py-1.5 font-medium transition-colors cursor-pointer ${
              usePinMode
                ? 'bg-[#2B1B14] text-[#FAF5EC] shadow-xs'
                : 'text-[#4A372F] hover:text-[#2B1B14]'
            }`}
          >
            Counter Screen PIN
          </button>
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <div className="p-3 bg-[#FAF5EC] border-l-4 border-[#C65D3B] text-xs text-[#C65D3B] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success Callout */}
        {resetEmailSent && (
          <div className="p-3 bg-[#E8F5E9] border-l-4 border-[#2E7D32] text-xs text-[#2E7D32] flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">
              Password recovery email dispatched. Please check your inbox.
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {!usePinMode ? (
            <>
              <div>
                <label htmlFor="staff-email" className="block text-xs font-semibold text-[#2B1B14] mb-1">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#B98A5E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="staff-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="clara@ateliervelin.coffee"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="staff-password" className="text-xs font-semibold text-[#2B1B14]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword((prev) => !prev)}
                    className="text-[11px] text-[#C65D3B] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#B98A5E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="staff-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="staff-pin" className="block text-xs font-semibold text-[#2B1B14] mb-1">
                Counter Station 4-Digit PIN
              </label>
              <input
                id="staff-pin"
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-widest text-xl font-mono py-2 bg-[#FAF5EC] border border-[#B98A5E]/60 text-[#2B1B14] focus:outline-none focus:border-[#C65D3B]"
              />
              <span className="text-[11px] text-[#4A372F] block mt-1">
                {isDemo ? 'Demo PINs: 1234 (Owner), 2345 (Manager), 3456 (Kitchen)' : 'Enter terminal unlock PIN'}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#2B1B14] text-[#FAF5EC] font-serif-display font-semibold text-xs hover:bg-[#3d281f] transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying Credentials...' : 'Authenticate & Open Workspace →'}
          </button>
        </form>

        {/* Forgot Password Section */}
        {showForgotPassword && (
          <div className="p-4 bg-[#FAF5EC] border border-[#B98A5E]/60 space-y-3">
            <span className="text-xs font-semibold text-[#2B1B14] block">
              Reset Staff Password
            </span>
            <p className="text-[11px] text-[#4A372F]">
              Enter your registered staff email address above and click the button below to dispatch a secure password reset link.
            </p>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="px-3 py-1.5 bg-[#C65D3B] text-white text-xs font-semibold hover:bg-[#b24f2f] cursor-pointer"
            >
              Send Reset Link
            </button>
          </div>
        )}

        {/* Demo One-Click Role Switcher - STRICTLY HIDDEN IN PRODUCTION */}
        {isDemo && (
          <div className="pt-4 border-t border-dashed border-[#B98A5E]/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#4A372F] uppercase tracking-wider font-mono">
                Demo Quick-Switch Profiles:
              </span>
              <span className="text-[10px] text-[#C65D3B] font-mono">Visible in Demo Only</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('owner')}
                className="p-2 border border-[#B98A5E]/60 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-center cursor-pointer"
              >
                <span className="font-serif-display text-xs font-bold text-[#2B1B14] block">
                  Owner
                </span>
                <span className="text-[10px] text-[#C65D3B]">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager')}
                className="p-2 border border-[#B98A5E]/60 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-center cursor-pointer"
              >
                <span className="font-serif-display text-xs font-bold text-[#2B1B14] block">
                  Manager
                </span>
                <span className="text-[10px] text-[#2E7D32]">Bills & CRM</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="p-2 border border-[#B98A5E]/60 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-center cursor-pointer"
              >
                <span className="font-serif-display text-xs font-bold text-[#2B1B14] block">
                  Kitchen
                </span>
                <span className="text-[10px] text-[#4A372F]">Orders / KDS</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
