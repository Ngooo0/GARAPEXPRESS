// Service WebSocket pour les notifications temps réel
import { Platform } from 'react-native';
import { WS_BASE_URL } from './apiConfig';

const WS_URL = WS_BASE_URL;
const ENABLE_LEGACY_WS = process.env.EXPO_PUBLIC_ENABLE_LEGACY_WS === 'true';

type WebSocketCallback = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, WebSocketCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isDisabled = false;

  private shouldSkipConnection(): boolean {
    if (this.isDisabled) {
      return true;
    }

    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return false;
    }

    try {
      const wsHost = new URL(WS_URL).hostname;
      const pageHost = window.location.hostname;
      const isLoopback = ['localhost', '127.0.0.1', '0.0.0.0'].includes(wsHost);

      return isLoopback && pageHost !== wsHost;
    } catch {
      return false;
    }
  }

  connect(token?: string) {
    if (!ENABLE_LEGACY_WS) {
      return;
    }

    if (this.shouldSkipConnection()) {
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = token ? `${WS_URL}?token=${token}` : WS_URL;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connecté');
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Erreur parsing WebSocket:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket déconnecté');
      this.emit('disconnection', { status: 'disconnected' });
      this.attemptReconnect(token);
    };

    this.ws.onerror = (error) => {
      if (Platform.OS === 'web') {
        this.isDisabled = true;
      }
      this.emit('error', { error });
    };
  }

  private handleMessage(data: any) {
    const { type, payload } = data;

    switch (type) {
      case 'notification':
        // Ajouter la notification au store (à implémenter)
        // useAppStore.getState().addNotification?.(payload);
        this.emit('notification', payload);
        break;
      
      case 'order_update':
        this.emit('order_update', payload);
        break;
      
      case 'delivery_update':
        this.emit('delivery_update', payload);
        break;
      
      case 'livraison_assigned':
        this.emit('livraison_assigned', payload);
        break;
      
      default:
        this.emit(type, payload);
    }
  }

  private attemptReconnect(token?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.connect(token), this.reconnectDelay);
    } else {
      console.log('Nombre max de tentatives atteint');
    }
  }

  disconnect() {
    this.isDisabled = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket non connecté');
    }
  }

  // Souscrire à un type d'événement
  on(event: string, callback: WebSocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Se désabonner
  off(event: string, callback: WebSocketCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Vérifier si connecté
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
export default wsService;
