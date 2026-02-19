import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { STAGES, type Stage, type UrgencyLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Stage helpers ────────────────────────────────────────────────────────────

export function getStageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}

export function isStageComplete(stage: Stage, currentStage: Stage): boolean {
  return getStageIndex(stage) < getStageIndex(currentStage);
}

export function isStageCurrent(stage: Stage, currentStage: Stage): boolean {
  return stage === currentStage;
}

// ─── Urgency helpers ──────────────────────────────────────────────────────────

export function getUrgencyLevel(
  deliveryDate: string | undefined,
): UrgencyLevel {
  if (!deliveryDate) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const delivery = new Date(deliveryDate);
  delivery.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "due-soon";
  return "on-track";
}

export function getDaysRemaining(
  deliveryDate: string | undefined,
): number | null {
  if (!deliveryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const delivery = new Date(deliveryDate);
  delivery.setHours(0, 0, 0, 0);
  return Math.floor(
    (delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function formatDaysRemaining(deliveryDate: string | undefined): string {
  const days = getDaysRemaining(deliveryDate);
  if (days === null) return "No date";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days}d remaining`;
}

// ─── Date formatting ─────────────────────────────────────────────────────────

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Currency formatting ──────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
