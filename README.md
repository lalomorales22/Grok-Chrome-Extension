# XAI Summarizer Chrome Extension
<img width="324" alt="Screenshot 2025-01-24 at 8 01 25 PM" src="https://github.com/user-attachments/assets/33fcd64c-257b-408a-be8d-74b39146df88" />
<img width="326" alt="Screenshot 2025-01-24 at 8 02 28 PM" src="https://github.com/user-attachments/assets/4fbdcdd7-868c-47ca-8a18-376e719d6bec" />



A Chrome extension that uses the Grok API to generate concise summaries of web pages with chat. This extension demonstrates integration with the Grok API through a secure local backend.

## Features

- 🚀 One-click page summarization
- 🔒 Secure API key handling via local backend
- 💨 Fast and responsive interface
- 🎨 Clean, modern dark theme UI

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm
- Chrome browser

### Setting up the Local Backend

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory with your Grok API key:
```
XAI_API_KEY=your_api_key_here
```

4. Start the local server:
```bash
node server.js
```

### Installing the Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the extension directory
4. The extension icon should appear in your Chrome toolbar

## Usage

1. Navigate to any webpage you want to summarize
2. Click the extension icon in your Chrome toolbar
3. Click the "Summarize" button in the popup
4. Wait for the summary to appear
5. Ask follor up questions about the article

## Project Structure

```
grok-chrome-extension/
├── manifest.json        # Extension configuration
├── popup.html          # Extension popup interface
├── popup.css           # Styles for the popup
├── popup.js            # Popup functionality
├── background.js       # Background service worker
├── contentScript.js    # Page content extraction
├── images/            # Extension icons
└── server/            # Local backend
    ├── server.js      # Express server
    ├── package.json   # Backend dependencies
    └── .env          # API key configuration
```

## Development

### Local Development

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the reload button on the extension card
4. Test your changes

### Backend Development

The backend server uses:
- Express.js for the server
- axios for API requests
- CORS for cross-origin support
- dotenv for environment variables

## Security Notes

- The extension uses a local backend to keep the Grok API key secure
- All API calls are made through the local server, never directly from the extension
- CORS is configured for localhost only
- The extension requests minimal permissions

## Troubleshooting

Common issues and solutions:

1. **Summary not working**
   - Ensure the local server is running
   - Check the API key in .env
   - Look for errors in the browser console

2. **Server won't start**
   - Verify Node.js installation
   - Check if port 3000 is available
   - Ensure all dependencies are installed

3. **Extension not loading**
   - Verify Developer mode is enabled
   - Check for console errors
   - Try reloading the extension

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use and modify for your own projects.
