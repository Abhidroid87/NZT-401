// ============================================================================
// ADVANCED CONFIGURATION & CUSTOMIZATION GUIDE
// ============================================================================

// This file demonstrates how to customize the extension for different scenarios

// ============================================================================
// SCENARIO 1: FASTER CLICKING (Less realistic but quicker)
// ============================================================================

// In content.js, modify CONFIG:
/*
const CONFIG = {
  scrollDelay: 200,        // Faster scrolling
  clickDelay: 300,         // Faster click processing
  maxScrollAttempts: 8,
  scrollStep: 500,         // Bigger scroll steps
};
*/

// ============================================================================
// SCENARIO 2: SLOWER CLICKING (More realistic, avoids detection)
// ============================================================================

// In content.js, modify CONFIG:
/*
const CONFIG = {
  scrollDelay: 1000,       // Slower scrolling
  clickDelay: 2000,        // Longer wait between clicks
  maxScrollAttempts: 15,
  scrollStep: 200,         // Smaller scroll steps
};
*/

// ============================================================================
// SCENARIO 3: FIND SPECIFIC BUTTON TYPES
// ============================================================================

// Edit the buttonSelectors array in content.js to target specific reward types:

const CUSTOM_SELECTORS = {
  // Only +5 bonus buttons
  plusFive: [
    '[aria-label*="+5"]',
    'button:contains("+5")',
  ],
  
  // Only "Earn More" activities
  earnMore: [
    '[aria-label*="Earn More"]',
    'button:contains("Earn")',
  ],
  
  // Only quiz activities
  quizzes: [
    '[aria-label*="quiz"]',
    'button[class*="quiz"]',
  ],
  
  // Only mobile app rewards
  mobile: [
    '[aria-label*="mobile"]',
    'button:contains("mobile")',
  ],
};

// ============================================================================
// SCENARIO 4: MODIFY CLICK BEHAVIOR
// ============================================================================

// Replace humanClick() function in content.js for different click types:

// Option A: Double-click instead of single click
function doubleClick(element) {
  const dblclickEvent = new MouseEvent("dblclick", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  element.dispatchEvent(dblclickEvent);
}

// Option B: Right-click (context menu)
function rightClick(element) {
  const contextmenuEvent = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  element.dispatchEvent(contextmenuEvent);
}

// Option C: Hold-click (for drag operations)
function holdClick(element, duration = 1000) {
  return new Promise((resolve) => {
    const mousedownEvent = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    element.dispatchEvent(mousedownEvent);
    
    setTimeout(() => {
      const mouseupEvent = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      element.dispatchEvent(mouseupEvent);
      resolve();
    }, duration);
  });
}

// ============================================================================
// SCENARIO 5: ADD VISUAL FEEDBACK
// ============================================================================

// Add this to content.js main() function for visual indicators:

function addVisualFeedback(element) {
  // Highlight clicked element with green border
  element.style.border = "3px solid #4CAF50";
  element.style.boxShadow = "0 0 10px rgba(76, 175, 80, 0.7)";
  
  // Remove highlight after 2 seconds
  setTimeout(() => {
    element.style.border = "";
    element.style.boxShadow = "";
  }, 2000);
}

// Add to humanClick() call:
/*
humanClick(button);
addVisualFeedback(button);  // Visual feedback
clickedButtons++;
*/

// ============================================================================
// SCENARIO 6: STOP AFTER X CLICKS
// ============================================================================

// Modify the processRewardButtons() loop:

/*
const MAX_CLICKS_PER_SESSION = 3;  // Stop after 3 clicks

// In the button clicking loop:
if (clickedButtons >= MAX_CLICKS_PER_SESSION) {
  console.log("⏹️  Reached maximum clicks for session");
  break;
}
*/

// ============================================================================
// SCENARIO 7: SKIP SPECIFIC BUTTON TYPES
// ============================================================================

function shouldSkipButton(button) {
  const text = button.textContent.toLowerCase();
  
  // Skip locked activities
  if (text.includes("locked") || button.hasAttribute("disabled")) {
    console.log("⏭️  Skipping locked button");
    return true;
  }
  
  // Skip expired activities
  if (text.includes("expired") || text.includes("ended")) {
    console.log("⏭️  Skipping expired button");
    return true;
  }
  
  // Skip mobile-only (unless you have mobile)
  if (text.includes("mobile only")) {
    console.log("⏭️  Skipping mobile-only button");
    return true;
  }
  
  return false;
}

// Use in loop:
/*
for (const button of targetElements) {
  if (shouldSkipButton(button)) continue;
  // ... rest of code
}
*/

// ============================================================================
// SCENARIO 8: ADD RETRY LOGIC FOR FAILED CLICKS
// ============================================================================

async function clickWithRetry(element, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      humanClick(element);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if click was successful
      if (isButtonAlreadyClicked(element)) {
        console.log(`✅ Click successful on attempt ${attempt}`);
        return true;
      }
    } catch (error) {
      console.warn(`⚠️  Attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.error("❌ All retry attempts failed");
  return false;
}

// ============================================================================
// SCENARIO 9: SEND NOTIFICATIONS
// ============================================================================

// Add to background.js to send desktop notifications:

/*
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closeTab") {
    const notification = {
      title: "Bing Rewards Auto Clicker",
      message: `Clicked ${request.clickedCount} buttons! Tab closing...`,
      iconUrl: "icon-128.png"  // Add icon file
    };
    
    chrome.notifications.create(notification);
    
    setTimeout(() => {
      chrome.tabs.remove(sender.tab.id);
    }, 2000);
  }
});
*/

// ============================================================================
// SCENARIO 10: LOG ACTIVITY TO STORAGE
// ============================================================================

// Save clicking history to Chrome storage:

function saveActivity(count) {
  chrome.storage.local.get("activity", (result) => {
    const today = new Date().toISOString().split('T')[0];
    const activity = result.activity || {};
    
    if (!activity[today]) {
      activity[today] = {
        clicks: 0,
        timestamp: new Date().toISOString(),
      };
    }
    
    activity[today].clicks += count;
    
    chrome.storage.local.set({ activity }, () => {
      console.log("📊 Activity saved:", activity);
    });
  });
}

// Add to content.js when sending closeTab message:
/*
saveActivity(clickedButtons);
*/

// ============================================================================
// SCENARIO 11: SCHEDULE EXTENSION TO RUN AT SPECIFIC TIMES
// ============================================================================

// Add to background.js for scheduling:

/*
// Run every day at 9 AM
function scheduleDaily() {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(9, 0, 0, 0);
  
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const delay = scheduledTime - now;
  
  chrome.alarms.create("dailyRun", { delayInMinutes: delay / 60000 });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyRun") {
    console.log("⏰ Running scheduled task");
    // Trigger extension
  }
});

scheduleDaily();
*/

// ============================================================================
// SCENARIO 12: MULTI-PROFILE SUPPORT
// ============================================================================

// Handle multiple Bing Rewards accounts:

/*
In manifest.json, update host_permissions:

"host_permissions": [
  "https://rewards.bing.com/*",
  "https://rewards.bing.co.uk/*",  // UK rewards
  "https://rewards.bing.com.au/*", // Australia
  "https://rewards.bing.co.in/*"   // India
]
*/

// ============================================================================
// TESTING EXAMPLES
// ============================================================================

// Test in console to verify changes:

// Test 1: Find all buttons
window.bingRewardsDebug.findButtons()

// Test 2: Check specific button
const button = document.querySelector('[aria-label*="+5"]')
console.log("Button found:", button)
console.log("Button text:", button?.textContent)
console.log("Is visible:", isElementInViewport(button))

// Test 3: Simulate click without auto-close
window.bingRewardsDebug.clickAllButtons()

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

// For slower machines, increase delays:
const CONFIG = {
  scrollDelay: 800,        // Increased
  clickDelay: 1500,        // Increased
  maxScrollAttempts: 10,
  scrollStep: 250,
};

// For faster machines, use requestAnimationFrame:
function efficientScroll(pixels) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const duration = 500;
    const startScroll = window.scrollY;
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        window.scrollY = startScroll + pixels * progress;
        requestAnimationFrame(animate);
      } else {
        window.scrollY = startScroll + pixels;
        resolve();
      }
    }
    
    requestAnimationFrame(animate);
  });
}

// ============================================================================
// END OF ADVANCED CONFIGURATION GUIDE
// ============================================================================
