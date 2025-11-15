/**
 * Google Apps Script for Rejig Commission Tracker
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/199YI0txsGxRrzM7WYAARxVbLBvIM5Ql1i3PRn-F5kM4/edit
 * 2. Click Extensions > Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire file
 * 5. Click "Deploy" > "New deployment"
 * 6. Click the gear icon, select "Web app"
 * 7. Set:
 *    - Description: "Commission Tracker API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 8. Click "Deploy"
 * 9. Copy the Web App URL (it will look like: https://script.google.com/macros/s/...../exec)
 * 10. Paste that URL into the tracker code where indicated
 */

function doGet(e) {
  // Enable CORS for GitHub Pages
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const deals = getMataDeals();
    output.setContent(JSON.stringify({
      success: true,
      data: deals,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    output.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }

  return output;
}

function getMataDeals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // First sheet
  const data = sheet.getDataRange().getValues();

  // Expected columns based on your sheet:
  // Month, Customer, Rep, Total Amount, Setup Fee, Subscription Amount, Plan Type, Billing Cycle, Source, Details
  const headers = data[0];
  const deals = [];
  let idCounter = 1;

  // Find column indices
  const colIndices = {
    month: headers.indexOf('Month'),
    customer: headers.indexOf('Customer'),
    rep: headers.indexOf('Rep'),
    setupFee: headers.indexOf('Setup Fee'),
    subscription: headers.indexOf('Subscription Amount'),
    billingCycle: headers.indexOf('Billing Cycle')
  };

  // Process rows (skip header row)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rep = row[colIndices.rep];

    // Only process Mata's deals
    if (rep !== 'Mata') continue;

    const month = row[colIndices.month];
    const customer = row[colIndices.customer];
    const setupFee = parseFloat(row[colIndices.setupFee]) || 0;
    const subscription = parseFloat(row[colIndices.subscription]) || 0;
    const billingCycle = row[colIndices.billingCycle];

    // Skip if missing critical data
    if (!customer || !month || subscription === 0) continue;

    // Convert month name to ISO date (YYYY-MM-DD)
    // "July 2025" -> "2025-07-01"
    const closeDate = parseMonthToDate(month);

    // Normalize billing cycle
    const cycle = normalizeBillingCycle(billingCycle);

    deals.push({
      id: idCounter++,
      name: customer,
      close: closeDate,
      subscription: subscription,
      setup: setupFee,
      cycle: cycle,
      churnDate: null // Can be extended later if you add churn tracking to sheet
    });
  }

  return deals;
}

function parseMonthToDate(monthString) {
  // Handle formats like "July 2025", "7/2025", "2025-07", etc.
  if (!monthString) return new Date().toISOString().split('T')[0];

  const monthNames = {
    'january': '01', 'jan': '01',
    'february': '02', 'feb': '02',
    'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'may': '05',
    'june': '06', 'jun': '06',
    'july': '07', 'jul': '07',
    'august': '08', 'aug': '08',
    'september': '09', 'sep': '09', 'sept': '09',
    'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'december': '12', 'dec': '12'
  };

  // Try to parse as Date object first
  const dateAttempt = new Date(monthString);
  if (!isNaN(dateAttempt.getTime())) {
    return dateAttempt.toISOString().split('T')[0];
  }

  // Parse "July 2025" format
  const parts = monthString.toLowerCase().trim().split(/\s+/);
  if (parts.length === 2) {
    const monthName = parts[0];
    const year = parts[1];
    const monthNum = monthNames[monthName];
    if (monthNum) {
      return `${year}-${monthNum}-01`;
    }
  }

  // Default to current date if parsing fails
  return new Date().toISOString().split('T')[0];
}

function normalizeBillingCycle(cycle) {
  if (!cycle) return 'monthly';

  const cycleStr = cycle.toLowerCase().trim();

  if (cycleStr.includes('month') && !cycleStr.includes('6')) {
    return 'monthly';
  } else if (cycleStr.includes('6')) {
    return 'six-month';
  } else if (cycleStr.includes('year') && !cycleStr.includes('2')) {
    return 'yearly';
  } else if (cycleStr.includes('2')) {
    return 'two-year';
  }

  return 'monthly'; // Default
}

/**
 * Test function - run this to see the output in Apps Script editor
 */
function testGetDeals() {
  const deals = getMataDeals();
  Logger.log(JSON.stringify(deals, null, 2));
  Logger.log(`Total deals found: ${deals.length}`);
}
