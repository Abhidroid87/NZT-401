# 🎯 Bing Rewards Auto Clicker Extension

A Chrome extension (Manifest V3) that automatically detects and clicks "+5 bonus" buttons on the Bing Rewards page, then closes the tab when done.

## 📋 Features

✅ **Automatic Detection** - Finds +5 bonus buttons on rewards.bing.com
✅ **Smart Scrolling** - Scrolls through the activity section to locate all buttons
✅ **Human-like Clicks** - Simulates natural mouse interactions
✅ **Status Tracking** - Shows green tick marks after collecting points
✅ **Auto Close** - Closes the tab automatically when finished
✅ **Error Handling** - Includes robust error management and logging
✅ **Debug Tools** - Console utilities for testing and troubleshooting

## 📁 File Structure

```
bing-rewards-extension/
├── manifest.json      # Extension configuration (Manifest V3)
├── content.js         # Content script - finds and clicks buttons
├── background.js      # Background script - handles tab closure
└── README.md          # This file
```

## 🚀 Installation Instructions

### Step 1: Load the Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Navigate to and select the `bing-rewards-extension` folder
5. The extension is now installed!

### Step 2: Verify Installation

- You should see "Bing Rewards Auto Clicker" in your extensions list
- The extension icon will appear in your toolbar

## 🎮 How to Use

### Automatic Method:
1. Open a new tab and navigate to `https://rewards.bing.com/`
2. Wait for the extension to auto-detect the page (2-3 seconds)
3. The extension will:
   - Search for +5 bonus buttons
   - Scroll through the activity section
   - Click each available button
   - Wait for green checkmarks
   - Close the tab automatically

### Manual Method:
1. Click the extension icon in the toolbar while on rewards.bing.com
2. The content script will start processing

## 🔧 Technical Details

### Manifest V3 Configuration

```json
- Permissions: tabs, activeTab, scripting
- Host Permissions: https://rewards.bing.com/*
- Content Script: Runs on document_end
- Service Worker: background.js for async operations
```

### How It Works

1. **Content Script (content.js)**
   - Waits for page to fully load
   - Searches for elements matching button patterns
   - Identifies +5 bonus buttons and incomplete activities
   - Scrolls to each button and simulates click
   - Sends completion message to background script

2. **Background Script (background.js)**
   - Listens for "closeTab" message from content script
   - Extracts tab ID from message sender
   - Closes the tab after 2-second delay
   - Provides error handling and logging

### Target Element Detection

The extension searches for buttons using:
- Aria labels containing "+5"
- CSS classes with "bonus" or "points"
- Text content matching "+5" pattern
- Activity container buttons
- Role-based button detection

### Smart Features

- **Viewport Detection**: Scrolls elements into view before clicking
- **Duplicate Prevention**: Skips buttons already showing green checkmarks
- **Scroll Limit**: Prevents infinite scrolling (10 max attempts)
- **Configurable Timing**: Adjustable delays for reliability
- **Human-like Interaction**: Uses proper mouse events (mousedown, mouseup, click)

## 🐛 Troubleshooting

### Extension Not Auto-Starting
- Refresh the rewards.bing.com page
- Check console for error messages (F12 → Console)
- Verify extension is installed in chrome://extensions/

### Buttons Not Being Clicked
- Check console output (F12 → Console)
- Use debug utilities (see below)
- Verify button selectors match current page structure
- Try clicking the extension icon manually

### Tab Not Closing
- Check that content script is running (look for "Content Script Loaded" in console)
- Verify background script is active in chrome://extensions/
- Check for console errors in background script logs

### Page Layout Changed
- Reward page HTML structure may have changed
- Update button selectors in `content.js` under `CONFIG.buttonSelectors`
- Use debug utilities to test new selectors

## 🔍 Debug Utilities

Open the console (F12) on rewards.bing.com and use these tools:

```javascript
// Find all clickable buttons
window.bingRewardsDebug.findButtons()

// Manually click all buttons (for testing)
await window.bingRewardsDebug.clickAllButtons()

// Get current extension status
window.bingRewardsDebug.getStatus()
```

## 📊 Console Output Examples

Successful execution:
```
🎯 Bing Rewards Auto Clicker - Content Script Loaded
🔍 Starting to search for +5 bonus buttons...
📍 Found 5 potential buttons
📜 Scrolling to button...
🖱️  Clicking button... (1)
...
✅ Successfully clicked 5 buttons!
📤 Message sent to background script
```

## ⚙️ Configuration

Edit `content.js` to customize behavior:

```javascript
const CONFIG = {
  scrollDelay: 500,        // Delay between scroll steps (ms)
  clickDelay: 1000,        // Delay after clicking (ms)
  maxScrollAttempts: 10,   // Maximum scroll attempts per button
  scrollStep: 300,         // Pixels to scroll per step
};
```

## 🔒 Permissions Explained

- **tabs**: Needed to access and close tabs
- **activeTab**: Grants access to the current tab
- **scripting**: Allows injecting content script

## ⚠️ Important Notes

- Extension only works on `https://rewards.bing.com/*`
- Requires active Chrome window (won't work if Chrome is minimized)
- Some Bing Rewards activities may have daily limits
- Green checkmarks indicate successful completion
- Tab closes automatically after 2 seconds to see results

## 🎯 Future Enhancements

- [ ] Add progress notifications
- [ ] Support for multiple reward types
- [ ] Configurable target button patterns
- [ ] Activity history logging
- [ ] Custom notification sounds
- [ ] Support for other reward websites

## 📝 Version History

**v1.0** - Initial release
- Manifest V3 compatible
- Auto-detection and clicking of +5 bonus buttons
- Automatic tab closure
- Console logging and debug utilities

## 🤝 Support

If issues occur:
1. Check console output (F12 → Console tab)
2. Verify extension permissions in chrome://extensions/
3. Try reloading the rewards page
4. Disable and re-enable extension
5. Clear browser cache if needed

## 📄 License

This extension is provided as-is for personal use with Bing Rewards.

---

**Happy Rewarding! 🎁**
