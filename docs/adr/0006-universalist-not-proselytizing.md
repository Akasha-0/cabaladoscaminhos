# ADR-0006: Universalista, não proselitista

## Status

Accepted

Data: 2026-06-26
Autor: time Akasha Portal
Relacionado a: [VISION.md §3, §4, §10](../../VISION.md), [ADR-0004](0004-akasha-ia-as-translator-not-curator.md), [ADR-0005](0005-pt-br-first-language.md)

## Contexto

O Akasha Portal nasce em um campo minado: **espiritualidade é terreno de seitas, gurus, proselitismo e conflito inter-tradição**. A forma como a plataforma se posiciona em relação a isso **define se ela é refúgio ou mais uma armadilha**.

Existem três modelos extremos de posicionamento:

1. **Prozelitismo aberto** — "nossa tradição é a verdadeira, venha pra cá" (modelo de igreja/grupo espiritual organizado)
2. **Prozelitismo velado** — "só apresentamos X tradição, mas é sutilmente a 'melhor'" (modelo de app de uma tradição específica)
3. **Universalismo igualitário** — "todas as tradições têm valor, nenhuma é dominante, oferecemos espaço para todas coexistirem" (modelo de plataforma agregadora neutra)

Risco central do modelo proselitista: **replicar hierarquia espiritual excludente**. O usuário que pratica Candomblé não deveria ser tratado como "menos avançado" que o que pratica Budismo. Histórico da internet está cheio de fóruns espirituais que viraram câmaras de eco de uma tradição, afastando praticantes de outras.

Drivers:
- **Público plural** (VISION §3): buscador, praticante, curioso acadêmico, curador — todos merecem espaço
- **Lista de práticas com evidência** (§4) inclui Cabala, Ifá, Xamanismo, Tantra, Budismo, Ayurveda, Meditação, Astrologia — nenhuma dominante
- **Limites éticos da IA** (§9): nunca prescrever, sempre respeitar autoridade da tradição ("consulte seu babalorixá")
- **Princípios fundadores** (§10): "universalismo não proselitismo" já está explícito

A escolha afeta:
- **Algoritmo de feed/recomendação** (não pode criar bolha)
- **Moderação** (como lidar com conflito entre tradições)
- **Akasha IA** (não pode favorecer uma tradição)
- **Grupos** (estrutura deve permitir coexistência sem hierarquia)

## Decisão

Adotamos **universalismo igualitário estrito** como modelo de plataforma.

### Princípios (não-negociáveis)

1. **Nenhuma tradição é "verdadeira" ou "superior"** — todas coexistem com mesma dignidade
2. **Não evangelizamos** — nunca dizemos "venha para nossa tradição"
3. **Não hierarquizamos** — praticante de qualquer tradição tem mesmo espaço no feed
4. **Não segregamos rigidamente** — feed mostra todas as tradições (com filtros opcionais por usuário)
5. **Respeitamos autoridade interna de cada tradição** — se a tradição tem babalorixá/rabino/padre/guru, **a IA sempre lembra** "consulte sua autoridade"; a plataforma **não substitui** essa autoridade
6. **Apresentamos com contexto** — sem exotização, sem simplificação; sem folclorização; sem apropriação
7. **Algoritmo de feed não prioriza por tradição** — apenas por relevância para o usuário, não por afinidade da plataforma
8. **Moderação trata conflitos com cuidado** — debate teológico é permitido; ataque a praticantes de outra tradição não é

### Mecanismos práticos

| Mecanismo | Como implementa |
|---|---|
| **Feed unificado** | Posts de todas as tradições no mesmo timeline, sem segregação |
| **Filtros opcionais** | Usuário pode filtrar por tradição **se quiser** (preferência pessoal, não imposição) |
| **Grupos por tradição** | Existem para facilitar encontro entre praticantes, **não** para criar guetos |
| **Tags cross-tradição** | "Meditação" aparece em Budismo, Hinduísmo, Cristianismo contemplativo, Sufismo — sem dono |
| **Akasha IA** | System prompt explicitamente proibido de hierarquizar; exemplos few-shot reforçam neutralidade |
| **Moderação** | Linha-guia: "debate de ideias sim; ataque a pessoas/grupos não" |
| **Biblioteca** | Cada tradição tem artigos **escritos por ou com** praticantes da tradição (não outsiders falando sobre) |
| **Disclaimer universal** | Toda página cita: "Akasha Portal é plataforma de encontro e tradução entre tradições, não afiliada a nenhuma" |

### O que NÃO fazemos (explícito)

- ❌ "Tradição do mês" destacando uma
- ❌ "Tradição em destaque" na home
- ❌ Ordem específica de tradições na UI (sempre alfabética ou por tradição escolhida pelo usuário)
- ❌ "Caminho da Akasha" como se fosse uma tradição própria
- ❌ Eventos exclusivos de uma tradição promovidos pela plataforma
- ❌ Líderes espirituais como "embaixadores" da plataforma (eles representam a tradição, não a gente)
- ❌ Notificações do tipo "Você deveria explorar X tradição" (a IA sugere recursos, não pertencimento)

### Casos de fronteira (decisões prévias)

| Situação | Decisão |
|---|---|
| Praticante de uma tradição ataca outra na comunidade | Moderadores intervêm, removem ataque, **não** removem opinião teológica |
| Akasha IA perguntada "qual tradição é a melhor?" | Responde: "Cada tradição tem critérios próprios de 'validade'. A Akasha apresenta todas sem hierarquia. Veja filtros por tradição." |
| Usuário quer criar conteúdo evangelístico ("venha pra cá") | Permitido como **opinião pessoal em post**, **não** como feature da plataforma |
| Tradição declara posições políticas/sociales controversas | Plataforma não toma partido; mostra o que a tradição crê; usuário decide |
| Tradição tem prática perigosa documentada (ex: sanção corporal) | Mostramos com contexto e **contraindicações**; não proibimos; não promovemos |

## Consequências

### Positivas

- **Comunidade plural de verdade** — praticantes de qualquer tradição sentem-se bem-vindos; sem "tradição oficial"
- **Atrai público acadêmico e curioso** — pessoas que rejeitam proselitismo encontram espaço respeitoso
- **Resistência à captura por tradição** — sem dono, sem guru fundador, projeto não vira braço de nenhuma religião
- **Compliance regulatório** — não somos "organização religiosa", somos plataforma; menos risco jurídico
- **Coerência com a proposta da Akasha IA** — tradutora entre iguais, não defensora de uma tradição
- **Modelo escalável** — qualquer tradição pode ser adicionada sem precisar "pedir permissão" à plataforma
- **Atrai praticantes sérios** — gente profunda não quer plataforma rasa; profundidade exige respeito igualitário

### Negativas

- **Crescimento inicial mais lento** — plataformas com "tradição oficial" viralizam mais rápido (público ávido por guru)
- **Conflitos entre tradições são dolorosos** — sem "verdade oficial", debates podem escalar; moderação precisa ser ativa
- **Moderadores precisam ser treinados** — entender sutileza de conflito teológico sem cair em "moderação arbitrária"
- **Sem identidade visual única de tradição** — UI precisa ser genérica o suficiente para acolher todas; menos "charme" específico
- **Difícil explicar em uma frase** — "comunidade de espiritualidade universalista" é mais longo que "app de Cabala"
- **Algumas práticas com evidência fraca vão aparecer** — magia simpática, radiestesia, etc. Como拒ar seme ar pareça hierarquizar?
- **Lideranças de tradições podem reclamar** — "vocês não defendem a tradição X" — resposta padrão: "defendemos a coexistência, não uma tradição específica"
- **Sem "fundador guru"** — projeto depende de comunidade ativa, não de carisma. Se comunidade fraqueja, projeto fraqueja

### Neutras

- UI usa símbolos universais (lua, sol, estrela, mandala abstrata) — não símbolos de uma tradição específica
- Tradições bem documentadas (Cabala, Ifá, Budismo) recebem mais conteúdo inicial simplesmente porque há mais fontes; isso não é viés, é estado da arte

## Alternativas consideradas

### 1. Pró-Cabalístico / Pró-Ifá (modelo "uma tradição dominante")

- **Prós:** Identidade forte; comunidade nicho dedicada; expertise profunda em uma tradição; viraliza em nicho
- **Contras:** Exclui praticantes de outras tradições; vira "mais um app de X"; viola princípio fundador
- **Por que não:** Contradiz o que nos trouxe até aqui. Não é o projeto que o usuário quer construir

### 2. Pró-Científico Racional (modelo "espiritualidade é placebo")

- **Prós:** Audiência acadêmica; "respeitabilidade científica"; SEO forte em keywords céticos
- **Contras:** **Destrói o projeto** — espiritualidade é o tema; se duvidamos dela, somos mais um Quora
- **Por que não:** Não-resposta. Descaracteriza o produto

### 3. Pró-Espiritualidade Genérica (modelo "lei da atração / new age")

- **Prós:** Viraliza fácil; audiência enorme (facebook/Instagram de "energias"); baixo risco de conflito entre tradições (todas são "energia boa")
- **Contras:** Rasa; sem fundamentação; atrai charlatões; não respeita profundidade das tradições; tom Coach
- **Por que não:** Seria preceptor de uma **forma** de espiritualidade (a genérica), não universalista

### 4. Multi-Tradição Segmentada (modelo "cada tradição tem sua ala separada")

- **Prós:** Cada comunidade de tradição se sente "em casa"; moderação por tradição especializada
- **Contras:** **Reproduz segregação religiosa no digital**; perde o valor da tradução; vira "8 fóruns separados com login unificado"
- **Por que não:** Desperdiça o diferencial do projeto (Akasha como tradutora). Tradução exige contato, não separação

### 5. Modelo "Plataforma Aberta Sem Moderação" (modelo Reddit puro)

- **Prós:** Liberdade total; sem viés; mínimo custo de moderação; escala fácil
- **Contras:** Rápido vira terra de conflito e extremismo; usuários vulneráveis desprotegidos; sem curadoria
- **Por que não:** Conteúdo espiritual sensível não sobrevive sem moderação ativa. Pessoas buscam cura/vulnerabilidade merecem proteção

### 6. Modelo "Agregador de Links Neutro" (modelo Wikipedia de espiritualidade)

- **Prós:** Zero viés possível; só descreve o que cada tradição diz; sem opinião da plataforma
- **Contras:** Chato; sem comunidade; sem IA agregadora; vira enciclopédia; perde valor de rede social
- **Por que não:** Não captura a visão. Universalismo ≠ neutralidade passiva; é **espaço de encontro ativo**

### 7. Modelo "Curadoria Editorial Forte" (modelo editorial de revista)

- **Prós:** Conteúdo de qualidade; tom consistente; expertise visível
- **Contras:** **Forma casta de gatekeepers**; reproduz hierarquia (agora entre curadores); afasta praticantes que discordam
- **Por que não:** Editorial funciona em revista, não em comunidade. Plataforma precisa abrir para todos, não selecionar

## Referências

- [VISION.md §3 Os 4 públicos](../../VISION.md) — pluralidade do público
- [VISION.md §4 Lista de práticas com evidência](../../VISION.md) — base de legitimidade
- [VISION.md §9 Limites éticos da IA — regra 7](../../VISION.md) — respeito à autoridade da tradição
- [VISION.md §10 Princípios — Universalismo não proselitismo](../../VISION.md)
- [ADR-0004: Akasha IA as Translator](0004-akasha-ia-as-translator-not-curator.md) — papel da IA alinhado
- [ADR-0005: PT-BR First Language](0005-pt-br-first-language.md) — escolha cultural alinhada
- Referências externas:
  - [Council for a Parliament of the World's Religions](https://parliamentofreligions.org/) — modelo de coexistência global
  - [Charter for Compassion](https://charterforcompassion.org/) — princípios de acolhimento sem hierarquia
  - [Documento interno: `/docs/community-guidelines.md` (a criar)](../../docs/) — guia de moderação derivado deste ADR