# Design Quick Reference - Accounting Software UI

**Quick copy-paste reference for common patterns.**

---

## Spacing

```css
/* Padding */
p-1.5   /* 6px - Standard card */
p-2     /* 8px - Comfortable card */

/* Gap */
gap-1    /* 4px - Related items */
gap-1.5  /* 6px - Grouped sections */
gap-2    /* 8px - Separated sections */
```

---

## Typography

```css
/* Font Sizes */
text-[9px]   /* Micro text */
text-[10px]  /* Standard data */
text-[11px]  /* Important values */
text-xs      /* Section labels */
text-sm      /* Page titles */

/* Weights */
font-semibold  /* Labels */
font-bold      /* Data values */
```

---

## Component Sizes

```css
/* Buttons */
h-6 px-2 text-[10px]  /* Standard button */
h-5 px-1 text-[10px]  /* Compact button */

/* Inputs */
h-6 px-2 text-[10px]  /* Standard input */

/* Icons */
h-3 w-3   /* Standard */
h-2.5 w-2.5  /* Compact */

/* Checkboxes */
h-3 w-3   /* Standard */
```

---

## Layout Templates

### Master-Detail (1/3 - 2/3)
```jsx
<div className="grid grid-cols-[1fr_2fr] gap-3">
  <div>{/* List */}</div>
  <div>{/* Detail */}</div>
</div>
```

### Compact Card
```jsx
<div className="p-1.5 border border-slate-200 rounded bg-white">
  <div className="space-y-1">
    {/* Content */}
  </div>
</div>
```

### Data Table
```jsx
<table className="w-full text-[10px]">
  <tbody className="divide-y divide-slate-100">
    <tr>
      <td className="px-2 py-1.5 w-20 bg-slate-50 font-semibold">Label</td>
      <td className="px-2 py-1.5 font-bold">Value</td>
    </tr>
  </tbody>
</table>
```

---

## Common Components

### Compact Button
```jsx
<Button className="h-6 px-2 text-[10px]">
  Action
</Button>
```

### Micro Badge
```jsx
<Badge className="text-[9px] h-4 px-1">
  Status
</Badge>
```

### List Item
```jsx
<div className="p-1.5 border border-slate-200 rounded hover:bg-slate-50">
  <div className="flex items-start gap-1.5">
    <Checkbox className="h-3 w-3" />
    <div className="flex-1 space-y-1">
      <div className="text-[11px] font-bold">ID-123</div>
      <div className="text-[10px] text-slate-600">Details</div>
    </div>
  </div>
</div>
```

### Input Field
```jsx
<input
  className="h-6 px-2 text-[10px] border border-slate-200 rounded"
  placeholder="Enter value"
/>
```

---

## Colors

```css
/* Backgrounds */
bg-white        /* Primary */
bg-slate-50     /* Subtle */

/* Borders */
border-slate-200  /* Default */
border-slate-300  /* Hover */

/* Text */
text-slate-900  /* Primary */
text-slate-600  /* Labels */
text-slate-500  /* Secondary */

/* Semantic */
text-emerald-700  /* Money/Success */
text-amber-700    /* Warning */
text-blue-700     /* Info */
text-red-700      /* Error */
```

---

## Rules of Thumb

1. **Padding**: Never exceed `p-3` (12px)
2. **Font Size**: 10-11px for data
3. **Button Height**: 20-24px
4. **Icon Size**: 10-14px
5. **Gap**: 4-8px maximum
6. **No shadows**: Except 1px elevation
7. **No gradients**: Except subtle backgrounds
8. **Table over cards**: For dense data

---

## Before You Commit

- [ ] All padding ≤ 12px
- [ ] Font sizes 9-12px
- [ ] Icons ≤ 14px
- [ ] Buttons 20-24px height
- [ ] Primary data visible without scrolling

---

**See full documentation**: `DESIGN_GUIDELINES_ACCOUNTING_SOFTWARE.md`
