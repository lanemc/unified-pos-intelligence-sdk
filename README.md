# Unified POS Intelligence SDK

A comprehensive SDK hybrid iframe solution that combines operational alerts, AI agent intelligence, and reputation management for Point of Sale (POS) companies.

## 🚀 Features

- **Operational Alerts** - Real-time alerts for POS systems
- **AI Agent Intelligence** - Three AI-powered agents for business insights
  - Business Sentiment Agent
  - Competitor Sentiment Agent  
  - Reddit Rooter Agent
- **Reputation Management** - Comprehensive sentiment analysis and response management

## 📁 Project Structure

This is a monorepo containing:
- `packages/sdk` - The lightweight JavaScript SDK (~50KB gzipped)
- `packages/iframe` - The secure iframe application (Next.js)
- `packages/demo` - Interactive POS demo environment

## 🎮 Demo Environment

Experience the full integration with our interactive POS demo:

### Quick Start
```bash
# Install dependencies
npm install

# Start all development servers (automatically finds available ports)
npm run dev

# Or kill any existing processes and start fresh
npm run kill-ports && npm run dev
```

The startup script automatically finds available ports and starts:
- **Demo POS App**: Interactive POS interface
- **Iframe App**: Unified Intelligence interface  
- **SDK**: Builds in watch mode

🎯 **The demo will show you the exact URLs once started!**

### Demo Features

**🏪 Realistic POS Environment**
- Top navigation with merchant switcher
- Side navigation (Dashboard, Sales, Inventory, Reviews, etc.)
- Multiple demo merchants (Restaurant, Dispensary, Retail, Convenience)
- Real order management and customer data

**🎯 Interactive Scenarios**
- **Morning Rush**: Simulate high order volume alerts
- **Negative Review**: Trigger review response workflows  
- **Competitor Alert**: Show competitive intelligence
- **Low Inventory**: Demonstrate operational alerts

**🔌 Live SDK Integration**
- Toggle SDK on/off to see the difference
- View actual integration code snippets
- Copy-to-clipboard functionality
- Real postMessage communication

**📊 Unified Intelligence Iframe**
- Tabbed interface (Dashboard, Alerts, Sentiment, etc.)
- Real-time alert system
- Brand-consistent design
- Responsive layout

### Demo Merchants

1. **Bella's Bistro** (Restaurant) - San Francisco, CA
2. **Green Leaf Dispensary** (Cannabis) - Denver, CO  
3. **Urban Threads** (Retail) - New York, NY
4. **Quick Stop Market** (Convenience) - Chicago, IL

## 🛠 Development

### Flexible Port System

The development environment automatically finds available ports starting from 3000. No more port conflicts!

**Available Scripts:**
```bash
# Smart startup (finds available ports automatically)
npm run dev

# Kill any processes on common ports 
npm run kill-ports

# Find available ports manually
npm run find-ports

# Individual packages (using environment variables)
npm run dev:sdk
npm run dev:iframe  
npm run dev:demo

# Legacy parallel startup (may have port conflicts)
npm run dev:old
```

**Environment Variables:**
```bash
DEMO_PORT=3000          # Demo POS app port
IFRAME_PORT=3001        # Iframe app port  
SDK_PORT=5173          # SDK build server port
NEXT_PUBLIC_IFRAME_URL # Automatically set by startup script
```

### Building
```bash
# Build all packages
npm run build

# Individual builds
npm run build:sdk
npm run build:iframe
npm run build:demo
```

### Testing
```bash
# Run all tests
npm test

# SDK tests only
npm run test --workspace=@company/pos-intelligence-sdk

# Watch mode
npm run test:watch
```

## 🧪 Testing Philosophy

This project follows Test-Driven Development (TDD):
- ✅ Unit tests with Vitest  
- ✅ Integration tests with Testing Library
- ✅ E2E tests with Playwright
- ✅ All core SDK functionality tested

## 🏗 Technology Stack

- **Frontend**: Web Components with Shadow DOM for encapsulation
- **UI Framework**: React 18+ with Next.js for iframe content  
- **Communication**: PostMessage API with origin validation
- **State Management**: Zustand for demo state
- **Bundling**: Vite for SDK, Next.js for apps
- **Languages**: TypeScript for type safety
- **Testing**: Vitest, Playwright
- **Styling**: Tailwind CSS with shadcn/ui components

## 🔐 Security

- Iframe sandboxing with CSP headers
- Origin validation for postMessage
- API key format validation
- No real merchant data in demo

## 📈 Integration Example

```typescript
import { UnifiedPOSIntelligence } from '@company/unified-pos-intelligence';

const sdk = new UnifiedPOSIntelligence();

await sdk.init({
  containerId: 'intelligence-container',
  apiKey: 'pk_live_your_key_here',
  features: {
    alerts: true,
    businessSentiment: true,
    competitorAnalysis: true,
    redditMonitoring: true
  }
});

// Trigger scenarios (demo only)
sdk.triggerScenario('morning-rush');
```

## 🚢 Deployment

The demo environment can be deployed to:
- **Vercel** (recommended for Next.js apps)
- **Netlify** 
- **Any static hosting** for the built SDK

## 📄 License

This project is proprietary software for demonstration purposes.