import { getDashboardData } from '@/lib/data';
import { DashboardClient } from '@/components/DashboardClient';
import { ModeToggle } from '@/components/ModeToggle';

export default async function Home() {
  const data = await getDashboardData();

  return (
    <main className="container mx-auto px-4 py-6 md:py-10 max-w-6xl min-h-screen flex flex-col items-center gap-8 md:gap-12" dir="rtl">
      <div className="w-full flex justify-end">
        <ModeToggle />
      </div>
      <div className="w-full text-center flex flex-col gap-3">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          התפלגות אזעקות במבצע שאגת הארי
        </h1>
        <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          ויזואליזציה של תדירות אזעקות ומגמות עם נתונים מעודכנים לכל עיר ויישוב.
        </p>
      </div>

      <DashboardClient initialData={data} />
      
      <footer className="text-sm text-muted-foreground text-center flex flex-col gap-3 w-full border-t border-border/40">
        <div className="flex flex-col md:flex-row items-center justify-center p-4 gap-2 md:gap-6">
          <p className="font-medium">הנתונים מתעדכנים בזמן אמת</p>
          <span className="hidden md:block opacity-30">•</span>
          <p>
            מקור: <a href="https://www.tzevaadom.co.il" className="underline underline-offset-4 hover:text-foreground transition-all font-medium" target="_blank" rel="noopener noreferrer">צבע אדום</a>
          </p>
          <span className="hidden md:block opacity-30">•</span>
          <p>
            פותח על ידי <a href="https://github.com/eytanbab" className="underline underline-offset-4 hover:text-foreground transition-all font-medium" target="_blank" rel="noopener noreferrer">eytanbab</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
