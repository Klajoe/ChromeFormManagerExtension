chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveData" || message.action === "loadData") {
      sendResponse({ received: true });
    }
  });