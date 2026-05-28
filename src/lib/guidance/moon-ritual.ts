/**
 * Moon Ritual Guide
 * Guidance for working with each lunar phase
 */

export type MoonPhase =
  | 'new'
  | 'waxing crescent'
  | 'first quarter'
  | 'waxing gibbous'
  | 'full'
  | 'waning gibbous'
  | 'last quarter'
  | 'waning crescent';

export interface MoonRitual {
  phase: MoonPhase;
  intentions: string[];
  meditations: string[];
  ebós: string[];
}

const rituals: Record<MoonPhase, MoonRitual> = {
  new: {
    phase: 'new',
    intentions: [
      'Plant new seeds of intention',
      'Begin anew with clarity',
      'Set foundations for what you wish to grow',
      'Embrace fresh starts without past burdens',
    ],
    meditations: [
      'Visualize a dark sky preparing to receive light—blank space ready to be filled',
      'Sit in stillness and ask: what do I truly desire to create?',
      'Imagine your breath as the first breath of a new world',
    ],
    ebós: [
      'White candle + jasmine—offering to Olokun for new ventures',
      'Sea water + white flowers—cleansing vessel for new intentions',
      'Cornmeal + coconut—feeding Exu for pathways to open',
      'Fresh water in a clear glass—pure receptivity',
    ],
  },
  'waxing crescent': {
    phase: 'waxing crescent',
    intentions: [
      'Build momentum toward your goals',
      'Cultivate patience as intentions take root',
      'Nurture the seeds planted at the New Moon',
      'Persist through doubt and hesitation',
    ],
    meditations: [
      'See a small crescent of light growing—your intentions taking form',
      'Feel the pull of the moon like an invisible thread guiding you forward',
      'Breathe in expansion, exhale any wavering in your commitment',
    ],
    ebós: [
      'Yellow candle + honey—sweetening the path ahead',
      'Orofun + palm oil—offering to Ogun for strength in beginnings',
      'Seeds buried in earth—honoring growth that happens unseen',
      'Lavender + mint tea—clarity and movement for emerging plans',
    ],
  },
  'first quarter': {
    phase: 'first quarter',
    intentions: [
      'Take bold action despite obstacles',
      'Face challenges with courage',
      'Make necessary course corrections',
      'Assert your will with integrity',
    ],
    meditations: [
      'See yourself cutting through resistance like the moon emerging from shadow',
      'Hold the tension of the challenge without breaking—the test that strengthens',
      'Feel the warrior energy: I act, I move, I transform obstacle into fuel',
    ],
    ebós: [
      'Red candle + iron shavings—offering to Ogun for cutting through barriers',
      'Hot pepper +咒语 + rum—fire offering to São Jorge for victory',
      'Sword made of sticks—cutting cords that hold you back',
      'Coconut water + cashew—strengthening what wavers',
    ],
  },
  'waxing gibbous': {
    phase: 'waxing gibbous',
    intentions: [
      'Refine and perfect your intentions',
      'Adjust what no longer fits',
      'Deepen commitment through review',
      'Prepare for the culmination ahead',
    ],
    meditations: [
      'Examine your intentions with honest eyes—what needs to change?',
      'See the near-full moon and feel the approaching fullness of your purpose',
      'Breathe in humility: I am learning, I am adjusting, I am becoming',
    ],
    ebós: [
      'Blue candle + clear water—offering to Oxalá for purification and wisdom',
      'White cloth + dove feathers—gentleness in the refinement process',
      'Acqua florida + yerba buena—cleansing breath for fresh perspective',
      'Limp eggs in running water—rolling away what no longer serves',
    ],
  },
  full: {
    phase: 'full',
    intentions: [
      'Celebrate abundance and achieved intentions',
      'Express gratitude for blessings received',
      'Release what no longer serves',
      'Receive lunar light fully into your being',
    ],
    meditations: [
      'Bathe in imagined moonlight—let it fill every shadow within you',
      'Sit in gratitude until your heart overflows and spills onto others',
      'Release with open hands: I let go of what I must, knowing I am held',
      'Feel connection to all those who share this light—yemanjá\'s ocean',
    ],
    ebós: [
      'White and silver candle + silver mirror—offering to Iemanjá for gratitude',
      'Sea shells + saltwater bath—cleansing in her sacred waters',
      'Rice + flowers + wine—feeding the orixás for blessings received',
      'Incense of choice + open windows—releasing to the smoke',
      'Moonflower petals scattered to water—giving back to the night',
      'White roses + honey— sweetness offered in thanks',
    ],
  },
  'waning gibbous': {
    phase: 'waning gibbous',
    intentions: [
      'Share your light and wisdom with others',
      'Give back from the abundance received',
      'Extend compassion to those in need',
      'Be a channel for blessing',
    ],
    meditations: [
      'Imagine your light pouring outward like moonlight across the world',
      'Feel the joy of giving without attachment—generosity without expectation',
      'See yourself as a bridge between the full moon\'s gifts and those in darkness',
    ],
    ebós: [
      'Gold or yellow candle + honey—offering to Oshun for love and abundance shared',
      'Honey drizzled on water—sweetness flowing outward',
      'Flowers left at a crossroads—offering to Eleguá who opens doors for others',
      'Food offered to the hungry—in body made sacred',
    ],
  },
  'last quarter': {
    phase: 'last quarter',
    intentions: [
      'Forgive yourself and others completely',
      'Release grudges and pain held tight',
      'Let go of what has run its course',
      'Find peace in surrender',
    ],
    meditations: [
      'Hold the image of a blade cutting cleanly—the手术-like precision of forgiveness',
      'Breathe out what you carry: I forgive, I release, I am free',
      'Sit in the dark portion of the moon and let it swallow your grief',
      'Whisper: I am not defined by what I release',
    ],
    ebós: [
      'Black candle + iron nail—offering to Ogun for cutting cords of resentment',
      'Eggs broken into running water—releasing what has spoiled',
      'Old photos burned—letting go of past wounds',
      'Epsom salt bath— washing away what the body carries',
      'Prayer with rum and hot pepper—to São Sebastião for endurance in letting go',
    ],
  },
  'waning crescent': {
    phase: 'waning crescent',
    intentions: [
      'Honor the darkness as teacher',
      'Rest and restore without guilt',
      'Make space for new cycles to come',
      'Practice stillness and surrender',
    ],
    meditations: [
      'Rest in the darkness like the moon itself—hidden, quiet, complete',
      'Feel the fertile void: within darkness lies all future possibility',
      'Breathe out the last of the old cycle: I rest, I prepare, I trust',
      'Imagine yourself as the dark moon—nothing to prove, only to be',
    ],
    ebós: [
      'Purple or black candle + silence—offering to the ancestors in their rest',
      'Almond or cashew—quiet offerings to the spirits who dwell between',
      'Water left overnight beneath the stars, gathered at dawn—timeless libation',
      'Baths of bay leaves and rosemary—rest and protection for the tired soul',
      'Prayer for the dead—honoring those who have cycled before you',
      'Leftover food placed outside—feeding what roams in the dark hours',
    ],
  },
};

export function getMoonRitual(phase: MoonPhase): MoonRitual {
  return rituals[phase] ?? rituals.new;
}
