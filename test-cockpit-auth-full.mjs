import { chromium } from 'playwright';
const BASE = 'http://localhost:3001';
const CHROME = '/usr/bin/google-chrome-stable';

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const ctx = await browser.newContext();
const page = await ctx.newPage();

// Track REAL errors (not 401s)
const realErrors = [];
const pageErrors = [];
page.on('console', m => {
  if (m.type() === 'error') {
    const text = m.text();
    // Filter out the 401 browser-level noise
    if (!text.includes('401') && !text.includes('Failed to load resource')) {
      realErrors.push(text);
    }
  }
});
page.on('pageerror', e => pageErrors.push(e.message));

// Login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type=email]', 'gabriel.letteriello.ai@gmail.com');
await page.fill('input[type=password]', 'TestE2E123!');
await page.click('button[type=submit]');
try {
  await page.waitForURL(/\/cockpit/, { timeout: 8000 });
  console.log('Logged in OK');
} catch {
  console.log('Login failed - URL:', page.url());
  await browser.close();
  process.exit(1);
}

// Test all cockpit pages
const cockpitPages = [
  '/cockpit',
  '/cockpit/dashboard',
  '/cockpit/consulentes',
  '/cockpit/consulentes/novo',
  '/cockpit/leituras',
  '/cockpit/settings',
];

console.log('\n=== COCKPIT PAGES (auth) ===');
for (const p of cockpitPages) {
  realErrors.length = 0; pageErrors.length = 0;
  try {
    const r = await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle', timeout: 15000 });
    const status = r?.status();
    const finalUrl = page.url();
    const errs = realErrors.length + pageErrors.length;
    console.log(`[${errs === 0 ? 'OK' : 'ERR'}] ${p} -> ${status} (final: ${finalUrl}) errors=${errs}`);
    if (realErrors.length) realErrors.slice(0, 3).forEach(e => console.log(`  console: ${e.slice(0, 200)}`));
    if (pageErrors.length) pageErrors.slice(0, 3).forEach(e => console.log(`  page: ${e.slice(0, 200)}`));
  } catch (e) {
    console.log(`[FAIL] ${p}: ${e.message}`);
  }
}

// Test authenticated APIs
console.log('\n=== AUTHENTICATED APIs ===');
const apis = [
  '/api/operator/dashboard',
  '/api/operator/auth/me',
  '/api/operator/auth/sessions',
  '/api/mesa-real/clients',
  '/api/mesa-real/readings?clientId=test',
  '/api/operator/rate-limit-status',
  '/api/operator/dev/bypass-status',
];
for (const url of apis) {
  try {
    const r = await page.request.fetch(`${BASE}${url}`);
    const status = r.status();
    const expected = status === 200;
    console.log(`[${expected ? 'OK' : 'ERR'}] ${url} -> ${status}`);
  } catch (e) {
    console.log(`[FAIL] ${url}: ${e.message}`);
  }
}

await browser.close();
