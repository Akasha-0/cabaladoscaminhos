'use client';

/**
 * ============================================================================
 * /design-system — Design System Storybook
 * ============================================================================
 * Internal showcase route for the Akasha Portal design system.
 * Visit http://localhost:3000/design-system to see all 8 base components,
 * the spiritual variant extensions, color tokens, spacing scale, and
 * typography ramp in one page.
 *
 * Production: this route stays live as living documentation for designers,
 * developers, and contributors. It is NOT excluded from the bundle (cost is
 * < 10KB JS — acceptable for a docs surface).
 * ============================================================================
 */

import { useState } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Check,
  Heart,
  Mail,
  Lock,
  Search,
  Inbox,
  Compass,
  Loader2,
} from 'lucide-react';

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Badge,
  Divider,
  Loading,
  Empty,
  Error as ErrorState,
} from '@/components/design-system';
import { tokens, palette, semanticColor } from '@/lib/design-system/tokens';
import { cn } from '@/lib/utils';

type Section = {
  id: string;
  title: string;
  description: string;
};

const sections: Section[] = [
  { id: 'overview', title: 'Visão geral', description: 'Como o sistema funciona' },
  { id: 'colors', title: 'Cores', description: 'Paleta + tokens semânticos' },
  { id: 'typography', title: 'Tipografia', description: 'Fontes, escalas, pesos' },
  { id: 'spacing', title: 'Espaçamento', description: 'Spacing scale + radius' },
  { id: 'shadows', title: 'Sombras', description: 'Elevações + glows espirituais' },
  { id: 'button', title: 'Button', description: 'Ações primárias e espirituais' },
  { id: 'card', title: 'Card', description: 'Containers e composição' },
  { id: 'input', title: 'Input', description: 'Formulários' },
  { id: 'badge', title: 'Badge', description: 'Etiquetas e status' },
  { id: 'divider', title: 'Divider', description: 'Separadores visuais' },
  { id: 'loading', title: 'Loading', description: 'Spinner, skeleton, overlay' },
  { id: 'empty', title: 'Empty', description: 'Estados vazios' },
  { id: 'error', title: 'Error', description: 'Estados de erro' },
];

function PageHeader() {
  return (
    <header className="border-b border-border/50 bg-gradient-to-br from-[var(--spiritual-gold-muted)]/30 via-transparent to-[var(--spiritual-violet-muted)]/30">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Badge variant="outline" className="mb-4 border-[var(--spiritual-gold)]/40 text-[var(--spiritual-gold)]">
          <Sparkles className="mr-1 h-3 w-3" />
          Design System v0.1
        </Badge>
        <h1 className="font-cinzel text-4xl font-bold text-foreground md:text-5xl">
          Akasha Portal
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
          8 componentes base + tokens. Mobile-first, espiritual, fundamentado em
          tradições ancestrais + design system moderno.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild={false}>
            <a href="#button">Ver componentes</a>
          </Button>
          <Button variant="outline" asChild={false}>
            <a href="#colors">Tokens</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

function SectionNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <ul className="flex gap-1 overflow-x-auto py-3 text-sm">
          {sections.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-border/30 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8">
          <h2 className="font-cinzel text-2xl font-semibold text-foreground md:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function ColorSwatch({
  name,
  hex,
  className,
}: {
  name: string;
  hex: string;
  className?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/40 bg-card">
      <div
        className={cn('h-16 w-full', className)}
        style={!className ? { backgroundColor: hex } : undefined}
        aria-label={`Cor ${name}: ${hex}`}
      />
      <div className="space-y-0.5 p-3 text-xs">
        <p className="font-medium text-foreground">{name}</p>
        <p className="font-mono text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}

function PaletteGroup({
  title,
  colors,
}: {
  title: string;
  colors: { name: string; hex: string; className?: string }[];
}) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {colors.map((c) => (
          <ColorSwatch key={c.name} name={c.name} hex={c.hex} className={c.className} />
        ))}
      </div>
    </div>
  );
}

function TypeSample({ size, label }: { size: keyof typeof tokens.fontSize; label: string }) {
  const [fs, lh] = tokens.fontSize[size];
  return (
    <div className="flex items-baseline justify-between border-b border-border/30 py-2 last:border-0">
      <div>
        <span className="text-xs font-mono text-muted-foreground">
          {size} · {fs}
        </span>
        <p
          className="font-sans text-foreground"
          style={{ fontSize: fs, lineHeight: lh.lineHeight }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function ExampleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/50 p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

/* ======================================================================== */
/*  Page                                                                     */
/* ======================================================================== */

export default function DesignSystemPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(true);

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-screen bg-background text-foreground">
      <PageHeader />
      <SectionNav />

      {/* Overview ------------------------------------------------------ */}
      <Section
        id="overview"
        title="Visão geral"
        description="Como o sistema está organizado e onde encontrar cada coisa"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Tokens</CardTitle>
              <CardDescription>
                Single source of truth em <code>tokens.ts</code> +{' '}
                <code>globals.css</code>.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>8 componentes base</CardTitle>
              <CardDescription>
                Button · Card · Input · Badge · Divider · Loading · Empty · Error
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Spiritual variants</CardTitle>
              <CardDescription>
                Golden, violet, chakra — extensões semânticas do sistema base.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Section>

      {/* Colors -------------------------------------------------------- */}
      <Section id="colors" title="Cores" description="Paleta + tokens semânticos">
        <PaletteGroup
          title="Slate (neutros)"
          colors={Object.entries(palette.slate).map(([k, v]) => ({
            name: `slate.${k}`,
            hex: v,
          }))}
        />
        <PaletteGroup
          title="Spiritual · Gold"
          colors={[
            { name: 'gold.DEFAULT', hex: palette.gold.DEFAULT },
            { name: 'gold.light', hex: palette.gold.light },
            { name: 'gold.dark', hex: palette.gold.dark },
          ]}
        />
        <PaletteGroup
          title="Spiritual · Violet"
          colors={[
            { name: 'violet.DEFAULT', hex: palette.violet.DEFAULT },
            { name: 'violet.deep', hex: palette.violet.deep },
          ]}
        />
        <PaletteGroup
          title="Chakras"
          colors={Object.entries(palette.chakra).map(([k, v]) => ({
            name: `chakra.${k}`,
            hex: v,
          }))}
        />
        <PaletteGroup
          title="Orixás (dia + planeta)"
          colors={Object.entries(palette.orixa).map(([k, v]) => ({
            name: `orixa.${k}`,
            hex: v,
          }))}
        />
        <div className="mt-6 rounded-lg border border-dashed border-border p-4">
          <p className="text-xs text-muted-foreground">
            Tokens semânticos resolvem via CSS vars:{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              bg-[var(--background)]
            </code>
            ,{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              text-[var(--foreground)]
            </code>
            . Veja <code>semanticColor</code> em <code>tokens.ts</code>.
          </p>
        </div>
      </Section>

      {/* Typography ---------------------------------------------------- */}
      <Section id="typography" title="Tipografia" description="Escala + fontes">
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/40 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sans · Raleway
            </p>
            <p className="font-sans text-2xl text-foreground">
              O despertar da consciência coletiva.
            </p>
          </div>
          <div className="rounded-xl border border-border/40 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Heading · Cinzel
            </p>
            <p className="font-cinzel text-2xl text-[var(--spiritual-gold)]">
              Espírito · Sabedoria · Comunidade
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border/40 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Escala
          </p>
          <TypeSample size="xs" label="Texto auxiliar (xs · 12px)" />
          <TypeSample size="sm" label="Texto padrão secundário (sm · 14px)" />
          <TypeSample size="base" label="Texto base (base · 16px)" />
          <TypeSample size="lg" label="Texto destacado (lg · 18px)" />
          <TypeSample size="xl" label="Subtítulo (xl · 20px)" />
          <TypeSample size="2xl" label="Título de seção (2xl · 24px)" />
          <TypeSample size="3xl" label="Título grande (3xl · 30px)" />
        </div>
      </Section>

      {/* Spacing ------------------------------------------------------- */}
      <Section id="spacing" title="Espaçamento + radius" description="Escala visual consistente">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border/40 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Spacing scale (px → rem)
            </p>
            <div className="space-y-2">
              {[1, 2, 4, 8, 12, 16, 24].map((n) => (
                <div key={n} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-mono text-muted-foreground">
                    {tokens.spacing[n as keyof typeof tokens.spacing]}
                  </span>
                  <div
                    className="h-3 rounded bg-[var(--spiritual-gold)]/70"
                    style={{ width: tokens.spacing[n as keyof typeof tokens.spacing] }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border/40 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Radius (border-radius)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((r) => (
                <div key={r} className="text-center">
                  <div
                    className="mx-auto h-14 w-14 border-2 border-[var(--spiritual-violet)] bg-[var(--spiritual-violet-muted)]"
                    style={{ borderRadius: tokens.radius[r] }}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Shadows ------------------------------------------------------- */}
      <Section id="shadows" title="Sombras" description="Elevações + glows espirituais">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm">
            <p className="text-xs font-mono text-muted-foreground">shadow-sm</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card p-5 shadow-md">
            <p className="text-xs font-mono text-muted-foreground">shadow-md</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card p-5 shadow-lg">
            <p className="text-xs font-mono text-muted-foreground">shadow-lg</p>
          </div>
          <div className="rounded-xl border border-[var(--spiritual-gold)]/40 bg-card p-5 shadow-[var(--shadow-glow-gold)]">
            <p className="text-xs font-mono text-[var(--spiritual-gold)]">
              glow-gold
            </p>
          </div>
        </div>
      </Section>

      {/* Button -------------------------------------------------------- */}
      <Section id="button" title="Button" description="7 variants · 6 sizes · estado espiritual">
        <div className="space-y-6">
          <ExampleCard title="Variants">
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">
                <Trash2 className="mr-1 h-4 w-4" />
                Destructive
              </Button>
              <Button variant="link">Link</Button>
              <Button variant="golden">
                <Sparkles className="mr-1 h-4 w-4" />
                Golden
              </Button>
              <Button variant="golden-outline">Golden outline</Button>
            </div>
          </ExampleCard>
          <ExampleCard title="Sizes">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">xs</Button>
              <Button size="sm">sm</Button>
              <Button size="default">default</Button>
              <Button size="lg">lg</Button>
              <Button size="icon" aria-label="enviar">
                <Send />
              </Button>
            </div>
          </ExampleCard>
          <ExampleCard title="States">
            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button onClick={() => setLoading((v) => !v)}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? 'Loading…' : 'Toggle loading'}
              </Button>
            </div>
          </ExampleCard>
        </div>
      </Section>

      {/* Card ---------------------------------------------------------- */}
      <Section id="card" title="Card" description="Compound · 6 subcomponentes">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Número de Vida 11</CardTitle>
              <CardDescription>
                Caminho de espiritualidade elevada e intuição amplificada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Conecte-se com a meditação diária e cultive o silêncio interior.
                Odu regente: <strong className="text-foreground">Alafia</strong> (paz).
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <Badge variant="secondary">Água + Mestre</Badge>
              <Button size="sm" variant="ghost">
                Explorar
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prática da semana</CardTitle>
              <CardDescription>Banho de ervas · Iansã · terça-feira</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Energia de Marte + Iansã favorece mudanças e coragem.
                Combine com respiração consciente por 5 minutos.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="golden" size="sm" className="w-full">
                <Heart className="mr-1 h-4 w-4" />
                Marcar como feito
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* Input --------------------------------------------------------- */}
      <Section id="input" title="Input" description="Formulários · estados · ícones">
        <div className="grid gap-4 md:grid-cols-2">
          <ExampleCard title="Default">
            <Input placeholder="Nome completo" />
          </ExampleCard>
          <ExampleCard title="Com label + erro">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-foreground">E-mail</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                aria-invalid={!email.includes('@') && email.length > 0}
              />
            </label>
          </ExampleCard>
          <ExampleCard title="Com ícone (lucide)">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar artigos, práticas, tradições…"
                className="pl-8"
              />
            </div>
          </ExampleCard>
          <ExampleCard title="Disabled">
            <Input disabled placeholder="Conta bloqueada" />
          </ExampleCard>
          <ExampleCard title="Password">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="pl-8"
              />
            </div>
          </ExampleCard>
        </div>
      </Section>

      {/* Badge --------------------------------------------------------- */}
      <Section id="badge" title="Badge" description="Status · etiquetas · contadores">
        <ExampleCard title="Variants">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="link">Link</Badge>
            <Badge className="bg-[var(--spiritual-gold-muted)] text-[var(--spiritual-gold-dark)]">
              <Sparkles className="mr-1 h-3 w-3" />
              Golden
            </Badge>
            <Badge className="bg-[var(--spiritual-violet-muted)] text-[var(--spiritual-violet)]">
              Violet
            </Badge>
            <Badge>
              <Mail className="mr-1 h-3 w-3" />
              3 mensagens
            </Badge>
          </div>
        </ExampleCard>
      </Section>

      {/* Divider ------------------------------------------------------- */}
      <Section id="divider" title="Divider" description="Separadores horizontais e verticais">
        <div className="space-y-8">
          <ExampleCard title="Horizontal variants">
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">default</p>
                <Divider />
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">subtle</p>
                <Divider variant="subtle" />
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">spiritual (gold)</p>
                <Divider variant="spiritual" thickness="medium" />
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">glow</p>
                <Divider variant="glow" thickness="thick" />
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">with label</p>
                <Divider label="ou" />
              </div>
            </div>
          </ExampleCard>
          <ExampleCard title="Vertical">
            <div className="flex h-16 items-center gap-3">
              <span className="text-sm">Item A</span>
              <Divider orientation="vertical" />
              <span className="text-sm">Item B</span>
              <Divider orientation="vertical" thickness="medium" />
              <span className="text-sm">Item C</span>
            </div>
          </ExampleCard>
        </div>
      </Section>

      {/* Loading ------------------------------------------------------- */}
      <Section id="loading" title="Loading" description="Spinner · skeleton · overlay">
        <div className="grid gap-6 md:grid-cols-3">
          <ExampleCard title="Spinner (sizes)">
            <div className="flex items-end justify-around">
              <Loading size="sm" />
              <Loading size="md" />
              <Loading size="lg" />
            </div>
          </ExampleCard>
          <ExampleCard title="Spinner + message">
            <Loading message="Carregando tradição Ifá…" />
          </ExampleCard>
          <ExampleCard title="Skeleton">
            <Loading variant="skeleton" lines={4} />
          </ExampleCard>
        </div>
      </Section>

      {/* Empty --------------------------------------------------------- */}
      <Section id="empty" title="Empty" description="Estados vazios · placeholders">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <Empty
              icon={<Compass className="h-1/2 w-1/2" />}
              title="Nenhuma jornada iniciada ainda"
              description="Comece sua primeira leitura de numerologia cabalística e descubra seu caminho de vida."
              action={{ label: 'Iniciar leitura', href: '/validacao' }}
              secondaryAction={{ label: 'Saber mais', href: '/explore' }}
            />
          </Card>
          <Card>
            <Empty
              variant="spiritual"
              icon={<Inbox className="h-1/2 w-1/2" />}
              title="Sem notificações"
              description="Quando alguém interagir com você, aparecerá aqui."
              size="sm"
            />
          </Card>
        </div>
      </Section>

      {/* Error --------------------------------------------------------- */}
      <Section id="error" title="Error" description="Painel + inline · 3 severities">
        <div className="space-y-6">
          <ExampleCard title="Painel · error">
            <ErrorState
              error={new Error('Network timeout — não foi possível carregar artigos.')}
              onRetry={() => setHasError((v) => !v)}
            />
          </ExampleCard>
          <ExampleCard title="Painel · warning">
            <ErrorState
              severity="warning"
              title="Sincronização atrasada"
              description="Algumas práticas podem não estar atualizadas."
              onRetry={() => undefined}
            />
          </ExampleCard>
          <ExampleCard title="Painel · critical">
            <ErrorState
              severity="critical"
              title="Sessão expirada"
              description="Faça login novamente para continuar."
              retryLabel="Entrar"
              onRetry={() => undefined}
            />
          </ExampleCard>
          <ExampleCard title="Inline alert">
            <ErrorState
              inline
              size="sm"
              title="Não foi possível enviar a mensagem"
              description="Verifique sua conexão e tente novamente."
              onRetry={() => undefined}
            />
          </ExampleCard>
        </div>
      </Section>

      {/* Footer -------------------------------------------------------- */}
      <footer className="mx-auto max-w-6xl px-6 py-12 text-center text-sm text-muted-foreground">
        <Divider label="fim" variant="spiritual" className="mb-6" />
        <p>
          Akasha Portal · Design System foundation · {sections.length} seções ·{' '}
          {Object.keys(tokens.spacing).length} tokens de espaçamento
        </p>
      </footer>
    </main>
  );
}
