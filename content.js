(() => {
// Prevent repeated injection
if (window.hasFloatingWindowInjected) {
  return;
}
window.hasFloatingWindowInjected = true;

let floatingWindow = null;
let windowAvailable = false;

function createFloatingWindow() {
  if (!document.body) {
    setTimeout(createFloatingWindow, 100);
    return;
  }
  if (floatingWindow && floatingWindow.parentNode && windowAvailable) {
    // Existing, direct display
    floatingWindow.style.display = 'block';
    return;
  }
}

// Create a suspended window element
floatingWindow = document.createElement('div');
floatingWindow.id = 'my-floating-window';

floatingWindow.innerHTML = `
  <div id="floating-header" style="cursor: move; padding: 8px; background: #4A90E2; color: white; font-weight: bold;">
    💬 Translator(Auto->英)
    <span id="close-btn" style="float: right; cursor: pointer;">×</span>
  </div>
  <div id="floating-content" style="padding: 12px; background: #f9f9f9; border: 1px solid #ddd;">

  </div>
  <div id="dst-content" style="padding: 12px; background: #f9f9f9; border: 1px solid #ddd;">

  </div>
`;

// Add to page
document.body.appendChild(floatingWindow);
floatingWindow.style.display = 'none';

// close button
document.getElementById('close-btn').addEventListener('click', () => {
  floatingWindow.style.display = 'none';
});

const header = document.getElementById('floating-header');

/* Drag function

// Drag and drop logic
let isDragging = false;
let offsetX, offsetY;

header.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - floatingWindow.getBoundingClientRect().left;
  offsetY = e.clientY - floatingWindow.getBoundingClientRect().top;
  floatingWindow.style.opacity = '0.9';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;
  // Limit within viewport (simple handling)
  floatingWindow.style.left = Math.max(0, x) + 'px';
  floatingWindow.style.top = Math.max(0, y) + 'px';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  floatingWindow.style.opacity = '1';
});
*/

function closeFloatingWindow() {
  floatingWindow.style.display = 'none';
}

function toggleFloatingWindow() {
  if ((floatingWindow && floatingWindow.style.display !== 'none') || !windowAvailable) {
    floatingWindow.style.display = 'none';
  } else {
    createFloatingWindow();
  }
}

function toggleAvailable() {
  windowAvailable = !windowAvailable;
}

const textContentDiv = document.getElementById('floating-content');
const dstContentDiv = document.getElementById('dst-content');
const headerContentDiv = document.getElementById('floating-header');

const selection = window.getSelection();

document.addEventListener('selectionchange', () => {
  dstContentDiv.innerHTML = "";
  const text = selection.toString().trim();
  textContentDiv.innerHTML = text;
  if (text) {
    setPositionChange();
    createFloatingWindow();
  }
  else {
    closeFloatingWindow();
  }
});

function setPositionChange() {
  if (selection == null) {
    return;
  }
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (selection.rangeCount > 0) {
    floatingWindow.style.left = Math.max(0, rect.right) + 'px';
    floatingWindow.style.top = Math.max(0, rect.bottom) + 'px';
  }
}

window.addEventListener('scroll', setPositionChange, { passive: true });
window.addEventListener('resize', setPositionChange);

const appid = '20260302002564116';
const api_key = 'iOCUyBZOBivPzXdAmILD';
const salt = Date.now().toString();

function generateSign(text) {
  const str = appid + text + salt + api_key;
  return MD5(str);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "toggleAvailable": {
      toggleAvailable();
      toggleFloatingWindow();
      break;
    }
    case "translate": {
      const text = selection.toString().trim();
      if (text) {
        const sign = generateSign(text);
        const q = encodeURIComponent(text);
        chrome.runtime.sendMessage({
          action: 'begin-translate',
          q: q,
          appid: appid,
          salt: salt,
          sign: sign,
          api_key: api_key,
        },
        (response) => {
          dstContentDiv.innerHTML = response.dst;
        });
      }
      break;
    }
    case "changeType": {
      switch (request.to) {
        case "zh": {
          headerContentDiv.innerHTML = "💬 Translator(Auto->中)";
          break;
        }
        case "en": {
          headerContentDiv.innerHTML = "💬 Translator(Auto->英)";
          break;
        }
        default: {
          headerContentDiv.innerHTML = "💬 Translator(Auto->?)";
          break;
        }
      }
      break;
    }
    default: {
      break;
    }
  }
});

})();