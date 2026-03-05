const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // 1. Setup/Find our custom style tag
          let styleEl = document.getElementById('simple-resizer-style');
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'simple-resizer-style';
            document.head.appendChild(styleEl);
          }

          // 2. Track the offset on the html tag so it persists while the tab is open
          let currentOffset = parseInt(document.documentElement.getAttribute('data-resizer-offset') || '0');

          if (act === 'reset') {
            currentOffset = 0;
            document.documentElement.removeAttribute('data-resizer-offset');
            styleEl.remove(); // The "Nuclear" reset - site returns to 100% factory defaults
          } else {
            currentOffset += d;
            document.documentElement.setAttribute('data-resizer-offset', currentOffset);

            // 3. THE LOGIC: We shift the base 'rem' unit. 
            // This scales everything (text, padding, margins) proportionally.
            styleEl.textContent = `
              html { 
                font-size: calc(100% + ${currentOffset}px) !important; 
              }
            `;
          }
        },
        args: [action, delta]
      });
    }
  });
};

document.getElementById('increase').addEventListener('click', () => runScript('resize', 2));
document.getElementById('decrease').addEventListener('click', () => runScript('resize', -2));
document.getElementById('reset').addEventListener('click', () => runScript('reset'));
