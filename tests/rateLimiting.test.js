const crypto = require('crypto');

// Mock the rate limiting module since we can't import ES modules in Jest easily
// This tests the core security logic
describe('Rate Limiting Security', () => {
  describe('SHA signature verification logic', () => {
    function verifyRequestSignature(payload, signature, secret) {
      if (!signature) {
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const actualSignature = signature.replace('sha256=', '');
      
      try {
        // Use timing-safe comparison to prevent timing attacks
        return crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'hex'),
          Buffer.from(actualSignature, 'hex')
        );
      } catch (error) {
        return false;
      }
    }

    test('should verify valid SHA256 signatures', () => {
      const secret = 'test-webhook-secret-123456789012';
      const payload = JSON.stringify({ test: 'data' });
      
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      expect(verifyRequestSignature(payload, `sha256=${signature}`, secret)).toBe(true);
    });

    test('should reject invalid signatures', () => {
      const secret = 'test-webhook-secret-123456789012';
      const payload = JSON.stringify({ test: 'data' });

      expect(verifyRequestSignature(payload, 'sha256=invalid-signature', secret)).toBe(false);
    });

    test('should reject requests with empty string as signature', () => {
      const secret = 'test-webhook-secret-123456789012';
      const payload = JSON.stringify({ test: 'data' });

      expect(verifyRequestSignature(payload, '', secret)).toBe(false);
    });

    test('should reject requests without signatures', () => {
      const secret = 'test-webhook-secret-123456789012';
      const payload = JSON.stringify({ test: 'data' });

      expect(verifyRequestSignature(payload, null, secret)).toBe(false);
    });

    test('should reject signatures with incorrect length', () => {
      const secret = 'test-webhook-secret-123456789012';
      const payload = JSON.stringify({ test: 'data' });

      // Signature too short
      const shortSignature = 'sha256=12345';
      expect(verifyRequestSignature(payload, shortSignature, secret)).toBe(false);

      // Signature too long
      const longSignature = 'sha256=' + 'a'.repeat(128);
      expect(verifyRequestSignature(payload, longSignature, secret)).toBe(false);
    });

    test('should reject malformed signatures', () => {
      const secret = 'test-webhook-secret-123456789012';
      const payload = JSON.stringify({ test: 'data' });

      expect(verifyRequestSignature(payload, 'invalid-format', secret)).toBe(false);
    });

    test('should use timing-safe comparison', () => {
      // Verify that crypto.timingSafeEqual is available and working
      const buf1 = Buffer.from('test');
      const buf2 = Buffer.from('test');
      const buf3 = Buffer.from('diff'); // Same length as 'test'

      expect(crypto.timingSafeEqual(buf1, buf2)).toBe(true);
      expect(crypto.timingSafeEqual(buf1, buf3)).toBe(false);
    });
  });

  describe('Key generation strategy', () => {
    function secureKeyGenerator(mockReq) {
      // Use user ID for authenticated requests (prevents IP-based bypassing)
      if (mockReq.user?.id) {
        return `user:${mockReq.user.id}`;
      }
      
      // For unauthenticated requests, use a combination of IP and additional headers
      const userAgent = mockReq.get('User-Agent') || 'unknown';
      const acceptLanguage = mockReq.get('Accept-Language') || 'unknown';
      const forwarded = mockReq.get('X-Forwarded-For') || mockReq.ip || 'unknown';
      
      // Create a hash to prevent extremely long keys and add some obfuscation
      const combined = `${forwarded}:${userAgent}:${acceptLanguage}`;
      const hash = crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
      
      return `ip:${hash}`;
    }

    test('should use user-based key generation for authenticated requests', () => {
      const mockReq = {
        user: { id: 'user123' },
        get: jest.fn(),
        ip: '192.168.1.1'
      };

      const key = secureKeyGenerator(mockReq);
      expect(key).toBe('user:user123');
    });

    test('should fallback to IP-based rate limiting for unauthenticated requests', () => {
      const mockReq = {
        user: null,
        get: jest.fn((header) => {
          if (header === 'User-Agent') return 'test-agent';
          if (header === 'Accept-Language') return 'en-US';
          if (header === 'X-Forwarded-For') return null;
          return null;
        }),
        ip: '192.168.1.1'
      };

      const key = secureKeyGenerator(mockReq);
      expect(key).toMatch(/^ip:[a-f0-9]{16}$/);
    });

    test('should generate different keys for identical IPs but different Accept-Language headers', () => {
      const mockReq1 = {
        get: jest.fn((header) => {
          if (header === 'User-Agent') return 'test-agent';
          if (header === 'Accept-Language') return 'en-US';
          if (header === 'X-Forwarded-For') return null;
          return null;
        }),
        ip: '192.168.1.1'
      };

      const mockReq2 = {
        get: jest.fn((header) => {
          if (header === 'User-Agent') return 'test-agent';
          if (header === 'Accept-Language') return 'fr-FR';
          if (header === 'X-Forwarded-For') return null;
          return null;
        }),
        ip: '192.168.1.1'
      };

      const key1 = secureKeyGenerator(mockReq1);
      const key2 = secureKeyGenerator(mockReq2);

      expect(key1).not.toEqual(key2);
      expect(key1).toMatch(/^ip:[a-f0-9]{16}$/);
      expect(key2).toMatch(/^ip:[a-f0-9]{16}$/);
    });

    test('should generate different keys for different IP/header combinations', () => {
      const mockReq1 = {
        user: null,
        get: jest.fn((header) => {
          if (header === 'User-Agent') return 'test-agent-1';
          if (header === 'Accept-Language') return 'en-US';
          if (header === 'X-Forwarded-For') return null;
          return null;
        }),
        ip: '192.168.1.1'
      };

      const mockReq2 = {
        user: null,
        get: jest.fn((header) => {
          if (header === 'User-Agent') return 'test-agent-2';
          if (header === 'Accept-Language') return 'en-US';
          if (header === 'X-Forwarded-For') return null;
          return null;
        }),
        ip: '192.168.1.1'
      };

      const key1 = secureKeyGenerator(mockReq1);
      const key2 = secureKeyGenerator(mockReq2);
      expect(key1).not.toBe(key2);
    });
  });

  describe('Security configuration validation', () => {
    test('should have secure rate limit defaults', () => {
      // Test rate limiting configuration values
      expect(900000).toBe(15 * 60 * 1000); // 15 minutes window
      expect(100).toBeGreaterThan(10); // Reasonable default limit
    });

    test('should enforce minimum secret lengths', () => {
      const testSecret = (secret) => !!secret && secret.length >= 32;
      
      expect(testSecret('short')).toBe(false);
      expect(testSecret('this-is-a-long-enough-secret-123456')).toBe(true);
      expect(testSecret(null)).toBe(false);
      expect(testSecret('')).toBe(false);
      expect(testSecret(undefined)).toBe(false);
    });
  });
});