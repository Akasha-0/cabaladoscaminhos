import { Page, View, Text } from '@react-pdf/renderer';
import {
  styles,
  VIOLET,
  AURORA,
  GOLD,
  MAGENTA,
  TEXT_DIM,
  ManifestoContent,
} from './ManifestoPDFStyles';

// ─── Reusable primitives ───────────────────────────────────────────────────

export function Footer({ label }: { label: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Sistema Akasha — confidencial</Text>
      <Text style={styles.pageNumber}>{label}</Text>
    </View>
  );
}

function PageTitleBar({ userName }: { userName: string }) {
  return (
    <View style={styles.pageTitleBar} fixed>
      <Text style={styles.pageTitleText}>Manifesto Akáshico · {userName}</Text>
    </View>
  );
}

// ─── Synthesis page ────────────────────────────────────────────────────────

export function SynthesisSection({
  userName,
  synthesis,
}: {
  userName: string;
  synthesis: string;
}) {
  return (
    <Page size="A4" style={styles.contentPage}>
      <PageTitleBar userName={userName} />

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
  );
}

// ─── Odu section (used inside a Page) ─────────────────────────────────────

export function OduSection({ odus }: { odus: ManifestoContent['odus'] }) {
  return (
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
  );
}

// ─── Kabala section (used inside a Page) ───────────────────────────────────

export function KabalaSection({ kabala }: { kabala: ManifestoContent['kabala'] }) {
  return (
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
  );
}

// ─── Tantra section (used inside a Page) ───────────────────────────────────

export function TantraSection({ tantra }: { tantra: ManifestoContent['tantra'] }) {
  return (
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
  );
}

// ─── Astrology section (used inside a Page) ────────────────────────────────

export function AstrologySection({
  astrology,
}: {
  astrology: ManifestoContent['astrology'];
}) {
  return (
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
  );
}

// ─── Full pages that compose sections inside Pages ───────────────────────────

export function OdusKabalaPage({
  userName,
  odus,
  kabala,
}: {
  userName: string;
  odus: ManifestoContent['odus'];
  kabala: ManifestoContent['kabala'];
}) {
  return (
    <Page size="A4" style={styles.contentPage}>
      <PageTitleBar userName={userName} />
      <OduSection odus={odus} />
      <View style={styles.divider} />
      <KabalaSection kabala={kabala} />
      <Footer label="I – II" />
    </Page>
  );
}

export function TantraAstrologyPage({
  userName,
  tantra,
  astrology,
}: {
  userName: string;
  tantra: ManifestoContent['tantra'];
  astrology: ManifestoContent['astrology'];
}) {
  return (
    <Page size="A4" style={styles.contentPage}>
      <PageTitleBar userName={userName} />
      <TantraSection tantra={tantra} />
      <View style={styles.divider} />
      <AstrologySection astrology={astrology} />
      <View style={[styles.divider, { marginTop: 24 }]} />
      <Text style={[styles.footerText, { textAlign: 'center', marginTop: 8 }]}>
        Gerado pelo Sistema Akasha · Cabala dos Caminhos
      </Text>
      <Footer label="III – IV" />
    </Page>
  );
}
