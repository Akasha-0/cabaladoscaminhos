/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier) */
/**
 * Tarot card interpretations for all 78 cards
 * Rich contextual interpretations for Major and Minor Arcana
 */

export interface CardInterpretation {
  name: string;
  arcana: "major" | "minor";
  suit?: string;
  number?: number;
  interpretation: {
    general: string;
    upright: string;
    reversed: string;
    love?: string;
    career?: string;
    health?: string;
    shadow?: string;
    advice?: string;
  };
}

// Major Arcana - 22 cards
const MAJOR_ARCANA: CardInterpretation[] = [
  {
    name: "The Fool",
    arcana: "major",
    interpretation: {
      general: "The Fool embodies pure potential and the spirit of adventure. This card represents the threshold moment before embarking on a new journey, complete with uncertainty, trust, and childli ke wonder. It speaks to the wild optimism that propels us into experiences we cannot fully predict.",
      upright: "A state of new beginnings filled with boundless possibilities. You stand at the edge of a great adventure, ready to leap with faith that the universe will catch you. Pure innocence and spontaneity guide your path. Trust in the process of life and embrace the unknown with an open heart. There is a beautiful recklessness here, the wisdom to know that sometimes you simply must begin.",
      reversed: "A warning against recklessness without wisdom. Fear of change may be holding you back, or conversely, you may be acting without proper consideration. Naivety that leaves you vulnerable to manipulation. There can be too much risk-taking without foundation. This is an invitation to examine what holds you back from truly taking the leap, or to recognize when recklessness masquerades as freedom.",
      love:
        "A new romantic possibility or the beginning of a relationship chapter. Approaches with childlike wonder but beware of naivety. Can indicate meeting someone who embodies fresh energy and openness.",
      career:
        "A new creative venture or career direction. Entrepreneurship, starting fresh, or taking a chance on an unconventional path. Your work is about to enter uncharted territory.",
      health:
        "A recovery period or fresh start to wellness. Embracing vitality through new approaches. Be mindful of neglecting precautionary measures.",
      shadow:
        "The trickster aspect: being used as a pawn by others. Avoiding responsibility under the guise of spontaneity. Running from commitment through false freedom.",
      advice:
        "Take the first step, but take it consciously. Have faith in your journey while remaining aware of your surroundings."
    }
  },
  {
    name: "The Magician",
    arcana: "major",
    interpretation: {
      general: "The Magician represents pure manifestation, the union of will and action that transforms possibilities into realities. All four elements align in one powerful figure: the wand (fire/will), cup (water/emotion), sword (air/thought), and pentacle (earth/material). This is not mere trickery but the mastery of fundamental forces.",
      upright: "You possess all the tools, resources, and skills needed to manifest your desires. The universe responds to your focused intention. This is a call to aligned action, to take decisive steps toward your goals with confidence. Your potential is unlimited because you understand how to direct your will effectively. What you focus on grows.",
      reversed: "Manipulation rather than manifestation. Skills present but misdirected or unused. Scattered energy that produces little. Poor planning or deception from those who claim to have power. The tools exist, but are they serving your highest purpose? A reminder to examine your motivations and ensure your actions align with authentic desire.",
      love:
        "An empowered relationship where both partners attract and manifest together. Sexual chemistry and creative connection. Alternatively, manipulation in relationships or partners who use each other.",
      career:
        "Personal power in the workplace. Manifestation of career goals, entrepreneurial success, and effective communication. Can indicate someone with significant influence or network.",
      health:
        "Full physical vitality. Transformation and energy healing. Misuse of substances or energy through dissipation.",
      shadow:
        "Using charm for manipulation rather than genuine connection. Holding back your true power out of fear or laziness. Playing games with others emotional states.",
      advice: "Narrow your focus. What do you truly want? Direct all your resources toward that singular, clear intention."
    }
  },
  {
    name: "The High Priestess",
    arcana: "major",
    interpretation: {
      general: "The High Priestess sits between two pillars representing duality, Law and Mercy, Light and Dark. She guards the threshold between conscious and unconscious, between what we know and what lies beneath. Her wisdom is not learned but remembered, arising from the deep well of intuition we all carry.",
      upright: "Trust your inner voice and the wisdom that speaks from silence. Secrets are surfacing or waiting to be revealed. Look beyond surface appearances; truth often hides beneath the obvious. This is a time for listening more than speaking, for allowing insights to emerge organically. Your intuitive senses are heightened.",
      reversed: "Hidden agendas functioning in your life, or your own. Withdrawal from truth or from others. A warning: trusting intuition is needed now more than ever. Secrets surfacing that may unsettle or heal. Something hidden is being uncovered. You need to reclaim your connection to your deeper knowing.",
      love:
        "A relationship with depth beyond the surface. Connection through intuition rather than logic. Potential soulmate or twin flame energy. Alternatively, a connection built on secrets or lies.",
      career:
        "Work that involves research, mystery, or uncovering hidden information. Healing arts, counseling, or intuitive career paths. Female leadership with wisdom orientation.",
      health:
        "Women health matters. Gynecological or hormonal wisdom. Psychosomatic symptoms where mind affects body. Dream revelation about health.",
      shadow:
        "Keeping secrets that fester. Manipulating through withholding information. Fears about what intuition reveals. Women in power who use information as currency.",
      advice:
        "Sit in stillness. The answers you seek already exist within you. Listen to your dreams, your gut feelings, your body wisdom."
    }
  },
  {
    name: "The Empress",
    arcana: "major",
    interpretation: {
      general: "The Empress radiates the generative force of nature itself, she is abundance made visible, creativity made tangible. Seated amidst plenty, she embodies the nurturing principle that transforms seed into forest. Her essence is receptivity in action, fertility in all its forms: creative, financial, familial, spiritual.",
      upright: "Creative energy and nurturing presence flourish in your life. A period of growth, prosperity, and natural beauty unfolds. This is a time to embrace your feminine, receptive nature, to allow rather than force, to grow rather than push. Abundance flows when you open to receiving it. Your creative expression carries multiplying effects.",
      reversed: "Creative blocks or creative expression blocked by dependence. Smothering energy, your own or from others. A void where nurturing should be. Sometimes indicates emptiness, isolation, or the need to reconnect with your creative source. The abundance is not absent, merely trapped.",
      love:
        "Fertile emotional connection. Romance, sexuality, pregnancy possibilities. Nurturing partnership or need for more nurturing in relationship. Earth mother or passionate woman energy.",
      career:
        "Creative profession or nurturing service career. Arts, cooking, gardening, teaching. Financial abundance when aligned with purpose. Career growth through creative channels.",
      health:
        "Feminine health. Pregnancy, fertility, or reproduction concerns. Nurturing body as sacred space. Can indicate productive health or need for more self-care.",
      shadow:
        "Smothering or overbearing patterns, yours or others. Mother issues or maternal wounds. Using nurturing as control. Dependency that masquerades as love.",
      advice:
        "Allow rather than force. What needs nurturing in your life? Open to receive the abundance the universe offers."
    }
  },
  {
    name: "The Emperor",
    arcana: "major",
    interpretation: {
      general: "The Emperor embodies structured authority, the masculine principle of order imposed upon chaos. Where the Empress generates, the Emperor organizes. His throne bears four rams, and his armor speaks to experience earned through battle. He represents the father archetype: discipline, stability, and the wisdom that comes from overcoming obstacles.",
      upright: "Authority, structure, and control provide foundation for success. It is time to take leadership of your circumstances, to establish firm boundaries, and to build lasting stability. This is not tyranny but mature governance, the discipline to follow through, the wisdom to plan, the strength to lead. Your foundations will support great weight.",
      reversed: "Domination over others or domination by external forces. Rigidity without wisdom, unable to bend when flexibility needed. Lack of discipline sabotaging your efforts. Tyranny in yourself or those in authority. Exhortation to examine where control serves and where it harms.",
      love:
        "Father figure energy or seeking structure in partnership. Authority dynamics may be playing out. Can indicate mature relationship or potentially controlling one. Commitment and stability offered or demanded.",
      advice:
        "Establish the structures that will support your growth. Set boundaries clearly. Where do you need more discipline, where do you need more flexibility?"
    }
  },
  {
    name: "The Hierophant",
    arcana: "major",
    interpretation: {
      general: "The Hierophant bridges the human and divine, the particular and universal. He represents the wisdom traditions, spiritual institutions, and the guidance offered by those who walked the path before us. His blessing grants access to ancient mysteries, the collective wisdom encoded in religion, philosophy, and cultural tradition.",
      upright: "Seek guidance from established wisdom traditions whether conventional or alternative. A time for learning, spiritual growth, and finding your rightful place within community structures. Conformity may serve or limit, discern carefully. This card often indicates formal education, religious participation, or spiritual mentorship.",
      reversed: "Personal belief systems diverge from institutional structures. Non-conformity and questioning traditional paths. Sometimes indicates the need to find your own spiritual way rather than following prescribed routes. Freedom from collective norms may be calling. Challenging institutions or being challenged by them.",
      love:
        "Traditional relationship values. Marriage, commitment, perhaps with societal/religious blessing. Can indicate conventional expectations versus personal truth. Spiritual connection in relationship.",
      career:
        "Formal education, religious organization, traditional institutions. Teaching, religious work, counseling. Compliance versus integrity with institutional expectations.",
      advice:
        "Seek guidance, but question whether you seek someone else truth or your own. The spiritual path belongs to each of us individually."
    }
  },
  {
    name: "The Lovers",
    arcana: "major",
    interpretation: {
      general: "The Lovers represents the great choice, not merely between partners but between paths, values, ways of being. Between the man and woman stands an angel, blesser of union while representing the higher principle that transcends mere attraction. This card embodies the alchemical union of opposites, the partnership that creates something neither could alone achieve.",
      upright: "A powerful connection aligned with your deepest values. Deep romantic love or a significant life decision requiring value alignment. Union, whether literal partnership or metaphorical integration of complementary aspects of self. Choosing love means choosing responsibility to another.",
      reversed: "Self-love, disharmony, imbalance. Misaligned values or relationship challenges. Difficult choices that require deep introspection. A choice between staying the same and growing.",
      love:
        "Soul connection, deep romantic union, alignment of values in love. Marriage or commitment. Can indicate major relationship decision, the choice to commit fully. Twin flame or karmic connection possible.",
      advice: "What values are at stake? Let your deepest truth guide this choice. The right answer creates harmony with who you really are."
    }
  },
  {
    name: "The Chariot",
    arcana: "major",
    interpretation: {
      general: "The Chariot carries the warrior forward through opposing forces, light and dark, fire and water, two sphinxes pulling in different directions. Victory belongs not to the strongest but to the one who harmonizes these tensions through focused will. This is the card of the controlled conquest, the directed charge toward triumph.",
      upright: "Victory through confidence and focus. Harness opposing forces and move them toward your goal. Your will and determination drive success. Competitive advantage or assertiveness leads to triumph. Move forward with conviction, the path ahead favors the bold.",
      reversed: "Self-discipline lacking, opposition overwhelming, lack of control. Aggression rather than directed force. Moving too fast or in wrong direction. A need to reassess direction and redirect will before proceeding, your engines are running hot.",
      career:
        "Competition won. Leadership victory. Assertive career moves. Ambition and determination yielding results. Can indicate business conflicts where focused will determines outcome.",
      advice:
        "Hold the reins steady. Opposing forces need reconciling, not fighting. Your winning ticket is integration and direction, not domination."
    }
  },
  {
    name: "Strength",
    arcana: "major",
    interpretation: {
      general: "Strength here is not the strength of the warrior but the strength of the healer, the power that arises from gentleness, from compassion, from the willingness to face the animal within. The lion beneath soft hands is tamed not through force but through understanding. This is the courage of the heart, not the sword.",
      upright: "Inner power and gentle strength overcome challenges. Show compassion and courage in the face of fear. True strength comes from tenderness, from the willingness to remain soft while the world pushes around you. You have the endurance to see this through with grace. Passion directed by patience becomes power.",
      reversed: "Inner strength questioned, self-doubt, feeling strength lacking. Weakness or letting impulses control you. A reminder that you possess more inner strength than you may recognize. Finding power through seeing weakness honestly, without self-deception.",
      advice:
        "Remember: you are stronger than you feel. Gentleness is not weakness, it is mastery over power itself."
    }
  },
  {
    name: "The Hermit",
    arcana: "major",
    interpretation: {
      general: "The Hermit has withdrawn from the marketplace, carrying only a lantern whose light reveals what daylight conceals. He is the Wise Old Man and Woman united, the archetype of introspection seeking deeper truths. In solitude beyond the reach of social performance, profound discoveries wait.",
      upright: "A period of introspection, soul-searching, and seeking deeper truths than the busy world provides. Dedicated time alone brings insight. The answers you seek have gone quiet on the outside, look within. Spiritually, this may indicate a retreat period, meditation practice deepening, or wisdom quest. Trust the journey inward.",
      reversed: "Isolation carried too far, loneliness, unproductive withdrawal. Too much solitude, cutting yourself off from needed human contact. The guidance you sought may be found in connection rather than seclusion. Finding light within rather than without.",
      advice:
        "Take the time for genuine introspection, but come back to share what you learned. Wisdom grows when it can be lived with others."
    }
  },
  {
    name: "Wheel of Fortune",
    arcana: "major",
    interpretation: {
      general: "The Wheel of Fortune turns eternally, carrying all things upward and downward through the great cycle. Fortune favorites rise, the unlucky fall, and both are surprised by the wheel endless and constant rotation. This is the card of change, fate, destiny, the recognition that forces beyond our control shape our experience.",
      upright: "A significant turning point approaches or has arrived. Good luck and positive change moving your direction. Embrace the cycles of life, both growth and decline, they are inseparable. The universe conspires in your favor with the wheel in your favor. Prepare for acceleration of events.",
      reversed: "Bad luck, resistance to change, inability to break established cycles. External forces may keep you stuck, not a judgment of worth but a call for action. A need to work with change rather than against it. The wheel turns for you too, prepare differently for what comes next.",
      career:
        "Career change incoming. Promotion, demotion, or entire career pivot possible. Business cycles and market changes. Fortune favors the bold, challenges the unprepared.",
      advice:
        "Align with change rather than resist it. The wheel turns for everyone. What phase of your life cycle are you in for good?"
    }
  },
  {
    name: "Justice",
    arcana: "major",
    interpretation: {
      general: "Justice holds the sword of truth steady, the scales perfectly balanced. This is not the chaos of fortune but the ordered realm of cause and effect, where actions are weighed and consequences emerge with mathematical precision. Karma is not punishment but teaching, the universe accounting system.",
      upright: "Truth and honesty prevail in your situation. Actions have consequences, exactly the consequences warranted. Fair decisions and karmic balance prevail. Legal matters may resolve fairly. The message: you receive what you have earned. This is accountability without cruelty, the scales are true.",
      reversed: "Unfairness, lack of accountability, dishonesty in self or others. Refusing to take responsibility, or being wrongly accused. A call for deeper truth, your own or others. Justice may be delayed, denied, or distorted. What truth have you avoided examining?",
      advice:
        "Act honestly, and accept honest consequences. What goes around comes around, the universe keeps accurate books. Proceed with clear conscience."
    }
  },
  {
    name: "The Hanged Man",
    arcana: "major",
    interpretation: {
      general: "The Hanged Man hangs from a living tree, his posture strangely peaceful, his viewpoint transformed by suspension. This is not martyrdom but voluntary surrender of the usual perspective. To see from a different angle requires letting go of familiar footing, the willingness to wait without struggling.",
      upright: "Voluntary pause to gain a new viewpoint. Willing sacrifice brings insight that action would deny. Let go of control, expectations, the need to force outcomes. You are precisely where you need to be. A situation answer will come from seeing differently, not from hurrying forward.",
      reversed: "Delays, resistance, stalling. Need to make a decision but feeling stuck. A suspended state while you avoid necessary action. Sometimes you are hanging when standing would serve better, what holds you in this position? Time to progress or retreat deliberately.",
      advice:
        "What would happen if you stopped struggling? When you stop forcing, truth reveals itself. Your willingness to wait is not weakness, it is wisdom."
    }
  },
  {
    name: "Death",
    arcana: "major",
    interpretation: {
      general: "Death in the Tarot is not literal but initiatory, the death that makes room for birth. The skeleton arrives to harvest what no longer serves, and rebirth cannot occur until the old form is released. This is transformation so profound it feels like ending. And in truth, it is.",
      upright: "Profound transformation and endings making way for new beginnings. Deep change is already in progress. What no longer serves you is being cleared, allow it to go. You cannot become who you are becoming while clinging to what you were. This death brings liberation, not loss.",
      reversed: "Resistance to necessary change, or fear of change. Personal transformation occurring internally even when outer circumstances have not shifted. Endings stall, or continue internal process longer than expected. A need to actively release rather than passively wait.",
      advice:
        "Let go of what no longer belongs to you. You cannot skip the death to reach the rebirth. Release, something essential for your growth is ready to be born."
    }
  },
  {
    name: "Temperance",
    arcana: "major",
    interpretation: {
      general: "Temperance pours between two cups, mixing not extremes but different waters into one harmonious blend. This is the alchemical virtue of balance, the art of finding moderation not in dulling passion but in directing it. Imbalance in any direction is the problem; the middle way is the solution.",
      upright: "Finding middle ground and balance between extremes. Moderate your actions and find peace through blending opposites with patience. A healing influence: mixing influences to create whole health. Long-term projects, therapy, rehabilitation. Long-term healing, reconciliation, blending opposites. Balance between past and future, giving and receiving.",
      reversed: "Imbalance, excess, need for self-healing. Extreme behavior or lack of moderation creates harm. Excessive investment in any area. A need to revisit and restore balance, where have one-sided extremes led? Recovery through finding the middle.",
      advice:
        "What extremes are you oscillating between? The answer is rarely in either direction but in developing the capacity to integrate both."
    }
  },
  {
    name: "The Devil",
    arcana: "major",
    interpretation: {
      general: "The Devil binds but does not imprison, he binds only those who choose his chains. This card speaks to shadow and shadow choices: the patterns that hold us to addiction, materialism, and the shadow side of sexuality. The chains break when we recognize they are chosen.",
      upright: "Bondage to addictive patterns or shadow influences holding you back. Face your shadows without flinching to be liberated. Material attachment, unhealthy attachment, sexual obsession, or exploitative relationship patterns. Shadow self in action: shame, secrecy, hiding from yourself.",
      reversed: "Releasing shame and recovering control, break free from chains. Re-evaluating your path as you begin seeing through illusions. A turning point where change becomes possible. Confronting what you hidden from yourself brings power.",
      shadow:
        "Sexual obsessions, pornography. Financial exploitation. Codependency and addiction. All forms of shadow binding without consciousness.",
      advice:
        "What binds you that you could release? Name the chain, recognizing a choice makes it possible to unmake it. Your chains are not inevitable."
    }
  },
  {
    name: "The Tower",
    arcana: "major",
    interpretation: {
      general: "The Tower strikes the struck moment, not a gradual crumble but a sudden revelation through destruction. Built on false foundations, the Tower was always destined to fall. The lightning that strikes reveals truth through catastrophe. This is not cruelty but the forced awakening that comfortable structures cannot provide.",
      upright: "Sudden revelation through disruption. Structures that cannot stand revealing themselves spontaneously. Breakthrough and awakening through breakdown. This is a necessary destruction, the Tower was built on lies and collapse is liberation. Exposing hidden falseness through events that feel catastrophic but serve liberation.",
      reversed: "Personal transformation through internal revolution. Averting disaster or internal change preceding outer. Fear of change or a natural, less traumatic dissolution. The truth emerges less violently. The warning: this change is coming anyway.",
      advice:
        "The Tower destruction is not destruction, it is the end of hiding from truth. What false structures fall away brings authentic foundation for growth."
    }
  },
  {
    name: "The Star",
    arcana: "major",
    interpretation: {
      general: "After the Tower lightning comes the Star healing waters. She pours what remains: her own essence, her hope, her renewed connection to meaning. This is the card of genuine hope, not naive optimism but the hard-won wisdom that darkness faced transforms to wisdom. She knows the abyss and remains luminous.",
      upright: "Genuine hope, faith, and inspiration fill you with possibility. Healing and renewal in progress. After struggle comes inspiration and guidance toward your purpose. Health, balance, serenity. A light for you and for others. Trust that what was broken is being remade into something better.",
      reversed: "Lack of faith, despair, difficulty trusting inspired guidance. Disconnection from hope or spiritual disconnection. Temporary feeling cut off from your inner light. A low period within what is actually a continued healing process.",
      advice:
        "What hope remains despite difficulty? Even small hope is sufficient to heal. Let yourself be nourished by what the Star offers."
    }
  },
  {
    name: "The Moon",
    arcana: "major",
    interpretation: {
      general: "The Moon illuminates through darkness, revealing what daylight keeps hidden. Under Moon light, all things cast doubled shadows, both true and illusory form. The path stretches into uncertainty, and things are not as they appear. Intuition clouds and reveals simultaneously. This is the landscape of the unconscious.",
      upright: "Hidden fears and unconscious anxieties surface. Intuition may be clouded, proceed carefully. Navigation through uncertainty is necessary. Things may not be what they seem. Dreams carry important messages but require interpretation. Do not trust first impressions.",
      reversed: "Release of fear, repressed emotions surfacing with growing clarity. Facing fears and finding inner clarity. Confusion lifting as conscious mind confronts shadow. Recovery from illusion toward seeing clearly. Hidden needs being recognized.",
      shadow: "Depression, anxiety, nightmares. Confusion. Seeing only what you wish to see. Unconscious material controlling behavior without your knowledge.",
      advice:
        "Trust your intuition but verify. Face the fears that surface during transition. What hides in moonlight eventually requires confrontation."
    }
  },
  {
    name: "The Sun",
    arcana: "major",
    interpretation: {
      general: "The Sun radiates pure positivity, warmth, vitality, success, joy. This is the light that follows long darkness, the vitality that connects us to life essential delight. Simple joy, uncomplicated success, authentic celebration are The Sun gifts. After the difficult cards, this brightness both heals and activates.",
      upright: "Radiant success and joy illuminate your path. Vitality, warmth, optimism, and a time of simple happiness. Achievement, creative recognition, and celebration. Energy abundant and clear. Everything works more smoothly. Positive outcomes favor you.",
      reversed: "Feeling down despite good circumstances. Too much positivity overshadowing reality. Inner child issues or temporary difficulty feeling the sun warmth. External setbacks temporary but not permanent. Difficulty accepting good fortune.",
      advice:
        "Let yourself shine. Joy is your inheritance, do not turn away from its gifts with suspicious guilt."
    }
  },
  {
    name: "Judgement",
    arcana: "major",
    interpretation: {
      general: "The angels trumpets announce Judgement, those who have fallen rise, awakened by the call to accountability. This is not condemnation but the honest reckoning that makes genuine rebirth possible. To judge yourself truly and be found worthy of transformation, this is the spiritual work this card invites.",
      upright: "A calling to your higher purpose and soul mission. Judgment comes with mercy, not punishment but opportunity. A spiritual awakening and answer to your calling. Major life cycle approaching closure and accountability. Someone or something calls you toward your true self.",
      reversed: "Self-doubt, harsh inner critic, ignoring your calling. Harsh self-judgment or unfair judgment from others. Difficulty hearing your inner voice through critical noise. What call have you missed? Answer comes from within rather than from external sources.",
      advice:
        "What inner voice calls you toward your path? What judgment is merciful rather than harsh? You are worthy of transformation you may not yet see."
    }
  },
  {
    name: "The World",
    arcana: "major",
    interpretation: {
      general: "The World completes the major arcan journey, the Fool has circled back after crossing all the cards territories and now merges with completion. She holds laurels where once was emptiness, mastery where once was naivety. The cycle ends to begin again at a new level. The serpent-scorpion-leo-luna motif reminds that complexity and completion are the same moment.",
      upright: "Completion, integration, and accomplishment of a major life cycle. The lessons have been learned, the mastery achieved. Success, fulfillment, inner peace. A major milestone reached where celebration belongs. The journey end is also a new threshold.",
      reversed: "Seeking personal closure, delays, shortcuts. Incomplete endings or lack of closure. The goal is not yet fully achieved, more work required. Where has completion been avoided or is being delayed? Integration incomplete.",
      advice:
        "Celebrate completion when it has genuinely arrived. What closure needs to be named and honored? You have completed the cycle worth celebrating."
    }
  }
];

// Minor Arcana - Wands (Fire/ Passion/ Creativity)
const WANDS: CardInterpretation[] = [
  {
    name: "Ace of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 1,
    interpretation: {
      general: "As a spark ignites fire, the Ace of Wands initiates creative force and new ventures. This wand conceals the seed of all fire creative potential, waiting only for expression to become real. The fire of inspiration, ambition, and enterprise that begins major movements.",
      upright: "A spark of creative energy and inspiration ignites. New ventures and opportunities emerging. Boundless potential and the beginning of something exciting. Take the first step, your creative power is ready to manifest.",
      reversed: "Delays, frustration, lack of motivation. Creative blocks or lost opportunities. A creative flame dimming or waiting to be reignited. What has killed your spark? This may be a temporary pause before launching.",
      love:
        "New romantic spark, creative passion in relationship, attraction at first sight energy. New relationship possibilities, or relationship passion reigniting.",
      career:
        "New project, entrepreneurial spark, new business ideas. Creative career opportunities, or creative block in work. Energy seeking expression.",
      advice: "Light the flame! Inspiration awaits action. Begin now."
    }
  },
  {
    name: "Two of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 2,
    interpretation: {
      general: "The figure surveys distant lands from his balcony, wand underfoot, as the future spreads beyond the known. Where chaos is not knowing what lies ahead, this card maps territory, the wisdom to plan, the courage to dream, and the discipline to commit.",
      upright: "Planning and contemplating future moves. A need to step out of your comfort zone to discover new possibilities. Decision time approaches. Adventure and expansion await your choice to explore further.",
      reversed:
        "Personal goals, inner alignment, fear of unknown. Lack of planning or being too fixed in your ways. Fear of leaving home base. Opportunity to explore new horizons is present but you may not be ready.",
      advice: "Where do you want to go? The future awaits those who dare to choose it."
    }
  },
  {
    name: "Three of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 3,
    interpretation: {
      general: "A merchant watches ships return with goods from trade. Having invested in the voyage, he views the horizon with growing confidence. This is the card of expansion, efforts beginning to show fruit, growth in commerce and reach.",
      upright: "Progress, expansion, and looking ahead to future good fortune. Your efforts are beginning to show fruit. Patience required for plans to manifest. International connections forming. Your patience yields harvest.",
      reversed:
        "Playing small, lack of forward planning, delays in receiving what is owed. Obstacles or delays to your progress. Re-evaluating your direction or your business partners reliability. Trouble on the horizon.",
      advice: "Watch the horizon! What you planted begins to show. Continue patiently, but monitor what changes in your forecasts."
    }
  },
  {
    name: "Four of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 4,
    interpretation: {
      general: "A celebration unfolds beneath crossed wands, wreaths of welcome for victory participants. This card marks milestone celebrations: weddings, housewarmings, graduations. Where community gathers to honor achievement, this is the card of belonging made visible.",
      upright: "Community harmony and joyful celebration. A significant event with community recognition, wedding, housewarming, family gathering. Success recognized and acknowledged by the group. Foundation established. This moment deserves honoring.",
      reversed:
        "Disconnection, lack of support, conflict within community. Unstable living situation or resistance to group harmony. Working through conflict rather than celebrating. Where have not you been welcomed?",
      advice: "Celebrate together! What accomplishment deserves community recognition? Build bridges by sharing joy."
    }
  },
  {
    name: "Five of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 5,
    interpretation: {
      general: "Five figures tussle with wands in playful conflict. Competition and diverse viewpoints create productive tension, the fire of disagreement sparking creativity. This is not war but productive spar, debate, competition, creative friction.",
      upright: "Conflict and competition bringing creative tension. Diversity of thought and viewpoint enriching outcomes. A battle of ideas or competing interests with multiple valid positions. Resolution requires navigating through productive disagreement.",
      reversed:
        "Avoiding conflict through respecting differences. Inner conflict finding peace within or finding resolution by stepping away. Winning over competition by changing strategy rather than fighting all battles.",
      advice: "Engage all perspectives fairly. Which conflicts serve creativity? Which drain energy?"
    }
  },
  {
    name: "Six of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 6,
    interpretation: {
      general: "A hero returns in triumph - the community acclaim accompanies him. Victory becomes public recognition, the successful venture receiving its triumph. This is the card of the victory lap, the recognition earned through effort.",
      upright: "Victory and public recognition. Success and recognition of achievements. Confidence and pride in your accomplishments. Whatever you have fought for, you have earned recognition. This is your moment.",
      reversed:
        "Failure, lack of recognition, fall from grace. Private success may be more meaningful than public recognition. Fall from position or reputation, or self-importance that precedes real fall. Reassessing what success means to you.",
      advice: "Accept well-earned recognition. Share success with those who helped achieve it."
    }
  },
  {
    name: "Seven of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 7,
    interpretation: {
      general: "The hero defends his position from six challengers below, holding ground despite opposition. Victory through defense, the card of perseverance when others would knock you down. Challenges test determination and reveal strength.",
      upright: "Standing your ground and defending your position. Challenges test your determination, and you have the strength to overcome. Maintained independence against outside pressure. You are right to hold your ground.",
      reversed:
        "Overwhelmed and exhausted from defense, giving up. Exhaustion from defending your position may have drained resources. Letting go may be valid wisdom. Finding different approach to your challenges.",
      advice: "Stand firm! Your position is defensible. Yet examine: am I defending principle or defending pride? Both may feel similar."
    }
  },
  {
    name: "Eight of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 8,
    interpretation: {
      general: "Eight wands fly swift through air, energy in rapid transit. This is the card of action and swift events, fast development, quick decisions, travel soon to happen. Things move quickly when the moment is right.",
      upright: "Rapid progress and andswift action. Things moving quickly and smoothly. Travel or communication flowing effortlessly. Your momentum accelerates. Prepare for the news that changes everything.",
      reversed: "Delays, frustration, waiting for news. Friction or slow progress where swiftness is expected. Unexpected obstacles creating delays. Something stalling what should flow easily.",
      advice: "Move quickly while energy supports it. What needs speed? What delays need investigation?"
    }
  },
  {
    name: "Nine of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 9,
    interpretation: {
      general: "The warrior stands wounded but holding ground, having fought long and hard. Eight wands behind represent battles past; the ninth stands ready to fight one more. This is resilience, the courage to continue despite wounds accumulated.",
      upright: "Courage, determination and persistence in the face of difficulty. You have been through challenges and can handle more. Resilience earned through hard experience. One last stand remains, and you have reserves.",
      reversed:
        "Exhaustion, paranoia, feeling nearly defeated. Exhaustion from sustained effort or paranoia coloring perceptions after trauma. Victim mentality or nearing breaking point. Rest, if not whole, paused.",
      advice: "Hold the line! One more effort may yield final victory. Yet also: have I earned rest? Honor both truths."
    }
  },
  {
    name: "Ten of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 10,
    interpretation: {
      general: "The figure carries ten wands heavy, back bowed, struggling under weight meant for one. Success requires help, this burden is too heavy alone. The card speaks to the weight of responsibility, the cost of carrying alone what could be shared.",
      upright: "Heavy burdens and responsibilities weighing you down. Carrying the load alone when help is available. Work hard to achieve goals, but at what cost? The burden may be necessary but may also be shared.",
      reversed:
        "Doing it all, difficulty delegating, release of burden. Trying to do everything yourself when others could help. Learning to share responsibilities or let some burdens fall. Burnout requires rest and release.",
      advice: "Who could help carry this? Am I carrying burdens that others could share, or should carry alone to develop strength?"
    }
  },
  {
    name: "Page of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 11,
    interpretation: {
      general: "A young messenger of passion and enthusiasm carries a wand like a torch, excitedly exploring possibilities and seeking what inspires. He embodies exploration, discovery, and the fresh perspective curiosity brings.",
      upright: "Messenger of passion and inspiration. New creative ventures or adventures waiting. Enthusiasm and curiosity spark new discoveries. Openness to exploring the unknown.",
      reversed:
        "Newly found passion, delays, distracted wandering, lack of direction. Creative blocks or second-guessing energy. Wandering from the path or lost in distraction.",
      advice: "Follow enthusiasm! What makes you excited? The Page says explore now, develop later."
    }
  },
  {
    name: "Knight of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 12,
    interpretation: {
      general: "The Knight charges with energy and passion, ready for adventure, sometimes rashly. He embodies fiery ambition, passion in action, quick decisions. Where he goes, things happen, but sometimes too fast.",
      upright: "Passionate energy and ambitious action. Bold move toward goals with enthusiastic spirit. Spontaneous and ready for adventure. Charging ahead, this is the moment.",
      reversed:
        "Anger, impulsive actions, reckless haste. Rushing into situations without proper thought. Passion without direction may create wreckage. Delays or finding an a more grounded approach may serve.",
      advice: "Act boldly now, but check direction. Rapid movement in wrong direction costs more than standing still."
    }
  },
  {
    name: "Queen of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 13,
    interpretation: {
      general: "The Queen of Wands embodies courage, independence, and warm confidence on her throne decorated with lions, symbolically representing that she has conquered her fears. She is bold but not aggressive, warmth and confidence in one fierce package.",
      upright: "Bold and confident energy with warmth and encouragement. Leadership with compassion and determination. Self-assured with generous spirit. The Queen says: your fire illuminates others.",
      reversed:
        "Selfishness, jealousy, demanding energy. Harsh or self-centered approach. Insecurity or seeking external validation. Going inward now to recover authentic fire.",
      advice: "Lead with both fire and heart. Where has confidence grown cold, where has warmth needed bounds?"
    }
  },
  {
    name: "King of Wands",
    arcana: "minor",
    suit: "Wands",
    number: 14,
    interpretation: {
      general: "The King of Wands commands with vision, boldness, and mature control. He represents mastery of enterprise, entrepreneurship, and inspiring leadership. His maturity balances fire passion with wisdom.",
      upright: "Natural born leader with visionary spirit. Entrepreneurial success and bold leadership. Charismatic, inspiring others toward exciting goals. The King has built something lasting.",
      reversed:
        "Impulsiveness, haste, ruthless behavior. Domination or demanding behavior. Unrealistic goals or mismanagement. Abuse of power in leadership. Recovery requires grounding.",
      advice: "Lead boldly while remaining fair. Power balanced with wisdom serves all; power without wisdom destroys."
    }
  }
];

// Minor Arcana - Cups (Water/ Emotions/ Relationships)
const CUPS: CardInterpretation[] = [
  {
    name: "Ace of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 1,
    interpretation: {
      general: "From a cup overflows water in abundance, this is new emotional beginnings, an overflow of love and compassion. The heart opens, the vessel fills, and the world seems full of potential for connection.",
      upright: "New emotional fulfillment and spiritual awakening. Overflowing compassion and loving connection. An open heart ready to give and receive. New capacity for love, empathy, and joy arising.",
      reversed:
        "Self-love, suppressed feelings, emotional emptiness. Inability to feel or unprocessed emotions. Recovery through letting suppressed emotions move. An overflow dam reveals what has been contained.",
      love:
        "New love opening, possibilities for deep connection. Emotional awakening in relationship, or heart waiting to open.",
      advice: "Let your heart overflow. Open to receiving what you freely give."
    }
  },
  {
    name: "Two of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 2,
    interpretation: {
      general: "Two figures join cups in mutual dedication, this is connection, partnership, mutual attraction. The yab-yum of relationship, the dancing of equals. Union of complementary emotional life forces.",
      upright: "Partnership and mutual attraction. A meaningful connection or romantic union. Harmony and shared values in relationship. Balance and mutual support between equals.",
      reversed:
        "Imbalanced relationship, breaking connection, incompatibility. Power struggles or one-sided emotional investment. Breaking away from unhealthy relationships. Where connection blocks rather than enhances?",
      advice: "What would balanced connection look like? Am I holding or being held?"
    }
  },
  {
    name: "Three of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 3,
    interpretation: {
      general: "Three women celebrate together, their cups raised in shared joy. This is the card of friendship, community, creative collaboration, and gatherings that renew spirits. The joy multiplied by sharing.",
      upright: "Joyful celebrations with friends and creative community. Social gatherings and happy times. Creative collaboration between multiple collaborators. Celebrating together what none could achieve alone.",
      reversed:
        "Overindulgence, social complications, gossip. Too much partying or pulled into drama. Third party interfering with relationships. Social isolation or overexposure.",
      advice: "Celebrate your community! Which gatherings feed your spirit? Which drain it?"
    }
  },
  {
    name: "Four of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 4,
    interpretation: {
      general: "A figure sits meditating before three cups, unaware of a fourth delivered. Contentment available but unrecognized. Dissatisfaction and withdrawn contemplation mark this card, the danger of overlooking what is already present.",
      upright: "Dissatisfaction and withdrawn contemplation. Reevaluating what truly matters. Discontent or feeling disconnected from existing opportunities. The cup you seek is already present.",
      reversed:
        "Sudden awareness, choosing happiness, acceptance. Coming out of apathy and noticing gifts around you. Acceptance and gratitude emerging where before there was dissatisfaction.",
      advice: "What gifts might you be overlooking? Is happiness available that you do not see? Turn toward opportunity, not away."
    }
  },
  {
    name: "Five of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 5,
    interpretation: {
      general: "The cloaked figure mourns three spilled cups while two remain standing ignored. Grief and focus on loss, this card marks the pain of regret, but also the two cups still available. Loss does not empty the cup entirely.",
      upright: "Deep regret and painful loss. Disappointment, grief, and focusing on what has been missed. The path forward requires leaving the past to attend to what remains.",
      reversed:
        "Acceptance, moving on, finding peace. Recovery from loss or finding new meaning. Regret transforming into acceptance. Hope emerging from apparent emptiness.",
      advice: "What can be saved from loss? Where has grief kept you from seeing remaining blessings?"
    }
  },
  {
    name: "Six of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 6,
    interpretation: {
      general: "Two figures share cups from a shared past, a child offering flower. This is the card of memory, nostalgia, and innocence returning. Sweet memory, perhaps dangerously idealized. What the past remembers.",
      upright: "Happy memories, nostalgic feelings, innocence and joy. Family connections and reconnecting with origins. Child within wanting acknowledgment. Sweet reunion energy.",
      reversed:
        "Stuck in the past, overly idealistic. Idealizing past or unable to move forward. Breaking free from idealized memory to live present fully. Where nostalgia harms rather than heals.",
      advice: "Recall what the past offers, then return to present to give memory its proper place."
    }
  },
  {
    name: "Seven of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 7,
    interpretation: {
      general: "Seven cups float before a figure, each containing different dreams, fantasies, desires. This is the card of many choices, temptation, and wishful thinking that can obscure reality. Which illusion will become real?",
      upright: "Temptation and many choices. Daydreaming, fantasy, illusion. Discernment needed to separate reality from illusion. What should seem appealing may mask deeper confusion.",
      reversed:
        "Alignment of values, clarified priorities. Gaining clarity on what truly desired. Taking a practical and realistic approach to fantasies. Clarity after confusion, no longer lost in dreams.",
      advice: "What do I truly want? Which fantasies serve growth, which escape reality? Discern now."
    }
  },
  {
    name: "Eight of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 8,
    interpretation: {
      general: "A figure walks away from eight cups, leaving what no longer fulfills. This is the card of walking away from disappointment, of leaving behind, and of deeper journeying in pursuit of truth.",
      upright: "Walking away from what no longer serves you. Moving on from disappointments, disillusionment. A journey inward to find deeper meaning. Sometimes you have to leave to discover what you truly seek.",
      reversed:
        "Fear of change, fighting the current, aimless wandering. Refusing necessary change or unable to let go. Sleepless emotional processing. A delay in moving on, not necessarily wrong, just time needed.",
      advice: "What needs leaving behind? Is departure wisdom or avoidance?"
    }
  },
  {
    name: "Nine of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 9,
    interpretation: {
      general: "A satisfied figure stands before nine cups arranged in bounty, satisfied desires displayed. The wish card, joyful fulfillment, contentment, and the satisfaction of heart desires granted.",
      upright: "Emotional fulfillment and wishes fulfilled. Contentment, gratitude, and emotional accomplishment. A wish granted or emotional fulfillment achieved. Enjoying the rewards of journey past.",
      reversed:
        "Inner happiness despite external dissatisfaction. Greed, longing for more, or struggle with gratitude. What seems missing is actually present, misalignment of perception.",
      advice: "Feel contentment fully. Am I present to existing fulfillment, or always reaching for the next cup?"
    }
  },
  {
    name: "Ten of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 10,
    interpretation: {
      general: "Two adults and children celebrate under a rainbow connecting ten cups, this is the card of familial happiness, emotional fulfillment in the home. Domestic bliss achieved.",
      upright: "Emotional fulfillment, domestic happiness, family harmony. Shared joy and perfect alignment within family unit. Dreams realized, lasting happiness in relationships. Home bliss is yours.",
      reversed:
        "Disharmony, fractured family, broken dreams. Family conflicts or unrealistic family expectations. Finding harmony in imperfect family configurations. Where the cup overflows despite cracks.",
      advice: "What family harmony exists worth celebrating? What alignment may need addressing?"
    }
  },
  {
    name: "Page of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 11,
    interpretation: {
      general: "The creative, intuitive messenger with cup raised, the Page of Cups embodies curiosity about emotional depth, imagination, and creative possibilities.",
      upright: "Creative opportunity, intuitive message, curiosity, exploration. New emotional or creative experiences and opportunities. Curiosity and wonder leading to discovery.",
      reversed:
        "Inner child healing, emotional insecurity, creative blocks. Inability to trust intuitive messages. Emotionally immature reactions or blocks.",
      advice: "Trust your intuitions. What creative or emotional curiosity calls you forward?"
    }
  },
  {
    name: "Knight of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 12,
    interpretation: {
      general: "The Knight of Cups rides, heart leading, seeking romance, imagination, following the heart in pursuit of dreams. Idealism in action, romantic questing.",
      upright: "A romantic idealist and dreamer. Following your heart with charm and grace. Artistic pursuits and romantic adventures. Move toward what emotionally attracts.",
      reversed:
        "Moodiness, impractical romanticism, jealousy. Being swept by emotions into impractical decisions. Steadying romantic passion with practical attention serves.",
      advice: "Follow your heart, but check whether emotion or fantasy leads. Romance yes; delusion no."
    }
  },
  {
    name: "Queen of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 13,
    interpretation: {
      general: "The Queen of Cups sits with cup on water, throne on water, this is the most intuitive of the suits, compassion and emotional wisdom embodied in one.",
      upright: "Deep compassion and emotional wisdom. Intuitive and nurturing energy, creating safe emotional spaces for others. Gentle wisdom is your gift.",
      reversed:
        "Inner feelings submerged or overwhelmed. Neglecting own emotional needs while giving to others. Emotional insecurity hiding behind compassion. Self-compassion now required.",
      advice: "Offer compassion to yourself as you offer to others. What emotional wisdom do your own depths teach?"
    }
  },
  {
    name: "King of Cups",
    arcana: "minor",
    suit: "Cups",
    number: 14,
    interpretation: {
      general: "The King of Cups sits balanced on water, crown floating above, this is mastery of emotion and diplomacy, emotional maturity, and balanced compassion in action.",
      upright: "Mastery of emotion, balanced leadership. Diplomatic and compassionate approach. Emotional maturity and wisdom. Leadership through emotional intelligence.",
      reversed:
        "Self-compassion needs attention, emotional manipulation or volatility. Inner moodiness governing actions. Restoring balance between heart and mind, compassion cannot become manipulation.",
      advice: "Lead with emotional wisdom. Balance heart-intelligence with appropriate boundaries."
    }
  }
];

// Minor Arcana - Swords (Air/ Intellect/ Conflict)
const SWORDS: CardInterpretation[] = [
  {
    name: "Ace of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 1,
    interpretation: {
      general: "A sword rises from a crowned hand, the intellectual power rising to truth. This is breakthrough energy, new clarity cutting through confusion, the moment of insight arriving like lightning.",
      upright: "Breakthrough, new clarity, truth emerging sharply. New mental clarity cutting through confusion. A breakthrough moment bringing truth and clarity. Move forward with clear mind.",
      reversed:
        "Inner clarity emerging despite outer confusion. Use of mental power for manipulative ends. Mental blocks or overuse of intellectual force. Finding clarity within despite chaos.",
      advice: "Seek truth, speak it clearly. How can clarity serve this situation?"
    }
  },
  {
    name: "Two of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 2,
    interpretation: {
      general: "A figure sits blindfolded with two swords, a deadlock, stalemate, difficult choice frozen. This is indecision, blocked emotions, the paralysis of forces equally matched.",
      upright: "Difficult choice, indecision, stalemate. Holding back from necessary decision. Fear of making mistake, or feeling paralyzed between options. Trust your intuition to guide you.",
      reversed:
        "Indecision breaking, new information arriving. Confusion dissolving. A decision forced by circumstances. Information overload ending as clarity arrives.",
      advice: "Stop balancing and choose. What does your heart tell you? The block dissolves when you decide."
    }
  },
  {
    name: "Three of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 3,
    interpretation: {
      general: "Three swords pierce a heart, this is heartbreak, pain, and sorrow. The grief card, it marks emotional hurt that must be experienced through to healing. There is no shortcut through this grief.",
      upright: "Heartbreak, emotional pain, grief. Loss or betrayal causing deep hurt. A painful truth requiring confrontation to heal. This pain passes through you for completion.",
      reversed:
        "Negative self-talk, releasing pain slowly, optimism emerging. Recovery from emotional pain. Finding hope in grief darkness. Healing begun from heartbreak.",
      advice: "Let the painful emotion flow. What must be felt can then be healed."
    }
  },
  {
    name: "Four of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 4,
    interpretation: {
      general: "A figure lies recumbent in a temple, the pause card, rest, and withdrawal. The need to pull back from battle to restore depleted resources. Not permanent retreat but recuperation.",
      upright: "Rest and recovery needed. A time of withdrawal from action to restore resources. Contemplation before return. Restoration through withdrawal, this is healing not hiding.",
      reversed:
        "Exhaustion, burnout, inadequate rest. Unable to rest despite knowing need. Deeper restoration needed than mere sleep provides. Rest or breakdown approach.",
      advice: "Retreat to restore. What depletion requires recovery? You cannot pour from empty cup."
    }
  },
  {
    name: "Five of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 5,
    interpretation: {
      general: "Two defeated figures retreat while one revels in hollow victory, the pyrrhic win, the defeat disguised as triumph. Cleverness that overreaches, win-at-costs dynamic.",
      upright: "Conflict, defeat, winning at costs. A hollow victory that damages relationships. Betrayal and burned bridges. Worth examining: did you win or merely conquer?",
      reversed:
        "Reconciliation, moving past conflict. Letting go of need to win. Making peace with self about perceived defeat. Finding peace through forgiveness.",
      advice: "What victory costs more than it yields? Sometimes the greatest win is yielding."
    }
  },
  {
    name: "Six of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 6,
    interpretation: {
      general: "A ferryman carries passengers across troubled waters to calmer shores, the transit card, transition, passage through difficulty toward smoother waters.",
      upright: "Transition and passage through difficulty. Leaving difficulties behind with intention. Recovery from trauma and movement toward stability. Progress emerging.",
      reversed:
        "Personal transition stalled, unfinished business. Stuck in transition or refusing necessary change. A difficult passage not yet complete. Resistance to the necessary journey.",
      advice: "Keep traveling toward calmer waters. The passage through difficulty serves you."
    }
  },
  {
    name: "Seven of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 7,
    interpretation: {
      general: "A figure steals away with swords, attempting secret action, the stealth card, deception, strategic behavior. This is not caught, but might be.",
      upright: "Deception, questionable actions, strategy. Stealth approach or secrets kept. What is hidden may be about to be revealed. Examine your motivations with honesty.",
      reversed:
        "Imposter syndrome, self-deception, truth revealed. Coming clean or being discovered in deception. Confronting your truth.",
      advice: "What hidden agenda is playing out? Honesty now saves pain later."
    }
  },
  {
    name: "Eight of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 8,
    interpretation: {
      general: "A figure bound and blindfolded among eight swords, this is self-imprisonment, feeling trapped. The prison exists though no bars are visible. The binding is self-created.",
      upright: "Feeling trapped, self-imprisonment, helplessness. Self-imposed restrictions feeling absolute. A situation where you create your own prison. Recognition of the nature of restriction grants freedom.",
      reversed:
        "Self-acceptance, new perspective, liberation. Breaking free from self-imposed restrictions. A new way of seeing yourself and your situation. Freedom comes from within.",
      advice: "What binds you? If the prison is self-created, freedom comes from within. What limit is actually a choice?"
    }
  },
  {
    name: "Nine of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 9,
    interpretation: {
      general: "A figure sits awake in nightmarish anxiety, nine swords surrounding, the anxiety card, deep worry, fear striking at night. The catastrophizing mind creates prison of thought.",
      upright: "Anxiety, worry, deep fears, nightmares. Overwhelming mental anguish. Sleepless nights spent in fear. This may feel unbearable but is survivable. Reach for help.",
      reversed:
        "Inner turmoil, deep-seated issues releasing. Facing fears and finding hope in darkness. Recovery from anxiety with support. Healing from trauma underway.",
      advice: "What catastrophic thoughts dominate? Support, professional if needed, is required now. This passes."
    }
  },
  {
    name: "Ten of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 10,
    interpretation: {
      general: "The fallen figure, ten swords in back, reaches toward dawn, a total ending, rock bottom. But dawn is rising, for at rock bottom there is only up. This is the bottom card.",
      upright: "Painful complete ending. Total defeat, betrayal, rock bottom. So complete an ending that only rebirth remains possible. Accept the ending to allow new beginning.",
      reversed:
        "Recovery, regeneration starting. Finding strength in adversity. An ending that reveals new beginning waiting. Recovery incomplete but begun.",
      advice: "Accept this complete ending as necessary liberation. The bottom has no direction but up."
    }
  },
  {
    name: "Page of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 11,
    interpretation: {
      general: "The eager messenger stands holding sword, truth and new ideas seeking expression. This is curiosity, desire for knowledge, mental energy in motion.",
      upright: "An eager messenger bringing new ideas, truth, curiosity. A thirst for knowledge. Fresh perspectives seek voice. Speak your truth with youthful energy.",
      reversed:
        "Self-expression blocked, scattered thoughts. Word without action, scattered energy. Inner truth waiting for more deliberate expression.",
      advice: "Speak clearly what you know. What truth needs voice? Truth with kindness."
    }
  },
  {
    name: "Knight of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 12,
    interpretation: {
      general: "The knight charges, sword raised, ambition, drive, fast decisive action. This is action without excessive thought, ambition racing ahead. Noble goal but may go too fast.",
      upright: "Ambitious and action-oriented pursuit. Fast thinker ready to act decisively. Determination driving toward goals, perhaps too hasty. Strike while iron is hot.",
      reversed:
        "Restlessness, impatience, haste causing harm. Aggressive, burning bridges. Reckless haste where consideration serves better. Reassess direction after rushing.",
      advice: "Bold action serves now. But did I think fast, or only think I thought? Check progress."
    }
  },
  {
    name: "Queen of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 13,
    interpretation: {
      general: "The sharp queen sits with sword and cloud, clear perception and independence. Not cold but compassionate and direct. Honesty without cruelty, wisdom requiring clarity.",
      upright: "Sharp perception, clear thinking, independent directness. Compassionate honesty, forthright communication. Clear boundaries and honest assessments. Wisdom requires honesty.",
      reversed:
        "Overly emotional, cold-hearted, bitingly harsh. Harsh judgments or cutting remarks. Over-critical thinking that loses compassion. Bitter, isolating yourself or others.",
      advice: "Speak truth with compassion. Sharpness serves wisdom, does it serve kindness too?"
    }
  },
  {
    name: "King of Swords",
    arcana: "minor",
    suit: "Swords",
    number: 14,
    interpretation: {
      general: "The king commands truth and authority, seated throne between truth and ethics. This is mastery of intellect, authority through truth, and ethical power.",
      upright: "Intellectual mastery and authority through truth. Clear thinking, decisive action. Intellectual power serving ethical purpose. Truth at the throne.",
      reversed:
        "Inner truth gaining priority over imposed authority. Abuse of power, manipulation. Seeking truth through self-reflection rather than receiving it from authority.",
      advice: "Use power wisely. Truth speaks for itself, force is not required."
    }
  }
];

// Minor Arcana - Pentacles (Earth/ Material/ Practical)
const PENTACLES: CardInterpretation[] = [
  {
    name: "Ace of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 1,
    interpretation: {
      general: "A hand extends from cloud offering pentacle, this new material beginning, seed of prosperity. Seeds planted from which prosperity grows. New financial or career opportunity.",
      upright: "New financial or career opportunity. Seeds of prosperity being planted. Material new beginning with great potential. Plant this seed.",
      reversed:
        "Lost opportunity, missed chance, poor financial planning. Missed opportunities or poor execution. Reframe financial opportunities, where abundance hides.",
      career:
        "New job, investment, financial opportunity. Seeds of prosperity in work, career or business starting.",
      advice: "What material opportunity awaits my action? Plant wisely."
    }
  },
  {
    name: "Two of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 2,
    interpretation: {
      general: "A figure balances two pentacles in dance motion, the juggling card, multiple priorities requiring balance. Flexibility, adaptability, and keeping things in perspective.",
      upright: "Multiple priorities requiring balance. Adaptability, flexibility, time management required. Keeping everything in motion through conscious balance. The juggler knows their art.",
      reversed:
        "Over-committed, overwhelmed, reorganization needed. Dropping balls or taking on too much. Finding balance through letting go.",
      advice: "What balls can I drop? What balance serves better than perfect juggling?"
    }
  },
  {
    name: "Three of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 3,
    interpretation: {
      general: "Workers collaborate on a structure, the teamwork card, collaboration, learning, implementation. Mastery through collaboration, working with specialists.",
      upright: "Teamwork and collaboration leading to success. Learning, mastery developing, working together. Group effort yields fruits.",
      reversed:
        "Disharmony, misalignment, working alone. Lack of teamwork or undervalued contributions. Working independently while seeking collaborators.",
      advice: "What collaboration serves my work? Who could help this project progress better?"
    }
  },
  {
    name: "Four of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 4,
    interpretation: {
      general: "A tight figure holds tight pentacles, the conserving card, security, control, sometimes greed. Holding fast and protective versus holding too tightly.",
      upright: "Security, conservation, control, stability. Careful financial management, holding on to resources. Security through careful preservation.",
      reversed: "Letting go, generosity, releasing control. Sharing wealth and learning to let flow. Abundance through sharing, not hoarding.",
      advice: "What do I hold tightly that needs releasing? What abundance awaits when I let go?"
    }
  },
  {
    name: "Five of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 5,
    interpretation: {
      general: "Two figures pass a poor light window, the poverty card, financial hardship, isolation. Yet the figures inside light remains, help available despite appearing absent.",
      upright: "Financial difficulty, isolation, worry about basic needs. Feeling excluded or struggling alone. Worrying about essentials.",
      reversed:
        "Recovery from loss, spiritual aid, difficult times passing. Finding help through hardship. Recovery emerging from difficulty.",
      advice: "Where might help be available I have not seen? What light do I need to find?"
    }
  },
  {
    name: "Six of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 6,
    interpretation: {
      general: "One figure gives coins to two others, the giving-receiving card, generosity, charity. Balance in exchange, what flows out must flow in.",
      upright: "Sharing wealth, generous giving, balance in giving and receiving. Charity and helping those in need. Exchange flowing both ways.",
      reversed:
        "Debt, giving with strings attached. Borrowed or owed. Unequal exchanges and conditional generosity. What flows back when you give?",
      advice: "What generosity serves an imbalance? How might open-handed approach help both sides?"
    }
  },
  {
    name: "Seven of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 7,
    interpretation: {
      general: "A weary figure leans on tools before invested garden, the patience card, long-term investment, delayed rewards. Effort placed, harvest pending.",
      upright: "Patience, long-term investment, perseverance. Working with delayed gratification. Pause to reassess efforts toward goals. Your patience yields fruit.",
      reversed:
        "Impatience, frustration, lack of long-term vision. Feeling that effort wasted. Reassessing where to invest, change direction or keep tending?",
      advice: "What long-term investment is worth continuing? Has patience become stagnation or wise waiting?"
    }
  },
  {
    name: "Eight of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 8,
    interpretation: {
      general: "A worker bends in dedicated effort on pentacles, the apprenticeship card, skill-building, dedication to mastery. Quality through devoted repetition.",
      upright: "Dedicated effort, mastery developing, apprenticeship. Quality craftsmanship and attention to growing detail. Learning and refining skills over time with patience.",
      reversed:
        "Self-development, perfectionism, rushed work. Rushing through or lacking dedication. Skills develops through self-study and self-motivation.",
      career: "Development of expertise, professional growth. Building skills deliberately.",
      advice: "What skill deserves devoted attention? What mastery serves me long-term?"
    }
  },
  {
    name: "Nine of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 9,
    interpretation: {
      general: "A women stands among abundant pentacles, a trained bird nearby, the material comfort card, self-sufficiency, luxury earned through effort. Abundance through self-reliance.",
      upright: "Abundance, luxury, self-sufficiency, financial independence. Rewards of hard work enjoyed. Comfort earned through your own efforts.",
      reversed:
        "Over-indulgence, dependence, living beyond means. Excessive spending, superficial values. Enjoyment with excess and learning to appreciate sufficiency.",
      advice: "What abundance do I enjoy? What abundance do I need, versus crave?"
    }
  },
  {
    name: "Ten of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 10,
    interpretation: {
      general: "Three generations share in wealth within, legacy card, family prosperity, generational success. Wealth and stability built over generations.",
      upright: "Family wealth, lasting success, legacy, generational prosperity. Stability and foundation built over time. Family system stability. Your legacy begins.",
      reversed:
        "Family conflict, financial failure, instability in family structures. Inheritance disputes or family dysfunction. Stability through non-traditional paths.",
      advice: "What legacy is being built? How are my financial choices part of larger family story?"
    }
  },
  {
    name: "Page of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 11,
    interpretation: {
      general: "A page studies pentacle with serious interest, the diligent student, manifestation, practical possibilities, developing skills and stability.",
      upright: "Diligent student of practical matters. Financial opportunities, material possibility. Developing skills and creating stable foundation. Apprentice becoming capable.",
      reversed:
        "Lack of progress, procrastination, lack of direction. Failing to commit, lacking ambition. Finding direction for practical dreams.",
      advice: "What practical skill deserves development? What dreams need practical tending first?"
    }
  },
  {
    name: "Knight of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 12,
    interpretation: {
      general: "A knight rides steady through progress conservative, slow but reliable, the steady worker, efficiency, routine, reliable approach.",
      upright: "Hard work, steady progress, reliable approach. Practical reliability and following through with patience. Your solid effort will deliver.",
      reversed:
        "Boredom, stagnation, perfectionism draining energy. Lethargy or resistance to change. Finding motivation for needed changes.",
      advice: "How can steady effort be supported? When does reliability become resistance to growth?"
    }
  },
  {
    name: "Queen of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 13,
    interpretation: {
      general: "A queen nurtures on practical throne, practical nurturing, material security, abundance created through care. Nurturing through earth-energy.",
      upright: "Nurturing abundance, practical security. Creating comfortable and stable environments. Supportive with practical and generous resources.",
      reversed:
        "Self-neglect, work-home imbalance, insecure finances. Neglecting home or overworking. Balance between nurturance and practical matter.",
      advice: "What needs stable nurturing? Where must I provide care for practical foundations to grow?"
    }
  },
  {
    name: "King of Pentacles",
    arcana: "minor",
    suit: "Pentacles",
    number: 14,
    interpretation: {
      general: "A king sits upon material throne, material mastery, discipline, wealth. Success through earthly mastery and responsible management.",
      upright: "Mastery of material world and wealth. Disciplined, practical approach to success. Security through wise resource management.",
      reversed: "Financial management difficulties, greed, greediness. Material obsession or exploitation of resources. Use resources responsibly.",
      advice: "What material foundation am I building? How might disciplined approach to money serve long-term?"
    }
  }
];

/**
 * Get all tarot card interpretations organized by Arcana
 */
export function getInterpretations(): {
  majorArcana: CardInterpretation[];
  minorArcana: {
    wands: CardInterpretation[];
    cups: CardInterpretation[];
    swords: CardInterpretation[];
    pentacles: CardInterpretation[];
  };
  allCards: CardInterpretation[];
} {
  return {
    majorArcana: MAJOR_ARCANA,
    minorArcana: {
      wands: WANDS,
      cups: CUPS,
      swords: SWORDS,
      pentacles: PENTACLES
    },
    allCards: [...MAJOR_ARCANA, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES]
  };
}

/**
 * Get a specific card interpretation by name
 */
export function getInterpretationByName(name: string): CardInterpretation | undefined {
  return getInterpretations().allCards.find(
    card => card.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get interpretation by card ID
 */
export function getInterpretationById(id: number): CardInterpretation | undefined {
  return getInterpretations().allCards[id];
}