# CLAUDE.md - Commission Tracker Codebase Guide

This document provides comprehensive guidance for AI assistants working with the Rejig Commission Tracker codebase.

## Project Overview

**Purpose:** A single-page web application to track sales commissions based on recurring revenue deals with various billing cycles.

**Tech Stack:**
- Pure HTML5 with inline React (via CDN)
- React 18 (production build from unpkg)
- Babel standalone for JSX transformation
- localStorage for data persistence
- No build process or dependencies required

**Deployment:** GitHub Pages (single index.html file)

## Business Logic

### Commission Structure

The commission structure is critical to understanding all calculations in this application:

- **Base Salary:** $80,000/year ($6,666.67/month)
- **Monthly Threshold:** $6,666.67
- **Commission Rate:** 20% of revenue **only** on revenue exceeding the monthly threshold
- **Formula:** `commission = (monthly_revenue - 6666.67) * 0.20` if revenue > threshold, else 0

**Important:** This is a high-threshold commission structure that is difficult to achieve with small deals. Most months will have zero commission unless revenue significantly exceeds the threshold.

### Revenue Counting Rules

Revenue counting varies by billing cycle and is essential to accurate calculations:

#### Billing Cycles

1. **Monthly:**
   - Month 1: Setup fee + first month subscription
   - Every month after: Just monthly subscription until churn

2. **6-Month:**
   - Month 1: Setup fee + full 6 months upfront
   - Month 7: Full 6 months (renewal)
   - Continues every 6 months until churn

3. **Yearly:**
   - Month 1: Setup fee + full year upfront
   - Month 13: Full year (renewal)
   - Continues every 12 months until churn

4. **2-Year:**
   - Month 1: Setup fee + full 2 years upfront
   - Month 25: Full 2 years (renewal)
   - Continues every 24 months until churn

#### Critical Rules

- **Setup fees count ONLY in the month the deal closes**
- **Renewals include ONLY the subscription amount** (no setup fee)
- **Churn stops all future revenue** from the churn date forward
- **All deals are pre-paid** at the start of each billing cycle

### Expected Monthly Revenue (July-November 2025)

Based on the 38 pre-loaded deals:

- **July 2025:** $6,150 (0 commission - under threshold)
- **August 2025:** $6,450 (0 commission - under threshold)
- **September 2025:** $4,800 (0 commission - under threshold)
- **October 2025:** $10,680 (~$802 commission - **first month over threshold**)
- **November 2025:** $12,800 (~$1,226 commission - includes Lisa Forss $6,480 deal)

## Code Architecture

### File Structure

```
/
├── index.html          # Single-page React application (all code in one file)
└── CLAUDE.md          # This file
```

### Key Constants (index.html:65-66)

```javascript
const MONTHLY_THRESHOLD = 6666.67;  // Commission threshold
const COMMISSION_RATE = 0.20;        // 20% commission rate
```

### Data Structure

#### Deal Object

```javascript
{
  id: Number,              // Unique identifier
  name: String,            // Customer name
  close: String,           // ISO date string (YYYY-MM-DD)
  subscription: Number,    // Recurring amount per billing cycle
  setup: Number,           // One-time setup fee
  cycle: String,           // "monthly" | "six-month" | "yearly" | "two-year"
  churnDate: String|null   // ISO date string or null if active
}
```

### Core React Components

#### CommissionTracker (index.html:109-436)

Main component with the following state:

```javascript
deals              // Array of deal objects
expandedYears      // Object tracking which year accordions are open
expandedMonths     // Object tracking which month details are expanded
showDeals          // Boolean for showing/hiding deal list
newDeal            // Object for add-deal form state
```

#### Key Computed Values (useMemo hooks)

1. **monthlyBreakdown** (index.html:160-207)
   - Calculates revenue and commission for each month
   - Handles billing cycle renewals
   - Respects churn dates
   - Groups deals by month

2. **yearlyBreakdown** (index.html:209-221)
   - Aggregates monthly data by year
   - Used for year accordion display

### Critical Functions

#### Revenue Calculation Logic (index.html:164-196)

```javascript
// For each deal:
// 1. Start at close date
// 2. Add revenue every N months based on billing cycle
// 3. First payment includes setup fee
// 4. Subsequent payments are subscription only
// 5. Stop at churn date or end date (2027-12-31)
```

**Important Notes:**
- The calculation projects revenue through 2027-12-31
- Handles all 4 billing cycles correctly
- First payment logic: `setup + subscription`
- Renewal logic: `subscription` only

#### Commission Calculation (index.html:199-204)

```javascript
breakdown[month].commission = revenue > MONTHLY_THRESHOLD ?
    (revenue - MONTHLY_THRESHOLD) * COMMISSION_RATE : 0;
```

### Data Persistence

- **Storage:** Browser localStorage
- **Key:** 'commissionDeals'
- **Format:** JSON stringified array of deals
- **Initial Load:** Falls back to initialDeals array if no saved data
- **Auto-save:** useEffect hook saves on every deals state change

**Warning:** Each browser/device has separate localStorage. No cloud sync.

## Color Scheme

The application uses a specific color palette defined by hex values:

- **Primary Purple:** `#6537ca` - Main brand color, accents
- **Accent Red/Coral:** `#f15d55` - Warnings, churned items, under threshold
- **Success Green/Teal:** `#05c68e` - Over threshold, active status, positive metrics
- **Gold/Yellow:** `#daba21` - Highlights, secondary accents

### Color Usage Guidelines

- **Over threshold:** Use success green/teal (#05c68e)
- **Under threshold:** Use accent red/coral (#f15d55)
- **Positive metrics:** Use success green/teal (#05c68e)
- **Warnings/negative:** Use accent red/coral (#f15d55)
- **Primary UI elements:** Use primary purple (#6537ca)
- **Highlights:** Use gold/yellow (#daba21)

## Development Workflows

### Making Changes

1. **Edit index.html directly** - All code is in one file
2. **Test locally** - Open index.html in browser
3. **Commit changes** - Use descriptive commit messages
4. **Push to GitHub** - GitHub Pages auto-deploys

### Testing Checklist

Before committing changes:

- [ ] Revenue calculations match expected monthly totals
- [ ] Setup fees only count in close month
- [ ] Renewals calculate correctly for all billing cycles
- [ ] Churn dates stop future revenue
- [ ] Commission threshold math is correct
- [ ] localStorage saves and loads properly
- [ ] UI displays correctly on mobile and desktop
- [ ] Colors match the defined palette

### Common Modifications

#### Adding New Deals

Users can add deals via the UI form. AI assistants updating the initialDeals array should:

1. Find the initialDeals array (index.html:68-107)
2. Increment the highest ID
3. Use ISO date format for close date (YYYY-MM-DD)
4. Ensure subscription and setup are numbers
5. Use correct cycle value: "monthly", "six-month", "yearly", or "two-year"

#### Adjusting Commission Structure

If commission rules change:

1. Update `MONTHLY_THRESHOLD` constant
2. Update `COMMISSION_RATE` constant
3. Update subtitle text showing threshold/rate
4. Test calculations with known data

#### Changing Colors

To update the color scheme:

1. Search for hex color codes in `<style>` block (index.html:10-58)
2. Replace with new hex values
3. Ensure sufficient contrast for accessibility
4. Test both light and dark sections

## Key Conventions

### Code Style

- Use const for React hooks (useState, useMemo, useEffect)
- Use arrow functions for components and handlers
- Use template literals for dynamic strings
- Use ternary operators for conditional rendering
- Keep inline styles minimal (prefer CSS classes)

### Naming Conventions

- **Components:** PascalCase (CommissionTracker)
- **Functions:** camelCase (formatCurrency, toggleYear)
- **Variables:** camelCase (monthlyBreakdown, activeDeals)
- **Constants:** SCREAMING_SNAKE_CASE (MONTHLY_THRESHOLD)
- **CSS Classes:** kebab-case (month-card, deal-item)

### Date Handling

- **Storage format:** ISO 8601 strings (YYYY-MM-DD)
- **Display format:** Locale-aware via toLocaleDateString()
- **Always use:** new Date() constructor for parsing
- **Input type:** HTML5 date inputs (YYYY-MM-DD)

### Currency Formatting

Use the formatCurrency function:

```javascript
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};
```

## Debugging Common Issues

### "Numbers don't match spreadsheet"

1. Check if you're looking at the correct month
2. Verify setup fees only count in close month (index.html:186)
3. Check billing cycle matches spreadsheet
4. Verify no deals accidentally marked as churned
5. Check renewal logic for 6-month/yearly/2-year cycles

### "localStorage data disappeared"

- localStorage is browser-specific and device-specific
- Can be cleared by browser, extensions, or user
- No cloud backup exists
- Export feature could be added for backup

### "Commission calculation wrong"

1. Verify MONTHLY_THRESHOLD = 6666.67
2. Verify COMMISSION_RATE = 0.20
3. Check formula: `(revenue - threshold) * rate` only if revenue > threshold
4. Remember: Most months will have zero commission

### "Deal shows in wrong month"

1. Check the close date format (must be YYYY-MM-DD)
2. Verify timezone isn't causing date shift
3. Check renewal calculation logic
4. Verify billing cycle is correct

## Source of Truth

**Important:** This tracker is a convenience tool, not the canonical source of truth.

The real sources of truth are:
1. **Google Sheet** - What deals were closed and when
2. **Company billing system** - What was actually invoiced/paid
3. **Paycheck** - What commission was actually received

Always verify tracker calculations against these sources.

## Future Enhancement Ideas

- CSV import/export for data portability
- Google Sheets API integration for auto-sync
- Multi-device sync (requires backend)
- Payment tracking (expected vs actual)
- Renewal alerts and forecasting
- Notes/comments per deal
- Filter by date range, billing cycle
- Search functionality for deals
- Visual charts (revenue over time, commission trends)

## Git Workflow

### Branch Strategy

- **Main branch:** Production code (GitHub Pages serves from here)
- **Feature branches:** Use `claude/` prefix for AI assistant work
- **Naming:** `claude/claude-md-<session-id>` format

### Commit Messages

Use clear, descriptive commit messages:

```
Good examples:
- "Update color scheme to new brand colors"
- "Fix commission calculation for 2-year billing cycle"
- "Add 5 new deals from November 2025"

Bad examples:
- "Update index.html"
- "Fix bug"
- "Changes"
```

### Push Strategy

```bash
# Always push to feature branch first
git push -u origin claude/claude-md-<session-id>

# If network fails, retry with exponential backoff
# Wait 2s, 4s, 8s, 16s between retries (max 4 retries)
```

## Contact & Support

- **Repository:** NotMastema/comm-tracker
- **Issues:** Use GitHub issues for bug reports
- **Data Source:** [Google Sheet](https://docs.google.com/spreadsheets/d/199YI0txsGxRrzM7WYAARxVbLBvIM5Ql1i3PRn-F5kM4/edit?usp=sharing)

## AI Assistant Guidelines

When working with this codebase:

1. **Always verify calculations** against expected monthly totals listed above
2. **Preserve the commission logic** - it's complex and critical
3. **Test date handling carefully** - timezone issues are common
4. **Maintain the single-file architecture** - no build process needed
5. **Use the specified color palette** for all UI changes
6. **Keep localStorage as the persistence layer** unless explicitly changing architecture
7. **Document any changes to business logic** thoroughly
8. **Verify all 4 billing cycles** when changing revenue calculation
9. **Check both new deals and renewals** when testing
10. **Remember the high threshold** - most months having zero commission is expected

---

**Last Updated:** 2025-11-14
**Version:** 1.0
**Maintainer:** AI Assistant (Claude)
