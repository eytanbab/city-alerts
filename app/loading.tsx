import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-6xl min-h-screen flex flex-col items-center gap-8 md:gap-12" dir="rtl">
      <div className="w-full flex justify-end">
        <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
      </div>
      
      <div className="w-full text-center flex flex-col gap-3">
        <div className="h-12 w-3/4 max-w-2xl mx-auto bg-muted animate-pulse rounded-xl" />
        <div className="h-6 w-1/2 max-w-md mx-auto bg-muted animate-pulse rounded-lg" />
      </div>

      <div className="w-full flex flex-col gap-8 md:gap-12 animate-pulse">
        <div className="hidden lg:flex justify-center">
          <div className="h-12 w-full max-w-md bg-muted/50 rounded-xl border border-border/50" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-background h-32 md:h-44 p-6 md:p-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
