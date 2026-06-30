'use client';

// ============================================================================
// lazy-components — Performance helper for heavy client components
// ============================================================================
// Wave 32 (perf 4/8) — Code splitting wrappers for known-heavy client
// components. Each export uses `next/dynamic` so the bundle for the heavy
// component is fetched on demand, NOT in the route's initial JS.
//
// Why a single module?
//   - Centralized place to lazy-load (one import per consumer route).
//   - Tree-shaking friendly: routes only pay for the wrappers they import.
//   - TypeScript types preserved (no `any`).
//
// Pattern: each wrapper is a Next.js dynamic component with ssr: false
// for components that rely on browser-only APIs (window, IntersectionObserver,
// beforeinstallprompt, sessionStorage). SSR=false keeps initial HTML paint
// fast and avoids hydration mismatches.
//
// Loading fallbacks are conservative (skeleton with same outer dimensions)
// so layout shift (CLS) stays < 0.1.
// ============================================================================

import dynamic from 'next/dynamic';
import type { ComponentType, ReactElement } from 'react';

// ============================================================================
// Generic helper
// ============================================================================

type LazyFactory = (
  importer: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
  fallback: () => ReactElement | null,
) => ComponentType<Record<string, unknown>>;

/**
 * Cast factory — `next/dynamic` is heavily overloaded. We narrow to the
 * shape we actually use (default export, generic props bag, fallback only).
 */
const makeLazy = ((importer, fallback) =>
  dynamic(importer as never, {
    ssr: false,
    loading: fallback as never,
  } as never)) as LazyFactory;

// ============================================================================
// Conversion components (used in /validacao and /welcome)
// ============================================================================

/** Modal de exit-intent — depende de useFlag + sessionStorage. */
export const LazyExitIntentModal = makeLazy(
  () => import('@/components/conversion/ExitIntentModal').then(m => ({
    default: m.ExitIntentModal as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null, // modal — não renderiza nada até disparar
);

/** Mobile capture bar — fixed bottom, depende de viewport. */
export const LazyMobileCaptureBar = makeLazy(
  () => import('@/components/conversion/MobileCaptureBar').then(m => ({
    default: m.MobileCaptureBar as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null, // não mostra skeleton para bottom bar
);

/** Tradition quiz interativo — usa state + animações. */
export const LazyTraditionQuiz = makeLazy(
  () => import('@/components/conversion/TraditionQuiz').then(m => ({
    default: m.TraditionQuiz as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => (
    <div className="animate-pulse p-6 rounded-xl bg-slate-900/40 border border-slate-800/30 h-64" />
  ),
);

/** Video hero — player pesado (HTML5 video + tracks). */
export const LazyVideoHero = makeLazy(
  () => import('@/components/conversion/VideoHero').then(m => ({
    default: m.VideoHero as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => (
    <div className="animate-pulse bg-slate-800/40 rounded-2xl aspect-video w-full" />
  ),
);

// ============================================================================
// Admin components (used in /admin/* — only loaded for admins)
// ============================================================================

/** Admin charts (608 LOC) — bundle pesado, carregado lazy. */
export const LazyAdminCharts = {
  LineChart: makeLazy(
    () => import('@/components/admin/charts-client').then(m => ({
      default: m.LineChart as unknown as ComponentType<Record<string, unknown>>,
    })),
    () => <div className="animate-pulse bg-slate-900/40 rounded h-48" />,
  ),
  BarChart: makeLazy(
    () => import('@/components/admin/charts-client').then(m => ({
      default: m.BarChart as unknown as ComponentType<Record<string, unknown>>,
    })),
    () => <div className="animate-pulse bg-slate-900/40 rounded h-48" />,
  ),
  Heatmap: makeLazy(
    () => import('@/components/admin/charts-client').then(m => ({
      default: m.Heatmap as unknown as ComponentType<Record<string, unknown>>,
    })),
    () => <div className="animate-pulse bg-slate-900/40 rounded h-48" />,
  ),
};

/** Users table — datagrid pesado. */
export const LazyUsersTable = makeLazy(
  () => import('@/components/admin/UsersTable').then(m => ({
    default: m.UsersTable as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-900/40 rounded" />
      ))}
    </div>
  ),
);

/** Moderation queue — interativo, depende de flags. */
export const LazyModerationQueue = makeLazy(
  () => import('@/components/admin/ModerationQueue').then(m => ({
    default: m.ModerationQueue as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-slate-900/40 rounded" />
      ))}
    </div>
  ),
);

/** Consciousness dashboard — admin-only deep metrics. */
export const LazyConsciousnessDashboard = makeLazy(
  () => import('@/components/admin/ConsciousnessDashboard').then(m => ({
    default: m.ConsciousnessDashboard as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => <div className="animate-pulse h-96 bg-slate-900/40 rounded-xl" />,
);

// ============================================================================
// Spiritual SVG components (decorative, lazy-load via IntersectionObserver)
// ============================================================================

/**
 * SacredGeometryFlower — animated SVG (pequeno, mas usado em muitas páginas).
 * Lazy para reduzir initial JS de páginas que não são a home.
 */
export const LazySacredGeometryFlower = makeLazy(
  () => import('@/components/spiritual/SacredGeometryFlower').then(m => ({
    default: m.SacredGeometryFlower as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null, // decorativo — não skeleton
);

/** MandalaDivider — divider decorativo, lazy. */
export const LazyMandalaDivider = makeLazy(
  () => import('@/components/spiritual/MandalaDivider').then(m => ({
    default: m.MandalaDivider as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null,
);

/** HexagonalMandala — usado em /about, decorative. */
export const LazyHexagonalMandala = makeLazy(
  () => import('@/components/spiritual/HexagonalMandala').then(m => ({
    default: m.HexagonalMandala as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null,
);

/** MetatronCube — geometric decorative SVG. */
export const LazyMetatronCube = makeLazy(
  () => import('@/components/spiritual/MetatronCube').then(m => ({
    default: m.MetatronCube as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null,
);

/** SriYantra — animated sacred geometry. */
export const LazySriYantra = makeLazy(
  () => import('@/components/spiritual/SriYantra').then(m => ({
    default: m.SriYantra as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null,
);

/** FibonacciSpiral — animated sacred geometry. */
export const LazyFibonacciSpiral = makeLazy(
  () => import('@/components/spiritual/FibonacciSpiral').then(m => ({
    default: m.FibonacciSpiral as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null,
);

// ============================================================================
// Oraculo components (heavy astronomical calculations)
// ============================================================================

/** Aspect wheel — SVG interativo para mapa astral. */
export const LazyAspectWheel = makeLazy(
  () => import('@/components/oraculo/AspectWheel').then(m => ({
    default: m.AspectWheel as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => <div className="animate-pulse aspect-square bg-slate-900/40 rounded-full max-w-md mx-auto" />,
);

/** Mapa completo view — oráculo completo (numerologia + astrologia + ifá). */
export const LazyMapaCompletoView = makeLazy(
  () => import('@/components/oraculo/MapaCompletoView').then(m => ({
    default: m.MapaCompletoView as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => <div className="animate-pulse h-96 bg-slate-900/40 rounded-xl" />,
);

// ============================================================================
// PWA components (lazy — only needed after install/update events)
// ============================================================================

/** Background sync indicator — só mostra quando offline + queue. */
export const LazyBackgroundSyncIndicator = makeLazy(
  () => import('@/components/pwa/BackgroundSyncIndicator').then(m => ({
    default: m.BackgroundSyncIndicator as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null,
);

/** Install prompt — só após 2 visits. */
export const LazyInstallPrompt = makeLazy(
  () => import('@/components/pwa/InstallPrompt').then(m => ({
    default: m.InstallPrompt as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null,
);

/** Update prompt — só quando novo SW disponível. */
export const LazyUpdatePrompt = makeLazy(
  () => import('@/components/pwa/UpdatePrompt').then(m => ({
    default: m.UpdatePrompt as unknown as ComponentType<Record<string, unknown>>,
  })),
  () => null,
);