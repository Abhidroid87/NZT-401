// ============================================================================
// CONTENT SCRIPT - Pulse-Driven Background-Ready Mode
// ============================================================================

console.log("🎯 Cool More Agent0 - Pulse Content Script Loaded");

// Configuration object
const CONFIG = {
  scrollStep: 500,
  clickDelay: 1500,
  autoCloseTimer: 20, 
};

// State tracking (Persistent across pulses)
let isRunning = false;
let sessionClickCount = 0;
let lastPulseTime = Date.now();
let hasFinishedScanning = false;
let sessionClickedKeys = new Set();
let timerElement = null;
let countdownInterval = null;
let userInteracted = false;

// ============================================================================
// MESSAGE HANDLER (C2 INTERFACE)
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    lastPulseTime = Date.now();
    
    if (request.action === "performTaskPulse") {
        // This is the main driver pulse from background.js
        handleTaskPulse();
    } else if (request.action === "heartbeat") {
        // Just keeping the script alive
    } else if (request.action === "nudge" || request.action === "start") {
        console.log("⚡ Nudge received! Starting/Resuming...");
        isRunning = true;
        handleTaskPulse();
    } else if (request.action === "stop") {
        isRunning = false;
        console.log("⏹️ Stopped by user.");
    } else if (request.action === "bgProbe") {
        sendResponse({ idleTime: Date.now() - lastPulseTime, isRunning, hasFinishedScanning });
    }
    return true;
});

// ============================================================================
// PULSE HANDLER (CORE LOGIC)
// ============================================================================

async function handleTaskPulse() {
    if (!isRunning || hasFinishedScanning) return;

    const url = window.location.href;
    const isRewardsPage = url.includes('rewards.bing.com/earn') || url.includes('rewards.bing.com/dashboard');
    
    // Auto-redirect if on dashboard
    if (url.includes('/dashboard')) {
        window.location.href = 'https://rewards.bing.com/earn';
        return;
    }

    if (!isRewardsPage) {
        handleDestinationPage();
        return;
    }

    // Step 1: Ensure 'Keep earning' is found or scroll to find it
    const earnHeader = findEarnHeader();
    if (!earnHeader) {
        console.log("🔍 Looking for 'Keep earning' section...");
        window.scrollBy(0, 800);
        return;
    }

    // Step 2: Scan for unclicked items
    const targets = findTargetElements(earnHeader);
    
    if (targets.length > 0) {
        // Click the first unclicked item
        const item = targets[0];
        const key = item.href || item.innerText || item.textContent;
        
        console.log("🖱️ Pulse Action: Clicking unvisited item...");
        
        // Background-safe interaction
        item.scrollIntoView({ behavior: 'auto', block: 'center' }); 
        humanClick(item);
        
        sessionClickedKeys.add(key);
        sessionClickCount++;
        chrome.runtime.sendMessage({ action: 'updateClicks', count: sessionClickCount }).catch(()=>{});
    } else {
        // No items in view. Scroll or finish.
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
        
        if (atBottom) {
            console.log("🏁 Reached bottom and no items found. Finishing...");
            hasFinishedScanning = true;
            finishMission();
        } else {
            console.log("📜 No items in view. Scrolling down...");
            window.scrollBy({ top: CONFIG.scrollStep, behavior: 'smooth' });
        }
    }
}

// ============================================================================
// DETECTION & ACTIONS
// ============================================================================

function findEarnHeader() {
    return Array.from(document.querySelectorAll('div, h1, h2, h3, span'))
        .find(el => {
            const t = (el.innerText || "").trim();
            return t === 'Keep earning' || (el.tagName.startsWith('H') && t.includes('Keep earning'));
        });
}

function findTargetElements(header) {
    const tiles = [];
    const headerRect = header.getBoundingClientRect();
    const headerY = window.scrollY + headerRect.top;

    function audit(root) {
        const elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elY = window.scrollY + rect.top;
            
            // Only consider elements at or below the 'Keep earning' header
            if (elY < headerY - 10) return;

            const text = (el.innerText || "").trim();
            const style = window.getComputedStyle(el);
            const bgColor = style.backgroundColor;

            // Point label detection (+5, +10, etc)
            const isPointLabel = /^\+(\s)?[0-9]+(\s)?(points|pts)?$/i.test(text);
            const isBlueButton = (el.tagName === 'BUTTON' || el.tagName === 'A') && 
                                (bgColor.includes('rgb(0, 103, 184)') || bgColor.includes('rgb(0, 120, 212)'));

            if (isPointLabel || isBlueButton) {
                const card = el.closest('mee-reward-card, [class*="card"], [class*="promo"], [role="button"], a, [class*="activity"]') || el.parentElement;
                if (!card) return;

                const cardText = (card.innerText || "").toLowerCase();
                const isCompleted = cardText.includes('✓') || cardText.includes('completed') || 
                                   card.querySelector('[class*="checkmark"], [class*="Check"], [class*="status-complete"]');
                
                const isGreen = bgColor.includes('rgb(0, 128, 0)');
                const key = (card.querySelector('a')?.href || card.innerText).trim();

                if (!isCompleted && !isGreen && !sessionClickedKeys.has(key)) {
                    const link = card.tagName === 'A' ? card : card.querySelector('a, button, [role="button"]');
                    if (link && !tiles.includes(link)) {
                        link.setAttribute('target', '_blank');
                        tiles.push(link);
                    }
                }
            }
            if (el.shadowRoot) audit(el.shadowRoot);
        });
    }

    audit(document.body);
    return tiles;
}

function humanClick(element) {
    try {
        element.click();
    } catch (e) {
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
    }
}

function handleDestinationPage() {
    const url = window.location.href;
    const isSearchRel = url.includes('bing.com/search') || 
                        url.includes('rewards.bing.com/redirect') || 
                        url.includes('edge.microsoft.com/search');
    
    if (isSearchRel && !url.includes('/earn') && !url.includes('/dashboard')) {
        console.log("🧼 Agent0: Destination page isolated. Closing in 3s...");
        setTimeout(() => {
            chrome.runtime.sendMessage({ action: 'closeTab' }).catch(() => {
                // Fallback for immediate close if extension msg fails
                window.close();
            });
        }, 3000);
    }
}

// ============================================================================
// FINALIZATION
// ============================================================================

async function finishMission() {
    chrome.runtime.sendMessage({ action: 'taskComplete' });
    
    const settings = await new Promise(resolve => chrome.storage.local.get(['autoClose'], resolve));
    if (settings.autoClose !== false) {
        createTimerUI();
        startAutoCloseTimer();
    }
}

// ============================================================================
// UI & UTILS
// ============================================================================

function createTimerUI() {
    if (timerElement) return;
    timerElement = document.createElement('div');
    timerElement.id = 'agent0-status-ui';
    timerElement.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: #111; color: #00ff00; padding: 15px; border-radius: 8px;
        border: 2px solid #00ff00; font-family: sans-serif; z-index: 10000;
        box-shadow: 0 0 15px rgba(0,255,0,0.3); pointer-events: auto;
    `;
    document.body.appendChild(timerElement);
    
    window.addEventListener('mousemove', () => { userInteracted = true; });
}

function startAutoCloseTimer() {
    let left = CONFIG.autoCloseTimer;
    countdownInterval = setInterval(() => {
        if (userInteracted) {
            timerElement.innerHTML = "🕒 Manual Mode<br><small>Ready to shut down.</small>";
            clearInterval(countdownInterval);
            return;
        }
        timerElement.innerHTML = `🏁 Mission Complete. Auto-closing in <b>${left}s</b><br><small>Move mouse to keep window open</small>`;
        if (left <= 0) {
            clearInterval(countdownInterval);
            chrome.runtime.sendMessage({ action: 'closeWindow' });
        }
        left--;
    }, 1000);
}

// Initial Kick-off
const init = async () => {
    handleDestinationPage();
    const settings = await new Promise(resolve => chrome.storage.local.get(['autoStart'], resolve));
    if (settings.autoStart !== false) {
        isRunning = true;
        handleTaskPulse();
    }
};

init();

// Export for debugging
window.agent0 = {
    getStatus: () => ({ isRunning, sessionClickCount, hasFinishedScanning }),
    forcePulse: () => handleTaskPulse()
};
