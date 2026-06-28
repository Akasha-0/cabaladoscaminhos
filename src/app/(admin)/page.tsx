// ============================================================================
// /admin — Index: redireciona para /admin/dashboard (Wave 20)
// ============================================================================

import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
