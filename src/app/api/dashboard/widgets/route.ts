import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handling';

// Widget registry - defines all available widgets
export interface WidgetDefinition {
  id: string;
  name: string;
  namePt: string;
  category: 'astrology' | 'tarot' | 'numerology' | 'ritual' | 'meditation' | 'insights' | 'calendar' | 'social';
  description: string;
  descriptionPt: string;
  icon: string;
  defaultSize: 'sm' | 'md' | 'lg' | 'xl';
  requiresCredits?: boolean;
  requiresSubscription?: boolean;
}

// Available widgets
const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // Astrology
  { id: 'birth-chart', name: 'Birth Chart', namePt: 'Mapa Natal', category: 'astrology', description: 'Full astrological birth chart', descriptionPt: 'Mapa astrológico completo', icon: '🌌', defaultSize: 'lg', requiresSubscription: true },
  { id: 'transit-chart', name: 'Transit Chart', namePt: 'Gráfico de Trânsitos', category: 'astrology', description: 'Current planetary transits', descriptionPt: 'Trânsitos planetários atuais', icon: '🪐', defaultSize: 'md' },
  { id: 'aspects-grid', name: 'Aspects Grid', namePt: 'Grade de Aspectos', category: 'astrology', description: 'Planetary aspects visualization', descriptionPt: 'Visualização de aspectos planetários', icon: '🔮', defaultSize: 'md' },
  { id: 'efemerides', name: 'Ephemeris', namePt: 'Efemérides', category: 'astrology', description: 'Daily planetary positions', descriptionPt: 'Posições planetárias diárias', icon: '📊', defaultSize: 'sm' },
  { id: 'planets-viewer', name: 'Planets Viewer', namePt: 'Visualizador de Planetas', category: 'astrology', description: 'Interactive planet visualization', descriptionPt: 'Visualização interativa de planetas', icon: '🌍', defaultSize: 'lg' },
  { id: 'synastry', name: 'Synastry', namePt: 'Sinastria', category: 'astrology', description: 'Relationship compatibility chart', descriptionPt: 'Gráfico de compatibilidade relacional', icon: '💕', defaultSize: 'lg', requiresCredits: true },
  { id: 'sacred-geometry', name: 'Sacred Geometry', namePt: 'Geometria Sagrada', category: 'astrology', description: 'Sacred geometry patterns', descriptionPt: 'Padrões de geometria sagrada', icon: '✨', defaultSize: 'md' },
  { id: 'orixas', name: 'Orixás', namePt: 'Orixás Explorer', category: 'astrology', description: 'Explore orixás energies', descriptionPt: 'Explore as energias dos orixás', icon: '🔥', defaultSize: 'md' },
  { id: 'odus', name: 'Odus', namePt: 'Odus Explorer', category: 'astrology', description: 'Explore odus and their meanings', descriptionPt: 'Explore odus e seus significados', icon: '🌊', defaultSize: 'md' },
  { id: 'chakras', name: 'Chakras', namePt: 'Chakras Explorer', category: 'astrology', description: 'Chakra system visualization', descriptionPt: 'Visualização do sistema de chakras', icon: '🟡', defaultSize: 'md' },
  { id: 'correspondencias', name: 'Correspondences', namePt: 'Correspondências Visuais', category: 'astrology', description: 'Visual correspondence patterns', descriptionPt: 'Padrões de correspondência visual', icon: '🔗', defaultSize: 'md' },

  // Tarot
  { id: 'tarot-do-dia', name: 'Tarot of the Day', namePt: 'Tarô do Dia', category: 'tarot', description: 'Daily tarot card reading', descriptionPt: 'Leitura diária de tarot', icon: '🃏', defaultSize: 'sm' },
  { id: 'celtic-cross', name: 'Celtic Cross', namePt: 'Cruz Celta', category: 'tarot', description: 'In-depth Celtic Cross spread', descriptionPt: 'Leitura profunda com Cruz Celta', icon: '✝️', defaultSize: 'lg', requiresCredits: true },
  { id: 'spread-reader', name: 'Spread Reader', namePt: 'Leitor de Tiragens', category: 'tarot', description: 'Custom tarot spreads', descriptionPt: 'Tiragens personalizadas de tarot', icon: '📖', defaultSize: 'md', requiresCredits: true },
  { id: 'lenormand', name: 'Lenormand Cards', namePt: 'Cartas Lenormand', category: 'tarot', description: 'Lenormand card readings', descriptionPt: 'Leituras com cartas Lenormand', icon: '🎴', defaultSize: 'md' },

  // Numerology
  { id: 'numerologia', name: 'Numerology', namePt: 'Numerologia', category: 'numerology', description: 'Numerological analysis', descriptionPt: 'Análise numerológica', icon: '🔢', defaultSize: 'md' },
  { id: 'numerologia-empresarial', name: 'Business Numerology', namePt: 'Numerologia Empresarial', category: 'numerology', description: 'Business numerology insights', descriptionPt: 'Insights de numerologia empresarial', icon: '💼', defaultSize: 'md', requiresSubscription: true },
  { id: 'ciclos', name: 'Cycles', namePt: 'Ciclos', category: 'numerology', description: 'Life cycles analysis', descriptionPt: 'Análise de ciclos de vida', icon: '🔄', defaultSize: 'md' },
  { id: 'correspondencias-num', name: 'Numeric Correspondences', namePt: 'Correlações Numéricas', category: 'numerology', description: 'Numeric correspondence patterns', descriptionPt: 'Padrões de correspondência numérica', icon: '🔢', defaultSize: 'sm' },

  // Ritual
  { id: 'ritual-tracker', name: 'Ritual Tracker', namePt: 'Rastreador de Rituais', category: 'ritual', description: 'Track your spiritual practices', descriptionPt: 'Acompanhe suas práticas espirituais', icon: '📿', defaultSize: 'md' },
  { id: 'ritual-of-day', name: 'Ritual of the Day', namePt: 'Ritual do Dia', category: 'ritual', description: 'Daily ritual suggestions', descriptionPt: 'Sugestões de rituais diários', icon: '🕯️', defaultSize: 'sm' },
  { id: 'historico-rituais', name: 'Ritual History', namePt: 'Histórico de Rituais', category: 'ritual', description: 'Your ritual practice history', descriptionPt: 'Histórico de práticas ritualísticas', icon: '📜', defaultSize: 'md' },

  // Meditation
  { id: 'meditacao-guiada', name: 'Guided Meditation', namePt: 'Meditação Guiada', category: 'meditation', description: 'Spiritual guided meditations', descriptionPt: 'Meditações guiadas espirituais', icon: '🧘', defaultSize: 'md', requiresCredits: true },
  { id: 'frequencias', name: 'Frequency Explorer', namePt: 'Explorador de Frequências', category: 'meditation', description: 'Explore energy frequencies', descriptionPt: 'Explore frequências energéticas', icon: '🎵', defaultSize: 'md' },
  { id: 'dia-espiritual', name: 'Spiritual Day', namePt: 'Dia Espiritual', category: 'meditation', description: 'Daily spiritual guidance', descriptionPt: 'Orientação espiritual diária', icon: '🌅', defaultSize: 'md' },

  // Insights
  { id: 'insight-diario', name: 'Daily Insight', namePt: 'Insight Diário', category: 'insights', description: 'AI-powered daily spiritual insight', descriptionPt: 'Insight espiritual diário com IA', icon: '💡', defaultSize: 'sm' },
  { id: 'afirmacao', name: 'Daily Affirmation', namePt: 'Affirmação do Dia', category: 'insights', description: 'Daily affirmation cards', descriptionPt: 'Cartões de afirmação diária', icon: '✨', defaultSize: 'sm' },
  { id: 'assistente', name: 'Spirit Assistant', namePt: 'Assistente Espiritual', category: 'insights', description: 'AI spiritual assistant', descriptionPt: 'Assistente espiritual com IA', icon: '🤖', defaultSize: 'lg', requiresCredits: true },
  { id: 'soul-cycle', name: 'Soul Cycle', namePt: 'Ciclo da Alma', category: 'insights', description: 'Soul cycle analysis', descriptionPt: 'Análise do ciclo da alma', icon: '🌀', defaultSize: 'md' },
  { id: 'mandala', name: 'Mandala Energy', namePt: 'Mandala de Energia', category: 'insights', description: 'Energy mandala visualization', descriptionPt: 'Visualização de mandala energética', icon: '🌸', defaultSize: 'md' },
  { id: 'previsao-semanal', name: 'Weekly Forecast', namePt: 'Previsão Semanal', category: 'insights', description: 'Weekly spiritual forecast', descriptionPt: 'Previsão espiritual semanal', icon: '📅', defaultSize: 'md' },
  { id: 'previsao-mensal', name: 'Monthly Forecast', namePt: 'Previsão Mensal', category: 'insights', description: 'Monthly spiritual forecast', descriptionPt: 'Previsão espiritual mensal', icon: '📆', defaultSize: 'lg' },
  { id: 'year-projection', name: 'Year Projection', namePt: 'Projeção Anual', category: 'insights', description: 'Annual spiritual projection', descriptionPt: 'Projeção espiritual anual', icon: '🎯', defaultSize: 'lg' },

  // Calendar
  { id: 'calendario-espiritual', name: 'Spiritual Calendar', namePt: 'Calendário Espiritual', category: 'calendar', description: 'Spiritual events calendar', descriptionPt: 'Calendário de eventos espirituais', icon: '📆', defaultSize: 'lg' },
  { id: 'calendario-semanal', name: 'Weekly Calendar', namePt: 'Calendário Semanal', category: 'calendar', description: 'Weekly spiritual events', descriptionPt: 'Eventos espirituais semanais', icon: '🗓️', defaultSize: 'md' },
  { id: 'moon-phase', name: 'Moon Phase', namePt: 'Fase Lunar', category: 'calendar', description: 'Current moon phase', descriptionPt: 'Fase lunar atual', icon: '🌙', defaultSize: 'sm' },

  // Social
  { id: 'favoritos', name: 'Favorites', namePt: 'Favoritos', category: 'social', description: 'Your favorite readings', descriptionPt: 'Suas leituras favoritas', icon: '❤️', defaultSize: 'sm' },
  { id: 'crystal-grid', name: 'Crystal Grid', namePt: 'Grade de Cristais', category: 'social', description: 'Crystal grid visualization', descriptionPt: 'Visualização de grid de cristais', icon: '💎', defaultSize: 'md' },
  { id: 'spiritual-map', name: 'Spiritual Map', namePt: 'Mapa Espiritual', category: 'social', description: 'Your spiritual journey map', descriptionPt: 'Mapa da sua jornada espiritual', icon: '🗺️', defaultSize: 'lg' },
  { id: 'export', name: 'Export Panel', namePt: 'Painel de Exportação', category: 'social', description: 'Export your readings', descriptionPt: 'Exporte suas leituras', icon: '📤', defaultSize: 'sm' },
];

// Widget layout configuration
export interface WidgetLayout {
  widgetId: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visible: boolean;
  collapsed?: boolean;
}

// Mock user layouts - replace with real DB
const userLayouts: Map<string, WidgetLayout[]> = new Map([
  ['default', [
    { widgetId: 'insight-diario', position: { x: 0, y: 0 }, size: { w: 4, h: 2 }, visible: true },
    { widgetId: 'afirmacao', position: { x: 4, y: 0 }, size: { w: 4, h: 2 }, visible: true },
    { widgetId: 'tarot-do-dia', position: { x: 8, y: 0 }, size: { w: 4, h: 2 }, visible: true },
    { widgetId: 'moon-phase', position: { x: 0, y: 2 }, size: { w: 3, h: 2 }, visible: true },
    { widgetId: 'birth-chart', position: { x: 3, y: 2 }, size: { w: 9, h: 4 }, visible: true },
  ]]
]);

// GET - Return available widgets and user's layout
export const GET = withErrorHandler(async (_req: NextRequest) => {
  const widgets = WIDGET_DEFINITIONS.map(w => ({
    ...w,
    available: true,
  }));

  // Default layout for now - would come from user session/DB
  const layout = userLayouts.get('default') || [];

  return NextResponse.json({
    widgets,
    layout,
    categories: [
      { id: 'astrology', name: 'Astrology', namePt: 'Astrologia' },
      { id: 'tarot', name: 'Tarot', namePt: 'Tarô' },
      { id: 'numerology', name: 'Numerology', namePt: 'Numerologia' },
      { id: 'ritual', name: 'Ritual', namePt: 'Rituais' },
      { id: 'meditation', name: 'Meditation', namePt: 'Meditação' },
      { id: 'insights', name: 'Insights', namePt: 'Insights' },
      { id: 'calendar', name: 'Calendar', namePt: 'Calendário' },
      { id: 'social', name: 'Social', namePt: 'Social' },
    ],
  });
});

// POST - Save widget layout
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json() as { layout?: WidgetLayout[] };

  // Validate layout structure
  if (body.layout && !Array.isArray(body.layout)) {
    return NextResponse.json(
      { error: { code: 4001, message: 'Layout must be an array' } },
      { status: 400 }
    );
  }

  // Validate each widget in layout
  if (body.layout) {
    for (const item of body.layout) {
      if (!item.widgetId || typeof item.widgetId !== 'string') {
        return NextResponse.json(
          { error: { code: 4002, message: 'Invalid widgetId in layout' } },
          { status: 400 }
        );
      }
      if (!item.position || typeof item.position.x !== 'number' || typeof item.position.y !== 'number') {
        return NextResponse.json(
          { error: { code: 4003, message: 'Invalid position in layout item' } },
          { status: 400 }
        );
      }
      if (!item.size || typeof item.size.w !== 'number' || typeof item.size.h !== 'number') {
        return NextResponse.json(
          { error: { code: 4004, message: 'Invalid size in layout item' } },
          { status: 400 }
        );
      }
      if (typeof item.visible !== 'boolean') {
        return NextResponse.json(
          { error: { code: 4005, message: 'Invalid visible flag in layout item' } },
          { status: 400 }
        );
      }

      // Verify widget exists
      const widgetExists = WIDGET_DEFINITIONS.some(w => w.id === item.widgetId);
      if (!widgetExists) {
        return NextResponse.json(
          { error: { code: 4006, message: `Widget ${item.widgetId} not found` } },
          { status: 400 }
        );
      }
    }
  }

  // Save layout (mock - would save to user DB)
  if (body.layout) {
    userLayouts.set('default', body.layout);
  }

  return NextResponse.json({
    success: true,
    layout: body.layout || [],
    message: 'Widget layout saved successfully',
  });
});