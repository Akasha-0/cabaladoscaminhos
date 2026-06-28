// ============================================================================
// TEST HELPERS — Mocks compartilhados pelos testes da comunidade
// ============================================================================
// Centraliza os mocks de next/navigation e da UI quebrada (`avatar` nao existe
// no projeto). Cada suite importa de aqui pra evitar duplicacao.
// ============================================================================

import React from 'react';
import { vi } from 'vitest';

// ----- next/navigation -----
// usePathname e usado por CommunityNav para destacar a rota ativa.
// O default e '/' mas cada teste pode sobrescrever via mockReturnValueOnce.
export const usePathnameMock = vi.fn(() => '/feed');

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// ----- next/link -----
// Em testes com jsdom, next/link funciona com stub simples.
// Mantemos semantica de anchor para que screen.getByRole('link') funcione.
vi.mock('next/link', () => {
  type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: React.ReactNode;
  };
  const MockLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
    ({ href, children, ...rest }, ref) => (
      <a ref={ref} href={href} {...rest}>
        {children}
      </a>
    )
  );
  MockLink.displayName = 'MockLink';
  return { default: MockLink };
});

// ----- @/components/ui/avatar -----
// Esse modulo e importado por CommunityNav/feed/notifications mas nao existe no
// projeto (so temos button, card, input, tabs, textarea, badge etc.). Criamos um
// stub minimo que expoe os sub-componentes esperados.
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <span data-testid="avatar-fallback" className={className}>
      {children}
    </span>
  ),
}));

// ----- @/components/ui/tabs -----
// A pagina de feed nao usa <Tabs> diretamente (apenas TabsList/TabsTrigger),
// mas a UI expoe esses simbolos via index. Stub defensivo para o caso.
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children?: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="tabs-list" role="tablist">
      {children}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    onClick,
  }: {
    children?: React.ReactNode;
    value: string;
    onClick?: () => void;
  }) => (
    <button role="tab" data-value={value} onClick={onClick}>
      {children}
    </button>
  ),
}));

// ----- Helpers de reset -----
export function resetCommunityMocks() {
  usePathnameMock.mockReset();
  usePathnameMock.mockReturnValue('/feed');
}