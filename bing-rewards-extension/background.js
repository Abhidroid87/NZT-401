// ============================================================================
// BACKGROUND SCRIPT (Service Worker) - Manifest V3
// ============================================================================

console.log("🔧 Agent0: Command & Control Service Worker Loaded");

/**
 * HEARTBEAT / KEEP-ALIVE
 * Periodically pings the rewards tab to prevent browser throttling.
 */
let pulseInterval = null;

function startHeartbeat() {
    if (pulseInterval) return;
    pulseInterval = setInterval(async () => {
        const tabs = await chrome.tabs.query({ url: "*://rewards.bing.com/*" });
        for (const tab of tabs) {
            try {
                chrome.tabs.sendMessage(tab.id, { action: "heartbeat" }).catch(() => {});
            } catch(e) {}
        }
    }, 1500); // 1.5s pulse
}

// Start immediately
startHeartbeat();

/**
 * Message Dispatcher
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const windowId = sender.tab?.windowId;
  const tabId = sender.tab?.id;
  
  // ✅ Close Entire Window (Mission Complete)
  if (request.action === "closeWindow") {
    setTimeout(() => {
        chrome.windows.remove(windowId).catch(() => {});
    }, 500);
    return true;
  }

  // ✅ Close ONLY current tab (Redirect handling)
  if (request.action === "closeTab") {
    chrome.tabs.remove(tabId).catch(() => {});
    return true;
  }

  // ✅ Update Clicks (For UI progress if needed)
  if (request.action === "updateClicks") {
    console.log(`📈 Counter Update: ${request.count} clicks`);
    return true;
  }
});

// Periodic "Re-Scan" trigger if the tab seems idle
setInterval(async () => {
    const tabs = await chrome.tabs.query({ url: "*://rewards.bing.com/earn*" });
    for (const tab of tabs) {
        // Send a "Are you still working?" probe
        chrome.tabs.sendMessage(tab.id, { action: "bgProbe" }).then(response => {
           if (response && response.idleTime > 20000) {
              console.log("⚠️ Tab seems idle in background. Triggering nudge...");
              chrome.tabs.sendMessage(tab.id, { action: "nudge" }).catch(() => {});
           }
        }).catch(() => {});
    }
}, 10000); // Every 10s check

console.log("✅ Agent0: Background C2 established.");
