/**
 * Enterprise-grade security utilities
 * Provides comprehensive security measures for the application
 */

import { logSecurity } from './logger';

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:3000',
      'https://tourcompanion.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logSecurity('CORS violation attempt', undefined, { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Security event types
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
}

// Security monitoring
class SecurityMonitor {
  private failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private suspiciousIPs = new Set<string>();
  private blockedIPs = new Set<string>();

  // Track failed login attempts
  trackFailedLogin(identifier: string, ip?: string): void {
    const key = `${identifier}:${ip || 'unknown'}`;
    const now = Date.now();
    const attempt = this.failedAttempts.get(key);

    if (!attempt) {
      this.failedAttempts.set(key, { count: 1, lastAttempt: now });
    } else {
      attempt.count++;
      attempt.lastAttempt = now;
    }

    const currentAttempt = this.failedAttempts.get(key)!;
    
    if (currentAttempt.count >= 5) {
      this.blockIP(ip);
      logSecurity(SecurityEventType.ACCOUNT_LOCKED, identifier, {
        ip,
        failedAttempts: currentAttempt.count,
        lastAttempt: new Date(currentAttempt.lastAttempt).toISOString(),
      });
    } else if (currentAttempt.count >= 3) {
      this.flagSuspiciousIP(ip);
      logSecurity(SecurityEventType.SUSPICIOUS_ACTIVITY, identifier, {
        ip,
        failedAttempts: currentAttempt.count,
        lastAttempt: new Date(currentAttempt.lastAttempt).toISOString(),
      });
    }

    logSecurity(SecurityEventType.LOGIN_FAILURE, identifier, {
      ip,
      failedAttempts: currentAttempt.count,
    });
  }

  // Track successful login
  trackSuccessfulLogin(identifier: string, ip?: string): void {
    const key = `${identifier}:${ip || 'unknown'}`;
    this.failedAttempts.delete(key);
    
    logSecurity(SecurityEventType.LOGIN_SUCCESS, identifier, { ip });
  }

  // Block IP address
  private blockIP(ip?: string): void {
    if (ip) {
      this.blockedIPs.add(ip);
      logSecurity('IP blocked', undefined, { ip });
    }
  }

  // Flag suspicious IP
  private flagSuspiciousIP(ip?: string): void {
    if (ip) {
      this.suspiciousIPs.add(ip);
      logSecurity('IP flagged as suspicious', undefined, { ip });
    }
  }

  // Check if IP is blocked
  isIPBlocked(ip?: string): boolean {
    return ip ? this.blockedIPs.has(ip) : false;
  }

  // Check if IP is suspicious
  isIPSuspicious(ip?: string): boolean {
    return ip ? this.suspiciousIPs.has(ip) : false;
  }

  // Get security status
  getSecurityStatus(ip?: string): {
    isBlocked: boolean;
    isSuspicious: boolean;
    failedAttempts: number;
  } {
    const key = ip ? `:${ip}` : ':unknown';
    const attempt = Array.from(this.failedAttempts.entries())
      .find(([k]) => k.endsWith(key))?.[1];

    return {
      isBlocked: this.isIPBlocked(ip),
      isSuspicious: this.isIPSuspicious(ip),
      failedAttempts: attempt?.count || 0,
    };
  }

  // Clear old attempts (call this periodically)
  clearOldAttempts(maxAge = 24 * 60 * 60 * 1000): void { // 24 hours
    const now = Date.now();
    for (const [key, attempt] of this.failedAttempts.entries()) {
      if (now - attempt.lastAttempt > maxAge) {
        this.failedAttempts.delete(key);
      }
    }
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor();

// Input validation for security
export const validateSecurityInput = (input: string): {
  isValid: boolean;
  sanitizedValue: string;
  threats: string[];
} => {
  const threats: string[] = [];
  let sanitizedValue = input;

  // Check for SQL injection patterns
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /exec\s*\(/i,
    /script\s*>/i,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      threats.push('SQL injection attempt detected');
      sanitizedValue = sanitizedValue.replace(pattern, '');
    }
  }

  // Check for XSS patterns
  const xssPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      threats.push('XSS attempt detected');
      sanitizedValue = sanitizedValue.replace(pattern, '');
    }
  }

  // Check for path traversal
  if (input.includes('../') || input.includes('..\\')) {
    threats.push('Path traversal attempt detected');
    sanitizedValue = sanitizedValue.replace(/\.\./g, '');
  }

  // Check for command injection
  const commandPatterns = [
    /;\s*\w+/,
    /\|\s*\w+/,
    /&\s*\w+/,
    /`[^`]*`/,
    /\$\([^)]*\)/,
  ];

  for (const pattern of commandPatterns) {
    if (pattern.test(input)) {
      threats.push('Command injection attempt detected');
      sanitizedValue = sanitizedValue.replace(pattern, '');
    }
  }

  return {
    isValid: threats.length === 0,
    sanitizedValue,
    threats,
  };
};

// Session security
export const generateSecureSessionId = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// CSRF protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one lowercase letter');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one number');
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one special character');
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    score -= 2;
    feedback.push('Password is too common');
  }

  return {
    score: Math.max(0, score),
    feedback,
    isStrong: score >= 4,
  };
};

// Export convenience functions
export const trackFailedLogin = (identifier: string, ip?: string) => 
  securityMonitor.trackFailedLogin(identifier, ip);
export const trackSuccessfulLogin = (identifier: string, ip?: string) => 
  securityMonitor.trackSuccessfulLogin(identifier, ip);
export const isIPBlocked = (ip?: string) => securityMonitor.isIPBlocked(ip);
export const isIPSuspicious = (ip?: string) => securityMonitor.isIPSuspicious(ip);
export const getSecurityStatus = (ip?: string) => securityMonitor.getSecurityStatus(ip);


