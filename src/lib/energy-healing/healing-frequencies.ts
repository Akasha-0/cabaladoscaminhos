// Healing Frequencies — based on solfeggio scale, binaural research, and energy medicine traditions

export interface Frequency {
  hz: number;
  name: string;
  effect: string;
  chakra?: number; // 1-7 crown to root
  color?: string;
}

export interface FrequencySet {
  name: string;
  description: string;
  frequencies: Frequency[];
}

const SOLFEGGIO: Frequency[] = [
  { hz: 174, name: "Solfeggio 174", effect: "Foundation / Pain relief", chakra: 1, color: "#8B0000" },
  { hz: 285, name: "Solfeggio 285", effect: "Tissue regeneration", chakra: 2, color: "#FF4500" },
  { hz: 396, name: "Solfeggio 396", effect: "Liberation / Fear removal", chakra: 3, color: "#FFA500" },
  { hz: 417, name: "Solfeggio 417", effect: "Change / Facilitation", chakra: 4, color: "#FFD700" },
  { hz: 528, name: "Solfeggio 528", effect: "Transformation / DNA repair", chakra: 5, color: "#00FF00" },
  { hz: 639, name: "Solfeggio 639", effect: "Harmony / Relationships", chakra: 6, color: "#00CED1" },
  { hz: 741, name: "Solfeggio 741", effect: "Expression / Intuition", chakra: 7, color: "#4169E1" },
  { hz: 852, name: "Solfeggio 852", effect: "Third eye activation", chakra: 7, color: "#4B0082" },
  { hz: 963, name: "Solfeggio 963", effect: "Crown chakra / Divine connection", chakra: 7, color: "#EE82EE" },
];

const CHAKRA_FREQUENCIES: Frequency[] = [
  { hz: 396, name: "Root (Muladhara)", effect: "Grounding, survival, safety", chakra: 1, color: "#8B0000" },
  { hz: 417, name: "Sacral (Svadhisthana)", effect: "Creativity, sexuality, emotions", chakra: 2, color: "#FF8C00" },
  { hz: 528, name: "Solar (Manipura)", effect: "Power, will, personal identity", chakra: 3, color: "#FFD700" },
  { hz: 639, name: "Heart (Anahata)", effect: "Love, compassion, healing", chakra: 4, color: "#00C853" },
  { hz: 741, name: "Throat (Vishuddha)", effect: "Expression, truth, communication", chakra: 5, color: "#00BCD4" },
  { hz: 852, name: "Third Eye (Ajna)", effect: "Intuition, perception, wisdom", chakra: 6, color: "#3F51B5" },
  { hz: 963, name: "Crown (Sahasrara)", effect: "Spirituality, enlightenment, unity", chakra: 7, color: "#9C27B0" },
];

const BINAURAL_BRAINWAVE: Frequency[] = [
  { hz: 0.5, name: "Delta", effect: "Deep sleep, healing, regeneration" },
  { hz: 2.5, name: "Theta", effect: "Meditation, intuition, subconscious" },
  { hz: 5, name: "Alpha", effect: "Relaxation, calm, peaceful awareness" },
  { hz: 10, name: "Alpha-Theta border", effect: "Peak creativity, flow states" },
  { hz: 15, name: "Beta", effect: "Focus, alertness, active thinking" },
  { hz: 30, name: "Gamma", effect: "Higher cognition, insight, mindfulness" },
];

const SCALAR_HEART: Frequency[] = [
  { hz: 528, name: "Love frequency", effect: "Heart coherence, emotional balance, cellular repair", chakra: 4, color: "#00FF7F" },
  { hz: 432, name: "Verdi's A", effect: "Natural resonance, stress reduction", chakra: 4, color: "#00FA9A" },
  { hz: 304.2, name: "OM (432 Hz)", effect: "Sacred tone, spiritual alignment", chakra: 7, color: "#E6E6FA" },
];

const ANCIENT_TONES: Frequency[] = [
  { hz: 136.1, name: "Om / Ohm", effect: "Yoga tradition — unity consciousness, deep meditation" },
  { hz: 432, name: "Verdi A / Natural tuning", effect: "Pythagorean tuning — nature resonance, harmonizes body" },
  { hz: 528, name: "Miracle tone / Love", effect: "Bach/Starwoman — transformation, DNA restoration, miracle working" },
  { hz: 639, name: "Heart-brain coherence", effect: "Interpersonal harmony, forgiveness, emotional balance" },
  { hz: 741.3, name: "Pure tone alpha", effect: "Awakening intuition, expression without interference" },
  { hz: 852, name: "Third eye activation", effect: "Returning to spiritual order, sixth sense" },
  { hz: 963, name: "Crown chakra activation", effect: "Direct connection to universal source, enlightenment" },
];

const DNA_REPAIR: Frequency[] = [
  { hz: 528, name: "DNA repair frequency", effect: "Schumann resonance harmony — corrects genetic code, heals broken patterns" },
  { hz: 72, name: "Binaural DNA strand separation", effect: "Used in quantum healing — separates DNA strands for repair" },
  { hz: 14, name: "Solfeggio strand recombination", effect: "Reattaches DNA strands after repair work" },
];

export const ALL_FREQUENCIES: Frequency[] = [
  ...SOLFEGGIO,
  ...CHAKRA_FREQUENCIES,
  ...BINAURAL_BRAINWAVE,
  ...SCALAR_HEART,
  ...ANCIENT_TONES,
  ...DNA_REPAIR,
];

export const FREQUENCY_SETS: FrequencySet[] = [
  { name: "Solfeggio Scale", description: "Ancient 9-tone scale discovered in medieval chant manuscripts", frequencies: SOLFEGGIO },
  { name: "Chakra Activation", description: "Frequencies mapped to the 7 major energy centers", frequencies: CHAKRA_FREQUENCIES },
  { name: "Brainwave States", description: "Binaural beat frequencies for brainwave entrainment", frequencies: BINAURAL_BRAINWAVE },
  { name: "Scalar Heart Coherence", description: "HeartMath-aligned frequencies for emotional coherence", frequencies: SCALAR_HEART },
  { name: "Ancient Sacred Tones", description: "Om, Verdi A, and miracle tone from spiritual traditions", frequencies: ANCIENT_TONES },
  { name: "DNA Repair Protocol", description: "Frequencies used in quantum and scalar DNA healing", frequencies: DNA_REPAIR },
];

export function getFrequencies(options?: {
  set?: string;
  chakra?: number;
  minHz?: number;
  maxHz?: number;
}): Frequency[] {
  const { set, chakra, minHz = 0, maxHz = Infinity } = options ?? {};

  if (set) {
    const found = FREQUENCY_SETS.find(
      (s) => s.name.toLowerCase() === set.toLowerCase()
    );
    return found?.frequencies ?? [];
  }

  if (chakra !== undefined) {
    return ALL_FREQUENCIES.filter((f) => f.chakra === chakra);
  }

  return ALL_FREQUENCIES.filter((f) => f.hz >= minHz && f.hz <= maxHz);
}

export function getFrequencyByHz(hz: number): Frequency | undefined {
  return ALL_FREQUENCIES.find((f) => Math.abs(f.hz - hz) < 0.1);
}

export function getChakraFrequencies(): Frequency[] {
  return getFrequencies({ minHz: 0, maxHz: 1000 }).filter((f) => f.chakra !== undefined);
}

export const NOTABLE_FREQUENCIES = {
  Schumann: 7.83,   // Earth's electromagnetic pulse
  Love: 528,
  DNARepair: 528,
  Grounding: 432,
  Crown: 963,
  ThirdEye: 852,
};
