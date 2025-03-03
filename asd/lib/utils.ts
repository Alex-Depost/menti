import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removes null fields from an object
 * @param obj The object to remove null fields from
 * @returns A new object with null fields removed
 */
export function removeNullFields<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Formats a date string to a relative time string (e.g., "2 hours ago")
 * using UTC time without considering the client's timezone
 * @param dateString ISO date string to format
 * @returns Formatted relative time string
 */
export function formatRelativeTimeUTC(dateString: string): string {
  // Parse the date string and ensure it's treated as UTC
  const date = new Date(dateString);
  
  // Create a new Date object with the UTC time values
  const utcDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
  
  // Use formatDistanceToNow with the UTC date
  return formatDistanceToNow(utcDate, {
    addSuffix: true,
    locale: ru
  });
}
