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
