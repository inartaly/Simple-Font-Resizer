const runScript = (action, delta = 0) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url?.startsWith("http")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (act, d) => {
          // 1. Maintain a global offset for this specific session
          if (window.sessionOffset === undefined) window.sessionOffset = 0;

          const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
              
              // 2. THE SNAPSHOT: Save the TRUE default values once
              if (!node.hasAttribute('data-initial-font')) {
                const computedSize = window.getComputedStyle(node).fontSize;
                node.setAttribute('data-initial-font', computedSize);
              }

              if (act === 'resize') {
                // 3. Update the session offset (e.g., +2, +4, +6...)
                // We only update this once per execution, so we check if it's the first node
                if (node === document.body) {
                  window.sessionOffset += d;
                }

                // 4. Always calculate: [Snapshot Value] + [Total Session Offset]
                const baseSize = parseFloat(node.getAttribute('data-initial-font'));
                const newSize = baseSize + window.sessionOffset;
                node.style.setProperty('font-size', newSize + "px", 'important');

              } else if (act === 'reset') {
                // 5. THE RESET: Kill the session offset and clear styles
                window.sessionOffset = 0;
                node.style.removeProperty('font-size');
                
                // Optional: Restore the exact string from our snapshot for instant snap-back
                node.style.fontSize = node.getAttribute('data-initial-font');
                
                // Wipe the snapshot so it can be re-homed if the page changes
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
