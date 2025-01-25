/* 
   popup.js
   ========
   Improved logic with better message passing
*/

document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshBtn');
    const spinner = document.getElementById('spinner');
    const messageEl = document.getElementById('message');
    const summaryEl = document.getElementById('summary');
    const errorEl = document.getElementById('error');
    const shareContainer = document.getElementById('shareContainer');
    const shareBtn = document.getElementById('shareBtn');
    const chatContainer = document.getElementById('chatContainer');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatMessages = document.getElementById('chatMessages');
  
    let currentSummary = '';

    const startLoading = () => {
        spinner.classList.remove('hidden');
        messageEl.classList.add('hidden');
        summaryEl.classList.add('hidden');
        errorEl.classList.add('hidden');
        shareContainer.classList.add('hidden');
    };
  
    const stopLoading = () => {
        spinner.classList.add('hidden');
    };
  
    const showError = (message) => {
        errorEl.textContent = 'Error: ' + message;
        errorEl.classList.remove('hidden');
    };
  
    const summarizePage = async () => {
        startLoading();
        try {
            // Get active tab
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            // Get page text from content script
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    return document.body.innerText;
                }
            });
            
            const pageText = results[0].result;
            
            if (!pageText) {
                throw new Error('No text found on page');
            }
            
            // Send to background script for summarization
            chrome.runtime.sendMessage(
                { type: 'summarize', text: pageText },
                (response) => {
                    stopLoading();
                    if (chrome.runtime.lastError) {
                        showError(chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success) {
                        handleSummarySuccess(response.summary);
                    } else {
                        showError(response?.error || 'Unknown error occurred');
                    }
                }
            );
        } catch (err) {
            stopLoading();
            showError(err.message);
        }
    };
  
    refreshBtn.addEventListener('click', summarizePage);
  
    function showShareButton(summary) {
        shareContainer.classList.remove('hidden');
        
        shareBtn.addEventListener('click', async () => {
            // Get current tab URL
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = tab.url;
            
            // Create share text (limited to 280 chars)
            const shareText = `${summary.substring(0, 200)}... ${url}`;
            
            // Open Twitter share dialog
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            window.open(twitterUrl, '_blank');
        });
    }
  
    function handleSummarySuccess(summary) {
        currentSummary = summary;  // Store the summary
        summaryEl.textContent = summary;
        summaryEl.classList.remove('hidden');
        showShareButton(summary);
    }

    function initChat() {
        sendChatBtn.addEventListener('click', async () => {
            const userMessage = chatInput.value.trim();
            if (!userMessage) return;
            // Make a POST request to the same or new endpoint, passing userMessage.
            const response = await sendChatRequest(userMessage);
            // Display the response
            chatMessages.innerHTML += `<div class="chat-reply">${response}</div>`;
            chatInput.value = '';
        });
      
        // Show or hide the chat container as needed
        chatContainer.classList.remove('hidden');
    }
    
    async function sendChatRequest(userMessage) {
        try {
            const res = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `Context: ${currentSummary}\n\nQuestion: ${userMessage}`
                })
            });
            const data = await res.json();
            if (data.success) {
                return data.chatReply;
            } else {
                throw new Error(data.error || 'Unknown server error');
            }
        } catch (err) {
            console.error(err);
            return 'Error retrieving chat response.';
        }
    }

    initChat();
});