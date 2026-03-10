import { useEffect, useRef } from "react";
import { type WebSocketAlert, ThreatType } from "@/lib/types";

const WEBSOCKET_URL = "wss://ws.tzevaadom.co.il/socket?platform=WEB";
const PROXY_API_URL = "/api/alerts";

export function useAlerts(onAlert: (alert: WebSocketAlert) => void) {
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let pollingTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;

    const handleAlertWithDeduplication = (alert: WebSocketAlert) => {
      // Basic deduplication
      const alertId =
        alert.notificationId ||
        `${alert.threat}-${alert.cities.sort().join(",")}-${Math.floor(Date.now() / 15000)}`;

      if (seenIds.current.has(alertId)) return;

      seenIds.current.add(alertId);
      if (seenIds.current.size > 100) {
        const firstValue = seenIds.current.values().next().value;
        if (firstValue) seenIds.current.delete(firstValue);
      }

      onAlert(alert);
    };

    const startPollingFallback = () => {
      if (pollingTimeout) return;
      console.log(
        "WebSocket unavailable. Starting proxy-based backup polling...",
      );

      const poll = async () => {
        if (!isMounted) return;
        try {
          const response = await fetch(PROXY_API_URL);
          if (response.ok) {
            const alerts = await response.json();
            if (Array.isArray(alerts)) {
              alerts.forEach((a: WebSocketAlert) => handleAlertWithDeduplication(a));
            }
          }
        } catch {
          // Fail silently
        } finally {
          if (isMounted) {
            pollingTimeout = setTimeout(poll, 5000);
          }
        }
      };
      poll();
    };

    const stopPollingFallback = () => {
      if (pollingTimeout) {
        clearTimeout(pollingTimeout);
        pollingTimeout = null;
      }
    };

    const connect = () => {
      try {
        socket = new WebSocket(WEBSOCKET_URL);

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === "ALERT") {
              handleAlertWithDeduplication(payload.data as WebSocketAlert);
            }
          } catch {
            // Fail silently
          }
        };

        socket.onopen = () => {
          stopPollingFallback();
        };

        socket.onclose = () => {
          if (!isMounted) return;
          startPollingFallback();
          reconnectTimeout = setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          socket?.close();
        };
      } catch {
        startPollingFallback();
      }
    };

    connect();

    // Development Helpers (globally accessible but controlled here)
    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __triggerTestAlert: () => void }).__triggerTestAlert = () => {
        handleAlertWithDeduplication({
          cities: ["תל אביב - יפו", "גבעתיים", "רמת גן"],
          threat: ThreatType.Rockets,
          isDrill: false,
          notificationId: `test-${Date.now()}`,
        });
      };

      (window as unknown as { __triggerMassiveAlert: () => void }).__triggerMassiveAlert = () => {
        const manyCities = Array.from(
          { length: 150 },
          (_, i) => `עיר בדיקה ${i + 1}`,
        );
        handleAlertWithDeduplication({
          cities: manyCities,
          threat: ThreatType.Rockets,
          isDrill: false,
          notificationId: `massive-${Date.now()}`,
        });
      };
    }

    return () => {
      isMounted = false;
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      stopPollingFallback();
      clearTimeout(reconnectTimeout);
    };
  }, [onAlert]);
}
