# Copilot Instructions for GitHV

## Repository Overview

GitHV is a **personal web-based IDE** designed for tablet-optimized development. It provides a streamlined coding environment with AI-powered assistance, Git integration, and mobile-first touch interactions.

**Project Type**: Full-stack TypeScript web application  
**Size**: ~971 npm packages, moderate complexity monorepo  
**Target Runtime**: Node.js 20+, modern browsers  

### Technology Stack

**Frontend**: React 19 + TypeScript, Vite build system, Tailwind CSS 4 with shadcn/ui components, Monaco Editor, TanStack Query for state management, Wouter routing

**Backend**: Express.js + TypeScript, Drizzle ORM with PostgreSQL, GitHub OAuth authentication, WebSocket support, Gemini AI integration

**Infrastructure**: PostgreSQL database (Neon hosting), Docker containerization, Redis optional for sessions, comprehensive GitHub Actions CI/CD

**Development Tools**: ESLint + Prettier, Jest testing, TypeScript compiler, tsx for development server

## Build & Validation Instructions

### Prerequisites
- **Node.js 20 or higher** (tested on 20.x and 22.x)
- **PostgreSQL database** (local or hosted)
- **GitHub OAuth app** for authentication
- **Gemini API key** (optional, for AI features)

### Essential Build Sequence

**ALWAYS** run commands in this exact order for reliable builds:

1. **Bootstrap**: `npm ci` (never use `npm install` - dependencies are sensitive)
2. **Type Check**: `npm run type-check` 
3. **Lint**: `npm run lint` (⚠️ Currently has 316 issues - see Known Issues)
4. **Test**: `npm test` (requires DATABASE_URL environment variable)
5. **Build**: `npm run build` (⚠️ Has Tailwind warnings but succeeds)

### Development Workflow
```bash
# Start development (with hot-reload)
npm run dev

# Run tests in watch mode
npm run test:watch

# Format code
npm run format

# Database operations
npm run db:push     # Push schema changes
npm run db:generate # Generate migrations
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - **Required**: PostgreSQL connection string
- `SESSION_SECRET` - **Required**: 32+ character random string for production
- `GITHUB_CLIENT_ID/SECRET` - **Required**: OAuth app credentials  
- `GEMINI_API_KEY` - Optional: For AI code assistance
- `REDIS_URL` - Optional: For session storage (uses memory store otherwise)

**Critical**: The application has strict environment validation and will exit with helpful error messages if misconfigured.

### Known Issues & Workarounds

**Linting Issues** (316 problems): The codebase currently has extensive ESLint issues including:
- TypeScript `any` types throughout codebase
- Unused variables and imports
- React accessibility violations
- Tests still pass despite linting failures

**Build Warnings**:
- Tailwind CSS error: `focus:ring-blue-500/50` class not recognized (build succeeds anyway)
- Large bundle warning: 562KB chunk size (consider code-splitting)

**Security Vulnerabilities**: 4 moderate esbuild vulnerabilities in drizzle-kit dependency (development-only, safe for production)

**Database**: PostgreSQL must be running and accessible for tests and development. Tests use `DATABASE_URL` environment variable.

### Docker Development
```bash
# Full environment with database
docker-compose up

# Development with hot-reload
docker-compose --profile dev up githv-dev
```

## Project Architecture & Layout

### Directory Structure
```
GitHV/
├── .github/workflows/     # 7 comprehensive CI/CD workflows
├── client/               # React frontend application  
│   ├── src/
│   │   ├── components/   # React UI components
│   │   ├── pages/       # Route components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Client utilities
├── server/              # Express.js backend
│   ├── routes/          # API route handlers
│   ├── environment.ts   # Environment validation (Zod-based)
│   ├── storage.ts       # Database operations
│   └── index.ts         # Main server entry point
├── shared/              # Shared TypeScript schemas
│   └── schema.ts        # Drizzle database schema
├── tests/               # Jest test suite
├── public/              # Static assets
└── dist/                # Build output (generated)
```

### Key Configuration Files

**Build & Development**:
- `package.json` - All scripts, dependencies, Node.js 20+ requirement
- `vite.config.ts` - Frontend build configuration, path aliases
- `tsconfig.json` + `tsconfig.server.json` - TypeScript configurations

**Code Quality**:
- `eslint.config.js` - ESLint with React/TypeScript rules (currently has many violations)
- `.prettierrc` - Code formatting rules
- `jest.config.cjs` - Test configuration with ts-jest

**Database**:
- `drizzle.config.ts` - ORM configuration, requires DATABASE_URL
- `shared/schema.ts` - Database schema definitions

**Infrastructure**:
- `Dockerfile` - Multi-stage production build with security hardening
- `docker-compose.yml` - Full development environment with PostgreSQL/Redis
- `.env.example` - Comprehensive environment variable template

### CI/CD Workflows

The repository has 7 comprehensive workflows:

1. **CI** (`ci.yml`) - Tests on Node 20.x/22.x with PostgreSQL service, coverage reporting
2. **Security Scanning** (`security-scan.yml`) - Automated vulnerability detection  
3. **Deployment** (`deploy.yml`) - Staging/production deployment automation
4. **Lighthouse** (`lighthouse.yml`) - Performance monitoring with `.lighthouserc.json`
5. **Performance Testing** (`performance.yml`) - Bundle analysis and memory benchmarks
6. **Release Automation** (`release.yml`) - GitHub releases with changelog generation
7. **Docker Build** (`docker.yml`) - Multi-architecture container builds

**Validation Steps**: All workflows run type-check, lint, format-check, tests, and build. The CI requires PostgreSQL service for database tests.

### API Architecture

**Authentication**: GitHub OAuth with session-based auth, stored in PostgreSQL or Redis

**Key Endpoints**:
- `/api/auth/*` - GitHub OAuth flow
- `/api/repositories` - Git repository management  
- `/api/files/*` - File operations
- `/api/ai/*` - Gemini AI code assistance
- `/api/health` - Health check endpoint

**WebSocket**: Real-time features supported via ws library

### Dependencies & Important Notes

**Critical Dependencies**:
- React 19 (latest) with TypeScript
- Express 5.x for backend API
- Drizzle ORM for type-safe database operations  
- Monaco Editor for code editing interface
- Tailwind CSS 4 (beta) for styling

**Development Dependencies**: tsx for dev server, esbuild for production builds, comprehensive tooling

**Runtime Requirements**: The application validates environment on startup and provides detailed error messages for missing requirements.

## Agent Instructions

**Trust these instructions** - they are based on comprehensive analysis of the actual codebase state. Only explore further if you encounter instructions that are incomplete or incorrect.

**Key Principles**:
1. Always run `npm ci` before any build operations
2. Expect linting failures (they don't break functionality)
3. Environment setup is critical - use `.env.example` as template
4. Database must be available for tests and development
5. Build warnings about Tailwind/bundle size are non-fatal
6. The codebase uses strict TypeScript but has many `any` types in practice

**For Database Changes**: Use Drizzle migrations via `npm run db:generate` and `npm run db:push`

**For UI Changes**: Components use shadcn/ui system with Tailwind CSS - be aware of current CSS class issues

**For Testing**: Jest tests require proper environment setup but are comprehensive and reliable