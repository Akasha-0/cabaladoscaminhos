'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdOut?: number;
  description: string;
}

const PATTERNS: BreathingPattern[] = [
  {
    name: 'Relaxante',
    inhale: 4,
    hold: 4,
    exhale: 8,
    description: 'Ativa o sistema parassimpático, ideal para dormir.',
  },
  {
    name: '4-7-8',
    inhale: 4,
    hold: 7,
    exhale: 8,
    description: 'Técnica para ansiedade einsônia profunda.',
  },
  {
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdOut: 4,
    description: 'Navy SEAL. Aumenta foco e calma sob pressão.',
  },
  {
    name: 'Respiro Profundo',
    inhale: 6,
    hold: 2,
    exhale: 6,
    description: 'Simples e eficaz para momentos de tensão.',
  },
  {
    name: 'Energizante',
    inhale: 2,
    hold: 1,
    exhale: 2,
    description: 'Ritmo rápido para despertar energia.',
  },
];

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdOut' | 'idle';

interface PhaseInfo {
  phase: Phase;
  label: string;
  cue: string;
  color: string;
}

function getPhaseInfo(phase: Phase, pattern: BreathingPattern): PhaseInfo {
  switch (phase) {
    case 'inhale':
      return { phase, label: 'Inspire', cue: 'Respire profundamente...', color: '#6ee7b7' };
    case 'hold':
      return { phase, label: 'Segure', cue: 'Segure o ar...', color: '#93c5fd' };
    case 'exhale':
      return { phase, label: 'Expire', cue: 'Solte devagar...', color: '#c4b5fd' };
    case 'holdOut':
      return { phase, label: 'Pausa', cue: 'Mantenha...', color: '#fcd34d' };
    default:
      return { phase, label: 'Pronto', cue: 'Toque para começar', color: '#94a3b8' };
  }
}

export default function BreathingCoach() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [timer, setTimer] = useState(0);
  const [circleScale, setCircleScale] = useState(1);
  const [totalTime, setTotalTime] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const pattern = PATTERNS[activeIndex];

  const stopSession = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setPhase('idle');
    setTimer(0);
    setCircleScale(1);
  }, []);

  const startSession = useCallback(() => {
    stopSession();
    setTotalTime(0);
    setCycles(0);
    setIsRunning(true);
    setPhase('inhale');
    setTimer(pattern.inhale);
    setCircleScale(1.4);
    startTimeRef.current = Date.now();

    const phases: { ph: Phase; duration: number }[] = [
      { ph: 'inhale', duration: pattern.inhale },
      { ph: 'hold', duration: pattern.hold },
      { ph: 'exhale', duration: pattern.exhale },
    ];
    if (pattern.holdOut) {
      phases.push({ ph: 'holdOut', duration: pattern.holdOut });
    }

    let phaseIdx = 0;
    let remaining = pattern.inhale;

    intervalRef.current = setInterval(() => {
      remaining -= 0.1;
      setTimer(Math.max(0, remaining));
      setTotalTime((t) => t + 0.1);

      if (phaseIdx >= phases.length) {
        phaseIdx = 0;
        setCycles((c) => c + 1);
      }

      if (remaining <= 0) {
        phaseIdx = (phaseIdx + 1) % phases.length;
        remaining = phases[phaseIdx].duration;
        const ph = phases[phaseIdx].ph;
        setPhase(ph);

        if (ph === 'inhale' || ph === 'hold') {
          setCircleScale(1.6);
        } else if (ph === 'exhale' || ph === 'holdOut') {
          setCircleScale(1.0);
        }
      }
    }, 100);
  }, [pattern, stopSession]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentPhaseInfo = getPhaseInfo(phase, pattern);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Respira\u00e7\u00e3o Guiada</h2>
        <p style={styles.subtitle}>Selecione um padr\u00e3o e deixe-se guiar</p>
      </div>

      <div style={styles.patternSelector}>
        {PATTERNS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => {
              stopSession();
              setActiveIndex(i);
            }}
            style={{
              ...styles.patternBtn,
              ...(activeIndex === i ? styles.patternBtnActive : {}),
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div style={styles.infoBox}>
        <div style={styles.patternMeta}>
          <span style={styles.badge}>{PATTERNS[activeIndex].inhale}s</span>
          <span style={styles.sep}>\u2192</span>
          <span style={styles.badge}>{PATTERNS[activeIndex].hold}s</span>
          <span style={styles.sep}>\u2192</span>
          <span style={styles.badge}>{PATTERNS[activeIndex].exhale}s</span>
          {PATTERNS[activeIndex].holdOut && (
            <>
              <span style={styles.sep}>\u2192</span>
              <span style={styles.badge}>{PATTERNS[activeIndex].holdOut}s</span>
            </>
          )}
        </div>
        <p style={styles.patternDesc}>{PATTERNS[activeIndex].description}</p>
      </div>

      <div style={styles.stage}>
        <div
          style={{
            ...styles.circle,
            transform: `scale(${circleScale})`,
            borderColor: currentPhaseInfo.color,
            boxShadow: `0 0 40px ${currentPhaseInfo.color}66`,
          }}
        >
          <span style={{ ...styles.phaseLabel, color: currentPhaseInfo.color }}>
            {currentPhaseInfo.label}
          </span>
          {isRunning && phase !== 'idle' && (
            <span style={styles.timer}>{Math.ceil(timer)}</span>
          )}
        </div>

        <div style={styles.cue}>{currentPhaseInfo.cue}</div>
      </div>

      <div style={styles.controls}>
        <button
          onClick={isRunning ? stopSession : startSession}
          style={{
            ...styles.mainBtn,
            background: isRunning ? '#ef4444' : '#22c55e',
          }}
        >
          {isRunning ? 'Parar' : 'Iniciar'}
        </button>

        {isRunning && (
          <button onClick={stopSession} style={styles.skipBtn}>
            Pular
          </button>
        )}
      </div>

      {isRunning && (
        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Tempo</span>
            <span style={styles.statValue}>{formatTime(totalTime)}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Ciclos</span>
            <span style={styles.statValue}>{cycles}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '2rem',
    maxWidth: '480px',
    margin: '0 auto',
  },
  header: { textAlign: 'center' },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    margin: '0.25rem 0 0',
  },
  patternSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  patternBtn: {
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    border: '1px solid #334155',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  patternBtnActive: {
    background: '#1e293b',
    borderColor: '#6ee7b7',
    color: '#e2e8f0',
  },
  infoBox: {
    background: '#1e293b',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    width: '100%',
    textAlign: 'center',
    border: '1px solid #334155',
  },
  patternMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  badge: {
    background: '#334155',
    color: '#e2e8f0',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontVariantNumeric: 'tabular-nums',
  },
  sep: { color: '#64748b', fontSize: '0.75rem' },
  patternDesc: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: 0,
    fontStyle: 'italic',
  },
  stage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem 0',
  },
  circle: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    border: '3px solid #6ee7b7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease, border-color 0.4s, box-shadow 0.4s',
    background: '#0f172a',
    gap: '0.25rem',
  },
  phaseLabel: {
    fontSize: '1.25rem',
    fontWeight: 700,
    transition: 'color 0.4s',
  },
  timer: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#f1f5f9',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  cue: {
    fontSize: '0.9rem',
    color: '#cbd5e1',
    fontStyle: 'italic',
    textAlign: 'center',
    minHeight: '1.5em',
  },
  controls: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  mainBtn: {
    padding: '0.75rem 2rem',
    borderRadius: '9999px',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  skipBtn: {
    padding: '0.75rem 1.25rem',
    borderRadius: '9999px',
    border: '1px solid #475569',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  stats: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.125rem',
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#e2e8f0',
    fontVariantNumeric: 'tabular-nums',
  },
};
