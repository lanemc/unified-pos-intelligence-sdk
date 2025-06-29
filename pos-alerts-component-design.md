# POS-Embeddable Alerts Component Architecture

## Executive Summary

This document outlines the architecture for a secure, performant, and easily integrable alerts component designed for embedding within Point of Sale (POS) systems. The solution uses a hybrid approach combining iframe isolation for security with a lightweight JavaScript SDK for seamless integration.

## 1. Component Structure

### Hybrid Architecture: Iframe + SDK Pattern

```
┌─────────────────────────────────────────┐
│         POS Application                 │
│  ┌───────────────────────────────────┐  │
│  │    Alerts SDK (JavaScript)        │  │
│  │  - Lightweight wrapper            │  │
│  │  - API methods                    │  │
│  │  - Event handling                 │  │
│  └─────────────┬─────────────────────┘  │
│                │                        │
│  ┌─────────────▼─────────────────────┐  │
│  │    Iframe Container               │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Alerts Web Component      │  │  │
│  │  │  - Isolated environment     │  │  │
│  │  │  - Secure rendering         │  │  │
│  │  │  - State management         │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Why This Approach?

- **Security**: Iframe provides sandboxed environment, preventing CSS/JS conflicts
- **Flexibility**: SDK allows easy integration while maintaining control
- **Performance**: Lazy loading capabilities and minimal overhead
- **Compatibility**: Works across different POS architectures

## 2. API Surface Design

### SDK Initialization

```javascript
class POSAlertsSDK {
  constructor(config) {
    this.config = {
      apiKey: config.apiKey,
      environment: config.environment || 'production',
      container: config.container || 'body',
      position: config.position || 'top-right',
      theme: config.theme || 'auto',
      locale: config.locale || 'en-US',
      ...config
    };
  }

  async init() {
    // Validate configuration
    this.validateConfig();
    
    // Create iframe container
    this.createContainer();
    
    // Establish secure communication channel
    await this.establishConnection();
    
    // Authenticate
    await this.authenticate();
    
    return this;
  }
}
```

### Core API Methods

```javascript
// Alert Management
sdk.showAlert(alertData);
sdk.hideAlert(alertId);
sdk.clearAllAlerts();
sdk.updateAlert(alertId, updates);

// Configuration
sdk.setTheme(theme);
sdk.setPosition(position);
sdk.setLocale(locale);
sdk.updateConfig(config);

// State Management
sdk.getAlerts();
sdk.getUnreadCount();
sdk.markAsRead(alertId);
sdk.markAllAsRead();

// Subscription Management
sdk.subscribe(eventType, callback);
sdk.unsubscribe(eventType, callback);

// Lifecycle
sdk.pause();
sdk.resume();
sdk.destroy();
```

## 3. Authentication Flow

### Token-Based Authentication with Refresh

```javascript
class AuthenticationManager {
  constructor(apiKey, environment) {
    this.apiKey = apiKey;
    this.baseURL = this.getBaseURL(environment);
    this.token = null;
    this.refreshToken = null;
  }

  async authenticate() {
    try {
      // Initial authentication
      const response = await fetch(`${this.baseURL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          grant_type: 'api_key',
          scope: 'alerts:read alerts:write'
        })
      });

      const data = await response.json();
      
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      
      // Schedule token refresh
      this.scheduleTokenRefresh(data.expires_in);
      
      return this.token;
    } catch (error) {
      throw new AuthenticationError('Failed to authenticate', error);
    }
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: this.refreshToken
      })
    });

    const data = await response.json();
    this.token = data.access_token;
    
    return this.token;
  }
}
```

### Security Considerations

- API keys are never exposed in client-side code
- Tokens have short expiration times (15 minutes)
- Refresh tokens are securely stored and rotated
- All communication uses HTTPS
- CORS policies restrict origins

## 4. Event System and Callbacks

### PostMessage-Based Communication

```javascript
class EventBridge {
  constructor(iframe, origin) {
    this.iframe = iframe;
    this.origin = origin;
    this.listeners = new Map();
    this.messageQueue = [];
    
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  emit(event, data) {
    const message = {
      type: 'pos-alert-event',
      event,
      data,
      timestamp: Date.now(),
      id: this.generateId()
    };

    if (this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(message, this.origin);
    } else {
      this.messageQueue.push(message);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  handleMessage(event) {
    if (event.origin !== this.origin) return;
    if (event.data.type !== 'pos-alert-event') return;

    const listeners = this.listeners.get(event.data.event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event.data.data);
        } catch (error) {
          console.error('Event callback error:', error);
        }
      });
    }
  }
}
```

### Supported Events

```javascript
// Alert Events
'alert:shown'
'alert:hidden'
'alert:clicked'
'alert:dismissed'
'alert:action-clicked'

// State Events
'state:ready'
'state:loading'
'state:error'
'state:updated'

// User Events
'user:mark-read'
'user:mark-all-read'
'user:preference-changed'

// System Events
'connection:established'
'connection:lost'
'connection:restored'
'auth:expired'
'auth:refreshed'
```

## 5. Configuration Options

### Comprehensive Configuration Object

```javascript
const config = {
  // Authentication
  apiKey: 'your-api-key',
  environment: 'production', // 'production', 'staging', 'development'
  
  // Display
  container: '#alerts-container', // CSS selector or DOM element
  position: 'top-right', // 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'
  maxVisible: 3, // Maximum alerts shown simultaneously
  stackDirection: 'down', // 'up', 'down'
  
  // Appearance
  theme: {
    mode: 'auto', // 'light', 'dark', 'auto'
    customColors: {
      primary: '#007bff',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8'
    },
    fontFamily: 'inherit',
    borderRadius: '4px',
    shadow: 'medium' // 'none', 'small', 'medium', 'large'
  },
  
  // Behavior
  autoMarkAsRead: true,
  dismissTimeout: 5000, // ms, 0 for no auto-dismiss
  animationDuration: 300, // ms
  soundEnabled: false,
  vibrationEnabled: false,
  
  // Filtering
  alertTypes: ['order', 'payment', 'inventory', 'system'], // Filter by type
  priorities: ['high', 'medium', 'low'], // Filter by priority
  
  // Localization
  locale: 'en-US',
  translations: {
    // Custom translations
  },
  
  // Advanced
  retryPolicy: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  },
  requestTimeout: 30000,
  heartbeatInterval: 30000,
  offlineQueueSize: 100
};
```

## 6. State Management

### Centralized State Store

```javascript
class AlertStateManager {
  constructor() {
    this.state = {
      alerts: new Map(),
      unreadCount: 0,
      connectionStatus: 'disconnected',
      isAuthenticated: false,
      config: {},
      filters: {
        types: [],
        priorities: [],
        read: null
      }
    };
    
    this.subscribers = new Set();
  }

  // State mutations
  addAlert(alert) {
    this.state.alerts.set(alert.id, {
      ...alert,
      timestamp: Date.now(),
      read: false
    });
    
    if (!alert.read) {
      this.state.unreadCount++;
    }
    
    this.notifySubscribers('alert:added', alert);
  }

  updateAlert(alertId, updates) {
    const alert = this.state.alerts.get(alertId);
    if (alert) {
      const wasUnread = !alert.read;
      const updatedAlert = { ...alert, ...updates };
      
      this.state.alerts.set(alertId, updatedAlert);
      
      if (wasUnread && updatedAlert.read) {
        this.state.unreadCount--;
      } else if (!wasUnread && !updatedAlert.read) {
        this.state.unreadCount++;
      }
      
      this.notifySubscribers('alert:updated', updatedAlert);
    }
  }

  // State queries
  getVisibleAlerts() {
    const alerts = Array.from(this.state.alerts.values());
    
    return alerts
      .filter(alert => this.matchesFilters(alert))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, this.state.config.maxVisible);
  }

  // Persistence
  persist() {
    const serialized = {
      alerts: Array.from(this.state.alerts.entries()),
      unreadCount: this.state.unreadCount,
      filters: this.state.filters
    };
    
    localStorage.setItem('pos-alerts-state', JSON.stringify(serialized));
  }

  restore() {
    const stored = localStorage.getItem('pos-alerts-state');
    if (stored) {
      const data = JSON.parse(stored);
      this.state.alerts = new Map(data.alerts);
      this.state.unreadCount = data.unreadCount;
      this.state.filters = data.filters;
    }
  }
}
```

## 7. Error Handling and Recovery

### Comprehensive Error Strategy

```javascript
class ErrorHandler {
  constructor(sdk) {
    this.sdk = sdk;
    this.errorQueue = [];
    this.retryQueue = new Map();
  }

  handle(error, context) {
    // Categorize error
    const errorType = this.categorizeError(error);
    
    // Log error
    this.logError(error, context, errorType);
    
    // Execute recovery strategy
    switch (errorType) {
      case 'network':
        return this.handleNetworkError(error, context);
      case 'auth':
        return this.handleAuthError(error, context);
      case 'validation':
        return this.handleValidationError(error, context);
      case 'rate_limit':
        return this.handleRateLimitError(error, context);
      default:
        return this.handleGenericError(error, context);
    }
  }

  async handleNetworkError(error, context) {
    // Implement exponential backoff retry
    const retryKey = `${context.operation}-${Date.now()}`;
    const retryCount = this.retryQueue.get(retryKey) || 0;
    
    if (retryCount < this.sdk.config.retryPolicy.maxRetries) {
      const delay = this.calculateBackoff(retryCount);
      
      setTimeout(() => {
        this.retryQueue.set(retryKey, retryCount + 1);
        context.retry();
      }, delay);
      
      return { retry: true, delay };
    }
    
    // Max retries exceeded
    this.sdk.emit('error:network:fatal', { error, context });
    return { retry: false };
  }

  async handleAuthError(error, context) {
    try {
      // Attempt token refresh
      await this.sdk.auth.refreshAccessToken();
      
      // Retry original operation
      return context.retry();
    } catch (refreshError) {
      // Re-authenticate
      this.sdk.emit('auth:required');
      return { requiresAuth: true };
    }
  }

  // Graceful degradation
  enableOfflineMode() {
    this.sdk.state.set('mode', 'offline');
    this.sdk.emit('mode:offline');
    
    // Queue operations for later
    this.sdk.interceptor = (operation) => {
      this.sdk.offlineQueue.add(operation);
      return Promise.resolve({ offline: true });
    };
  }
}
```

### Error Recovery Patterns

```javascript
// Circuit Breaker Pattern
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'closed'; // 'closed', 'open', 'half-open'
    this.nextAttempt = Date.now();
  }

  async execute(operation) {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is open');
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

## 8. Performance Optimization

### Optimization Strategies

```javascript
class PerformanceOptimizer {
  constructor(sdk) {
    this.sdk = sdk;
    this.metrics = new Map();
  }

  // 1. Lazy Loading
  async lazyLoadComponent() {
    // Only load when first alert arrives
    this.sdk.on('alert:first', async () => {
      const module = await import('./alerts-component.js');
      this.sdk.component = new module.AlertsComponent();
    });
  }

  // 2. Request Batching
  batchRequests() {
    let pendingRequests = [];
    let batchTimeout = null;

    return (request) => {
      pendingRequests.push(request);

      if (!batchTimeout) {
        batchTimeout = setTimeout(() => {
          this.executeBatch(pendingRequests);
          pendingRequests = [];
          batchTimeout = null;
        }, 50); // 50ms debounce
      }
    };
  }

  // 3. Virtual Scrolling for Alert Lists
  implementVirtualScrolling() {
    return {
      visibleRange: { start: 0, end: 10 },
      itemHeight: 80,
      containerHeight: 400,
      
      getVisibleItems(items) {
        const scrollTop = this.container.scrollTop;
        const start = Math.floor(scrollTop / this.itemHeight);
        const end = Math.ceil((scrollTop + this.containerHeight) / this.itemHeight);
        
        return items.slice(start, end);
      }
    };
  }

  // 4. Memory Management
  setupMemoryManagement() {
    // Alert cache with LRU eviction
    this.alertCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60, // 1 hour
      updateAgeOnGet: true
    });

    // Periodic cleanup
    setInterval(() => {
      this.cleanupOldAlerts();
      this.releaseUnusedResources();
    }, 60000); // Every minute
  }

  // 5. Web Worker for Heavy Operations
  setupWebWorker() {
    this.worker = new Worker('alerts-worker.js');
    
    this.worker.postMessage({
      type: 'init',
      config: this.sdk.config
    });

    this.processInWorker = (data) => {
      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36);
        
        const handler = (event) => {
          if (event.data.id === id) {
            this.worker.removeEventListener('message', handler);
            resolve(event.data.result);
          }
        };
        
        this.worker.addEventListener('message', handler);
        this.worker.postMessage({ ...data, id });
      });
    };
  }
}
```

### Resource Hints

```html
<!-- Preconnect to API endpoints -->
<link rel="preconnect" href="https://alerts-api.example.com">
<link rel="dns-prefetch" href="https://alerts-api.example.com">

<!-- Preload critical resources -->
<link rel="preload" href="/alerts-sdk.js" as="script">
<link rel="preload" href="/alerts-styles.css" as="style">
```

## 9. Versioning and Upgrade Path

### Semantic Versioning Strategy

```javascript
class VersionManager {
  constructor() {
    this.currentVersion = '1.0.0';
    this.minSupportedVersion = '0.9.0';
  }

  // Version compatibility check
  checkCompatibility(clientVersion) {
    const client = this.parseVersion(clientVersion);
    const current = this.parseVersion(this.currentVersion);
    const minSupported = this.parseVersion(this.minSupportedVersion);

    if (client.major < minSupported.major) {
      return { compatible: false, reason: 'major_version_outdated' };
    }

    if (client.major > current.major) {
      return { compatible: false, reason: 'client_version_too_new' };
    }

    return { compatible: true };
  }

  // Migration system
  async migrate(fromVersion, toVersion) {
    const migrations = this.getMigrationPath(fromVersion, toVersion);
    
    for (const migration of migrations) {
      await this.runMigration(migration);
    }
  }

  // Auto-update mechanism
  setupAutoUpdate() {
    // Check for updates periodically
    setInterval(async () => {
      const latestVersion = await this.checkForUpdates();
      
      if (this.shouldUpdate(latestVersion)) {
        this.notifyUpdate(latestVersion);
      }
    }, 86400000); // Daily
  }
}
```

### Backward Compatibility

```javascript
// Deprecated method handling
class BackwardCompatibility {
  static wrapDeprecated(newMethod, oldMethodName) {
    return function(...args) {
      console.warn(`${oldMethodName} is deprecated. Use ${newMethod.name} instead.`);
      return newMethod.apply(this, args);
    };
  }

  static polyfillOldAPI(sdk) {
    // Old method -> New method mapping
    sdk.show = this.wrapDeprecated(sdk.showAlert, 'show');
    sdk.hide = this.wrapDeprecated(sdk.hideAlert, 'hide');
    sdk.configure = this.wrapDeprecated(sdk.updateConfig, 'configure');
  }
}
```

## 10. Sample Integration Code

### Basic Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>POS System</title>
</head>
<body>
  <div id="pos-app">
    <!-- POS UI -->
  </div>

  <!-- Alerts container -->
  <div id="alerts-container"></div>

  <!-- SDK Integration -->
  <script src="https://cdn.example.com/pos-alerts-sdk-v1.0.0.min.js"></script>
  <script>
    // Initialize the alerts SDK
    const alertsSDK = new POSAlertsSDK({
      apiKey: 'your-api-key-here',
      container: '#alerts-container',
      position: 'top-right',
      theme: {
        mode: 'auto',
        customColors: {
          primary: '#0066cc'
        }
      }
    });

    // Initialize and setup
    alertsSDK.init()
      .then(() => {
        console.log('Alerts SDK initialized');
        
        // Subscribe to events
        alertsSDK.on('alert:shown', (alert) => {
          console.log('New alert:', alert);
        });

        alertsSDK.on('alert:clicked', (alert) => {
          // Handle alert click
          handleAlertAction(alert);
        });
      })
      .catch(error => {
        console.error('Failed to initialize alerts:', error);
      });

    // Example: Programmatically show an alert
    function showOrderAlert(orderId) {
      alertsSDK.showAlert({
        type: 'order',
        priority: 'high',
        title: 'New Order Received',
        message: `Order #${orderId} requires attention`,
        actions: [
          {
            label: 'View Order',
            action: 'view_order',
            data: { orderId }
          },
          {
            label: 'Dismiss',
            action: 'dismiss'
          }
        ]
      });
    }
  </script>
</body>
</html>
```

### Advanced Integration with React

```jsx
// React Hook for Alerts SDK
import { useEffect, useState, useRef } from 'react';
import POSAlertsSDK from 'pos-alerts-sdk';

export function useAlertsSDK(config) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const sdkRef = useRef(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        const sdk = new POSAlertsSDK(config);
        await sdk.init();
        sdkRef.current = sdk;
        setIsReady(true);
      } catch (err) {
        setError(err);
      }
    };

    initSDK();

    return () => {
      if (sdkRef.current) {
        sdkRef.current.destroy();
      }
    };
  }, []);

  return {
    sdk: sdkRef.current,
    isReady,
    error
  };
}

// React Component
function POSApp() {
  const { sdk, isReady, error } = useAlertsSDK({
    apiKey: process.env.REACT_APP_ALERTS_API_KEY,
    position: 'top-right',
    theme: { mode: 'auto' }
  });

  useEffect(() => {
    if (!isReady || !sdk) return;

    // Subscribe to alert events
    const handleAlertShown = (alert) => {
      // Update app state
      dispatch({ type: 'ALERT_RECEIVED', payload: alert });
    };

    sdk.on('alert:shown', handleAlertShown);

    return () => {
      sdk.off('alert:shown', handleAlertShown);
    };
  }, [isReady, sdk]);

  if (error) {
    return <div>Failed to load alerts: {error.message}</div>;
  }

  return (
    <div className="pos-app">
      {/* POS UI Components */}
    </div>
  );
}
```

### Integration with Popular POS Systems

```javascript
// Square POS Integration
class SquarePOSIntegration {
  constructor() {
    this.alertsSDK = new POSAlertsSDK({
      apiKey: SQUARE_ALERTS_API_KEY,
      container: '.square-app-container',
      position: 'top-center',
      theme: {
        customColors: {
          primary: '#006AFF' // Square blue
        }
      }
    });
  }

  async connectToSquare() {
    // Listen to Square webhook events
    square.webhooks.on('payment.created', async (payment) => {
      await this.alertsSDK.showAlert({
        type: 'payment',
        priority: 'medium',
        title: 'Payment Received',
        message: `$${payment.amount / 100} from ${payment.customer_name}`,
        metadata: {
          paymentId: payment.id,
          customerId: payment.customer_id
        }
      });
    });
  }
}

// Shopify POS Integration
class ShopifyPOSIntegration {
  constructor(shop) {
    this.shop = shop;
    this.alertsSDK = new POSAlertsSDK({
      apiKey: shop.alerts_api_key,
      locale: shop.locale,
      theme: {
        mode: shop.theme_preference
      }
    });
  }

  setupShopifyHooks() {
    // Integrate with Shopify App Bridge
    const app = createApp({
      apiKey: SHOPIFY_API_KEY,
      host: HOST
    });

    // Subscribe to Shopify events
    app.subscribe(ResourcePicker.Action.SELECT, (selection) => {
      if (selection.products.length > 0) {
        this.handleProductSelection(selection.products);
      }
    });
  }
}
```

## Security Best Practices

### Content Security Policy

```javascript
// Recommended CSP headers for POS integration
const cspHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://cdn.example.com",
    "style-src 'self' 'unsafe-inline' https://cdn.example.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://alerts-api.example.com",
    "frame-src 'self' https://alerts.example.com",
    "frame-ancestors 'none'"
  ].join('; ')
};
```

### Iframe Sandbox Attributes

```html
<iframe
  src="https://alerts.example.com/embed"
  sandbox="allow-scripts allow-same-origin allow-popups"
  allow="notifications; vibrate"
  loading="lazy"
  importance="high"
></iframe>
```

## Performance Benchmarks

### Target Metrics

- **Initial Load**: < 100ms for SDK initialization
- **Alert Display**: < 50ms from API response to visual render
- **Memory Usage**: < 10MB for up to 100 alerts
- **CPU Usage**: < 5% during normal operation
- **Network Overhead**: < 1KB per alert update

## Conclusion

This architecture provides a secure, performant, and developer-friendly solution for embedding alerts in POS systems. The hybrid approach balances security needs with integration simplicity, while the comprehensive API surface allows for deep customization and control.

Key advantages:
- **Security First**: Sandboxed execution with secure communication
- **Easy Integration**: Simple SDK with clear API
- **Performance Optimized**: Lazy loading, batching, and efficient rendering
- **Future Proof**: Versioning and migration support
- **POS Friendly**: Designed for retail environment constraints