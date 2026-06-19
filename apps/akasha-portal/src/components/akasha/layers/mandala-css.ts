'use client';

/** All CSS keyframes and utility classes for the Mandala SVG.
 * Extracted from MandalaChart.tsx <style> block (Phase 1 refactor).
 * Import this as a string and render inside <style>{MANDALA_STYLES}</style>
 * so the CSS is colocated with the component rather than in a global sheet. */
export const MANDALA_STYLES = `
  @keyframes pulse-ori {
    0%, 100% { opacity: 0.65; }
    50% { opacity: 1; }
  }
  @keyframes ring-rotate {
    from { transform-origin: 200px 200px; transform: rotate(0deg); }
    to   { transform-origin: 200px 200px; transform: rotate(360deg); }
  }
  @keyframes dash-flow {
    to { stroke-dashoffset: -20; }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.08; }
    50% { opacity: 0.25; }
  }
  @keyframes particle-blink {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.55; }
  }

  .mandala-pulse        { animation: pulse-ori      3s ease-in-out infinite; }
  .mandala-pulse-2     { animation: pulse-ori      3s ease-in-out infinite; animation-delay: 0.5s; }
  .mandala-pulse-3     { animation: pulse-ori      3s ease-in-out infinite; animation-delay: 1.0s; }
  .ring-astrological    { animation: ring-rotate    120s linear infinite; }
  .ring-astrological-paused { animation: none; }
  .synergy-active      { animation: dash-flow       3s linear infinite; }
  .synergy-alert       { animation: dash-flow       1.5s linear infinite; }
  .star-twinkle        { animation: twinkle          4s ease-in-out infinite; }
  .particle-blink      { animation: particle-blink   2.5s ease-in-out infinite; }

  .layer-btn:hover {
    border-color: rgba(38,48,79,1) !important;
    color: #FFFFFF !important;
    transform: translateY(-1px);
  }
  .layer-btn:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
  }
`;
