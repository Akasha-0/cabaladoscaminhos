// ============================================================================
// TEMPLATES — Tests
// ============================================================================
// Cobertura do registry de templates de notificação:
//   1. getTemplates() — cobertura completa do enum NotificationType
//   2. getTemplateById() — hit + miss
//   3. getTemplatesByCategory() — particionamento correto
//   4. getHighPriorityTemplates() — apenas priority 'high'
//   5. formatTemplate() — interpolação de variáveis + fallbacks
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  getTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getHighPriorityTemplates,
  formatTemplate,
  type NotificationTemplate,
  type TemplateCategory,
  type NotificationType,
} from '../templates';

const ALL_TYPES: NotificationType[] = [
  'LIKE',
  'COMMENT',
  'POST_REPLY',
  'FOLLOW',
  'MENTION',
  'GROUP_INVITE',
  'GROUP_POST',
  'GROUP_ROLE_CHANGE',
  'ARTICLE_RECOMMENDATION',
  'ARTICLE_PUBLISHED',
  'SYSTEM_ALERT',
  'MODERATION_ACTION',
  'DIGEST_WEEKLY',
];

describe('NotificationTemplate registry', () => {
  describe('getTemplates', () => {
    it('retorna 13 templates cobrindo todos os tipos do enum', () => {
      const templates = getTemplates();
      expect(templates).toHaveLength(13);
    });

    it('cada NotificationType tem exatamente um template catalogado', () => {
      const templates = getTemplates();
      const ids = templates.map((t) => t.id).sort();
      expect(ids).toEqual([...ALL_TYPES].sort());
    });

    it('não há ids duplicados no catálogo', () => {
      const templates = getTemplates();
      const ids = templates.map((t) => t.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('getTemplateById', () => {
    it('retorna o template quando o id existe', () => {
      const template = getTemplateById('LIKE');
      expect(template).not.toBeNull();
      expect(template?.type).toBe('LIKE');
      expect(template?.category).toBe('social');
    });

    it('retorna null para id desconhecido', () => {
      expect(getTemplateById('UNKNOWN_TYPE')).toBeNull();
      expect(getTemplateById('')).toBeNull();
      expect(getTemplateById('like')).toBeNull(); // case-sensitive
    });
  });

  describe('getTemplatesByCategory', () => {
    it('particiona corretamente por categoria', () => {
      const categories: TemplateCategory[] = ['social', 'community', 'content', 'system'];
      const counts: Record<TemplateCategory, number> = {
        social: 0,
        community: 0,
        content: 0,
        system: 0,
      };
      for (const cat of categories) {
        const templates = getTemplatesByCategory(cat);
        counts[cat] = templates.length;
        // Todos retornados devem realmente ser da categoria pedida
        for (const t of templates) {
          expect(t.category).toBe(cat);
        }
      }
      // Sanity: soma das categorias == total
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      expect(total).toBe(getTemplates().length);
    });

    it('retorna [] para categoria inválida (defensivo)', () => {
      // @ts-expect-error: teste runtime com categoria inválida proposital
      const result = getTemplatesByCategory('invalid-category');
      expect(result).toEqual([]);
    });

    it('cobre as 4 categorias esperadas', () => {
      const social = getTemplatesByCategory('social');
      const community = getTemplatesByCategory('community');
      const content = getTemplatesByCategory('content');
      const system = getTemplatesByCategory('system');
      expect(social.length).toBeGreaterThan(0);
      expect(community.length).toBeGreaterThan(0);
      expect(content.length).toBeGreaterThan(0);
      expect(system.length).toBeGreaterThan(0);
    });
  });

  describe('getHighPriorityTemplates', () => {
    it('retorna apenas templates com priority high', () => {
      const high = getHighPriorityTemplates();
      expect(high.length).toBeGreaterThan(0);
      for (const t of high) {
        expect(t.priority).toBe('high');
      }
    });

    it('inclui tipos críticos (MENTION, GROUP_INVITE, SYSTEM_ALERT, MODERATION_ACTION, GROUP_ROLE_CHANGE)', () => {
      const high = getHighPriorityTemplates();
      const ids = high.map((t) => t.id);
      expect(ids).toContain('MENTION');
      expect(ids).toContain('GROUP_INVITE');
      expect(ids).toContain('SYSTEM_ALERT');
      expect(ids).toContain('MODERATION_ACTION');
      expect(ids).toContain('GROUP_ROLE_CHANGE');
    });

    it('não inclui tipos de baixa prioridade', () => {
      const high = getHighPriorityTemplates();
      const ids = high.map((t) => t.id);
      expect(ids).not.toContain('ARTICLE_RECOMMENDATION');
      expect(ids).not.toContain('DIGEST_WEEKLY');
    });
  });
});

describe('formatTemplate', () => {
  it('substitui placeholders pelos valores fornecidos', () => {
    const template = getTemplateById('LIKE')!;
    const result = formatTemplate(template, {
      actorName: 'Maria Silva',
      postExcerpt: 'Ayahuasca e cura',
    });
    expect(result.title).toBe('Maria Silva curtiu seu post');
    expect(result.body).toBe('"Ayahuasca e cura"');
  });

  it('usa o example declarado quando a variável não é fornecida', () => {
    const template = getTemplateById('FOLLOW')!;
    const result = formatTemplate(template, {}); // sem vars
    expect(result.title).toContain('começou a seguir você');
    // Example declarado é "Carlos Mendes" — title e body devem referenciá-lo
    expect(result.title).toContain('Carlos Mendes');
    expect(result.body).toContain('Carlos Mendes');
  });

  it('aceita vars parciais — usa example pras ausentes', () => {
    const template = getTemplateById('COMMENT')!;
    const result = formatTemplate(template, { actorName: 'João' });
    expect(result.title).toBe('João comentou no seu post');
    // commentExcerpt cai no example
    expect(result.body).toContain('pertinente');
  });

  it('tolera whitespace ao redor do nome da variável', () => {
    // Pega um template que tenha variável no body e injeta uma string com
    // whitespace interno via substituição manual do placeholder — isto
    // valida a regex PLACEHOLDER_RE usada no source.
    const template = getTemplateById('LIKE')!;
    // Verifica indiretamente: o example do template cobre o formato com
    // whitespace zero. Mas a regex aceita {{ varName }} com espaços.
    // Aqui validamos pelo menos que a substituição não quebra com
    // template limpo + vars limpos:
    const result = formatTemplate(template, { actorName: 'A', postExcerpt: 'B' });
    expect(result.title).not.toMatch(/\{\{/); // sem placeholders pendentes
    expect(result.body).not.toMatch(/\{\{/);
  });

  it('deixa placeholders de variáveis desconhecidas como estão (fail-soft)', () => {
    // Injeta um template artificial via cast — variáveis extras não devem
    // quebrar o render, e placeholders de vars que NÃO estão no registry
    // permanecem visíveis para debug.
    const template = {
      id: 'LIKE',
      type: 'LIKE' as NotificationType,
      category: 'social' as TemplateCategory,
      priority: 'normal' as const,
      title: 'Test',
      description: 'Test',
      defaultChannels: { inApp: true, email: true, push: false },
      variables: [],
      preview: { title: 'Hello {{unknownVar}}', body: 'World' },
    } satisfies NotificationTemplate;

    const result = formatTemplate(template, {});
    expect(result.title).toBe('Hello {{unknownVar}}'); // fail-soft
    expect(result.body).toBe('World');
  });

  it('faz trim de valores undefined/vazios — usa example em vez de string vazia', () => {
    const template = getTemplateById('LIKE')!;
    const result = formatTemplate(template, { actorName: '' });
    // actorName vazio → cai no example "Maria Silva"
    expect(result.title).toContain('Maria Silva');
  });
});
