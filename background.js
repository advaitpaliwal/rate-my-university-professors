var toggle = false;
chrome.action.onClicked.addListener(function (tab) {
  toggle = !toggle;
  if (toggle) {
    chrome.action.setBadgeText({ text: "On" });
    chrome.action.setBadgeBackgroundColor({ color: "#4688F1" });
    chrome.tabs.sendMessage(
      tab.id,
      {
        method: "start",
      },
      function (response) {}
    );
  } else {
    chrome.action.setBadgeText({ text: "Off" });
    chrome.action.setBadgeBackgroundColor({ color: "#4688F1" });
    chrome.tabs.sendMessage(
      tab.id,
      {
        method: "stop",
      },
      function (response) {}
    );
  }
});
