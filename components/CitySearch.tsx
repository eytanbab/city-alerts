'use client';

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

interface CitySearchProps {
  cities: string[];
  onSearch: (city: string) => void;
  selectedCity?: string;
}

const ITEMS_PER_PAGE = 100;

export function CitySearch({ cities, onSearch, selectedCity }: CitySearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);

  // Manual filtering of cities based on search term
  const allFilteredCities = React.useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return cities;
    return cities.filter((city) => city.toLowerCase().includes(search));
  }, [cities, searchTerm]);

  // Subset of cities to actually render in the DOM
  const visibleCities = React.useMemo(() => {
    return allFilteredCities.slice(0, visibleCount);
  }, [allFilteredCities, visibleCount]);

  // Reset visible count when search term changes or dropdown opens
  React.useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, open]);

  // Handle scroll to load more items
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const threshold = 100; // px from the bottom
    
    if (target.scrollHeight - target.scrollTop - target.clientHeight < threshold) {
      if (visibleCount < allFilteredCities.length) {
        // Use functional update to avoid stale closure
        setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, allFilteredCities.length));
      }
    }
  };

  return (
    <div className="flex w-full max-w-md items-center gap-2" dir="rtl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-right font-normal"
          >
            {selectedCity ? selectedCity : "חפש עיר..."}
            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="הקלד שם עיר..." 
              className="h-9 text-right" 
              dir="rtl"
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-[300px] overflow-y-auto" onScroll={handleScroll}>
              <CommandEmpty>לא נמצאו ערים.</CommandEmpty>
              <CommandGroup>
                {visibleCities.map((city) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={(currentValue) => {
                      onSearch(currentValue);
                      setOpen(false);
                    }}
                    className="text-right flex items-center justify-between"
                  >
                    {city}
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selectedCity === city ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
                {visibleCount < allFilteredCities.length && (
                  <div className="py-2 text-center text-xs text-muted-foreground animate-pulse">
                    טוען ערים נוספות...
                  </div>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
