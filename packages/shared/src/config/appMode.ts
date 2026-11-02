/**
 * Atelier Vélin App Mode Configuration
 * Determines production vs demo mode and handles missing config detection.
 */

export type AppMode = 'production' | 'demo';

const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  return '';
};

/** Current app mode from VITE_APP_MODE. Defaults to 'demo' if not set. */
export function getAppMode(): AppMode {
  const mode = getEnv('VITE_APP_MODE');
  if (mode === 'production') return 'production';
  return 'demo';
}

export function isProductionMode(): boolean {
  return getAppMode() === 'production';
}

export function isDemoMode(): boolean {
  return getAppMode() === 'demo';
}

/** The customer site public URL for QR codes */
export function getCustomerSiteUrl(): string {
  return getEnv('VITE_CUSTOMER_SITE_URL') || '';
}

/** The production project ID (guard for seed scripts) */
export function getProductionProjectId(): string {
  return getEnv('VITE_PRODUCTION_PROJECT_ID') || '';
}

/** Check if the customer URL looks valid for QR codes */
export function isCustomerUrlValid(url: string): { valid: boolean; warning?: string } {
  if (!url || url.trim() === '') {
    return { valid: false, warning: 'Customer website URL is not set. QR codes will not work until you set your live website URL in Admin Settings.' };
  }
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return { valid: false, warning: 'Customer website URL points to localhost. QR codes will not work for customers until you set your live website URL.' };
  }
  if (!url.startsWith('https://')) {
    return { valid: false, warning: 'Customer website URL must use HTTPS. QR codes will not work for customers until you update the URL.' };
  }
  return { valid: true };
}

export interface MissingConfig {
  key: string;
  label: string;
  site: 'customer' | 'admin' | 'both';
}

/** Check for missing critical environment variables */
export function getMissingConfigs(): MissingConfig[] {
  const missing: MissingConfig[] = [];

  const checks: Array<{ key: string; label: string; site: MissingConfig['site'] }> = [
    { key: 'VITE_FIREBASE_API_KEY', label: 'Firebase API Key', site: 'both' },
    { key: 'VITE_FIREBASE_PROJECT_ID', label: 'Firebase Project ID', site: 'both' },
    { key: 'VITE_FIREBASE_AUTH_DOMAIN', label: 'Firebase Auth Domain', site: 'both' },
    { key: 'VITE_APP_MODE', label: 'App Mode (production/demo)', site: 'both' },
  ];

  for (const check of checks) {
    const val = getEnv(check.key);
    if (!val || val.includes('your-') || val === '') {
      missing.push(check);
    }
  }

  return missing;
}
