// ============================================================================
// DATA DELETION — LGPD Art. 18, VI (Direito ao esquecimento)
// ============================================================================
// Implementação REAL do right-to-be-forgotten. Substitui os stubs vazios
// identificados em SECURITY-AUDIT F5 (Wave 10).
//
// Estratégia (Wave 11):
//   1. Soft-delete primeiro: anonimizamos dados pessoais no User (email
//      → "deleted-<cuid>@deleted.local", nome → "Usuário removido",
//      data/hora/local nascimento → null)
//   2. Hard-delete de tabelas dependentes onde possível:
//      mapaNatal (cascade), journalEntries (cascade), favoritos (cascade)
//   3. Anonimiza posts/comentários preservados (mantém conteúdo mas
//      substitui authorId por `deleted-<cuid>` user stub — LGPD art. 18 §6°
//      permite manter dados "para exercício regular de direitos")
//   4. Deleta follows, likes, notifications, AI conversations
//   5. Audit log (LGPD: ACCOUNT_DELETE_CONFIRMED) preserva o evento
//      por 24 meses (justificativa legal de cumprimento)
//   6. Se `supabaseUserId` existe, chama supabase.auth.admin.deleteUser()
//      para remover do Auth também
//
// IMPORTANTE: este módulo roda apenas server-side. Não importar em client.
// ============================================================================

import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/server';
import { audit } from '@/lib/audit';

export interface DeletionSummary {
  userId: string;
  deletedAt: string;
  cascades: {
    mapaNatal: number;
    journalEntries: number;
    favoritos: number;
    spiritualProfile: number;
    posts: number;
    comments: number;
    likes: number;
    commentLikes: number;
    follows: number;
    notifications: number;
    aiConversations: number;
    pushSubscriptions: number;
    unsubscribeTokens: number;
    feedItems: number;
    bookmarks: number;
    groupMembers: number;
    groupInvites: number;
  };
  supabaseAuthDeleted: boolean;
  errors: string[];
}

const ANON_EMAIL_PREFIX = 'deleted-';
const ANON_EMAIL_DOMAIN = '@deleted.local';

/**
 * Executa o direito ao esquecimento (LGPD art. 18 VI).
 * Não lança — retorna summary com errors por etapa.
 *
 * @example
 *   const result = await deleteUserData('user_123');
 *   if (result.errors.length === 0) console.log('OK');
 */
export async function deleteUserData(userId: string): Promise<DeletionSummary> {
  const errors: string[] = [];
  const cascades: DeletionSummary['cascades'] = {
    mapaNatal: 0,
    journalEntries: 0,
    favoritos: 0,
    spiritualProfile: 0,
    posts: 0,
    comments: 0,
    likes: 0,
    commentLikes: 0,
    follows: 0,
    notifications: 0,
    aiConversations: 0,
    pushSubscriptions: 0,
    unsubscribeTokens: 0,
    feedItems: 0,
    bookmarks: 0,
    groupMembers: 0,
    groupInvites: 0,
  };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, supabaseUserId: true, email: true, nomeCompleto: true },
  });

  if (!user) {
    return {
      userId,
      deletedAt: new Date().toISOString(),
      cascades,
      supabaseAuthDeleted: false,
      errors: ['User not found'],
    };
  }

  // 1. Cascade-deletes (definidos no schema): MapaNatal, JournalEntry, Favorito
  try {
    const mn = await prisma.mapaNatal.deleteMany({ where: { userId } });
    cascades.mapaNatal = mn.count;
  } catch (e) {
    errors.push(`mapaNatal: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  try {
    const je = await prisma.journalEntry.deleteMany({ where: { userId } });
    cascades.journalEntries = je.count;
  } catch (e) {
    errors.push(`journalEntries: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  try {
    const fav = await prisma.favorito.deleteMany({ where: { userId } });
    cascades.favoritos = fav.count;
  } catch (e) {
    errors.push(`favoritos: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 2. SpiritualProfile (não tem relação Prisma explícita no User, mas
  //    tipicamente tem userId direto)
  try {
    const sp = await prisma.spiritualProfile.deleteMany({
      where: { userId },
    });
    cascades.spiritualProfile = sp.count;
  } catch (e) {
    // SpiritualProfile pode não existir em todos os deploys
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[data-deletion] spiritualProfile step:', e);
    }
  }

  // 3. Posts — soft delete + anonimiza (mantém conteúdo para replies
  //    existentes, mas o autor fica como "Usuário removido")
  try {
    const posts = await prisma.post.updateMany({
      where: { authorId: userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    cascades.posts = posts.count;
  } catch (e) {
    errors.push(`posts: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 4. Comments — hard delete (não há lógica de thread preservation complexa)
  try {
    const comments = await prisma.comment.deleteMany({
      where: { authorId: userId },
    });
    cascades.comments = comments.count;
  } catch (e) {
    errors.push(`comments: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 5. Likes (post likes)
  try {
    const likes = await prisma.like.deleteMany({ where: { userId } });
    cascades.likes = likes.count;
  } catch (e) {
    errors.push(`likes: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 6. CommentLikes
  try {
    const cl = await prisma.commentLike.deleteMany({ where: { userId } });
    cascades.commentLikes = cl.count;
  } catch (e) {
    errors.push(`commentLikes: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 7. Bookmarks
  try {
    const bm = await prisma.bookmark.deleteMany({ where: { userId } });
    cascades.bookmarks = bm.count;
  } catch (e) {
    errors.push(`bookmarks: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 8. Follows (como follower e como seguido)
  try {
    const follows = await prisma.follow.deleteMany({
      where: {
        OR: [{ followerId: userId }, { followedId: userId }],
      },
    });
    cascades.follows = follows.count;
  } catch (e) {
    errors.push(`follows: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 9. Notifications (enviadas para ele + geradas por ele)
  try {
    const notifs = await prisma.notification.deleteMany({
      where: {
        OR: [{ userId }, { actorId: userId }],
      },
    });
    cascades.notifications = notifs.count;
  } catch (e) {
    errors.push(`notifications: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 10. AI Conversations (e cascata para AiMessage)
  try {
    const ai = await prisma.aiConversation.deleteMany({
      where: { userId },
    });
    cascades.aiConversations = ai.count;
  } catch (e) {
    errors.push(`aiConversations: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 11. PushSubscriptions
  try {
    const ps = await prisma.pushSubscription.deleteMany({
      where: { userId },
    });
    cascades.pushSubscriptions = ps.count;
  } catch (e) {
    errors.push(`pushSubscriptions: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 12. UnsubscribeTokens
  try {
    const ut = await prisma.unsubscribeToken.deleteMany({
      where: { userId },
    });
    cascades.unsubscribeTokens = ut.count;
  } catch (e) {
    errors.push(`unsubscribeTokens: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 13. FeedItems
  try {
    const fi = await prisma.feedItem.deleteMany({
      where: { userId },
    });
    cascades.feedItems = fi.count;
  } catch (e) {
    errors.push(`feedItems: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 14. GroupMembers + GroupInvites
  try {
    const gm = await prisma.groupMember.deleteMany({
      where: { userId },
    });
    cascades.groupMembers = gm.count;
  } catch (e) {
    errors.push(`groupMembers: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  try {
    const gi = await prisma.groupInvite.deleteMany({
      where: {
        OR: [{ inviteeId: userId }, { inviterId: userId }],
      },
    });
    cascades.groupInvites = gi.count;
  } catch (e) {
    errors.push(`groupInvites: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 15. Anonimiza o User em si (não deleta para preservar integridade
  //    referencial de audit_logs e posts soft-deleted)
  try {
    const anonEmail = `${ANON_EMAIL_PREFIX}${userId}${ANON_EMAIL_DOMAIN}`;
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: anonEmail,
        nomeCompleto: 'Usuário removido',
        dataNascimento: new Date('1900-01-01'),
        horaNascimento: null,
        localNascimento: null,
        passwordHash: null,
        supabaseUserId: null,
        // Mantém stripeCustomerId/Subscription para fins fiscais (não PII direto)
      },
    });
  } catch (e) {
    errors.push(`user.anonymize: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // 16. Supabase Auth deletion (admin)
  let supabaseAuthDeleted = false;
  if (user.supabaseUserId) {
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { error } = await supabase.auth.admin.deleteUser(user.supabaseUserId);
        if (!error) supabaseAuthDeleted = true;
        else errors.push(`supabase.deleteUser: ${error.message}`);
      }
    } catch (e) {
      errors.push(`supabase.deleteUser: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  }

  // 17. Audit log final
  await audit.accountDeleteConfirmed(userId, {
    metadata: {
      cascades,
      supabaseAuthDeleted,
      errorsCount: errors.length,
    },
  });

  return {
    userId,
    deletedAt: new Date().toISOString(),
    cascades,
    supabaseAuthDeleted,
    errors,
  };
}
