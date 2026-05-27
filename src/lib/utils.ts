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
  // Matches IDs in /file/d/ID/view, open?id=ID, or uc?id=ID
  const driveMatch = url.match(/(?:\/file\/d\/|id=|id\/)([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    // Both common direct link formats - uc?export=view is usually standard
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  
  return url;
}
