const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // 1. Setup the global style element
          let styleEl = document.getElementById('simple-resizer-style');
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'simple-resizer-style';
            document.head.appendChild(styleEl);
          }

          // 2. Track offset on the root element (html)
          let currentOffset = parseInt(document.documentElement.getAttribute('data-resizer-offset') || '0');

          if (act === 'reset') {
            // TOTAL WIPE: Removes all overrides and the style tag
            document.documentElement.removeAttribute('data-resizer-offset');
            styleEl.remove();
          } else {
            currentOffset += d;
            document.documentElement.setAttribute('data-resizer-offset', currentOffset);

            // 3. APPLY: This uses 'zoom' or relative scaling which 
            // keeps the layout from overlapping like in your screenshot.
            styleEl.textContent = `
              body { 
                font-size: calc(100% + ${currentOffset}px) !important; 
              }
              /* Ensure headers and small text scale proportionally */
              h1, h2, h3, h4, h5, h6, p, span, a, div {
                font-size: inherit !important;
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
