# Overview

GitHV is a comprehensive tablet-optimized web-based IDE that serves as a superior alternative to traditional codespaces for tablets and mobile devices. The application integrates with GitHub and provides extensive development tools including Gemini 2.5 Pro AI-powered code completion, real-time collaboration, advanced Git integration, voice commands, performance monitoring, and mobile-first touch interactions. It delivers a full-featured development experience with syntax highlighting, file management, terminal access, and Git operations, all optimized for touch interfaces across phones, tablets, and desktops.

## Recent Major Updates (January 16, 2025)

### GitHub Copilot Functions Implementation (Latest Update)
- **Full GitHub Copilot Integration**: Complete AI-powered coding assistant with Gemini 2.5 Pro backend
- **Real-Time Code Suggestions**: Intelligent code completions, refactoring, and bug fixes with confidence scoring
- **Interactive AI Chat**: Context-aware programming assistant with code analysis and explanations
- **Automated Code Analysis**: Live quality scoring, complexity analysis, and issue detection
- **Smart Test Generation**: AI-powered unit test creation for any codebase
- **Multi-Modal AI Assistant**: Suggestions, chat, analysis, and quick actions in unified interface
- **Context-Aware Completions**: File-aware suggestions with cursor position and selection context
- **Instant Code Refactoring**: One-click code improvements and optimization suggestions
- **Bug Detection & Fixes**: Proactive issue identification with automated correction proposals
- **Code Explanation Engine**: Natural language explanations for complex code segments

### Advanced Feature Implementation
- **Gemini 2.5 Pro AI Integration**: Full AI-powered code assistance with intelligent completions, analysis, documentation generation, and code refactoring
- **Mobile-First Responsive Design**: Adaptive interface that scales from phone to tablet to desktop with optimized touch interactions
- **Comprehensive GitHub Integration**: Full GitHub website functionality including pull requests, issues, releases, repository statistics, and collaboration tools
- **AI-Powered Code Editor**: Real-time code analysis, quality scoring, test generation, and intelligent suggestions
- **Mobile Code Editor**: Touch-optimized Monaco editor with mobile-friendly shortcuts and gestures
- **Device-Adaptive Interface**: Automatic detection and optimization for phone, tablet, and desktop modes
- **Advanced GitHub Dashboard**: Complete repository management with statistics, contributors, and project insights

### Enhanced Editor Capabilities
- **Split View**: Side-by-side file editing with independent scrolling
- **Monaco Editor Integration**: Full VS Code editor engine with IntelliSense
- **Advanced Keyboard Shortcuts**: Professional-grade key bindings
- **Dynamic Code Analysis**: Real-time syntax checking and error detection
- **Customizable UI**: Resizable panels and workspace personalization

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React-based SPA**: Built with React 18, TypeScript, and Vite for fast development and hot module replacement
- **Component Library**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible UI elements
- **Styling**: Tailwind CSS with custom design system featuring dark theme optimized for coding environments
- **State Management**: TanStack Query (React Query) for server state management, local React state for UI state
- **Routing**: Wouter for lightweight client-side routing
- **Monaco Editor**: Full-featured code editor with syntax highlighting and IntelliSense support

## Backend Architecture
- **Express.js API**: RESTful API server with TypeScript support
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store for persistent user sessions
- **Authentication**: Replit's OpenID Connect (OIDC) authentication system with Passport.js integration
- **WebSocket Support**: WebSocket server setup for real-time features like terminal sessions

## Database Design
- **Users Table**: Stores user profiles with GitHub access tokens for API integration
- **Repositories Table**: Cached GitHub repository metadata with sync timestamps
- **Files Table**: File content cache with path-based organization and change tracking
- **Sessions Table**: Secure session storage required for Replit Auth integration

## File Management System
- **GitHub Integration**: Direct integration with GitHub API for repository access and file operations
- **Content Caching**: Local database cache of file contents for offline editing and performance
- **Path-based Organization**: Hierarchical file structure mirroring repository directory structure
- **Change Tracking**: File modification detection and sync status management

## Touch-Optimized Interface
- **Responsive Design**: Mobile-first design with tablet-specific optimizations
- **Touch Toolbar**: Floating action buttons for common operations on mobile devices
- **Command Palette**: Keyboard shortcut alternative accessible via search interface
- **Resizable Panels**: Flexible layout with collapsible sidebar and terminal panels

## Development Workflow
- **Hot Reloading**: Vite development server with fast refresh for rapid iteration
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Quality**: ESLint and TypeScript compiler checks for code consistency
- **Build Process**: Production builds with code splitting and optimization

# External Dependencies

## Core Services
- **Replit Authentication**: OIDC-based authentication system for user management and session handling
- **GitHub API**: Repository access, file operations, and Git history via Octokit REST client
- **Neon Database**: PostgreSQL database hosting with connection pooling support

## Development Tools
- **Vite**: Build tool and development server with React plugin
- **Monaco Editor**: VS Code editor engine for code editing capabilities
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **TanStack Query**: Server state management and caching library

## UI/UX Libraries
- **Radix UI**: Headless UI components for accessibility and keyboard navigation
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Icon library for consistent visual elements
- **Wouter**: Lightweight routing solution for single-page application navigation

## Runtime Dependencies
- **Node.js**: Runtime environment with ES modules support
- **WebSocket**: Real-time communication for terminal and collaborative features
- **Passport.js**: Authentication middleware for OIDC integration
- **Express Session**: Session management with PostgreSQL store backend