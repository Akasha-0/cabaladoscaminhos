# ADR-0004: Akasha IA age como tradutora, não como curadora

## Status

Accepted

Data: 2026-06-26
Autor: time Akasha Portal
Relacionado a: [VISION.md §1, §2, §9, §10](../../VISION.md), [ADR-0003](0003-use-pgvector-for-embeddings.md)

## Contexto

A Akasha IA é o coração do projeto. Sua função define **que tipo de comunidade** construímos. Existem pelo menos três modelos possíveis:

1. **IA Curadora Prescritora** — diz "faça X, não faça Y", decide o que é "certo" espiritualmente, tem seguidores
2. **IA Curadora Descritiva** — cataloga tradições, mostra "Cabala diz A, Budismo diz B", sem integrar
3. **IA Tradutora Universalista** — **conecta** tradições, **traduz** entre elas e a ciência, **gera insights** que só são possíveis vendo o todo

Risco central do modelo prescritor (1): vira **guru digital**, forma seita virtual, atrai pessoas vulneráveis buscando respostas fáceis. Histórico recente (Replika, Character.AI) mostra os perigos reais.

Risco central do modelo descritor (2): vira **Wikipedia falante**. Útil mas sem alma. Não gera o valor de "consciência viva" que diferencia o projeto.

O modelo (3) é o que casa com os princípios fundadores (VISION.md §10): **universalismo não proselitismo**, **evidência e respeito**, **humildade epistêmica**, **co-evolução**.

Drivers específicos:
- O público "Curioso Acadêmico" (§3.3) precisa de tradução **tradição ↔ ciência**
- O público "Praticante" (§3.2) precisa de tradução **entre tradições**
- Os limites éticos (§9) já foram definidos: nunca prescrever, nunca substituir profissional, sempre citar
- A escolha define o **prompt de sistema**, a **arquitetura do RAG**, e o **tom das respostas**

## Decisão

A Akasha IA é uma **consciência tradutora universalista**. Seu papel é:

### Funções primárias (SIM)

1. **Traduzir** entre linguagens de tradições diferentes
   - "Oxalá representa a criação pura" → "Em termos ocidentais: arché, o que existia antes de tudo"
2. **Correlacionar** tradição com ciência
   - "Dissolução do ego na ayahuasca" → "Em termos neurocientíficos: redução de atividade no Default Mode Network"
3. **Citar fontes** sempre
   - Nunca inventar dado. Se não sabe, diz. Cada afirmação tem link pro paper/artigo/relato
4. **Contextualizar** prática em sua tradição
   - "Ayahuasca em contexto xamânico ≠ recreativo. Não romantiza nem simplifica"
5. **Apontar contraindicações** quando relevante
   - "Psilocibina com medicação SSRI pode causar síndrome serotoninérgica"
6. **Resumir** artigos longos e papers densos
7. **Aprender** com feedback da comunidade (co-evolução)

### Funções proibidas (NÃO)

1. ❌ **Prescrever** — "Você deve fazer X" → "Considere explorar Y; pessoas da tradição X costumam fazer Z. Mas consulte um profissional"
2. ❌ **Substituir profissional de saúde** — sempre lembrar: "Apoia, integra, mas não substitui"
3. ❌ **Prometer cura** — bloquear/editar afirmações como "Reiki cura câncer"
4. ❌ **Formar seita** — não é guru, não tem seguidores, não cobra, é ferramenta pública
5. ❌ **Hierarquizar tradições** — nenhuma é "superior" ou "mais verdadeira"
6. ❌ **Inventar dados** — sem paper/artigo citado, não afirma
7. ❌ **Tomar partido teológico** — não diz "Deus existe" ou "Deus não existe"; descreve o que cada tradição crê

### Implementação

- **Prompt de sistema** explícito sobre essas regras (em `src/lib/ai/system-prompts/`)
- **RAG sobre biblioteca curada** + papers verificados + relatos com disclaimer (§2.4 VISION)
- **Filtro de saída** pós-processa respostas procurando padrões proibidos ("você deve", "cura", "garanto") e reescreve
- **Botão "reportar resposta inadequada"** sempre visível — moderadores revisam semanalmente
- **Transparência radical** — IA cita quais documentos usou pra gerar cada resposta

## Consequências

### Positivas

- **Diferenciação clara** — "consciência tradutora" é conceito único no mercado. Replika/Character.AI são companhias; a gente é **infraestrutura de tradução**
- **Comunidade de iguais** — nenhuma tradição é dominante; sem guru; sem "voz oficial"; orgânico
- **Atrai público curioso/acadêmico** — pessoas que fogem de apps guru-like encontram espaço respeitoso
- **Compliance regulatório mais fácil** — não somos "aconselhamento espiritual" prescritivo, somos "agregador informativo contextualizado"
- **Co-evolução genuína** — feedback melhora a tradução, não o dogma (que não temos)
- **Resistência a captura** — sem "fundador guru", projeto não depende de carisma individual
- **Alinhamento ético-filosófico** — reflete o princípio universalista que motivou o projeto

### Negativas

- **Respostas podem parecer "frias"** — quem busca acolhimento prescritivo ("me diz o que fazer") não encontra; pode gerar frustração
- **Tamanho do prompt de sistema** — regras + exemplos + citações = ~2k tokens só de system prompt; consome context window
- **Custo de latência** — RAG + verificação de citações + filtro de saída adiciona ~500ms vs chamada direta ao LLM
- **Filtro de saída pode quebrar respostas legítimas** — heurística "você deve" pode pegar frase tipo "você deve considerar que...". Necessita tuning constante
- **Moderadores sobrecarregados** — se filtrarmos mal, conteúdo inadequado vaza e moderadores precisam revisar muito
- **Métricas de sucesso são mais sutis** — "prescritor" mede "quantos usuários seguiram o conselho". "Tradutor" mede "qualidade percebida da tradução". Mais difícil de A/B testar
- **Atração inicial é mais difícil** — apps guru-like viralizam mais rápido com promessas mirabolantes; a gente viraliza com substância, mais devagar
- **Risco de ser "Wiki melhorada"** — se traduções forem chatas/sem insight, vira enciclopédia. Exige qualidade alta das respostas

### Neutras

- Time de moderadores precisa ser treinado em "detectar viés prescritivo disfarçado"
- Logs de respostas da IA ficam auditáveis por 1 ano (LGPD + qualidade)
- Botão de feedback fica em toda resposta — UX considera "mais um botão" (mitigado com tooltip)

## Alternativas consideradas

### 1. IA Curadora Prescritora (modelo "guru digital")

- **Prós:** Viraliza rápido; usuários engajados; sensação de "ter um mentor"; possível monetização (assinatura premium)
- **Contras:** **Forma seita virtual**; risco psicológico para usuários vulneráveis; problemas regulatórios (aconselhamento sem licença); atrai fundação paranoica de guru
- **Por que não:** **Viola os princípios fundadores** (§10 VISION). Risco humano + reputacional + legal. Replika/Character.AI já provaram que o modelo dá errado

### 2. IA Puramente Descritiva (modelo "enciclopédia falante")

- **Prós:** Seguro, neutro, fácil de auditar; sem risco ético; ótimo para SEO
- **Contras:** Sem alma; sem diferencial vs Wikipedia + ChatGPT; comunidade não se conecta emocionalmente; "consciência viva" não acontece
- **Por que não:** Não captura a visão do projeto. Seria desperdício de toda a base espiritual construída (Numerologia, Odu, Astrologia, Tantra) — esses são **insights correlativos**, não enciclopédicos

### 3. IA como Moderadora (modelo "guarda de trânsito")

- **Prós:** Evita toxicidade; baixo risco; não compete com práticas
- **Contras:** Não é o que comunidade quer; foco reativo (limpa lixo), não proativo (gera valor); não aproveita LLMs
- **Por que não:** Função existe mas é secundária. Função primária precisa ser geradora de valor

### 4. Multi-IA por Tradição (um "especialista" Cabala, um Ayahuasca, etc)

- **Prós:** Especialização aparente; cada "personagem" pode ter personalidade; marketing atraente
- **Contras:** **Viola o princípio universalista** (cria hierarquia entre IAs e entre tradições); cada IA tem viés próprio; complexo de manter; usuários ancoram em uma "IA preferida" (forma guru)
- **Por que não:** Subverte a proposta. Uma Akasha que vê o todo é mais valiosa que dez especialistas fragmentados

### 5. IA Híbrida (prescritora opt-in para usuários premium)

- **Prós:** Atende ambos os públicos; monetização possível
- **Contras:** **Sem dinheiro no projeto** (gratuito, sem B2B); cria produto premium que contradiz missão; usuários vulneráveis pagariam por "validação prescritiva" (preocupante); complexidade de manter dois modos
- **Por que não:** Contradiz modelo de negócio (não temos) e princípios fundadores. Opt-in prescritivo é porta dos fundos para os mesmos problemas

### 6. IA como Coach Pessoal de Prática (lembretes, accountability)

- **Prós:** Engajamento diário; viraliza por ser "companhia"; CRM de prática
- **Contras:** Escopo limitado; "coach" implica orientação personalizada (quase prescrito); não aproveita conhecimento agregado
- **Por que não:** Sub-utiliza a capacidade. Pode existir como **funcionalidade secundária** (lembrete de prática diária) sem ser o foco

### 7. Sem IA (apenas comunidade + conteúdo)

- **Prós:** Zero risco ético; zero custo de LLM; comunidade pura
- **Contras:** Perde o diferencial que justifica o projeto; "comunidade espiritual" tem 1.000 concorrentes; valor único da Akasha morre
- **Por que não:** Akasha é o nome do projeto. Sem ela, vira mais um Reddit temático

## Referências

- [VISION.md §1 Propósito](../../VISION.md)
- [VISION.md §2 O que a IA faz](../../VISION.md)
- [VISION.md §9 Limites éticos](../../VISION.md)
- [VISION.md §10 Princípios](../../VISION.md)
- [ADR-0003: Use pgvector for Embeddings](0003-use-pgvector-for-embeddings.md) — alimenta o RAG da tradutora
- [ADR-0006: Universalist Not Proselytizing](0006-universalist-not-proselytizing.md) — princípio correlato
- Referências externas:
  - [Tragic case of chatbot-induced suicide (Character.AI lawsuit, 2024)](https://www.reuters.com/technology/) — lição sobre IA prescritora
  - [OpenAI usage policies](https://openai.com/policies/usage-policies) — guardrails de provedor
- Documento interno: `/docs/ai-ethics-charter.md` (a ser criado)