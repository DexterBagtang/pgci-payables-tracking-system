# Dashboard TODO & Architecture Plan

## Overview

This document outlines the plan for implementing Purchase Order-related dashboard widgets with role-based access control and backend architecture decisions.

---

## Design Inspiration

The dashboard design should be inspired by industry-leading accounting and ERP software, adapted to our specific payables management workflow:

### Reference Systems

**SAP Business One / SAP S/4HANA:**
- Clean, widget-based dashboard layout
- Color-coded KPI cards with trend indicators
- Drill-down capabilities (click widget → filtered table view)
- Role-based dashboards (different views per user type)
- Real-time financial metrics at-a-glance

**QuickBooks Online:**
- Clear visual hierarchy (most important metrics on top)
- Simple, scannable financial summary cards
- Action items prominently displayed (what needs attention)
- Quick access buttons to common tasks
- Bank/cash flow visualization widgets

**Xero:**
- Modern, minimalist design with excellent use of white space
- Dashboard tiles that are interactive and clickable
- Subtle color coding (red for overdue, green for paid, etc.)
- "To Do" list for pending tasks
- Recent activity stream for audit trail

**NetSuite:**
- Customizable dashboard with drag-and-drop widgets
- KPI portlets with charts and graphs
- Alerts and reminders section
- Quick links to frequently used transactions
- Role-based portlet visibility

**Microsoft Dynamics 365:**
- Card-based layout with consistent sizing
- Visual charts (donut, bar, line) for trends
- Smart lists (filtered views with counts)
- Notifications center for approvals/alerts
- Workflow status indicators

### Key Design Patterns to Adopt

1. **Card/Widget-Based Layout:**
   - Each metric/feature in its own contained card
   - Consistent card structure (header, content, footer/action)
   - Responsive grid layout (2-3 columns on desktop, stacks on mobile)

2. **Visual Hierarchy:**
   - Most critical metrics at the top (outstanding balance, pending approvals)
   - Action items prominently displayed with color coding
   - Secondary/informational widgets below

3. **Color Coding Standards:**
   - **Red/Destructive:** Overdue items, rejected items, urgent alerts
   - **Orange/Warning:** Pending review, approaching deadlines
   - **Blue/Primary:** In progress, informational
   - **Green/Success:** Completed, approved, paid
   - **Gray/Neutral:** Draft, cancelled, inactive

4. **Interactive Elements:**
   - Every metric should be clickable → navigates to filtered list view
   - Hover states show additional context
   - Quick action buttons (e.g., "Review All", "Approve", "View Details")

5. **At-a-Glance Metrics:**
   - Large numbers with currency formatting
   - Small trend indicators (↑ 12% from last month)
   - Comparison periods (This Month vs. Last Month)

6. **Progressive Disclosure:**
   - Summary on dashboard
   - Click for details in modal/new page
   - Don't overwhelm with too much data initially

7. **Status Indicators:**
   - Badge components for counts (e.g., "5 pending")
   - Progress bars for completion metrics
   - Timeline views for delivery/payment schedules

### Adaptations for Our App

While inspired by these systems, our dashboard should be:
- **Focused on Payables Workflow:** Vendors → POs → Invoices → Check Requisitions → Payments
- **Role-Specific:** Each user sees only relevant widgets for their role
- **Action-Oriented:** Emphasize "what needs to be done" over purely informational metrics
- **Lightweight:** Fast loading, efficient queries, no unnecessary complexity
- **Modern UI:** Leveraging our existing shadcn/ui component library and design system

---

## Current State

- Dashboard backend (`DashboardController`) provides: PO counts, amounts, near-delivery alerts
- Frontend widgets created but commented out: `FinancialSummaryCards`, `PendingActionsWidget`, `QuickActionsPanel`, `UpcomingPayments`
- Role system has 4 roles: **Admin**, **Purchasing**, **Payables**, **Disbursement**
- PO statuses: `draft`, `open`, `closed`, `cancelled`
- Existing pattern: Single Inertia endpoint with all data in `index()` method

---
``
## Proposed PO Dashboard Widgets

### 1. PO Status Distribution Chart
**Roles:** Admin, Purchasing
**Priority:** Phase 1 (High Value, Low Effort)
**Value:** Quick visual overview of PO pipeline health

**Features:**
- Donut/Bar chart showing: Draft → Open → Closed → Cancelled
- Total count and value for each status
- Click to filter PO table by status
- Color-coded: Draft (gray), Open (blue), Closed (green), Cancelled (red)

**Data Source:** API Endpoint (filterable by date range)

---

### 2. Recent PO Activity Feed
**Roles:** All (filtered by permissions)
**Priority:** Phase 1 (High Value, Low Effort)
**Value:** Keep everyone informed of latest PO actions

**Features:**
- Last 10 PO events with timestamps
- Shows: Created, Finalized, Closed, Cancelled
- Displays: PO number, vendor, amount, action user
- Link to view full PO details

**Data Source:** API Endpoint (paginated/infinite scroll)

---

### 3. Draft POs Reminder Widget
**Roles:** Purchasing
**Priority:** Phase 1 (High Value, Low Effort)
**Value:** Prevent abandoned draft POs

**Features:**
- List of draft POs older than 7 days
- Shows: PO number, vendor, created date, days pending
- Quick action: "Finalize" or "Delete" buttons
- Helps reduce clutter and improve workflow

**Data Source:** Initial Load (simple query, small dataset)

---

### 4. PO Delivery Timeline
**Roles:** Purchasing, Admin
**Priority:** Phase 2 (Medium Effort, High Value)
**Value:** Proactive delivery tracking

**Features:**
- Calendar view or list of expected deliveries (30 days)
- Color-coded by urgency: Overdue, This Week, Next Week, Later
- Shows: PO number, vendor, expected delivery date, amount
- Links to PO details for follow-up

**Data Source:** API Endpoint (date range filters)

---

### 5. PO-to-Invoice Conversion Tracking
**Roles:** Payables, Admin
**Priority:** Phase 2 (Medium Effort, High Value)
**Value:** Monitor invoice receipt and processing

**Features:**
- Shows open POs awaiting invoices
- Metrics: POs with no invoices, POs with partial invoices
- Aging: POs open > 30/60/90 days without invoices
- Helps identify vendor follow-ups needed

**Data Source:** API Endpoint (complex query, aging filters)

---

### 6. Top Vendors by PO Value
**Roles:** Admin, Purchasing
**Priority:** Phase 3 (Nice to Have)
**Value:** Vendor relationship management insights

**Features:**
- Bar chart or table of top 10 vendors by total PO value
- Shows: Vendor name, total PO amount, # of POs, avg PO value
- Time filter: This month, Quarter, Year-to-date
- Click to view vendor's PO history

**Data Source:** API Endpoint (time range filters)

---

### 7. PO Budget Utilization (by Project)
**Roles:** Admin
**Priority:** Phase 3 (Nice to Have)
**Value:** Track spending against projects

**Features:**
- Bar chart showing top 10 projects by PO value
- Shows: Total PO amount per project, # of POs, # of open vs closed
- Helps identify high-spend projects
- Click to see project's PO list

**Data Source:** API Endpoint (filterable, potentially large dataset)

---

### 8. PO Aging Analysis
**Roles:** Admin, Purchasing
**Priority:** Phase 3 (Nice to Have)
**Value:** Identify stale/problematic POs

**Features:**
- Table showing open POs by age bucket: 0-30, 31-60, 61-90, 90+ days
- Shows count and total value per bucket
- Click to filter PO table by age range
- Helps with closure and cleanup efforts

**Data Source:** API Endpoint (complex aggregation)

---

### 9. PO Amount by Currency (PHP vs USD)
**Roles:** Admin
**Priority:** Phase 3 (Nice to Have)
**Value:** Multi-currency tracking

**Features:**
- Side-by-side comparison of PHP vs USD POs
- Shows: Total amount, count, average value
- Helps with forex exposure tracking

**Data Source:** Initial Load or API Endpoint

---

## Implementation Priority

### Phase 1 (Quick Wins - High Value, Low Effort)
1. ✅ PO Status Distribution Chart
2. ✅ Recent PO Activity Feed
3. ✅ Draft POs Reminder Widget

### Phase 2 (Medium Effort, High Value)
4. ✅ PO Delivery Timeline
5. ✅ PO-to-Invoice Conversion Tracking

### Phase 3 (Nice to Have)
6. Top Vendors by PO Value
7. PO Budget Utilization (by Project)
8. PO Aging Analysis
9. PO Amount by Currency

---

## Backend Architecture: Hybrid Strategy

### Approach Overview

We're using a **hybrid approach** that combines:
1. **Initial Load (Inertia)** - for static, simple aggregations
2. **Dedicated API Endpoints (JSON)** - for dynamic, filterable data

### Decision Matrix

| Widget | Data Source | Reasoning |
|--------|------------|-----------|
| Financial Summary Cards | Initial Load | Simple aggregations, always shown, no filters |
| Pending Actions | Initial Load | Quick counts, always visible, no interaction |
| Draft POs Reminder | Initial Load | Simple query, small dataset |
| PO Status Distribution | API Endpoint | Date range filters, interactive |
| Recent PO Activity Feed | API Endpoint | Paginated/infinite scroll, refreshable |
| PO Delivery Timeline | API Endpoint | Date range filters, potentially large dataset |
| Top Vendors by PO Value | API Endpoint | Time range filters (month/quarter/year) |
| PO Budget by Project | API Endpoint | Filterable, potentially large dataset |
| PO-Invoice Conversion | API Endpoint | Complex query, aging filters |

---

## Backend Implementation Structure

### 1. Controller Organization

```
app/Http/Controllers/DashboardController.php
├── index()                    // Main Inertia page (initial load)
├── summaryData()              // API: Financial summary
├── poStatusData()             // API: PO status distribution
├── recentActivity()           // API: Recent PO activity
├── draftPosData()             // API: Draft POs
├── deliveryTimeline()         // API: PO delivery timeline
├── topVendors()               // API: Top vendors (with filters)
├── budgetByProject()          // API: Budget utilization
└── poInvoiceConversion()      // API: PO-to-Invoice tracking
```

### 2. Route Structure

```php
// routes/web.php

// Main dashboard page (Inertia)
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->name('dashboard');

// Dashboard API endpoints (JSON responses)
Route::prefix('api/dashboard')->group(function () {
    Route::get('/po-status', [DashboardController::class, 'poStatusData'])
        ->name('dashboard.api.po-status');

    Route::get('/recent-activity', [DashboardController::class, 'recentActivity'])
        ->name('dashboard.api.recent-activity');

    Route::get('/top-vendors', [DashboardController::class, 'topVendors'])
        ->name('dashboard.api.top-vendors');

    Route::get('/budget-by-project', [DashboardController::class, 'budgetByProject'])
        ->name('dashboard.api.budget-by-project');

    Route::get('/delivery-timeline', [DashboardController::class, 'deliveryTimeline'])
        ->name('dashboard.api.delivery-timeline');

    Route::get('/po-invoice-conversion', [DashboardController::class, 'poInvoiceConversion'])
        ->name('dashboard.api.po-invoice-conversion');
});
```

### 3. Initial Load Pattern

```php
public function index(Request $request)
{
    $user = $request->user();

    // Role-based widget visibility
    $widgets = $this->getAvailableWidgets($user);

    // Lightweight initial data (only critical widgets)
    $initialData = [
        'widgets' => $widgets,
        'summary' => $this->getFinancialSummary(),
        'actions' => $this->getPendingActions(),
        'draftPosCount' => $user->isPurchasing()
            ? $this->getDraftPosCount()
            : null,
    ];

    return inertia('dashboard/dashboard', $initialData);
}

private function getAvailableWidgets(User $user): array
{
    $allWidgets = [
        'financial_summary' => ['admin', 'purchasing', 'payables', 'disbursement'],
        'pending_actions' => ['admin', 'purchasing', 'payables'],
        'po_status_distribution' => ['admin', 'purchasing'],
        'recent_activity' => ['admin', 'purchasing', 'payables'],
        'draft_pos_reminder' => ['purchasing'],
        'delivery_timeline' => ['admin', 'purchasing'],
        'top_vendors' => ['admin', 'purchasing'],
        'budget_by_project' => ['admin'],
        'po_invoice_conversion' => ['admin', 'payables'],
        'po_aging' => ['admin', 'purchasing'],
        'currency_breakdown' => ['admin'],
    ];

    $availableWidgets = [];
    foreach ($allWidgets as $widget => $roles) {
        if (in_array($user->role, $roles)) {
            $availableWidgets[] = $widget;
        }
    }

    return $availableWidgets;
}
```

### 4. API Endpoint Examples

#### PO Status Distribution
```php
// Route: /api/dashboard/po-status
public function poStatusData(Request $request)
{
    $dateFrom = $request->get('date_from', Carbon::now()->subMonth());
    $dateTo = $request->get('date_to', Carbon::now());

    $data = PurchaseOrder::selectRaw('
            po_status,
            COUNT(*) as count,
            SUM(po_amount) as total_amount,
            currency
        ')
        ->whereBetween('created_at', [$dateFrom, $dateTo])
        ->groupBy('po_status', 'currency')
        ->get();

    return response()->json([
        'statusDistribution' => $data,
        'dateRange' => ['from' => $dateFrom, 'to' => $dateTo]
    ]);
}
```

#### Recent Activity Feed
```php
// Route: /api/dashboard/recent-activity
public function recentActivity(Request $request)
{
    $perPage = $request->get('per_page', 10);

    $activities = ActivityLog::with(['loggable', 'user'])
        ->where('loggable_type', PurchaseOrder::class)
        ->latest()
        ->paginate($perPage);

    return response()->json([
        'activities' => $activities
    ]);
}
```

#### Top Vendors
```php
// Route: /api/dashboard/top-vendors
public function topVendors(Request $request)
{
    $period = $request->get('period', 'month'); // month, quarter, year
    $limit = $request->get('limit', 10);

    $dateFrom = match($period) {
        'month' => Carbon::now()->startOfMonth(),
        'quarter' => Carbon::now()->startOfQuarter(),
        'year' => Carbon::now()->startOfYear(),
        default => Carbon::now()->startOfMonth(),
    };

    $vendors = PurchaseOrder::with('vendor')
        ->select('vendor_id')
        ->selectRaw('
            COUNT(*) as po_count,
            SUM(po_amount) as total_amount,
            AVG(po_amount) as avg_amount,
            currency
        ')
        ->where('created_at', '>=', $dateFrom)
        ->whereNotNull('vendor_id')
        ->groupBy('vendor_id', 'currency')
        ->orderByDesc('total_amount')
        ->limit($limit)
        ->get();

    return response()->json([
        'vendors' => $vendors,
        'period' => $period,
        'dateFrom' => $dateFrom
    ]);
}
```

#### PO-to-Invoice Conversion Tracking
```php
// Route: /api/dashboard/po-invoice-conversion
public function poInvoiceConversion(Request $request)
{
    $ageBucket = $request->get('age_bucket', 'all'); // all, 30, 60, 90

    // Open POs with invoice counts
    $query = PurchaseOrder::with(['vendor', 'project'])
        ->withCount('invoices')
        ->where('po_status', 'open');

    // Age filtering
    if ($ageBucket !== 'all') {
        $daysAgo = (int) $ageBucket;
        $query->where('finalized_at', '<=', Carbon::now()->subDays($daysAgo));
    }

    $posWithoutInvoices = (clone $query)->having('invoices_count', 0)->get();
    $posWithInvoices = (clone $query)->having('invoices_count', '>', 0)->get();

    return response()->json([
        'withoutInvoices' => [
            'count' => $posWithoutInvoices->count(),
            'total_amount' => $posWithoutInvoices->sum('po_amount'),
            'items' => $posWithoutInvoices->take(10),
        ],
        'withInvoices' => [
            'count' => $posWithInvoices->count(),
            'total_amount' => $posWithInvoices->sum('po_amount'),
        ],
        'ageBucket' => $ageBucket,
    ]);
}
```

#### Delivery Timeline
```php
// Route: /api/dashboard/delivery-timeline
public function deliveryTimeline(Request $request)
{
    $daysAhead = $request->get('days', 30);

    $pos = PurchaseOrder::with(['vendor', 'project'])
        ->where('po_status', 'open')
        ->whereNotNull('expected_delivery_date')
        ->whereBetween('expected_delivery_date', [
            Carbon::now(),
            Carbon::now()->addDays($daysAhead)
        ])
        ->orderBy('expected_delivery_date', 'asc')
        ->get()
        ->map(function ($po) {
            $daysUntil = Carbon::parse($po->expected_delivery_date)->diffInDays(Carbon::now(), false);

            return [
                'id' => $po->id,
                'po_number' => $po->po_number,
                'vendor_name' => $po->vendor->name ?? 'Unknown',
                'project_title' => $po->project->project_title ?? 'Unknown',
                'expected_delivery_date' => $po->expected_delivery_date,
                'po_amount' => $po->po_amount,
                'currency' => $po->currency,
                'days_until' => abs($daysUntil),
                'urgency' => $daysUntil < 0 ? 'overdue'
                    : ($daysUntil <= 7 ? 'this_week'
                    : ($daysUntil <= 14 ? 'next_week' : 'later')),
            ];
        });

    return response()->json([
        'deliveries' => $pos,
        'daysAhead' => $daysAhead,
    ]);
}
```

---

## Performance Considerations

### 1. Caching Strategy

```php
use Illuminate\Support\Facades\Cache;

public function poStatusData(Request $request)
{
    $cacheKey = sprintf(
        'dashboard:po-status:%s:%s:%s',
        $request->user()->id,
        $request->get('date_from'),
        $request->get('date_to')
    );

    return response()->json(
        Cache::remember($cacheKey, 300, function () use ($request) {
            // Expensive query logic here
        })
    );
}
```

### 2. Database Optimization

**Add Indexes:**
```php
// In migration or separate index migration
Schema::table('purchase_orders', function (Blueprint $table) {
    $table->index(['po_status', 'created_at']);
    $table->index(['po_status', 'expected_delivery_date']);
    $table->index(['po_status', 'finalized_at']);
    $table->index(['vendor_id', 'po_status']);
    $table->index(['project_id', 'po_status']);
});

Schema::table('activity_logs', function (Blueprint $table) {
    $table->index(['loggable_type', 'loggable_id', 'created_at']);
});
```

**Use Eager Loading:**
```php
// Prevent N+1 queries
PurchaseOrder::with(['vendor', 'project', 'createdBy'])
    ->where('po_status', 'open')
    ->get();
```

**Use Raw Aggregations:**
```php
// More efficient than loading all records and counting in PHP
PurchaseOrder::selectRaw('
        po_status,
        COUNT(*) as count,
        SUM(po_amount) as total_amount
    ')
    ->groupBy('po_status')
    ->get();
```

### 3. Rate Limiting

```php
// In routes/web.php
Route::middleware(['throttle:60,1'])->prefix('api/dashboard')->group(function () {
    // Dashboard API routes - limit to 60 requests per minute per user
});
```

### 4. Response Caching

```php
// For expensive queries, cache at HTTP level
public function topVendors(Request $request)
{
    return response()
        ->json($data)
        ->header('Cache-Control', 'public, max-age=300'); // 5 min browser cache
}
```

---

## Frontend Implementation Pattern

### 1. Widget with API Data Fetching

```typescript
// resources/js/pages/dashboard/components/POStatusWidget.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface POStatusData {
    po_status: string;
    count: number;
    total_amount: number;
    currency: string;
}

export function POStatusWidget() {
    const [data, setData] = useState<POStatusData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        setLoading(true);
        fetch(`/api/dashboard/po-status?date_from=${dateRange.from}&date_to=${dateRange.to}`)
            .then(res => res.json())
            .then(data => {
                setData(data.statusDistribution);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load PO status data:', err);
                setLoading(false);
            });
    }, [dateRange]);

    if (loading) {
        return <POStatusSkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>PO Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Chart component here */}
            </CardContent>
        </Card>
    );
}
```

### 2. Role-Based Widget Visibility

```typescript
// resources/js/pages/dashboard/dashboard.tsx
import { usePage } from '@inertiajs/react';
import { hasRole, hasAnyRole } from '@/lib/roles';

export default function Dashboard({ widgets, summary, actions }: DashboardProps) {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Financial Summary - All Roles */}
                <FinancialSummaryCards summary={summary} />

                {/* Pending Actions - Admin, Purchasing, Payables */}
                {hasAnyRole(auth.user, ['admin', 'purchasing', 'payables']) && (
                    <PendingActionsWidget actions={actions} />
                )}

                {/* PO Status Distribution - Admin, Purchasing */}
                {hasAnyRole(auth.user, ['admin', 'purchasing']) && (
                    <POStatusWidget />
                )}

                {/* Draft POs Reminder - Purchasing Only */}
                {hasRole(auth.user, 'purchasing') && (
                    <DraftPOsReminderWidget />
                )}

                {/* Recent Activity - Admin, Purchasing, Payables */}
                {hasAnyRole(auth.user, ['admin', 'purchasing', 'payables']) && (
                    <RecentActivityWidget />
                )}

                {/* PO-Invoice Conversion - Admin, Payables */}
                {hasAnyRole(auth.user, ['admin', 'payables']) && (
                    <POInvoiceConversionWidget />
                )}
            </div>
        </AppLayout>
    );
}
```

---

## Role-Based Dashboard Layouts

### Admin Dashboard
- Financial Summary Cards ✅
- Pending Actions Widget ✅
- PO Status Distribution Chart ✅
- Recent PO Activity Feed ✅
- Top Vendors by PO Value ✅
- PO Budget Utilization ✅
- PO Aging Analysis ✅
- PO-Invoice Conversion Tracking ✅
- Currency Breakdown ✅

**Focus:** Full visibility and oversight

---

### Purchasing Dashboard
- Financial Summary Cards ✅
- Pending Actions Widget ✅
- PO Status Distribution Chart ✅
- Draft POs Reminder Widget ⚠️ (High priority)
- Recent PO Activity Feed ✅
- PO Delivery Timeline ⚠️ (High priority)
- Top Vendors by PO Value ✅

**Focus:** Operational workflow and vendor management

---

### Payables Dashboard
- Financial Summary Cards ✅
- Pending Actions Widget ✅
- Recent PO Activity Feed (read-only) ✅
- PO-Invoice Conversion Tracking ⚠️ (High priority)
- Upcoming Payments (existing) ✅

**Focus:** Invoice processing readiness

---

### Disbursement Dashboard
- Financial Summary Cards ✅
- Upcoming Payments (existing) ✅

**Focus:** Payment processing (minimal PO visibility)

---

## Technical Stack

### Backend
- **Laravel 12** - Framework
- **Eloquent ORM** - Database queries
- **Carbon** - Date/time handling
- **Cache (Redis)** - Query result caching

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Inertia.js** - SPA without API
- **Chart.js** or **Recharts** - Data visualization
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library

---

## Testing Strategy

### Backend Tests
```php
// tests/Feature/DashboardTest.php
public function test_admin_can_access_all_widgets()
{
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('widgets', 11) // All 11 widgets
        ->has('summary')
        ->has('actions')
    );
}

public function test_purchasing_sees_draft_pos_reminder()
{
    $user = User::factory()->purchasing()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('widgets', fn ($widgets) =>
            in_array('draft_pos_reminder', $widgets)
        )
    );
}

public function test_po_status_api_returns_correct_data()
{
    $user = User::factory()->admin()->create();

    PurchaseOrder::factory()->create(['po_status' => 'open']);
    PurchaseOrder::factory()->create(['po_status' => 'draft']);

    $response = $this->actingAs($user)
        ->get('/api/dashboard/po-status');

    $response->assertOk()
        ->assertJsonStructure([
            'statusDistribution' => [
                '*' => ['po_status', 'count', 'total_amount', 'currency']
            ],
            'dateRange'
        ]);
}
```

---

## Migration Plan

### Step 1: Backend Foundation
- [ ] Create new controller methods in `DashboardController`
- [ ] Add API routes in `routes/web.php`
- [ ] Implement role-based widget visibility logic
- [ ] Add database indexes for dashboard queries
- [ ] Write backend tests

### Step 2: API Endpoints (Phase 1)
- [ ] Implement `poStatusData()` endpoint
- [ ] Implement `recentActivity()` endpoint
- [ ] Update `index()` to include draft POs count
- [ ] Add caching for expensive queries

### Step 3: Frontend Components (Phase 1)
- [ ] Create `POStatusWidget.tsx` component
- [ ] Create `RecentActivityWidget.tsx` component
- [ ] Create `DraftPOsReminderWidget.tsx` component
- [ ] Add loading skeletons
- [ ] Implement role-based conditional rendering

### Step 4: Integration & Testing (Phase 1)
- [ ] Integrate widgets into dashboard page
- [ ] Test role-based visibility
- [ ] Test API endpoints
- [ ] Add error handling
- [ ] Performance testing

### Step 5: Phase 2 & 3 Implementation
- [ ] Repeat steps 2-4 for remaining widgets
- [ ] Add chart libraries if needed
- [ ] Implement advanced filtering
- [ ] Optimize and cache

---

## Open Questions

1. **Chart Library:** Should we use Chart.js or Recharts for visualizations?
2. **Refresh Interval:** Should widgets auto-refresh? If yes, what interval?
3. **Mobile Responsiveness:** How should complex charts render on mobile?
4. **Export Functionality:** Should users be able to export widget data (CSV/PDF)?
5. **Customization:** Should users be able to customize dashboard layout/widgets?

---

## References

- **Role System:** `docs/ROLE_SYSTEM.md`
- **Dialog Components:** `docs/DIALOG_COMPONENTS_SUMMARY.md`
- **Bulk Operations Pattern:** `docs/BULK_INVOICE_REVIEW_OPTIMIZATION.md`
- **Design Guidelines:** `docs/DESIGN_GUIDELINES_ACCOUNTING_SOFTWARE.md`
- **Project Instructions:** `CLAUDE.md`

---

## Changelog

- **2025-11-25:** Initial architecture plan and widget specification
