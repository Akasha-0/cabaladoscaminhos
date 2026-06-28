# RSS / Atom / JSON Feed — Onda 14

**Status:** ✅ Entregue (Wave 14)
**Data:** 2026-06-27
**Escopo:** Marketing / distribution — permitir que leitores externos (Feedly,
Inoreader, NetNewsWire, Reeder, Feedbin, etc) consumam o conteúdo público
da comunidade sem precisar abrir o app.

---

## TL;DR

| Formato     | Endpoint                              | Content-Type                  |
|-------------|---------------------------------------|-------------------------------|
| RSS 2.0     | `GET /feed.xml`                       | `application/rss+xml`         |
| Atom 1.0    | `GET /feed.atom`                      | `application/atom+xml`        |
| JSON Feed v1| `GET /feed.json`                      | `application/feed+json`       |
| RSS por tradição | `GET /feed/[tradition]`           | `application/rss+xml`         |

Todos os endpoints:

- **Públicos** — sem auth
- **Cache edge** — `s-maxage=300, stale-while-revalidate=600`
- **Top 20 posts** publicados (`deletedAt IS NULL`), ordenados por `createdAt DESC, id DESC`
- **Auto-discovery** via `<link rel="alternate">` no `<head>` (em `src/app/layout.tsx`)
- **Sem libs externas** — XML/JSON gerados manualmente em `src/lib/community/feed.ts`

---

## Endpoints em detalhe

### `GET /feed.xml` — RSS 2.0 global

Top 20 posts publicados, qualquer tradição.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="..." xmlns:content="...">
  <channel>
    <title>Akasha Portal — Comunidade Viva</title>
    <link>https://cabaladoscaminhos.com</link>
    <description>...</description>
    <language>pt-BR</language>
    <lastBuildDate>...</lastBuildDate>
    <atom:link rel="self" type="application/rss+xml" href=".../feed.xml" />
    <atom:link rel="alternate" type="application/atom+xml" href=".../feed.atom" />
    <atom:link rel="alternate" type="application/feed+json" href=".../feed.json" />
    <item>
      <title>...</title>
      <link>https://cabaladoscaminhos.com/post/{id}</link>
      <guid isPermaLink="true">...</guid>
      <pubDate>Tue, 27 Jun 2026 19:32:27 GMT</pubDate>
      <author>noreply@cabaladoscaminhos.com (Nome do Autor)</author>
      <category>cabala</category>
      <category>meditacao</category>
      <description><![CDATA[...HTML body...]]></description>
    </item>
  </channel>
</rss>
```

### `GET /feed.atom` — Atom 1.0

Alternativa moderna (RFC 4287). Cada `<entry>` carrega `<id>` único, `<updated>` obrigatório, `<author><name>` e `<content type="html">`.

### `GET /feed.json` — JSON Feed v1.1

Especificação: <https://www.jsonfeed.org/version/1.1/>

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "Akasha Portal — Comunidade Viva",
  "home_page_url": "https://cabaladoscaminhos.com",
  "feed_url": "https://cabaladoscaminhos.com/feed.json",
  "language": "pt-BR",
  "items": [
    {
      "id": "https://cabaladoscaminhos.com/post/{id}",
      "url": "https://cabaladoscaminhos.com/post/{id}",
      "title": "...",
      "content_text": "...",
      "content_html": "...",
      "summary": "...",
      "date_published": "2026-06-27T19:32:27.000Z",
      "date_modified": "2026-06-27T19:32:27.000Z",
      "author": { "name": "...", "url": "..." },
      "tags": ["cabala", "meditacao"],
      "_akasha": { "tradition": "cabala", "topic": "meditacao", "type": "EXPERIENCE" }
    }
  ],
  "_akasha_alternates": {
    "rss": "https://cabaladoscaminhos.com/feed.xml",
    "atom": "https://cabaladoscaminhos.com/feed.atom"
  }
}
```

### `GET /feed/[tradition]` — RSS por tradição

Filtrado por slug canônico. **400** se a tradição não existe.

```bash
curl https://cabaladoscaminhos.com/feed/cabala
curl https://cabaladoscaminhos.com/feed/ifa
curl https://cabaladoscaminhos.com/feed/astrologia
# ...
```

**Tradições canônicas** (sincronizadas com `prisma/seed/groups.ts`):

| Slug                    | Label exibido   |
|-------------------------|------------------|
| `cabala`                | Cabala           |
| `ifa`                   | Ifá              |
| `astrologia`            | Astrologia       |
| `tantra`                | Tantra           |
| `reiki`                 | Reiki            |
| `meditacao`             | Meditação        |
| `xamanismo`             | Xamanismo        |
| `cristianismo-mistico`  | Cristianismo Místico |
| `sufismo`               | Sufismo          |
| `taoismo`               | Taoísmo          |
| `umbanda`               | Umbanda          |
| `candomble`             | Candomblé        |

**Comportamento de erro:**

```http
GET /feed/foobar
HTTP/1.1 400 Bad Request
Content-Type: application/json
Cache-Control: no-store

{
  "error": { "code": 4000, "message": "Tradição desconhecida: \"foobar\"..." },
  "meta": { "timestamp": "..." }
}
```

---

## Auto-discovery no HTML

`src/app/layout.tsx` injeta no `<head>`:

```html
<link rel="alternate" type="application/rss+xml"      title="..." href="/feed.xml" />
<link rel="alternate" type="application/atom+xml"     title="..." href="/feed.atom" />
<link rel="alternate" type="application/feed+json"    title="..." href="/feed.json" />
```

Leitores como Feedly, Inoreader, NetNewsWire detectam esses `<link>` e
oferecem "Subscribe" automaticamente ao visitar a home.

---

## Como adicionar uma nova tradição

1. Adicionar o slug em `KNOWN_TRADITIONS` em `src/lib/community/feed.ts`
2. Adicionar o grupo correspondente em `prisma/seed/groups.ts`
3. Rodar `pnpm seed:posts` para repopular (opcional)
4. O feed `/feed/<slug>` passa a funcionar automaticamente

---

## Caching strategy

| Header                          | Valor                                          | Por quê                                  |
|---------------------------------|------------------------------------------------|-------------------------------------------|
| `Cache-Control`                 | `public, s-maxage=300, stale-while-revalidate=600` | Posts novos aparecem em ~5 min; edge serve stale por 10 min enquanto revalida |
| `Content-Type`                  | `application/{rss+xml\|atom+xml\|feed+json}; charset=utf-8` | Padrão por formato |
| `Cache-Control` (404 tradição)  | `no-store`                                     | Erro de validação não pode ser cacheado |

Cache é **público** porque os feeds são públicos — qualquer CDN/edge pode servir.

---

## Arquivos modificados

```
src/lib/community/feed.ts                   [NOVO] — helpers compartilhados
src/app/feed.xml/route.ts                   [NOVO] — RSS 2.0
src/app/feed.atom/route.ts                  [NOVO] — Atom 1.0
src/app/feed.json/route.ts                  [NOVO] — JSON Feed v1
src/app/feed/[tradition]/route.ts           [NOVO] — RSS por tradição
src/app/layout.tsx                          [EDIT] — <link rel="alternate"> × 3
docs/RSS-W14.md                             [NOVO] — este arquivo
```

---

## Verificação manual

```bash
# 1. RSS global
curl -i http://localhost:3000/feed.xml | head -20

# 2. Atom
curl -i http://localhost:3000/feed.atom | head -20

# 3. JSON Feed
curl -i http://localhost:3000/feed.json | head -20

# 4. Por tradição (válida)
curl -i http://localhost:3000/feed/cabala | head -20

# 5. Tradição inválida (esperar 400)
curl -i http://localhost:3000/feed/foobar

# 6. Validar XML (xmllint ou similar)
curl -s http://localhost:3000/feed.xml | xmllint --noout -
curl -s http://localhost:3000/feed.atom | xmllint --noout -
curl -s http://localhost:3000/feed.json | jq . | head
```

---

## Não-objetivos (Wave 14)

- ❌ Autenticação / personalização de feed (não há "feed por usuário" — só público)
- ❌ WebSub (PubSubHubbub) — publicação push, pode entrar em wave futura
- ❌ Markdown renderizado (HTML simples preserva quebras de linha)
- ❌ Imagens inline (`<enclosure>`) — futuro
- ❌ Feed de artigos (Akasha Biblioteca) — futuro, só posts da comunidade por ora

---

## Próximos passos (sugestões para Wave 15+)

1. **WebSub hub** — quando um post é criado, ping hubs (Superfeedr, Google) para distribuição instantânea
2. **Feed de artigos** — `/articles.xml` baseado no model `Article`
3. **Markdown rendering** — render markdown do `content` em vez de plain text → HTML
4. **`<enclosure>` para mídia** — incluir `mediaUrls` quando presentes
5. **CDN edge config** — Vercel/Cloudflare com TTL de 5min + purge on new post
