import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentoria 1-on-1 · Akasha',
  description:
    'Encontre mentores 1-on-1 nas 7 tradições esotéricas (Cigano, Candomblé, Umbanda, Ifá, Cabala, Astrologia, Tantra). Conexão Akáshica.',
  openGraph: {
    title: 'Mentoria 1-on-1 · Akasha',
    description:
      'Mentoria individual com praticantes experientes das tradições esotéricas. LGPD-safe.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MentorshipLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}
