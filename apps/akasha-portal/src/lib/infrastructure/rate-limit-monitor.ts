// ============================================================
// RATE LIMIT MONITOR - CABALA DOS CAMINHOS
// ============================================================
// Monitoring and analytics for rate limiting
// ============================================================

interface RateLimitEvent {
  identifier: string;
  timestamp: number;
  allowed: boolean;
  endpoint?: string;
  method?: string;
}

interface RateLimitStats {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  uniqueIdentifiers: number;
  topIdentifiers: Array<{ identifier: string; count: number; blocked: number }>;
  byEndpoint: Record<string, { allowed: number; blocked: number }>;
  timeSeries: Array<{ timestamp: number; allowed: number; blocked: number }>;
}

interface RateLimitAlert {
  identifier: string;
  blockedCount: number;
  threshold: number;
  timestamp: number;
}

class RateLimitMonitor {
  private static instance: RateLimitMonitor;
  private events: RateLimitEvent[] = [];
  private alerts: RateLimitAlert[] = [];
  private readonly maxEvents = 10000;
  private readonly alertThreshold = 10; // Blocked requests in 1 minute
  private readonly alertCooldown = 60000; // 1 minute between alerts for same identifier

  private constructor() {
    // Clean up old events periodically
    setInterval(() => this.cleanup(), 60000);
  }

  static getInstance(): RateLimitMonitor {
    if (!RateLimitMonitor.instance) {
      RateLimitMonitor.instance = new RateLimitMonitor();
    }
    return RateLimitMonitor.instance;
  }

  record(identifier: string, allowed: boolean, endpoint?: string, method?: string) {
    const event: RateLimitEvent = {
      identifier,
      timestamp: Date.now(),
      allowed,
      endpoint,
      method,
    };

    this.events.push(event);

    // Trim if too many events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Check for alert conditions
    if (!allowed) {
      this.checkAlertCondition(identifier);
    }
  }

  private checkAlertCondition(identifier: string) {
    const oneMinuteAgo = Date.now() - 60000;
    const recentBlocked = this.events.filter(
      (e) => e.identifier === identifier && !e.allowed && e.timestamp > oneMinuteAgo
    ).length;

    // Check cooldown
    const lastAlert = this.alerts
      .filter((a) => a.identifier === identifier)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (recentBlocked >= this.alertThreshold) {
      if (!lastAlert || Date.now() - lastAlert.timestamp > this.alertCooldown) {
        this.alerts.push({
          identifier,
          blockedCount: recentBlocked,
          threshold: this.alertThreshold,
          timestamp: Date.now(),
        });
      }
    }
  }

  private cleanup() {
    const oneHourAgo = Date.now() - 3600000;
    this.events = this.events.filter((e) => e.timestamp > oneHourAgo);
    this.alerts = this.alerts.filter((a) => Date.now() - a.timestamp < 3600000);
  }

  getStats(timeWindowMs = 3600000): RateLimitStats {
    const cutoff = Date.now() - timeWindowMs;
    const relevantEvents = this.events.filter((e) => e.timestamp > cutoff);

    const allowedRequests = relevantEvents.filter((e) => e.allowed).length;
    const blockedRequests = relevantEvents.filter((e) => !e.allowed).length;
    const uniqueIdentifiers = new Set(relevantEvents.map((e) => e.identifier)).size;

    // Top identifiers
    const identifierCounts = new Map<string, { allowed: number; blocked: number }>();
    relevantEvents.forEach((e) => {
      const current = identifierCounts.get(e.identifier) || { allowed: 0, blocked: 0 };
      if (e.allowed) {
        current.allowed++;
      } else {
        current.blocked++;
      }
      identifierCounts.set(e.identifier, current);
    });

    const topIdentifiers = Array.from(identifierCounts.entries())
      .map(([identifier, counts]) => ({
        identifier,
        ...counts,
        count: counts.allowed + counts.blocked,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // By endpoint
    const byEndpoint: Record<string, { allowed: number; blocked: number }> = {};
    relevantEvents.forEach((e) => {
      if (e.endpoint) {
        const current = byEndpoint[e.endpoint] || { allowed: 0, blocked: 0 };
        if (e.allowed) {
          current.allowed++;
        } else {
          current.blocked++;
        }
        byEndpoint[e.endpoint] = current;
      }
    });

    // Time series (5-minute buckets)
    const buckets = new Map<number, { allowed: number; blocked: number }>();
    for (let t = cutoff; t <= Date.now(); t += 300000) {
      buckets.set(t, { allowed: 0, blocked: 0 });
    }

    relevantEvents.forEach((e) => {
      const bucketTime = Math.floor(e.timestamp / 300000) * 300000;
      const bucket = buckets.get(bucketTime);
      if (bucket) {
        if (e.allowed) {
          bucket.allowed++;
        } else {
          bucket.blocked++;
        }
      }
    });

    const timeSeries = Array.from(buckets.entries())
      .map(([timestamp, counts]) => ({ timestamp, ...counts }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      totalRequests: relevantEvents.length,
      allowedRequests,
      blockedRequests,
      uniqueIdentifiers,
      topIdentifiers,
      byEndpoint,
      timeSeries,
    };
  }

  getAlerts(since?: number): RateLimitAlert[] {
    if (since) {
      return this.alerts.filter((a) => a.timestamp > since);
    }
    return [...this.alerts];
  }

  clearAlerts() {
    this.alerts = [];
  }

  getHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    blockRate: number;
    activeIdentifiers: number;
    recentAlerts: number;
  } {
    const stats = this.getStats(60000); // Last minute
    const blockRate =
      stats.totalRequests > 0 ? (stats.blockedRequests / stats.totalRequests) * 100 : 0;
    const recentAlerts = this.getAlerts(Date.now() - 60000).length;

    let status: 'healthy' | 'degraded' | 'critical';
    if (blockRate > 50 || recentAlerts > 5) {
      status = 'critical';
    } else if (blockRate > 20 || recentAlerts > 2) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      status,
      blockRate: Math.round(blockRate * 100) / 100,
      activeIdentifiers: stats.uniqueIdentifiers,
      recentAlerts,
    };
  }
}

export const rateLimitMonitor = RateLimitMonitor.getInstance();

// Middleware integration
function recordRateLimitEvent(
  identifier: string,
  allowed: boolean,
  endpoint?: string,
  method?: string
) {
  rateLimitMonitor.record(identifier, allowed, endpoint, method);
}
