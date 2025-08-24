import { z } from 'zod';

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(65535)),
  DATABASE_URL: z.string().url('Invalid database URL'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  GITHUB_CLIENT_ID: z.string().min(1, 'GitHub Client ID is required'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GitHub Client Secret is required'),
  GEMINI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((val) => parseInt(val, 10)),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(): Environment {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional custom validations
    if (env.NODE_ENV === 'production') {
      if (env.SESSION_SECRET === 'dev-session-secret') {
        throw new Error('Production environment cannot use default session secret');
      }
      
      if (!env.DATABASE_URL.includes('ssl=true') && !env.DATABASE_URL.includes('localhost')) {
        console.warn('Warning: Production database connection may not be using SSL');
      }
    }
    
    if (env.NODE_ENV === 'development') {
      console.log('🔧 Development environment detected');
      if (env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1')) {
        console.log('📍 Using local database');
      }
    }
    
    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    
    if (error instanceof z.ZodError) {
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
    } else if (error instanceof Error) {
      console.error(`  - ${error.message}`);
    } else {
      console.error(`  - Unknown error: ${String(error)}`);
    }
    
    console.error('\n💡 Create a .env file with the required environment variables.');
    console.error('📖 See README.md for setup instructions.');
    
    process.exit(1);
  }
}

export function printEnvironmentInfo(env: Environment): void {
  console.log('🌍 Environment Configuration:');
  console.log(`  - Mode: ${env.NODE_ENV}`);
  console.log(`  - Port: ${env.PORT}`);
  console.log(`  - Database: ${env.DATABASE_URL.split('@')[1] || 'configured'}`);
  console.log(`  - GitHub OAuth: ${env.GITHUB_CLIENT_ID ? '✅' : '❌'}`);
  console.log(`  - Gemini AI: ${env.GEMINI_API_KEY ? '✅' : '❌ (optional)'}`);
  console.log(`  - Redis: ${env.REDIS_URL ? '✅' : '❌ (using memory store)'}`);
  console.log(`  - Log Level: ${env.LOG_LEVEL}`);
}