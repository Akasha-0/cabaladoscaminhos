'use client';

/**
 * MandatoUnificado — F-235
 * Merge de Screen 1 (Mandato) + Screen 2 (Pergunta).
 * Preserva o bloco CVV-188 intacto (Ethics Charter §5).
 * Usa sessionStorage para a pergunta (sem server action).
 */
import { useState, useEffect, useDeferredValue } from 'react';
import { getTranslations } from '@/lib/i18n';
import type { MandatoEsqueleto, MentorHook } from './types';
import { ESCALA_LABELS, C, PILLAR_LABELS } from './types';

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString(locale || 'pt-BR', {
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
  /** DailyResponse.alert — crise / alerta do dia */
  alert?: string;
}

export function MandatoUnificado({
  date,
  mandato,
  mentor_hook,
  frases,
  pilarInfo,
  locale,
  alert,
}: MandatoUnificadoProps) {
  const t = getTranslations(locale);
  const crise = mentor_hook.crise_detectada;
  const [perguntaOpen, setPerguntaOpen] = useState(false);
  const [perguntaText, setPerguntaText] = useState('');
  const deferredPergunta = useDeferredValue(perguntaText);

  useEffect(() => {
    const stored = sessionStorage.getItem(t('diario.mandato.sessionStorageKey'));
    if (stored) setPerguntaText(stored);
  }, [t]);

  useEffect(() => {
    // Deferred write — fires after React renders, off the keystroke path
    sessionStorage.setItem(t('diario.mandato.sessionStorageKey'), deferredPergunta);
  }, [deferredPergunta, t]);

  function handlePerguntaChange(value: string) {
    setPerguntaText(value);
  }

  const card = (borderColor: string) =>
    `bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4`;

  const label = (color: string) =>
    `text-[0.7rem] font-cinzel tracking-[0.2em] uppercase block mb-3`;

  const headline = `text-[1.15rem] font-cinzel text-[#F4F5FF] mb-2 leading-snug`;

  const body = `text-[0.9rem] leading-relaxed text-[#B8BFCE]`;

  const badge = (color: string) =>
    `inline-block text-[0.72rem] tracking-wide px-3 py-1 rounded-full mr-2 mb-2 border`;

  return (
    <section aria-label={t('diario.mandato.ariaLabel')}>
      {/* Header: data + escala + intenção */}
      <div className={card(pilarInfo.cor)}>
        <span className={label(pilarInfo.cor)} style={{ color: pilarInfo.cor }}>
          {t('diario.mandato.escalaPrefix')} {mandato.escala} ({ESCALA_LABELS[mandato.escala]})
        </span>
        <p className={headline} style={{ color: pilarInfo.cor }}>
          {formatDate(date, locale)}
        </p>
        <div className="mt-2.5 text-[0.78rem] text-[#8A9BB8]">
          <strong className="text-[#B8BFCE]">{t('diario.mandato.intencaoDoDia')}</strong>
          <br />
          <span>{t('diario.mandato.suaSemente')}</span>
          <br />
          <em className="text-[#B8BFCE]">{mentor_hook.intencao}</em>
        </div>
      </div>

      {/* Crisis detection — CVV-188 (Ethics Charter §5) */}
      {crise ? (
        <div className={card(C.magenta)}>
          <span className={label(C.magenta)} style={{ color: C.magenta }}>
            {t('diario.mandato.cvvRecurso')}
          </span>
          <h2 className={headline} style={{ color: C.magenta }}>
            {t('diario.mandato.voceNaoEstaSozinho')}
          </h2>
          <p className={body}>{t('diario.mandato.cvvReconhece')}</p>
          <div
            className="mt-4 p-4 rounded-xl"
            style={{ background: 'rgba(251,87,129,0.08)', border: '1px solid rgba(251,87,129,0.4)' }}
          >
            <p className={`${body} text-[#F4F5FF] font-semibold mb-1`}>
              {t('diario.mandato.cvvNome')}
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
              {t('diario.mandato.cvvLigue')}
            </p>
            <p className={`${body} text-[0.78rem] text-[#8A9BB8] mt-1.5`}>
              {t('diario.mandato.cvvChat')}{' '}
              <a
                href="https://cvv.org.br"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: C.magenta }}
              >
                {t('diario.mandato.cvvSite')}
              </a>
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Daily alert — from DailyResponse.alert */}
          {alert ? (
            <div
              className={card(C.magenta)}
              style={{ borderColor: `${C.magenta}55`, background: 'rgba(251,87,129,0.05)' }}
              role="alert"
              aria-label={t('diario.mandato.alertAriaLabel')}
            >
              <span className={label(C.magenta)} style={{ color: C.magenta }}>
                {t('diario.mandato.alertaDoDia')}
              </span>
              <p className={body} style={{ color: '#F4F5FF' }}>{alert}</p>
            </div>
          ) : null}

          <div className={card(pilarInfo.cor)}>
            <h2 className={headline} style={{ color: pilarInfo.cor }}>
              {t('diario.mandato.vozDoAkasha')}
            </h2>
            <span className="text-[0.68rem] text-[#B8BFCE] block mb-1.5">
              {t('diario.mandato.leiaEmVozAlta')}
            </span>
            <span className="text-[0.72rem] text-[#8A9BB8] italic block mb-2">
              {t('diario.mandato.tresFrasesDesc')}
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
                    className={badge(PILLAR_LABELS[p]?.cor ?? C.txtMut)}
                    style={{
                      background: `${PILLAR_LABELS[p]?.cor ?? C.txtMut}1A`,
                      borderColor: `${PILLAR_LABELS[p]?.cor ?? C.txtMut}55`,
                      color: PILLAR_LABELS[p]?.cor ?? C.txtMut,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}

            <div className="text-center mt-2">
              <span className="text-[0.7rem] text-[#8A9BB8]">
                {t('diario.mandato.roleParaBaixo')}
              </span>
            </div>

          </div>

          {/* Pergunta do Dia (expandível) */}
          <div className={card(C.violeta)}>
            <button
              type="button"
              onClick={() => setPerguntaOpen((v) => !v)}
              className="w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: C.violeta }}
              aria-expanded={perguntaOpen}
              aria-controls="pergunta-panel"
            >
              <h2 id="pergunta-heading" className={headline} style={{ color: C.violeta }}>
                {t('diario.mandato.perguntaDoDia')}
              </h2>
            </button>

            {perguntaOpen && (
              <div id="pergunta-panel" className="mt-3">
                <p className={body}>{t('diario.mandato.respire')}</p>
                <textarea
                  value={perguntaText}
                  onChange={(e) => handlePerguntaChange(e.target.value)}
                  placeholder={t('diario.mandato.naoJulgue')}
                  className="w-full min-h-[100px] mt-3 p-3 rounded-xl bg-[rgba(124,92,255,0.06)] border border-[rgba(124,92,255,0.3)] text-[#F4F5FF] text-[0.88rem] font-lora leading-relaxed resize-y outline-none"
                  rows={4}
                  aria-labelledby="pergunta-heading"
                />
                <p className="text-[0.65rem] text-[#8A9BB8] mt-2">
                  {t('diario.mandato.salvoLocal')}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
