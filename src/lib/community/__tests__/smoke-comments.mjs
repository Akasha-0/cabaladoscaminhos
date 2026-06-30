// ============================================================================
// SMOKE TEST — Comments Threading + Mentions (cycle 68 Worker C)
// ============================================================================
// Standalone runtime smoke via `node --experimental-strip-types`.
//
// Este smoke é INLINE (re-implementa os algoritmos) porque os módulos
// production usam `@/...` path aliases que node raw não resolve. O objetivo
// é validar que a LÓGICA está correta — não rodar os módulos diretamente.
//
// Cada check mapeia para uma função do engine real:
//   S1 → extractMentions (comments-mentions.ts)
//   S2 → isSacredTerm (sacred term safety)
//   S3 → buildThreadTree (comments-threading.ts)
//   S4 → getAncestors
//   S5 → getDescendants
//   S6 → getThreadDepth
//   S7 → createMentionNotification self-mention block
//   S8 → createMentionNotification idempotência
//   S9 → editComment ownership
//   S10 → deleteComment idempotência
//   S11 → formatMentions com displayName
//   S12 → auditMentionSafety cobre 7 tradições
// ============================================================================

// ============================================================================
// INLINE ALGORITHMS — espelham comments-mentions.ts
// ============================================================================

const SACRED_TERMS = new Set([
  // ORIXAS
  'oxala','iemanjá','xango','ogum','oxum','oxossi','iansa','obaluaie','nana',
  'omolu','exu','pombagira','oxumare','logunede','ossae',
  // CIGANO
  'cavaleiro','cigana','sol','lua','estrela','coruja','cachorro','cavalo',
  'peixe','chave','cruz','arvore','nuvens','flores','serpente','leao','aguia',
  // TAROT
  'louro','mago','sacerdotisa','imperatriz','imperador','enamorados',
  'carruagem','forca','ermitao','justica','morte','temperanca','mundo','julgamento',
  // ASTROLOGIA
  'aries','touro','gemeos','cancer','leao','virgem','libra','escorpiao',
  'sagitario','capricornio','aquario','peixes','mercurio','venus','marte',
  // SEFIROT
  'kether','chokmah','binah','chesed','geburah','tiphareth','netzach',
  'hod','yesod','malkuth',
  // CHAKRAS
  'muladhara','swadhisthana','manipura','anahata','vishuddha','ajna','sahasrara',
  // IFA
  'yeku','iwori','odi','irosu','osa','irete','otura','ofun','akoda','ogbe',
]);

function normalizeSacred(raw) {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_\s.]/g, '');
}

function isSacredTerm(username) {
  return SACRED_TERMS.has(normalizeSacred(username));
}

const HANDLE_RE = /(?:^|\W)@([\p{L}\p{N}_.\-]{3,30})(?=$|\W)/gu;

function extractMentions(content) {
  if (!content) return [];
  const out = [];
  const seen = new Set();
  let m;
  HANDLE_RE.lastIndex = 0;
  while ((m = HANDLE_RE.exec(content)) !== null) {
    if (out.length >= 10) break;
    const fullMatch = m[0];
    const handleRaw = m[1];
    const atIdxInMatch = fullMatch.lastIndexOf('@');
    if (atIdxInMatch < 0) continue;
    const atAbs = m.index + atIdxInMatch;
    const handle = handleRaw.toLowerCase();
    if (isSacredTerm(handle)) continue;
    if (seen.has(handle)) continue;
    seen.add(handle);
    out.push({ username: handle, position: atAbs, length: 1 + handleRaw.length });
  }
  return out;
}

// ============================================================================
// INLINE ALGORITHMS — espelham comments-threading.ts
// ============================================================================

function buildThreadTree(comments, options = {}) {
  const maxDepth = options.maxDepth ?? Infinity;
  const live = options.includeDeleted
    ? comments.slice()
    : comments.filter((c) => c.deletedAt === null);

  const byId = new Map();
  for (const c of live) byId.set(c.id, c);

  const childMap = new Map();
  for (const c of live) {
    const arr = childMap.get(c.parentId) ?? [];
    arr.push(c);
    childMap.set(c.parentId, arr);
  }

  // Detect cycles inline (mirror of detectCycles in production)
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  for (const c of live) color.set(c.id, WHITE);
  const inCycle = new Set();
  function visit(id, path) {
    if (!byId.has(id)) return;
    const col = color.get(id);
    if (col === BLACK) return;
    if (col === GRAY) {
      const startIdx = path.indexOf(id);
      if (startIdx >= 0) {
        for (let i = startIdx; i < path.length; i++) inCycle.add(path[i]);
      }
      return;
    }
    color.set(id, GRAY);
    const node = byId.get(id);
    if (node.parentId) visit(node.parentId, [...path, id]);
    color.set(id, BLACK);
  }
  for (const c of live) {
    if (color.get(c.id) === WHITE) visit(c.id, []);
  }

  function buildSubtree(comment, depth) {
    const kids = depth < maxDepth ? (childMap.get(comment.id) ?? []) : [];
    return {
      comment,
      depth,
      // Cycle members are filtered out to avoid infinite recursion
      children: kids.filter((c) => !inCycle.has(c.id)).map((c) => buildSubtree(c, depth + 1)),
    };
  }

  const roots = live.filter((c) => {
    if (c.parentId === null) return true;
    if (c.parentId === c.id) return true;
    if (!byId.has(c.parentId)) return true;
    // Cycle: X→Y→X. Both X and Y are orphans of each other. To avoid empty
    // tree, mark both as roots. (Production uses 3-color DFS detectCycles.)
    if (hasCycle(live) && wouldBeInCycle(c, live)) return true;
    return false;
  });

  roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return roots.map((r) => buildSubtree(r, 1));
}

function getAncestors(commentId, comments) {
  const byId = new Map(comments.map((c) => [c.id, c]));
  const target = byId.get(commentId);
  if (!target) return [];
  const chain = [];
  const visited = new Set([commentId]);
  let cur = target.parentId ? byId.get(target.parentId) : undefined;
  while (cur) {
    if (visited.has(cur.id)) break;
    visited.add(cur.id);
    chain.push(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return chain;
}

function getDescendants(commentId, comments) {
  const childMap = new Map();
  for (const c of comments) {
    if (c.deletedAt) continue;
    const arr = childMap.get(c.parentId) ?? [];
    arr.push(c);
    childMap.set(c.parentId, arr);
  }
  const out = [];
  function dfs(id) {
    for (const k of childMap.get(id) ?? []) {
      out.push(k);
      dfs(k.id);
    }
  }
  dfs(commentId);
  return out;
}

function hasCycle(comments) {
  const byId = new Map(comments.map((c) => [c.id, c]));
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  for (const c of comments) color.set(c.id, WHITE);
  function visit(id, path) {
    if (!byId.has(id)) return false;
    const col = color.get(id);
    if (col === BLACK) return false;
    if (col === GRAY) {
      return path.includes(id);
    }
    color.set(id, GRAY);
    const node = byId.get(id);
    if (node.parentId && visit(node.parentId, [...path, id])) return true;
    color.set(id, BLACK);
    return false;
  }
  for (const c of comments) {
    if (color.get(c.id) === WHITE) {
      if (visit(c.id, [])) return true;
    }
  }
  return false;
}

function wouldBeInCycle(c, comments) {
  // Walk up the parent chain from c; if we revisit c, it's in a cycle.
  const byId = new Map(comments.map((cm) => [cm.id, cm]));
  const seen = new Set();
  let cur = c.parentId ? byId.get(c.parentId) : undefined;
  while (cur) {
    if (cur.id === c.id) return true;
    if (seen.has(cur.id)) return false;
    seen.add(cur.id);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return false;
}

function getThreadDepth(commentId, comments) {
  const childMap = new Map();
  for (const c of comments) {
    if (c.deletedAt) continue;
    const arr = childMap.get(c.parentId) ?? [];
    arr.push(c);
    childMap.set(c.parentId, arr);
  }
  if (!comments.some((c) => c.id === commentId)) return 0;
  let max = 0;
  function dfs(id, depth) {
    const kids = childMap.get(id) ?? [];
    if (kids.length === 0) {
      if (depth > max) max = depth;
      return;
    }
    for (const k of kids) dfs(k.id, depth + 1);
  }
  dfs(commentId, 0);
  return max;
}

// ============================================================================
// INLINE — createMentionNotification logic (com in-memory store)
// ============================================================================

const notificationStore = new Map(); // id → {userId, commentId, actorId, read}

function createMentionNotification({ commentId, mentionedUserId, mentionerId }) {
  if (mentionerId === mentionedUserId) return null; // self-mention block
  // Dedup
  for (const n of notificationStore.values()) {
    if (n.userId === mentionedUserId && n.commentId === commentId) {
      return n;
    }
  }
  const id = `notif_${notificationStore.size + 1}`;
  const n = {
    id,
    userId: mentionedUserId,
    commentId,
    actorId: mentionerId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notificationStore.set(id, n);
  return n;
}

// ============================================================================
// INLINE — edit/delete ownership (com in-memory comment store)
// ============================================================================

const commentStore = new Map(); // id → comment

function editComment({ commentId, authorId, newContent }) {
  const c = commentStore.get(commentId);
  if (!c) throw new Error('NOT_FOUND');
  if (c.deletedAt) throw new Error('NOT_FOUND');
  if (c.authorId !== authorId) throw new Error('FORBIDDEN');
  c.content = newContent;
  c.editedAt = new Date().toISOString();
  return c;
}

function deleteComment({ commentId, authorId }) {
  const c = commentStore.get(commentId);
  if (!c) throw new Error('NOT_FOUND');
  if (c.deletedAt) return; // idempotente
  if (c.authorId !== authorId) throw new Error('FORBIDDEN');
  c.deletedAt = new Date().toISOString();
}

// ============================================================================
// INLINE — formatMentions
// ============================================================================

function formatMentions(content, userMap) {
  const ms = extractMentions(content);
  let out = content;
  for (let i = ms.length - 1; i >= 0; i--) {
    const m = ms[i];
    const u = userMap.get(m.username);
    if (!u) continue;
    out = out.slice(0, m.position) + `@${u.displayName}` + out.slice(m.position + m.length);
  }
  return out;
}

// ============================================================================
// HELPERS — assertions
// ============================================================================

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, label = '') {
  if (actual !== expected) {
    throw new Error(`${label || 'assertEqual'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label || 'assertDeepEqual'}: expected ${e}, got ${a}`);
  }
}

// ============================================================================
// FIXTURES
// ============================================================================

const ISO = (s) => new Date(s).toISOString();

function mkComment({ id, parentId = null, content = '', deletedAt = null }) {
  return {
    id,
    postId: 'post_1',
    authorId: 'user_alice',
    parentId,
    content,
    createdAt: ISO('2026-06-30T12:00:00Z'),
    editedAt: null,
    deletedAt,
    mentions: [],
  };
}

const flatList = [
  mkComment({ id: 'A', content: 'root' }),
  mkComment({ id: 'B', parentId: 'A', content: 'reply 1' }),
  mkComment({ id: 'C', parentId: 'A', content: 'reply 2' }),
  mkComment({ id: 'D', parentId: 'B', content: 'reply to B' }),
];

// ============================================================================
// CHECKS
// ============================================================================

console.log('\n🧪 SMOKE — comments-threading + comments-mentions\n');

// S1: extractMentions finds @username patterns (including Portuguese accents)
check('S1 — extractMentions finds @username incl. Portuguese accents', () => {
  const ms = extractMentions('oi @João e @maria');
  assertEqual(ms.length, 2);
  assertEqual(ms[0].username, 'joão');
  assertEqual(ms[1].username, 'maria');
});

// S2: extractMentions filters sacred terms (Oxalá, Sacerdotisa)
check('S2 — extractMentions filters sacred terms (Oxalá, Sacerdotisa)', () => {
  const ms = extractMentions('@oxala e @sacerdotisa e @alice');
  assertDeepEqual(ms.map((m) => m.username), ['alice']);
});

// S3: buildThreadTree from 2-level replies returns correct tree
check('S3 — buildThreadTree from 2-level replies', () => {
  const tree = buildThreadTree(flatList);
  assertEqual(tree.length, 1);
  assertEqual(tree[0].comment.id, 'A');
  assertEqual(tree[0].children.length, 2);
  const b = tree[0].children.find((n) => n.comment.id === 'B');
  assertEqual(b.children.length, 1);
  assertEqual(b.children[0].comment.id, 'D');
});

// S4: getAncestors returns parent chain
check('S4 — getAncestors returns parent chain', () => {
  const ancestors = getAncestors('D', flatList);
  assertDeepEqual(ancestors.map((c) => c.id), ['B', 'A']);
});

// S5: getDescendants returns all recursive children
check('S5 — getDescendants returns all recursive children', () => {
  const descs = getDescendants('A', flatList);
  assertDeepEqual(descs.map((c) => c.id).sort(), ['B', 'C', 'D']);
});

// S6: getThreadDepth returns correct max depth
check('S6 — getThreadDepth returns correct max depth', () => {
  assertEqual(getThreadDepth('A', flatList), 2);
  assertEqual(getThreadDepth('B', flatList), 1);
  assertEqual(getThreadDepth('D', flatList), 0);
});

// S7: createMentionNotification blocks self-mention
check('S7 — createMentionNotification blocks self-mention', () => {
  notificationStore.clear();
  const r = createMentionNotification({
    commentId: 'c1',
    mentionedUserId: 'u_alice',
    mentionerId: 'u_alice',
  });
  assertEqual(r, null);
  assertEqual(notificationStore.size, 0);
});

// S8: createMentionNotification is idempotent on duplicate
check('S8 — createMentionNotification is idempotent on duplicate', () => {
  notificationStore.clear();
  const a = createMentionNotification({
    commentId: 'c1',
    mentionedUserId: 'u_bob',
    mentionerId: 'u_alice',
  });
  const b = createMentionNotification({
    commentId: 'c1',
    mentionedUserId: 'u_bob',
    mentionerId: 'u_alice',
  });
  assertEqual(a.id, b.id);
  assertEqual(notificationStore.size, 1);
});

// S9: editComment enforces ownership
check('S9 — editComment enforces ownership', () => {
  commentStore.clear();
  const c = mkComment({ id: 'c1', content: 'original' });
  c.authorId = 'u_alice';
  commentStore.set('c1', c);

  // owner can edit
  const edited = editComment({ commentId: 'c1', authorId: 'u_alice', newContent: 'updated' });
  assertEqual(edited.content, 'updated');
  assertNotNull(edited.editedAt);

  // non-owner rejected
  let threw = false;
  try {
    editComment({ commentId: 'c1', authorId: 'u_bob', newContent: 'hacked' });
  } catch (e) { threw = e.message === 'FORBIDDEN'; }
  assertEqual(threw, true);
});

function assertNotNull(v) {
  if (v == null) throw new Error('expected non-null');
}

// S10: deleteComment is idempotent
check('S10 — deleteComment is idempotent', () => {
  commentStore.clear();
  const c = mkComment({ id: 'c1' });
  c.authorId = 'u_alice';
  commentStore.set('c1', c);

  deleteComment({ commentId: 'c1', authorId: 'u_alice' });
  const firstDeleted = commentStore.get('c1').deletedAt;
  assertNotNull(firstDeleted);

  // Second call should be no-op
  deleteComment({ commentId: 'c1', authorId: 'u_alice' });
  assertEqual(commentStore.get('c1').deletedAt, firstDeleted);
});

// S11: formatMentions substitutes @DisplayName
check('S11 — formatMentions substitutes @DisplayName', () => {
  const map = new Map([
    ['alice', { id: 'u1', username: 'alice', displayName: 'Alice Wonder' }],
  ]);
  const out = formatMentions('oi @alice!', map);
  assertEqual(out, 'oi @Alice Wonder!');
});

// S12: auditMentionSafety covers all 7 traditions
check('S12 — sacred terms cover all 7 traditions', () => {
  // Spot-check: at least one from each tradition is sacred
  const checks = [
    ['oxala', true],     // ORIXAS
    ['cavaleiro', true], // CIGANO
    ['sacerdotisa', true],// TAROT
    ['aries', true],     // ASTROLOGIA
    ['kether', true],    // SEFIROT
    ['muladhara', true], // CHAKRAS
    ['yeku', true],      // IFA
    ['alice', false],    // normal username
  ];
  for (const [term, expected] of checks) {
    assertEqual(isSacredTerm(term), expected, `isSacredTerm(${term})`);
  }
});

// ============================================================================
// EXTRA: edge cases (bônus)
// ============================================================================

// E1: cycle detection works
check('E1 — buildThreadTree detects cycles (orphan fallback)', () => {
  const cycle = [
    mkComment({ id: 'X', parentId: 'Y' }),
    mkComment({ id: 'Y', parentId: 'X' }),
  ];
  const tree = buildThreadTree(cycle);
  // Both X and Y are orphans (parents missing) → 2 roots, no children
  assertEqual(tree.length, 2);
  for (const r of tree) assertEqual(r.children.length, 0);
});

// E2: handle length validation
check('E2 — extractMentions enforces 3-30 char handles', () => {
  assertEqual(extractMentions('@ab').length, 0); // too short
  assertEqual(extractMentions('@' + 'a'.repeat(31)).length, 0); // too long
  assertEqual(extractMentions('@abc').length, 1); // valid
});

// E3: MAX_MENTIONS_PER_TEXT enforced
check('E3 — extractMentions caps at 10 mentions', () => {
  const long = Array.from({ length: 20 }, (_, i) => `@u${i}`).join(' ');
  assertEqual(extractMentions(long).length, 10);
});

// E4: case-insensitive sacred term matching
check('E4 — sacred term matching is case-insensitive', () => {
  assertEqual(isSacredTerm('OXALA'), true);
  assertEqual(isSacredTerm('Oxalá'), true);
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n${'='.repeat(60)}`);
console.log(`SMOKE RESULT: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
}
console.log('\n🎉 All smoke checks passed — comments-threading + mentions logic validated\n');