import { StyleSheet } from '@react-pdf/renderer';

export const VIOLET = '#7C5CFF';
export const AURORA = '#2DD4BF';
export const GOLD = '#F0B429';
export const MAGENTA = '#FB5781';
export const BG_DEEP = '#06070F';
export const BG_DARK = '#0B0E1C';
export const BG_MID = '#141A33';
export const BG_LIGHT = '#26304F';
export const TEXT_MAIN = '#F4F5FF';
export const TEXT_MUTED = '#A7AECF';
export const TEXT_DIM = '#5C6691';

export const styles = StyleSheet.create({
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
    mainPlanets: { name: string; sign: string }[];
    description: string;
  };
}
