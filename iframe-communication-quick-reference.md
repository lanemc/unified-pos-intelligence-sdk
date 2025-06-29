# iframe Communication Quick Reference Guide

## Essential Security Checklist

### PostMessage Security
- [ ] Always specify exact target origin (never use `*`)
- [ ] Validate `event.origin` before processing messages
- [ ] Sanitize all incoming message data
- [ ] Use HTTPS for all communication
- [ ] Implement CSP headers: `frame-ancestors 'self' https://trusted-domain.com`

### Financial Application Requirements
- [ ] Triple-layer validation (Origin, Structure, Authentication)
- [ ] CSRF token validation
- [ ] Session-based nonces for transactions
- [ ] PCI DSS compliance for payment data
- [ ] Audit logging for all financial operations

## Communication Patterns Comparison

| Pattern | Use Case | Pros | Cons |
|---------|----------|------|------|
| **PostMessage** | Basic cross-origin | Simple, universal support | Global listener, concurrency issues |
| **MessageChannel** | Bidirectional communication | Isolated channels, better for concurrent ops | More complex setup |
| **BroadcastChannel** | Same-origin multi-tab | Simple pub/sub, automatic | Same-origin only |
| **SharedWorker** | Complex state sharing | Centralized state, efficient | Limited browser support |
| **Storage Events** | Fallback option | Works everywhere | Limited data size, not real-time |

## Performance Best Practices

### Message Throttling
```javascript
// Throttle high-frequency updates (e.g., mouse position)
throttle('mousePosition', () => {
    iframe.postMessage({x, y}, origin);
}, 50); // Max once per 50ms
```

### Message Debouncing
```javascript
// Debounce user input (e.g., search)
debounce('search', () => {
    iframe.postMessage({query}, origin);
}, 300); // Wait 300ms after typing stops
```

### Message Batching
```javascript
// Batch multiple updates
batchMessage({type: 'UPDATE', field: 'name', value: 'John'});
batchMessage({type: 'UPDATE', field: 'email', value: 'john@example.com'});
// Sent as single message after 50ms
```

## Error Handling Strategy

### Timeout Pattern
```javascript
const response = await Promise.race([
    sendMessage(data),
    new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
    )
]);
```

### Retry Pattern
```javascript
async function withRetry(operation, maxRetries = 3) {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            if (i > 0) await delay(Math.pow(2, i) * 1000); // Exponential backoff
            return await operation();
        } catch (error) {
            if (i === maxRetries || !isRetryable(error)) throw error;
        }
    }
}
```

### Circuit Breaker
```javascript
// Prevent cascading failures
if (circuitBreaker.state === 'OPEN') {
    throw new Error('Service temporarily unavailable');
}
```

## Debugging Commands

### Chrome/Safari Console
```javascript
// Monitor all messages
monitorEvents(window, 'message');

// Stop monitoring
unmonitorEvents(window, 'message');

// Custom logging
window.addEventListener('message', console.log);
```

### Firefox Console
```javascript
// Monitor messages
window.addEventListener('message', console.log);

// Stop monitoring
window.removeEventListener('message', console.log);
```

## Production Integration Checklist

### iframe Setup
- [ ] Set loading="lazy" for performance
- [ ] Add sandbox attribute with minimal permissions
- [ ] Configure allow attribute for required features
- [ ] Set importance="low" for non-critical iframes
- [ ] Implement intersection observer for lazy loading

### Message Protocol
- [ ] Version your message protocol
- [ ] Include timestamps in all messages
- [ ] Add unique message IDs for request/response matching
- [ ] Implement heartbeat for connection monitoring
- [ ] Use structured message format with type field

### State Management
- [ ] Implement conflict resolution for concurrent updates
- [ ] Use versioning for state synchronization
- [ ] Batch state updates to reduce message frequency
- [ ] Implement state snapshot/restore functionality
- [ ] Clean up resources on iframe removal

## Common Integration Patterns

### Payment Provider Pattern
1. Load provider SDK script from their domain
2. SDK creates secure iframe for payment form
3. Parent communicates via postMessage with strict origin
4. Payment details tokenized within iframe
5. Only token shared with parent application
6. Status updates via event-driven messaging

### Embedded Dashboard Pattern
1. Initialize with API key authentication
2. Exchange for short-lived JWT token
3. Create iframe with dashboard URL + token
4. Bidirectional MessageChannel for data sync
5. Real-time updates via WebSocket in iframe
6. Parent controls filtering/configuration

### Analytics Widget Pattern
1. Lightweight parent script (~10KB)
2. Lazy load iframe when visible
3. Progressive enhancement approach
4. Batch analytics events before sending
5. Fallback to pixel tracking if blocked
6. Respect DNT (Do Not Track) headers

## Security Headers

### Recommended Headers
```
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self' https://trusted-partner.com
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: payment=(self "https://payment-provider.com")
```

## Browser Compatibility Notes

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| postMessage | ✅ | ✅ | ✅ | ✅ |
| MessageChannel | ✅ | ✅ | ✅ | ✅ |
| BroadcastChannel | ✅ | ✅ | ❌* | ✅ |
| SharedWorker | ✅ | ✅ | ❌ | ✅ |
| Storage Events | ✅ | ✅ | ✅ | ✅ |

*Safari: BroadcastChannel doesn't work in cross-origin iframes

## Quick Troubleshooting

### Message Not Received
1. Check origin validation matches exactly
2. Verify iframe src uses HTTPS
3. Check for CSP blocking
4. Ensure message listener added before sending
5. Verify iframe is fully loaded

### Performance Issues
1. Implement message throttling/debouncing
2. Use MessageChannel for high-frequency communication
3. Batch multiple updates into single message
4. Lazy load iframes when needed
5. Clean up event listeners on unmount

### Security Warnings
1. Never use wildcard (*) for targetOrigin
2. Always validate message structure
3. Sanitize HTML/script content
4. Use tokens instead of sensitive data
5. Implement rate limiting

## Resources

- [MDN postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [MDN MessageChannel](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel)
- [OWASP iframe Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#sandboxed-frames)
- [W3C Content Security Policy](https://www.w3.org/TR/CSP3/)