# W23 Worker D — marketplace seed listings

- File: src/content/marketplace/seed-2026-06.json
- Listings: 3 (1 Orixá prática, 2 leituras)
- Languages: PT-BR + EN + ES
- Commit SHA: c2f77bf80d169beca3ad9f6b8c382c8a3858590a
- Push status: ✅ c2f77bf80d169beca3ad9f6b8c382c8a3858590a
- ls-remote SHA: c2f77bf80d169beca3ad9f6b8c382c8a3858590a
- Time elapsed: ~4 min

## Listings detail

| id | category | duration | price (BRL) | languages | delivery |
|---|---|---|---|---|---|
| leitura-mesa-real-60min | leitura | 60 min | 180,00 | pt-BR/en/es | live_video |
| pratica-consulta-orixá-30min | pratica | 30 min | 120,00 | pt-BR | audio_call |
| leitura-cruzamento-astrologia-45min | leitura | 45 min | 150,00 | pt-BR/en | live_video |

## Notes

- Created `src/content/marketplace/` directory (did not exist before)
- All 3 listings have full PT-BR + EN + ES title+description triples
- Price stored as cents (integer BRL cents — common e-commerce pattern)
- IDs follow kebab-case category-topic-duration format
- Tags include cross-cutting themes (mesa-real, cruzamento, odú) for search/filter
- Provider roles reference real platform primitives: "Cigano Ramiro verified reader", "Babalaô verified by terreiro", "Akasha Astrologer"
- All listings cross-link to actual platform features: Mesa Real, Odu de nascimento, mapa astral, Lilith
- Provider role `Akasha Astrologer` mirrors the platform brand (Akasha-0 org) for in-platform cross-promotion