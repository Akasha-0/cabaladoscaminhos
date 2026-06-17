import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import MandalaChart from '@/components/akasha/MandalaChart';
import { formatDegreeToZodiac } from '@/lib/shared/zodiac';
import { MandalaNarrativeLoader } from '@/components/akasha/MandalaNarrativeLoader';

export const metadata = {
  title: 'Minha Mandala',
  description: 'Sua Mandala Akáshica — os 5 pilares da sua existência.',
};

function getSaudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom despertar —';
  if (h < 18) return 'Boa tarde —';
  return 'Boa noite —';
}

export default async function MandalaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;

  if (!token) redirect(`/${locale}/onboarding`);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandala`,
    {
      headers: { Cookie: `akasha_session=${token}` },
      cache: 'no-store',
    }
  );

  if (res.status === 401 || res.status === 404) redirect(`/${locale}/onboarding`);

  const data = await res.json();

  const saudacao = getSaudacao();

  return (
    <main
      style={{ background: '#06070F', minHeight: 'calc(100vh - 56px)', position: 'relative' }}
      className="flex flex-col items-center py-8 px-4"
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at top, rgba(240,180,41,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(124,92,255,0.05) 0%, transparent 50%)',
          animation: 'akasha-pulse 8s ease-in-out infinite',
        }}
      />
      <style>{`@keyframes akasha-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }`}</style>

      <h1
        style={{
          fontFamily: 'var(--font-cinzel, serif)',
          color: '#F4F5FF',
          fontSize: '1.25rem',
          marginBottom: '0.35rem',
          letterSpacing: '0.1em',
        }}
      >
        MANDALA AKÁSHICA
      </h1>

      {/* Dynamic greeting */}
      <p
        style={{
          fontFamily: 'var(--font-cinzel, serif)',
          color: '#A7AECF',
          fontSize: '0.75rem',
          marginBottom: '1.25rem',
          letterSpacing: '0.05em',
        }}
      >
        {saudacao} sua Mandala Akáshica aguarda
      </p>

      {/* Incomplete data badge */}
      {data.incomplete && (
        <a
          href={`/${locale}/conta`}
          style={{
            display: 'inline-block',
            marginBottom: '1rem',
            padding: '5px 14px',
            borderRadius: '100px',
            border: '1px solid rgba(251,87,129,0.4)',
            background: 'rgba(251,87,129,0.08)',
            color: '#FB5781',
            fontSize: '0.75rem',
            textDecoration: 'none',
            letterSpacing: '0.03em',
          }}
        >
          ⚠ Dados incompletos — complete seu perfil para uma leitura plena
        </a>
      )}

      {/* F-229: ONE Profile + Síntese Narrativa — experiência primária */}
      <div className="w-full max-w-xl">
        <MandalaNarrativeLoader locale={locale} />
      </div>

      <MandalaChart data={data} />

      {/* Painel explicativo dos 5 Pilares + Mandato do dia */}
      <section
        aria-label="Os 5 Pilares explicados"
        style={{
          width: '100%',
          maxWidth: '720px',
          marginTop: '2.5rem',
          padding: '1.25rem',
          background: 'rgba(11,14,28,0.55)',
          border: '1px solid rgba(38,48,79,0.7)',
          borderRadius: '18px',
          backdropFilter: 'blur(6px)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            color: '#9D86FF',
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textAlign: 'center',
            marginBottom: '0.4rem',
          }}
        >
          POR QUE ESSAS 5 CAMADAS?
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            color: '#F4F5FF',
            fontSize: '1.05rem',
            textAlign: 'center',
            marginBottom: '1.1rem',
          }}
        >
          Sua Mandala lê você em cinco camadas
        </h2>
        <p
          style={{
            color: '#A7AECF',
            fontSize: '0.82rem',
            lineHeight: 1.65,
            textAlign: 'center',
            marginBottom: '1.25rem',
          }}
        >
          O Akasha unifica a sabedoria das tradições ancestrais sob uma única linguagem toroidal. Cada Camada ilumina uma dimensão do seu ser — revelando de onde você veio e como deve direcionar sua energia vital.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <PilarCard
            icone="◯"
            cor="#7C5CFF"
            titulo="Camada 4 · Cenário Cósmico"
            eixo="O Céu — Alinhamento Estelar"
            valor={
              data.astrology?.ascendant
                ? `Ascendente: ${formatDegreeToZodiac(data.astrology.ascendant)}`
                : 'Sem hora de nascimento'
            }
            explicacao="O cenário do céu no momento da sua primeira respiração. Mapeia seu Ascendente, planetas dominantes e trânsitos como uma bússola de navegação no tempo."
            fonte="Astrologia Tropical (Casas Inteiras)"
          />
          <PilarCard
            icone="△"
            cor="#7C5CFF"
            titulo="Camada 2 · Contrato de Alma"
            eixo="O Verbo — Geometria Sagrada"
            valor={data.kabala?.lifePath ? `Caminho de Vida ${data.kabala.lifePath}` : 'Em cálculo'}
            explicacao="A vibração numérica do seu nome e caminho. Revela a frequência geométrica que sua alma escolheu para navegar esta encarnação."
            fonte="Estudos de Cabala (Sefer Yetzirah)"
          />
          <PilarCard
            icone="⬡"
            cor="#2DD4BF"
            titulo="Camada 3 · Vitalidade"
            eixo="A Anatomia — Canais de Energia"
            valor={
              data.tantra?.soul != null
                ? `Corpo Principal: ${data.tantra.soul} · Karma: ${data.tantra?.karma ?? '—'}`
                : 'Mapeando 11 corpos'
            }
            explicacao="O mapeamento dos seus 11 corpos sutis e fluxo de energia. Identifica onde a energia flui livremente e onde estão os bloqueios que requerem práticas de ativação."
            fonte="Yogi Bhajan / 11 Corpos Sutis"
          />
          <PilarCard
            icone="✦"
            cor="#F0B429"
            titulo="Camada 1 · Alinhamento de Ori"
            eixo="A Terra — Força Elemental"
            valor={
              data.odus?.oduName
                ? `${data.odus.oduName}${data.odus?.elementalForce ? ' · ' + data.odus.elementalForce : ''}`
                : 'Aguardando terreiro'
            }
            explicacao="Sua âncora de manifestação. Representa a força elemental que rege seu alinhamento com a Terra e as quizilas (desvios) que você deve evitar para proteger sua energia."
            fonte="Sabedoria Tradicional dos Odus"
          />
          <PilarCard
            icone="☯"
            cor="#E0E7FF"
            titulo="Camada 5 · Chave de Origem"
            eixo="A Mutação — Ciclo Evolutivo"
            valor={
              data.iching?.hexagramNumber
                ? `Hexagrama ${data.iching.hexagramNumber}${data.iching?.hexagramName ? ' · ' + data.iching.hexagramName : ''}`
                : 'Calculando mutação'
            }
            explicacao="O hexagrama de origem que rege sua semente evolutiva. Mostra a transição da Sombra para o Dom e a realização máxima (Siddhi) ao longo da sua vida."
            fonte="64 Hexagramas do I Ching"
          />
        </div>

        {/* Mandato do dia — citações visíveis */}
        <MandatoCard data={data} />
      </section>

      <Link
        href="/dashboard"
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '8px 20px',
          borderRadius: '100px',
          background: 'rgba(124,92,255,0.15)',
          border: '1px solid rgba(124,92,255,0.3)',
          color: '#9D86FF',
          fontSize: '0.8rem',
          fontWeight: 600,
          textDecoration: 'none',
          letterSpacing: '0.03em',
          transition: 'all 0.2s',
        }}
      >
        → Análise Completa de Vida
      </Link>
      <Link
        href={`/${locale}/diario`}
        style={{
          display: 'block',
          marginTop: '0.75rem',
          color: '#5C6691',
          fontSize: '0.7rem',
          textDecoration: 'none',
          letterSpacing: '0.03em',
          transition: 'color 0.2s',
        }}
      >
        → Ver Diário Energético de hoje
      </Link>
    </main>
  );
}

interface PilarCardProps {
  icone: string;
  cor: string;
  titulo: string;
  eixo: string;
  valor: string;
  explicacao: string;
  fonte: string;
}

function PilarCard({ icone, cor, titulo, eixo, valor, explicacao, fonte }: PilarCardProps) {
  return (
    <article
      style={{
        background: 'rgba(6,7,15,0.55)',
        border: `1px solid ${cor}33`,
        borderLeft: `3px solid ${cor}`,
        borderRadius: '12px',
        padding: '0.9rem 0.95rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span aria-hidden style={{ fontSize: '1.15rem', color: cor, lineHeight: 1 }}>
          {icone}
        </span>
        <strong
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            fontSize: '0.78rem',
            color: '#F4F5FF',
            letterSpacing: '0.04em',
          }}
        >
          {titulo}
        </strong>
      </div>
      <span style={{ fontSize: '0.7rem', color: cor, letterSpacing: '0.05em' }}>{eixo}</span>
      <span
        style={{
          fontFamily: 'var(--font-cinzel, serif)',
          fontSize: '0.95rem',
          color: '#F4F5FF',
          marginTop: '0.2rem',
        }}
      >
        {valor}
      </span>
      <p style={{ fontSize: '0.78rem', color: '#A7AECF', lineHeight: 1.55, margin: 0 }}>
        {explicacao}
      </p>
      <span style={{ fontSize: '0.65rem', color: '#5C6691', fontStyle: 'italic' }}>
        via {fonte}
      </span>
    </article>
  );
}

interface MandatoData {
  iching?: { hexagramNumber?: number; hexagramName?: string | null } | null;
  astrology?: { ascendant?: string | null } | null;
  kabala?: { lifePath?: number | null } | null;
  odus?: { oduName?: string } | null;
  tantra?: { soul?: number | null } | null;
}

function MandatoCard({ data }: { data: MandatoData }) {
  const h = new Date().getHours();
  const saudacao = h < 12 ? 'Bom despertar' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const hex = data.iching?.hexagramNumber;
  const hexName = data.iching?.hexagramName;
  const lp = data.kabala?.lifePath;
  const asc = data.astrology?.ascendant;
  const odu = data.odus?.oduName;

  const citacoes: string[] = [];
  if (hex) citacoes.push(`via Pilar 5 (I Ching) — hexagrama ${hex}${hexName ? ' ' + hexName : ''}`);
  if (asc) citacoes.push(`via Pilar 2 (Astrologia) — Ascendente ${asc}`);
  if (lp != null) citacoes.push(`via Pilar 1 (Cabala) — Life Path ${lp}`);
  if (odu) citacoes.push(`via Pilar 4 (Odus) — ${odu}`);

  return (
    <div
      style={{
        marginTop: '1.25rem',
        padding: '1rem 1.1rem',
        background: 'linear-gradient(135deg, rgba(124,92,255,0.08) 0%, rgba(45,212,191,0.05) 100%)',
        border: '1px solid rgba(124,92,255,0.25)',
        borderRadius: '14px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-cinzel, serif)',
          color: '#9D86FF',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          marginBottom: '0.5rem',
        }}
      >
        ✦ MANDATO DE HOJE · {saudacao.toUpperCase()}
      </p>
      <p style={{ color: '#F4F5FF', fontSize: '0.92rem', lineHeight: 1.65, margin: 0 }}>
        Os cinco Pilares do seu mapa convergem agora.{' '}
        {hex
          ? `O hexagrama ${hex}${hexName ? ' (' + hexName + ')' : ''} ilumina o movimento do dia`
          : 'A mutação do dia será calculada em breve'}
        {lp != null ? `, em diálogo com seu Life Path ${lp}` : ''}
        {asc ? ` e seu Ascendente em ${asc}` : ''}
        {odu ? ` — sob a regência de ${odu}` : ''}.
      </p>
      {citacoes.length > 0 && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.6rem',
            borderTop: '1px dashed rgba(124,92,255,0.2)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem 0.8rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              fontSize: '0.62rem',
              color: '#5C6691',
              letterSpacing: '0.1em',
            }}
          >
            POR QUE ISSO:
          </span>
          {citacoes.map((c) => (
            <span key={c} style={{ fontSize: '0.7rem', color: '#A7AECF', fontStyle: 'italic' }}>
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
