import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 gap-6 text-center"
      dir="rtl"
    >
      <div className="p-4 bg-muted rounded-full">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">הדף לא נמצא</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          מצטערים, לא הצלחנו למצוא את הדף שחיפשת. ייתכן שהקישור שבור או שהדף
          הוסר.
        </p>
      </div>
      <Button asChild className="px-8 py-6 text-lg rounded-xl">
        <Link href="/">חזרה לדף הבית</Link>
      </Button>
    </div>
  );
}
