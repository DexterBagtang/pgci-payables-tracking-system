# Project Management

**Role Required:** Admin or Purchasing

## Project Types

**SM Project**
- SMPO number (required)
- Total contract cost (required)

**PhilCom Project**
- PhilCom category: Profit & Loss, Capital Expenditure, or Others (required)
- Team name (required)

## Create Project

**Projects → Create Project**

**Required:**
- Project Title (max 255 chars)
- CER Number (must be unique)
- Project Type (SM or PhilCom)
- Type-specific fields above

**Optional:**
- Total Project Cost (budget)
- Description (max 1000 chars)
- Status (default: Active)

**Steps:**
1. Fill required fields
2. Add type-specific fields (SMPO/Contract Cost OR Category/Team)
3. Save

## Update Project

**Projects → Click project → Edit**

Edit any field. When updating, Total Project Cost becomes required (min 0.01).

Changing project type requires filling new type's required fields.

## Project Status

**Active** - Can create POs (default)
**On Hold** - Paused, restricted PO creation
**Completed** - Finished, no POs allowed, **permanent**
**Cancelled** - Terminated, no POs allowed, **permanent**

## Budget Tracking

**Project Details Page shows:**
- Total Budget
- Committed (sum of draft + open POs)
- Remaining (budget - committed)
- Utilization %

System warns/blocks if PO exceeds budget.

## Search & Filter

**Search:** Title, CER Number, SMPO Number
**Filter:** Type (SM/PhilCom), Status
**Sort:** Title, Cost, Date, etc.

## Quick Reference

| Task | Path |
|------|------|
| Create | Projects → Create Project |
| Edit | Projects → Click project → Edit |
| View Details | Projects → Click project |
| Monitor Budget | Project Details → Budget Utilization |

## Common Issues

- **CER already exists** - Must be unique
- **Cannot create PO** - Check status is Active, budget not exceeded
- **SMPO/Category required** - Fill type-specific fields
- **Cannot reopen completed** - Completed/Cancelled are permanent

## Permissions

- View: Any user
- Create/Update: Admin, Purchasing
- Delete: Admin only
