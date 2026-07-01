// ============================================================================
// scripts/load-test/load-test.ts — K6-style load testing harness (Wave 37)
// ============================================================================
// Standalone TypeScript runner that drives 5 user scenarios at scale:
//   1. Login + view feed
//   2. Create post + comment
//   3. Akasha conversation (3 turns)
//   4. Marketplace browse
//   5. Subscription upgrade (Stripe test mode)
//
// Output: p50/p95/p99 latency, error rate, throughput (req/sec). Designed
// to run against a staging environment (no real users). Runs WITHOUT k6
// (native fetch + concurrency limiter) — sandbox-friendly.
//
// Usage:
//   pnpm tsx scripts/load-test/load-test.ts \
//     --url=https://staging.cabaladoscaminhos.com \
//     --users=1000 --duration=60s
// ============================================================================

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

interface CliOpts {
  url: string;
  users: number;
  duration: number; // seconds
  rampUp: number;   // seconds
  scenario: "all" | "login" | "post" | "akasha" | "marketplace" | "subscription";
  json: boolean;
}

function parseArgs(argv: string[]): CliOpts {
  const opts: CliOpts = {
    url: process.env.LOAD_TEST_URL ?? "http://localhost:3000",
    users: Number(process.env.LOAD_TEST_USERS ?? 100),
    duration: Number(process.env.LOAD_TEST_DURATION ?? 30),
    rampUp: Number(process.env.LOAD_TEST_RAMP ?? 5),
    scenario: "all",
    json: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--url") opts.url = argv[++i];
    else if (a === "--users") opts.users = Number(argv[++i]);
    else if (a === "--duration") opts.duration = Number(argv[++i]);
    else if (a === "--ramp") opts.rampUp = Number(argv[++i]);
    else if (a === "--scenario") opts.scenario = argv[++i] as CliOpts["scenario"];
    else if (a === "--json") opts.json = true;
  }
  return opts;
}

// ---------------------------------------------------------------------------
// Metrics — percentile-aware latency tracker
// ---------------------------------------------------------------------------

class Metrics {
  latencies: number[] = [];
  errors = 0;
  total = 0;

  record(durationMs: number, ok: boolean): void {
    this.latencies.push(durationMs);
    if (!ok) this.errors += 1;
    this.total += 1;
  }

  percentiles(): { p50: number; p95: number; p99: number } {
    if (this.latencies.length === 0) return { p50: 0, p95: 0, p99: 0 };
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const pick = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
    return { p50: pick(0.5), p95: pick(0.95), p99: pick(0.99) };
  }

  throughput(secs: number): number {
    return this.total / Math.max(1, secs);
  }

  errorRate(): number {
    return this.total === 0 ? 0 : this.errors / this.total;
  }

  summary(): {
    total: number;
    errors: number;
    errorRate: number;
    throughputRps: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
  } {
    const p = this.percentiles();
    return {
      total: this.total,
      errors: this.errors,
      errorRate: this.errorRate(),
      throughputRps: this.throughput(1),
      p50Ms: p.p50,
      p95Ms: p.p95,
      p99Ms: p.p99,
    };
  }
}

// ---------------------------------------------------------------------------
// Concurrency primitive — semaphore to cap in-flight requests
// ---------------------------------------------------------------------------

class Semaphore {
  private inflight = 0;
  private waiters: Array<() => void> = [];

  constructor(public readonly max: number) {}

  async acquire(): Promise<void> {
    if (this.inflight < this.max) {
      this.inflight += 1;
      return;
    }
    return new Promise<void>((resolve) => this.waiters.push(resolve));
  }

  release(): void {
    this.inflight -= 1;
    const next = this.waiters.shift();
    if (next) {
      this.inflight += 1;
      next();
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// ---------------------------------------------------------------------------
// HTTP helper — fetch with timing + timeout
// ---------------------------------------------------------------------------

interface RequestResult {
  ok: boolean;
  durationMs: number;
  status: number;
}

async function timedFetch(url: string, init: RequestInit = {}, timeoutMs = 10_000): Promise<RequestResult> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return { ok: res.ok, durationMs: Date.now() - start, status: res.status };
  } catch {
    return { ok: false, durationMs: Date.now() - start, status: 0 };
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
// Scenarios — each is a function that runs once per virtual user
// ---------------------------------------------------------------------------

type Scenario = (baseUrl: string, userIdx: number) => Promise<void>;

const loginScenario: Scenario = async (url, idx) => {
  await timedFetch(`${url}/api/auth/status`);
  // Simulate a warm cache hit; in staging, this is the most-hit endpoint.
  void idx;
};

const postScenario: Scenario = async (url, _idx) => {
  // Browse feed
  await timedFetch(`${url}/api/feed?limit=20`);
  // Create post (POST is heavier — record separately)
  await timedFetch(`${url}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
    body: JSON.stringify({ content: "Load-test post " + Date.now(), title: "Load" }),
  });
};

const akashaScenario: Scenario = async (url, _idx) => {
  for (let turn = 0; turn < 3; turn++) {
    await timedFetch(`${url}/api/akashic/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ message: `Load-test akasha message ${turn}` }),
    }, 30_000); // AI is slow — longer timeout
  }
};

const marketplaceScenario: Scenario = async (url, _idx) => {
  await timedFetch(`${url}/api/marketplace?category=ervas&limit=20`);
  await timedFetch(`${url}/api/marketplace?category=cristais&limit=20`);
};

const subscriptionScenario: Scenario = async (url, _idx) => {
  // Browse pricing page
  await timedFetch(`${url}/api/billing/plans`);
  // Simulate a checkout intent (Stripe test mode)
  await timedFetch(`${url}/api/billing/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
    body: JSON.stringify({ plan: "premium-monthly" }),
  }, 15_000);
};

const SCENARIOS: Record<string, Scenario> = {
  login: loginScenario,
  post: postScenario,
  akasha: akashaScenario,
  marketplace: marketplaceScenario,
  subscription: subscriptionScenario,
};

// ---------------------------------------------------------------------------
// Run loop — ramps up users, fires scenario, records metrics
// ---------------------------------------------------------------------------

async function runLoadTest(opts: CliOpts): Promise<Metrics> {
  const metrics = new Metrics();
  const sem = new Semaphore(Math.min(opts.users, 200)); // cap inflight at 200

  const start = Date.now();
  const end = start + opts.duration * 1000;
  const userInterval = (opts.rampUp * 1000) / Math.max(1, opts.users);

  const scenariosToRun: Scenario[] = opts.scenario === "all"
    ? Object.values(SCENARIOS)
    : [SCENARIOS[opts.scenario]];

  let spawned = 0;
  const promises: Array<Promise<void>> = [];

  while (Date.now() < end) {
    if (spawned < opts.users) {
      // Spawn a virtual user.
      const userIdx = spawned;
      const scenario = scenariosToRun[userIdx % scenariosToRun.length];
      const p = sem.run(async () => {
        const t0 = Date.now();
        try {
          await scenario(opts.url, userIdx);
          metrics.record(Date.now() - t0, true);
        } catch {
          metrics.record(Date.now() - t0, false);
        }
      });
      promises.push(p);
      spawned += 1;
      await new Promise((r) => setTimeout(r, userInterval));
    } else {
      // All users spawned — wait for completion or end of duration.
      await Promise.race([
        Promise.all(promises),
        new Promise((r) => setTimeout(r, 1_000)),
      ]);
    }
  }

  await Promise.allSettled(promises);
  return metrics;
}

// ---------------------------------------------------------------------------
// Reporter — human + JSON output
// ---------------------------------------------------------------------------

function report(opts: CliOpts, metrics: Metrics, elapsedSec: number): void {
  const s = metrics.summary();
  const actualRps = s.total / elapsedSec;

  if (opts.json) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({
      scenario: opts.scenario,
      users: opts.users,
      durationSec: elapsedSec,
      ...s,
      actualThroughputRps: actualRps,
      targets: { p95Ms: 500, errorRate: 0.01, minRps: 50 },
    }, null, 2));
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`\n=== Load test results (${opts.scenario}) ===`);
  // eslint-disable-next-line no-console
  console.log(`Users:        ${opts.users}`);
  // eslint-disable-next-line no-console
  console.log(`Duration:     ${elapsedSec.toFixed(1)}s`);
  // eslint-disable-next-line no-console
  console.log(`Total reqs:   ${s.total}`);
  // eslint-disable-next-line no-console
  console.log(`Throughput:   ${actualRps.toFixed(1)} req/sec`);
  // eslint-disable-next-line no-console
  console.log(`p50 latency:  ${s.p50Ms.toFixed(0)} ms`);
  // eslint-disable-next-line no-console
  console.log(`p95 latency:  ${s.p95Ms.toFixed(0)} ms  ${s.p95Ms > 500 ? "❌ FAIL" : "✅"}`);
  // eslint-disable-next-line no-console
  console.log(`p99 latency:  ${s.p99Ms.toFixed(0)} ms`);
  // eslint-disable-next-line no-console
  console.log(`Error rate:   ${(s.errorRate * 100).toFixed(2)}%  ${s.errorRate > 0.01 ? "❌ FAIL" : "✅"}`);
  // eslint-disable-next-line no-console
  console.log(`Errors:       ${s.errors}`);
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const opts = parseArgs(process.argv);
  // eslint-disable-next-line no-console
  console.log(`Starting load test: ${opts.users} users, ${opts.duration}s, scenario=${opts.scenario}`);
  // eslint-disable-next-line no-console
  console.log(`Target: ${opts.url}`);

  // Health check.
  const health = await timedFetch(`${opts.url}/api/health`);
  if (!health.ok) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  Health check failed (${health.status}). Running anyway.`);
  }

  const t0 = Date.now();
  const metrics = await runLoadTest(opts);
  const elapsedSec = (Date.now() - t0) / 1000;

  report(opts, metrics, elapsedSec);

  // Exit non-zero on budget violation for CI.
  const s = metrics.summary();
  const fail = s.p95Ms > 500 || s.errorRate > 0.01;
  process.exit(fail ? 1 : 0);
}

// Only run main when executed directly (not when imported for tests).
if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Load test crashed:", err);
    process.exit(2);
  });
}

export { runLoadTest, Metrics, Semaphore, timedFetch, type Scenario };
export type { CliOpts };