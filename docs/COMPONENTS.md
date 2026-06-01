# Components Reference - Cabala dos Caminhos

Lista de componentes React do projeto.

## Componentes UI (Base)

Estes componentes são parte do sistema de design base (shadcn/ui).

### Button

Botão interativo com suporte a variantes e tamanhos.

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="default">
  Clique aqui
</Button>
```

**Props:**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `variant` | `default` \| `destructive` \| `outline` \| `secondary` \| `ghost` \| `link` | `default` | Variante visual |
| `size` | `default` \| `sm` \| `lg` \| `icon` | `default` | Tamanho |
| `disabled` | boolean | `false` | Estado desabilitado |

---

### Card

Componente container para agrupar conteúdo relacionado.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo do card
  </CardContent>
</Card>
```

**Sub-componentes:**
- `CardHeader` - Área de cabeçalho
- `CardTitle` - Título do card
- `CardDescription` - Descrição opcional
- `CardContent` - Conteúdo principal
- `CardFooter` - Rodapé opcional

---

### Input

Campo de entrada de texto.

```tsx
import { Input } from '@/components/ui/input';

<Input 
  type="text" 
  placeholder="Digite seu nome" 
/>
```

**Props:**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `type` | HTML input types | `text` | Tipo do input |
| `placeholder` | string | - | Placeholder |
| `disabled` | boolean | `false` | Estado desabilitado |

---

### Badge

Etiqueta para destacar informações.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Status</Badge>
```

**Variantes:** `default` | `secondary` | `destructive` | `outline`

---

### Dialog

Modal de diálogo sobreposto.

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    Conteúdo do diálogo
  </DialogContent>
</Dialog>
```

---

### Select

Dropdown de seleção.

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select onValueChange={handleChange}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Opção 1</SelectItem>
    <SelectItem value="2">Opção 2</SelectItem>
  </SelectContent>
</Select>
```

---

### Tabs

Navegação por abas.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Conteúdo 1</TabsContent>
  <TabsContent value="tab2">Conteúdo 2</TabsContent>
</Tabs>
```

---

### Skeleton

Placeholder de carregamento.

```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="w-full h-4" />
```

---

### ScrollArea

Área com scroll customizado.

```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

<ScrollArea className="h-[200px]">
  Conteúdo scrollável
</ScrollArea>
```

---

## Componentes do Dashboard

### InsightDiario

Componente que exibe e gera insights diários personalizados.

**Localização:** `src/components/dashboard/InsightDiario.tsx`

```tsx
import { InsightDiario } from '@/components/dashboard/InsightDiario';

<InsightDiario 
  dataNascimento="1990-05-15"
  nome="João Silva"
  odu="Irosun"
  numeroPessoal={7}
/>
```

**Props:**

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `dataNascimento` | string | Sim | Data de nascimento (YYYY-MM-DD) |
| `nome` | string | Sim | Nome completo |
| `odu` | string | Não | Odú de nascimento |
| `numeroPessoal` | number | Não | Número pessoal |

**Funcionalidades:**
- Gera insight diário via API `/api/insights/diario`
- Consome 1 crédito por geração
- Exibe loading state com skeleton
- Mostra erro de créditos insuficientes

---

### ChakrasExplorer

Visualização interativa dos 7 chakras com correspondências espirituais.

**Localização:** `src/components/dashboard/ChakrasExplorer.tsx`

```tsx
import { ChakrasExplorer } from '@/components/dashboard/ChakrasExplorer';

<ChakrasExplorer />
```

**Dados exibidos:**
- Nome do chakra
- Cor associada
- Orixá regente
- Planeta regente
- Elemento
- Frequência Solfeggio
- Mantra
- Função espiritual

---

### OrixasExplorer

Explorador dos Orixás com informações detalhadas.

**Localização:** `src/components/dashboard/OrixasExplorer.tsx`

```tsx
import { OrixasExplorer } from '@/components/dashboard/OrixasExplorer';

<OrixasExplorer />
```

---

### OdusExplorer

Visualizador dos 16 Odús do Merindilogun.

**Localização:** `src/components/dashboard/OdusExplorer.tsx`

```tsx
import { OdusExplorer } from '@/components/dashboard/OdusExplorer';

<OdusExplorer />
```

---

### GeometriaSagradaExplorer

Explorador de geometrias sagradas e frequências.

**Localização:** `src/components/dashboard/GeometriaSagradaExplorer.tsx`

```tsx
import { GeometriaSagradaExplorer } from '@/components/dashboard/GeometriaSagradaExplorer';

<GeometriaSagradaExplorer />
```

---

### FrequenciasExplorer

Visualizador de frequências Solfeggio e sons divinos.

**Localização:** `src/components/dashboard/FrequenciasExplorer.tsx`

```tsx
import { FrequenciasExplorer } from '@/components/dashboard/FrequenciasExplorer';

<FrequenciasExplorer />
```

---

### NumerologiaEmpresarial

Calculadora de numerologia empresarial.

**Localização:** `src/components/dashboard/NumerologiaEmpresarial.tsx`

```tsx
import { NumerologiaEmpresarial } from '@/components/dashboard/NumerologiaEmpresarial';

<NumerologiaEmpresarial />
```

---

### CalendarioEspiritual

Calendário espiritual com correspondências por dia.

**Localização:** `src/components/dashboard/CalendarioEspiritual.tsx`

```tsx
import { CalendarioEspiritual } from '@/components/dashboard/CalendarioEspiritual';

<CalendarioEspiritual />
```

---

### VisualizadorPlanetas

Visualizador de posições planetárias.

**Localização:** `src/components/dashboard/VisualizadorPlanetas.tsx`

```tsx
import { VisualizadorPlanetas } from '@/components/dashboard/VisualizadorPlanetas';

<VisualizadorPlanetas />
```

---

### TransitosAtivos

Exibe trânsitos planetários ativos.

**Localização:** `src/components/astrologia/TransitosAtivos.tsx`

```tsx
import { TransitosAtivos } from '@/components/astrologia/TransitosAtivos';

<TransitosAtivos />
```

---

### MapaNatalCard

Card de resumo do mapa natal.

**Localização:** `src/components/astrologia/MapaNatalCard.tsx`

```tsx
import { MapaNatalCard } from '@/components/astrologia/MapaNatalCard';

<MapaNatalCard mapaNatal={mapa} />
```

---

### CartasLenormand

Explorador do baralho Lenormand (36 cartas).

**Localização:** `src/components/dashboard/CartasLenormand.tsx`

```tsx
import { CartasLenormand } from '@/components/dashboard/CartasLenormand';

<CartasLenormand />
```

---

## Componentes de Autenticação

### AuthGuard

Protege rotas que requerem autenticação.

**Localização:** `src/components/auth/AuthGuard.tsx`

```tsx
import { AuthGuard } from '@/components/auth/AuthGuard';

<AuthGuard>
  <DashboardConteudo />
</AuthGuard>
```

---

## Providers

### SupabaseProvider

Provider do cliente Supabase.

**Localização:** `src/components/providers/SupabaseProvider.tsx`

```tsx
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';

<SupabaseProvider>
  <App />
</SupabaseProvider>
```

---

## Hooks Personalizados

### useCreditos

Hook para gerenciar créditos do usuário.

```tsx
import { useCreditos } from '@/lib/hooks';

function MeuComponente() {
  const { creditos, loading, error, debitar, adicionar } = useCreditos();
  
  // ...
}
```

**Retorno:**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `creditos` | number \| null | Saldo atual |
| `loading` | boolean | Estado de carregamento |
| `error` | string \| null | Mensagem de erro |
| `debitar(quantidade, operacao)` | function | Debita créditos |
| `adicionar(quantidade, descricao)` | function | Adiciona créditos |

---

### useNumerologia

Hook para cálculos numerológicos.

```tsx
import { useNumerologia } from '@/lib/hooks';

const { calcular, resultado, loading } = useNumerologia();
const numerico = calcular('pitagorica', 'Maria Silva');
```

---

### useOdus

Hook para cálculos de Odús.

```tsx
import { useOdus } from '@/lib/hooks';

const { calcularOdus, odus, loading } = useOdus();
const resultado = calcularOdus('1990-05-15');
```

---

### useCiclos

Hook para ciclos temporais.

```tsx
import { useCiclos } from '@/lib/hooks';

const { ciclos, anoPessoal, mesPessoal, diaPessoal } = useCiclos(dataNascimento);
```

---

### useMapaNatal

Hook para cálculo de mapa natal.

```tsx
import { useMapaNatal } from '@/hooks/useMapaNatal';

const { mapa, aspectos, loading, error } = useMapaNatal({
  dataNascimento: '1990-05-15',
  horaNascimento: '14:30',
  latitude: -23.5505,
  longitude: -46.6333
});
```

---

### usePWA

Hook para funcionalidades PWA.

```tsx
import { usePWA } from '@/hooks/usePWA';

const { 
  isOnline,           //boolean
  isStandalone,       //boolean
  canInstall,         //boolean
  installPrompt,      //BeforeInstallPromptEvent | null
  serviceWorkerReady, //boolean
  updateAvailable,    //boolean
  pendingSyncs,       //number
  install,            //function
  syncPending         //function
} = usePWA();
```

---

## Componentes de Interface

### ErrorBoundary

Captura erros de renderização.

**Localização:** `src/components/ui/ErrorBoundary.tsx`

```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### TooltipInfo

Tooltip informativo.

**Localização:** `src/components/ui/tooltip-info.tsx`

```tsx
import { TooltipInfo } from '@/components/ui/tooltip-info';

<TooltipInfo content="Informação adicional">
  <span>Hover me</span>
</TooltipInfo>
```

---

## Componentes de Correlação Espiritual (Core)

Estes componentes são o **CORE** do sistema Cabala dos Caminhos, implementando a visão de integração entre tradições.

### CorrelationViz

Visualização interativa das correlações entre sistemas espirituais.

**Localização:** `src/components/dashboard/CorrelationViz.tsx`

```tsx
import { CorrelationViz } from '@/components/dashboard/CorrelationViz';

<CorrelationViz 
  userData={{
    sign: 'Escorpiao',
    numeroPessoal: 11,
    odu: 'Irosun',
    sefirotDominante: ['Binah', 'Yesod']
  }}
/>
```

**Funcionalidades:**
- Mostra correlações entre Numerologia, Astrologia, Ifá e Kabbalah
- Destaca padrões identificados (Luz, Sabedoria, Transformação, etc.)
- Exibe força de correlação (0-1) entre sistemas

---

### CorrelationAnalysisPanel

Painel de análise detalhada de correlações.

**Localização:** `src/components/dashboard/CorrelationAnalysisPanel.tsx`

```tsx
import { CorrelationAnalysisPanel } from '@/components/dashboard/CorrelationAnalysisPanel';

<CorrelationAnalysisPanel 
  correlations={[
    { source: 'numerology', target: 'astrology', strength: 0.9 }
  ]}
/>
```

---

### CrossSystemDivination

Componente de divinização que integra múltiplos sistemas.

**Localização:** `src/components/dashboard/CrossSystemDivination.tsx`

```tsx
import { CrossSystemDivination } from '@/components/dashboard/CrossSystemDivination';

<CrossSystemDivination 
  userId="uuid"
  onComplete={handleDivinationResult}
/>
```

**Funcionalidades:**
- Integra Tarot, Ifá, Numerologia e Astrologia
- Retorna correlações espirituais completas
- Consome 3 créditos por leitura

---

### SpiritualCorrelationViz

Visualização avançada de correlações espirituais.

**Localização:** `src/components/dashboard/SpiritualCorrelationViz.tsx`

```tsx
import { SpiritualCorrelationViz } from '@/components/dashboard/SpiritualCorrelationViz';

<SpiritualCorrelationViz patterns={detectedPatterns} />
```

---

### ChakraBalanceWidget

Widget para visualização e equilíbrio de chakras.

**Localização:** `src/components/dashboard/ChakraBalanceWidget.tsx`

```tsx
import { ChakraBalanceWidget } from '@/components/dashboard/ChakraBalanceWidget';

<ChakraBalanceWidget />
```

**Dados exibidos:**
- 7 chakras com níveis de energia
- Excesso/deficiência identificado
- Recomendações de práticas

---

### ElementalBalance

Widget de equilíbrio elemental.

**Localização:** `src/components/dashboard/ElementalBalance.tsx`

```tsx
import { ElementalBalance } from '@/components/dashboard/ElementalBalance';

<ElementalBalance 
  elementos={{ fogo: 2, agua: 3, terra: 1, ar: 2 }}
/>
```

---

### DayEnergyWidget

Widget de energia do dia com Orixá regente.

**Localização:** `src/components/dashboard/DayEnergyWidget.tsx`

```tsx
import { DayEnergyWidget } from '@/components/dashboard/DayEnergyWidget';

<DayEnergyWidget />
```

**Dados exibidos:**
- Orixá do dia
- Elemento regente
- Prática recomendada
- Évoca sagrada

---

### AstrologicalTransits

Widget de trânsitos astrológicos ativos.

**Localização:** `src/components/dashboard/AstrologicalTransits.tsx`

```tsx
import { AstrologicalTransits } from '@/components/dashboard/AstrologicalTransits';

<AstrologicalTransits />
```

---

### LunarPhaseWidget

Widget de fase lunar e ritual recomendado.

**Localização:** `src/components/dashboard/LunarPhaseWidget.tsx`

```tsx
import { LunarPhaseWidget } from '@/components/dashboard/LunarPhaseWidget';

<LunarPhaseWidget />
```

---

### ArvoreVida

Visualização da Árvore da Vida Cabalística.

**Localização:** `src/components/dashboard/ArvoreVida.tsx`

```tsx
import { ArvoreVida } from '@/components/dashboard/ArvoreVida';

<ArvoreVida 
  activeSefirot={['Kether', 'Chokhmah', 'Binah']}
/>
```

---

### OduDivinationWidget

Widget de divinização por Odús.

**Localização:** `src/components/dashboard/OduDivinationWidget.tsx`

```tsx
import { OduDivinationWidget } from '@/components/dashboard/OduDivinationWidget';

<OduDivinationWidget />
```

---

### UnifiedSpiritualFlow

Fluxo espiritual unificado integrando todos os sistemas.

**Localização:** `src/components/dashboard/UnifiedSpiritualFlow.tsx`

```tsx
import { UnifiedSpiritualFlow } from '@/components/dashboard/UnifiedSpiritualFlow';

<UnifiedSpiritualFlow 
  userProfile={profile}
/>
```

---

### EnergyFlowWidget

Widget de fluxo de energia espiritual.

**Localização:** `src/components/dashboard/EnergyFlowWidget.tsx`

```tsx
import { EnergyFlowWidget } from '@/components/dashboard/EnergyFlowWidget';

<EnergyFlowWidget />
```

---

## Widgets de Insights (AI-Powered)

### AIOracleChat

Chat com oráculo espiritual AI.

**Localização:** `src/components/dashboard/AIOracleChat.tsx`

```tsx
import { AIOracleChat } from '@/components/dashboard/AIOracleChat';

<AIOracleChat 
  userId="uuid"
  tema="espiritualidade"
/>
```

**Custo:** 2 créditos por mensagem

---

### AIRecommendationsEngine

Motor de recomendações personalizado.

**Localização:** `src/components/dashboard/AIRecommendationsEngine.tsx`

```tsx
import { AIRecommendationsEngine } from '@/components/dashboard/AIRecommendationsEngine';

<AIRecommendationsEngine 
  userData={userProfile}
/>
```

---

### PredictiveInsightsPanel

Painel de insights preditivos.

**Localização:** `src/components/dashboard/PredictiveInsightsPanel.tsx`

```tsx
import { PredictiveInsightsPanel } from '@/components/dashboard/PredictiveInsightsPanel';

<PredictiveInsightsPanel />
```

---

### RealTimeInsightsPanel

Painel de insights em tempo real.

**Localização:** `src/components/dashboard/RealTimeInsightsPanel.tsx`

```tsx
import { RealTimeInsightsPanel } from '@/components/dashboard/RealTimeInsightsPanel';

<RealTimeInsightsPanel />
```

---

### PredictiveSynthesisPanel

Painel de síntese preditiva.

**Localização:** `src/components/dashboard/PredictiveSynthesisPanel.tsx`

```tsx
import { PredictiveSynthesisPanel } from '@/components/dashboard/PredictiveSynthesisPanel';

<PredictiveSynthesisPanel />
```

---

### CrossCorrelationWidget

Widget de correlações cruzadas.

**Localização:** `src/components/dashboard/CrossCorrelationWidget.tsx`

```tsx
import { CrossCorrelationWidget } from '@/components/dashboard/CrossCorrelationWidget';

<CrossCorrelationWidget />
```

---

### CorrelationPredictionsWidget

Widget de predições baseadas em correlações.

**Localização:** `src/components/dashboard/CorrelationPredictionsWidget.tsx`

```tsx
import { CorrelationPredictionsWidget } from '@/components/dashboard/CorrelationPredictionsWidget';

<CorrelationPredictionsWidget />
```

---

## Widgets de Prática Espiritual

### DailyRitualWidget

Widget de ritual diário recomendado.

**Localização:** `src/components/dashboard/DailyRitualWidget.tsx`

```tsx
import { DailyRitualWidget } from '@/components/dashboard/DailyRitualWidget';

<DailyRitualWidget />
```

---

### GuidedMeditationWidget

Widget de meditação guiada.

**Localização:** `src/components/dashboard/GuidedMeditationWidget.tsx`

```tsx
import { GuidedMeditationWidget } from '@/components/dashboard/GuidedMeditationWidget';

<GuidedMeditationWidget />
```

---

### AffirmationWidget

Widget de afirmações diárias.

**Localização:** `src/components/dashboard/AffirmationWidget.tsx`

```tsx
import { AffirmationWidget } from '@/components/dashboard/AffirmationWidget';

<AffirmationWidget 
  odu="Irosun"
  numeroPessoal={7}
/>
```

---

### RitualReminderWidget

Widget de lembretes de ritual.

**Localização:** `src/components/dashboard/RitualReminderWidget.tsx`

```tsx
import { RitualReminderWidget } from '@/components/dashboard/RitualReminderWidget';

<RitualReminderWidget />
```

---

### SacredCalendar

Calendário espiritual com eventos sagrados.

**Localização:** `src/components/dashboard/SacredCalendar.tsx`

```tsx
import { SacredCalendar } from '@/components/dashboard/SacredCalendar';

<SacredCalendar />
```

---

## Widgets de Progresso

### SpiritualProgressWidget

Widget de progresso espiritual.

**Localização:** `src/components/dashboard/SpiritualProgressWidget.tsx`

```tsx
import { SpiritualProgressWidget } from '@/components/dashboard/SpiritualProgressWidget';

<SpiritualProgressWidget />
```

---

### GamificationHub

Hub de gamificação e conquistas.

**Localização:** `src/components/dashboard/GamificationHub.tsx`

```tsx
import { GamificationHub } from '@/components/dashboard/GamificationHub';

<GamificationHub />
```

---

### SelfEvolutionTracker

Rastreador de auto-evolução.

**Localização:** `src/components/dashboard/SelfEvolutionTracker.tsx`

```tsx
import { SelfEvolutionTracker } from '@/components/dashboard/SelfEvolutionTracker';

<SelfEvolutionTracker />
```

---

### JourneyTracker

Rastreador de jornada espiritual.

**Localização:** `src/components/dashboard/JourneyTracker.tsx`

```tsx
import { JourneyTracker } from '@/components/dashboard/JourneyTracker';

<JourneyTracker />
```

---

## Estilos e CSS

### Variáveis CSS (globals.css)

O projeto define variáveis CSS para customização:

```css
:root {
  /* Cores */
  --background: #000000;
  --foreground: #ffffff;
  --card: #0a0a0a;
  --primary: #8b5cf6;
  --secondary: #1e1e1e;
  --muted: #3f3f46;
  --accent: #f59e0b;
  
  /* Bordas */
  --border: #27272a;
  --radius: 0.75rem;
}
```

---

## Tipos Principais

### MapaNatal (Astrologia)

```typescript
interface MapaNatal {
  planeta: {
    sol: PosicaoPlaneta;
    lua: PosicaoPlaneta;
    mercurio: PosicaoPlaneta;
    venus: PosicaoPlaneta;
    marte: PosicaoPlaneta;
    jupiter: PosicaoPlaneta;
    saturno: PosicaoPlaneta;
    urano: PosicaoPlaneta;
    netuno: PosicaoPlaneta;
    plutao: PosicaoPlaneta;
  };
  casas: Casa[];
  ascendente: number;
  mediumCoeli: number;
  nodes: { norte: PosicaoPlaneta; sul: PosicaoPlaneta; };
}
```

### ChatMessage

```typescript
interface MensagemChat {
  id: string;
  tipo: 'usuario' | 'assistente';
  conteudo: string;
  tema?: TemaChat;
  timestamp: Date;
}
```