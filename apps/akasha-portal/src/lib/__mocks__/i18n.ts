/**
 * Vitest manual mock for `@/lib/i18n`
 *
 * Auto-detected by Vitest when `@/lib/i18n` is imported in any test file.
 * Uses locale-keyed T_MAPS so tests get real Portuguese/English strings.
 *
 * Usage in test files (no vi.mock call needed):
 *   import { getTranslations } from '@/lib/i18n';
 */
const DIARIO_T_MAP: Record<string, string> = {
  'diario.significado.titulo': 'Significado dos Pilares',
  'diario.significado.instrucao': 'Leia cada Pilar na ordem.',
  'diario.significado.principal': 'principal',
  'diario.significado.indisponivel': 'Significado não disponível para {pilar}.',
  'diario.mandato.pilarCabala': 'Cabala',
  'diario.mandato.pilarAstrologia': 'Astrologia',
  'diario.mandato.pilarTantrica': 'Tântrica',
  'diario.mandato.pilarOdu': 'Odù',
  'diario.mandato.pilarIching': 'I Ching',
  'diario.areas.titulo': 'Áreas da Vida',
  'diario.areas.descricao': 'Pilar {pilar} traduzido para cada área.',
  'diario.areas.leiaInstrucao': 'Leia da esquerda para direita — do profissional ao íntimo.',
};

const MAPPERS: Record<string, Record<string, string>> = {
  'pt-BR': {
    ...DIARIO_T_MAP,
    'areas.vitalidadeEnergia': 'Vitalidade',
    'areas.emocional': 'Emoções',
    'areas.mental': 'Mente',
    'areas.intuitivo': 'Intuição',
    'areas.espiritual': 'Espiritual',
    'areas.profissional': 'Profissional',
    'areas.financeiro': 'Finanças',
    'areas.criativo': 'Criativo',
    'areas.relacionamento': 'Relacionamento',
    'areas.saude': 'Saúde',
  },
  en: {
    'diario.significado.titulo': 'Meaning of the Pillars',
    'diario.significado.instrucao': 'Read each Pillar in order.',
    'diario.significado.principal': 'principal',
    'diario.significado.indisponivel': 'Meaning not available for {pilar}.',
    'diario.mandato.pilarCabala': 'Cabala',
    'diario.mandato.pilarAstrologia': 'Astrology',
    'diario.mandato.pilarTantrica': 'Tantric',
    'diario.mandato.pilarOdu': 'Odu',
    'diario.mandato.pilarIching': 'I Ching',
    'diario.areas.titulo': 'Life Areas',
    'diario.areas.descricao': 'Pilar {pilar} translated for each area.',
    'diario.areas.leiaInstrucao': 'Read from left to right — from professional to intimate.',
    'areas.vitalidadeEnergia': 'Vitality',
    'areas.emocional': 'Emotional',
    'areas.mental': 'Mental',
    'areas.intuitivo': 'Intuitive',
    'areas.espiritual': 'Spiritual',
    'areas.profissional': 'Professional',
    'areas.financeiro': 'Financial',
    'areas.criativo': 'Creative',
    'areas.relacionamento': 'Relationship',
    'areas.saude': 'Health',
  },
};

export const SUPPORTED_LOCALES = ['pt-BR', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function getTranslations(locale: string) {
  const safeLocale = isSupportedLocale(locale) ? locale : 'pt-BR';
  const map = MAPPERS[safeLocale] ?? MAPPERS['pt-BR'];

  return function t(key: string, params?: Record<string, string | number>): string {
    let value = map[key] ?? key;
    if (params) {
      value = value.replace(/\{(\w+)\}/g, (_, k) =>
        Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : `{${k}}`
      );
    }
    return value;
  };
}
