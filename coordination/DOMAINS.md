# DOMAINS.md — Propriedade de domínios do swarm Akasha
# SÓ O INTEGRADOR edita este arquivo. Workers leem e obedecem.
# Regra de ouro: um worker só MODIFICA arquivos do seu domínio + coordination/w{N}/.
# Os globs abaixo são iniciais — o integrador DEVE refiná-los no 1º ciclo
# para refletir a estrutura real do repositório.

## w1 — MOTOR AKASHA (lógica e síntese)
Escopo: motor de cálculo dos 5 mapas, camada de síntese/correlações, base de
conhecimento dos fundamentos, modelos de dados, docs/sintese/.
Globs iniciais: packages/akasha-core/** src/lib/** src/engine/** src/data/** docs/sintese/** apps/akasha-portal/src/app/api/**

## w2 — EXPERIÊNCIA MOBILE (UI)
Escopo: páginas, componentes, modais, navegação, estilos, responsividade
mobile-first, apresentação das interpretações na interface.
Globs iniciais: apps/akasha-portal/src/components/** apps/akasha-portal/src/app/**
！但 apps/akasha-portal/src/app/api/** public/**

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
