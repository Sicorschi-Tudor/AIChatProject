/**
 * Centralized date utilities for handling both old and new date formats
 * Old format: yyyy-MM-dd (ISO date)
 * New format: dd-MM-yyyy (European date)
 */

/**
 * Parse a date string into a Date object
 * Supports both old (yyyy-MM-dd) and new (dd-MM-yyyy) formats
 */
export const parseDateFromString = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  
  // Format nou: dd-MM-yyyy
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("-");
    return new Date(+year, +month - 1, +day);
  }
  
  // Format vechi: yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-");
    return new Date(+year, +month - 1, +day);
  }
  
  // Încearcă conversia directă (ISO strings, etc.)
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Convert any date to the new format (dd-MM-yyyy) for UI display
 */
export const formatDateToNewFormat = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? parseDateFromString(date) : date;
  if (!dateObj || isNaN(dateObj.getTime())) return "";
  
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Convert any date to the old format (yyyy-MM-dd) for API/backend
 */
export const formatDateToOldFormat = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? parseDateFromString(date) : date;
  if (!dateObj || isNaN(dateObj.getTime())) return "";
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Check if a date string is in the old format (yyyy-MM-dd)
 */
export const isOldDateFormat = (dateStr: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

/**
 * Check if a date string is in the new format (dd-MM-yyyy)
 */
export const isNewDateFormat = (dateStr: string): boolean => {
  return /^\d{2}-\d{2}-\d{4}$/.test(dateStr);
};

/**
 * Normalize a date string to the new format (dd-MM-yyyy)
 * This ensures consistent date format throughout the application
 */
export const normalizeDateString = (dateStr: string | null | undefined): string => {
  return formatDateToNewFormat(dateStr);
};

/**
 * Convert date to old format for API calls
 * This ensures backend compatibility
 */
export const convertToApiFormat = (dateStr: string | null | undefined): string => {
  return formatDateToOldFormat(dateStr);
};
