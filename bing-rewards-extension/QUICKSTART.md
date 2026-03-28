# 🚀 Quick Start Guide

## Installation in 3 Easy Steps

### 1️⃣ Open Extensions Page
- Open Chrome browser
- Go to: `chrome://extensions/`

### 2️⃣ Enable Developer Mode
- Look for toggle in **top-right corner**
- Click to enable (should turn blue)

### 3️⃣ Load Extension
- Click **"Load unpacked"** button
- Select the `bing-rewards-extension` folder
- Done! ✅

## Testing the Extension

1. Open a new tab
2. Go to: `https://rewards.bing.com/`
3. Wait 2-3 seconds
4. Watch the extension:
   - Find +5 bonus buttons
   - Scroll through activities
   - Click each button
   - Close tab when complete

## Monitoring Progress

### Open Developer Console (F12)
Press `F12` → Click **Console** tab

You'll see messages like:
- `🎯 Content Script Loaded`
- `🔍 Starting to search for +5 bonus buttons...`
- `📍 Found X potential buttons`
- `🖱️  Clicking button... (1)`
- `✅ Successfully clicked X buttons!`
- `✅ Tab closed successfully`

## Troubleshooting

**Issue: Extension not starting**
→ Refresh the Bing Rewards page and wait 3 seconds

**Issue: Console shows errors**
→ Check that manifest.json is valid JSON (no trailing commas)

**Issue: Extension appears but doesn't click**
→ Check console for detailed error messages
→ Use `window.bingRewardsDebug.getStatus()` to check state

## File Locations

Your extension is located at:
```
c:\Users\LENOVO\OneDrive\Documents\3.40.0_0-1\bing-rewards-extension\
├── manifest.json
├── content.js
├── background.js
└── README.md
```

## What Each File Does

📄 **manifest.json**
- Extension configuration
- Defines permissions
- Specifies which pages to run on

📜 **content.js**
- Runs on Bing Rewards page
- Finds and clicks buttons
- Scrolls through activities
- Sends message when done

⚙️ **background.js**
- Service worker (always running)
- Listens for content script messages
- Closes tabs on completion

## Next Steps

1. Test the extension on rewards.bing.com
2. Monitor console output
3. Watch for green checkmarks appearing
4. Tab will auto-close when finished

Happy Rewarding! 🎁
