const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // 1. Maintain a persistent offset for this page session
          if (window.totalOffset === undefined) window.totalOffset = 0;

          const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
              
              // 2. SNAPSHOT: Capture the 'Home' position only once
              if (!node.hasAttribute('data-initial-font')) {
                const computed = window.getComputedStyle(node).fontSize;
                node.setAttribute('data-initial-font', computed);
              }

              if (act === 'resize') {
                // Update offset only once per script execution
                if (node === document.body) window.totalOffset += d;

                // 3. MATH: Baseline + Total Offset (No compounding errors)
                const base = parseFloat(node.getAttribute('data-initial-font'));
                node.style.setProperty('font-size', (base + window.totalOffset) + "px", 'important');
              } 
              else if (act === 'reset') {
                // 4. RESET: Kill the offset and strip the overrides
                window.totalOffset = 0;
                node.style.removeProperty('font-size');
                node.removeAttribute('data-initial-font');
                if (node.getAttribute('style') === '') node.removeAttribute('style');
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
