# Documento 02 — PRD (Product Requirements Document)
## Cabala dos Caminhos

> **Versão:** 1.0 | **Escopo:** MVP (Fase 1)

---

## 1. Escopo do Produto

O PRD cobre o **MVP da Fase 1**: um sistema funcional de ponta a ponta com os três módulos core — Gestão de Consulentes, Mesa Real Interativa e Geração de Dossiê via IA. Funcionalidades de escala (multi-tenant, app mobile, marketplace) são escopo das fases 2 e 3, documentadas no Roadmap.

---

## 2. Módulos e Funcionalidades

### Módulo A — Autenticação e Acesso

**A.1 — Login do Operador**
- O sistema deve ter uma tela de login segura (`/login`).
- Autenticação via e-mail + senha com sessão persistente (JWT ou NextAuth.js).
- Apenas usuários autorizados (o próprio Gabriel/operador) acessam o sistema.
- Sem auto-cadastro público: contas são criadas manualmente no banco de dados ou via script de seed.

**Critérios de Aceitação:**
- [ ] Login com credenciais válidas redireciona para `/dashboard`.
- [ ] Login com credenciais inválidas exibe mensagem de erro sem revelar qual campo está errado.
- [ ] Sessão expira após 24h de inatividade.
- [ ] Rota `/dashboard` é protegida — redireciona para `/login` se não autenticado.

---

### Módulo B — Gestão de Consulentes

**B.1 — Cadastro de Novo Consulente**
O operador acessa `/dashboard/clientes/novo` e preenche:
- Nome Completo (conforme certidão de nascimento) — *obrigatório, usado nos cálculos de Numerologia Cabalística*
- Data de Nascimento — *obrigatório*
- Hora de Nascimento (HH:MM) — *obrigatório para cálculo do Ascendente*
- Cidade de Nascimento — *obrigatório*
- Estado/Região — *obrigatório*
- País de Nascimento — *obrigatório*

**B.2 — Processamento Automático dos Mapas**
Ao salvar o cadastro, o sistema executa em background:

1. **Motor de Numerologia Cabalística** (processado localmente no servidor):
   - Caminho de Vida (soma reduzida de todos os dígitos da data)
   - Número de Missão (análise da data)
   - Número de Expressão (conversão alfanumérica do nome completo)
   - Número de Motivação (vogais do nome)
   - Número de Dons Nativos (dia de nascimento)

2. **Motor de Numerologia Tântrica** (processado localmente no servidor):
   - Número de Alma (dia de nascimento reduzido)
   - Número de Karma (mês de nascimento)
   - Número de Dom Divino (ano de nascimento, reduzido: ex. 1986 → 8+6=14 → 1+4=5)
   - Número de Destino (ano completo de 4 dígitos, reduzido)
   - Número de Caminho (soma total de toda a data)

3. **Motor de Astrologia** (via API externa ou biblioteca de efemérides):
   - Signo Solar
   - Signo Lunar
   - Signo Ascendente (requer hora e local exatos)
   - Posição dos 10 planetas clássicos (Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão)
   - Posição de Quíron e Lilith (asteroides relevantes)
   - Casa Astrológica de cada planeta
   - Signo regente de cada uma das 12 Casas Astrológicas
   - Nodo Norte e Nodo Sul (eixo do karma e destino)
   - Aspectos principais (conjunção, oposição, trígono, quadratura, sextil)

4. **Odu de Nascimento** (calculado por regra interna):
   - Determinado pela data de nascimento conforme tabela fixa de mapeamento.

Os resultados são salvos no banco de dados nos campos `astrologyMap`, `kabalisticMap` e `tantricMap` como JSON.

**B.3 — Listagem e Busca de Consulentes**
- Tela `/dashboard/clientes` com tabela paginada.
- Busca por nome em tempo real.
- Ao clicar em um consulente, abre um painel lateral (Drawer) com:
  - Resumo dos mapas calculados (badges visuais).
  - Lista de leituras anteriores com datas.
  - Botão "Nova Consulta" que pré-carrega o cliente na tela da Mesa Real.

**Critérios de Aceitação:**
- [ ] Formulário valida todos os campos obrigatórios antes de submeter.
- [ ] O campo "Cidade" usa autocomplete (Google Places API ou Geonames) para capturar Latitude, Longitude e Timezone corretos para o cálculo astral.
- [ ] Após salvar, o perfil exibe os números calculados e o mapa astral em menos de 10 segundos.
- [ ] Os dados dos mapas são persistidos no banco e não recalculados a cada leitura.
- [ ] Consulente pode ser editado — ao editar data/hora/local, os mapas são recalculados automaticamente.

---

### Módulo C — Mesa Real Interativa (O Cockpit)

**C.1 — Seleção do Consulente**
- Tela `/dashboard/nova-consulta`.
- Primeiro passo: buscar e selecionar o consulente cadastrado (buscador typeahead).
- O painel lateral exibe o resumo do mapa do consulente selecionado (sempre visível durante o preenchimento).

**C.2 — Grid da Mesa Real (9×4)**
- Uma matriz visual fixa de **9 colunas por 4 linhas**, totalizando exatamente **36 slots** (casas).
- Cada slot tem um número fixo de 1 a 36 e o nome original da casa como label (ex: "Casa 1 — O Cavaleiro").
- Os 36 slots aparecem simultaneamente na tela sem necessidade de scroll.

**Ordem e nomenclatura fixa dos slots (imutável):**

| # | Nome | # | Nome | # | Nome |
|---|------|---|------|---|------|
| 1 | O Cavaleiro | 13 | A Criança | 25 | O Anel |
| 2 | O Trevo | 14 | A Raposa | 26 | O Livro |
| 3 | O Navio | 15 | O Urso | 27 | A Carta |
| 4 | A Casa | 16 | A Estrela | 28 | O Cigano |
| 5 | A Árvore | 17 | A Cegonha | 29 | A Cigana |
| 6 | As Nuvens | 18 | O Cachorro | 30 | Os Lírios |
| 7 | A Serpente | 19 | A Torre | 31 | O Sol |
| 8 | O Caixão | 20 | O Jardim | 32 | A Lua |
| 9 | Os Buquês | 21 | A Montanha | 33 | A Chave |
| 10 | A Foice | 22 | Os Caminhos | 34 | Os Peixes |
| 11 | O Chicote | 23 | O Rato | 35 | A Âncora |
| 12 | Os Pássaros | 24 | O Coração | 36 | A Cruz |

**C.3 — Preenchimento dos Slots**
- Ao clicar em um slot vazio, abre um **Popover contextual** (não Modal — não bloqueia a visão da mesa) ancorado ao slot clicado.
- O Popover contém:
  - Label: "Preenchendo: Casa [N] — [Nome da Casa]"
  - **Campo 1 — Carta Cigana:** ComboBox com busca (digitar "Anc" filtra "35 — A Âncora"). Lista as 36 cartas com número e nome.
  - **Campo 2 — Odu:** ComboBox com os 16 Odus com número e nome do Orixá regente.
  - Confirmação: botão "Confirmar" ou tecla Enter.
  - Cancelamento: tecla Esc ou clicar fora.
- Após confirmar, o slot é atualizado visualmente com os dados inseridos e o Popover fecha.
- Cada slot pode ser editado: clicar em um slot preenchido reabre o Popover com os valores atuais para edição.
- Opção de limpar slot individual (ícone de reset no slot preenchido).

**C.4 — Controle de Estado e Progresso**
- Um indicador no topo da tela exibe o progresso: "Cartas na Mesa: X/36".
- O botão "Gerar Dossiê" fica desabilitado até que pelo menos 1 casa seja preenchida (não é necessário preencher todas as 36 para gerar — o sistema interpreta apenas as casas com dados).
- Um botão "Limpar Mesa" permite resetar todas as 36 casas (com diálogo de confirmação).

**Critérios de Aceitação:**
- [ ] O grid renderiza exatamente 36 slots nas posições corretas (9×4).
- [ ] O Popover não cobre o restante do grid — posiciona-se inteligentemente (acima, abaixo, à esquerda ou à direita conforme o espaço disponível na tela).
- [ ] Os ComboBoxes têm busca funcional: digitar caracteres filtra as opções em tempo real.
- [ ] O estado da matriz persiste enquanto o usuário está na tela (não perde ao re-render).
- [ ] Em telas desktop (≥1280px), todos os 36 slots são visíveis sem scroll vertical.

---

### Módulo D — Motor de IA e Geração do Dossiê

**D.1 — Disparo do Processamento**
- Botão "Gerar Dossiê Cabalístico" na sidebar.
- O sistema envia para a API route `/api/generate-dossier`:
  - O ID do consulente (para buscar os mapas calculados).
  - O objeto `matrixData` com as casas preenchidas (formato: `{ "1": { "carta": 19, "odu": 10 }, "5": { "carta": 3, "odu": 6 } ... }`).

**D.2 — Pipeline de Processamento (Backend)**
1. Busca o `Client` no banco de dados (mapas já calculados).
2. Para cada casa preenchida em `matrixData`, o `PromptBuilder` monta um bloco interpretativo específico.
3. O `PromptBuilder` injeta no prompt: significado base da casa + aspecto astrológico/numerológico delegado àquela casa + carta tirada + Odu tirado.
4. Envia o payload completo para a API do LLM (OpenAI GPT-4o ou Anthropic Claude).
5. Recebe o relatório em Markdown.
6. Salva o resultado no modelo `Report` associado ao `Reading`.
7. Retorna o Markdown para o frontend.

**D.3 — Exibição do Dossiê na Tela**
- O Markdown é renderizado na tela em uma área de leitura elegante ao lado/abaixo do grid.
- O dossiê é estruturado em:
  - Seção por casa (Casa 1, Casa 2... até a última casa preenchida).
  - Seção final de Síntese Integradora.
- Opção de expandir/colapsar cada seção de casa.

**D.4 — Exportação para PDF**
- Botão "Exportar PDF" gera um arquivo com:
  - Capa com nome do consulente, data da consulta e logomarca.
  - Página de resumo dos mapas (Astrologia, Numerologias).
  - Análise de cada casa preenchida.
  - Capítulo de Síntese Final.
- O PDF é disponibilizado para download imediato.
- O link do PDF é salvo no campo `pdfUrl` do modelo `Report`.

**Critérios de Aceitação:**
- [ ] O processamento completo (para 36 casas) não deve exceder 60 segundos. Para 10 casas, máximo 20 segundos.
- [ ] O frontend exibe um estado de carregamento (spinner + mensagem de progresso) durante o processamento.
- [ ] Se o processamento falhar, um estado de erro claro é exibido com opção de tentar novamente.
- [ ] O dossiê gerado é salvo no banco de dados e pode ser acessado novamente no histórico do consulente.
- [ ] O PDF exportado contém todos os capítulos sem truncamento.

---

### Módulo E — Histórico de Consultas

**E.1 — Histórico por Consulente**
- Na tela de perfil do consulente, uma seção "Histórico de Leituras" lista todas as consultas anteriores com data e status.
- Clicar em uma leitura anterior abre o dossiê correspondente (somente leitura).
- Botão para baixar o PDF de leituras antigas.

**E.2 — Dashboard Geral**
- Tela `/dashboard` exibe:
  - Card: "Consultas realizadas este mês"
  - Card: "Total de consulentes cadastrados"
  - Tabela: "Últimas 10 consultas" com nome, data e link para o dossiê.

---

## 3. Restrições e Requisitos Não-Funcionais

**Segurança:**
- Todas as chaves de API (OpenAI, Anthropic, serviços de astrologia) ficam exclusivamente no servidor (variáveis de ambiente `.env`). Nunca expostas no frontend.
- Banco de dados não é acessível publicamente — apenas via ORM do servidor.
- Autenticação obrigatória para todas as rotas do dashboard.

**Performance:**
- O grid da Mesa Real (componente React) deve renderizar sem lag perceptível ao clicar nos slots (re-renders otimizados com `useState` ou `Zustand`).
- Os mapas do consulente (astrologia, numerologias) são calculados **uma única vez** no cadastro e cacheados. Nunca recalculados em tempo de consulta.

**Usabilidade:**
- A interface deve funcionar em monitores de 13" a 27".
- Dark mode obrigatório (não há modo claro no MVP).
- Sem necessidade de treinamento formal — um terapeuta familiarizado com a Mesa Real deve conseguir operar o sistema sem tutorial após 15 minutos de exploração.

**Disponibilidade:**
- Sistema hospedado em plataforma com SLA de 99.5% (Vercel + Supabase/Neon são adequados).
