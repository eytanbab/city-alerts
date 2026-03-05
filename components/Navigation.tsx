'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'מבט כללי',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'ניתוח לפי עיר',
      href: '/analysis',
      icon: MapPin,
    },
  ];

  return (
    <nav className="flex justify-center mb-8" dir="rtl">
      <div className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl border border-border/50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-all",
                isActive 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
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
