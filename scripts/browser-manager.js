const puppeteer = require('puppeteer');
const fs = require('fs');

let browser;
const wsEndpointFile = '.browser-ws-endpoint';

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