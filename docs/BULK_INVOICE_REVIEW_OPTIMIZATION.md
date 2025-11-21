``# Bulk Invoice Review Optimization Plan

**Goal**: Optimize bulk invoice review page for faster loading and better UX with infinite scroll and on-demand detail fetching.

**Tech Stack**: React, Inertia.js, Laravel (no external state management libraries)

---

## 📊 Current Performance Issues

1. ❌ Backend eagerly loads full relationships (`purchaseOrder.project`, `purchaseOrder.vendor`, `files`) for up to 500 invoices
2. ❌ All invoice data (with nested relationships) loaded into memory at once
3. ❌ No lazy loading - invoice details already fully loaded on page load
4. ❌ Traditional pagination instead of infinite scroll
5. ❌ Large network payload (500KB-2MB for 100 invoices)

---

## ✅ Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial page load | 3-5s (100 invoices) | <1s (20 invoices) | **4-5x faster** |
| Memory usage | ~5-10MB (full data) | ~1-2MB (list only) | **5x reduction** |
| Network payload | 500KB-2MB | ~100KB initial | **10-20x smaller** |
| Scroll performance | Pagination | Smooth infinite scroll | **Better UX** |

---

## 🎯 Implementation Plan

### **Phase 1: Backend - Lightweight List Endpoint**

#### ✅ TODO 1.1: Create Lightweight Invoice List Method
**File**: `app/Http/Controllers/InvoiceController.php`

**Create new method**: `bulkReviewList(Request $request)`

**What to return (minimal fields only)**:
```php
- id
- si_number
- invoice_amount
- currency
- invoice_status
- files_received_at
- due_date
- created_at
- vendor_name (via join - not eager load)
- project_title (via join - not eager load)
- po_number (via join - not eager load)
- files_count (aggregate count)
```

**Pagination**:
- Use **cursor pagination** (better for infinite scroll)
- **Limit**: 25 items per request
- Return cursor for next page

**Optimizations**:
- Use `select()` to limit columns
- Use `join()` instead of `with()` for vendor/project names
- Use `withCount('files')` instead of loading full files relationship
- Remove all eager loading except what's absolutely needed

**Example structure**:
```php
public function bulkReviewList(Request $request)
{
    $query = Invoice::query()
        ->select([
            'invoices.id',
            'invoices.si_number',
            'invoices.invoice_amount',
            'invoices.currency',
            'invoices.invoice_status',
            'invoices.files_received_at',
            'invoices.due_date',
            'invoices.created_at',
            'vendors.name as vendor_name',
            'projects.project_title',
            'purchase_orders.po_number',
        ])
        ->join('purchase_orders', 'invoices.purchase_order_id', '=', 'purchase_orders.id')
        ->join('vendors', 'purchase_orders.vendor_id', '=', 'vendors.id')
        ->join('projects', 'purchase_orders.project_id', '=', 'projects.id')
        ->withCount('files')
        ->whereNotIn('invoices.invoice_status', ['approved', 'pending_disbursement', 'paid']);

    // Apply filters (search, vendor, status, etc.)
    // ...

    // Cursor pagination
    return $query->cursorPaginate(25);
}
```

---

#### ✅ TODO 1.2: Create Invoice Details Endpoint
**File**: `app/Http/Controllers/InvoiceController.php`

**Create new method**: `getInvoiceDetails(Invoice $invoice)`

**What to return**:
```php
- Full invoice object
- purchaseOrder (with project, vendor)
- files array
- remarks (with user)
- activityLogs (with user) - optional, can be lazy loaded separately
```

**Example**:
```php
public function getInvoiceDetails(Invoice $invoice)
{
    $invoice->load([
        'purchaseOrder.project',
        'purchaseOrder.vendor',
        'purchaseOrder.files',
        'files',
        'remarks.user:id,name',
        // 'activityLogs.user' - optionally load separately for even better performance
    ]);

    return response()->json($invoice);
}
```

---

#### ✅ TODO 1.3: Add New Routes
**File**: `routes/web.php`

```php
// Lightweight list endpoint for infinite scroll
Route::get('/invoice/bulk-review-list', [InvoiceController::class, 'bulkReviewList'])
    ->name('invoices.bulk-review-list');

// Individual invoice details endpoint
Route::get('/invoice/{invoice}/details', [InvoiceController::class, 'getInvoiceDetails'])
    ->name('invoices.details');
```

---

#### ✅ TODO 1.4: Database Indexes (if not present)
**File**: Create new migration or add to existing

```php
// Check if these indexes exist, add if missing:
$table->index('invoice_status');
$table->index('created_at');
$table->index(['purchase_order_id', 'invoice_status']); // Composite
```

---

### **Phase 2: Frontend - Infinite Scroll Implementation**

#### ✅ TODO 2.1: Update Initial Page Load
**File**: `app/Http/Controllers/InvoiceController.php` - Update `bulkReview()` method

**Change**:
```php
// BEFORE: Load 100 invoices with full relationships
$invoices = $query->with(['purchaseOrder.project', 'purchaseOrder.vendor', 'files'])
    ->paginate($perPage);

// AFTER: Load only 25 lightweight invoices
$invoices = [lightweight list from bulkReviewList method]
```

**Or**: Keep `bulkReview()` for the page shell, but have it call `bulkReviewList()` internally for data

---

#### ✅ TODO 2.2: Refactor BulkInvoiceReview Component
**File**: `resources/js/pages/invoices/components/BulkInvoiceReview.jsx`

**Changes needed**:

1. **Add infinite scroll state**:
```jsx
const [invoiceList, setInvoiceList] = useState(invoices.data || []);
const [nextCursor, setNextCursor] = useState(invoices.next_cursor);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(!!invoices.next_cursor);
```

2. **Create fetch more function**:
```jsx
const fetchMoreInvoices = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    // Use Inertia's router or axios
    axios.get('/invoice/bulk-review-list', {
        params: {
            cursor: nextCursor,
            ...filters, // current filters
        }
    }).then(response => {
        setInvoiceList(prev => [...prev, ...response.data.data]);
        setNextCursor(response.data.next_cursor);
        setHasMore(!!response.data.next_cursor);
    }).finally(() => {
        setIsLoadingMore(false);
    });
}, [hasMore, isLoadingMore, nextCursor, filters]);
```

3. **Add Intersection Observer for infinite scroll**:
```jsx
const observerTarget = useRef(null);

useEffect(() => {
    const observer = new IntersectionObserver(
        entries => {
            if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                fetchMoreInvoices();
            }
        },
        { threshold: 0.1 }
    );

    if (observerTarget.current) {
        observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
}, [fetchMoreInvoices, hasMore, isLoadingMore]);
```

4. **Add scroll trigger element in list**:
```jsx
{/* At the end of invoice list */}
<div ref={observerTarget} className="h-10 flex items-center justify-center">
    {isLoadingMore && <Spinner />}
    {!hasMore && invoiceList.length > 0 && (
        <p className="text-sm text-muted-foreground">No more invoices</p>
    )}
</div>
```

---

#### ✅ TODO 2.3: Implement On-Demand Detail Fetching
**File**: `resources/js/pages/invoices/components/BulkInvoiceReview.jsx`

**Add state for fetched details**:
```jsx
const [invoiceDetails, setInvoiceDetails] = useState({});
const [loadingDetailId, setLoadingDetailId] = useState(null);
```

**Create fetch details function**:
```jsx
const fetchInvoiceDetails = useCallback((invoiceId) => {
    // Check if already fetched
    if (invoiceDetails[invoiceId]) {
        return;
    }

    setLoadingDetailId(invoiceId);

    axios.get(`/invoice/${invoiceId}/details`)
        .then(response => {
            setInvoiceDetails(prev => ({
                ...prev,
                [invoiceId]: response.data
            }));
        })
        .catch(error => {
            toast.error('Failed to load invoice details');
        })
        .finally(() => {
            setLoadingDetailId(null);
        });
}, [invoiceDetails]);
```

**Update handleSelectInvoice**:
```jsx
const handleSelectInvoice = useCallback((invoiceId, index) => {
    setCurrentInvoiceIndex(index);

    // Fetch details if not already loaded
    fetchInvoiceDetails(invoiceId);

    // Rest of selection logic...
}, [fetchInvoiceDetails]);
```

---

#### ✅ TODO 2.4: Update BulkInvoiceDetails Component
**File**: `resources/js/pages/invoices/components/BulkInvoicesDetails.jsx`

**Changes**:
1. Accept `invoiceDetails` and `loadingDetailId` as props
2. Show loading state while fetching:
```jsx
if (loadingDetailId === currentInvoice?.id) {
    return <div className="flex items-center justify-center h-full">
        <Spinner />
        <p>Loading invoice details...</p>
    </div>;
}
```
3. Use `invoiceDetails[currentInvoice.id]` for full data
4. Fallback to lightweight data from list for basic info

---

#### ✅ TODO 2.5: Update BulkInvoiceList Component
**File**: `resources/js/pages/invoices/components/BulkInvoiceList.jsx`

**Changes**:
1. Remove pagination controls (links, page numbers)
2. Use `invoiceList` state instead of `invoices.data`
3. Add infinite scroll trigger at bottom
4. Update to handle lightweight invoice data (no nested purchaseOrder object):
```jsx
// BEFORE: invoice.purchaseOrder.vendor.name
// AFTER: invoice.vendor_name (from join)
```

---

### **Phase 3: Filter & Search Handling**

#### ✅ TODO 3.1: Reset Scroll on Filter Change
**File**: `resources/js/pages/invoices/components/BulkInvoiceReview.jsx`

**When filters change**:
```jsx
const handleFilterChange = (newFilters) => {
    // Reset infinite scroll state
    setInvoiceList([]);
    setNextCursor(null);
    setHasMore(true);

    // Fetch fresh data with new filters
    // ...
};
```

---

#### ✅ TODO 3.2: Debounce Search (Already Implemented ✓)
**Status**: Already implemented in current code - no changes needed

---

### **Phase 4: Bulk Actions & Cache Invalidation**

#### ✅ TODO 4.1: Invalidate Cached Details After Bulk Actions
**File**: `resources/js/pages/invoices/components/BulkInvoiceReview.jsx`

**After approve/reject/mark-received**:
```jsx
const confirmBulkAction = () => {
    const invoiceIds = Array.from(selectedInvoices);

    router.post(`/invoice/bulk-${bulkAction}`, {
        invoice_ids: invoiceIds,
        notes: reviewNotes,
    }, {
        onSuccess: () => {
            // Clear cached details for affected invoices
            setInvoiceDetails(prev => {
                const updated = { ...prev };
                invoiceIds.forEach(id => delete updated[id]);
                return updated;
            });

            // Update list items optimistically or refetch
            // ...
        }
    });
};
```

---

#### ✅ TODO 4.2: Optimistic UI Updates
**File**: `resources/js/pages/invoices/components/BulkInvoiceReview.jsx`

**Update list immediately after bulk action**:
```jsx
// Update invoice status in list immediately
setInvoiceList(prev => prev.map(inv =>
    invoiceIds.includes(inv.id)
        ? { ...inv, invoice_status: newStatus }
        : inv
));
```

---

### **Phase 5: Performance Enhancements**

#### ✅ TODO 5.1: Add Virtual Scrolling (Optional - if list > 100 items)
**Library**: `@tanstack/react-virtual` (lightweight, no state management)
**When**: Only if performance issues with 100+ items in DOM

---

#### ✅ TODO 5.2: Optimize Re-renders
**File**: `resources/js/pages/invoices/components/BulkInvoiceReview.jsx`

**Use React.memo for**:
- `BulkInvoiceList` component
- Individual invoice list items
- `BulkInvoiceDetails` component (if it's re-rendering unnecessarily)

**Example**:
```jsx
const InvoiceListItem = React.memo(({ invoice, isSelected, onClick }) => {
    // ...
}, (prevProps, nextProps) => {
    return prevProps.invoice.id === nextProps.invoice.id
        && prevProps.isSelected === nextProps.isSelected;
});
```

---

#### ✅ TODO 5.3: Prefetch Next Invoice (Optional Enhancement)
**When hovering over next invoice**, prefetch its details:
```jsx
const handleInvoiceHover = (invoiceId) => {
    // Prefetch if not already loaded
    if (!invoiceDetails[invoiceId] && !loadingDetailId) {
        fetchInvoiceDetails(invoiceId);
    }
};
```

---

### **Phase 6: Testing & Validation**

#### ✅ TODO 6.1: Test with Large Dataset
- [ ] Test with 1000+ invoices
- [ ] Verify infinite scroll works smoothly
- [ ] Check memory usage doesn't grow unbounded
- [ ] Verify scroll position maintained on filter change

---

#### ✅ TODO 6.2: Test Bulk Actions
- [ ] Select invoices across multiple pages (infinite scroll)
- [ ] Verify bulk approve works
- [ ] Verify bulk reject works
- [ ] Verify selection persists during scroll
- [ ] Test cache invalidation after bulk actions

---

#### ✅ TODO 6.3: Performance Benchmarks
- [ ] Measure initial page load time (target: <1s)
- [ ] Measure detail fetch time (target: <500ms)
- [ ] Measure infinite scroll smoothness (no jank)
- [ ] Network payload size (target: <100KB initial)

---

## 🔧 Technical Implementation Notes

### **Using Inertia + React (No External Libraries)**

**Data Fetching**:
- Use `axios` (already included with Laravel) for additional API calls
- Use Inertia's `router.get()` for filter changes
- Use native `fetch()` as alternative to axios

**State Management**:
- React's `useState` for local state
- `useCallback` for memoized functions
- `useMemo` for derived data (only when needed)
- `useRef` for Intersection Observer

**Caching**:
- Simple object in state: `{ [invoiceId]: details }`
- Clear cache on bulk actions
- Optional: Use sessionStorage for persistence across page navigation

**Infinite Scroll**:
- Native `IntersectionObserver` API
- Cursor-based pagination from Laravel
- Manual state management for loading/hasMore

---

## 📝 Implementation Order

**Priority Order** (recommended sequence):

1. **Backend first** (TODO 1.1 → 1.4) - Foundation for everything
2. **Basic infinite scroll** (TODO 2.1, 2.2, 2.5) - Get list working
3. **On-demand details** (TODO 2.3, 2.4) - Lazy load details
4. **Filter handling** (TODO 3.1) - Reset scroll on filters
5. **Bulk actions** (TODO 4.1, 4.2) - Cache invalidation
6. **Optimizations** (TODO 5.1, 5.2, 5.3) - Polish
7. **Testing** (TODO 6.1, 6.2, 6.3) - Validation

---

## ⚠️ Important Considerations

1. **Selection State**: When using infinite scroll, selected invoices should persist even if they scroll out of view
2. **Filter Changes**: Reset scroll position and clear list when filters change
3. **Memory Management**: Don't let `invoiceList` grow indefinitely - consider max limit or virtualization
4. **Error Handling**: Handle network failures gracefully with retry options
5. **Loading States**: Show clear loading indicators for both list and details

---

## 🎉 Success Criteria

- ✅ Initial page load < 1 second
- ✅ Infinite scroll works smoothly with 1000+ invoices
- ✅ Invoice details load in < 500ms
- ✅ Bulk actions work across paginated results
- ✅ No memory leaks or performance degradation
- ✅ Network payload reduced by 80%+

---

**Last Updated**: 2025-11-21
**Status**: 📋 Planning Phase - Ready for Implementation
