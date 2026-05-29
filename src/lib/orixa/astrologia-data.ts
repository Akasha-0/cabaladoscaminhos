// @ts-nocheck
// SKIP_LINT

/**
 * Astrologia Data Module
 * Spiritual astrology data integrating Orixá wisdom with celestial patterns
 */

export interface AstrologiaData {
  id: string;
  sign: string;
  element: string;
  modality: string;
  rulingOrisha: string;
  associatedOrishas: string[];
  colors: string[];
  stones: string[];
  dayOfWeek: string;
  luckyNumbers: number[];
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  rulingPlanet: string;
  house: string;
  elements: {
    fire: string[];
    earth: string[];
    water: string[];
    air: string[];
  };
  temples: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  compatibleSigns: string[];
  incompatibleSigns: string[];
  seasons: {
    beginning: string;
    peak: string;
    ending: string;
  };
  sacredAnimals: string[];
  plants: string[];
  rituals: {
    daily: string[];
    weekly: string[];
    monthly: string[];
    yearly: string[];
  };
  divination: {
    odu: string;
    meaning: string;
    action: string;
  };
}

const ASTROLOGIA_DATA: AstrologiaData[] = [
  {
    id: "ogbe-ares",
    sign: "Ogbe-Ares",
    element: "Fire",
    modality: "Cardinal",
    rulingOrisha: "Obatalá",
    associatedOrishas: ["Oxumar", "Oludumare"],
    colors: ["white", "gold", "silver"],
    stones: ["diamond", "clear-quartz", "white-selite"],
    dayOfWeek: "Monday",
    luckyNumbers: [1, 3, 5, 7, 9],
    characteristics: [
      "Pioneer spirit",
      "Natural leadership",
      "Bold initiative",
      "Divine inspiration",
      "Creative force"
    ],
    strengths: [
      "Unstoppable determination",
      "Innovation and invention",
      "Courage under pressure",
      "Visionary thinking",
      "Charismatic presence"
    ],
    challenges: [
      "Impulsiveness",
      "Impatience",
      "Arian stubbornness",
      "Self-centered tendencies",
      "Need for immediate gratification"
    ],
    rulingPlanet: "Mars",
    house: "1st House of Self",
    elements: {
      fire: ["passion", "action", "courage"],
      earth: ["stability", "foundation", "manifestation"],
      water: ["emotion", "depth", "intuition"],
      air: ["thought", "communication", "freedom"]
    },
    temples: ["shrine-of-ogbe", "altar-of-creation"],
    offerings: ["white-doves", "fresh-water", "coconut", "efun"],
    chants: ["Ogbe ale ogbe", "Olodumare lo maa je"],
    symbols: ["four-corners", "primordial-seed", "sacred-fire"],
    mythology: "Ogbe represents the first moment of creation, when Oludumare breathed life into the universe through Obatalá, establishing the foundation of all existence.",
    spiritualLesson: "True power comes from divine alignment, not personal ambition.",
    affirmation: "I am a vessel of divine creation, channeling sacred purpose.",
    meditation: "I breathe in the primordial fire of creation and exhale limitation.",
    compatibleSigns: ["Oyeku-Gemini", "Iwori-Virgo", "Odi-Libra"],
    incompatibleSigns: ["Owonrin-Scorpio", "Logbara-Pisces"],
    seasons: {
      beginning: "March",
      peak: "April",
      ending: "May"
    },
    sacredAnimals: ["white-stallion", "cosmic-eagle"],
    plants: ["white-agar", "sacred-lotus"],
    rituals: {
      daily: ["pray-at-dawn", "water offering", "breath-work"],
      weekly: ["white-candle-lightning", "head-anointing"],
      monthly: ["ogbe-ritual", "creation-meditation"],
      yearly: ["january-ogbe-festival", "spring-equinox-celebration"]
    },
    divination: {
      odu: "Ogbe Meji",
      meaning: "Divine intervention and new beginnings",
      action: "Trust the process and take sacred action"
    }
  },
  {
    id: "oyeku-scorpio",
    sign: "Oyeku-Scorpio",
    element: "Water",
    modality: "Fixed",
    rulingOrisha: "Sango",
    associatedOrishas: ["Oya", "Obaluaye"],
    colors: ["black", "red", "crimson"],
    stones: ["black-tourmaline", "obsidian", "garnet"],
    dayOfWeek: "Tuesday",
    luckyNumbers: [2, 4, 6, 8, 10],
    characteristics: [
      "Transformative power",
      "Intense focus",
      "Psychic depth",
      "Regenerative strength",
      "Mysterious wisdom"
    ],
    strengths: [
      "Unwavering commitment",
      "Strategic intelligence",
      "Emotional resilience",
      "Healing ability",
      "Penetrating insight"
    ],
    challenges: [
      "Jealousy and possessiveness",
      "Control tendencies",
      "Dark emotional depths",
      "Secretive nature",
      "Vengeful potential"
    ],
    rulingPlanet: "Pluto",
    house: "8th House of Transformation",
    elements: {
      fire: ["passion", "power", "transformation"],
      earth: ["material-realms", "ancestral-memory"],
      water: ["emotional-depth", "intuition", "connection"],
      air: ["hidden-knowledge", "unseen-truths"]
    },
    temples: ["sango-temple", "shrine-of-transformation"],
    offerings: ["red-wine", "palm-oil", "black-chickens", "candle-fire"],
    chants: ["Oyeku re o", "Sango ogo ni"],
    symbols: ["scorpion", "phoenix", "serpent-wisdom"],
    mythology: "Oyeku teaches that true power lies in the ability to release what no longer serves, embracing the sacred cycle of death and rebirth that Sango mastered through sacred fire.",
    spiritualLesson: "Transformation requires the courage to let go of what was.",
    affirmation: "I release the old to embrace the new. I am reborn through sacred fire.",
    meditation: "I sink into the depths of my soul and rise transformed.",
    compatibleSigns: ["Ogbe-Aries", "Odi-Cancer", "Iwori-Capricorn"],
    incompatibleSigns: ["Osa-Leo", "Owonrin-Taurus"],
    seasons: {
      beginning: "October",
      peak: "November",
      ending: "December"
    },
    sacredAnimals: ["scorpion", "phoenix", "black-serpent"],
    plants: ["black-snake-plant", "bloodroot"],
    rituals: {
      daily: ["water-reflection", "offering-to-oya"],
      weekly: ["red-candle-ritual", "offering-to-sango"],
      monthly: ["oyeku-meditation", "ancestral-connection"],
      yearly: ["october-transformation-ritual", "day-of-dead-ceremony"]
    },
    divination: {
      odu: "Oyeku Meji",
      meaning: "Secrets revealed and power reclaimed",
      action: "Confront what holds you back and transform"
    }
  },
  {
    id: "iwori-virgo",
    sign: "Iwori-Virgo",
    element: "Earth",
    modality: "Mutable",
    rulingOrisha: "Obatalá",
    associatedOrishas: ["Orunmila", "Ogun"],
    colors: ["brown", "cream", "earth-tone"],
    stones: ["amber", "brown-jasper", "tiger-eye"],
    dayOfWeek: "Wednesday",
    luckyNumbers: [3, 5, 7, 12, 21],
    characteristics: [
      "Analytical wisdom",
      "Practical perfection",
      "Service devotion",
      "Detail oriented",
      "Healing capacity"
    ],
    strengths: [
      "Systematic thinking",
      "Reliability and loyalty",
      "Healing hands",
      "Intellectual precision",
      "Humble service"
    ],
    challenges: [
      "Excessive criticism",
      "Perfectionism anxiety",
      "Overly detailed obsession",
      "Self-limiting beliefs",
      "Service without self-care"
    ],
    rulingPlanet: "Mercury",
    house: "6th House of Service",
    elements: {
      fire: ["discerning-light", "clarity-of-purpose"],
      earth: ["grounding", "practicality", "harvest"],
      water: ["compassionate-flow", "emotional-care"],
      air: ["analytical-thought", "communication"]
    },
    temples: ["orunmila-shrine", "obatala-altar"],
    offerings: ["corn-pudding", "white-cloth", "coconut-water", "efun-sweat"],
    chants: ["Iwori o", "Obatala aye mi"],
    symbols: ["virgin-goddess", "sacred-harvest", "wheat-ear"],
    mythology: "Iwori-Virgo carries the sacred duty of discernment that Obatalá embodied when creating the world, teaching that true wisdom lies in distinguishing the essential from the superficial.",
    spiritualLesson: "Perfection is found in accepting imperfection with grace.",
    affirmation: "I serve with pure intention, honoring the divine in all things.",
    meditation: "I cultivate my inner garden with patience and loving precision.",
    compatibleSigns: ["Odi-Taurus", "Oyeku-Capricorn", "Ogbe-Aries"],
    incompatibleSigns: ["Osa-Sagittarius", "Owonrin-Pisces"],
    seasons: {
      beginning: "August",
      peak: "September",
      ending: "October"
    },
    sacredAnimals: ["virgin-dove", "wise-serpent"],
    plants: ["wheat", "lavender", "sage"],
    rituals: {
      daily: ["morning-purification", "offering-water"],
      weekly: ["herb-blessing", "altar-cleaning"],
      monthly: ["iwori-healing-ritual", "service-ceremony"],
      yearly: ["september-harvest-festival", "virgo-equinox"]
    },
    divination: {
      odu: "Iwori Meji",
      meaning: "Wisdom through experience and humble service",
      action: "Serve without expectation and heal with compassion"
    }
  },
  {
    id: "odi-cancer",
    sign: "Odi-Cancer",
    element: "Water",
    modality: "Cardinal",
    rulingOrisha: "Yemoja",
    associatedOrishas: ["Oxum", "Oya"],
    colors: ["silver", "white", "pale-blue"],
    stones: ["moonstone", "pearl", "selenite"],
    dayOfWeek: "Monday",
    luckyNumbers: [2, 4, 6, 11, 22],
    characteristics: [
      "Nurturing presence",
      "Emotional depth",
      "Protective instinct",
      "Home-centered wisdom",
      "Ancestral connection"
    ],
    strengths: [
      "Unconditional love",
      "Memory mastery",
      "Intuitive protection",
      "Emotional intelligence",
      "Family devotion"
    ],
    challenges: [
      "Overprotective behavior",
      "Emotional moodiness",
      "Dependency on others",
      "Difficulty letting go",
      "Absorption of others pain"
    ],
    rulingPlanet: "Moon",
    house: "4th House of Home",
    elements: {
      fire: ["creative-nurturing", "warmth"],
      earth: ["ancestral-roots", "family-security"],
      water: ["emotional-ocean", "intuition"],
      air: ["protective-shield", "boundary"]
    },
    temples: ["yemoja-shrine", "oxum-altar"],
    offerings: ["sweet-water", "white-flowers", "coconut-milk", "salt"],
    chants: ["Yemoja o", "Odi aje re"],
    symbols: ["sacred-crab", "mother-moon", "water-vessel"],
    mythology: "Odi-Cancer holds the sacred memory of Yemoja, the great Mother who first taught humanity to nurture life, reminding us that true strength lies in the gentle embrace of compassion.",
    spiritualLesson: "Home is found within, through the love we cultivate in our hearts.",
    affirmation: "I honor my ancestors and nurture the divine child within.",
    meditation: "I breathe with the tides, releasing what no longer serves my healing.",
    compatibleSigns: ["Oyeku-Scorpio", "Owonrin-Pisces", "Ogbe-Aries"],
    incompatibleSigns: ["Osa-Capricorn", "Iwori-Aries"],
    seasons: {
      beginning: "June",
      peak: "July",
      ending: "August"
    },
    sacredAnimals: ["sacred-crab", "mother-crab"],
    plants: ["water-lily", "moon-flower", "jasmine"],
    rituals: {
      daily: ["moon-water-blessing", "family-prayer"],
      weekly: ["salt-circle", "water-offering"],
      monthly: ["odi-ritual", "full-moon-ceremony"],
      yearly: ["june-yemoja-festival", "july-oxum-celebration"]
    },
    divination: {
      odu: "Odi Meji",
      meaning: "Protection granted and emotional wisdom earned",
      action: "Nurture yourself as you nurture others"
    }
  },
  {
    id: "irosun-pisces",
    sign: "Irosun-Pisces",
    element: "Water",
    modality: "Mutable",
    rulingOrisha: "Oxum",
    associatedOrishas: ["Yemoja", "Olokun"],
    colors: ["sea-green", "aqua", "turquoise"],
    stones: ["aquamarine", "sea-shell-pearl", "turquoise"],
    dayOfWeek: "Friday",
    luckyNumbers: [3, 6, 9, 12, 15],
    characteristics: [
      "Deep intuition",
      "Artistic sensitivity",
      "Compassionate heart",
      "Psychic awareness",
      "Spiritual transcendence"
    ],
    strengths: [
      "Universal compassion",
      "Artistic expression",
      "Dream-state wisdom",
      "Spiritual connection",
      "Healing through art"
    ],
    challenges: [
      "Escapist tendencies",
      "Boundary confusion",
      "Overly sensitive nature",
      "Self-sacrifice imbalance",
      "Difficulty with reality"
    ],
    rulingPlanet: "Neptune",
    house: "12th House of Spirit",
    elements: {
      fire: ["spiritual-aspiration", "transcendent-flame"],
      earth: ["creative-manifestation", "art"],
      water: ["emotional-integration", "intuition"],
      air: ["dream-state", "higher-vision"]
    },
    temples: ["oxum-shrine", "yemoja-altar"],
    offerings: ["honey", "sweet-water", "gold-leaf", "perfumed-oils"],
    chants: ["Irosun o", "Oxum odo re"],
    symbols: ["two-fish", "sacred-fish", "flowing-water"],
    mythology: "Irosun-Pisces embodies the sacred journey of the fish swimming between worlds, guided by Oxum who taught humanity to navigate the currents of emotion and spirit as one.",
    spiritualLesson: "We are all connected through the waters of consciousness.",
    affirmation: "I flow like sacred water, embracing the divine dance of life.",
    meditation: "I sink into the depths of divine wisdom and rise with clarity.",
    compatibleSigns: ["Odi-Cancer", "Owonrin-Scorpio", "Iwori-Virgo"],
    incompatibleSigns: ["Ogbe-Gemini", "Osa-Sagittarius"],
    seasons: {
      beginning: "February",
      peak: "March",
      ending: "April"
    },
    sacredAnimals: ["sacred-fish", "dolphin", "mystic-fish"],
    plants: ["water-hyacinth", "lotus", "watercress"],
    rituals: {
      daily: ["sacred-bath", "candle-dreaming"],
      weekly: ["honey-offering", "water-shrine"],
      monthly: ["irosun-ritual", "oxum-celebration"],
      yearly: ["february-love-festival", "march-pisces-equinox"]
    },
    divination: {
      odu: "Irosun Meji",
      meaning: "Love and artistic fulfillment through surrender",
      action: "Trust your intuition and express your sacred creativity"
    }
  },
  {
    id: "owonrin-taurus",
    sign: "Owonrin-Taurus",
    element: "Earth",
    modality: "Fixed",
    rulingOrisha: "Oxossi",
    associatedOrishas: ["Omolu", "Obaluaye"],
    colors: ["green", "brown", "earth-red"],
    stones: ["emerald", "jade", "chrysocolla"],
    dayOfWeek: "Thursday",
    luckyNumbers: [4, 6, 8, 10, 15],
    characteristics: [
      "Steadfast determination",
      "Patient endurance",
      "Practical wisdom",
      "Natures harmony",
      "Material mastery"
    ],
    strengths: [
      "Unwavering loyalty",
      "Grounded stability",
      "Patient persistence",
      "Natural abundance",
      "Sensory refinement"
    ],
    challenges: [
      "Stubborn resistance to change",
      "Material attachment",
      "Comfort-seeking excess",
      "Inflexible opinions",
      "Envy tendencies"
    ],
    rulingPlanet: "Venus",
    house: "2nd House of Value",
    elements: {
      fire: ["earthy-passion", "creative-drive"],
      earth: ["grounding", "prosperity", "harvest"],
      water: ["sensory-depth", "emotional-richness"],
      air: ["patient-thought", "steady-reason"]
    },
    temples: ["oxossi-shrine", "forest-temple"],
    offerings: ["game-meat", "honey-cake", "green-leaves", "tobacco"],
    chants: ["Owonrin o", "Oxossi ogun"],
    symbols: ["sacred-bull", "forest-stag", "golden-necklace"],
    mythology: "Owonrin-Taurus carries the patient wisdom of Oxossi, the great Hunter who understood that true abundance comes from harmonious relationship with the earth and all its creatures.",
    spiritualLesson: "Abundance flows to those who honor the sacred cycles of nature.",
    affirmation: "I am rooted in the earth, receiving the gifts of the divine harvest.",
    meditation: "I breathe in the green life force and exhale abundance in all forms.",
    compatibleSigns: ["Odi-Cancer", "Iwori-Virgo", "Osa-Capricorn"],
    incompatibleSigns: ["Ogbe-Aries", "Oyeku-Scorpio", "Osa-Leo"],
    seasons: {
      beginning: "April",
      peak: "May",
      ending: "June"
    },
    sacredAnimals: ["forest-stag", "sacred-bull", "hunting-hawk"],
    plants: ["green-palm", "sacred-bamboo", "forest-mushroom"],
    rituals: {
      daily: ["earth-offering", "morning-grounding"],
      weekly: ["hunt-ceremony", "harvest-blessing"],
      monthly: ["owonrin-ritual", "oxossi-celebration"],
      yearly: ["may-hunting-festival", "june-oxossi-day"]
    },
    divination: {
      odu: "Owonrin Meji",
      meaning: "Success through patience and nature's blessing",
      action: "Honor the earth and work with sacred rhythm"
    }
  },
  {
    id: "osa-sagittarius",
    sign: "Osa-Sagittarius",
    element: "Fire",
    modality: "Mutable",
    rulingOrisha: "Orunmila",
    associatedOrishas: ["Sango", "Oxum"],
    colors: ["purple", "deep-blue", "gold"],
    stones: ["amethyst", "gold-pyrite", "blue-sapphire"],
    dayOfWeek: "Thursday",
    luckyNumbers: [3, 7, 9, 12, 21],
    characteristics: [
      "Expansive vision",
      "Philosophical wisdom",
      "Adventurous spirit",
      "Truth-seeking",
      "Optimistic faith"
    ],
    strengths: [
      "Visionary thinking",
      "Natural optimism",
      "Truth-speaking",
      "Cultural wisdom",
      "Spiritual exploration"
    ],
    challenges: [
      "Restless impulsiveness",
      "Blunt honesty",
      "Excessive optimism",
      "Irresponsibility",
      "Overconfidence"
    ],
    rulingPlanet: "Jupiter",
    house: "9th House of Expansion",
    elements: {
      fire: ["sacred-flame", "divine-light", "truth"],
      earth: ["grounded-philosophy", "practical-wisdom"],
      water: ["spiritual-depth", "intuitive-vision"],
      air: ["higher-mind", "expansive-thought"]
    },
    temples: ["orunmila-shrine", "university-of-wisdom"],
    offerings: ["divination-tools", "books", "golden-candles", "libations"],
    chants: ["Osa lo", "Orunmila agbon"],
    symbols: ["sacred-arrow", "centaur-sage", "visionary-eye"],
    mythology: "Osa-Sagittarius embodies the sacred arrow of truth that Orunmila taught humanity to release, flying ever toward the horizon of divine wisdom while remaining grounded in sacred purpose.",
    spiritualLesson: "True wisdom lies in the eternal pursuit of truth with an open heart.",
    affirmation: "I shoot my sacred arrow toward the truth, guided by divine light.",
    meditation: "I expand beyond all limits, seeking the infinite wisdom within.",
    compatibleSigns: ["Ogbe-Aries", "Iwori-Virgo", "Owonrin-Leo"],
    incompatibleSigns: ["Odi-Scorpio", "Iwori-Pisces"],
    seasons: {
      beginning: "November",
      peak: "December",
      ending: "January"
    },
    sacredAnimals: ["sacred-centaur", "visionary-arrow-hawk"],
    plants: ["sacred-grape", "sage", "worship-fire"],
    rituals: {
      daily: ["morning-meditation", "truth-prayer"],
      weekly: ["philosophy-study", "expansion-ritual"],
      monthly: ["osa-ritual", "jupiter-blessing"],
      yearly: ["december-expansion-festival", "january-truth-ceremony"]
    },
    divination: {
      odu: "Osa Meji",
      meaning: "Victory through faith and visionary action",
      action: "Trust the journey and speak your truth with love"
    }
  },
  {
    id: "obara-libra",
    sign: "Obara-Libra",
    element: "Air",
    modality: "Cardinal",
    rulingOrisha: "Obatalá",
    associatedOrishas: ["Oxum", "Elegua"],
    colors: ["blue", "silver", "light-pink"],
    stones: ["lapis-lazuli", "rose-quartz", "celestite"],
    dayOfWeek: "Friday",
    luckyNumbers: [4, 6, 8, 11, 15],
    characteristics: [
      "Harmonious balance",
      "Diplomatic wisdom",
      "Partnership focus",
      "Aesthetic sensitivity",
      "Justice seeking"
    ],
    strengths: [
      "Peacemaking ability",
      "Social grace",
      "Fair judgment",
      "Cooperative nature",
      "Artistic refinement"
    ],
    challenges: [
      "Indecision paralysis",
      "People-pleasing",
      "Avoidance of conflict",
      "Superficiality",
      "Dependency on approval"
    ],
    rulingPlanet: "Venus",
    house: "7th House of Partnership",
    elements: {
      fire: ["balanced-passion", "harmonious-action"],
      earth: ["fair-dealings", "practical-balance"],
      water: ["emotional-harmony", "relational-depth"],
      air: ["intellectual-balance", "social-grace"]
    },
    temples: ["obatala-shrine", "oxum-altar"],
    offerings: ["balance-sunset", "sweet-perfume", "white-flowers", "mirror"],
    chants: ["Obara o", "Oxum odo re"],
    symbols: ["sacred-scales", "harmony-lotus", "partnership-heart"],
    mythology: "Obara-Libra carries the sacred duty of balance that Obatalá embodied when creating the world, teaching that harmony is the foundation of all sacred relationships and divine justice.",
    spiritualLesson: "Balance is found not in perfection but in accepting the sacred dance of opposites.",
    affirmation: "I create harmony in all my relationships, honoring the divine in others.",
    meditation: "I breathe in balance and exhale judgment, finding peace in sacred unity.",
    compatibleSigns: ["Odi-Aries", "Oyeku-Capricorn", "Ogbe-Gemini"],
    incompatibleSigns: ["Owonrin-Aries", "Osa-Scorpio"],
    seasons: {
      beginning: "September",
      peak: "October",
      ending: "November"
    },
    sacredAnimals: ["sacred-swan", "harmony-dove"],
    plants: ["rose", "violet", "peace-lily"],
    rituals: {
      daily: ["balance-prayer", "harmony-meditation"],
      weekly: ["partnership-ritual", "white-candle"],
      monthly: ["obara-ritual", "libra-equinox"],
      yearly: ["october-balance-festival", "september-partnership-day"]
    },
    divination: {
      odu: "Obara Meji",
      meaning: "Relationships balanced and justice served",
      action: "Seek harmony without sacrificing your truth"
    }
  },
  {
    id: "okanran-capricorn",
    sign: "Okanran-Capricorn",
    element: "Earth",
    modality: "Cardinal",
    rulingOrisha: "Ogun",
    associatedOrishas: ["Obatalá", "Shango"],
    colors: ["black", "brown", "dark-green"],
    stones: ["black-agate", "smoky-quartz", "onyx"],
    dayOfWeek: "Saturday",
    luckyNumbers: [1, 4, 8, 13, 22],
    characteristics: [
      "Ambitious discipline",
      "Responsible authority",
      "Patient mastery",
      "Practical wisdom",
      "Structural vision"
    ],
    strengths: [
      "Enduring determination",
      "Strategic planning",
      "Responsible leadership",
      "Patient achievement",
      "Practical mastery"
    ],
    challenges: [
      "Excessive ambition",
      "Cold detachment",
      "Pessimistic tendency",
      "Work addiction",
      "Rigid hierarchy"
    ],
    rulingPlanet: "Saturn",
    house: "10th House of Achievement",
    elements: {
      fire: ["transformed-ambition", "sacred-drive"],
      earth: ["material-mastery", "structural-stability"],
      water: ["emotional-depth", "ancestral-wisdom"],
      air: ["intellectual-strategy", "calculated-thought"]
    },
    temples: ["ogun-shrine", "iron-altar"],
    offerings: ["iron-tools", "black-candle", "palm-wine", "tobacco-smoke"],
    chants: ["Okanran o", "Ogun iron king"],
    symbols: ["sea-goat", "sacred-mountain", "iron-will"],
    mythology: "Okanran-Capricorn carries the sacred endurance of Ogun, the Divine Smith who taught humanity that mastery comes through patient perseverance and the transformative power of sacred work.",
    spiritualLesson: "True achievement is built on the foundation of patient, sacred labor.",
    affirmation: "I climb my sacred mountain with patient determination, knowing that mastery is earned.",
    meditation: "I forge my spirit in the sacred fire of discipline, emerging transformed.",
    compatibleSigns: ["Odi-Taurus", "Iwori-Virgo", "Oyeku-Scorpio"],
    incompatibleSigns: ["Osa-Aries", "Irosun-Gemini"],
    seasons: {
      beginning: "December",
      peak: "January",
      ending: "February"
    },
    sacredAnimals: ["sea-goat", "iron-stag", "patient-wolf"],
    plants: ["ironwood", "cold-pine", "enduring-oak"],
    rituals: {
      daily: ["morning-discipline", "iron-offering"],
      weekly: ["work-ritual", "structure-meditation"],
      monthly: ["okanran-ritual", "saturn-blessing"],
      yearly: ["january-mastery-festival", "february-iron-ceremony"]
    },
    divination: {
      odu: "Okanran Meji",
      meaning: "Authority earned through discipline and patient work",
      action: "Build your sacred structure one stone at a time"
    }
  },
  {
    id: "ogunda-leo",
    sign: "Ogunda-Leo",
    element: "Fire",
    modality: "Fixed",
    rulingOrisha: "Shango",
    associatedOrishas: ["Ogun", "Oya"],
    colors: ["gold", "orange", "crimson"],
    stones: ["golden-quartz", "citrine", "amber"],
    dayOfWeek: "Sunday",
    luckyNumbers: [1, 5, 9, 10, 19],
    characteristics: [
      "Royal presence",
      "Creative expression",
      "Generous warmth",
      "Dramatic flair",
      "Heart-centered leadership"
    ],
    strengths: [
      "Natural charisma",
      "Generous spirit",
      "Confident expression",
      "Creative inspiration",
      "Warm-hearted loyalty"
    ],
    challenges: [
      "Egotistical behavior",
      "Need for attention",
      "Dramatic exaggeration",
      "Rigid pride",
      "Generosity extremes"
    ],
    rulingPlanet: "Sun",
    house: "5th House of Creation",
    elements: {
      fire: ["sacred-flame", "heart-light", "creative-fire"],
      earth: ["generous-harvest", "royal-grounding"],
      water: ["generous-emotion", "warm-depth"],
      air: ["dramatic-expression", "creative-air"]
    },
    temples: ["shango-temple", "royal-shrine"],
    offerings: ["fire-offering", "golden-fruit", "palm-wine", "ox-blood"],
    chants: ["Ogunda o", "Shango ogo ni"],
    symbols: ["sacred-lion", "golden-sun", "royal-flame"],
    mythology: "Ogunda-Leo carries the royal fire of Shango, the Divine King who taught humanity that true leadership emerges from the heart, illuminating all with generous warmth and creative power.",
    spiritualLesson: "Leadership is not about authority but about illuminating the path for others.",
    affirmation: "I shine my sacred light, illuminating the path for all beings.",
    meditation: "I breathe in divine fire and exhale generous love, warming all I touch.",
    compatibleSigns: ["Ogbe-Aries", "Owonrin-Sagittarius", "Osa-Libra"],
    incompatibleSigns: ["Odi-Aquarius", "Okanran-Taurus"],
    seasons: {
      beginning: "July",
      peak: "August",
      ending: "September"
    },
    sacredAnimals: ["royal-lion", "golden-eagle", "sacred-sun-falcon"],
    plants: ["sunflower", "marigold", "golden-fern"],
    rituals: {
      daily: ["morning-sun-meditation", "heart-offering"],
      weekly: ["fire-ritual", "creative-celebration"],
      monthly: ["ogunda-ritual", "august-shango-festival"],
      yearly: ["august-sun-festival", "july-creative-ceremony"]
    },
    divination: {
      odu: "Ogunda Meji",
      meaning: "Creative power unleashed and royal authority claimed",
      action: "Share your gifts with generous heart and lead with love"
    }
  },
  {
    id: "osetura-aquarius",
    sign: "Osetura-Aquarius",
    element: "Air",
    modality: "Fixed",
    rulingOrisha: "Oludumare",
    associatedOrishas: ["Obatalá", "Elegua"],
    colors: ["electric-blue", "silver", "modern-purple"],
    stones: ["aqamarine", "uvarovite", "blue-diamond"],
    dayOfWeek: "Saturday",
    luckyNumbers: [2, 4, 8, 11, 22],
    characteristics: [
      "Revolutionary vision",
      "Humanitarian spirit",
      "Independent thinking",
      "Technological wisdom",
      "Futuristic insight"
    ],
    strengths: [
      "Innovation and invention",
      "Humanitarian compassion",
      "Intellectual freedom",
      "Social vision",
      "Technological mastery"
    ],
    challenges: [
      "Detached emotion",
      "Unconventional rebellion",
      "Unpredictable behavior",
      "Idealistic distance",
      "Social awkwardness"
    ],
    rulingPlanet: "Uranus",
    house: "11th House of Community",
    elements: {
      fire: ["revolutionary-passion", "future-vision"],
      earth: ["practical-innovation", "grounded-progress"],
      water: ["compassionate-flow", "emotional-vision"],
      air: ["intellectual-freedom", "future-thought"]
    },
    temples: ["oludumare-shrine", "future-temple"],
    offerings: ["lightning-offering", "technology-gifts", "rain-water", "futuristic-symbols"],
    chants: ["Osetura o", "Oludumare aye mi"],
    symbols: ["water-bearer", "cosmic-storm", "future-vessel"],
    mythology: "Osetura-Aquarius carries the sacred vessel of Oludumare, pouring divine waters of transformation upon humanity, teaching that true progress comes through revolutionary compassion and intellectual freedom.",
    spiritualLesson: "True freedom lies in serving the collective through authentic innovation.",
    affirmation: "I pour sacred waters of transformation for all beings, embracing the future.",
    meditation: "I breathe in the lightning of innovation and exhale limitation, rising with humanity.",
    compatibleSigns: ["Ogbe-Sagittarius", "Odi-Gemini", "Osa-Libra"],
    incompatibleSigns: ["Owonrin-Taurus", "Odi-Leo"],
    seasons: {
      beginning: "January",
      peak: "February",
      ending: "March"
    },
    sacredAnimals: ["cosmic-stag", "water-bearer", "futuristic-eagle"],
    plants: ["electric-flower", "future-bloom", "cosmic-moss"],
    rituals: {
      daily: ["vision-meditation", "community-prayer"],
      weekly: ["lightning-ritual", "innovation-ceremony"],
      monthly: ["osetura-ritual", "future-blessing"],
      yearly: ["february-innovation-festival", "march-revolution-day"]
    },
    divination: {
      odu: "Osetura Meji",
      meaning: "Revolutionary transformation and humanitarian awakening",
      action: "Serve the collective with authentic innovation and compassion"
    }
  },
  {
    id: "otura-gemini",
    sign: "Otura-Gemini",
    element: "Air",
    modality: "Mutable",
    rulingOrisha: "Elegua",
    associatedOrishas: ["Obatalá", "Orunmila"],
    colors: ["yellow", "light-orange", "mixed"],
    stones: ["citrine", "agate", "tourmaline"],
    dayOfWeek: "Wednesday",
    luckyNumbers: [3, 5, 7, 12, 21],
    characteristics: [
      "Dual nature harmony",
      "Adaptable wisdom",
      "Communication mastery",
      "Curious intellect",
      "Versatile expression"
    ],
    strengths: [
      "Adaptive flexibility",
      "Communication excellence",
      "Intellectual curiosity",
      "Learning speed",
      "Social versatility"
    ],
    challenges: [
      "Inconsistency",
      "Scattered energy",
      "Superficial engagement",
      "Nervous energy",
      "Commitment difficulty"
    ],
    rulingPlanet: "Mercury",
    house: "3rd House of Communication",
    elements: {
      fire: ["dynamic-ideas", "inspired-thought"],
      earth: ["practical-learning", "grounded-knowledge"],
      water: ["emotional-adaptation", "relational-flexibility"],
      air: ["intellectual-mastery", "communication-power"]
    },
    temples: ["elegua-shrine", "crossroad-altar"],
    offerings: ["keys", "cake", "coconut", "dynamic-symbols"],
    chants: ["Otura o", "Elegua open gate"],
    symbols: ["sacred-twins", "communication-bridge", "key-holder"],
    mythology: "Otura-Gemini embodies the dual wisdom of Elegua, the Divine Opener who taught humanity that communication bridges all worlds, navigating the sacred crossroads of thought and expression.",
    spiritualLesson: "True wisdom lies in adapting with integrity across all dimensions of life.",
    affirmation: "I bridge all worlds through sacred communication, honoring every voice.",
    meditation: "I breathe in multiple perspectives and exhale judgment, finding unity in diversity.",
    compatibleSigns: ["Ogbe-Leo", "Osa-Aquarius", "Okanran-Sagittarius"],
    incompatibleSigns: ["Odi-Virgo", "Oyeku-Pisces"],
    seasons: {
      beginning: "May",
      peak: "June",
      ending: "July"
    },
    sacredAnimals: ["sacred-twins", "mercury-bird", "dual-serpent"],
    plants: ["two-faced-flower", "communication-herb", "adaptive-reed"],
    rituals: {
      daily: ["communication-prayer", "adaptation-meditation"],
      weekly: ["crossroad-ritual", "learning-ceremony"],
      monthly: ["otura-ritual", "mercury-blessing"],
      yearly: ["june-gemini-festival", "may-twin-celebration"]
    },
    divination: {
      odu: "Otura Meji",
      meaning: "Versatility mastered and communication sanctified",
      action: "Adapt with integrity and speak with dual wisdom"
    }
  }
];

export function getData(): AstrologiaData[] {
  return ASTROLOGIA_DATA;
}

export function getDataById(id: string): AstrologiaData | undefined {
  return ASTROLOGIA_DATA.find((a) => a.id === id);
}

export function searchData(query: string): AstrologiaData[] {
  const lowerQuery = query.toLowerCase();
  return ASTROLOGIA_DATA.filter(
    (a) =>
      a.sign.toLowerCase().includes(lowerQuery) ||
      a.element.toLowerCase().includes(lowerQuery) ||
      a.rulingOrisha.toLowerCase().includes(lowerQuery) ||
      a.characteristics.some((c) => c.toLowerCase().includes(lowerQuery))
  );
}

export function getAstrologiaByElement(element: string): AstrologiaData[] {
  return ASTROLOGIA_DATA.filter((a) => a.element.toLowerCase() === element.toLowerCase());
}

export function getAstrologiaByOrisha(orisha: string): AstrologiaData[] {
  return ASTROLOGIA_DATA.filter(
    (a) =>
      a.rulingOrisha.toLowerCase() === orisha.toLowerCase() ||
      a.associatedOrishas.some((o) => o.toLowerCase() === orisha.toLowerCase())
  );
}

export function getCompatibleSigns(sign: string): AstrologiaData[] {
  const data = ASTROLOGIA_DATA.find((a) => a.sign.toLowerCase().includes(sign.toLowerCase()));
  if (!data) return [];
  return ASTROLOGIA_DATA.filter((a) => data.compatibleSigns.includes(a.sign));
}