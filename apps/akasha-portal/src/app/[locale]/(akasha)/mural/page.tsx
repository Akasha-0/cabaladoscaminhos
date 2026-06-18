// Mural page — deprecated Iter44.
// This file is kept because rm -rf does not persist in this environment.
// Functionally dead: redirects to dashboard.
import { redirect } from 'next/navigation';

export default async function MuralPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard`);
}
