// ─── Pipeline Stages ────────────────────────────────────────────────────────

export const STAGES = [
  "Enquiry",
  "Estimation",
  "CAD Design",
  "Order Confirmed",
  "Building",
  "Certification",
  "Shipped to Store",
  "Customer Pickup",
] as const;

export type Stage = (typeof STAGES)[number];

// ─── Record Type ─────────────────────────────────────────────────────────────

export type RecordType = "enquiry" | "order";

// ─── Urgency ─────────────────────────────────────────────────────────────────

export type UrgencyLevel = "overdue" | "due-soon" | "on-track" | "none";
// "none" = no delivery date set (enquiries)

// ─── Product ─────────────────────────────────────────────────────────────────

export type JewelleryCategory =
  | "Ring"
  | "Necklace"
  | "Bracelet"
  | "Earrings"
  | "Bangle"
  | "Pendant"
  | "Chain"
  | "Brooch"
  | "Other";

export type MetalType =
  | "Gold"
  | "Silver"
  | "Platinum"
  | "Rose Gold"
  | "White Gold";

export type MetalPurity =
  | "18K"
  | "22K"
  | "24K"
  | "925 Sterling"
  | "950 Platinum"
  | "Other";

export type CertificationType = "Jewellery" | "GIA" | "IGI" | "SGL" | "None";

// ─── Activity Feed Entry ──────────────────────────────────────────────────────

export type ActivityEntryType = "stage_change" | "note" | "file_upload";

export interface ActivityEntry {
  id: string;
  orderId: string;
  postedBy: string;
  timestamp: string; // ISO 8601
  type: ActivityEntryType;
  note?: string;
  newStage?: Stage;
  file?: {
    url: string;
    filename: string;
    fileType: "image" | "pdf" | "other";
  };
}

// ─── Order / Enquiry ──────────────────────────────────────────────────────────

export interface Order {
  id: string;
  type: RecordType;
  orderNumber?: string; // only for confirmed orders
  shareableToken: string; // used in URL: /orders/[shareableToken]

  // Customer
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;

  // Staff
  salespersonName: string;
  vendorName?: string; // set when order is confirmed

  // Product
  category: JewelleryCategory;
  metalType: MetalType;
  metalPurity: MetalPurity;
  metalWeight?: number; // grams
  polish?: string; // e.g. "High polish", "Matte"

  // Stones
  stoneDescription?: string;
  stoneQuality?: string;
  stoneCut?: string;
  stoneCaratEstimate?: number;

  // Sizing (category-dependent)
  ringSize?: string;
  chainLength?: string; // cm
  bangleSize?: string;

  // Order specifics
  certification: CertificationType;
  cadDesignRequired: boolean;
  advancePaid?: number; // currency
  totalEstimate?: number;
  deliveryDate?: string; // ISO 8601 date string

  // Pipeline
  currentStage: Stage;
  createdAt: string; // ISO 8601
  lastUpdatedAt: string; // ISO 8601

  // Activity
  activityFeed: ActivityEntry[];

  // Extra
  specialInstructions?: string;
  budgetRange?: string;
  occasion?: string;
  timelineNotes?: string;
}
