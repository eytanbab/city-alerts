"use client";

import { useState, useMemo, useId, type UIEvent } from "react";
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
  selectedCities?: string[];
}

const ITEMS_PER_PAGE = 100;

export function CitySearch({
  cities,
  onSearch,
  selectedCities = [],
}: CitySearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
  const [prevOpen, setPrevOpen] = useState(open);

  // Manual filtering of cities based on search term
  const allFilteredCities = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return cities;
    return cities.filter((city) => city.toLowerCase().includes(search));
  }, [cities, searchTerm]);

  // Reset visible count when search term changes or dropdown opens
  if (searchTerm !== prevSearchTerm || open !== prevOpen) {
    setPrevSearchTerm(searchTerm);
    setPrevOpen(open);
    setVisibleCount(ITEMS_PER_PAGE);

    // BUG FIX: Reset search term when the popover is closed
    if (!open && searchTerm !== "") {
      setSearchTerm("");
    }
  }

  // Subset of cities to actually render in the DOM
  const visibleCities = useMemo(() => {
    return allFilteredCities.slice(0, visibleCount);
  }, [allFilteredCities, visibleCount]);

  // Handle scroll to load more items
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const threshold = 100; // px from the bottom

    if (
      target.scrollHeight - target.scrollTop - target.clientHeight <
      threshold
    ) {
      if (visibleCount < allFilteredCities.length) {
        // Use functional update to avoid stale closure
        setVisibleCount((prev) =>
          Math.min(prev + ITEMS_PER_PAGE, allFilteredCities.length),
        );
      }
    }
  };

  const listId = useId();

  return (
    <div className="flex w-full max-w-md items-center gap-2" dir="rtl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            className="w-full justify-between text-right font-normal cursor-pointer"
          >
            {selectedCities.length > 0
              ? selectedCities.length === 1
                ? selectedCities[0]
                : `${selectedCities.length} ערים נבחרו`
              : "חפש עיר..."}
            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="הקלד שם עיר..."
              className="h-9 text-right"
              dir="rtl"
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList
              id={listId}
              className="max-h-75 overflow-y-auto"
              onScroll={handleScroll}
            >
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
                    className="text-right flex items-center justify-between cursor-pointer"
                  >
                    {city}
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selectedCities.includes(city)
                          ? "opacity-100"
                          : "opacity-0",
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
