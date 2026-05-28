/**
 * Redis client for rate limiting.
 * Falls back to in-memory store if Redis is unavailable.
 */

interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string | number, ...args: unknown[]): Promise<unknown>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
  ping(): Promise<string>;
  quit(): Promise<unknown>;
  disconnect(): void;
}

interface InMemoryStore {
  get(key: string): string | null;
  set(key: string, value: string, ttlSeconds?: number): void;
  incr(key: string): number;
  expire(key: string, seconds: number): void;
}

// In-memory fallback store
const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

function createInMemoryStore(): RedisLike {
  return {
    async get(key: string): Promise<string | null> {
      const entry = memoryStore.get(key);
      if (!entry) return null;
      if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
        memoryStore.delete(key);
        return null;
      }
      return entry.value;
    },

    async set(
      key: string,
      value: string | number,
      ...args: unknown[]
    ): Promise<"OK"> {
      let ttlSeconds: number | undefined;
      const mode = args[0] as string | undefined;
      if (mode === "EX" && typeof args[1] === "number") {
        ttlSeconds = args[1];
      }
      memoryStore.set(key, {
        value: String(value),
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
      });
      return "OK";
    },

    async incr(key: string): Promise<number> {
      const entry = memoryStore.get(key);
      const current =
        entry && (entry.expiresAt === undefined || Date.now() <= entry.expiresAt)
          ? parseInt(entry.value, 10)
          : 0;
      const next = current + 1;
      memoryStore.set(key, { value: String(next), expiresAt: entry?.expiresAt });
      return next;
    },

    async expire(key: string, seconds: number): Promise<number> {
      const entry = memoryStore.get(key);
      if (!entry) return 0;
      entry.expiresAt = Date.now() + seconds * 1000;
      return 1;
    },

    async ping(): Promise<string> {
      return "PONG";
    },

    async quit(): Promise<"OK"> {
      return "OK";
    },

    disconnect(): void {}
  };
}

async function createRedisClient(
  url: string,
  onDisconnect?: () => void
): Promise<RedisLike> {
  // Dynamic import with proper type handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let Redis: new (url: string, options?: object) => any;
  try {
    // ioredis is optional - fallback to in-memory store if not available
     
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - ioredis is optional dependency
    const ioredisModule = await import('ioredis');
    Redis = ioredisModule.default ?? ioredisModule;
  } catch {
    throw new Error("ioredis module not available");
  }
  if (!Redis) {
    throw new Error("ioredis module not available");
  }
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times: number) {
      if (times > 3) return null;
      return Math.min(times * 100, 1000);
    }
  });
  client.on("error", () => {
    // errors are expected — fallback will be used
  });

  if (onDisconnect) {
    client.on("close", () => onDisconnect());
  }

  // Test connectivity
  try {
    await client.ping();
  } catch {
    await client.quit().catch(() => {});
    throw new Error("Redis connection failed");
  }

  return client as unknown as RedisLike;
}

// Singleton client
let redisClient: RedisLike | null = null;
let useMemory = false;

export async function getRedisClient(): Promise<RedisLike> {
  if (redisClient) return redisClient;

  const redisUrl =
    process.env.REDIS_URL ||
    (typeof globalThis !== "undefined"
      ? (globalThis as Record<string, unknown>).__REDIS_URL__
      : undefined);

  if (!redisUrl) {
    useMemory = true;
    redisClient = createInMemoryStore();
    return redisClient;
  }

  try {
    redisClient = await createRedisClient(
      redisUrl as string,
      () => {
        useMemory = true;
        redisClient = createInMemoryStore();
      }
    );
  } catch {
    useMemory = true;
    redisClient = createInMemoryStore();
  }

  return redisClient;
}

// Eagerly initialize the client
getRedisClient().catch(() => {
  useMemory = true;
  redisClient = createInMemoryStore();
});

export { memoryStore as inMemoryStore };
