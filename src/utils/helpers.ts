import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseArrayField = field => {
  if (Array.isArray(field))
    return field.map(
      item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
    );
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed)
        ? parsed.map(
            item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
          )
        : [];
    } catch {
      return [];
    }
  }
  return [];
};

export function capitalizeFirst(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Helper: Normalize for deduplication (e.g., "drawer 3" → "drawer3")
export const normalizeForKey = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '') // remove all whitespace
    .replace(/[^a-z0-9]/g, ''); // keep only letters & digits
};

// Helper: Format for display (e.g., "drawer3" → "Drawer 3")
export const formatForDisplay = (str: string): string => {
  // Insert space before numbers if missing (e.g., "drawer3" → "drawer 3")
  let formatted = str.replace(/([a-z])(\d)/gi, '$1 $2');
  // Title case
  return formatted.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};
