#!/usr/bin/env bash
# setup-swarm.sh — prepara o projeto Akasha para rodar o loop em VÁRIOS terminais omp
# Uso (na raiz do projeto): ./setup-swarm.sh 2
#   → cria 2 workers (w1, w2) em worktrees separados + você roda o INTEGRADOR neste diretório
#   3 terminais = ./setup-swarm.sh 2   |   5 terminais = ./setup-swarm.sh 4
set -euo pipefail

WORKERS="${1:-2}"
ROOT="$(git rev-parse --show-toplevel)"
NAME="$(basename "$ROOT")"
cd "$ROOT"

if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "ERRO: há mudanças não commitadas. Faça commit ou stash antes de criar o swarm."
  exit 1
fi

# 1. Estrutura de coordenação (cada agente escreve SÓ na própria pasta)
mkdir -p coordination/integrator
for i in $(seq 1 "$WORKERS"); do
  mkdir -p "coordination/w$i"
  touch "coordination/w$i/STATE.md" \
        "coordination/w$i/changelog-pending.md" \
        "coordination/w$i/requests.md"
  touch "coordination/integrator/feedback-w$i.md"
done

# 2. Mapa de domínios (fonte da verdade sobre quem pode tocar em quê)
if [ ! -f coordination/DOMAINS.md ]; then
cat > coordination/DOMAINS.md << 'EOF'
# DOMAINS.md — Propriedade de domínios do swarm Akasha
# SÓ O INTEGRADOR edita este arquivo. Workers leem e obedecem.
# Regra de ouro: um worker só MODIFICA arquivos do seu domínio + coordination/w{N}/.
# Os globs abaixo são iniciais — o integrador DEVE refiná-los no 1º ciclo
# para refletir a estrutura real do repositório.

## w1 — MOTOR AKASHA (lógica e síntese)
Escopo: motor de cálculo dos 5 mapas, camada de síntese/correlações, base de
conhecimento dos fundamentos, modelos de dados, docs/sintese/.
Globs iniciais: src/lib/** src/core/** src/engine/** src/data/** docs/sintese/**

## w2 — EXPERIÊNCIA MOBILE (UI)
Escopo: páginas, componentes, modais, navegação, estilos, responsividade
mobile-first, apresentação das interpretações na interface.
Globs iniciais: src/components/** src/pages/** src/app/** src/styles/** public/**

## w3 — CONTEÚDO INTERPRETATIVO (ativo a partir de 4 terminais)
Escopo: textos profundos por área da vida (carreira, amor, saúde, sexualidade,
prosperidade...), docs/pesquisa/, dados de interpretação consumidos pelo motor.
Globs iniciais: src/content/** docs/pesquisa/** src/data/interpretacoes/**

## w4 — QUALIDADE (ativo a partir de 5 terminais)
Escopo: testes automatizados, cobertura, performance, acessibilidade,
configuração de lint/CI.
Globs iniciais: tests/** **/*.test.* **/*.spec.* .github/** eslint* vitest* jest*

## INTEGRADOR (terminal no diretório principal, branch main)
Exclusivos dele: VERSION, CHANGELOG.md, STATE.md (global), CHECKPOINT.md,
coordination/DOMAINS.md, coordination/integrator/**, merges em main.
EOF
fi

git add coordination/ >/dev/null
git commit -m "chore(swarm): estrutura de coordenacao para ${WORKERS} workers" >/dev/null || true

# 3. Um worktree git por worker (cópias de trabalho FISICAMENTE separadas —
#    é isso que impede um terminal de sobrescrever o arquivo do outro)
for i in $(seq 1 "$WORKERS"); do
  BR="loop/w$i"
  DIR="../${NAME}-w$i"
  git branch "$BR" 2>/dev/null || true
  if [ ! -d "$DIR" ]; then
    git worktree add "$DIR" "$BR"
  fi
  echo "✓ worker w$i → diretório $DIR (branch $BR)"
done

echo
echo "Swarm pronto. Como rodar:"
echo "  Terminal INTEGRADOR:  cd $ROOT && omp        → /loop (999999999) @LOOP-INTEGRATOR.md"
for i in $(seq 1 "$WORKERS"); do
  echo "  Terminal worker w$i:   cd ../${NAME}-w$i && omp → /loop (999999999) @LOOP-WORKER.md"
done
echo
echo "Dica: inicie o integrador ~2 min depois dos workers."
