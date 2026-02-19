# EVOL Jewels — Implementation Plan

## Guiding Principles
- UI/UX prototype first — no real backend, no auth
- Mock data in static TypeScript files
- Clean & minimal aesthetic (shadcn/ui zinc, Linear/Notion feel)
- Next.js App Router throughout
- Each phase is independently shippable and reviewable

---

## Phase 1 — Foundation
**Goal:** Establish the data model, mock data, and shared layout shell.

### Tasks
- [ ] `types/index.ts` — TypeScript interfaces for `Order`, `Enquiry`, `ActivityEntry`, `Stage`, `UrgencyLevel`
- [ ] `lib/mock-data.ts` — 6–8 realistic orders/enquiries across different stages, with activity feed entries per order
- [ ] `lib/utils.ts` — extend with helpers: `getUrgencyLevel(deliveryDate)`, `getStageName(stage)`, `getStageIndex(stage)`
- [ ] Update `app/layout.tsx` — minimal nav shell: EVOL logo wordmark + "New Enquiry" / "New Order" CTAs
- [ ] Install any needed shadcn components (Table, Badge, Card, Button, Input, Select, etc.)

### Deliverable
A running app with a placeholder home page, shared nav, and all mock data accessible throughout the app.

---

## Phase 2 — Dashboard (Internal Tracker)
**Goal:** The daily-use operations view. Sales staff and owner use this to see everything at a glance.

### Tasks
- [ ] `app/page.tsx` — Dashboard route (replaces Next.js starter)
- [ ] **Pipeline Summary Bar** — row of 8 stage cards, each showing stage name + count of orders at that stage; clicking filters the list
- [ ] **Order List** — table/list with columns:
  - Urgency dot (red = overdue, amber = due ≤7 days, green = on track)
  - Order # / Enquiry label
  - Customer name
  - Current stage (badge)
  - Salesperson
  - Vendor
  - Delivery date + days remaining
  - Quick link to order page
- [ ] **Search** — client-side filter by customer name or order number
- [ ] **Filter chips** — filter by stage, filter by salesperson
- [ ] **Empty state** — message when no results match search/filter
- [ ] Row click navigates to `/orders/[id]`

### Deliverable
A fully functional (with mock data) dashboard that shows urgency, stage distribution, and lets staff find any order instantly.

---

## Phase 3 — Order Page (Shared Source of Truth)
**Goal:** The single most important surface. One URL, one page, everyone looks at this.

### Tasks
- [ ] `app/orders/[id]/page.tsx` — dynamic route
- [ ] **Order Header** — order number, type badge (Order vs Enquiry), customer name, created date
- [ ] **Stage Progress Bar** — horizontal visual of all 8 stages; current stage highlighted, past stages marked done, future stages muted; CAD Design shown/hidden per order flag
- [ ] **Order Details Card** — all specs in a readable grid:
  - Customer info (name, phone, email)
  - Product: category, metal, purity, polish, weight
  - Stones: description, quality, cut
  - Size fields (shown only if relevant)
  - Vendor, salesperson
  - Certification type
  - Advance paid, total estimate
  - Delivery date
- [ ] **Activity Feed** — chronological list, newest first; each entry renders differently by type:
  - `stage_change` — pill + "Moved to [Stage]" + who + when
  - `note` — text block + who + when
  - `file_upload` — file name/type icon + who + when (mock, no real upload)
- [ ] **Post an Update form** — at bottom of page:
  - Name field (free text)
  - Stage change dropdown (optional)
  - Note textarea (optional)
  - File attach (UI only for prototype)
  - Submit button — adds entry to feed (in-memory, resets on reload for now)
- [ ] **Share link UI** — "Copy link" button that copies the current URL to clipboard
- [ ] **Convert to Order button** — shown only if type is `enquiry`; links to order form pre-filled

### Deliverable
A shareable, readable order page that any stakeholder can open and immediately understand the status and history of an order.

---

## Phase 4 — Enquiry Form
**Goal:** Replace paper/WhatsApp for capturing walk-in customer interest.

### Tasks
- [ ] `app/enquiries/new/page.tsx` — new enquiry route
- [ ] Multi-section form with clear section headings:
  - **Customer** — name, phone, email, address
  - **Product Interest** — category, metal type, purity, polish/color
  - **Stone Preferences** — cut, quality, carat estimate
  - **Context** — budget range, occasion, timeline notes
  - **Staff** — salesperson name
- [ ] Client-side validation (required fields highlighted)
- [ ] Submit handler — adds to in-memory mock data, redirects to dashboard with success toast
- [ ] Cancel → back to dashboard

### Deliverable
Sales staff can capture a walk-in enquiry end-to-end in the browser without touching paper or WhatsApp.

---

## Phase 5 — Order Form + Convert Flow
**Goal:** Formal production kickoff form; converts an enquiry into a trackable order with a shareable page.

### Tasks
- [ ] `app/orders/new/page.tsx` — new order route (also handles `?from=[enquiryId]` pre-fill)
- [ ] Pre-fill logic — if `from` param present, load enquiry data and populate matching fields
- [ ] **"Convert to Order" button** on enquiry page → navigates to `/orders/new?from=[id]`
- [ ] All fields from enquiry form, plus order-specific fields:
  - Order number (auto-generated, shown read-only)
  - Vendor / manufacturer name
  - Precise stone specs (carat per stone, placement, quality grade)
  - Metal weight
  - Size fields (conditional on category)
  - Certification type
  - Advance amount, total estimate
  - Delivery date (date picker)
  - Special instructions
  - CAD Design toggle
- [ ] Submit handler — generates unique shareable token, creates order record, redirects to the new order page
- [ ] Success state on order page — brief "Order created. Copy the link to share." banner

### Deliverable
Sales can convert an enquiry to a formal order in one flow, and immediately have a shareable link to hand to the vendor.

---

## Tech Stack Reference
| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (new-york, zinc) |
| Icons | lucide-react |
| Linting | Biome |
| Package manager | pnpm |
| Mock data | Static `.ts` files |
| State | React `useState` / `useReducer` (client components) |

---

## File Structure (Target)
```
app/
  layout.tsx              # Nav shell
  page.tsx                # Dashboard
  orders/
    [id]/
      page.tsx            # Order page
    new/
      page.tsx            # New order form
  enquiries/
    new/
      page.tsx            # New enquiry form
components/
  ui/                     # shadcn primitives
  dashboard/
    PipelineSummary.tsx
    OrderList.tsx
    OrderRow.tsx
    SearchFilter.tsx
  order/
    StageBar.tsx
    OrderDetails.tsx
    ActivityFeed.tsx
    PostUpdateForm.tsx
  layout/
    Navbar.tsx
lib/
  mock-data.ts
  utils.ts
types/
  index.ts
```
