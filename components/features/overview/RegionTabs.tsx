"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RegionTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function RegionTabs({ value, onValueChange }: RegionTabsProps) {
  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <Tabs
        defaultValue="all"
        value={value}
        onValueChange={onValueChange}
        className="w-fit mx-auto"
      >
        <TabsList className="bg-card gap-1">
          <TabsTrigger value="צפון">צפון</TabsTrigger>
          <TabsTrigger value="מרכז">מרכז</TabsTrigger>
          <TabsTrigger value="דרום">דרום</TabsTrigger>
          <TabsTrigger value="all">ארצי</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
