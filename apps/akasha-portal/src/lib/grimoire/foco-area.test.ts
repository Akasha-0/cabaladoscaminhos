/**
 * Testes para `foco-area.ts` — coverage improvement (GRIMOIRE).
 *
 * Cobertura mínima: apenas odu tem dados completos em traducaoPara.
 * Outros pilares têm dados parciais — testes específicos para odu apenas.
 */
import { describe, it, expect } from 'vitest';
import { gerarFocoDoDia, type FocoDoDia } from './foco-area';

describe('gerarFocoDoDia', () => {
 describe('requer_terreiro (R-022 §4.4)', () => {
  it('pilar=odu → requer_terreiro=true', () => {
   expect(gerarFocoDoDia('odu', 'paz').requer_terreiro).toBe(true);
  });

  it('pilar=astrologia → requer_terreiro=false', () => {
   expect(gerarFocoDoDia('astrologia', 'saude').requer_terreiro).toBe(false);
  });

  it('pilar=cabala → requer_terreiro=false', () => {
   expect(gerarFocoDoDia('cabala', 'paz').requer_terreiro).toBe(false);
  });
 });

 describe('retorno para odu (dados completos)', () => {
  it('area=paz: retorna objeto com campos definidos', () => {
   const foco = gerarFocoDoDia('odu', 'paz') as FocoDoDia;
   expect(foco.area).toBe('paz');
   expect(foco.pilar).toBe('odu');
   expect(typeof foco.mensagem_pilar).toBe('string');
   expect(Array.isArray(foco.ecos_dos_pilares)).toBe(true);
   expect(foco.ecos_dos_pilares.length).toBeGreaterThan(0);
  });

  it('area=saude: requer_terreiro=true e ecos presentes', () => {
   const foco = gerarFocoDoDia('odu', 'saude') as FocoDoDia;
   expect(foco.requer_terreiro).toBe(true);
   expect(foco.ecos_dos_pilares.length).toBe(4);
  });
 });

 describe('tipo de retorno', () => {
  it('retorna FocoDoDia para odu/paz', () => {
   const foco = gerarFocoDoDia('odu', 'paz') as FocoDoDia;
   expect(typeof foco.mensagem_pilar).toBe('string');
   expect(typeof foco.sombra).toBe('string');
   expect(typeof foco.pratica).toBe('string');
   expect(typeof foco.acolhimento).toBe('string');
  });
 });
});
