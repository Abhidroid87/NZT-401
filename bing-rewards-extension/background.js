// ============================================================================
// BACKGROUND SCRIPT (Service Worker) - Manifest V3
// ============================================================================

console.log("🔧 Agent0: Command & Control Service Worker Loaded");

/**
 * MASTER TASK DRIVER
 * Actively pings rewards tabs to perform tasks.
 * This bypasses background throttling by using high-priority extension messaging.
 */
let driverInterval = null;

function startTaskDriver() {
    if (driverInterval) return;
    
    console.log("🚀 Starting Master Task Driver...");
    driverInterval = setInterval(async () => {
        // Find all rewards tabs
        const tabs = await chrome.tabs.query({ url: "*://rewards.bing.com/*" });
        
        for (const tab of tabs) {
            // Only drive the 'earn' or 'dashboard' pages
            if (tab.url.includes('/earn') || tab.url.includes('/dashboard')) {
                try {
                    // Send an active command to perform an atomic task step
                    chrome.tabs.sendMessage(tab.id, { action: "performTaskPulse" }).catch(() => {});
                } catch(e) {
                    console.error("❌ Driver error for tab:", tab.id, e);
                }
            } else {
                // Heartbeat only for other rewards pages to keep them alive
                chrome.tabs.sendMessage(tab.id, { action: "heartbeat" }).catch(() => {});
            }
        }
    }, 4000); // Pulse every 4 seconds
}

// Start driver immediately
startTaskDriver();

/**
 * MESSAGE DISPATCHER
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const windowId = sender.tab?.windowId;
  const tabId = sender.tab?.id;
  
  // ✅ Close Entire Window (Mission Complete)
  if (request.action === "closeWindow") {
    console.log("🏁 Mission complete reported. Closing window...");
    setTimeout(() => {
        chrome.windows.remove(windowId).catch(() => {});
    }, 500);
    return true;
  }

  // ✅ Close ONLY current tab (Redirect handling)
  if (request.action === "closeTab") {
    console.log("🧼 Closing tab:", tabId);
    chrome.tabs.remove(tabId).catch(() => {});
    return true;
  }

  // ✅ Update Clicks
  if (request.action === "updateClicks") {
    console.log(`📈 Counter Update: ${request.count} clicks in tab ${tabId}`);
    return true;
  }

  // ✅ Task Complete Notification
  if (request.action === "taskComplete") {
      console.log(`✅ Tab ${tabId} reported task completion.`);
      return true;
  }
});

// Listener for tab updates - re-initialize if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('rewards.bing.com')) {
        console.log(`📡 Tab updated: ${tab.url}. Pulsing...`);
        chrome.tabs.sendMessage(tabId, { action: "nudge" }).catch(() => {});
    }
});

console.log("✅ Agent0: Background C2 Pulse established.");
