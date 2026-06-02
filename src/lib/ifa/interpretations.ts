export interface OduInterpretation {
  name: string;
  yoruba: string;
  keywords: string[];
  meaning: string;
  spiritualGuidance: string[];
  warnings: string[];
  blessings: string[];
  orishas: string[];
}

/**
 * The 16 Odu Ifá — sacred foundations of Ifá divination.
 * Each Odu contains verses (Èsè Ifá), spiritual laws, moral teachings,
 * and ritual instructions for destiny alignment.
 *
 * Source: Babaalawo Ifa — The 16 Odu Ifá Explained
 */
export const ORISHAS_SUPPORTED = [
  "Olokun",
  "Obatalá",
  "Òrúnmìlà",
  "Shango",
  "Ogun",
  "Yemoja",
  "Elegguá",
  "Oya",
  "Osain",
] as const;

function createOduInterpretations(): Record<string, OduInterpretation> {
  return {
    ogbe: {
      name: "Ogbe",
      yoruba: "Ògùndá",
      keywords: ["light", "creation", "new beginnings", "victory", "wisdom", "prosperity", "leadership"],
      meaning:
        "Ogbe symbolizes clarity, victory, wisdom, prosperity, leadership, and new opportunities. It is the Odu of Light and Creation — the moment when potential becomes manifest. When Ogbe appears, Olódùmarè opens a door of possibility and grants the seeker the clarity to act with purpose. It speaks of dawn after darkness, of seeds breaking through soil, of empires built from single ideas spoken into being.",
      spiritualGuidance: [
        "Embrace new beginnings with confidence and trust in the divine.",
        "Seek clarity before acting; fog dissipates where light enters.",
        "Lead with generosity — power used for the collective multiplies.",
        "Offer gratitude daily; blessings compound when acknowledged.",
        "Do not hoard what you have been given; share and it shall return.",
      ],
      warnings: [
        "Hasty decisions in moments of optimism lead to regret.",
        "Arrogance after victory blinds the same eyes that succeeded.",
        "Light cast without wisdom burns rather than illuminates.",
      ],
      blessings: ["Clarity of mind and purpose", "Victory over long-standing obstacles", "New doors of prosperity", "Leadership authority", "Communion with Obatalá for purity of spirit"],
      orishas: ["Obatalá", "Òrúnmìlà"],
    },

    oyeku: {
      name: "Oyeku",
      yoruba: "Òyèkú",
      keywords: ["mystery", "transformation", "unseen", "endings", "rebirth", "depth", "silence"],
      meaning:
        "Oyeku represents endings, rebirth, spiritual depth, silence, and the hidden forces that shape destiny from the shadows. It is the Odu of Mystery — the world beneath the surface, the throne room of Olokun, the still point before transformation begins. Where others see void, Oyeku sees the crucible where the self is refined. Endings are not destruction; they are the necessary clearing of what must pass so that what deserves to live may breath.",
      spiritualGuidance: [
        "Honor what must end; do not cling to what has already left.",
        "Descend inward — the answers you seek are within, not without.",
        "Practice silence; in stillness, truth surfaces louder than words.",
        "Trust the unseen; what is hidden protects as much as it reveals.",
        "Transformation requires surrender; fight less, release more.",
      ],
      warnings: [
        "Denial of an ending prolongs suffering unnecessarily.",
        "Venturing too deep into hidden realms without preparation brings disorientation.",
        "Seeking answers in places of grief without proper ritual invites more darkness.",
      ],
      blessings: ["Deep spiritual vision", "Ability to navigate transitions gracefully", "Communion with Olokun for hidden knowledge", "Endurance through transformation", "The reward that follows genuine letting-go"],
      orishas: ["Olokun", "Yemoja"],
    },

    iwori: {
      name: "Iwori",
      yoruba: "Ìwòrì",
      keywords: ["reflection", "truth", "hidden knowledge", "patience", "awareness", "decision-making"],
      meaning:
        "Iwori teaches patience, truth, awareness, and careful decision-making. It is the Odu of Reflection — the wise elder who sits, listens, and speaks only after full consideration. Hidden knowledge is Iwori's domain; what others miss, Iwori sees. It calls the seeker to turn inward, to examine the self before examining the world, to stand in truth even when that truth is inconvenient. Wisdom is not speed; it is the willingness to wait until understanding is complete.",
      spiritualGuidance: [
        "Before speaking, examine your own heart; truth spoken without this burns.",
        "Seek counsel from those who have walked your path before you.",
        "Patient observation reveals what urgent action obscures.",
        "Do not force understanding — allow it to unfold in its own season.",
        "Turn away from flattering voices that tell you what you wish to hear.",
      ],
      warnings: [
        "Impatience masquerading as urgency creates problems where none existed.",
        "Knowing truth but refusing to act on it is its own betrayal.",
        "Rushing to judgment before all evidence is weighed shatters relationships.",
      ],
      blessings: ["Deep insight and discernment", "Wisdom that grows with time", "Truth that endures", "Communion with Obatalá for clarity of mind", "Patience as a strength, not a limitation"],
      orishas: ["Obatalá", "Òrúnmìlà"],
    },

    odi: {
      name: "Odi",
      yoruba: "Òdí",
      keywords: ["foundation", "lessons", "stability", "ancestry", "grounding", "roots", "protection"],
      meaning:
        "Odi relates to ancestry, grounding, roots, protection, and learning from experience. It is the Odu of Foundation — the earth beneath the feet, the lineage behind the name, the community that shelters in storm. Odi teaches that no one is self-made, that every achievement rests on invisible pillars of those who came before. When Odi appears, it is a call to return to what is real, to place, to the wisdom encoded in blood and tradition. Stability is not stagnation; it is the necessary base from which all growth climbs.",
      spiritualGuidance: [
        "Honor your ancestors; their sacrifices underpin your present opportunities.",
        "Ground yourself in established truth before reaching for new heights.",
        "Build relationships of mutual support; isolation weakens the spirit.",
        "Learn from the mistakes recorded by those who preceded you.",
        "Offer protection to those who are vulnerable; what you shelter returns.",
      ],
      warnings: [
        "Stubbornly clinging to the old when the new has been clearly indicated leads to collapse.",
        "Ignoring ancestral guidance courted through pride results in repeated mistakes.",
        "Using the stability Odi grants solely for personal gain at the expense of community depletes the blessing.",
      ],
      blessings: ["Strong foundation in all endeavors", "Protection from unexpected collapse", "Connection to ancestral wisdom and support", "Grounding in times of change", "Communion with Yemoja for nurturing strength"],
      orishas: ["Yemoja", "Olodumare", "Obatalá"],
    },

    irosun: {
      name: "Irosun",
      yoruba: "Ìrosùn",
      keywords: ["abundance", "family", "growth", "wealth", "blessings", "emotional stability", "nourishment"],
      meaning:
        "Irosun represents wealth, family blessings, emotional stability, and nourishment. It is the Odu of Abundance — the fruit heavy on the branch, the home filled with laughter, the fields golden before harvest. This Odu speaks of prosperity in its fullest sense: not merely material wealth, but the richness of relationships, emotional health, and spiritual nourishment. Irosun reminds the seeker that abundance is meant to flow — through the self and outward to those dependants and connected — and that the measure of wealth is what it produces, not what it hoards.",
      spiritualGuidance: [
        "Nurture your family relationships; they are the fabric of your emotional life.",
        "Let prosperity flow through you rather than pool around you.",
        "Tend to your emotional health with the same care given to physical wellbeing.",
        "Plant seeds of generosity; the harvest multiplies what was planted.",
        "Receive blessings with gratitude; pride repels what humility attracts.",
      ],
      warnings: [
        "Hoarding wealth fearing loss invites the very loss feared.",
        "Neglecting family in pursuit of abundance loses what abundance cannot replace.",
        "Comparing your harvest to another's field breeds resentment that poisons enjoyment.",
      ],
      blessings: ["Abundance in material and emotional realms", "Family harmony and blessing", "Fertility and growth", "Nourishment for body and spirit", "Communion with Yemoja for emotional depth and Oshosi for hunting and provision"],
      orishas: ["Yemoja", "Oshosi"],
    },

    owonrin: {
      name: "Owonrin",
      yoruba: "Òwónrí",
      keywords: ["change", "movement", "transformation", "destiny shifts", "evolution", "journey"],
      meaning:
        "Owonrin brings destiny shifts, change, evolution, and transformation. It is the Odu of Movement — the messenger that arrives when stillness has been held too long, when the self must leave the familiar and walk into mist. Owonrin does not promise that the change will be comfortable; it promises that it will be necessary. The storm is real, but so is the clearing that follows. This Odu speaks to the courage required to leave what is known not because it is failing, but because something greater is waiting beyond it.",
      spiritualGuidance: [
        "Do not resist change when it arrives with unmistakable force and timing.",
        "Prepare for the journey; those who set out unprepared find the road harder.",
        "Trust that forward motion, even without full visibility, is preferable to static stagnation.",
        "Let go of what can no longer accompany you; the departing boat creates space for the arriving one.",
        "Seek the support of companions who have chosen to walk beside you in the new direction.",
      ],
      warnings: [
        "Refusing necessary change when the time has clearly come leads to collapse rather than evolution.",
        "Change pursued for its own sake without discernment creates confusion, not progress.",
        "Undertaking the journey with unresolved spiritual debts intensifies the ordeal.",
      ],
      blessings: ["Successful transformation through life's inevitable transitions", "Destiny shifts that align with true purpose", "Strength to navigate unknown territories", "Communion with Oshun for flowing adaptability", "The wisdom to know when to stay and when to go"],
      orishas: ["Oshun", "Shango"],
    },

    obara: {
      name: "Obara",
      yoruba: "Òbàrà",
      keywords: ["power", "victory", "achievement", "strength", "success", "confidence", "authority"],
      meaning:
        "Obara symbolizes strength, success, confidence, authority, and recognition. It is the Odu of Power and Achievement — the warrior who wins the battle, the leader whose decisions change the course of events, the spirit that refuses to accept defeat when divine mandate confirms the right to victory. Obara speaks of power wielded with discipline, of strength that serves rather than crushes, and of the recognition that authority flows from Olódùmarè and must be exercised with accountability to those it governs.",
      spiritualGuidance: [
        "Claim your authority and wield it with discipline and moral clarity.",
        "Victory is earned through preparation and righteous effort, not passive waiting.",
        "Use your power to elevate those who have no voice.",
        "Acknowledge that all power originates from Olódùmarè; pride in power is its corruption.",
        "Build alliances based on mutual respect and shared purpose.",
      ],
      warnings: [
        "Power that serves only the self destroys the very foundation that sustains it.",
        "Overconfidence in strength without divine alignment leads to precarious positions.",
        "Dominating others through force rather than wisdom depletes spiritual authority.",
      ],
      blessings: ["Victory in contested endeavors", "Authority andrespect granted by those who witness disciplined power", "Strength to overcome formidable obstacles", "Recognition as a person of integrity", "Communion with Shango for thunderous power and Ogun for disciplined force"],
      orishas: ["Shango", "Ogun"],
    },

    okanran: {
      name: "Okanran",
      yoruba: "Òkánrán",
      keywords: ["chaos", "warning", "discipline", "caution", "self-control", "spiritual law"],
      meaning:
        "Okanran teaches caution, discipline, self-control, and respect for spiritual law. It is the Odu of Warning — the hand raised at the cliff's edge, the voice that calls pause when the self rushes forward blind. Chaos is the theme not because it is the destination but because it is the consequence of ignoring the warnings already given. Okanran arrives when patterns have already been set in motion toward harm, and intervention at this moment is still possible. Discipline now prevents chaos later. The Odu calls for the seeker to restore order within the self before attempting to restore order in the world.",
      spiritualGuidance: [
        "When warning comes, listen immediately; the cost of refusal compounds with time.",
        "Exercise self-control with the same vigor you would apply to pursuing victory.",
        "Restore order systematically — do not attempt to address all symptoms simultaneously.",
        "Respect the boundaries the divine has imposed; they exist for your protection.",
        "Do not enable chaos in others by excusing behavior that requires correction.",
      ],
      warnings: [
        "Disregarding repeated warnings leads to the very suffering that was foretold.",
        "Chaos that is rewarded with accommodation continues and intensifies.",
        "Restraint withheld at the critical moment of temptation becomes the memory that haunts.",
      ],
      blessings: ["Disciplined will that堅固s against temptation", "The capacity to receive divine warning with humility", "Strength in the practice of self-control", "Clarity about what self-limitations are necessary for well-being", "Communion with Ogun for the discipline of the forge"],
      orishas: ["Ogun", "Elegguá", "Òrúnmìlà"],
    },

    ogunda: {
      name: "Ogunda",
      yoruba: "Ògúndá",
      keywords: ["courage", "breakthrough", "protection", "warrior energy", "resilience", "obstacle removal", "conflict"],
      meaning:
        "Ogunda embodies warrior energy, resilience, obstacle removal, and conflict resolution. It is the Odu of Courage — the moment when the self must step forward into difficulty, armed with faith, and declare that what opposes the divine will shall not stand. Ogunda does not glorify conflict for its own sake; it recognizes that some obstacles are genuinely in the path, not in the mind, and that passing them requires the willingness to engage, to struggle, and to emerge changed. The warrior's courage is not the absence of fear but the decision to act in accordance with divine mandate despite it.",
      spiritualGuidance: [
        "Face obstacles directly when they are real; only then does courage mean anything.",
        "Pursue the removal of genuine barriers; do not invent enemies to fight.",
        "Arm yourself with the proper preparation before entering conflict.",
        "Act with strategic precision rather than reckless abandon.",
        "Use the power of Ogunda in service of those who cannot defend themselves.",
      ],
      warnings: [
        "Aggression without divine mandate is violence, not courage.",
        "Conflict entered without preparation nearly always ends in unnecessary loss.",
        "Winning a battle that should have been avoided does not prove it was right to fight.",
      ],
      blessings: ["Courage to face genuine challenges", "The power to break through persistent obstacles", "Protection for those engaged in righteous action", "Strategic clarity in complex situations", "Communion with Ogun for the warrior's discipline and Shango for righteous conflict"],
      orishas: ["Ogun", "Shango", "Elegguá"],
    },

    osa: {
      name: "Osa",
      yoruba: "Òsá",
      keywords: ["destiny twists", "spiritual forces", "sudden changes", "unseen realm", "spiritual awareness"],
      meaning:
        "Osa represents sudden changes, spiritual awareness, and the unseen realm. It is the Odu of Destiny Twists — the hand of Olódùmarè that redirects the seeker when the self insists on going the wrong direction, or the force that topples what appeared stable. Osa is the most mysterious of the primary Odu because its changes come from the realm beyond the visible, from forces that the senses cannot detect but the spirit nonetheless feels. This Odu calls for heightened spiritual awareness: what is happening is larger than what is visible, and the seeker's task is to align with the divine pattern rather than insist on the familiar one.",
      spiritualGuidance: [
        "When destiny shifts, examine whether you were opposing the divine will before resisting the change.",
        "Develop spiritual awareness through prayer, observation, and ritual so that direction shifts surprise you less.",
        "Do not measure the value of an event by its immediate appearance; the unseen realm is active.",
        "Let go of the insistence that you know the best path; submit your plan to the divine for revision.",
        "Prepare for sudden developments so that when they come, you do not freeze.",
      ],
      warnings: [
        "Stubborn insistence on the old path when divine redirection has clearly arrived leads to unnecessary suffering.",
        "Rejecting spiritual guidance because the timing or form is inconvenient courts disaster.",
        "Attempting to force a predetermined outcome when the divine has redirected causes the effort to backfire.",
      ],
      blessings: ["Alignment with divine destiny even through unexpected turns", "Protection from the effects of sudden change", "Spiritual awareness that sees beyond the visible realm", "The adaptability to move with providence rather than against it", "Communion with Òrúnmìlà for divination and Osain for spiritual medicine"],
      orishas: ["Òrúnmìlà", "Osain", "Olokun"],
    },

    ika: {
      name: "Ika",
      yoruba: "Ìká",
      keywords: ["wisdom", "responsibility", "serious decisions", "consequences", "integrity"],
      meaning:
        "Ika demands wisdom, patience, responsibility, and careful choices. It is the Odu of Consequence — the reminder that every action sets a sequence in motion, that what is done echoes beyond the moment of its doing, and that the seeker is accountable not only to the living but to the divine record. Ika does not speak of punishment but of consequence: the natural extension of cause into effect, and the seriousness with which Olódùmarè regards those who act without consideration of these extensions. Responsibility is not a burden; it is the measure of one's readiness to receive divine authority.",
      spiritualGuidance: [
        "Consider the full chain of consequences before every significant action.",
        "Accept responsibility for what you have done with the same courage with which you claim what you have earned.",
        "Do not blame the outcome on others when your own choices contributed to it.",
        "Choose slowly and thoroughly;后悔 comes quickly to those who chose carelessly.",
        "Teach responsibility to those who look to you for guidance, by example above all.",
      ],
      warnings: [
        "Passing blame for one's own choices is a spiritual debt that compounds.",
        "Making serious decisions in states of emotional agitation leads to consequences that require years to heal.",
        "Disregarding the consequences experienced by those affected by your choices weakens your moral standing.",
      ],
      blessings: ["The wisdom to see beyond immediate gratification", "Trust earned through acknowledged responsibility", "Clear conscience that strengthens rather than depletes", "Accountability that elevates rather than diminishes", "Communion with Obatalá for moral clarity"],
      orishas: ["Obatalá", "Òrúnmìlà"],
    },

    oturupon: {
      name: "Oturupon",
      yoruba: "Òtúrúpón",
      keywords: ["healing", "cleansing", "renewal", "emotional healing", "spiritual cleansing", "restoration"],
      meaning:
        "Oturupon is associated with emotional healing, spiritual cleansing, and restoration. It is the Odu of Renewal — the medicine that removes what has poisoned, the ritual that cleanses what has been soiled, the hand that lifts the fallen. Oturupon addresses wounds not only of the body but of the heart, the lineage, and the spirit. It acknowledges that damage accumulates — from one's own choices and from ancestral inheritances — and that divine intervention offers the possibility of real restoration, not merely the management of symptoms. Healing requires the participation of the one who is wounded; Oturupon provides the means, but the seeker must receive it.",
      spiritualGuidance: [
        "Pursue healing actively; passive waiting for wounds to self-repair prolongs suffering.",
        "Submit to the rituals and practices that cleanse as Olódùmarè prescribed, not as the self invents.",
        "Address wounds at the root, not merely at the point where pain is felt most acutely.",
        "Allow others to support your healing; isolation during recovery extends the recovery.",
        "Forgive as part of the cleansing process; resentment is a barrier to the medicine's effectiveness.",
      ],
      warnings: [
        "Healing rituals undertaken by unqualified practitioners can cause spiritual harm.",
        "Masking symptoms without addressing the underlying cause allows the damage to spread.",
        "Resisting the discomfort that genuine healing requires prevents real restoration.",
      ],
      blessings: ["Deep emotional and spiritual restoration", "Freedom from ancestral patterns of suffering", "The patience required for genuine healing to unfold", "Cleansing that renews rather than merely refreshes", "Communion with Olokun for deep healing and Oshun for emotional restoration"],
      orishas: ["Olokun", "Oshun", "Yemoja"],
    },

    otura: {
      name: "Otura",
      yoruba: "Òtúrá",
      keywords: ["peace", "faith", "divine alignment", "inner peace", "spirituality", "calmness"],
      meaning:
        "Otura symbolizes inner peace, faith, spirituality, and calmness. It is the Odu of Divine Alignment — the state of being where the self rests in the divine will without anxiety, where faith is not a leap but a settled confidence, where the seeker has surrendered the exhausting effort to control what only Olódùmarè controls. Otura is the reward for those who have walked through difficulty with integrity, who have followed the prescriptions given, who have not abandoned the path even when it seemed irrational. Peace is not idleness; it is the foundation from which purposeful action flows freely.",
      spiritualGuidance: [
        "Develop a settled faith through consistent practice and devotional study.",
        "Rest in the knowledge that not everything requires your intervention.",
        "Cultivate inner calm as a discipline; the world provides enough agitation.",
        "Align daily actions with the divine pattern rather than with impulse.",
        "Protect the peace you have cultivated; do not extend it to those who would exploit it.",
      ],
      warnings: [
        "Peace that is chosen as escape from necessary confrontation is not peace but cowardice.",
        "Extending unconditional peace to those who actively work against you depletes your spirit.",
        "Faith that is not grounded in practice and ritual is conviction without substance.",
      ],
      blessings: ["Deep and abiding inner peace", "Faith that endures challenge", "Alignment with the divine will that guides without anxiety", "The spiritual discipline of calmness", "Communion with Obatalá for transcendent peace"],
      orishas: ["Obatalá", "Olodumare", "Oshun"],
    },

    irete: {
      name: "Irete",
      yoruba: "Ìrẹ̀tẹ̀",
      keywords: ["destiny", "choices", "consequences", "responsibility", "long-term thinking", "life decisions"],
      meaning:
        "Irete teaches destiny, responsibility, long-term thinking, and life decisions. It is the Odu of Destiny and Choice — the recognition that every life is shaped by accumulated decisions, that the self is both the agent and the subject of its own shaping, and that the most important question is not what is happening but what the seeker is choosing to do about it. Irete reminds the seeker that destiny is not a force imposed from outside but a pattern co-created through daily choices. The long view matters; what seems significant now may be trivial in the arc of years, and what seems minor now may be revealed as pivotal.",
      spiritualGuidance: [
        "Think in long arcs; decisions made today echo for generations.",
        "Own your choices as the primary shapers of your destiny rather than attributing your fate to external forces.",
        "Choose what you will do rather than merely reacting to what has been done to you.",
        "Learn to distinguish between what is within your control and what is not.",
        "Make decisions that your future self will thank you for, not merely ones that serve your present comfort.",
      ],
      warnings: [
        "Avoiding all decisions because of fear of making the wrong one is itself the worst decision.",
        "Blaming others for the consequences of your choices while claiming personal credit for your successes reveals an accounting system that will not balance.",
        "Prioritizing immediate gratification over long-term destiny fulfillment plants regret.",
      ],
      blessings: ["Clarity about one's true destiny and purpose", "The wisdom to choose in alignment with long-term fulfillment", "Destiny that unfolds in a pattern of growth rather than repetition", "Accountability that strengthens rather than diminishes", "Communion with Òrúnmìlà for destiny guidance"],
      orishas: ["Òrúnmìlà", "Obatalá"],
    },

    ose: {
      name: "Ose",
      yoruba: "Òsé",
      keywords: ["transformation", "ritual", "blessing", "sacred ritual", "offerings", "divine elevation"],
      meaning:
        "Ose represents sacred rituals, offerings, transformation, and divine elevation. It is the Odu of Sacred Action — the point where intention is translated into ritual form, where the seeker engages directly with the divine through prescribed practices, where offerings are made not as transaction but as communion. Ose speaks to the power of ritual: the consistent, intentional, symbolically rich acts that reshape the self and create channels for divine blessing. Transformation through ritual is not metaphorical; it is the actual remaking of the spiritual self through disciplined practice of sacred forms.",
      spiritualGuidance: [
        "Establish consistent ritual practices that restore and elevate your spirit.",
        "Approach offerings not as payment but as genuine communion with the divine.",
        "Transform through disciplined practice; there is no shortcut through the work.",
        "Seek proper instruction in ritual before attempting to perform it; unqualified practice is dangerous.",
        "Allow ritual to reshape you rather than merely reciting forms by rote.",
      ],
      warnings: [
        "Rituals performed by rote without genuine intention produce no transformation.",
        "Improvising ritual forms without proper training disrespects the tradition and invites harm.",
        "Treating offerings as transactions — giving only to receive — misses the communion that lies at the heart of ritual.",
      ],
      blessings: ["Transformation through sacred ritual practice", "Divine elevation through disciplined commitment", "The ability to create and maintain life-giving ritual patterns", "Blessings channeled through proper offering and alignment", "Communion with Òrúnmìlà for ritual authority and Oshun for flowing grace"],
      orishas: ["Òrúnmìlà", "Oshun", "Elegguá"],
    },

    ofun: {
      name: "Ofun",
      yoruba: "Òfún",
      keywords: ["fulfillment", "completion", "divine blessings", "enlightenment", "purity", "success"],
      meaning:
        "Ofun symbolizes completion, destiny fulfillment, enlightenment, purity, and success. It is the Odu of Fulfillment — the moment when the journey begun long ago reaches its intended destination, when the work done in obscurity is revealed in its fullness, when the seeker receives what was promised. Ofun speaks of the reward that comes from a life lived in alignment with the divine will: not immunity from difficulty but the confident knowledge that what has been built will stand, that the seeds planted through suffering and discipline will be harvested in joy. Pure intentions planted through disciplined practice bear fruit that endures.",
      spiritualGuidance: [
        "Complete what you have begun; abandonment before fulfillment forfeits the blessing.",
        "Maintain purity of intention; success built on compromised foundations crumbles.",
        "Receive the fulfillment Ofun offers with gratitude and humility, not boasting.",
        "Share the bounty of completion with those who supported you in the journey.",
        "Use the illumination that completion-bestows to guide others beginning where you once stood.",
      ],
      warnings: [
        "Claiming completion before the work is truly done invites retroactive deflation.",
        "Using the power that fulfillment grants for exploitation rather than service corrupts the very blessing received.",
        "Boasting of one's own achievement in the presence of those who labored to make it possible breaks relationship.",
      ],
      blessings: ["Destiny fulfillment and the completion of the work one was born to do", "Pure and unencumbered success", "Enlightenment that illuminates rather than blinds", "Communion with Obatalá for spiritual purity and Òrúnmìlà for fulfillment"],
      orishas: ["Obatalá", "Òrúnmìlà", "Olodumare"],
    },
  };
}

export function getInterpretations(): Record<string, OduInterpretation> {
  return createOduInterpretations();
}

export function getInterpretation(name: string): OduInterpretation | undefined {
  return createOduInterpretations()[name.toLowerCase()];
}
