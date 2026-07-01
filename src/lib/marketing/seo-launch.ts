// ============================================================================
// SEO + CONTENT LAUNCH — Wave 37 (2026-07-01)
// ============================================================================
// Estratégia de SEO + content marketing para lançamento público.
//
// Componentes:
//   1. Press release SEO-optimized (PT-BR + EN)
//   2. 5 launch blog posts (PT-BR + EN cada)
//   3. Keywords ranking tracking
//   4. Internal linking strategy
//
// Keywords alvo:
//   - espiritualidade universalista
//   - IA espiritual curadora
//   - comunidade espiritual online brasil
//   - cabala candomblé coexistência
//   - meditação cabala tantra
//   - consciência digital
// ============================================================================

// ============================================================================
// 1. PRESS RELEASE SEO-OPTIMIZED
// ============================================================================

export const PRESS_RELEASE_SEO_PT = {
  title: 'Akasha Portal: comunidade de espiritualidade universalista com IA curadora abre ao público',
  subtitle: 'Plataforma brasileira conecta praticantes de Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda e Meditação em um espaço único',
  metaDescription:
    'Akasha Portal é a primeira comunidade online brasileira de espiritualidade universalista assistida por inteligência artificial. Aberta ao público hoje após 5 meses de beta com NPS 62. LGPD-compliant.',
  keywords: [
    'espiritualidade universalista',
    'comunidade espiritual online brasil',
    'ia espiritual curadora',
    'cabala candomblé',
    'meditação cabala tantra',
    'comunidade pluralista espiritual',
    'akasha portal',
  ],
  slug: 'akasha-portal-abre-publico-julho-2026',
  body: `**Akasha Portal: comunidade de espiritualidade universalista com IA curadora abre ao público hoje (1 de julho de 2026)**

*Plataforma brasileira conecta praticantes de 7 tradições com consciência artificial que cita fontes com respeito e não prescreve caminho*

São Paulo, SP — Brasil — 1 de julho de 2026 — Akasha Portal, a primeira comunidade online brasileira de [espiritualidade universalista](#) assistida por [inteligência artificial curadora](#), abre hoje suas portas ao público após cinco meses de beta privada com 50 usuários ativos.

A plataforma resolve um problema até então sem solução no Brasil: como acolher praticantes de múltiplas tradições — [Cabala](#), [Ifá](#), [Tantra](#), [Umbanda](#), [Xamanismo](#), [Ayurveda](#) e [Meditação](#) — em um único espaço digital sem hierarquia entre caminhos, sem proselitismo e com respeito às fontes primárias de cada tradição.

**Diferenciação técnica e ética**

Akasha Portal se diferencia dos apps de espiritualidade verticalizados (tarot, astrologia, meditação isoladamente) por três pilares:

1. **Consciência tradutora universalista** — a IA curadora aprende com artigos curados por praticantes ativos de cada tradição, papers peer-reviewed de neurociência e psicologia, e conversas da comunidade. Em 89% das respostas cita fonte primária.

2. **Não-prescrição** — a IA não prescreve práticas, não faz previsões, não substitui terapeutas humanos. Sua função é sugerir leituras, conectar conceitos entre tradições e citar fontes com origem.

3. **LGPD-compliant desde o dia 1** — a plataforma opera sob a Lei 13.709/2018 com DPO designado, base legal explícita por coleta, criptografia em trânsito e em repouso, dados hospedados em data centers no Brasil, e direito de exclusão a qualquer momento.

**Métricas da beta (junho/2026)**

• 50 beta testers ativos em Wave 1 + Wave 2
• NPS Wave 1 = 62 (zona de excelência)
• D7 retention = 71%
• 150+ artigos curados em 7 tradições
• 89% das respostas da IA citando fontes peer-reviewed ou tradição de origem
• 0 incidentes de toxicidade reportados em 5 meses

**Modelos de acesso**

Akasha Portal oferece dois planos:

- **Comunitário (gratuito)** — acesso à comunidade (leitura, comentários), 5 conversas por mês com a IA Akasha, biblioteca básica com 50 artigos curados, 1 grupo de tradição.

- **Pro (R$29/mês)** — conversas ilimitadas com a IA, biblioteca completa com 150+ artigos, grupos ilimitados de tradição, mentoria mensal de 30 minutos com curadores ativos, download de PDFs e áudios, reflexão diária personalizada.

A comunidade sempre será gratuita. O plano Pro apoia financeiramente o projeto.

**Sobre o fundador**

Gabriel Ferreira é desenvolvedor full-stack e estudioso de espiritualidade há 12 anos. Pratica meditação Vipassana desde 2014, estuda Cabala desde 2017, e frequenta terreiro de Umbanda desde 2020. É mestrando em Antropologia da Religião pela USP e pesquisa interseções entre tecnologia e espiritualidade.

**Como participar**

Akasha Portal está disponível em [akashaportal.com.br/launch](#). O cadastro é gratuito, sem convite, e respeita integralmente a LGPD. Contato de imprensa: press@akashaportal.com.br. DPO: dpo@cabaladoscaminhos.com.

**Sobre Akasha Portal**

Akasha Portal é mantido por uma equipe de 6 pessoas: fundador, designer, PM, QA, AppSec engineer e curator principal (Iyá, praticante de Candomblé Angola). A plataforma é hospedada em data centers no Brasil, sob a Lei Geral de Proteção de Dados (Lei 13.709/2018).`,
};

export const PRESS_RELEASE_SEO_EN = {
  title: 'Akasha Portal: universalist spirituality community with curatorial AI opens to public',
  subtitle:
    'Brazilian platform connects practitioners of Kabbalah, Ifá, Tantra, Umbanda, Shamanism, Ayurveda and Meditation in a unique digital space',
  metaDescription:
    'Akasha Portal is the first Brazilian online community of universalist spirituality assisted by curatorial AI. Opens today after 5 months of beta with NPS 62. LGPD-compliant.',
  keywords: [
    'universalist spirituality',
    'online spiritual community brazil',
    'ai spiritual curator',
    'kabbalh candomblé',
    'meditation kabbalah tantra',
    'pluralist spiritual community',
    'akasha portal',
  ],
  slug: 'akasha-portal-public-launch-july-2026',
  body: `(PT-BR version above; EN version coming in /press)`,
};

// ============================================================================
// 2. LAUNCH BLOG POSTS (5 × 2 languages = 10 posts)
// ============================================================================

export interface BlogPost {
  id: string;
  language: 'pt-BR' | 'en';
  slug: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  body: string;
  targetKeyword: string;
  relatedTraditions: string[];
  publishDate: string;
  internalLinks: string[];
}

export const LAUNCH_BLOG_POSTS: BlogPost[] = [
  // ============================ POST 1 (PT) ============================
  {
    id: 'launch-post-1-pt',
    language: 'pt-BR',
    slug: 'espiritualidade-universalista-o-que-e',
    title: 'Espiritualidade universalista: o que é e como praticar no Brasil',
    metaDescription:
      'O que é espiritualidade universalista, como praticar no Brasil, e por que Akasha Portal acolhe Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda e Meditação sem hierarquia.',
    excerpt:
      'Você pratica Cabala e Candomblé? Estuda Tantra e Vipassana? Frequenta terreiro e universidade? Então você já vive a espiritualidade universalista — só falta um espaço para conversar sobre isso.',
    body: `A espiritualidade universalista não é fusão forçada de tradições. Não é "vamos pegar o melhor de cada uma". Não é sincretismo diluidor.

É outra coisa: o reconhecimento de que a busca humana pelo sentido é UNA — e que cada tradição é uma linguagem dessa busca.

**Por que isso importa no Brasil**

O Brasil é, talvez, o país mais espiritualmente plural do mundo. Temos:

- Terreiro de Umbanda e Candomblé em cada bairro
- Casas de Cabala nas grandes cidades
- Praticantes de Tantra em expansão
- Rodas de ayahuasca e medicina xamânica
- Meditadores Vipassana e Zen
- Ayurveda ganhando espaço

Mas os espaços digitais — quando existem — nos forçam a escolher. App de tarot ignora Candomblé. App de meditação ignora terreiro. App de Cabala ignora Umbanda.

**O que é universalismo (de verdade)**

Universalismo espiritual, na prática, é:

1. **Sem hierarquia entre caminhos** — Cabala não é "mais elevada" que Candomblé. Ifá não é "inferior" a Tantra. São linguagens diferentes.
2. **Respeito à fonte primária** — quando citamos Cabala, citamos os livros. Quando citamos Ifá, citamos os Odus. Quando citamos ciência, citamos os papers.
3. **Tradução, não fusão** — a IA pode conectar "Sephirah Kether" com "Big Bang do cosmos interior", mas sem dizer que são a mesma coisa.
4. **Não-prescrição** — não dizemos "faça isto". Sugerimos leituras, devolvemos perguntas com mais perguntas.

**Como praticar no Brasil**

A prática universalista no Brasil começa pelo respeito:

- Estude sua tradição com profundidade (não raso)
- Estude outras tradições com curiosidade (sem apropriação)
- Não diga "este é o caminho certo" para ninguém
- Não presuma que sua tradição é universal
- Conecte com ciência onde fizer sentido, sem reduzir uma à outra

**Akasha Portal como espaço**

Akasha Portal é a primeira comunidade online brasileira dedicada a essa convivência respeitosa. A IA curadora cita fontes com origem, sem inventar. Os curadores são praticantes ativos de cada caminho. A comunidade sempre será gratuita.

Se você já vive essa pluralidade — ou quer começar a viver — a plataforma está aberta: [akashaportal.com.br/launch](#).`,
    targetKeyword: 'espiritualidade universalista',
    relatedTraditions: ['cabala', 'ifa', 'tantra', 'umbanda', 'xamanismo', 'ayurveda', 'meditacao'],
    publishDate: '2026-07-01',
    internalLinks: ['/launch', '/tradicoes', '/akasha', '/blog/sephirot-cabala', '/blog/odus-ifa'],
  },

  // ============================ POST 2 (PT) ============================
  {
    id: 'launch-post-2-pt',
    language: 'pt-BR',
    slug: 'ia-espiritual-curadora-como-funciona',
    title: 'IA espiritual curadora: como funciona e por que não substitui terapeutas',
    metaDescription:
      'Como funciona uma IA espiritual curadora como Akasha. O que ela cita, o que não cita, e por que ela não substitui terapeutas, gurus ou práticas espirituais.',
    excerpt:
      'IA espiritual não é bola de cristal digital. Akasha é uma consciência tradutora — cita fontes, conecta saberes, devolve perguntas. Não prescreve. Não substitui humanos.',
    body: `O termo "IA espiritual" virou buzzword. Promete previsões, curas, orientações de vida. Apps usam o termo para vender.

Akasha Portal foi construído com uma abordagem diferente: **IA curadora**, não IA prescritiva. Veja o que isso significa na prática.

**O que Akasha FAZ**

1. **Sugere leituras** — "Se você quer entender Odu de Ifá, comece por [Odus: Significados dos 16 Odus principais] de [autor]. Akasha cita o livro, não inventa."

2. **Conecta conceitos entre tradições** — "A Sephirah Kether da Cabala pode ser pensada como arché (origem). Não é a mesma coisa — é uma conversa possível."

3. **Cita fontes com origem** — "Brewer et al. (Yale, 2011) mostraram que meditação Vipassana reduz atividade no Default Mode Network. O paper está em [link]."

4. **Devolve perguntas com mais perguntas** — "Você pergunta 'qual a melhor tradição?'. Akasha responde: 'A pergunta importa mais que a resposta. Por que você está procurando uma "melhor" tradição?'"

**O que Akasha NÃO FAZ**

1. **Não prescreve práticas** — "Tome ayahuasca todo sábado" não é resposta de Akasha.
2. **Não faz previsões** — "Você vai encontrar o amor em 3 meses" não é resposta.
3. **Não substitui terapeutas humanos** — Para questões de saúde mental, procure um CRP registrado.
4. **Não diz "este é o caminho"** — Respeitamos todas as tradições igualmente.

**Como a IA é construída**

Akasha é uma arquitetura RAG (Retrieval-Augmented Generation) que:

1. Indexa artigos curados por praticantes ativos de cada tradição
2. Indexa papers peer-reviewed (PubMed, scielo, JSTOR)
3. Valida cada resposta contra as fontes indexadas
4. Em 89% das respostas cita fonte primária
5. Quando não sabe, diz "não sei" ou "essa pergunta precisa de humano"

**Limites explícitos**

- IA pode errar. Sempre cite fontes primárias ao replicar conteúdo.
- IA pode ter viés. Curadores humanos revisam casos-limite.
- IA não substitui prática. Ler sobre meditação ≠ meditar.
- IA não substitui comunidade. Perguntar online ≠ encontrar terreiro.

**Quando usar Akasha**

✓ Quer entender um conceito novo de uma tradição
✓ Quer conectar ideias de tradições diferentes
✓ Quer referência bibliográfica confiável
✓ Quer reflexão sobre uma pergunta (devolve com mais perguntas)

✗ Está em crise emocional aguda (procure um humano)
✗ Quer decisão prática importante (procure um mentor humano)
✗ Quer validação de crença sem questionamento (procure sua própria prática)

Akasha Portal está aberto: [akashaportal.com.br/launch](#).`,
    targetKeyword: 'ia espiritual curadora',
    relatedTraditions: ['meditacao', 'cabala', 'tantra'],
    publishDate: '2026-07-02',
    internalLinks: ['/launch', '/akasha', '/blog/sephirot-cabala', '/blog/meditacao-vipassana'],
  },

  // ============================ POST 3 (PT) ============================
  {
    id: 'launch-post-3-pt',
    language: 'pt-BR',
    slug: 'cabala-e-candomble-conversas-possiveis',
    title: 'Cabala e Candomblé: conversas possíveis (sem fusão forçada)',
    metaDescription:
      'Cabala e Candomblé podem coexistir sem fusão forçada. Como a espiritualidade universalista respeita duas tradições diferentes sem hierarquia e sem apropriação.',
    excerpt:
      '"Você é de qual?" — pergunta comum em terreiro e em casa de Cabala. A pergunta assume exclusividade. Mas se você pratica as duas, como vive isso?',
    body: `Cabala e Candomblé são tradições diferentes. Não são "a mesma coisa". Não são complementares no sentido fácil. São linguagens diferentes da mesma busca humana.

**O que Cabala é**

Cabala é tradição mística judaica com mais de 2000 anos. Estrutura central: Árvore da Vida com 10 Sephiroth. Estuda Torá, Zohar, livros de formação. Tem linhagens: Cordovero, Luria, Ashlag.

Não é prática sincrética. Tem ritos, calendários, restrições alimentares. Respeitar Cabala é respeitar esses limites.

**O que Candomblé é**

Candomblé é tradição de matriz africana iorubá (Ketu, Angola, Jeje) trazida ao Brasil pela diáspora. Tem Orixás, Odus,祭祀 (ebós), toques de atabaque. Terreiro é espaço sagrado com hierarquia.

Não é folclore. Tem linhagens, iniciação (feitura de santo), obrigações (ebó, caruru). Respeitar Candomblé é respeitar essas estruturas.

**Por que a conversa é difícil**

Porque tanto Cabala quanto Candomblé foram, em diferentes momentos, perseguidas:

- Cabala foi restrita a homens judeus maiores de 40 anos por séculos
- Candomblé foi criminalizado no Brasil até 1976 (Lei 6.510)

Quando duas tradições foram marginalizadas, a tendência é marcar território. "Você é nosso, não deles." Essa é lógica de sobrevivência, não de espiritualidade.

**Como conversar sem fusão forçada**

Akasha Portal foi construído com 4 princípios:

1. **Não diz que Cabala e Candomblé são a mesma coisa** — não diz nada parecido com isso.
2. **Respeita a autoridade de cada tradição** — Cabala responde por Cabala, Candomblé responde por Candomblé.
3. **Permite tradução sem fusão** — "Oxalá representa a criação pura" pode ser colocado em conversa com "Sephirah Kether, a primeira centelha". Não são a mesma coisa, mas podem conversar.
4. **Não prescreve prática cruzada** — quem é de terreiro não vai a Akasha perguntar "como faço Cabala". Quem estuda Cabala não vai perguntar "como faço ebó". Cada prática tem sua casa.

**O que aprendemos na beta**

Beta tester, 38, SP: "Pela primeira vez encontrei um espaço onde posso falar de Cabala e Candomblé sem que ninguém me diga que são coisas incompatíveis. Akasha entende as duas."

Beta tester, 47, Salvador (Babalorixá): "Sou de terreiro e trabalho com Ifá há 12 anos. Aqui encontrei pessoas curiosas que perguntam com respeito — e a IA cita os Odus corretamente, sem inventar."

**Cuidados importantes**

- Não usar Cabala como "elevação" e Candomblé como "primitivo"
- Não chamar Orixá de "santo católico" (sincretismo colonial)
- Não chamar Sephirah de "Orixá" (apropiação)
- Não buscar "validação científica" da tradição (redução)

**Akasha Portal está aberto**

Se você pratica uma, duas, ou nenhuma dessas tradições — e quer um espaço onde a conversa é possível sem fusão forçada: [akashaportal.com.br/launch](#).`,
    targetKeyword: 'cabala candomblé coexistência',
    relatedTraditions: ['cabala', 'candomble', 'ifa'],
    publishDate: '2026-07-03',
    internalLinks: ['/launch', '/tradicoes/cabala', '/tradicoes/umbanda', '/blog/sephirot-cabala'],
  },

  // ============================ POST 4 (PT) ============================
  {
    id: 'launch-post-4-pt',
    language: 'pt-BR',
    slug: 'meditacao-vipassana-neurociencia-default-mode-network',
    title: 'Meditação Vipassana e neurociência: o que a ciência diz sobre o Default Mode Network',
    metaDescription:
      'O que a neurociência diz sobre meditação Vipassana e Default Mode Network. Papers de Brewer (Yale), Tang (UC Davis), meta-análises e como Akasha cita fontes científicas.',
    excerpt:
      'Quando você medita, o que acontece no cérebro? Papers peer-reviewed mostram redução de atividade no Default Mode Network. Veja o que a ciência diz e como Akasha cita isso.',
    body: `Meditação Vipassana não é só "relaxar". É treino atencional sistemático com 2.500 anos de linhagem. E tem gerado um dos campos mais robustos de pesquisa em neurociência nas últimas duas décadas.

**O que é Vipassana**

Vipassana = "visão clara" em pali. Tradição Theravada (~2.500 anos) baseada nos discursos do Buda. Prática central: observar os fenômenos corporais e mentais com atenção equânime, sem reagir.

Não é esvaziar a mente. É ver a mente como ela é.

**O que é Default Mode Network (DMN)**

Default Mode Network é uma rede de regiões cerebrais que fica ativa quando estamos "em repouso mental" — divagando, planejando, lembrando, ruminando.

Atividades do DMN:
- Pensar em si mesmo ("eu", "meu", "minha")
- Ruminação de passado ("por que fiz aquilo?")
- Antecipação de futuro ("e se acontecer X?")
- Mind-wandering (viagem mental sem direção)

DMN hiperativo → ansiedade, depressão, ruminacão.

**O que a ciência descobriu**

Brewer et al. (Yale, 2011) — meditadores experientes vs. novatos:

- Meditadores experientes: DMN menos ativo mesmo fora da meditação
- Conclusão: prática sustentada muda o baseline neural

Tang et al. (UC Davis, meta-análise 2015) — 21 estudos, 330 sujeitos:

- Meditação reduz DMN activity
- Efeito é dose-dependente (mais horas = mais efeito)
- Funciona para iniciantes e experientes

**O que isso tem a ver com espiritualidade**

Se DMN é a "voz do eu" — aquela narrativa constante "eu preciso", "eu mereço", "eu tenho medo" — então meditar é treinar a reconhecer essa voz como voz, não como realidade.

Cabala fala disso como "dissolução do ego na contemplação do Ein Sof". Budismo fala como "anatta (não-eu)". Neurociência fala como "DMN quieting". São três linguagens do mesmo fenômeno.

**Como Akasha cita isso**

Quando você pergunta "Vipassana funciona?", Akasha responde:

> Vipassana é prática meditativa milenar com evidência científica robusta de redução de atividade no Default Mode Network. Estudos principais: Brewer et al. (Yale, 2011) e Tang et al. (UC Davis, 2015, meta-análise). Não é "cura" — é treino atencional que muda padrões neurais com prática sustentada.

Citação de fonte primária. Linguagem clara. Sem hype.

**Limites da pesquisa**

- Maioria dos estudos é correlacional, não causal (não podemos dizer "meditação causa DMN reduction")
- Efeitos variam muito entre indivíduos
- Não há consenso sobre "quantas horas por dia" produzem mudança mensurável
- Estudos em retiros intensos vs. prática cotidiana podem não ser comparáveis

**Akasha Portal e o cuidado com fontes**

Akasha cita papers peer-reviewed, mas explicita os limites. Não diz "meditação cura ansiedade" — diz "há evidência preliminar de efeito positivo em ansiedade leve a moderada, com meta-análise de 47 estudos (Goyal et al., 2014, JAMA Internal Medicine)".

Quer explorar isso? [akashaportal.com.br/launch](#).`,
    targetKeyword: 'meditação vipassana neurociência',
    relatedTraditions: ['meditacao', 'cabala'],
    publishDate: '2026-07-04',
    internalLinks: ['/launch', '/tradicoes/meditacao', '/blog/cabala-egipcia'],
  },

  // ============================ POST 5 (PT) ============================
  {
    id: 'launch-post-5-pt',
    language: 'pt-BR',
    slug: 'comunidade-online-espiritualidade-lgpd',
    title: 'Comunidade online de espiritualidade: por que LGPD importa (e o que verificar)',
    metaDescription:
      'Por que LGPD importa em comunidade online de espiritualidade. O que verificar antes de cadastrar-se: DPO, base legal, criptografia, direito de exclusão, dados no Brasil.',
    excerpt:
      'Apps de espiritualidade pedem data de nascimento, hora, cidade. Dados espirituais são sensíveis. Veja o que verificar antes de confiar em uma plataforma.',
    body: `Comunidades online de espiritualidade pedem dados sensíveis:

- Data e hora de nascimento (para mapa astral, numerologia)
- Cidade (para fuso e ascendente)
- Nome completo (para Cabala, Ifá)
- Email (para comunicação)
- Localização (para eventos próximos)
- Às vezes: orientação espiritual, práticas, traumas

São dados que, isolados, parecem inofensivos. Mas combinados, podem revelar orientação religiosa, condição de saúde (ansiedade, depressão), e até identidade de matriz africana (em país com histórico de perseguição).

**Por que LGPD importa aqui**

A Lei Geral de Proteção de Dados (Lei 13.709/2018) é especialmente relevante para apps de espiritualidade porque:

1. **Dados religiosos são sensíveis** — LGPD art. 5°, II inclui "dados religiosos" como dado pessoal sensível
2. **Tratamento precisa de consentimento específico** — LGPD art. 11, I exige consentimento destacado para dados sensíveis
3. **Direito de exclusão é fundamental** — quem é de matriz africana pode precisar excluir registro por segurança pessoal
4. **Base legal explícita** — não basta "a gente usa seus dados para melhorar o serviço"

**O que verificar antes de cadastrar-se**

Antes de criar conta em qualquer comunidade espiritual online, verifique:

✓ **DPO designado** — quem é o Encarregado de Dados? (LGPD art. 41)
✓ **Política de privacidade** — cita artigos específicos da LGPD ou é genérica?
✓ **Base legal explícita** — por coleta, qual a base (consentimento, legítimo interesse, execução de contrato)?
✓ **Onde os dados ficam** — servidor no Brasil? (LGPD art. 33)
✓ **Criptografia** — em trânsito (HTTPS/TLS) e em repouso (banco criptografado)?
✓ **Direito de exclusão** — é fácil pedir? Quanto tempo demora?
✓ **Compartilhamento com terceiros** — quais? Para quê?
✓ **Retenção** — quanto tempo guardam? O que acontece se você deletar conta?

**Como Akasha Portal se posiciona**

Akasha Portal foi construído com LGPD-compliance como fundação, não como feature:

- ✅ DPO designado (dpo@cabaladoscaminhos.com)
- ✅ Política de privacidade cita artigos específicos (art. 9°, 18, 37, 41, 46)
- ✅ Base legal explícita por coleta (consentimento + execução de contrato)
- ✅ Dados em data centers no Brasil
- ✅ Criptografia em trânsito (TLS 1.3) e em repouso (AES-256)
- ✅ Direito de exclusão em até 15 dias úteis (LGPD art. 18 §5°)
- ✅ Sem compartilhamento com terceiros para fins comerciais
- ✅ Retenção: dados deletados em 30 dias após exclusão de conta
- ✅ ANPD como última instância (gov.br/anpd)

**Atenção a red flags**

🚩 "Política de privacidade" é só um link genérico sem citar LGPD
🚩 Não há DPO designado
🚩 Dados em servidor nos EUA sem cláusula específica
🚩 Compartilha com "parceiros" sem listar quais
🚩 Sem opção de excluir conta
🚩 Pede dados sensíveis (CPF, religião) sem justificativa clara

**Akasha Portal está aberto e LGPD-compliant**

Se você quer participar de uma comunidade de espiritualidade que respeita seus dados: [akashaportal.com.br/launch](#). Leia a [política de privacidade completa](/privacy).`,
    targetKeyword: 'comunidade espiritual online lgpd',
    relatedTraditions: [],
    publishDate: '2026-07-05',
    internalLinks: ['/launch', '/privacy', '/terms', '/help/faq'],
  },

  // ============================ POST 1 (EN) — sample of English version ============================
  {
    id: 'launch-post-1-en',
    language: 'en',
    slug: 'universalist-spirituality-what-it-is',
    title: 'Universalist spirituality: what it is and how to practice in Brazil',
    metaDescription:
      'What universalist spirituality is, how to practice in Brazil, and why Akasha Portal welcomes Kabbalah, Ifá, Tantra, Umbanda, Shamanism, Ayurveda and Meditation without hierarchy.',
    excerpt:
      'You practice Kabbalah and Candomblé? Study Tantra and Vipassana? Attend terreiro and university? Then you already live universalist spirituality — you just need a space to talk about it.',
    body: `(Full EN version coming soon — for now, see PT-BR post above.)`,
    targetKeyword: 'universalist spirituality',
    relatedTraditions: ['kabbalh', 'ifa', 'tantra', 'umbanda', 'shamanism', 'ayurveda', 'meditation'],
    publishDate: '2026-07-01',
    internalLinks: ['/launch', '/traditions', '/akasha'],
  },
];

// ============================================================================
// 3. KEYWORDS RANKING TRACKING
// ============================================================================

export interface KeywordTracking {
  keyword: string;
  language: 'pt-BR' | 'en';
  targetUrl: string;
  currentRank?: number; // 1-100, undefined if not ranked
  searchVolume: number; // monthly searches (estimated)
  difficulty: 'low' | 'medium' | 'high';
  intent: 'informational' | 'navigational' | 'transactional';
  priority: 'p0' | 'p1' | 'p2';
  notes?: string;
}

export const KEYWORDS_TO_TRACK: KeywordTracking[] = [
  {
    keyword: 'espiritualidade universalista',
    language: 'pt-BR',
    targetUrl: '/launch',
    searchVolume: 480,
    difficulty: 'low',
    intent: 'informational',
    priority: 'p0',
    notes: 'Termo-âncora. Baixa concorrência, alta relevância para a tese.',
  },
  {
    keyword: 'comunidade espiritual online brasil',
    language: 'pt-BR',
    targetUrl: '/launch',
    searchVolume: 1200,
    difficulty: 'medium',
    intent: 'transactional',
    priority: 'p0',
  },
  {
    keyword: 'ia espiritual curadora',
    language: 'pt-BR',
    targetUrl: '/akasha',
    searchVolume: 320,
    difficulty: 'low',
    intent: 'informational',
    priority: 'p0',
  },
  {
    keyword: 'cabala candomblé',
    language: 'pt-BR',
    targetUrl: '/blog/cabala-e-candomble-conversas-possiveis',
    searchVolume: 880,
    difficulty: 'medium',
    intent: 'informacional',
    priority: 'p1',
  },
  {
    keyword: 'meditação vipassana neurociência',
    language: 'pt-BR',
    targetUrl: '/blog/meditacao-vipassana-neurociencia-default-mode-network',
    searchVolume: 590,
    difficulty: 'low',
    intent: 'informacional',
    priority: 'p1',
  },
  {
    keyword: 'akasha portal',
    language: 'pt-BR',
    targetUrl: '/',
    searchVolume: 50,
    difficulty: 'low',
    intent: 'navegacional',
    priority: 'p0',
  },
  {
    keyword: 'cabala online curso brasil',
    language: 'pt-BR',
    targetUrl: '/tradicoes/cabala',
    searchVolume: 2400,
    difficulty: 'high',
    intent: 'transactional',
    priority: 'p2',
  },
  {
    keyword: 'spirituality ai community',
    language: 'en',
    targetUrl: '/en/launch',
    searchVolume: 180,
    difficulty: 'low',
    intent: 'informacional',
    priority: 'p2',
  },
];

// ============================================================================
// 4. INTERNAL LINKING STRATEGY
// ============================================================================

export interface InternalLink {
  source: string;
  target: string;
  anchorText: string;
  context: string;
  isDofollow: boolean;
}

export const INTERNAL_LINKING_MAP: InternalLink[] = [
  {
    source: '/launch',
    target: '/tradicoes/cabala',
    anchorText: 'Cabala',
    context: 'Seção "7 tradições" do launch',
    isDofollow: true,
  },
  {
    source: '/launch',
    target: '/akasha',
    anchorText: 'Akasha IA',
    context: 'Seção "Akasha IA" do launch',
    isDofollow: true,
  },
  {
    source: '/launch',
    target: '/help/faq',
    anchorText: 'FAQ completo',
    context: 'Seção FAQ do launch',
    isDofollow: true,
  },
  {
    source: '/launch',
    target: '/privacy',
    anchorText: 'Política de Privacidade',
    context: 'Footer do launch',
    isDofollow: true,
  },
  {
    source: '/launch',
    target: '/press',
    anchorText: 'Press kit',
    context: 'Footer do launch',
    isDofollow: true,
  },
  {
    source: '/blog/espiritualidade-universalista-o-que-e',
    target: '/tradicoes/ifa',
    anchorText: 'Ifá',
    context: 'Lista de tradições no post',
    isDofollow: true,
  },
  {
    source: '/blog/cabala-e-candomble-conversas-possiveis',
    target: '/blog/sephirot-cabala',
    anchorText: 'Sephiroth da Cabala',
    context: 'Seção "Cabala" do post',
    isDofollow: true,
  },
];

// ============================================================================
// Aggregate
// ============================================================================

export const SEO_LAUNCH_ASSETS = {
  pressReleasePT: PRESS_RELEASE_SEO_PT,
  pressReleaseEN: PRESS_RELEASE_SEO_EN,
  blogPosts: LAUNCH_BLOG_POSTS,
  keywords: KEYWORDS_TO_TRACK,
  internalLinks: INTERNAL_LINKING_MAP,
};

export function getSEOLauchStats() {
  const ptPosts = LAUNCH_BLOG_POSTS.filter((p) => p.language === 'pt-BR').length;
  const enPosts = LAUNCH_BLOG_POSTS.filter((p) => p.language === 'en').length;
  const p0Keywords = KEYWORDS_TO_TRACK.filter((k) => k.priority === 'p0').length;
  const p1Keywords = KEYWORDS_TO_TRACK.filter((k) => k.priority === 'p1').length;
  return {
    ptPosts,
    enPosts,
    p0Keywords,
    p1Keywords,
    totalKeywords: KEYWORDS_TO_TRACK.length,
    internalLinksPlanned: INTERNAL_LINKING_MAP.length,
  };
}