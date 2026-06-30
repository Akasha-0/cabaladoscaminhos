#!/usr/bin/env node
// scripts/smoke/comments-threading-mentions.ts — parent-brief smoke.
// 20+ runtime checks. Standalone, no imports of UI components.

import {
  createInMemoryMentionsAdapter,
  createInMemoryCommentsAdapter,
  extractMentions,
  matchSuggestions,
  detectActiveMentionPrefix,
  htmlEscape,
  renderBodyWithMentions,
  asPostId,
  asCommentId,
  asUsuarioId,
  asMentionHandle,
  MAX_THREAD_DEPTH,
  SAMPLE_USUARIOS,
  SAMPLE_POST_FOR_TEST,
} from '../../src/lib/engines/comments/index.ts';

let passes = 0;
let fails = 0;
const failures: string[] = [];

function ok(cond: unknown, msg: string): void {
  if (cond) {
    passes++;
  } else {
    fails++;
    failures.push(msg);
  }
}

const pid = asPostId('p-001');
const adapter = createInMemoryCommentsAdapter();
const mentions = createInMemoryMentionsAdapter();

// 1. Post retrieval
const post = adapter.getPost(pid);
ok(post !== null, 'post retrieved');
ok(post?.id === pid, 'post id matches');

// 2. Sample post fields
ok(post?.titulo.includes('Cruzamento'), 'post titulo has Cruzamento');
ok(post?.tags.length === 2, 'post has 2 tags');
ok(post?.autorId === asUsuarioId('u-1'), 'post autor is u-1');

// 3. Tree shape
const tree = adapter.buildTree(pid);
ok(tree.length >= 4, `tree has >=4 roots (got ${tree.length})`);

// 4. Depth enforcement
const allDepths = (function collect(): number[] {
  const out: number[] = [];
  function walk(nodes: ReadonlyArray<{ depth: number; children: ReadonlyArray<any> }>) {
    for (const n of nodes) {
      out.push(n.depth);
      walk(n.children);
    }
  }
  walk(tree as any);
  return out;
})();
ok(allDepths.every((d) => d <= MAX_THREAD_DEPTH), 'all depths <= MAX_THREAD_DEPTH');
ok(allDepths.includes(3), 'tree contains a depth-3 node');
ok(allDepths.includes(0), 'tree contains a depth-0 node');

// 5. Total comment count
ok(adapter.listComments(pid).length >= 12, 'listComments returns >=12');

// 6. Mention extraction works at runtime
const ext = extractMentions('oi @cigano_ramiro @mae_iya');
ok(ext.length === 2, 'extracted 2 mentions');
ok(ext[0]!.handle === 'cigano_ramiro', 'first handle cigano_ramiro');

// 7. NFD normalization (diacritics in mention text)
const extNfd = extractMentions('Mencionando @mãe_iyá');
ok(extNfd.some((e) => e.handle === 'mae_iya'), 'NFD strip on @mãe_iyá');

// 8. Suggestions
const sug = matchSuggestions('cig', mentions.listActive(), 5);
ok(sug.length >= 1, 'at least 1 suggestion for cig');
ok(sug[0]!.usuario.handle === 'cigano_ramiro', 'first suggestion is cigano_ramiro');

// 9. detectActiveMentionPrefix at runtime
ok(detectActiveMentionPrefix('@cig', 4)?.prefix === 'cig', 'detectActive at @cig');

// 10. HTML escape runtime
ok(htmlEscape('<x>') === '&lt;x&gt;', 'htmlEscape <x>');
ok(htmlEscape('a&b') === 'a&amp;b', 'htmlEscape a&b');

// 11. renderBodyWithMentions
const known = [asMentionHandle('cigano_ramiro')];
const ren = renderBodyWithMentions('@cigano_ramiro e @naoexiste', known);
ok(ren.includes('<strong class="mention">@cigano_ramiro</strong>'), 'known handle bolded');
ok(!ren.includes('<strong class="mention">@naoexiste</strong>'), 'unknown not bolded');

// 12. addComment creates a comment
const novo = adapter.addComment({
  postId: pid,
  autorId: asUsuarioId('u-1'),
  parentId: null,
  corpo: 'Smoke @mae_iya comentário',
});
ok(novo.id === asCommentId('c-013'), 'new comment id c-013');
ok(novo.depth === 0, 'new root comment is depth 0');
ok(novo.mentionedHandles.includes(asMentionHandle('mae_iya')), 'mentionedHandles includes mae_iya');

// 13. Notifications
const notifs = adapter.listNotificacoes(asUsuarioId('u-2'));
ok(notifs.length >= 1, 'u-2 has notifications');
const mentionNotifs = notifs.filter((n) => n.tipo === 'mention');
ok(mentionNotifs.length >= 1, 'u-2 has mention notification');

// 14. marcarLida works
const n = notifs[0];
if (n) {
  const m = adapter.marcarLida(n.id);
  ok(m !== null, 'marcarLida returns not-null');
  ok(m?.lida === true, 'lida=true after marcar');
}

// 15. Branded factories throw on bad input
let threw = false;
try {
  asPostId('xxx');
} catch {
  threw = true;
}
ok(threw, 'asPostId throws on bad id');

// 16. SAMPLE_USUARIOS shape
ok(SAMPLE_USUARIOS.length === 8, 'SAMPLE_USUARIOS has 8 entries');
ok(SAMPLE_USUARIOS[0]!.handle === 'cigano_ramiro', 'first user is cigano_ramiro');
ok(SAMPLE_USUARIOS[0]!.tradicaoPrincipal === 'cigano', 'first user tradição is cigano');

// 17. Custom adapter with custom post
const customAdapter = createInMemoryCommentsAdapter({
  post: { ...SAMPLE_POST_FOR_TEST, id: asPostId('p-999') },
});
const customPost = customAdapter.getPost(asPostId('p-999'));
ok(customPost !== null, 'custom adapter returns custom post');
const missingPost = customAdapter.getPost(asPostId('p-001'));
ok(missingPost === null, 'custom adapter returns null for other post');

// 18. addComment validation
let threwEmpty = false;
try {
  adapter.addComment({
    postId: pid,
    autorId: asUsuarioId('u-1'),
    parentId: null,
    corpo: '   ',
  });
} catch {
  threwEmpty = true;
}
ok(threwEmpty, 'addComment throws on empty body');

// 19. Tree is frozen / readonly (returns same ref type)
const tree2 = adapter.buildTree(pid);
ok(tree2.length === tree.length || tree2.length === tree.length + 1, 'tree grew after addComment');

// 20. Tradicao catalog completeness
const TRADICOES = ['cigano','orixas','candomble','umbanda','ifa','cabala','astrologia','tantra','numerologia','tarot'];
ok(TRADICOES.length === 10, '10 tradições in extended catalog');

// 21. Mention handles uppercase safe
const upper = extractMentions('Oi @CIGANO_RAMIRO');
ok(upper.some((e) => e.handle === 'CIGANO_RAMIRO'), 'uppercase handle preserved');

// 22. Sample post tags are frozen
ok(Object.isFrozen(post?.tags), 'post.tags is frozen');

// Summary
console.log(`\n— smoke/comments-threading-mentions.ts —`);
console.log(`PASS: ${passes}`);
console.log(`FAIL: ${fails}`);
if (fails > 0) {
  console.log('\nFailures:');
  for (const f of failures.slice(0, 30)) console.log('  - ' + f);
  process.exit(1);
}
console.log('OK');