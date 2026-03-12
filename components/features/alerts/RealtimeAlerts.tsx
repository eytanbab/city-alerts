"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { ThreatType, type WebSocketAlert } from "@/lib/types";
import { ShieldAlert } from "lucide-react";
import { THREAT_CONFIG } from "./threat-config";
import { useAlerts } from "./use-alerts";
import { formatInTimeZone } from "date-fns-tz";

const ISRAEL_TZ = "Asia/Jerusalem";

export function RealtimeAlerts() {
  const handleAlert = useCallback((alert: WebSocketAlert) => {
    const config =
      THREAT_CONFIG[alert.threat] || THREAT_CONFIG[ThreatType.GeneralAlert];
    const Icon = config.icon;

    // Shadcn-style toast design
    toast(
      <div className="flex flex-col w-full gap-2 p-1">
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <div
              className={`p-1 rounded-md ${config.iconBg} ${config.accentColor}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <h3
              className={`text-sm font-semibold leading-none ${config.accentColor}`}
            >
              {config.label}
            </h3>
          </div>
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
              alert.isDrill
                ? "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800"
                : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-500 border-red-100 dark:border-red-900/50"
            }`}
          >
            {!alert.isDrill && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
            )}
            <span className="text-xs font-semibold uppercase tracking-tight">
              {alert.isDrill ? "תרגיל" : "אמת"}
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
              {formatInTimeZone(new Date(), ISRAEL_TZ, "HH:mm")}
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

  useAlerts(handleAlert);

  return null;
}
