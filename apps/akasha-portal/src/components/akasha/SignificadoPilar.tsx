/**
 * SignificadoPilar — F-219 (Camada de Significado)
 *
 * Renderiza um SignificadoCurado com layout consistente, mostrando o que o
 * símbolo SIGNIFICA (não apenas o número/código). Aplica o princípio
 * VISION §3 axioma 3: a curadoria transforma o dado em compreensão.
 *
 * Layout:
 *   ┌─────────────────────────────────────────┐
 *   │ ✦ Dimensão · Título                        │
 *   │                                         │
 *   │  O que é:                               │
 *   │  Essência (significado central)         │
 *   │                                         │
 *   │  O que pedir:                           │
 *   │  Missão (direção de movimento)          │
 *   │                                         │
 *   │  ⚠ Sombra:                              │
 *   │  Risco a observar                       │
 *   │                                         │
 *   │  ▸ Prática (3-5 min):                   │
 *   │  Ação concreta em 2ª pessoa             │
 *   │                                         │
 *   │  ↔ Conexão:                             │
 *   │  Como ressoa com as outras Dimensões      │
 *   │                                         │
 *   │ via Akasha                               │
 *   └─────────────────────────────────────────┘
 */

import { LilithCasa8Details } from './LilithCasa8Details';
import type { SignificadoCurado } from '@/lib/grimoire/significados-curados';

export interface SignificadoPilarProps {
  significado: SignificadoCurado;
  /** Cor do Pilar (mesma paleta do MandalaChart/Diario). */
  cor: string;
  /** Indica que veio do Pilar principal (destaque visual). */
  destaque?: boolean;
  /**
   * F-235 — Pilar 2 (Astrologia) ganha seção extra de Sexualidade quando
   * há dados disponíveis. Renderiza apenas se:
   *   - significado.pilar === 'astrologia'
   *   - pelo menos um de lilith/casa8 for fornecido
   * Outros Pilares ignoram essa prop.
   */
  sexualidade?: {
    lilith_signo?: string | null;
    casa_8_signo?: string | null;
  };
}


const DIMENSAO_ICONE: Record<SignificadoCurado['pilar'], string> = {
  cabala: '✡',
  astrologia: '☉',
  tantrica: '◈',
  odu: '✺',
  iching: '☯',
};

const DIMENSAO_NOME: Record<SignificadoCurado['pilar'], string> = {
  cabala: 'Ancestralidade',
  astrologia: 'Movimento Celeste',
  tantrica: 'Corpo & Energia',
  odu: 'Ancestralidade',
  iching: 'Mutação do Caminho',
};

export function SignificadoPilar({
  significado,
  cor,
  destaque = false,
  sexualidade,
}: SignificadoPilarProps) {
  const { pilar, titulo, essencia, missao, sombra, pratica, conexao, fonte, requer_terreiro } =
    significado;

  // F-235: Sexualidade só renderiza para Pilar 2 (Astrologia) com dados.
  const showSexualidade =
    pilar === 'astrologia' &&
    !!sexualidade &&
    !!(sexualidade.lilith_signo || sexualidade.casa_8_signo);
  return (
    <article
      data-pilar={pilar}
      data-destaque={destaque || undefined}
      style={{
        background: destaque ? `${cor}0d` : 'rgba(6,7,15,0.55)',
        border: `1px solid ${cor}${destaque ? '66' : '33'}`,
        borderLeft: `3px solid ${cor}`,
        borderRadius: '12px',
        padding: '1.1rem 1.15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* Cabeçalho: Pilar + Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        <span aria-hidden style={{ fontSize: '1.2rem', color: cor, lineHeight: 1 }}>
          {DIMENSAO_ICONE[pilar]}
        </span>
        <strong
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            fontSize: '0.78rem',
            color: '#F4F5FF',
            letterSpacing: '0.04em',
          }}
        >
          {DIMENSAO_NOME[pilar]} · {titulo}
        </strong>
        {destaque && (
          <span
            style={{
              fontSize: '0.6rem',
              color: cor,
              border: `1px solid ${cor}66`,
              borderRadius: '4px',
              padding: '1px 6px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            HOJE
          </span>
        )}
      </div>

      {/* Essência — significado central */}
      <section>
        <span
          style={{
            fontSize: '0.65rem',
            color: cor,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          O que é
        </span>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#F4F5FF',
            lineHeight: 1.5,
            margin: '0.2rem 0 0',
            fontFamily: 'var(--font-lora, serif)',
          }}
        >
          {essencia}
        </p>
      </section>

      {/* Missão */}
      <section>
        <span
          style={{
            fontSize: '0.65rem',
            color: cor,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          O que pede a você
        </span>
        <p
          style={{
            fontSize: '0.85rem',
            color: '#D5D7F0',
            lineHeight: 1.5,
            margin: '0.2rem 0 0',
          }}
        >
          {missao}
        </p>
      </section>

      {/* Sombra */}
      <section>
        <span
          style={{
            fontSize: '0.65rem',
            color: '#A7AECF',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          ⚠ Sombra
        </span>
        <p
          style={{
            fontSize: '0.8rem',
            color: '#A7AECF',
            lineHeight: 1.5,
            margin: '0.2rem 0 0',
            fontStyle: 'italic',
          }}
        >
          {sombra}
        </p>
        <p style={{ fontSize: '0.78rem', color: '#6B7AA0', marginTop: 4 }}>
          Quando notar isso em si, pause. Não force — só reconheça.
        </p>
      </section>

      {/* F-235 — Sexualidade: Lilith + Casa 8 (apenas Pilar 2 Astrologia) */}
      {showSexualidade && sexualidade && (
        <details
          aria-label="Sexualidade e transformação: Lilith e Casa 8"
          style={{
            background: `linear-gradient(135deg, ${cor}10 0%, rgba(251,87,129,0.06) 100%)`,
            border: `1px solid ${cor}44`,
            borderRadius: '10px',
            padding: '0.7rem 0.85rem',
            marginTop: 6,
          }}
        >
            <summary
              style={{
                color: '#FB5781',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                userSelect: 'none',
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  color: '#FB5781',
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                ⟁ Sexualidade · Lilith + Casa 8
              </span>
            </summary>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sexualidade.lilith_signo && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <strong style={{ color: '#FB5781', fontSize: '0.78rem' }}>
                    Lilith em {sexualidade.lilith_signo}:
                  </strong>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: '0.78rem', color: '#F4F5FF', lineHeight: 1.45, margin: 0 }}>
                      • <strong>Black Moon Lilith</strong> — o polo indômito da sua sexualidade: aquilo que você reconhece como seu, mas raramente verbaliza.
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#F4F5FF', lineHeight: 1.45, margin: 0 }}>
                      • <strong>O que se manifesta</strong> — fetiches, padrões de desejo que você mantém fora da conversa.
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#F4F5FF', lineHeight: 1.45, margin: 0 }}>
                      • <strong>Padrão de intensidade</strong> — intensidade que você tende a reprimir mas que movimenta sua vida íntima.
                    </span>
                  </span>
                </div>
              )}
              {sexualidade.casa_8_signo && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <strong style={{ color: '#FB5781', fontSize: '0.78rem' }}>
                    Casa 8 em {sexualidade.casa_8_signo}:
                  </strong>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: '0.78rem', color: '#F4F5FF', lineHeight: 1.45, margin: 0 }}>
                      • <strong>Entrega e transformação</strong> — como você se permite ir ao limite na intimidade.
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#F4F5FF', lineHeight: 1.45, margin: 0 }}>
                      • <strong>Tabus e heranças</strong> — o campo do proibido: sexualidade tabu, dinâmicas de poder, perdas, renascimento.
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#F4F5FF', lineHeight: 1.45, margin: 0 }}>
                      • <strong>Intimidade profunda</strong> — o signo na cúspide indica o tom da sua zona de máxima vulnerabilidade.
                    </span>
                  </span>
                </div>
              )}
              {sexualidade.lilith_signo &&
                sexualidade.casa_8_signo &&
                sexualidade.lilith_signo === sexualidade.casa_8_signo && (
                  <LilithCasa8Details cor={cor} />
                )}
            </div>
          </details>
      )}

      {/* Prática */}
      <section
        style={{
          background: `${cor}14`,
          borderRadius: '8px',
          padding: '0.6rem 0.7rem',
        }}
      >
        <h4
          style={{
            fontSize: '0.65rem',
            color: cor,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          ▸ Prática · 3-5 min
        </h4>
        <p style={{ fontSize: '0.78rem', color: '#A7AECF', marginTop: 6 }}>
          Antes de começar, prepare um caderno.
        </p>
        <p
          style={{
            fontSize: '0.85rem',
            color: '#F4F5FF',
            lineHeight: 1.45,
            margin: '0.2rem 0 0',
          }}
        >
          {pratica}
        </p>
        <p style={{ fontSize: '0.68rem', color: cor, marginTop: 4 }}>
          Faça agora ou anote como pretende aplicar hoje.
        </p>
      </section>

      {/* Conexão com os outros Pilares */}
      <section>
        <span
          style={{
            fontSize: '0.65rem',
            color: '#A7AECF',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          ↔ Conexão com os outros Pilares
        </span>
        <p
          style={{
            fontSize: '0.78rem',
            color: '#A7AECF',
            lineHeight: 1.5,
            margin: '0.2rem 0 0',
          }}
        >
          {conexao}
        </p>
      </section>

      {/* Footer: fonte + ética Pilar 4 */}
      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          borderTop: `1px solid ${cor}22`,
          paddingTop: '0.55rem',
        }}
      >
        <span style={{ fontSize: '0.65rem', color: '#5C6691', fontStyle: 'italic' }}>
          via {fonte}
        </span>
        {requer_terreiro && (
          <span
            style={{
              fontSize: '0.6rem',
              color: '#FB5781',
              border: '1px solid rgba(251,87,129,0.4)',
              borderRadius: '4px',
              padding: '1px 6px',
              letterSpacing: '0.05em',
            }}
            title="Interpretação profunda requer consentimento + terreiro (R-022 §4.4)"
          >
            ⚠ requer terreiro + consentimento
          </span>
        )}
      </footer>
    </article>
  );
}
