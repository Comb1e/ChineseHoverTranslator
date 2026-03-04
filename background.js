// background.js
const from = 'auto';
to = 'en';
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-floating-window") {
    // 向当前活跃标签页的 content script 发送消息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleAvailable" });
      }
    });
  }

  if (command === "translate") {
    // 向当前活跃标签页的 content script 发送翻译消息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "translate" });
      }
    });
  }

  if (command === "change-type") {
    console.log("change");
    if (to === 'en') {
      to = 'zh';
    }
    else {
      to = 'en';
    }
    // 向当前活跃标签页的 content script 发送更改目标语言消息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "changeType" ,
          to: to
        });
      }
    });
  }
});

const server_url = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'begin-translate') {
    const url = server_url + `?q=${request.q}&from=${from}&to=${to}&appid=${request.appid}&salt=${request.salt}&sign=${request.sign}`;
    console.log(url);
    fetch(url)
    .then(res => res.json())
    .then(data => {
      sendResponse({ dst: data.trans_result[0].dst });
    })
    .catch(err => {
      console.error('Translation failed:', err);
      sendResponse({ error: 'Translation failed' });
    });
    return true; // 表示异步发送响应
  }
});