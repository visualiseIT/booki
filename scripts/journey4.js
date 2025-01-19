/**
 * Journey 4: Availability Setup Flow
 * 
 * This script captures the journey of a provider setting up their availability:
 * 1. Login to dashboard
 * 2. Navigate to availability page
 * 3. Set working hours
 * 4. Configure days of the week
 * 5. Save availability settings
 */

require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create write stream for logging
const logFile = path.join(logsDir, 'journey4.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Helper function to log both to console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  logStream.write(logMessage);
}

// Print description
log('\n=== Journey 4: Availability Setup Flow ===');
log('Capturing the journey of a provider setting up their availability');
log('Steps: Login → Availability → Set Hours → Configure Days → Save\n');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureAvailabilitySetupJourney() {
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
  
  const screenshotsDir = path.join(__dirname, '../screenshots/journey4');
  
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

    // 2. Navigate to availability page
    log('Going to availability page...');
    await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/availability`, { waitUntil: 'networkidle0' });
    await delay(1000);
    
    await page.screenshot({
      path: path.join(screenshotsDir, '2-availability-empty.png'),
      fullPage: true
    });

    // 3. Click Set Working Hours button
    const setHoursButton = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent?.includes('Set Working Hours')
      );
      if (button) button.click();
      return !!button;
    });

    if (setHoursButton) {
      log('Set Working Hours button clicked');
      await delay(1000);
      
      await page.screenshot({
        path: path.join(screenshotsDir, '3-hours-form.png'),
        fullPage: true
      });

      // 4. Configure working hours
      log('Configuring working hours...');
      
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

      // Set Monday-Friday, 9 AM to 5 PM
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of days) {
        const isAvailableCheckbox = await page.$(`#${day}-available`);
        if (isAvailableCheckbox) {
          await isAvailableCheckbox.click();
          await safeType(`#${day}-start`, '09:00');
          await safeType(`#${day}-end`, '17:00');
        }
      }
      
      await delay(1000);
      await page.screenshot({
        path: path.join(screenshotsDir, '4-hours-filled.png'),
        fullPage: true
      });

      // 5. Save availability
      log('Saving availability...');
      const saveButton = await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(
          button => button.textContent?.includes('Save')
        );
        if (button) button.click();
        return !!button;
      });

      if (saveButton) {
        log('Availability saved');
        await delay(2000);
        
        await page.screenshot({
          path: path.join(screenshotsDir, '5-availability-saved.png'),
          fullPage: true
        });
      } else {
        log('Save button not found');
      }
    } else {
      log('Set Working Hours button not found');
    }

    log('Availability setup journey captured successfully!');
    log('Page will remain open. Press Enter to close the page...');
    
    // Wait for user input before closing
    await new Promise(resolve => process.stdin.once('data', resolve));
  } catch (error) {
    log('Error during availability setup journey:');
    log(error.toString());
  } finally {
    await page.close();
    await browser.disconnect();
    logStream.end();
  }
}

captureAvailabilitySetupJourney(); 