import type { ReactNode } from 'react';

export const metadata = {
  title: 'Preferências de Notificações · Cabala dos Caminhos',
  description:
    'Configure canais, horários de silêncio, pausas globais e limites por categoria. LGPD: seus dados ficam no seu dispositivo.',
  robots: { index: false, follow: false },
};

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-w91a-notifications-layout
      className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50"
    >
      {children}
    </div>
  );
}