# Documento 07 — Épicos & User Stories
## Cabala dos Caminhos

> **Versão:** 1.0 | **Metodologia:** Scrum/Kanban  
> **Formato de Story:** "Como [ator], quero [ação], para [valor/resultado]."

---

## Mapa dos Épicos

| ID | Épico | Prioridade | Stories |
|---|---|---|---|
| E1 | Fundação e Infraestrutura | 🔴 Crítica | S1.1 a S1.4 |
| E2 | Gestão de Consulentes e Motores de Cálculo | 🔴 Crítica | S2.1 a S2.5 |
| E3 | Interface da Mesa Real (Cockpit) | 🔴 Crítica | S3.1 a S3.5 |
| E4 | Motor de IA e Geração do Dossiê | 🔴 Crítica | S4.1 a S4.4 |
| E5 | Exportação de PDF e Entrega | 🟡 Alta | S5.1 a S5.2 |
| E6 | Histórico e Dashboard | 🟡 Alta | S6.1 a S6.3 |
| E7 | Refinamentos de UX e Performance | 🟢 Média | S7.1 a S7.3 |
| E8 | Consulta Interativa (Q&A) — *Fase 2* | 🟡 Alta | S8.1 a S8.3 |

> **Identidade visual:** todas as stories de UI seguem a paleta v2 (laranja + azul royal) do **Doc 13**. Toda referência a "âmbar/dourado/esmeralda" foi migrada.

---

## ÉPICO 1 — Fundação e Infraestrutura

**Objetivo:** Ter o projeto rodando localmente e em produção com autenticação funcional.

---

### S1.1 — Setup do Projeto Base

**Story:** Como desenvolvedor, quero inicializar o projeto Next.js com toda a stack definida, para que o ambiente de desenvolvimento esteja 100% configurado e pronto para codificação de features.

**Tarefas Técnicas:**
- [ ] Criar projeto Next.js 14 com App Router e TypeScript strict
- [ ] Instalar e configurar Tailwind CSS
- [ ] Instalar e configurar Shadcn/ui (componentes: Button, Input, Select, Command, Popover, Dialog, Badge, Toast, Sheet, Table, Card)
- [ ] Instalar Zustand, React Hook Form, Zod
- [ ] Configurar `tsconfig.json` com path aliases (`@/` para `src/`)
- [ ] Criar estrutura de diretórios conforme Documento 03
- [ ] Configurar `.env.local` e `.env.example`
- [ ] Configurar fontes (Cinzel, Cormorant Garamond, JetBrains Mono, Lora) via `next/font` ou Google Fonts

**Critérios de Aceitação:**
- [ ] `npm run dev` roda sem erros
- [ ] `npm run build` compila sem erros de TypeScript
- [ ] Tailwind aplicando estilos corretamente
- [ ] Importações com `@/` resolvendo corretamente
- [ ] Fontes carregadas e visíveis em uma página de teste

---

### S1.2 — Banco de Dados e Prisma

**Story:** Como desenvolvedor, quero configurar o banco de dados PostgreSQL com Prisma e aplicar o schema, para que o sistema tenha persistência de dados estruturada.

**Tarefas Técnicas:**
- [ ] Configurar `DATABASE_URL` no `.env.local` (Supabase ou Neon)
- [ ] Criar `prisma/schema.prisma` exatamente conforme Documento 04
- [ ] Rodar `npx prisma migrate dev --name init`
- [ ] Rodar `npx prisma generate`
- [ ] Criar `src/lib/prisma.ts` como singleton do PrismaClient
- [ ] Criar `prisma/seed.ts` com o usuário admin inicial
- [ ] Rodar `npx prisma db seed` para criar o usuário

**Critérios de Aceitação:**
- [ ] Todas as 4 tabelas (User, Client, Reading, Report) criadas no banco
- [ ] `npx prisma studio` mostra as tabelas sem erros
- [ ] Usuário admin criado e visível no Prisma Studio
- [ ] Singleton do PrismaClient funcional em Server Components

---

### S1.3 — Autenticação com NextAuth

**Story:** Como operador do sistema, quero fazer login com e-mail e senha, para que o acesso ao sistema seja restrito a mim.

**Tarefas Técnicas:**
- [ ] Instalar e configurar NextAuth.js com CredentialsProvider
- [ ] Criar `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Configurar `NEXTAUTH_SECRET` e `NEXTAUTH_URL` no `.env`
- [ ] Criar a tela de login `/login` (design: dark mode, logo centralizado, formulário minimalista)
- [ ] Criar `src/middleware.ts` protegendo todas as rotas `/dashboard/*`
- [ ] Implementar hash de senhas com bcryptjs no login

**Critérios de Aceitação:**
- [ ] Login com credenciais corretas redireciona para `/dashboard`
- [ ] Login com credenciais erradas exibe toast de erro
- [ ] Acessar `/dashboard` sem sessão redireciona para `/login`
- [ ] Sessão persiste após refresh da página
- [ ] Botão de logout funcional na sidebar

---

### S1.4 — Layout Base do Dashboard

**Story:** Como operador, quero ver um layout consistente com sidebar de navegação em todas as telas do dashboard, para que a navegação seja intuitiva e rápida.

**Tarefas Técnicas:**
- [ ] Criar `src/app/(dashboard)/layout.tsx` com a sidebar fixa e área de conteúdo
- [ ] Criar `src/components/layout/Sidebar.tsx` com os itens de navegação
- [ ] Criar `src/components/layout/Topbar.tsx` com título dinâmico da página
- [ ] Aplicar o design system (cores, fontes) conforme Documento 05
- [ ] Garantir que o layout ocupa 100% da viewport sem scroll desnecessário

**Critérios de Aceitação:**
- [ ] Sidebar visível e fixa em todas as telas do dashboard
- [ ] Links da sidebar navegam para as páginas corretas
- [ ] Rota ativa na sidebar tem destaque visual (active state)
- [ ] Layout responsivo: sidebar colapsa em telas `<1024px`

---

## ÉPICO 2 — Gestão de Consulentes e Motores de Cálculo

**Objetivo:** Permitir cadastrar consulentes e calcular automaticamente todos os mapas natais.

---

### S2.1 — Formulário de Cadastro de Consulente

**Story:** Como operador, quero cadastrar um novo consulente preenchendo seus dados de nascimento, para que o sistema possa calcular os mapas e armazená-los.

**Tarefas Técnicas:**
- [ ] Criar página `/dashboard/clientes/novo`
- [ ] Criar `ClientForm.tsx` com React Hook Form + Zod validation
- [ ] Implementar campo de cidade com Google Places Autocomplete (ou Nominatim gratuito)
- [ ] A seleção de cidade deve preencher automaticamente: estado, país, latitude, longitude e timezone
- [ ] Criar Server Action `createClient()` que recebe os dados do form
- [ ] A action deve chamar todos os motores de cálculo antes de salvar no Prisma

**Schema Zod do Formulário:**
```typescript
const clientSchema = z.object({
  fullName: z.string().min(5, "Nome muito curto").max(150),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora no formato HH:MM"),
  birthCity: z.string().min(2),
  birthState: z.string().min(2),
  birthCountry: z.string().min(2),
  birthLatitude: z.number().optional(),
  birthLongitude: z.number().optional(),
  birthTimezone: z.string().optional(),
  notes: z.string().optional(),
});
```

**Critérios de Aceitação:**
- [ ] Todos os campos obrigatórios têm validação visual em tempo real
- [ ] Seleção de cidade preenche automaticamente estado, país e coordenadas
- [ ] Submit sem campo obrigatório exibe mensagem de erro específica
- [ ] Após salvar com sucesso, redireciona para `/dashboard/clientes/[id]` com toast de sucesso
- [ ] O perfil do cliente exibe todos os mapas calculados

---

### S2.2 — Motor de Numerologia Cabalística

**Story:** Como sistema, quero calcular os números cabalísticos a partir do nome e data de nascimento, para que os dados sejam usados nas correlações com a Mesa Real.

**Tarefas Técnicas:** *(fórmulas, tabelas e regras de borda exatas no **Doc 11 §1–§2**)*
- [ ] Criar `src/lib/calculators/numerology-kabalah.ts`
- [ ] Implementar a tabela de conversão alfanumérica conforme **Doc 11 §2.1** (default Pitagórico — sujeito a D1)
- [ ] Implementar a normalização de nomes (acentos, Ç, Y, hífen) conforme **Doc 11 §2.2**
- [ ] Implementar `reduceToSingleDigit(n, keepMasters)` conforme **Doc 11 §1** (preserva 11/22/33 nos campos certos)
- [ ] Implementar `calculateLifePath`, `calculateExpression`, `calculateMotivation` (vogais), `calculateImpression` (consoantes), `calculateMission`, `calculateNativeDayGifts`
- [ ] Implementar `calculateChallenges` e `calculatePinnacles` (Doc 11 §2.5–§2.6) — *Pináculos novos (G3)*
- [ ] Implementar `calculateKarmicLessons` (ausentes no nome) e `calculateKarmaicDebts` (13/14/16/19) — *distintos (G3)*
- [ ] Implementar `calculatePersonalCycles(birthDate, refDate)` → `{ personalYear, personalMonth, personalDay }` — *novo, volátil, calculado sob demanda (G3)*
- [ ] Implementar `calculateRulingArcana` (correspondência com o Tarô) — *novo (G3)*
- [ ] Criar função agregadora `buildKabalisticMap(fullName, date): KabalisticMap`
- [ ] Criar testes unitários para os casos resolvidos do **Doc 11 §2.7**

**Critérios de Aceitação:**
- [ ] Para "20/08/1986": Caminho de Vida = 7 (Doc 11 §2.7)
- [ ] Redução de números mestres (11, 22, 33) preserva nos campos de identidade e reduz nos cíclicos (Doc 11 §1.1)
- [ ] Função de vogais identifica A, E, I, O, U após normalização de acentos (Doc 11 §2.2–§2.3)
- [ ] `impression`, `karmicLessons`, `pinnacles` e `personalCycles` presentes no mapa
- [ ] Pontos sujeitos a D1 sinalizados como provisórios até validação do operador

---

### S2.3 — Motor de Numerologia Tântrica

**Story:** Como sistema, quero calcular os números tântricos a partir da data de nascimento, para complementar o perfil de cada consulente com os corpos energéticos tântricos.

**Tarefas Técnicas:** *(fórmulas exatas no **Doc 11 §3**; resolve o conflito de rótulos da G3/D2)*
- [ ] Criar `src/lib/calculators/numerology-tantric.ts`
- [ ] Implementar a constante `TANTRIC_BODIES` (11 corpos explícitos, Doc 11 §3.2 / Doc 04)
- [ ] Calcular `soul`: reduzir o DIA de nascimento (ex: 20 → 2)
- [ ] Calcular `karma`: reduzir o MÊS de nascimento (ex: 08 → 8)
- [ ] Calcular `divineGift`: reduzir os **DOIS ÚLTIMOS dígitos do ano** (ex: 1986 → 86 → 14 → 5)
- [ ] Calcular `destiny`: somar os 4 dígitos do ano e reduzir (ex: 1+9+8+6=24 → 6)
- [ ] Calcular `tantricPath` (Caminho Total): soma de dia+mês+ano completo reduzida (ex: 2014 → 7)
- [ ] Associar cada número ao seu corpo tântrico (`*Body` + `*Description`)
- [ ] Criar função agregadora `buildTantricMap(date): TantricMap`

**Critérios de Aceitação:**
- [ ] Para data "20/08/1986": soul=2, karma=8, divineGift=5, destiny=6, tantricPath=7 (Doc 11 §3.3)
- [ ] `divineGift` ≠ `destiny` ≠ `tantricPath` (rótulos resolvidos — G3)
- [ ] Cada número vem acompanhado da descrição do seu corpo tântrico
- [ ] Os 11 corpos expostos como estrutura nomeada imutável, não dicionário genérico

---

### S2.4 — Motor de Astrologia (Integração com API)

**Story:** Como sistema, quero calcular o mapa astral completo a partir da data, hora e local de nascimento, para que os aspectos astrológicos possam ser cruzados com as casas da Mesa Real.

**Tarefas Técnicas:**
- [ ] Pesquisar e selecionar API de astrologia (sugestão: Astro-seek API, Astrology API, ou `astronomia` npm package)
- [ ] Criar `src/lib/astrology/ephemeris.ts` com a integração
- [ ] Implementar função `calculateAstrologyMap(date, time, lat, lng, timezone): AstrologyMap`
- [ ] O resultado deve incluir: Sun, Moon, Ascendente, 10 planetas, Quíron, Lilith, Nodos, 12 Casas e planetas em casas
- [ ] Computar `elements` (fogo/terra/ar/água) e `modalities` (cardinal/fixo/mutável) — *novo (G3)*
- [ ] Rotular cada aspecto com `nature: "harmony" | "tension"` — *novo (G3)*
- [ ] Criar fallback: se a API falhar, retornar objeto parcial com campos disponíveis

> **Odu de Nascimento (S2.4b):** implementar `calculateBirthOdu(date)` conforme **Doc 11 §4**. Até a tabela de linhagem (D3) ser definida, usar o algoritmo default provisório e marcar `oduBirth.provisional = true`.
- [ ] Cache do resultado no campo `astrologyMap` do Client (nunca recalcular)

**Critérios de Aceitação:**
- [ ] Para data "20/08/1986 XX:XX Lugar": Sol em Leão
- [ ] Ascendente calculado apenas quando hora E coordenadas são fornecidas
- [ ] Se hora não fornecida, Ascendente e Casas ficam `null` com flag `incomplete: true`
- [ ] Erro de API retorna dados parciais, não quebra o fluxo de cadastro

---

### S2.5 — Listagem e Perfil de Consulentes

**Story:** Como operador, quero ver a lista de todos os consulentes e acessar o perfil de cada um, para gerenciar minha base de clientes.

**Tarefas Técnicas:**
- [ ] Criar página `/dashboard/clientes` com tabela (nome, data nasc, última consulta, ações)
- [ ] Implementar busca por nome em tempo real (debounce de 300ms)
- [ ] Criar página `/dashboard/clientes/[id]` com o perfil completo
- [ ] Exibir badges dos mapas calculados (conforme Documento 05, Seção 4.2)
- [ ] Seção "Histórico de Leituras" com data, status e link para o dossiê
- [ ] Botão "Nova Consulta" pré-carregando o cliente na tela do Cockpit

**Critérios de Aceitação:**
- [ ] Tabela renderiza sem erro para 0 e para 100+ consulentes
- [ ] Busca por nome filtra em tempo real sem reload de página
- [ ] Badges de mapas exibem os dados corretos
- [ ] Histórico de leituras ordenado do mais recente ao mais antigo

---

## ÉPICO 3 — Interface da Mesa Real (O Cockpit)

**Objetivo:** Construir o grid 9×4 interativo para o terapeuta preencher a tiragem.

---

### S3.1 — Grid 9×4 Estático

**Story:** Como operador, quero ver uma matriz visual de 9 colunas por 4 linhas com os 36 slots numerados, para que a interface simule o pano da Mesa Real.

**Tarefas Técnicas:**
- [ ] Criar `src/components/mesa-real/MesaRealGrid.tsx` como Client Component
- [ ] Renderizar 36 slots usando CSS Grid `grid-cols-9`
- [ ] Cada slot exibe: número da casa, nome da casa, estado de preenchimento
- [ ] Criar `src/lib/constants/lenormand-cards.ts` e `odus.ts`
- [ ] Inicializar o Zustand store `mesa-real-store.ts`
- [ ] Criar `src/app/(dashboard)/nova-consulta/page.tsx`

**Critérios de Aceitação:**
- [ ] 36 slots visíveis simultaneamente em 1280px sem scroll vertical
- [ ] Numeração de 1 a 36 na ordem correta (conforme tabela do PRD)
- [ ] Nomes das casas exibidos corretamente em cada slot
- [ ] Layout responsivo sem quebrar em 1024px

---

### S3.2 — Seleção de Consulente no Cockpit

**Story:** Como operador, quero buscar e selecionar o consulente no painel lateral do Cockpit antes de iniciar o preenchimento, para que os mapas natais sejam carregados e disponíveis para o cruzamento.

**Tarefas Técnicas:**
- [ ] Criar `ClientSearchCombobox.tsx` com busca typeahead via Server Action
- [ ] Ao selecionar o cliente, carregar e exibir os badges dos mapas (Seção 4.2 do Doc 05)
- [ ] Armazenar o `clientId` selecionado no Zustand store
- [ ] Se nenhum consulente selecionado, botão "Gerar Dossiê" permanece desabilitado

**Critérios de Aceitação:**
- [ ] Busca retorna resultados em menos de 500ms
- [ ] Ao selecionar cliente, badges aparecem instantaneamente no painel
- [ ] Trocar de cliente limpa o grid e carrega os novos dados

---

### S3.3 — Popover de Input (Carta + Odu)

**Story:** Como operador, quero clicar em um slot e ver um popover contextual para selecionar a carta e o Odu rapidamente, para que eu preencha a mesa sem interromper o fluxo do atendimento.

**Tarefas Técnicas:**
- [ ] Criar `CasaPopover.tsx` usando Shadcn Popover + Radix Portal
- [ ] Criar `CartaCombobox.tsx` com lista das 36 cartas e busca por número ou nome
- [ ] Criar `OduCombobox.tsx` com lista dos 16 Odus e busca por número, nome ou Orixá
- [ ] Ao confirmar: atualizar Zustand store, fechar Popover, animar slot para estado preenchido
- [ ] Tecla Enter confirma. Tecla Esc cancela e fecha.
- [ ] Slot preenchido ao clicar reabre o Popover com valores já selecionados para edição

**Critérios de Aceitação:**
- [ ] Popover abre em menos de 100ms
- [ ] ComboBox de carta filtra corretamente por número e nome
- [ ] ComboBox de Odu filtra por número, nome e Orixá
- [ ] Após confirmar, slot atualiza visualmente sem re-render de todo o grid
- [ ] Popover não cobre mais de 30% do grid simultaneamente
- [ ] Funciona com teclado: Tab entre campos, Enter confirma

---

### S3.4 — Gerenciamento de Estado do Grid (Zustand)

**Story:** Como sistema, preciso que o estado da matrix da Mesa Real seja gerenciado de forma eficiente, para que o grid não cause travamentos mesmo ao preencher as 36 casas rapidamente.

**Tarefas Técnicas:**

```typescript
// src/store/mesa-real-store.ts
interface MesaRealStore {
  selectedClientId: string | null;
  selectedClient: Client | null;
  matrixData: MatrixData;

  setClient: (client: Client) => void;
  setHouseData: (house: number, carta: number, odu: number) => void;
  clearHouse: (house: number) => void;
  clearAll: () => void;
  getFilledCount: () => number;
}
```

**Critérios de Aceitação:**
- [ ] `setHouseData` atualiza apenas o slot clicado, sem re-render dos outros 35
- [ ] `clearAll` limpa o grid com confirmação e toast
- [ ] Estado persiste durante toda a sessão (não perde ao navegar para outra aba e voltar)
- [ ] `getFilledCount` retorna o número correto de casas preenchidas

---

### S3.5 — Indicador de Progresso e Ações Globais

**Story:** Como operador, quero ver quantas casas já foram preenchidas e ter acesso a ações globais do grid, para gerenciar o estado da tiragem durante o atendimento.

**Tarefas Técnicas:**
- [ ] Implementar counter "X/36 casas preenchidas" na área central
- [ ] Implementar botão "Limpar Mesa" com Dialog de confirmação
- [ ] Botão "Gerar Dossiê" ativa quando ≥1 casa preenchida e cliente selecionado
- [ ] Quando todas as 36 casas preenchidas, botão pulsa em **laranja** (CSS animation) — *paleta v2, Doc 13*

**Critérios de Aceitação:**
- [ ] Counter atualiza instantaneamente ao preencher/limpar qualquer slot
- [ ] Dialog de confirmação do "Limpar Mesa" exige clicar "Confirmar"
- [ ] Botão "Gerar Dossiê" tem estado visual disabled claramente diferente do ativo

---

## ÉPICO 4 — Motor de IA e Geração do Dossiê

**Objetivo:** Conectar o sistema ao LLM e gerar o dossiê interpretativo personalizado.

---

### S4.1 — API Route `/api/generate-dossier`

**Story:** Como sistema, preciso de uma API Route que receba os dados da consulta e orquestre o processamento pelo LLM, para gerar o dossiê de forma segura no servidor.

**Tarefas Técnicas:**
- [ ] Criar `src/app/api/generate-dossier/route.ts` (POST)
- [ ] Validar o body com Zod: `{ clientId: string, matrixData: MatrixData }`
- [ ] Buscar o `Client` no Prisma com todos os campos `Json` dos mapas
- [ ] Instanciar `PromptBuilder.buildFullPayload(client, matrixData)`
- [ ] Chamar `generateDossier(payload)` do `llm-client.ts` com streaming
- [ ] Criar `Reading` no Prisma com status GENERATING
- [ ] Ao finalizar stream: criar `Report` e atualizar `Reading` para COMPLETED
- [ ] Retornar o stream diretamente para o frontend (Server-Sent Events)

**Critérios de Aceitação:**
- [ ] Rota protegida — retorna 401 sem sessão válida
- [ ] Validação de body retorna 400 com mensagens de erro claras
- [ ] Stream começa em menos de 3 segundos após o disparo
- [ ] `Reading` e `Report` criados corretamente no banco ao finalizar
- [ ] Em caso de erro do LLM, `Reading` atualizado para ERROR e frontend notificado

---

### S4.2 — Implementação do PromptBuilder

**Story:** Como sistema, preciso que o PromptBuilder construa payloads precisos para cada casa usando a Matriz de Correlação, para que o LLM receba apenas os dados relevantes a cada área da vida.

**Tarefas Técnicas:**
- [ ] Criar `src/lib/ai/correlation-map.ts` com os 36 entradas (conforme Doc 06, Seção 2)
- [ ] Criar `src/lib/ai/prompt-builder.ts` (conforme Doc 06, Seção 3.2)
- [ ] Criar `src/lib/ai/llm-client.ts` (conforme Doc 06, Seção 3.3)
- [ ] Criar `src/lib/constants/lenormand-cards.ts` (conforme Doc 04, Seção 5.1)
- [ ] Criar `src/lib/constants/odus.ts` (conforme Doc 04, Seção 5.2)
- [ ] Enriquecer cada casa no payload com keywords da carta e essência do Odu

**Critérios de Aceitação:**
- [ ] `buildHousePayload(1, entry, client)` retorna dados do Ascendente e Número de Alma
- [ ] `buildHousePayload(34, entry, client)` retorna dados da 2ª Casa e Karma Tântrico
- [ ] Nenhuma casa retorna campos `undefined` ou `null` sem fallback textual
- [ ] O payload total para 36 casas não ultrapassa 8000 tokens

---

### S4.3 — Visualização com Streaming do Dossiê

**Story:** Como operador, quero ver o dossiê sendo gerado em tempo real na tela, para que o atendimento seja dinâmico e eu possa acompanhar a interpretação sendo construída.

**Tarefas Técnicas:**
- [ ] Criar `src/components/mesa-real/DossierViewer.tsx`
- [ ] Usar `useEffect` + `ReadableStream` para consumir o SSE da API
- [ ] Renderizar o Markdown acumulado usando `react-markdown` + `remark-gfm`
- [ ] Aplicar estilos CSS customizados ao Markdown renderizado (tipografia Lora, cores **laranja/azul royal** — Doc 13)
- [ ] Exibir animação de loading enquanto o stream não começa
- [ ] Scroll automático conforme o texto vai sendo gerado
- [ ] Botão "Parar Geração" (cancela o stream se necessário)

**Critérios de Aceitação:**
- [ ] Texto aparece token a token com efeito de máquina de escrever
- [ ] Títulos das casas (h2 em Markdown) renderizam em **laranja** (`#F97316`) com fonte Cinzel
- [ ] Tags de carta/Odu (*Carta: X | Odu: Y*) renderizam em **azul royal** (`#3B5BDB`)
- [ ] Scroll automático sem travar a tela
- [ ] Ao completar, exibe toast "Dossiê gerado com sucesso" e ativa botão de PDF

---

### S4.4 — Sistema de Prompt (System Prompt e Instrução Final)

**Story:** Como sistema, preciso que o LLM siga rigorosamente a estrutura de 3 parágrafos por casa e os 4 capítulos da síntese, para que todos os dossiês tenham qualidade e profundidade consistentes.

**Tarefas Técnicas:**
- [ ] Implementar o System Prompt conforme Doc 06, Seção 3.2 (`buildSystemPrompt()`)
- [ ] Incluir exemplos few-shot no System Prompt para calibrar o tom e a profundidade
- [ ] Configurar temperatura do LLM: 0.7 (criativo mas consistente)
- [ ] Configurar `max_tokens`: 8000 para cobrir 36 casas + síntese
- [ ] Testar com 5, 10 e 36 casas preenchidas para validar qualidade

**Critérios de Aceitação:**
- [ ] Cada casa gerada tem os 3 parágrafos obrigatórios (O Terreno, O Evento, A Direção)
- [ ] Síntese final tem os 4 capítulos e o Veredito Final
- [ ] Nenhuma casa genérica — cada uma menciona os dados específicos do consulente
- [ ] Tom: direto, profundo, não usa jargões soltos sem explicação

---

## ÉPICO 5 — Exportação de PDF

**Objetivo:** Gerar o dossiê em PDF elegante para entrega ao consulente.

---

### S5.1 — Template do PDF

**Story:** Como operador, quero exportar o dossiê gerado para PDF, para que eu possa entregar um documento impresso ou digital ao meu cliente.

**Tarefas Técnicas:**
- [ ] Instalar `@react-pdf/renderer` (ou configurar Puppeteer)
- [ ] Criar `src/lib/pdf/dossier-template.tsx` com o layout do PDF
- [ ] Capa: logo, nome do consulente, data da consulta, frase de abertura
- [ ] Página 2: Resumo dos mapas natais (tabela)
- [ ] Páginas seguintes: cada casa em seção dedicada
- [ ] Última página: Síntese Final e Veredito
- [ ] Criar API Route `POST /api/generate-pdf` que recebe o `reportId` e retorna o PDF

**Critérios de Aceitação:**
- [ ] PDF gerado em menos de 15 segundos
- [ ] PDF tem no mínimo A4, margens adequadas, tipografia legível
- [ ] Download disparado automaticamente no browser ao clicar "Exportar PDF"
- [ ] Nome do arquivo: `Dossie_[NomeCliente]_[Data].pdf`

---

### S5.2 — Armazenamento do PDF

**Story:** Como sistema, preciso salvar os PDFs gerados em storage cloud, para que o operador possa baixá-los novamente no histórico.

**Tarefas Técnicas:**
- [ ] Configurar Vercel Blob (ou AWS S3)
- [ ] Upload automático após geração
- [ ] Salvar URL no campo `pdfUrl` do modelo `Report`
- [ ] Exibir link de download no histórico de leituras

---

## ÉPICO 6 — Histórico e Dashboard

---

### S6.1 — Dashboard Principal (`/dashboard`)
- Cards com métricas do mês
- Tabela das últimas 10 leituras com status e ações
- Botão de atalho "Nova Consulta"

### S6.2 — Histórico de Leituras por Cliente
- Lista de todas as leituras de um consulente com data e status
- Clicar abre o dossiê em modo somente leitura
- Download do PDF disponível para leituras com status COMPLETED

### S6.3 — Visualização de Dossiê Salvo (`/dashboard/leituras/[id]`)
- Renderiza o `Report.content` como Markdown
- Exibe os dados da matriz que gerou aquele dossiê
- Botão para exportar PDF novamente se `pdfUrl` estiver nulo

---

## ÉPICO 7 — Refinamentos de UX e Performance

---

### S7.1 — Micro-interações do Grid
- Animação de transição slot vazio → preenchido
- Pulse no botão "Gerar Dossiê" quando todas as casas preenchidas
- Glow effect nos slots preenchidos

### S7.2 — Atalhos de Teclado no Cockpit
- `Ctrl+N`: abre nova consulta
- `Ctrl+G`: dispara geração do dossiê
- `Esc` em qualquer modal/popover: fecha

### S7.3 — Tratamento de Erros e Estados de Borda
- Toast de erro com mensagem amigável para falhas de API
- Estado de loading consistente em todos os botões assíncronos
- Mensagem de "Nenhum consulente cadastrado" na tela de nova consulta com CTA para cadastrar

---

## ÉPICO 8 — Consulta Interativa (Q&A) — *Fase 2*

**Objetivo:** Permitir perguntas abertas sobre uma leitura, roteadas deterministicamente e ancoradas no dossiê. Especificação completa no **Doc 12**.

---

### S8.1 — Modelo de Dados e Roteador de Temas

**Story:** Como sistema, preciso persistir conversas ancoradas numa leitura e rotear perguntas abertas para as casas certas, para responder sem sair do contexto da leitura.

**Tarefas Técnicas:**
- [ ] Adicionar modelos `Consultation` + `ChatMessage` + enum `ChatRole` ao schema (Doc 04) e migrar
- [ ] Implementar `lib/ai/theme-router.ts` com a taxonomia `tema → casas + aspectos` (Doc 12 §4)
- [ ] Classificação estruturada (LLM `temperature: 0`, saída validada por Zod) → `{ themes, houses }`
- [ ] Fallback para tema `geral` quando confiança baixa

**Critérios de Aceitação:**
- [ ] Pergunta sobre amor roteia para a Casa 24 (+ Vênus/Lua); sobre dinheiro, Casa 34 (+ 2ª)
- [ ] Mesma pergunta + mesma leitura → mesmas casas (determinístico)

---

### S8.2 — API `/api/consult` com RAG Fechado

**Story:** Como operador, quero perguntar ao Oráculo sobre uma leitura e receber resposta em streaming ancorada só no que foi tirado.

**Tarefas Técnicas:**
- [ ] Criar `src/app/api/consult/route.ts` (POST, streaming) — pipeline do Doc 12 §7
- [ ] Montar o contexto RAG fechado (dossiê + mapas + casas roteadas), Doc 12 §5
- [ ] Aplicar a persona/guarda-corpos de consulta (Doc 12 §6)
- [ ] Persistir mensagens `USER`/`ORACLE` com `routedThemes`/`routedHouses`

**Critérios de Aceitação:**
- [ ] 401 sem sessão; 400 com body inválido
- [ ] Resposta nunca cita carta/Odu fora da `matrixData`; nunca contradiz o dossiê
- [ ] Determinações médicas/jurídicas/financeiras categóricas são recusadas e reformuladas como tendência
- [ ] Streaming começa em < 3s

---

### S8.3 — Tela "Consultar o Oráculo"

**Story:** Como operador, quero um chat sobre a leitura, para aprofundar pontos com o consulente em tempo real.

**Tarefas Técnicas:**
- [ ] Criar a tela de chat conforme **Doc 05 §9** (bolhas laranja/royal, tipografia Lora)
- [ ] Exibir chips de transparência do roteamento (casas consultadas) por resposta
- [ ] Streaming token a token; input fixo no rodapé com botão "Enviar" (laranja)

**Critérios de Aceitação:**
- [ ] Acessível a partir de `/dashboard/leituras/[id]`
- [ ] Cada resposta do Oráculo mostra as casas consultadas
- [ ] Histórico da conversa persistido e recarregável
