import { useState, useEffect } from "react";
import { nativeBridge } from "./nativeBridge";

export type NetworkStatus = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

/**
 * Hook to consume normalized network connectivity status.
 * Interoperable across normal browser mode (navigator.onLine) and the WebView bridge.
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true, // Keep stable default to avoid UI flickering
    isInternetReachable: true,
  });
  const [isUnknown, setIsUnknown] = useState(true);

  useEffect(() => {
    const updateState = (nextStatus: Partial<NetworkStatus>) => {
      setStatus((prev) => ({
        isConnected: nextStatus.isConnected ?? prev.isConnected,
        isInternetReachable: nextStatus.isInternetReachable ?? prev.isInternetReachable,
      }));
      setIsUnknown(false);
    };

    // 1. Browser online/offline event handlers
    const handleBrowserOnline = () => updateState({ isConnected: true, isInternetReachable: true });
    const handleBrowserOffline = () => updateState({ isConnected: false, isInternetReachable: false });

    window.addEventListener("online", handleBrowserOnline);
    window.addEventListener("offline", handleBrowserOffline);

    // Initial check for browser environment
    if (typeof navigator !== "undefined") {
      updateState({
        isConnected: navigator.onLine,
        isInternetReachable: navigator.onLine,
      });
    }

    // 2. Native bridge listener integration
    if (nativeBridge.isAvailable()) {
      // Query initial status from native netinfo wrapper
      nativeBridge
        .request("GET_NETWORK_STATUS", {})
        .then((nativeStatus) => {
          if (nativeStatus) {
            updateState({
              isConnected: nativeStatus.isConnected,
              isInternetReachable: nativeStatus.isInternetReachable,
            });
          }
        })
        .catch((err) => {
          console.warn("Native Bridge: Failed to query network status", err);
        });

      // Subscribe to push connectivity updates from mobile shell
      const handleNativeStatusChange = (payload: any) => {
        if (payload) {
          updateState({
            isConnected: payload.isConnected,
            isInternetReachable: payload.isInternetReachable,
          });
        }
      };

      nativeBridge.addEventListener("NETWORK_STATUS_CHANGED", handleNativeStatusChange);

      return () => {
        window.removeEventListener("online", handleBrowserOnline);
        window.removeEventListener("offline", handleBrowserOffline);
        nativeBridge.removeEventListener("NETWORK_STATUS_CHANGED", handleNativeStatusChange);
      };
    }

    return () => {
      window.removeEventListener("online", handleBrowserOnline);
      window.removeEventListener("offline", handleBrowserOffline);
    };
  }, []);

  const isOffline = !status.isConnected || status.isInternetReachable === false;
  const isOnline = !isOffline && !isUnknown;

  return {
    isOffline,
    isOnline,
    isUnknown,
  };
}
