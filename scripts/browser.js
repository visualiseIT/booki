/**
 * Browser Manager
 * 
 * This script starts a persistent browser instance for journey captures.
 * It creates a websocket endpoint that journey scripts can connect to,
 * allowing multiple scripts to reuse the same browser session.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

let browser;
const wsEndpointFile = '.browser-ws-endpoint';

// Print description
console.log('\n=== Browser Manager ===');
console.log('Starting persistent browser instance for journey captures');
console.log('Use Ctrl+C to stop the browser when finished\n');

async function startBrowser() {
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
    args: ['--start-maximized']
  });

  // Store the WebSocket endpoint for other scripts to connect
  const wsEndpoint = browser.wsEndpoint();
  fs.writeFileSync(wsEndpointFile, wsEndpoint);

  console.log('Browser started. Press Ctrl+C to close.');

  // Keep the script running
  await new Promise(() => {});
}

// Clean up on exit
process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  if (fs.existsSync(wsEndpointFile)) {
    fs.unlinkSync(wsEndpointFile);
  }
  process.exit();
});

startBrowser(); 