# Debugging Guide - Bing Rewards Extension

## Enhanced Button Detection & Debugging

### What Changed (Latest Fixes)

#### 1. **Better Button Detection Logging**
The `findTargetElements()` function now has detailed console logging:
- Shows each CSS selector being tested and how many elements it finds
- Displays total clickable elements on the page
- Logs each +5 button found with preview of text
- Shows final count of unique buttons

**To see logs:** Open Chrome DevTools (F12) → Console tab, then run extension

#### 2. **Improved Scroll Logging**
- Logs current scroll position and destination before/after
- Shows element viewport position before attempting scroll
- Verifies scroll completed successfully

#### 3. **Enhanced Main Function**
Startup now logs:
- Extension start time
- Current page URL
- Document title
- Total DOM elements on page
- First scan (no scroll) - how many buttons found
- Second scan (after scroll) - how many buttons found after scrolling

#### 4. **Timer Improvements** (Already Applied)
- ✅ Fixed countdown not turning off (interval now tracked properly)
- ✅ Made more visible (stronger shadows, border, larger font)
- ✅ Slowed to 1-second intervals with console logging each tick

---

## How to Debug Button Detection Issues

### Step 1: Open Chrome DevTools
1. Navigate to https://rewards.bing.com
2. Press `F12` to open DevTools
3. Click the **Console** tab

### Step 2: Run the Extension
1. Click the extension icon in toolbar
2. Click **Start** button
3. Watch the console for detailed logs

### Step 3: Check the Console Output
You should see:
```
🚀 EXTENSION STARTED - Bing Rewards Automation
Page URL: https://rewards.bing.com/...
Page Title: Microsoft Rewards
⏳ Waiting for page to fully load (2 seconds)...
✅ Page loaded. DOM elements: 5432
🔍 First scan for +5 buttons (no scroll)...
🔎 Searching for +5 bonus buttons...
   Selector "..." found: X elements
   ...more selectors...
   Total clickable elements on page: 234
   ✅ Found +5 button: "Click here to get +5 points"
   ...more buttons...
📍 Found ### unique +5 buttons found: 5
```

### Step 4: If No Buttons Found
If you see "Found 0 unique +5 buttons found", then:

**Option A: Find the Correct Selector**
1. On the Bing Rewards page, find a +5 button
2. Right-click on it → **Inspect**
3. Look for the element's:
   - `id=` attribute
   - `class=` attribute  
   - `aria-label=` attribute
4. Report what you find!

**Option B: Check What Buttons ARE on Page**
In DevTools Console, paste:
```javascript
// Find all buttons with text
const allButtons = document.querySelectorAll('button, [role="button"], div[class*="button"]');
allButtons.forEach((btn, i) => {
  if (btn.textContent.length < 200) {
    console.log(`Button ${i}: "${btn.textContent.trim()}"`);
  }
});
```
This will show ALL button-like elements and their text.

---

## What Button Selectors Are We Looking For?

The extension searches for elements matching:
1. **CSS Selectors** (from `CONFIG.buttonSelectors`):
   - Various Bing Rewards specific selectors
2. **Text Content**:
   - Any element containing "+5"
   - Any element containing "bonus"
   - Any button/clickable with those keywords

---

## Scroll Position Debugging

If buttons are found but not being clicked:

1. Check console for scroll logs:
   ```
   📜 Scrolling page by 400px (current: 0)
   ✅ Now at scroll position: 2150
   ```

2. Verify element is visible after scroll:
   ```
   📍 Scrolling to element at viewport position: top=50, left=100
   ✅ Scroll complete - Element now at: top=50
   ```

3. If `top` value is negative after scroll, element is above viewport
4. If `top` value is > window height after scroll, element is below viewport

---

## Countdown Timer Testing

### Test 1: Timer Appears
- Run extension and watch for blue triangle with timer in bottom-right corner
- Should show "2:00" (2 minutes) or "1:00" (1 minute) depending on settings

### Test 2: Timer Counts Down
- Open DevTools Console
- Should see every second:
  ```
  ⏱️  Timer: 1:59
  ⏱️  Timer: 1:58
  ...
  ```

### Test 3: Timer Dismissal
- Hover over timer (blue triangle)
- Red X button should appear
- Click X button
- Timer should disappear
- Console should log: `🗙 Timer dismissed by user`

### Test 4: Browser Close
- Don't dismiss timer
- Let countdown finish
- Browser window should close (when timer reaches 0:00)

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No buttons found | Page structure changed or wrong selectors | Right-click +5 button → Inspect, send me the HTML |
| Scroll happens but buttons not clicked | Buttons not visible after scroll | Check if `top` position is in viewport after scroll |
| Timer not visible | Hidden behind other elements | Timer has `z-index: 999999` so should be on top |
| Timer won't turn off | Interval ID not cleared | Click X button to dismiss |
| Timer too fast | Running multiple intervals | Each interval should log to console |
| Points don't add up | Extension clicking wrong elements | Verify button's aria-label or title matches "+5" |

---

## Files to Check

- **content.js**: Main logic - scroll, detect, click buttons (580 lines)
- **manifest.json**: Configuration - which selectors, permissions
- **popup.js**: Settings - start/stop button, delays

---

## Quick Test Checklist

- [ ] Extension loads without errors
- [ ] Console shows startup logs (🚀, Page URL, DOM count)
- [ ] Console shows button search logs (🔎 Searching...)
- [ ] At least one +5 button is found (shows ✅)
- [ ] Timer appears after buttons processed
- [ ] Timer countdown logs show 1-second intervals
- [ ] Points increase on Bing Rewards dashboard

---

## Next Steps

1. **Run extension and share console output**
2. **If no buttons found: Inspect actual +5 button element**
3. **Screenshot of Bing Rewards activity section**
4. **Any error messages in red in console**

This info helps identify exactly where the issue is!
