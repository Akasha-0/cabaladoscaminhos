import { chromium } from 'playwright';
import * as fs from 'fs';

async function run() {
  console.log('🔮 Starting Playwright E2E Browser Test using system Google Chrome...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // Log page errors and console messages
  page.on('pageerror', (err) => {
    console.error('🚨 PAGE ERROR:', err.message);
  });

  page.on('console', (msg) => {
    console.log(`💻 CONSOLE [${msg.type().toUpperCase()}]:`, msg.text());
  });

  try {
    console.log('🌐 Visiting Landing Page at http://localhost:3000/...');
    const response = await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`✅ Landing Page loaded with status: ${response?.status()}`);

    // Visit Register Page
    console.log('🌐 Visiting Register Page...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
    console.log(`✅ Register Page loaded, current URL: ${page.url()}`);

    // Fill registration form to simulate user registration
    console.log('✍️ Filling register form fields...');
    await page.fill('input[id="name"]', 'User Browser Test');
    
    // Generate a unique email
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const email = `test_user_${randomSuffix}@cabaladoscaminhos.com.br`;
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', 'SenhaForte123!');
    await page.fill('input[id="confirmPassword"]', 'SenhaForte123!');
    
    // Check the terms checkbox directly
    console.log('☑️ Checking Terms of Use checkbox...');
    await page.check('input[name="acceptTerms"]', { force: true });

    // Click submit
    console.log('🚀 Submitting registration form...');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard or onboarding
    console.log('⏳ Waiting for navigation after registration...');
    await page.waitForTimeout(5000); // Wait for redirect to take place

    console.log(`📍 Current URL: ${page.url()}`);

    // Check for any visible form errors or server errors on the page
    const errorText = await page.evaluate(() => {
      // Find elements containing error text or server errors
      const errorDivs = Array.from(document.querySelectorAll('.text-red-400, .bg-red-500\\/10, [class*="error"]'));
      return errorDivs.map(el => el.textContent?.trim()).filter(Boolean);
    });

    if (errorText.length > 0) {
      console.log('🚨 VISIBLE FORM/SERVER ERRORS:', errorText);
    }

    // Save page HTML for debugging
    const html = await page.content();
    fs.writeFileSync('scratch-register-page.html', html);
    console.log('📄 Saved register page HTML to scratch-register-page.html');

  } catch (err: any) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await browser.close();
    console.log('🔮 Playwright E2E Browser Test Finished.');
  }
}

run().catch((e) => {
  console.error('Fatal crash:', e);
  process.exit(1);
});
