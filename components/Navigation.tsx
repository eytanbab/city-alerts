import Link from "next/link";
import { LayoutDashboard, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "מבט כללי",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "ניתוח לפי עיר",
    href: "/analysis",
    icon: MapPin,
  },
];

interface NavigationProps {
  currentPath: string;
}

export function Navigation({ currentPath }: NavigationProps) {
  return (
    <nav className="flex justify-center mb-2" dir="rtl">
      <div className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-card rounded-xl border">
        {navItems.map((item) => {
          const isActive = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-colors",
                isActive
                  ? "bg-background text-foreground border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
