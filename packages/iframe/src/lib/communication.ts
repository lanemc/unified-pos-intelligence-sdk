export interface Message {
  type: string;
  subtype?: string;
  action?: string;
  payload?: any;
  timestamp: number;
  id: string;
  sequence?: number;
  signature?: string;
}

export class CommunicationManager {
  private origin: string = '*'; // Will be set from handshake
  private sequence: number = 0;
  private apiKey?: string;
  private features?: Record<string, boolean>;
  private handlers: Map<string, (message: Message) => void> = new Map();

  constructor() {
    // Only set up message listener on client side
    if (typeof window !== 'undefined') {
      this.setupMessageListener();
    }
  }

  private setupMessageListener() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('message', (event: MessageEvent) => {
      // Validate message structure
      if (!event.data || typeof event.data !== 'object') return;

      const message = event.data as Message;
      
      // Handle different message types
      switch (message.type) {
        case 'HANDSHAKE':
          this.handleHandshake(event.origin, message);
          break;
        case 'CONFIG':
          this.handleConfig(message);
          break;
        case 'AUTH':
          this.handleAuth(message);
          break;
        default:
          // Call registered handlers
          const handler = this.handlers.get(message.type);
          if (handler) {
            handler(message);
          }
      }
    });
  }

  private handleHandshake(origin: string, message: Message) {
    this.origin = origin;
    this.apiKey = message.payload?.apiKey;
    this.features = message.payload?.features;

    // Send ready message back
    this.sendMessage({
      type: 'READY',
      payload: {
        version: '1.0.0',
        features: this.features,
      },
    });
  }

  private handleConfig(message: Message) {
    // Handle configuration updates
    if (message.payload?.theme) {
      document.documentElement.className = message.payload.theme;
    }
  }

  private handleAuth(message: Message) {
    // Handle authentication
    const token = message.payload?.token;
    if (token) {
      // Store token for API calls
      localStorage.setItem('auth_token', token);
    }
  }

  public sendMessage(message: Omit<Message, 'timestamp' | 'id' | 'sequence'>) {
    if (typeof window === 'undefined') return;
    
    const fullMessage: Message = {
      ...message,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sequence: this.sequence++,
    };

    if (window.parent !== window) {
      window.parent.postMessage(fullMessage, this.origin);
    }
  }

  public on(type: string, handler: (message: Message) => void) {
    this.handlers.set(type, handler);
  }

  public off(type: string) {
    this.handlers.delete(type);
  }

  public getFeatures() {
    return this.features || {};
  }

  public getApiKey() {
    return this.apiKey;
  }
}

// Create singleton instance only on client side
export const communication = typeof window !== 'undefined' ? new CommunicationManager() : null as any;