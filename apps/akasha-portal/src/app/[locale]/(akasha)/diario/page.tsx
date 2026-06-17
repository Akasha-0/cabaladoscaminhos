/**
 * Diário Energético — F-202 (Fase 6).
 *
 * Consome `GET /api/akasha/mandato-do-dia` (F-201) e renderiza o
 * Mandato do Dia em 3 telas (Mandato · Pergunta · Micro-Ritual).
 *
 * Referências:
 *   - VISION §4 — "Mandato = 1 push/dia 06h, 3 frases + 1 pergunta + 1 micro-ritual"
 *   - synthesis_v1.md §5 — Mandato spec
 *   - ethics_charter_v1.md §5 — Pilar 3 LGPD/crise: `mentor_hook.crise_detectada`
 *     faz o cliente renderizar CVV-188 e suprimir `redacao_bruta`.
 *
 * F-204 (P2) substitui os stubs do `akasha-core` por `loadEngines()` real +
 * redação LLM; o que o F-202 já trata como "esqueleto" será preenchido
 * sem mudanças de UI.
 */
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignificadoPilar } from '@/components/akasha/SignificadoPilar';
import { TraducaoAreaPanel } from '@/components/akasha/TraducaoAreaPanel';
import { ContinuarButton } from '@/components/akasha/ContinuarButton';
import {
  significadosEspecificos,
  type Pilar,
  type PilaresDados,
} from '@/lib/grimoire/significados-curados';
import { AREAS, traducaoPara } from '@/lib/grimoire/traducao-areas';

const PILARES_VALIDOS: readonly Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const;

type MandatoEsqueleto = {
  escala: 'D' | 'S' | 'Z' | 'V';
  pilares_relevantes: string[];
  redacao_bruta: string;
  cita_fontes: string[];
};

type MentorHook = {
  intencao: string;
  crise_detectada: boolean;
  recurso: string | null;
};
type PilaresDoMandato = {
  cabala: { life_path: number; birthday: number; expression: number; ano_pessoal: number };
  astrologia: {
    sol_signo: string;
    asc_signo: string | null;
    lua_signo: string;
    lua_fase: 'nova' | 'crescente' | 'cheia' | 'minguante';
    trinity: { sombra: number; dom: number; graca: number };
    trinity_dominante: 'sombra' | 'dom' | 'graca';
    // F-235 — Sexualidade (Lilith + Casa 8). Pode vir undefined em respostas antigas.
    lilith_signo?: string | null;
    casa_8_signo?: string | null;
  };
  odu: { odu_principal: string; odu_secundario: string | null; fonte: 'Ifá' | 'Candomblé'; aviso: string };
  iching: { hexagrama_natal: number; hexagrama_dia: number; level: 'shadow' | 'gift' | 'siddhi' };
};

type MandatoDoDiaResponse = {
  date: string;
  mandato: MandatoEsqueleto;
  pilares: PilaresDoMandato;
  mentor_hook: MentorHook;
};

// ── Paleta Akasha (alinhada com MandalaChart.tsx) ────────────────────────────
const C = {
  violeta: '#7C5CFF',
  aurora: '#2DD4BF',
  dourado: '#F0B429',
  magenta: '#FB5781',
  bgVoid: '#06070F',
  bgDeep: '#0B0E1C',
  bgNeb: '#141A33',
  txtPri: '#F4F5FF',
  txtSec: '#A7AECF',
  txtMut: '#5C6691',
} as const;

// ── Pilares (canônicos VISION §2 — ordem P1..P5) ─────────────────────────────
const PILLAR_LABELS: Record<string, { nome: string; cor: string }> = {
  cabala: { nome: 'Numerologia Cabalística', cor: C.violeta },
  astrologia: { nome: 'Astrologia', cor: C.aurora },
  tantrica: { nome: 'Numerologia Tântrica', cor: C.dourado },
  odu: { nome: 'Odu de Nascimento', cor: C.magenta },
  iching: { nome: 'I Ching', cor: '#A0763A' },
};

const ESCALA_LABELS: Record<MandatoEsqueleto['escala'], string> = {
  D: 'Diário',
  S: 'Semanal',
  Z: 'Sazonal',
  V: 'Vida',
};

// ── Estilos (mesma linguagem do MandalaChart.tsx) ───────────────────────────

const wrapStyle: React.CSSProperties = {
  background: C.bgVoid,
  minHeight: '100dvh',
  overflowY: 'scroll',
  scrollSnapType: 'y mandatory',
  WebkitOverflowScrolling: 'touch',
};

const screenStyle: React.CSSProperties = {
  scrollSnapAlign: 'start',
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '48px 20px 64px',
};

const innerStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  width: '100%',
};

const cardStyle = (borderColor: string): React.CSSProperties => ({
  background: 'rgba(11,14,28,0.72)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${borderColor}44`,
  borderLeft: `3px solid ${borderColor}`,
  borderRadius: 14,
  padding: '24px 24px 20px',
  marginBottom: 16,
});

const labelStyle = (color: string): React.CSSProperties => ({
  fontSize: '0.62rem',
  fontFamily: 'var(--font-cinzel, serif)',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color,
  marginBottom: 12,
  display: 'block',
});

const headlineStyle: React.CSSProperties = {
  fontSize: '1.15rem',
  fontFamily: 'var(--font-cinzel, serif)',
  color: C.txtPri,
  marginBottom: 10,
  lineHeight: 1.4,
};

const bodyStyle: React.CSSProperties = {
  color: C.txtSec,
  fontSize: '0.9rem',
  lineHeight: 1.75,
};

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  background: `${color}1A`,
  border: `1px solid ${color}55`,
  borderRadius: 20,
  padding: '3px 12px',
  fontSize: '0.72rem',
  letterSpacing: '0.08em',
  color,
  marginRight: 8,
  marginBottom: 8,
});

const dividerStyle: React.CSSProperties = {
  borderTop: `1px solid ${C.bgNeb}`,
  margin: '16px 0',
};

const btnStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  padding: '14px 0',
  borderRadius: 12,
  background: `linear-gradient(135deg, ${C.violeta}22 0%, ${C.aurora}14 100%)`,
  border: `1px solid ${C.violeta}55`,
  color: C.violeta,
  fontSize: '0.88rem',
  letterSpacing: '0.07em',
  fontFamily: 'var(--font-cinzel, serif)',
  textDecoration: 'none',
  cursor: 'pointer',
  marginTop: 8,
};

const screenNumStyle: React.CSSProperties = {
  fontSize: '0.6rem',
  color: C.txtMut,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: 24,
};

const fonteStyle: React.CSSProperties = {
  marginTop: 14,
  paddingTop: 12,
  borderTop: `1px solid ${C.bgNeb}`,
  fontSize: '0.72rem',
  color: C.txtMut,
  lineHeight: 1.5,
};

const stubBadge: React.CSSProperties = {
  display: 'inline-block',
  marginLeft: 8,
  fontSize: '0.65rem',
  letterSpacing: '0.1em',
  padding: '2px 6px',
  borderRadius: 4,
  background: 'rgba(92,102,145,0.18)',
  border: '1px solid rgba(92,102,145,0.4)',
  color: C.txtMut,
  textTransform: 'uppercase',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return iso;
  }
}

/**
 * Extrai 3 frases (heurística) da `redacao_bruta` para o Mandato.
 * VISION §4 promete 3 frases; enquanto o LLM não redige (F-204),
 * partimos no último ponto antes do parêntese de stub.
 */
function extractFrases(redacao: string): string[] {
  const cleaned = redacao.replace(/\s*\(LLM redige.*?\)\.?\s*$/i, '').trim();
  // Quebra em pontos finais que não sejam abreviação (sigla única).
  const raw = cleaned
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (raw.length >= 3) return raw.slice(0, 3);
  // Fallback: 1 frase só.
  return raw.length > 0 ? [cleaned] : ['(Mandato vazio — tente novamente em alguns instantes)'];
}

/**
 * Pergunta padrão derivada do Pilar principal.
 * Quando o LLM (F-204) fornecer pergunta própria, esta vira fallback.
 */
function perguntaPorPilar(pilarPrincipal: string): string {
  const mapa: Record<string, string> = {
    cabala: 'Qual decisão de vida o seu número-base está iluminando hoje?',
    astrologia: 'O que o céu de hoje está pedindo que você ouça em silêncio?',
    tantrica: 'Qual corpo sutil está pedindo atenção e cuidado agora?',
    odu: 'O que o seu Odu de nascimento está ensinando neste dia?',
    iching: 'Que mutação o seu hexagrama está convidando a atravessar?',
  };
  return mapa[pilarPrincipal] ?? 'O que seu Ori te pede para olhar com mais gentileza hoje?';
}

/**
 * Micro-ritual padrão (3 min) derivado do Pilar principal.
 * F-204 substituirá por redação LLM com base em `pilares_relevantes` + escala.
 */
function ritualPorPilar(pilarPrincipal: string): { titulo: string; instrucao: string } {
  const mapa: Record<string, { titulo: string; instrucao: string }> = {
    cabala: {
      titulo: 'Conta-Cantiga',
      instrucao:
        'Some os números do seu dia de nascimento e medite 3 minutos sobre o que esse número quer dizer na sua jornada.',
    },
    astrologia: {
      titulo: 'Respiração do Céu',
      instrucao:
        'Respire 4-4-4-4 olhando o horizonte. Deixe a Lua e o signo do dia embalarem o silêncio.',
    },
    tantrica: {
      titulo: 'Varredura dos 11',
      instrucao:
        'Passe 11 respirações por cada corpo sutil (alma → mente → corpo → aura). Anote o que pulsou.',
    },
    odu: {
      titulo: 'Oração ao Ori',
      instrucao:
        'Sente-se em terreiro (real ou mental). Agradeça ao seu Odu e peça uma orientação simples para o dia.',
    },
    iching: {
      titulo: 'Mutação em 3 Linhas',
      instrucao: 'Abra o hexagrama do dia. Leia as 3 linhas mutáveis. Escreva 1 palavra para cada.',
    },
  };
  return (
    mapa[pilarPrincipal] ?? {
      titulo: 'Silêncio de 3 min',
      instrucao: 'Sente-se, respire e anote o primeiro pensamento que surgir.',
    }
  );
}

// ── Página ───────────────────────────────────────────────────────────────────

export default async function DiarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ intencao?: string }>;
}) {
  const { locale } = await params;
  const { intencao } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;

  if (!token) redirect(`/${locale}/onboarding`);

  const qs = intencao?.trim() ? `?intencao=${encodeURIComponent(intencao.trim())}` : '';

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandato-do-dia${qs}`,
    {
      method: 'GET',
      headers: { Cookie: `akasha_session=${token}` },
      cache: 'no-store',
    }
  );

  if (res.status === 401 || res.status === 404) redirect(`/${locale}/onboarding`);
  if (!res.ok) {
    return (
      <div style={{ ...wrapStyle, padding: '48px 20px' }}>
        <div style={innerStyle}>
          <div style={cardStyle(C.magenta)}>
            <span style={labelStyle(C.magenta)}>Mandato indisponível</span>
            <p style={bodyStyle}>
              Não conseguimos calcular o Mandato de hoje ({res.status}). Tente novamente em alguns
              instantes. Se o problema persistir, conclua o onboarding ou atualize seus dados
              natais.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const payload: MandatoDoDiaResponse = await res.json();
  const { date, mandato, mentor_hook } = payload;
  const pilarPrincipal = mandato.pilares_relevantes[0] ?? 'cabala';
  const pilarInfo = PILLAR_LABELS[pilarPrincipal] ?? { nome: pilarPrincipal, cor: C.txtMut };
  const crise = mentor_hook.crise_detectada;
  const frases = crise ? [] : extractFrases(mandato.redacao_bruta);
  const pergunta = perguntaPorPilar(pilarPrincipal);
  const ritual = ritualPorPilar(pilarPrincipal);

  return (
    <div style={wrapStyle}>
      {/* ── Tela 1: O Mandato (3 frases) ─────────────────────────────────── */}
      <div style={screenStyle}>
        <div style={innerStyle}>
        <div style={screenNumStyle}>01\u00A0/\u000505 — Mandato</div>

          {/* Cabeçalho: data + escala + intenção */}
          <div style={cardStyle(pilarInfo.cor)}>
            <span style={labelStyle(pilarInfo.cor)}>
              Mandato · Escala {mandato.escala} ({ESCALA_LABELS[mandato.escala]})
            </span>
            <p style={{ ...headlineStyle, color: pilarInfo.cor }}>{formatDate(date)}</p>
            <div style={{ marginTop: 10, fontSize: '0.78rem', color: C.txtMut }}>
              Intenção: <em style={{ color: C.txtSec }}>{mentor_hook.intencao}</em>
            </div>
          </div>

          {/* Saudação do Akasha — 3 frases */}
          {crise ? (
            // Ethics Charter §5: suprimir `redacao_bruta` em crise; renderizar CVV-188.
            <div style={cardStyle(C.magenta)}>
              <span style={labelStyle(C.magenta)}>Recurso humano · CVV 188</span>
              <h2 style={{ ...headlineStyle, color: C.magenta }}>Você não está sozinho(a).</h2>
              <p style={bodyStyle}>
                O Mentor Akasha reconhece sinais de sofrimento emocional na sua intenção e, por
                design ético, se afasta. Fale agora com alguém treinado para ouvir, gratuitamente e
                24h:
              </p>
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 10,
                  background: 'rgba(251,87,129,0.08)',
                  border: '1px solid rgba(251,87,129,0.4)',
                }}
              >
                <p style={{ ...bodyStyle, color: C.txtPri, fontWeight: 600, marginBottom: 4 }}>
                  CVV — Centro de Valorização da Vida
                </p>
                <p
                  style={{
                    ...bodyStyle,
                    fontSize: '1.4rem',
                    fontFamily: 'var(--font-cinzel, serif)',
                    color: C.magenta,
                    letterSpacing: '0.08em',
                  }}
                >
                  ligue 188
                </p>
                <p style={{ ...bodyStyle, fontSize: '0.78rem', color: C.txtMut, marginTop: 6 }}>
                  chat também:{' '}
                  <a
                    href="https://cvv.org.br"
                    target="_blank"
                    rel="noopener"
                    style={{ color: C.magenta }}
                  >
                    cvv.org.br
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div style={cardStyle(pilarInfo.cor)}>
              <span style={labelStyle(pilarInfo.cor)}>
                A Voz do Akasha <span style={stubBadge}>via {pilarInfo.nome}</span>
              </span>
              {frases.map((f, i) => (
                <p
                  key={i}
                  style={{
                    ...bodyStyle,
                    color: C.txtPri,
                    marginBottom: i < frases.length - 1 ? 14 : 0,
                  }}
                >
                  {f}
                </p>
              ))}

              {/* Pilares relevantes como badges coloridos */}
              {mandato.pilares_relevantes.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  {mandato.pilares_relevantes.map((p) => {
                    const info = PILLAR_LABELS[p];
                    return (
                      <span key={p} style={badgeStyle(info?.cor ?? C.txtMut)}>
                        {info?.nome ?? p}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Fontes citadas — proveniência obrigatória (Ethics §1) */}
              {mandato.cita_fontes.length > 0 && (
                <div style={fonteStyle}>
                  <span style={{ ...labelStyle(C.txtMut), marginBottom: 6 }}>Citações</span>
                  {mandato.cita_fontes.map((c, i) => (
                    <div key={i}>· {c}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, color: C.txtMut, fontSize: '0.7rem' }}>
            role para baixo ↓
          </div>
        </div>
      </div>

      {/* Tela 2: A Pergunta do Dia */}
      <div style={screenStyle}>
        <div style={innerStyle}>
        <div style={screenNumStyle}>02\u00A0/\u000505 — Pergunta</div>
          <div style={cardStyle(C.violeta)}>
            <span style={labelStyle(C.violeta)}>
              A Pergunta do Dia <span style={stubBadge}>template (F-204: LLM)</span>
            </span>
            <h2 style={{ ...headlineStyle, color: C.violeta, fontSize: '1.35rem' }}>{pergunta}</h2>
            <div style={dividerStyle} />
            <span style={labelStyle(C.txtMut)}>Por que esta pergunta?</span>
            <p style={bodyStyle}>
              A pergunta de hoje é ancorada em{' '}
              <strong style={{ color: pilarInfo.cor }}>{pilarInfo.nome}</strong>, o pilar principal
              da escala {mandato.escala}. A intenção de uma boa pergunta é abrir espaço de escuta —
              não de resposta apressada. Reserve 1 minuto para deixar a resposta emergir.
            </p>
            <textarea
              placeholder="Deixe sua reflexão emergir..."
              style={{
                width: '100%',
                minHeight: 100,
                marginTop: 12,
                padding: '12px 14px',
                borderRadius: 10,
                background: 'rgba(124,92,255,0.06)',
                border: '1px solid rgba(124,92,255,0.3)',
                color: C.txtPri,
                fontSize: '0.88rem',
                fontFamily: 'var(--font-lora, serif)',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              rows={4}
            />
            <ContinuarButton />
          </div>
          <div style={{ textAlign: 'center', marginTop: 24, color: C.txtMut, fontSize: '0.7rem' }}>
            role para baixo ↓
          </div>
        </div>
      </div>

      {/* Tela 3: O Micro-Ritual */}
      <div id="tela-3" style={screenStyle}>
        <div style={innerStyle}>
        <div style={screenNumStyle}>03\u00A0/\u000505 — Ritual</div>
          <div style={cardStyle(C.aurora)}>
            <span style={labelStyle(C.aurora)}>
              O Micro-Ritual <span style={stubBadge}>template (F-204: LLM)</span>
            </span>
            <h2 style={{ ...headlineStyle, color: C.aurora }}>{ritual.titulo}</h2>
            <p style={bodyStyle}>{ritual.instrucao}</p>
            <div style={{ marginTop: 14 }}>
              <span style={badgeStyle(pilarInfo.cor)}>via {pilarInfo.nome}</span>
              <span style={badgeStyle(C.aurora)}>~ 3 min</span>
            </div>
          </div>
          <Link href={`/${locale}/oraculo`} style={btnStyle}>
            Consultar Oráculo →
          </Link>
        </div>
      </div>
      {/* Tela 4: O Significado (F-222) — ESPECÍFICO do símbolo, não visão geral */}
      {(() => {
        // Cast seguro: API pode omitir `ciclo_anos` (F-220 stub) ou `aviso` (F-235),
        // mas significadosEspecificos só lê os campos obrigatórios.
        const sigs = significadosEspecificos(payload.pilares as unknown as PilaresDados);
        const ordem: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];
        const coresPorPilar: Record<Pilar, string> = {
          cabala: C.violeta,
          astrologia: C.aurora,
          tantrica: C.dourado,
          odu: C.magenta,
          iching: '#A0763A',
        };
        return (
          <div style={screenStyle}>
            <div style={innerStyle}>
              <div style={screenNumStyle}>04\u00A0/\u000505 — Significado</div>
              <p style={{ ...bodyStyle, color: C.txtSec, marginBottom: 8 }}>
                Cinco leituras, uma pessoa. Toque em cada Pilar para refletir.
              </p>
              {ordem.map((p) => (
                <div key={p} style={{ marginBottom: 14 }}>
                  <SignificadoPilar
                    significado={sigs[p]}
                    cor={coresPorPilar[p]}
                    destaque={p === pilarPrincipal}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Tela 5: Para suas áreas (F-229) — Significado do Pilar PRINCIPAL traduzido para 8 áreas da vida */}
      {(() => {
        const p = (PILARES_VALIDOS as readonly string[]).includes(pilarPrincipal)
          ? (pilarPrincipal as Pilar)
          : ('cabala' as Pilar);
        const cor: Record<Pilar, string> = {
          cabala: C.violeta,
          astrologia: C.aurora,
          tantrica: C.dourado,
          odu: C.magenta,
          iching: '#A0763A',
        };
        return (
          <div style={screenStyle}>
            <div style={innerStyle}>
              <div style={screenNumStyle}>05\u00A0/\u000505 — Para suas áreas</div>
              <p style={{ ...bodyStyle, color: C.txtSec, marginBottom: 8 }}>
                O Significado do Pilar principal traduzido para 8 áreas da sua vida.
                Você vive em áreas — paz, saúde, relações, dinheiro, trabalho, propósito, criatividade, espiritualidade — e cada área pede uma leitura própria.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                {AREAS.map((a) => {
                  const t = traducaoPara(p, a);
                  if (!t) return null;
                  return <TraducaoAreaPanel key={a} traducao={t} cor={cor[p]} />;
                })}
              </div>
            </div>
          </div>
        );
      })()}



    </div>
  );
}
