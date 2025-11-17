# Google Sheets Auto-Sync Setup Guide

This guide will help you set up automatic syncing between your Google Sheet and the commission tracker.

## Quick Setup (15 minutes)

### Step 1: Deploy the Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/199YI0txsGxRrzM7WYAARxVbLBvIM5Ql1i3PRn-F5kM4/edit

2. Click **Extensions** > **Apps Script**

3. Delete any existing code in the editor

4. Copy and paste the ENTIRE contents of `google-apps-script.js` from this repository

5. Click the **Save** icon (disk icon)

6. Click **Deploy** > **New deployment**

7. Click the gear icon next to "Select type", choose **Web app**

8. Configure the deployment:
   - **Description**: Commission Tracker API
   - **Execute as**: Me (your@email.com)
   - **Who has access**: Anyone

9. Click **Deploy**

10. **IMPORTANT**: Copy the Web App URL (it looks like: `https://script.google.com/macros/s/AKfycbz.../exec`)

### Step 2: Update the Tracker

1. Open `index.html` in a text editor

2. Find this line (around line 70):
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
   ```

3. Replace `'PASTE_YOUR_APPS_SCRIPT_URL_HERE'` with your Web App URL from Step 1:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
   ```

4. Save the file

5. Commit and push to GitHub

### Step 3: Test

1. Open your tracker in a browser

2. You should see:
   - A green sync status bar showing "Last synced" with timestamp
   - All 38 of your deals loaded from the sheet
   - A "Refresh from Sheet" button

3. Click "Refresh from Sheet" to manually sync anytime

## How It Works

- **On page load**: Tracker automatically fetches all your deals (Rep = "Mata") from Google Sheets
- **Refresh button**: Click anytime to pull latest data from the sheet
- **Fallback**: If the sync fails, it uses cached data from localStorage
- **No backend needed**: Google hosts the API for free

## Updating Deals

Just update your Google Sheet as normal. When you open the tracker or click "Refresh from Sheet", it will pull the latest data.

## Troubleshooting

### "Sync error" message
- Check that the Apps Script URL is correct in `index.html`
- Make sure the Apps Script deployment is set to "Anyone" can access
- Try redeploying the Apps Script

### Not all deals showing
- Make sure Rep column says "Mata" (case-sensitive)
- Check that required fields are filled: Customer, Month, Subscription Amount
- Check browser console for errors (F12 > Console tab)

### Data seems old
- Click "Refresh from Sheet" button
- Clear browser cache and reload (Ctrl+Shift+R)

## What Gets Synced

The Apps Script reads these columns from your sheet:
- Month
- Customer
- Rep (filters for "Mata" only)
- Setup Fee
- Subscription Amount
- Billing Cycle

**Note**: Churn dates are currently only stored locally (not synced from sheet). This can be added later if needed.

## Next Steps

Once this is working, you can:
- Add churn tracking to the Google Sheet
- Set up automatic refresh every X minutes
- Add webhook to update on sheet changes
- Export to different formats

---

**Need help?** Open an issue on GitHub or check the browser console (F12) for error messages.
