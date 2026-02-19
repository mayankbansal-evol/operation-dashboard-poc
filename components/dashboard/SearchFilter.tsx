"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  salesperson: string;
  onSalespersonChange: (val: string) => void;
  salespersons: string[];
  hasFilters: boolean;
  onClear: () => void;
}

export function SearchFilter({
  search,
  onSearchChange,
  salesperson,
  onSalespersonChange,
  salespersons,
  hasFilters,
  onClear,
}: SearchFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customer or order #…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-8 text-sm"
        />
      </div>

      {/* Salesperson filter */}
      <Select
        value={salesperson || "__all__"}
        onValueChange={(v) => onSalespersonChange(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="h-9 w-[160px] text-sm">
          <SelectValue placeholder="All staff" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All staff</SelectItem>
          {salespersons.map((sp) => (
            <SelectItem key={sp} value={sp}>
              {sp}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-9 gap-1.5 text-xs text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
