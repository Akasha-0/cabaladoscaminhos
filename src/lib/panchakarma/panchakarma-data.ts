// Panchakarma data - Ayurvedic detoxification and cleansing therapies
// @ts-nocheck

export interface PanchakarmaProcedure {
  id: string;
  name: string;
  nameSanskrit: string;
  description: string;
  type: 'vamana' | 'virechana' | 'basti' | 'nasya' | 'raktamokshana';
  indications: string[];
  contraindications: string[];
  duration: string;
  preparations: string[];
  aftercare: string[];
}

export interface PanchakarmaData {
  [key: string]: PanchakarmaProcedure;
}

const panchakarma: PanchakarmaData = {
  "vamana": {
    id: "vamana",
    name: "Vamana - Therapeutic Emesis",
    nameSanskrit: "वमन",
    description: "Medically supervised therapeutic emesis to eliminate excess Kapha dosha. This procedure involves oral administration of herbal decoctions and liquids to induce controlled vomiting, effectively removing accumulated mucus, toxins, and impurities from the respiratory and gastrointestinal tracts.",
    type: "vamana",
    indications: [
      "Chronic respiratory conditions",
      "Asthma and bronchitis",
      "Allergic conditions",
      "Sinusitis and congestion",
      "Obesity and metabolic disorders",
      "Skin diseases",
      "Digestive sluggishness",
      "Chronic cold and cough"
    ],
    contraindications: [
      "Pregnancy",
      "Menstruation",
      "Weak or elderly patients",
      "Cardiac conditions",
      "Active tuberculosis",
      "Bleeding disorders",
      "After heavy meals"
    ],
    duration: "3-7 days (including preparation and post-treatment)",
    preparations: [
      "Snehana (oleation) with ghee 3-7 days prior",
      "Swedana (fomentation) therapies",
      "Light diet on previous night",
      "Abstinence from water in early morning",
      "Mental preparation and rest"
    ],
    aftercare: [
      "Specific diet progression (Samsarjana Krama)",
      "Adequate rest and sleep",
      "Avoidance of cold foods and drinks",
      "Gradual return to normal activities",
      "Follow-up consultations",
      "Rejuvenation therapies as needed"
    ]
  },
  "virechana": {
    id: "virechana",
    name: "Virechana - Therapeutic Purgation",
    nameSanskrit: "विरेचन",
    description: "Medically supervised purgation therapy to eliminate excess Pitta dosha and accumulated toxins from the liver, gallbladder, and small intestine. This gentle yet thorough cleansing procedure uses herbal laxatives to evacuate the bowels while promoting bile flow and hepatic function.",
    type: "virechana",
    indications: [
      "Liver disorders",
      "Gallbladder issues",
      "Digestive disorders",
      "Skin conditions (psoriasis, eczema)",
      "Chronic fatigue",
      "Hormonal imbalances",
      "Allergies and sensitivities",
      "Inflammatory conditions"
    ],
    contraindications: [
      "Pregnancy",
      "Severe anemia",
      "Active infections",
      "After recent surgery",
      "Children and elderly",
      "Malnutrition",
      "Rectal bleeding"
    ],
    duration: "3-5 days (preparation and treatment)",
    preparations: [
      "Internal oleation with medicated ghee",
      "Fomentation therapies",
      "Light Khichdi diet",
      "Digestive rest",
      "Avoidance of spicy and sour foods"
    ],
    aftercare: [
      "Gradual diet reintroduction",
      "Hydration with warm water",
      "Rest and light activity",
      "Avoid Pitta-aggravating foods",
      "Herbal supplements as prescribed",
      "Follow-up assessment"
    ]
  },
  "basti": {
    id: "basti",
    name: "Basti - Medicated Enema Therapy",
    nameSanskrit: "बस्ति",
    description: "The king of Panchakarma therapies, Basti involves administration of medicated decoctions and oils through the rectal route. This comprehensive therapy primarily balances Vata dosha, nourishes bodily tissues, and eliminates accumulated toxins from the colon. It encompasses various types including Niruha (herbal decoction) and Anuvasana (oil-based) enemas.",
    type: "basti",
    indications: [
      "Vata disorders",
      "Arthritis and joint pain",
      "Constipation",
      "Neurological conditions",
      "Paralysis",
      "Lower back pain",
      "Reproductive disorders",
      "Anxiety and nervous disorders"
    ],
    contraindications: [
      "After heavy meals",
      "Active diarrhea",
      "Severe hemorrhoids",
      "Rectal prolapse",
      "Immediately after enema",
      "During acute fever"
    ],
    duration: "8-30 days (course of treatments)",
    preparations: [
      "External oleation (Abhyanga)",
      "Fomentation (Swedana)",
      "Dietary modifications",
      "Herbal supplements",
      "Mental preparation"
    ],
    aftercare: [
      "Dietary restrictions",
      "Gentle exercises (Yoga)",
      "Regular sleep schedule",
      "Abhyanga self-massage",
      "Herbal tonics",
      "Lifestyle adjustments"
    ]
  },
  "nasya": {
    id: "nasya",
    name: "Nasya - Nasal Administration Therapy",
    nameSanskrit: "नस्य",
    description: "Administration of medicated oils, powders, or herbal juices through the nasal passages. This therapy directly targets the Prana Vayu and governs the head region, effectively treating conditions above the clavicles while promoting mental clarity, sensory acuity, and nervous system function.",
    type: "nasya",
    indications: [
      "Sinusitis and rhinitis",
      "Migraines and headaches",
      "Mental fatigue",
      "Poor memory and concentration",
      "Eye and ear disorders",
      "Hair fall and premature graying",
      "Facial paralysis",
      "Cervical spondylosis"
    ],
    contraindications: [
      "Active nasal infection",
      "Immediately after bathing",
      "Empty stomach",
      "During pregnancy",
      "Severe cold and flu",
      "After nasal surgery (unless approved)"
    ],
    duration: "7-14 days (daily administration)",
    preparations: [
      "Gentle facial massage",
      "Steam inhalation",
      "Nasal cleansing (Jala Neti)",
      "Light massage around nose and ears",
      "Relaxation before procedure"
    ],
    aftercare: [
      "Rest in supine position",
      "Avoid cold air and drafts",
      "No water for 30 minutes after",
      "Gentle nasal moisturizing",
      "Follow-up as recommended"
    ]
  },
  "raktamokshana": {
    id: "raktamokshana",
    name: "Raktamokshana - Blood Letting Therapy",
    nameSanskrit: "रक्तमोक्षण",
    description: "Therapeutic removal of small quantities of impure blood to treat blood-borne disorders and conditions caused by impure blood. This specialized therapy includes methods such as Jalauka (leech application), Pracchana (scarification), and Siravyadha (venipuncture). It addresses conditions where blood purification is essential for healing.",
    type: "raktamokshana",
    indications: [
      "Skin diseases (eczema, psoriasis)",
      "Gout and arthritis",
      "Varicose veins",
      "Hypertension",
      "Thrombosis",
      "Recurrent skin infections",
      "Chronic ulcers",
      "Polycythemia"
    ],
    contraindications: [
      "Anemia",
      "Bleeding disorders",
      "Hypotension",
      "Pregnancy",
      "Children and elderly",
      "During menstruation",
      "Active infections"
    ],
    duration: "1-3 days per session, may repeat after recovery",
    preparations: [
      "Assessment of blood quality",
      "Local oleation and fomentation",
      "Patient counseling",
      "Equipment sterilization",
      "Emergency precautions ready"
    ],
    aftercare: [
      "Bandaging and wound care",
      "Rest and observation",
      "Iron-rich diet if needed",
      "Avoid heavy physical activity",
      "Monitor for any complications"
    ]
  }
};

export function getData(): PanchakarmaData {
  return panchakarma;
}

export default panchakarma;
