// ============================================================
// DASHBOARD COMPONENTS INDEX
// Central export point for all dashboard components
// ============================================================

// AI Components
export {
  AIOracleChat,
  type AIOracleChatProps,
} from './AIOracleChat';

export {
  AIMeditationGuide,
  type AIMeditationGuideProps,
} from './AIMeditationGuide';

// Core Dashboard Components
export {
  AdaptiveWidgetGrid,
  type AdaptiveWidgetGridProps,
} from './AdaptiveWidgetGrid';

export {
  ArchetypeDisplay,
} from './ArchetypeDisplay';

export {
  CalendarioEspiritual,
} from './CalendarioEspiritual';

export {
  CorrelationAnalysisPanel,
} from './CorrelationAnalysisPanel';

export {
  CorrelationViz,
} from './CorrelationViz';

export {
  CrossSystemDivination,
  type CrossSystemDivinationProps,
  type DivinationResult,
  type TarotCard,
  type AstrologicalAspect,
} from './CrossSystemDivination';

export {
  DailyWisdomCard,
} from './DailyWisdomCard';
export {
  JourneyTracker,
  type JourneyTrackerProps,
} from './JourneyTracker';

export {
  PredictiveInsightsPanel,
} from './PredictiveInsightsPanel';

export {
  SelfEvolutionTracker,
  type SelfEvolutionTrackerProps,
} from './SelfEvolutionTracker';

export {
  SpiritualAnalysisWidgets,
} from './SpiritualAnalysisWidgets';

export {
  SpiritualCorrelationViz,
  type SpiritualCorrelationVizProps,
} from './SpiritualCorrelationViz';

export {
  SpiritualEnergyWidget,
  type SpiritualEnergyWidgetProps,
} from './SpiritualEnergyWidget';

export {
  SpiritualExplorationTools,
  type SpiritualExplorationToolsProps,
} from './SpiritualExplorationTools';

export {
  SpiritualGuidanceChat,
  type SpiritualGuidanceChatProps,
  type ChatTheme,
} from './SpiritualGuidanceChat';

export {
  SpiritualNotificationCenter,
} from './SpiritualNotificationCenter';

export {
  SpiritualRadarChart,
  type SpiritualRadarChartProps,
} from './SpiritualRadarChart';

export {
  SpiritualReportCard,
} from './SpiritualReportCard';

export {
  SpiritualTimeline,
  type SpiritualTimelineProps,
} from './SpiritualTimeline';

export {
  SpiritualJourneyGuide,
  type SpiritualJourneyGuideProps,
  type JourneyStep,
} from './SpiritualJourneyGuide';

export {
  UserGrowthMetrics,
  type UserGrowthMetricsProps,
} from './UserGrowthMetrics';

export {
  SpiritualProfileView,
  type SpiritualProfileViewProps,
} from './SpiritualProfileView';

export {
  SpiritualStateMonitor,
 type SpiritualStateMonitorProps,
  type SpiritualState,
  type MoonPhaseInfluence,
  type OrixaOfTheDay,
} from './SpiritualStateMonitor';

export type {
  ChatMessage,
  AIResponse,
  StreamChunk,
} from '@/lib/ai/types';

// Re-export dashboard data types
export type {
  DashboardData,
} from '@/lib/dashboard/data-fetcher';

export type {
  DashboardStats,
  DailyInsight,
  OrixaProgress,
} from '@/lib/orixa/dashboard-data';

export type {
  InsightData,
} from '@/lib/ai/insights/types';