// ============================================================
// PANCHAKARMA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Panchakarma (Ayurvedic detoxification)
// - Five actions of purification therapy
// - Treatment procedures and preparations
// - Herbal formulations and dietary protocols
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export interface PanchakarmaPreparation {
  type: string;
  description: string;
  duration: string;
  benefits: string[];
}

export interface PanchakarmaProcedure {
  phase: 'purva-karma' | 'pradhana-karma' | 'paschat-karma';
  name: string;
  namePt: string;
  sanskrit: string;
  description: string;
  indications: string[];
  contraindications: string[];
  duration: string;
  preparations: PanchakarmaPreparation[];
  herbalFormulations: string[];
  dietaryProtocol: string[];
  postTreatmentCare: string[];
}

export interface PanchakarmaData {
  id: string;
  name: string;
  namePt: string;
  sanskrit: string;
  meaning: string;
  description: string;
  type: 'emetic' | 'purgative' | 'enema' | 'nasal' | 'blood';
  primaryAction: string;
  dosha: 'vata' | 'pitta' | 'kapha' | 'tridosha';
  qualities: string[];
  procedures: PanchakarmaProcedure[];
  indications: string[];
  contraindications: string[];
  season: ('spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' | 'autumn')[];
  duration: string;
  score: number;
  associatedElements: string[];
  healingResonance?: string[];
  energyFlow?: string[];
  spiritualBenefits?: string[];
}

// ============================================================
// PANCHAKARMA DATA
// ============================================================

const PANCHAKARMA_DATA: PanchakarmaData[] = [
  {
    id: 'vamana',
    name: 'Therapeutic Emesis',
    namePt: 'Vômito Terapêutico',
    sanskrit: 'Vamana',
    meaning: 'Therapeutic vomiting - elimination of Kapha toxins',
    description: 'Controlled medicinal emesis to eliminate excess Kapha dosha and respiratory toxins. This procedure cleanses the stomach and respiratory tract of accumulated mucus and Kapha-related toxins.',
    type: 'emetic',
    primaryAction: 'Kapha elimination from stomach and lungs',
    dosha: 'kapha',
    qualities: ['Deep cleansing', 'Mucus removal', 'Respiratory clarity', 'Metabolic reset'],
    procedures: [
      {
        phase: 'purva-karma',
        name: 'Oleation and Fomentation',
        namePt: 'Oleação e Sudação',
        sanskrit: 'Snehana & Swedana',
        description: 'Internal and external oleation followed by therapeutic sweating to loosen toxins.',
        indications: ['Excess Kapha', 'Respiratory congestion', 'Chronic sinusitis'],
        contraindications: ['Pregnancy', 'Heart conditions', 'Weak digestion'],
        duration: '3-7 days preparation',
        preparations: [
          {
            type: 'internal oleation',
            description: 'Gradual intake of ghee or sesame oil',
            duration: '3-5 days',
            benefits: ['Lubricates tissues', 'Loosens ama', 'Prepares digestive fire'],
          },
          {
            type: 'external oleation',
            description: 'Abhyanga massage with medicated oils',
            duration: '30-45 minutes daily',
            benefits: ['Enhances circulation', 'Opens channels', 'Relaxes body'],
          },
          {
            type: 'fomentation',
            description: 'Herbal steam therapy',
            duration: '15-20 minutes daily',
            benefits: ['Sweats out toxins', 'Softens tissues', 'Promotes relaxation'],
          },
        ],
        herbalFormulations: ['Trikatu Churna', 'Madanaphala Pippali', 'Licorice Root'],
        dietaryProtocol: ['Light rice gruel', 'Moong dal soup', 'Warm water', 'Avoid dairy and heavy foods'],
        postTreatmentCare: ['Rest', 'Warm liquids', 'Light diet for 3-7 days', 'Gentle exercise'],
      },
      {
        phase: 'pradhana-karma',
        name: 'Emetic Administration',
        namePt: 'Administração emética',
        sanskrit: 'Vamana Karma',
        description: 'Controlled administration of emetic substances to induce therapeutic vomiting.',
        indications: ['Asthma', 'Chronic bronchitis', 'Diabetes', 'Skin disorders'],
        contraindications: ['Pregnancy', 'Hepatitis', 'Bleeding disorders', 'Elderly'],
        duration: 'Single session 2-4 hours',
        preparations: [
          {
            type: 'emetic decoction',
            description: 'Madanaphala or salt water administration',
            duration: '30-60 minutes',
            benefits: ['Induces controlled vomiting', 'Eliminates Kapha', 'Clears respiratory tract'],
          },
        ],
        herbalFormulations: ['Madanaphala Pippali', 'Vacha Powder', 'Yashtimadhu'],
        dietaryProtocol: ['Rice milk', 'Clarified butter before procedure', 'Warm water during procedure'],
        postTreatmentCare: ['Complete rest', 'No talking', 'Gentle oil massage', 'Sipping warm water'],
      },
      {
        phase: 'paschat-karma',
        name: 'Post-Treatment Rejuvenation',
        namePt: 'Rejuvenescimento pós-tratamento',
        sanskrit: 'Paschat Karma',
        description: 'Specific diet and lifestyle practices to restore digestive strength after emesis.',
        indications: ['Post-vamana recovery', 'Digestive weakness', 'Debility'],
        contraindications: ['None during recovery phase'],
        duration: '7-14 days',
        preparations: [
          {
            type: 'specific diet',
            description: 'Gradual reintroduction of foods',
            duration: '7-14 days',
            benefits: ['Restores agni', 'Prevents toxin recurrence', 'Rebuilds tissues'],
          },
        ],
        herbalFormulations: ['Chyawanprash', 'Pippali Rasayana', 'Digestive stimulants'],
        dietaryProtocol: ['Day 1-3: Only rice gruel', 'Day 4-7: Khichdi with spices', 'Day 8-14: Gradual reintroduction'],
        postTreatmentCare: ['Avoid cold foods', 'No daytime sleeping', 'Gentle walking', 'Oil baths'],
      },
    ],
    indications: ['Asthma', 'Chronic allergies', 'Sinusitis', 'Obesity', 'Diabetes', 'Psoriasis', 'Chronic digestion issues'],
    contraindications: ['Pregnancy', 'Menstruation', 'Heart disease', 'Weak elderly', 'Children under 12'],
    season: ['spring', 'autumn'],
    duration: '7-21 days total (including preparation)',
    score: 9,
    associatedElements: ['Water', 'Earth'],
    healingResonance: ['432 Hz', '528 Hz'],
    energyFlow: ['Downward motion', 'Release', 'Purification'],
    spiritualBenefits: ['Mental clarity', 'Emotional release', 'Renewed vitality'],
  },
  {
    id: 'virechana',
    name: 'Therapeutic Purgation',
    namePt: 'Purgação Terapêutica',
    sanskrit: 'Virechana',
    meaning: 'Controlled purgation - elimination of Pitta toxins',
    description: 'Medicated purgation therapy to cleanse the small intestine and eliminate accumulated Pitta dosha and bile-related toxins. Essential for liver and gallbladder disorders.',
    type: 'purgative',
    primaryAction: 'Pitta elimination from small intestine and liver',
    dosha: 'pitta',
    qualities: ['Liver cleansing', 'Bile regulation', 'Digestive harmony', 'Skin purification'],
    procedures: [
      {
        phase: 'purva-karma',
        name: 'Oleation and Internal Cleansing',
        namePt: 'Oleação e Limpeza Interna',
        sanskrit: 'Snehana & Virechana Purva',
        description: 'Internal oleation with medicated ghee followed by light purgatives.',
        indications: ['Liver disorders', 'Gallbladder issues', 'Chronic skin diseases'],
        contraindications: ['Intestinal obstruction', 'Ulcerative colitis', 'Pregnancy'],
        duration: '3-5 days preparation',
        preparations: [
          {
            type: 'medicated ghee',
            description: 'Tribang Bhasma or Triphala ghee',
            duration: '3-5 days',
            benefits: ['Lubricates intestines', 'Draws toxins from liver', 'Prepares Pitta channels'],
          },
          {
            type: 'light diet',
            description: 'Clear soups and vegetable broths',
            duration: '1-2 days before',
            benefits: ['Lightens digestive load', 'Prepares colon', 'Enhances purge effect'],
          },
        ],
        herbalFormulations: ['Triphala Churna', 'Avipattikar Churna', 'Trivrit Lehyam'],
        dietaryProtocol: ['Buttermilk', 'Rice soup', 'Green gram soup', 'Avoid sour and spicy foods'],
        postTreatmentCare: ['Rest', 'Warm food', 'Aloe vera juice', 'Gentle routine'],
      },
      {
        phase: 'pradhana-karma',
        name: 'Purgative Administration',
        namePt: 'Administração purgativa',
        sanskrit: 'Virechana Karma',
        description: 'Controlled purgative therapy to thoroughly cleanse the small intestine.',
        indications: ['Jaundice', 'Chronic constipation', 'Crohn\'s disease', 'Acne', 'Psoriasis'],
        contraindications: ['Peritonitis', 'Intestinal perforation', 'Severe anemia'],
        duration: '1-3 days of active purging',
        preparations: [
          {
            type: 'purgative herbs',
            description: 'Trivrit, Eranda, or Senna preparations',
            duration: '2-8 hours active',
            benefits: ['Thorough intestinal cleanse', 'Liver purge', 'Gallbladder flush'],
          },
        ],
        herbalFormulations: ['Trivrit Lehyam', 'Kalyanaka Ghrita', 'Abhayarishta'],
        dietaryProtocol: ['Buttermilk during purge', 'Warm water', 'No solid food during active phase'],
        postTreatmentCare: ['Bed rest', 'No exertion', 'Gradual food introduction'],
      },
      {
        phase: 'paschat-karma',
        name: 'Digestive Restoration',
        namePt: 'Restauração Digestiva',
        sanskrit: 'Pashchat Karma',
        description: 'Special diet and lifestyle to rebuild digestive strength and maintain cleanse.',
        indications: ['Post-purgation recovery', 'Digestive weakness', 'Liver support'],
        contraindications: ['None during recovery'],
        duration: '7-10 days',
        preparations: [
          {
            type: 'gradual diet',
            description: 'Progressive food reintroduction',
            duration: '7-10 days',
            benefits: ['Restores digestive fire', 'Nourishes tissues', 'Maintains cleanse'],
          },
        ],
        herbalFormulations: ['Shatavari', 'Amla', 'Turmeric preparations', 'Digestive bitters'],
        dietaryProtocol: ['Day 1-2: Only liquids', 'Day 3-5: Thick rice gruel', 'Day 6-10: Normal diet with restrictions'],
        postTreatmentCare: ['Avoid fried foods', 'No alcohol', 'No excessive sun', 'Early dinner'],
      },
    ],
    indications: ['Jaundice', 'Liver disorders', 'Gallstones', 'Chronic constipation', 'Acne', 'Eczema', 'Psoriasis', 'Crohn\'s disease'],
    contraindications: ['Pregnancy', 'Intestinal obstruction', 'Severe dehydration', 'Rectal bleeding'],
    season: ['autumn', 'winter'],
    duration: '10-18 days total',
    score: 8,
    associatedElements: ['Fire', 'Water'],
    healingResonance: ['528 Hz', '639 Hz'],
    energyFlow: ['Downward elimination', 'Liver purification', 'Internal heat regulation'],
    spiritualBenefits: ['Inner fire balance', 'Emotional release', 'Liver meridian clearing'],
  },
  {
    id: 'basti',
    name: 'Medicated Enema Therapy',
    namePt: 'Terapia de Enema Medicado',
    sanskrit: 'Basti',
    meaning: 'Medicated enema - elimination of Vata toxins',
    description: 'Administration of herbal decoctions and oils through the rectum to cleanse the colon and eliminate accumulated Vata dosha. Considered the most important Panchakarma for Vata disorders.',
    type: 'enema',
    primaryAction: 'Vata elimination from colon and nervous system',
    dosha: 'vata',
    qualities: ['Deep colon cleanse', 'Nerve nourishment', 'Vata pacification', 'Lower back healing'],
    procedures: [
      {
        phase: 'purva-karma',
        name: 'Oleation and External Preparation',
        namePt: 'Oleação e Preparação Externa',
        sanskrit: 'Snehana & Abhyanga',
        description: 'Internal oleation with medicated ghee and full body massage.',
        indications: ['Vata disorders', 'Arthritis', 'Nervous disorders', 'Lower back pain'],
        contraindications: ['Severe constipation with obstruction', 'Recent abdominal surgery'],
        duration: '3-5 days preparation',
        preparations: [
          {
            type: 'internal oleation',
            description: 'Mahanarayana or Dashamoola ghee',
            duration: '3-5 days',
            benefits: ['Nourishes nervous system', 'Lubricates colon', 'Draws toxins to GI tract'],
          },
          {
            type: 'medicated massage',
            description: 'Full body with Vata-pacifying oils',
            duration: '45-60 minutes daily',
            benefits: ['Stimulates circulation', 'Opens channels', 'Relaxes muscles'],
          },
        ],
        herbalFormulations: ['Dashamoola', 'Bala', 'Ashwagandha preparations'],
        dietaryProtocol: ['Warm cooked foods', 'Olive oil', 'Ghee', 'Avoid cold and dry foods'],
        postTreatmentCare: ['Rest', 'Warm environment', 'Oil massage', 'Warm baths'],
      },
      {
        phase: 'pradhana-karma',
        name: 'Basti Administration',
        namePt: 'Administração de Basti',
        sanskrit: 'Basti Karma',
        description: 'Medicated enema administered rectally with herbal decoctions or oils.',
        indications: ['Constipation', 'Arthritis', 'Paralysis', 'Multiple sclerosis', 'Parkinson\'s', 'Infertility'],
        contraindications: ['Rectal prolapse', 'Active bleeding hemorrhoids', 'Cancer of colon'],
        duration: '8-30 days (varies by type)',
        preparations: [
          {
            type: 'Niruha Basti (decoction)',
            description: 'Herbal decoction with honey, salt, and oils',
            duration: '30-45 minutes retention',
            benefits: ['Cleanses colon', 'Removes toxins', 'Stimulates peristalsis'],
          },
          {
            type: 'Anuvasana Basti (oil)',
            description: 'Medicated oil retention',
            duration: '6-12 hours retention',
            benefits: ['Nourishes tissues', 'Lubricates colon', 'Pacifies Vata'],
          },
        ],
        herbalFormulations: ['Dashamoola Kwath', 'Bala Ashwagandha Ghrita', 'Eranda Taila', 'Til Taila'],
        dietaryProtocol: ['Warm Khichdi', 'Ghee preparations', 'Warm water', 'Avoid raw foods'],
        postTreatmentCare: ['Rest 30 minutes after', 'Light walking', 'Warm foods', 'Oil massage'],
      },
      {
        phase: 'paschat-karma',
        name: 'Vata Replenishment',
        namePt: 'Reposição de Vata',
        sanskrit: 'Vata Purana',
        description: 'Nourishing therapies and diet to restore Vata after elimination.',
        indications: ['Post-Basti recovery', 'Vata deficiency', 'Debility', 'Fatigue'],
        contraindications: ['None during recovery'],
        duration: '7-14 days',
        preparations: [
          {
            type: 'rejuvenation therapy',
            description: 'Rasayana herbs and nourishing diet',
            duration: '7-14 days',
            benefits: ['Replenishes tissues', 'Restores strength', 'Maintains nervous system health'],
          },
        ],
        herbalFormulations: ['Ashwagandha', 'Shatavari', 'Bala', 'Dashamoola Rasayana'],
        dietaryProtocol: ['Warm milk with ghee', 'Bone broth', 'Nourishing grains', 'Nuts and seeds'],
        postTreatmentCare: ['Regular oil massage', 'Warm environment', 'Adequate rest', 'Regular routine'],
      },
    ],
    indications: ['Chronic constipation', 'Arthritis', 'Rheumatism', 'Lower back pain', 'Multiple sclerosis', 'Parkinson\'s disease', 'Nervous disorders', 'Infertility', 'Gout', 'Sciatica'],
    contraindications: ['Rectal prolapse', 'Active rectal bleeding', 'Colon cancer', 'Severe malnutrition'],
    season: ['autumn', 'winter', 'spring'],
    duration: '18-45 days total',
    score: 10,
    associatedElements: ['Ether', 'Air'],
    healingResonance: ['174 Hz', '396 Hz'],
    energyFlow: ['Ascending prana', 'Nerve regeneration', 'Ground connection'],
    spiritualBenefits: ['Grounding', 'Nervous system healing', 'Prana revitalization'],
  },
  {
    id: 'nasya',
    name: 'Nasal Administration Therapy',
    namePt: 'Terapia de Administração Nasal',
    sanskrit: 'Nasya',
    meaning: 'Nasal therapy - purification of head and sinuses',
    description: 'Administration of medicated oils, powders, or juices through the nasal passages to cleanse the head region and treat disorders above the clavicle. Direct route to the brain and nervous system.',
    type: 'nasal',
    primaryAction: 'Cleansing of head, sinuses, brain, and sensory organs',
    dosha: 'kapha',
    qualities: ['Sinus clearing', 'Mental clarity', 'Sensory refinement', 'Brain nourishment'],
    procedures: [
      {
        phase: 'purva-karma',
        name: 'Facial and Nasal Preparation',
        namePt: 'Preparação Facial e Nasal',
        sanskrit: 'Mukha Abhyanga & Nasa Tarpana',
        description: 'Facial massage and steam to prepare nasal passages and sinuses.',
        indications: ['Sinusitis', 'Migraines', 'Rhinitis', 'Mental fog'],
        contraindications: ['Acute nasal infection', 'Nasal polyps (large)'],
        duration: '1-3 days preparation',
        preparations: [
          {
            type: 'facial massage',
            description: 'Medicated oil massage of face and scalp',
            duration: '15-20 minutes',
            benefits: ['Relaxes facial muscles', 'Opens sinuses', 'Stimulates marma points'],
          },
          {
            type: 'steam inhalation',
            description: 'Herbal steam for nasal passages',
            duration: '10-15 minutes',
            benefits: ['Loosens mucus', 'Opens airways', 'Prepares for nasya'],
          },
        ],
        herbalFormulations: ['Anu Taila', 'Shadbindu Taila', 'Brahmi Ghrita'],
        dietaryProtocol: ['Light diet', 'Avoid dairy and mucus-forming foods', 'Warm water'],
        postTreatmentCare: ['Avoid cold air', 'No swimming', 'Rest in warm room'],
      },
      {
        phase: 'pradhana-karma',
        name: 'Nasya Administration',
        namePt: 'Administração de Nasya',
        sanskrit: 'Pradhana Nasya',
        description: 'Medicated substance administered through the nostrils.',
        indications: ['Chronic sinusitis', 'Migraines', 'Memory loss', 'Depression', 'Epilepsy', 'Bell\'s palsy'],
        contraindications: ['Acute nasal infection', 'Recent nasal surgery', 'Severe Deviated septum'],
        duration: '5-21 days depending on condition',
        preparations: [
          {
            type: 'medicated oil instillation',
            description: '5-10 drops in each nostril',
            duration: '5-10 minutes procedure',
            benefits: ['Cleanses sinuses', 'Nourishes brain', 'Clarifies senses'],
          },
          {
            type: 'medicated powder insufflation',
            description: 'Herbal powder blown into nostrils',
            duration: '5 minutes',
            benefits: ['Dries excess mucus', 'Strengthens tissues', 'Sharpens senses'],
          },
        ],
        herbalFormulations: ['Anu Taila', 'Shadbindu Taila', 'Brahmi Ghrita', 'Vacha Powder'],
        dietaryProtocol: ['Avoid cold drinks', 'No ice', 'Light warm foods'],
        postTreatmentCare: ['Inhale medicated steam', 'Apply oil to scalp', 'Rest 15-20 minutes'],
      },
      {
        phase: 'paschat-karma',
        name: 'Post-Nasya Care',
        namePt: 'Cuidados Pós-Nasya',
        sanskrit: 'Paschat Nasya',
        description: 'Special care to maintain the benefits of nasal therapy.',
        indications: ['Post-nasya recovery', 'Sinus health maintenance'],
        contraindications: ['None specific'],
        duration: '3-7 days after treatment',
        preparations: [
          {
            type: 'oil pulling',
            description: 'Sesame oil swished in mouth',
            duration: '5-10 minutes daily',
            benefits: ['Supports sinus health', 'Strengthens teeth', 'Cleanses oral cavity'],
          },
        ],
        herbalFormulations: ['Nasya oils for self-massage', 'Steam with eucalyptus'],
        dietaryProtocol: ['Avoid dairy', 'Limit cold foods', 'Ginger tea', 'Turmeric'],
        postTreatmentCare: ['Daily nasal oil application', 'Steam inhalation', 'Avoid dust and pollutants'],
      },
    ],
    indications: ['Chronic sinusitis', 'Migraines', 'Sinus headaches', 'Memory impairment', 'Depression', 'Epilepsy', 'Bell\'s palsy', 'Nasal polyps', 'Allergic rhinitis', 'Tinnitus'],
    contraindications: ['Acute fever', 'Active nasal infection', 'Immediately after bathing', 'During menstruation (some traditions)'],
    season: ['winter', 'spring'],
    duration: '7-28 days total',
    score: 7,
    associatedElements: ['Ether', 'Air'],
    healingResonance: ['432 Hz', '963 Hz'],
    energyFlow: ['Prana vayu enhancement', 'Brain stimulation', 'Sensory clarity'],
    spiritualBenefits: ['Third eye activation', 'Mental clarity', 'Prana optimization', 'Intuition enhancement'],
  },
  {
    id: 'raktamokshana',
    name: 'Blood Letting Therapy',
    namePt: 'Terapia de Sangria',
    sanskrit: 'Raktamokshana',
    meaning: 'Blood purification - elimination of blood toxins',
    description: 'Controlled bloodletting to remove impure blood and treat blood-borne disorders. Uses various methods including leech therapy, venipuncture, or cupping to cleanse the circulatory system.',
    type: 'blood',
    primaryAction: 'Blood purification and circulatory cleansing',
    dosha: 'pitta',
    qualities: ['Blood purification', 'Skin disease treatment', 'Circulatory improvement', 'Toxin removal from blood'],
    procedures: [
      {
        phase: 'purva-karma',
        name: 'Preparation for Blood Letting',
        namePt: 'Preparação para Sangria',
        sanskrit: 'Purva Karma Raktamokshana',
        description: 'Dietary preparation and local treatments before bloodletting.',
        indications: ['Skin disorders', 'Hypertension', 'Blood toxicity'],
        contraindications: ['Anemia', 'Blood clotting disorders', 'Pregnancy'],
        duration: '1-3 days preparation',
        preparations: [
          {
            type: 'dietary preparation',
            description: 'Pitta-pacifying diet',
            duration: '1-3 days',
            benefits: ['Reduces Pitta', 'Thins blood slightly', 'Prepares for letting'],
          },
          {
            type: 'local application',
            description: 'Medicated poultices on affected areas',
            duration: '1-2 days',
            benefits: ['Draws toxins to surface', 'Prepares local area', 'Enhances effect'],
          },
        ],
        herbalFormulations: ['Manjistha', 'Turmeric', 'Neem', 'Sariva'],
        dietaryProtocol: ['Bitter foods', 'Avoid sour and salty', 'Cool foods', 'Aloe vera juice'],
        postTreatmentCare: ['Rest', 'Cool environment', 'Light diet'],
      },
      {
        phase: 'pradhana-karma',
        name: 'Blood Letting Procedure',
        namePt: 'Procedimento de Sangria',
        sanskrit: 'Pradhana Raktamokshana',
        description: 'Controlled bloodletting using appropriate method for the condition.',
        indications: ['Psoriasis', 'Eczema', 'Hypertension', 'Gout', 'Varicose veins', 'Recurrent skin infections'],
        contraindications: ['Severe anemia', 'Hemophilia', 'Very elderly', 'Young children'],
        duration: 'Single or series of sessions',
        preparations: [
          {
            type: 'leech therapy (Jalauka Avacharana)',
            description: 'Medicinal leech application',
            duration: '30-60 minutes per session',
            benefits: ['Thins blood', 'Anticoagulant secretion', 'Localized purification'],
          },
          {
            type: 'cupping (Alabu)',
            description: 'Suction cups on skin',
            duration: '15-20 minutes',
            benefits: ['Draws blood to surface', 'Local purification', 'Improved circulation'],
          },
          {
            type: 'venipuncture (Sira Vedhana)',
            description: 'Professional blood withdrawal',
            duration: '15-30 minutes',
            benefits: ['Systemic blood purification', 'Reduces pressure', 'Clears toxins'],
          },
        ],
        herbalFormulations: ['Manjistha', 'Neem', 'Turmeric with neem', 'Blood-purifying formulations'],
        dietaryProtocol: ['Cool foods', 'Bitter vegetables', 'Avoid pungent foods', 'Plenty of water'],
        postTreatmentCare: ['Rest for several hours', 'Apply pressure bandage', 'Avoid baths for 24 hours'],
      },
      {
        phase: 'paschat-karma',
        name: 'Post-Bloodletting Care',
        namePt: 'Cuidados Pós-Sangria',
        sanskrit: 'Paschat Raktamokshana',
        description: 'Diet and rest to restore blood and maintain benefits.',
        indications: ['Post-letting recovery', 'Blood rebuilding', 'Anemia prevention'],
        contraindications: ['None during recovery'],
        duration: '7-14 days',
        preparations: [
          {
            type: 'blood-building diet',
            description: 'Iron and nutrient-rich foods',
            duration: '7-14 days',
            benefits: ['Rebuilds blood', 'Restores strength', 'Maintains benefits'],
          },
        ],
        herbalFormulations: ['Punarnava', 'Loha Bhasma', 'Navayas Loha', 'Iron-rich formulations'],
        dietaryProtocol: ['Spinach', 'Beetroot', 'Dates', 'Iron-rich grains', 'Avoid alcohol', 'Plenty of water'],
        postTreatmentCare: ['Rest well', 'Stay hydrated', 'Avoid strenuous activity', 'Follow up with blood-building herbs'],
      },
    ],
    indications: ['Psoriasis', 'Eczema', 'Acne', 'Hypertension', 'Gout', 'Varicose veins', 'Hemorrhoids', 'Skin infections', 'Chronic itching', 'Recurrent boils'],
    contraindications: ['Severe anemia', 'Hemophilia', 'Pregnancy', 'Very young children', 'Elderly with weakness'],
    season: ['autumn', 'winter'],
    duration: '10-21 days total',
    score: 6,
    associatedElements: ['Fire', 'Water'],
    healingResonance: ['528 Hz', '741 Hz'],
    energyFlow: ['Blood purification', 'Circulatory enhancement', 'Skin clearing'],
    spiritualBenefits: ['Release of held emotions', 'Blood line healing', 'Vitality renewal'],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPanchakarmaById(id: string): PanchakarmaData | undefined {
  return PANCHAKARMA_DATA.find((p) => p.id === id);
}

function getPanchakarmaByDosha(dosha: string): PanchakarmaData[] {
  return PANCHAKARMA_DATA.filter((p) => p.dosha === dosha || p.dosha === 'tridosha');
}

function getPanchakarmaByType(type: string): PanchakarmaData[] {
  return PANCHAKARMA_DATA.filter((p) => p.type === type);
}

function getPanchakarmaBySeason(season: string): PanchakarmaData[] {
  return PANCHAKARMA_DATA.filter((p) => p.season.includes(season as 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter'));
}

function getPanchakarmaByMinScore(minScore: number): PanchakarmaData[] {
  return PANCHAKARMA_DATA.filter((p) => p.score >= minScore);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/panchakarma/data
 * Retrieve Panchakarma data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dosha = searchParams.get('dosha');
    const type = searchParams.get('type');
    const season = searchParams.get('season');
    const minScore = searchParams.get('minScore');
    const format = searchParams.get('format');

    // Single Panchakarma by ID
    if (id) {
      const treatment = getPanchakarmaById(id);
      if (!treatment) {
        return NextResponse.json(
          { error: 'Panchakarma treatment not found', id },
          { status: 404 }
        );
      }

      if (format === 'summary') {
        return NextResponse.json({
          id: treatment.id,
          name: treatment.name,
          namePt: treatment.namePt,
          sanskrit: treatment.sanskrit,
          type: treatment.type,
          dosha: treatment.dosha,
          primaryAction: treatment.primaryAction,
          duration: treatment.duration,
        });
      }

      if (format === 'procedures') {
        return NextResponse.json({
          id: treatment.id,
          name: treatment.name,
          procedures: treatment.procedures,
          count: treatment.procedures.length,
        });
      }

      if (format === 'full') {
        return NextResponse.json({
          ...treatment,
          retrievedAt: new Date().toISOString(),
          apiVersion: 'v1',
        });
      }

      return NextResponse.json(treatment);
    }

    // Filter by dosha
    if (dosha) {
      const validDoshas = ['vata', 'pitta', 'kapha', 'tridosha'];
      if (!validDoshas.includes(dosha)) {
        return NextResponse.json(
          { error: 'Invalid dosha parameter', validDoshas },
          { status: 400 }
        );
      }
      const filtered = getPanchakarmaByDosha(dosha);
      return NextResponse.json({
        dosha,
        treatments: filtered,
        count: filtered.length,
        version: 'v1',
      });
    }

    // Filter by type
    if (type) {
      const validTypes = ['emetic', 'purgative', 'enema', 'nasal', 'blood'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: 'Invalid type parameter', validTypes },
          { status: 400 }
        );
      }
      const filtered = getPanchakarmaByType(type);
      return NextResponse.json({
        type,
        treatments: filtered,
        count: filtered.length,
        version: 'v1',
      });
    }

    // Filter by season
    if (season) {
      const validSeasons = ['spring', 'summer', 'monsoon', 'autumn', 'winter'];
      if (!validSeasons.includes(season)) {
        return NextResponse.json(
          { error: 'Invalid season parameter', validSeasons },
          { status: 400 }
        );
      }
      const filtered = getPanchakarmaBySeason(season);
      return NextResponse.json({
        season,
        treatments: filtered,
        count: filtered.length,
        version: 'v1',
      });
    }

    // Filter by minimum score
    if (minScore) {
      const score = parseInt(minScore, 10);
      if (isNaN(score) || score < 1 || score > 10) {
        return NextResponse.json(
          { error: 'Invalid minScore parameter (1-10)' },
          { status: 400 }
        );
      }
      const filtered = getPanchakarmaByMinScore(score);
      return NextResponse.json({
        minScore: score,
        treatments: filtered,
        count: filtered.length,
        version: 'v1',
      });
    }

    // Return all Panchakarma data
    return NextResponse.json({
      version: 'v1',
      count: PANCHAKARMA_DATA.length,
      treatments: PANCHAKARMA_DATA,
    });
  } catch (error) {
    console.error('Panchakarma data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
