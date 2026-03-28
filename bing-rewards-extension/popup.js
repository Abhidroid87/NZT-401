// ============================================================================
// POPUP SCRIPT - Handles UI interactions and status updates
// ============================================================================

console.log("📱 Cool More Agent0 - Popup Script Loaded");

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusBadge = document.getElementById('statusBadge');
const clickCount = document.getElementById('clickCount');
const todayCount = document.getElementById('todayCount');
const autoStartCheckbox = document.getElementById('autoStart');
const autoCloseCheckbox = document.getElementById('autoClose');
const clickDelayInput = document.getElementById('clickDelay');
const maxPointsInput = document.getElementById('maxPoints');
const settingsBtn = document.getElementById('settingsBtn');
const clearBtn = document.getElementById('clearBtn');
const activityLog = document.getElementById('activityLog');

let isRunning = false;
let sessionClickCount = 0;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Popup DOM Loaded");
    
    // Load settings from storage
    loadSettings();
    
    // Attach event listeners
    attachEventListeners();
    
    // Load activity log
    loadActivityLog();
    
    // Check current status
    updateStatus();
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function attachEventListeners() {
    // Control buttons
    startBtn.addEventListener('click', handleStart);
    stopBtn.addEventListener('click', handleStop);
    
    // Settings
    autoStartCheckbox.addEventListener('change', saveSettings);
    autoCloseCheckbox.addEventListener('change', saveSettings);
    clickDelayInput.addEventListener('change', saveSettings);
    maxPointsInput.addEventListener('change', saveSettings);
    
    // Action buttons
    settingsBtn.addEventListener('click', handleSettingsClick);
    clearBtn.addEventListener('click', handleClearLog);
    
    console.log("✅ Event listeners attached");
}

// ============================================================================
// BUTTON HANDLERS
// ============================================================================

function handleStart() {
    console.log("▶️  Start button clicked");
    
    // Disable start, enable stop
    startBtn.disabled = true;
    stopBtn.disabled = false;
    isRunning = true;
    
    // Update status
    setStatus('running');
    addActivityLog('✅ Extension started', 'success');
    
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'start' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("⚠️  Could not reach content script");
                    addActivityLog('⚠️  Navigate to rewards.bing.com', 'warning');
                }
            });
        }
    });
}

function handleStop() {
    console.log("⏹️  Stop button clicked");
    
    // Enable start, disable stop
    startBtn.disabled = false;
    stopBtn.disabled = true;
    isRunning = false;
    
    // Update status
    setStatus('inactive');
    addActivityLog('⏹️  Extension stopped', 'warning');
    
    // Send stop message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'stop' });
        }
    });
}

function handleSettingsClick() {
    console.log("⚙️  Settings clicked");
    addActivityLog('⚙️  Settings opened', 'success');
    // Settings are already visible - just log
}

function handleClearLog() {
    console.log("🗑️  Clear log clicked");
    activityLog.innerHTML = '<p class="empty-state">No activity yet</p>';
    sessionClickCount = 0;
    clickCount.textContent = '0';
    
    // Clear from storage
    chrome.storage.local.set({ activityLog: [] });
    addActivityLog('🗑️  Log cleared', 'success');
}

// ============================================================================
// STATUS MANAGEMENT
// ============================================================================

function setStatus(status) {
    console.log(`📊 Status changed to: ${status}`);
    
    if (status === 'inactive') {
        statusBadge.textContent = 'Inactive';
        statusBadge.className = 'status-badge';
    } else if (status === 'active') {
        statusBadge.textContent = 'Active';
        statusBadge.className = 'status-badge active';
    } else if (status === 'running') {
        statusBadge.textContent = 'Running';
        statusBadge.className = 'status-badge running';
    }
}

function updateStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.includes('rewards.bing.com')) {
            setStatus('active');
        } else {
            setStatus('inactive');
        }
    });
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

function addActivityLog(message, type = 'info') {
    console.log(`📋 ${message}`);
    
    // Clear empty state
    if (activityLog.querySelector('.empty-state')) {
        activityLog.innerHTML = '';
    }
    
    // Create log item
    const logItem = document.createElement('div');
    logItem.className = `activity-item ${type}`;
    
    const time = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    logItem.innerHTML = `
        <span>${message}</span>
        <span class="activity-time">${time}</span>
    `;
    
    // Add to log (new items at top)
    activityLog.insertBefore(logItem, activityLog.firstChild);
    
    // Keep only last 10 items
    const items = activityLog.querySelectorAll('.activity-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
    
    // Save to storage
    saveActivityLog(message, type, time);
}

function loadActivityLog() {
    chrome.storage.local.get(['activityLog'], (result) => {
        if (result.activityLog && result.activityLog.length > 0) {
            activityLog.innerHTML = '';
            result.activityLog.slice(-10).forEach(entry => {
                const logItem = document.createElement('div');
                logItem.className = `activity-item ${entry.type}`;
                logItem.innerHTML = `
                    <span>${entry.message}</span>
                    <span class="activity-time">${entry.time}</span>
                `;
                activityLog.appendChild(logItem);
            });
        }
    });
}

function saveActivityLog(message, type, time) {
    chrome.storage.local.get(['activityLog'], (result) => {
        const log = result.activityLog || [];
        log.push({ message, type, time });
        
        // Keep last 50 entries
        if (log.length > 50) {
            log.shift();
        }
        
        chrome.storage.local.set({ activityLog: log });
    });
}

// ============================================================================
// SETTINGS
// ============================================================================

function loadSettings() {
    chrome.storage.local.get(
        {
            autoStart: false,
            autoClose: true,
            clickDelay: 1000,
            maxPoints: 999
        },
        (result) => {
            autoStartCheckbox.checked = result.autoStart;
            autoCloseCheckbox.checked = result.autoClose;
            clickDelayInput.value = result.clickDelay;
            maxPointsInput.value = result.maxPoints;
            
            console.log("✅ Settings loaded:", result);
        }
    );
}

function saveSettings() {
    const settings = {
        autoStart: autoStartCheckbox.checked,
        autoClose: autoCloseCheckbox.checked,
        clickDelay: parseInt(clickDelayInput.value),
        maxPoints: parseInt(maxPointsInput.value)
    };
    
    chrome.storage.local.set(settings, () => {
        console.log("💾 Settings saved:", settings);
        addActivityLog('💾 Settings saved', 'success');
    });
}

// ============================================================================
// MESSAGE HANDLING FROM CONTENT SCRIPT
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📨 Message received:", request);
    
    if (request.action === 'updateClicks') {
        sessionClickCount = request.count;
        clickCount.textContent = request.count;
        addActivityLog(`🖱️  Clicked ${request.count} buttons`, 'success');
    } else if (request.action === 'log') {
        addActivityLog(request.message, request.type || 'info');
    } else if (request.action === 'complete') {
        setStatus('active');
        stopBtn.disabled = true;
        startBtn.disabled = false;
        addActivityLog('✅ Collection complete!', 'success');
    }
    
    sendResponse({ received: true });
});

// ============================================================================
// PERIODIC STATUS UPDATE
// ============================================================================

setInterval(() => {
    updateStatus();
}, 1000);

console.log("✅ Popup script ready");
