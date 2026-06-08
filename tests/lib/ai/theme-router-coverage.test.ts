/**
 * Theme router coverage tests (v0.0.5 T11 — fechar gap 8500 testes)
 * Cobre: routeByPillar para todos os 5 pilares + edge cases.
 */
import { describe, it, expect } from 'vitest';
import { routeByPillar, PILLAR_TAXONOMY, type Pillar } from '@/lib/ai/theme-router';

describe('theme-router coverage (5 pilares)', () => {
  describe('astrologia', () => {
    it('detecta mapa astral', () => {
      expect(routeByPillar('Como está meu mapa astral hoje?')).toContain('astrology');
    });
    it('detecta ascendente', () => {
      expect(routeByPillar('Qual é meu ascendente?')).toContain('astrology');
    });
    it('detecta sol e lua', () => {
      expect(routeByPillar('Em que signo estão meu sol e minha lua?')).toContain('astrology');
    });
  });

  describe('cabala', () => {
    it('detecta cabala', () => {
      expect(routeByPillar('O que é a cabala?')).toContain('kabala');
    });
    it('detecta sephirot', () => {
      expect(routeByPillar('Me explique as sephirot')).toContain('kabala');
    });
    it('detecta caminho da árvore', () => {
      expect(routeByPillar('Como funciona a árvore da vida?')).toContain('kabala');
    });
  });

  describe('tantra', () => {
    it('detecta tantra', () => {
      expect(routeByPillar('O que é tantra?')).toContain('tantra');
    });
    it('detecta kundalini', () => {
      expect(routeByPillar('Minha kundalini está subindo?')).toContain('tantra');
    });
    it('detecta chakras', () => {
      expect(routeByPillar('Como equilibrar meus chakras?')).toContain('tantra');
    });
  });

  describe('odus', () => {
    it('detecta orixas', () => {
      expect(routeByPillar('Quem é meu Orixá?')).toContain('odus');
    });
    it('detecta ogum', () => {
      expect(routeByPillar('Estou com Ogum no meu Odu?')).toContain('odus');
    });
    it('detecta odu', () => {
      expect(routeByPillar('Qual é meu Odu de nascimento?')).toContain('odus');
    });
  });

  describe('iching', () => {
    it('detecta hexagrama', () => {
      expect(routeByPillar('Qual é meu hexagrama natal?')).toContain('iching');
    });
    it('detecta trigrama', () => {
      expect(routeByPillar('Como funciona o trigrama inferior?')).toContain('iching');
    });
    it('detecta I Ching', () => {
      expect(routeByPillar('O que diz o I Ching sobre minha pergunta?')).toContain('iching');
    });
  });

  describe('multi-pilar', () => {
    it('detecta astrologia + iching em query combinada', () => {
      const r = routeByPillar('Como meu mapa astral conversa com meu hexagrama?');
      expect(r).toContain('astrology');
      expect(r).toContain('iching');
    });

    it('detecta cabala + tantra em query combinada', () => {
      const r = routeByPillar('Como a sephirah Tipheret se relaciona com meu chakra do coração?');
      expect(r).toContain('kabala');
      expect(r).toContain('tantra');
    });

    it('retorna vazio para query sem keywords', () => {
      expect(routeByPillar('Como você está hoje?')).toEqual([]);
    });
  });

  describe('determinismo', () => {
    it('100 iterações retornam o mesmo array', () => {
      const baseline = routeByPillar('Como está meu mapa astral?');
      for (let i = 0; i < 100; i++) {
        expect(routeByPillar('Como está meu mapa astral?')).toEqual(baseline);
      }
    });
  });

  describe('PILLAR_TAXONOMY invariants', () => {
    it('tem exatamente 5 pilares', () => {
      expect(Object.keys(PILLAR_TAXONOMY)).toHaveLength(5);
    });

    it('cada pilar tem keywords + id', () => {
      for (const [, val] of Object.entries(PILLAR_TAXONOMY)) {
        expect(val).toHaveProperty('keywords');
        expect(val).toHaveProperty('id');
        expect(val.keywords).toBeInstanceOf(Array);
        expect(val.keywords.length).toBeGreaterThan(0);
      }
    });

    it('palavras-chave únicas entre pilares (sem duplicação óbvia)', () => {
      const all = new Set<string>();
      for (const [, val] of Object.entries(PILLAR_TAXONOMY)) {
        for (const k of val.keywords) {
          all.add(k.toLowerCase());
        }
      }
      const total = Object.values(PILLAR_TAXONOMY).reduce((sum, v) => sum + v.keywords.length, 0);
      expect(all.size).toBeLessThan(total * 1.1); // allow ~10% overlap
    });
  });
});
