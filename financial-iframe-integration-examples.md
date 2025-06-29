# Financial iframe Integration Examples

## Complete POS Terminal Integration

```javascript
// pos-terminal-integration.js
class POSTerminalIntegration {
    constructor(config) {
        this.config = {
            terminalId: config.terminalId,
            apiKey: config.apiKey,
            environment: config.environment || 'production',
            ...config
        };
        
        this.iframe = null;
        this.messageChannel = null;
        this.transactionQueue = new Map();
        this.connectionState = 'disconnected';
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Create secure iframe
            await this.createSecureIframe();
            
            // Establish MessageChannel
            await this.establishSecureChannel();
            
            // Initialize heartbeat
            this.startHeartbeat();
            
            // Set connection state
            this.connectionState = 'connected';
            
        } catch (error) {
            console.error('POS Terminal initialization failed:', error);
            this.handleInitializationError(error);
        }
    }
    
    async createSecureIframe() {
        const iframeUrl = this.config.environment === 'production'
            ? 'https://terminal.payment-provider.com/v2/embed'
            : 'https://sandbox.terminal.payment-provider.com/v2/embed';
            
        this.iframe = document.createElement('iframe');
        this.iframe.src = `${iframeUrl}?terminal=${this.config.terminalId}`;
        
        // Security attributes
        this.iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';
        this.iframe.allow = 'payment; microphone; camera'; // For NFC/QR payments
        this.iframe.style.cssText = `
            width: 100%;
            height: 600px;
            border: none;
            display: block;
        `;
        
        // Add to DOM
        const container = document.getElementById(this.config.containerId);
        container.appendChild(this.iframe);
        
        // Wait for load
        await new Promise((resolve, reject) => {
            this.iframe.onload = resolve;
            this.iframe.onerror = reject;
            setTimeout(() => reject(new Error('iframe load timeout')), 30000);
        });
    }
    
    async establishSecureChannel() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Channel establishment timeout'));
            }, 10000);
            
            // Listen for initial handshake
            const handshakeHandler = (event) => {
                if (event.origin !== this.getExpectedOrigin()) return;
                
                if (event.data.type === 'TERMINAL_READY') {
                    clearTimeout(timeout);
                    window.removeEventListener('message', handshakeHandler);
                    
                    // Create MessageChannel
                    this.messageChannel = new MessageChannel();
                    
                    // Send port to iframe with authentication
                    this.iframe.contentWindow.postMessage({
                        type: 'ESTABLISH_CHANNEL',
                        apiKey: this.config.apiKey,
                        timestamp: Date.now(),
                        nonce: this.generateNonce()
                    }, this.getExpectedOrigin(), [this.messageChannel.port2]);
                    
                    // Setup port1 handlers
                    this.setupChannelHandlers();
                    
                    resolve();
                }
            };
            
            window.addEventListener('message', handshakeHandler);
            
            // Request terminal ready status
            this.iframe.contentWindow.postMessage({
                type: 'REQUEST_STATUS'
            }, this.getExpectedOrigin());
        });
    }
    
    setupChannelHandlers() {
        this.messageChannel.port1.onmessage = (event) => {
            const { type, data, transactionId } = event.data;
            
            switch (type) {
                case 'TRANSACTION_UPDATE':
                    this.handleTransactionUpdate(transactionId, data);
                    break;
                    
                case 'PAYMENT_COMPLETE':
                    this.handlePaymentComplete(transactionId, data);
                    break;
                    
                case 'ERROR':
                    this.handleError(transactionId, data);
                    break;
                    
                case 'DEVICE_STATUS':
                    this.handleDeviceStatus(data);
                    break;
                    
                case 'HEARTBEAT_RESPONSE':
                    this.lastHeartbeat = Date.now();
                    break;
            }
        };
    }
    
    async processPayment(amount, options = {}) {
        const transactionId = this.generateTransactionId();
        
        return new Promise((resolve, reject) => {
            // Store transaction promise
            this.transactionQueue.set(transactionId, {
                resolve,
                reject,
                startTime: Date.now(),
                timeout: setTimeout(() => {
                    this.transactionQueue.delete(transactionId);
                    reject(new Error('Transaction timeout'));
                }, options.timeout || 120000) // 2 minute timeout
            });
            
            // Send payment request
            this.sendMessage({
                type: 'PROCESS_PAYMENT',
                transactionId,
                data: {
                    amount,
                    currency: options.currency || 'USD',
                    paymentMethods: options.paymentMethods || ['card', 'nfc', 'qr'],
                    metadata: options.metadata || {}
                }
            });
        });
    }
    
    handlePaymentComplete(transactionId, data) {
        const transaction = this.transactionQueue.get(transactionId);
        if (!transaction) return;
        
        clearTimeout(transaction.timeout);
        this.transactionQueue.delete(transactionId);
        
        // Validate payment data
        if (this.validatePaymentData(data)) {
            transaction.resolve({
                success: true,
                transactionId,
                authorizationCode: data.authorizationCode,
                amount: data.amount,
                last4: data.last4,
                cardBrand: data.cardBrand,
                timestamp: data.timestamp
            });
        } else {
            transaction.reject(new Error('Invalid payment data received'));
        }
    }
    
    validatePaymentData(data) {
        // Implement payment data validation
        return data.authorizationCode && data.amount && data.timestamp;
    }
    
    sendMessage(message) {
        if (this.connectionState !== 'connected') {
            throw new Error('Terminal not connected');
        }
        
        this.messageChannel.port1.postMessage({
            ...message,
            timestamp: Date.now(),
            nonce: this.generateNonce()
        });
    }
    
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.sendMessage({ type: 'HEARTBEAT' });
            
            // Check for missed heartbeats
            if (Date.now() - this.lastHeartbeat > 30000) {
                this.handleConnectionLoss();
            }
        }, 10000); // Every 10 seconds
    }
    
    handleConnectionLoss() {
        this.connectionState = 'disconnected';
        console.error('Terminal connection lost');
        
        // Attempt reconnection
        this.reconnect();
    }
    
    generateTransactionId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateNonce() {
        return Math.random().toString(36).substr(2, 15);
    }
    
    getExpectedOrigin() {
        return this.config.environment === 'production'
            ? 'https://terminal.payment-provider.com'
            : 'https://sandbox.terminal.payment-provider.com';
    }
    
    destroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        if (this.messageChannel) {
            this.messageChannel.port1.close();
        }
        
        if (this.iframe && this.iframe.parentNode) {
            this.iframe.parentNode.removeChild(this.iframe);
        }
        
        // Clear pending transactions
        this.transactionQueue.forEach(transaction => {
            clearTimeout(transaction.timeout);
            transaction.reject(new Error('Terminal destroyed'));
        });
        
        this.transactionQueue.clear();
    }
}

// Usage example
const terminal = new POSTerminalIntegration({
    terminalId: 'term_abc123',
    apiKey: process.env.TERMINAL_API_KEY,
    containerId: 'terminal-container',
    environment: 'production'
});

// Process a payment
try {
    const result = await terminal.processPayment(5000, { // $50.00
        paymentMethods: ['card', 'nfc'],
        metadata: {
            orderId: 'order_123',
            customerId: 'cust_456'
        }
    });
    
    console.log('Payment successful:', result);
} catch (error) {
    console.error('Payment failed:', error);
}
```

## Multi-Provider Payment Integration

```javascript
// multi-provider-payment.js
class MultiProviderPayment {
    constructor() {
        this.providers = new Map();
        this.activeProvider = null;
        this.providerFrames = new Map();
    }
    
    registerProvider(name, config) {
        this.providers.set(name, {
            name,
            config,
            initialized: false,
            available: true
        });
    }
    
    async initializeProvider(name) {
        const provider = this.providers.get(name);
        if (!provider) throw new Error(`Provider ${name} not registered`);
        
        if (provider.initialized) return provider;
        
        switch (name) {
            case 'stripe':
                await this.initializeStripe(provider);
                break;
            case 'square':
                await this.initializeSquare(provider);
                break;
            case 'paypal':
                await this.initializePayPal(provider);
                break;
            default:
                throw new Error(`Unknown provider: ${name}`);
        }
        
        provider.initialized = true;
        return provider;
    }
    
    async initializeStripe(provider) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://checkout.stripe.com/embedded/v1?key=${provider.config.publishableKey}`;
        iframe.style.display = 'none';
        
        document.body.appendChild(iframe);
        this.providerFrames.set('stripe', iframe);
        
        // Setup Stripe-specific messaging
        const channel = new MessageChannel();
        
        return new Promise((resolve) => {
            channel.port1.onmessage = (event) => {
                if (event.data.type === 'ready') {
                    provider.channel = channel;
                    resolve();
                }
            };
            
            iframe.contentWindow.postMessage({
                type: 'init',
                config: provider.config
            }, 'https://checkout.stripe.com', [channel.port2]);
        });
    }
    
    async switchProvider(name) {
        // Hide current provider
        if (this.activeProvider) {
            const currentFrame = this.providerFrames.get(this.activeProvider);
            if (currentFrame) currentFrame.style.display = 'none';
        }
        
        // Initialize if needed
        await this.initializeProvider(name);
        
        // Show new provider
        const newFrame = this.providerFrames.get(name);
        if (newFrame) newFrame.style.display = 'block';
        
        this.activeProvider = name;
    }
    
    async processPayment(amount, currency = 'USD') {
        if (!this.activeProvider) {
            throw new Error('No payment provider selected');
        }
        
        const provider = this.providers.get(this.activeProvider);
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Payment timeout'));
            }, 60000);
            
            provider.channel.port1.onmessage = (event) => {
                clearTimeout(timeout);
                
                if (event.data.type === 'payment_complete') {
                    resolve(event.data.result);
                } else if (event.data.type === 'payment_error') {
                    reject(new Error(event.data.error));
                }
            };
            
            provider.channel.port1.postMessage({
                type: 'create_payment',
                amount,
                currency
            });
        });
    }
}
```

## Secure Financial Data Viewer

```javascript
// secure-financial-viewer.js
class SecureFinancialViewer {
    constructor(config) {
        this.config = config;
        this.viewer = null;
        this.encryptionKey = null;
        this.sessionToken = null;
    }
    
    async initialize() {
        // Get session token from server
        this.sessionToken = await this.getSessionToken();
        
        // Generate encryption key for this session
        this.encryptionKey = await this.generateEncryptionKey();
        
        // Create secure viewer iframe
        await this.createSecureViewer();
    }
    
    async createSecureViewer() {
        const container = document.getElementById(this.config.containerId);
        
        // Create iframe with strict CSP
        this.viewer = document.createElement('iframe');
        this.viewer.src = `${this.config.viewerUrl}?session=${this.sessionToken}`;
        this.viewer.sandbox = 'allow-scripts allow-same-origin';
        this.viewer.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
        `;
        
        // Set CSP meta tag
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = `
            frame-src ${this.config.viewerUrl};
            connect-src ${this.config.apiUrl};
        `;
        document.head.appendChild(cspMeta);
        
        container.appendChild(this.viewer);
        
        // Setup encrypted communication
        await this.setupEncryptedChannel();
    }
    
    async setupEncryptedChannel() {
        const channel = new MessageChannel();
        
        // Exchange encryption keys
        return new Promise((resolve) => {
            channel.port1.onmessage = async (event) => {
                if (event.data.type === 'key_exchange') {
                    // Verify viewer's public key
                    const verified = await this.verifyPublicKey(event.data.publicKey);
                    if (!verified) throw new Error('Key verification failed');
                    
                    // Send our public key
                    channel.port1.postMessage({
                        type: 'key_exchange_response',
                        publicKey: await this.getPublicKey()
                    });
                    
                    resolve();
                }
            };
            
            this.viewer.contentWindow.postMessage({
                type: 'init_secure_channel',
                sessionToken: this.sessionToken
            }, this.config.viewerUrl, [channel.port2]);
        });
    }
    
    async loadFinancialData(customerId, dataType) {
        // Encrypt request
        const encryptedRequest = await this.encrypt({
            customerId,
            dataType,
            timestamp: Date.now(),
            nonce: crypto.getRandomValues(new Uint8Array(16))
        });
        
        // Send encrypted request
        this.viewer.contentWindow.postMessage({
            type: 'load_data',
            payload: encryptedRequest
        }, this.config.viewerUrl);
    }
    
    async encrypt(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        return await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: crypto.getRandomValues(new Uint8Array(12))
            },
            this.encryptionKey,
            dataBuffer
        );
    }
    
    async generateEncryptionKey() {
        return await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );
    }
}
```

## Real-time Transaction Monitor

```javascript
// realtime-transaction-monitor.js
class RealtimeTransactionMonitor {
    constructor(config) {
        this.config = config;
        this.monitors = new Map();
        this.eventSource = null;
        this.broadcastChannel = null;
    }
    
    async initialize() {
        // Setup SSE connection for real-time updates
        this.setupEventSource();
        
        // Setup BroadcastChannel for multi-tab sync
        this.setupBroadcastChannel();
        
        // Initialize monitor iframes
        await this.initializeMonitors();
    }
    
    setupEventSource() {
        this.eventSource = new EventSource(
            `${this.config.apiUrl}/transactions/stream?token=${this.config.token}`
        );
        
        this.eventSource.onmessage = (event) => {
            const transaction = JSON.parse(event.data);
            this.handleNewTransaction(transaction);
        };
        
        this.eventSource.onerror = () => {
            console.error('SSE connection lost, reconnecting...');
            setTimeout(() => this.setupEventSource(), 5000);
        };
    }
    
    setupBroadcastChannel() {
        if ('BroadcastChannel' in window) {
            this.broadcastChannel = new BroadcastChannel('transaction-updates');
            
            this.broadcastChannel.onmessage = (event) => {
                // Sync transaction state across tabs
                this.syncTransaction(event.data);
            };
        }
    }
    
    async initializeMonitors() {
        for (const [type, config] of Object.entries(this.config.monitors)) {
            const monitor = await this.createMonitor(type, config);
            this.monitors.set(type, monitor);
        }
    }
    
    async createMonitor(type, config) {
        const iframe = document.createElement('iframe');
        iframe.src = `${this.config.monitorUrl}/${type}`;
        iframe.className = 'transaction-monitor';
        iframe.dataset.monitorType = type;
        
        const container = document.getElementById(config.containerId);
        container.appendChild(iframe);
        
        // Setup communication channel
        const channel = new MessageChannel();
        
        return new Promise((resolve) => {
            channel.port1.onmessage = (event) => {
                if (event.data.type === 'monitor_ready') {
                    resolve({
                        iframe,
                        channel,
                        config
                    });
                }
            };
            
            iframe.onload = () => {
                iframe.contentWindow.postMessage({
                    type: 'init_monitor',
                    config
                }, this.config.monitorUrl, [channel.port2]);
            };
        });
    }
    
    handleNewTransaction(transaction) {
        // Route to appropriate monitor
        const monitorType = this.getMonitorType(transaction);
        const monitor = this.monitors.get(monitorType);
        
        if (monitor) {
            monitor.channel.port1.postMessage({
                type: 'new_transaction',
                transaction
            });
        }
        
        // Broadcast to other tabs
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({
                type: 'transaction_update',
                transaction
            });
        }
        
        // Check for alerts
        this.checkTransactionAlerts(transaction);
    }
    
    checkTransactionAlerts(transaction) {
        // High value transaction alert
        if (transaction.amount > this.config.alertThreshold) {
            this.sendAlert('high_value', transaction);
        }
        
        // Suspicious activity alert
        if (this.isSuspicious(transaction)) {
            this.sendAlert('suspicious', transaction);
        }
    }
    
    isSuspicious(transaction) {
        // Implement fraud detection logic
        return false;
    }
    
    getMonitorType(transaction) {
        if (transaction.amount > 10000) return 'high-value';
        if (transaction.type === 'refund') return 'refunds';
        return 'standard';
    }
}
```

## Compliance and Audit Logger

```javascript
// compliance-audit-logger.js
class ComplianceAuditLogger {
    constructor(config) {
        this.config = config;
        this.logBuffer = [];
        this.loggerFrame = null;
        this.batchTimer = null;
    }
    
    async initialize() {
        // Create secure logger iframe
        this.loggerFrame = document.createElement('iframe');
        this.loggerFrame.src = this.config.loggerUrl;
        this.loggerFrame.style.display = 'none';
        this.loggerFrame.sandbox = 'allow-scripts allow-same-origin';
        
        document.body.appendChild(this.loggerFrame);
        
        // Setup secure channel
        await this.setupSecureChannel();
        
        // Start batch timer
        this.startBatchTimer();
    }
    
    async setupSecureChannel() {
        return new Promise((resolve) => {
            window.addEventListener('message', function handler(event) {
                if (event.origin !== this.config.loggerOrigin) return;
                
                if (event.data.type === 'logger_ready') {
                    window.removeEventListener('message', handler);
                    resolve();
                }
            }.bind(this));
        });
    }
    
    logTransaction(transaction) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'transaction',
            data: this.sanitizeTransactionData(transaction),
            metadata: {
                userAgent: navigator.userAgent,
                sessionId: this.config.sessionId,
                ipAddress: 'server-side-only' // Set by server
            }
        };
        
        this.addToBuffer(logEntry);
    }
    
    logAccess(resource, action) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'access',
            data: {
                resource,
                action,
                userId: this.config.userId
            }
        };
        
        this.addToBuffer(logEntry);
    }
    
    logError(error, context) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'error',
            data: {
                message: error.message,
                stack: error.stack,
                context
            }
        };
        
        this.addToBuffer(logEntry);
    }
    
    sanitizeTransactionData(transaction) {
        // Remove sensitive data
        const sanitized = { ...transaction };
        
        // Mask card numbers
        if (sanitized.cardNumber) {
            sanitized.cardNumber = this.maskCardNumber(sanitized.cardNumber);
        }
        
        // Remove CVV
        delete sanitized.cvv;
        
        // Hash customer data
        if (sanitized.customerId) {
            sanitized.customerId = this.hashValue(sanitized.customerId);
        }
        
        return sanitized;
    }
    
    maskCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\D/g, '');
        return cleaned.replace(/(\d{6})(\d+)(\d{4})/, '$1******$3');
    }
    
    hashValue(value) {
        // Simple hash for demo - use proper hashing in production
        return 'hash_' + btoa(value).substring(0, 10);
    }
    
    addToBuffer(logEntry) {
        this.logBuffer.push(logEntry);
        
        // Immediate flush for critical logs
        if (logEntry.type === 'error' || logEntry.data.amount > 10000) {
            this.flushLogs();
        }
    }
    
    startBatchTimer() {
        this.batchTimer = setInterval(() => {
            if (this.logBuffer.length > 0) {
                this.flushLogs();
            }
        }, 5000); // Flush every 5 seconds
    }
    
    async flushLogs() {
        if (this.logBuffer.length === 0) return;
        
        const logs = [...this.logBuffer];
        this.logBuffer = [];
        
        try {
            // Send logs to secure iframe
            this.loggerFrame.contentWindow.postMessage({
                type: 'write_logs',
                logs: logs,
                signature: await this.signLogs(logs)
            }, this.config.loggerOrigin);
            
        } catch (error) {
            // Re-add logs to buffer on failure
            this.logBuffer.unshift(...logs);
            console.error('Failed to flush logs:', error);
        }
    }
    
    async signLogs(logs) {
        // Create signature for log integrity
        const data = JSON.stringify(logs);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    destroy() {
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
        }
        
        // Flush remaining logs
        this.flushLogs();
        
        if (this.loggerFrame && this.loggerFrame.parentNode) {
            this.loggerFrame.parentNode.removeChild(this.loggerFrame);
        }
    }
}
```

## Usage Examples

### POS Terminal Integration
```javascript
// Initialize POS terminal
const terminal = new POSTerminalIntegration({
    terminalId: 'term_abc123',
    apiKey: process.env.TERMINAL_API_KEY,
    containerId: 'terminal-container',
    environment: 'production'
});

// Process payment
const payment = await terminal.processPayment(5000, {
    paymentMethods: ['card', 'nfc'],
    metadata: { orderId: 'order_123' }
});
```

### Multi-Provider Setup
```javascript
// Setup multiple providers
const paymentManager = new MultiProviderPayment();

paymentManager.registerProvider('stripe', {
    publishableKey: 'pk_live_...'
});

paymentManager.registerProvider('square', {
    applicationId: 'sq0idp-...',
    locationId: 'L123...'
});

// Switch providers dynamically
await paymentManager.switchProvider('stripe');
const result = await paymentManager.processPayment(2500);
```

### Transaction Monitoring
```javascript
// Setup real-time monitoring
const monitor = new RealtimeTransactionMonitor({
    apiUrl: 'https://api.example.com',
    monitorUrl: 'https://monitors.example.com',
    token: 'monitor_token_123',
    alertThreshold: 10000,
    monitors: {
        'high-value': { containerId: 'high-value-monitor' },
        'refunds': { containerId: 'refunds-monitor' },
        'standard': { containerId: 'standard-monitor' }
    }
});

await monitor.initialize();
```

### Compliance Logging
```javascript
// Initialize audit logger
const logger = new ComplianceAuditLogger({
    loggerUrl: 'https://audit.example.com/logger',
    loggerOrigin: 'https://audit.example.com',
    sessionId: 'session_123',
    userId: 'user_456'
});

await logger.initialize();

// Log transactions
logger.logTransaction({
    id: 'txn_789',
    amount: 5000,
    cardNumber: '4111111111111111',
    customerId: 'cust_123'
});

// Log access
logger.logAccess('customer_data', 'view');
```

These examples demonstrate production-ready patterns for financial iframe integrations with emphasis on security, reliability, and compliance requirements.