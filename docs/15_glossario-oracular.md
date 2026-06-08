# Documento 15 — Glossário Oracular Canônico
## Sistema Akasha

> **Norte:** Doc 25 (Visão Akasha). Conteúdo matemático/esotérico preservado e agnóstico; reenquadrado para o produto B2C Akasha.
>
> **Tipo:** Base de conteúdo curada (anti-alucinação) — semente do Grimório Digital
> **Versão:** 2.2 | **Data:** 2026-06-07
> **i18n EN:** Frontmatter `title_en` adicionado a todos os 78 arquivos do Grimório (51 ervas, 16 Odus, 11 Corpos Tântricos, 4 Diagnósticos). Cobertura validada pelo teste-guardião `tests/lib/i18n/grimoire-completeness.test.ts`. Corpo completo em EN será traduzido em ciclo futuro (Doc 25 §9 Fase 2 — parcialmente completo).
> **D4 ✅ (2026-06-07) — Seção 1 dos Odus validada.** Proveniência registrada em cada `grimoire/ancestral/odu-*.md` (Doc 20 AD-20.3) e no ledger `IDEIA.md` §5.1. Lineage padrão: Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu.
> **Papel no Akasha:** estes significados-base são a **semente da biblioteca de Diagnóstico do Grimório** (Doc 25 §5). São **injetados no contexto como verdade** (busca híbrida → System Prompt da Voz do Akasha),
> em vez de confiar na memória do LLM. A IA interpreta o cruzamento dos 4 Pilares; ela **não inventa**
> o significado base.

---

## 0. Como este glossário é usado

- Cada entrada-base alimenta um arquivo `.md` do Grimório (frontmatter YAML + corpo); o pipeline `grimoire:sync` gera os embeddings (Doc 25 §5).
- O `PromptBuilder` / a busca híbrida injetam o `baseMeaning`/`essence` do Odu (e demais correspondências) no contexto do diagnóstico do dia.
- O Agente Oracular Interativo (Doc 12) usa as mesmas verdades-base.
- **`✅ D4 (2026-06-07)`** — Odus (Seção 1) validados quanto à proveniência. Frontmatter `metadata.source`/`metadata.lineage` preenchidos em todos os 16 `grimoire/ancestral/odu-*.md`; ledger em `IDEIA.md` §5.1. Conteúdo oracular segue como base curada (Doc 20) para o `PromptBuilder`.
- **Seção 2 (Cartas Ciganas / Mesa Real): LEGADO.** Mantida apenas como referência histórica do produto B2B; não faz parte do Akasha (Doc 25 AD-25.2). Não é ingerida no Grimório do Akasha.

---

## 1. Os 16 Odus (Merindilogun) — Pilar de Nascimento · semente do Grimório

> Os Odus de Nascimento são um dos **4 Pilares** do Akasha (Doc 25 §1) — a Bússola Ancestral / alinhamento do *Ori*. Esta tabela é a **semente da biblioteca de Diagnóstico do Grimório** (Doc 25 §5).

**`✅ D4 (2026-06-07)`** — Conteúdo curado. Proveniência registrada em `grimoire/ancestral/odu-*.md` (frontmatter `metadata.source`/`metadata.lineage`) e no ledger `IDEIA.md` §5.1. Lineage padrão: **Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu**. Derivado do Doc 11 §5. Cada Odu: **essência** + **quizila/preceito** (o que evitar) + **conselho-base** (a direção que a Voz do Akasha oferece).

| # | Odu | Essência | Quizila / Preceito | Conselho-base |
|---|---|---|---|---|
| 1 | Okran/Ogbe | Luz, origem, criação, renovação | Não pular etapas; não desprezar o começo. | Recomece com fé; a luz já apontou o caminho. |
| 2 | Ejiokô | Dualidade, movimento, parcerias | Evitar decisões sozinho; não duplicar conflitos. | Busque o par certo; a força está na união. |
| 3 | Etaogundá | Batalha, conquista, abertura de caminhos | Não recuar na luta justa; evitar violência fútil. | Avance com coragem; abra o caminho à força. |
| 4 | Irosun | Atenção, sangue, cuidado com traições | Cuidado com o que se come e com falsos amigos. | Atenção redobrada; proteja o que é seu. |
| 5 | Oxê | Beleza, amor, fertilidade, magnetismo | Não usar o charme para enganar; evitar vaidade. | Ame e crie; sua doçura atrai a bênção. |
| 6 | Obará | Riqueza, glória, abundância, fartura | Não desperdiçar; evitar ganância e ostentação. | A fartura chega; administre com sabedoria. |
| 7 | Odi | Segredos, transformação, cautela, limpeza | Guardar segredos; evitar lugares e companhias densas. | Limpe-se e transforme; o oculto se resolve. |
| 8 | Ejionile | Justiça, liderança, força, vitória | Não ser injusto; evitar arrogância no poder. | Lidere com retidão; a justiça é seu trono. |
| 9 | Ossá | Proteção feminina, sabedoria, turbulência | Cuidado com tempestades emocionais; evitar fofoca. | Acolha a proteção; a sabedoria acalma o vento. |
| 10 | Ofun | Espiritualidade profunda, equilíbrio mental | Não negligenciar o espírito; evitar excesso mental. | Aquiete a mente; o equilíbrio é seu remédio. |
| 11 | Owarin | Dinâmica, perigo, astúcia, movimento rápido | Cuidado com a pressa e o risco; evitar atalhos. | Mova-se com astúcia, mas não corra cego. |
| 12 | Ejilaxebora | Honra, proteção, caminho aberto | Honrar a palavra; evitar deslealdade. | O caminho está aberto; siga com honra. |
| 13 | Ejiologbon/Oturupon | Cura, purificação, ancestralidade | Cuidar da saúde e dos ancestrais; evitar negligência. | Cure as raízes; a ancestralidade te sustenta. |
| 14 | Iká/Oturá | Paz, benevolência, proteção divina | Não romper a paz; evitar conflito desnecessário. | Mantenha a paz; a proteção divina te cobre. |
| 15 | Obeogundá | Poder, estratégia, responsabilidade | Não abusar do poder; evitar irresponsabilidade. | Use o poder com estratégia e responsabilidade. |
| 16 | Alafia/Ofurufu | Completude, totalidade, bênção universal | Não desperdiçar a graça; manter humildade. | A bênção é plena; agradeça e partilhe. |

> Estrutura sugerida para `src/lib/constants/odus.ts`: adicionar `quizila`, `precept` e `baseAdvice` a cada Odu.

---

## 2. As 36 Cartas Ciganas (Lenormand) — LEGADO (Mesa Real)

> **⚠️ LEGADO B2B — fora do Sistema Akasha (Doc 25 AD-25.2).** Esta tabela pertencia à **Mesa Real de 36 casas** do Baralho Cigano/Lenormand do Cockpit Oracular. O produto Akasha **não usa o Baralho Cigano**: o cruzamento é entre os **4 Pilares** (Astrologia, Numerologia Cabalística, Numerologia Tântrica, Odus de Nascimento). A seção é preservada **apenas como referência histórica** e para o `apps/legacy-cockpit` rodar durante a migração; **não é ingerida no Grimório do Akasha**.

Cada entrada: **keywords** (do Doc 04 §5.1) + **significado-base** (frase-verdade injetável) + **sombra** (face desafiadora, dosada como cuidado, não sentença).

| # | Carta | Keywords | Significado-base | Sombra |
|---|---|---|---|---|
| 1 | O Cavaleiro | Notícias, movimento, mensagens, velocidade | Algo se aproxima; o primeiro impulso e a notícia que chega. | Precipitação, mensagem que não vem. |
| 2 | O Trevo | Sorte, pequenas oportunidades, esperança | Pequena sorte passageira; janela breve a aproveitar. | Otimismo ingênuo, sorte que escapa. |
| 3 | O Navio | Viagem, negócios, distância | Jornada, comércio e horizontes que se ampliam. | Distância, saudade, demora. |
| 4 | A Casa | Lar, família, estabilidade | A base, o lar e a estrutura que protege. | Apego, estagnação doméstica. |
| 5 | A Árvore | Saúde, raízes, crescimento, ancestralidade | A vitalidade e as raízes que sustentam a vida. | Cansaço, raiz adoecida. |
| 6 | As Nuvens | Confusão, dúvidas, nebulosidade | Véu sobre a mente; o que ainda não está claro. | Engano, indecisão prolongada. |
| 7 | A Serpente | Perigo, traição, sexualidade, sabedoria oculta | A força oculta: desejo, perigo e sabedoria que morde. | Traição, sedução destrutiva. |
| 8 | O Caixão | Fim, transformação, encerramento | O fim necessário que abre espaço ao novo. | Perda, luto, resistência ao fim. |
| 9 | Os Buquês | Presentes, surpresas felizes, beleza | A bênção, o reconhecimento e a alegria que chega. | Superficialidade, presente vazio. |
| 10 | A Foice | Corte, decisão, colheita, separação | O corte certeiro: decisão e colheita do que se plantou. | Ruptura abrupta, corte precipitado. |
| 11 | O Chicote | Conflito, repetição, estresse | O atrito que se repete até ser compreendido. | Discórdia, padrão destrutivo. |
| 12 | Os Pássaros | Comunicação, parceria, nervosismo | A troca, a conversa e o par que dialoga. | Fofoca, ansiedade, ruído. |
| 13 | A Criança | Novo começo, inocência, projeto inicial | O recomeço puro e o projeto em sua semente. | Imaturidade, vulnerabilidade. |
| 14 | A Raposa | Astúcia, estratégia, autossuficiência | A inteligência que protege e estratégia que vence. | Engano, desconfiança, malícia. |
| 15 | O Urso | Poder, autoridade, finanças, força | O poder pessoal, a autoridade e o sustento forte. | Dominação, controle, peso. |
| 16 | A Estrela | Esperança, espiritualidade, guia | A luz que guia, a fé e o sonho de alma. | Ilusão, expectativa irreal. |
| 17 | A Cegonha | Mudança, renovação, gestação | A mudança benéfica e o que está nascendo. | Mudança temida, inquietação. |
| 18 | O Cachorro | Lealdade, amizade, confiança | O aliado fiel e o vínculo de confiança. | Dependência, falsa lealdade. |
| 19 | A Torre | Isolamento, autoridade, ego, solidão | A reclusão consciente e a estrutura que se ergue só. | Orgulho, isolamento doentio. |
| 20 | O Jardim | Vida social, público, eventos | O encontro, o público e a exposição social. | Dispersão, máscara social. |
| 21 | A Montanha | Obstáculo, bloqueio, desafio | O grande obstáculo e o inimigo que atrasa. | Bloqueio crônico, muro interno. |
| 22 | Os Caminhos | Escolha, bifurcação, decisão | A encruzilhada: a escolha que define o rumo. | Dúvida paralisante, fuga da decisão. |
| 23 | O Rato | Perda, desgaste, ansiedade | O desgaste lento que rói sem ser visto. | Roubo de energia, escassez, medo. |
| 24 | O Coração | Amor, sentimentos, emoções, desejo | O amor, o afeto e o desejo do coração. | Carência, paixão cega. |
| 25 | O Anel | Comprometimento, contrato, aliança | O pacto, o vínculo e o ciclo que se sela. | Prisão, contrato que aperta. |
| 26 | O Livro | Segredo, conhecimento, mistério | O saber guardado e o segredo a revelar. | Ocultação, ignorância imposta. |
| 27 | A Carta | Documento, notícia escrita, comunicação formal | A mensagem oficial e o documento que chega. | Notícia adiada, burocracia. |
| 28 | O Cigano | Figura masculina, ação, protagonismo | O homem, a energia ativa/yang que age. | Imposição, agressividade. |
| 29 | A Cigana | Figura feminina, intuição, receptividade | A mulher, a energia receptiva/yin que intui. | Manipulação, passividade. |
| 30 | Os Lírios | Paz, maturidade, pureza, sabedoria | A paz madura e a sexualidade serena. | Frieza, moralismo, distância. |
| 31 | O Sol | Sucesso máximo, clareza, vitalidade | A vitória plena, a clareza e o ápice. | Ego inflado, ofuscamento. |
| 32 | A Lua | Intuição, reconhecimento, honrarias | O reconhecimento, o psiquismo e a emoção profunda. | Ilusão emocional, oscilação. |
| 33 | A Chave | Solução, abertura, resposta | A solução que se abre e a porta destrancada. | Resposta que tarda, falsa chave. |
| 34 | Os Peixes | Dinheiro, abundância, negócios | O fluxo financeiro e a abundância material. | Ganância, descontrole, perda. |
| 35 | A Âncora | Estabilidade, trabalho fixo, segurança | A permanência, o trabalho firme e a segurança. | Estagnação, peso que prende. |
| 36 | A Cruz | Fardo, karma, destino, teste espiritual | O fardo kármico e o teste que redime. | Martírio, culpa, sentença. |

> Estrutura sugerida para `src/lib/constants/lenormand-cards.ts` (legado, `apps/legacy-cockpit`): campos `baseMeaning` e `shadow` por entrada (além de `keywords`).

---

## 3. Princípio Anti-Alucinação

1. **Verdade injetada > memória do modelo:** o significado-base vem deste documento (e, em produção, do Grimório que ele semeia); a Voz do Akasha só interpreta o cruzamento dos 4 Pilares (Terreno/Evento/Direção).
2. **Nada de correspondência fora da base:** se a IA precisar citar significado, ela usa o `essence`/`baseMeaning` daqui ou o arquivo `.md` retornado pela busca híbrida — nunca a memória do modelo.
3. **Sombra com proteção:** ao acessar a "quizila" de um Odu (ou a "sombra" no legado), a Voz do Akasha entrega como **cuidado e direção**, nunca como sentença — o tom protetor e anti-fatalista do Akasha (Doc 26 §2/§7).
4. **Versionamento:** qualquer alteração aqui é uma mudança de conteúdo oracular e deve ser commitada com justificativa. Seção 1 (Odus) atualiza quando D4 for validado; Seção 2 (Cartas) é legado congelado da Mesa Real.
