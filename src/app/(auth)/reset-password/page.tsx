import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Recuperar senha · Akasha Portal',
  description: 'Receba um link por email para redefinir sua senha.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
