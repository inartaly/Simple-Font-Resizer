const runScript = (action, delta = 0) => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      // Only run on actual websites
      if (tab.url && tab.url.startsWith("http")) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (act, d) => {
            // Target specific text-bearing tags to avoid breaking layout containers
            const elements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, li, a, b, i, label');
            
            elements.forEach(el => {
              // 1. Store the original size if we haven't yet
              if (!el.dataset.origSize) {
                el.dataset.origSize = window.getComputedStyle(el).fontSize;
              }

              if (act === 'resize') {
                const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
                if (currentSize) {
                  // Incremental change: adds or subtracts from the REAL current size
                  el.style.setProperty('font-size', (currentSize + d) + "px", 'important');
                }
              } else if (act === 'reset') {
                // 2. Restore the original captured size
                el.style.fontSize = el.dataset.origSize;
              }
            });
          },
          args: [action, delta]
        });
      }
    });
  });
};

// Event Listeners for your popup buttons
document.getElementById('increase').addEventListener('click', () => runScript('resize', 2));
document.getElementById('decrease').addEventListener('click', () => runScript('resize', -2));
document.getElementById('reset').addEventListener('click', () => runScript('reset'));
