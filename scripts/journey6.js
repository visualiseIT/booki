/**
 * Journey 6: Provider Appointment Management Flow
 * 
 * This script captures the journey of a provider managing appointments:
 * 1. Login to dashboard
 * 2. View upcoming appointments
 * 3. Click on an appointment to see details
 * 4. View customer information and booking details
 */

require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '../logs');
const screenshotsDir = path.join(__dirname, '../screenshots/journey6');

// Create directories if they don't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logsDir, 'journey6.log'), { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  logStream.write(logMessage);
  console.log(message);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureAppointmentManagementJourney() {
  log('Starting appointment management journey capture...');
  
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

  try {
    // Listen for console messages
    page.on('console', message => {
      log(`Browser console: ${message.type()}: ${message.text()}`);
    });

    // Listen for page errors
    page.on('pageerror', error => {
      log(`Browser error: ${error.toString()}`);
    });

    // Visit the dashboard
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;
    log(`Navigating to ${dashboardUrl}`);
    await page.goto(dashboardUrl, { waitUntil: 'networkidle0' });
    
    // Wait for dashboard to load
    await page.waitForSelector('h1');
    await delay(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '1-dashboard.png'), fullPage: true });
    log('Captured dashboard screenshot');

    // Look for appointments section
    await page.waitForSelector('h2');
    const appointmentsHeading = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      return headings.find(h => h.textContent.includes('Upcoming Appointments'));
    });

    if (appointmentsHeading) {
      log('Found appointments section');
      await page.screenshot({ path: path.join(screenshotsDir, '2-appointments-list.png'), fullPage: true });
      
      // Click on the first appointment
      const appointment = await page.waitForSelector('[data-testid="appointment-item"]');
      await appointment.click();
      log('Clicked on appointment');
      
      // Wait for appointment details to load
      await page.waitForSelector('[data-testid="appointment-details"]');
      await page.screenshot({ path: path.join(screenshotsDir, '3-appointment-details.png'), fullPage: true });
      log('Captured appointment details screenshot');
      
      // Check for customer details
      const customerDetails = await page.evaluate(() => {
        const details = document.querySelector('[data-testid="appointment-details"]');
        return details ? details.textContent : null;
      });
      
      if (customerDetails) {
        log('Found customer details in appointment');
      } else {
        log('No customer details found');
      }
    } else {
      log('No appointments section found');
    }

    log('Appointment management journey completed successfully');
  } catch (error) {
    log(`Error during appointment management journey: ${error.message}`);
    throw error;
  } finally {
    await page.close();
    await browser.disconnect();
    logStream.end();
  }
}

// Run the journey
captureAppointmentManagementJourney().catch(console.error); 