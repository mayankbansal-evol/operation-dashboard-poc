"use client";

import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { UrgencyDot } from "@/components/dashboard/UrgencyDot";
import { ActivityFeed } from "@/components/order/ActivityFeed";
import { OrderDetails } from "@/components/order/OrderDetails";
import { PostUpdateForm } from "@/components/order/PostUpdateForm";
import { StageBar } from "@/components/order/StageBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getOrderByToken } from "@/lib/mock-data";
import {
  cn,
  formatDate,
  formatDaysRemaining,
  getUrgencyLevel,
} from "@/lib/utils";
import type { ActivityEntry, Order, Stage } from "@/types";

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy link
        </>
      )}
    </Button>
  );
}

export default function OrderPage() {
  const params = useParams();
  const token = params.token as string;

  const initialOrder = getOrderByToken(token);
  if (!initialOrder) notFound();

  // Local state to allow in-memory updates within a session
  const [order, setOrder] = useState<Order>(initialOrder);

  const urgency = getUrgencyLevel(order.deliveryDate);
  const daysLabel = formatDaysRemaining(order.deliveryDate);

  function handlePostUpdate({
    name,
    note,
    newStage,
  }: {
    name: string;
    note: string;
    newStage: Stage | null;
  }) {
    const timestamp = new Date().toISOString();

    const newEntries: ActivityEntry[] = [];

    if (newStage && newStage !== order.currentStage) {
      newEntries.push({
        id: `act-${Date.now()}-stage`,
        orderId: order.id,
        postedBy: name,
        timestamp,
        type: "stage_change",
        newStage,
        note: note || undefined,
      });
    } else if (note) {
      newEntries.push({
        id: `act-${Date.now()}-note`,
        orderId: order.id,
        postedBy: name,
        timestamp,
        type: "note",
        note,
      });
    }

    setOrder((prev) => ({
      ...prev,
      currentStage: newStage ?? prev.currentStage,
      lastUpdatedAt: timestamp,
      activityFeed: [...prev.activityFeed, ...newEntries],
    }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-0">
      {/* Back nav */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 gap-1.5 text-muted-foreground"
        >
          <Link href="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            All orders
          </Link>
        </Button>
      </div>

      {/* ── Order Header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          {/* Type + order number */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                order.type === "order"
                  ? "bg-foreground text-background"
                  : "border border-border text-muted-foreground",
              )}
            >
              {order.type === "order" ? "Order" : "Enquiry"}
            </span>
            {order.orderNumber && (
              <span className="font-mono text-sm text-muted-foreground">
                {order.orderNumber}
              </span>
            )}
          </div>

          {/* Customer name */}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {order.customerName}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{order.category}</span>
            <span className="text-border">·</span>
            <span>{order.salespersonName}</span>
            {order.vendorName && (
              <>
                <span className="text-border">·</span>
                <span>{order.vendorName}</span>
              </>
            )}
            {order.deliveryDate && (
              <>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5">
                  <UrgencyDot level={urgency} />
                  <span
                    className={cn(
                      urgency === "overdue" &&
                        "font-medium text-red-600 dark:text-red-400",
                      urgency === "due-soon" &&
                        "font-medium text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {formatDate(order.deliveryDate)} · {daysLabel}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {order.type === "enquiry" && (
            <Button size="sm" asChild>
              <Link href={`/orders/new?from=${order.id}`} className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Convert to Order
              </Link>
            </Button>
          )}
          <CopyLinkButton />
        </div>
      </div>

      {/* ── Stage Bar ─────────────────────────────────────────────────── */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Pipeline
        </p>
        <StageBar
          currentStage={order.currentStage}
          cadDesignRequired={order.cadDesignRequired}
        />
      </div>

      {/* ── Order Details ─────────────────────────────────────────────── */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Order Details
        </p>
        <OrderDetails order={order} />
      </div>

      {/* ── Activity + Update form ────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Activity feed */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Activity
            </p>
            <span className="text-xs text-muted-foreground">
              {order.activityFeed.length}{" "}
              {order.activityFeed.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <ActivityFeed entries={order.activityFeed} />
        </div>

        {/* Post update */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            Post an Update
          </p>
          <PostUpdateForm
            currentStage={order.currentStage}
            onSubmit={handlePostUpdate}
          />
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-12" />
    </div>
  );
}
