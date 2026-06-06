// src/app/(auth)/layout.tsx
// Layout simples para rotas de autenticação — SEM auth gate.
// Garante que o login/registro nunca sofrem redirect loop.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
