/**
 * Journey 3: Service Setup Flow
 * 
 * This script captures the journey of a provider setting up their services:
 * 1. Login to dashboard
 * 2. Navigate to services page
 * 3. Create first service
 * 4. Configure service details:
 *    - Name
 *    - Description
 *    - Duration
 *    - Price
 * 5. View created service
 */

require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
let logStream;

try {
  if (!fs.existsSync(logsDir)) {
    console.log('Creating logs directory...');
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Create write stream for logging
  const logFile = path.join(logsDir, 'journey3.log');
  console.log('Log file path:', logFile);
  logStream = fs.createWriteStream(logFile, { flags: 'a' });

  // Test write to ensure stream is working
  logStream.write(`\n[${new Date().toISOString()}] Journey 3 log started\n`);

  // Helper function to log both to console and file
  function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    if (logStream) {
      logStream.write(logMessage);
    }
  }

  // Print description
  log('\n=== Journey 3: Service Setup Flow ===');
  log('Capturing the journey of a provider setting up their services');
  log('Steps: Login → Services → Create Service → Configure → View\n');

  async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function captureServiceSetupJourney() {
    const wsEndpointFile = '.browser-ws-endpoint';
    
    if (!fs.existsSync(wsEndpointFile)) {
      log('Browser is not running. Please start it first with: npm run browser');
      process.exit(1);
    }

    const wsEndpoint = fs.readFileSync(wsEndpointFile, 'utf8');
    const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
    const page = await browser.newPage();
    
    // Set a large viewport size
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    
    const screenshotsDir = path.join(__dirname, '../screenshots/journey3');
    
    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    try {
      // 1. Login and go to dashboard
      log('Navigating to dashboard...');
      await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('h1');
      await delay(1000);
      
      await page.screenshot({
        path: path.join(screenshotsDir, '1-dashboard.png'),
        fullPage: true
      });

      // 2. Navigate to services page
      log('Going to services page...');
      await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/services`, { waitUntil: 'networkidle0' });
      await delay(1000);
      
      await page.screenshot({
        path: path.join(screenshotsDir, '2-services-empty.png'),
        fullPage: true
      });

      // 3. Click Add Service button
      const addServiceButton = await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(
          button => button.textContent?.includes('Add Service')
        );
        if (button) button.click();
        return !!button;
      });

      if (addServiceButton) {
        log('Add Service button clicked');
        await delay(1000);
        
        await page.screenshot({
          path: path.join(screenshotsDir, '3-service-form.png'),
          fullPage: true
        });

        // 4. Fill service form
        log('Filling service form...');
        
        // Helper function to safely type into an input
        async function safeType(selector, value) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            await page.type(selector, value);
            log(`Successfully filled ${selector}`);
          } catch (error) {
            log(`Failed to fill ${selector}: ${error.message}`);
          }
        }

        await safeType('#name', 'Initial Consultation');
        await safeType('#description', 'A 30-minute consultation to discuss your needs and how I can help.');
        await safeType('#duration', '30');
        await safeType('#price', '50');
        
        await delay(1000);
        await page.screenshot({
          path: path.join(screenshotsDir, '4-service-filled.png'),
          fullPage: true
        });

        // 5. Save service
        log('Saving service...');
        const saveButton = await page.evaluate(() => {
          const button = Array.from(document.querySelectorAll('button')).find(
            button => button.textContent?.includes('Save')
          );
          if (button) button.click();
          return !!button;
        });

        if (saveButton) {
          log('Service saved');
          await delay(2000);
          
          await page.screenshot({
            path: path.join(screenshotsDir, '5-service-saved.png'),
            fullPage: true
          });
        } else {
          log('Save button not found');
        }
      } else {
        log('Add Service button not found');
      }

      log('Service setup journey captured successfully!');
      log('Page will remain open. Press Enter to close the page...');
      
      // Wait for user input before closing
      await new Promise(resolve => process.stdin.once('data', resolve));
    } catch (error) {
      log('Error during service setup journey:');
      log(error.toString());
    } finally {
      await page.close();
      await browser.disconnect();
      if (logStream) {
        logStream.end();
      }
    }
  }

  // Execute the journey
  captureServiceSetupJourney()
    .catch(error => {
      log('Error during journey execution:');
      log(error.toString());
    })
    .finally(() => {
      if (logStream) {
        logStream.end();
      }
    });

} catch (error) {
  console.error('Error setting up logging:', error);
  if (logStream) {
    logStream.end();
  }
  process.exit(1);
} 