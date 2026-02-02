# CLAUDE.md

**Payables Management System**: Laravel 12 + React 19 + Inertia.js

## References

- **Database Schema**: `docs/db.mmd` (complete ERD)
- **Business Flow**: `docs/flowchart.mmd` (workflow diagram)
- **Documentation**: `docs/` (implementation guides)

## Structure

### /app (Backend Logic)
- **Models**: `$guarded = []`, polymorphic relations (`fileable`, `loggable`, `remarkable`)
- **Controllers**: POST for updates with files (not PATCH), bulk operations optimized
- **Observers**: Registered in `AppServiceProvider` for audit trails
- **Traits**: `LogsActivity`, `HasRemarks`

### /resources/js (Frontend)
- **pages/**: Inertia route components (.tsx)
- **components/**: ui/ (shadcn), custom/ (app-specific)
- **actions/**: Wayfinder type-safe routes (auto-generated)
- **Path alias**: `@/` = `resources/js/`

### /config
- **Dev**: `composer dev` (Laravel:8020 + Queue + Vite)
- **Build**: `npm run build`, `composer test`
- **Stack**: Tailwind v4, TypeScript strict, Pest tests, SQLite test DB

## Critical Gotchas

1. **Invoice**: NO `vendor_id`/`project_id` - use `hasOneThrough` via PurchaseOrder
2. **Updates**: POST (not PATCH) for file uploads
3. **Dual Logging**: AuditTrail (DB changes) vs ActivityLog (business events)
4. **CheckRequisition**: Two user relations - `generator` and `processor`
5. **API vs Inertia**: Some endpoints return JSON to avoid version conflicts

## Commands

```bash
composer dev              # Start dev server
composer test             # Run tests
npm run types            # TypeScript check
npm run lint             # ESLint fix
```

No need to add a comprehensive documentation during development.
