/**
 * Journey 6: Provider Appointment Management Flow
 * 
 * This script captures the journey of a provider managing appointments:
 * 1. Login to dashboard
 * 2. View upcoming appointments (or empty state)
 * 3. View stats and quick actions
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
    await delay(2000); // Wait for any animations/loading
    await page.screenshot({ path: path.join(screenshotsDir, '1-dashboard.png'), fullPage: true });
    log('Captured dashboard screenshot');

    // Check for stats
    const stats = await page.evaluate(() => {
      const totalServices = document.querySelector('[data-testid="total-services"]')?.textContent;
      const upcomingBookings = document.querySelector('[data-testid="upcoming-bookings"]')?.textContent;
      return { totalServices, upcomingBookings };
    });

    if (stats.totalServices) {
      log(`Total services: ${stats.totalServices}`);
    }
    if (stats.upcomingBookings) {
      log(`Upcoming bookings: ${stats.upcomingBookings}`);
    }

    // Check for quick actions
    const quickActions = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(b => b.textContent).filter(Boolean);
    });
    log(`Quick actions available: ${quickActions.join(', ')}`);

    // Look for appointments section
    const appointmentsSection = await page.evaluate(() => {
      const section = document.querySelector('[data-testid="appointments-section"]');
      if (!section) return null;
      
      const appointments = Array.from(section.querySelectorAll('[data-testid="appointment-item"]'));
      return {
        hasAppointments: appointments.length > 0,
        count: appointments.length
      };
    });

    if (appointmentsSection) {
      if (appointmentsSection.hasAppointments) {
        log(`Found ${appointmentsSection.count} appointments`);
        await page.screenshot({ path: path.join(screenshotsDir, '2-appointments-list.png'), fullPage: true });
        
        // Click on the first appointment if any exist
        const appointment = await page.waitForSelector('[data-testid="appointment-item"]');
        await appointment.click();
        log('Clicked on appointment');
        
        // Take a screenshot after clicking
        await delay(1000);
        await page.screenshot({ path: path.join(screenshotsDir, '3-appointment-clicked.png'), fullPage: true });
        log('Captured appointment click screenshot');
      } else {
        log('No appointments found in the appointments section');
        await page.screenshot({ path: path.join(screenshotsDir, '2-no-appointments.png'), fullPage: true });
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