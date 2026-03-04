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

export function CitySearch({ cities, onSearch, selectedCity }: CitySearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Virtualization-like optimization: Only render items that match the search term
  // to avoid rendering thousands of items at once.
  const filteredCities = React.useMemo(() => {
    if (!searchTerm) return cities.slice(0, 50); // Show top 50 when empty
    return cities
      .filter((city) => city.includes(searchTerm))
      .slice(0, 50); // Limit rendered items to 50
  }, [cities, searchTerm]);

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
            <CommandList>
              <CommandEmpty>לא נמצאו ערים.</CommandEmpty>
              <CommandGroup>
                {filteredCities.map((city) => (
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
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
