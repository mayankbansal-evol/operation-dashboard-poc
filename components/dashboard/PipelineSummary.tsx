"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { STAGES, type Stage } from "@/types";
import type { TypeFilter } from "./SearchFilter";

interface PipelineSummaryProps {
  stageCounts: Record<Stage, number>;
  activeFilter: Stage | null;
  onFilterChange: (stage: Stage | null) => void;
  typeFilter: TypeFilter;
}

const STAGE_SHORT: Record<Stage, string> = {
  Enquiry: "Enquiry",
  Estimation: "Estimation",
  "CAD Design": "CAD",
  "Order Confirmed": "Confirmed",
  Building: "Building",
  Certification: "Certify",
  "Shipped to Store": "Shipped",
  "Customer Pickup": "Pickup",
};

export function PipelineSummary({
  stageCounts,
  activeFilter,
  onFilterChange,
  typeFilter,
}: PipelineSummaryProps) {
  const typeLabel =
    typeFilter === "all"
      ? "records"
      : typeFilter === "order"
        ? "orders"
        : "enquiries";

  return (
    <TooltipProvider>
      <div className="w-full">
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {STAGES.map((stage) => {
            const count = stageCounts[stage] ?? 0;
            const isActive = activeFilter === stage;

            return (
              <Tooltip key={stage}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onFilterChange(isActive ? null : stage)}
                    className={cn(
                      "group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-1.5 py-3.5 text-center transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-foreground bg-foreground shadow-sm"
                        : "border-border bg-card hover:border-foreground/25 hover:bg-muted/50",
                      count === 0 && !isActive && "opacity-40",
                    )}
                  >
                    {/* Count — the hero number */}
                    <span
                      className={cn(
                        "text-xl font-bold leading-none tabular-nums tracking-tight",
                        isActive ? "text-background" : "text-foreground",
                      )}
                    >
                      {count}
                    </span>

                    {/* Stage name */}
                    <span
                      className={cn(
                        "line-clamp-1 text-[9.5px] font-medium uppercase tracking-wide",
                        isActive
                          ? "text-background/75"
                          : "text-muted-foreground",
                      )}
                    >
                      {STAGE_SHORT[stage]}
                    </span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute -top-0.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-background/60" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs">
                    <p className="font-medium">{stage}</p>
                    <p className="text-muted-foreground">
                      {count} {typeLabel}
                      {count === 1 ? "" : ""}
                      {isActive ? " · click to show all" : " · click to filter"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
