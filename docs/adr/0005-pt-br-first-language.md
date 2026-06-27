# ADR-0005: Português brasileiro (pt-BR) é o idioma principal da plataforma

## Status

Accepted

Data: 2026-06-26
Autor: time Akasha Portal
Relacionado a: [VISION.md §3, §10](../../VISION.md), [ADR-0006](0006-universalist-not-proselytizing.md)

## Contexto

O Akasha Portal precisa decidir **em que idioma a experiência é primária**. Existem quatro caminhos possíveis:

1. **Inglês primeiro** — maximiza alcance global; lingua franca de tecnologia e ciência
2. **Português brasileiro primeiro** — comunidade fundadora é brasileira; tradição espiritual do projeto (Ifá, Cabala praticada no Brasil, umbanda, candomblé) tem forte ancoragem lusófona
3. **Multilíngue desde o dia 1** — i18n completo com switcher de idioma
4. **Bilíngue (pt-BR + en)** — duas versões paralelas com mesmo conteúdo

Restrições:
- A **comunidade fundadora** é brasileira. Termos como "Odu", "Orixá", "Mesa Real Cigana", "Preceito" não têm equivalente direto em inglês — tradução literal perde significado
- A **Akasha IA** precisa responder com nuance cultural; traduções automáticas de termo espiritual tendem a ser racistas/exotizantes
- O conteúdo **científico** sobre espiritualidade brasileiro (UFRN, FIOCRUZ, UNIFESP sobre ayahuasca, rapé, etc) está majoritariamente em português
- Acessibilidade: maioria da população brasileira fala **apenas português** — qualquer tradução parcial segrega
- Recursos de equipe são finitos — i18n completo com qualidade custa 3-4x o esforço de uma única língua

Drivers:
- **Identidade cultural**: o projeto nasce no Brasil, da vivência brasileira de espiritualidade
- **Inclusão**: barreira de inglês é real para público principal
- **Qualidade**: pt-BR permite traduções cuidadas de termos sagrados que inglês não comporta
- **SEO orgânico**: dominar keywords em pt-BR ("Numerologia Cabalística caminho de vida 11") é estratégia de aquisição

## Decisão

**Português brasileiro (pt-BR)** é o **idioma principal** da plataforma. Inglês fica como **secundário opcional** apenas para alcançar conteúdo acadêmico/científico quando a fonte é em inglês.

### Princípios de aplicação

1. **Toda UI** está em pt-BR (botões, mensagens, validações, emails transacionais, notificações)
2. **Todo conteúdo gerado pela Akasha IA** é em pt-BR por padrão
3. **Termos espirituais** preservam forma original (Odu, Orixá, Sephirah, Chakra) com **glossário contextual** em pt-BR na primeira menção
4. **Papers científicos em inglês** são **resumidos e traduzidos** pela IA com citação da fonte original
5. **Papers em português** são citados diretamente
6. **Mensagens de erro** em pt-BR com tom acolhedor (não "ERRO 500 — internal server error")
7. **Comentários e posts** — usuário escreve no idioma que quiser; IA detecta e responde no mesmo idioma do usuário (com fallback pt-BR)
8. **Documentação técnica do código** (variáveis, comentários, commits) segue convenção do time (inglês para clareza de tooling)

### Exceções explícitas (não vamos traduzir)

- **Código-fonte** — variáveis, funções, classes em inglês (convenção universal)
- **Commits e PRs** — em inglês (para atrair colaboradores futuros internacionais)
- **Bibliotecas de terceiros** — usam inglês por default (Next.js, Supabase retornam mensagens em inglês)
- **Logs de servidor** — em inglês (padrão de mercado; ferramentas de monitoramento esperam assim)

### Roadmap multilíngue (NÃO é Fase 1)

Fase 4+ (após tração): adicionar **espanhol** (comunidade lusófona + hispano-americana enorme em espiritualidade) e **inglês completo** (Papers/Biblioteca; UI complexa só depois). Não antes.

### Modelo de tradução

- **Glossário canônico**: `src/i18n/glossary.ts` mapeia termos espirituais pt-BR ↔ outros idiomas (futuro)
- **Akasha IA treinada** com system prompt reforçando uso de termos pt-BR e evitando anglicismos desnecessários
- **Validação humana** por moderadores nativos em qualquer expansão futura

## Consequências

### Positivas

- **Identidade clara** — comunidade sabe que é projeto brasileiro, lusófono, com termos preservados
- **SEO dominante em pt-BR** — capturamos 100% das buscas em português sobre os temas
- **Inclusão** — pessoas que não falam inglês podem participar plenamente (demografia brasileira majoritária)
- **Qualidade cultural** — sem tradução automática ruim de termos sagrados; IA entende contexto
- **Comunidade fundadora sente-se em casa** — barreira zero para contribuidores iniciais
- **Diferenciação** — espiritualidade em inglês já tem 1.000 plataformas. Em pt-BR com qualidade, somos quase únicos
- **Acessibilidade** — não exigimos inglês para entender conteúdo denso (Cabala, Ifá, Tantra)
- **Compliance LGPD facilitado** — termos de uso em pt-BR são legalmente mais fortes para público-alvo

### Negativas

- **Escala global limitada** — falantes não-lusófonos não conseguem usar (perdemos欧美市场 até Fase 4+)
- **Comunidade internacional segregada** — brasileiro bilíngue pode participar plenamente; estrangeiro monolíngue em inglês não
- **Acadêmicos globais podem descartar** — papers em pt-BR têm menos citação internacional; perdemos penetração científica
- **Tradução de papers custa** — IA precisa resumir + traduzir cada paper em inglês, consome tokens
- **Manutenção de glossário** — toda nova tradição/termo exige decisão de tradução; é trabalho contínuo
- **Risco de "gueto"** — se a comunidade for 99% brasileira, vira insulamento cultural; perdemos a perspectiva universalista
- **Documentação técnica em inglês pode afastar contribuidores brasileiros** — se o `CONTRIBUTING.md` é em inglês, devs brasileiros juniores podem desistir
- **i18n futuro é refatoração cara** — strings hardcoded em pt-BR espalhadas pelo código precisarão ser extraídas quando formos multilíngue

### Neutras

- Bibliotecas de UI (shadcn) já são em inglês; precisamos customizar labels manualmente
- OpenAI funciona melhor em inglês — prompt em pt-BR pode ter resposta ~10% menos precisa em casos técnicos extremos (mitigável com few-shot examples)
- Vercel dashboard é em inglês — irrelevante para usuário final

## Alternativas consideradas

### 1. Inglês como idioma principal

- **Prós:** Alcance global imediato; lingua franca tech/ciencia; mercado maior; monetização mais fácil (se um dia for)
- **Contras:** **Perde identidade cultural**; termos espirituais ficam exotizados ("macumba" vira "Brazilian black magic"); exclui 99% da comunidade fundadora; não diferencia de 1.000 concorrentes em inglês
- **Por que não:** Destrói a razão de ser do projeto. Brasileiro procurando "Odu de Nascimento" quer em pt-BR

### 2. Multilíngue desde o dia 1 (pt-BR + en + es)

- **Prós:** Alcance global; inclusão total; SEO em 3 idiomas
- **Contras:** **Custo triplica** (cada string, cada email, cada doc em 3 línguas); moderação em 3 línguas; sem time para manter qualidade; risco de traduções desiguais
- **Por que não:** Equipe de 2 devs não dá conta. i18n com qualidade é Fases 4+. MVP precisa foco

### 3. Bilíngue (pt-BR + en) desde o dia 1

- **Prós:** Compromisso entre identidade e alcance; SEO em 2 idiomas
- **Contras:** Mesmo problema de escala que multilíngue; tradução de termos espirituais para inglês é especialmente ruim; qualidade cai
- **Por que não:** Custo operacional alto para Fase 1 sem retorno claro. Adiar en é mais estratégico

### 4. Espanhol como idioma principal

- **Prós:** Alcance enorme (500M falantes); tradição espiritual riquíssima (mesoamericana, andina)
- **Contras:** Comunidade fundadora fala português, não espanhol; exclui Brasil; desconecta da base construída (Numerologia Cabalística, Odu, Orixá são do Brasil)
- **Por que não:** Desconecta da origem do projeto

### 5. I18n técnico (código) + pt-BR (UX) misturado

- **Prós:** Código em inglês (universal) + UX em pt-BR (humano)
- **Contras:** **É o que já escolhemos** (não é alternativa, é nossa decisão refinada)
- **Por que não:** É a abordagem vencedora — confirmamos a direção

### 6. Idioma "neutro" estilo Esperanto de espiritualidade

- **Prós:** Sem viés cultural; supostamente universal
- **Contras:** **Constrangimento absurdo** — tradição nenhuma fala assim; usuários não entendem; afasta comunidade
- **Por que não:** Tradução universalista (Akasha) acontece **conceitualmente**, não no idioma da UI. UI deve ser no idioma que o usuário entende

### 7. Tradução automática total (Google Translate via API)

- **Prós:** Zero custo de tradução manual
- **Contras:** **Tradução de termos sagrados é racista/exotizante** ("Orixá" vira "Orisha worship" com conotação exótica); tom acolhedor se perde; sem nuance cultural
- **Por que não:** Qualidade inaceitável para conteúdo sensível. Tradução humana + IA assistida é necessária

## Referências

- [VISION.md §3 Os 4 públicos](../../VISION.md)
- [VISION.md §10 Princípios — Universalismo não proselitismo](../../VISION.md)
- [ADR-0006: Universalist Not Proselytizing](0006-universalist-not-proselytizing.md) — princípio correlato
- [Next.js i18n docs](https://nextjs.org/docs/app/building-your-application/routing/internationalization) — base técnica
- Referências externas:
  - [InternetWorldStats — população por idioma](https://www.internetworldstats.com/stats.htm)
  - [LGPD — termo de consentimento em português](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- Documento interno (a criar): `/docs/glossary.md` — glossário canônico de termos espirituais