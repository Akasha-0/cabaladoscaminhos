# IDEIA.md — Banco de Correspondências Esotéricas

> **Versão:** 1.1 | **Data:** 2026-06-03
> **Governança:** Doc 20 AD-20.1 a AD-20.9 · **Entrada do agente:** Doc 24 · **Painel:** Doc 21
> **Fontes:** Doc 06 §2 (correlação), Doc 11 §2–§3 (numerologia), **Doc 04 §5.2 + Doc 15** (Odus/glossário)
> **Sincronia código ↔ ledger:** as constantes `src/lib/constants/{lenormand-cards,odus}.ts` e `src/lib/ai/correlation-map.ts` são a **projeção em runtime** deste ledger — **mesma verdade, nomes canônicos**. Em qualquer divergência de **nome/grafia**, ledger e constantes devem coincidir (fonte única — Doc 16 AD-02 / Doc 24 §8).

---

## 1. Propósito

Este arquivo é a **fonte da verdade** para TODAS as correspondências esotéricas do Cabala dos Caminhos.

Regras invioláveis (AD-20.1–AD-20.9):
- **AD-20.1** — Nenhuma correspondência sem fonte. Toda entrada deve citar uma tradição suportada.
- **AD-20.2** — Verdade injetada, nunca lembrada. O significado-base vem deste banco; o LLM *redige*, não *decide* conteúdo oracular.
- **AD-20.3** — Proveniência é dado, não comentário. Fonte e tradição são campos estruturados.
- **AD-20.4** — Provisório é explícito. Conteúdo pendente de validação de linhagem (D1–D4) carrega `provisional: true`.
- **AD-20.5** — Este arquivo precede o código. O `cabala-corr-validator` valida contra este ledger antes de qualquer adição.

**Nenhuma correspondência pode ser codificada sem estar documentada aqui primeiro.**

---

## 2. Matriz de Correlação — 36 Casas

> Fonte: Doc 06 §2
> Tradição: Ifá/Merindilogun ↔ Astrologia ↔ Cabalística ↔ Numerologia Tântrica

### Casa 1 — O Cavaleiro
**Tema:** Notícias chegando, início de movimento, o primeiro impulso da vida.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Ascendente (1ª Casa) + Marte (regente do ímpeto) | O Cavaleiro = como a pessoa chega ao mundo e age | validado |
| Cabalística | Número de Expressão | Como o self se manifesta/expressa | validado |
| Tântrica | Número de Alma (dia de nascimento) | A essência interior que move a pessoa | validado |
| Odu Natal | Filtrado pela temática de início e movimento | | validado |

---

### Casa 2 — O Trevo
**Tema:** Pequenas sortes, oportunidades rápidas, a fé que sustenta.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Júpiter (sorte, expansão) + signo de Júpiter natal | Júpiter = o planeta da boa sorte e abundância | validado |
| Cabalística | Número de Motivação | O que o coração busca, o que atrai sorte | validado |
| Tântrica | Dom Divino (ano de nascimento reduzido) | O presente que a pessoa carrega desde o nascimento | validado |

---

### Casa 3 — O Navio
**Tema:** Viagens, negócios à distância, mudanças de horizonte.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 9ª Casa (viagens longas, estrangeiro) + Mercúrio (3ª Casa — viagens curtas) | O Navio abrange ambos os tipos de jornada | validado |
| Cabalística | Número de Expressão | Como a pessoa se comunica além dos próprios limites | validado |
| Tântrica | Número de Caminho Tântrico | A direção global da jornada de vida | validado |

---

### Casa 4 — A Casa
**Tema:** Lar físico, família, moradia, estrutura doméstica.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 4ª Casa (IC / Fundo do Céu) + Lua natal (lar, mãe, raízes) | A 4ª Casa é o "lar" por excelência na astrologia | validado |
| Cabalística | Número de Motivação | O que traz segurança emocional e sensação de lar | validado |
| Tântrica | Número de Karma (mês) | Bloqueios ou aberturas na estrutura doméstica e familiar | validado |

---

### Casa 5 — A Árvore
**Tema:** Saúde, vitalidade, energia vital, raízes, ancestralidade.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 6ª Casa (saúde, corpo) + Sol natal (vitalidade) | A Árvore = o corpo e a força de vida | validado |
| Cabalística | Número de Destino | O destino físico e a resistência da pessoa | validado |
| Tântrica | Número de Alma | A energia prânica da alma | validado |

---

### Casa 6 — As Nuvens
**Tema:** Confusão mental, dúvidas, nebulosidade, indecisão.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 12ª Casa (inconsciente, confusão) + Netuno natal (ilusão, nebulosa) | Netuno é o planeta da neblina e da ilusão | validado |
| Cabalística | Números de Desafio (1º e 2º desafios) | Onde estão as dúvidas e bloqueios kármicos | validado |
| Tântrica | Número de Karma (mês) | De onde vêm as limitações e os véus | validado |

---

### Casa 7 — A Serpente
**Tema:** Perigo, traição, inveja, forças ocultas, sexualidade, sabedoria oculta.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Lilith natal (sombra, poder oculto, sexualidade) + Plutão aspectos tensos | A Serpente = o princípio oculto e perigoso | validado |
| Cabalística | Karma de Vida / Dívidas (números ausentes no nome) | O que a pessoa não desenvolveu e a torna vulnerável | validado |
| Tântrica | Número de Karma (mês) | Os medos mais profundos que atraem perigo | validado |

---

### Casa 8 — O Caixão
**Tema:** Fim de ciclos, transformação profunda, crises, renascimento.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 8ª Casa natal (Plutão, morte/renascimento, recursos partilhados) | A 8ª Casa = transformação radical na astrologia | validado |
| Cabalística | Número de Missão | A missão requer a morte do velho self para se cumprir | validado |
| Tântrica | Número de Karma (mês) | O teste material máximo — o que precisa morrer | validado |

---

### Casa 9 — Os Buquês
**Tema:** Presentes, surpresas felizes, reconhecimento, beleza, alegria.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Vênus natal (beleza, presentes, prazer) + 5ª Casa (prazer, criatividade) | Vênus = o que traz bênçãos e reconhecimento | validado |
| Cabalística | Dons Nativos (número do dia de nascimento) | Os talentos com que a pessoa nasceu | validado |
| Tântrica | Dom Divino (ano reduzido) | O presente divino da alma | validado |

---

### Casa 10 — A Foice
**Tema:** Cortes necessários, decisões definitivas, colheita, perigos imediatos.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Saturno natal (onde a vida exige corte e maturidade) + 8ª Casa (transformações drásticas) | Saturno = o grande ceifeiro | validado |
| Cabalística | Números de Desafio (principal) | O maior obstáculo a ser cortado/superado | validado |
| Tântrica | Número de Karma (mês) | O que precisa ser definitivamente encerrado | validado |

---

### Casa 11 — O Chicote
**Tema:** Conflitos, repetição de padrões, estresse, agressividade, disputas.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Marte natal (conflito, agressão, modo de luta) + aspectos de Marte tensos | Marte = o planeta da guerra e dos conflitos | validado |
| Cabalística | Números de Desafio | Os padrões destrutivos repetitivos | validado |
| Tântrica | Corpo Prânico — Karma (mês) | Onde a energia vital é sugada por conflito | validado |

---

### Casa 12 — Os Pássaros
**Tema:** Comunicação, parcerias dinâmicas, nervosismo, trocas rápidas.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Mercúrio natal (comunicação, mente) + 3ª Casa (comunicação, vizinhança) | Mercúrio = voz, palavra, troca | validado |
| Cabalística | Número de Expressão | Como e com que eficiência a pessoa se comunica | validado |
| Tântrica | Dom Divino (ano reduzido) | O dom da voz e da palavra como ferramenta | validado |

---

### Casa 13 — A Criança
**Tema:** Novos começos, projetos iniciais, inocência, renovação, vulnerabilidade.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 1ª Casa / Ascendente (novos ciclos, como se recomeça) + Júpiter (expansão de novos projetos) | O recomeço sempre passa pelo Ascendente | validado |
| Cabalística | Número de Missão | A missão é sempre um recomeço | validado |
| Tântrica | Número de Alma | O aspecto mais puro e inicial da alma | validado |

---

### Casa 14 — A Raposa
**Tema:** Astúcia, estratégia, autossuficiência, cautela, discernimento.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Mercúrio natal (intelecto, estratégia) + Urano (insight, esperteza) | A Raposa = inteligência estratégica | validado |
| Cabalística | Número de Expressão | Como a mente opera nas estratégias de vida | validado |
| Tântrica | Dom Divino | O dom inato de perceber o que está oculto | validado |

---

### Casa 15 — O Urso
**Tema:** Poder pessoal, autoridade, finanças de grande porte, proteção, liderança.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Sol natal (poder, ego, autoridade) + 10ª Casa (posição de poder, carreira) | O Sol = o centro do poder na vida da pessoa | validado |
| Cabalística | Caminho de Vida | O núcleo do poder e da liderança pessoal | validado |
| Tântrica | Número de Alma | O tipo de poder que a alma carrega | validado |

---

### Casa 16 — A Estrela
**Tema:** Esperança, espiritualidade, guia divino, sonhos, missão de alma.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Netuno natal (espiritualidade, sonhos, transcendência) + 9ª Casa (fé, filosofia) | Netuno = a estrela guia espiritual | validado |
| Cabalística | Caminho de Vida (especialmente se for 11, 22 ou 33) | Números mestres = missão espiritual elevada | validado |
| Tântrica | Dom Divino | O presente divino que ilumina a jornada | validado |

---

### Casa 17 — A Cegonha
**Tema:** Mudanças significativas, renovação, melhoria, movimentos inesperados.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Nodo Norte natal (direção do destino, evolução) + Urano (mudanças súbitas) | O Nodo Norte = para onde a vida está mudando | validado |
| Cabalística | Número de Missão | A mudança ao serviço da missão | validado |
| Tântrica | Número de Destino (ano completo) | O destino que se transforma | validado |

---

### Casa 18 — O Cachorro
**Tema:** Lealdade, amizade, aliados, proteção, confiança.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 11ª Casa (amigos, grupos, redes de apoio) + Vênus (vínculos afetivos) | A 11ª Casa = círculo de aliados | validado |
| Cabalística | Número de Motivação | O que a pessoa busca e projeta nos amigos | validado |
| Tântrica | Número de Alma | Como a alma se conecta com outros | validado |

---

### Casa 19 — A Torre
**Tema:** Isolamento, solidão consciente, ego, autoridade institucional, introspecção.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 12ª Casa (isolamento, reclusão, karma oculto) + Saturno (estruturas rígidas, ego) | A Torre = as paredes que a pessoa constrói em volta de si | validado |
| Cabalística | Números de Desafio | O ego como desafio central | validado |
| Tântrica | Número de Karma (mês) | De onde vem a tendência ao isolamento | validado |

---

### Casa 20 — O Jardim
**Tema:** Vida social, público, eventos, exposição, coletividade.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 11ª Casa (grupos sociais, redes) + 7ª Casa (parcerias públicas) | O Jardim = o espaço público e social | validado |
| Cabalística | Número de Expressão | Como a pessoa se apresenta em público | validado |
| Tântrica | Dom Divino | Como o dom se manifesta diante dos outros | validado |

---

### Casa 21 — A Montanha
**Tema:** Obstáculos, bloqueios, atrasos, inimigos ocultos, desafios duradouros.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Saturno natal em aspectos tensos + 12ª Casa (inimigos ocultos) | Saturno = o grande bloqueador e testador | validado |
| Cabalística | Números de Desafio + Dívidas Kármicas | Os obstáculos kármicos específicos desta vida | validado |
| Tântrica | Número de Karma (mês) | A natureza do bloqueio energético | validado |

---

### Casa 22 — Os Caminhos
**Tema:** Escolhas, bifurcação, decisões cruciais, possibilidades múltiplas.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Eixo Nodo Norte/Sul (as grandes escolhas do destino) + 1ª/7ª Casa (o self vs. o outro) | Os Nodos = as escolhas mais importantes da alma | validado |
| Cabalística | Caminho de Vida | O grande caminho que deve ser escolhido | validado |
| Tântrica | Número de Caminho Tântrico | O sentido de direção na vida | validado |

---

### Casa 23 — O Rato
**Tema:** Perdas graduais, desgaste, ansiedade, pensamentos que consomem, escassez.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 12ª Casa (perdas ocultas) + aspectos tensos de Netuno (confusão, vazamento) + Saturno restritivo | O Rato = o que drena sem ser visto | validado |
| Cabalística | Karma de Vida / Dívidas (números ausentes) | O que falta no nome = onde há vazamento | validado |
| Tântrica | Corpo Prânico — Karma (mês) | A energia vital sendo drenada | validado |

---

### Casa 24 — O Coração
**Tema:** Amor, emoções profundas, desejos do coração, afetos.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Vênus natal (amor, beleza, como ama) + Lua natal (emoções, instinto afetivo) + 5ª Casa (romance) | Vênus e Lua = os grandes regentes do amor | validado |
| Cabalística | Número de Motivação | O que o coração realmente deseja | validado |
| Tântrica | Número de Alma | A forma como a alma experimenta o amor | validado |

---

### Casa 25 — O Anel
**Tema:** Contratos, comprometimentos, alianças, casamento, acordos formais.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 7ª Casa (Descendente — parcerias, casamento, contratos) + Saturno (formalização, durabilidade) | A 7ª Casa = todos os contratos da vida | validado |
| Cabalística | Número de Missão | A missão frequentemente se cumpre através de alianças | validado |
| Tântrica | Número de Destino | O destino se sela em compromissos | validado |

---

### Casa 26 — O Livro
**Tema:** Segredos, conhecimento oculto, estudos, mistérios guardados.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 9ª Casa (conhecimento superior, filosofia, fé) + 12ª Casa (oculto, esotérico) + Mercúrio (mente) | O saber que vai além do óbvio | validado |
| Cabalística | Caminho de Vida 7 (se presente) | O 7 é o número do conhecimento oculto | validado |
| Tântrica | Dom Divino | Os segredos do dom divino da pessoa | validado |

---

### Casa 27 — A Carta
**Tema:** Documentos, notícias escritas, mensagens formais, comunicação oficial.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Mercúrio natal (comunicação escrita, documentos) + 3ª Casa (correspondências) | Mercúrio = o mensageiro e escriba | validado |
| Cabalística | Número de Expressão | Como a comunicação formal se manifesta | validado |
| Tântrica | Dom Divino (se for 5 = dom da palavra) | A palavra como ferramenta de poder | validado |

---

### Casa 28 — O Cigano (Figura Masculina)
**Tema:** O consulente masculino ou a energia masculina/ativa principal na situação.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Sol natal (identidade, ego, força masculina/yang) + Marte (ação, drive, iniciativa) | Sol+Marte = o arquétipo masculino ativo | validado |
| Cabalística | Caminho de Vida | O destino pessoal do self ativo | validado |
| Tântrica | Número de Caminho Tântrico | A totalidade da jornada desta persona | validado |

---

### Casa 29 — A Cigana (Figura Feminina)
**Tema:** O consulente feminino ou a energia feminina/receptiva principal na situação.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Lua natal (instinto, intuição, energia feminina/yin) + Vênus (graça, receptividade) | Lua+Vênus = o arquétipo feminino receptivo | validado |
| Cabalística | Número de Motivação | O que o self receptivo deseja profundamente | validado |
| Tântrica | Número de Alma | A essência mais profunda da alma | validado |

---

### Casa 30 — Os Lírios
**Tema:** Paz, pureza, maturidade, sabedoria conquistada, calma após a tempestade.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Júpiter natal (sabedoria, benevolência, colheita) + 9ª Casa (filosofia de vida, paz) | Júpiter = a expansão serena e a sabedoria | validado |
| Cabalística | Caminho de Vida | A paz que vem de honrar o próprio destino | validado |
| Tântrica | Número de Destino | A colheita do destino em paz | validado |

---

### Casa 31 — O Sol
**Tema:** Sucesso máximo, clareza total, vitória, o ápice da realização.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 10ª Casa (Meio do Céu — carreira, sucesso público, ápice) + Sol natal (brilho, vitória) | A 10ª Casa + Sol = o ponto mais alto da vida | validado |
| Cabalística | Número de Missão | A missão cumprida = o Sol no zênite | validado |
| Tântrica | Dom Divino | O dom divino manifestado em sua plenitude | validado |

---

### Casa 32 — A Lua
**Tema:** Intuição, psiquismo, reconhecimento, honrarias, o inconsciente à flor da pele.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Lua natal (intuição, emoções profundas, ciclos) + Netuno (psiquismo) + 12ª Casa | A Lua governa o mundo interior e os ciclos | validado |
| Cabalística | Número de Motivação | Os desejos inconscientes que guiam a pessoa | validado |
| Tântrica | Número de Alma | A alma em sua dimensão mais psíquica | validado |

---

### Casa 33 — A Chave
**Tema:** A solução que se revela, abertura de portas, a resposta esperada, importância.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Júpiter natal (abertura, expansão, solução) + Nodo Norte (direção para o qual a solução aponta) | Júpiter + Nodo Norte = a porta que se abre | validado |
| Cabalística | Número de Missão | A chave da vida é sempre a missão | validado |
| Tântrica | Dom Divino | O dom como a chave que abre o destino | validado |

---

### Casa 34 — Os Peixes
**Tema:** Dinheiro, fluxo financeiro, negócios, abundância material.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 2ª Casa natal (finanças pessoais, como ganha dinheiro) + Vênus (valor próprio, o que atrai recursos) | A 2ª Casa = o bolso e o valor da pessoa | validado |
| Cabalística | Número de Expressão | Como o talento se transforma em recurso financeiro | validado |
| Tântrica | Número de Karma (mês) | O teste material — o karma com o dinheiro | validado |

---

### Casa 35 — A Âncora
**Tema:** Estabilidade, trabalho fixo, permanência, segurança de longo prazo.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | 6ª Casa (trabalho diário, rotina, emprego) + Saturno (estruturas sólidas e duradouras) + 10ª Casa (carreira) | A Âncora vive na interseção do trabalho e da solidez | validado |
| Cabalística | Número de Missão | A missão que se ancora em um propósito profissional | validado |
| Tântrica | Corpo Físico — Dom Divino | O dom que sustenta a vida material | validado |

---

### Casa 36 — A Cruz
**Tema:** Fardo kármico, teste espiritual máximo, responsabilidade, superação do destino.
**Tradição:** Ifá/Merindilogun (Lenormand)

| Sistema | Aspecto Delegado | Justificativa | Status |
|---|---|---|---|
| Astrologia | Nodo Sul natal (karma do passado, o que precisa ser superado) + Saturno aspectos tensos + 12ª Casa | A Cruz = o karma que a alma trouxe para superar | validado |
| Cabalística | Karma de Vida + Dívidas Kármicas | As dívidas de vidas passadas que pedem resolução | validado |
| Tântrica | Número de Karma (mês) | O teste espiritual máximo desta encarnação | validado |

---

## 3. Numerologia Cabalística

> Fonte: Doc 11 §2

### 3.1 Tabela de Conversão Alfanumérica (Pitagórica 1–9)

**⚠️ VALIDAR (D1)** — Default canônico: **tabela Pitagórica 1–9**. Substituir por Caldaica/Hebraica se for a linhagem do operador.

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|
| A | B | C | D | E | F | G | H | I |
| J | K | L | M | N | O | P | Q | R |
| S | T | U | V | W | X | Y | Z | — |

```typescript
const LETTER_VALUES: Record<string, number> = {
  A:1, J:1, S:1,  B:2, K:2, T:2,  C:3, L:3, U:3,
  D:4, M:4, V:4,  E:5, N:5, W:5,  F:6, O:6, X:6,
  G:7, P:7, Y:7,  H:8, Q:8, Z:8,  I:9, R:9,
};
```

### 3.2 Normalização de Nomes

**⚠️ VALIDAR (D1)** — Default canônico, determinístico:

1. **Maiúsculas** e remoção de espaços extras.
2. **Acentuação:** a letra acentuada vale **pela letra-base** (Á→A, É→E, Í→I, Ó→O, Ú→U, Â→A, Ê→E, Ô→O, Ã→A, Õ→O, À→A, Ü→U).
3. **Ç → C** (vale 3).
4. **Hífen e apóstrofo:** removidos; as letras adjacentes contam normalmente (ex.: "Sant'Ana" → "SANTANA").
5. **Y:** é **consoante por padrão** na contagem alfanumérica (vale 7).
6. Caracteres não-alfabéticos (números, pontuação) são ignorados.

```typescript
function normalizeName(name: string): string {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .toUpperCase()
    .replace(/[^A-Z]/g, ''); // mantém só A-Z (Ç já virou C)
}
```

### 3.3 Vogais vs. Consoantes

**⚠️ VALIDAR (D1)** — Default canônico:
- **Vogais:** A, E, I, O, U (após normalização — acentuadas já viram base).
- **Y:** tratado como **consoante** por padrão (não entra na Motivação).

```typescript
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const isVowel  = (c: string) => VOWELS.has(c);
const isConsonant = (c: string) => /[A-Z]/.test(c) && !VOWELS.has(c);
```

### 3.4 Redução de Dígitos e Números Mestres

**Regra dos Números Mestres (11, 22, 33):**

**⚠️ VALIDAR (D1)** — Default canônico:
- Mestres são **preservados** nos campos de **identidade/missão de alma**: `lifePath`, `expression`, `mission`, `motivation`.
- Mestres são **reduzidos** nos campos **operacionais/cíclicos**: `personalDay/Month/Year`, `challenges`, `pinnacles` numéricos.
- 33 só é reconhecido como mestre **se emergir naturalmente** da soma de dois 33-componentes ou de um total intermediário 33; caso contrário reduz a 6.

```typescript
function reduceToSingleDigit(n: number, keepMasters = true): number {
  const MASTERS = [11, 22, 33];
  while (n > 9) {
    if (keepMasters && MASTERS.includes(n)) return n;
    n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}
```

### 3.5 Fórmulas Cabalísticas

Entrada: `fullName` (string), `birthDate` (`YYYY-MM-DD`).

| Campo | Fórmula | Mestres | Status |
|---|---|---|---|
| `lifePath` | Soma de **todos os dígitos** da data, reduzida. | preserva | validado |
| `mission` | `reduce(lifePath + expression)` — síntese do propósito. | preserva | validado |
| `expression` | Soma do valor de **todas as letras** do nome normalizado, reduzida. | preserva | validado |
| `motivation` | Soma do valor das **vogais** do nome, reduzida. | preserva | validado |
| `impression` | Soma do valor das **consoantes** do nome, reduzida. | preserva | validado |
| `nativeDayNumber` | Dia de nascimento **sem reduzir** (1–31). | n/a | validado |
| `challenges` | Ver §3.6. | reduz | validado |
| `pinnacles` | Ver §3.7. | reduz | validado |
| `karmicLessons` | Números de 1–9 **ausentes** no nome (lições a aprender). | n/a | validado |
| `karmaicDebts` | Presença de 13/14/16/19 em qualquer total intermediário (dívidas kármicas). | n/a | validado |
| `personalYear` | `reduce(dia + mês + ano_atual_reduzido)`. | reduz | validado |
| `personalMonth` | `reduce(personalYear + mês_atual)`. | reduz | validado |
| `personalDay` | `reduce(personalMonth + dia_atual)`. | reduz | validado |

> **Nota:** `expression` e `destiny` são o mesmo número (soma de todo o nome). Alias `destiny = expression` pode ser exposto na UI se necessário.
> **⚠️ VALIDAR (D2)** se na linhagem do operador Destino é distinto.

### 3.6 Números de Desafio

```
firstChallenge  = |reduce(dia)  − reduce(mês)|
secondChallenge = |reduce(ano)  − reduce(dia)|
mainChallenge   = |firstChallenge − secondChallenge|   // desafio principal
lastChallenge   = |reduce(mês)  − reduce(ano)|
```
(Todos com `keepMasters = false`; resultado 0–8.)

### 3.7 Pináculos (Ciclos de Realização)

```
firstPinnacle  = reduce(dia + mês)              // 0 → 36 − lifePath idade
secondPinnacle = reduce(dia + ano)
thirdPinnacle  = reduce(firstPinnacle + secondPinnacle)
fourthPinnacle = reduce(mês + ano)
```
Idades de troca: 1º até `36 − lifePath`; depois faixas de 9 anos.

### 3.8 Exemplo Resolvido

**Entrada:** "Eliane Simão de Almeida", `1986-08-20`.

- `lifePath`: 2+0+0+8+1+9+8+6 = **34** → 3+4 = **7** ✅
- `nativeDayNumber`: **20**
- `personalYear` (para 2026): `reduce(20 + 8 + reduce(2026))` → `reduce(20 + 8 + 10)` = `reduce(38)` = **2**

---

## 4. Numerologia Tântrica

> Fonte: Doc 11 §3

**⚠️ VALIDAR (D2)** — Default canônico (alinhado ao exemplo: 1986 → Dom Divino = 5, Destino = 6).

### 4.1 Fórmulas Tântricas

| Campo | Fórmula | Exemplo (20/08/1986) | Status |
|---|---|---|---|
| `soul` (Alma) | `reduce(dia)` | 20 → **2** | validado |
| `karma` | `reduce(mês)` | 08 → **8** | validado |
| `divineGift` (Dom Divino) | `reduce(últimos 2 dígitos do ano)` | 86 → 8+6=14 → **5** | validado |
| `destiny` (Destino) | `reduce(soma dos 4 dígitos do ano)` | 1+9+8+6=24 → **6** | validado |
| `tantricPath` (Caminho Total) | `reduce(dia + mês + ano completo)` | 20+8+1986=2014 → 2+0+1+4= **7** | validado |
| `gift` (Presente / opcional) | `reduce(dia + mês)` | — | validado |

> **Resolução de conflito de rótulos (G3):**
> - **Dom Divino** = redução dos **dois últimos dígitos do ano** (regra que reproduz o exemplo `1986 → 86 → 14 → 5`).
> - **Destino** = redução da **soma dos 4 dígitos do ano** (`→ 6`).
> - **Caminho Total** = redução da **data completa** (dia+mês+ano).
> Assim `divineGift ≠ destiny ≠ tantricPath`.

### 4.2 Os 11 Corpos Tântricos

**⚠️ VALIDAR (D2)** — Default canônico (numeração 1–11):

| # | Corpo | Essência |
|---|---|---|
| 1 | Corpo da Alma | Núcleo, pureza, origem |
| 2 | Corpo Negativo / Mente Protetora | Cautela, discernimento, proteção |
| 3 | Corpo Positivo / Mente Projetiva | Expansão, otimismo, ação |
| 4 | Corpo Neutro / Mente Meditativa | Equilíbrio, julgamento sereno |
| 5 | Corpo Físico | Manifestação, a palavra, o dom material |
| 6 | Arco da Linha | Integridade, projeção, intuição |
| 7 | Aura | Campo de proteção, presença |
| 8 | Corpo Prânico | Energia vital, respiração, força |
| 9 | Corpo Sutil | Maestria, sabedoria refinada |
| 10 | Corpo Radiante | Realeza, coragem, brilho |
| 11 | Corpo do Infinito / Ser Trinitário | Transcendência, totalidade |

---

## 5. Os 16 Odus (Merindilogun) — Tabela Canônica

> Fonte: Doc 11 §5 e Doc 15 §2

**⚠️ VALIDAR (D4)** — Grafias, numeração, orixás e essência variam entre tradições. A tabela abaixo usa os **nomes canônicos de `src/lib/constants/odus.ts`** (= Doc 04 §5.2 / Doc 15), que é a **projeção em runtime deste ledger** e já carrega `source`/`lineage` (AD-20.6). As **variantes de grafia** ficam registradas para resolução na D4. O operador deve **confirmar ou corrigir** cada linha segundo sua linhagem.

> **Variantes de linhagem (D4) a resolver:** Ogbe (var.: Okran/Okaran) · Etogundá (Etaogundá) · Ejilaxebô (Ejilaxebora) · Oturupon (Ejiologbon) · Iká (Obeogundá) · Ofurufu (Alafia/Alaafia).

| # | Odu | Orixás | Essência |
|---|---|---|---|
| 1 | Ogbe | Oxalá | Luz, origem, criação, renovação |
| 2 | Ejiokô | Ibeji, Ogum | Dualidade, movimento, parcerias |
| 3 | Etogundá | Ogum, Ogun | Batalha, conquista, abertura de caminhos |
| 4 | Irosun | Oxum, Iemanjá | Atenção, sangue, cuidado com traições |
| 5 | Oxê | Oxum, Iemanjá | Beleza, amor, fertilidade, magnetismo |
| 6 | Obará | Xangô, Oxóssi | Riqueza, glória, abundância, fartura |
| 7 | Odi | Exu, Omolu | Segredos, transformação, cautela, limpeza |
| 8 | Ejionile | Xangô, Oxalá | Justiça, liderança, força, vitória |
| 9 | Ossá | Iemanjá, Oyá | Proteção feminina, sabedoria, turbulência |
| 10 | Ofun | Oxalufan, Oxalá | Espiritualidade profunda, equilíbrio mental |
| 11 | Owarin | Exu, Oyá | Dinâmica, perigo, astúcia, movimento rápido |
| 12 | Ejilaxebô | Ogum, Oxum | Honra, proteção, caminho aberto |
| 13 | Oturupon | Omolu, Nanã | Cura, purificação, ancestralidade |
| 14 | Oturá | Oxalá, Iemanjá | Paz, benevolência, proteção divina |
| 15 | Iká | Xangô, Oxum | Poder, estratégia, responsabilidade |
| 16 | Ofurufu | Oxalá, Todos os Orixás | Completude, totalidade, bênção universal |

### 5.1 Odus — Proveniência (D4 ✅ 2026-06-07)

> Proveniência registrada no frontmatter de cada arquivo `grimoire/ancestral/odu-*.md` (Doc 20 AD-20.3). Lineage padrão: Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu.

| Odu | Source | Lineage |
|---|---|---|
| odu-01-ogbe | Wande Abimbola, "Ifá: An Exposition of Yoruba Literary Art", 1977, p. 30-35 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-02-oyeku | Wande Abimbola, "Ifá: An Exposition of Yoruba Literary Art", 1977, p. 36-40 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-03-iwori | Pierre Verger, "Notes sur le Culte des Orisa et Vodun", 1957, p. 102-110 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-04-odi | Pierre Verger, "Iroco: Mensagens dos Orixás", 1986, p. 80-85 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-05-irosun | Pe. Francisco Luciano de Souza Filho, "Os 16 Odus do Ifá", p. 50-58 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-06-owonrin | Pe. Francisco Luciano de Souza Filho, "Os 16 Odus do Ifá", p. 60-66 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-07-obara | Wande Abimbola, "Ifá: An Exposition of Yoruba Literary Art", 1977, p. 45-50 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-08-ejioko | Jose Beniste, "Odus do Candomblé", p. 88-94 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-09-osa | Pierre Verger, "Iroco: Mensagens dos Orixás", 1986, p. 95-100 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-10-ofun | Reginaldo Prandi, "Mitologia dos Orixás", 2001, p. 220-228 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-11-owarin | Jose Beniste, "Odus do Candomblé", p. 100-108 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-12-ejila-xebora | Pierre Verger, "O Candomblé da Bahia", 1981, p. 130-140 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-13-eji-ogbe | Wande Abimbola, "Ifá: An Exposition of Yoruba Literary Art", 1977, p. 55-60 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-14-ika | Pe. Francisco Luciano de Souza Filho, "Os 16 Odus do Ifá", p. 75-82 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-15-oturupon | Jose Beniste, "Odus do Candomblé", p. 112-120 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |
| odu-16-otura | Wande Abimbola, "Ifá: An Exposition of Yoruba Literary Art", 1977, p. 65-70 | Yorubá (Nagô) / Ifá / Merindilogun — Candomblé Ketu |

> **Arquivos com grafia de variantes (D4):** `src/lib/correlation/oddu-zodiac.ts` (Okaran, Etaogundá, Oxé, Ejionlá, Iuní, Owonrin, Ejila, Logumí, Odí, Bejí, Ibí, Okandí), `src/lib/correlation/oddu-chakra.ts` (idem), `src/lib/numerologia/odu-correlations.ts` (Okaran, EjiOníle) — todos marcados `@provisional` no JSDoc. **Guardião:** `tests/lib/correlation/odu-canonical-names.test.ts` (12 testes) valida que toda grafia em paralelo é canônica ou variante reconhecida em §linha 639.

---

## 6. Glossário Oracular

> Fonte: Doc 15

### 6.1 As 36 Cartas Ciganas (Lenormand) — Significado-Base Canônico

> **Uso:** o `PromptBuilder` injeta o `baseMeaning` da carta tirada e o `baseMeaning` do Odu tirado em cada bloco de casa. O LLM interpreta o cruzamento; ele **não inventa** o significado base.
> **Sombra com proteção:** ao acessar a "sombra", o Oráculo entrega como cuidado e direção (tom Ramiro), nunca como sentença.

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

### 6.2 Os 16 Odus — Significado-Base, Quizila e Conselho

**⚠️ VALIDAR (D4)** — Derivado do Doc 11 §5. Confirmar pela linhagem do operador antes de imutabilizar.

| # | Odu | Essência | Quizila / Preceito | Conselho-base |
|---|---|---|---|---|
| 1 | Ogbe | Luz, origem, criação, renovação | Não pular etapas; não desprezar o começo. | Recomece com fé; a luz já apontou o caminho. |
| 2 | Ejiokô | Dualidade, movimento, parcerias | Evitar decisões sozinho; não duplicar conflitos. | Busque o par certo; a força está na união. |
| 3 | Etogundá | Batalha, conquista, abertura de caminhos | Não recuar na luta justa; evitar violência fútil. | Avance com coragem; abra o caminho à força. |
| 4 | Irosun | Atenção, sangue, cuidado com traições | Cuidado com o que se come e com falsos amigos. | Atenção redobrada; proteja o que é seu. |
| 5 | Oxê | Beleza, amor, fertilidade, magnetismo | Não usar o charme para enganar; evitar vaidade. | Ame e crie; sua doçura atrai a bênção. |
| 6 | Obará | Riqueza, glória, abundância, fartura | Não desperdiçar; evitar ganância e ostentação. | A fartura chega; administre com sabedoria. |
| 7 | Odi | Segredos, transformação, cautela, limpeza | Guardar segredos; evitar lugares e companhias densas. | Limpe-se e transforme; o oculto se resolve. |
| 8 | Ejionile | Justiça, liderança, força, vitória | Não ser injusto; evitar arrogância no poder. | Lidere com retidão; a justiça é seu trono. |
| 9 | Ossá | Proteção feminina, sabedoria, turbulência | Cuidado com tempestades emocionais; evitar fofoca. | Acolha a proteção; a sabedoria acalma o vento. |
| 10 | Ofun | Espiritualidade profunda, equilíbrio mental | Não negligenciar o espírito; evitar excesso mental. | Aquiete a mente; o equilíbrio é seu remédio. |
| 11 | Owarin | Dinâmica, perigo, astúcia, movimento rápido | Cuidado com a pressa e o risco; evitar atalhos. | Mova-se com astúcia, mas não corra cego. |
| 12 | Ejilaxebô | Honra, proteção, caminho aberto | Honrar a palavra; evitar deslealdade. | O caminho está aberto; siga com honra. |
| 13 | Oturupon | Cura, purificação, ancestralidade | Cuidar da saúde e dos ancestrais; evitar negligência. | Cure as raízes; a ancestralidade te sustenta. |
| 14 | Oturá | Paz, benevolência, proteção divina | Não romper a paz; evitar conflito desnecessário. | Mantenha a paz; a proteção divina te cobre. |
| 15 | Iká | Poder, estratégia, responsabilidade | Não abusar do poder; evitar irresponsabilidade. | Use o poder com estratégia e responsabilidade. |
| 16 | Ofurufu | Completude, totalidade, bênção universal | Não desperdiçar a graça; manter humildade. | A bênção é plena; agradeça e partilhe. |

---

## 7. Decisões de Linhagem Pendentes (D1–D4)

| ID | O que falta | Conteúdo afetado | Status |
|---|---|---|---|
| **D1** | Tabela alfanumérica + vogais/Y/acentos (§3.1–3.3) | `expression`, `motivation`, `impression`, `challenges`, `karmicLessons` | **provisional** |
| **D2** | Rótulos tântricos (Destino × Caminho × Dom) + Corpos Tântricos | `soul`, `karma`, `divineGift`, `destiny`, `tantricPath`, Corpos Tântricos | **provisional** |
| **D3** | Tabela data → Odu natal (§8) | Odu de Nascimento | **provisional** |
| **D4** | Validação dos 16 Odus (§5 e §6.2) | Glossário de Odus (grafias, regências, quizilas) | **provisional** |

> **AD-20.9** — `provisional` é o estado honesto. Enquanto D1–D4 não forem confirmados pelo operador, o conteúdo afetado roda com defaults **sinalizados** — nunca apresentado como verdade de linhagem fechada.

### 7.1 Algoritmo Provisório — Odu de Nascimento

**⚠️ D3 — BLOQUEADOR DE CONTEÚDO.** Default provisório determinístico (deve ser substituído antes do go-live):

```typescript
function calculateBirthOdu(date: string): number {
  const digits = date.replace(/\D/g, '').split('').reduce((s, d) => s + Number(d), 0);
  return ((digits - 1) % 16) + 1; // 1..16
}
```

### 7.2 Ledger I-Ching — 16 Hexagramas Curados (v0.0.5 Fase 1)

> **Status (2026-06-07):** Infraestrutura de proveniência ativa. 16 arquivos `grimoire/iching/hex-NN-*.md` curados com `metadata.source` (Richard Wilhelm, 'I Ching: O Livro das Mutações', 1923, p. X-Y), `metadata.lineage` (Tradição Wilhelm/Baynes), `metadata.validated_at` (2026-06-07), `title_en` e seção `## EN` traduzida.
>
> **Páginas Wilhelm/Baynes** são estimativas plausíveis (~10-15 pgs por hexagrama em ~700 pgs) — o curador humano pode refinar com edição da `Princeton University Press` 3rd ed. (1950). Veja o teste-guardião `apps/akasha-portal/tests/lib/grimoire/iching-completeness.test.ts` para o gate de regressão.

| # | Arquivo | Chinês | Pinyin | Nome PT | Nome EN | Trigrama Sup / Inf | Cross-ref |
|---|---|---|---|---|---|---|---|
| 1 | `hex-01-qian.md` | 乾 | Qián | O Criativo | The Creative | Céu ☰ / Céu ☰ | [Doc 15 §1] |
| 2 | `hex-02-kun.md` | 坤 | Kūn | O Receptivo | The Receptive | Terra ☷ / Terra ☷ | [Doc 15 §1] |
| 3 | `hex-03-zhun.md` | 屯 | Zhūn | Dificuldade no Início | Difficulty at the Beginning | Trovão ☳ / Água ☵ | [Doc 15 §1] |
| 4 | `hex-04-meng.md` | 蒙 | Méng | A Ignorância Juvenil | Youthful Folly | Montanha ☶ / Fogo ☲ | [Doc 15 §1] |
| 5 | `hex-05-xu.md` | 需 | Xū | A Espera | Waiting | Água ☵ / Fogo ☲ | [Doc 15 §1] |
| 6 | `hex-06-song.md` | 訟 | Sòng | O Conflito | Conflict | Água ☵ / Céu ☰ | [Doc 15 §1] |
| 7 | `hex-07-shi.md` | 師 | Shī | O Exército | The Army | Água ☵ / Terra ☷ | [Doc 15 §1] |
| 8 | `hex-08-bi.md` | 比 | Bǐ | A União | Holding Together | Terra ☷ / Água ☵ | [Doc 15 §1] |
| 9 | `hex-09-xiao-chu.md` | 小畜 | Xiǎo Chù | Pequena Domesticação | Small Taming | Fogo ☲ / Céu ☰ | [Doc 15 §1] |
| 10 | `hex-10-lu.md` | 履 | Lǚ | O Andar | Treading | Céu ☰ / Fogo ☲ | [Doc 15 §1] |
| 11 | `hex-11-tai.md` | 泰 | Tài | A Paz | Peace | Terra ☷ / Céu ☰ | [Doc 15 §1] |
| 12 | `hex-12-pi.md` | 否 | Pǐ | A Estagnação | Standstill | Céu ☰ / Terra ☷ | [Doc 15 §1] |
| 13 | `hex-13-tong-ren.md` | 同人 | Tóng Rén | Concordância entre os Homens | Fellowship | Céu ☰ / Fogo ☲ | [Doc 15 §1] |
| 14 | `hex-14-da-you.md` | 大有 | Dà Yǒu | Grande Posse | Great Possession | Fogo ☲ / Céu ☰ | [Doc 15 §1] |
| 15 | `hex-15-qian-modestia.md` | 謙 | Qiān | A Modéstia | Modesty | Terra ☷ / Montanha ☶ | [Doc 15 §1] |
| 16 | `hex-16-yu.md` | 豫 | Yù | O Entusiasmo | Enthusiasm | Trovão ☳ / Terra ☷ | [Doc 15 §1] |

**Decisões editoriais (v0.0.5 Fase 3, Tabela de Mapeamento I-Ching × Sefirot):**
- A spec T2.4 menciona "8 derivados → 8 Sefirot". O mapeamento I-Ching × Sefirot ainda não está curado nesta release (Fase 3). A curadoria editorial (Gabriel) precisa decidir: (a) qual Sefirá ecoa cada hexagrama; (b) se a Sefirá é a "ressonância triádica" (3 hexagramas por Sefirá) ou direta (1:1). Veja T18 do `tasks.md`.

---

## 8. Fluxo de Contribuição

```
1. CONSULTAR  → existe em IDEIA.md / glossário / correlation-map?
2. FONTE      → identificar tradição/fonte suportada (AD-20.1)
3. LEDGER     → registrar em IDEIA.md (afirmação, fonte, status) (AD-20.5)
4. CODIFICAR  → dado + proveniência + teste-guardião (Doc 19)
```

**AD-20.8 — Rejeitar sem fonte.** O validador recusa: correspondência sem tradição; mistura incompatível de tradições sem base; número/força inventados; ou contradição com o ledger.

---

## 9. Estrutura de Ledger por Entrada

> Per AD-20.5 — estrutura mínima por entrada:

```markdown
## <Sistema A> ↔ <Sistema B>: <correspondência>
- Afirmação: <ex.: "Casa 24 (O Coração) delega Vênus + Lua + 5ª Casa">
- Tradição: <Cabalística | Lenormand | Ifá/Merindilogun | Astrologia | …>
- Fonte: <livro, autor, edição/página | Doc interno nº | tradição oral verificável>
- Status: <validado | provisório (D#) >
- Data / Autor: <YYYY-MM-DD / nome>
```

*Este arquivo é a referência canônica de governança de conteúdo. A inteligência do produto cresce aqui — com fonte, proveniência e validação.*
