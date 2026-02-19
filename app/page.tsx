"use client";

import { useMemo, useState } from "react";
import { OrderList } from "@/components/dashboard/OrderList";
import { PipelineSummary } from "@/components/dashboard/PipelineSummary";
import { SearchFilter } from "@/components/dashboard/SearchFilter";
import { mockOrders } from "@/lib/mock-data";
import { getUrgencyLevel } from "@/lib/utils";
import { STAGES, type Stage } from "@/types";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | null>(null);
  const [salespersonFilter, setSalespersonFilter] = useState("");

  // Derive pipeline counts from all orders (unfiltered)
  const stageCounts = useMemo(() => {
    const counts = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<
      Stage,
      number
    >;
    for (const order of mockOrders) {
      counts[order.currentStage] = (counts[order.currentStage] ?? 0) + 1;
    }
    return counts;
  }, []);

  // All unique salespersons
  const salespersons = useMemo(() => {
    const names = [...new Set(mockOrders.map((o) => o.salespersonName))].sort();
    return names;
  }, []);

  // Urgency breakdown for summary
  const urgencyCounts = useMemo(() => {
    return mockOrders.reduce(
      (acc, o) => {
        const level = getUrgencyLevel(o.deliveryDate);
        acc[level] = (acc[level] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockOrders.filter((order) => {
      if (stageFilter && order.currentStage !== stageFilter) return false;
      if (salespersonFilter && order.salespersonName !== salespersonFilter)
        return false;
      if (q) {
        const haystack = [
          order.customerName,
          order.orderNumber ?? "",
          order.shareableToken,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [search, stageFilter, salespersonFilter]);

  const hasFilters = !!search || !!stageFilter || !!salespersonFilter;

  function clearFilters() {
    setSearch("");
    setStageFilter(null);
    setSalespersonFilter("");
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Operations Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {mockOrders.length} records across {STAGES.length} stages
          </p>
        </div>

        {/* Quick urgency summary */}
        <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
          {urgencyCounts.overdue > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              <span className="font-medium text-red-600 dark:text-red-400">
                {urgencyCounts.overdue} overdue
              </span>
            </span>
          )}
          {urgencyCounts["due-soon"] > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {urgencyCounts["due-soon"]} due soon
              </span>
            </span>
          )}
          {urgencyCounts["on-track"] > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                {urgencyCounts["on-track"]} on track
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Pipeline summary */}
      <PipelineSummary
        stageCounts={stageCounts}
        activeFilter={stageFilter}
        onFilterChange={setStageFilter}
      />

      {/* Active stage filter label */}
      {stageFilter && (
        <p className="text-sm text-muted-foreground">
          Showing orders in{" "}
          <span className="font-medium text-foreground">{stageFilter}</span>
        </p>
      )}

      {/* Search + filter bar */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        salesperson={salespersonFilter}
        onSalespersonChange={setSalespersonFilter}
        salespersons={salespersons}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      {/* Order list */}
      <OrderList orders={filteredOrders} />

      {/* Result count when filtered */}
      {hasFilters && filteredOrders.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredOrders.length} of {mockOrders.length} records
        </p>
      )}
    </div>
  );
}
