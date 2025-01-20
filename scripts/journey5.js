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

require('dotenv').config();
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '../logs');
const screenshotsDir = path.join(__dirname, '../screenshots/journey5');

// Create directories if they don't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'journey5.log'), { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  logStream.write(logMessage);
  console.log(message);
}

async function safeType(page, selector, text) {
  await page.waitForSelector(selector);
  const element = await page.$(selector);
  await element.click({ clickCount: 3 }); // Select all existing text
  await element.press('Backspace'); // Clear the field
  await page.keyboard.type(text); // Type new text
}

async function captureBookingJourney() {
  log('Starting booking journey capture...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--window-size=1920,1080',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', message => {
      log(`Browser console: ${message.type()}: ${message.text()}`);
    });

    // Listen for page errors
    page.on('pageerror', error => {
      log(`Browser error: ${error.toString()}`);
    });

    await page.setViewport({ width: 1920, height: 1080 });

    // Visit the provider's booking page
    const bookingUrl = 'http://localhost:3000/john-doe';
    log(`Navigating to ${bookingUrl}`);
    await page.goto(bookingUrl);
    await page.waitForSelector('h1');
    await page.screenshot({ path: path.join(screenshotsDir, '1-booking-page.png'), fullPage: true });
    log('Captured booking page screenshot');

    // Wait for services to load
    await page.waitForSelector('.divide-y');
    await page.screenshot({ path: path.join(screenshotsDir, '2-services-list.png'), fullPage: true });
    log('Captured services list screenshot');

    // Click the Book button for the first service
    const bookButton = await page.waitForSelector('button:not([disabled])');
    await bookButton.click();
    
    // Wait for dialog to open and form to be ready
    await page.waitForSelector('form');
    await page.screenshot({ path: path.join(screenshotsDir, '3-booking-form.png'), fullPage: true });
    log('Captured booking form screenshot');

    // Use keyboard to fill the form
    log('Filling form using keyboard...');
    
    // Name field (first field in focus)
    await page.keyboard.type('Test Customer');
    await page.keyboard.press('Tab');
    
    // Email field
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');
    
    // Date field
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    log(`Setting date to: ${dateString}`);
    await page.keyboard.type(dateString);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');  // Extra Tab for datepicker button
    
    // Time field
    await page.keyboard.type('10:00');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');  // Extra Tab for timepicker button
    
    // Notes field
    await page.keyboard.type('Test booking notes');
    
    await page.screenshot({ path: path.join(screenshotsDir, '4-filled-form.png'), fullPage: true });
    log('Captured filled form screenshot');

    // Submit form (Tab to submit button and press Enter)
    log('Submitting form...');
    await page.keyboard.press('Tab');  // Tab to submit button
    await page.keyboard.press('Enter');
    log('Pressed Enter to submit');
    
    // Wait for dialog to close
    log('Waiting for dialog to close...');
    await page.waitForFunction(() => !document.querySelector('form'), { timeout: 5000 })
      .catch(() => log('Dialog did not close automatically'));
    
    // Take final screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '5-booking-confirmation.png'), fullPage: true });
    log('Captured booking confirmation screenshot');

    // Check for success
    const success = await page.evaluate(() => {
      const toasts = Array.from(document.querySelectorAll('[role="status"]'));
      return toasts.some(toast => toast.textContent.includes('Appointment created'));
    });
    
    if (success) {
      log('Appointment was created successfully');
    } else {
      log('No confirmation toast found');
    }

    log('Booking journey completed successfully');
  } catch (error) {
    log(`Error during booking journey: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
    logStream.end();
  }
}

// Run the journey
captureBookingJourney().catch(console.error); 