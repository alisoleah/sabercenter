// Validation utilities for Egyptian market

/**
 * Validate Egyptian phone number
 * Format: 01XXXXXXXXX (11 digits)
 * Operators: 010, 011, 012, 015
 */
export function validateEgyptianPhone(phone: string): boolean {
  const egyptianPhoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
  return egyptianPhoneRegex.test(phone);
}

/**
 * Validate Egyptian National ID
 * Format: 14 digits
 */
export function validateNationalId(nationalId: string): boolean {
  return /^\d{14}$/.test(nationalId);
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
}

/**
 * Format Egyptian phone to international
 * 01012345678 -> +201012345678
 */
export function formatPhoneToInternational(phone: string): string {
  if (phone.startsWith('+20')) return phone;
  if (phone.startsWith('0')) return `+2${phone}`;
  return `+20${phone}`;
}

/**
 * Egyptian governorates
 */
export const EGYPTIAN_GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Dakahlia',
  'Red Sea',
  'Beheira',
  'Fayoum',
  'Gharbiya',
  'Ismailia',
  'Menofia',
  'Minya',
  'Qaliubiya',
  'New Valley',
  'Suez',
  'Aswan',
  'Assiut',
  'Beni Suef',
  'Port Said',
  'Damietta',
  'Sharkia',
  'South Sinai',
  'Kafr El Sheikh',
  'Matrouh',
  'Luxor',
  'Qena',
  'North Sinai',
  'Sohag',
];
