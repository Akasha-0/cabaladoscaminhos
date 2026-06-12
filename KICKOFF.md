# PROMPT DE KICKOFF — Loop Autônomo Akasha
# Uso: cole no omp interativo, ou rode: omp @KICKOFF.md
# (a partir da 2ª execução, use apenas o run-loop.sh / omp -c)

Você vai trabalhar de forma 100% autônoma e contínua, por horas, evoluindo o projeto Akasha conforme a constituição em AGENTS.md (já no seu contexto). Não me faça perguntas em nenhum momento — não use a tool `ask`. Decisões ambíguas: decida, registre em docs/DECISIONS.md e siga.

## FASE 0 — Bootstrap (apenas se ainda não existir)
1. Leia AGENTS.md, STATE.md e CHANGELOG.md se existirem. Se STATE.md não existir, crie-o agora junto com CHANGELOG.md, VERSION (inicie em v0.0.1) e docs/DECISIONS.md.
2. Faça um inventário completo do código atual: estrutura, páginas, componentes, fluxos, onde estão as interpretações dos 5 mapas. Registre o diagnóstico em STATE.md.

## FASE 1 — Pesquisa e engenharia reversa (use subagentes `explore` em paralelo, com web_search/fetch/browser)
Lance subagentes para investigar e produza relatórios em docs/pesquisa/:
1. **Síntese de sistemas modernos**: como Human Design e Gene Keys fizeram engenharia reversa/síntese de múltiplas tradições em UM sistema com linguagem própria (estrutura conceitual, vocabulário unificado, modelo de entrega da informação). Identifique outros sistemas sintéticos modernos relevantes. → docs/pesquisa/sintese-sistemas.md
2. **Benchmark de mercado mobile**: pesquise na Play Store (e App Store) os apps em alta de numerologia cabalística, numerologia tântrica, dia de nascimento e astrologia. Inclua obrigatoriamente o Astrolink e os principais apps de numerologia Android. Para os mais bem avaliados: funcionalidades, experiência do usuário, como apresentam interpretações (especialmente os aspectos completos de vida do Astrolink), e o que os usuários dizem nos comentários — pontos positivos, pontos negativos, o que pedem e o que falta. → docs/pesquisa/benchmark-apps.md
3. **Profundidade interpretativa**: como os melhores produtos transformam um dado abstrato ("número 11") em compreensão prática da vida do usuário (carreira, amor, saúde, sexualidade, prosperidade). → docs/pesquisa/profundidade-interpretativa.md

## FASE 2 — Cadeia de raciocínio da síntese Akasha
Com base na pesquisa e nos fundamentos dos 5 mapas já existentes no projeto:
1. Valide os fundamentos de cada mapa (corrija erros na base de conhecimento se houver).
2. Construa em docs/sintese/ a cadeia de pensamento explícita: correlações entre os 5 mapas, vocabulário universal do Akasha, modelo conceitual unificado (o "motor" que traduz os 5 em 1).
3. Defina a arquitetura do motor Akasha: entrada (dados do usuário) → camadas das tradições (internas, invisíveis) → camada de síntese → camada de linguagem prática por área da vida.

## FASE 3 — Loop de implementação contínuo (repita indefinidamente)
A cada ciclo, use todo_write para criar as fases e execute:
1. **Selecionar**: leia STATE.md e escolha o item de MAIOR impacto para o usuário (profundidade de interpretação e unificação vêm antes de features novas).
2. **Planejar**: plano curto e concreto, respeitando "fazer mais com menos" (melhorar o existente, modais > páginas novas, arquitetura limpa, mobile-first).
3. **Implementar**: código completo e funcional.
4. **Testar e validar**: build + lint + testes + verificação manual do fluxo alterado (renderização mobile primeiro). Se algo quebrar, conserte antes de seguir.
5. **Versionar**: se a evolução for significativa, bump de versão (VERSION + CHANGELOG.md + commit) seguindo o protocolo do AGENTS.md.
6. **Persistir memória**: atualize STATE.md (feito / em andamento / próximos 3 passos) e docs/DECISIONS.md se decidiu algo sozinho.
7. Volte ao passo 1 imediatamente. Não pare, não pergunte, não espere confirmação.

## Prioridades permanentes do loop (ordem)
1. Unificação: eliminar a fragmentação em 5 mapas na UI — o usuário vê só o Akasha.
2. Profundidade prática das interpretações em todas as áreas da vida (Maslow completo, incl. carreira, dons, amor, sexualidade, saúde, prosperidade).
3. Experiência mobile-first (evoluindo para instalável iOS/Android).
4. Aperfeiçoar UI/recursos existentes; reduzir páginas, aumentar valor por página.
5. Qualidade: arquitetura limpa, testes, cada entrega funcional.

Comece agora pela FASE 0.
