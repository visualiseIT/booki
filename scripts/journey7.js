/**
 * Journey 7: Custom Form Fields Setup Flow
 * This script captures the journey of a provider adding custom fields to their booking form:
 * 1. Navigate to Form Fields page
 * 2. Add address fields (street, city, state, zip)
 * 3. Add additional fields like preferred contact method
 * 4. Verify fields appear in the booking form
 */

require('dotenv').config();
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const LOGS_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Ensure screenshots directory exists
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'public', 'screenshots', 'journey7');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOGS_DIR, 'journey7.log');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  logStream.write(logMessage);
  console.log(message);
}

async function captureFormFieldsSetupJourney() {
  log('Starting Form Fields Setup Journey');
  
  const wsEndpoint = fs.readFileSync(path.join(__dirname, '..', '.browser-ws-endpoint'), 'utf-8');
  const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
  const page = await browser.newPage();

  try {
    // Navigate to Form Fields page
    log('Navigating to Form Fields page');
    await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/form-fields`);
    await page.waitForSelector('h1');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '1-form-fields-page.png') });
    log('Captured screenshot: 1-form-fields-page.png');

    // Add Street Address field
    log('Adding Street Address field');
    await page.click('button:has-text("Add Custom Field")');
    await page.waitForSelector('form');
    await page.type('input[placeholder="Enter field label"]', 'Street Address');
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Text")');
    await page.type('input[placeholder="Enter placeholder text"]', 'Enter your street address');
    await page.click('button:has-text("Create Field")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '2-street-address-added.png') });
    log('Captured screenshot: 2-street-address-added.png');

    // Add City field
    log('Adding City field');
    await page.click('button:has-text("Add Custom Field")');
    await page.waitForSelector('form');
    await page.type('input[placeholder="Enter field label"]', 'City');
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Text")');
    await page.type('input[placeholder="Enter placeholder text"]', 'Enter your city');
    await page.click('button:has-text("Create Field")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '3-city-added.png') });
    log('Captured screenshot: 3-city-added.png');

    // Add State field with select options
    log('Adding State field');
    await page.click('button:has-text("Add Custom Field")');
    await page.waitForSelector('form');
    await page.type('input[placeholder="Enter field label"]', 'State');
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Select")');
    await page.type('textarea[placeholder="Enter options, separated by commas"]', 'CA, NY, TX, FL, IL');
    await page.click('button:has-text("Create Field")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '4-state-added.png') });
    log('Captured screenshot: 4-state-added.png');

    // Add ZIP Code field
    log('Adding ZIP Code field');
    await page.click('button:has-text("Add Custom Field")');
    await page.waitForSelector('form');
    await page.type('input[placeholder="Enter field label"]', 'ZIP Code');
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Text")');
    await page.type('input[placeholder="Enter placeholder text"]', 'Enter your ZIP code');
    await page.click('button:has-text("Create Field")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '5-zip-added.png') });
    log('Captured screenshot: 5-zip-added.png');

    // Add Preferred Contact Method field
    log('Adding Preferred Contact Method field');
    await page.click('button:has-text("Add Custom Field")');
    await page.waitForSelector('form');
    await page.type('input[placeholder="Enter field label"]', 'Preferred Contact Method');
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Radio")');
    await page.type('textarea[placeholder="Enter options, separated by commas"]', 'Email, Phone, Text Message');
    await page.click('button:has-text("Create Field")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '6-contact-method-added.png') });
    log('Captured screenshot: 6-contact-method-added.png');

    // Verify all fields are listed
    log('Verifying all fields are listed');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '7-all-fields-listed.png') });
    log('Captured screenshot: 7-all-fields-listed.png');

    // Navigate to booking page to verify fields
    log('Navigating to booking page to verify fields');
    await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/john-doe`);
    await page.waitForSelector('button:has-text("Book Now")');
    await page.click('button:has-text("Book Now")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '8-booking-form-with-fields.png') });
    log('Captured screenshot: 8-booking-form-with-fields.png');

    log('Form Fields Setup Journey completed successfully');
  } catch (error) {
    log(`Error in Form Fields Setup Journey: ${error.message}`);
    throw error;
  } finally {
    await page.close();
  }
}

module.exports = captureFormFieldsSetupJourney; 