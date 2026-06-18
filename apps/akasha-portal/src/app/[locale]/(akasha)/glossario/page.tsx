/**
 * Glossário Vivo — F-243
 *
 * Página dedicada aos termos técnicos das 5 tradições (Cabala,
 * Astrologia, Tantra, Odu, I Ching) traduzidos em linguagem
 * acessível, sem perder a precisão simbólica.
 *
 * Server component. Sem LLM, sem estado. Cada termo é 1 card com:
 *   - Definição (1-2 frases diretas, 2ª pessoa)
 *   - Sistema de origem
 *   - Fonte
 *   - Sinônimos (cross-refs entre sistemas)
 *
 * Pilar 4 (Odu) marca `requer_terreiro` em todos os termos (R-022).
 */
import {
  glossarioPorSistema,
  coberturaGlossario,
  type SistemaGlossario,
} from '@/lib/grimoire/glossario';

export const metadata = {
  title: 'Glossário — o que cada termo significa',
  description: 'Sefirot, Odu, Hexagrama, Tantra, Lilith — traduzidos.',
};

const C = {
  violeta: '#7C5CFF',
  aurora: '#2DD4BF',
  dourado: '#F0B429',
  magenta: '#FB5781',
  ocre: '#A0763A',
  bgVoid: '#06070F',
  txtPri: '#F4F5FF',
  txtSec: '#A7AECF',
  txtMut: '#5C6691',
} as const;

const CORES_SISTEMA: Record<SistemaGlossario, string> = {
  cabala: C.violeta,
  astrologia: C.aurora,
  tantrica: C.dourado,
  odu: C.magenta,
  iching: C.ocre,
  geral: '#A7AECF',
};

const SISTEMA_LABEL: Record<SistemaGlossario, string> = {
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantrica: 'Tântrica',
  odu: 'Odu',
  iching: 'I Ching',
  geral: 'Geral',
};

const SISTEMAS_ORDEM: SistemaGlossario[] = [
  'cabala',
  'astrologia',
  'tantrica',
  'odu',
  'iching',
  'geral',
];

export default function GlossarioPage() {
  const cob = coberturaGlossario();
  return (
    <main
      style={{
        background: C.bgVoid,
        minHeight: 'calc(100vh - 56px)',
        padding: '32px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <header style={{ marginBottom: 24 }}>
          <span
            style={{
              fontSize: '0.7rem',
              color: C.txtMut,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Glossário · {cob.total} termos
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              color: C.txtPri,
              fontSize: '1.7rem',
              margin: '8px 0 6px',
              lineHeight: 1.2,
            }}
          >
            O que cada termo significa
          </h1>
          <p style={{ color: C.txtSec, fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
            Você encontra termos como <em>Sefirot</em>, <em>Ori</em>, <em>Hexagrama</em> e{' '}
            <em>Tríade Sombra/Dom/Graça</em> ao longo do Akasha. Aqui, cada um é traduzido em
            linguagem direta — sem perder a precisão simbólica.
          </p>
        </header>

        {SISTEMAS_ORDEM.map((sis) => {
          const termos = glossarioPorSistema(sis);
          if (termos.length === 0) return null;
          return (
            <section key={sis} style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-cinzel, serif)',
                  fontSize: '1.05rem',
                  color: CORES_SISTEMA[sis],
                  margin: '0 0 8px',
                  letterSpacing: '0.06em',
                  borderBottom: `1px solid ${CORES_SISTEMA[sis]}33`,
                  paddingBottom: 4,
                }}
              >
                {SISTEMA_LABEL[sis]}
                <span
                  style={{
                    color: C.txtMut,
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    marginLeft: 8,
                  }}
                >
                  · {termos.length} {termos.length === 1 ? 'termo' : 'termos'}
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {termos.map((t) => (
                  <article
                    key={t.termo}
                    data-sistema={t.sistema}
                    style={{
                      background: 'rgba(11,14,28,0.55)',
                      border: `1px solid ${CORES_SISTEMA[t.sistema]}22`,
                      borderLeft: `3px solid ${CORES_SISTEMA[t.sistema]}`,
                      borderRadius: 8,
                      padding: '0.85rem 1rem',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'var(--font-cinzel, serif)',
                        color: C.txtPri,
                        fontSize: '0.95rem',
                        margin: '0 0 4px',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {t.termo}
                    </h3>
                    <p
                      style={{
                        color: C.txtSec,
                        fontSize: '0.82rem',
                        lineHeight: 1.5,
                        margin: 0,
                        fontFamily: 'var(--font-lora, serif)',
                      }}
                    >
                      {t.definicao}
                    </p>
                    {t.sinonimos.length > 0 && (
                      <p style={{ fontSize: '0.7rem', color: C.txtMut, margin: '6px 0 0' }}>
                        <em>Também:</em> {t.sinonimos.join(' · ')}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: '0.65rem',
                        color: C.txtMut,
                        margin: '4px 0 0',
                        fontStyle: 'italic',
                      }}
                    >
                      via {t.fonte}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* Aviso ético Pilar 4 (R-022 §4.4) */}
        <section
          style={{
            marginTop: 24,
            padding: '14px 18px',
            border: '1px solid rgba(251,87,129,0.3)',
            borderRadius: 10,
            background: 'rgba(251,87,129,0.04)',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              color: C.magenta,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Aviso ético · Pilar 4 (Odu)
          </span>
          <p style={{ color: C.txtSec, fontSize: '0.8rem', lineHeight: 1.5, margin: '6px 0 0' }}>
            Os termos do Pilar 4 (Ori, Odu, Babalaô, Ebó) são INTRODUÇÕES GERAIS. A interpretação
            profunda do seu Ori pede babalaô/yaô de sua confiança, com consentimento seu e da
            tradição (R-022 §4.4).
          </p>
        </section>
      </div>
    </main>
  );
}
