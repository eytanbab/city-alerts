"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center py-24 gap-6 text-center"
      dir="rtl"
    >
      <div className="p-4 bg-destructive/10 rounded-full">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">משהו השתבש...</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          אירעה שגיאה בטעינת הנתונים. ייתכן שישנה בעיית תקשורת זמנית.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          נסה שוב
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">חזרה לדף הבית</Link>
        </Button>
      </div>
    </div>
  );
}
