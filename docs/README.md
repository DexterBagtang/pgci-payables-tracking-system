# PGCI Payables Documentation

**Last Updated**: January 24, 2026

---

## Core Documentation

### System Overview
- **[flowchart.mmd](flowchart.mmd)** - Complete system process flow (includes direct invoices)
- **[flowchart-simplified.mmd](flowchart-simplified.mmd)** - Simplified process flow
- **[db.mmd](db.mmd)** - Database schema diagram (updated with direct invoices)

### Feature Documentation
- **[direct-invoices.md](direct-invoices.md)** - ✅ Direct Invoice feature (complete implementation guide)
- **[dashboard-widgets.md](dashboard-widgets.md)** - Dashboard widgets implementation
- **[react-query-implementation.md](react-query-implementation.md)** - React Query setup

### Access Control
- **[user-roles.md](user-roles.md)** - User roles and permissions matrix
- **[permissions-implementation-plan.md](permissions-implementation-plan.md)** - Permissions system implementation
- **[PERMISSIONS_FRONTEND_GUIDE.md](PERMISSIONS_FRONTEND_GUIDE.md)** - Frontend permissions guide

### Meeting Notes & Requirements
- **[09-19-25-meeting todos.md](09-19-25-meeting todos.md)** - Meeting action items
- **[11-18-25-user-feedback-requirements.md](11-18-25-user-feedback-requirements.md)** - User feedback
- **[11-25-2025.md](11-25-2025.md)** - Meeting notes

---

## Quick Links

### For Users
- **Direct Invoices**: See [direct-invoices.md](direct-invoices.md) - How to create invoices without POs
- **User Roles**: See [user-roles.md](user-roles.md) - Who can do what

### For Developers
- **Database**: See [db.mmd](db.mmd) - Database structure with direct invoice schema
- **Permissions**: See [permissions-implementation-plan.md](permissions-implementation-plan.md) - How permissions work
- **React Query**: See [react-query-implementation.md](react-query-implementation.md) - Data fetching patterns

### For System Admins
- **Process Flow**: See [flowchart.mmd](flowchart.mmd) - Complete system workflow
- **Access Control**: See [user-roles.md](user-roles.md) + [permissions-implementation-plan.md](permissions-implementation-plan.md)

---

## Recent Updates (January 2026)

### ✅ Direct Invoice Feature - PRODUCTION READY
- Complete implementation with PO and direct invoice support
- Updated flowcharts to show dual paths
- Updated database schema with direct invoice fields
- Full documentation in [direct-invoices.md](direct-invoices.md)
- All tests passing

**Key Features**:
- Create invoices without Purchase Orders
- Vendor-based invoicing
- Same approval workflow as PO invoices
- Mixed invoice types in check requisitions
- Bulk creation support

**Database Changes**:
- Added `invoice_type` enum column (purchase_order, direct)
- Added `vendor_id` FK for direct invoices
- Added `project_id` FK for direct invoices (optional)
- Added indexes for performance
- Users table updated with `permissions` JSON column

**See**: [direct-invoices.md](direct-invoices.md) for complete details

---

## Documentation Status

| File | Status | Last Updated | Notes |
|------|--------|--------------|-------|
| direct-invoices.md | ✅ Current | 2026-01-24 | Complete implementation guide |
| flowchart.mmd | ✅ Current | 2026-01-24 | Includes direct invoice path |
| flowchart-simplified.mmd | ✅ Current | 2026-01-24 | Includes direct invoice path |
| db.mmd | ✅ Current | 2026-01-24 | Updated with direct invoice schema |
| user-roles.md | ✅ Current | - | No changes needed |
| permissions-implementation-plan.md | ✅ Current | - | No changes needed |

---

## Archive

Old implementation summaries have been consolidated into the main feature documentation. See [direct-invoices.md](direct-invoices.md) for the complete, up-to-date guide.

Archived files (historical reference only):
- `direct-invoices-implementation-summary.md` - Backend implementation details (now in main doc)
- `direct-invoices-ui-update-summary.md` - UI changes summary (now in main doc)
