import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { backgroundColor: '#06070F', padding: 40, fontFamily: 'Helvetica' },
  header: { marginBottom: 32, borderBottomWidth: 1, borderBottomColor: '#26304F', paddingBottom: 16 },
  title: { fontSize: 22, color: '#F0B429', letterSpacing: 3, marginBottom: 6 },
  subtitle: { fontSize: 10, color: '#A7AECF', letterSpacing: 2 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 13, color: '#7C5CFF', marginBottom: 8, letterSpacing: 1 },
  sectionSubtitle: { fontSize: 9, color: '#2DD4BF', marginBottom: 12, letterSpacing: 1 },
  body: { fontSize: 10, color: '#F4F5FF', lineHeight: 1.6 },
  highlight: { fontSize: 18, color: '#F0B429', marginBottom: 4 },
  muted: { fontSize: 9, color: '#A7AECF' },
  divider: { borderBottomWidth: 0.5, borderBottomColor: '#26304F', marginVertical: 16 },
  badge: { fontSize: 8, color: '#2DD4BF', backgroundColor: '#0B0E1C', padding: 4, marginTop: 4 },
});

export interface ManifestoContent {
  userName: string;
  generatedAt: string;
  odus: {
    title: string;
    oduName: string;
    oduNumber: number | null;
    orixas: string[];
    elementalForce: string | null;
    description: string;
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

export default function ManifestoPDF({ content }: { content: ManifestoContent }) {
  return (
    <Document title={`Manifesto Akáshico — ${content.userName}`} author="Sistema Akasha">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MANIFESTO AKÁSHICO</Text>
          <Text style={styles.subtitle}>{content.userName.toUpperCase()}</Text>
          <Text style={[styles.muted, { marginTop: 4 }]}>Gerado em {content.generatedAt}</Text>
        </View>

        {/* Seção 1 — Odus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I. BÚSSOLA ANCESTRAL — ODUS</Text>
          <Text style={styles.sectionSubtitle}>A Força Vital · O Ori · As Raízes</Text>
          {content.odus.oduName && (
            <Text style={styles.highlight}>{content.odus.oduName}{content.odus.oduNumber ? ` (${content.odus.oduNumber})` : ''}</Text>
          )}
          {content.odus.orixas.length > 0 && (
            <Text style={styles.muted}>Regência: {content.odus.orixas.join(' · ')}</Text>
          )}
          {content.odus.elementalForce && (
            <Text style={[styles.muted, { marginTop: 2 }]}>Força Elemental: {content.odus.elementalForce}</Text>
          )}
          <Text style={[styles.body, { marginTop: 8 }]}>{content.odus.description}</Text>
          {content.odus.provisional && (
            <Text style={styles.badge}>⚠ Dado provisório — aguarda validação de linhagem</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Seção 2 — Kabala */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>II. O VERBO — NUMEROLOGIA CABALÍSTICA</Text>
          <Text style={styles.sectionSubtitle}>O Contrato de Alma · O Propósito</Text>
          {content.kabala.lifePath !== null && (
            <Text style={styles.highlight}>
              Caminho de Vida: {content.kabala.lifePath}{content.kabala.lifePathMaster ? ' ✦' : ''}
            </Text>
          )}
          {content.kabala.expression !== null && (
            <Text style={styles.muted}>Expressão: {content.kabala.expression}</Text>
          )}
          {content.kabala.motivation !== null && (
            <Text style={styles.muted}>Motivação: {content.kabala.motivation}</Text>
          )}
          {content.kabala.personalYear !== null && (
            <Text style={styles.muted}>Ano Pessoal: {content.kabala.personalYear}</Text>
          )}
          <Text style={[styles.body, { marginTop: 8 }]}>{content.kabala.description}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Seção 3 — Tântrica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>III. A ANATOMIA SUTIL — NUMEROLOGIA TÂNTRICA</Text>
          <Text style={styles.sectionSubtitle}>Os 11 Corpos Espirituais · O Veículo</Text>
          {content.tantra.soul !== null && (
            <Text style={styles.highlight}>Corpo da Alma: {content.tantra.soul}</Text>
          )}
          {content.tantra.karma !== null && (
            <Text style={styles.muted}>Karma: {content.tantra.karma}</Text>
          )}
          {content.tantra.divineGift !== null && (
            <Text style={styles.muted}>Dom Divino: {content.tantra.divineGift}</Text>
          )}
          {content.tantra.tantricPath !== null && (
            <Text style={styles.muted}>Caminho Tântrico: {content.tantra.tantricPath}</Text>
          )}
          <Text style={[styles.body, { marginTop: 8 }]}>{content.tantra.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Seção 4 — Astrologia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IV. O MAPA DE BORDO — ASTROLOGIA</Text>
          <Text style={styles.sectionSubtitle}>O Céu Natal · O Tempo Cósmico</Text>
          {content.astrology.ascendant && (
            <Text style={styles.highlight}>Ascendente: {content.astrology.ascendant}</Text>
          )}
          {content.astrology.dominantPlanet && (
            <Text style={styles.muted}>Planeta Dominante: {content.astrology.dominantPlanet}</Text>
          )}
          {content.astrology.mainPlanets.length > 0 && (
            <Text style={[styles.muted, { marginTop: 4 }]}>
              {content.astrology.mainPlanets.slice(0, 5).map(p => `${p.name} em ${p.sign}`).join(' · ')}
            </Text>
          )}
          <Text style={[styles.body, { marginTop: 8 }]}>{content.astrology.description}</Text>
        </View>

        <View style={[styles.divider, { marginTop: 32 }]} />
        <Text style={[styles.muted, { textAlign: 'center', marginTop: 12 }]}>
          Gerado pelo Sistema Akasha · Cabala dos Caminhos
        </Text>
      </Page>
    </Document>
  );
}
