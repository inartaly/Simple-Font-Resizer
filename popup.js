const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
              const style = window.getComputedStyle(node);

              // 1. Capture original size ONLY if we haven't already
              if (!node.dataset.origSize) {
                node.dataset.origSize = style.fontSize;
              }

              if (act === 'resize') {
                // 2. Adjust size
                const currentSize = parseFloat(style.fontSize);
                node.style.setProperty('font-size', (currentSize + d) + "px", 'important');
              } else {
                // 3. Reset logic
                node.style.removeProperty('font-size');
                if (node.dataset.origSize) {
                  node.style.fontSize = node.dataset.origSize;
                  delete node.dataset.origSize;
                }
              }

              // 4. Recursively walk through children AND Shadow DOM
              if (node.children) {
                Array.from(node.children).forEach(walkDOM);
              }
              if (node.shadowRoot) {
                Array.from(node.shadowRoot.children).forEach(walkDOM);
              }
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
