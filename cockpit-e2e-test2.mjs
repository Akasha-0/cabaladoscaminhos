import { chromium } from 'playwright';

const BASE = 'http://localhost:3456';
const CHROME_PATH = '/usr/bin/google-chrome-stable';

async function testPage(browser, url, name, description) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const consoleErrors = [];
  const allConsoleLogs = [];
  page.on('console', msg => {
    const t = msg.type();
    if (t === 'error') consoleErrors.push(msg.text());
    allConsoleLogs.push(`[${t}] ${msg.text()}`);
  });
  page.on('pageerror', err => consoleErrors.push(`[PAGE ERROR] ${err.message}`));

  const result = {
    name,
    description,
    url,
    status: null,
    finalUrl: null,
    title: null,
    elements: {},
    consoleErrors,
    consoleLogs: allConsoleLogs,
    screenshot: null,
    error: null,
    rawRedirectChain: [],
  };

  try {
    // Use domcontentloaded to avoid redirect loop error
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    result.status = response?.status();

    // Collect redirect chain
    try {
      const chain = [];
      // Get all requests to trace redirects
      page.on('request', req => {
        if (req.url() !== url && chain.indexOf(req.url()) === -1) {
          chain.push(req.url());
        }
      });
      await page.waitForTimeout(3000);
      result.rawRedirectChain = chain;
    } catch (e) { /* ignore */ }

    result.finalUrl = page.url();
    result.title = await page.title().catch(() => null);

    const screenshotPath = `/tmp/cockpit-screenshot-${name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
    result.screenshot = screenshotPath;

    // Collect form elements
    result.elements = {
      inputs: await page.$$eval('input', els => els.map(el => ({
        type: el.type, name: el.name, id: el.id,
        placeholder: el.placeholder, 'aria-label': el.getAttribute('aria-label'),
      }))).catch(() => []),
      buttons: await page.$$eval('button', els => els.map(el => ({
        type: el.type, text: el.textContent?.trim().substring(0, 80),
        id: el.id, disabled: el.disabled,
      }))).catch(() => []),
      forms: await page.$$eval('form', els => els.map(el => ({
        action: el.action, method: el.method, id: el.id,
      }))).catch(() => []),
      links: await page.$$eval('a[href]', els => els.map(el => ({
        href: el.getAttribute('href'), text: el.textContent?.trim().substring(0, 80),
      }))).catch(() => []),
      headings: await page.$$eval('h1,h2,h3,h4', els => els.map(el => ({
        tag: el.tagName, text: el.textContent?.trim().substring(0, 100),
      }))).catch(() => []),
    };

  } catch (err) {
    result.error = err.message;
  }

  await context.close();
  return result;
}

const browser = await chromium.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-extensions'],
});

const tests = [
  ['/cockpit/login', 'cockpit-login', 'Cockpit login page'],
  ['/cockpit', 'cockpit-root', 'Cockpit root'],
  ['/cockpit/consulentes', 'cockpit-consulentes', 'Cockpit consulentes'],
  ['/cockpit/leituras', 'cockpit-leituras', 'Cockpit leituras'],
];

const results = [];
for (const [path, name, desc] of tests) {
  console.error(`Testing ${path}...`);
  const r = await testPage(browser, `${BASE}${path}`, name, desc);
  results.push(r);
  console.error(`  -> finalUrl: ${r.finalUrl}, status: ${r.status}, title: ${r.title}`);
  if (r.error) console.error(`  -> error: ${r.error}`);
  if (r.consoleErrors.length) console.error(`  -> console errors: ${r.consoleErrors.join(', ')}`);
}

await browser.close();

import { writeFileSync } from 'fs';
writeFileSync('/tmp/cockpit-e2e-results2.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
