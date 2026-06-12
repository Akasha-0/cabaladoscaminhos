# coordination/w2/changelog-pending.md

## Entradas pendentes de changelog (para consolidação pelo integrador)

---

### Entrada — Ciclo 1 (2026-06-12)

**Domínio**: w2 (UI/Mobile)

**O que mudou**:
- Novo componente `AkashaSignificadoCard` em `apps/akasha-portal/src/components/akasha/`
  - Renderiza interpretação profunda do Número de Vida (shadow/gift/siddhi levels)
  - Seletor interativo de nível com UI dark-theme
  - Exibe: significado, padrão, ações práticas (amplificar/evitar/ritual), afirmação
  - Integra `interpretarVida()` do motor Akasha
- Integração na página `/mapa/significado` antes dos 5 pilares tradicionais
- Remoção da seção "Como cada tradição fala desta área" em `DimensaoCard`
  - UI não exibe mais breakdown multi-tradição — usuário vê só Akasha

**Impacto para o usuário**:
- Antes: sistema mostrava "Cabala: 30%, Astrologia: 20%..." quebrava a ilusão de sistema unificado
- Depois: usuário vê O AKASHA, não os 5 mapas separados — alinhado com a visão do produto

**Arquivos**:
- `apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx` (novo)
- `apps/akasha-portal/src/app/[locale]/(akasha)/mapa/significado/page.tsx` (modificado)
- `apps/akasha-portal/src/components/akasha/CaixaUnificada/DimensaoCard.tsx` (modificado)
