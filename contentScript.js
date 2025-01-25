/* 
   contentScript.js
   ===============
   Extracts the page text and makes it available for the popup
*/

// Store text when script loads
let pageText = document.body ? document.body.innerText : '';

// Listen for requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageText") {
        sendResponse({ text: pageText });
    }
    return true;
});