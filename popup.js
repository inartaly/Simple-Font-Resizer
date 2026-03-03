const resize = (delta) => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      // Skip internal chrome:// pages
      if (tab.url && tab.url.startsWith("http")) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (d) => {
            // Adjust the zoom level of the body
            let currentSize = parseFloat(window.getComputedStyle(document.body).fontSize);
            document.body.style.fontSize = (currentSize + d) + "px";
          },
          args: [delta]
        });
      }
    });
  });
};

document.getElementById('increase').addEventListener('click', () => resize(2));
document.getElementById('decrease').addEventListener('click', () => resize(-2));
