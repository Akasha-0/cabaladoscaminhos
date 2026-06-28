import type { Metadata } from 'next';
import { VerifyEmailNotice } from '@/components/auth/VerifyEmailNotice';

export const metadata: Metadata = {
  title: 'Verifique seu email · Akasha Portal',
  description: 'Confirme seu email para ativar sua conta no Akasha Portal.',
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return <VerifyEmailNotice />;
}
