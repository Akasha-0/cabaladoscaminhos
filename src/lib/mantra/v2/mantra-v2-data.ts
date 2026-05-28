/**
 * Mantra-v2 Data Module
 */

export interface MantraV2Data {
  name: string;
  namePt: string;
  origin: string;
  pronunciation: string;
  meaning: string;
  translation: string;
  syllables: string[];
  benefits: string[];
  practice: string[];
  v2Features: {
    ficas: string[];
    vibrationPattern: string[];
    activationMethod: string;
    meditationTechnique: string;
    sacredDuration: string;
    ritualSequence: string[];
    elementalAssociation: string;
    chakraAlignment: string[];
  };
}

export interface MantraV2DataSet {
  [key: string]: MantraV2Data;
}

const mantras: MantraV2DataSet = {
  om: {
    name: 'Om',
    namePt: 'Om - O Som Cósmico',
    origin: 'Tradição Védica Indiana',
    pronunciation: 'Aum (AU-M)',
    meaning: 'O som primordial do universo',
    translation: 'O som primordial, a vibração absoluta',
    syllables: ['A', 'U', 'M'],
    benefits: ['Harmonização', 'Calma mental', 'Conexão cósmica'],
    practice: ['Sente-se', 'Respire', 'Cante', 'Silêncio'],
    v2Features: {
      ficas: ['Sacro', 'Primordial'],
      vibrationPattern: ['Baixa', 'Alta'],
      activationMethod: 'Canto',
      meditationTechnique: 'Silenciosa',
      sacredDuration: '45 min',
      ritualSequence: ['Preparação', 'Canto', 'Silêncio'],
      elementalAssociation: 'Universal',
      chakraAlignment: ['Coroa'],
    },
  },
};

export default mantras;
