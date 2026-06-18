'use client';

/**
 * PlainEnglishPlanet — F-248
 *
 * Transforma dados astrológicos técnicos em linguagem prática e compreensível.
 *
 * Problema resolvido:
 * - "Sol em Escorpião" não significa nada para o usuário comum
 * - Termos técnicos como "Ascendente", "Meio do Céu" não são explicados
 * - O usuário vê dados mas não sabe o que FAZER com isso
 */
import { HelpCircle, ChevronDown, Zap, Heart, Brain, Shield } from 'lucide-react';
import { useState } from 'react';

interface PlainEnglishPlanetProps {
  /** Nome do planeta */
  planet: string;
  /** Signo (ex: "Escorpião", "Leão") */
  sign: string;
  /** Grau no signo (0-29) */
  degree: number;
  /** Casa astrológica (1-12) */
  house?: number;
  /** Se está em retrogradação */
  retrograde?: boolean;
  /** Modo de exibição */
  variant?: 'full' | 'compact' | 'tooltip';
}

/** Tradução de signos para linguagem prática */
const SIGN_PRAXIS: Record<
  string,
  {
    energia: string;
    deve: string;
    evitar: string;
    hoje: string;
  }
> = {
  Escorpião: {
    energia: 'intensidade transformadora',
    deve: 'use sua energia para demolir o que não serve',
    evitar: 'manipulação e ciúmes',
    hoje: 'transforme, não lute',
  },
  Leão: {
    energia: 'criatividade radiante',
    deve: 'expresse-se com confiança natural',
    evitar: 'egocentrismo e necessidade de aprovação',
    hoje: 'brilhe sem esforço',
  },
  Áries: {
    energia: 'iniciativa audaciosa',
    deve: 'age, mas com consciência',
    evitar: 'impulsividade e agressividade',
    hoje: 'comece algo novo com propósito',
  },
  Touro: {
    energia: 'estabilidade sensorial',
    deve: 'cultive o que tem valor real',
    evitar: 'preguiça e possessividade',
    hoje: 'conecte-se com seus sentidos',
  },
  Gêmeos: {
    energia: 'curiosidade mental',
    deve: 'comunique-se com clareza',
    evitar: 'fuga de compromisso e superficialidade',
    hoje: 'use sua mente para conectar pessoas',
  },
  Câncer: {
    energia: 'intuição emocional',
    deve: 'cuide de quem você ama',
    evitar: 'manipulação emocional e vitimização',
    hoje: 'honre suas raízes e memórias',
  },
  Virgem: {
    energia: 'análise prática',
    deve: 'organize e simplifique',
    evitar: 'perfeccionismo paralisante',
    hoje: 'faça algo útil por alguém hoje',
  },
  Libra: {
    energia: 'harmonia e relações',
    deve: 'busque equilíbrio com terceiros',
    evitar: 'indecisão e placar externo',
    hoje: 'reveja seus relacionamentos',
  },
  Sagitário: {
    energia: 'expansão e propósito',
    deve: 'busque significado e verdade',
    evitar: 'exagero e dogmatismo',
    hoje: 'saia da zona de conforto',
  },
  Capricórnio: {
    energia: 'disciplina e ambição',
    deve: 'trabalhe com perseverança',
    evitar: 'frieza e obsessão por status',
    hoje: 'estrutura algo que dura',
  },
  Aquário: {
    energia: 'inovação e coletividade',
    deve: 'traga ideias novas para o mundo',
    evitar: 'detachment emocional',
    hoje: 'conecte-se com causas maiores',
  },
  Peixes: {
    energia: 'conexão espiritual',
    deve: 'confie na sua intuição',
    evitar: 'ilusão e fuga da realidade',
    hoje: 'pratique compaixão sem perder limites',
  },
};

/** Significado das casas em linguagem simples */
const HOUSE_MEANINGS: Record<number, { title: string; practice: string }> = {
  1: { title: 'Identidade', practice: 'Quem você está sendo hoje?' },
  2: { title: 'Recursos', practice: 'Como está seus valores e finanças?' },
  3: { title: 'Comunicação', practice: 'O que você precisa dizer ou aprender?' },
  4: { title: 'Raízes', practice: 'Como está sua casa e família?' },
  5: { title: 'Criação', practice: 'O que você quer criar ou expressar?' },
  6: { title: 'Rotina', practice: 'O que precisa de organização?' },
  7: { title: 'Parcerias', practice: 'Como está seus relacionamentos?' },
  8: { title: 'Transformação', practice: 'O que precisa ser transformado?' },
  9: { title: 'Expansão', practice: 'O que amplia sua visão de mundo?' },
  10: { title: 'Propósito', practice: 'Qual sua missão pública?' },
  11: { title: 'Coletivo', practice: 'Como você contribui para o grupo?' },
  12: { title: 'Inner world', practice: 'O que sua intuição está dizendo?' },
};

/** Significado dos planetas em linguagem simples */
const PLANET_MEANINGS: Record<string, { forca: string; momento: string }> = {
  Sol: { forca: 'sua vontade central', momento: 'agora é hora de brilhar' },
  Lua: { forca: 'seu mundo emocional', momento: 'confie seus sentimentos' },
  Marte: { forca: 'sua energia de ação', momento: 'age, mas com consciência' },
  Mercúrio: { forca: 'sua mente e comunicação', momento: 'comunique-se com clareza' },
  Vênus: { forca: 'seu amor e valores', momento: 'cultive o que ama' },
  Júpiter: { forca: 'sua expansão', momento: 'busque significado' },
  Saturno: { forca: 'sua estrutura', momento: 'trabalhe com disciplina' },
  Urano: { forca: 'sua inovação', momento: 'traga algo novo' },
  Netuno: { forca: 'sua espiritualidade', momento: 'confie na intuição' },
  Plutão: { forca: 'sua transformação', momento: 'mude o que precisa' },
};

export function PlainEnglishPlanet({
  planet,
  sign,
  degree,
  house,
  retrograde = false,
  variant = 'full',
}: PlainEnglishPlanetProps) {
  const [expanded, setExpanded] = useState(variant === 'tooltip');

  const signData = SIGN_PRAXIS[sign] ?? {
    energia: 'energia única',
    deve: 'use sua energia com consciência',
    evitar: 'exageros',
    hoje: 'esteja presente',
  };

  const planetData = PLANET_MEANINGS[planet] ?? {
    forca: 'energia única',
    momento: 'use com sabedoria',
  };

  const houseData = house ? HOUSE_MEANINGS[house] : null;

  // Versão compacta
  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#9D86FF',
          }}
        >
          {planet}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#A7AECF' }}>em {sign}</span>
        {retrograde && <span style={{ fontSize: '0.65rem', color: '#FB5781' }}>↺</span>}
      </div>
    );
  }

  // Tooltip - versão minimalista
  if (variant === 'tooltip') {
    return (
      <div
        style={{
          padding: '8px 10px',
          background: 'rgba(124, 92, 255, 0.1)',
          border: '1px solid rgba(124, 92, 255, 0.2)',
          borderRadius: '6px',
          fontSize: '0.75rem',
        }}
      >
        <p style={{ color: '#F4F5FF', margin: '0 0 4px' }}>
          <strong>{planet}</strong> em {sign}
        </p>
        <p style={{ color: '#A7AECF', margin: 0 }}>
          {signData.energia}. {signData.deve}.
        </p>
      </div>
    );
  }

  // Versão completa
  return (
    <div
      style={{
        background: 'rgba(124, 92, 255, 0.05)',
        border: '1px solid rgba(124, 92, 255, 0.15)',
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#7C5CFF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {planet}
          </span>
          <span style={{ color: '#A7AECF', fontSize: '0.75rem' }}>
            em {sign} {degree}°
          </span>
          {retrograde && (
            <span
              style={{
                fontSize: '0.65rem',
                color: '#FB5781',
                background: 'rgba(251, 87, 129, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              ↺ retrogradação
            </span>
          )}
        </div>
        <button
          aria-label={expanded ? 'Fechar detalhes' : 'Ver mais detalhes'}
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#7C5CFF',
            padding: '4px',
          }}
        >
          {expanded ? <ChevronDown size={14} /> : <HelpCircle size={14} />}
        </button>
      </div>

      {/* Significado prático - sempre visível */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <p
          style={{
            fontSize: '0.85rem',
            color: '#F4F5FF',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          <strong>Sua {planetData.forca.toLowerCase()}</strong> está em modo
          <strong>{signData.energia}</strong>.
        </p>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#A7AECF',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          ⚡ Hoje: {signData.deve}.
        </p>
      </div>

      {/* Detalhes expandidos */}
      {expanded && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(124, 92, 255, 0.1)',
          }}
        >
          {houseData && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <Shield size={12} style={{ color: '#7C5CFF', marginTop: '2px' }} />
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#7C5CFF',
                    fontWeight: 600,
                  }}
                >
                  Casa {house}: {houseData.title}
                </span>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#A7AECF',
                    margin: '2px 0 0',
                  }}
                >
                  {houseData.practice}
                </p>
              </div>
            </div>
          )}

          <div>
            <span
              style={{
                fontSize: '0.7rem',
                color: '#FB5781',
                fontWeight: 600,
              }}
            >
              ⚠ Evite:
            </span>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#A7AECF',
                margin: '2px 0 0',
                fontStyle: 'italic',
              }}
            >
              {signData.evitar}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Wrapper para transformar dados astrológicos do formato bruto em componente visual
 */
export function PlanetInsightsList({
  planets,
}: {
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
    house?: number;
    retrograde?: boolean;
  }>;
}) {
  if (!planets || planets.length === 0) {
    return (
      <p style={{ fontSize: '0.8rem', color: '#A7AECF', fontStyle: 'italic' }}>
        Sem dados planetários disponíveis
      </p>
    );
  }

  // Ordenar por importância: Sol, Lua, Ascendente, Mercúrio, Vênus, Marte, Júpiter, Saturno
  const ORDER = [
    'Sol',
    'Lua',
    'Mercúrio',
    'Vênus',
    'Marte',
    'Júpiter',
    'Saturno',
    'Urano',
    'Netuno',
    'Plutão',
  ];
  const sorted = [...planets].sort((a, b) => {
    const aIdx = ORDER.indexOf(a.name);
    const bIdx = ORDER.indexOf(b.name);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {sorted.slice(0, 5).map((planet) => (
        <PlainEnglishPlanet
          key={planet.name}
          planet={planet.name}
          sign={planet.sign}
          degree={planet.degree}
          house={planet.house}
          retrograde={planet.retrograde}
          variant="compact"
        />
      ))}
    </div>
  );
}
