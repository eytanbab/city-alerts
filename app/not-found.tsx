import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 px-4">
      <div className="bg-muted p-6 rounded-full">
        <FileQuestion className="h-12 w-12 text-muted-foreground opacity-50" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">הדף לא נמצא</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          מצטערים, לא הצלחנו למצוא את הדף שחיפשת. ייתכן שהכתובת שגויה או שהדף
          הוסר.
        </p>
      </div>
      <Button asChild size="lg" className="font-semibold">
        <Link href="/">חזרה למסך הראשי</Link>
      </Button>
    </div>
  );
}
