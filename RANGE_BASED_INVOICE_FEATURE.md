# Range-Based Invoice Number Input Feature

## Overview
Added a new range-based input mode for bulk invoice creation that allows users to enter a range of invoice numbers (e.g., 1234 - 1256) and automatically calculates the number of invoices to generate. The range values become the actual SI numbers directly.

## Key Differences Between Modes

### Range Mode
- **Purpose**: When you already know the exact invoice numbers to create
- **SI Numbers**: Range values ARE the complete invoice numbers (no prefix, no padding)
- **Example Input**: Range Start: 1234, Range End: 1256
- **Generated SI Numbers**: 1234, 1235, 1236, ..., 1256 (23 invoices)
- **Auto-increment**: Always enabled (automatic, built-in)
- **Prefix Field**: Hidden (not needed)

### Manual Mode
- **Purpose**: When you want to generate invoices with a custom numbering pattern
- **SI Numbers**: Prefix + auto-incremented numbers with padding
- **Example Input**:
  - Count: 10 invoices
  - Prefix: INV2025-000
  - Auto-increment: Enabled
  - Starting number: 1
- **Generated SI Numbers**: INV2025-001, INV2025-002, ..., INV2025-010
- **Auto-increment**: Optional (user can toggle)
- **Prefix Field**: Required for numbering pattern

## Changes Made

### 1. State Updates (CreateInvoice.jsx)
Added new properties to `bulkConfig` state:
- `inputMode`: Toggles between 'manual' and 'range' modes
- `rangeStart`: Starting invoice number for range mode
- `rangeEnd`: Ending invoice number for range mode

### 2. Invoice Generation Logic (CreateInvoice.jsx)
Updated `createEmptyInvoice()` function with mode-specific logic:

**Range Mode:**
- Uses range values directly as SI numbers
- No prefix applied
- No padding applied
- Formula: `siNumber = String(rangeStart + index)`

**Manual Mode:**
- Uses prefix with optional auto-increment
- Supports padding based on trailing zeros in prefix
- Formula: `siNumber = prefix + String(startingNumber + index).padStart(padding)`

### 3. UI Enhancements (BulkConfiguration.jsx)

#### Input Mode Toggle
- Added Tabs component to switch between "Manual Count" and "Range" modes
- Clear visual distinction between the two workflows

#### Range Mode UI
- **Range Start Input**: Enter first invoice number (e.g., 1234)
- **Range End Input**: Enter last invoice number (e.g., 1256)
- **Auto-count Badge**: Shows calculated invoice count (e.g., "23 invoices")
- **Preview Box**: Shows sample SI numbers (e.g., "1234, 1235, 1236, ...+20")
- **No Prefix Field**: Hidden since range values are complete SI numbers

#### Manual Mode UI
- **Number of Invoices Input**: Enter count manually
- **Prefix Input**: Enter invoice number pattern with optional padding
- **Auto-increment Checkbox**: Toggle auto-increment on/off
- **Starting Number Input**: Set starting number for sequence
- **Preview Box**: Shows formatted SI numbers with prefix

#### Auto-Calculation
- Added `useEffect` hook that automatically calculates:
  - Invoice count = (rangeEnd - rangeStart + 1)
  - Automatically enables auto-increment in range mode
  - Updates in real-time as user types

#### Validation
- Updated `isReadyToGenerate` logic to check mode-specific requirements:
  - Range Mode: Requires valid rangeStart, rangeEnd, and calculated count > 0
  - Manual Mode: Requires count > 0

## Usage Examples

### Range Mode Example:
**Scenario**: Generate invoices 1234 through 1256

1. Select "Range" tab
2. Enter Range Start: **1234**
3. Enter Range End: **1256**
4. Badge displays: **23 invoices** ✓
5. Preview shows: **1234, 1235, 1236, ...+20**
6. Click "Generate 23"
7. **Result**: 23 invoices created with SI numbers: 1234, 1235, 1236, ..., 1256

### Manual Mode Example:
**Scenario**: Generate 10 invoices with custom prefix

1. Select "Manual Count" tab
2. Enter Number of Invoices: **10**
3. Enter Prefix: **INV2025-000**
4. Check "Auto-increment" ✓
5. Enter starting number: **1**
6. Preview shows: **INV2025-001, INV2025-002, INV2025-003, ...+7**
7. Click "Generate 10"
8. **Result**: 10 invoices created with SI numbers: INV2025-001 through INV2025-010

## Files Modified
1. `resources/js/pages/invoices/components/CreateInvoice.jsx`
   - Added inputMode, rangeStart, rangeEnd to state
   - Updated createEmptyInvoice with mode-specific logic
   - Range mode: Direct number conversion
   - Manual mode: Prefix + auto-increment

2. `resources/js/pages/invoices/components/create/BulkConfiguration.jsx`
   - Added Tabs, Hash icon imports
   - Added useEffect for auto-calculation
   - Conditional rendering: Prefix field only in manual mode
   - Separate preview logic for each mode
   - Enhanced validation for mode-specific requirements

## Benefits
- **Faster data entry**: Enter range instead of counting manually (e.g., 2210-2299 vs counting 90)
- **Fewer errors**: Automatic calculation eliminates counting mistakes
- **Direct SI numbers**: Range mode uses actual invoice numbers without prefixes
- **Flexible workflows**: Supports both known ranges and custom patterns
- **Better UX**: Clear visual feedback with badges and previews
- **Real-time validation**: Shows calculated count as user types
