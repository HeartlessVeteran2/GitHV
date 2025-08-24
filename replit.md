# Overview

GitHV is a streamlined, tablet-optimized web-based IDE designed as a personal development environment. This private coding workspace provides essential development tools including Gemini AI-powered code assistance, Git integration, file management, terminal access, and mobile-first touch interactions. The application has been modernized with a cleaner tech stack, essential workflows only, and improved development tooling for better maintainability and performance.

# User Preferences

Preferred communication style: Simple, everyday language.
App Purpose: Personal development environment - not for public sharing or distribution.
Focus: Simplicity, performance, and essential features only.

# System Architecture

## Frontend Architecture
- **React-based SPA**: Built with React 19, TypeScript, and Vite.
- **Component Library**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible UI.
- **Styling**: Tailwind CSS 4 with modern design system and PostCSS integration.
- **State Management**: TanStack Query for server state, local React state for UI state.
- **Routing**: Wouter for lightweight client-side routing.
- **Monaco Editor**: Full-featured code editor with syntax highlighting and IntelliSense support.
- **UI/UX Decisions**: Android Studio-inspired layout with resizable panels, multi-tab code editor, and professional IDE color schemes optimized for mobile and desktop.

## Backend Architecture
- **Express.js API**: RESTful API server with TypeScript support.
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations.
- **Session Management**: Express sessions with PostgreSQL session store for persistent user sessions.
- **Authentication**: Replit's OpenID Connect (OIDC) authentication system with Passport.js integration.
- **WebSocket Support**: WebSocket server for real-time features like terminal sessions and collaborative editing.

## Database Design
- **Users Table**: Stores user profiles with GitHub access tokens.
- **Repositories Table**: Caches GitHub repository metadata.
- **Files Table**: Stores cached file content with path-based organization and change tracking.
- **Sessions Table**: Secure session storage for Replit Auth integration.

## File Management System
- **GitHub Integration**: Direct integration with GitHub API for repository access and operations.
- **Content Caching**: Local database cache of file contents for performance.
- **Path-based Organization**: Hierarchical file structure mirroring repository directories.
- **Change Tracking**: File modification detection and sync status management.

## System Design Choices
- **Simplified Architecture**: Focus on essential features with clean, maintainable code.
- **Modern Tooling**: Latest versions of React, TypeScript, and build tools for better performance.
- **Streamlined Workflows**: Only essential CI/CD workflows for security and basic testing.
- **Performance First**: Optimized bundle sizes and efficient resource loading.
- **Mobile-Responsive**: Touch-friendly interface that works across devices.
- **Essential AI Integration**: Gemini AI for code assistance without overwhelming complexity.

# External Dependencies

## Core Services
- **Replit Authentication**: OIDC-based authentication system.
- **GitHub API**: For repository access, file operations, and Git history.
- **Neon Database**: PostgreSQL database hosting.

## Development Tools
- **Vite**: Build tool and development server.
- **Monaco Editor**: VS Code editor engine.
- **Drizzle ORM**: Type-safe database toolkit.
- **TanStack Query**: Server state management and caching library.

## UI/UX Libraries
- **Radix UI**: Headless UI components.
- **Tailwind CSS 4**: Utility-first CSS framework with modern features.
- **Lucide Icons**: Icon library.
- **Wouter**: Lightweight routing solution.

## Quality Assurance
- **ESLint & Prettier**: Code quality and formatting.
- **Jest**: Testing framework.
- **TypeScript**: Static type checking.

## Runtime Dependencies
- **Node.js**: Runtime environment.
- **WebSocket**: For real-time communication.
- **Passport.js**: Authentication middleware.
- **Express Session**: Session management.