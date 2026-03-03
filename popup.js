const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // Recursive function to find ALL elements, even in Shadow DOMs
          const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
              const style = window.getComputedStyle(node);
              
              // Only adjust if the element actually has text content directly
              if (node.childNodes.length > 0) {
                if (!node.dataset.origSize) {
                  node.dataset.origSize = style.fontSize;
                }

                if (act === 'resize') {
                  const currentSize = parseFloat(style.fontSize);
                  node.style.setProperty('font-size', (currentSize + d) + "px", 'important');
                } else {
                  node.style.fontSize = node.dataset.origSize;
                }
              }
              
              // Dig deeper into children
              node.children && Array.from(node.children).forEach(walkDOM);
              // Dig into Shadow DOM if it exists
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
