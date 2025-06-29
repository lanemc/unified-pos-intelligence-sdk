import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnifiedPOSIntelligence } from './index';

describe('UnifiedPOSIntelligence', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    it('should initialize with required configuration', async () => {
      const sdk = new UnifiedPOSIntelligence();
      
      const config = {
        containerId: 'test-container',
        apiKey: 'pk_test_123',
        features: {
          alerts: true,
          businessSentiment: true,
          competitorAnalysis: true,
          redditMonitoring: true
        }
      };

      await sdk.init(config);

      // Verify iframe is created
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe?.src).toContain('unified-intelligence');
      
      // Verify iframe has proper sandbox attributes
      expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-forms');
    });

    it('should throw error if container is not found', async () => {
      const sdk = new UnifiedPOSIntelligence();
      
      const config = {
        containerId: 'non-existent-container',
        apiKey: 'pk_test_123',
        features: {
          alerts: true
        }
      };

      await expect(sdk.init(config)).rejects.toThrow('Container element not found');
    });

    it('should validate API key format', async () => {
      const sdk = new UnifiedPOSIntelligence();
      
      const config = {
        containerId: 'test-container',
        apiKey: 'invalid-key',
        features: {
          alerts: true
        }
      };

      await expect(sdk.init(config)).rejects.toThrow('Invalid API key format');
    });
  });

  describe('postMessage communication', () => {
    it('should establish handshake with iframe', async () => {
      const sdk = new UnifiedPOSIntelligence();
      
      await sdk.init({
        containerId: 'test-container',
        apiKey: 'pk_test_123',
        features: { alerts: true }
      });

      // Get the iframe
      const iframe = container.querySelector('iframe') as HTMLIFrameElement;
      expect(iframe).toBeTruthy();
      
      // Mock the iframe's contentWindow.postMessage
      const postMessageSpy = vi.fn();
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        writable: true
      });
      
      // Trigger iframe load event
      const loadEvent = new Event('load');
      iframe.dispatchEvent(loadEvent);

      // Verify handshake message is sent
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'HANDSHAKE',
          apiKey: 'pk_test_123'
        }),
        expect.any(String)
      );
    });
  });
});