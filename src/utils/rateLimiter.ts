/**
 * Rate Limiter Utility
 * Implements client-side rate limiting for public routes
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cleanup();
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const fullKey = `${this.config.keyPrefix}:${key}`;
    
    // Clean up expired entries
    this.cleanup();

    const entry = this.storage.get(fullKey);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      this.storage.set(fullKey, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count++;
    this.storage.set(fullKey, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Get current status for a key
   */
  getStatus(key: string): { count: number; remaining: number; resetTime: number } {
    const now = Date.now();
    const fullKey = `${this.config.keyPrefix}:${key}`;
    const entry = this.storage.get(fullKey);

    if (!entry || now > entry.resetTime) {
      return {
        count: 0,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      };
    }

    return {
      count: entry.count,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    const fullKey = `${this.config.keyPrefix}:${key}`;
    this.storage.delete(fullKey);
  }
}

// Create rate limiter instances for different use cases
export const clientPortalRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 requests
  windowMs: 60 * 1000, // per minute
  keyPrefix: 'client_portal'
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // per minute
  keyPrefix: 'api'
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 requests
  windowMs: 15 * 60 * 1000, // per 15 minutes
  keyPrefix: 'auth'
});

/**
 * Hook for using rate limiting in React components
 */
export const useRateLimit = (limiter: RateLimiter, key: string) => {
  const checkRateLimit = () => {
    return limiter.isAllowed(key);
  };

  const getStatus = () => {
    return limiter.getStatus(key);
  };

  const reset = () => {
    limiter.reset(key);
  };

  return {
    checkRateLimit,
    getStatus,
    reset
  };
};

/**
 * Generate a key for rate limiting based on IP and user agent
 */
export const generateRateLimitKey = (): string => {
  // In a real application, you'd get the IP from the server
  // For client-side, we use a combination of factors
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Create a simple hash-like key
  const keyData = `${userAgent}:${language}:${timezone}`;
  return btoa(keyData).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
};

export default RateLimiter;
