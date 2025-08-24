# Contributing to GitHV

Thank you for your interest in contributing to GitHV! This guide will help you get started.

## 🚀 Quick Start

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/GitHV.git
   cd GitHV
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🛠 Development Workflow

### Code Quality

Before submitting changes, ensure your code passes all checks:

```bash
# Run tests
npm test

# Check TypeScript
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Build project
npm run build
```

### Git Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a pull request

### Commit Convention

We use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📁 Project Structure

```
GitHV/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── environment.ts     # Configuration
├── shared/                # Shared types and schemas
├── tests/                 # Test files
├── .github/workflows/     # CI/CD workflows
└── docs/                  # Documentation
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Place tests in the `tests/` directory
- Use descriptive test names
- Group related tests with `describe()` blocks
- Test both happy path and edge cases
- Mock external dependencies

Example:
```javascript
describe('User authentication', () => {
  test('should authenticate valid user', () => {
    // Test implementation
  });
  
  test('should reject invalid credentials', () => {
    // Test implementation
  });
});
```

## 🎨 UI/UX Guidelines

- Follow mobile-first design principles
- Ensure accessibility (a11y) compliance
- Use consistent spacing and typography
- Support both light and dark themes
- Test on various screen sizes

## 🔒 Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Follow OWASP security guidelines

## 📝 Documentation

- Update README.md for significant changes
- Document new API endpoints
- Add JSDoc comments for complex functions
- Update environment variable documentation

## 🐛 Bug Reports

When reporting bugs:

1. Use the bug report template
2. Include steps to reproduce
3. Provide environment information
4. Include relevant logs or screenshots

## ✨ Feature Requests

For new features:

1. Use the feature request template
2. Explain the use case
3. Provide mockups if applicable
4. Consider implementation complexity

## 🚫 What NOT to contribute

- Breaking changes without discussion
- Features that don't align with project goals
- Code that doesn't follow style guidelines
- Changes without tests
- Large refactors without approval

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing with Jest](https://jestjs.io/docs/getting-started)

## 💬 Getting Help

- Open an issue for bugs or questions
- Join our discussions
- Check existing issues and PRs

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to GitHV! 🎉