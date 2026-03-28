# 🎮 Usage Scenarios & Examples

## Scenario 1: Fresh Installation & First Run

### Steps:
1. Extract extension files to a folder
2. Open `chrome://extensions/`
3. Enable Developer Mode (top-right toggle)
4. Click "Load unpacked"
5. Select extension folder
6. Navigate to `https://rewards.bing.com/`
7. Wait 2-3 seconds

### Expected Output:
```
🎯 Bing Rewards Auto Clicker - Content Script Loaded
🔍 Starting to search for +5 bonus buttons...
📍 Found 5 potential buttons
📜 Scrolling to button...
🖱️  Clicking button... (1)
✅ Successfully clicked 5 buttons!
📤 Message sent to background script
✅ Tab closed successfully
```

---

## Scenario 2: No Buttons Found

### Problem:
- Page structure changed
- Buttons are in different location
- No +5 rewards available today

### Solution:
1. Open Developer Console (F12)
2. Run: `window.bingRewardsDebug.findButtons()`
3. Check what elements are found
4. Update selectors in `CONFIG.buttonSelectors`

### Debug Code:
```javascript
// Check what's on the page
document.querySelectorAll('button').forEach(btn => {
  console.log(btn.textContent);
});

// Find all elements with "5"
const all = document.body.innerHTML;
const matches = all.match(/\+5/gi);
console.log("Found +5 occurrences:", matches);
```

---

## Scenario 3: Extension Not Auto-Starting

### Possible Causes:
- Page not fully loaded
- Extension not loaded correctly
- Host permission issue

### Fix:
1. Refresh page (Ctrl+R)
2. Wait 5 seconds
3. Check console for errors
4. Click extension icon in toolbar manually

### Verify Installation:
```javascript
// In console on rewards.bing.com
console.log(window.bingRewardsDebug ? "✅ Loaded" : "❌ Not loaded")
```

---

## Scenario 4: Button Clicked But Tab Didn't Close

### Problem:
- Background script not running
- Message not sent
- Tab ID not captured

### Debug Steps:
```javascript
// Test message sending
chrome.runtime.sendMessage({
  action: "closeTab",
  status: "test",
  clickedCount: 0,
}, (response) => {
  console.log("Response:", response);
});
```

### Manual Fix:
1. Go to `chrome://extensions/`
2. Find "Bing Rewards Auto Clicker"
3. Click "Background page" link
4. Check console for errors
5. Reload extension

---

## Scenario 5: Multiple +5 Buttons Visible

### Expected Behavior:
- Extension finds all buttons
- Clicks each one in sequence
- Waits 1 second between clicks
- Detects green checkmarks
- Continues until all completed

### Verification:
```javascript
// Check how many buttons were clicked
const status = window.bingRewardsDebug.getStatus();
console.log(`Clicked: ${status.clickedButtons}/${status.totalButtonsFound}`);
```

---

## Scenario 6: Customizing Click Speed

### For Fast Clicker:
Edit `content.js` line 25:
```javascript
const CONFIG = {
  scrollDelay: 200,     // Fast
  clickDelay: 300,      // Fast
  maxScrollAttempts: 8,
  scrollStep: 500,
};
```

### For Slow Clicker (Safer):
```javascript
const CONFIG = {
  scrollDelay: 1000,    // Slow
  clickDelay: 2000,     // Slow
  maxScrollAttempts: 15,
  scrollStep: 200,
};
```

### For Medium (Default):
```javascript
const CONFIG = {
  scrollDelay: 500,
  clickDelay: 1000,
  maxScrollAttempts: 10,
  scrollStep: 300,
};
```

---

## Scenario 7: Monitoring with Console Emojis

### What Each Emoji Means:

```
🎯 Extension started
🔍 Searching for buttons
📍 Found something
📜 Scrolling page
🖱️  Clicking button
⏭️  Skipping element
✅ Success/completed
❌ Error occurred
⚠️  Warning
📤 Message sent
📊 Statistics shown
```

### Follow the Flow:
```
🎯 → 🔍 → 📍 → 📜 → 🖱️ → ✅
```

---

## Scenario 8: Extension Works Partially

### Problem:
- Only 1-2 buttons clicked, not all
- Page scrolling not working
- Some buttons skipped

### Causes:
- Dynamic content loading
- Page layout changed
- Scroll reached end of content

### Fix:
1. Increase `maxScrollAttempts` in CONFIG
2. Decrease `scrollStep` for finer scrolling
3. Add new selectors for buttons

---

## Scenario 9: Testing in Console

### Quick Test:
```javascript
// Find all clickable buttons
const buttons = window.bingRewardsDebug.findButtons();
console.log(`Found ${buttons.length} buttons`);

// Get current status
const status = window.bingRewardsDebug.getStatus();
console.log(status);

// Click all manually (for testing)
await window.bingRewardsDebug.clickAllButtons();
```

### Detailed Test:
```javascript
// Check each button
buttons.forEach((btn, idx) => {
  console.log(`Button ${idx}:`, {
    text: btn.textContent.substring(0, 50),
    visible: isElementInViewport(btn),
    completed: isButtonAlreadyClicked(btn),
    class: btn.className,
  });
});
```

---

## Scenario 10: Extension Not Finding New Buttons After Scroll

### Issue:
- Extension stops finding buttons
- Says "reached end of page"
- But more buttons might exist

### Solution:
1. Check page actually has more buttons:
```javascript
// Scroll manually
window.scrollBy(0, 500);

// Search again
window.bingRewardsDebug.findButtons();
```

2. Update selectors in CONFIG if HTML changed:
```javascript
// Open inspector (F12)
// Right-click on a +5 button
// Click "Inspect"
// Copy the CSS class/ID
// Add to buttonSelectors in content.js
```

---

## Scenario 11: Green Checkmarks Not Appearing

### Problem:
- Buttons clicked but no green marks
- Extension thinks activity not completed
- Might try to click again

### Debug:
```javascript
// Find a button you just clicked
const button = document.querySelector('[aria-label*="+5"]');

// Check for completion indicators
console.log({
  hasComplete: button.querySelector("[class*='complete']"),
  hasChecked: button.querySelector("[class*='checked']"),
  ariaChecked: button.getAttribute("aria-checked"),
  classList: button.className,
});
```

---

## Scenario 12: Extension Keeps Running / Infinite Loop

### Problem:
- Extension doesn't stop
- Tab never closes
- Keeps clicking same button

### Quick Fix:
1. Press Ctrl+Shift+I (open DevTools)
2. Manually close tab
3. Reload extension:
   - Go to chrome://extensions/
   - Click reload icon

### Prevent:
Modify content.js line 175:
```javascript
// Add escape condition
if (clickedButtons > 20) {
  console.log("⏹️  Safety limit reached");
  break;
}
```

---

## Scenario 13: Cross-Browser Testing

### Test on Different Browser:
- **Chrome** - Fully supported (Manifest V3)
- **Edge** - Fully supported (Chromium-based)
- **Brave** - Fully supported (Chromium-based)
- **Firefox** - NOT supported (different API)
- **Safari** - NOT supported (Safari Extensions different)

### Install on Edge:
1. Open `edge://extensions/`
2. Enable Developer Mode
3. Load unpacked extension
4. Same functionality as Chrome

---

## Scenario 14: Updating Extension

### When to Update:
- Bing Rewards page HTML changed
- New button types added
- Want to change settings

### Update Steps:
1. Edit files (content.js, manifest.json, etc.)
2. Go to chrome://extensions/
3. Click reload icon on extension
4. Changes take effect immediately

### No Restart Required:
- Changes apply to next page load
- Already-open tabs use old version
- Refresh page to use new version

---

## Scenario 15: Troubleshooting Checklist

```
□ Extension loaded in chrome://extensions/?
□ Developer mode enabled?
□ Extension icon visible in toolbar?
□ Can see "Bing Rewards Auto Clicker" in extensions?
□ Navigated to rewards.bing.com?
□ Waited 2-3 seconds after page load?
□ Console shows "Content Script Loaded"?
□ Can see button detection logs?
□ Green checkmarks appearing after clicks?
□ Tab closing after completion?
□ Check manifest.json valid JSON?
□ All three files present? (manifest.json, content.js, background.js)
□ Host permissions correct? (https://rewards.bing.com/*)
□ Permissions list correct? (tabs, activeTab, scripting)
```

---

## Scenario 16: Performance Optimization

### For Slow Computers:
```javascript
CONFIG = {
  scrollDelay: 800,
  clickDelay: 1500,
  maxScrollAttempts: 8,
  scrollStep: 200,
};
```

### For Fast Computers:
```javascript
CONFIG = {
  scrollDelay: 200,
  clickDelay: 500,
  maxScrollAttempts: 15,
  scrollStep: 500,
};
```

### Monitor Performance:
```javascript
// Check memory usage
console.memory?.usedJSHeapSize
```

---

## Scenario 17: Backup & Restore

### Backup Extension:
```
1. Copy entire folder:
   bing-rewards-extension/

2. Save to multiple locations:
   - External drive
   - Cloud storage
   - Email yourself files
```

### Restore Extension:
```
1. Copy folder to new location
2. Go to chrome://extensions/
3. Click "Load unpacked"
4. Select folder
5. Done!
```

---

## Scenario 18: Advanced: Custom Notifications

### Add Desktop Notification:
Edit background.js:
```javascript
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icon.png',
  title: 'Rewards Collected!',
  message: 'Successfully clicked ' + clickedCount + ' buttons',
  priority: 2,
});
```

### Sound Notification:
```javascript
const audio = new Audio('chrome-extension://...sound.mp3');
audio.play();
```

---

## Scenario 19: Schedule Automated Runs

### Using Chrome Alarms:
Add to background.js:
```javascript
chrome.alarms.create('dailyRewards', {
  periodInMinutes: 60,  // Every hour
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyRewards') {
    console.log('Automatic run triggered');
  }
});
```

---

## Scenario 20: Debug Network Issues

### Check Connectivity:
```javascript
// In console
navigator.onLine ? "Online" : "Offline"

// Check if API calls work
fetch('https://rewards.bing.com/')
  .then(r => console.log(r.status))
  .catch(e => console.error(e))
```

---

## 🆘 Quick Help

**Extension not working?**
→ Check console (F12 → Console tab)

**Buttons not found?**
→ Run: `window.bingRewardsDebug.findButtons()`

**Tab not closing?**
→ Check background.js has no errors (chrome://extensions/ → Details → Errors)

**Need faster execution?**
→ Edit CONFIG in content.js line 25, decrease delays

**Want more logging?**
→ Already includes detailed emoji-based logging

**Getting errors?**
→ Post the error message from console + file name

---

## 📞 Support Resources

1. **Documentation Files:**
   - README.md (comprehensive)
   - QUICKSTART.md (fast setup)
   - ADVANCED_CONFIG.js (customization)

2. **Debug Utilities:**
   - `window.bingRewardsDebug.findButtons()`
   - `window.bingRewardsDebug.getStatus()`
   - `window.bingRewardsDebug.clickAllButtons()`

3. **Check These:**
   - manifest.json valid JSON
   - All files in same folder
   - chrome://extensions/ shows extension
   - Console shows no red errors

4. **Test Steps:**
   - Reload extension
   - Refresh page
   - Clear browser cache
   - Open in new tab
   - Restart Chrome

---

**Happy Rewarding! 🎁**
