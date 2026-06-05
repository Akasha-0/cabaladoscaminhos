import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:3001';
const CHROME = '/usr/bin/google-chrome-stable';

const PUBLIC_PAGES = [
  '/',
  '/login',
  '/operator/login',
  '/operator/register',
  '/operator/forgot-password',
  '/operator/reset-password?token=test123',
];

const API_PAGES = [
  '/api/health',
  '/api/health/live',
  '/api/health/ready',
  '/api/health/metrics',
  '/api/security/headers',
  '/api/calendar',
  '/api/astrology-calendar',
  '/api/offerings',
  '/api/search',
  '/api/search/index',
  '/api/search/spiritual',
  '/api/privacy/settings',
  '/api/recommendations',
];

const AUTH_REQUIRED = [
  '/api/operator/auth/me',
  '/api/operator/dashboard',
  '/api/operator/auth/sessions',
  '/api/admin/dashboard',
  '/api/admin/rate-limit',
  '/api/mesa-real/clients',
  '/api/mesa-real/readings',
  '/api/operator/rate-limit-status',
  '/api/operator/dev/bypass-status',
  '/api/progresso',
  '/api/consult/history',
];

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const allResults = [];
async function test(url, category) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const networkErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('response', r => { if (r.status() >= 500) networkErrors.push(`${r.status()} ${r.url()}`); });
  
  const result = { url, category, status: null, finalUrl: null, consoleErrors: [], pageErrors: [], networkErrors: [] };
  try {
    const r = await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 15000 });
    result.status = r?.status();
    result.finalUrl = page.url();
    result.consoleErrors = consoleErrors;
    result.pageErrors = pageErrors;
    result.networkErrors = networkErrors;
  } catch (e) {
    result.error = e.message;
  } finally {
    await ctx.close();
  }
  return result;
}

console.log('=== PUBLIC PAGES ===');
for (const p of PUBLIC_PAGES) {
  const r = await test(p, 'public');
  allResults.push(r);
  const errCount = r.consoleErrors.length + r.pageErrors.length + r.networkErrors.length;
  console.log(`[${errCount === 0 ? 'OK' : 'ERR'}] ${p} -> ${r.status} ${errCount ? 'errors=' + errCount : ''}`);
}

console.log('\n=== PUBLIC APIs (no auth) ===');
for (const p of API_PAGES) {
  const r = await test(p, 'api-public');
  allResults.push(r);
  const errCount = r.consoleErrors.length + r.pageErrors.length + r.networkErrors.length;
  console.log(`[${errCount === 0 ? 'OK' : 'ERR'}] ${p} -> ${r.status} ${errCount ? 'errors=' + errCount : ''}`);
}

console.log('\n=== AUTH-REQUIRED APIs (no auth) ===');
for (const p of AUTH_REQUIRED) {
  const r = await test(p, 'api-auth');
  allResults.push(r);
  const errCount = r.consoleErrors.length + r.pageErrors.length + r.networkErrors.length;
  const expected = (r.status === 401 || r.status === 200);
  console.log(`[${expected && errCount === 0 ? 'OK' : 'ERR'}] ${p} -> ${r.status} ${errCount ? 'errors=' + errCount : ''}`);
}

writeFileSync('/tmp/smoke-test.json', JSON.stringify(allResults, null, 2));

await browser.close();

// Summary
console.log('\n=== SUMMARY ===');
const withErrors = allResults.filter(r => r.consoleErrors.length || r.pageErrors.length || r.networkErrors.length);
console.log(`Total: ${allResults.length}, with errors: ${withErrors.length}`);
if (withErrors.length) {
  console.log('\n=== ERRORS ===');
  for (const r of withErrors) {
    console.log(`${r.url} (${r.status}):`);
    r.consoleErrors.slice(0, 2).forEach(e => console.log(`  console: ${e.slice(0, 150)}`));
    r.pageErrors.slice(0, 2).forEach(e => console.log(`  page: ${e.slice(0, 150)}`));
    r.networkErrors.slice(0, 2).forEach(e => console.log(`  net: ${e}`));
  }
}
