# Dashboard Widgets Documentation

**Payables Management System - Unified Dashboard**

This document provides detailed explanations of each widget on the unified dashboard, including their purpose, data calculation methods, and how the time range filter affects them.

---

## Table of Contents

1. [AP Aging Summary](#1-ap-aging-summary)
2. [Upcoming Cash Out](#2-upcoming-cash-out)
3. [Pending Approvals by Role](#3-pending-approvals-by-role)
4. [Invoice Pipeline Status](#4-invoice-pipeline-status)
5. [PO Utilization Snapshot](#5-po-utilization-snapshot)
6. [Process Bottleneck Indicators](#6-process-bottleneck-indicators)
7. [Top Vendors by Outstanding](#7-top-vendors-by-outstanding)
8. [Project Spend Summary](#8-project-spend-summary)
9. [Document Attachment Health](#9-document-attachment-health)
10. [Recent Activity Feed](#10-recent-activity-feed)
11. [Time Range Filter](#time-range-filter)

---

## 1. AP Aging Summary

### Purpose

The **AP Aging Summary** (Accounts Payable Aging) widget tracks your company's unpaid bills and shows how overdue they are. It provides critical financial health monitoring by answering:

- *"How much money do we currently owe to vendors?"*
- *"How many of our invoices are past due?"*
- *"How seriously overdue are we on our payments?"*

**Use Cases:**
- Cash management and debt obligation tracking
- Vendor relationship management
- Credit rating protection
- Financial planning and payment prioritization
- Risk assessment for vendor disputes
- Audit compliance and liability tracking

---

### Data Calculation

#### **Step 1: Filter Unpaid Invoices**

The widget gathers invoices that are:
- ✅ Status is **NOT** "paid" or "rejected"
- ✅ Have a **due_date** field populated
- ✅ Within your selected time range (filtered by `si_received_at`)

**Included Statuses:** pending, received, in_progress, approved, pending_disbursement

**Excluded Statuses:** paid (already fulfilled), rejected (not a real obligation)

#### **Step 2: Calculate Total Outstanding**

```
Total Outstanding = SUM(net_amount) of ALL unpaid invoices
```

This represents your **total accounts payable liability**.

#### **Step 3: Calculate Total Overdue**

```
Total Overdue = SUM(net_amount) where due_date < TODAY
```

Only includes invoices whose due date has already passed.

#### **Step 4: Categorize Into Aging Buckets**

For each overdue invoice, calculate:
```
Days Overdue = Today's Date - Due Date
```

Then assign to aging buckets:

**🟡 0-30 Days Overdue:**
- Recently missed deadline
- Low risk, still in grace period
- Action: Pay soon to avoid escalation

**🟠 31-60 Days Overdue:**
- 1-2 months past due
- Medium risk, vendors sending reminders
- Action: Prioritize payment ASAP

**🔴 61-90 Days Overdue:**
- 2-3 months past due
- High risk, vendor may stop services
- Action: URGENT - Contact vendor immediately

**🔴 Over 90 Days Overdue:**
- 3+ months past due
- Critical risk, legal action probable
- Action: EMERGENCY - Escalate to CFO

---

### Time Range Filter Impact

**Filter Behavior:** Filters invoices by `si_received_at` (when invoice was received)

**Examples:**
- **"This Month"** → Shows aging for invoices received in current month
- **"All Time"** → Shows aging for all invoices (recommended for complete liability view)

**Best Practice:** Use **"All Time"** to see your complete current AP liability regardless of when invoices arrived.

---

### Display Format

**Summary Cards:**
- Total Outstanding (all unpaid invoices)
- Total Overdue (past due date, displayed in red)

**Aging Breakdown:**
- Color-coded badges (yellow → orange → red)
- Invoice count per bucket
- Total amount per bucket

---

## 2. Upcoming Cash Out

### Purpose

The **Upcoming Cash Out** widget helps finance and accounting teams manage **short-term cash flow** by projecting payments needed in the near future. It answers:

- *"How much cash do we need available in the next 7, 15, and 30 days?"*
- *"When do we need to have funds ready?"*
- *"What are our immediate cash obligations?"*

**Use Cases:**
- Cash flow planning and treasury management
- Budget forecasting
- Payment prioritization
- Preventing overdrafts and late payments
- Vendor relationship management

---

### Data Calculation

#### **Step 1: Filter Payment-Ready Invoices**

The widget only includes invoices that are:
- ✅ Status = **"Approved"** OR **"Pending Disbursement"**
- ✅ Have a **due_date** populated

**Why these statuses?** These invoices have completed all approvals and are authorized for payment - representing imminent cash obligations.

**Excluded:** Pending review, rejected, already paid, or still in verification.

#### **Step 2: Group by Due Date Timeframes**

For each invoice, determine which timeframe(s) it falls into:

**📅 Next 7 Days:**
```
due_date BETWEEN today AND (today + 7 days)
```
- **Urgency:** Immediate - payment due THIS WEEK
- **Action:** Finance should prepare checks/transfers NOW

**📅 Next 15 Days:**
```
due_date BETWEEN today AND (today + 15 days)
```
- **Urgency:** Moderate - payment due within 2 weeks
- **Action:** Start planning cash allocation

**📅 Next 30 Days:**
```
due_date BETWEEN today AND (today + 30 days)
```
- **Urgency:** Planning - full month outlook
- **Action:** Monthly budget planning

**Important Note:** These are **overlapping ranges**, not sequential. The 7-day total is included in the 15-day total, which is included in the 30-day total.

#### **Step 3: Calculate Totals**

For each timeframe:
```
Count = Number of invoices due in timeframe
Amount = SUM(net_amount) of invoices in timeframe
```

---

### Time Range Filter Impact

**Filter Behavior:** Filters invoices by `si_received_at` (when invoice was received)

**Examples:**
- **"This Month"** → Cash obligations for invoices received this month
- **"All Time"** → Cash obligations from all approved invoices (recommended)

**Best Practice:** Use **"All Time"** to see complete upcoming cash obligations.

---

### Display Format

**Top Section:**
- Total Upcoming (30 days): Sum and count of all approved invoices due within 30 days

**Timeframe Cards:**
- Next 7 Days (Orange - Urgent)
- Next 15 Days (Blue - Moderate)
- Next 30 Days (Purple - Planning)

Each shows: Invoice count and total amount

---

## 3. Pending Approvals by Role

### Purpose

The **Pending Approvals by Role** widget provides a centralized view of items requiring action across different departments. It answers:

- *"What items need approval right now?"*
- *"How many invoices are waiting for review?"*
- *"Are there POs or check requisitions pending?"*

**Use Cases:**
- Workflow monitoring
- Task prioritization
- Bottleneck identification
- Team accountability
- SLA compliance

---

### Data Calculation

#### **Three Approval Categories:**

**1. Invoices Waiting Review**
```
Status = 'received' OR 'in_progress'
```
- Invoices that have entered the system but not yet approved
- Requires accounting team action

**2. Check Requisitions Pending**
```
requisition_status = 'pending_approval'
```
- Check requisitions awaiting manager approval
- Requires finance manager/approver action

**3. POs Pending Finalization**
```
po_status = 'draft'
```
- Purchase orders created but not yet finalized
- Requires purchasing team action

#### **Calculation:**
```
Total = Invoices Waiting + CRs Pending + POs Pending
```

---

### Time Range Filter Impact

**Filter Behavior:**
- **Invoices:** Filtered by `si_received_at`
- **Check Requisitions:** Filtered by `request_date`
- **Purchase Orders:** Filtered by `created_at`

**Examples:**
- **"This Week"** → Approvals needed for items created this week
- **"All Time"** → All pending approvals (recommended for complete workload view)

---

### Display Format

**Top Card:**
- Total Pending count (color-coded: green if 0, orange if >0)
- "All caught up!" message when no pending items

**Breakdown Cards:**
- Invoices Waiting Review (Blue)
- Check Requisitions Pending (Purple)
- POs Pending Finalization (Orange)

---

## 4. Invoice Pipeline Status

### Purpose

The **Invoice Pipeline Status** widget shows the distribution of invoices across different processing stages. It answers:

- *"How many invoices are in each stage of our workflow?"*
- *"What percentage of invoices are approved vs. pending?"*
- *"Where is the bulk of our workload?"*

**Use Cases:**
- Workflow visibility
- Workload balancing
- Process monitoring
- Performance tracking
- Resource allocation planning

---

### Data Calculation

#### **Count by Status**

Uses SQL grouping to count invoices in each status:

```sql
SELECT invoice_status, COUNT(*) as count
FROM invoices
WHERE si_received_at BETWEEN [start] AND [end]
GROUP BY invoice_status
```

**Seven Status Categories:**
1. **Pending** - Initial state, not yet reviewed
2. **Received** - Logged in system, awaiting verification
3. **In Progress** - Currently being verified
4. **Approved** - Approved for payment
5. **Pending Disbursement** - Queued for check printing
6. **Paid** - Payment completed
7. **Rejected** - Disputed or invalid

#### **Percentage Calculation:**
```
Percentage = (Count for Status / Total Invoices) × 100
```

---

### Time Range Filter Impact

**Filter Behavior:** Filters by `si_received_at` (when invoice was received)

**Examples:**
- **"This Month"** → Pipeline status for December invoices
- **"This Quarter"** → Q4 invoice distribution

---

### Display Format

**Top Section:**
- Total invoice count across all statuses

**Status Breakdown:**
- Icon + Status label
- Count and percentage
- Progress bar showing distribution
- Color-coded by status severity

---

## 5. PO Utilization Snapshot

### Purpose

The **PO Utilization Snapshot** widget provides a financial overview of purchase order usage. It answers:

- *"How much of our PO budget has been invoiced?"*
- *"How much has actually been paid?"*
- *"What's our remaining PO balance?"*

**Use Cases:**
- Budget tracking
- Financial commitment monitoring
- Payment progress tracking
- Vendor relationship management
- Cash flow forecasting

---

### Data Calculation

#### **Step 1: Get Open Purchase Orders**

```sql
SELECT * FROM purchase_orders
WHERE po_status = 'open'
AND finalized_at BETWEEN [start] AND [end]
```

#### **Step 2: Aggregate Financial Data**

Using **stored columns** on the purchase_orders table for efficiency:

```
Total PO Amount = SUM(po_amount)
Total Invoiced = SUM(total_invoiced)
Total Paid = SUM(total_paid)
Remaining = Total PO Amount - Total Paid
```

#### **Step 3: Calculate Percentages**

```
Invoiced % = (Total Invoiced / Total PO Amount) × 100
Paid % = (Total Paid / Total PO Amount) × 100
```

---

### Time Range Filter Impact

**Filter Behavior:** Filters by `finalized_at` (when PO was finalized/approved)

**Examples:**
- **"This Quarter"** → PO utilization for Q4 purchase orders
- **"All Time"** → Complete PO utilization across all open POs

---

### Display Format

**Metric Grid (2x2):**
- Total PO Amount (Blue - Shopping cart icon)
- Total Invoiced (Purple - Trending up icon) + Progress bar
- Total Paid (Green - Banknote icon) + Progress bar
- Remaining (Orange - Dollar sign icon)

**Summary Stats:**
- Invoiced percentage
- Paid percentage

---

## 6. Process Bottleneck Indicators

### Purpose

The **Process Bottleneck Indicators** widget measures processing efficiency across the invoice workflow. It answers:

- *"How long does it take for an invoice to move through each stage?"*
- *"Where are invoices getting delayed?"*
- *"Which stage is our biggest bottleneck?"*

**Use Cases:**
- Process optimization
- Performance benchmarking
- Resource allocation
- SLA compliance tracking
- Continuous improvement initiatives

---

### Data Calculation

#### **Three Processing Stages:**

**Stage 1: Received → Reviewed**
```
Start: si_received_at
End: reviewed_at
Measures: Queue time before review begins
```

**Stage 2: Reviewed → Approved**
```
Start: reviewed_at
End: approved_at
Measures: Verification and approval time
```

**Stage 3: Approved → Disbursed**
```
Start: approved_at (from invoice)
End: date_check_printing (from related disbursement)
Measures: Payment processing time
```

#### **Calculation Method:**

For each stage:
1. Filter invoices that have completed that stage (both timestamps present)
2. Calculate days between start and end for each invoice
3. Compute average across all invoices

```
Average Days = SUM(end_date - start_date) / COUNT(invoices)
```

**Total Processing Time:**
```
Total = Stage 1 + Stage 2 + Stage 3
```

#### **Pipeline Count:**
```
Total in Pipeline = COUNT(invoices WHERE status NOT IN ['paid', 'rejected'])
```

---

### Time Range Filter Impact

**Filter Behavior:** Filters by `si_received_at` (when invoice was received)

**Examples:**
- **"This Month"** → Processing times for December invoices
- **"Last Quarter"** → Q4 performance vs. previous periods

**Use Case:** Track improvement over time by comparing different periods.

---

### Display Format

**Top Section:**
- Total Average Processing Time (sum of all stages)
- Total invoices in pipeline

**Stage Breakdown:**
- Icon representing each stage
- Average days with color coding:
  - 🟢 Green (≤2 days) - Excellent
  - 🔵 Blue (3-5 days) - Good
  - 🟠 Orange (6-10 days) - Slow
  - 🔴 Red (>10 days) - Bottleneck

---

### Performance Benchmarks

**Healthy Processing Times:**
- Stage 1: ≤2 days (quick pickup)
- Stage 2: ≤3 days (efficient verification)
- Stage 3: ≤5 days (prompt payment)
- **Total: ≤10 days end-to-end**

**Red Flags:**
- Any stage >10 days
- Total >20 days
- Increasing trend over time

---

## 7. Top Vendors by Outstanding

### Purpose

The **Top Vendors by Outstanding** widget identifies vendors with the highest unpaid balances. It answers:

- *"Which vendors are we most indebted to?"*
- *"Who are our largest creditors?"*
- *"Where should we focus payment efforts?"*

**Use Cases:**
- Payment prioritization
- Vendor relationship management
- Risk assessment
- Cash flow planning
- Strategic vendor negotiations

---

### Data Calculation

#### **Step 1: Get Unpaid Invoices**

```sql
SELECT * FROM invoices
WHERE invoice_status NOT IN ('paid', 'rejected')
AND si_received_at BETWEEN [start] AND [end]
WITH vendor information via purchase_order relationship
```

#### **Step 2: Group by Vendor**

```
For each vendor:
  Outstanding Amount = SUM(net_amount of unpaid invoices)
  Invoice Count = COUNT(unpaid invoices)
```

#### **Step 3: Sort and Limit**

```
ORDER BY outstanding_amount DESC
LIMIT 10
```

Returns top 10 vendors by outstanding balance.

---

### Time Range Filter Impact

**Filter Behavior:** Filters by `si_received_at` (when invoice was received)

**Examples:**
- **"This Quarter"** → Top vendors from Q4 invoices
- **"All Time"** → Complete vendor outstanding balances (recommended)

**Best Practice:** Use **"All Time"** to see true current obligations to each vendor.

---

### Display Format

**Summary Cards:**
- Total Outstanding (sum across top vendors)
- Total Invoices (count across top vendors)

**Vendor Table:**
- Rank (#1-3 highlighted with badges)
- Vendor name (truncated with tooltip)
- Invoice count
- Outstanding amount

---

## 8. Project Spend Summary

### Purpose

The **Project Spend Summary** widget tracks financial performance across active projects. It answers:

- *"How much have we spent on each project?"*
- *"What's our remaining project budget?"*
- *"Which projects are consuming the most resources?"*

**Use Cases:**
- Project budget tracking
- Cost control
- Financial reporting
- Resource allocation
- Project prioritization

---

### Data Calculation

#### **Step 1: Get Active Projects**

```sql
SELECT * FROM projects
WHERE project_status = 'active'
   OR project_status IS NULL
   OR project_status = ''
WITH related purchase_orders
```

#### **Step 2: Aggregate Financial Data**

For each project:
```
Total PO = SUM(po_amount) from related POs
Total Invoiced = SUM(total_invoiced) from related POs
Total Paid = SUM(total_paid) from related POs
Remaining = Total PO - Total Paid
```

#### **Step 3: Sort and Limit**

```
ORDER BY total_po DESC
LIMIT 5
```

Returns top 5 projects by PO spending.

---

### Time Range Filter Impact

**Filter Behavior:**
- Projects: No filter (all active projects included)
- Purchase Orders: Filtered by `finalized_at`

**Examples:**
- **"This Quarter"** → Top projects with Q4 purchase orders
- **"All Time"** → Complete project spending across all POs

---

### Display Format

**Project Table:**
- Project name
- Progress bar (payment completion percentage)
- Total PO amount (Blue - Shopping cart)
- Total Invoiced (Purple - Trending up)
- Total Paid (Green - Banknote)
- Remaining (Orange - Dollar sign)

**Icons:** Color-coded to indicate financial metric type

---

## 9. Document Attachment Health

### Purpose

The **Document Attachment Health** widget provides an audit-readiness score by tracking document completeness across all major entity types. It answers:

- *"How complete is our documentation?"*
- *"Which documents are missing attachments?"*
- *"Are we audit-ready?"*

**Use Cases:**
- Audit preparation and compliance
- Documentation completeness monitoring
- Regulatory compliance tracking
- Risk management
- Process improvement identification
- Quality control and governance

---

### Data Calculation

#### **Step 1: Count Total Entities**

For each entity type within the time range:
```
Total POs = COUNT(all purchase_orders)
Total Invoices = COUNT(all invoices)
Total CRs = COUNT(all check_requisitions)
```

#### **Step 2: Count Entities WITH Attachments**

Uses polymorphic `files` relationship to find entities that have at least one active file:

```
POs With Files = COUNT(POs WHERE has active files)
Invoices With Files = COUNT(Invoices WHERE has active files)
CRs With Files = COUNT(CRs WHERE has active files)
```

**Polymorphic Relationship Structure:**
- `files.fileable_type` = 'App\\Models\\PurchaseOrder'
- `files.fileable_id` = entity ID
- `files.is_active` = true

#### **Step 3: Calculate Completeness Percentages**

For each entity type:
```
Completeness % = (Entities With Files / Total Entities) × 100
```

**Special Case:** If total entities = 0, completeness = 100% (nothing missing)

```
PO Completeness = (POs With Files / Total POs) × 100
Invoice Completeness = (Invoices With Files / Total Invoices) × 100
CR Completeness = (CRs With Files / Total CRs) × 100
```

#### **Step 4: Calculate Overall Score**

Simple average across all entity types:
```
Overall Score = (PO Completeness + Invoice Completeness + CR Completeness) / 3
```

This provides a single health metric representing overall documentation quality.

#### **Step 5: Identify Missing Documents**

For each entity type, query entities without files:
```
POs Missing = SELECT id, po_number
              FROM purchase_orders
              WHERE does not have files
              LIMIT 10

Invoices Missing = SELECT id, si_number
                   FROM invoices
                   WHERE does not have files
                   LIMIT 10

CRs Missing = SELECT id, requisition_number
              FROM check_requisitions
              WHERE does not have files
              LIMIT 10
```

Returns up to 10 examples per entity type for quick action.

---

### Time Range Filter Impact

**Filter Behavior:**
- **Purchase Orders:** Filtered by `finalized_at`
- **Invoices:** Filtered by `si_received_at`
- **Check Requisitions:** Filtered by `request_date`

**Examples:**
- **"This Month"** → Completeness for December documents only
- **"All Time"** → Complete system-wide documentation health (recommended)

**Best Practice:** Use **"All Time"** to see true audit-readiness across all active documents. Use specific periods when investigating completeness issues in a particular timeframe.

---

### Display Format

**Overall Health Score (Large Card):**
- Completeness percentage (0-100%)
- Color-coded background:
  - 🟢 Green (≥90%) - Excellent compliance + CheckCircle icon
  - 🟡 Yellow (70-89%) - Some gaps + XCircle icon
  - 🔴 Red (<70%) - Critical issues + XCircle icon
- Summary message: "X items need attention" or "All documents attached!"

**Entity Breakdown (3 Sections):**

Each entity shows:
- Icon and label (PO, Invoice, CR)
- Completeness percentage badge
- Progress bar visualization
- Count: "X / Y" (with files / total)
- Missing items list (first 3 examples):
  - "Missing: PO-2024-001, PO-2024-015, PO-2024-023 +5 more"

**Status Message (Bottom):**
- ✓ Excellent documentation compliance (≥90%)
- ⚠ Some documents missing - review needed (70-89%)
- ✗ Critical - Many documents missing (<70%)

---

### Audit Readiness Benchmarks

**Excellent (≥90%):**
- Ready for external audit
- Strong governance and compliance
- Minimal risk of findings

**Good (70-89%):**
- Generally acceptable
- Some gaps to address
- Review and remediate missing items

**Poor (<70%):**
- High audit risk
- Immediate action required
- Escalate to management

---

### Common Missing Documents

**Purchase Orders:**
- Vendor quotations
- RFQ/RFP documentation
- Board approval minutes
- Price comparison sheets

**Invoices:**
- Sales invoice (SI) copies
- Delivery receipts
- Official receipts
- Supporting billing statements

**Check Requisitions:**
- Payment authorization forms
- Supporting invoices
- Approval signatures
- Wire transfer confirmations

---

## 10. Recent Activity Feed

### Purpose

The **Recent Activity Feed** widget provides real-time visibility into system activity and changes. It answers:

- *"What actions were recently performed?"*
- *"Who made changes to the system?"*
- *"What entities were modified?"*

**Use Cases:**
- Audit trail monitoring
- Team activity tracking
- Change verification
- Accountability and transparency
- Issue investigation
- Process compliance monitoring

---

### Data Calculation

#### **Step 1: Query Activity Logs**

Retrieves the most recent entries from the `activity_logs` table:
```
SELECT * FROM activity_logs
WHERE created_at BETWEEN [start] AND [end]
ORDER BY created_at DESC
LIMIT 20
```

Returns last 20 activities (configurable limit).

#### **Step 2: Load Related User Data**

Uses eager loading to fetch user names:
```
WITH user relationship (id, name)
```

Prevents N+1 query problems when displaying user names.

#### **Step 3: Transform Entity Type Labels**

Converts technical database class names to business-friendly labels:

```
'App\Models\PurchaseOrder' → 'Purchase Order'
'App\Models\Invoice' → 'Invoice'
'App\Models\Vendor' → 'Vendor'
'App\Models\Project' → 'Project'
'App\Models\CheckRequisition' → 'Check Requisition'
'App\Models\Disbursement' → 'Disbursement'
```

#### **Step 4: Extract Entity Identifiers**

For each activity, determines the user-friendly identifier based on entity type:

```
Purchase Order → po_number (e.g., "PO-2024-001")
Invoice → si_number (e.g., "SI-2024-456")
Vendor → vendor_name (e.g., "ABC Supplies Inc.")
Project → project_name (e.g., "Building Renovation")
Check Requisition → requisition_number (e.g., "CR-2024-089")
Disbursement → disbursement_number (e.g., "DISB-2024-123")
```

**Fallback:** If entity is deleted or identifier unavailable, displays "N/A"

#### **Step 5: Format Timestamps**

Converts absolute timestamps to human-readable relative format:
```
2024-12-10 14:30:00 → "2 hours ago"
2024-12-09 09:15:00 → "1 day ago"
2024-12-03 16:45:00 → "7 days ago"
```

Uses Laravel's `diffForHumans()` method for automatic formatting.

---

### Time Range Filter Impact

**Filter Behavior:** Filters by `created_at` (when activity occurred)

**Examples:**
- **"Today"** → All activities from today
- **"Last 7 Days"** → Week's worth of activity history
- **"This Month"** → December activity feed
- **"All Time"** → Last 20 activities regardless of date

**Best Practice:** Use **"Last 7 Days"** or **"Today"** for focused recent monitoring. Use **"All Time"** when investigating specific issues.

---

### Display Format

**Activity Entry (Card Format):**

Each activity shows:

**Icon (Left):**
- Entity-specific icon with color-coded background
- Shopping Cart (blue) - Purchase Orders
- Document (purple) - Invoices
- Users (green) - Vendors
- Folder (orange) - Projects
- Receipt (pink) - Check Requisitions
- Wallet (teal) - Disbursements

**Content (Center):**
- **Top Row:**
  - User name (bold)
  - Action badge (color-coded by type)
  - Timestamp ("2 hours ago")

- **Second Row:**
  - Entity type label (bold)
  - Entity identifier (e.g., "#PO-2024-001")

- **Optional Notes:**
  - Italicized, truncated notes text
  - Additional context about the action

**Action Badge Colors:**
- 🔵 Blue (default) - Created, Added, Approved
- 🟠 Orange (secondary) - Updated, Modified
- 🔴 Red (destructive) - Rejected, Deleted
- ⚪ Gray (outline) - Other actions

**Hover Effect:**
- Light background highlight on hover
- Improves clickability and user interaction

**Empty State:**
- "No recent activity" message when no data

---

### Activity Action Types

**Common Actions:**

**Creation:**
- "Created" - New entity added to system
- "Added" - Additional item attached/linked

**Approval Workflow:**
- "Approved" - Entity approved for next stage
- "Rejected" - Entity rejected/declined
- "Pending Review" - Submitted for approval

**Modifications:**
- "Updated" - Changes to existing entity
- "Modified" - Field values changed
- "Edited" - Content revised

**Status Changes:**
- "Finalized" - PO finalized for use
- "Disbursed" - Payment processed
- "Received" - Invoice received
- "Paid" - Payment completed

**Other:**
- "Deleted" - Entity removed (soft delete)
- "Archived" - Entity archived
- "Restored" - Deleted entity restored

---

### Privacy and Security

**User Visibility:**
- Shows user name who performed action
- Tracks accountability
- Supports non-repudiation for audits

**Data Logged:**
- User ID and name
- Entity type and ID
- Action performed
- Timestamp (precise to second)
- Optional notes field

**NOT Logged:**
- Specific field changes (use audit trails for this)
- Sensitive data values
- IP addresses or session data

---

### Performance Notes

**Optimization:**
- Limit to 20 most recent entries
- Eager loads user relationships (prevents N+1)
- Indexed on `created_at` for fast sorting
- Returns minimal data payload

**Refresh Rate:**
- Auto-refreshes with other widgets (5-minute stale time)
- Manual refresh available
- Real-time updates not implemented (refresh required)

---

## Time Range Filter

### Overview

The **Time Range Filter** is a global control that affects all widgets on the dashboard. It allows users to focus on specific time periods for analysis.

### Available Options

**Preset Ranges:**
- Today
- Last 7 Days
- This Month
- This Quarter
- This Year
- Fiscal Year
- All Time

**Custom Range:**
- Start Date (date picker)
- End Date (date picker)

### How It Works

#### **Backend Processing:**

When you select a time range, the system:
1. Converts the selection to start/end dates
2. Appends `?start=YYYY-MM-DD&end=YYYY-MM-DD` to all widget API calls
3. Each widget applies the filter to its specific date field

#### **Widget-Specific Date Fields:**

| Widget | Date Field Filtered |
|--------|-------------------|
| AP Aging Summary | `si_received_at` |
| Upcoming Cash Out | `si_received_at` |
| Pending Approvals | `si_received_at`, `request_date`, `created_at` |
| Invoice Pipeline Status | `si_received_at` |
| PO Utilization Snapshot | `finalized_at` |
| Process Bottleneck | `si_received_at` |
| Top Vendors by Outstanding | `si_received_at` |
| Project Spend Summary | `finalized_at` (POs) |
| Document Attachment Health | `finalized_at`, `si_received_at`, `request_date` |
| Recent Activity Feed | `created_at` |

### Persistence

- Selected range is saved to **localStorage**
- Preserved across page reloads
- Updated in URL for shareable links

### Best Practices

**For Current Liabilities:**
- Use **"All Time"** for:
  - AP Aging Summary
  - Upcoming Cash Out
  - Top Vendors by Outstanding

**For Performance Analysis:**
- Use **"This Month"** or **"This Quarter"** for:
  - Process Bottleneck Indicators
  - Invoice Pipeline Status
  - PO Utilization Snapshot

**For Trend Analysis:**
- Compare different periods to track improvement
- Monthly view: See if performance is improving
- Quarterly view: Identify seasonal patterns

---

## Widget Data Refresh

### Auto-Refresh

- Widgets use **React Query** for data fetching
- Default stale time: **5 minutes**
- Automatic background refresh when:
  - Time range filter changes
  - Window regains focus
  - Manual retry button clicked

### Loading States

- **Initial Load:** Skeleton placeholder
- **Background Refresh:** Spinning indicator in widget header
- **Error State:** Error message with retry button

### Performance

- **Prefetching:** Critical widgets prefetched on page load
- **Parallel Loading:** All widgets load independently
- **Caching:** Responses cached for 5 minutes
- **Stale-While-Revalidate:** Shows cached data while fetching fresh data

---

## Troubleshooting

### Widget Shows "0" or Empty Data

**Possible Causes:**
1. No data exists for selected time range
2. Database missing required timestamp fields
3. Relationships not properly loaded

**Solution:**
- Try selecting "All Time" to see if data exists
- Check Laravel logs for query errors
- Verify database has populated date fields

### Slow Widget Loading

**Possible Causes:**
1. Large dataset (thousands of records)
2. Missing database indexes
3. Complex relationship queries

**Solution:**
- Add indexes on frequently filtered columns
- Optimize service layer queries
- Consider caching for expensive calculations

### Incorrect Calculations

**Possible Causes:**
1. Time zone mismatches
2. Null date fields
3. Incorrect status values

**Solution:**
- Verify all dates use consistent timezone
- Check for NULL values in date fields
- Validate status field values match expected values

---

## Future Enhancements

### Potential Features

- **Export to Excel:** Download widget data
- **Email Reports:** Schedule daily/weekly summaries
- **Alerts:** Notifications for critical thresholds
- **Drill-Down:** Click widget to see detailed records
- **Customization:** Toggle widgets on/off per user

---

## Related Documentation

- **Database Schema:** `docs/db.mmd`
- **Business Flow:** `docs/flowchart.mmd`
- **API Endpoints:** See `routes/web.php` for widget routes

---

**Last Updated:** December 10, 2024
**Version:** 1.1 (All 10 Widgets Complete)
**System:** Laravel 12 + React 19 + Inertia.js
