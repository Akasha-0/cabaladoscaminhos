import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// /share-target — Web Share Target receiver (Wave 20)
// ============================================================================
// O manifest.json declara share_target.action = "/share-target" com method POST.
// Quando o usuário compartilha de outro app, o SO abre este URL com POST
// multipart/form-data. Não podemos renderizar uma página direto de um POST —
// então:
//   1) Esta route captura o POST
//   2) Extrai title/text/url
//   3) Faz 303 redirect para /share-target?title=...&text=...&url=...
//   4) A página /share-target/page.tsx renderiza o form pré-preenchido
//
// Compartilhamento cai em 3 cenários:
//   - title + url: postar link (ex: compartilhar um paper)
//   - text + url: postar citação com referência
//   - só text: postar reflexão/experiência
//
// Por que não criar post server-side aqui: precisamos que o usuário revise e
// adicione tradição/tópico, ou descarte (UX de privacidade). Redirecionar para
// a página de compose com os dados pré-preenchidos é o padrão mais seguro.
// ============================================================================

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = (formData.get('title') as string | null) ?? '';
    const text = (formData.get('text') as string | null) ?? '';
    const url = (formData.get('url') as string | null) ?? '';

    // Sanitiza e trunca (defense-in-depth)
    const sanitize = (s: string, max: number) =>
      s.replace(/[<>]/g, '').slice(0, max);

    const params = new URLSearchParams({
      title: sanitize(title, 200),
      text: sanitize(text, 1000),
      url: sanitize(url, 500),
    });

    return NextResponse.redirect(
      new URL(`/share-target?${params.toString()}`, request.url),
      { status: 303 }
    );
  } catch (err) {
    console.error('[share-target] POST failed:', err);
    // Falha ao ler form — redireciona sem dados
    return NextResponse.redirect(new URL('/share-target', request.url), {
      status: 303,
    });
  }
}

// GET também suportado (deep link / abrir manualmente)
export async function GET(request: NextRequest) {
  // Sem modificações — deixa a página renderizar
  return NextResponse.next();
}
