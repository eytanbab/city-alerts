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
    accentColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-600/5 dark:bg-red-400/5",
    icon: Rocket,
  },
  [ThreatType.HazardousMaterials]: {
    label: "חומרים מסוכנים",
    accentColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-600/5 dark:bg-purple-400/5",
    icon: Zap,
  },
  [ThreatType.Terrorists]: {
    label: "חדירת מחבלים",
    accentColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-600/5 dark:bg-amber-400/5",
    icon: ShieldAlert,
  },
  [ThreatType.Earthquake]: {
    label: "רעידת אדמה",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-600/5 dark:bg-emerald-400/5",
    icon: AlertTriangle,
  },
  [ThreatType.Tsunami]: {
    label: "חשש לצונאמי",
    accentColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-600/5 dark:bg-sky-400/5",
    icon: Waves,
  },
  [ThreatType.UnmannedAircraft]: {
    label: "חדירת כלי טיס",
    accentColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-600/5 dark:bg-orange-400/5",
    icon: Plane,
  },
  [ThreatType.NonConventionalMissile]: {
    label: "אירוע רדיולוגי",
    accentColor: "text-pink-600 dark:text-pink-400",
    iconBg: "bg-pink-600/5 dark:bg-pink-400/5",
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
    accentColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-600/5 dark:bg-slate-400/5",
    icon: Info,
  },
  [ThreatType.Drill]: {
    label: "תרגיל",
    accentColor: "text-slate-700 dark:text-slate-500",
    iconBg: "bg-slate-700/5 dark:bg-slate-500/5",
    icon: Info,
  },
};
