import { useEffect, useRef, useState } from 'react';
import { UnifiedPOSIntelligence } from '../index';

interface UnifiedConfig {
  containerId?: string;
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

export function useUnifiedIntelligence(config: UnifiedConfig) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<UnifiedPOSIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const containerId = `unified-intelligence-${Date.now()}`;
    containerRef.current.id = containerId;

    const sdk = new UnifiedPOSIntelligence();
    sdkRef.current = sdk;

    sdk.init({
      ...config,
      containerId,
    })
      .then(() => {
        setIsInitialized(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      // Cleanup when component unmounts
      setIsInitialized(false);
      setIsLoading(true);
      setError(null);
    };
  }, [config]);

  return {
    container: containerRef,
    sdk: sdkRef.current,
    isLoading,
    isInitialized,
    error,
    // Placeholder for future features
    alerts: [],
    sentiment: null,
    insights: [],
    urgentActions: [],
  };
}