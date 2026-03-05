const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // Track the total offset globally within this execution context
          window.fontResizerOffset = (window.fontResizerOffset || 0) + d;

          const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
              
              // 1. Capture the TRUE original only if we don't have it yet
              if (!node.hasAttribute('data-initial-font')) {
                const style = window.getComputedStyle(node);
                node.setAttribute('data-initial-font', style.fontSize);
              }

              const initialSize = parseFloat(node.getAttribute('data-initial-font'));

              if (act === 'resize') {
                // 2. Always calculate from the INITIAL baseline + total offset
                const newSize = initialSize + window.fontResizerOffset;
                node.style.setProperty('font-size', newSize + "px", 'important');
              } 
              else if (act === 'reset') {
                // 3. COMPLETE RESET
                window.fontResizerOffset = 0; // Reset the global offset
                node.style.removeProperty('font-size');
                
                // Restore the exact initial string (px, rem, etc.)
                node.style.fontSize = node.getAttribute('data-initial-font');
                
                // Clean up tracking so it can be re-homed if needed
                node.removeAttribute('data-initial-font');
                if (node.getAttribute('style') === '') {
                  node.removeAttribute('style');
                }
              }

              // Shadow DOM and Children recursion
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
