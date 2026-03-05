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
                // 1. Capture the TRUE original only once
                if (!node.hasAttribute('data-initial-font')) {
                  node.setAttribute('data-initial-font', style.fontSize);
                }

                const currentSize = parseFloat(style.fontSize);
                node.style.setProperty('font-size', (currentSize + d) + "px", 'important');
              } 
              else if (act === 'reset') {
                // 2. Definitive Reset
                const initial = node.getAttribute('data-initial-font');
                if (initial) {
                  // Clear our inline override first
                  node.style.removeProperty('font-size');
                  // Restore the exact initial value
                  node.style.fontSize = initial;
                  // Remove tracking so it can be re-captured freshly if resized again
                  node.removeAttribute('data-initial-font');
                }

                // Clean up empty style attributes to prevent DOM clutter
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
