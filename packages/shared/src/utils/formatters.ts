/**
 * Shared Formatting Utilities
 * Indian Rupee (₹) formatting and Date/Time helpers
 */

/**
 * Format currency with Indian digit grouping (e.g. ₹1,25,000 or ₹450)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const hasDecimals = absAmount % 1 !== 0;
  const formattedNumber = hasDecimals
    ? absAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : absAmount.toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}₹${formattedNumber}`;
}

/**
 * Format ISO date string into readable paper ledger date
 * e.g. "16 Oct 2026, 08:30 AM"
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Format ISO date string into date only
 * e.g. "16 Oct 2026"
 */
export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

/**
 * Format elapsed time in minutes for KDS and live orders
 */
export function formatElapsedMinutes(isoString: string): number {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  } catch {
    return 0;
  }
}
