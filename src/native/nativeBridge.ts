import type {
  NativeBridgeRequestType,
  NativeBridgeRequestMap,
  NativeBridgeResponse,
} from './nativeBridge.types.ts';
import {
  BRIDGE_VERSION,
} from './nativeBridge.types.ts';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export class NativeBridge {
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
      timeoutId: number;
    }
  >();

  private eventListeners = new Map<string, Set<(payload: any) => void>>();
  private requestCounter = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('nativeBridgeMessage', ((event: CustomEvent) => {
        this.handleIncomingMessage(event.detail);
      }) as EventListener);
    }
  }

  /**
   * Checks if the React Native Webview environment is available.
   */
  isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!window.ReactNativeWebView &&
      typeof window.ReactNativeWebView.postMessage === 'function'
    );
  }

  /**
   * Returns the static protocol bridge version.
   */
  getVersion(): number {
    return BRIDGE_VERSION;
  }

  /**
   * Sends a typed request to the React Native host and returns a Promise
   * that resolves with the corresponding response payload.
   */
  request<K extends NativeBridgeRequestType>(
    type: K,
    payload: NativeBridgeRequestMap[K]['request'] = {},
    timeoutMs = 10000
  ): Promise<NativeBridgeRequestMap[K]['response']> {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('NATIVE_BRIDGE_UNAVAILABLE'));
    }

    const requestId = `req-${Date.now()}-${++this.requestCounter}`;

    return new Promise<NativeBridgeRequestMap[K]['response']>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('NATIVE_REQUEST_TIMEOUT'));
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });

      try {
        window.ReactNativeWebView!.postMessage(
          JSON.stringify({
            type,
            requestId,
            payload,
          })
        );
      } catch (err) {
        window.clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);
        reject(err instanceof Error ? err : new Error('NATIVE_POST_FAILED'));
      }
    });
  }

  /**
   * Adds an event listener for unsolicited native events (pushed from React Native).
   */
  addEventListener(event: string, callback: (payload: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Removes a previously registered event listener.
   */
  removeEventListener(event: string, callback: (payload: any) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Handles incoming messages routed from the native dispatch.
   */
  private handleIncomingMessage(message: any) {
    if (!message || typeof message !== 'object') {
      console.warn('Native Bridge: Received invalid message structure', message);
      return;
    }

    const { type, requestId, payload, error } = message as NativeBridgeResponse;

    // Handle unsolicited events (unidirectional Native -> Web)
    if (!requestId) {
      const listeners = this.eventListeners.get(type);
      if (listeners) {
        listeners.forEach((callback) => {
          try {
            callback(payload);
          } catch (err) {
            console.error(`Error in native bridge event listener for "${type}":`, err);
          }
        });
      }
      return;
    }

    // Handle request-response pairings
    const pending = this.pendingRequests.get(requestId);
    if (!pending) {
      return;
    }

    // Clean up request state
    window.clearTimeout(pending.timeoutId);
    this.pendingRequests.delete(requestId);

    if (type === 'NATIVE_ERROR') {
      const errCode = error?.code || 'NATIVE_ERROR';
      const errMsg = error?.message || 'An unknown error occurred in the native layer';
      pending.reject(new Error(`${errCode}: ${errMsg}`));
    } else {
      pending.resolve(payload);
    }
  }
}

// Export single shared instance
export const nativeBridge = new NativeBridge();
