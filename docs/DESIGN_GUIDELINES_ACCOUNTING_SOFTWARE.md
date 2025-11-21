# Design Guidelines: Professional Accounting Software UI

## Overview
This document establishes design principles and standards for creating compact, professional, and efficient user interfaces inspired by enterprise accounting software like QuickBooks, SAP, Oracle Financials, and Microsoft Dynamics.

**Core Philosophy**: Maximum information density with optimal usability. Every pixel should serve a purpose.

---

## 1. Fundamental Principles

### 1.1 Information Density
- **Show more, scroll less**: Prioritize fitting complete workflows on a single screen
- **No wasted space**: Minimize decorative elements and excessive padding
- **Compact by default**: Use small, precise UI elements
- **Data over design**: Function trumps aesthetics

### 1.2 Professional Standards
- **Enterprise-grade**: Look serious and trustworthy
- **Consistency**: Uniform spacing, sizing, and patterns
- **Clarity**: Despite density, information must be scannable
- **Precision**: Exact alignment and measurements

### 1.3 Target Users
- **Accounting professionals**: Daily users of QuickBooks, SAP, Excel
- **High volume**: Process 100-500+ records per session
- **Speed-focused**: Every second matters
- **Detail-oriented**: Need to see all information at once

---

## 2. Typography Standards

### 2.1 Font Sizes

**Primary Text** (Data values, labels):
```css
font-size: 10px; /* Most data fields */
font-size: 11px; /* Important values (amounts, IDs) */
line-height: 1.2; /* Tight leading for density */
```

**Headers**:
```css
font-size: 10px; /* Section labels */
font-size: 12px; /* Card titles */
font-size: 14px; /* Page titles */
text-transform: uppercase; /* For labels */
font-weight: 600-700; /* Semibold to bold */
```

**Micro Text** (Metadata, hints):
```css
font-size: 9px; /* Status indicators, hints */
font-size: 8px; /* Extreme micro text (badges, counts) */
```

### 2.2 Font Families
- **Sans-serif system fonts**: -apple-system, BlinkMacSystemFont, "Segoe UI"
- **Monospace for data**: 'Courier New', Consolas (for IDs, numbers, codes)
- **No decorative fonts**: Ever

### 2.3 Font Weights
- **400 (Regular)**: Standard text
- **600 (Semibold)**: Labels, important text
- **700 (Bold)**: Data values, emphasis
- **Avoid 300 (Light)**: Too thin for small sizes

---

## 3. Spacing System

### 3.1 Padding Scale
Use a compact 4px base scale:

```css
/* Internal component padding */
p-0.5  /* 2px  - Micro elements */
p-1    /* 4px  - Tight containers */
p-1.5  /* 6px  - Standard cards */
p-2    /* 8px  - Comfortable cards */
p-3    /* 12px - Maximum padding (rare) */
```

### 3.2 Gap/Margin Scale
```css
gap-0.5  /* 2px  - Inline elements */
gap-1    /* 4px  - Related items */
gap-1.5  /* 6px  - Grouped sections */
gap-2    /* 8px  - Separated sections */
gap-3    /* 12px - Major divisions (rare) */
```

### 3.3 Spacing Rules
- **Never exceed 12px** padding/margin inside cards
- **Use 1-2px** for tightly related items
- **Negative space is expensive**: Use it wisely
- **Consistent rhythm**: Stick to the scale

---

## 4. Component Sizing

### 4.1 Interactive Elements

**Buttons**:
```css
/* Primary actions */
height: 24px;
padding: 0 8px;
font-size: 11px;

/* Compact actions */
height: 20px;
padding: 0 6px;
font-size: 10px;

/* Micro actions (inline) */
height: 18px;
padding: 0 4px;
font-size: 9px;
```

**Input Fields**:
```css
/* Standard */
height: 24px;
padding: 4px 6px;
font-size: 10px;

/* Compact */
height: 20px;
padding: 2px 4px;
font-size: 9px;
```

**Checkboxes/Radio**:
```css
width: 12px;
height: 12px;
/* Micro: 10px × 10px */
```

### 4.2 Cards & Containers

```css
/* List items */
padding: 6px 8px; /* p-1.5 px-2 */
border: 1px solid;
border-radius: 4px; /* Subtle rounding */

/* Data cards */
padding: 8px; /* p-2 */
border: 1px solid;
border-radius: 4px;

/* Maximum card padding */
padding: 12px; /* p-3 - ONLY for main containers */
```

### 4.3 Icons
```css
/* Standard icons */
width: 12px;
height: 12px;

/* Large icons (headers) */
width: 14px;
height: 14px;

/* Micro icons */
width: 10px;
height: 10px;
```

---

## 5. Layout Patterns

### 5.1 Grid Systems

**Two-Column Master-Detail**:
```jsx
<div className="grid grid-cols-[1fr_2fr] gap-3">
  <div>/* List/Navigation */</div>
  <div>/* Detail/Content */</div>
</div>
```

**Three-Column Dashboard**:
```jsx
<div className="grid grid-cols-3 gap-2">
  <div>/* Info 1 */</div>
  <div>/* Info 2 */</div>
  <div>/* Info 3 */</div>
</div>
```

**Table Layouts for Dense Data**:
```jsx
<table className="w-full text-[10px]">
  <tbody className="divide-y divide-slate-100">
    <tr>
      <td className="px-2 py-1.5 w-24 bg-slate-50 font-semibold">
        Label
      </td>
      <td className="px-2 py-1.5 font-bold">
        Value
      </td>
    </tr>
  </tbody>
</table>
```

### 5.2 Viewport Usage

**Full Screen Utilization**:
- Use `min-h-screen` instead of `h-screen`
- Enable scrolling but design to minimize it
- Sticky headers for navigation context
- Fixed heights only for contained areas

**Screen Real Estate**:
```
┌─────────────────────────────────────────┐
│ Sticky Header (30-40px)                  │
├───────────┬─────────────────────────────┤
│           │                              │
│  List     │  Detail View                 │
│  (33%)    │  (67%)                       │
│           │                              │
│  Dense    │  Compact grid layout         │
│  Cards    │  All info visible            │
│           │                              │
│           │                              │
└───────────┴─────────────────────────────┘
```

### 5.3 Responsive Strategy

**Medium Screens (1024-1440px)**:
- 33% / 67% split for list/detail
- All primary data visible without scrolling
- Compact but not cramped

**Large Screens (1440px+)**:
- Same proportions maintained
- Additional horizontal space for more columns
- Never increase padding/spacing

**Small Screens (<1024px)**:
- Stack layouts vertically
- Maintain compact sizing
- Consider hiding secondary information

---

## 6. Color Palette

### 6.1 Base Colors

**Neutrals** (Primary palette):
```css
slate-50:  #f8fafc  /* Subtle backgrounds */
slate-100: #f1f5f9  /* Hover states */
slate-200: #e2e8f0  /* Borders */
slate-500: #64748b  /* Secondary text */
slate-600: #475569  /* Labels */
slate-700: #334155  /* Primary text */
slate-900: #0f172a  /* Headers, emphasis */
```

**Semantic Colors** (Use sparingly):
```css
/* Success / Money */
emerald-50:  #ecfdf5
emerald-200: #a7f3d0
emerald-700: #047857

/* Warning / Attention */
amber-50:  #fffbeb
amber-200: #fde68a
amber-700: #b45309

/* Info / Primary */
blue-50:  #eff6ff
blue-200: #bfdbfe
blue-600: #2563eb

/* Error / Rejection */
red-50:  #fef2f2
red-200: #fecaca
red-700: #b91c1c
```

### 6.2 Color Usage Rules

**Backgrounds**:
- White for primary containers
- slate-50 for alternating rows/sections
- Colored backgrounds ONLY for semantic meaning

**Borders**:
- slate-200 (default)
- slate-300 (hover)
- Colored borders for status/emphasis only

**Text**:
- slate-900 for data values
- slate-700 for labels
- slate-500 for metadata
- Colored text ONLY for semantic meaning (amounts, status)

**Never Use**:
- Gradients (except subtle slate backgrounds)
- Shadows (except 1px elevation)
- Bright/saturated colors
- Decorative colors

---

## 7. Data Display Patterns

### 7.1 Table Layouts

**Dense Data Table**:
```jsx
<table className="w-full text-[10px] border-collapse">
  <tbody className="divide-y divide-slate-100">
    <tr className="hover:bg-slate-50">
      <td className="px-2 py-1.5 w-20 bg-slate-50 font-semibold text-slate-600">
        Label
      </td>
      <td className="px-2 py-1.5 font-bold text-slate-900">
        Value
      </td>
      <td className="px-2 py-1.5 w-20 bg-slate-50 font-semibold text-slate-600">
        Label 2
      </td>
      <td className="px-2 py-1.5 font-bold text-slate-900">
        Value 2
      </td>
    </tr>
  </tbody>
</table>
```

**Benefits**:
- Maximum density
- Clear visual hierarchy
- Easy scanning
- Familiar to Excel users

### 7.2 Card-Based Lists

**Compact List Item**:
```jsx
<div className="p-1.5 border border-slate-200 rounded hover:bg-slate-50">
  <div className="flex items-center justify-between gap-1">
    <Checkbox className="h-3 w-3" />
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-bold truncate">ID-12345</div>
      <div className="text-[10px] text-slate-600 truncate">Details</div>
    </div>
    <Badge className="text-[9px] h-4">Status</Badge>
  </div>
</div>
```

### 7.3 Form Layouts

**Inline Forms** (Preferred):
```jsx
<div className="grid grid-cols-[80px_1fr] gap-2 text-[10px]">
  <label className="font-semibold text-slate-600 pt-1">
    Field Name
  </label>
  <input className="h-6 px-2 border border-slate-200 rounded" />
</div>
```

**Stacked Forms** (When necessary):
```jsx
<div className="space-y-1.5">
  <label className="text-[9px] font-semibold text-slate-600 uppercase">
    Field Name
  </label>
  <input className="w-full h-6 px-2 text-[10px] border border-slate-200 rounded" />
</div>
```

---

## 8. Interactive Patterns

### 8.1 Hover States

```css
/* Cards/Rows */
hover:bg-slate-50
hover:border-slate-300

/* Buttons */
hover:bg-slate-100 /* Neutral */
hover:bg-blue-100  /* Primary */
hover:bg-emerald-100 /* Success */
```

**Rules**:
- Subtle changes only
- No dramatic animations
- Instant feedback (<100ms)

### 8.2 Active States

```css
/* Selected items */
bg-blue-50
border-blue-300
ring-1 ring-blue-500/20

/* Focused inputs */
ring-2 ring-blue-500
border-blue-500
```

### 8.3 Disabled States

```css
opacity-50
cursor-not-allowed
bg-slate-100
```

### 8.4 Loading States

```jsx
{/* Skeleton loading */}
<div className="animate-pulse bg-slate-100 h-6 rounded" />

{/* Spinner */}
<div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-blue-600 rounded-full" />
```

---

## 9. Performance Considerations

### 9.1 Virtual Scrolling

**When to use**: Lists with 500+ items

```jsx
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={items.length}
  itemSize={60} // Compact item height
  width="100%"
>
  {Row}
</List>
```

### 9.2 Pagination

**Preferred per-page options**:
- 50 (small)
- 100 (default)
- 200 (power users)
- 500 (maximum)

### 9.3 Lazy Loading

```jsx
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<CompactSpinner />}>
  <HeavyComponent />
</Suspense>
```

---

## 10. Accessibility (Dense UIs)

### 10.1 Touch Targets

**Minimum sizes**:
- Desktop: 16px × 16px (buttons can be smaller due to mouse precision)
- Touch: 24px × 24px (even in dense layouts)

**Solution**: Visual size can be smaller, but clickable area must be adequate
```css
/* Button looks 18px but clickable area is 24px */
.btn {
  height: 18px;
  padding: 0 4px;
  /* Add invisible padding for touch */
  position: relative;
}
.btn::before {
  content: '';
  position: absolute;
  inset: -3px;
}
```

### 10.2 Contrast Ratios

**Small text (10-11px) requires higher contrast**:
- Minimum: 4.5:1
- Preferred: 7:1 or higher
- Use slate-700 or darker for primary text

### 10.3 Keyboard Navigation

**Essential for dense interfaces**:
```jsx
// Tab order must be logical
tabIndex={0}

// Visible focus indicators
focus-visible:ring-2
focus-visible:ring-blue-500
focus-visible:outline-none
```

### 10.4 Screen Readers

```jsx
// Labels for compact controls
<button aria-label="Approve invoice #12345">
  <CheckCircle className="h-3 w-3" />
  <span className="sr-only">Approve</span>
</button>
```

---

## 11. Component Library Standards

### 11.1 Button Variants

**Primary Actions**:
```jsx
<Button className="h-6 px-2 text-[10px] bg-blue-600 hover:bg-blue-700 text-white">
  Action
</Button>
```

**Secondary Actions**:
```jsx
<Button className="h-6 px-2 text-[10px] border border-slate-300 hover:bg-slate-100">
  Action
</Button>
```

**Destructive Actions**:
```jsx
<Button className="h-6 px-2 text-[10px] bg-red-600 hover:bg-red-700 text-white">
  Delete
</Button>
```

**Ghost Actions** (Inline):
```jsx
<Button className="h-5 px-1 text-[10px] hover:bg-slate-100">
  <Icon className="h-2.5 w-2.5 mr-0.5" />
  Action
</Button>
```

### 11.2 Badge/Status Indicators

```jsx
{/* Micro badge */}
<Badge className="text-[9px] h-4 px-1">
  Status
</Badge>

{/* Dot indicator */}
<span className="inline-block w-2 h-2 rounded-full bg-green-500" />
```

### 11.3 Input Fields

**Text Input**:
```jsx
<input
  className="h-6 px-2 text-[10px] border border-slate-200 rounded focus:ring-2 focus:ring-blue-500"
  placeholder="Enter value"
/>
```

**Select/Dropdown**:
```jsx
<select className="h-6 px-2 text-[10px] border border-slate-200 rounded bg-white">
  <option>Option 1</option>
</select>
```

**Textarea** (Compact):
```jsx
<textarea
  className="min-h-[60px] px-2 py-1.5 text-[10px] border border-slate-200 rounded resize-none"
  rows={3}
/>
```

---

## 12. Common Mistakes to Avoid

### ❌ Don't Do This

**Too much padding**:
```css
padding: 24px; /* WAY too much */
gap: 16px;     /* Too spacious */
```

**Oversized elements**:
```css
height: 44px;   /* Mobile-first thinking */
font-size: 16px; /* Too large for dense UI */
```

**Decorative elements**:
```jsx
<div className="shadow-2xl rounded-3xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
  {/* This is not accounting software */}
</div>
```

**Wasted vertical space**:
```jsx
<div className="mb-8">
  <h2 className="text-2xl mb-4">Title</h2>
  <p className="mb-6">Description</p>
  {/* Every pixel matters */}
</div>
```

### ✅ Do This Instead

**Compact padding**:
```css
padding: 6px;  /* p-1.5 */
gap: 4px;      /* gap-1 */
```

**Appropriate sizing**:
```css
height: 24px;   /* Comfortable for desktop */
font-size: 10px; /* Dense but readable */
```

**Professional styling**:
```jsx
<div className="border border-slate-200 rounded bg-white">
  {/* Clean and professional */}
</div>
```

**Efficient spacing**:
```jsx
<div className="space-y-1.5">
  <h2 className="text-xs font-semibold uppercase text-slate-600">Title</h2>
  <div className="text-[10px]">Content</div>
</div>
```

---

## 13. Real-World Examples

### Example 1: Invoice List Item

```jsx
<div className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
  <div className="flex items-start gap-1.5">
    <Checkbox className="h-3 w-3 mt-0.5" />
    <div className="flex-1 min-w-0 space-y-1">
      {/* Header */}
      <div className="flex items-start justify-between gap-1">
        <span className="font-mono text-[11px] font-bold text-slate-900 truncate">
          INV-2024-001
        </span>
        <Badge className="text-[9px] h-4 px-1 bg-emerald-50 text-emerald-700">
          Approved
        </Badge>
      </div>

      {/* Vendor */}
      <div className="flex items-center gap-1 text-[10px] text-slate-600">
        <Building2 className="h-2.5 w-2.5 text-slate-400" />
        <span className="truncate">Acme Corporation</span>
      </div>

      {/* Amount & Date */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-bold text-emerald-700">
          ₱125,450.00
        </span>
        <span className="text-[10px] text-slate-500">
          Jan 15
        </span>
      </div>
    </div>
  </div>
</div>
```

### Example 2: Data Table

```jsx
<div className="border border-slate-200 rounded bg-white">
  <table className="w-full text-[10px]">
    <tbody className="divide-y divide-slate-100">
      <tr>
        <td className="px-2 py-1.5 w-20 bg-slate-50 font-semibold text-slate-600">
          Invoice #
        </td>
        <td className="px-2 py-1.5 font-mono font-bold text-slate-900">
          INV-2024-001
        </td>
        <td className="px-2 py-1.5 w-20 bg-slate-50 font-semibold text-slate-600">
          Date
        </td>
        <td className="px-2 py-1.5 font-bold text-slate-900">
          2024-01-15
        </td>
      </tr>
      <tr>
        <td className="px-2 py-1.5 bg-slate-50 font-semibold text-slate-600">
          Vendor
        </td>
        <td className="px-2 py-1.5 font-bold text-slate-900">
          Acme Corporation
        </td>
        <td className="px-2 py-1.5 bg-slate-50 font-semibold text-slate-600">
          Amount
        </td>
        <td className="px-2 py-1.5 font-bold text-emerald-700">
          ₱125,450.00
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Example 3: Compact Form

```jsx
<div className="space-y-1.5">
  <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
    <label className="text-[10px] font-semibold text-slate-600">
      Vendor
    </label>
    <select className="h-6 px-2 text-[10px] border border-slate-200 rounded">
      <option>Acme Corporation</option>
    </select>
  </div>

  <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
    <label className="text-[10px] font-semibold text-slate-600">
      Amount
    </label>
    <input
      type="number"
      className="h-6 px-2 text-[10px] border border-slate-200 rounded"
      placeholder="0.00"
    />
  </div>
</div>
```

---

## 14. Quality Checklist

Before committing any UI work, verify:

### Visual Density
- [ ] No padding exceeds 12px
- [ ] All gaps are 2-8px
- [ ] Font sizes are 9-12px for data
- [ ] Icons are 10-14px
- [ ] Buttons are 20-24px height

### Information Architecture
- [ ] Primary workflow visible without scrolling
- [ ] No unnecessary decorative elements
- [ ] Clear visual hierarchy despite compact size
- [ ] Related information grouped logically

### Professional Appearance
- [ ] Neutral color palette (slate-based)
- [ ] Minimal shadows and gradients
- [ ] Clean borders and lines
- [ ] Consistent spacing rhythm

### Usability
- [ ] All interactive elements are clickable (min 16px)
- [ ] Text is legible at 10-11px
- [ ] Sufficient contrast (4.5:1 minimum)
- [ ] Keyboard navigation works
- [ ] Hover states are clear

### Performance
- [ ] Lists with 100+ items are optimized
- [ ] Heavy components are lazy loaded
- [ ] No layout shifts or jank
- [ ] Fast response to interactions

---

## 15. Inspiration Sources

### Software to Study
1. **QuickBooks Desktop**: Master of compact forms and tables
2. **SAP GUI**: Dense information displays
3. **Oracle E-Business Suite**: Professional enterprise layouts
4. **Microsoft Dynamics**: Balanced density and usability
5. **Sage 50**: Efficient use of screen space
6. **Bloomberg Terminal**: Ultimate information density
7. **Excel**: Grid-based perfection
8. **TurboTax**: Clear multi-step flows in compact space

### What to Learn From Each

**QuickBooks**:
- Compact forms with inline labels
- Efficient use of tabs
- Dense transaction lists

**SAP**:
- Maximum data on screen
- Table-based layouts
- Keyboard shortcuts everywhere

**Bloomberg**:
- Color-coded status
- Abbreviations and codes
- Real-time data updates

**Excel**:
- Grid-based layout
- Precise alignment
- Keyboard navigation

---

## 16. Future Considerations

### Progressive Disclosure
When data truly cannot fit:
1. Use collapsible sections (but show by default)
2. Implement horizontal tabs (not wizards)
3. Add "Show more" links (but minimize need)
4. Consider side panels for details

### Customization
Power users should be able to:
- Adjust column widths
- Hide/show columns
- Save view preferences
- Customize shortcuts

### Scalability
As features grow:
- Maintain compact sizing
- Don't add padding "for breathing room"
- Keep information architecture flat
- Use progressive enhancement, not feature creep

---

## 17. Migration Strategy

### Converting Existing UIs

**Step 1: Audit Current Spacing**
```bash
# Find all padding/margin classes
grep -r "p-\|m-\|gap-" components/
```

**Step 2: Apply Compact Scale**
- Replace `p-4` → `p-1.5` or `p-2`
- Replace `gap-4` → `gap-1` or `gap-1.5`
- Replace `mb-6` → `mb-2`

**Step 3: Update Typography**
- Change `text-base` → `text-[10px]` or `text-[11px]`
- Change `text-xl` → `text-xs` or `text-sm`

**Step 4: Resize Interactive Elements**
- Buttons: `h-9` → `h-6`
- Inputs: `h-10` → `h-6`
- Icons: `h-5 w-5` → `h-3 w-3`

**Step 5: Simplify Layouts**
- Remove decorative wrappers
- Flatten component hierarchy
- Convert cards to tables where appropriate

---

## 18. Maintenance

### Regular Reviews
- Monthly audit of new components
- Quarterly review of spacing consistency
- Annual review of entire design system

### Team Guidelines
- All PRs must follow these standards
- Design reviews required for new patterns
- Screenshots required for UI changes

### Documentation
- Update this document when patterns change
- Add examples for new components
- Document exceptions and reasons

---

## Conclusion

**Remember**: In professional accounting software, every pixel is valuable. Users don't want beautiful designs—they want efficient tools that help them process information quickly and accurately.

**Golden Rule**: If you think "this looks cramped," you're probably on the right track. If you think "this needs more breathing room," you're probably wrong.

**Test**: Can an experienced accountant process their daily work without scrolling? That's the standard.

---

**Document Version**: 1.0
**Last Updated**: 2025-01-21
**Maintained By**: Development Team
**Based On**: Phase 1 Invoice Review Redesign
