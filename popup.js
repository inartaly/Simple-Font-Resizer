const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          const walkDOM = (node) => {
            // 1. Process the current element
            if (node.nodeType === 1) { 
              const style = window.getComputedStyle(node);
              
              if (!node.hasAttribute('data-initial-font')) {
                node.setAttribute('data-initial-font', style.fontSize);
              }

              if (act === 'resize') {
                const initial = parseFloat(node.getAttribute('data-initial-font'));
                // Use a persistent offset to avoid math drift
                node.style.setProperty('font-size', (initial + d) + "px", 'important');
              } else {
                node.style.removeProperty('font-size');
                node.removeAttribute('data-initial-font');
              }

              // 2. REACH INTO SHADOW DOM
              // This is why elements were being skipped before
              if (node.shadowRoot) {
                Array.from(node.shadowRoot.childNodes).forEach(walkDOM);
              }
            }

            // 3. Continue to children
            node.childNodes.forEach(walkDOM);
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
