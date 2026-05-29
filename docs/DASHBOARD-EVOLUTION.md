# Dashboard Evolution Architecture - Cabala Dos Caminhos

## Vision
Transform the dashboard into an autonomous, self-evolving spiritual intelligence system that provides deep self-knowledge, consciousness expansion, and continuous evolution through cross-system correlations.

## Core Principles
1. **Auto-conhecimento** - Every insight helps the user understand themselves
2. **Expansão da consciência** - Correlations reveal hidden connections
3. **Evolução contínua** - The system learns and adapts to the user
4. **Deep correlations** - Unifying Ifá, Candomblé, Cabala, Tarot, Astrology, Numerology

## AI Agentic System Architecture

### MiniMax Integration (minimax/m2.7)
- Function calling for spiritual tool execution
- Streaming responses for real-time guidance
- Multi-step reasoning for complex correlations
- Context preservation across conversations

### Agentic Workflow
```
User Input → Agentic AI → [Tools] → Correlation Engine → Insight
                         ↓
                  MiniMax API (function calling)
                         ↓
              Personalized Spiritual Guidance
```

### Spiritual Tools (Function Calling)
1. `getOduInterpretation` - Ifá/Odu deep analysis
2. `getTarotInsight` - Tarot card meanings and positions
3. `getNumerologyAnalysis` - Numerological calculations
4. `getOrixaGuidance` - Orixá correlations and guidance
5. `getCabalaPath` - Cabala tree paths and Sephirot

## Dashboard Components

### 1. IntelligentDashboard
- Adaptive widget grid based on user evolution stage
- Real-time spiritual state radar
- Smart notifications with contextual timing
- Journey progress visualization

### 2. CorrelationAnalysisPanel
- Interactive node-link visualization
- Cross-system correlation matrix
- Pattern detection and highlighting
- AI-powered explanation generation

### 3. PredictiveInsightsPanel
- AI-driven predictions across all spiritual systems
- Timeline visualization with confidence scores
- Period selection (7/30/90 days)
- Smart filtering by spiritual domain

### 4. SpiritualGuidanceChat
- Agentic AI with function calling
- Theme-aware context (espiritualidade, rituals, relationships, etc.)
- Reasoning step display
- Persistent conversation memory

### 5. SpiritualAnalysisWidgets
- Odu Explorer with daily signs
- Orixá Connection with elemental correlations
- Tarot Daily Card with position analysis
- Numerology Breakdown
- Element Balance

### 6. SelfEvolutionTracker
- Journey milestones visualization
- Growth metrics (completude, evolução, consciência)
- Stage progression with icons
- Achievement celebrations

## Data Flow

### Primary Data Sources
1. **User Profile** - birth date, name, spiritual interests
2. **Numerology** - Life path, expression, soul urge numbers
3. **Astrology** - Natal chart, transits, progressions
4. **Ifá/Odu** - Merindilogun divination, Odú of destiny
5. **Candomblé** - Orixá regente, ritual calendar
6. **Cabala** - Sephirot paths, Hebrew letters
7. **Tarot** - Major arcana, card positions

### Correlation Engine
- Cross-references all systems for patterns
- Generates unified insight from multiple sources
- Weights correlations by spiritual relevance

### Real-time Updates
- Lunar phase awareness
- Day energy (Orixá of the day)
- Ritual timing optimization
- Personalized notifications

## Technical Implementation

### MiniMax Enhanced Client
```typescript
- Streaming support for real-time responses
- Function calling for spiritual tools
- Retry logic with exponential backoff
- Response caching for common queries
```

### Dashboard Data Hook
```typescript
- Unified data fetching from all sources
- Intelligent caching with TTL
- Real-time updates via polling
- Selective data loading for performance
```

### API Layer
- `/api/dashboard/widgets` - Quick stats, activity, affirmations
- `/api/dashboard/data` - Aggregated user spiritual data
- `/api/correlation` - Cross-system correlation analysis
- `/api/spiritual/energy` - Real-time energy calculations

## Success Metrics
- User engagement with spiritual content
- Correlation insight depth
- AI response relevance
- Dashboard loading performance
- Evolution stage progression

## Evolution Stages
1. **Iniciante** - Basic widgets, guided journey
2. **Explorador** - Full widget access, correlation exploration
3. **Praticante** - Advanced predictions, ritual planning
4. **Mestre** - Autonomous guidance, teaching mode
5. **Iluminado** - Full self-evolution, consciousness expansion