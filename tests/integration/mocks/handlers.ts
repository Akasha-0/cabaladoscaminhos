import { http, HttpResponse } from 'msw';

// ─── Realistic mock data ───────────────────────────────────────────────────────

const RITUAL_MOCK = {
  title: 'Ritual de Conexão Lunar',
  day: '2026-06-18',
  lunarPhase: 'Gibosa Waxing',
  focus: 'Introspecção e clareza emocional',
  elements: {
    colors: ['Azul Indigo', 'Prata', 'Branco'],
    herbs: ['Salvia Blanca', 'Lavanda', 'Camomila'],
    incenses: ['Sândalo', 'Mirra', 'Olibano'],
  },
  steps: [
    { order: 1, title: 'Purificação', duration: '10 min', description: 'Defumação com salvia branca' },
    { order: 2, title: 'Invocação Lunar', duration: '5 min', description: 'Recitar oração à Lua' },
    { order: 3, title: 'Meditação Guiada', duration: '20 min', description: 'Foco na respiração lunar' },
  ],
  affirmations: [
    'Eu recebo a luz da Lua com gratidão',
    'Minha intuição se expande a cada ciclo',
    'Sinto-me em harmonia com os ciclos naturais',
  ],
  orixas: ['Oxum', 'Iemanjá', 'Lua'],
  sephirot: ['Chokhmah', 'Binah', 'Kether'],
  arcanos: ['A Sacerdotisa', 'A Lua', 'O Mundo'],
};

const WEEK_RITUAL_MOCK = Array.from({ length: 7 }, (_, i) => ({
  ...RITUAL_MOCK,
  day: `2026-06-${String(12 + i).padStart(2, '0')}`,
}));

const ANALYZE_DAY_MOCK = {
  dayPortal: { active: true, name: 'Portal de Regeneração', intensity: 0.78 },
  lunarPhase: { name: 'Gibosa Waxing', emoji: '🌒', illumination: 72 },
  orixa: { name: 'Oxum', element: 'Água', color: 'Azul e Prata' },
  recommendation: 'Foco em práticas de auto-cuidado e cura emocional',
};

const ANALYZE_WEEK_MOCK = Array.from({ length: 7 }, (_, i) => ({
  day: `2026-06-${String(12 + i).padStart(2, '0')}`,
  portal: i % 3 === 0 ? { active: true, name: 'Portal de Regeneração' } : null,
  lunarPhase: ['Nova', 'Crescente', 'Cheia', 'Minguante'][i % 4],
}));

const ANALYZE_LUNAR_MOCK = {
  currentPhase: 'Gibosa Waxing',
  illumination: 72,
  nextPhase: 'Cheia',
  daysUntilNext: 4,
  ritual: 'Propício para rituais de manifestração e agradecimento',
};

const ANALYZE_RITUAL_MOCK = {
  rituals: [
    { name: 'Banho de Lua', frequency: 'diário', duration: '15 min' },
    { name: 'Meditação Lunar', frequency: 'semanal', duration: '30 min' },
    { name: 'Ritual de Gratidão', frequency: 'diário', duration: '10 min' },
  ],
  timing: 'Durante a noite, preferencialmente sob a lua',
  precautions: 'Evitar durante a Lua Nova para rituais de nova beginnings',
};

const ANALYZE_ODU_MOCK = {
  oduTarot: { odu: 'Eji-Ogbe', tarot: 'O Mago', affinity: 0.92 },
  message: 'Claridade mental e ação determinada são suas ferramentas hoje',
  guidance: 'Consulte a memória ancestral para decisões importantes',
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // GET /api/correlation/ritual
  http.get('http://localhost:3000/api/correlation/ritual', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    if (type === 'week') {
      return HttpResponse.json({ success: true, data: WEEK_RITUAL_MOCK });
    }
    return HttpResponse.json({ success: true, data: RITUAL_MOCK });
  }),

  // GET /api/correlation/analyze
  http.get('http://localhost:3000/api/correlation/analyze', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? 'day';
    switch (type) {
      case 'week':
        return HttpResponse.json({ success: true, data: ANALYZE_WEEK_MOCK });
      case 'lunar':
        return HttpResponse.json({ success: true, data: ANALYZE_LUNAR_MOCK });
      case 'ritual':
        return HttpResponse.json({ success: true, data: ANALYZE_RITUAL_MOCK });
      case 'odu':
        return HttpResponse.json({ success: true, data: ANALYZE_ODU_MOCK });
      default:
        return HttpResponse.json({ success: true, data: ANALYZE_DAY_MOCK });
    }
  }),
];
