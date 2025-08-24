# Security Enhancement Documentation

## Rate Limiting Vulnerability Fixes

This document describes the security enhancements made to address rate limiting vulnerabilities in the GitHV application.

### Issues Fixed

#### 1. Duplicate Rate Limiter Definitions
**Problem**: Multiple conflicting rate limiter configurations existed in the codebase.
- `server/routes.ts` had two different `githubApiLimiter` definitions with conflicting settings
- Inconsistent rate limiting across different endpoints

**Solution**: 
- Created a centralized rate limiting module at `server/security/rateLimiting.ts`
- Consolidated all rate limiting configuration in one place
- Removed duplicate definitions

#### 2. IP-Based Rate Limiting Vulnerability
**Problem**: IP-based rate limiting could be bypassed using proxies, VPNs, or IP rotation.

**Solution**:
- Implemented user-based rate limiting for authenticated endpoints
- Enhanced key generation strategy using multiple request fingerprints
- Fallback to secure IP-based limiting for unauthenticated requests

#### 3. Missing SHA-Based Authentication
**Problem**: No cryptographic verification for sensitive operations and webhooks.

**Solution**:
- Added SHA-256 HMAC signature verification for webhooks and secure endpoints
- Implemented timing-safe comparison to prevent timing attacks
- Added `requireSignature()` middleware for sensitive operations

#### 4. Inconsistent Rate Limiting Configuration
**Problem**: Rate limits were hardcoded with no central configuration.

**Solution**:
- Use environment variables for rate limiting configuration
- Different rate limits for different endpoint types (auth, API, AI, webhooks)
- Proper error handling and informative rate limit responses

### New Security Features

#### 1. Consolidated Rate Limiting
```typescript
// Different rate limiters for different endpoint types
export const generalApiLimiter = rateLimit({ ... });
export const githubApiLimiter = rateLimit({ ... });
export const aiApiLimiter = rateLimit({ ... });
export const authLimiter = rateLimit({ ... });
export const webhookLimiter = rateLimit({ ... });
```

#### 2. Secure Key Generation
```typescript
function secureKeyGenerator(req: any): string {
  // Use user ID for authenticated requests (prevents IP-based bypassing)
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  
  // For unauthenticated requests, use multiple headers for fingerprinting
  const userAgent = req.get('User-Agent') || 'unknown';
  const acceptLanguage = req.get('Accept-Language') || 'unknown';
  const forwarded = req.get('X-Forwarded-For') || req.ip || 'unknown';
  
  // Create hash to prevent extremely long keys and add obfuscation
  const combined = `${forwarded}:${userAgent}:${acceptLanguage}`;
  const hash = crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
  
  return `ip:${hash}`;
}
```

#### 3. SHA-256 HMAC Signature Verification
```typescript
export function verifyRequestSignature(req: any, secret: string): boolean {
  const signature = req.get('X-Signature-SHA256');
  if (!signature) return false;

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
```

#### 4. Webhook Security
```typescript
// Secure webhook endpoint with signature verification
app.post('/api/webhooks/github', 
  webhookLimiter,
  requireSignature(env.WEBHOOK_SECRET),
  async (req, res) => {
    // Webhook processing logic
  }
);
```

### Environment Variables

Added new environment variables for security configuration:

```bash
# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# SHA-based authentication secrets
WEBHOOK_SECRET=your-webhook-secret-for-github-webhooks-change-this
API_SECRET=your-api-secret-for-secure-endpoints-change-this
```

### Rate Limiting Configuration

| Endpoint Type | Window | Max Requests | Key Strategy | Skip Policy |
|---------------|--------|--------------|--------------|-------------|
| General API | 15 min | 100 | User ID / IP Hash | Skip failed requests |
| GitHub API | 15 min | 60 | User ID / IP Hash | Skip failed requests |
| AI API | 15 min | 50 | User ID / IP Hash | Skip failed requests |
| Authentication | 15 min | 5 | User ID / IP Hash | Skip successful requests |
| Webhooks | 5 min | 100 | IP-based | None |

### Security Benefits

1. **Prevents Rate Limit Bypassing**: User-based limiting for authenticated requests
2. **Cryptographic Verification**: SHA-256 HMAC for sensitive operations
3. **Timing Attack Protection**: Uses `crypto.timingSafeEqual()` for signature comparison
4. **Granular Rate Limiting**: Different limits for different endpoint types
5. **Configuration Flexibility**: Environment-based configuration
6. **Better Fingerprinting**: Multiple request attributes for unauthenticated requests

### Testing

The security improvements are covered by comprehensive tests in `tests/rateLimiting.test.js`:

- SHA signature verification logic
- Key generation strategies
- Security configuration validation
- Timing-safe comparison verification

### Usage Examples

#### Generating Webhook Signatures (for testing)
```bash
# Generate HMAC signature for webhook
echo -n '{"test": "data"}' | openssl dgst -sha256 -hmac "your-webhook-secret"
```

#### Making Authenticated API Requests
```javascript
const crypto = require('crypto');
const payload = JSON.stringify({ repository: 'test', branch: 'main' });
const signature = crypto.createHmac('sha256', API_SECRET).update(payload).digest('hex');

fetch('/api/secure/deploy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature-SHA256': `sha256=${signature}`
  },
  body: payload
});
```

### Production Deployment

1. **Generate Secure Secrets**: Use cryptographically random strings (≥32 characters)
2. **Configure Environment**: Set `WEBHOOK_SECRET` and `API_SECRET` environment variables
3. **Monitor Rate Limits**: Use the standardHeaders to track rate limit usage
4. **Webhook Configuration**: Configure GitHub webhooks to include the secret

### Security Considerations

1. **Secret Management**: Store secrets securely and rotate them periodically
2. **HTTPS Only**: All signature-verified endpoints should use HTTPS in production
3. **Request Logging**: Log rate limit violations for security monitoring
4. **Regular Audits**: Review rate limiting effectiveness and adjust as needed

This security enhancement significantly improves the application's resistance to:
- Rate limit bypassing attacks
- Brute force attacks
- Webhook tampering
- API abuse
- Timing-based attacks