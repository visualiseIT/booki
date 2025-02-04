require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots', 'journey8');

// Create directories if they don't exist
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOGS_DIR, 'journey8.log');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  logStream.write(logMessage);
  console.log(message);
}

async function captureServiceCustomFieldsJourney() {
  log('Starting Service Custom Fields Journey');
  
  try {
    // Read the browser websocket endpoint
    const endpointFile = path.join(process.cwd(), '.browser-ws-endpoint');
    const browserWSEndpoint = fs.readFileSync(endpointFile, 'utf8');
    
    // Connect to the browser
    const browser = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser.newPage();
    
    // Add console logging
    page.on('console', message => {
      const type = message.type();
      const text = message.text();
      log(`Browser Console [${type}]: ${text}`);
    });

    // Add error logging
    page.on('pageerror', error => {
      log(`Browser Page Error: ${error.toString()}`);
    });

    // Add request failure logging
    page.on('requestfailed', request => {
      log(`Failed Request: ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`);
    });
    
    // Navigate to services page
    log('Navigating to services page');
    await page.goto(`${BASE_URL}/dashboard/services`);
    await page.waitForSelector('h1');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '1-services-page.png') });
    log('Captured screenshot: 1-services-page.png');

    // Wait for services to load and check if any exist
    log('Waiting for services to load...');
    await page.waitForSelector('.space-y-4', { timeout: 5000 });
    
    // Check if there are any services
    const hasServices = await page.evaluate(() => {
      const noServicesText = document.querySelector('.text-center.text-gray-500')?.textContent;
      return !noServicesText?.includes('No services found');
    });

    if (!hasServices) {
      log('No services found. Creating a test service...');
      
      // Click Add Service
      await page.click('a[href="/dashboard/services/new"]');
      await page.waitForSelector('form');
      
      // Fill out the form
      await page.type('#name', 'Test Service');
      await page.type('#description', 'A test service for custom fields');
      await page.type('#duration', '60');
      await page.type('#price', '100');
      
      // Save the service
      await page.evaluate(() => {
        const saveButton = Array.from(document.querySelectorAll('button')).find(
          button => button.textContent?.includes('Save')
        );
        if (saveButton) saveButton.click();
      });
      
      // Wait for save to complete and redirect back to services page
      await page.waitForSelector('[data-testid="edit-service-button"]', { timeout: 5000 });
    }

    // Click Edit on the first service
    log('Clicking Edit button on first service');
    await page.waitForSelector('[data-testid="edit-service-button"]', { timeout: 5000 });
    await page.click('[data-testid="edit-service-button"]');
    await page.waitForSelector('form');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '2-edit-service-dialog.png') });
    log('Captured screenshot: 2-edit-service-dialog.png');

    // Click Manage Required Fields
    log('Clicking Manage Required Fields button');
    await page.click('[data-testid="manage-fields-button"]');
    await page.waitForSelector('h2');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '3-required-fields-dialog.png') });
    log('Captured screenshot: 3-required-fields-dialog.png');

    // Click Add Field
    log('Clicking Add Field button');
    await page.click('[data-testid="add-field-button"]');
    
    // Wait for dialog to open and stabilize
    await page.waitForSelector('h2', { timeout: 5000 });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Verify we're on the Add Field dialog
    const dialogTitle = await page.evaluate(() => {
      const h2 = document.querySelector('h2');
      return h2 ? h2.textContent : '';
    });
    
    if (!dialogTitle?.includes('Add Custom Field')) {
      throw new Error('Add Custom Field dialog did not open properly');
    }
    
    // Now wait for the form elements
    await page.waitForSelector('input[placeholder="Enter field label"]', { timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '4-add-field-dialog.png') });
    log('Captured screenshot: 4-add-field-dialog.png');

    // Fill in field details
    log('Filling in field details');
    await page.type('input[placeholder="Enter field label"]', 'Special Requirements');
    
    // Select field type
    await page.click('button[role="combobox"]'); // Open the select dropdown
    await page.waitForSelector('div[role="option"]'); // Wait for options to appear
    await page.click('div[role="option"][data-value="textarea"]'); // Select textarea option
    
    await page.type('input[placeholder="Enter placeholder text"]', 'Please let us know if you have any special requirements');
    
    // Save the field
    await page.evaluate(() => {
      const saveButton = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent?.includes('Create Field')
      );
      if (saveButton) saveButton.click();
    });
    
    // Wait for save to complete
    await page.waitForFunction(() => {
      const h2 = document.querySelector('h2');
      return h2 ? !h2.textContent?.includes('Add Custom Field') : true;
    }, { timeout: 5000 });
    
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '5-field-added.png') });
    log('Captured screenshot: 5-field-added.png');

    // Close dialogs
    log('Closing dialogs');
    await page.click('button:has-text("Close")');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '6-back-to-services.png') });
    log('Captured screenshot: 6-back-to-services.png');

    log('Service Custom Fields Journey completed successfully');
    await page.close();
  } catch (error) {
    log(`Error: ${error.message}`);
    throw error;
  }
}

// Run the journey
captureServiceCustomFieldsJourney().catch(console.error); 