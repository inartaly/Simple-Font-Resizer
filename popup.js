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
                  node.style.setProperty('font-size', (currentSize + d) + "px", 'important');const runScript = (action, delta = 0) => {
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
                // 3. Reset logic: Clear the inline style and restore original
                // Removing the property ensures '!important' from our script is gone
                node.style.removeProperty('font-size');
                node.style.fontSize = node.dataset.origSize;
                
                // Clean up the dataset so a fresh state can be captured later
                delete node.dataset.origSize;
              }

              // Dig deeper into children and Shadow DOM
              node.children && Array.from(node.children).forEach(walkDOM);
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
