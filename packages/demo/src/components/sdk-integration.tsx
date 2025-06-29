'use client';

import { useEffect, useRef, useState } from 'react';
// import { UnifiedPOSIntelligence } from '@company/pos-intelligence-sdk';

// Temporary mock for development
class UnifiedPOSIntelligence {
  async init(config: any) {
    console.log('Mock SDK initialized with config:', config);
  }
  
  triggerScenario(scenario: string) {
    console.log('Mock SDK triggered scenario:', scenario);
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
          setIsInitialized(true);
          console.log('SDK initialized successfully with iframe URL:', process.env.NEXT_PUBLIC_IFRAME_URL);
        })
        .catch((error) => {
          console.error('Failed to initialize SDK:', error);
        });
    }

    return () => {
      if (sdkRef.current && isInitialized) {
        // Clean up when component unmounts
        setIsInitialized(false);
      }
    };
  }, [sdkEnabled, isInitialized]);

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
          />
        </div>
      )}
    </div>
  );
}