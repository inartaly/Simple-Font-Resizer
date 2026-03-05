const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // 1. Create or Update the Global CSS Variable
          let styleEl = document.getElementById('font-resizer-style');
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'font-resizer-style';
            document.head.appendChild(styleEl);
          }

          // 2. Track the offset on the html element
          let currentOffset = parseInt(document.documentElement.getAttribute('data-font-offset') || '0');
          
          if (act === 'reset') {
            currentOffset = 0;
            document.documentElement.removeAttribute('data-font-offset');
            styleEl.textContent = ''; // Clear all overrides
          } else {
            currentOffset += d;
            document.documentElement.setAttribute('data-font-offset', currentOffset);
            
            // 3. THE MAGIC: This one rule forces EVERY element to shift 
            // relative to its own natural size.
            styleEl.textContent = `
              * { 
                font-size: calc(1em + ${currentOffset}px) !important; 
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
