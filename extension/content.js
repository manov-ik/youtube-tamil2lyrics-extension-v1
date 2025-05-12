// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTitle") {
        const element = document.querySelector('yt-formatted-string.style-scope.ytd-watch-metadata');
        const title = element ? element.textContent : 'No title found';
        sendResponse({ title: title });
    }
    return true;
});

// Notify that the content script is loaded
console.log('Content script loaded');