import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

interface DetailRowProps {
  label: string;
  value?: string | number | null;
}

function DetailRow({ label, value }: DetailRowProps) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-full text-xs text-muted-foreground sm:w-36 sm:flex-shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {title}
      </h3>
      <dl className="space-y-2.5">{children}</dl>
    </div>
  );
}

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const stoneSummary = [
    order.stoneDescription,
    order.stoneCut && `${order.stoneCut} cut`,
    order.stoneQuality,
    order.stoneCaratEstimate && `~${order.stoneCaratEstimate} ct`,
  ]
    .filter(Boolean)
    .join(", ");

  const metalSummary = [
    order.metalType,
    order.metalPurity,
    order.metalWeight && `${order.metalWeight}g`,
  ]
    .filter(Boolean)
    .join(" · ");

  const sizeSummary = [
    order.ringSize && `Ring: ${order.ringSize}`,
    order.chainLength && `Chain: ${order.chainLength}`,
    order.bangleSize && `Bangle: ${order.bangleSize}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {/* Customer */}
      <Section title="Customer">
        <DetailRow label="Name" value={order.customerName} />
        <DetailRow label="Phone" value={order.customerPhone} />
        <DetailRow label="Email" value={order.customerEmail} />
        <DetailRow label="Address" value={order.customerAddress} />
      </Section>

      {/* Order */}
      <Section title="Order">
        <DetailRow label="Salesperson" value={order.salespersonName} />
        <DetailRow label="Vendor" value={order.vendorName} />
        <DetailRow
          label="Delivery date"
          value={
            order.deliveryDate ? formatDate(order.deliveryDate) : undefined
          }
        />
        <DetailRow label="Certification" value={order.certification} />
        <DetailRow
          label="CAD design"
          value={order.cadDesignRequired ? "Required" : "Not required"}
        />
      </Section>

      {/* Product */}
      <Section title="Product">
        <DetailRow label="Category" value={order.category} />
        <DetailRow label="Metal" value={metalSummary || undefined} />
        <DetailRow label="Polish" value={order.polish} />
        {stoneSummary && <DetailRow label="Stones" value={stoneSummary} />}
        {sizeSummary && <DetailRow label="Sizing" value={sizeSummary} />}
      </Section>

      {/* Financials */}
      <Section title="Financials">
        <DetailRow
          label="Total estimate"
          value={
            order.totalEstimate
              ? formatCurrency(order.totalEstimate)
              : undefined
          }
        />
        <DetailRow
          label="Advance paid"
          value={
            order.advancePaid ? formatCurrency(order.advancePaid) : undefined
          }
        />
        {order.totalEstimate && order.advancePaid && (
          <DetailRow
            label="Balance due"
            value={formatCurrency(order.totalEstimate - order.advancePaid)}
          />
        )}
        {order.budgetRange && (
          <DetailRow label="Budget range" value={order.budgetRange} />
        )}
        {order.occasion && (
          <DetailRow label="Occasion" value={order.occasion} />
        )}
      </Section>

      {/* Special instructions */}
      {(order.specialInstructions || order.timelineNotes) && (
        <div className="sm:col-span-2">
          <Section title="Notes & Instructions">
            <DetailRow
              label="Special instructions"
              value={order.specialInstructions}
            />
            <DetailRow label="Timeline notes" value={order.timelineNotes} />
          </Section>
        </div>
      )}
    </div>
  );
}
