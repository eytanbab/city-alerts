"use client";

import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { ThreatType, type WebSocketAlert } from "@/lib/types";
import {
  AlertTriangle,
  ShieldAlert,
  Rocket,
  Plane,
  Zap,
  Waves,
  Radiation,
  Info,
  LucideIcon,
} from "lucide-react";

declare global {
  interface Window {
    __triggerTestAlert?: () => void;
    __triggerMassiveAlert?: () => void;
  }
}

const WEBSOCKET_URL = "wss://ws.tzevaadom.co.il/socket?platform=WEB";
const PROXY_API_URL = "/api/alerts";

const THREAT_CONFIG: Record<
  ThreatType,
  { label: string; accentColor: string; icon: LucideIcon }
> = {
  [ThreatType.Rockets]: {
    label: "צבע אדום",
    accentColor: "text-red-600 dark:text-red-400",
    icon: Rocket,
  },
  [ThreatType.HazardousMaterials]: {
    label: "חומרים מסוכנים",
    accentColor: "text-purple-600 dark:text-purple-400",
    icon: Zap,
  },
  [ThreatType.Terrorists]: {
    label: "חדירת מחבלים",
    accentColor: "text-amber-600 dark:text-amber-400",
    icon: ShieldAlert,
  },
  [ThreatType.Earthquake]: {
    label: "רעידת אדמה",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    icon: AlertTriangle,
  },
  [ThreatType.Tsunami]: {
    label: "חשש לצונאמי",
    accentColor: "text-sky-600 dark:text-sky-400",
    icon: Waves,
  },
  [ThreatType.UnmannedAircraft]: {
    label: "חדירת כלי טיס",
    accentColor: "text-orange-600 dark:text-orange-400",
    icon: Plane,
  },
  [ThreatType.NonConventionalMissile]: {
    label: "אירוע רדיולוגי",
    accentColor: "text-pink-600 dark:text-pink-400",
    icon: Radiation,
  },
  [ThreatType.Radiological]: {
    label: "ירי בלתי קונבנציונלי",
    accentColor: "text-pink-700 dark:text-pink-500",
    icon: Radiation,
  },
  [ThreatType.GeneralAlert]: {
    label: "התרעה",
    accentColor: "text-slate-600 dark:text-slate-400",
    icon: Info,
  },
  [ThreatType.Drill]: {
    label: "תרגיל",
    accentColor: "text-slate-700 dark:text-slate-500",
    icon: Info,
  },
};

export function RealtimeAlerts() {
  const seenIds = useRef<Set<string>>(new Set());

  const handleAlert = useCallback((alert: WebSocketAlert) => {
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

    const config =
      THREAT_CONFIG[alert.threat] || THREAT_CONFIG[ThreatType.GeneralAlert];
    const Icon = config.icon;

    // Shadcn-style toast design
    toast(
      <div className="flex flex-col w-full gap-2 p-1">
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md bg-muted ${config.accentColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3
              className={`text-sm font-bold leading-none ${config.accentColor}`}
            >
              {alert.isDrill ? `תרגיל: ${config.label}` : config.label}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tight">
              מבצעי
            </span>
          </div>
        </div>

        <div className="max-h-24 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            {alert.cities.join(", ")}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          <div className="flex items-center gap-1 opacity-70">
            <ShieldAlert className="w-3 h-3" />
            <span>
              פיקוד העורף •{" "}
              {new Date().toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>,
      {
        duration: 15000,
        className: `
        !w-[calc(100vw-2rem)] md:!w-full md:!max-w-[400px]
        !bg-card !text-card-foreground 
        !border-l-4 !border-r-0 !border-y-0 ${config.accentColor.replace("text-", "border-")} 
        !p-4 !rounded-lg !shadow-lg 
        !border-border
      `,
      },
    );
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let pollingTimeout: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxDelay = 60000;
    let isMounted = true;

    const startPollingFallback = () => {
      if (pollingTimeout) return;
      console.log("WebSocket unavailable. Starting proxy-based backup polling...");

      const poll = async () => {
        if (!isMounted) return;
        try {
          const response = await fetch(PROXY_API_URL);
          if (response.ok) {
            const alerts = await response.json();
            if (Array.isArray(alerts)) {
              alerts.forEach((a: WebSocketAlert) => handleAlert(a));
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
              handleAlert(payload.data as WebSocketAlert);
            }
          } catch {
            // Fail silently
          }
        };

        socket.onopen = () => {
          retryCount = 0;
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

    // Development Helper
    if (process.env.NODE_ENV === "development") {
      window.__triggerTestAlert = () => {
        handleAlert({
          cities: ["תל אביב - יפו", "גבעתיים", "רמת גן"],
          threat: ThreatType.Rockets,
          isDrill: false,
        });
      };

      window.__triggerMassiveAlert = () => {
        const manyCities = Array.from(
          { length: 150 },
          (_, i) => `עיר בדיקה ${i + 1}`,
        );
        handleAlert({
          cities: manyCities,
          threat: ThreatType.Rockets,
          isDrill: false,
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
  }, [handleAlert]);

  return null;
}
