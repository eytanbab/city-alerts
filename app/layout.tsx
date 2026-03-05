import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ModeToggle";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main
            className="container mx-auto px-4 py-6 md:py-10 max-w-6xl min-h-screen flex flex-col items-center gap-8 md:gap-12"
            dir="rtl"
          >
            <div className="w-full flex justify-end">
              <ModeToggle />
            </div>
            {children}
          </main>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
