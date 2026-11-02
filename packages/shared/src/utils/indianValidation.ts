/**
 * Atelier Vélin — Indian Business Validation Utilities
 * Strict validation for Indian phone numbers, GSTIN, UPI IDs, Pincodes, and Business Entities.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validate and normalize 10-digit Indian Mobile Numbers
 * Accepts formats: +919876543210, 09876543210, 9876543210, 98765 43210
 * Must start with digits 6, 7, 8, or 9
 */
export function validateIndianMobile(input: string): ValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Phone number is required.' };
  }

  // Strip spaces, dashes, parentheses
  const cleaned = input.replace(/[\s\-()]/g, '');

  let digits = cleaned;
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (!/^\d+$/.test(digits)) {
    return { valid: false, error: 'Phone number must contain only numeric digits.' };
  }

  if (digits.length !== 10) {
    return { valid: false, error: `Phone number must be exactly 10 digits (got ${digits.length}).` };
  }

  const firstDigit = digits.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      valid: false,
      error: 'Valid Indian mobile numbers must start with 6, 7, 8, or 9.',
    };
  }

  return {
    valid: true,
    formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
  };
}

/**
 * Validate Indian GST Identification Number (GSTIN)
 * Format: 15 alphanumeric characters:
 * - 2 digits (State Code, 01-38 or 97)
 * - 10 characters PAN (5 letters, 4 digits, 1 letter)
 * - 1 character (Entity number of same PAN, 1-9 or A-Z)
 * - 1 character 'Z' by default
 * - 1 check digit (alphanumeric)
 */
export function validateGSTIN(input: string): ValidationResult {
  if (!input || input.trim() === '') {
    return { valid: true }; // GSTIN is optional for small cafes under threshold
  }

  const cleaned = input.trim().toUpperCase();
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!gstinRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Invalid GSTIN format. Expected 15 characters (e.g. 24ABCDE1234F1Z5).',
    };
  }

  return { valid: true, formatted: cleaned };
}

export const validateGstin = validateGSTIN;

/**
 * Validate Virtual Payment Address (UPI ID)
 * Format: username@bankhandle (e.g., ateliervelin@okhdfcbank, cafe@upi)
 */
export function validateUpiId(input: string): ValidationResult {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    return { valid: false, error: 'UPI ID is required for direct guest payments.' };
  }

  const cleaned = input.trim().toLowerCase();
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

  if (!upiRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Invalid UPI ID format. Expected format like cafe@bank or name@upi.',
    };
  }

  return { valid: true, formatted: cleaned };
}

/**
 * Validate Indian Postal Index Number (Pincode)
 * 6 digits, cannot start with 0
 */
export function validatePincode(input: string): ValidationResult {
  if (!input) return { valid: false, error: 'Pincode is required.' };
  const cleaned = input.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
    return { valid: false, error: 'Invalid Pincode. Must be a 6-digit number not starting with 0.' };
  }
  return { valid: true, formatted: cleaned };
}

/**
 * Validate Person or Business Name
 */
export function validateName(input: string, min = 2, max = 80): ValidationResult {
  if (!input || input.trim().length < min) {
    return { valid: false, error: `Name must be at least ${min} characters long.` };
  }
  if (input.trim().length > max) {
    return { valid: false, error: `Name cannot exceed ${max} characters.` };
  }
  return { valid: true, formatted: input.trim() };
}
