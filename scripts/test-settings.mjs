import { chromium } from 'playwright';
const BASE = 'http://localhost:3001';
const CHROME = '/usr/bin/google-chrome-stable';

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  // Listen for console messages and page errors
  page.on('console', msg => console.log(`[PAGE-CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[PAGE-ERROR] ${err.message}`));
  page.on('requestfailed', req => console.log(`[REQ-FAILED] ${req.url()}: ${req.failure()?.errorText}`));

  console.log('Navigating to login page...');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  
  console.log('Logging in as Gabriel...');
  await page.fill('input[type=email]', 'gabriel.letteriello.ai@gmail.com');
  await page.fill('input[type=password]', 'TestE2E123!');
  await page.click('button[type=submit]');
  await page.waitForURL(/\/cockpit/, { timeout: 8000 });
  console.log('Logged in successfully');

  console.log('Navigating directly to /cockpit/settings...');
  const response = await page.goto(`${BASE}/cockpit/settings`, { waitUntil: 'networkidle' });
  console.log(`Settings response status: ${response?.status()}`);

  const html = await page.content();
  console.log('Page Title:', await page.title());
  console.log('Has Configurações header:', html.includes('Configurações'));
  console.log('Has Provedor de Inteligência Artificial:', html.includes('Provedor de Inteligência Artificial'));
  
  await browser.close();
}

main().catch(console.error);
