'use client';

/**
 * MandatoUnificado — F-235
 * Merge de Screen 1 (Mandato) + Screen 2 (Pergunta).
 * Preserva o bloco CVV-188 intacto (Ethics Charter §5).
 * Usa sessionStorage para a pergunta (sem server action).
 */
import { useState, useEffect } from 'react';
import type { MandatoEsqueleto, MentorHook } from './types';
import { ESCALA_LABELS, C } from './types';

const PILAR_COR: Record<string, string> = {
  cabala: C.violeta,
  astrologia: C.aurora,
  tantrica: C.dourado,
  odu: C.magenta,
  iching: '#A0763A',
};

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

export interface MandatoUnificadoProps {
  date: string;
  mandato: MandatoEsqueleto;
  mentor_hook: MentorHook;
  frases: string[];
  pilarInfo: { nome: string; cor: string };
  locale: string;
}

export function MandatoUnificado({
  date,
  mandato,
  mentor_hook,
  frases,
  pilarInfo,
  locale: _locale,
}: MandatoUnificadoProps) {
  const crise = mentor_hook.crise_detectada;
  const [perguntaOpen, setPerguntaOpen] = useState(false);
  const [perguntaText, setPerguntaText] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('diario_pergunta');
    if (stored) setPerguntaText(stored);
  }, []);

  function handlePerguntaChange(value: string) {
    setPerguntaText(value);
    sessionStorage.setItem('diario_pergunta', value);
  }

  const card = (borderColor: string) =>
    `bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4`;

  const label = (color: string) =>
    `text-[0.7rem] font-cinzel tracking-[0.2em] uppercase block mb-3`;

  const headline = `text-[1.15rem] font-cinzel text-[#F4F5FF] mb-2 leading-snug`;

  const body = `text-[0.9rem] leading-relaxed text-[#A7AECF]`;

  const badge = (color: string) =>
    `inline-block text-[0.72rem] tracking-wide px-3 py-1 rounded-full mr-2 mb-2 border`;

  return (
    <section aria-label="Mandato do Dia">
      {/* Header: data + escala + intenção */}
      <div className={card(pilarInfo.cor)}>
        <span className={label(pilarInfo.cor)} style={{ color: pilarInfo.cor }}>
          Mandato · Escala {mandato.escala} ({ESCALA_LABELS[mandato.escala]})
        </span>
        <p className={headline} style={{ color: pilarInfo.cor }}>
          {formatDate(date)}
        </p>
        <div className="mt-2.5 text-[0.78rem] text-[#5C6691]">
          <strong className="text-[#A7AECF]">Intenção do dia</strong>
          <br />
          <span>Sua semente do dia — intenção derivada do seu mapa</span>
          <br />
          <em className="text-[#A7AECF]">{mentor_hook.intencao}</em>
        </div>
      </div>

      {/* Crisis detection — CVV-188 (Ethics Charter §5) */}
      {crise ? (
        <div className={card(C.magenta)}>
          <span className={label(C.magenta)} style={{ color: C.magenta }}>
            Recurso humano · CVV 188
          </span>
          <h2 className={headline} style={{ color: C.magenta }}>
            Você não está sozinho(a).
          </h2>
          <p className={body}>
            O Mentor Akasha reconhece sinais de sofrimento emocional na sua intenção e, por
            design ético, se afasta. Fale agora com alguém treinado para ouvir,
            gratuitamente e 24h:
          </p>
          <div
            className="mt-4 p-4 rounded-xl"
            style={{ background: 'rgba(251,87,129,0.08)', border: '1px solid rgba(251,87,129,0.4)' }}
          >
            <p className={`${body} text-[#F4F5FF] font-semibold mb-1`}>
              CVV — Centro de Valorização da Vida
            </p>
            <p
              className={body}
              style={{
                fontSize: '1.4rem',
                fontFamily: 'var(--font-cinzel, serif)',
                color: C.magenta,
                letterSpacing: '0.08em',
              }}
            >
              ligue 188
            </p>
            <p className={`${body} text-[0.78rem] text-[#5C6691] mt-1.5`}>
              chat também:{' '}
              <a
                href="https://cvv.org.br"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: C.magenta }}
              >
                cvv.org.br
              </a>
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className={card(pilarInfo.cor)}>
            <h2 className={headline} style={{ color: pilarInfo.cor }}>
              A Voz do Akasha
            </h2>
            <span className="text-[0.68rem] text-[#A7AECF] block mb-1.5">
              Leia em voz alta. Observe o que mais ressoa.
            </span>
            <span className="text-[0.72rem] text-[#5C6691] italic block mb-2">
              Três frases que condensam a mensagem energética do seu mapa para hoje.
            </span>

            {frases.map((f, i) => (
              <p key={i} className={`${body} text-[#F4F5FF] ${i < frases.length - 1 ? 'mb-3.5' : ''}`}>
                {f}
              </p>
            ))}

            {mandato.pilares_relevantes.length > 0 && (
              <div className="mt-4">
                {mandato.pilares_relevantes.map((p) => (
                  <span
                    key={p}
                    className={badge(PILAR_COR[p] ?? C.txtMut)}
                    style={{
                      background: `${PILAR_COR[p] ?? C.txtMut}1A`,
                      borderColor: `${PILAR_COR[p] ?? C.txtMut}55`,
                      color: PILAR_COR[p] ?? C.txtMut,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}

            <div className="text-center mt-2">
              <span className="text-[0.7rem] text-[#5C6691]">
                Role para baixo para a próxima seção ↓
              </span>
            </div>

            {mandato.cita_fontes.length > 0 && (
              <details className="mt-2" aria-label="Fontes e referências desta análise">
                <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50">
                  Fontes
                </summary>
                <div className="mt-3.5 pt-3 border-t border-[#141A33] text-[0.72rem] text-[#5C6691] leading-relaxed">
                  {mandato.cita_fontes.map((c, i) => (
                    <div key={i}>· {c}</div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Pergunta do Dia (expandível) */}
          <div className={card(C.violeta)}>
            <button
              type="button"
              onClick={() => setPerguntaOpen((v) => !v)}
              className="w-full text-left"
              aria-expanded={perguntaOpen}
            >
              <h2 className={headline} style={{ color: C.violeta }}>
                A Pergunta do Dia
              </h2>
            </button>

            {perguntaOpen && (
              <div className="mt-3">
                <p className={body}>
                  Respire. Deixe a resposta emergir antes de buscar palavras.
                </p>
                <textarea
                  value={perguntaText}
                  onChange={(e) => handlePerguntaChange(e.target.value)}
                  placeholder="Qual é a primeira resposta que vem, antes da mente julgar?"
                  className="w-full min-h-[100px] mt-3 p-3 rounded-xl bg-[rgba(124,92,255,0.06)] border border-[rgba(124,92,255,0.3)] text-[#F4F5FF] text-[0.88rem] font-lora leading-relaxed resize-y outline-none"
                  rows={4}
                />
                <p className="text-[0.65rem] text-[#5C6691] mt-2">
                  Salvo apenas no seu navegador — sem envio ao servidor.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
