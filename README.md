# GitHV - Personal Web-Based IDE

A streamlined, tablet-optimized web-based IDE designed as a personal development environment. This private coding workspace provides essential development tools including AI-powered code assistance, Git integration, and mobile-first touch interactions.

![GitHV IDE Interface](https://img.shields.io/badge/Platform-Web-blue) ![React](https://img.shields.io/badge/React-19-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Node.js](https://img.shields.io/badge/Node.js-22-339933)

## 🚀 Features

### Core IDE Capabilities
- **Professional Code Editor**: Monaco Editor with VS Code-like experience
- **Multi-Language Support**: Syntax highlighting for JavaScript, TypeScript, Python, and more
- **File Management**: Complete file operations with auto-save functionality
- **Interactive Terminal**: Full command-line interface with history and auto-complete
- **Git Integration**: Version control with commit, push, pull, and branch management
- **CLI Integration**: Google Cloud CLI, GitHub CLI, and Gemini AI CLI support

### AI-Powered Development
- **Gemini 2.5 Pro Integration**: Advanced AI coding assistance
- **Smart Code Suggestions**: Real-time completions and refactoring
- **Context-Aware Chat**: AI assistant with code understanding
- **Code Analysis**: Quality scoring and complexity analysis
- **Test Generation**: Automated unit test creation
- **CLI AI Commands**: Terminal-based AI operations (explain, analyze, test generation)

### Mobile-First Design
- **Touch-Optimized Interface**: Responsive design from phone to desktop
- **Advanced Touch Bar**: Fixed bottom bar with expandable quick actions
- **Smart Gestures**: Multi-finger swipes, pinch-to-zoom, double-tap to run
- **Device Awareness**: Battery monitoring, network status, orientation detection
- **Haptic Feedback**: Subtle vibrations for touch interactions

### Web Development Tools
- **Browser-Dedicated Web Viewer**: Resource-optimized preview with device emulation
- **Device Simulation**: Desktop, tablet, and mobile viewport presets
- **Live Preview**: Real-time web application testing
- **Source Code View**: HTML inspection and debugging tools

### CLI Integration
- **Google Cloud CLI**: Secure access to gcloud commands for project management, compute resources, and service monitoring
- **GitHub CLI**: Direct integration with gh commands for repository management, issues, PRs, and workflows
- **Gemini AI CLI**: Terminal-based AI commands for code analysis, explanation, test generation, and documentation
- **Security Controls**: Command whitelisting, input sanitization, and read-only operation enforcement

## 🛠 Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS 4** with shadcn/ui components
- **Monaco Editor** for code editing
- **TanStack Query** for state management
- **Wouter** for client-side routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **GitHub OAuth** authentication
- **WebSocket** support for real-time features
- **Gemini AI** integration

### Infrastructure
- **PostgreSQL** database with Neon hosting
- **Session management** with PostgreSQL store
- **GitHub API** integration for repository access
- **Self-hosted** deployment options

### Development Tools
- **ESLint & Prettier** for code quality
- **Jest** for testing
- **TypeScript** for type safety
- **Streamlined CI/CD** with essential workflows only

## 🚦 Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database
- GitHub account for authentication
- Gemini API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/githv.git
   cd githv
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Database
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # Authentication
   SESSION_SECRET=your-session-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # AI Integration
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run audit` - Check for security vulnerabilities

## 📱 Mobile Usage

GitHV is optimized for mobile and tablet use:

### Touch Gestures
- **Double-tap**: Run code
- **Two-finger swipe left**: Open file tree
- **Two-finger swipe right**: Open terminal
- **Pinch to zoom**: Adjust editor zoom
- **Long press**: Context menu

### Mobile Features
- **Auto-save**: Automatic saving every 30 seconds
- **Battery awareness**: Reduced animations on low battery
- **Network detection**: Offline mode indicators
- **Screen wake lock**: Prevents screen timeout during coding

## 🔧 CLI Usage

GitHV includes integrated CLI tools accessible through the terminal:

### Google Cloud CLI
```bash
# List projects
gcloud projects list

# Show compute instances
gcloud compute instances list

# List storage buckets
gcloud storage buckets list

# Show configuration
gcloud config list

# Get help
gcloud help
```

### GitHub CLI
```bash
# List repositories
gh repo list

# Show repository info
gh repo view owner/repo

# List issues
gh issue list

# Show pull requests
gh pr list

# Check authentication
gh auth status

# Get help
gh help
```

### Gemini AI CLI
```bash
# Explain current code
gemini explain

# Analyze code quality
gemini analyze

# Generate unit tests
gemini test

# Generate documentation
gemini docs

# Get help
gemini help
```

**Security Note**: Only read-only commands are allowed for security. All commands are filtered and sanitized.

## 🔧 Configuration

### Editor Settings
The Monaco editor supports VS Code keybindings and can be customized:
- Theme switching (light/dark)
- Font size and family
- Tab size and indentation
- Keyboard shortcuts

### AI Assistant
Configure AI personalities and behavior:
- Code style preferences
- Suggestion frequency
- Language-specific settings
- Context awareness level

## 🚀 Deployment

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Deploy to your preferred hosting platform (Vercel, Netlify, Railway, etc.)

### Docker Deployment
1. Build the Docker image:
   ```bash
   docker build -t githv .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 --env-file .env githv
   ```

## 📖 API Documentation

### Authentication
Uses GitHub OAuth for secure authentication:
- `/api/login` - Initiate GitHub OAuth login flow
- `/api/logout` - Logout and clear session
- `/api/auth/user` - Get current user info
- `/api/auth/github/callback` - GitHub OAuth callback

### File Operations
- `GET /api/repositories` - List user repositories
- `GET /api/files/:repo` - Get repository files
- `POST /api/files` - Create/update file
- `DELETE /api/files/:id` - Delete file

### AI Features
- `POST /api/ai/suggest` - Get code suggestions
- `POST /api/ai/chat` - AI conversation
- `POST /api/ai/analyze` - Code analysis

### CLI Integration
- `POST /api/cli/execute` - Execute CLI commands (gcloud, gh, gemini)
- `GET /api/cli/help/:tool` - Get CLI tool help documentation
- `GET /api/cli/status` - Check CLI tool availability and versions

## 🤝 Contributing

This is a personal development environment project. While primarily designed for individual use, contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GitHub** for OAuth authentication and API integration
- **Google** for Gemini AI integration
- **Microsoft** for Monaco Editor
- **Vercel** for shadcn/ui components
- **The open-source community** for the amazing tools and libraries

## 📞 Support

For support and questions:
- Check the [Issues](https://github.com/Heartless-Veteran/GitHV/issues) page
- Create a new issue for bug reports or feature requests
- Review documentation and configuration guides

---

**GitHV** - Your personal coding companion, optimized for the modern developer workflow.