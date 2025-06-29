'use client';

import { useEffect, useRef, useState } from 'react';
// import { UnifiedPOSIntelligence } from '@company/pos-intelligence-sdk';

// Temporary mock for development that actually creates an iframe
class UnifiedPOSIntelligence {
  private iframe?: HTMLIFrameElement;
  private container?: HTMLElement;
  private iframeUrl: string;
  private onInitialized?: () => void;

  constructor() {
    this.iframeUrl = process.env.NEXT_PUBLIC_IFRAME_URL || 'http://localhost:3001';
  }

  setOnInitialized(callback: () => void) {
    this.onInitialized = callback;
  }

  async init(config: any) {
    console.log('Mock SDK initialized with config:', config);
    
    // Find the container
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error('Container element not found');
    }

    this.container = container;

    // Create and configure iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = `${this.iframeUrl}/unified-intelligence`;
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';
    this.iframe.style.borderRadius = '8px';
    this.iframe.style.overflow = 'hidden';

    // Add iframe to container
    container.appendChild(this.iframe);

    // Set up postMessage communication
    this.iframe.addEventListener('load', () => {
      console.log('Iframe loaded successfully');
      this.sendHandshake(config);
      // Call the initialized callback
      if (this.onInitialized) {
        this.onInitialized();
      }
    });

    this.iframe.addEventListener('error', (error) => {
      console.error('Iframe failed to load:', error);
    });

    // Listen for messages from iframe
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private sendHandshake(config: any): void {
    if (!this.iframe?.contentWindow) return;

    const message = {
      type: 'HANDSHAKE',
      apiKey: config.apiKey,
      features: config.features,
      timestamp: Date.now()
    };

    this.iframe.contentWindow.postMessage(message, this.iframeUrl);
  }

  private handleMessage(event: MessageEvent): void {
    // Verify origin
    if (event.origin !== this.iframeUrl) return;

    // Handle different message types
    console.log('Received message from iframe:', event.data);
  }
  
  triggerScenario(scenario: string) {
    console.log('Mock SDK triggered scenario:', scenario);
    
    if (!this.iframe?.contentWindow) return;

    const message = {
      type: 'TRIGGER_SCENARIO',
      payload: { scenario },
      timestamp: Date.now()
    };

    this.iframe.contentWindow.postMessage(message, this.iframeUrl);
  }
}
import { useDemoStore } from '@/store/demo-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Code2, Eye, EyeOff } from 'lucide-react';

export function SDKIntegration() {
  const { sdkEnabled, setSdkEnabled, currentMerchant } = useDemoStore();
  const [showCode, setShowCode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const sdkRef = useRef<UnifiedPOSIntelligence | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Expose SDK instance to parent component via window
  useEffect(() => {
    if (sdkRef.current && isInitialized) {
      (window as any).unifiedSDK = sdkRef.current;
    }
    return () => {
      delete (window as any).unifiedSDK;
    };
  }, [isInitialized]);

  useEffect(() => {
    if (sdkEnabled && !isInitialized && containerRef.current) {
      // Set iframe URL globally for SDK to pick up
      (window as any).NEXT_PUBLIC_IFRAME_URL = process.env.NEXT_PUBLIC_IFRAME_URL;
      
      const sdk = new UnifiedPOSIntelligence();
      sdkRef.current = sdk;

      // Set up callback for when iframe is loaded
      sdk.setOnInitialized(() => {
        setIsInitialized(true);
        console.log('SDK iframe loaded successfully');
      });

      sdk.init({
        containerId: 'intelligence-container',
        apiKey: process.env.NEXT_PUBLIC_SDK_API_KEY || 'pk_demo_123456789',
        features: {
          alerts: true,
          businessSentiment: true,
          competitorAnalysis: true,
          redditMonitoring: true,
        },
        theme: 'light',
        defaultView: 'dashboard',
      })
        .then(() => {
          console.log('SDK initialized successfully with iframe URL:', process.env.NEXT_PUBLIC_IFRAME_URL);
        })
        .catch((error) => {
          console.error('Failed to initialize SDK:', error);
        });
    }

    return () => {
      if (sdkRef.current && isInitialized && containerRef.current) {
        // Clean up iframe when component unmounts or SDK is disabled
        const iframe = containerRef.current.querySelector('iframe');
        if (iframe) {
          iframe.remove();
        }
        setIsInitialized(false);
      }
    };
  }, [sdkEnabled, isInitialized]);

  // Handle SDK disable
  useEffect(() => {
    if (!sdkEnabled && containerRef.current) {
      // Remove iframe when SDK is disabled
      const iframe = containerRef.current.querySelector('iframe');
      if (iframe) {
        iframe.remove();
      }
      setIsInitialized(false);
      sdkRef.current = null;
      delete (window as any).unifiedSDK;
    }
  }, [sdkEnabled]);

  const integrationCode = `// 1. Install the SDK
npm install @company/unified-pos-intelligence

// 2. Import and initialize
import { UnifiedPOSIntelligence } from '@company/unified-pos-intelligence';

const sdk = new UnifiedPOSIntelligence();

await sdk.init({
  containerId: 'intelligence-container',
  apiKey: '${process.env.NEXT_PUBLIC_SDK_API_KEY}',
  features: {
    alerts: true,
    businessSentiment: true,
    competitorAnalysis: true,
    redditMonitoring: true
  }
});

// 3. Set merchant context
await sdk.authenticate(merchantToken);
sdk.setMerchantContext({
  businessName: '${currentMerchant.businessName}',
  location: '${currentMerchant.location}',
  category: '${currentMerchant.businessType}'
});`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
          <h3 className="font-semibold">Unified Intelligence SDK</h3>
          <p className="text-sm text-gray-600">
            Toggle to see the SDK integration in action
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Code
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                View Integration Code
              </>
            )}
          </Button>
          <Switch
            checked={sdkEnabled}
            onCheckedChange={setSdkEnabled}
            aria-label="Enable SDK"
          />
        </div>
      </div>

      {showCode && (
        <div className="relative rounded-lg bg-gray-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">Integration Example</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => {
                navigator.clipboard.writeText(integrationCode);
              }}
            >
              <Code2 className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
          <pre className="overflow-x-auto text-sm">
            <code className="text-gray-300">{integrationCode}</code>
          </pre>
          <div className="mt-4 rounded bg-green-900/20 p-3 text-sm text-green-400">
            ⏱️ Integration time: &lt; 2 hours
          </div>
        </div>
      )}

      {sdkEnabled && (
        <div className="intelligence-iframe-container">
          <div
            id="intelligence-container"
            ref={containerRef}
            className="h-[400px] w-full"
          >
            {!isInitialized && (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading Unified Intelligence...</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Connecting to: {process.env.NEXT_PUBLIC_IFRAME_URL}/unified-intelligence
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Make sure the iframe app is running on that port
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}