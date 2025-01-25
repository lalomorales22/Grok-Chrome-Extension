/* 
   popup.js
   ========
   Improved logic with better message passing
*/
// This is a multi-line comment describing the file.

// 1. Event listener for DOMContentLoaded - a method that listens for the DOM to fully load.
document.addEventListener('DOMContentLoaded', () => {
    // 2. Variables that reference HTML elements by their IDs.
    const refreshBtn = document.getElementById('refreshBtn');     // Variable
    const spinner = document.getElementById('spinner');           // Variable
    const messageEl = document.getElementById('message');         // Variable
    const summaryEl = document.getElementById('summary');         // Variable
    const errorEl = document.getElementById('error');             // Variable
    const shareContainer = document.getElementById('shareContainer'); // Variable
    const shareBtn = document.getElementById('shareBtn');         // Variable
    const chatContainer = document.getElementById('chatContainer');   // Variable
    const chatInput = document.getElementById('chatInput');       // Variable
    const sendChatBtn = document.getElementById('sendChatBtn');   // Variable
    const chatMessages = document.getElementById('chatMessages'); // Variable
  
    // 3. A variable to store the current summary text.
    let currentSummary = '';

    // 4. startLoading function - shows a spinner and hides other elements.
    const startLoading = () => {
        spinner.classList.remove('hidden');    // Method call on DOM element
        messageEl.classList.add('hidden');     // Method call on DOM element
        summaryEl.classList.add('hidden');     // Method call on DOM element
        errorEl.classList.add('hidden');       // Method call on DOM element
        shareContainer.classList.add('hidden'); // Method call on DOM element
    };
  
    // 5. stopLoading function - hides the spinner.
    const stopLoading = () => {
        spinner.classList.add('hidden'); // Method call on DOM element
    };
  
    // 6. showError function - displays an error message.
    const showError = (message) => {
        errorEl.textContent = 'Error: ' + message; // Setting DOM element text content
        errorEl.classList.remove('hidden');        // Method call on DOM element
    };
  
    // 7. summarizePage function - main logic to get page text and request a summary.
    const summarizePage = async () => {
        startLoading(); // Function call
        try {
            // 7.a. Query to get the active tab (Chrome extension API call).
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            // 7.b. Executes a script in the current tab to retrieve page text.
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    return document.body.innerText; // Returns the text of the page’s body
                }
            });
            
            // 7.c. Extract the page text from the results.
            const pageText = results[0].result;
            
            // 7.d. Error handling if no text is found.
            if (!pageText) {
                throw new Error('No text found on page'); // Throwing an Error (JavaScript error object)
            }
            
            // 7.e. Sends a message to the background script to summarize the text.
            chrome.runtime.sendMessage(
                { type: 'summarize', text: pageText }, // An object message with type and text
                (response) => {                        // Callback function
                    stopLoading();                     // Function call
                    if (chrome.runtime.lastError) {
                        showError(chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success) {
                        handleSummarySuccess(response.summary); // Function call
                    } else {
                        // Optional chaining (?.) to handle response possibly being undefined.
                        showError(response?.error || 'Unknown error occurred');
                    }
                }
            );
        } catch (err) {
            // 7.f. If an error occurs, stop loading and show the error.
            stopLoading();             // Function call
            showError(err.message);    // Function call
        }
    };
  
    // 8. Event listener for the refresh button to start summarizing the page.
    refreshBtn.addEventListener('click', summarizePage); // Method call, 'click' event
  
    // 9. showShareButton function - reveals share functionality.
    function showShareButton(summary) {                    // Function declaration
        shareContainer.classList.remove('hidden');         // Method call on DOM element
        
        shareBtn.addEventListener('click', async () => {   // Method call, 'click' event
            // 9.a. Get current tab URL.
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = tab.url; // Storing current tab’s URL in a variable
            
            // 9.b. Creating a share text with summary + URL (limited to 280 or fewer chars).
            const shareText = `${summary.substring(0, 200)}... ${url}`; // String manipulation
            
            // 9.c. Open Twitter share dialog in a new tab/window.
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            window.open(twitterUrl, '_blank'); // Built-in JS method to open a URL in a new tab
        });
    }
  
    // 10. handleSummarySuccess function - updates the UI with the summary.
    function handleSummarySuccess(summary) { // Function declaration
        currentSummary = summary;            // Assign to the global variable currentSummary
        summaryEl.textContent = summary;     // Update DOM element's text content
        summaryEl.classList.remove('hidden');// Unhide the summary element
        showShareButton(summary);            // Call the showShareButton function
    }

    // 11. initChat function - sets up the chat interface logic.
    function initChat() {                   // Function declaration
        // 11.a. Event listener for the "Send" chat button.
        sendChatBtn.addEventListener('click', async () => { // 'click' event
            const userMessage = chatInput.value.trim();     // Retrieve user input from the text field
            if (!userMessage) return;                       // Guard clause if input is empty
            
            // 11.b. Make a POST request to retrieve a chat response from the server.
            const response = await sendChatRequest(userMessage);
            
            // 11.c. Display the response in the chatMessages container.
            chatMessages.innerHTML += `<div class="chat-reply">${response}</div>`;
            chatInput.value = ''; // Clear input field
        });
      
        // 11.d. Show the chat container (unhide).
        chatContainer.classList.remove('hidden'); // Method call on DOM element
    }
    
    // 12. sendChatRequest function - sends a POST request to an API endpoint.
    async function sendChatRequest(userMessage) { // Async function declaration
        try {
            // 12.a. Fetch call to a local server endpoint (replace as needed).
            const res = await fetch('http://localhost:3000/api/chat', {
                method: 'POST', // HTTP method
                headers: { 'Content-Type': 'application/json' }, // Request headers
                body: JSON.stringify({
                    content: `Context: ${currentSummary}\n\nQuestion: ${userMessage}` // Request body
                })
            });
            
            // 12.b. Parse JSON response from the server.
            const data = await res.json();
            
            // 12.c. If successful, return the chat response; otherwise throw an error.
            if (data.success) {
                return data.chatReply; // Return the chat reply text
            } else {
                throw new Error(data.error || 'Unknown server error'); // Error handling
            }
        } catch (err) {
            console.error(err); // Log error in the console
            return 'Error retrieving chat response.'; // Return an error string to display
        }
    }

    // 13. Call initChat to set up chat functionality when the popup is loaded.
    initChat(); // Function call
});
