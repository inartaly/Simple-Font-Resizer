const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // 1. Reset the "session" offset if we are starting fresh after a reset
          if (!document.body.hasAttribute('data-font-offset')) {
            window.sessionOffset = 0;
          }

          // 2. Update the tracking offset
          if (act === 'reset') {
            window.sessionOffset = 0;
            document.body.removeAttribute('data-font-offset');
          } else {
            window.sessionOffset = (window.sessionOffset || 0) + d;
            document.body.setAttribute('data-font-offset', window.sessionOffset);
          }

          const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
              
              // 3. Capture original baseline ONLY once
              if (!node.hasAttribute('data-initial-font')) {
                const style = window.getComputedStyle(node);
                node.setAttribute('data-initial-font', style.fontSize);
              }

              if (act === 'reset') {
                // 4. THE CLEAN SLATE: Revert to site defaults
                node.style.removeProperty('font-size');
                node.removeAttribute('data-initial-font');
                if (node.getAttribute('style') === '') node.removeAttribute('style');
              } else {
                // 5. APPLY: Baseline + Session Offset (stops the jumping)
                const initialSize = parseFloat(node.getAttribute('data-initial-font'));
                const newSize = initialSize + window.sessionOffset;
                node.style.setProperty('font-size', newSize + "px", 'important');
              }

              // Recursion for children and Shadow DOM
              if (node.children) Array.from(node.children).forEach(walkDOM);
              if (node.shadowRoot) Array.from(node.shadowRoot.children).forEach(walkDOM);
            }
          };
          walkDOM(document.body);
        },
        args: [action, delta]
      });
    }
  });
};

document.getElementById('increase').addEventListener('click', () => runScript('resize', 2));
document.getElementById('decrease').addEventListener('click', () => runScript('resize', -2));
document.getElementById('reset').addEventListener('click', () => runScript('reset'));
