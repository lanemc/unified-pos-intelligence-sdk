# Unified POS Intelligence SDK

A comprehensive SDK hybrid iframe solution that combines operational alerts, AI agent intelligence, and reputation management for Point of Sale (POS) companies.

## Features

- **Operational Alerts** - Real-time alerts for POS systems
- **AI Agent Intelligence** - Three AI-powered agents for business insights
  - Business Sentiment Agent
  - Competitor Sentiment Agent
  - Reddit Rooter Agent
- **Reputation Management** - Comprehensive sentiment analysis and response management

## Project Structure

This is a monorepo containing:
- `packages/sdk` - The lightweight JavaScript SDK (~50KB gzipped)
- `packages/iframe` - The secure iframe application (Next.js)

## Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Testing

This project follows Test-Driven Development (TDD) practices:
- Unit tests with Vitest
- Integration tests with Testing Library
- E2E tests with Playwright

## Technology Stack

- **Frontend**: Web Components with Shadow DOM
- **UI Framework**: React 18+ with Next.js
- **Communication**: PostMessage API + WebSockets
- **Bundling**: Vite for SDK, Next.js for iframe
- **Languages**: TypeScript
- **Testing**: Vitest, Playwright
- **Styling**: Tailwind CSS