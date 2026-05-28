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