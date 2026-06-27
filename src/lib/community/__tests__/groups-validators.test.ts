// ============================================================================
// GROUPS API — Tests unitários de validação (Zod schemas)
// ============================================================================
// Foco em regras de negócio que devem ser aplicadas antes do DB:
//  - Slug pattern (lowercase, hífens, 2-50 chars)
//  - Privacidade: isPublic default true
//  - Rules: 3-200 chars por item, max 10 itens
//  - Roles: ADMIN/MODERATOR/MEMBER (apenas enum)
//  - Invite: inviteeUserId XOR inviteeEmail (apenas um)
// ============================================================================

import { describe, it, expect } from 'vitest';

import {
  CreateGroupSchema,
  UpdateGroupSchema,
  GroupListQuerySchema,
  CreateInviteSchema,
  UpdateMemberRoleSchema,
  AcceptInviteSchema,
  SLUG_PATTERN,
} from '@/lib/validators/groups';

describe('Groups validators', () => {
  describe('SLUG_PATTERN', () => {
    it('aceita slugs simples lowercase', () => {
      expect(SLUG_PATTERN.test('cabala')).toBe(true);
      expect(SLUG_PATTERN.test('ifa')).toBe(true);
      expect(SLUG_PATTERN.test('cristianismo-mistico')).toBe(true);
    });

    it('rejeita maiúsculas', () => {
      expect(SLUG_PATTERN.test('Cabala')).toBe(false);
      expect(SLUG_PATTERN.test('IFA')).toBe(false);
    });

    it('rejeita espaços', () => {
      expect(SLUG_PATTERN.test('cab ala')).toBe(false);
    });

    it('rejeita hífen no início', () => {
      expect(SLUG_PATTERN.test('-cabala')).toBe(false);
    });

    it('rejeita underscore', () => {
      expect(SLUG_PATTERN.test('caminho_da_serra')).toBe(false);
    });

    it('rejeita slug muito curto', () => {
      expect(SLUG_PATTERN.test('a')).toBe(false);
    });

    it('rejeita slug muito longo (>50 chars)', () => {
      const long = 'a'.repeat(51);
      expect(SLUG_PATTERN.test(long)).toBe(false);
    });
  });

  describe('CreateGroupSchema', () => {
    const valid = {
      slug: 'cabala',
      name: 'Cabala & Árvore da Vida',
      description: 'Tradição mística judaica — estudo das 10 Sefirot e 22 caminhos.',
      tradition: 'cabala',
    };

    it('aceita payload mínimo válido', () => {
      const r = CreateGroupSchema.safeParse(valid);
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.isPublic).toBe(true);
        expect(r.data.requireApproval).toBe(false);
        expect(r.data.rules).toEqual([]);
      }
    });

    it('aceita payload completo', () => {
      const r = CreateGroupSchema.safeParse({
        ...valid,
        longDescription: 'Descrição longa opcional',
        rules: ['Respeito', 'Fontes citadas', 'Sem promessas absolutas'],
        iconUrl: 'https://cdn.example/icon.png',
        bannerUrl: 'https://cdn.example/banner.png',
        isPublic: false,
        requireApproval: true,
      });
      expect(r.success).toBe(true);
    });

    it('rejeita slug inválido (maiúscula)', () => {
      const r = CreateGroupSchema.safeParse({ ...valid, slug: 'Cabala' });
      expect(r.success).toBe(false);
    });

    it('rejeita descrição muito curta', () => {
      const r = CreateGroupSchema.safeParse({ ...valid, description: 'curto' });
      expect(r.success).toBe(false);
    });

    it('rejeita nome vazio', () => {
      const r = CreateGroupSchema.safeParse({ ...valid, name: '' });
      expect(r.success).toBe(false);
    });

    it('rejeita mais de 10 regras', () => {
      const r = CreateGroupSchema.safeParse({
        ...valid,
        rules: Array(11).fill('regra'),
      });
      expect(r.success).toBe(false);
    });

    it('rejeita rule vazia', () => {
      const r = CreateGroupSchema.safeParse({
        ...valid,
        rules: [''],
      });
      expect(r.success).toBe(false);
    });
  });

  describe('UpdateGroupSchema', () => {
    it('aceita atualização parcial (apenas name)', () => {
      const r = UpdateGroupSchema.safeParse({ name: 'Novo Nome' });
      expect(r.success).toBe(true);
    });

    it('aceita payload vazio', () => {
      const r = UpdateGroupSchema.safeParse({});
      expect(r.success).toBe(true);
    });

    it('rejeita isPublic como string', () => {
      const r = UpdateGroupSchema.safeParse({ isPublic: 'true' });
      expect(r.success).toBe(false);
    });
  });

  describe('GroupListQuerySchema', () => {
    it('aceita filtros vazios', () => {
      const r = GroupListQuerySchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.limit).toBe(30);
      }
    });

    it('coage limit para número', () => {
      const r = GroupListQuerySchema.safeParse({ limit: '10' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.limit).toBe(10);
    });

    it('rejeita limit fora do range', () => {
      const r1 = GroupListQuerySchema.safeParse({ limit: 0 });
      const r2 = GroupListQuerySchema.safeParse({ limit: 200 });
      expect(r1.success).toBe(false);
      expect(r2.success).toBe(false);
    });

    it('transforma isPublic string em boolean', () => {
      const r = GroupListQuerySchema.safeParse({ isPublic: 'true' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.isPublic).toBe(true);
    });

    it('transforma isPublic="false" em false', () => {
      const r = GroupListQuerySchema.safeParse({ isPublic: 'false' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.isPublic).toBe(false);
    });

    it('mantém isPublic undefined quando omitido', () => {
      const r = GroupListQuerySchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.isPublic).toBe(undefined);
    });

    it('transforma mine=true', () => {
      const r = GroupListQuerySchema.safeParse({ mine: 'true' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.mine).toBe(true);
    });
  });

  describe('CreateInviteSchema', () => {
    it('aceita convite por userId', () => {
      const r = CreateInviteSchema.safeParse({ inviteeUserId: 'user-1' });
      expect(r.success).toBe(true);
    });

    it('aceita convite por email', () => {
      const r = CreateInviteSchema.safeParse({
        inviteeEmail: 'convidado@example.com',
      });
      expect(r.success).toBe(true);
    });

    it('rejeita quando ambos userId e email são preenchidos', () => {
      const r = CreateInviteSchema.safeParse({
        inviteeUserId: 'user-1',
        inviteeEmail: 'convidado@example.com',
      });
      expect(r.success).toBe(false);
    });

    it('rejeita quando nenhum é preenchido', () => {
      const r = CreateInviteSchema.safeParse({});
      expect(r.success).toBe(false);
    });

    it('rejeita email inválido', () => {
      const r = CreateInviteSchema.safeParse({
        inviteeEmail: 'not-an-email',
      });
      expect(r.success).toBe(false);
    });
  });

  describe('UpdateMemberRoleSchema', () => {
    it('aceita roles válidas', () => {
      expect(UpdateMemberRoleSchema.safeParse({ role: 'ADMIN' }).success).toBe(true);
      expect(UpdateMemberRoleSchema.safeParse({ role: 'MODERATOR' }).success).toBe(true);
      expect(UpdateMemberRoleSchema.safeParse({ role: 'MEMBER' }).success).toBe(true);
    });

    it('rejeita role desconhecida', () => {
      const r = UpdateMemberRoleSchema.safeParse({ role: 'OWNER' });
      expect(r.success).toBe(false);
    });
  });

  describe('AcceptInviteSchema', () => {
    it('aceita token com 8+ chars', () => {
      const r = AcceptInviteSchema.safeParse({ token: 'abcdef1234' });
      expect(r.success).toBe(true);
    });

    it('rejeita token muito curto', () => {
      const r = AcceptInviteSchema.safeParse({ token: 'short' });
      expect(r.success).toBe(false);
    });
  });
});
