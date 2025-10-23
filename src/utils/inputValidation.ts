/**
 * Input validation and sanitization utilities
 * Prevents UI issues with long text, URLs, and special characters
 */

/**
 * Truncates text to a safe length for display
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Sanitizes text input to prevent UI overflow
 */
export const sanitizeTextInput = (text: string): string => {
  if (!text) return '';
  
  // Remove excessive whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Limit length to prevent UI issues
  return cleaned.length > 200 ? cleaned.substring(0, 200) : cleaned;
};

/**
 * Sanitizes URL input
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove whitespace
  const cleaned = url.trim();
  
  // Add protocol if missing
  if (cleaned && !cleaned.match(/^https?:\/\//)) {
    return `https://${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Sanitizes email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  // Remove whitespace and convert to lowercase
  return email.trim().toLowerCase();
};

/**
 * Sanitizes company name
 */
export const sanitizeCompanyName = (name: string): string => {
  if (!name) return '';
  
  // Remove excessive whitespace and special characters that might cause issues
  const cleaned = name.replace(/\s+/g, ' ').trim();
  
  // Limit length
  return cleaned.length > 100 ? cleaned.substring(0, 100) : cleaned;
};

/**
 * Sanitizes person name
 */
export const sanitizePersonName = (name: string): string => {
  if (!name) return '';
  
  // Remove excessive whitespace and numbers/special chars that might cause issues
  const cleaned = name.replace(/[0-9]/g, '').replace(/\s+/g, ' ').trim();
  
  // Limit length
  return cleaned.length > 50 ? cleaned.substring(0, 50) : cleaned;
};

/**
 * Validates and sanitizes phone number
 */
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters except + at the beginning
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Limit length
  return cleaned.length > 20 ? cleaned.substring(0, 20) : cleaned;
};

/**
 * Safe display name generator (for avatars)
 */
export const generateSafeDisplayName = (name: string): string => {
  if (!name) return '?';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '?';
  
  // Take first letter of first two words
  const initials = words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
  
  return initials;
};

/**
 * Safe title for projects/content
 */
export const sanitizeTitle = (title: string): string => {
  if (!title) return '';
  
  // Remove excessive whitespace
  const cleaned = title.replace(/\s+/g, ' ').trim();
  
  // Limit length to prevent UI issues
  return cleaned.length > 80 ? cleaned.substring(0, 80) : cleaned;
};

/**
 * Safe description for projects/content
 */
export const sanitizeDescription = (description: string): string => {
  if (!description) return '';
  
  // Remove excessive whitespace and line breaks
  const cleaned = description.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
  
  // Limit length to prevent UI issues
  return cleaned.length > 500 ? cleaned.substring(0, 500) : cleaned;
};

/**
 * Validates if text is safe for display (won't cause UI issues)
 */
export const isTextSafeForDisplay = (text: string, maxLength: number = 100): boolean => {
  if (!text) return true;
  
  return text.length <= maxLength && 
         !text.includes('\n') && 
         text.trim().length > 0;
};

/**
 * Gets safe CSS class based on text length
 */
export const getSafeTextClass = (text: string, maxLength: number = 50): string => {
  if (!text) return 'text-safe';
  
  if (text.length > maxLength) {
    return 'text-safe';
  }
  
  return '';
};




