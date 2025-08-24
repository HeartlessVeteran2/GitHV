import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { validateEnvironment } from '../environment';

const env = validateEnvironment();

/**
 * Secure key generator that uses user ID for authenticated requests
 * and includes additional security measures
 */
function secureKeyGenerator(req: any): string {
  // Use user ID for authenticated requests (prevents IP-based bypassing)
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  
  // For unauthenticated requests, use a combination of IP and additional headers
  // to make it harder to bypass with simple proxy rotation
  const userAgent = req.get('User-Agent') || 'unknown';
  const acceptLanguage = req.get('Accept-Language') || 'unknown';
  const forwarded = req.get('X-Forwarded-For') || req.ip || 'unknown';
  
  // Create a hash to prevent extremely long keys and add some obfuscation
  const combined = `${forwarded}:${userAgent}:${acceptLanguage}`;
  const hash = crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
  
  return `ip:${hash}`;
}

/**
 * SHA-based request signature verification for sensitive operations
 */
export function verifyRequestSignature(req: any, secret: string): boolean {
  const signature = req.get('X-Signature-SHA256');
  if (!signature) {
    return false;
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const actualSignature = signature.replace('sha256=', '');
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(actualSignature, 'hex')
  );
}

/**
 * General rate limiter for most API endpoints
 */
export const generalApiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  keyGenerator: secureKeyGenerator,
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000 / 60), // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Add jitter to prevent thundering herd
  skipFailedRequests: true,
  skipSuccessfulRequests: false,
});

/**
 * Stricter rate limiter for GitHub API endpoints
 */
export const githubApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // GitHub has its own rate limits, so we're more conservative
  keyGenerator: secureKeyGenerator,
  message: {
    error: 'Too many GitHub API requests, please try again later.',
    retryAfter: 15, // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

/**
 * Rate limiter for AI endpoints (more restrictive due to cost)
 */
export const aiApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 50, // More restrictive for expensive AI operations
  keyGenerator: secureKeyGenerator,
  message: {
    error: 'Too many AI requests, please try again later.',
    retryAfter: 15, // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

/**
 * Very strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per window to prevent brute force
  keyGenerator: secureKeyGenerator,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15, // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Rate limiter for webhook endpoints (should verify SHA signature)
 */
export const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Allow more requests for legitimate webhooks
  keyGenerator: (req: any) => {
    // For webhooks, we should verify the signature first
    // This is just a fallback rate limit
    const forwarded = req.get('X-Forwarded-For') || req.ip || 'unknown';
    return `webhook:${forwarded}`;
  },
  message: {
    error: 'Webhook rate limit exceeded.',
    retryAfter: 5, // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Middleware to require SHA signature verification
 */
export function requireSignature(secret: string) {
  return (req: any, res: any, next: any) => {
    if (!verifyRequestSignature(req, secret)) {
      return res.status(401).json({
        error: 'Invalid or missing signature',
        message: 'Request must include a valid X-Signature-SHA256 header'
      });
    }
    next();
  };
}