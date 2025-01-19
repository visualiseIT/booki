/**
 * Journey 5: Customer Booking Flow
 * 
 * This script captures the journey of a customer booking a service:
 * 1. Visit provider's public booking page
 * 2. View available services
 * 3. Select a service
 * 4. Choose date and time
 * 5. Fill customer details
 * 6. Complete booking
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
const logFile = path.join(logsDir, 'journey5.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Helper function to log both to console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  logStream.write(logMessage);
}

// Print description
log('\n=== Journey 5: Customer Booking Flow ===');
log('Capturing the journey of a customer booking a service');
log('Steps: Visit → Browse Services → Select → Schedule → Book\n');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureBookingJourney() {
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
  
  const screenshotsDir = path.join(__dirname, '../screenshots/journey5');
  
  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // 1. Visit provider's booking page
    log('Visiting booking page...');
    await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/test-provider`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    await delay(1000);
    
    await page.screenshot({
      path: path.join(screenshotsDir, '1-booking-page.png'),
      fullPage: true
    });

    // 2. View available services
    log('Viewing services...');
    const servicesSection = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(
        h2 => h2.textContent?.includes('Available Services')
      );
      return !!heading;
    });

    if (servicesSection) {
      log('Services section found');
      await delay(1000);
      
      await page.screenshot({
        path: path.join(screenshotsDir, '2-services-list.png'),
        fullPage: true
      });

      // 3. Select a service
      log('Selecting a service...');
      const bookButton = await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(
          button => button.textContent?.includes('Book')
        );
        if (button) button.click();
        return !!button;
      });

      if (bookButton) {
        log('Service selected');
        await delay(1000);
        
        await page.screenshot({
          path: path.join(screenshotsDir, '3-service-selected.png'),
          fullPage: true
        });

        // 4. Choose date and time
        log('Selecting date and time...');
        
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

        // Select next available slot
        const dateInput = await page.$('input[type="date"]');
        if (dateInput) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dateString = tomorrow.toISOString().split('T')[0];
          await dateInput.type(dateString);
          log('Date selected');
        }

        await delay(1000);
        await page.screenshot({
          path: path.join(screenshotsDir, '4-datetime-selected.png'),
          fullPage: true
        });

        // 5. Fill customer details
        log('Filling customer details...');
        await safeType('#name', 'Test Customer');
        await safeType('#email', 'test@example.com');
        await safeType('#notes', 'This is a test booking from journey5');
        
        await delay(1000);
        await page.screenshot({
          path: path.join(screenshotsDir, '5-details-filled.png'),
          fullPage: true
        });

        // 6. Complete booking
        log('Completing booking...');
        const confirmButton = await page.evaluate(() => {
          const button = Array.from(document.querySelectorAll('button')).find(
            button => button.textContent?.includes('Confirm Booking')
          );
          if (button) button.click();
          return !!button;
        });

        if (confirmButton) {
          log('Booking confirmed');
          await delay(2000);
          
          await page.screenshot({
            path: path.join(screenshotsDir, '6-booking-confirmed.png'),
            fullPage: true
          });
        } else {
          log('Confirm button not found');
        }
      } else {
        log('Book button not found');
      }
    } else {
      log('Services section not found');
    }

    log('Booking journey captured successfully!');
    log('Page will remain open. Press Enter to close the page...');
    
    // Wait for user input before closing
    await new Promise(resolve => process.stdin.once('data', resolve));
  } catch (error) {
    log('Error during booking journey:');
    log(error.toString());
  } finally {
    await page.close();
    await browser.disconnect();
    logStream.end();
  }
}

captureBookingJourney(); 