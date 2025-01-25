/* background.js
   ============= 
   Handles communication with local backend
*/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'summarize') {
        const { text } = request;
        
        fetch('http://localhost:3000/api/completion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: text })
        })
        .then(async res => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server error (${res.status}): ${errorText}`);
            }
            return res.json();
        })
        .then(data => {
            if (data.error) {
                sendResponse({ success: false, error: data.error });
            } else {
                sendResponse({ success: true, summary: data.summary });
            }
        })
        .catch(err => {
            console.error('Error fetching summary:', err);
            sendResponse({ 
                success: false, 
                error: err.message || 'Failed to get summary'
            });
        });
        
        return true;  // Will respond asynchronously
    }
});