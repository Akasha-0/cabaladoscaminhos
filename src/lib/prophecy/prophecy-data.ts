// Prophecy data for spiritual insight and divine revelation

export interface Prophecy {
  id: string;
  title: string;
  description: string;
  origin: 'cabala' | 'torah' | 'neviim' | 'ketuvim' | 'zohar' | 'tradition';
  sephirah: string | null; // Tree of Life sephirah connection
  theme: 'wisdom' | 'judgment' | 'mercy' | 'transformation' | 'revelation' | 'unity';
  content: string;
  meditation: string;
  practicalApplication: string;
}

const prophecies: Prophecy[] = [
  {
    id: 'keter-wisdom-01',
    title: 'The Crown of Understanding',
    description: 'Awakening to the highest wisdom through divine perception',
    origin: 'cabala',
    sephirah: 'Keter',
    theme: 'wisdom',
    content:
      'Before existence was, the Crown raised itself in the unknowable darkness. From that singularity of light, all worlds unfolds like petals of a sacred flower. Seek first the crown, for there all paths converge in unity.',
    meditation:
      'Sit in stillness. Imagine a luminous crown above your head, radiating white light that descends through three vessels. Breathe this light into your mind.',
    practicalApplication:
      'Each morning, before speech or action, sit in silence for three minutes. Visualize the crown and ask for clarity of purpose for the day ahead.',
  },
  {
    id: 'chokhmah-pattern-01',
    title: 'The First Father',
    description: 'The primordial wisdom that births all forms',
    origin: 'cabala',
    sephirah: 'Chokhmah',
    theme: 'wisdom',
    content:
      'Chokhmah, the Father of Judaism, inscribes upon the fabric of existence the first pattern. This is the supernal wisdom — a flash of insight that cannot be taught, only revealed. The father inseminates, the mother conceives, and the child receives.',
    meditation:
      'Focus on moments of sudden insight in your life. Let those memories flow. Receive without grasping — allow wisdom to inscribe itself.',
    practicalApplication:
      'Keep a journal for sudden insights. Record dreams, intuitions, and moments of understanding. Return to this record when facing decisions.',
  },
  {
    id: 'binah-crystal-01',
    title: 'The Crystal Vessel',
    description: 'Transforming wisdom into structured understanding',
    origin: 'cabala',
    sephirah: 'Binah',
    theme: 'wisdom',
    content:
      'Binah is the Great Mother who receives the flash of Chokhmah and crystallizes it into forms. She is Saturn, the Sabbath, and the sea that receives all waters. Through her, the infinite becomes finite, the formless becomes formed.',
    meditation:
      'Contemplate a vast ocean. All rivers flow into it. The water is received, contained, and given back as rain. Breathe with this rhythm of receiving and giving.',
    practicalApplication:
      'Practice listening without reacting. When someone speaks, receive their words fully before forming a response. Let understanding crystallize before you speak.',
  },
  {
    id: 'chesed-light-01',
    title: 'The Right Hand of Mercy',
    description: 'The unbounded mercy that extends creation',
    origin: 'cabala',
    sephirah: 'Chesed',
    theme: 'mercy',
    content:
      'Chesed is pure loving-kindness — the desire of creation to extend itself beyond its own limits. It is Abraham at the oak of Mamre, the initiate of justice who embodies mercy. This is the covenant made in love.',
    meditation:
      'Recall a time when you showed undeserved kindness. Let that feeling expand. Imagine yourself surrounded by infinite loving-kindness, giving and receiving in equal measure.',
    practicalApplication:
      'Perform one act of pure kindness daily without expectation of return. Note how this expands your capacity for compassion.',
  },
  {
    id: 'geburah-judgment-01',
    title: 'The Left Hand of Judgment',
    description: 'The necessary severity that defines boundaries',
    origin: 'cabala',
    sephirah: 'Geburah',
    theme: 'judgment',
    content:
      'Geburah is the force of divine judgment, the necessary severity that creates boundaries and makes space for growth. It is the warrior aspect—Shemyaza, the warrior angel. Judgment is not cruelty but the precision that allows real connection.',
    meditation:
      'Bring to mind an area of life where boundaries are needed. Feel the strength in your spine. Let appropriate boundaries arise like the steel of a sharpened blade.',
    practicalApplication:
      'Identify one relationship or habit where clearer boundaries are needed. This week, practice saying no to one request that does not serve your highest purpose.',
  },
  {
    id: 'tiferet-beauty-01',
    title: 'The Center of Balance',
    description: 'The harmonious integration of mercy and severity',
    origin: 'cabala',
    sephirah: 'Tiferet',
    theme: 'unity',
    content:
      'Tiferet, the Beauty, is the central sephirah of the Tree—the heart of the system. It harmonizes Chesed and Geburah, mercy and judgment, into graceful balance. It is the Son in the Davidic dynasty, the King who rules with beauty.',
    meditation:
      'Place one hand in cold water, one in warm. When both hands are equalized, bring them together. Feel the merging of opposites. Breathe the breath that connects heaven and earth.',
    practicalApplication:
      'When facing a difficult decision, examine both sides with equal attention. Do not favor mercy or severity; wait for the answer that arises from balance.',
  },
  {
    id: 'netzach-endurance-01',
    title: 'The Victory of Endurance',
    description: 'The steadfast persistence of divine purpose',
    origin: 'cabala',
    sephirah: 'Netzach',
    theme: 'transformation',
    content:
      'Netzach is eternity and endurance—the force that ensures justice will ultimately prevail. It is the prophetic spirit that speaks truth to power and does not waver. By it, the righteous attain their portion.',
    meditation:
      'Stand or sit with your chest open. Imagine your purpose extending to the horizon. Let this vision persist regardless of obstacles. Invoke the spirit of endurance.',
    practicalApplication:
      'Complete one difficult task this week without distraction. See it through to completion, even when motivation fades.',
  },
  {
    id: 'hod-glory-01',
    title: 'The Splendor of Acknowledgment',
    description: 'The return of divine glory through acknowledgment',
    origin: 'cabala',
    sephirah: 'Hod',
    theme: 'revelation',
    content:
      'Hod is splendor and acknowledgment — the recognition that all power and glory return to their source. It is the netzach reversed, the acknowledgment that precedes reception. Hod allows prophecy to flow back down.',
    meditation:
      'Before receiving any guidance, pause to acknowledge gratitude. Let the breath move from acknowledgment downward into reception. Feel the circuit of divine exchange complete.',
    practicalApplication:
      'Before each meal, speak words of acknowledgment for sustenance received. This practice of attribution builds the channel through which blessing flows.',
  },
  {
    id: 'yesod-foundation-01',
    title: 'The Foundation of Worlds',
    description: 'The collecting point where all influences converge',
    origin: 'cabala',
    sephirah: 'Yesod',
    theme: 'unity',
    content:
      'Yesod is the Foundation of the Worlds, the collecting point that gathers all influences from the upper sephirot and transmits them to Malkuth. It is the angel Gabriel reigning in Yesod, the angel of truth who tests dreams.',
    meditation:
      'Feel your feet upon the earth. Imagine channels extending upward through your body into all directions. Receive from above and transmit below. You are the conduit.',
    practicalApplication:
      'Before sleep, review your day. Consciously gather insights and influences, transform them in your being, and release them back to serve the world below as you sleep.',
  },
  {
    id: 'malkuth-world-01',
    title: 'The Kingdom Made Holy',
    description: 'Bringing heaven into earth through sacred action',
    origin: 'cabala',
    sephirah: 'Malkuth',
    theme: 'unity',
    content:
      'Malkuth is the Kingdom — the physical world made sacred when theTree of Life flows through it. She is the daughter in relationship to Binah, the queen who receives the crown. Every act can be made holy when infused with conscious intention.',
    meditation:
      'Walk in nature with attention. Feel the earth beneath your feet as the body of the divine queen. Every stone, every plant, every creature is an emanation of the sacred. You are in the palace of the Queen.',
    practicalApplication:
      'Choose one daily mundane action — washing dishes, walking, eating — and bring full presence to it. Do this as a sacred offering. Transform the ordinary into the holy.',
  },
  {
    id: 'sephirot-unity-01',
    title: 'The Living Tree',
    description: 'The ten sephirot as one living organism',
    origin: 'cabala',
    sephirah: null,
    theme: 'unity',
    content:
      'The ten sephirot are not separate stations but one living body. Wisdom is the brain, understanding the mouth, mercy the right arm, judgment the left, beauty the torso, endurance the right leg, acknowledgment the left leg, foundation the sexual organ, and kingdom all that is received. When one is wounded, all suffer. When one flourishes, all grow.',
    meditation:
      'Visualize the complete Tree of Life within your body. Let each sephirah connect to the next. Feel this entire system breathe as one organism. There is no separation.',
    practicalApplication:
      'Notice how your words and actions affect others. When you wound another, you wound yourself. When you uplift another, you uplift yourself. Act accordingly.',
  },
  {
    id: 'torah-light-01',
    title: 'The Light of Torah',
    description: 'Sacred text as a path to divine perception',
    origin: 'torah',
    sephirah: null,
    theme: 'revelation',
    content:
      'The Torah is not merely a text but the blueprint of creation. Each letter is a vessel holding divine light. One who studies Torah with pure intention perceives the hidden wisdom woven through all existence. The letters are ladders between worlds.',
    meditation:
      'Read a short verse of Torah slowly, as if each word were a window. Let the words resonate. Do not seek to understand; seek to receive. Allow the letter\'s light to illuminate your mind.',
    practicalApplication:
      'Set a small daily time for sacred text study. Even five minutes of mindful reading creates channels of perception that deepen over time.',
  },
  {
    id: 'prophet-voice-01',
    title: 'The Voice in the Ruach',
    description: 'True prophecy as the breath of divinewind',
    origin: 'neviim',
    sephirah: null,
    theme: 'revelation',
    content:
      'The spirit of prophecy descends upon those who have prepared themselves through righteousness, solitude, and meditation. Ruach haKodesh, theHoly Spirit, speaks not to control but to guide. The prophetic voice is the still, small voice of truth within.',
    meditation:
      'In deep silence, listen for the still small voice. Do not seek visions or voices in thunder. The truth speaks gently. Train yourself to hear what is whispered rather than what shouts.',
    practicalApplication:
      'Once daily, spend time in nature and silence. Listen before speaking. Note the difference between ego\'s voice and the voice of guidance.',
  },
  {
    id: 'writings-shadow-01',
    title: 'The Psalms as Shadow',
    description: 'Poetry that holds the light of divinity',
    origin: 'ketuvim',
    sephirah: null,
    theme: 'wisdom',
    content:
      'The Psalms are shadows cast by divine truth into human language. They do not contain the truth directly but point toward it, as shadows reveal the presence of a body. Sing them, weep them, live them — and truth will be found.',
    meditation:
      'Choose a psalm that resonates with your current state. Read it aloud, slowly, letting rhythm become meditation. Let the words become flesh in your mouth.',
    practicalApplication:
      'For a week, incorporate one psalm into your morning practice. Let the poetry open doors that prose cannot.',
  },
  {
    id: 'zohar-mystery-01',
    title: 'The Mystical Mirror',
    description: 'The Zohar as a mirror for hidden truths',
    origin: 'zohar',
    sephirah: null,
    theme: 'revelation',
    content:
      'The Zohar teaches that Scripture is a mirror. When you read, you see not only the words but your own reflection within them. Rabbis of old looked into the mirror and saw the mysteries of divine consciousness reflected in human form.',
    meditation:
      'As you read sacred text, pause to see yourself reflected in the words. Do not ask what the words mean. Ask: what am I in this mirror? What does this mirror require of me?',
    practicalApplication:
      'When studying sacred text, keep two journals: one for what the text teaches, one for how it mirrors your own life.',
  },
  {
    id: 'tradition-oral-01',
    title: 'The Living Tradition',
    description: 'Wisdom transmitted through lineage and relationship',
    origin: 'tradition',
    sephirah: null,
    theme: 'wisdom',
    content:
      'The living tradition cannot be transmitted through books alone. It flows from teacher to student through the relationship itself. The mouth that teaches and the ear that hears create a conduit. Seek teachers who embody what they teach.',
    meditation:
      'Bring to mind the teacher or elder who has influenced your path. Whether living or passed, they are still present as consciousness within yours. Gently invoke that lineage this day.',
    practicalApplication:
      'This week, reach out to a teacher or elder who has guided you. Not to ask questions, but simply to acknowledge their influence on your life.',
  },
  {
    id: 'din-vehesed-01',
    title: 'The Marriage of Judgment and Mercy',
    description: 'Balance through the union of opposites',
    origin: 'cabala',
    sephirah: null,
    theme: 'transformation',
    content:
      'Through the union of Din (judgment) and Chesed (mercy), all reality flows. Divine consciousness requires both — strictness that defines and kindness that extends. The son of Avraham must also carry the fire of Sinai. Neither pole alone can sustain creation.',
    meditation:
      'Hold both poles in your consciousness: the necessary limits that define you, and the unbounded love that created you. Breathe between them. Let them merge in the space of the heart.',
    practicalApplication:
      'Whenyou face someone who represents only judgment or only mercy, invoke its complement. Find the father of mercies and the mother of justice within yourself.',
  },
  {
    id: 'ascending-ladder-01',
    title: 'The Ladder of Ascent',
    description: 'The path of return through the sephirot',
    origin: 'cabala',
    sephirah: null,
    theme: 'transformation',
    content:
      'The soul ascends and descends through the sephirot as through spheres of consciousness. From Kingdom at the base to Crown at the summit, each sephirah is a rung. YHVH descends to build a dwelling place below; the soul ascends to reunite with the source. Both paths are the one path.',
    meditation:
      'Imagine a ladder of light extending from the earth to the crown of heaven. Stand on each rung in succession, beginning at the bottom. Feel how each step transforms the one before it.',
    practicalApplication:
      'Map one personal challenge to the sephiroth. Where does it originate? What sephirah guides its resolution? Let the Tree illuminate your path through difficulties.',
  },
  {
    id: 'shadow-light-01',
    title: 'The Shadow Side of Light',
    description: 'Integrating what is rejected',
    origin: 'cabala',
    sephirah: null,
    theme: 'transformation',
    content:
      'Every sephirah contains its opposite in klippah, its shell or shadow. The dark side is not evil but unintegrated aspect. To unite the broken vessels, one must reclaim what was cast into shadow. Face your klippot with compassion, not rejection.',
    meditation:
      'Identify one shadow pattern you disown. Bring compassion to that part of yourself. Do not integrate it; hold space for it. In holding space without judgment, integration happens naturally.',
    practicalApplication:
      'List three traits you disown in yourself. For each, write why this trait exists, what it once protected, how it served you. These are the klippot awaiting reclamation.',
  },
  {
    id: 'end-of-days-01',
    title: 'Time of Judgment',
    description: 'The cycles of cosmic judgment and renewal',
    origin: 'cabala',
    sephirah: null,
    theme: 'judgment',
    content:
      'The sephirot turn in cosmic cycles — Olam, Shanah, Nefesh, Ruach, Neshama. Each world, year, and soul has its hour of judgment. The end of days is not an endpoint but a return — time folding back into eternal now. Those who live in the present live beyond endings.',
    meditation:
      'Release the concept of linear time. In this moment, feel the eternal now. The past is memory, the future imagination. Only now exists. Rest in the present that contains all times.',
    practicalApplication:
      'This week, three times daily, pause and rest in present moment awareness. Notice how time expands and contracts. Feel the eternal now within the moment.',
  },
];

export function getProphecies(): Prophecy[] {
  return [...prophecies];
}

export function getProphecyById(id: string): Prophecy | undefined {
  return prophecies.find((p) => p.id === id);
}

export function getPropheciesByOrigin(origin: Prophecy['origin']): Prophecy[] {
  return prophecies.filter((p) => p.origin === origin);
}

export function getPropheciesBySephirah(sephirah: string): Prophecy[] {
  return prophecies.filter((p) => p.sephirah === sephirah);
}

export function getPropheciesByTheme(theme: Prophecy['theme']): Prophecy[] {
  return prophecies.filter((p) => p.theme === theme);
}

export function getSephirotList(): string[] {
  return ['Keter', 'Chokhmah', 'Binah', 'Chesed', 'Geburah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
}

export function getOriginsList(): Prophecy['origin'][] {
  return ['cabala', 'torah', 'neviim', 'ketuvim', 'zohar', 'tradition'];
}

export function getThemesList(): Prophecy['theme'][] {
  return ['wisdom', 'judgment', 'mercy', 'transformation', 'revelation', 'unity'];
}
