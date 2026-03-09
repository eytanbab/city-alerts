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
import { ThreatType } from "@/lib/types";

export const THREAT_CONFIG: Record<
  ThreatType,
  { label: string; accentColor: string; iconBg: string; icon: LucideIcon }
> = {
  [ThreatType.Rockets]: {
    label: "צבע אדום",
    accentColor: "text-red-700 dark:text-red-500",
    iconBg: "bg-red-700/5 dark:bg-red-500/5",
    icon: Rocket,
  },
  [ThreatType.HazardousMaterials]: {
    label: "חומרים מסוכנים",
    accentColor: "text-purple-700 dark:text-purple-500",
    iconBg: "bg-purple-700/5 dark:bg-purple-500/5",
    icon: Zap,
  },
  [ThreatType.Terrorists]: {
    label: "חדירת מחבלים",
    accentColor: "text-amber-700 dark:text-amber-500",
    iconBg: "bg-amber-700/5 dark:bg-amber-500/5",
    icon: ShieldAlert,
  },
  [ThreatType.Earthquake]: {
    label: "רעידת אדמה",
    accentColor: "text-emerald-700 dark:text-emerald-500",
    iconBg: "bg-emerald-700/5 dark:bg-emerald-500/5",
    icon: AlertTriangle,
  },
  [ThreatType.Tsunami]: {
    label: "חשש לצונאמי",
    accentColor: "text-sky-700 dark:text-sky-500",
    iconBg: "bg-sky-700/5 dark:bg-sky-500/5",
    icon: Waves,
  },
  [ThreatType.UnmannedAircraft]: {
    label: "חדירת כלי טיס",
    accentColor: "text-orange-700 dark:text-orange-500",
    iconBg: "bg-orange-700/5 dark:bg-orange-500/5",
    icon: Plane,
  },
  [ThreatType.NonConventionalMissile]: {
    label: "אירוע רדיולוגי",
    accentColor: "text-pink-700 dark:text-pink-500",
    iconBg: "bg-pink-700/5 dark:bg-pink-500/5",
    icon: Radiation,
  },
  [ThreatType.Radiological]: {
    label: "ירי בלתי קונבנציונלי",
    accentColor: "text-pink-700 dark:text-pink-500",
    iconBg: "bg-pink-700/5 dark:bg-pink-500/5",
    icon: Radiation,
  },
  [ThreatType.GeneralAlert]: {
    label: "התרעה",
    accentColor: "text-slate-700 dark:text-slate-500",
    iconBg: "bg-slate-700/5 dark:bg-slate-500/5",
    icon: Info,
  },
  [ThreatType.Drill]: {
    label: "תרגיל",
    accentColor: "text-slate-700 dark:text-slate-500",
    iconBg: "bg-slate-700/5 dark:bg-slate-500/5",
    icon: Info,
  },
};
