/**
 * Unit Tests for @akasha/core-odus matching module
 *
 * Covers:
 * - matchOduToRitual() — happy path and edge case
 *
 * Note: matchMultipleOduToRituals() and getRitualSummary() are internal
 * (not exported) — tested indirectly via matchOduToRitual.
 */

import { describe, it, expect } from 'vitest';
import { matchOduToRitual } from '@akasha/core-odus';
import type { OduInfo } from '@akasha/core-odus';

// Minimal OduInfo fixtures — only fields used by matchOduToRitual are populated
const odu1: OduInfo = {
  numero: 1,
  nome: 'Okaran',
  significado: 'O começo.',
  elementos: 'Terra/Fogo',
  orixaRegente: 'Exu',
  quizilas: [],
  preceitos: [],
  ebos: ['Ebó de Caminho/Limpeza: Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos'],
};

const odu5: OduInfo = {
  numero: 5,
  nome: 'Oxé',
  significado: 'O ouro.',
  elementos: 'Água',
  orixaRegente: 'Oxum',
  quizilas: [],
  preceitos: [],
  ebos: ['Ebó de Atração/Ouro: Banhos de mel, caldas de frutas, girassóis e moedas douradas'],
};

const odu9: OduInfo = {
  numero: 9,
  nome: 'Ossá',
  significado: 'A chuva.',
  elementos: 'Fogo/Água',
  orixaRegente: 'Iansã',
  quizilas: [],
  preceitos: [],
  ebos: ['Ebó de Transformação/Renovação: Pipoca sem sal para Omolu, lama sutil, fitas coloridas, velas roxas'],
};

// Odu 16 is in the ritual map (agradecimento/baixa) — test that it returns rituals
const odu16: OduInfo = {
  numero: 16,
  nome: 'Orunmilá',
  significado: 'A sabedoria.',
  elementos: 'Ar/Água',
  orixaRegente: 'Orunmilá',
  quizilas: [],
  preceitos: [],
  ebos: [],
};

// ─── matchOduToRitual ───────────────────────────────────────────────────────

describe('matchOduToRitual', () => {
  describe('happy path', () => {
    it('returns a valid OduMatchingResult for odu 1', () => {
      const result = matchOduToRitual(odu1);

      expect(result.odu).toBe(odu1);
      expect(result.rituais).toBeInstanceOf(Array);
      expect(result.ebos).toBeInstanceOf(Array);
      expect(result.orixasRelacionados).toBeInstanceOf(Array);
      expect(result.praticasDiarias).toBeInstanceOf(Array);
      expect(result.contraindicacoes).toBeInstanceOf(Array);
    });

    it('maps odu 1 to caminho ritual with alta urgencia', () => {
      const result = matchOduToRitual(odu1);

      expect(result.rituais.length).toBeGreaterThan(0);
      const ritual = result.rituais[0];
      expect(ritual.tipo).toBe('caminho');
      expect(ritual.urgencia).toBe('alta');
    });

    it('maps odu 5 to atração ritual', () => {
      const result = matchOduToRitual(odu5);

      expect(result.rituais.length).toBeGreaterThan(0);
      expect(result.rituais[0].tipo).toBe('atração');
    });

    it('maps odu 9 to limpeza ritual', () => {
      const result = matchOduToRitual(odu9);

      expect(result.rituais.length).toBeGreaterThan(0);
      expect(result.rituais[0].tipo).toBe('limpeza');
    });

    it('includes related orixás for odu 1', () => {
      const result = matchOduToRitual(odu1);
      expect(result.orixasRelacionados).toContain('Exu');
      expect(result.orixasRelacionados).toContain('Omolu');
    });

    it('returns daily practices for odu 1', () => {
      const result = matchOduToRitual(odu1);
      expect(result.praticasDiarias.length).toBeGreaterThan(0);
    });

    it('returns contraindications for odu 1', () => {
      const result = matchOduToRitual(odu1);
      expect(result.contraindicacoes.length).toBeGreaterThan(0);
    });

    it('returns ebó suggestion when odu has ebós text', () => {
      const result = matchOduToRitual(odu1);
      expect(result.ebos.length).toBeGreaterThan(0);
    });

    it('includes ritual nome, descricao, orixa, prazo, and componentes fields', () => {
      const result = matchOduToRitual(odu1);
      const ritual = result.rituais[0];
      expect(typeof ritual.nome).toBe('string');
      expect(ritual.nome.length).toBeGreaterThan(0);
      expect(typeof ritual.descricao).toBe('string');
      expect(ritual.descricao.length).toBeGreaterThan(0);
      expect(typeof ritual.orixa).toBe('string');
      expect(typeof ritual.prazo).toBe('string');
      expect(ritual.componentes).toBeInstanceOf(Array);
      expect(ritual.componentes.length).toBeGreaterThan(0);
    });

    it('includes ebó suggestion fields: tipo, nome, descricao, orixa, elementos, passos, observacoes', () => {
      const result = matchOduToRitual(odu1);
      const ebo = result.ebos[0];
      expect(typeof ebo.tipo).toBe('string');
      expect(typeof ebo.nome).toBe('string');
      expect(typeof ebo.descricao).toBe('string');
      expect(typeof ebo.orixa).toBe('string');
      expect(ebo.elementos).toBeInstanceOf(Array);
      expect(ebo.passos).toBeInstanceOf(Array);
      expect(ebo.observacoes).toBeInstanceOf(Array);
    });
  });

  describe('edge cases', () => {
    it('maps odu 16 to agradecimento ritual with baixa urgencia', () => {
      const result = matchOduToRitual(odu16);
      expect(result.rituais.length).toBeGreaterThan(0);
      expect(result.rituais[0].tipo).toBe('agradecimento');
      expect(result.rituais[0].urgencia).toBe('baixa');
    });

    it('returns empty ebós when odu has no ebós text', () => {
      const result = matchOduToRitual(odu16);
      expect(result.ebos.length).toBe(0);
    });

    it('produces consistent results for same odu across calls', () => {
      const a = matchOduToRitual(odu1);
      const b = matchOduToRitual(odu1);
      expect(a.rituais[0].tipo).toBe(b.rituais[0].tipo);
      expect(a.orixasRelacionados).toEqual(b.orixasRelacionados);
    });
  });
});
