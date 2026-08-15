export const BRIDGE_VERSION = 1;

export type NativeBridgeRequestMap = {
  PING: {
    request: {};
    response: { reply: 'PONG' };
  };
  GET_APP_INFO: {
    request: {};
    response: {
      platform: 'android' | 'ios' | 'web';
      bridgeVersion: number;
    };
  };
  APP_READY: {
    request: {};
    response: void;
  };
  DOWNLOAD_FILE: {
    request: { url: string; fileName: string; mimeType: string };
    response: { status: 'DOWNLOAD_SUCCESS'; uri: string; fileName: string; mimeType: string };
  };
  OPEN_FILE: {
    request: { uri: string; mimeType: string };
    response: { success: boolean };
  };
  GET_NETWORK_STATUS: {
    request: {};
    response: { isConnected: boolean | null; isInternetReachable: boolean | null; type?: string };
  };
};

export type NativeBridgeRequestType = keyof NativeBridgeRequestMap;

export interface NativeBridgeRequest<K extends NativeBridgeRequestType = NativeBridgeRequestType> {
  type: K;
  requestId: string;
  payload: NativeBridgeRequestMap[K]['request'];
}

export interface NativeBridgeResponse {
  type: string;
  requestId: string;
  payload?: any;
  error?: {
    code: string;
    message: string;
  };
}
