import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const VIOLET = '#7C5CFF';
const AURORA = '#2DD4BF';
const GOLD = '#F0B429';
const MAGENTA = '#FB5781';
const BG_DEEP = '#06070F';
const BG_DARK = '#0B0E1C';
const BG_MID = '#141A33';
const BG_LIGHT = '#26304F';
const TEXT_MAIN = '#F4F5FF';
const TEXT_MUTED = '#A7AECF';
const TEXT_DIM = '#5C6691';

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG_DEEP,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  coverPage: {
    backgroundColor: BG_DEEP,
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  contentPage: {
    backgroundColor: BG_DEEP,
    fontFamily: 'Helvetica',
    padding: '40 50',
    paddingBottom: 60,
  },

  // Cover styles
  coverAccent: {
    width: 40,
    height: 2,
    backgroundColor: GOLD,
    marginBottom: 32,
  },
  coverTitle: {
    fontSize: 28,
    color: GOLD,
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Helvetica-Bold',
  },
  coverSubtitle: {
    fontSize: 10,
    color: TEXT_MUTED,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 48,
    textTransform: 'uppercase',
  },
  coverName: {
    fontSize: 18,
    color: TEXT_MAIN,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Helvetica-Bold',
  },
  coverDate: {
    fontSize: 9,
    color: TEXT_DIM,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 48,
  },
  coverDivider: {
    width: 80,
    height: 0.5,
    backgroundColor: BG_LIGHT,
    marginBottom: 32,
  },
  coverFooter: {
    fontSize: 8,
    color: TEXT_DIM,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // Synthesis page
  synthesisBox: {
    backgroundColor: BG_MID,
    borderRadius: 6,
    padding: 24,
    marginTop: 24,
    borderLeftWidth: 2,
    borderLeftColor: VIOLET,
  },
  synthesisText: {
    fontSize: 10.5,
    color: TEXT_MAIN,
    lineHeight: 1.8,
  },

  // Section styles
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BG_LIGHT,
  },
  sectionLabel: {
    fontSize: 7,
    color: TEXT_DIM,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: 'Helvetica-Bold',
  },
  sectionSubtitle: {
    fontSize: 8.5,
    color: AURORA,
    letterSpacing: 1.5,
    marginTop: 3,
  },
  highlight: {
    fontSize: 20,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 7,
    color: TEXT_DIM,
    letterSpacing: 2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 9.5,
    color: TEXT_MUTED,
  },
  body: {
    fontSize: 10,
    color: TEXT_MAIN,
    lineHeight: 1.65,
    marginTop: 8,
  },
  badge: {
    fontSize: 7.5,
    color: GOLD,
    backgroundColor: BG_DARK,
    padding: '3 8',
    marginTop: 8,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: GOLD,
    alignSelf: 'flex-start',
  },
  preceitosTitle: {
    fontSize: 8,
    color: TEXT_DIM,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 5,
  },
  preceitoItem: {
    fontSize: 9,
    color: TEXT_MUTED,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: BG_LIGHT,
    marginVertical: 18,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: TEXT_DIM,
    letterSpacing: 1.5,
  },
  pageNumber: {
    fontSize: 7,
    color: TEXT_DIM,
  },

  // Page title bar
  pageTitleBar: {
    backgroundColor: BG_DARK,
    padding: '10 50',
    marginBottom: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: BG_LIGHT,
  },
  pageTitleText: {
    fontSize: 8,
    color: TEXT_DIM,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});

export interface ManifestoContent {
  userName: string;
  generatedAt: string;
  synthesis: string;
  /** AD-T5-F (AD-20.2): bloco de glossário injetado para downstream IA. */
  glossarySection?: string;
  odus: {
    title: string;
    oduName: string;
    oduNumber: number | null;
    orixas: string[];
    elementalForce: string | null;
    description: string;
    preceitos?: string[];
    provisional: boolean;
  };
  kabala: {
    title: string;
    lifePath: number | null;
    lifePathMaster: boolean;
    expression: number | null;
    motivation: number | null;
    personalYear: number | null;
    description: string;
  };
  tantra: {
    title: string;
    soul: number | null;
    karma: number | null;
    divineGift: number | null;
    tantricPath: number | null;
    description: string;
  };
  astrology: {
    title: string;
    ascendant: string | null;
    dominantPlanet: string | null;
    mainPlanets: Array<{ name: string; sign: string }>;
    description: string;
  };
}

function Footer({ label }: { label: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Sistema Akasha — confidencial</Text>
      <Text style={styles.pageNumber}>{label}</Text>
    </View>
  );
}

export default function ManifestoPDF({ content }: { content: ManifestoContent }) {
  const { userName, generatedAt, synthesis, odus, kabala, tantra, astrology } = content;

  return (
    <Document title={`Manifesto Akáshico — ${userName}`} author="Sistema Akasha">
      {/* ── CAPA ─────────────────────────────────────────────── */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverAccent} />
        <Text style={styles.coverTitle}>MANIFESTO AKÁSHICO</Text>
        <Text style={styles.coverSubtitle}>Tecnologia Espiritual Viva</Text>
        <View style={styles.coverDivider} />
        <Text style={styles.coverName}>{userName.toUpperCase()}</Text>
        <Text style={styles.coverDate}>{generatedAt}</Text>
        <View style={styles.coverDivider} />
        <Text style={styles.coverFooter}>Cabala dos Caminhos · Sistema Akasha</Text>
        <Footer label="capa" />
      </Page>

      {/* ── SÍNTESE ──────────────────────────────────────────── */}
      <Page size="A4" style={styles.contentPage}>
        <View style={styles.pageTitleBar} fixed>
          <Text style={styles.pageTitleText}>Manifesto Akáshico · {userName}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Visão Unificada</Text>
            <Text style={[styles.sectionTitle, { color: MAGENTA }]}>SÍNTESE DOS 4 PILARES</Text>
            <Text style={styles.sectionSubtitle}>
              O Cruzamento dos Mapas · A Equação Espiritual
            </Text>
          </View>
          <View style={styles.synthesisBox}>
            <Text style={styles.synthesisText}>{synthesis}</Text>
          </View>
        </View>

        <Footer label="síntese" />
      </Page>

      {/* ── ODU + KABALA ─────────────────────────────────────── */}
      <Page size="A4" style={styles.contentPage}>
        <View style={styles.pageTitleBar} fixed>
          <Text style={styles.pageTitleText}>Manifesto Akáshico · {userName}</Text>
        </View>

        {/* Seção I — Odus */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>I</Text>
            <Text style={[styles.sectionTitle, { color: GOLD }]}>BÚSSOLA ANCESTRAL — ODUS</Text>
            <Text style={styles.sectionSubtitle}>A Força Vital · O Ori · As Raízes</Text>
          </View>

          {odus.oduName ? (
            <Text style={styles.highlight}>
              {odus.oduName}
              {odus.oduNumber !== null ? ` (${odus.oduNumber})` : ''}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            {odus.orixas.length > 0 && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Regência</Text>
                <Text style={styles.metaValue}>{odus.orixas.join(' · ')}</Text>
              </View>
            )}
            {odus.elementalForce ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Força Elemental</Text>
                <Text style={styles.metaValue}>{odus.elementalForce}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.body}>{odus.description}</Text>

          {odus.preceitos && odus.preceitos.length > 0 && (
            <View>
              <Text style={styles.preceitosTitle}>Preceitos</Text>
              {odus.preceitos.map((p, i) => (
                <Text key={i} style={styles.preceitoItem}>
                  · {p}
                </Text>
              ))}
            </View>
          )}

          {odus.provisional && (
            <Text style={styles.badge}>⚠ Dado provisório — aguarda validação de linhagem</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Seção II — Kabala */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>II</Text>
            <Text style={[styles.sectionTitle, { color: VIOLET }]}>
              O VERBO — NUMEROLOGIA CABALÍSTICA
            </Text>
            <Text style={styles.sectionSubtitle}>O Contrato de Alma · O Propósito</Text>
          </View>

          {kabala.lifePath !== null && (
            <Text style={styles.highlight}>
              {kabala.lifePath}
              {kabala.lifePathMaster ? ' ✦' : ''}
            </Text>
          )}

          <View style={styles.metaRow}>
            {kabala.expression !== null && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Expressão</Text>
                <Text style={styles.metaValue}>{kabala.expression}</Text>
              </View>
            )}
            {kabala.motivation !== null && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Motivação</Text>
                <Text style={styles.metaValue}>{kabala.motivation}</Text>
              </View>
            )}
            {kabala.personalYear !== null && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Ano Pessoal</Text>
                <Text style={styles.metaValue}>{kabala.personalYear}</Text>
              </View>
            )}
          </View>

          <Text style={styles.body}>{kabala.description}</Text>
        </View>

        <Footer label="I – II" />
      </Page>

      {/* ── TANTRA + ASTROLOGIA ──────────────────────────────── */}
      <Page size="A4" style={styles.contentPage}>
        <View style={styles.pageTitleBar} fixed>
          <Text style={styles.pageTitleText}>Manifesto Akáshico · {userName}</Text>
        </View>

        {/* Seção III — Tântrica */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>III</Text>
            <Text style={[styles.sectionTitle, { color: AURORA }]}>
              A ANATOMIA SUTIL — NUMEROLOGIA TÂNTRICA
            </Text>
            <Text style={styles.sectionSubtitle}>Os 11 Corpos Espirituais · O Veículo</Text>
          </View>

          {tantra.soul !== null && <Text style={styles.highlight}>Alma: {tantra.soul}</Text>}

          <View style={styles.metaRow}>
            {tantra.karma !== null && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Karma</Text>
                <Text style={styles.metaValue}>{tantra.karma}</Text>
              </View>
            )}
            {tantra.divineGift !== null && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Dom Divino</Text>
                <Text style={styles.metaValue}>{tantra.divineGift}</Text>
              </View>
            )}
            {tantra.tantricPath !== null && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Caminho Tântrico</Text>
                <Text style={styles.metaValue}>{tantra.tantricPath}</Text>
              </View>
            )}
          </View>

          <Text style={styles.body}>{tantra.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Seção IV — Astrologia */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>IV</Text>
            <Text style={[styles.sectionTitle, { color: VIOLET }]}>
              O MAPA DE BORDO — ASTROLOGIA
            </Text>
            <Text style={styles.sectionSubtitle}>O Céu Natal · O Tempo Cósmico</Text>
          </View>

          {astrology.ascendant ? (
            <Text style={styles.highlight}>Asc: {astrology.ascendant}</Text>
          ) : null}

          <View style={styles.metaRow}>
            {astrology.dominantPlanet ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Planeta Dominante</Text>
                <Text style={styles.metaValue}>{astrology.dominantPlanet}</Text>
              </View>
            ) : null}
          </View>

          {astrology.mainPlanets.length > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Planetas Principais</Text>
              <Text style={[styles.metaValue, { marginTop: 3 }]}>
                {astrology.mainPlanets
                  .slice(0, 5)
                  .map((p) => `${p.name} em ${p.sign}`)
                  .join(' · ')}
              </Text>
            </View>
          )}

          <Text style={styles.body}>{astrology.description}</Text>
        </View>

        <View style={[styles.divider, { marginTop: 24 }]} />
        <Text style={[styles.footerText, { textAlign: 'center', marginTop: 8 }]}>
          Gerado pelo Sistema Akasha · Cabala dos Caminhos
        </Text>

        <Footer label="III – IV" />
      </Page>
    </Document>
  );
}
