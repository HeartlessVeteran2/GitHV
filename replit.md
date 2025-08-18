# Overview

GitHV is a comprehensive tablet-optimized web-based IDE designed as a personal development environment. This private coding workspace provides extensive development tools including Gemini 2.5 Pro AI-powered code assistance, real-time collaboration, advanced Git integration, a floating AI assistant, mobile-first touch interactions, and a dedicated browser-optimized web viewer for the code space. It delivers a full-featured development experience with syntax highlighting, file management, terminal access, professional IDE features, and resource-efficient web preview capabilities, all optimized for touch interfaces across phones, tablets, and desktops as a personal workspace. Its business vision is to provide a fully integrated and personal coding solution that adapts seamlessly to various device form factors, maximizing productivity and minimizing context switching for developers on the go.

# User Preferences

Preferred communication style: Simple, everyday language.
App Purpose: Personal development environment - not for public sharing or distribution.

# System Architecture

## Frontend Architecture
- **React-based SPA**: Built with React 18, TypeScript, and Vite.
- **Component Library**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible UI.
- **Styling**: Tailwind CSS with a custom dark theme design system.
- **State Management**: TanStack Query for server state, local React state for UI state.
- **Routing**: Wouter for lightweight client-side routing.
- **Monaco Editor**: Full-featured code editor with syntax highlighting and IntelliSense support.
- **UI/UX Decisions**: Android Studio-inspired layout with resizable panels, multi-tab code editor, and professional IDE color schemes. It includes an advanced touch bar, intelligent gesture system, and adaptive interface for mobile and tablet optimization, alongside dynamic CSS variables for device detection.

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
- **Device-Adaptive Interface**: Intelligent device detection automatically identifies phone, tablet, or desktop mode, with responsive layout and phone-first optimizations.
- **Resource-Optimized Web Viewer**: Lightweight embedded browser for code space preview with device emulation, smart navigation, and developer tools.
- **AI Integration**: Gemini 2.5 Pro AI powers code assistance, real-time analysis, completions, refactoring, bug fixes, and test generation via a context-aware floating assistant and dedicated panel.
- **Real-Time Collaboration**: WebSocket-based live code synchronization and cursor position sharing.
- **Touch-Optimized Interface**: Responsive design with touch-specific features like a floating touch toolbar, intelligent gesture system, and mobile-optimized file manager.

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
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide Icons**: Icon library.
- **Wouter**: Lightweight routing solution.

## Runtime Dependencies
- **Node.js**: Runtime environment.
- **WebSocket**: For real-time communication.
- **Passport.js**: Authentication middleware.
- **Express Session**: Session management.