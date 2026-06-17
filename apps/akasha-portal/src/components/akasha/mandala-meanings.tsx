import {
  significadoPorPilar,
  significadoGenericoDoPilar,
  type Pilar,
  type SignificadoCurado,
} from '@/lib/grimoire/significados-curados';

export const LIFE_PATH_MEANINGS: Record<number, string> = {
  1: 'Caminho do Pioneiro — sua missão é liderar e inaugurar novos caminhos. Aprenda a agir independentemente.',
  2: 'Caminho do Diplomata — cooperação, harmonia e parceria são seu veículo de crescimento.',
  3: 'Caminho do Criador — expressão, comunicação e criatividade são o seu propósito sagrado.',
  4: 'Caminho do Construtor — estrutura, disciplina e trabalho constante constroem seu legado.',
  5: 'Caminho da Liberdade — mudança, aventura e versatilidade são sua escola de vida.',
  6: 'Caminho do Guardião — responsabilidade, cuidado e serviço ao próximo definem sua essência.',
  7: 'Caminho do Buscador — introspecção, espiritualidade e sabedoria são seu norte.',
  8: 'Caminho do Realizador — poder, abundância e autoridade são os temas centrais da sua existência.',
  9: 'Caminho do Humanista — compaixão universal, conclusões e entrega ao coletivo.',
  11: 'Número Mestre 11 — Iluminador. Canal entre os planos, alta sensibilidade intuitiva e missão espiritual.',
  22: 'Número Mestre 22 — Construtor de Mundos. Capacidade de manifestar visões grandiosas na matéria.',
  33: 'Número Mestre 33 — Mestre Cósmico. Serviço incondicional, amor universal, cura e ensino.',
};

export const TANTRIC_BODY_WISDOM: Record<number, { desc: string; challenge: string; activate: string }> = {
  1: {
    desc: 'Corpo da Alma',
    challenge: 'Encontrar propósito humilde',
    activate: 'Meditação Ong Namo',
  },
  2: {
    desc: 'Mente Negativa',
    challenge: 'Discernir sem paralisar',
    activate: 'Respiração de fogo',
  },
  3: { desc: 'Mente Positiva', challenge: 'Confiar no processo', activate: 'Sat Kriya — 3 min' },
  4: { desc: 'Mente Neutra', challenge: 'Observar sem reagir', activate: 'Meditação do coração' },
  5: { desc: 'Corpo Físico', challenge: 'Encarnar totalmente', activate: 'Movimento consciente' },
  6: {
    desc: 'Linha do Arco',
    challenge: 'Proteger o campo áurico',
    activate: 'Ser humano íntegro',
  },
  7: { desc: 'Aura', challenge: 'Expandir sem dissolver', activate: 'Projeção e Proteção' },
  8: { desc: 'Corpo Prânico', challenge: 'Sustentar a vitalidade', activate: 'Pranayama diário' },
  9: { desc: 'Corpo Sutil', challenge: 'Escutar o infinalível', activate: 'Escuta da intuição' },
  10: {
    desc: 'Corpo Radiante',
    challenge: 'Brilhar corajosamente',
    activate: 'Ação corajosa cotidiana',
  },
  11: {
    desc: 'Mente Divina',
    challenge: 'Manter-se aberto ao infinito',
    activate: 'Gratidão e rendição',
  },
};

export function resolveSig(pilar: Pilar, id: string | number | null | undefined): SignificadoCurado {
  if (id == null) return significadoGenericoDoPilar(pilar);
  return significadoPorPilar(pilar, id) ?? significadoGenericoDoPilar(pilar);
}

export function SignificadoEmbed({
  significado,
  color,
}: {
  significado: SignificadoCurado;
  color: string;
}) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: '10px 12px',
        background: `${color}10`,
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        fontSize: '0.8rem',
        lineHeight: 1.45,
      }}
    >
      <p
        style={{
          color: '#F4F5FF',
          margin: 0,
          fontStyle: 'italic',
          fontFamily: 'var(--font-lora, serif)',
        }}
      >
        {significado.essencia}
      </p>
      <p style={{ color: '#A7AECF', margin: '6px 0 0', fontSize: '0.75rem' }}>
        <strong style={{ color }}>Missão:</strong> {significado.missao}
      </p>
      {significado.requer_terreiro && (
        <p style={{ color: '#FB5781', margin: '6px 0 0', fontSize: '0.7rem', fontStyle: 'italic' }}>
          ⚠ Interpretação profunda requer babalaô/yaô de confiança (R-022 §4.4).
        </p>
      )}
      <p style={{ color: '#5C6691', margin: '6px 0 0', fontSize: '0.65rem' }}>
        via {significado.fonte}
      </p>
    </div>
  );
}
