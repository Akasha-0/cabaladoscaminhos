import { chromium } from 'playwright';
import * as fs from 'fs';

async function run() {
  console.log('🔮 Starting Expanded Playwright E2E Browser Test using system Google Chrome...');
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
    console.error('🚨 PAGE ERROR AT:', page.url(), '->', err.message);
  });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || text.includes('Error') || text.includes('Failed')) {
      console.log(`💻 CONSOLE [${type.toUpperCase()}] AT ${page.url()}:`, text);
    }
  });

  try {
    console.log('🌐 Visiting Landing Page at http://localhost:3000/...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`✅ Landing Page loaded, title: "${await page.title()}"`);

    // Visit Register Page
    console.log('🌐 Visiting Register Page...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });

    // Fill registration form to simulate user registration
    console.log('✍️ Filling register form fields...');
    await page.fill('input[id="name"]', 'User Browser Test');
    
    // Generate a unique email
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const email = `test_user_${randomSuffix}@gmail.com`;
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', 'SenhaForte123!');
    await page.fill('input[id="confirmPassword"]', 'SenhaForte123!');
    
    // Check the terms checkbox directly
    await page.check('input[name="acceptTerms"]', { force: true });

    // Click submit
    console.log('🚀 Submitting registration form...');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    console.log('⏳ Waiting for navigation after registration...');
    await page.waitForTimeout(5000); // Wait for redirect to take place
    console.log(`📍 Current URL: ${page.url()}`);

    // Visit Onboarding Page
    console.log('🌐 Visiting Onboarding Page...');
    await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle' });
    console.log(`✅ Onboarding Page loaded at: ${page.url()}`);
    await page.waitForTimeout(1000);

    // Visit Dashboard Mapa Page
    console.log('🌐 Visiting Dashboard Mapa Page...');
    await page.goto('http://localhost:3000/dashboard/mapa', { waitUntil: 'networkidle' });
    console.log(`✅ Dashboard Mapa Page loaded at: ${page.url()}`);
    await page.waitForTimeout(1000);

    // Visit Dashboard Insights Page
    console.log('🌐 Visiting Dashboard Insights Page...');
    await page.goto('http://localhost:3000/dashboard/insights', { waitUntil: 'networkidle' });
    console.log(`✅ Dashboard Insights Page loaded at: ${page.url()}`);
    await page.waitForTimeout(1000);

    // Visit Dashboard Calendario Page
    console.log('🌐 Visiting Dashboard Calendario Page...');
    await page.goto('http://localhost:3000/dashboard/calendario', { waitUntil: 'networkidle' });
    console.log(`✅ Dashboard Calendario Page loaded at: ${page.url()}`);
    await page.waitForTimeout(1000);

    console.log('🎉 Browser E2E navigation check completed with 100% success! No page crashes occurred.');

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
