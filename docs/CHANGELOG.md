# Changelog — Cabala dos Caminhos

## Histórico de Versões

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-06-01

> **Type:** Minor Release  
> **Focus:** Correlation Engine + Documentation  
> **Breaking:** None

### Added

#### Sistema de Correlações
- **DeepCorrelationEngine**: Motor de correlações espirituais cruzadas
  - `analyzeCorrelations()`: Analisa correlações entre sistemas
  - `findCrossSystemPatterns()`: Detecta padrões em múltiplas tradições
  - `calculateEnergyHarmony()`: Calcula harmonia energética entre sistemas
  - `detectPatterns()`: Identifica padrões (recorrentes, elementais, cármicos, bloqueios)

- **Endpoints de Correlação**:
  - `GET /api/correlation/analyze`: Análise temporal de correlações (day, week, lunar, ritual, odu)
  - `POST /api/correlation/diagnosis`: Diagnóstico espiritual baseado em sintomas
  - `POST /api/divination/cross-system`: Divinação integrada (Tarot + Ifá + Numerologia + Astrologia)

- **Matrizes de Correlação**:
  - Tarot ↔ Sefirot (22 arcanos mapeados)
  - Odús ↔ Sefirot (16 Odús mapeados)
  - Numerologia ↔ Chakras (números 1-9 + mestres)
  - Planetas ↔ Orixás (10 regências)

- **Frequências Sagradas**:
  - Sistema de frequências Solfeggio (174 Hz → 963 Hz)
  - Mapeamento chakra → frequência → benefício

#### Documentação
- **VISION.md**: Documento de visão do projeto completo
- **ARCHITECTURE.md**: Arquitetura técnica detalhada
- **CONTRIBUTING.md**: Guia de contribuição para desenvolvedores
- **API.md (expandida)**: Endpoints de correlação documentados
- **COMPONENTS.md (expandida)**: 50+ componentes documentados

### Changed

- **API.md**:
  - Adicionada seção de correlações espirituais
  - Adicionados custos de créditos para divinação cruzada (3 créditos)
  - Expandida documentação de rate limiting

- **COMPONENTS.md**:
  - Adicionados componentes de correlação (CorrelationViz, CrossSystemDivination)
  - Adicionados widgets AI-powered (AIOracleChat, AIRecommendationsEngine)
  - Adicionados widgets de prática espiritual (DailyRitual, Affirmation)

### Fixed

- Correction in cross-system divination response format
- Spiritual stats aggregation logic fixed

---

## [1.0.0] - 2026-05-29

> **Type:** Minor Release  
> **Focus:** i18n + Analytics  
> **Breaking:** None

### Added

- **Multi-language Support (i18n)**:
  - Full pt-BR locale (200+ translations)
  - Full en locale (242+ translations)
  - Spiritual terminology: sefirots, odus, orixas, numerologia, arcano, elementos, ciclos, praticas, affirmacoes

- **LanguageSwitcher Component**:
  - UI toggle with flag icons (🇧🇷/🇺🇸)
  - localStorage persistence
  - Click-outside dismissal

- **Analytics Dashboard**:
  - `StatsOverview`: sessões, dias de prática, streak, média
  - `ProgressChart`: SVG bar chart semanal
  - `SessionInsightsPanel`: insights por tipo
  - `MeditationStats`: métricas + anel de progresso

- **Security Headers Middleware**:
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy

- **Rate Limit Monitoring System**:
  - Real-time tracking for abuse prevention
  - Per-endpoint limits
  - Blocking mechanism

- **Push Notifications Service**:
  - User engagement via web-push
  - Notification preferences

- **Zod Validators**:
  - Type-safe API request/response validation
  - Shared schemas in `src/lib/validators.ts`

### Changed

- Dashboard layout with collapsible sections
- Components migrated to `CollapsibleSection` format

### Fixed

- SpiritualFinanceWidget.tsx: restored missing interface declaration

### Security

- Security headers middleware implementation
- Rate limit monitoring for abuse prevention

---

## [0.9.0] - 2026-05-28

> **Type:** Minor Release  
> **Focus:** Dashboard Expansion  
> **Breaking:** None

### Added

- **Dashboard Widgets** (35+):
  - `AIOracleChat`: Chat com oráculo espiritual AI
  - `CorrelationViz`: Visualização de correlações
  - `MoonRitualPlanner`: Planejador de rituais lunares
  - `LoveReadingsWidget`: Leituras de amor
  - `GuidedMeditationWidget`: Meditação guiada
  - `AstrologicalTransits`: Trânsitos astrológicos
  - `DailyRitualWidget`: Ritual diário
  - `ChakraBalanceWidget`: Equilíbrio de chakras
  - `ElementalBalance`: Equilíbrio elemental

- **Wellness Dashboard Integration**:
  - Health metrics tracking
  - Spiritual wellness indicators

- **Notification Center with Toast System**:
  - Real-time notifications
  - Toast messages
  - Notification preferences

- **PWA Features**:
  - `manifest.json`: App installation
  - Service Worker: Offline support
  - Mobile navigation
  - Install prompt

### Fixed

- Auth JWT validation edge cases
- Numerology calculation edge cases with master numbers

---

## [0.8.0] - 2026-05-27

> **Type:** Minor Release  
> **Focus:** Authentication + Payments  
> **Breaking:** None

### Added

- **Supabase Authentication**:
  - Login with email/password
  - Register with profile
  - Logout
  - Session management

- **Stripe Payments**:
  - Credit packages (basic, intermediate, advanced)
  - Checkout session creation
  - Webhook handling
  - Subscription portal

- **Credit System**:
  - Credit balance tracking
  - Debit operations
  - Credit purchases

### Changed

- Auth routes migrated to Supabase

---

## [0.7.0] - 2026-05-26

> **Type:** Minor Release  
> **Focus:** Core Calculations  
> **Breaking:** None

### Added

- **Numerology Engine**:
  - Pitagorean system
  - Chaldean system
  - Cabalistic system
  - Tantric system
  - Master numbers (11, 22, 33)

- **Odu (Ifá) Calculations**:
  - Odu birth calculation from date
  - 16 Odus data with preceitos and ebós
  - Orixá associations

- **Astrology Engine**:
  - Natal chart calculation
  - Planet positions
  - Transit calculations
  - Sign determination

- **Tarot System**:
  - Major Arcana (22 cards)
  - Minor Arcana
  - Card interpretations

---

## [0.6.0] - 2026-05-25

> **Type:** Minor Release  
> **Focus:** Design System  
> **Breaking:** None

### Added

- **shadcn/ui Components**:
  - Button, Card, Input, Badge
  - Dialog, Select, Tabs
  - Skeleton, ScrollArea

- **Spiritual Theme**:
  - Dark mode with purple/violet accents
  - CSS variables for theming
  - Spiritual color palette

- **Layout Components**:
  - AppShell
  - PageHeader
  - DashboardLayout

---

## [0.5.0] - 2026-05-24

> **Type:** Minor Release  
> **Focus:** Dashboard Core  
> **Breaking:** None

### Added

- **Dashboard Page**:
  - Widget grid layout
  - Collapsible sections
  - Widget customization

- **Basic Widgets**:
  - InsightDiario
  - ChakrasExplorer
  - OrixasExplorer
  - OdusExplorer

---

## [0.4.0] - 2026-05-23

> **Type:** Minor Release  
> **Focus:** Onboarding  
> **Breaking:** None

### Added

- **Onboarding Flow**:
  - Multi-step wizard
  - Profile setup
  - Spiritual data collection

---

## [0.3.0] - 2026-05-22

> **Type:** Minor Release  
> **Focus:** API Foundation  
> **Breaking:** None

### Added

- **API Routes Foundation**:
  - `/api/chat` for AI assistant
  - `/api/insights` for daily insights
  - `/api/ciclos` for temporal cycles

- **MiniMax AI Integration**:
  - Spiritual guidance responses
  - Context-aware conversations

---

## [0.2.0] - 2026-05-21

> **Type:** Minor Release  
> **Focus:** Landing Page  
> **Breaking:** None

### Added

- **Landing Page**:
  - Hero section
  - Features overview
  - Call to action

- **Navigation**:
  - Header with nav links
  - Mobile responsive menu

---

## [0.1.0] - 2026-05-20

> **Type:** Initial Release  
> **Focus:** Project Setup  
> **Breaking:** None

### Added

- **Next.js 15 Project Setup**:
  - TypeScript configuration
  - Tailwind CSS 4
  - App Router

- **Basic Structure**:
  - `src/app/` directory
  - `src/components/` directory
  - `src/lib/` directory

- **Git Configuration**:
  - `.gitignore`
  - Initial commit

---

## Roadmap Preview

### [1.2.0] - Planned
- Profile consolidated page
- Advanced correlation visualizations
- AI-powered insights generation

### [1.3.0] - Planned
- Mobile app (React Native)
- Offline mode improvements
- Push notifications

### [2.0.0] - Future
- Community features
- Expert consultations
- Premium content

---

## Versioning Strategy

We use Semantic Versioning (SemVer):

- **MAJOR** version: Breaking changes
- **MINOR** version: New features, backward compatible
- **PATCH** version: Bug fixes, backward compatible

### Release Cycle

- **Patch releases**: As needed for bug fixes
- **Minor releases**: Every 2-4 weeks
- **Major releases**: Quarterly

---

## Categories

- `[Added]` New features
- `[Changed]` Changes in existing functionality
- `[Deprecated]` Soon-to-be removed features
- `[Removed]` Removed features
- `[Fixed]` Bug fixes
- `[Security]` Vulnerability fixes
- `[Docs]` Documentation changes
- `[Refactor]` Code refactoring
- `[Test]` Test updates
- `[Style]` Formatting, styling

---

*Last updated: 2026-06-01*