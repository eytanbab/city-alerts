"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RegionFilterProps {
  regions: string[];
  selectedRegion: string | null;
  onSelect: (region: string | null) => void;
}

export function RegionFilter({
  regions,
  selectedRegion,
  onSelect,
}: RegionFilterProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex w-full max-w-xs items-center gap-2" dir="rtl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-right font-bold h-11 px-4 rounded-xl border-border bg-card shadow-sm hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">אזור:</span>
                <span>{selectedRegion ? selectedRegion : "כל הארץ"}</span>
            </div>
            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="חפש אזור..."
              className="h-9 text-right"
              dir="rtl"
            />
            <CommandList className="max-h-75 overflow-y-auto">
              <CommandEmpty>לא נמצאו אזורים.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                  className="text-right flex items-center justify-between cursor-pointer font-bold"
                >
                  כל הארץ
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      !selectedRegion ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
                {regions.map((region) => (
                  <CommandItem
                    key={region}
                    value={region}
                    onSelect={(currentValue) => {
                      onSelect(currentValue);
                      setOpen(false);
                    }}
                    className="text-right flex items-center justify-between cursor-pointer font-bold"
                  >
                    {region}
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selectedRegion === region ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
