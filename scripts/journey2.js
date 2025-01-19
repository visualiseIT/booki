/**
 * Journey 2: Client Booking Flow
 * 
 * This script captures the journey of a client viewing a provider's booking page:
 * 1. Provider's public booking page
 * 2. Provider information and bio
 * 3. Available services (empty state)
 * 4. Contact information
 * 
 * Future steps to be added:
 * - Service selection
 * - Date/time selection
 * - Booking confirmation
 */

require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Print description
console.log('\n=== Journey 2: Client Booking Flow ===');
console.log('Capturing the journey of a client viewing a provider\'s booking page');
console.log('Steps: Booking Page → Provider Info → Services → Contact Info\n');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureBookingJourney() {
  const wsEndpointFile = '.browser-ws-endpoint';
  
  if (!fs.existsSync(wsEndpointFile)) {
    console.error('Browser is not running. Please start it first with: npm run browser');
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
  
  const screenshotsDir = path.join(__dirname, '../screenshots/journey2');
  
  // Create screenshots/journey2 directory if it doesn't exist
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // 1. Go to provider's booking page
    console.log('Environment variable check:');
    console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
    const bookingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/john-doe`;
    console.log('Constructed URL:', bookingUrl);
    
    console.log('Navigating to booking page...');
    await page.goto(bookingUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    await delay(1000); // Add delay before screenshot
    
    await page.screenshot({
      path: path.join(screenshotsDir, '1-booking-page.png'),
      fullPage: true
    });

    // 2. Check provider info
    const providerInfo = await page.evaluate(() => {
      const name = document.querySelector('h1')?.textContent;
      const bio = document.querySelector('h1 + p')?.textContent;
      return { name, bio };
    });
    
    console.log('Provider Info:', providerInfo);

    // 3. Check available services
    const servicesSection = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(
        h2 => h2.textContent?.includes('Available Services')
      );
      return !!heading;
    });

    if (servicesSection) {
      console.log('Services section found');
      await delay(1000); // Add delay before screenshot
      await page.screenshot({
        path: path.join(screenshotsDir, '2-services-section.png'),
        fullPage: true
      });
    } else {
      console.log('Services section not found');
    }

    // 4. Check contact information
    const contactInfo = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll('p'));
      const timezone = paragraphs.find(p => p.textContent?.includes('Timezone'))?.textContent;
      const contact = paragraphs.find(p => p.textContent?.includes('Contact'))?.textContent;
      return { timezone, contact };
    });
    
    console.log('Contact Info:', contactInfo);

    console.log('Booking journey captured successfully!');
    console.log('Page will remain open. Press Enter to close the page...');
    
    // Wait for user input before closing
    await new Promise(resolve => process.stdin.once('data', resolve));
  } catch (error) {
    console.error('Error during booking journey:', error);
  } finally {
    await page.close();
    await browser.disconnect();
  }
}

captureBookingJourney(); 