# 0002 — Pilares 6 e 7: Human Design + Gene Keys (revisado)

**Status:** accepted (2026-06-23, vision realignment session + research approval)

**Research basis:** `/home/skynet/cabala-dos-caminhos/.hermes/plans/research-licensing-human-design-gene-keys-2026-06-23.md` (10 sections + 3 anexos).

## Guardrails Obrigatorios (do Research 2, §6)

A estrategia "traducao universalista" e juridicamente solida **somente** se estes 4 guardrails forem respeitados:

### Guardrail 1 — Renomear todos os termos

Nenhum termo proprietario do Human Design ou Gene Keys pode aparecer no codigo, UI, API, schema, ou documentacao visivel ao usuario final.

**Tabela de renomeacao sugerida:**

| Original (proprietario) | Traducao universalista | Justificativa |
|---|---|---|
| Type: Generator | **Tipo: Iniciador** (ou "Perfil de Energia Continua") | Captura funcao sem copiar marca |
| Type: Projector | **Tipo: Projetor** (ou "Perfil de Guia") | Idem |
| Type: Manifestor | **Tipo: Manifestador** | Idem |
| Type: Reflector | **Tipo: Refletor** | Idem |
| Authority: Emotional | (manter — termo generico, sem trademark) | Nao-protegivel |
| Authority: Sacral | **Autoridade: Sacral** (tradicional, sem trademark) | Idem |
| Authority: Splenic | **Autoridade: Esplenica** | Idem |
| Authority: Ego/Heart | **Autoridade: Cardiaca** | Idem |
| Authority: G-Center | **Autoridade: Centro de Identidade** | Idem |
| Authority: Lunar | **Autoridade: Lunar** | Idem |
| Strategy: To Respond | **Estrategia: Esperar Convite** | Descricao funcional |
| Strategy: To Inform | **Estrategia: Informar** | Idem |
| Strategy: To Initiate | **Estrategia: Iniciar** | Idem |
| Strategy: To Wait | **Estrategia: Esperar (lua de 29 dias)** | Idem |
| Centers: 9 | **Centros: 9** (mantem contagem generica) | Numerologia comum |
| Channels | **Canais** (manter — geometria generica) | Nao-protegivel |
| Gates | **Portas** (manter — termo comum em varias tradicoes) | Nao-protegivel |
| Shadow → Gift → Siddhi (Gene Keys) | **Sombra → Dom → Siddhi** (PT-BR direto) | Traducao, nao copia |
| Venus Sequence (Gene Keys) | **Sequencia Venusiana** (traducao literal generica) | Astronomia comum |
| Golden Pathway (Gene Keys) | **Caminho Dourado** (traducao generica) | Alquimia comum |
| Incarnation Cross | **Cruz de Incarnacao** (traducao literal) | Termo astronomico generico |

**Nota:** Nomes finais serao decididos via design proposal separado, em consulta com a tradicao universalista brasileira (Cumino/Saraceni/Camargo).

### Guardrail 2 — Escrever textos do zero

- As 64 chaves (Gene Keys), os textos de cada Tipo/Estrategia/Autoridade (Human Design) devem ser **escritos do zero**, nao copiados nem traduzidos de fontes proprietarias.
- Inspiracao em principios esotericos universais (I Ching, Astrologia ocidental, Cabala) e permitida.
- Citacao explicita de fonte original obrigatoria quando usar referencias publicas (ex: Richard Rudd, Ra Uru Hu) — mesmo que o termo final seja renomeado.

### Guardrail 3 — Visualizacao propria

- O BodyGraph (visualizacao do Human Design) **nao pode** ser clonado em formato, layout, ou interacao.
- A visualizacao do Pilar 6 deve ser **original**, idealmente **integrada com a Mandala SVG existente** (reusa infraestrutura visual ja estabelecida).
- Cor, layout, interacao: tudo proprio. Inspiracao em principios de visualizacao (centros energeticos) e permitida.

### Guardrail 4 — Disclaimer legal no app

No rodape da pagina de onboarding e em `/conta/legal`:

> "Este sistema integra **principios esotericos universais** (Cabala, Astrologia, Tantra, I Ching, sistemas energeticos correlatos). Inspiracoes conceituais incluem tradicoes como Human Design e Gene Keys, **reinterpretadas de forma original e nao-comercial**. Nao somos afiliados, endossados ou licenciados pelos detentores dessas marcas. Conteudo gerado e para fins educativos e de autoconhecimento."

### Validacao juridica pre-lancamento

**P0 obrigatorio antes do lancamento publico:** Parecer formal de advogado brasileiro de PI (~R$ 2-5k). Buscar:
- Marcas registradas no INPI (Instituto Nacional da Propriedade Industrial)
- Marcas registradas no USPTO (United States Patent and Trademark Office)
- Jurisprudencia brasileira sobre sistemas esotéricos

## Nomenclatura Alternativa Universalista (proposta para Wave 2)

Em vez de chamar "Pilar 6: Human Design" e "Pilar 7: Gene Keys" publicamente, considerar nomes universalistas:

- **Pilar 6**: "**Mapa Energetico Integrado**" ou "**Sistema de Tipos e Estrategias**"
- **Pilar 7**: "**Espectro Sombra-Dom-Siddhi**" ou "**64 Portas de Transformacao**"

**Decisao final** via design proposal D-YYY/D-ZZZ na Wave 2.

## Codigo Morto: Acao Obrigatoria

Quando Pilar 6 e 7 forem implementados (Wave 4), **deletar** qualquer codigo que referencie termos originais do Human Design/Gene Keys (auditar com `grep -r` antes do merge).

## Context

O Akasha Portal tem historicamente 5 Pilares canonicos (Cabala, Astrologia, Tantra, Odu, I Ching). Em 2026-06-22, durante brainstorm com Gemini, foi proposta a adicao de um "Pilar 6: Grounding & Left" focado em Exu/Pomba Gira/firmezas — essa proposta foi **rejeitada** por decisao canonica (commit `c52e7547 revert(schema)!: Pilar 6 Prisma`).

Em 2026-06-23, apos realignment da visao do produto (Akasha deixou de ser SaaS pra usuario final e virou ferramenta do Zelador), tu revelou que:

1. **Os 7 Pilares sao necessarios**: tu mencionou explicitamente Human Design + Gene Keys como camadas adicionais que precisam ser integradas na pratica clinica.
2. **A razao de ser**: o Zelador atende consulentes e precisa correlacionar todos os mapas. Human Design e Gene Keys sao sistemas modernos de sintese (Human Design combina I Ching + Astrologia + Cabala + Orixas; Gene Keys expande Human Design com espectro sombra-dom-siddhi) que dao cobertura adicional.
3. **Limitacao importante**: Human Design e Gene Keys sao sistemas **comerciais com copyright ativo** (Ra Uru Hu fundou Human Design; Richard Rudd criou Gene Keys). Copiar literalmente o sistema expõe o projeto a questoes legais.

## Decision

**Adicionar Pilares 6 e 7 ao canon, mas como "traducoes universalistas"**, nao copias literais:

- **Pilar 6 — Human Design (traduzido)**: mapa energetico integrado (Tipo, Estrategia, Autoridade, Centros, Canais, Portas). Implementacao inspirada nos principios do Human Design (combinar I Ching + Astrologia + Cabala + sistema de centros energeticos), **sem copiar terminologia proprietaria** (ex: "Tipo Gerador" pode virar "Tipo Iniciador" ou "Perfil de Energia Continua"; "Autoridade Emocional" pode virar "Autoridade Sentiente"). A nomenclatura final sera decidida via design proposal separado.
- **Pilar 7 — Gene Keys (traduzido)**: espectro sombra → dom → siddhi aplicado aos mesmos dominios (vida, amor, prosperidade, etc). Inspirado na estrutura do Gene Keys, mas sem usar nomes proprios como "The Wizard", "The Lover", etc. Nomenclatura via design proposal.

**Traducao universalista**: o objetivo e capturar a **funcao pratica** (correlacionar mapas, gerar correlacoes sombra-dom-siddhi-style) sem copiar a **forma proprietaria** (nomes, termos, estrutura do grafo do Human Design/Gene Keys). Isso evita questoes legais e ancora o sistema na visao universalista (Cumino/Saraceni/Camargo).

## Consequences

**Positivo:**
- 7 Pilares cobrem todos os sistemas que o Zelador precisa correlacionar na pratica clinica.
- Traducao universalista alinha com a visao do produto (espiritualidade visceral, nao-dogmatica).
- Preserva autonomia do projeto (sem dependencia de sistemas comerciais externos).
- Mantem a voz do Mentor (Akashico unificado, nao Cigano Ramiro).

**Negativo:**
- Decisao **reverte** a rejeicao anterior do Pilar 6 (commit `c52e7547`). Workaround: o Pilar 6 da Gemini era "Grounding & Left" (esquerda/firmezas de terreiro); este Pilar 6 novo e "Human Design traduzido" — **sao coisas diferentes**. A reversao e parcial, nao total.
- A implementacao depende de ADRs adicionais:
  - **ADR 0005** (Knowledge Graph) — define a estrutura de correlacao entre os 7 Pilares.
  - **Design proposal** especifico para mapeamento Human Design → Pilar 6 (nomenclatura, regras, limites).

## Alternatives Considered

- **Nao adicionar Human Design/Gene Keys**: rejeitada — o Zelador precisa deles pra pratica clinica completa.
- **Copiar literalmente os sistemas**: rejeitada — copyright ativo + quebra a visao universalista.
- **Manter so os 5 Pilares originais**: rejeitada — gap real na pratica do Zelador.
- **Adicionar como "modulos externos" (integracao via API)**: rejeitada — aumenta dependencia externa e custo.

## Open Follow-ups

- **Design proposal** para Pilar 6 (Human Design traduzido): nomenclatura, regras de mapeamento, limites. Wave 2.
- **Design proposal** para Pilar 7 (Gene Keys traduzido): mesma estrutura. Wave 2.
- **ADR 0005** (Knowledge Graph): pre-requisito para correlacao automatica entre os 7 Pilares.
- **Pesquisa de licensing**: confirmar via subagente researcher se a abordagem "traducao universalista" e segura juridicamente. Wave 1 (paralelo a esta documentacao).

## Reversibility

**Hard to reverse** (3 de 3 condicoes):
1. Mudar depois custaria refazer implementacao dos Pilares 6/7 e ajustar todos os call sites.
2. Sem contexto, futuro leitor nao entenderia por que Pilar 6 foi adicionado (referencia ao realignment).
3. Trade-off real entre "cobrir todos os sistemas uteis" e "manter canon enxuto" — escolheu cobrir.

**Pode ser revertido** com ADR reverso + migration de cleanup (similar a `c52e7547`).
