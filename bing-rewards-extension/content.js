// ============================================================================
// CONTENT SCRIPT - Runs on Bing Rewards page
// ============================================================================

console.log("🎯 Cool More Agent0 - Content Script Loaded");

// Configuration object
const CONFIG = {
  scrollStep: 450,
  scrollDelay: 1200,
  clickDelay: 2500,
  autoCloseTimer: 30, // Seconds to wait before auto-closing
};

// State tracking
let isRunning = false;
let userInteracted = false;
let sessionClickCount = 0;
let lastActivityTime = Date.now();
let timerElement = null;
let countdownInterval = null;

// ============================================================================
// TAB MANAGEMENT (SELF-DESTRUCT DESTINATION TABS)
// ============================================================================

function handleDestinationPage() {
    const url = window.location.href;
    const isSearchResult = url.includes('bing.com/search') || url.includes('bing.com/search?q=') || url.includes('edge.microsoft.com/search');
    const isRewardRedirect = url.includes('rewards.bing.com/redirect');
    const isRewardsPage = url.includes('rewards.bing.com/earn') || url.includes('rewards.bing.com/dashboard');

    if ((isSearchResult || isRewardRedirect) && !isRewardsPage) {
        console.log("🧼 Agent0: Destination page. Self-destructing in 4 seconds...");
        setTimeout(() => {
            chrome.runtime.sendMessage({ action: 'closeTab' });
        }, 4000);
    }
}

// ============================================================================
// TIMER AND INTERACTION UI
// ============================================================================

function createTimerUI() {
  if (timerElement) return;

  timerElement = document.createElement('div');
  timerElement.id = 'bing-auto-timer';
  timerElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.85);
    color: #00ff00;
    padding: 15px 20px;
    border-radius: 10px;
    z-index: 100000;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    border: 2px solid #00ff00;
    pointer-events: auto;
    cursor: default;
    min-width: 180px;
    display: none;
  `;

  document.body.appendChild(timerElement);

  const stopOnActivity = () => {
    if (!userInteracted) {
      userInteracted = true;
      if (countdownInterval) clearInterval(countdownInterval);
      timerElement.style.borderColor = '#ffcc00';
      timerElement.style.color = '#ffcc00';
      timerElement.innerHTML = '🕒 Manual Mode<br><small>Timer Paused (User Active)</small>';
    }
  };

  window.addEventListener('mousemove', stopOnActivity);
  window.addEventListener('keydown', stopOnActivity);
  window.addEventListener('scroll', stopOnActivity);
}

function updateTimerDisplay(seconds) {
  if (!timerElement || userInteracted) return;
  timerElement.style.display = 'block';
  timerElement.innerHTML = `🏁 Auto-Closing in...<br><strong style="font-size: 24px;">${seconds}s</strong><br><small>Move mouse to stop</small>`;
}

async function startAutoCloseTimer() {
  if (userInteracted) return;
  
  let timeLeft = CONFIG.autoCloseTimer;
  updateTimerDisplay(timeLeft);
  
  return new Promise((resolve) => {
    countdownInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        chrome.runtime.sendMessage({ action: 'closeWindow' });
        resolve();
      }
      
      if (userInteracted) {
        clearInterval(countdownInterval);
        resolve();
      }
    }, 1000);
  });
}

// ============================================================================
// STRICT DETECTION
// ============================================================================

function findTargetElements() {
  const tiles = [];
  const visited = new Set();
  
  const allDivs = Array.from(document.querySelectorAll('div, h1, h2, h3, span'));
  const earnHeader = allDivs.find(el => {
    const t = (el.innerText || "").trim();
    return t === 'Keep earning' || (el.tagName.startsWith('H') && t.includes('Keep earning'));
  });
  
  if (!earnHeader) return [];
  
  const headerRect = earnHeader.getBoundingClientRect();
  const headerY = window.scrollY + headerRect.top;

  function audit(root) {
    if (!root) return;
    
    const elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
    elements.forEach(el => {
        if (visited.has(el)) return;
        visited.add(el);

        const text = (el.innerText || "").trim();
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;

        const rect = el.getBoundingClientRect();
        const elY = window.scrollY + rect.top;
        if (elY < headerY - 5) return;

        const isPointLabel = /^\+(\s)?[0-9]+(\s)?(points|pts)?$/i.test(text) || (/^([0-9]+)$/.test(text) && text.length < 5);
        const isBlueButton = (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button') && 
                            (bgColor.includes('rgb(0, 103, 184)') || bgColor.includes('rgb(0, 120, 212)'));

        if (isPointLabel || isBlueButton) {
            const card = el.closest('mee-reward-card, [class*="card"], [class*="promo"], [role="button"], a, [class*="activity"]') || el.parentElement;
            if (!card) return;

            const cardText = (card.innerText || "").toLowerCase();
            const isCompleted = cardText.includes('✓') || cardText.includes('completed') || 
                               card.querySelector('[class*="checkmark"], [class*="Check"], [class*="status-complete"]');
            
            const isGreen = bgColor.includes('rgb(0, 128, 0)') || bgColor.includes('rgba(0, 128, 0)');

            if (!isCompleted && !isGreen) {
                const link = card.tagName === 'A' ? card : card.querySelector('a, button, [role="button"]');
                if (link && !tiles.includes(link)) {
                    const cardRect = card.getBoundingClientRect();
                    if (window.scrollY + cardRect.top >= headerY - 5) {
                        link.setAttribute('target', '_blank');
                        tiles.push(link);
                    }
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
    lastActivityTime = Date.now();
    return true;
  } catch (e) {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    lastActivityTime = Date.now();
    return true;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(force = false) {
  if (isRunning) return;
  
  handleDestinationPage();
  const url = window.location.href;
  const isRewardsPage = url.includes('rewards.bing.com/earn') || url.includes('rewards.bing.com/dashboard');
  if (!isRewardsPage) return;

  if (!force) {
    const settings = await new Promise(resolve => {
      chrome.storage.local.get(['autoStart'], resolve);
    });
    if (settings.autoStart === false) return;
  }

  if (url.includes('/dashboard')) {
    window.location.href = 'https://rewards.bing.com/earn';
    return;
  }

  isRunning = true;
  let clickedThisSession = 0;
  const sessionClickedKeys = new Set();
  
  console.log("🚀 Agent0 Background-Ready Mode: Initializing...");
  await sleep(4000); 

  // Locate the 'Keep earning' section
  let foundHeader = false;
  let scrollAttempts = 0;
  while (!foundHeader && scrollAttempts < 15) {
    const header = Array.from(document.querySelectorAll('div, h1, h2, h3, span')).find(el => (el.innerText || "").trim() === 'Keep earning');
    if (header) {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        await sleep(1500);
        foundHeader = true;
    } else {
        window.scrollBy({ top: 600, behavior: 'smooth' });
        await sleep(1000);
        scrollAttempts++;
    }
  }

  if (!foundHeader) {
      isRunning = false;
      return;
  }

  // Continuous Scan Loop
  let currentPos = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight + 1000;

  while (currentPos < maxScroll) {
      const found = findTargetElements();
      for (const item of found) {
          const key = item.href || item.innerText || item.textContent;
          if (sessionClickedKeys.has(key)) continue;

          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await sleep(800);
          humanClick(item);
          
          sessionClickedKeys.add(key);
          clickedThisSession++;
          sessionClickCount++;
          lastActivityTime = Date.now();
          
          chrome.runtime.sendMessage({ action: 'updateClicks', count: sessionClickCount }).catch(()=>{});
          await sleep(CONFIG.clickDelay);
      }
      
      window.scrollBy({ top: CONFIG.scrollStep, behavior: 'smooth' });
      await sleep(CONFIG.scrollDelay);
      currentPos = window.scrollY;
      if (currentPos >= document.documentElement.scrollHeight - window.innerHeight - 50) break;
  }

  // Final verification sweep
  console.log("🧐 Final verification sweep...");
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await sleep(1500);
  const header = Array.from(document.querySelectorAll('div, h1, h2, h3, span')).find(el => (el.innerText || "").trim() === 'Keep earning');
  if (header) {
    header.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await sleep(2000);
    const finalFound = findTargetElements();
    if (finalFound.length === 0 || clickedThisSession > 0) {
        const settings = await new Promise(resolve => {
          chrome.storage.local.get(['autoClose'], resolve);
        });

        if (settings.autoClose !== false) {
          createTimerUI();
          timerElement.style.display = 'block';
          timerElement.innerHTML = `🏁 <strong>Mission Accomplished</strong><br>Agent0 verified state.<br><small>Ready to shut down.</small>`;
          await sleep(2000);
          await startAutoCloseTimer();
        }
    }
  }
  
  isRunning = false;
}

// Background Listener (HEARTBEAT & NUDGE)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "heartbeat") {
        // Heartbeat received - prevent throttling
        lastActivityTime = Date.now();
    } else if (request.action === "bgProbe") {
        sendResponse({ idleTime: Date.now() - lastActivityTime });
    } else if (request.action === "nudge") {
        console.log("⚡ Received background nudge! Resuming scan...");
        main(true);
    } else if (request.action === "start") {
        main(true);
        sendResponse({ status: "started" });
    }
    return true;
});

main();

window.bingRewardsDebug = {
  findButtons: () => findTargetElements(),
  getStatus: () => ({ isRunning, sessionClickCount, userInteracted, idle: Date.now() - lastActivityTime }),
};
