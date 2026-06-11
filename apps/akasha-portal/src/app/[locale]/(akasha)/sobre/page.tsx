/**
 * Sobre o Sistema — F-205 (Fase 6).
 *
 * Página institucional/educativa. Conteúdo estático derivado de
 * research aprovado, sem chamada de API. Explica:
 *   1) A narrativa central "Cicatriz vira Joia"
 *   2) Os 5 Pilares canônicos
 *   3) As 4 Camadas Temporais (D/S/Z/V)
 *   4) Compromissos éticos (5% causa, LGPD, CVV 188, RAG)
 *
 * Referências:
 *   - VISION.md §2, §4
 *   - .autonomous/research/synthesis/synthesis_v1.md §1, §2, §3
 *   - .autonomous/research/ethics/ethics_charter_v1.md §1, §3, §5
 *   - Cabala Luriânica 1570 (Tikkun) + Rudd 2009 (Shadow→Gift→Siddhi)
 *
 * Não requer auth — é educativa, não pessoal.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre o Sistema · Akasha',
  description: 'Sistema Akasha — 5 Pilares, 4 Camadas Temporais, 1 narrativa: Cicatriz vira Joia.',
};

// ── Paleta Akasha (canônica — alinhada com MandalaChart + Diário) ────────────
const C = {
  violeta: '#7C5CFF',
  aurora: '#2DD4BF',
  dourado: '#F0B429',
  magenta: '#FB5781',
  bronze: '#A0763A',
  bgVoid: '#06070F',
  bgDeep: '#0B0E1C',
  bgNeb: '#141A33',
  txtPri: '#F4F5FF',
  txtSec: '#A7AECF',
  txtMut: '#5C6691',
} as const;

// ── 5 Pilares canônicos (VISION §2 + synthesis_v1 §2.2) ──────────────────────
type Pilar = {
  id: 'cabala' | 'astrologia' | 'tantrica' | 'odu' | 'iching';
  numero: 1 | 2 | 3 | 4 | 5;
  nome: string;
  dominio: string;
  algoritmo: string;
  cor: string;
  fonte: string;
};

const PILARES: Pilar[] = [
  {
    id: 'cabala',
    numero: 1,
    nome: 'Numerologia Cabalística',
    dominio: 'Identidade, propósito, ciclos',
    algoritmo:
      'Mispar Hechrachi + Katan Mispari sobre nome + data de nascimento (PT-BR → hebraico, transliteração reversível)',
    cor: C.violeta,
    fonte: 'Sefer Yetzirah · Baraita 32 Regras · Golden Dawn 777',
  },
  {
    id: 'astrologia',
    numero: 2,
    nome: 'Astrologia',
    dominio: 'Céu natal, trânsitos, tempo qualitativo',
    algoritmo:
      'Whole Sign Houses (Brennan 2017) — Ascendente, Sol, Lua, 5 planetas pessoais, 12 signos, trânsitos lunares',
    cor: C.aurora,
    fonte: 'Ptolomeu · Helena Blavatsky · Brennan 2017 · Hellenistic revival',
  },
  {
    id: 'tantrica',
    numero: 3,
    nome: 'Numerologia Tântrica',
    dominio: 'Corpo sutil, anatomia energética',
    algoritmo:
      '11 Corpos (Yogi Bhajan) + Tridosha (Vata/Pitta/Kapha) + 5 Koshas (Taittiriya Upanishad)',
    cor: C.dourado,
    fonte: 'Kundalini Yoga · Taittiriya Upanishad · Brihattrayi (Charaka/Sushruta/Vagbhata)',
  },
  {
    id: 'odu',
    numero: 4,
    nome: 'Odu de Nascimento',
    dominio: 'Bússola ancestral, regência, oferenda',
    algoritmo:
      '16 Odu de Ifá (Eji Ogbe … Irosun Ofun) com correlação I Ching; orixá de cabeça como regente',
    cor: C.magenta,
    fonte: 'Ifá · Candomblé · parceria com terreiros (5% receita do Pilar)',
  },
  {
    id: 'iching',
    numero: 5,
    nome: 'I Ching',
    dominio: 'Mutação, hora viva, hexagrama do dia',
    algoritmo:
      'King Wen sequence (clássica) · 64 hexagramas · trigramas mod-8 · upper/lower trigram',
    cor: C.bronze,
    fonte: 'Wilhelm/Baynes 1950 · Livro das Mutações (China · séc. XI a.C.)',
  },
];

// ── 4 Camadas Temporais (synthesis_v1 §1.1) ──────────────────────────────────
type Camada = {
  codigo: 'D' | 'S' | 'Z' | 'V';
  nome: string;
  duracao: string;
  descricao: string;
  exemplo: string;
};

const CAMADAS: Camada[] = [
  {
    codigo: 'D',
    nome: 'Diária',
    duracao: '1 dia (06:00 → 06:00)',
    descricao:
      'A micro-dose. 1 Mandato por dia: 3 frases + 1 pergunta + 1 micro-ritual de 3 min. Cita 2-3 dos 5 Pilares.',
    exemplo: 'Lua em Touro, dia 7 — contrato de vida 7 em destaque, hexagrama 7.6 mutável.',
  },
  {
    codigo: 'S',
    nome: 'Semanal-Lunar',
    duracao: '~ 29,5 dias (ciclo lunar)',
    descricao:
      'O cadinho. 1 leitura semanal que cruza o trânsito lunar com o ano pessoal e o Odu do mês.',
    exemplo: 'Lua Nova em Escorpião — convite a olhar o que estava escondido sob a superfície.',
  },
  {
    codigo: 'Z',
    nome: 'Sazonal',
    duracao: '~ 4 meses (Ritucharya ayurvédica)',
    descricao:
      'O ritmo do corpo. Única camada sazonal do portfolio. Convida a ajustar alimentação, sono, prática.',
    exemplo: 'Hemisfério Sul: outono (Mar/abr/maio) — Vata começa a subir, ancorar com Terra.',
  },
  {
    codigo: 'V',
    nome: 'Vida',
    duracao: 'Décadas (Saturn 29,5a · Uranus 42a · Calendar Round 52a)',
    descricao:
      'A Travessia. Cruza o mapa natal com os ciclos macro — Saturno, Urano, a Roda dos 52 anos.',
    exemplo: 'Retorno de Saturno aos 29-30a — pergunta pelo peso e pela direção.',
  },
];

// ── Compromissos éticos (Ethics Charter v1 §1, §3, §5) ───────────────────────
const COMPROMISSOS = [
  {
    titulo: 'Citação obrigatória',
    cor: C.violeta,
    texto:
      'Toda leitura cita a fonte: Wilhelm/Baynes para I Ching, Sefer Yetzirah para Cabala, Charaka/Sushruta para Ayurveda, terreiros parceiros para Odu. Sem "scarily accurate" — toda síntese tem proveniência auditável.',
  },
  {
    titulo: '5% da receita para a causa',
    cor: C.aurora,
    texto:
      '5% do faturamento vai para 5 causas BR, uma por Pilar: Casa de Cabala (P1), Instituto Casa 1 (P2), NAMA/BAMS (P3), Saq Be — ajq’ij vivos (P4), Book of Changes Academy (P5). Total: 25% no ano 5. Inspirado em CHANI/FreeFrom.',
  },
  {
    titulo: 'LGPD by design',
    cor: C.dourado,
    texto:
      'Botão de crise (CVV 188) sempre visível. Cap de uso diário. Sem feed social. Sem comparação entre usuários. Dados deletáveis em 1 clique. DPO mensal + white paper anual + auditoria externa.',
  },
  {
    titulo: 'Tradição viva > tradição histórica',
    cor: C.magenta,
    texto:
      'Pilar 4 (Odu) só é calculado com consentimento + terreiro de referência. NUNCA calibramos contagem. NUNCA inventamos correspondências. Toda "fusão" entre tradições tem justificativa textual + fonte aberta.',
  },
  {
    titulo: 'AI híbrido: humano curado + IA com RAG',
    cor: C.bronze,
    texto:
      'O Grimório é curado por humanos. O Mentor IA consulta o Grimório via RAG obrigatório + cita a fonte em cada frase. "Não sei" é permitido. Honestidade > prazer. APA Health Advisory 2025 sobre sycophancy lido e respeitado.',
  },
  {
    titulo: 'Em crise → CVV 188',
    cor: C.magenta,
    texto:
      'Se a intenção do usuário contém marcadores de sofrimento (regex expandido em ethics_charter §5), o Akasha se afasta por design e renderiza o CVV 188 — Centro de Valorização da Vida (24h, gratuito, sigiloso).',
  },
];

// ── Estilos (mesma linguagem do diario/page.tsx e MandalaChart.tsx) ──────────

const wrapStyle: React.CSSProperties = {
  background: C.bgVoid,
  minHeight: '100dvh',
  paddingBottom: 80,
};

const innerStyle: React.CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  width: '100%',
  padding: '0 20px',
};

const heroTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-cinzel, serif)',
  color: C.txtPri,
  fontSize: 'clamp(1.4rem, 4vw, 2.1rem)',
  letterSpacing: '0.12em',
  textAlign: 'center',
  lineHeight: 1.3,
  marginBottom: 14,
  textTransform: 'uppercase',
};

const heroSubtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-lora, serif)',
  color: C.txtSec,
  fontSize: '0.95rem',
  textAlign: 'center',
  fontStyle: 'italic',
  marginBottom: 22,
  lineHeight: 1.6,
};

const heroQuoteStyle: React.CSSProperties = {
  fontFamily: 'var(--font-lora, serif)',
  color: C.dourado,
  fontSize: '1.05rem',
  textAlign: 'center',
  fontStyle: 'italic',
  padding: '14px 18px',
  borderLeft: `3px solid ${C.dourado}`,
  borderRight: `3px solid ${C.dourado}`,
  margin: '0 auto 40px',
  maxWidth: 560,
  lineHeight: 1.7,
};

const sectionTitleStyle = (cor: string): React.CSSProperties => ({
  fontFamily: 'var(--font-cinzel, serif)',
  color: cor,
  fontSize: '0.78rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  marginTop: 56,
  marginBottom: 22,
  paddingBottom: 10,
  borderBottom: `1px solid ${cor}33`,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
});

const cardStyle = (borderColor: string): React.CSSProperties => ({
  background: 'rgba(11,14,28,0.72)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${borderColor}33`,
  borderLeft: `3px solid ${borderColor}`,
  borderRadius: 14,
  padding: '20px 22px',
  marginBottom: 14,
});

const labelStyle = (color: string): React.CSSProperties => ({
  fontSize: '0.62rem',
  fontFamily: 'var(--font-cinzel, serif)',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color,
  marginBottom: 6,
  display: 'block',
});

const bodyStyle: React.CSSProperties = {
  color: C.txtSec,
  fontSize: '0.9rem',
  lineHeight: 1.75,
  margin: 0,
};

const captionStyle: React.CSSProperties = {
  color: C.txtMut,
  fontSize: '0.78rem',
  fontStyle: 'italic',
  marginTop: 8,
  lineHeight: 1.5,
};

const pilarHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 10,
  marginBottom: 10,
};

const pilarNumeroStyle = (cor: string): React.CSSProperties => ({
  fontFamily: 'var(--font-cinzel, serif)',
  color: cor,
  fontSize: '1.6rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  lineHeight: 1,
});

const pilarNomeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-cinzel, serif)',
  color: C.txtPri,
  fontSize: '1.05rem',
  letterSpacing: '0.08em',
  flex: 1,
};

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  background: `${color}1A`,
  border: `1px solid ${color}55`,
  borderRadius: 20,
  padding: '3px 10px',
  fontSize: '0.7rem',
  letterSpacing: '0.06em',
  color,
  marginRight: 6,
  marginTop: 6,
});

const footerStyle: React.CSSProperties = {
  marginTop: 64,
  padding: '20px 22px',
  borderTop: `1px solid ${C.bgNeb}`,
  textAlign: 'center',
  color: C.txtMut,
  fontSize: '0.75rem',
  letterSpacing: '0.05em',
  lineHeight: 1.7,
};

// ── Página ───────────────────────────────────────────────────────────────────

export default function SobrePage() {
  return (
    <main style={wrapStyle}>
      <div style={{ ...innerStyle, paddingTop: 48 }}>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <h1 style={heroTitleStyle}>O Sistema Akasha</h1>
        <p style={heroSubtitleStyle}>
          Tecnologia espiritual universal. 5 tradições. 4 camadas de tempo. 1 narrativa.
        </p>

        <blockquote style={heroQuoteStyle}>
          “Cicatriz vira Joia” — toda leitura pessoal é um ato de <strong>tikkun</strong>: ver a
          sombra, virar gift, apontar siddhi.
        </blockquote>

        <p
          style={{
            ...bodyStyle,
            textAlign: 'center',
            maxWidth: 620,
            margin: '0 auto',
            color: C.txtSec,
          }}
        >
          Akasha integra cinco tradições (Numerologia Cabalística, Astrologia, Numerologia Tântrica,
          Odu de Nascimento e I Ching) numa única Mandala pessoal atravessada por quatro camadas
          temporais (Diária · Semanal-Lunar · Sazonal · Vida). A espinha que costura tudo é a
          narrativa <em style={{ color: C.dourado }}>Cicatriz vira Joia</em> — da Cabala Luriânica
          (Tikkun, 1570) ao Shadow → Gift → Siddhi de Richard Rudd (2009).
        </p>

        {/* ── 5 Pilares ──────────────────────────────────────────────── */}
        <h2 style={sectionTitleStyle(C.violeta)}>
          <span>Os 5 Pilares</span>
        </h2>

        {PILARES.map((p) => (
          <div key={p.id} style={cardStyle(p.cor)}>
            <div style={pilarHeaderStyle}>
              <span style={pilarNumeroStyle(p.cor)}>0{p.numero}</span>
              <span style={pilarNomeStyle}>{p.nome}</span>
            </div>

            <span style={labelStyle(p.cor)}>Domínio</span>
            <p style={bodyStyle}>{p.dominio}</p>

            <span style={{ ...labelStyle(p.cor), marginTop: 10 }}>Algoritmo</span>
            <p style={bodyStyle}>{p.algoritmo}</p>

            <div style={{ marginTop: 10 }}>
              <span style={badgeStyle(p.cor)}>{p.fonte}</span>
            </div>
          </div>
        ))}

        {/* ── 4 Camadas Temporais ────────────────────────────────────── */}
        <h2 style={sectionTitleStyle(C.aurora)}>
          <span>As 4 Camadas de Tempo</span>
        </h2>

        {CAMADAS.map((c) => (
          <div key={c.codigo} style={cardStyle(C.aurora)}>
            <div style={pilarHeaderStyle}>
              <span style={pilarNumeroStyle(C.aurora)}>{c.codigo}</span>
              <span style={pilarNomeStyle}>{c.nome}</span>
            </div>

            <span style={labelStyle(C.aurora)}>Duração</span>
            <p style={bodyStyle}>{c.duracao}</p>

            <span style={{ ...labelStyle(C.aurora), marginTop: 10 }}>O que é</span>
            <p style={bodyStyle}>{c.descricao}</p>

            <p style={captionStyle}>Exemplo: {c.exemplo}</p>
          </div>
        ))}

        {/* ── Compromissos Éticos ───────────────────────────────────── */}
        <h2 style={sectionTitleStyle(C.magenta)}>
          <span>Os 6 Compromissos Éticos</span>
        </h2>

        {COMPROMISSOS.map((c) => (
          <div key={c.titulo} style={cardStyle(c.cor)}>
            <span style={labelStyle(c.cor)}>{c.titulo}</span>
            <p style={bodyStyle}>{c.texto}</p>
          </div>
        ))}

        {/* ── Footer / Proveniência ─────────────────────────────────── */}
        <footer style={footerStyle}>
          <p>
            Sistema Akasha · Cabala dos Caminhos
            <br />
            White paper anual · Fontes canônicas em cada Pilar · LGPD by design
          </p>
          <p style={{ marginTop: 10, color: C.txtMut, fontSize: '0.7rem' }}>
            Propostas centrais: Tikkun (Luria 1570) · Shadow→Gift→Siddhi (Rudd 2009) · Sefer
            Yetzirah · Baraita 32 Regras · Golden Dawn 777 · Brennan 2017 · Taittiriya Upanishad ·
            Brihattrayi · Ifá / Candomblé · Wilhelm/Baynes 1950 · King Wen sequence · Ethics Charter
            v1.
          </p>
        </footer>
      </div>
    </main>
  );
}
