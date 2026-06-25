#!/usr/bin/env bash
# scripts/generate-changelog.sh
#
# Auto-gera páginas de changelog por Wave a partir do git log do repositório.
# Faz parse de merge commits prefixados com "Wave N.x" e agrupa os commits
# não-merge de cada merge numa página markdown individual.
#
# Usage:
#   ./scripts/generate-changelog.sh                  # gera a partir de main, escreve em docs/_changelog/
#   ./scripts/generate-changelog.sh --out <dir>      # customiza diretório de saída
#   ./scripts/generate-changelog.sh --remote <url>   # customiza URL do remote (links de commit)
#   ./scripts/generate-changelog.sh --dry-run        # só imprime, não escreve arquivos
#
# Exit codes:
#   0 = success (páginas geradas ou já atualizadas)
#   1 = erro (não é um repositório git, branch sem merges Wave, etc.)
#
# Dependencies: git, awk, sed, sort, mkdir, cat, date
#
# Idempotente: rodar 2x produz o mesmo output (mesmo conteúdo + timestamps
# estáveis por commit SHA).

set -euo pipefail

# --- argument parsing -------------------------------------------------------

OUT_DIR="docs/_changelog"
INDEX_FILE="docs/changelog.md"
REMOTE_URL="$(git remote get-url origin 2>/dev/null || echo '')"
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --out) OUT_DIR="$2"; shift 2 ;;
    --index) INDEX_FILE="$2"; shift 2 ;;
    --remote) REMOTE_URL="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help)
      sed -n '2,17p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 1
      ;;
  esac
done

# --- pre-flight -------------------------------------------------------------

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: not inside a git work tree" >&2
  exit 1
fi

# Normaliza remote URL (drop .git suffix, garante https://)
REMOTE_URL="${REMOTE_URL%.git}"
if [[ -z "$REMOTE_URL" ]]; then
  echo "WARN: no git remote configured; commit links will be empty" >&2
fi

# --- helpers ----------------------------------------------------------------

# Imprime uma linha de commit link: [hash](url)
# Args: $1 = short SHA
commit_link() {
  local sha="$1"
  local short="${sha:0:7}"
  if [[ -n "$REMOTE_URL" ]]; then
    printf '[`%s`](%s/commit/%s)' "$short" "$REMOTE_URL" "$sha"
  else
    printf '`%s`' "$short"
  fi
}

# Imprime merges Wave N.x em ordem cronológica (primeiro-pai),
# retornando linhas "<merge_sha>|<wave_label>|<wave_number>|<subtitle>"
# onde wave_label = "Wave 09", wave_number = 9 (int), subtitle = descrição
list_wave_merges() {
  git log --first-parent --merges --pretty=format:'%H%x1f%s%x1f%ct' "$@" |
    awk -F'\x1f' '
      BEGIN { re = "merge:[[:space:]]*Wave[[:space:]]+[0-9]+\\.[0-9]+" }
      {
        sha=$1; subj=$2;
        # procura "merge: Wave N.M" no subject
        idx = index(subj, "merge:");
        if (idx == 0) idx = index(subj, "Merge:");
        if (idx == 0) next;
        rest = substr(subj, idx);
        # extrai N e M
        if (match(rest, /Wave[[:space:]]+[0-9]+/)) {
          numstr = substr(rest, RSTART, RLENGTH);
          sub("Wave[[:space:]]+", "", numstr);
          split(numstr, parts, ".");
          wn = parts[1] + 0;
          wd = parts[2] + 0;
          # remove prefixo "merge: Wave N.M — "
          outsub = subj;
          sub(/^merge:[[:space:]]*Wave[[:space:]]+[0-9]+\.[0-9]+[[:space:]]*[—-]?[[:space:]]*/, "", outsub);
          sub(/^[Mm]erge:[[:space:]]*Wave[[:space:]]+[0-9]+\.[0-9]+[[:space:]]*[—-]?[[:space:]]*/, "", outsub);
          label = "Wave " wn;
          print sha "|" label "|" wn "|" outsub;
        }
      }' |
    # sort por (wave_number, sha) — assumindo ordem cronológica do git log
    sort -t'|' -k3,3n -k1,1
}

# Imprime os commits não-merge que entraram num merge específico
# Args: $1 = merge SHA
merge_commits() {
  local merge_sha="$1"
  git log --pretty=format:'%H%x1f%h%x1f%s' "${merge_sha}^1..${merge_sha}" --no-merges
}

# Diff stat entre dois SHAs
# Args: $1 = from SHA, $2 = to SHA
diff_stat() {
  git diff --shortstat "$1..$2"
}

# --- main -------------------------------------------------------------------

mkdir -p "$OUT_DIR"

echo "Scanning wave merges from $(git rev-parse --abbrev-ref HEAD)..."
mapfile -t WAVE_MERGES < <(list_wave_merges)

if [[ ${#WAVE_MERGES[@]} -eq 0 ]]; then
  echo "ERROR: no Wave.* merge commits found on first-parent chain" >&2
  exit 1
fi

echo "Found ${#WAVE_MERGES[@]} wave-merge entries."

# Agrupa por wave_number, preservando ordem
declare -A WAVE_FIRST_COMMIT  # wave_num → SHA do primeiro commit não-merge
declare -A WAVE_LAST_MERGE    # wave_num → SHA do último merge
declare -A WAVE_LABELS        # wave_num → label (Wave 09, Wave 10, ...)
declare -A WAVE_DESCRIPTIONS  # wave_num → primeira linha descritiva
declare -A WAVE_FILE

WAVES_TMP="$(mktemp)"
trap 'rm -f "$WAVES_TMP"' EXIT

for entry in "${WAVE_MERGES[@]}"; do
  IFS='|' read -r sha label wn desc <<< "$entry"
  echo "${wn}|${label}|${sha}|${desc}" >> "$WAVES_TMP"
  WAVE_LABELS[$wn]="$label"
  WAVE_LAST_MERGE[$wn]="$sha"
done

# Calcula o "commit raiz" do wave: parent do primeiro merge do wave
declare -A WAVE_FIRST_PARENT

# O parent do merge é WAVE_FIRST_PARENT[wn]; usamos para diff stat agregado.
# Como o git log --first-parent é linear, basta pegar o parent do PRIMEIRO
# merge do wave (ordenado por SHA dentro do mesmo número de wave).
declare -A WAVE_FIRST_MERGE
declare -A WAVE_FIRST_PARENT_FOR_DIFF

while IFS='|' read -r wn label sha desc; do
  if [[ -z "${WAVE_FIRST_MERGE[$wn]:-}" ]]; then
    WAVE_FIRST_MERGE[$wn]="$sha"
    WAVE_FIRST_PARENT_FOR_DIFF[$wn]="${sha}^1"
  fi
done < "$WAVES_TMP"

# Geração das páginas por wave
declare -a WAVE_ORDER
while IFS='|' read -r wn label sha desc; do
  if [[ ! " ${WAVE_ORDER[*]:-} " =~ " $wn " ]]; then
    WAVE_ORDER+=("$wn")
  fi
done < "$WAVES_TMP"

write_page() {
  local wn="$1"
  local label="${WAVE_LABELS[$wn]}"
  local first_merge="${WAVE_FIRST_MERGE[$wn]}"
  local last_merge="${WAVE_LAST_MERGE[$wn]}"
  local first_parent="${WAVE_FIRST_PARENT_FOR_DIFF[$wn]}"
  local slug="$(echo "$label" | tr '[:upper:] ' '[:lower:]-')"
  local outfile="$OUT_DIR/${slug}.md"
  WAVE_FILE[$wn]="$outfile"

  local stat
  stat="$(diff_stat "$first_parent" "$last_merge" 2>/dev/null || echo '  (no diff stats available)')"

  local date_range
  local first_ts last_ts
  first_ts="$(git log -1 --pretty=format:'%ct' "$first_merge")"
  last_ts="$(git log -1 --pretty=format:'%ct' "$last_merge")"
  date_range="$(date -u -d "@$first_ts" '+%Y-%m-%d' 2>/dev/null) → $(date -u -d "@$last_ts" '+%Y-%m-%d' 2>/dev/null)"

  local num_merges
  num_merges=$(grep -c "^${wn}|" "$WAVES_TMP" || echo 0)

  # Render summary
  cat > "$outfile" <<EOF
---
title: ${label} — Changelog
sidebar_label: ${label}
---

# ${label} — Changelog Auto-Gerado

> Página gerada por \`scripts/generate-changelog.sh\` a partir do git log.
> Período: **${date_range}**.
> **${num_merges} merge(s)** Wave ${wn}.x.

## Resumo

EOF

  # Resumo dinâmico: primeira frase da descrição do primeiro merge + lista dos merges
  echo "Wave ${wn} agrupa ${num_merges} entregas:" >> "$outfile"
  echo "" >> "$outfile"

  # Itera merges do wave em ordem cronológica
  while IFS='|' read -r _w _label msha mdesc; do
    [[ "$_w" != "$wn" ]] && continue
    local commit_count
    commit_count="$(git log --pretty=format:'%H' "${msha}^1..${msha}" --no-merges | wc -l | tr -d ' ')"
    echo "- **Wave ${wn}.${_label##*. }** (${commit_count} commits) — ${mdesc}" >> "$outfile"
  done < <(sort -t'|' -k1,1n "$WAVES_TMP")

  cat >> "$outfile" <<EOF

## Estatísticas agregadas

\`\`\`
${stat}
\`\`\`

## Commits por merge

EOF

  while IFS='|' read -r _w _label msha mdesc; do
    [[ "$_w" != "$wn" ]] && continue
    {
      echo "### Wave ${wn} — ${mdesc}"
      echo ""
      echo "_Merge: $(commit_link "$msha")_"
      echo ""
      echo "| SHA | Mensagem |"
      echo "|-----|----------|"
      while IFS=$'\x1f' read -r full short subj; do
        echo "| $(commit_link "$full") | ${subj} |"
      done < <(merge_commits "$msha")
      echo ""
    } >> "$outfile"
  done < <(sort -t'|' -k1,1n "$WAVES_TMP")

  echo "Wrote $outfile"
}

for wn in "${WAVE_ORDER[@]}"; do
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "DRY: would write ${OUT_DIR}/$(echo "${WAVE_LABELS[$wn]}" | tr '[:upper:] ' '[:lower:]-').md"
  else
    write_page "$wn"
  fi
done

# --- index page -------------------------------------------------------------

if [[ "$DRY_RUN" -eq 0 ]]; then
  cat > "$INDEX_FILE" <<EOF
---
title: Changelog — Akasha Portal
sidebar_label: Changelog
---

# Changelog — Akasha Portal

> Changelog auto-gerado por \`scripts/generate-changelog.sh\` a partir do
> git log do repositório. Cada página lista os merges Wave N.x, os commits
> não-merge de cada merge, e diff stats agregados.

## Índice por Wave

EOF

  for wn in "${WAVE_ORDER[@]}"; do
    local_label="${WAVE_LABELS[$wn]}"
    slug="$(echo "$local_label" | tr '[:upper:] ' '[:lower:]-')"
    echo "- [${local_label}](./_changelog/${slug}.md)" >> "$INDEX_FILE"
  done

  cat >> "$INDEX_FILE" <<EOF

## Como regenerar

\`\`\`bash
./scripts/generate-changelog.sh
\`\`\`

O script detecta merges Wave N.x no primeiro-parent chain, agrupa commits
por merge, e escreve páginas determinísticas (mesmo SHA → mesmo output).

Para customizar destino:

\`\`\`bash
./scripts/generate-changelog.sh --out docs/_changelog --index docs/changelog.md
\`\`\`
EOF

  echo "Wrote $INDEX_FILE"
fi

echo "Done. ${#WAVE_ORDER[@]} wave page(s) generated."