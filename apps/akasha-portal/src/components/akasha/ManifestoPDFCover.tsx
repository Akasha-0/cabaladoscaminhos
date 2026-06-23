import { Page, View, Text } from '@react-pdf/renderer';
import { styles, TEXT_DIM, GOLD, BG_LIGHT, TEXT_MAIN } from './ManifestoPDFStyles';
import { Footer } from './ManifestoPDFSections';

interface CoverProps {
  userName: string;
  generatedAt: string;
}

export function Cover({ userName, generatedAt }: CoverProps) {
  return (
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
  );
}
