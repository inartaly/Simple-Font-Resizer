const runScript = (action, delta = 0) => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && tab.url.startsWith("http")) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (act, d) => {
            const elements = document.querySelectorAll('*');
            elements.forEach(el => {
              // 1. Store the original size if we haven't yet
              if (!el.dataset.origSize) {
                el.dataset.origSize = window.getComputedStyle(el).fontSize;
              }

              if (act === 'resize') {
                let currentSize = parseFloat(window.getComputedStyle(el).fontSize);
                if (currentSize) el.style.fontSize = (currentSize + d) + "px";
              } else if (act === 'reset') {
                // 2. Restore the original size
                el.style.fontSize = el.dataset.origSize;
              }
            });
          },
          args: [action, delta]
        });
      }
    });
  });
};

document.getElementById('increase').addEventListener('click', () => runScript('resize', 2));
document.getElementById('decrease').addEventListener('click', () => runScript('resize', -2));
document.getElementById('reset').addEventListener('click', () => runScript('reset'));
