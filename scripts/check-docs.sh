#!/usr/bin/env bash
# ============================================================================
# check-docs.sh — Validação de saúde da documentação
# ============================================================================
# Procura por:
#   1. TODOs / FIXMEs / XXXs em arquivos .md
#   2. Links quebrados (docs/X.md referenciado mas não existente)
#   3. Docs não-atualizados há mais de N dias (default 30)
#   4. Frontmatter inconsistente (faltando 'Última atualização')
#
# Uso:
#   bash scripts/check-docs.sh              # check completo
#   bash scripts/check-docs.sh --todos      # só TODOs
#   bash scripts/check-docs.sh --links      # só links quebrados
#   bash scripts/check-docs.sh --stale 60   # docs com > 60 dias
#   bash scripts/check-docs.sh --strict     # exit 1 se qualquer warning
#
# Exit codes:
#   0 = tudo OK (ou warnings em modo não-strict)
#   1 = encontrou problemas (em modo --strict)
#   2 = erro de uso
# ============================================================================

set -uo pipefail

# ─── Configuração ────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCS_DIR="$PROJECT_ROOT/docs"

STALE_DAYS="${STALE_DAYS:-30}"
STRICT=0
CHECK_TODOS=1
CHECK_LINKS=1
CHECK_STALE=1
CHECK_FRONT=1

# ─── Argumentos ──────────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --todos)        CHECK_TODOS=1; CHECK_LINKS=0; CHECK_STALE=0; CHECK_FRONT=0; shift ;;
    --links)        CHECK_TODOS=0; CHECK_LINKS=1; CHECK_STALE=0; CHECK_FRONT=0; shift ;;
    --stale)        CHECK_TODOS=0; CHECK_LINKS=0; CHECK_STALE=1; CHECK_FRONT=0; shift
                    if [[ "${2:-}" =~ ^[0-9]+$ ]]; then STALE_DAYS="$2"; shift; fi ;;
    --frontmatter)  CHECK_TODOS=0; CHECK_LINKS=0; CHECK_STALE=0; CHECK_FRONT=1; shift ;;
    --strict)       STRICT=1; shift ;;
    -h|--help)      grep -E "^# .*check-docs" "$0" | head -20; sed -n '2,30p' "$0"; exit 0 ;;
    *)              echo "Argumento desconhecido: $1"; exit 2 ;;
  esac
done

# ─── Output helpers ───────────────────────────────────────────────────────────

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()    { echo -e "${BLUE}ℹ${NC}  $*"; }
ok()      { echo -e "${GREEN}✅${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
error()   { echo -e "${RED}❌${NC} $*"; }

# ─── Coletar lista de docs ────────────────────────────────────────────────────

if [[ ! -d "$DOCS_DIR" ]]; then
  error "Diretório docs/ não encontrado: $DOCS_DIR"
  exit 2
fi

mapfile -t DOC_FILES < <(find "$DOCS_DIR" -type f -name "*.md" ! -path "*/archive/*" ! -path "*/node_modules/*" | sort)
TOTAL_DOCS=${#DOC_FILES[@]}

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  📚 check-docs.sh — Validação de saúde da documentação"
echo "════════════════════════════════════════════════════════════════"
echo "  Diretório: $DOCS_DIR"
echo "  Total docs: $TOTAL_DOCS"
echo "  Stale threshold: ${STALE_DAYS} dias"
echo "════════════════════════════════════════════════════════════════"
echo ""

PROBLEMS=0

# ─── 1. Procurar TODOs em docs ────────────────────────────────────────────────

if [[ $CHECK_TODOS -eq 1 ]]; then
  echo ""
  echo "─── 1. TODOs / FIXMEs em docs ────────────────────────────────"

  TODO_PATTERNS='TODO|FIXME|XXX|HACK|REVER|REVISE|WIP'

  TODO_COUNT=0
  for doc in "${DOC_FILES[@]}"; do
    # Ignorar exemplos em code blocks
    matches=$(grep -nE "$TODO_PATTERNS" "$doc" 2>/dev/null \
              | grep -vE '^\s*[0-9]+:\s*```' \
              | grep -vE '^\s*[0-9]+:\s*<code' \
              | head -10 || true)

    if [[ -n "$matches" ]]; then
      rel_path=${doc#$PROJECT_ROOT/}
      TODO_COUNT=$((TODO_COUNT + 1))
      warn "$rel_path tem TODOs pendentes:"
      echo "$matches" | sed 's/^/      /'
      echo ""
    fi
  done

  if [[ $TODO_COUNT -eq 0 ]]; then
    ok "Nenhum TODO/FIXME encontrado em $TOTAL_DOCS docs"
  else
    warn "$TODO_COUNT docs com TODOs pendentes (considere resolver ou mover para issue)"
    PROBLEMS=$((PROBLEMS + TODO_COUNT))
  fi
fi

# ─── 2. Links quebrados ───────────────────────────────────────────────────────

if [[ $CHECK_LINKS -eq 1 ]]; then
  echo ""
  echo "─── 2. Links quebrados (docs/X.md referenciado mas não existente) ─"

  BROKEN_COUNT=0

  for doc in "${DOC_FILES[@]}"; do
    doc_dir=$(dirname "$doc")
    rel_doc=${doc#$PROJECT_ROOT/}

    # Procurar por padrões comuns de link para docs:
    # - [text](path/to/doc.md)
    # - [path/X.md] (sem markdown link, bare reference)
    matches=$(grep -nE '\]\(([^)]+\.md)\)|\b[A-Za-z0-9_./-]*[A-Z][A-Za-z0-9_-]*\.md\b' "$doc" 2>/dev/null \
              | grep -oE '[A-Za-z0-9_./-]+\.md' \
              | sort -u || true)

    while IFS= read -r link; do
      [[ -z "$link" ]] && continue

      # Pular URLs externas
      if [[ "$link" =~ ^https?:// ]]; then continue; fi

      # Se é absoluto do projeto (/workspace/.../docs/X.md)
      if [[ "$link" == /* ]]; then
        if [[ -f "$link" ]]; then continue; fi
        BROKEN_COUNT=$((BROKEN_COUNT + 1))
        warn "  $rel_doc → '$link' (não encontrado)"
        continue
      fi

      # Resolver relativo ao doc atual (readlink -f lida com ./ e ../)
      resolved=$(cd "$doc_dir" && readlink -f "$link" 2>/dev/null || echo "")
      if [[ -n "$resolved" && -f "$resolved" ]]; then continue; fi

      # Tentar também como relativo ao project root
      if [[ -f "$PROJECT_ROOT/$link" ]]; then continue; fi

      # Provavelmente quebrado
      BROKEN_COUNT=$((BROKEN_COUNT + 1))
      warn "  $rel_doc → '$link' (não encontrado)"
    done <<< "$matches"
  done

  if [[ $BROKEN_COUNT -eq 0 ]]; then
    ok "Nenhum link quebrado encontrado"
  else
    warn "$BROKEN_COUNT link(s) possivelmente quebrado(s)"
    PROBLEMS=$((PROBLEMS + BROKEN_COUNT))
  fi
fi

# ─── 3. Docs não-atualizados há mais de N dias ───────────────────────────────

if [[ $CHECK_STALE -eq 1 ]]; then
  echo ""
  echo "─── 3. Docs não-atualizados há mais de $STALE_DAYS dias ───────────"

  STALE_COUNT=0
  STALE_LIST=()
  NOW_EPOCH=$(date +%s)

  for doc in "${DOC_FILES[@]}"; do
    # Última modificação do arquivo
    file_mtime=$(stat -c %Y "$doc" 2>/dev/null || stat -f %m "$doc" 2>/dev/null || echo 0)
    age_seconds=$((NOW_EPOCH - file_mtime))
    age_days=$((age_seconds / 86400))

    # Tentar extrair "Última atualização" do frontmatter
    declared_date=$(grep -oE '(Última atualiza[çc][ãa]o|Updated|Atualizado)[^0-9]*([0-9]{4}-[0-9]{2}-[0-9]{2})' "$doc" 2>/dev/null \
                    | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | tail -1 || true)

    if [[ -n "$declared_date" ]]; then
      declared_epoch=$(date -d "$declared_date" +%s 2>/dev/null || echo 0)
      if [[ $declared_epoch -gt 0 ]]; then
        declared_age=$(( (NOW_EPOCH - declared_epoch) / 86400 ))
        if [[ $declared_age -gt $STALE_DAYS ]]; then
          rel_path=${doc#$PROJECT_ROOT/}
          STALE_COUNT=$((STALE_COUNT + 1))
          STALE_LIST+=("$rel_path: declarado $declared_age dias atrás ($declared_date)")
          continue
        fi
      fi
    fi

    # Fallback: usar mtime do arquivo
    if [[ $age_days -gt $STALE_DAYS ]]; then
      rel_path=${doc#$PROJECT_ROOT/}
      STALE_COUNT=$((STALE_COUNT + 1))
      STALE_LIST+=("$rel_path: arquivo não modificado há $age_days dias")
    fi
  done

  if [[ $STALE_COUNT -eq 0 ]]; then
    ok "Todos os docs foram atualizados nos últimos $STALE_DAYS dias"
  else
    warn "$STALE_COUNT doc(s) potencialmente desatualizado(s):"
    for entry in "${STALE_LIST[@]}"; do
      echo "      • $entry"
    done
    echo ""
    info "Ação recomendada: revisar e adicionar nota de 'Última atualização' se ainda relevante"
    PROBLEMS=$((PROBLEMS + STALE_COUNT))
  fi
fi

# ─── 4. Frontmatter inconsistente ────────────────────────────────────────────

if [[ $CHECK_FRONT -eq 1 ]]; then
  echo ""
  echo "─── 4. Frontmatter inconsistente ─────────────────────────────"

  FRONT_MISSING=0

  for doc in "${DOC_FILES[@]}"; do
    basename=$(basename "$doc")
    case "$basename" in
      API-REFERENCE.md|00_README.md|TROUBLESHOOTING.md)
        # Devem ter versão + data de atualização
        if ! grep -qE '(\*\*Versão:\*\*|\*\*Version:\*\*)' "$doc"; then
          rel_path=${doc#$PROJECT_ROOT/}
          warn "  $rel_path: sem campo 'Versão' no frontmatter"
          FRONT_MISSING=$((FRONT_MISSING + 1))
        fi
        if ! grep -qE '(Última atualiza|Atualizado|Updated)' "$doc"; then
          rel_path=${doc#$PROJECT_ROOT/}
          warn "  $rel_path: sem campo 'Última atualização' no frontmatter"
          FRONT_MISSING=$((FRONT_MISSING + 1))
        fi
        ;;
      runbooks/*.md)
        # Runbooks devem ter "Quando usar" no topo
        if ! grep -qE '(\*\*Quando usar:\*\*|\*\*When to use:\*\*)' "$doc"; then
          rel_path=${doc#$PROJECT_ROOT/}
          warn "  $rel_path: runbook sem seção 'Quando usar' no topo"
          FRONT_MISSING=$((FRONT_MISSING + 1))
        fi
        ;;
    esac
  done

  if [[ $FRONT_MISSING -eq 0 ]]; then
    ok "Frontmatter consistente em docs críticos"
  else
    warn "$FRONT_MISSING problema(s) de frontmatter"
    PROBLEMS=$((PROBLEMS + FRONT_MISSING))
  fi
fi

# ─── Sumário final ────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════"
if [[ $PROBLEMS -eq 0 ]]; then
  ok "Documentação está saudável! 🎉"
  echo "════════════════════════════════════════════════════════════════"
  exit 0
else
  warn "$PROBLEMS problema(s) encontrado(s) (não-bloqueante)"
  echo "════════════════════════════════════════════════════════════════"
  if [[ $STRICT -eq 1 ]]; then
    error "Modo --strict ativo: exit 1"
    exit 1
  fi
  exit 0
fi