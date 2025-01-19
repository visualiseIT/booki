/**
 * Journey 1: Provider Setup Flow
 * 
 * This script captures the journey of a provider setting up their profile:
 * 1. Landing page and sign up
 * 2. Dashboard view
 * 3. Profile setup
 * 4. Services page (empty state)
 * 5. Availability page (empty state)
 */

require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Print description
console.log('\n=== Journey 1: Provider Setup Flow ===');
console.log('Capturing the journey of a provider setting up their profile');
console.log('Steps: Landing → Signup → Dashboard → Profile → Services → Availability\n');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureJourney() {
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
  
  const screenshotsDir = path.join(__dirname, '../screenshots/journey1');
  
  // Create screenshots/journey1 directory if it doesn't exist
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // 1. Landing Page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    
    // Set initial scroll
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    await page.screenshot({
      path: path.join(screenshotsDir, '1-landing-page.png'),
      fullPage: true
    });

    // 2. Click Get Started
    await delay(2000);
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(button => button.textContent?.trim())
    );
    console.log('Available buttons:', buttons);

    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent?.includes('Get Started')
      );
      if (button) button.click();
    });
    
    // Wait for Clerk dialog and fill email
    await delay(2000);
    
    // Log all input fields to help debug
    const inputs = await page.evaluate(() => {
      const allInputs = Array.from(document.querySelectorAll('input'));
      return allInputs.map(input => ({
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder
      }));
    });
    console.log('Available inputs:', inputs);

    // Try different selectors for email input
    let emailInput = await page.$('input[name="identifier"]') ||
                    await page.$('input[type="email"]') ||
                    await page.$('input[placeholder*="email" i]');

    if (emailInput) {
      await emailInput.type('jacob.sunny@gmail.com');
      console.log('Email entered successfully');
    } else {
      console.log('Email input not found. Please enter email manually.');
    }
    
    console.log('Please complete the login process manually...');
    console.log('After login is complete, press Enter to continue with the journey...');
    
    // Wait for user input before continuing
    await new Promise(resolve => process.stdin.once('data', resolve));
    
    // 3. Dashboard Page
    await page.waitForSelector('h1');
    await page.screenshot({
      path: path.join(screenshotsDir, '2-dashboard.png'),
      fullPage: true
    });

    // 4. Check if new or existing user
    console.log('Checking if profile needs setup...');
    const setupBanner = await page.$('.bg-yellow-50');
    const isNewUser = !!setupBanner;

    if (isNewUser) {
      console.log('New user detected - going through setup flow');
      // Go to Profile Page via Complete Setup button
      await delay(1000);
      const profileSetupButton = await page.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(
          a => a.textContent?.includes('Complete Setup')
        );
        if (link) link.click();
        return !!link;
      });
      
      if (!profileSetupButton) {
        console.log('Profile setup button not found');
      }
    } else {
      console.log('Existing user detected - viewing profile');
      // Navigate to profile via URL
      await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'networkidle0' });
    }
    
    await page.waitForSelector('h1');
    await page.screenshot({
      path: path.join(screenshotsDir, '3-profile-page.png'),
      fullPage: true
    });

    // 5. Fill Profile Form (only for new users)
    if (isNewUser) {
      console.log('Filling out profile form...');
      await delay(2000);

      // Helper function to safely type into an input
      async function safeType(selector, value) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          await page.type(selector, value);
          console.log(`Successfully filled ${selector}`);
        } catch (error) {
          console.log(`Failed to fill ${selector}: ${error.message}`);
        }
      }

      // Log available form fields
      const formFields = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        return inputs.map(input => ({
          type: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder
        }));
      });
      console.log('Available form fields:', formFields);

      await safeType('#name', 'John Doe');
      await safeType('#businessName', 'JD Consulting');
      await safeType('#bio', 'Professional consultant with over 10 years of experience.');
      await safeType('#contactEmail', 'john@example.com');
      await safeType('#timezone', 'UTC+0');
      await safeType('#customUrl', 'john-doe');
      
      await page.screenshot({
        path: path.join(screenshotsDir, '4-filled-profile.png'),
        fullPage: true
      });

      // 6. Submit Profile
      console.log('Looking for save button...');
      const saveButton = await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll('button')).find(
          button => button.textContent?.includes('Save Changes')
        );
        if (button) {
          button.click();
          return true;
        }
        return false;
      });

      if (saveButton) {
        console.log('Save button clicked');
        await delay(2000);
      } else {
        console.log('Save button not found');
      }

      await page.screenshot({
        path: path.join(screenshotsDir, '5-profile-saved.png'),
        fullPage: true
      });

      // Wait for redirect and dashboard to load
      console.log('Waiting for redirect to dashboard...');
      await page.waitForNavigation();
      await delay(1000);

      // 7. Verify Profile Setup
      const setupBannerAfter = await page.$('.bg-yellow-50');
      if (!setupBannerAfter) {
        console.log('Profile setup banner is gone - Success!');
      } else {
        console.log('Warning: Profile setup banner is still visible');
      }
    } else {
      console.log('Existing profile found - skipping form fill');
    }

    // Navigate back to dashboard
    console.log('Navigating back to dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await delay(1000);

    // 8. Check Booking Link
    const copyLinkButton = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent?.includes('Copy Link')
      );
      return !!button;
    });
    
    if (copyLinkButton) {
      console.log('Booking link is available - Success!');
    } else {
      console.log('Booking link not found');
    }

    await page.screenshot({
      path: path.join(screenshotsDir, '6-dashboard-after-setup.png'),
      fullPage: true
    });

    // 9. Navigate to Services
    console.log('Navigating to Services page...');
    await page.goto('http://localhost:3000/dashboard/services', { waitUntil: 'networkidle0' });
    await delay(1000);
    
    const servicesTitle = await page.$('h1');
    if (servicesTitle) {
      console.log('Services page loaded successfully');
      await page.screenshot({
        path: path.join(screenshotsDir, '7-services-page.png'),
        fullPage: true
      });
    } else {
      console.log('Warning: Services page might not have loaded correctly');
    }

    // 10. Navigate to Availability
    console.log('Navigating to Availability page...');
    await page.goto('http://localhost:3000/dashboard/availability', { waitUntil: 'networkidle0' });
    await delay(1000);
    
    const availabilityTitle = await page.$('h1');
    if (availabilityTitle) {
      console.log('Availability page loaded successfully');
      await page.screenshot({
        path: path.join(screenshotsDir, '8-availability-page.png'),
        fullPage: true
      });
    } else {
      console.log('Warning: Availability page might not have loaded correctly');
    }

    console.log('Journey captured successfully!');
    console.log('Page will remain open. Press Enter to close the page...');
    
    // Wait for user input before closing
    await new Promise(resolve => process.stdin.once('data', resolve));
  } catch (error) {
    console.error('Error during journey:', error);
  } finally {
    await page.close();
    await browser.disconnect();
  }
}

captureJourney(); 