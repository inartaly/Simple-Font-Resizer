const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // 1. Initialize a persistent offset on the body
          let offset = parseInt(document.body.getAttribute('data-resizer-offset') || '0');
          
          if (act === 'reset') {
            offset = 0;
            document.body.removeAttribute('data-resizer-offset');
          } else {
            offset += d;
            document.body.setAttribute('data-resizer-offset', offset);
          }

          const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
              
              // 2. Capture the TRUE original size ONLY if we haven't yet
              if (!node.hasAttribute('data-initial-font')) {
                const style = window.getComputedStyle(node);
                node.setAttribute('data-initial-font', style.fontSize);
              }

              if (act === 'reset') {
                // 3. THE CLEAN SLATE
                node.style.removeProperty('font-size');
                node.removeAttribute('data-initial-font');
                if (node.getAttribute('style') === '') node.removeAttribute('style');
              } else {
                // 4. APPLY: Original Home + Total Offset
                const base = parseFloat(node.getAttribute('data-initial-font'));
                node.style.setProperty('font-size', (base + offset) + "px", 'important');
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
