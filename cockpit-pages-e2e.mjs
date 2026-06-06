import { chromium } from 'playwright';

const BASE = 'http://localhost:3456';
const CHROME = '/usr/bin/google-chrome-stable';

async function screenshot(page, name) {
  const path = `/tmp/cockpit-ss-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function inspectPage(browser, url, name, description) {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`[PAGE ERROR] ${err.message}`));

  const result = {
    name,
    description,
    requestedUrl: url,
    httpStatus: null,
    finalUrl: null,
    title: null,
    headings: [],
    inputs: [],
    buttons: [],
    forms: [],
    links: [],
    errorMessages: [],
    consoleErrors,
    screenshot: null,
    error: null,
  };

  try {
    // Follow redirects to get final state
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    result.httpStatus = resp?.status();
    result.finalUrl = page.url();

    await page.waitForTimeout(2000);
    result.title = await page.title().catch(() => null);
    result.screenshot = await screenshot(page, name);

    result.headings = await page.$$eval('h1,h2,h3,h4', els =>
      els.map(el => ({ tag: el.tagName, text: el.textContent?.trim().substring(0, 120) }))
    ).catch(() => []);

    result.inputs = await page.$$eval('input', els =>
      els.map(el => ({
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        'aria-label': el.getAttribute('aria-label'),
      }))
    ).catch(() => []);

    result.buttons = await page.$$eval('button', els =>
      els.map(el => ({
        type: el.type,
        text: el.textContent?.trim().substring(0, 80),
        id: el.id,
        disabled: el.disabled,
      }))
    ).catch(() => []);

    result.forms = await page.$$eval('form', els =>
      els.map(el => ({
        action: el.action,
        method: el.method,
        id: el.id,
      }))
    ).catch(() => []);

    result.links = await page.$$eval('a[href]', els =>
      els.map(el => ({
        href: el.getAttribute('href'),
        text: el.textContent?.trim().substring(0, 80),
      }))
    ).catch(() => []);

    result.errorMessages = await page.$$eval('[role="alert"], .error, .error-message, [aria-invalid="true"]', els =>
      els.map(el => el.textContent?.trim().substring(0, 200))
    ).catch(() => []);

  } catch (err) {
    result.error = err.message;
  }

  await ctx.close();
  return result;
}

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const tests = [
  ['/cockpit/login', 'cockpit-login', 'Cockpit login page — expected to render the login form'],
  ['/cockpit', 'cockpit-root', 'Cockpit root — expected to redirect to /cockpit/login'],
  ['/cockpit/consulentes', 'cockpit-consulentes', 'Cockpit consulentes — expected to redirect to /cockpit/login'],
  ['/cockpit/leituras', 'cockpit-leituras', 'Cockpit leituras — expected to redirect to /cockpit/login'],
];

const results = [];
for (const [path, name, desc] of tests) {
  process.stderr.write(`Testing ${path}... `);
  const r = await inspectPage(browser, `${BASE}${path}`, name, desc);
  results.push(r);
  process.stderr.write(
    `HTTP ${r.httpStatus} | final: ${r.finalUrl} | title: ${r.title} | ` +
    `errors: ${r.consoleErrors.length + r.errorMessages.length}\n`
  );
}

await browser.close();

const { writeFileSync } = await import('fs');
writeFileSync('/tmp/cockpit-e2e-final.json', JSON.stringify(results, null, 2));

// Pretty print summary
for (const r of results) {
  process.stdout.write(`\n${'='.repeat(60)}\n`);
  process.stdout.write(`${r.name} — ${r.description}\n`);
  process.stdout.write(`  Requested:  ${r.requestedUrl}\n`);
  process.stdout.write(`  Final URL:  ${r.finalUrl}\n`);
  process.stdout.write(`  HTTP Status: ${r.httpStatus}\n`);
  process.stdout.write(`  Page Title: ${r.title}\n`);
  if (r.error) {
    process.stdout.write(`  ERROR: ${r.error}\n`);
  }
  if (r.headings.length) {
    process.stdout.write(`  Headings: ${r.headings.map(h => `${h.tag}: "${h.text}"`).join(', ')}\n`);
  }
  if (r.inputs.length) {
    process.stdout.write(`  Inputs: ${r.inputs.map(i => `${i.type}${i.name ? `(${i.name})` : ''}`).join(', ')}\n`);
  }
  if (r.buttons.length) {
    process.stdout.write(`  Buttons: ${r.buttons.map(b => `"${b.text}"${b.disabled ? ' [DISABLED]' : ''}`).join(', ')}\n`);
  }
  if (r.forms.length) {
    process.stdout.write(`  Forms: ${r.forms.map(f => `method=${f.method}`).join(', ')}\n`);
  }
  if (r.errorMessages.length) {
    process.stdout.write(`  Error messages: ${r.errorMessages.join(' | ')}\n`);
  }
  if (r.consoleErrors.length) {
    process.stdout.write(`  Console errors: ${r.consoleErrors.join(' | ')}\n`);
  }
  process.stdout.write(`  Screenshot: ${r.screenshot}\n`);
}
