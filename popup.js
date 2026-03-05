const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
              
              if (act === 'resize') {
                const style = window.getComputedStyle(node);
                
                // 1. Capture the TRUE original only if we don't have it yet
                if (!node.hasAttribute('data-initial-font')) {
                  node.setAttribute('data-initial-font', style.fontSize);
                }

                // 2. Always calculate based on the current computed style to avoid "jumps"
                const currentSize = parseFloat(style.fontSize);
                node.style.setProperty('font-size', (currentSize + d) + "px", 'important');
              } 
              else if (act === 'reset') {
                // 3. COMPLETE PURGE
                // Remove the inline override
                node.style.removeProperty('font-size');
                
                // If we have a saved initial value, we can explicitly set it back 
                // to ensure the layout snaps back immediately
                const initial = node.getAttribute('data-initial-font');
                if (initial) {
                  node.style.fontSize = initial;
                }

                // Remove the tracking attribute so the NEXT resize starts from a fresh capture
                node.removeAttribute('data-initial-font');

                // Clean up empty style attributes
                if (node.getAttribute('style') === '') {
                  node.removeAttribute('style');
                }
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
