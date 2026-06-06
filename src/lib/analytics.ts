/**
/**
 * Analytics Module
 * @module analytics
 *
 * No-op analytics stub — implementation deferred to analytics/session-insights.ts
 */

export type FunnelStepName = string

export const analytics = {
  track: (name: string, _properties?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics]', name, _properties)
    }
  },
  page: (name: string, _properties?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics:page]', name, _properties)
    }
  },
  identify: (userId: string, _properties?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics:identify]', userId, _properties)
    }
  },
}

export const track = (name: string, properties?: Record<string, unknown>) =>
  analytics.track(name, properties)

export const page = (name: string, properties?: Record<string, unknown>) =>
  analytics.page(name, properties)

export const identify = (userId: string, properties?: Record<string, unknown>) =>
  analytics.identify(userId, properties)
