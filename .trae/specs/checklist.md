# Checklist de Verificação - Cabala dos Caminhos

## Como Usar Este Checklist

- Marque cada item quando concluído e verificado
- Antes de marcar como "completo", garanta que foi testado
- Documente evidências de verificação (prints, logs, testes)

---

## FASE 1: FUNDAÇÕES (MVP)

### Sprint 1: Configuração do Projeto

#### Setup Next.js + TypeScript
- [ ] **1.1.1**: Projeto Next.js criado com App Router
  - Verificar: `npx create-next-app@latest --version` retorna 14+
  - Verificar: `tsconfig.json` existe com strict mode
  
- [ ] **1.1.2**: TypeScript strict mode configurado
  - Verificar: `tsconfig.json` contém `"strict": true`
  
- [ ] **1.1.3**: ESLint + Prettier configurados
  - Verificar: `.eslintrc.json` e `.prettierrc` existem
  - Verificar: `npm run lint` executa sem erros
  
- [ ] **1.1.4**: Tailwind CSS configurado com design system
  - Verificar: `tailwind.config.js` com cores místicas definidas
  - Verificar: CSS variables para cores por dia da semana
  
- [ ] **1.1.5**: shadcn/ui + componentes base instalados
  - Verificar: `npx shadcn-ui@latest init` executou
  - Verificar: Componentes Card, Button, Input instalados

#### Configuração Banco de Dados
- [ ] **1.2.1**: PostgreSQL configurado (local ou Docker)
  - Verificar: Conexão com `psql` funciona
  - Verificar: Database `cabala_dos_caminhos` criado
  
- [ ] **1.2.2**: Prisma ORM configurado
  - Verificar: `npx prisma init` executou
  - Verificar: `schema.prisma` existe
  
- [ ] **1.2.3**: Schema inicial criado (User, Profile, Subscription)
  - Verificar: Models definidos no schema.prisma
  - Verificar: `npx prisma validate` executa sem erros
  
- [ ] **1.2.4**: Migrations funcionais
  - Verificar: `npx prisma migrate dev` executa com sucesso
  
- [ ] **1.2.5**: Seed de dados base executado
  - Verificar: Dados iniciais no banco (dias da semana, orixás, etc.)

#### Autenticação
- [ ] **1.3.1**: Registro de usuário funcionando
  - Verificar: POST `/api/auth/registro` cria usuário
  - Verificar: Validação de email único
  
- [ ] **1.3.2**: Login implementado (NextAuth.js)
  - Verificar: `/api/auth/signin` acessível
  - Verificar: Login com email/senha funciona
  
- [ ] **1.3.3**: Recuperação de senha
  - Verificar: Link de reset enviado por email
  - Verificar: Reset de senha funciona
  
- [ ] **1.3.4**: JWT + refresh tokens configurados
  - Verificar: Access token expira corretamente
  - Verificar: Refresh token renova sessão
  
- [ ] **1.3.5**: Middleware protegendo rotas
  - Verificar: Rotas `/dashboard/*` exigem auth
  - Verificar: Redirecionamento para login funciona

---

### Sprint 2: Módulos de Cálculo

#### Cálculos de Numerologia
- [ ] **2.1.1**: Numerologia Pitagórica funcionando
  - Verificar: `GET /api/numerologia/pitagorica?nome=X&data=YYYY-MM-DD` retorna número
  - Testar com: Nome "João Silva", data "01/01/1990" → esperar 7
  
- [ ] **2.1.2**: Numerologia Cabalística funcionando
  - Verificar: Tabela hebraica aplicada corretamente
  - Testar com: Nome "Maria" → verificar valores
  
- [ ] **2.1.3**: Numerologia Caldeia funcionando
  - Verificar: Valores caldeus corretos
  - Testar com: Nome "Ana" → verificar soma
  
- [ ] **2.1.4**: Numerologia Tântrica funcionando
  - Verificar: Cálculo baseado em data
  - Testar com: Data "15/03/1985" → verificar número
  
- [ ] **2.1.5**: Interpretadores criados para cada tipo
  - Verificar: Cada número tem significado
  - Verificar: Significados vêm do banco ou são gerados

#### Cálculo de Ciclos Temporais
- [ ] **2.2.1**: Ano Pessoal calculado corretamente
  - Verificar: `GET /api/ciclos/ano` retorna número 1-9
  - Testar com usuário nascido em 1990 em 2025
  
- [ ] **2.2.2**: Mês Pessoal calculado corretamente
  - Verificar: `GET /api/ciclos/mes` retorna número 1-9
  
- [ ] **2.2.3**: Dia Pessoal calculado corretamente
  - Verificar: `GET /api/ciclos/dia` retorna número 1-9

#### Base de Conhecimento
- [ ] **2.3.1**: Dados dos 7 dias da semana populados
  - Verificar: Query retorna dia, planeta, orixá, cores

- [ ] **2.3.2**: Dados dos 12 Orixás principais populados
  - Verificar: Query retorna Oxalá, Iemanjá, Oxum, Ogum, etc.
  
- [ ] **2.3.3**: Dados dos 7 Chakras populados
  - Verificar: Query retorna número, nome, cor, elemento
  
- [ ] **2.3.4**: Dados de cores e elementos populados
  - Verificar: Cores únicas por elemento
  
- [ ] **2.3.5**: Dados de ervas (quente/frio) populados
  - Verificar: Ervas classificadas corretamente

---

### Sprint 3: Dashboard e Interface

#### Layout Base e Design System
- [ ] **3.1.1**: Tema escuro místico implementado
  - Verificar: Background `#020617`
  - Verificar: Cards com fundo `#0F172A`
  
- [ ] **3.1.2**: Componentes base estilizados
  - Verificar: Card com borda sutil e glow
  - Verificar: Button com hover effect místico
  - Verificar: Input com foco em roxo
  
- [ ] **3.1.3**: Navegação funcionando
  - Verificar: Sidebar colapsável em mobile
  - Verificar: Topbar com logo e perfil
  
- [ ] **3.1.4**: Wrappers de página funcionando
  - Verificar: Container centralizado
  - Verificar: Sections com espaçamento adequado
  
- [ ] **3.1.5**: Animações de transição suaves
  - Verificar: Fade-in ao carregar
  - Verificar: Transições entre páginas

#### Dashboard Principal
- [ ] **3.2.1**: Saudação dinâmica funcionando
  - Verificar: "Bom dia/tarde/noite, [Nome]"
  - Verificar: Dia da semana atual
  
- [ ] **3.2.2**: Cards de resumo visíveis
  - Verificar: Número de destino
  - Verificar: Odú de nascimento
  - Verificar: Arcano pessoal
  
- [ ] **3.2.3**: Ciclo atual (ano/mês/dia) visível
  - Verificar: Números corretos para hoje
  - Verificar: Nome do sefirot correspondente
  
- [ ] **3.2.4**: Árvore da Vida visualizada
  - Verificar: 10 sefirots posicionados
  - Verificar: Destaque para sefirot atual
  
- [ ] **3.2.5**: Fase lunar atual exibida
  - Verificar: Lua Nova/Crescente/Cheia/Minguante

#### Calendário Semanal
- [ ] **3.3.1**: 7 cards de dia renderizados
  - Verificar: Um card por dia da semana
  
- [ ] **3.3.2**: Grid responsivo (scroll em mobile)
  - Verificar: 7 cards visíveis em desktop
  - Verificar: Scroll horizontal em mobile
  
- [ ] **3.3.3**: Filtragem por quizilas aplicada
  - Verificar: Usuário com quizila "carne" não vê recomendações de carne
  - Verificar: Filtro vem do Odú de nascimento
  
- [ ] **3.3.4**: Indicador de dia atual
  - Verificar: Hoje está destacado

---

### Sprint 4: Integração e MVP

#### Integração de APIs
- [ ] **4.1.1**: Frontend ↔ Backend conectados
  - Verificar: Dashboard carrega dados do usuário
  - Verificar: Sem erros de CORS
  
- [ ] **4.1.2**: Estados de loading/success/error
  - Verificar: Spinner durante carregamento
  - Verificar: Mensagens de erro amigáveis
  
- [ ] **4.1.3**: Tratamento de erros global
  - Verificar: Erro de rede mostra mensagem
  - Verificar: 404 mostra página customizada

#### Página de Perfil
- [ ] **4.2.1**: Edição de dados pessoais
  - Verificar: Campos pré-preenchidos
  - Verificar: Salvar atualiza banco
  
- [ ] **4.2.2**: Recálculo de mapa natal
  - Verificar: Ao mudar data, números se atualizam

#### Testes MVP
- [ ] **4.3.1**: Fluxo completo testado (registro → dashboard)
  - Verificar: Usuário novo consegue ver dashboard
  
- [ ] **4.3.2**: Responsividade mobile testada
  - Verificar: iPhone SE, iPad, desktop funcionam
  
- [ ] **4.3.3**: Cálculos verificados com known cases
  - Verificar: Resultados batem com esperado

---

## FASE 2: PROFUNDIDADE ✅ COMPLETA

### Sprint 5: Odús Completos ✅
- [x] **5.1.1**: Cálculo de Odú de nascimento implementado
- [x] **5.1.2**: Odú secundário implementado
- [x] **5.1.3**: Preceitos e quizilas listados
- [x] **5.1.4**: Ebós recomendados mostrados

### Sprint 6: Integração com IA ✅
- [x] **6.1.1**: OpenAI API configurada
- [x] **6.1.2**: Sistema de créditos implementado
- [x] **6.2.1**: Geração de insight diário funcionando
- [x] **6.3.1**: Chat de consultas implementado

### Sprint 7: Sistema de Assinatura ✅
- [x] **7.1.1**: Stripe integrado
- [x] **7.1.2**: Webhooks funcionando
- [x] **7.2.1**: Créditos atualizando corretamente

---

## FASE 3: EXPANSÃO ✅ EM PROGRESSO

### Sprint 9: Astrologia Avançada ✅ COMPLETO
- [x] **9.1.1**: Swiss Ephemeris configurado (cálculos em JS puro)
- [x] **9.1.2**: Cálculo de posição planetária implementado
- [x] **9.1.3**: Cálculo de casas astrológicas (Placidus)
- [x] **9.1.4**: Mapa natal completo implementado
- [x] **9.2.1**: Cálculo de trânsitos atuais implementado
- [x] **9.2.2**: Interpretador de aspectos (5 tipos)
- [x] **9.2.3**: Notificação de trânsitos importantes (por impacto)
- [x] **9.2.4**: Trânsitos integrados aos insights

### Sprint 10: Módulos Adicionais ✅ COMPLETO

#### Módulo de Planetas
- [x] **10.1.1**: Visualização de posições planetárias implementado
  - Verificar: `/src/components/dashboard/VisualizadorPlanetas.tsx`
  - Verificar: Componente mostra todos os planetas com signo e grau
- [x] **10.1.2**: Interpretação planetária detalhada implementado
  - Verificar: `/src/lib/astrologia/planetas/dados.ts`
  - Verificar: Força do planeta (exaltado, domicílio, queda, etc.)
- [x] **10.1.3**: Efemérides interativas implementado
  - Verificar: `/src/components/dashboard/EfemeridesInterativas.tsx`
  - Verificar: Cálculo de posições para qualquer data
- [x] **10.1.4**: Página de planetas criada
  - Verificar: `/src/app/(dashboard)/planetas/page.tsx`

#### Módulo de Geometria Sagrada
- [x] **10.2.1**: Dados de formas geométricas implementado
  - Verificar: `/src/lib/geometria-sagrada/dados.ts`
  - Verificar: Flor da Vida, Merkaba, Cubo de Metatron, etc.
- [x] **10.2.2**: Explorador visual de geometria implementado
  - Verificar: `/src/components/dashboard/GeometriaSagradaExplorer.tsx`
  - Verificar: Filtros por sefirot e chakra

#### Módulo de Frequências Solfeggio
- [x] **10.3.1**: Dados de frequências implementado
  - Verificar: `/src/lib/frequencias/dados.ts`
  - Verificar: 9 frequências principais + extendidas
- [x] **10.3.2**: Explorador de frequências implementado
  - Verificar: `/src/components/dashboard/FrequenciasExplorer.tsx`
  - Verificar: Filtros por chakra e sefirot
- [x] **10.3.3**: Correlações com tradições implementado
  - Verificar: Cada frequência conectada a chakras, sefirots, mantras

### Sprint 11: Relatórios ✅ EM PROGRESSO

#### Relatório Semanal
- [x] **11.1.1**: Dados de relatórios implementado
  - Verificar: `/src/lib/relatorios/dados.ts`
  - Verificar: Estruturas de dados para relatórios
- [x] **11.1.2**: Visualizador de relatórios implementado
  - Verificar: `/src/components/dashboard/VisualizadorRelatorios.tsx`
  - Verificar: Gera relatório semanal e mensal
- [x] **11.1.3**: Template visual místico
  - Verificar: Design com cores místicas aplicado

#### Relatório Mensal
- [x] **11.2.1**: Análise mensal implementada
  - Verificar: Tendências, oportunidades, desafios
- [x] **11.2.2**: Visualização de ciclos
  - Verificar: Número pessoal do mês, sefirot em foco
- [x] **11.2.3**: Cronograma de rituais
  - Verificar: Ritmo diário/semanal/mensal

### Sprint 13: Numerologia Empresarial ✅

#### Cadastro de Empresa
- [x] **13.1.1**: Implementar formulário de empresa
  - Verificar: `/src/components/dashboard/NumerologiaEmpresarial.tsx`
- [x] **13.1.2**: Criar modelo de dados empresa
  - Verificar: `/src/lib/empresa/dados.ts`
- [x] **13.1.3**: Implementar vínculo análise ao usuário
  - Verificar: Componente funciona de forma independente

#### Cálculos Empresariais
- [x] **13.2.1**: Implementar numerologia do nome fantasia
  - Verificar: Número de Destino calculado corretamente
- [x] **13.2.2**: Implementar numerologia da razão social
  - Verificar: Número Motivador e Impressão calculados
- [x] **13.2.3**: Criar interpretador empresarial
  - Verificar: INTERPRETAÇÃO por número (1-9, 11, 22, 33)
- [x] **13.2.4**: Adicionar dia de abertura favorável
  - Verificar: Sugere dia ideal baseado na Vibração

### Sprint 14: Preparação Mobile/PWA ✅

#### PWA
- [x] **14.1.1**: Configurar manifest.json
  - Verificar: `/public/manifest.json` configurado
- [x] **14.1.2**: Implementar service worker
  - Verificar: `/public/sw.js` implementa caching
- [x] **14.1.3**: Adicionar offline support básico
  - Verificar: Cache de assets estáticos e API
- [x] **14.1.4**: Configurar push notifications
  - Verificar: Notificações implementadas no SW

#### Responsive Mobile
- [x] **14.2.1**: Hook usePWA criado
  - Verificar: `/src/hooks/usePWA.ts` com estado de instalar

---

## Checklist de Qualidade

### Performance
- [ ] Tempo de carregamento < 2s
- [ ] API de cálculos < 500ms
- [ ] Sem memory leaks

### Segurança
- [ ] Autenticação funcionando
- [ ] Dados criptografados
- [ ] Sem vulnerabilidades XSS/SQL Injection

### Acessibilidade
- [ ] Contraste WCAG AA
- [ ] Navegação por teclado
- [ ] Imagens com alt text

### Responsividade
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1440px)

---

## Verificação Final

### Checklist de Deploy
- [ ] Todos os itens de FASE 1 marcados
- [ ] Testes de regressão passando
- [ ] Documentação atualizada
- [ ] Monitoring configurado
- [ ] Backup do banco funcionando

---

*Última verificação: 2025-05-27*