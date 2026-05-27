import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Converts common cloud storage links (like Google Drive) to direct image URLs
 */
export function getDirectImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Google Drive conversion
  // Matches IDs in /file/d/ID/view, open?id=ID, uc?id=ID, or sharing links
  const driveMatch = url.match(/(?:\/file\/d\/|id=|id\/|d\/)([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    // lh3.googleusercontent.com is often more reliable for direct embedding than uc?export=view
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  
  return url;
}
