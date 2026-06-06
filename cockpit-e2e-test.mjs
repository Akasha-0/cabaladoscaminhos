import { chromium } from 'playwright';

const BASE = 'http://localhost:3456';
const CHROME_PATH = '/usr/bin/google-chrome-stable';
const OUT = '/tmp/cockpit-e2e-results.json';

const results = [];

async function screenshot(page, name) {
  const path = `/tmp/cockpit-screenshot-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function getConsoleErrors(page) {
  return page.context()._consoleErrors || [];
}

async function testPage(browser, url, name, description) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`[PAGE ERROR] ${err.message}`));

  const result = {
    name,
    description,
    url,
    status: null,
    finalUrl: null,
    elements: [],
    consoleErrors,
    redirectChain: [],
    screenshot: null,
  };

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    result.status = response?.status();
    result.finalUrl = page.url();
    result.redirectChain = response?.redirectedFrom ? [response.redirectedFrom()] : [];
    if (response?.redirectedFrom) {
      const chain = [];
      let r = response;
      while (r?.redirectedFrom) {
        chain.push(r.redirectedFrom());
        // we can't get the full chain easily, just note the final
      }
      result.redirectChain = chain;
    }

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);

    // Get page title
    result.title = await page.title();

    // Capture screenshot
    result.screenshot = await screenshot(page, name);

    // Collect form elements
    const inputs = await page.$$eval('input', els => els.map(el => ({
      tag: 'input',
      type: el.type,
      name: el.name,
      id: el.id,
      placeholder: el.placeholder,
      ariaLabel: el.getAttribute('aria-label'),
      autocomplete: el.autocomplete,
    })));

    const buttons = await page.$$eval('button', els => els.map(el => ({
      tag: 'button',
      type: el.type,
      text: el.textContent?.trim(),
      id: el.id,
      disabled: el.disabled,
    })));

    const forms = await page.$$eval('form', els => els.map(el => ({
      tag: 'form',
      action: el.action,
      method: el.method,
      id: el.id,
    })));

    const links = await page.$$eval('a', els => els.map(el => ({
      tag: 'a',
      href: el.href,
      text: el.textContent?.trim(),
    })));

    const headings = await page.$$eval('h1,h2,h3,h4,h5,h6', els => els.map(el => ({
      tag: el.tagName.toLowerCase(),
      text: el.textContent?.trim(),
    })));

    const errors = await page.$$eval('[role="alert"], .error, .error-message, [aria-invalid]', els => els.map(el => ({
      tag: el.tagName.toLowerCase(),
      class: el.className,
      text: el.textContent?.trim().substring(0, 200),
    })));

    result.elements = { inputs, buttons, forms, links, headings, errors };

  } catch (err) {
    result.error = err.message;
  }

  await context.close();
  return result;
}

const browser = await chromium.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

try {
  // Test 1: /cockpit/login - Login form visible?
  results.push(await testPage(
    browser,
    `${BASE}/cockpit/login`,
    'cockpit-login',
    'Cockpit login page'
  ));

  // Test 2: /cockpit (should redirect to /cockpit/login)
  results.push(await testPage(
    browser,
    `${BASE}/cockpit`,
    'cockpit-root',
    'Cockpit root - should redirect to login'
  ));

  // Test 3: /cockpit/consulentes (should redirect to /cockpit/login)
  results.push(await testPage(
    browser,
    `${BASE}/cockpit/consulentes`,
    'cockpit-consulentes',
    'Cockpit consulentes - should redirect to login'
  ));

  // Test 4: /cockpit/leituras (should redirect to /cockpit/login)
  results.push(await testPage(
    browser,
    `${BASE}/cockpit/leituras`,
    'cockpit-leituras',
    'Cockpit leituras - should redirect to login'
  ));
} finally {
  await browser.close();
}

import { writeFileSync } from 'fs';
writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log('Results written to', OUT);
console.log(JSON.stringify(results, null, 2));
