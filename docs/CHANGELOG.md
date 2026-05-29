# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-29

### Added

- **Multi-language Support (i18n)**: Full pt-BR and en locale files (242+ translations) with spiritual terminology — sefirots, odus, orixas, numerologia, arcano, elementos, ciclos, praticas, affirmacoes
- **LanguageSwitcher Component**: UI toggle with flag icons (🇧🇷/🇺🇸), localStorage persistence, click-outside dismissal
- **Analytics Dashboard**: StatsOverview (sessões, dias de prática, streak, média), ProgressChart (SVG bar chart semanal), SessionInsightsPanel (insights por tipo), MeditationStats (métricas + anel de progresso)
- **Security headers middleware**: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Rate limit monitoring system**: Real-time tracking for abuse prevention
- **Push notifications service**: User engagement via web-push
- **Zod validators**: Type-safe API request/response validation

### Changed

- Dashboard layout with collapsible sections for better organization
- Dashboard components migrated to CollapsibleSection format

### Fixed

- SpiritualFinanceWidget.tsx: restored missing interface declaration

### Security

- Security headers middleware (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Rate limit monitoring for abuse prevention

## [0.9.0] - 2026-05-28

### Added

- Dashboard widgets: 35+ spiritual widgets including AI Oracle Chat, CorrelationViz, MoonRitualPlanner, LoveReadingsWidget, GuidedMeditationWidget
- Wellness dashboard integration
- Notification center with toast system
- PWA features: manifest, service worker, offline mode, mobile nav

### Fixed

- Auth JWT validation edge cases
- Numerology calculation edge cases with master numbers
