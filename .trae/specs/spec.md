# Cabala dos Caminhos - Especificação Técnica e de Design

## 1. Visão Geral do Sistema

### 1.1 Propósito
O **Cabala dos Caminhos** é uma plataforma digital de autoconhecimento espiritual unificado que integra múltiplas tradições esotéricas (Cabala, Numerologia, Astrologia, Tarot, Candomblé, Umbanda, etc.) para fornecer insights personalizados baseados nos dados de nascimento do usuário.

### 1.2 Problema que Resolve
- Fragmentação do conhecimento esotérico em múltiplas fontes desconectadas
- Falta de ferramentas que correlacionem tradições diferentes de forma inteligente
- Ausência de sistemas que respeitem restrições individuais (quizilas, preceitos)
- Dificuldade de aplicar ensinamentos espirituais no dia a dia

### 1.3 Proposta de Valor
Uma dashboard unificada que traduz complexidade espiritual em orientações práticas e diárias, respeitando o perfil único de cada usuário.

---

## 2. Arquitetura do Sistema

### 2.1 Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | Next.js 14+ (App Router) | SSR, SEO, componentes React server |
| **UI Framework** | shadcn/ui + Radix UI | Componentes acessíveis + customização total |
| **Estilização** | Tailwind CSS + CSS Variables | Design system flexível |
| **Estado** | Zustand | Estado global leve |
| **Backend** | Next.js API Routes / tRPC | Type-safe APIs |
| **Banco de Dados** | PostgreSQL + Prisma | Dados relacionais + base de conhecimento |
| **Base de Conhecimento** | Neo4j ou PostgreSQL com pgvector | Grafo de correlações + busca semântica |
| **Cache** | Redis | Ciclos temporais, sessões |
| **IA** | OpenAI GPT-4 / Claude | Geração de insights |
| **Astrologia** | Swiss Ephemeris / Astropy | Cálculos astronômicos precisos |
| **Autenticação** | NextAuth.js / Clerk | Auth seguro |
| **Pagamentos** | Stripe | Assinaturas + créditos |

### 2.2 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Dashboard  │  │   Perfil    │  │  Calendário │  │   Chat IA   │    │
│  │   (Home)    │  │  (Dados)    │  │  (Kanban)   │  │  (Insights) │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY                                   │
│                     Next.js API Routes / tRPC                            │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│   MÓDULOS     │         │     IA        │         │   SERVIÇOS    │
│   DE CÁLCULO  │         │   (OpenAI)    │         │   EXTERNOS    │
├───────────────┤         ├───────────────┤         ├───────────────┤
│ • Numerologia │         │ • Insights    │         │ • Swiss Eph   │
│ • Odús        │         │ • Correlações │         │ • Stripe      │
│ • Astrologia  │         │ • Respostas   │         │ • Email       │
│ • Tarot       │         │               │         │               │
│ • Ciclos      │         │               │         │               │
└───────┬───────┘         └───────┬───────┘         └───────┬───────┘
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
          ┌───────────────┐           ┌───────────────┐
          │    NEO4J       │           │  POSTGRESQL   │
          │  (Correlações) │           │ (Usuários +   │
          │                │           │  Conhecimento) │
          └───────────────┘           └───────────────┘
```

### 2.3 Estrutura de Dados Principal

#### 2.3.1 Usuário
```typescript
interface Usuario {
  id: string;
  email: string;
  nomeCompleto: string;
  dataNascimento: Date;
  horaNascimento?: string; // HH:mm
  localNascimento: string;
  // Dados calculados (cache)
  mapaNatal?: MapaNatal;
  odus?: OdusNascimento;
  ciclos?: CiclosTemporais;
  assinatura?: Assinatura;
  creditos?: number;
  // Preferências
  temaPreferido?: 'mystical' | 'minimal' | 'cosmic';
}
```

#### 2.3.2 Mapa Natal (Calculado)
```typescript
interface MapaNatal {
  usuarioId: string;
  // Astrologia
  signoSolar: string;
  signoLunar: string;
  ascendente: string;
  casasPlanetarias: CasaPlanetaria[];
  // Numerologia
  numeroCabalistico: number;
  numeroTantrico: number;
  numeroPitagorico: number;
  numeroCaldeu: number;
  numeroCarmico: number;
  // Odú
  oduPrincipal: Odus;
  oduSecundario: Odus;
  preceitos: string[];
  quizilas: string[];
  // Tarot
  arcanoPessoal: number;
  cartaCaminho: string;
  // Sefirots
  sefirotDominante: string;
  sefirotAlinhado: string[];
}
```

### 2.4 API Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/registro` | Cadastro de usuário |
| GET | `/api/usuario/perfil` | Dados do perfil + cálculos |
| PUT | `/api/usuario/atualizar` | Atualizar dados pessoais |
| GET | `/api/numerologia/:tipo` | Cálculos numerológicos |
| GET | `/api/astrologia/mapa-natal` | Mapa astrológico completo |
| GET | `/api/astrologia/transitos` | Trânsitos planetários atuais |
| GET | `/api/ciclos/atual` | Ano/Mês/Dia pessoal atual |
| GET | `/api/odus/detalhes` | Detalhes do Odú de nascimento |
| GET | `/api/dashboard/resumo` | Resumo para dashboard principal |
| GET | `/api/dashboard/dia` | Orientações do dia |
| GET | `/api/calendario/semana` | Kanban semanal |
| POST | `/api/ia/insight` | Gerar insight personalizado |
| POST | `/api/ia/pergunta` | Pergunta sobre tema específico |
| GET | `/api/assinatura/creditos` | Saldo de créditos |
| POST | `/api/assinatura/resgatar` | Resgatar créditos da assinatura |

---

## 3. Design System - "Mística Unificada"

### 3.1 Filosofia Visual

O design deve evocar **conexão cósmica e ancestral** através de:
- **Geometria Sagrada**: Padrões inspirados na Árvore da Vida, proporções áureas, círculos concêntricos
- **Ciclos Naturais**: Transições suaves representando Lua, estações, respirações
- **Símbolos Universais**: Elementos visuais que transcendem culturas esotéricas
- **Profundidade Etérea**: Camadas com transparências, brilhos sutis, texturas místicas

### 3.2 Paleta de Cores

#### 3.2.1 Cores Primárias (Por Dia da Semana)

| Dia | Cor Principal | Cor Secundária | Hex | Orixá/Planeta |
|-----|---------------|----------------|-----|---------------|
| Segunda | Roxo Profundo | Prata | `#6B21A8` / `#94A3B8` | Omolu/Saturno/Lua |
| Terça | Vermelho Carmesim | Laranja | `#DC2626` / `#EA580C` | Ogum/Marte |
| Quarta | Amarelo Solar | Ouro | `#CA8A04` / `#EAB308` | Xangô/Mercúrio |
| Quinta | Verde Esmeraalda | Turquesa | `#059669` / `#14B8A6` | Oxóssi/Júpiter |
| Sexta | Branco Nacarado | Rosa Claro | `#F5F5F4` / `#FBCFE8` | Oxalá/Vênus |
| Sábado | Azul Oceano | Rosa Antigo | `#1E40AF` / `#DB2777` | Oxum/Iemanjá/Saturno |
| Domingo | Dourado Imperial | Laranja Queimado | `#D97706` / `#EA580C` | Xangô/Sol |

#### 3.2.2 Cores Funcionais

| Função | Cor | Hex | Uso |
|--------|-----|-----|-----|
| Primária | Índigo Místico | `#4338CA` | Botões principais, links |
| Secundária | Escuridão | `#0F172A` | Fundos escuros |
| Sucesso | Verde Vital | `#22C55E` | Confirmações, energia positiva |
| Alerta | Âmbar | `#F59E0B` | Avisos, energias médias |
| Erro | Rubi | `#EF4444` | Erros, quizilas |
| Neutro | Ardósia | `#64748B` | Textos secundários |
| Fundo Escuro | Noite Estrelada | `#020617` | Background principal |
| Fundo Card | Abismo | `#0F172A` | Cards, containers |
| Texto Principal | Lua Cheia | `#F8FAFC` | Texto em fundo escuro |
| Texto Secundário | Névoa | `#94A3B8` | Texto complementar |

#### 3.2.3 Cores dos Chakras

| Chakra | Cor | Hex | Posição na UI |
|--------|-----|-----|---------------|
| 7º Coronário | Branco/Dourado | `#FFD700` | Topo da página, header |
| 6º Frontal | Roxo | `#7C3AED` | Ícones de intuição |
| 5º Laríngeo | Azul | `#3B82F6` | Comunicação |
| 4º Cardíaco | Verde | `#22C55E` | Centro do corpo |
| 3º Plexo Solar | Amarelo | `#EAB308` | Poder pessoal |
| 2º Sacro | Laranja | `#F97316` | Criatividade |
| 1º Básico | Vermelho | `#DC2626` | Aterramento |

### 3.3 Tipografia

#### Fontes
```css
/* Títulos e Display */
font-family: 'Cinzel', serif;
/* Usar para: Logo, títulos de seções, nomes de Orixás */

/* Corpo de Texto */
font-family: 'Cormorant Garamond', serif;
/* Usar para: Descrições, insights, textos longos */

/* Interface e Dados */
font-family: 'Raleway', sans-serif;
/* Usar para: Labels, botões, navegação, números */

/* Citações e Mantras */
font-family: 'IM Fell English', serif;
/* Usar para: Citações, preceitos, quizilas */
```

#### Escala Tipográfica
```
Display:   48px / 56px line-height / 700 weight
H1:        36px / 44px / 600
H2:        28px / 36px / 600
H3:        22px / 30px / 500
H4:        18px / 26px / 500
Body:      16px / 24px / 400
Small:     14px / 20px / 400
Caption:   12px / 16px / 400
```

### 3.4 Espaçamento e Grid

#### Sistema de 8px
```
xs:  4px   (space-1)
sm:  8px   (space-2)
md:  16px  (space-4)
lg:  24px  (space-6)
xl:  32px  (space-8)
2xl: 48px  (space-12)
3xl: 64px  (space-16)
4xl: 96px  (space-24)
```

#### Grid
- **Container Max**: 1440px
- **Grid de 12 colunas**
- **Gutter**: 24px
- **Margens laterais**: 24px (mobile) / 48px (tablet) / 96px (desktop)

### 3.5 Componentes Visuais Místicos

#### 3.5.1 Cards de Informação
```
┌──────────────────────────────────────┐
│  ✦  Símbolo decorativo superior     │
│                                      │
│  [Ícone do Elemento/Orixá]           │
│                                      │
│  Título do Card                      │
│  ═══════════                         │
│                                      │
│  Descrição do insight ou dado        │
│  espiritual...                       │
│                                      │
│  ┌─────────┐ ┌─────────┐           │
│  │Cor/Tag 1│ │Cor/Tag 2│           │
│  └─────────┘ └─────────┘           │
│                                      │
│  ✧  Símbolo decorativo inferior     │
└──────────────────────────────────────┘
```

#### 3.5.2 Cards de Dia da Semana (Kanban)
```
┌────────────────────────────┐
│      ☀️ DOMINGO            │
│      Sol • Xangô          │
│      ══════════════       │
│                            │
│  [Ícone Geométrico]        │
│      (Hexagrama)           │
│                            │
│  ┌──────────────────────┐ │
│  │  FAVORÁVEL PARA:     │ │
│  │  • Liderança          │ │
│  │  • Poder pessoal      │ │
│  │  • Sucesso            │ │
│  └──────────────────────┘ │
│                            │
│  ┌──────────────────────┐ │
│  │  EVITAR:             │ │
│  │  • Conflitos         │ │
│  │  • Impulsividade     │ │
│  └──────────────────────┘ │
│                            │
│  🕯️ Ritual: Azeite + Louro│
└────────────────────────────┘
```

#### 3.5.3 Visualização da Árvore da Vida (Sefirots)
```
              ● Kether
             / \
            /   \
           ●     ●
        Chokmah  Binah
           |     |
           ●     ●
        Chesed  Geburah
           |     |
           ●─────●
         Tiphereth
          /     \
         ●       ●
      Netzach   Hod
          |     |
          ●─────●
          Yesod
            |
            ●
         Malkuth
```

#### 3.5.4 Círculos dos Chakras
```
        ┌─────────────────┐
        │    7º    │
        │  ◯ ◯ ◯  │  Violeta
        │  CORONÁRIO  │
        ├─────────────────┤
        │    6º    │
        │  ◯ ◯ ◯  │  Índigo
        │  FRONTAL  │
        ├─────────────────┤
        │    5º    │
        │  ◯ ◯ ◯  │  Azul
        │  LARÍNGEO │
        ├─────────────────┤
        │    4º    │
        │  ◯ ◯ ◯  │  Verde
        │  CARDÍACO │
        ├─────────────────┤
        │    3º    │
        │  ◯ ◯ ◯  │  Amarelo
        │  PLEXO    │
        ├─────────────────┤
        │    2º    │
        │  ◯ ◯ ◯  │  Laranja
        │  SACRO   │
        ├─────────────────┤
        │    1º    │
        │  ◯ ◯ ◯  │  Vermelho
        │  BÁSICO  │
        └─────────────────┘
```

### 3.6 Efeitos Visuais

#### Brilho Estelar (Glow)
```css
/* Glow para elementos ativos */
box-shadow: 0 0 20px rgba(147, 51, 234, 0.5),
            0 0 40px rgba(147, 51, 234, 0.3),
            0 0 60px rgba(147, 51, 234, 0.1);

/* Glow para hover */
transition: all 0.3s ease;
&:hover {
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.7),
              0 0 60px rgba(147, 51, 234, 0.5);
}
```

#### Gradientes Místicos
```css
/* Gradiente para backgrounds */
background: linear-gradient(
  135deg,
  #020617 0%,
  #1e1b4b 50%,
  #0f172a 100%
);

/* Gradiente para cards de dia */
background: linear-gradient(
  145deg,
  rgba(255, 255, 255, 0.05) 0%,
  rgba(255, 255, 255, 0.02) 100%
);
```

#### Animações
```
Fade-In Estelar: opacity 0→1, 600ms ease-out
Slide-Up: translateY(20px)→0, 400ms ease-out
Pulse Glow: scale(1)→scale(1.02)→scale(1), 2s infinite
Rotação Sagrada: rotate(0deg)→rotate(360deg), 60s linear infinite (para fundo)
```

### 3.7 Ícones e Símbolos

#### Família de Ícones
- **Lucide Icons**: Interface geral
- **Custom SVG**: Símbolos místicos específicos
  - Símbolos planetários (☉ ☽ ☿ ♀ ♂ ♃ ♄ ⛢ ⛱ ♆ ♇)
  - Símbolos dos Orixás (个性化)
  - Símbolos dos elementos (🜁 🜃 🜄 🜃)
  - Geometria sagrada (hexagrama, pentagrama, merkaba)
  - Símbolos cabalísticos

#### Símbolos por Elemento
| Elemento | Símbolo | Cor |
|----------|---------|-----|
| Fogo | Triângulo para cima | `#DC2626` |
| Água | Triângulo para baixo | `#3B82F6` |
| Ar | Triângulo + linha | `#F5F5F4` |
| Terra | Triângulo + linha | `#65A30D` |
| Éter | Hexagrama | `#7C3AED` |

---

## 4. Requisitos Funcionais

### 4.1 Cadastro e Perfil

#### RF-001: Cadastro de Usuário
- O sistema DEVE permitir cadastro com: nome, email, senha, data de nascimento, hora de nascimento (opcional), local de nascimento
- O sistema DEVE calcular automaticamente todos os dados do mapa natal após o cadastro
- O sistema DEVE armazenar dados em conformidade com LGPD

#### RF-002: Atualização de Perfil
- O usuário DEVE poder atualizar seus dados pessoais a qualquer momento
- Atualização de dados DEVE recalcular automaticamente os valores afetados

### 4.2 Módulos de Cálculo

#### RF-010: Numerologia Cabalística
- O sistema DEVE calcular número cabalístico a partir do nome completo (usando tabela hebraica)
- O sistema DEVE interpretar o significado do número

#### RF-011: Numerologia Tântrica
- O sistema DEVE calcular número tântrico a partir da data de nascimento
- O sistema DEVE mostrar correlação com sefirots e chakras

#### RF-012: Numerologia Pitagórica
- O sistema DEVE calcular número pitagórico (soma de dígitos da data)
- O sistema DEVE mostrar significado arquetípico

#### RF-013: Numerologia Caldeia
- O sistema DEVE calcular número caldeu baseado em valores das letras
- O sistema DEVE mostrar relação com planetas

#### RF-014: Numerologia Cármica
- O sistema DEVE calcular lições cármicas a partir da data
- O sistema DEVE identificarkarma a resolver

#### RF-015: Odús de Nascimento
- O sistema DEVE calcular Odú principal e secundário
- O sistema DEVE listar preceitos e quizilas do usuário
- O sistema DEVE correlacionar Odú com: orixá regente, cores, elementos, ebós recomendados

### 4.3 Dashboard

#### RF-020: Dashboard Principal
- O sistema DEVE exibir resumo do mapa natal do usuário
- O sistema DEVE mostrar Orientações do Dia atual
- O sistema DEVE exibir Ciclo Temporal atual (ano/mês/dia pessoal)
- O sistema DEVE mostrar próximas influências astrológicas relevantes

#### RF-021: Calendário Semanal (Kanban)
- O sistema DEVE exibir 7 cards (um por dia da semana)
- Cada card DEVE mostrar:
  - Dia da semana com símbolo
  - Orixá/planeta regente
  - Cores favoráveis
  - Orixá/planeta regente
  - Cores favoráveis
  - Ervas/Banhos recomendados
  - Ritual sugerido
  - Evitar (quizilas)
- O sistema DEVE filtrar automaticamente based nas quizilas do usuário

#### RF-022: Insights Diários
- O sistema DEVE gerar insights baseados na combinação de:
  - Dia da semana
  - Fase lunar atual
  - Trânsitos planetários
  - Número pessoal do dia
  - Odú do nascimento
- Insights DEVEM ser gerados por IA usando a base de conhecimento
- Cada insight DEVE incluir:
  - Título
  - Descrição
  - Ação recomendada
  - Afirmação/mantra do dia
  - Cores, sons, ervas do dia

### 4.4 Sistema de Créditos

#### RF-030: Saldo de Créditos
- O sistema DEVE exibir créditos restantes ao usuário
- O sistema DEVE descontar créditos ao gerar insights
- O sistema DEVE permitir compra de créditos adicionais

#### RF-031: Insights por Créditos
- Um insight padrão DEVE custar X créditos
- Uma pergunta ao chat DEVE custar Y créditos
- Relatórios especiais DEVEM custar Z créditos

### 4.5 Chat com IA

#### RF-040: Perguntas por Tema
- O sistema DEVE permitir perguntas sobre: Relacionamentos, Trabalho, Dinheiro, Saúde, Espiritualidade, Propósito, Outros
- O sistema DEVE considerar o contexto do usuário (mapa natal, quizilas, dia atual)
- Respostas DEVEM ser em português e culturalmente apropriadas

---

## 5. Base de Conhecimento

### 5.1 Estrutura do Grafo de Correlações

```cypher
// Exemplo de correlações no Neo4j

// Nó: Orixá
(:Orixá {
  nome: "Oxum",
  saudacao: "Ora Yê Yê Ô",
  diaSemana: "Sábado",
  planeta: "Vênus",
  cores: ["Rosa", "Amarelo-ouro", "Azul-celeste"],
  chakra: "4º Cardíaco",
  elemento: "Água",
  hierbas: ["Erva-doce", "Calêndula", "Camomila"],
  quizilas: ["Ovos", "Abóbora"],
  naturezaEnergetica: "Doce/Fria",
  qualidade: ["Amor", "Fertilidade", "Prosperidade"]
})

// Relação: Orixá → Cor
(:Orixá {nome: "Oxum"})-[:TEM_COR {significado: "Amor incondicional"}]->(:Cor {nome: "Rosa"})

// Relação: Dia → Orixá → Cor
(:DiaSemana {nome: "Sábado"})-[:REGIDO_POR]->(:Orixá {nome: "Oxum"})
(:DiaSemana {nome: "Sábado"})-[:REGIDO_POR]->(:Orixá {nome: "Iemanjá"})

// Relação: Orixá → Chakra
(:Orixá {nome: "Oxum"})-[:GOVERNA]->(:Chakra {numero: 4, nome: "Cardíaco"})
```

### 5.2 Entidades Principais

| Entidade | Atributos Principais |
|----------|---------------------|
| Orixá | nome, saudação, dia, planeta, cores[], chakras[], ervas[], quizilas[] |
| Planeta | nome, símbolo, elemento, dia, qualidade, pedra, perfume |
| Chakra | número, nome, cor, elemento, glândula, funções[], mantras[] |
| DiaSemana | nome, orixas[], planeta, elemento, cor, recomendaçoes[] |
| Odú | número, nome, elementos, orixas[], quizilas[], preceptos[], ebos[] |
| Elemento | nome, símbolo, qualidades, direções[], cores[] |
| Sefirot | número, nome, aspecto, caminho[], cor, planeta |
| Erva | nome, tipo (quente/frio), uso[], orixas[], dias[] |
| FaseLua | nome, energia, rituais[], evisar[] |

### 5.3 Regras de Correlação

```
SE dia = Segunda E orixá = Omolu
ENTÃO:
  - Cores: Preto, Branco, Vermelho
  - Ervas: Canela-de-velho, Assa-peixe (quentes)
  - Evitar: Carne de porco
  - Banho: Descarga pesada (pescoço para baixo)
  - Ritual: Aterramento, limpeza de eguns

SE odu = Okaran
ENTÃO:
  - Quizilas: ["carne de porco", "cachaça em excesso", "andar na rua ao meio-dia"]
  - Preceitos: ["paciência", "não agir por impulso"]
  - Ebó: ["despachos em encruzilhadas", "moedas", "panos escuros"]
```

---

## 6. Modelos de Assinatura

### 6.1 Planos

| Plano | Preço | Créditos/Mês | Insights Incluídos | Chat |
|-------|-------|--------------|-------------------|------|
| **Iniciante** | R$ 29,90 | 50 | 25 | 10 |
| **Caminhante** | R$ 59,90 | 150 | 75 | 30 |
| **Mestre** | R$ 99,90 | 350 | 175 | 70 |
| **Personalizado** | Sob consulta | Customizado | Customizado | Customizado |

### 6.2 Módulos Adicionais (Add-ons)

| Módulo | Preço Adicional | Descrição |
|--------|-----------------|-----------|
| **Planetas** | +R$ 9,90/mês | Trânsitos detalhados |
| **Letras Hebraicas** | +R$ 4,90/mês | Significados cabalísticos |
| **Geometria Sagrada** | +R$ 4,90/mês | Frequências e formas |
| **Frequências** | +R$ 4,90/mês | Solfeggio diário |
| **Empresa** | +R$ 19,90/mês | Numerologia empresarial |

### 6.3 Custo por Operação

| Operação | Créditos |
|----------|----------|
| Insight rápido | 2 |
| Insight detalhado | 5 |
| Relatório semanal | 15 |
| Relatório mensal | 30 |
| Pergunta ao chat | 1-3 |

---

## 7. Wireframes de Interface

### 7.1 Tela de Login/Registro
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ✦  ✦  ✦                             │
│                                                         │
│              CABALA DOS CAMINHOS                        │
│                                                         │
│         ┌─────────────────────────────────┐            │
│         │  Nome Completo                   │            │
│         └─────────────────────────────────┘            │
│         ┌─────────────────────────────────┐            │
│         │  Email                           │            │
│         └─────────────────────────────────┘            │
│         ┌─────────────────────────────────┐            │
│         │  Data de Nascimento             │            │
│         └─────────────────────────────────┘            │
│         ┌─────────────────────────────────┐            │
│         │  Hora de Nascimento (opcional)   │            │
│         └─────────────────────────────────┘            │
│         ┌─────────────────────────────────┐            │
│         │  Local de Nascimento            │            │
│         └─────────────────────────────────┘            │
│         ┌─────────────────────────────────┐            │
│         │      ✧ INICIAR JORNADA ✧        │            │
│         └─────────────────────────────────┘            │
│                                                         │
│              Já possui conta? Fazer login               │
│                                                         │
│     ◯ ◯ ◯ ◯ ◯ ◯ ◯  (sete estrelas decorativas)        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Dashboard Principal
```
┌─────────────────────────────────────────────────────────┐
│ ✧ CABALA DOS CAMINHOS          [🔔] [⚙️] [👤]          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────┐  ┌─────────────────────────┐ │
│   │  BOA NOITE, LUZ     │  │    ◯ ◯ ◯ ◯ ◯ ◯ ◯       │ │
│   │  Hoje é Domingo     │  │    FASE LUNAR           │ │
│   │  Sol • Xangô        │  │    Lua Crescente         │ │
│   │  ══════════════     │  │    ✦ energizada ✦       │ │
│   └─────────────────────┘  └─────────────────────────┘ │
│                                                         │
│   ┌──────────────────────────────────────────────────┐ │
│   │  SEU CICLO ATUAL                                 │ │
│   │  ┌────────┐ ┌────────┐ ┌────────┐               │ │
│   │  │ ANO    │ │ MÊS    │ │ DIA    │               │ │
│   │  │  7     │ │  4     │ │  3     │               │ │
│   │  │        │ │        │ │        │               │ │
│   │  │ Tiph.  │ │ Chesed │ │ Hod    │               │ │
│   │  └────────┘ └────────┘ └────────┘               │ │
│   └──────────────────────────────────────────────────┘ │
│                                                         │
│   ┌──────────────────────────────────────────────────┐ │
│   │  ✦ INSIGHT DO DIA                               │ │
│   │  "O poder do Sol em você clama por ação..."      │ │
│   │  ───────────────────────────────────────────    │ │
│   │  🧡 AÇÃO: Comece algo que requer brilho...       │ │
│   │  🕯️ RITUAL: Azeite de oliva + visualization...  │ │
│   │  🎨 COR: Dourado                                │ │
│   │  🔢 FREQUÊNCIA: 528 Hz                          │ │
│   └──────────────────────────────────────────────────┘ │
│                                                         │
│   ┌──────────────────────────────────────────────────┐ │
│   │  SUA ÁRVORE DA VIDA                             │ │
│   │            ● Kether                              │ │
│   │           / \                                    │ │
│   │          ●   ● Chokmah/Binah                    │ │
│   │          │   │                                  │ │
│   │    Chesed ●   ● Geburah                         │ │
│   │          │   │                                  │ │
│   │          ●───● Tiphereth ← VOCÊ ESTÁ AQUI       │ │
│   │         / \                                     │ │
│   │        ●   ● Netzach/Hod                        │ │
│   │         \ /                                     │ │
│   │          ● Yesod                                │ │
│   │          │                                      │ │
│   │          ● Malkuth                              │ │
│   └──────────────────────────────────────────────────┘ │
│                                                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│   │ NUMERO   │ │ ODÚ     │ │ CHAKRAS  │ │ ARCANO   │ │
│   │ DESTINO  │ │ NASCIMENTO│ │ EQUILÍBRIO│ │ PESSOAL  │ │
│   │   7      │ │ Okaran   │ │ 4/5      │ │ O MAGO   │ │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                         │
│   ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ │
└─────────────────────────────────────────────────────────┘
```

### 7.3 Calendário Semanal (Kanban)
```
┌─────────────────────────────────────────────────────────┐
│  ✧ CALENDÁRIO DA SEMANA                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │   ☀️    │ │   🔴    │ │   🟡    │ │   🟢    │     │
│  │ SEG     │ │ TER     │ │ QUA     │ │ QUI     │     │
│  │ Omolu   │ │ Ogum    │ │ Xangô   │ │ Oxóssi  │     │
│  │ Saturno │ │ Marte   │ │Mercúrio │ │Júpiter  │     │
│  │ ══════  │ │ ══════  │ │ ══════  │ │ ══════  │     │
│  │         │ │         │ │         │ │         │     │
│  │FAVORECER│ │FAVORECER│ │FAVORECER│ │FAVORECER│     │
│  │• Limpeza│ │• Ação   │ │• Estudo │ │• Fartura│     │
│  │• Aterra │ │• Coragem│ │• Verdade│ │• Expans │     │
│  │         │ │         │ │         │ │         │     │
│  │ EVITAR  │ │ EVITAR  │ │ EVITAR  │ │ EVITAR  │     │
│  │• Carne  │ │• Brigas │ │• Mentir │ │• Pregui │     │
│  │• Pressa │ │• Violên │ │• Abóbora│ │• Avarez │     │
│  │         │ │         │ │         │ │         │     │
│  │ 🕯️ RIT  │ │ 🕯️ RIT  │ │ 🕯️ RIT  │ │ 🕯️ RIT  │     │
│  │ Canela  │ │ Guiné   │ │ Alecrim │ │Samambaia│     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│  │   ⚪    │ │   🟡    │ │         │                 │
│  │ SEX     │ │ SÁB     │ │ DOM     │                 │
│  │ Oxalá   │ │Oxum/Iem │ │ Xangô   │                 │
│  │ Vênus   │ │Saturno  │ │ Sol     │                 │
│  │ ══════  │ │ ══════  │ │ ══════  │                 │
│  │         │ │         │ │         │                 │
│  │FAVORECER│ │FAVORECER│ │FAVORECER│                 │
│  │• Paz    │ │• Amor   │ │• Poder  │                 │
│  │• Pureza │ │• Fertili│ │• Brilho │                 │
│  │         │ │         │ │         │                 │
│  │ EVITAR  │ │ EVITAR  │ │ EVITAR  │                 │
│  │• Bebidas│ │• Pó/    │ │• Confli │                 │
│  │• Óleo   │ │  Lama   │ │• Impuls │                 │
│  │         │ │         │ │         │                 │
│  │ 🕯️ RIT  │ │ 🕯️ RIT  │ │ 🕯️ RIT  │                 │
│  │ Boldo   │ │ Mel     │ │ Azeite  │                 │
│  └─────────┘ └─────────┘ └─────────┘                 │
│                                                         │
│  ✧ Suas quizilas filtram automaticamente estas rec...  │
└─────────────────────────────────────────────────────────┘
```

### 7.4 Chat de Insights
```
┌─────────────────────────────────────────────────────────┐
│  ✧ CONSULTA ESPIRITUAL                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ✧ Sistema diz:                                   │ │
│  │                                                   │ │
│  │ Olá! Sou seu guia na Cabala dos Caminhos.        │ │
│  │ Hoje, Domingo, seu dia pessoal é 3, regido por  │ │
│  │ Tiphereth (Beleza) e Xangô.                      │ │
│  │                                                   │ │
│  │ Como posso iluminar seu caminho?                 │ │
│  │                                                   │ │
│  │ 📚 TEMAS:                                        │ │
│  │ [Relacionamentos] [Trabalho] [Dinheiro]          │ │
│  │ [Saúde] [Espiritualidade] [Propósito]            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 👤 Você diz:                                     │ │
│  │ Como posso melhorar meu relacionamento?          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ✧ Sistema responde:                              │ │
│  │                                                   │ │
│  │ Seu número de vida 7 combined with Oxé (5) in    │ │
│  │ your birth Odú indica que seus relacionamentos   │ │
│  │ são...                                           │ │
│  │                                                   │ │
│  │ 🕯️ RECOMENDAÇÃO RITUAL:                         │ │
│  │ Banho de Oxum (sábado) com mel e pétalas...      │ │
│  │                                                   │ │
│  │ ⚠️ LEMBRETE:                                     │ │
│  │ Seu Odú proíbe contato excessivo com...          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Digite sua pergunta...                    [ENV]  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  💎 Créditos: 47  |  Custo desta resposta: 2 💎       │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Requisitos Não Funcionais

### 8.1 Performance
- Tempo de carregamento da dashboard: < 2 segundos
- Geração de insights: < 5 segundos
- Cálculos numerológicos: < 500ms
- API de astrologia (trânsitos): < 1 segundo

### 8.2 Segurança
- Autenticação JWT com refresh tokens
- Dados criptografados em repouso
- Conformidade LGPD
- Rate limiting em APIs

### 8.3 Escalabilidade
- Suporte a 10.000+ usuários simultâneos
- Cache inteligente para cálculos frequentes
- CDN para assets estáticos

### 8.4 Acessibilidade
- WCAG 2.1 AA
- Modo de alto contraste
- Leitor de tela compatível
- Navegação por teclado

---

## 9. Roadmap de Implementação

### Fase 1: Fundações (MVP)
1. [ ] Cadastro e autenticação
2. [ ] Cálculos numerológicos básicos (4 tipos)
3. [ ] Dashboard principal com resumo
4. [ ] Base de conhecimento inicial (correlações básicas)
5. [ ] Calendário semanal simples

### Fase 2: Profundidade
1. [ ] Todos os tipos de numerologia (9)
2. [ ] Cálculo de Odús completo
3. [ ] Mapa astrológico básico
4. [ ] Insights gerados por IA
5. [ ] Sistema de créditos

### Fase 3: Expansão
1. [ ] Trânsitos planetários em tempo real
2. [ ] Chat com IA por tema
3. [ ] Módulos adicionais
4. [ ] Relatórios detalhados

### Fase 4: Ecossistema
1. [ ] Numerologia empresarial
2. [ ] App mobile
3. [ ] Integrações (calendários, wearables)
4. [ ] Comunidade de praticantes

---

## 10. Glossário de Termos

| Termo | Definição |
|-------|-----------|
| **Axé** | Energia vital, força espiritual |
| **Caminho (Sefá)** | Cada uma das 22 trilhas da Árvore da Vida |
| **Ebó** | Oferta, sacrifício espiritual |
| **Egrégora** | Campo energético coletivo de um grupo |
| **Ibeji** | Gêmeos (orixás Ibeji) |
| **Ori** | Cabeça, mas também a alma, destino pessoal |
| **Orixá** | Emanação de Deus, força da natureza |
| **Quizila** | Proibição, tabu espiritual |
| **Sefirot** | 10 emanações da Árvore da Vida |
| **Xiré** | Saudação, abertura ritualística |

---

*Documento criado para orientar o desenvolvimento do sistema Cabala dos Caminhos*
*Versão: 1.0 | Data: 2025-05-27*
