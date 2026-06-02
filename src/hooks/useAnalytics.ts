// fallow-ignore-file unused-file
'use client';
import { useEffect, useCallback, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsTrackOptions {
  [key: string]: string | number | boolean | undefined;
}

interface AnalyticsService {
  trackPage: (path: string, title?: string) => void;
  trackEvent: (name: string, properties?: AnalyticsTrackOptions) => void;
}

const defaultAnalytics: AnalyticsService = {
  trackPage: (path: string, title?: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('config', 'G-XXXXXXXXXX', {
        page_path: path,
        page_title: title,
      });
    }
    console.debug('[Analytics] Page view:', { path, title });
  },
  trackEvent: (name: string, properties?: AnalyticsTrackOptions) => {
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', name, properties);
    }
    console.debug('[Analytics] Event:', { name, properties });
  },
};

export function useAnalytics(customAnalytics?: Partial<AnalyticsService>): AnalyticsService {
  const pathname = usePathname();
  const searchParams = useSearchParams();
 // Use useMemo to avoid recreating analytics object on every render
  const analytics = useMemo(() => {
    return customAnalytics
      ? { ...defaultAnalytics, ...customAnalytics }
      : defaultAnalytics;
  }, [customAnalytics]);
  useEffect(() => {
    const path = `${pathname}${searchParams.toString() ? `?${searchParams}` : ''}`;
    analytics.trackPage(path, document.title);
  }, [pathname, searchParams, analytics]);
  const trackPage = useCallback(
    (path: string, title?: string) => {
      analytics.trackPage(path, title);
    },
    [analytics]
  );
  const trackEvent = useCallback(
    (name: string, properties?: AnalyticsTrackOptions) => {
      analytics.trackEvent(name, properties);
    },
    [analytics]
  );
  return { trackPage, trackEvent };
}

export type { AnalyticsTrackOptions };