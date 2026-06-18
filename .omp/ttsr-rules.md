# TTSR Rules — AKASHA / cabala-dos-caminhos
# Per AKASHA_HARNESS_CONSTITUTION.md §6
# Format: one-shot per session, trigger via regex, injects guardrail message.

# ── Rule 1: Anti-invention ──────────────────────────────────────────────────
TRIGGER: (?:esotéric|correspondência esotérica|inventei|inventar correspondência|invented correspondence|made-up mapping|random association|eu acho que|feeling that|直觉地映射|我没有依据)
INJECT:   ⚠️ TTSR ANTI-INVENTION — Você está inventando correspondências sem base canônica.
          Use SOMENTE a whitelist canônica derivada da pesquisa real (research/).
          Não substitua pesquisa por intuição não verificada.
ONESHOT:  true

# ── Rule 2: Migration-stop ──────────────────────────────────────────────────
TRIGGER: (?:prisma migrate|prisma db push|prisma db execute|prisma studio|schema\.prisma.*edit|editar schema|executar migrate)
INJECT:   ⚠️ TTSR MIGRATION-STOP — Migration detectada.
          Pare. Produza um PROPOSAL primeiro: descreva a mudança de schema,
          justifique, e aguarde aprovação humana explícita.
          NÃO rode `prisma migrate` sem aprovação.
ONESHOT:  true

# ── Rule 3: Discover-don't-invent ──────────────────────────────────────────
TRIGGER: (?:aplicando trabalho prescrito|implementando spec|spec diz|segundo a spec|according to spec|applying prescribed work)
INJECT:   ⚠️ TTSR DISCOVER-DON'T-INVENT — Antes de aplicar, leia o arquivo real.
          `grep`/`cat` o alvo antes; specs envelhecem e podem não refletir o código atual.
ONESHOT:  true

# ── Rule 4: Anti-bloat ─────────────────────────────────────────────────────
TRIGGER: (?:v2|new|final|backup|old|copy)-?(?:file|module|component|util|hook|rule|service|schema|prisma|db)
INJECT:   ⚠️ TTSR ANTI-BLOAT — Você está criando uma cópia paralela.
          Edite o arquivo canônico existente. Não versione cópias (-v2, -new, -final, -old).
          Arquivos paralelos fragmentam a base de código.
ONESHOT:  true
