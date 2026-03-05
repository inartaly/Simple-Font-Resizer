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
                // 1. ONLY capture if we haven't stored a version yet
                if (!node.getAttribute('data-initial-font')) {
                  node.setAttribute('data-initial-font', style.fontSize);
                }

                const currentSize = parseFloat(style.fontSize);
                node.style.setProperty('font-size', (currentSize + d) + "px", 'important');
              } 
              else if (act === 'reset') {
                // 2. TRUE RESET: Remove our inline overrides entirely
                node.style.removeProperty('font-size');
                
                // If we have a saved initial value, restore it once and then clean up
                const initial = node.getAttribute('data-initial-font');
                if (initial) {
                  node.style.fontSize = initial;
                  node.removeAttribute('data-initial-font');
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
