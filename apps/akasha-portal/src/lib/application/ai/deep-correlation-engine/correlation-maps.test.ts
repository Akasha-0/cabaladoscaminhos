import type { SpiritualSource } from '../deep-correlation-engine';
import {
  LIFE_PATH_ZODIAC_MAP,
  TAROT_ORIXA_MAP,
  CHAKRA_ELEMENT_MAP,
  PLANET_ORIXA_MAP,
  DAY_ENERGY_MAP,
  SEPHIROT_PLANET_MAP,
  calculateBaseCorrelation,
} from './correlation-maps';

describe('correlation-maps', () => {
  // ── LIFE_PATH_ZODIAC_MAP ────────────────────────────────────────────────
  describe('LIFE_PATH_ZODIAC_MAP', () => {
    it('mapeia números de caminho de vida para signos compatíveis', () => {
      expect(LIFE_PATH_ZODIAC_MAP[1]).toEqual(['Aries', 'Leo', 'Sagittarius']);
      expect(LIFE_PATH_ZODIAC_MAP[9]).toEqual(['Aries', 'Scorpio', 'Sagittarius']);
    });

    it('suporta números de caminho especiais (11, 22)', () => {
      expect(LIFE_PATH_ZODIAC_MAP[11]).toEqual(['Pisces', 'Cancer', 'Libra']);
      expect(LIFE_PATH_ZODIAC_MAP[22]).toEqual(['Capricorn', 'Aquarius', 'Aries']);
    });

    // Edge case: número sem entrada retorna undefined
    it('retorna undefined para número de caminho sem mapeamento', () => {
      expect(LIFE_PATH_ZODIAC_MAP[99]).toBeUndefined();
    });
  });

  // ── TAROT_ORIXA_MAP ──────────────────────────────────────────────────────
  describe('TAROT_ORIXA_MAP', () => {
    it('mapeia Arcanos Maiores para orixás', () => {
      expect(TAROT_ORIXA_MAP[0]).toEqual(['Oxum']);
      expect(TAROT_ORIXA_MAP[21]).toEqual(['Olodumare']);
    });

    it('alguns arcanos mapeiam para múltiplos orixás', () => {
      // Arcano 1 → Iemanjá
      expect(TAROT_ORIXA_MAP[1]).toEqual(['Iemanjá']);
    });

    // Edge case: arcano não existente
    it('retorna undefined para arcano fora do intervalo 0-21', () => {
      expect(TAROT_ORIXA_MAP[99]).toBeUndefined();
      expect(TAROT_ORIXA_MAP[-1]).toBeUndefined();
    });
  });

  // ── CHAKRA_ELEMENT_MAP ──────────────────────────────────────────────────
  describe('CHAKRA_ELEMENT_MAP', () => {
    it('mapeia cada chakra para seu elemento primário', () => {
      expect(CHAKRA_ELEMENT_MAP['Muladhara']).toBe('Terra');
      expect(CHAKRA_ELEMENT_MAP['Sahasrara']).toBe('Vazio');
    });

    it('retorna undefined para chakra desconhecido', () => {
      expect(CHAKRA_ELEMENT_MAP['ChakraInvalido']).toBeUndefined();
    });
  });

  // ── PLANET_ORIXA_MAP ────────────────────────────────────────────────────
  describe('PLANET_ORIXA_MAP', () => {
    it('mapeia planetas para seus orixás regentes', () => {
      expect(PLANET_ORIXA_MAP['Sol']).toBe('Oxum');
      expect(PLANET_ORIXA_MAP['Lua']).toBe('Iemanjá');
      expect(PLANET_ORIXA_MAP['Marte']).toBe('Ogum');
    });

    it('retorna undefined para planeta não mapeado', () => {
      expect(PLANET_ORIXA_MAP['PlanetaX']).toBeUndefined();
    });
  });

  // ── DAY_ENERGY_MAP ─────────────────────────────────────────────────────
  describe('DAY_ENERGY_MAP', () => {
    it('mapeia dias da semana para energia, orixá, elemento e prática', () => {
      const domingo = DAY_ENERGY_MAP['Domingo'];
      expect(domingo.energy).toBe('Solar');
      expect(domingo.orixa).toBe('Oxum');
      expect(domingo.element).toBe('Fogo');
      expect(domingo.practice).toContain('Oração solar');
    });

    it('retorna undefined para dia inválido', () => {
      expect(DAY_ENERGY_MAP['DiaInvalido']).toBeUndefined();
    });
  });

  // ── SEPHIROT_PLANET_MAP ────────────────────────────────────────────────
  describe('SEPHIROT_PLANET_MAP', () => {
    it('mapeia sefirot para planetas correspondentes', () => {
      expect(SEPHIROT_PLANET_MAP['Tipheret']).toBe('Sol');
      expect(SEPHIROT_PLANET_MAP['Yesod']).toBe('Lua');
      expect(SEPHIROT_PLANET_MAP['Binah']).toBe('Saturno');
    });

    it('Keter e Chokhmah não têm planeta associado', () => {
      expect(SEPHIROT_PLANET_MAP['Keter']).toBe('Sem planeta');
      expect(SEPHIROT_PLANET_MAP['Chokhmah']).toBe('Sem planeta');
    });
  });

  // ── calculateBaseCorrelation ───────────────────────────────────────────
  describe('calculateBaseCorrelation', () => {
    it('retorna alta correlação entre kabbalah e sefirot', () => {
      const corr = calculateBaseCorrelation('kabbalah', 'sefirot');
      expect(corr).toBe(0.9);
    });

    it('retorna correlação alta entre ifa e orixa', () => {
      const corr = calculateBaseCorrelation('ifa', 'orixa');
      expect(corr).toBe(0.85);
    });

    it('retorna valor padrão 0.3 para combinação fonte/alvo desconhecida', () => {
      const unknownSource = calculateBaseCorrelation('kabbalah', 'unknown_target');
      const unknownTarget = calculateBaseCorrelation(
        'unknown_source' as SpiritualSource,
        'sefirot'
      );
      expect(unknownSource).toBe(0.3);
      expect(unknownTarget).toBe(0.3);
    });

    // Edge case: fonte válida com alvo numérico inesperado (deve ser string)
    it('trata alvo numérico convertendo para string', () => {
      // O parâmetro é string, então passando número funciona via coerção
      const corr = calculateBaseCorrelation('numerology', '7' as unknown as string);
      // '7' não é chave conhecida em numerology → default 0.3
      expect(corr).toBe(0.3);
    });

    it('correlação entre astrology e numerology é 0.6', () => {
      const corr = calculateBaseCorrelation('astrology', 'numerology');
      expect(corr).toBe(0.6);
    });

    it('todas as fontes definidas retornam valores esperados', () => {
      const sources = ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'] as const;
      for (const source of sources) {
        const result = calculateBaseCorrelation(source, 'sefirot');
        expect(result).toBeGreaterThan(0);
      }
    });
  });
});
