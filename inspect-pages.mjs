import { chromium } from 'playwright';
const BASE = 'http://localhost:3001';
const CHROME = '/usr/bin/google-chrome-stable';

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();

// Login first
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type=email]', 'gabriel.letteriello.ai@gmail.com');
await page.fill('input[type=password]', 'TestE2E123!');
await page.click('button[type=submit]');
await page.waitForURL(/\/cockpit/, { timeout: 8000 });
console.log('Logged in');

// Check what's actually rendered on each cockpit page
const pages = [
  { url: '/cockpit', name: 'cockpit-root' },
  { url: '/cockpit/dashboard', name: 'dashboard' },
  { url: '/cockpit/consulentes', name: 'consulentes-list' },
  { url: '/cockpit/consulentes/novo', name: 'consulente-new' },
  { url: '/cockpit/leituras', name: 'leituras-list' },
  { url: '/cockpit/settings', name: 'settings' },
];

for (const p of pages) {
  await page.goto(`${BASE}${p.url}`, { waitUntil: 'networkidle' });
  const title = await page.title();
  const h1 = await page.locator('h1').first().textContent().catch(() => null);
  const h2 = await page.locator('h2').first().textContent().catch(() => null);
  const bodyText = (await page.textContent('body'))?.slice(0, 200).replace(/\s+/g, ' ').trim();
  const inputCount = await page.locator('input').count();
  const buttonCount = await page.locator('button').count();
  const linkCount = await page.locator('a').count();
  console.log(`\n[${p.name}] title="${title}"`);
  console.log(`  h1=${h1 ? `"${h1.slice(0, 50)}"` : 'none'}`);
  console.log(`  h2=${h2 ? `"${h2.slice(0, 50)}"` : 'none'}`);
  console.log(`  inputs=${inputCount} buttons=${buttonCount} links=${linkCount}`);
  console.log(`  body: ${bodyText}`);
}

await browser.close();
