"use client";

import { useMemo, useState } from "react";
import { OrderList } from "@/components/dashboard/OrderList";
import { PipelineSummary } from "@/components/dashboard/PipelineSummary";
import { SearchFilter } from "@/components/dashboard/SearchFilter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockOrders } from "@/lib/mock-data";
import { cn, formatDate, getUrgencyLevel } from "@/lib/utils";
import { STAGES, type Stage, type UrgencyLevel } from "@/types";

type TypeFilter = "all" | "order" | "enquiry";

export default function DashboardPage() {
  // Search and filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [stageFilter, setStageFilter] = useState<Stage | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | null>(null);
  const [staffSearch, setStaffSearch] = useState("");

  // Derive counts for type toggle (unfiltered)
  const typeCounts = useMemo(() => {
    return mockOrders.reduce(
      (acc, o) => {
        acc[o.type] = (acc[o.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<TypeFilter, number>,
    );
  }, []);

  // Derive pipeline counts (filtered by type if typeFilter is active)
  const stageCounts = useMemo(() => {
    const counts = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<
      Stage,
      number
    >;
    for (const order of mockOrders) {
      if (typeFilter !== "all" && order.type !== typeFilter) continue;
      counts[order.currentStage] = (counts[order.currentStage] ?? 0) + 1;
    }
    return counts;
  }, [typeFilter]);

  // All unique people (sales + vendor) for the combobox
  const allPeople = useMemo(() => {
    const sales = [...new Set(mockOrders.map((o) => o.salespersonName))];
    const vendors = [
      ...new Set(
        mockOrders.map((o) => o.vendorName).filter((v): v is string => !!v),
      ),
    ];
    return { sales, vendors };
  }, []);

  // Urgency breakdown (unfiltered)
  const urgencyCounts = useMemo(() => {
    return mockOrders.reduce(
      (acc, o) => {
        const level = getUrgencyLevel(o.deliveryDate);
        acc[level] = (acc[level] ?? 0) + 1;
        return acc;
      },
      {} as Record<UrgencyLevel, number>,
    );
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockOrders.filter((order) => {
      // Type filter
      if (typeFilter !== "all" && order.type !== typeFilter) return false;

      // Stage filter
      if (stageFilter && order.currentStage !== stageFilter) return false;

      // Urgency filter
      if (urgencyFilter) {
        const level = getUrgencyLevel(order.deliveryDate);
        if (level !== urgencyFilter) return false;
      }

      // Staff search (matches salesperson OR vendor)
      if (staffSearch.trim()) {
        const staffQ = staffSearch.trim().toLowerCase();
        const matchesSales = order.salespersonName
          .toLowerCase()
          .includes(staffQ);
        const matchesVendor = order.vendorName?.toLowerCase().includes(staffQ);
        if (!matchesSales && !matchesVendor) return false;
      }

      // General search
      if (q) {
        const haystack = [
          order.customerName,
          order.orderNumber ?? "",
          order.shareableToken,
          order.vendorName ?? "",
          order.salespersonName,
          order.category,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [search, typeFilter, stageFilter, urgencyFilter, staffSearch]);

  // Active filters for chips
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; onRemove: () => void }[] = [];
    if (typeFilter !== "all") {
      filters.push({
        key: "type",
        label: typeFilter === "order" ? "Orders only" : "Enquiries only",
        onRemove: () => setTypeFilter("all"),
      });
    }
    if (stageFilter) {
      filters.push({
        key: "stage",
        label: `Stage: ${stageFilter}`,
        onRemove: () => setStageFilter(null),
      });
    }
    if (urgencyFilter) {
      const labels: Record<UrgencyLevel, string> = {
        overdue: "Overdue",
        "due-soon": "Due soon",
        "on-track": "On track",
        none: "No date",
      };
      filters.push({
        key: "urgency",
        label: labels[urgencyFilter],
        onRemove: () => setUrgencyFilter(null),
      });
    }
    if (staffSearch.trim()) {
      filters.push({
        key: "staff",
        label: `People: ${staffSearch.trim()}`,
        onRemove: () => setStaffSearch(""),
      });
    }
    return filters;
  }, [typeFilter, stageFilter, urgencyFilter, staffSearch]);

  const hasFilters =
    !!search ||
    typeFilter !== "all" ||
    !!stageFilter ||
    !!urgencyFilter ||
    !!staffSearch.trim();

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setStageFilter(null);
    setUrgencyFilter(null);
    setStaffSearch("");
  }

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Operations Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filteredOrders.length} of {mockOrders.length} records
              {typeFilter !== "all" && (
                <span className="ml-1 text-foreground">
                  · {typeFilter === "order" ? "orders" : "enquiries"} only
                </span>
              )}
            </p>
          </div>

          {/* Urgency quick filters with tooltips */}
          <div className="flex flex-wrap items-center gap-2">
            {urgencyCounts.overdue > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      setUrgencyFilter(
                        urgencyFilter === "overdue" ? null : "overdue",
                      )
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                      urgencyFilter === "overdue"
                        ? "border-red-400 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
                        : "border-border bg-card text-muted-foreground hover:border-red-300 hover:bg-red-50/50",
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="font-medium">{urgencyCounts.overdue}</span>
                    <span>overdue</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">
                    Click to{" "}
                    {urgencyFilter === "overdue" ? "show all" : "filter"}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {urgencyCounts["due-soon"] > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      setUrgencyFilter(
                        urgencyFilter === "due-soon" ? null : "due-soon",
                      )
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                      urgencyFilter === "due-soon"
                        ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "border-border bg-card text-muted-foreground hover:border-amber-300 hover:bg-amber-50/50",
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="font-medium">
                      {urgencyCounts["due-soon"]}
                    </span>
                    <span>due soon</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">
                    Click to{" "}
                    {urgencyFilter === "due-soon" ? "show all" : "filter"}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {urgencyCounts["on-track"] > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      setUrgencyFilter(
                        urgencyFilter === "on-track" ? null : "on-track",
                      )
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                      urgencyFilter === "on-track"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "border-border bg-card text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50",
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-medium">
                      {urgencyCounts["on-track"]}
                    </span>
                    <span>on track</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">
                    Click to{" "}
                    {urgencyFilter === "on-track" ? "show all" : "filter"}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* ── Pipeline summary (counts filtered by type) ─────────────── */}
        <PipelineSummary
          stageCounts={stageCounts}
          activeFilter={stageFilter}
          onFilterChange={setStageFilter}
          typeFilter={typeFilter}
        />

        {/* ── Search + filters ─────────────────────────────────────────── */}
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          typeCounts={typeCounts}
          staffSearch={staffSearch}
          onStaffChange={setStaffSearch}
          allPeople={allPeople}
          activeFilters={activeFilters}
          hasFilters={hasFilters}
          onClear={clearFilters}
        />

        {/* ── Order list ───────────────────────────────────────────────── */}
        <OrderList orders={filteredOrders} />

        {/* ── Results info ─────────────────────────────────────────────── */}
        {hasFilters && filteredOrders.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Showing {filteredOrders.length} of {mockOrders.length} records
            {activeFilters.length > 0 && (
              <span className="ml-1">
                · filtered by {activeFilters.map((f) => f.label).join(", ")}
              </span>
            )}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}
