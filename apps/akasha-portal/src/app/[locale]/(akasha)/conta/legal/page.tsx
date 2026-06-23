/**
 * /[locale]/(akasha)/conta/legal — Legal disclaimer page.
 *
 * Implements ADR 0002 Guardrail 4: "Disclaimer legal no app".
 * Required before public launch of Pilares 6 e 7 (Human Design/Gene Keys
 * translated implementations). Covers:
 *   - Universal esoteric principles (not tied to commercial systems)
 *   - Inspiration from Human Design / Gene Keys (renamed, not copied)
 *   - No affiliation with trademark holders
 *   - Educational/personal use only
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso Legal — Akasha Portal',
  description:
    'Aviso legal sobre inspirações, marcas registradas e uso educativo do Akasha Portal.',
};

const DISCLAIMER_PT_BR = `
Este sistema integra **princípios esotéricos universais** (Cabala, Astrologia, Tantra, I Ching, sistemas energéticos correlatos).
Inspirações conceituais incluem tradições como Human Design e Gene Keys,
**reinterpretadas de forma original e não-comercial**.

Não somos afiliados, endossados ou licenciados pelos detentores dessas marcas.
Todo o conteúdo textual é escrito do zero pela nossa equipe, sem cópia literal
de fontes proprietárias. A nomenclatura utilizada no sistema (Pilares 6 e 7)
é universalista e não comercial.

O Akasha Portal é uma ferramenta de **autoconhecimento e prática espiritual
educativa**, não substitui acompanhamento profissional de saúde mental,
médico, jurídico ou financeiro. Em caso de crise ou emergência, procure
profissional habilitado ou ligue CVV 188 (24h).

Ao utilizar o sistema, você reconhece que:
  1. As leituras são simbólicas e não constituem diagnóstico ou prescrição.
  2. As decisões tomadas a partir das leituras são de sua responsabilidade.
  3. O sistema respeita LGPD: você pode exportar e deletar seus dados a qualquer momento.
  4. As influências filosóficas do sistema são de Alexandre Cumino, Rubens
     Saraceni, Adriano Camargo e linhagens tradicionais universalistas.
`;

export default function LegalPage() {
  return (
    <main
      style={{
        maxWidth: '720px',
        margin: '2rem auto',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.6,
        color: '#e4e4e7',
      }}
    >
      <h1>Aviso Legal</h1>
      <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{DISCLAIMER_PT_BR}</p>
      <hr style={{ margin: '2rem 0', opacity: 0.3 }} />
      <h2>Em caso de crise</h2>
      <p>
        <strong>CVV — Centro de Valorização da Vida</strong>: ligue{' '}
        <strong>188</strong> (24 horas, gratuito). Se você está em perigo
        imediato, ligue <strong>190</strong> (SAMU) ou procure o pronto-socorro
        mais próximo.
      </p>
      <h2>Seus direitos (LGPD)</h2>
      <ul>
        <li>Acesso aos seus dados pessoais e de consulentes</li>
        <li>Correção de dados incorretos</li>
        <li>Exportação completa (portabilidade)</li>
        <li>Exclusão (direito ao esquecimento) — exceto obrigações legais</li>
        <li>Revogação de consentimento a qualquer momento</li>
      </ul>
      <p>
        Para exercer esses direitos: <code>privacidade@akasha.portal</code>
        {' '}ou página <a href="/conta">Conta</a>.
      </p>
    </main>
  );
}
