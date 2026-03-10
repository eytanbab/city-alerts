import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { Toaster } from "@/components/ui/sonner";
import { RealtimeAlerts } from "@/components/features/alerts/RealtimeAlerts";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";

import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | התרעות צבע אדום",
    default: "התרעות צבע אדום - מבצע שאגת הארי",
  },
  description:
    "ויזואליזציה של התפלגות התרעות צבע אדום, מגמות יומיות וניתוח לפי עיר עבור ערי ישראל. נתונים מעודכנים החל מפברואר 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <main
                className="container mx-auto px-4 py-6 md:py-10 max-w-6xl min-h-screen flex flex-col items-center gap-8 md:gap-12"
                dir="rtl"
              >
                <div className="w-full flex justify-end">
                  <ModeToggle />
                </div>
                {children}
                <Script
                  id="bmc-widget"
                  src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
                  data-name="BMC-Widget"
                  data-cfasync="false"
                  data-id="cityalerts"
                  data-description="Support me on Buy me a coffee!"
                  data-message="If you found this helpful, feel free to buy me a coffee."
                  data-color="#5F7FFF"
                  data-position="Right"
                  data-x_margin="18"
                  data-y_margin="18"
                  strategy="afterInteractive"
                />
              </main>
              <Toaster richColors closeButton dir="rtl" position="top-right" />
              <ErrorBoundary name="Realtime Alerts" fallback={null}>
                <RealtimeAlerts />
              </ErrorBoundary>
              <Analytics />
            </TooltipProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
