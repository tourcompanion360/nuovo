/**
 * Security Utilities for XSS Prevention
 * Sanitizes user input and data before rendering
 */

/**
 * Sanitizes JSON data to prevent XSS attacks
 * @param data - The data to sanitize
 * @returns Sanitized JSON string
 */
export function sanitizeJsonForHTML(data: any): string {
  try {
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Basic XSS prevention - escape HTML characters
    return jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  } catch (error) {
    console.error('Error sanitizing JSON data:', error);
    return '{}';
  }
}

/**
 * Sanitizes CSS content to prevent injection
 * @param css - The CSS string to sanitize
 * @returns Sanitized CSS string
 */
export function sanitizeCSS(css: string): string {
  // Remove potentially dangerous CSS properties and values
  return css
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/expression\(/gi, '') // Remove CSS expressions
    .replace(/@import/gi, '') // Remove @import statements
    .replace(/behavior:/gi, '') // Remove behavior property
    .replace(/-moz-binding/gi, '') // Remove moz-binding
    .replace(/url\(/gi, '') // Remove url() functions
    .replace(/<script/gi, '') // Remove script tags
    .replace(/<\/script>/gi, ''); // Remove closing script tags
}

/**
 * Validates and sanitizes color values for CSS
 * @param color - The color value to validate
 * @returns Sanitized color value or fallback
 */
export function sanitizeColor(color: string): string {
  // Allow only valid CSS color formats
  const validColorPattern = /^(#[0-9a-fA-F]{3,6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)|hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)|[a-zA-Z]+)$/;
  
  if (validColorPattern.test(color)) {
    return color;
  }
  
  // Return safe fallback color
  return '#000000';
}

/**
 * Sanitizes user input for display
 * @param input - The user input to sanitize
 * @returns Sanitized string safe for HTML display
 */
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Validates that data is safe for JSON-LD structured data
 * @param data - The data to validate
 * @returns True if data is safe, false otherwise
 */
export function isValidStructuredData(data: any): boolean {
  try {
    // Check if data contains potentially dangerous content
    const jsonString = JSON.stringify(data);
    
    // Look for script tags, javascript URLs, or other dangerous content
    const dangerousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /expression\(/gi,
      /@import/gi
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(jsonString));
  } catch (error) {
    return false;
  }
}

/**
 * Creates a safe HTML attribute value
 * @param value - The value to sanitize
 * @returns Safe attribute value
 */
export function sanitizeAttribute(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }
  
  return value
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;');
}

