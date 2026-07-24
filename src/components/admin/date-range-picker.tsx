"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

interface DateRangePickerProps {
  onDateChange: (range: DateRange) => void;
  className?: string;
  defaultLabel?: string;
}

export function DateRangePicker({ onDateChange, className, defaultLabel = "Last 30 Days" }: DateRangePickerProps) {
  const [selectedLabel, setSelectedLabel] = React.useState(defaultLabel);
  const [customRange, setCustomRange] = React.useState<{from: string, to: string}>({ from: "", to: "" });
  const [showCustom, setShowCustom] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // Initialize with default on mount
  React.useEffect(() => {
    handleSelectPreset(defaultLabel);
  }, []);

  const handleSelectPreset = (label: string) => {
    setSelectedLabel(label);
    setShowCustom(false);
    
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (label) {
      case "Today":
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      case "Yesterday":
        from = startOfDay(subDays(today, 1));
        to = endOfDay(subDays(today, 1));
        break;
      case "Last 7 Days":
        from = startOfDay(subDays(today, 6));
        to = endOfDay(today);
        break;
      case "Last 30 Days":
        from = startOfDay(subDays(today, 29));
        to = endOfDay(today);
        break;
      case "This Month":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case "Last Month":
        const lastMonth = subMonths(today, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
      case "Last 3 Months":
        from = startOfMonth(subMonths(today, 2));
        to = endOfMonth(today);
        break;
      case "Last 6 Months":
        from = startOfMonth(subMonths(today, 5));
        to = endOfMonth(today);
        break;
      case "This Year":
        from = startOfYear(today);
        to = endOfMonth(today); // current up to today
        break;
      case "Custom Date Range":
        setShowCustom(true);
        // Do not fire onDateChange until they submit the custom range
        return;
      default:
        from = startOfDay(subDays(today, 29));
        to = endOfDay(today);
    }

    if (label !== "Custom Date Range") {
      onDateChange({ from, to, label });
      setIsOpen(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customRange.from && customRange.to) {
      const from = startOfDay(new Date(customRange.from));
      const to = endOfDay(new Date(customRange.to));
      setSelectedLabel(`Custom: ${format(from, "MMM dd")} - ${format(to, "MMM dd")}`);
      onDateChange({ from, to, label: "Custom Date Range" });
      setIsOpen(false);
    }
  };

  const presets = [
    "Today", "Yesterday", "Last 7 Days", "Last 30 Days", 
    "This Month", "Last Month", "Last 3 Months", 
    "Last 6 Months", "This Year", "Custom Date Range"
  ];

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        {/* @ts-ignore */}
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[260px] justify-start text-left font-normal bg-background">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="flex-1">{selectedLabel}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[260px] max-h-[400px] overflow-y-auto" align="start">
          {presets.map((preset) => (
            <DropdownMenuItem 
              key={preset} 
              onClick={(e) => {
                e.preventDefault();
                handleSelectPreset(preset);
              }}
              className={selectedLabel.startsWith(preset) ? "bg-secondary" : ""}
            >
              {preset}
            </DropdownMenuItem>
          ))}

          {showCustom && (
            <>
              <DropdownMenuSeparator />
              <div className="p-3 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                  <Input 
                    type="date" 
                    value={customRange.from} 
                    onChange={(e) => setCustomRange(prev => ({...prev, from: e.target.value}))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">End Date</label>
                  <Input 
                    type="date" 
                    value={customRange.to} 
                    onChange={(e) => setCustomRange(prev => ({...prev, to: e.target.value}))}
                  />
                </div>
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={(e) => { e.preventDefault(); handleCustomSubmit(); }}
                  disabled={!customRange.from || !customRange.to}
                >
                  Apply Custom Range
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
