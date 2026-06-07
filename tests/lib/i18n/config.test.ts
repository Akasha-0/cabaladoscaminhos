import { describe, it, expect } from 'vitest';
import { detectLocale, getMessages, makeT, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';

describe('i18n config', () => {
  it('lista pt-BR e en como locales suportados', () => {
    expect(SUPPORTED_LOCALES).toContain('pt-BR');
    expect(SUPPORTED_LOCALES).toContain('en');
    expect(DEFAULT_LOCALE).toBe('pt-BR');
  });

  it('detectLocale retorna pt-BR por padrão', () => {
    expect(detectLocale(null)).toBe('pt-BR');
    expect(detectLocale(undefined)).toBe('pt-BR');
    expect(detectLocale('')).toBe('pt-BR');
  });

  it('detectLocale retorna en para "en-US"', () => {
    expect(detectLocale('en-US')).toBe('en');
    expect(detectLocale('en')).toBe('en');
  });

  it('detectLocale retorna pt-BR para "pt-BR" ou "pt"', () => {
    expect(detectLocale('pt-BR')).toBe('pt-BR');
    expect(detectLocale('pt')).toBe('pt-BR');
    expect(detectLocale('pt-BR,en-US;q=0.9')).toBe('pt-BR');
  });

  it('getMessages retorna dicionário pt-BR por padrão', () => {
    const msg = getMessages('pt-BR');
    expect(msg).toHaveProperty('common');
    expect(msg).toHaveProperty('nav');
    expect((msg as Record<string, any>).nav.mandala).toBe('Mandala');
  });

  it('getMessages retorna dicionário en para "en"', () => {
    const msg = getMessages('en');
    expect((msg as Record<string, any>).nav.mandala).toBe('Mandala'); // mesmo label em EN
    expect((msg as Record<string, any>).nav.oraculo).toBe('Oracle');
  });

  it('makeT resolve dot-path', () => {
    const t = makeT(getMessages('pt-BR'));
    expect(t('common.appName')).toBe('Cabala dos Caminhos');
    expect(t('nav.mandala')).toBe('Mandala');
  });

  it('makeT interpola variáveis {varName}', () => {
    const t = makeT(getMessages('pt-BR'));
    // saudacaoCompleta: "{saudacao} sua Mandala Akáshica aguarda"
    const result = t('mandala.saudacaoCompleta', { saudacao: 'Boa noite —' });
    expect(result).toBe('Boa noite — sua Mandala Akáshica aguarda');
  });

  it('makeT retorna o dot-path como fallback quando chave não existe', () => {
    const t = makeT(getMessages('pt-BR'));
    expect(t('chave.inexistente')).toBe('chave.inexistente');
  });
});
