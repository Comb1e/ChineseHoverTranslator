// background.js
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-floating-window") {
      // 向当前活跃标签页的 content script 发送消息
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "toggleAvailable" });
        }
      });
    }
  });