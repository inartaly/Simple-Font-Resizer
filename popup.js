const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // 1. Get or initialize the global offset on the body
          let currentOffset = parseInt(document.body.getAttribute('data-font-offset') || '0');
          
          if (act === 'reset') {
            currentOffset = 0;
            document.body.removeAttribute('data-font-offset');
          } else {
            currentOffset += d;
            document.body.setAttribute('data-font-offset', currentOffset);
          }

          const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
              
              // 2. Capture the TRUE original baseline
              if (!node.hasAttribute('data-initial-font')) {
                const style = window.getComputedStyle(node);
                node.setAttribute('data-initial-font', style.fontSize);
              }

              if (act === 'reset') {
                // 3. THE CLEAN SLATE: Remove all our custom fingerprints
                node.style.removeProperty('font-size');
                node.removeAttribute('data-initial-font');
                if (node.getAttribute('style') === '') node.removeAttribute('style');
              } else {
                // 4. APPLY: Initial + current total offset
                const initialSize = parseFloat(node.getAttribute('data-initial-font'));
                node.style.setProperty('font-size', (initialSize + currentOffset) + "px", 'important');
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
