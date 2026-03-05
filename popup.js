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
                // Capture original only if not already stored
                if (!node.hasAttribute('data-initial-font')) {
                  node.setAttribute('data-initial-font', style.fontSize);
                }

                const currentSize = parseFloat(style.fontSize);
                // Apply new size with !important to ensure it takes effect
                node.style.setProperty('font-size', (currentSize + d) + "px", 'important');
              } 
              else if (act === 'reset') {
                // THE FIX: Completely remove our overrides
                node.style.removeProperty('font-size');
                
                // If the style attribute is now empty, remove it to prevent "weird" CSS ghosting
                if (node.getAttribute('style') === '') {
                  node.removeAttribute('style');
                }
                
                // Clear the tracking attribute so we can start fresh
                node.removeAttribute('data-initial-font');
              }

              // Recursion for children and Shadow DOM (based on your latest commit)
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
