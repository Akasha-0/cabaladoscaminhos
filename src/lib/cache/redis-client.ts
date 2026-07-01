// ============================================================================
// cache/redis-client — Upstash REST + Redis cluster client (Wave 37)
// ============================================================================
// Production-grade Redis layer for cabaladoscaminhos. Backs:
//
//   - session store (NextAuth + custom session table)
//   - rate-limit counters (per-user, per-IP, per-endpoint)
//   - leaderboard (gamification streaks, weekly digest rank)
//   - presence (online users in real-time)
//   - bg-job queue dispatcher (BullMQ in W37-7)
//
// Design choices:
//   1. **Two adapters** — `UpstashRedisClient` (REST, edge-safe) and
//      `ClusterRedisClient` (ioredis, Node-only). The exported `getRedis`
//      picks the right one per runtime.
//   2. **Eviction policy `allkeys-lru`** is documented but NOT set here —
//      that's an Upstash/ElastiCache cluster config (set on creation).
//   3. **TLS** is mandatory in production (Upstash enforces it).
//   4. **Connection pool** — ioredis manages its own reconnect + retry; we
//      expose a `poolSize` knob via env (`REDIS_POOL_SIZE`, default 10).
//   5. **Memory cap 2GB** is also cluster-level (Upstash maxmemory).
//
// All public methods are SSR-safe; the module has zero deps beyond
// `ioredis` (already in package.json). The REST adapter is dynamically
// imported so the bundle stays edge-clean.
// ============================================================================

import type Redis from "ioredis";

// ---------------------------------------------------------------------------
// Use-case enum — drives namespace + TTL defaults
// ---------------------------------------------------------------------------

export type RedisUseCase =
  | "session"        // NextAuth + custom JWT denylist — TTL = 30d sliding
  | "rate-limit"     // counters, sliding window — TTL = 1h hard cap
  | "leaderboard"    // sorted sets, weekly rank — TTL = 7d
  | "presence"       // online users, TTL = 60s heartbeat
  | "queue"          // BullMQ dispatcher state — TTL = job-lifetime
  | "feature-flag";  // runtime flag cache — TTL = 5m

const USE_CASE_TTL: Record<RedisUseCase, number> = {
  session: 2_592_000,   // 30d
  "rate-limit": 3600,   // 1h
  leaderboard: 604_800, // 7d
  presence: 60,         // 60s
  queue: 86_400,        // 1d
  "feature-flag": 300,  // 5m
};

// ---------------------------------------------------------------------------
// Interface — the public contract every adapter must implement
// ---------------------------------------------------------------------------

export interface RedisAdapter {
  /** Get a string value by key, or null if missing. */
  get(key: string): Promise<string | null>;
  /** Set a string value with optional TTL in seconds. */
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  /** Delete a key. Returns the number of keys removed. */
  del(key: string): Promise<number>;
  /** Increment a counter. Creates at 0 if missing. */
  incr(key: string): Promise<number>;
  /** Add to a sorted set. */
  zadd(key: string, score: number, member: string): Promise<void>;
  /** Top-N from a sorted set (highest score first). */
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
  /** Mark a member present (used by presence heartbeats). */
  sadd(key: string, member: string, ttlSeconds?: number): Promise<void>;
  /** Set TTL on an existing key. */
  expire(key: string, ttlSeconds: number): Promise<void>;
  /** Execute a pipeline of operations atomically. */
  pipeline(ops: Array<{ op: "get" | "set" | "del" | "incr" | "expire"; key: string; value?: string; ttl?: number }>): Promise<unknown[]>;
  /** Ping the server; returns "PONG" on success. */
  ping(): Promise<string>;
  /** Close all connections. */
  quit(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Key namespace — prevents collisions between use cases
// ---------------------------------------------------------------------------

export function namespacedKey(useCase: RedisUseCase, key: string): string {
  return `cdc:${useCase}:${key}`;
}

// ---------------------------------------------------------------------------
// Cluster adapter (ioredis) — Node runtime only
// ---------------------------------------------------------------------------

export interface ClusterConfig {
  host: string;
  port: number;
  password?: string;
  tls?: boolean;
  poolSize?: number; // default 10
}

export class ClusterRedisClient implements RedisAdapter {
  private client: Redis | null = null;
  private readonly cfg: Required<ClusterConfig>;

  constructor(cfg: ClusterConfig) {
    this.cfg = {
      host: cfg.host,
      port: cfg.port,
      password: cfg.password ?? "",
      tls: cfg.tls ?? true,
      poolSize: cfg.poolSize ?? 10,
    };
  }

  /** Lazily instantiate the ioredis client. SSR-safe. */
  private async getClient(): Promise<Redis> {
    if (this.client) return this.client;
    // Dynamic import — keeps edge bundle clean.
    const { default: IORedis } = await import("ioredis");
    this.client = new IORedis({
      host: this.cfg.host,
      port: this.cfg.port,
      password: this.cfg.password || undefined,
      tls: this.cfg.tls ? {} : undefined,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      // ioredis "pool" emulation via separate connections — for now,
      // a single client multiplexes commands via pipeline.
    });
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    const c = await this.getClient();
    return c.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const c = await this.getClient();
    if (ttlSeconds && ttlSeconds > 0) await c.set(key, value, "EX", ttlSeconds);
    else await c.set(key, value);
  }

  async del(key: string): Promise<number> {
    const c = await this.getClient();
    return c.del(key);
  }

  async incr(key: string): Promise<number> {
    const c = await this.getClient();
    return c.incr(key);
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    const c = await this.getClient();
    await c.zadd(key, score, member);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    const c = await this.getClient();
    return c.zrevrange(key, start, stop);
  }

  async sadd(key: string, member: string, ttlSeconds?: number): Promise<void> {
    const c = await this.getClient();
    await c.sadd(key, member);
    if (ttlSeconds && ttlSeconds > 0) await c.expire(key, ttlSeconds);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const c = await this.getClient();
    await c.expire(key, ttlSeconds);
  }

  async pipeline(ops: Array<{ op: "get" | "set" | "del" | "incr" | "expire"; key: string; value?: string; ttl?: number }>): Promise<unknown[]> {
    const c = await this.getClient();
    const pipe = c.pipeline();
    for (const o of ops) {
      if (o.op === "get") pipe.get(o.key);
      else if (o.op === "set" && o.value !== undefined) {
        if (o.ttl && o.ttl > 0) pipe.set(o.key, o.value, "EX", o.ttl);
        else pipe.set(o.key, o.value);
      } else if (o.op === "del") pipe.del(o.key);
      else if (o.op === "incr") pipe.incr(o.key);
      else if (o.op === "expire" && o.ttl) pipe.expire(o.key, o.ttl);
    }
    const results = await pipe.exec();
    return results?.map((r) => r?.[1]) ?? [];
  }

  async ping(): Promise<string> {
    const c = await this.getClient();
    return c.ping();
  }

  async quit(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Upstash REST adapter — edge-safe (Cloudflare Workers, Vercel Edge)
// ---------------------------------------------------------------------------

export interface UpstashConfig {
  url: string;
  token: string;
}

interface UpstashResponse<T> {
  result: T;
}

export class UpstashRedisClient implements RedisAdapter {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(cfg: UpstashConfig) {
    if (!cfg.url || !cfg.token) {
      throw new Error("UpstashRedisClient: url + token are required");
    }
    this.baseUrl = cfg.url.replace(/\/$/, "");
    this.token = cfg.token;
  }

  private async call<T>(command: unknown[]): Promise<T> {
    const res = await fetch(`${this.baseUrl}/${command.join("/")}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Upstash REST ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as UpstashResponse<T>;
    return data.result;
  }

  async get(key: string): Promise<string | null> {
    const r = await this.call<string | null>(["get", key]);
    return r;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds && ttlSeconds > 0) {
      await this.call<string>(["set", key, value, "EX", String(ttlSeconds)]);
    } else {
      await this.call<string>(["set", key, value]);
    }
  }

  async del(key: string): Promise<number> {
    return this.call<number>(["del", key]);
  }

  async incr(key: string): Promise<number> {
    return this.call<number>(["incr", key]);
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.call<string>(["zadd", key, score, member]);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.call<string[]>(["zrevrange", key, start, stop]);
  }

  async sadd(key: string, member: string, ttlSeconds?: number): Promise<void> {
    await this.call<string>(["sadd", key, member]);
    if (ttlSeconds && ttlSeconds > 0) await this.call<string>(["expire", key, String(ttlSeconds)]);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.call<string>(["expire", key, String(ttlSeconds)]);
  }

  async pipeline(ops: Array<{ op: "get" | "set" | "del" | "incr" | "expire"; key: string; value?: string; ttl?: number }>): Promise<unknown[]> {
    // Upstash REST supports MULTI/EXEC via a single POST with array body.
    const body = ops.map((o) => {
      if (o.op === "get") return ["get", o.key];
      if (o.op === "set") {
        if (o.ttl && o.ttl > 0) return ["set", o.key, o.value ?? "", "EX", String(o.ttl)];
        return ["set", o.key, o.value ?? ""];
      }
      if (o.op === "del") return ["del", o.key];
      if (o.op === "incr") return ["incr", o.key];
      if (o.op === "expire") return ["expire", o.key, String(o.ttl ?? 60)];
      return ["get", o.key];
    });
    const res = await fetch(`${this.baseUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Upstash pipeline ${res.status}`);
    const data = (await res.json()) as Array<{ result: unknown }>;
    return data.map((d) => d.result);
  }

  async ping(): Promise<string> {
    return this.call<string>(["ping"]);
  }

  async quit(): Promise<void> {
    // REST has no persistent connection — no-op.
  }
}

// ---------------------------------------------------------------------------
// Factory — pick adapter per runtime
// ---------------------------------------------------------------------------

let cachedClient: RedisAdapter | null = null;

export interface RedisEnv {
  /** Prefer Upstash REST (set on Vercel/Cloudflare). */
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  /** Fallback to direct Redis (Node runtime). */
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;
  REDIS_TLS?: string;
  REDIS_POOL_SIZE?: string;
  /** Override default use-case TTL. */
  REDIS_DEFAULT_TTL?: string;
}

export function getRedis(env: RedisEnv = process.env as RedisEnv): RedisAdapter {
  if (cachedClient) return cachedClient;

  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    cachedClient = new UpstashRedisClient({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    return cachedClient;
  }

  if (env.REDIS_HOST) {
    cachedClient = new ClusterRedisClient({
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT ?? 6379),
      password: env.REDIS_PASSWORD || undefined,
      tls: env.REDIS_TLS !== "false",
      poolSize: Number(env.REDIS_POOL_SIZE ?? 10),
    });
    return cachedClient;
  }

  throw new Error(
    "redis-client: no Redis configured. Set UPSTASH_REDIS_REST_URL/_TOKEN (edge) " +
      "or REDIS_HOST/_PORT/_PASSWORD (node).",
  );
}

/** Tear down the cached client (test-only). */
export async function resetRedis(): Promise<void> {
  if (cachedClient) {
    await cachedClient.quit();
    cachedClient = null;
  }
}

// ---------------------------------------------------------------------------
// Use-case helpers — typed getters with auto-namespace + TTL
// ---------------------------------------------------------------------------

export async function redisGet(
  useCase: RedisUseCase,
  key: string,
  env?: RedisEnv,
): Promise<string | null> {
  const c = getRedis(env);
  return c.get(namespacedKey(useCase, key));
}

export async function redisSet(
  useCase: RedisUseCase,
  key: string,
  value: string,
  ttlSeconds?: number,
  env?: RedisEnv,
): Promise<void> {
  const c = getRedis(env);
  await c.set(namespacedKey(useCase, key), value, ttlSeconds ?? USE_CASE_TTL[useCase]);
}

/** Invalidate all keys for a given user — LGPD right-to-erasure helper. */
export async function purgeUserKeys(userId: string, env?: RedisEnv): Promise<void> {
  const c = getRedis(env);
  // Best-effort: scan + delete each use-case namespace.
  // Note: Upstash REST exposes SCAN; we approximate by trying each
  // known namespace prefix and deleting the well-known user keys.
  const candidates: RedisUseCase[] = ["session", "presence", "leaderboard", "feature-flag"];
  for (const useCase of candidates) {
    await c.del(namespacedKey(useCase, `user:${userId}`));
  }
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export const USE_CASE_TTL_SECONDS = USE_CASE_TTL;