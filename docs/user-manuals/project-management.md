# Project Management

## Project Types

The system supports two project types:

**SM Project:**
- SMPO Number * (required)
- Total Contract Cost * (required)

**PhilCom Project:**
- PhilCom Category * (Profit & Loss, Capital Expenditure, or Others)
- Team Name * (required)

## Create Project

**Projects → Create Project**

**Required:**
- Project Title * (max 255 characters)
- CER Number * (must be unique)
- Project Type * (SM or PhilCom)
- Type-specific fields * (see above)

**Optional:**
- Total Project Cost (budget amount)
- Description (max 1000 characters)
- Status (defaults to Active)

**Steps:**
1. Click **Create Project**
2. Enter Project Title and unique CER Number
3. Select Project Type (SM or PhilCom)
4. Fill type-specific fields:
   - **SM**: SMPO Number and Total Contract Cost
   - **PhilCom**: Category and Team Name
5. Add Total Project Cost for budget tracking (optional)
6. Add description if needed
7. Save

> 💡 Always add Total Project Cost for proper budget tracking and PO validation.

## Update Project

**Projects → Click project → Edit**

Edit any field except CER Number (immutable).

⚠️ When updating an existing project, Total Project Cost becomes required (minimum ₱0.01).

Changing project type requires filling the new type's required fields.

## Project Status Flow

**Active** → **On Hold** → **Completed/Cancelled**

- **Active** - Can create and manage POs. Default status for new projects.
- **On Hold** - Paused temporarily. Restricted PO creation. Can be reactivated.
- **Completed** - Finished successfully. No POs allowed. **Permanent**.
- **Cancelled** - Terminated. No POs allowed. **Permanent**.

⚠️ **Completed** and **Cancelled** statuses are permanent and cannot be reversed.

## Budget Tracking

**Project Details Page shows:**
- Total Budget (Total Project Cost)
- Committed (sum of Draft + Open POs)
- Remaining (budget - committed)
- Utilization % (committed / budget × 100)

**Budget Validation:**
- System warns if new PO exceeds remaining budget
- System blocks PO creation if it exceeds available budget
- Draft POs are included in committed amount

> 💡 Monitor budget utilization regularly to prevent over-commitment.

## View Project Details

**Projects → Click project**

**Shows:**
- Project info: Title, CER Number, Type, Status, Description
- Budget summary: Total Budget, Committed, Remaining, Utilization %
- Type-specific fields (SMPO/Contract Cost or Category/Team)
- Related Purchase Orders
- Activity log

## Examples

### Example 1: Create SM Project

A Purchasing staff member creates a new SM project.

1. Navigate to **Projects → Create Project**
2. Project Title: *Building Renovation*
3. CER Number: *CER-2026-001*
4. Project Type: *SM Project*
5. SMPO Number: *SMPO-2026-042*
6. Total Contract Cost: *₱5,000,000.00*
7. Total Project Cost: *₱5,000,000.00*
8. Description: *Main office building renovation project*
9. Save
10. Project created with **Active** status

### Example 2: Create PhilCom Project

Creating a PhilCom project for capital expenditure.

1. Navigate to **Projects → Create Project**
2. Project Title: *IT Infrastructure Upgrade*
3. CER Number: *CER-2026-002*
4. Project Type: *PhilCom Project*
5. PhilCom Category: *Capital Expenditure*
6. Team Name: *IT Department*
7. Total Project Cost: *₱2,000,000.00*
8. Save

### Example 3: Update Project Status

Completing a finished project.

1. Navigate to **Projects** → Click project
2. Click **Edit**
3. Change Status to **Completed**
4. Save
5. Project is now **Completed** and cannot accept new POs

## Search & Filter

**Search:** Title, CER Number, SMPO Number
**Filter:** Type (SM/PhilCom), Status (Active/On Hold/Completed/Cancelled)
**Sort:** Title, Total Cost, Created Date, CER Number

## Quick Reference

| Task | Path |
|------|------|
| Create | Projects → Create Project |
| Edit | Projects → Click project → Edit |
| View Details | Projects → Click project |
| Monitor Budget | Project Details → Budget Utilization |
| Change Status | Edit → Change Status → Save |

## Common Issues

- **CER already exists** - CER Numbers must be unique across all projects
- **Cannot create PO** - Check project status is Active and budget is not exceeded
- **SMPO/Category required** - Fill type-specific required fields based on project type
- **Cannot reopen completed project** - Completed and Cancelled statuses are permanent
- **Budget exceeded warning** - Reduce PO amount or increase project budget

## Permissions

- View: Any user
- Create/Update: **Admin**, **Purchasing**
- Delete: **Admin** only
