interface UnifiedConfig {
  containerId: string;
  apiKey: string;
  features: {
    alerts?: boolean;
    businessSentiment?: boolean;
    competitorAnalysis?: boolean;
    redditMonitoring?: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
  position?: 'embedded' | 'floating' | 'sidebar';
  locale?: string;
  customStyles?: Record<string, string>;
  defaultView?: 'alerts' | 'sentiment' | 'competitor' | 'reddit' | 'dashboard';
}

export class UnifiedPOSIntelligence {
  private config?: UnifiedConfig;
  private iframe?: HTMLIFrameElement;
  private container?: HTMLElement;
  private iframeUrl = this.getIframeUrl();

  private getIframeUrl(): string {
    // Try different ways to get the iframe URL
    if (typeof window !== 'undefined') {
      // Check if it's set globally (from demo environment)
      if ((window as any).NEXT_PUBLIC_IFRAME_URL) {
        return (window as any).NEXT_PUBLIC_IFRAME_URL;
      }
    }
    
    // Check process.env (for Node.js environments)
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_IFRAME_URL) {
      return process.env.NEXT_PUBLIC_IFRAME_URL;
    }
    
    // Fallback to default
    return 'http://localhost:3001';
  }

  async init(config: UnifiedConfig): Promise<void> {
    // Validate container exists
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error('Container element not found');
    }

    // Validate API key format (must start with pk_)
    if (!config.apiKey.startsWith('pk_')) {
      throw new Error('Invalid API key format');
    }

    this.config = config;
    this.container = container;

    // Create and configure iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = `${this.iframeUrl}/unified-intelligence`;
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';

    // Add iframe to container
    container.appendChild(this.iframe);

    // Set up postMessage communication
    this.iframe.addEventListener('load', () => {
      this.sendHandshake();
    });

    // Listen for messages from iframe
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private sendHandshake(): void {
    if (!this.iframe?.contentWindow || !this.config) return;

    const message = {
      type: 'HANDSHAKE',
      apiKey: this.config.apiKey,
      features: this.config.features,
      timestamp: Date.now()
    };

    this.iframe.contentWindow.postMessage(message, this.iframeUrl);
  }

  private handleMessage(event: MessageEvent): void {
    // Verify origin
    if (event.origin !== this.iframeUrl) return;

    // Handle different message types
    switch (event.data.type) {
      case 'READY':
        // Iframe is ready
        break;
      case 'ERROR':
        console.error('Iframe error:', event.data.payload);
        break;
      default:
        // Handle other message types
        break;
    }
  }

  // Public method to trigger demo scenarios
  public triggerScenario(scenario: string): void {
    if (!this.iframe?.contentWindow) return;

    const message = {
      type: 'TRIGGER_SCENARIO',
      payload: { scenario },
      timestamp: Date.now()
    };

    this.iframe.contentWindow.postMessage(message, this.iframeUrl);
  }
}