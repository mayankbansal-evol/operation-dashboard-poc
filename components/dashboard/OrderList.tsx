"use client";

import { ArrowUpRight, Inbox } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  cn,
  formatDate,
  formatDaysRemaining,
  getUrgencyLevel,
} from "@/lib/utils";
import type { Order } from "@/types";
import { UrgencyDot } from "./UrgencyDot";

interface OrderListProps {
  orders: Order[];
}

const STAGE_COLORS: Record<string, string> = {
  Enquiry:
    "border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
  Estimation:
    "border-sky-200 text-sky-600 dark:border-sky-800 dark:text-sky-400",
  "CAD Design":
    "border-violet-200 text-violet-600 dark:border-violet-800 dark:text-violet-400",
  "Order Confirmed":
    "border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400",
  Building:
    "border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400",
  Certification:
    "border-orange-200 text-orange-600 dark:border-orange-800 dark:text-orange-400",
  "Shipped to Store":
    "border-teal-200 text-teal-600 dark:border-teal-800 dark:text-teal-400",
  "Customer Pickup":
    "border-emerald-200 text-emerald-700 bg-emerald-50/50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/20",
};

export function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <Inbox className="mb-3 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">
          No orders found
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Column headers */}
      <div className="grid grid-cols-[16px_1fr_148px_110px_110px_108px_28px] items-center gap-3 border-b border-border bg-muted/30 px-4 py-2">
        <span />
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
          Customer
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
          Stage
        </span>
        <span className="hidden text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 md:block">
          Salesperson
        </span>
        <span className="hidden text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 lg:block">
          Vendor
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
          Delivery
        </span>
        <span />
      </div>

      {/* Rows */}
      <ul className="divide-y divide-border/60">
        {orders.map((order) => {
          const urgency = getUrgencyLevel(order.deliveryDate);
          const daysLabel = formatDaysRemaining(order.deliveryDate);
          const deliveryFormatted = order.deliveryDate
            ? formatDate(order.deliveryDate)
            : "—";
          const stageColorClass =
            STAGE_COLORS[order.currentStage] ??
            "border-border text-muted-foreground";

          return (
            <li key={order.id}>
              <Link
                href={`/orders/${order.shareableToken}`}
                className="group grid grid-cols-[16px_1fr_148px_110px_110px_108px_28px] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30"
              >
                {/* Urgency dot */}
                <div className="flex items-center justify-center">
                  <UrgencyDot level={urgency} />
                </div>

                {/* Customer + meta */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {order.customerName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {order.type === "order" && order.orderNumber
                      ? order.orderNumber
                      : "Enquiry"}{" "}
                    · {order.category}
                  </p>
                </div>

                {/* Stage */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      stageColorClass,
                    )}
                  >
                    {order.currentStage}
                  </span>
                </div>

                {/* Salesperson */}
                <div className="hidden md:block">
                  <p className="truncate text-sm text-foreground">
                    {order.salespersonName}
                  </p>
                </div>

                {/* Vendor */}
                <div className="hidden lg:block">
                  <p className="truncate text-sm text-muted-foreground">
                    {order.vendorName ?? "—"}
                  </p>
                </div>

                {/* Delivery */}
                <div>
                  <p className="text-sm text-foreground tabular-nums">
                    {deliveryFormatted}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] tabular-nums",
                      urgency === "overdue" &&
                        "font-medium text-red-600 dark:text-red-400",
                      urgency === "due-soon" &&
                        "font-medium text-amber-600 dark:text-amber-400",
                      urgency === "on-track" && "text-muted-foreground",
                      urgency === "none" && "text-muted-foreground/50",
                    )}
                  >
                    {daysLabel}
                  </p>
                </div>

                {/* Link arrow */}
                <div className="flex justify-end">
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/25 transition-colors group-hover:text-muted-foreground" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
