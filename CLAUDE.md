# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Payables Management System** built with **Laravel 12** and **React 19** using **Inertia.js**. The application manages the workflow of purchase orders, invoices, and check requisitions for PGCI (project-based financial management).

## Core Domain Models & Workflow

The application follows this financial workflow:

1. **Vendors** → Suppliers that provide goods/services
2. **Projects** → Business projects that need purchases
3. **Purchase Orders (POs)** → Orders placed with vendors for specific projects
   - Contains line items (individual ordered items)
   - Has attached files (contracts, quotes, etc.)
4. **Invoices** → Bills received from vendors against POs
   - Must be linked to a PurchaseOrder
   - Can be reviewed/approved/rejected
   - Supports bulk operations (bulk review, bulk approve, bulk reject)
5. **Check Requisitions** → Payment requests generated from approved invoices
   - Groups multiple invoices together for payment
   - Has approval workflow (generated → approved/rejected)
   - Tracks generator and processor users

### Important Relationships

- **Invoice → PurchaseOrder**: Each invoice belongs to exactly one PO
- **Invoice → Vendor/Project**: Accessed via `hasOneThrough` relationships through PurchaseOrder (no direct foreign keys)
- **CheckRequisition ↔ Invoice**: Many-to-many via `check_requisition_invoices` pivot table
- **CheckRequisition → Users**: Two relationships - `generator` (created by) and `processor` (approved by)
- All models use polymorphic relationships for:
  - **Files** (`fileable` morph) - with version tracking and soft deletion via `is_active`
  - **ActivityLogs** (`loggable` morph) - business-level events
  - **Remarks** (`remarkable` morph via `HasRemarks` trait) - comments system

### Business Logic Patterns

- **PurchaseOrder**: `allInvoicesPaid()` method checks if PO can be closed
- **File Model**: Includes `exists()`, `download()`, `deleteFile()`, `isPdf()` helper methods
- **ActivityLog**: Models override `getCreationMessage()`, `getStatusChangeMessage()` for custom logging messages
- **Currency Support**: Models support both PHP (Philippine Peso) and USD with currency field

## Development Commands

### Start Development Server
```bash
composer dev
```
This runs concurrently:
- Laravel dev server on port 8020
- Queue listener
- Vite dev server

### Alternative: SSR Mode
```bash
composer dev:ssr
```
Adds Inertia SSR server and Laravel Pail for logs.

### Build & Test
```bash
npm run build           # Production build
npm run build:ssr       # SSR production build
composer test           # Run PHP tests (Pest)
npm run types           # TypeScript type checking
npm run lint            # ESLint with auto-fix
npm run format          # Prettier formatting
npm run format:check    # Check formatting without changes
```

### Running Single Tests
```bash
php artisan test --filter TestName
```

## Architecture & Code Organization

### Backend (Laravel)

**Controllers** (`app/Http/Controllers/`):
- Resource controllers for CRUD operations
- Custom routes use POST instead of PATCH/PUT for `update()` methods (PurchaseOrderController, InvoiceController) due to file upload handling

**Models** (`app/Models/`):
- Use `$guarded = []` (mass assignment protection disabled - be careful!)
- **Observers**: All major models (Vendor, Project, PurchaseOrder, Invoice, CheckRequisition, File, User, Remark) have observers registered in `AppServiceProvider` for comprehensive audit trails
- **Shared traits**:
  - `LogsActivity` - Structured business-level activity logging with custom messages
  - `HasRemarks` - Polymorphic remarks/comments functionality
- **Important**: Dual logging system in use:
  - **AuditTrail** (via Observers) - Raw database changes, all fields, automatic
  - **ActivityLog** (via LogsActivity trait) - Business events with human-readable messages

**Key Routes** (`routes/web.php`):
- Standard resource routes for vendors, projects, POs, invoices, check-requisitions
- Custom invoice routes: bulk operations, review workflow
- Custom check-requisition routes: review, approve, reject, upload-signed
- **API endpoints for pagination**: `bulkReviewApi()` returns JSON (not Inertia) to avoid asset version conflicts with infinite scroll
- Update methods use POST (not PATCH) for file upload compatibility

**Performance Patterns**:
- **Bulk operations**: Single UPDATE query + bulk INSERT for activity_logs/remarks (not N queries)
- **Query optimization**: Composite indexes, eager loading to prevent N+1 queries
- **Status counts**: Single conditional aggregation query instead of multiple separate queries
- **File deduplication**: InvoiceController implements hash-based deduplication for bulk uploads (md5 of name+size+content)

### Frontend (React + Inertia)

**Structure**:
```
resources/js/
├── pages/           # Inertia pages (route components)
│   ├── auth/
│   ├── dashboard/
│   ├── invoices/
│   ├── purchase-orders/
│   ├── check-requisitions/
│   ├── vendors/
│   └── projects/
├── components/
│   ├── ui/          # shadcn/ui components (Radix UI based)
│   └── custom/      # App-specific reusable components
├── layouts/         # Layout wrappers (app, auth, settings)
├── hooks/           # Custom React hooks
├── lib/             # Utilities (utils.ts with cn() helper)
├── types/           # TypeScript definitions
├── actions/         # Wayfinder generated route actions (type-safe)
├── routes/          # Wayfinder generated route files
└── wayfinder/       # Wayfinder core files
```

**Important Patterns**:

1. **Path Aliases**: Use `@/` for `resources/js/` (configured in tsconfig.json and vite.config.ts)

2. **Wayfinder (Type-Safe Routing)**:
   - Uses `@laravel/vite-plugin-wayfinder` for auto-generated TypeScript route definitions
   - Routes auto-generated in `resources/js/actions/` and `resources/js/routes/`
   - Import route actions with full type safety and IntelliSense
   - Configured in `vite.config.ts` with `formVariants: true`

3. **Dialog Components**:
   - PO forms support both full-page and dialog modes
   - `EditPOForm` accepts `isDialog` prop to conditionally render headers/navigation
   - See `docs/DIALOG_COMPONENTS_SUMMARY.md` for detailed dialog patterns

4. **Lazy Loading**:
   - Heavy dialogs should use React.lazy() + Suspense
   - Use `DialogLoadingFallback` component for consistent loading states
   - See `docs/LAZY_LOADING_IMPLEMENTATION.md` for implementation guide

5. **Infinite Scroll Pattern**:
   - Invoice bulk review uses infinite scroll for performance
   - API endpoints return JSON (not Inertia) to avoid version conflicts
   - Uses IntersectionObserver API with cursor-based pagination
   - See `docs/BULK_INVOICE_REVIEW_OPTIMIZATION.md` for implementation details

6. **Styling**:
   - Tailwind CSS v4 with `@tailwindcss/vite` plugin
   - shadcn/ui components using Radix UI primitives
   - `cn()` utility from `lib/utils.ts` for conditional classes
   - Theme switching via `use-appearance` hook (light/dark mode)

7. **Forms**:
   - Inertia form helpers for CSRF and method spoofing
   - File uploads require POST (not PATCH/PUT) - handled by custom update routes
   - Shared form components in component folders (e.g., CreatePOForm, EditPOForm)

8. **Type Safety**:
   - TypeScript with strict mode enabled
   - Page component types in `types/index.d.ts`
   - Wayfinder for type-safe routing (auto-generated from Laravel routes)

## Key Technical Details

### File Uploads
- Uses `multipart/form-data` forms
- Controllers expect POST for updates when files are involved
- Files stored via polymorphic `fileable` relationship
- **File versioning**: File model includes version tracking via `getNextVersion()` static method
- **Deduplication**: InvoiceController implements hash-based deduplication (md5 of name+size+content) for bulk uploads
- Supported libraries: `spatie/browsershot` for PDF generation, `barryvdh/laravel-dompdf`

### Authentication & Authorization
- Laravel Sanctum for API authentication
- Email verification required for main routes (`verified` middleware)
- Settings routes: profile, password, appearance

### Queue System
- Jobs table configured for background processing
- Queue listener runs as part of dev workflow

### Database
- SQLite for testing (`:memory:`)
- Migrations follow chronological naming with domain entities
- Uses `$guarded = []` pattern (be cautious with mass assignment)

### Testing
- Pest PHP testing framework
- PHPUnit configuration in `phpunit.xml`
- Test suites: Unit and Feature

## Common Gotchas

1. **Update Routes**: POs and Invoices use POST (not PATCH) for updates - check `web.php` routes
2. **Mass Assignment**: Models use `$guarded = []` - always validate input carefully
3. **Dual Activity Tracking**:
   - **AuditTrail** (via Observers) = raw DB changes, all fields, automatic
   - **ActivityLog** (via LogsActivity trait) = business events, human messages
   - Don't confuse the two - they serve different purposes
4. **hasOneThrough Relationships**:
   - Invoice doesn't have direct `vendor_id` or `project_id`
   - Access via: `$invoice->vendor`, `$invoice->project` (through PurchaseOrder)
   - Be careful with eager loading: use `with(['purchaseOrder.vendor'])`
5. **Inertia Page Resolution**: Pages must be in `resources/js/pages/` and use `.tsx` extension
6. **File Extensions**: Mix of `.tsx` (pages/layouts) and `.jsx` (components) - maintain consistency within folders
7. **Dialog Forms**: Check if form component supports `isDialog` prop before embedding in dialogs
8. **Lazy Loading**: Large dialogs should be lazy-loaded to reduce bundle size
9. **API vs Inertia Endpoints**: Some pagination endpoints return JSON (not Inertia) to avoid asset version conflicts - see `bulkReviewApi()`

## Code Style & Tooling

- **PHP**: Laravel Pint for formatting (PSR-12 based)
- **JavaScript/TypeScript**:
  - ESLint with React plugins
  - Prettier with tailwindcss plugin for class sorting
  - Import organization via `prettier-plugin-organize-imports`
- **Commits**: Use conventional commit messages (based on git log pattern)

## Additional Documentation

Comprehensive implementation guides and design documentation available in `docs/`:
- **Architecture**: `BULK_INVOICE_REVIEW_OPTIMIZATION.md` - Performance optimization patterns
- **UI Patterns**: `DIALOG_COMPONENTS_SUMMARY.md`, `LAZY_LOADING_IMPLEMENTATION.md`
- **Design System**: `DESIGN_GUIDELINES_ACCOUNTING_SOFTWARE.md`, `DESIGN_QUICK_REFERENCE.md`
- **Features**: `RANGE_BASED_INVOICE_FEATURE.md`, `ROLE_SYSTEM.md`
- **User Feedback**: `11-18-25-user-feedback-requirements.md`
