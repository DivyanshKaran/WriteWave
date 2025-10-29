import { WS_EVENTS, API_CONFIG } from './api-config';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private token: string | null = null;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      url: API_CONFIG.websocket.url,
      reconnectInterval: API_CONFIG.websocket.reconnectInterval,
      maxReconnectAttempts: API_CONFIG.websocket.maxReconnectAttempts,
      heartbeatInterval: 30000, // 30 seconds
      ...config,
    };
  }

  // Connect to WebSocket
  async connect(token?: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.token = token || null;
    this.connectionState = 'connecting';

    try {
      const url = this.token 
        ? `${this.config.url}?token=${this.token}`
        : this.config.url;

      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  // Disconnect from WebSocket
  disconnect(): void {
    this.connectionState = 'disconnected';
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  // Send message
  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
        id: this.generateMessageId(),
      };
      
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', type);
    }
  }

  // Subscribe to message type
  subscribe(type: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  // Get connection state
  getConnectionState(): string {
    return this.connectionState;
  }

  // Check if connected
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Private methods
  private handleOpen(): void {
    console.log('WebSocket connected');
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.emit(WS_EVENTS.CONNECT);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle heartbeat response
      if (message.type === 'pong') {
        return;
      }
      
      // Emit message to subscribers
      this.emit(message.type, message.data);
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.connectionState = 'disconnected';
    this.clearTimers();
    this.emit(WS_EVENTS.DISCONNECT);
    
    // Attempt to reconnect if not a clean close
    if (event.code !== 1000) {
      this.handleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.emit(WS_EVENTS.ERROR, { error: 'WebSocket connection error' });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.connectionState = 'disconnected';
      return;
    }

    this.connectionState = 'reconnecting';
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.token || undefined);
    }, this.config.reconnectInterval);
    
    this.emit(WS_EVENTS.RECONNECT, { attempt: this.reconnectAttempts });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, this.config.heartbeatInterval);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private emit(type: string, data?: any): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket handler for ${type}:`, error);
        }
      });
    }
  }

  private generateMessageId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// WebSocket hooks for React components
export class WebSocketHooks {
  private wsService: WebSocketService;

  constructor(wsService: WebSocketService) {
    this.wsService = wsService;
  }

  // Hook for connection state
  useConnectionState() {
    const [state, setState] = React.useState(this.wsService.getConnectionState());
    
    React.useEffect(() => {
      const unsubscribeConnect = this.wsService.subscribe(WS_EVENTS.CONNECT, () => {
        setState('connected');
      });
      
      const unsubscribeDisconnect = this.wsService.subscribe(WS_EVENTS.DISCONNECT, () => {
        setState('disconnected');
      });
      
      const unsubscribeReconnect = this.wsService.subscribe(WS_EVENTS.RECONNECT, () => {
        setState('reconnecting');
      });
      
      return () => {
        unsubscribeConnect();
        unsubscribeDisconnect();
        unsubscribeReconnect();
      };
    }, []);
    
    return state;
  }

  // Hook for specific message types
  useMessage<T = any>(type: string, handler?: (data: T) => void) {
    const [data, setData] = React.useState<T | null>(null);
    
    React.useEffect(() => {
      const unsubscribe = this.wsService.subscribe(type, (messageData: T) => {
        setData(messageData);
        if (handler) {
          handler(messageData);
        }
      });
      
      return unsubscribe;
    }, [type, handler]);
    
    return data;
  }

  // Hook for sending messages
  useSendMessage() {
    return React.useCallback((type: string, data: any) => {
      this.wsService.send(type, data);
    }, []);
  }
}

// Create singleton instance
export const wsService = new WebSocketService();
export const wsHooks = new WebSocketHooks(wsService);

// Export React hooks
export const useWebSocketConnection = () => wsHooks.useConnectionState();
export const useWebSocketMessage = <T = any>(type: string, handler?: (data: T) => void) => 
  wsHooks.useMessage<T>(type, handler);
export const useWebSocketSend = () => wsHooks.useSendMessage();

// Export WebSocket event types
export { WS_EVENTS };

// Export the service instance
export default wsService;
