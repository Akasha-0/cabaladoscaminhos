// fallow-ignore-file unused-file

interface CardInterpretation {
  cardName: string;
  // Simple labels for UI chips / dropdown filters
  tags: string[];
  // One-line snapshot used in card list tooltips
  summary: string;
  // Full narrative paragraph
  general: string;
  // Love / romantic / partnership readings
  love: string | null;
  // Career / work / financial context
  career: string | null;
  // Deep-reflective / shadow-work prompts for journaling
  shadow: string[];
  // Short affirmation phrases (one per line)
  affirmations: string[];
}

interface TarotInterpretations {
  majorArcana: CardInterpretation[];
  minorArcana: {
    wands: CardInterpretation[];
    cups: CardInterpretation[];
    swords: CardInterpretation[];
    pentacles: CardInterpretation[];
  };
}

// ─── MAJOR ARCANA ─────────────────────────────────────────────────────────────

const MAJOR_ARCANA: CardInterpretation[] = [
  {
    cardName: "The Fool",
    tags: ["new-beginnings", "spontaneity", "innocence", "trust"],
    summary: "Leap into the unknown with wonder and trust.",
    general:
      "You stand at the threshold of a new chapter. Everything feels fresh, uncertain, and full of possibility. The Fool urges you to step forward with an open heart, trusting that the path will reveal itself as you walk it. This is not a time for over-planning or playing it safe — it is a time for wonder. Say yes to what excites you, even if you cannot see the full picture yet. What looks like recklessness is actually profound faith.",
    love: null,
    career:
      "A new venture, project, or career pivot is on the horizon. This is the spark of an idea — lean into curiosity rather than caution. Your professional journey is about to take an unexpected turn. Embrace the beginner's mind.",
    shadow: [
      "Where am I using 'spontaneity' as a mask for avoidance or fear of commitment?",
      "Am I truly ready to be present, or am I chasing novelty to escape something deeper?",
      "What would it mean to be intentional about this 'new beginning' instead of blindly leaping?",
      "Where have I dismissed valid caution as 'not trusting the process'?",
    ],
    affirmations: [
      "I trust the path I am on.",
      "I move forward with both curiosity and courage.",
      "My new beginning is supported by the universe.",
    ],
  },
  {
    cardName: "The Magician",
    tags: ["manifestation", "willpower", "creation", "resources"],
    summary: "You already have everything you need to make magic happen.",
    general:
      "All the tools, resources, and skills you need are already within your reach. The Magician is the reminder that you are not a victim of circumstance — you are the architect of your reality. Focus your intention, align your will, and take decisive action. The universe responds to those who act as if success is already theirs. Ask yourself: where have I been waiting for permission that is already mine to grant?",
    love: null,
    career:
      "A period of professional empowerment and resourcefulness. You have the skills and connections to make significant progress. Focus on leveraging what you already possess rather than searching for new tools.",
    shadow: [
      "Where am I aware of my power but hesitating to use it?",
      "Am I using my gifts to create or to manipulate?",
      "Where have I been waiting for the 'perfect moment' instead of acting now?",
      "What talents have I been hiding or downplaying out of fear?",
    ],
    affirmations: [
      "I have all I need to create the life I desire.",
      "I focus my intentions and take inspired action.",
      "My will is aligned with my highest good.",
    ],
  },
  {
    cardName: "The High Priestess",
    tags: ["intuition", "mystery", "inner-knowledge", "sacred"],
    summary: "Trust the wisdom that lives beneath the surface.",
    general:
      "Not everything can be known through logic and analysis — some truths live in the realm of feeling and instinct. The High Priestess calls you to listen inward: to that quiet voice, the recurring dream, the body sensation you have been ignoring. She is the keeper of secrets and the guardian of the threshold between states of consciousness. Pause. Be still. The answers you seek are already within you, waiting to surface when you make room for silence.",
    love: null,
    career:
      "Intuition is your professional asset right now. Logic and data may be leading you astray — trust your gut feelings about people and situations. There may be hidden dynamics at play that are not yet visible on the surface.",
    shadow: [
      "What am I afraid to discover if I sit in silence long enough?",
      "Where have I been using 'intuition' as a rationalization for my desires or fears?",
      "What truths have I been avoiding because they are too uncomfortable to face?",
      "Am I honouring my inner voice, or am I seeking external authorities to tell me what to feel?",
    ],
    affirmations: [
      "I trust my inner knowing.",
      "I am open to the wisdom that arises in stillness.",
      "My intuition is a sacred gift I honour and trust.",
    ],
  },
  {
    cardName: "The Empress",
    tags: ["abundance", "creativity", "nurturing", "nature"],
    summary: "Let your creative essence flow and prosper.",
    general:
      "Abundance is not just material — it is the lush fullness of a creative life, a nurturing relationship, a fertilized mind. The Empress embodies the principle of growth for growth's sake: pleasure, beauty, comfort, and the natural world. If you have been holding back on pleasure, on creativity, or on caring for yourself as you would a beloved — this is your invitation. You are allowed to rest in the arms of life's bounty. Receive it.",
    love: null,
    career:
      "A fertile period for creative projects, care-oriented roles, or nurturing environments. If you have been doubting your market value, the Empress reminds you that your worth is not purely transactional.",
    shadow: [
      "Where have I been shaming myself for wanting comfort, rest, or pleasure?",
      "Am I over-nurturing others at the expense of myself?",
      "What creative expression have I suppressed because it felt 'not serious enough'?",
      "Where might I be hoarding abundance instead of allowing it to flow?",
    ],
    affirmations: [
      "I am worthy of rest, beauty, and ease.",
      "My creativity is a gift, and I give myself permission to express it.",
      "Abundance flows to me naturally.",
    ],
  },
  {
    cardName: "The Emperor",
    tags: ["authority", "structure", "leadership", "stability"],
    summary: "Build the solid ground beneath your vision.",
    general:
      "The Empress plants seeds; the Emperor builds the structure to protect and sustain them. Authority here is earned through experience, not imposed through force. The Emperor asks: is there an area of your life that needs more discipline, clearer boundaries, or firmer ground? Do not mistake structure for rigidity — a well-built foundation gives you the freedom to create boldly. Lead yourself first.",
    love: null,
    career:
      "A time for establishing professional systems, setting boundaries with colleagues, or asserting your leadership. If you have been over-delegating or avoiding hard conversations, this is the energy to step into your authority.",
    shadow: [
      "Is my desire for control rooted in wisdom or in fear?",
      "Where am I either dominating or submitting — without balance?",
      "What structure do I actually need versus what structure am I clinging to out of anxiety?",
      "Have I earned the authority I am claiming, or am I performing it?",
    ],
    affirmations: [
      "I lead myself with discipline, wisdom, and fairness.",
      "I build structures that support my vision, not limit it.",
      "My authority comes from my integrity.",
    ],
  },
  {
    cardName: "The Hierophant",
    tags: ["tradition", "guidance", "education", "belief"],
    summary: "Seek wisdom in sacred tradition, or liberate yourself from it.",
    general:
      "The Hierophant represents the teacher, the institution, the established spiritual path. This card speaks to the value of mentorship, received wisdom, and belonging to something greater than yourself. It can also reveal where you have surrendered your inner authority to external systems that no longer serve your truth. The question is not whether tradition is right or wrong — it is whether this particular path is yours.",
    love: null,
    career:
      "A time when formal education, certifications, or institutional affiliation may open doors. Alternatively, it may point to a need to challenge outdated professional norms or find your own path rather than following the expected route.",
    shadow: [
      "Am I following this path because it resonates or because I was told it was correct?",
      "Where have I outsourced my knowing to teachers, authorities, or institutions?",
      "What beliefs about myself or the world did I inherit uncritically?",
      "Do I feel spiritual or intellectual belonging, or just obligation?",
    ],
    affirmations: [
      "I receive guidance with gratitude while trusting my own inner compass.",
      "My spiritual path is my own to walk.",
      "I am allowed to question the wisdom I was given.",
    ],
  },
  {
    cardName: "The Lovers",
    tags: ["union", "choice", "alignment", "values"],
    summary: "Two forces align — the highest choice is in your hands.",
    general:
      "There is a moment when you are called to choose between two paths, two values, or two versions of yourself. The Lovers is not simply a romantic card — it is the card of alignment: when your heart, your mind, and your deepest values point in the same direction. This is a profound moment of integration. The choice you face is not between right and wrong but between two genuine goods. Choose the one that feels most true to who you are becoming.",
    love: null,
    career: null,
    shadow: [
      "Am I facing a genuine fork, or am I avoiding making a commitment by treating it as 'cosmic'?",
      "What values are actually at stake in this decision — make them explicit.",
      "Am I choosing from alignment, or from fear of displeasing someone?",
      "What would choosing myself look like in this moment?",
    ],
    affirmations: [
      "I make choices from alignment with my deepest values.",
      "I deserve a love and a life that reflects my truest self.",
      "In this moment, I choose what feels most true.",
    ],
  },
  {
    cardName: "The Chariot",
    tags: ["willpower", "determination", "victory", "control"],
    summary: "Harness opposing forces and move with fierce purpose.",
    general:
      "Victory is within reach, but it requires holding tension — not collapsing into it. The Chariot is about determined forward motion, about steering through chaos with confidence. The two horses represent opposing forces: caution and bravery, heart and mind, inner and outer worlds. You do not need these forces to be in perfect harmony — you need them to move together, even in tension. Take the reins. Steer. Win.",
    love: null,
    career:
      "A period of intense focus and determined action toward a professional goal. You may need to navigate competing demands or conflicting priorities. Keep the end destination clear and do not be distracted.",
    shadow: [
      "Am I moving with purpose, or am I speeding to avoid what I feel when I slow down?",
      "What opposing forces am I failing to acknowledge inside myself?",
      "Is my determination grounded in vision or rooted in the need to prove something?",
      "Where might forcefulness be costing me support I actually need?",
    ],
    affirmations: [
      "I move toward my goals with focus and determination.",
      "I hold opposing forces in creative balance.",
      "Victory is earned through steady, purposeful action.",
    ],
  },
  {
    cardName: "Strength",
    tags: ["courage", "compassion", "inner-strength", "patience"],
    summary: "True power lives in gentleness and quiet courage.",
    general:
      "This is not the strength of conquest — it is the strength of the soul. True fortitude is not about muscular force or aggressive confidence; it is about remaining gentle, patient, and compassionate even when your inner lion roars. The Strength card is the most internal of all the Major Arcana — its power is invisible to the outside world. You are being invited to stay soft when everything in you wants to fight. That softness is not weakness. It is the deepest form of power you possess.",
    love: null,
    career:
      "An opportunity to demonstrate courageous patience in a professional situation. This may be a moment for leading with empathy rather than authority, or for holding your ground without escalation.",
    shadow: [
      "What is my inner lion demanding? What would happen if I gently held it instead of unleashing it?",
      "Am I confusing real strength with the performance of strength?",
      "Where have I shamed myself for feeling afraid when what I actually needed was self-compassion?",
      "What would it look like to be gentle with myself right now and still make progress?",
    ],
    affirmations: [
      "My gentleness is my greatest strength.",
      "I have the courage to be patient with myself.",
      "I meet my challenges with a quiet, unwavering heart.",
    ],
  },
  {
    cardName: "The Hermit",
    tags: ["introspection", "solitude", "guidance", "inner-light"],
    summary: "Seek the light within — sometimes the wisest path is inward.",
    general:
      "There are questions that can only be answered alone. The Hermit is the card of purposeful solitude: not withdrawal from life, but a deliberate turning inward to find the guidance you have been seeking externally. You do not need rescue or advice — you need time and silence to hear what your own soul already knows. Light your inner lamp. Walk the inner road. When you return, you will carry insights no one else could give you.",
    love: null,
    career:
      "A period where introspection serves your professional clarity. You may need to step back from collaboration or networking in order to reconnect with your core professional values and vision.",
    shadow: [
      "Am I seeking solitude to grow, or to hide? Distinguish between the two.",
      "What am I avoiding in the outer world that the solitude helps me delay?",
      "Have I been seeking external guidance when the answer has been within me all along?",
      "Loneliness is a signal. What unmet need is it pointing to?",
    ],
    affirmations: [
      "The answers I seek are within me.",
      "I welcome solitude as a teacher.",
      "In stillness, I find my direction.",
    ],
  },
  {
    cardName: "Wheel of Fortune",
    tags: ["change", "cycles", "destiny", "luck"],
    summary: "Life is turning — surrender to the rhythm of larger forces.",
    general:
      "The wheel is in constant motion — what rises will fall, and what falls will rise. This is the cosmos reminding you that you are not the wheel, you are the one on the wheel, and you have never been the one steering it. Good luck and bad luck are part of the same cy cle. When the wheel turns in your favour, act with gratitude. When it turns against you, remember: this too is passing. Flow with the cycle rather than fighting it.",
    love: null,
    career:
      "External circumstances are shifting — be they organisational changes, market conditions, or professional命运的 turns. The best response is often to remain flexible and aligned rather than to cling to a specific desired outcome.",
    shadow: [
      "What in my life am I holding onto that the cycle is asking me to release?",
      "When have I felt victimised by circumstance? Can I see the same situation as an invitation?",
      "Am I attached to a specific outcome because it is right for me, or because it feels safe?",
      "The wheel turns for everyone. What phase am I currently in — rise, apex, or fall?",
    ],
    affirmations: [
      "I trust the rhythm of life.",
      "I flow with the cycles of change.",
      "What is meant for me will find its way to me.",
    ],
  },
  {
    cardName: "Justice",
    tags: ["truth", "fairness", "consequences", "law"],
    summary: "Truth and accountability are at the heart of this matter.",
    general:
      "Justice does not judge — she observes, weighs, and delivers based on the truth of what is before her. The law of cause and effect is absolute: every action carries its inevitable consequence. This is a card of clarity and honest reckoning. Are you seeing clearly, or are you seeing what you wish were true? Truth may be uncomfortable, but it sets you free. Seek the truth even when — especially when — it challenges what you believed about yourself.",
    love: null,
    career:
      "A situation requiring honest communication and transparent decision-making. If there have been abuses of power or unacknowledged truths in your professional environment, Justice asks that they be surfaced and addressed directly.",
    shadow: [
      "Where am I in denial about a truth I already know but have not wanted to acknowledge?",
      "Am I willing to see my own part in this situation, or am I casting myself fully as victim?",
      "What accountability have I been avoiding because it threatened my self-image?",
      "Is fairness guiding my choices — or is a desire for revenge?",
    ],
    affirmations: [
      "I speak and live in truth, even when it is uncomfortable.",
      "I accept the consequences of my actions with courage.",
      "Truth sets me free.",
    ],
  },
  {
    cardName: "The Hanged Man",
    tags: ["surrender", "perspective", "letting-go", "pause"],
    summary: "Suspend action — sometimes the greatest move is no move.",
    general:
      "The Hanged Man is not stuck — he has chosen to be still. This is the card of deliberate suspension: of pausing before a decision, of changing your vantage point before acting, of surrendering control in order to see more clearly. Resistance to this card creates suffering. Sometimes the most powerful action is to do nothing, to wait, to let an old self die so a new one can be born. Let go. Look from a different angle. Let the answer come.",
    love: null,
    career:
      "A pause may be needed before making a key decision or commitment. This can feel uncomfortable — especially in fast-moving professional environments — but the clarity gained is worth the wait.",
    shadow: [
      "Am I genuinely in a pause, or have I surrendered to learned helplessness?",
      "What would it cost me to be still right now when everything is urging me to act?",
      "What do I see differently when I stop trying to control the outcome?",
      "What am I avoiding by staying in this suspended state? There is a difference between waiting productively and waiting to avoid.",
    ],
    affirmations: [
      "Stillness is as powerful as action.",
      "I pause to gain clarity.",
      "I surrender control and trust the process.",
    ],
  },
  {
    cardName: "Death",
    tags: ["endings", "transformation", "transition", "rebirth"],
    summary: "Let the old self die — something new is being born.",
    general:
      "Death is not tragedy — it is the engine of all transformation. Something in your outer or inner world is ending, has ended, or is being asked to end. This is the most liberating card in the deck. If you are clinging to a situation, a self-image, a relationship, or a professional path, this card says: let it die. It is already dying. The only question is whether you will be present for your rebirth, or whether you will drag the corpse of what was into what is trying to be born.",
    love: null,
    career:
      "A significant ending in your professional life — whether a role, a project, a company, or a career path. This transition, however painful, is clearing the ground for your next chapter. Do not cling to the old structure out of familiarity.",
    shadow: [
      "What old story about myself am I ready to let die?",
      "Am I fighting this ending because it is painful, or because it is actually wrong for me? Feel the difference.",
      "What am I holding on to that the universe is clearly asking me to release?",
      "If I let this die — if I truly let it go — who am I without it?",
    ],
    affirmations: [
      "I release what no longer serves me with gratitude.",
      "Endings are the doorway to new beginnings.",
      "Out of death comes rebirth, and I trust the cycle.",
    ],
  },
  {
    cardName: "Temperance",
    tags: ["balance", "patience", "moderation", "synthesis"],
    summary: "Find the middle path — blend extremes into harmony.",
    general:
      "Temperance is the art of synthesis: bringing together opposing forces and blending them into something new. It is the card of balancing extremes — not by eliminating them but by finding the middle point where both can coexist. Patience is not passive here — it is active, intentional, and deeply self-aware. If you have been oscillating between extremes of behaviour, feeling, or thought, this card asks you to find the synthesis. True balance is not blandness — it is integration.",
    love: null,
    career:
      "A period of professional integration after a time of volatility. You may be finding a sustainable rhythm between ambition and rest, or between your personal values and professional demands.",
    shadow: [
      "What extremes am I alternating between, and what unprocessed tension lives between them?",
      "Have I been using 'balance' as an excuse for inaction or avoidance of necessary conflict?",
      "Where might a more moderate, sustainable approach serve me better than extreme shifts?",
      "What would integration — not compromise — look like in this situation?",
    ],
    affirmations: [
      "I find balance, not by eliminating extremes, but by holding them in harmony.",
      "Patience is my quiet power.",
      "I blend opposing forces into something greater than their sum.",
    ],
  },
  {
    cardName: "The Devil",
    tags: ["shadow", "bondage", "attachment", "materialism"],
    summary: "Face your chains — liberation begins with seeing them clearly.",
    general:
      "The Devil bound. This card reveals where you are bound by your own making: addictive patterns, co-dependent relationships, obsessive materialism, or self-limiting beliefs you have mistaken for immutable facts. The chains are yours — they feel binding because you have chosen not to examine them. The liberation is not about running from temptation — it is about looking directly at the binds and realising they have always been made of smoke. You are not a victim of your shadow. No one is. But you must choose to step into the light.",
    love: null,
    career:
      "An honest look at what you may be addicted to in your professional life: status, money, approval, overwork, control. These attachments may be driving choices that do not actually serve you.",
    shadow: [
      "What pattern or behaviour do I repeat compulsively, even when I know it harms me?",
      "Where am I blaming external forces for a bondage I have chosen?",
      "What would it mean to be truly free of this attachment — am I willing to face that emptiness?",
      "Is this a genuine demon, or have I inflated it beyond its actual size through avoidance?",
    ],
    affirmations: [
      "I am free to choose differently.",
      "I see my shadow and I am not owned by it.",
      "My chains are made of thought — I can think differently.",
    ],
  },
  {
    cardName: "The Tower",
    tags: ["upheaval", "revelation", "awakening", "breakthrough"],
    summary: "The structure falls — truth is revealed in the rubble.",
    general:
      "The Tower card is the other face of liberation — and it is never comfortable. Something built on a false foundation is coming down. The shock is real. The disruption is real. And you did not cause it — but you are being asked to be present for it, not to look away. What feels like catastrophe is actually the first breath after holding your breath for too long. A revelation that did not come through seduction or comfort is arriving. The rubble is clearing. Breathe in the new air.",
    love: null,
    career:
      "Sudden professional disruption — a restructure, a termination, a business loss, or an unexpected revelation about your industry or workplace. This is destabilising, but it is also clearing ground for something more aligned.",
    shadow: [
      "What false foundation am I mourning — and can I look honestly at whether it was ever truly mine?",
      "Am I angrier at the disruption or at myself for having built on unstable ground?",
      "Is there relief beneath the grief? Do not rush past it.",
      "What structure will I rebuild — and on what foundation?",
    ],
    affirmations: [
      "I breathe through the disruption and emerge on the other side.",
      "Rubble is the beginning of something more真实.",
      "I trust that revelation, however painful, is for my highest good.",
    ],
  },
  {
    cardName: "The Star",
    tags: ["hope", "renewal", "inspiration", "healing"],
    summary: "After the storm, there is always a star — and it is yours.",
    general:
      "You have survived. The Tower has fallen, and you are still standing. The Star is the breath after the wound — the oasis in the desert — the first light after a long darkness. Hope is not naive here; it is earned. You have earned it. Pour your energies into rebuilding, into healing, into the future you can almost taste. Be generous with your gifts — they were given to you for a reason, and sharing them does not diminish them.",
    love: null,
    career:
      "A professional recovery period after turbulence. Your sense of purpose and direction is rekindling. This is a positive, forward-looking energy — invest it wisely in projects and relationships that align with your core values.",
    shadow: [
      "Am I allowing myself to genuinely hope, or am I bracing for the next blow?",
      "What part of my spirit has been dimmed by recent suffering — and how do I tend to it?",
      "Have I been generous with what I have learned through my wounds?",
      "Where might I be undervaluing my recovery because it feels too simple after the intensity?",
    ],
    affirmations: [
      "I deserve hope.",
      "I pour my light into the world without holding anything back.",
      "After every darkness, a star appears — and it is mine.",
    ],
  },
  {
    cardName: "The Moon",
    tags: ["illusion", "intuition", "shadow", "fear"],
    summary: "Navigate uncertainty — some truths live only in the dark.",
    general:
      "The Moon illuminates a landscape that daylight cannot touch. Your subconscious is active, your instincts are heightened, but reason may be clouded. This is the card of navigating by feeling rather than by sight — trusting the inner knowing even when it cannot be articulated. Fear is present, but it may be a guide rather than an enemy. The path is not clear, but it exists. Move slowly and carefully. Let your intuition lead you through the dark.",
    love: null,
    career:
      "A period of professional uncertainty where the signs are ambiguous. Do not rush to conclusions or force clarity. Trust your instincts — they may be picking up on signals that are not yet visible.",
    shadow: [
      "What fear is trying to get my attention through this situation?",
      "Am I navigating by genuine intuition, or by anxiety dressed up as intuition? These feel different.",
      "What illusions am I holding that the Moon is asking me to examine?",
      "What is my subconscious trying to tell me that my waking mind has been dismissing?",
    ],
    affirmations: [
      "I trust myself to navigate through the dark.",
      "My intuition speaks to me in ways I am learning to understand.",
      "Even in uncertainty, I find my way.",
    ],
  },
  {
    cardName: "The Sun",
    tags: ["joy", "success", "vitality", "clarity"],
    summary: "Radiant success and pure joy are your inheritance.",
    general:
      "The Sun is unapologetically bright. Everything that was cloudy, uncertain, or heavy is illuminated. This is a card of pure, uncomplicated joy — not because the world is perfect, but because something within you has shifted toward it. Success is not promised in every dimension — this card speaks to the dimension of vitality, warmth, and joy. Let yourself feel it. You deserve to shine.",
    love: null,
    career:
      "A professional high point — recognition, achievement, or a period of effortless flow. Celebrate it without guilt. This energy is to be savoured, not managed.",
    shadow: [
      "Can I receive this joy without immediately searching for the catch or the next problem?",
      "Am I able to celebrate my wins without diminishing them?",
      "What part of my light have I been shrinking to fit into someone else's shadow?",
      "Is my joy genuine — or am I performing satisfaction for an audience?",
    ],
    affirmations: [
      "I let myself shine.",
      "I deserve joy without explanation or justification.",
      "The sun rises for me, too.",
    ],
  },
  {
    cardName: "Judgement",
    tags: ["rebirth", "reckoning", "calling", "awakening"],
    summary: "Answer the call — an inner awakening is requesting your presence.",
    general:
      "You are being called to account for yourself — not by an external judge, but by your own soul. This is the card of awakening: of seeing yourself clearly, of answering a higher call, of being reborn through the act of honest self-reflection. The question is not whether you will be judged — you are always judging yourself — but whether you will meet yourself with compassion while you do it. Answer the call. Rise.",
    love: null,
    career:
      "A professional reckoning or calling — you may be asked to step into a new role of leadership, purpose, or accountability. This can feel like an exam you did not study for, but the transition is yours to own.",
    shadow: [
      "Am I answering my calling, or avoiding it by numbing or staying small?",
      "What would 'compassionate accountability' look like if I applied it to myself right now?",
      "What story have I been telling myself about who I am — and is it true?",
      "What is my soul actually asking of me, beyond what my ego thinks it wants?",
    ],
    affirmations: [
      "I answer the call of my soul.",
      "I rise with compassion for myself.",
      "My awakening is my own — I own it.",
    ],
  },
  {
    cardName: "The World",
    tags: ["completion", "integration", "accomplishment", "wholeness"],
    summary: "A chapter closes — every ending is a door to wholeness.",
    general:
      "The World completes a cycle. Everything you have learned, struggled through, and grown into is being integrated. This is the card of arrival — not as a destination but as a coming-full-circle. The journey that began with The Fool has found its next orientation point. You have earned this moment of completion. Stand in it. Breathe in what you have become. Then turn — because another Fool's journey is already beginning.",
    love: null,
    career:
      "Completion of a major professional chapter — a project finished, a goal achieved, a cycle of work concluded. This is a natural closing point; use it to celebrate and to make intentional decisions about what comes next.",
    shadow: [
      "Can I allow myself to feel the fullness of this completion without immediately jumping to 'what is next'?",
      "What have I learned in this cycle that I will carry forward?",
      "Is there an old pattern I am tempted to repeat in the next cycle — and can I choose differently?",
      "What does wholeness feel like when I stop measuring it against where I thought I would be?",
    ],
    affirmations: [
      "I celebrate the completion of this cycle.",
      "I carry forward what I have learned with gratitude.",
      "I am whole, exactly as I am, in this moment.",
    ],
  },
];

// ─── MINOR ARCANA – WANDS ────────────────────────────────────────────────────

const WANDS: CardInterpretation[] = [
  {
    cardName: "Ace of Wands",
    tags: ["inspiration", "new-opportunities", "growth", "spark"],
    summary: "A creative spark ignites — new ventures waiting to be born.",
    general:
      "A creative spark arrives — fresh, powerful, and full of potential. This is the pure beginning of inspiration: an opportunity, a creative idea, or a burst of passion that fills you with purpose. The Ace of Wands does not promise specific outcomes — it offers the seed that grows into whatever you choose to cultivate. If you have been wondering whether you still have fire in you: here is your answer. Yes. Now decide what to do with it.",
    love: null,
    career: null,
    shadow: [
      "Am I sparks-flying but directionless — excited without intentionality?",
      "Where might I be chasing novelty rather than committing to see the spark through?",
      "What have I been waiting for permission to start that is mine to begin right now?",
    ],
    affirmations: [
      "I am inspired and ready to act.",
      "New creative opportunities flow to me.",
      "My passion is a gift — I fuel it with action.",
    ],
  },
  {
    cardName: "Two of Wands",
    tags: ["planning", "discovery", "decision", "exploration"],
    summary: "Standing at the crossroads of expansion — choose your direction.",
    general:
      "You have surveyed the territory and realised there is more to explore than you originally thought. The Two of Wands marks a moment of considered planning — you have done enough dreaming, and now it is time to commit to a direction. A decision, however partial, is the next necessary step. The horizon will not come to you; you must go to it.",
    love: null,
    career: null,
    shadow: [
      "Is my extended planning actually productive, or am I using it to delay committing?",
      "What is the first step I am avoiding because it commits me to a direction?",
      "Where might choosing a direction be the most expansive thing I could do right now?",
    ],
    affirmations: [
      "I am clear on my direction.",
      "I plan with intention and act with confidence.",
      "I choose my path and move toward it.",
    ],
  },
  {
    cardName: "Three of Wands",
    tags: ["expansion", "foresight", "progress", "overseas"],
    summary: "Your vision expands — what you planted is beginning to grow.",
    general:
      "The seeds you planted are taking root. Your vision — foreign, large, or unfamiliar when conceived — is beginning to materialise. This card is about expansion, foresight, and patience during a period of visible progress. Keep watching. Your patience will be rewarded. Travel, international affairs, and ideas beyond your immediate horizon are indicated. Expand your view.",
    love: null,
    career: null,
    shadow: [
      "Am I recognising my progress, or am I only seeing what is not yet here?",
      "Where might I be contracting when the energy is asking me to expand?",
      "What would it mean to look at my situation from a genuinely global perspective?",
    ],
    affirmations: [
      "My forward vision serves me well.",
      "I am patient with the unfolding of my plans.",
      "Expansion is my natural state.",
    ],
  },
  {
    cardName: "Four of Wands",
    tags: ["celebration", "home", "community", "harmony"],
    summary: "A celebration of belonging — community gathers in your honour.",
    general:
      "The work is done, and now is the time for joy. The Four of Wands marks celebrations of community and connection: weddings, reunions, housewarmings, feasts, and all the rituals that mark milestones and bind communities together. You are seen, you are welcomed, and you belong. Receive the celebration — give yourself permission to be the guest of honour.",
    love: null,
    career: null,
    shadow: [
      "Can I celebrate without guilt, without waiting to earn it?",
      "Where have I been isolating myself from community that actually wants me?",
      "What rituals or gatherings might I be avoiding because they ask me to soft-close a chapter?",
    ],
    affirmations: [
      "I belong.",
      "I celebrate with those who welcome me.",
      "Joy is a serious act of resistance.",
    ],
  },
  {
    cardName: "Five of Wands",
    tags: ["conflict", "diversity", "competition", "tension"],
    summary: "Creative tension abounds — multiple forces vie for direction.",
    general:
      "Many voices, many agendas, many perspectives — this is the card of productive conflict. Not all conflict is destructive: variety of thought creates the conditions for innovation, provided all voices can be heard. The Five of Wands invites you to wade into the creative tension without avoiding it, without demanding false harmony, and without escalating unnecessarily. Seek the signal within the noise.",
    love: null,
    career: null,
    shadow: [
      "Is this conflict genuine or manufactured — am I being triggered unnecessarily?",
      "Where might I be avoiding conflict that actually needs to happen?",
      "What is my part in perpetuating this competitive dynamic?",
    ],
    affirmations: [
      "I engage with tension with clarity and openness.",
      "I seek understanding, not victory.",
      "Creative tension leads to innovation.",
    ],
  },
  {
    cardName: "Six of Wands",
    tags: ["victory", "recognition", "success", "confidence"],
    summary: "You made it — your achievements are being seen and celebrated.",
    general:
      "Recognition arrives. Your work, your journey, your resilience — it is being witnessed. The Six of Wands is the energy of earned pride: not arrogance, but the healthy acknowledgment of genuine achievement. Others look to you as a symbol of what is possible. Let yourself receive this. The world needs to see that the path you walked is traversable.",
    love: null,
    career: null,
    shadow: [
      "Can I receive recognition without immediately deflecting it?",
      "Am I doing this for the external win, or for the internal one?",
      "Where might I be playing small to avoid the vulnerability of being seen?",
    ],
    affirmations: [
      "I receive recognition with gratitude and grace.",
      "My achievements are worthy of celebration.",
      "I allow myself to be seen in my full brilliance.",
    ],
  },
  {
    cardName: "Seven of Wands",
    tags: ["challenge", "perseverance", "defense", "persistence"],
    summary: "Standing your ground — your position is being tested.",
    general:
      "You have earned a position worth defending. The Seven of Wands is not passive resistance — it is active, assertive, and self-respecting. Someone or something is challenging you, and the world is asking whether your stance is worth holding. It is. You have done the work. Now hold your ground with integrity, without escalating unnecessarily. This battle is worth the effort.",
    love: null,
    career: null,
    shadow: [
      "Is this position actually mine to defend, or am I fighting a battle that was handed to me?",
      "Am I defending from a place of conviction, or from a fear of losing face?",
      "Where might I be giving up too quickly because the challenge feels personal rather than situational?",
    ],
    affirmations: [
      "I hold my ground with courage and integrity.",
      "My position is worth defending.",
      "I persist through challenges because I am worth it.",
    ],
  },
  {
    cardName: "Eight of Wands",
    tags: ["action", "speed", "progress", "movement"],
    summary: "Rapid movement — things are happening fast.",
    general:
      "Fast-moving energy. Progress that feels almost effortless arrives. The Eight of Wands suggests rapid movement of information, travel, projects, or communications. Things are moving — possibly too fast to fully process. This is generally a positive card of swift manifestation, but it asks for your attention: the speed means clarity of direction matters.",
    love: null,
    career: null,
    shadow: [
      "Am I moving fast because I am aligned and purposeful, or because I am avoiding stillness?",
      "What am I likely to overlook by moving this quickly?",
      "Where might I need to slow down to protect my health or my clarity?",
    ],
    affirmations: [
      "I move with purposeful speed.",
      "Progress happens smoothly and swiftly for me.",
      "I am in flow state.",
    ],
  },
  {
    cardName: "Nine of Wands",
    tags: ["resilience", "persistence", "courage", "near-victory"],
    summary: "One more push — you have come too far to stop now.",
    general:
      "You are tired. You have been through significant challenges. But you are still standing. The Nine of Wands is the card of last stands: of persisting when all logic says to rest, of digging deep because the mission is not yet complete. This is not reckless — it is earned resilience. You have proven you can handle hard things. One more push.",
    love: null,
    career: null,
    shadow: [
      "Am I persisting from genuine conviction, or from inability to rest?",
      "Is there a difference between a last stand and a learned inability to stop?",
      "What would it mean to ask for genuine support instead of white-knuckling through alone?",
    ],
    affirmations: [
      "I have come this far — and I carry on.",
      "Near-victory is still victory.",
      "I rest when I need to, and I rise when I am ready.",
    ],
  },
  {
    cardName: "Ten of Wands",
    tags: ["burden", "responsibility", "stress", "overload"],
    summary: "The load is heavy — how long can you carry it alone?",
    general:
      "The Ten of Wands is the honest mirror of overcommitment. You are carrying more than you need to carry — and the question is not whether you are strong enough, but whether the load is actually yours to bear alone. The burden you carry is heavy, but it is not equal in all dimensions — some elements are chosen, some are accumulated, and some can be laid down. Delegation is not weakness. Rest is not laziness.",
    love: null,
    career: null,
    shadow: [
      "What in this load is mine to carry — and what belongs to someone else?",
      "Am I carrying this weight to prove my worth, or because it genuinely serves the mission?",
      "Who or what am I avoiding asking for help?",
      "Is my martyrdom actually helping anyone, including me?",
    ],
    affirmations: [
      "I release what is not mine to carry.",
      "I ask for help and receive it.",
      "Rest is a prerequisite for the work, not a reward for its completion.",
    ],
  },
  {
    cardName: "Page of Wands",
    tags: ["exploration", "enthusiasm", "messages", "discovery"],
    summary: "A messenger of creative passion arrives.",
    general:
      "The Page of Wands brings news, ideas, or creative enthusiasm — often as a messenger from an unexpected direction. This is the energy of exploration for exploration's sake: of getting excited about a new area, a new project, or a new way of thinking. The Page is not yet mastery; it is the thrill of the beginner. Honour that thrill — but also be honest about whether you will invest in the follow-through.",
    love: null,
    career: null,
    shadow: [
      "Am I excited about this as an actual possibility, or as a form of escapism from my current reality?",
      "Am I willing to do the boring work of following through, or just the fun part of getting excited?",
      "What is this messenger asking me to pay attention to?",
    ],
    affirmations: [
      "My curiosity leads me somewhere meaningful.",
      "I explore with both joy and commitment.",
      "New possibilities open before me.",
    ],
  },
  {
    cardName: "Knight of Wands",
    tags: ["energy", "passion", "adventure", "impulsiveness"],
    summary: "Bold and blazing — charge toward your vision with purpose.",
    general:
      "The Knight of Wands charges forward with passion and fire. This is the energy of the bold warrior — confident, spontaneous, and ready to act. It is an uncomfortable energy for those who prefer to sit with decisions, but it is also deeply empowering for those who have been waiting for permission. The Knight may be impulsive — but the impulse is toward life, not away from it. Let yourself take the bold step.",
    love: null,
    career: null,
    shadow: [
      "Is my action arising from alignment, or from avoidance of the inner work?",
      "Where might my impulsiveness actually serve me when my excessive caution has not?",
      "Am I running toward something or away from something? Both are valid — be honest about which.",
    ],
    affirmations: [
      "I act with boldness and passion.",
      "I move toward my vision with courage.",
      "I am not waiting for permission to be great.",
    ],
  },
  {
    cardName: "Queen of Wands",
    tags: ["courage", "confidence", "warmth", "independence"],
    summary: "Bold warmth — fierce compassion and unshakable self-trust.",
    general:
      "The Queen of Wands embodies confident, warm, and fiercely independent energy. She is not intimidating in her power — she is magnetic. Her warmth draws people in; her courage inspires them. This is the energy of leading from the heart — of using your strength not to dominate but to illuminate. The Queen knows her own worth and does not perform for approval. Be her.",
    love: null,
    career: null,
    shadow: [
      "Is my confidence genuine, or is it a mask worn out of fear of being seen as insecure?",
      "Where might I be withholding warmth to protect myself from vulnerability?",
      "Does my independence come from strength, or from an inability to receive help?",
    ],
    affirmations: [
      "I am confident in who I am.",
      "My warmth is my strength, not my weakness.",
      "I lead with courage and compassion.",
    ],
  },
  {
    cardName: "King of Wands",
    tags: ["vision", "leadership", "boldness", "success"],
    summary: "Leader of vision — bold enough to build empires.",
    general:
      "The King of Wands represents mature, bold, visionary leadership. This is the energy of an entrepreneur who sees the landscape others cannot yet perceive — and has the discipline to bring it into being. The King is confident without arrogance, decisive without cruelty, and bold without recklessness. He has the authority that comes from earned experience. Claim your command.",
    love: null,
    career: null,
    shadow: [
      "Do I lead from vision and earned authority — or from the need to be seen as powerful?",
      "Is my boldness grounded in actual competence, or in the performance of it?",
      "Who am I leading — and am I lifting them up, or just using their energy to build my own kingdom?",
    ],
    affirmations: [
      "I lead with vision, boldness, and integrity.",
      "My authority is earned and I wield it wisely.",
      "I build what I envision.",
    ],
  },
];

// ─── MINOR ARCANA – CUPS ──────────────────────────────────────────────────────

const CUPS: CardInterpretation[] = [
  {
    cardName: "Ace of Cups",
    tags: ["new-love", "emotional-revelation", "compassion", "intuition"],
    summary: "The heart opens — a new flow of pure feeling arrives.",
    general:
      "An entirely new experience of feeling arrives — fresh, uncontaminated by past wounds, open and full. The Ace of Cups speaks to the newborn capacity for love, joy, compassion, and emotional depth. It is the pure capacity to feel and to give. If your heart has been guarded or numbed, this card is its invitation to re-open. You are capable of feeling deeply — that capacity has not left you, it has just been waiting for the right circumstances to re-emerge.",
    love: null,
    career: null,
    shadow: [
      "Is my heart intentionally closed, or have I simply forgotten it can be open?",
      "Am I afraid of this level of emotional openness because of what it might cost me?",
      "Where have I been using emotional control as a substitute for emotional intelligence?",
    ],
    affirmations: [
      "My heart is open and capable of deep feeling.",
      "I allow myself to love, fully and without fear.",
      "Compassion flows through me naturally.",
    ],
  },
  {
    cardName: "Two of Cups",
    tags: ["partnership", "unified-love", "mutual-attraction", "connection"],
    summary: "Two hearts in alignment — a connection of equals.",
    general:
      "A mutual meeting of equals: two people, two energies, two hearts — finding common ground and a creative chemistry that is more than the sum of their parts. The Two of Cups is not about dependency or clinging — it is about genuine mutual recognition and the joy that comes from being truly seen by another. Whether this represents a romantic connection, a soul friendship, or a creative partnership, the energy is one of balanced give and receive.",
    love: null,
    career: null,
    shadow: [
      "Is this a genuine meeting of equals — or a dynamic where one person is propping up the other?",
      "What am I actually seeking in this connection — completion, or complement?",
      "Where might I be blurring boundaries in the name of closeness?",
    ],
    affirmations: [
      "I meet others in genuine equality.",
      "My connections are mutual and balanced.",
      "I am deserving of being truly seen.",
    ],
  },
  {
    cardName: "Three of Cups",
    tags: ["celebration", "community", "friendship", "creativity"],
    summary: "Joy shared multiplies — community fills the cup.",
    general:
      "Three cups lifted in toast — community, friendship, creative collaboration, and shared celebration. The Three of Cups is the energy that reminds you how much you need your people and how much they need you. It is about joy that is meant to be shared: gatherings, creative evenings, reunions, the ritual of coming together and celebrating being alive together. Do not let isolation convince you that solitude is enough.",
    love: null,
    career: null,
    shadow: [
      "Am I isolating myself from community when I need it most?",
      "Where might I be performing contentment with solitude as a mask for connection I am afraid to seek?",
      "What would it mean to truly celebrate my own wins with others rather than dismissing them?",
    ],
    affirmations: [
      "My community is a source of joy and strength.",
      "I celebrate with others and they celebrate with me.",
      "Shared joy is multiplied.",
    ],
  },
  {
    cardName: "Four of Cups",
    tags: ["meditation", "contemplation", "apathy", "reevaluation"],
    summary: "Withdrawal into the self — is there a gift inside this disengagement?",
    general:
      "You are turning inward, disengaging from what is on offer, and examining your inner landscape for meaning. The Four of Cups can reveal a dangerous apathy — but it can also be a necessary contemplative withdrawal, a season of checking in with what you actually want versus what you have been accepting out of habit. The question is: are you seeing clearly, or are you numb? Use this moment to distinguish between the two.",
    love: null,
    career: null,
    shadow: [
      "Am I disengaging because of genuine disinterest, or because of fear of disappointment?",
      "What would it mean to be genuinely excited about something again?",
      "What is the underlying unmet need being pointed to by this sense of disconnection?",
    ],
    affirmations: [
      "I take time to reflect on what I truly want.",
      "I am present with what arises in stillness.",
      "I am not numb — I am learning to distinguish between real and performed feeling.",
    ],
  },
  {
    cardName: "Five of Cups",
    tags: ["loss", "grief", "forgiveness", "moving-on"],
    summary: "Loss and the choice within it — grief's invitation to let go.",
    general:
      "A loss has occurred — and the grief is real. The Five of Cups does not minimise suffering; it honours it. But it also places the figure looking only at the spilled cups — while behind them, the full cups wait. There is a grief that is appropriate and necessary; and there is a grief that becomes a perch from which we refuse to descend. The invitation is not to pretend you have not lost. It is to look up and see what remains that can still be filled.",
    love: null,
    career: null,
    shadow: [
      "What would 'moving toward the full cups' look like compared to staring at what spilled?",
      "There is a difference between grieving genuinely and grieving performatively. Which is this?",
      "Is forgiveness of myself — or of other — the missing piece here?",
    ],
    affirmations: [
      "I grieve what is lost — and I also see what remains.",
      "I forgive myself and others with compassion.",
      "My cup may be partially full, and it is still worth filling.",
    ],
  },
  {
    cardName: "Six of Cups",
    tags: ["nostalgia", "reminiscence", "innocence", "reunion"],
    summary: "Return to the source — a visit to what your heart remembers.",
    general:
      "A visit to the past — not as an escape, but as a source of nourishment. The Six of Cups is the card of innocent nostalgia, childhood joy, and the kind of emotional reconnection that does not require explanation. Reunions with old friends, the recollection of a simpler time, or the return to a place that holds your emotional history — these moments are not escapism when they are used wisely. They are medicine. Return to the source. Remember who you were. Let that informs who you are becoming.",
    love: null,
    career: null,
    shadow: [
      "Am I returning to the past for genuine nourishment, or to avoid the present's demands?",
      "Am I idealising a past that was, in truth, neither as golden nor as simple as I recall?",
      "What parts of my past-self do I most need to reconnect with right now?",
    ],
    affirmations: [
      "I return to my source with gratitude.",
      "My past nourishes my present.",
      "I am innocent and pure in my capacity for joy.",
    ],
  },
  {
    cardName: "Seven of Cups",
    tags: ["choices", "fantasy", "wishful-thinking", "options"],
    summary: "Many possibilities — but you must choose the real one.",
    general:
      "An overwhelming array of options, possibilities, fantasies, and desires — many of which cannot simultaneously coexist. The Seven of Cups asks you to be honest: are you genuinely considering your options, or are you luxuriating in the fantasy of infinite possibility as a way to avoid committing to one? Wishful thinking is seductive precisely because it carries no consequences. Reality does. Choose.",
    love: null,
    career: null,
    shadow: [
      "Am I exploring possibilities, or am I avoiding the discomfort of choosing one and failing?",
      "Is 'keeping my options open' actually a form of commitment paralysis?",
      "Which of these options, if chosen, would actually lead to a life I want to live?",
    ],
    affirmations: [
      "I choose what is real over what is wished.",
      "I commit to my path without resentment.",
      "Clarity comes from choosing, not from endless consideration.",
    ],
  },
  {
    cardName: "Eight of Cups",
    tags: ["letting-go", "disillusionment", "walking-away", "moving-on"],
    summary: "Leaving what no longer nourishes — walking away with integrity.",
    general:
      "You are leaving something behind — not in anger, but in quiet disengagement. The Eight of Cups marks the moment when you have accepted that something no longer nourishes you the way it once did: a job, a relationship, a belief, a role. Walking away is not failure — it is an act of self-respect. The hardest part is not the leaving; it is the quiet guilt that follows: the question of whether leaving was the right choice. It was. Move on.",
    love: null,
    career: null,
    shadow: [
      "What am I leaving — and more importantly, what am I afraid of becoming if I stay?",
      "Do I judge myself for walking away? Can I hold that judgment with kindness?",
      "What does this departure reveal about my evolving relationship with my own needs?",
    ],
    affirmations: [
      "It is okay to walk away from what no longer serves me.",
      "I leave with grace, not with guilt.",
      "My integrity is more important than my comfort.",
    ],
  },
  {
    cardName: "Nine of Cups",
    tags: ["wish-fulfillment", "satisfaction", "contentment", "gratitude"],
    summary: "A wish granted — standing in the warmth of genuine content.",
    general:
      "The Nine of Cups is the fairy-tale satisfaction card: wishes fulfilled, hearts content, the emotional life gently rewarded. This is not about excess or overindulgence — it is about the quiet, profound satisfaction of a wish granted at exactly the right time. Allow yourself to enjoy this without immediately scanning for the catch. Rest here. Receive it.",
    love: null,
    career: null,
    shadow: [
      "Can I receive satisfaction without immediately calculating when the other shoe will drop?",
      "Is there something I have not let myself want — simply because wanting and not receiving was too painful?",
      "Am I allowing myself to enjoy abundance, or do I habitually undersell my own good fortune?",
    ],
    affirmations: [
      "My wishes come true.",
      "I allow myself to enjoy what I have earned.",
      "Abundance is my birthright and I receive it with gratitude.",
    ],
  },
  {
    cardName: "Ten of Cups",
    tags: ["divine-love", "blissful-family", "harmony", "home"],
    summary: "Emotional fulfillment — home is where the heart rests.",
    general:
      "The Ten of Cups represents the highest form of emotional fulfillment: love, belonging, domestic bliss, and harmony in relationship. This is not the romance of new love, but the settled peace of a life in which emotional needs are genuinely met. If you are there: treasure it and tend it. If you are not yet there: the aspiration is valid, and the question is not whether you deserve it — you do — but what you are willing to build and maintain to create it.",
    love: null,
    career: null,
    shadow: [
      "Is my pursuit of domestic harmony actually serving my deepest needs, or someone else's idea of success?",
      "Am I able to be at peace without the external structure of the Ten of Cups? Can I feel full within?",
      "What am I willing to build and maintain to create the home I want?",
    ],
    affirmations: [
      "I create home wherever I go.",
      "My emotional needs are valid and I meet them with care.",
      "Harmony and love are the foundation of my life.",
    ],
  },
  {
    cardName: "Page of Cups",
    tags: ["creative-expressions", "curiosity", "intuition", "discovery"],
    summary: "A message from the inner child — follow the feeling.",
    general:
      "The Page of Cups is the messenger between worlds: the rational surface and thefeeling ocean beneath. This is the energy of creative emotional exploration — of following an intuitive hit even when it cannot be logically explained, of letting your inner child speak without adult rationalisation. Ideas, synchronicities, and creative messages may arrive through dreams, gut feelings, or unexpected emotional impressions. Follow it.",
    love: null,
    career: null,
    shadow: [
      "Am I trusting this feeling, or dismissing it as childish or irrational?",
      "Where have I been telling myself that what I feel is not valid enough to act on?",
      "How can I create a channel for my emotional intelligence to speak without shutting it down?",
    ],
    affirmations: [
      "My feelings carry wisdom.",
      "I trust my inner child's message.",
      "I let my intuition guide me.",
    ],
  },
  {
    cardName: "Knight of Cups",
    tags: ["romance", "charm", "imagination", "sentimentality"],
    summary: "The romantic ideal — feeling in motion.",
    general:
      "The Knight of Cups rides on a wave of romantic energy — whether that is the literal romance of partnership, the romantic idealism of artistic expression, or the emotional idealism of a vision for the world. This energy is powerful, magnetic, and deeply feeling-led. It can also be flighty if left unmanaged. The question is not whether this energy is real — it is — but whether it will be channeled into something that lasts or dissipated into sentiment.",
    love: null,
    career: null,
    shadow: [
      "Is this romantic ideal grounded in reality, or is it a fantasy I am choosing to live inside?",
      "What would it mean to be romantically practical without killing the romance?",
      "Am I using emotional imagination to escape from the mundane in ways that are ultimately counterproductive?",
    ],
    affirmations: [
      "I channel my romantic heart into real, grounded action.",
      "My loving nature is a gift, not a vulnerability.",
      "I am present in my emotions without being ruled by them.",
    ],
  },
  {
    cardName: "Queen of Cups",
    tags: ["compassion", "intuition", "emotional-intelligence", "receptivity"],
    summary: "Deep feeling guided by wisdom — the heart's quiet command.",
    general:
      "The Queen of Cups is the embodiment of mature emotional intelligence: she feels deeply and she feels accurately, and she holds all of it with compassion. The Queen does not suppress, perform, or abandon her emotions — she receives them, understands them, and derives wisdom from them. Her power is invisible and deeply felt by everyone around her. This is the most emotionally intelligent card in the deck.",
    love: null,
    career: null,
    shadow: [
      "Is my compassion selective — do I give it more freely to others than to myself?",
      "Can I use my sensitivity as an asset, or does it only function as a liability in my life?",
      "Am I tending to my emotional wellbeing, or is all of it flowing out to others at my own expense?",
    ],
    affirmations: [
      "My emotional intelligence is a profound gift.",
      "I hold myself with the same compassion I hold others.",
      "I feel deeply and act wisely.",
    ],
  },
  {
    cardName: "King of Cups",
    tags: ["emotional-mastery", "diplomacy", "compassion", "balance"],
    summary: "Mastery of emotion — the heart steady at the helm.",
    general:
      "The King of Cups represents the mastery of the emotional realm: the capacity to hold deep feeling without being controlled by it, to lead from the heart without capitulating to sentiment, and to maintain emotional equilibrium even in very difficult circumstances. This is wisdom earned through the emotional journey. If you see this card, you are being asked: have I achieved this balance — or am I still at its mercy?",
    love: null,
    career: null,
    shadow: [
      "Do I lead emotionally, or am I manipulated by the emotional currents around me?",
      "Am I using emotional mastery as a form of emotional suppression that looks like control?",
      "How present am I to my own emotional life versus managing everyone else's?",
    ],
    affirmations: [
      "I hold my emotions with mastery and grace.",
      "My emotional wisdom guides my decisions.",
      "I am steady at the helm.",
    ],
  },
];

// ─── MINOR ARCANA – SWORDS ────────────────────────────────────────────────────

const SWORDS: CardInterpretation[] = [
  {
    cardName: "Ace of Swords",
    tags: ["breakthrough", "clarity", "truth", "sharp-mind"],
    summary: "A new clarity arrives — cut through to the truth.",
    general:
      "A sharp new truth cuts through confusion — a breakthrough moment of clarity, a fresh intellectual perspective, or an honest reckoning that has been too long deferred. The Ace of Swords is the lightning flash of insight: not comfortable, but essential. Something that was previously veiled is now visible. Something that was previously accepted is now being questioned. The cut is precise and the clarity that follows is worth the sting.",
    love: null,
    career: null,
    shadow: [
      "What truth have I been avoiding because seeing it clearly would cost me something?",
      "Am I using this new clarity to see more truly, or to sharpen my attack on others?",
      "What would my life look like if the truth I fear were already known and survived?",
    ],
    affirmations: [
      "I see clearly and speak truth with compassion.",
      "My mind cuts through confusion to find the essential.",
      "I use my sharp intellect in service of my highest good.",
    ],
  },
  {
    cardName: "Two of Swords",
    tags: ["indecision", "stalemate", "avoidance", "blocked-options"],
    summary: "Decision is blocked by equal weight — until it is not.",
    general:
      "A stalemate: the figure stands blindfolded between two swords of equal weight, aware of the choice but unable to resolve it. The Two of Swords is not paralysis through confusion — it is the deliberate or unconscious suspension of a decision that feels impossible not because it is difficult, but because the options feel genuinely equal. This stalemate cannot be resolved intellectually. The heart must eventually choose — or circumstances must choose for you.",
    love: null,
    career: null,
    shadow: [
      "Am I genuinely unable to choose, or am I choosing avoidance because choice carries accountability?",
      "Is the equal weight of options real — or have I constructed a false equivalence to maintain the stalemate?",
      "What would happen if I trusted myself to make this choice and let the other option go?",
    ],
    affirmations: [
      "I trust myself to choose even when it is hard.",
      "My heart knows what my mind cannot decide.",
      "I release the option I am not choosing with grace.",
    ],
  },
  {
    cardName: "Three of Swords",
    tags: ["heartbreak", "grief", "painful-truth", "sorrow"],
    summary: "Heart pierced — grief that will not be bypassed.",
    general:
      "Three swords pierce the heart — grief, heartbreak, and the pain of a truth that cannot be softened with time or bypassed with avoidance. The Three of Swords does not minimise emotional pain. It speaks to the kind of sorrow that, when fully felt, is actually the precondition for healing. You cannot go through this card — you must go through it, which is different, and more honest, and also more human.",
    love: null,
    career: null,
    shadow: [
      "Am I trying to bypass this pain rather than move through it?",
      "What is my grief actually about — the loss itself, or the story I have been telling about it?",
      "If I let myself fully feel this, rather than managing it — what becomes possible?",
    ],
    affirmations: [
      "I feel my grief without judgment.",
      "Pain that is fully felt eventually passes.",
      "I do not bypass the wound — I tend it.",
    ],
  },
  {
    cardName: "Four of Swords",
    tags: ["rest", "restoration", "retreat", "sanctuary"],
    summary: "The body rests — the soul is doing its deeper work.",
    general:
      "Intentional withdrawal into rest, restoration, and sanctuary. The Four of Swords is the card that says: you have done enough for now. The world will wait. Your body, your nervous system, your overextended mind — they are asking for sleep, for stillness, for sanctuary. This is not weakness or avoidance. It is wisdom. You can come back when you have rested. The work will still be there — and you will be better for the return.",
    love: null,
    career: null,
    shadow: [
      "When did I last give myself permission to truly rest? Be honest.",
      "Am I actually resting, or am I anxiously checking in during my supposed downtime?",
      "What does my inability to rest actually tell me about my relationship with enough-ness?",
    ],
    affirmations: [
      "I give myself permission to rest deeply.",
      "Stillness is not withdrawal — it is restoration.",
      "The world will wait while I tend to myself.",
    ],
  },
  {
    cardName: "Five of Swords",
    tags: ["conflict", "defeat", "winning", "pyrrhic-victory"],
    summary: "Winning through conflict — the real cost is silent.",
    general:
      "The card of winning at the cost of everything that made winning worth having. The Five of Swords reveals the hollow victory: you technically prevailed, but the cost was your integrity, your relationship, or your peace of mind. The smirk on the winning figure's face is already fading. This is the truth about conflicts won through cruelty or manipulation: the cost always exceeds the benefit. Take stock.",
    love: null,
    career: null,
    shadow: [
      "What have I won at a cost that is now revealing itself as too high?",
      "Am I the winner, the loser, or the silent bystander in this dynamic — and do I know which one I am?",
      "What would it look like to lose this conflict gracefully and win something more valuable instead?",
    ],
    affirmations: [
      "I choose integrity over hollow victory.",
      "I am willing to lose an argument and win a relationship.",
      "I release the need to be right.",
    ],
  },
  {
    cardName: "Six of Swords",
    tags: ["transition", "ritual", "moving-through", "passage"],
    summary: "Passage through difficulty — the destination is calmer water.",
    general:
      "A passage across water — you are leaving something behind and moving toward something more peaceful. The Six of Swords marks the transition through difficulty: the journey from turbulence to calm, from loss to a new normal, from crisis to recovery. This is not a dramatic, triumphant crossing — it is a quiet, steady passage with your few irreplaceable possessions, toward water that is calmer. Trust it.",
    love: null,
    career: null,
    shadow: [
      "What are the irreplaceable things I am carrying with me on this passage?",
      "Am I ready to release the turbulence without carrying it into the calmer water?",
      "The passage is underway. Can I be present for the journey rather than grieving the departure?",
    ],
    affirmations: [
      "I am moving into calmer waters.",
      "I carry what is precious and release what weighs me down.",
      "The passage through difficulty leads me home.",
    ],
  },
  {
    cardName: "Seven of Swords",
    tags: ["deception", "strategy", "secrets", "stealth"],
    summary: "Something hidden moves — intentions that are not fully on the table.",
    general:
      "A figure moves with swords concealed — the Seven of Swords reveals that something is hidden, or that intentions are not fully disclosed. This may be about cunning strategy and stealth — legitimate tactics when used with integrity — or it may be about deception, lying outright, or self-deception. The question is not just what others are hiding from you, but what you are hiding from yourself.",
    love: null,
    career: null,
    shadow: [
      "What am I hiding — or does this card indicate someone else's concealment?",
      "Is my 'strategy' actually a form of dishonesty — or is there a legitimate tactical reason to keep this close?",
      "What am I lying to myself about? Is there a truth I know but have not acknowledged, or chosen to act on?",
    ],
    affirmations: [
      "I align my inner world with my outer actions.",
      "I speak my truth even when it is difficult.",
      "I am honest with myself and with others.",
    ],
  },
  {
    cardName: "Eight of Swords",
    tags: ["restriction", "trapped", "self-imprisonment", "self-pity"],
    summary: "Binding self-perception — the prison is internal.",
    general:
      "A figure bound and blindfolded — but the swords are not tightly secured, and the binding is not truly inescapable. The Eight of Swords reveals self-imprisonment: the perception of being trapped when the exit exists but can not be seen. This is not about external constraints alone — it is about the internal prison of self-limiting beliefs, learned helplessness, or self-pity. Remove the blindfold. The way out exists.",
    love: null,
    career: null,
    shadow: [
      "Am I actually trapped — or have I constructed a prison from which I could walk out if I chose?",
      "What blindfold prevents me from seeing options that are actually available?",
      "Is this suffering genuine — or am I performing it to manage an unacknowledged fear of responsibility?",
    ],
    affirmations: [
      "I remove my own blindfold.",
      "My prison is internal — and so is my key.",
      "I see clearly now.",
    ],
  },
  {
    cardName: "Nine of Swords",
    tags: ["anxiety", "anguish", "nightmares", "cruel-past"],
    summary: "The darkest hour before dawn — waking from the nightmare.",
    general:
      "Sitting upright at 3am in anguish — the Nine of Swords is the card of anxiety, nightmares, and the torture of a mind that will not quiet. This is not about the difficulty of life — it is about the suffering of the mind that interprets the difficulty as catastrophic. The world is not actually collapsing — but in the night, it feels that way. You are not alone in this darkness, however isolated it makes you feel. The dawn is coming.",
    love: null,
    career: null,
    shadow: [
      "Is this anxiety proportionate to the actual threat — or is my mind generating catastrophes that do not exist?",
      "What am I most afraid of — and what happens if I bring it fully into the light of day?",
      "What would it cost me to ask for help with this specific form of suffering?",
    ],
    affirmations: [
      "Not every fear is a real threat.",
      "I allow the anxiety to flow through me without believing its story.",
      "Dawn comes. I hold on until it does.",
    ],
  },
  {
    cardName: "Ten of Swords",
    tags: ["endings", "betrayal", "rock-bottom", "painful-finality"],
    summary: "The final fall — and the first moment of new recovery.",
    general:
      "Ten swords in the back — betrayal, painful finality, total collapse, rock bottom. The Ten of Swords does not offer comfort — it offers brutal honesty: this is the worst. What is done cannot be undone. What is lost is lost. But — and this is the most important but in the entire deck — ten swords also means nothing left to fall, and no sword that can be added that has not already been added. This is the last moment of the last dark night. From here, there is only new recovery. There is a perverse gift in total destruction: it is the only complete beginning.",
    love: null,
    career: null,
    shadow: [
      "This is the bottom. Can I, from here, for the first time see above me clearly?",
      "What would I do differently if I knew there was nothing left to lose?",
      "Who am I when all the scaffolding is removed? There is freedom in this destruction.",
    ],
    affirmations: [
      "Rock bottom is not where my story ends.",
      "Out of total destruction comes total freedom.",
      "The first step of recovery begins here.",
    ],
  },
  {
    cardName: "Page of Swords",
    tags: ["curiosity", "new-ideas", "thirst-for-knowledge", "youthful-mind"],
    summary: "A sharp young mind arrives — cutting edge and hungry for truth.",
    general:
      "A young sharp figure holding a sword upright — curiosity, intellectual energy, and a fierce thirst for truth. The Page of Swords is the energy of the hungry mind: asking difficult questions, refusing easy answers, knowing that the search itself is the point. This can manifest as youthful idealism, social justice energy, or the kind of nervousness that comes from caring about truth in a world that does not always reward it. Keep asking.",
    love: null,
    career: null,
    shadow: [
      "Is my intellectual energy directed toward understanding — or is it a form of over-intellectualising as a way to avoid emotional processing?",
      "Am I asking questions to find truth, or to score points?",
      "Where might my sharpness be alienating people who actually need to hear what I have to say?",
    ],
    affirmations: [
      "I ask difficult questions with curiosity and courage.",
      "My sharp mind serves truth.",
      "I use my intellect with compassion.",
    ],
  },
  {
    cardName: "Knight of Swords",
    tags: ["action", "ambition", "intellectual-drive", "fast-thinking"],
    summary: "Charge of the analytical mind — racing toward clarity.",
    general:
      "The Knight charges forward with a single sword raised — all focus, all drive, all ambition in the pursuit of a goal. The Knight of Swords is pure intellectual ambition and determination: the scholar who forgets to sleep, the activist who will not be silenced, the thinker who will not soften their position. Their intensity is their gift and their limitation — they move so fast they sometimes charge past the truth they are seeking.",
    love: null,
    career: null,
    shadow: [
      "Am I racing toward a goal — or racing away from having to sit with something slower and harder inside myself?",
      "Where might my intellectual intensity be causing collateral damage to people who are not actually obstacles?",
      "Is this drive grounded in passion — or in a fear that stillness means vulnerability?",
    ],
    affirmations: [
      "I take decisive action in alignment with my truth.",
      "My ambition serves my purpose.",
      "I balance action with presence.",
    ],
  },
  {
    cardName: "Queen of Swords",
    tags: ["independence", "clear-perception", "direct-communication", "boundaries"],
    summary: "Sovereign clarity — the heart that speaks difficult truths.",
    general:
      "The Queen of Swords sits tall and sovereign — sharp intelligence meets emotional depth in a figure who will not soften truth for comfort's sake. She is not cruel — she is honest in a way that is experienced as cruelty only by those who needed the lie. Her boundaries are clear, her communication is direct, and her emotional intelligence — even if it does not wear sentiment on its surface — is profound. She does not require others to understand her.",
    love: "An emotionally intelligent partner who speaks plainly and holds their boundaries clearly — directness that can feel intimidating but is fundamentally trustworthy.",
    career: null,
    shadow: [
      "Is my directness actually in service of truth — or is it a form wound that has calcified into sharpness?",
      "Am I protecting my boundaries hard-edly — or have I sealed off access to the parts of myself that are actually soft?",
      "Can I be both sharp and kind — or do I see these as mutually exclusive?",
    ],
    affirmations: [
      "I speak truth with clarity and compassion.",
      "My boundaries are clear, respected, and mine to set.",
      "Sharp intelligence and deep feeling coexist within me.",
    ],
  },
  {
    cardName: "King of Swords",
    tags: ["authority", "truth", "clarity", "intellectual-power"],
    summary: "The mind's throne — truth as the highest form of power.",
    general:
      "The King sits on a throne of intellect and truth — authority derived not from birthright or force but from a profound mastery of the rational mind and its application to difficult questions. The King of Swords does not indulge in rhetoric or performance — he cuts through to the essential with precision. He rules through justice, truth, and fairness, not through showmanship. His power is quiet and absolute.",
    love: null,
    career: null,
    shadow: [
      "Is my intellectual authority earned through genuine mastery — or through the performance of being right?",
      "Am I wielding the sword of truth to help — or to dominate?",
      "Where might my respect for intelligence be blinding me to wisdom that is not purely rational?",
    ],
    affirmations: [
      "I wield intellectual power with integrity.",
      "I speak truth from a place of mastery, not domination.",
      "My mind is a throne from which I rule with fairness.",
    ],
  },
];

// ─── MINOR ARCANA – PENTACLES ────────────────────────────────────────────────

const PENTACLES: CardInterpretation[] = [
  {
    cardName: "Ace of Pentacles",
    tags: ["new-financial-opportunity", "manifestation", "abundance", "prosperity"],
    summary: "A seed of abundance drops — material opportunities taking root.",
    general:
      "A coin offered from above — the Ace of Pentacles is the seed of material and financial abundance: new income streams, practical opportunities, the first physical manifestation of effort. This is not about abstract abundance thinking — it is about the grounded, earthy reality of manifestation in the material realm: a job, an investment, a property, a health improvement. Ground your aspirations here. The world rewards those who build with their hands.",
    love: null,
    career: null,
    shadow: [
      "Am I 'manifesting' as an excuse to not take the practical, unglamorous steps that actually produce results?",
      "What is the material reality of my current situation — what needs tending at the root?",
      "Is my relationship with money and abundance one of shame, avoidance, or genuine clarity?",
    ],
    affirmations: [
      "I plant seeds of abundance in a fertile ground.",
      "Material prosperity flows to me through practical, grounded action.",
      "I receive and steward resources well.",
    ],
  },
  {
    cardName: "Two of Pentacles",
    tags: ["balance", "adaptability", "time-management", "prioritisation"],
    summary: "Juggling multiple priorities — maintain balance with grace.",
    general:
      "A figure juggling two coins — this is the card of balancing multiple priorities, managing competing demands, and adapting to changing circumstances. The Two of Pentacles is not about perfection in any one area — it is about maintaining equilibrium while moving. The risk is dropping something — and the skill is knowing what to drop. The figure smiles — the key is the dance, not the relentless pursuit of stability.",
    love: null,
    career: null,
    shadow: [
      "Am I genuinely juggling many things well — or am I one ball away from collapse and calling it 'on top of everything'?",
      "What happens if I prioritise one thing and deprioritise another — am I ready for that grief?",
      "This balance I am juggling — is it genuinely mine, or did someone hand it to me without asking?",
    ],
    affirmations: [
      "I maintain balance across the domains of my life.",
      "I adapt to changing circumstances with grace.",
      "I am capable of juggling multiple priorities without dropping my centre.",
    ],
  },
  {
    cardName: "Three of Pentacles",
    tags: ["teamwork", "collaboration", "skills", "implementation"],
    summary: "Craftspeople at work — skilled hands build together.",
    general:
      "The Three of Pentacles shows a team of skilled people working together — each contributing their particular craft to create something none of them could build alone. This is the card of collaborative mastery: of team acknowledgment, of feedback loops that make the work better, of the humble recognition that excellent outcomes require multiple talents. If you are working alone, ask: where do I need help I have not yet asked for?",
    love: null,
    career: null,
    shadow: [
      "Am I claiming sole credit for something that was genuinely collaborative?",
      "What skills do others have that I am dismissing because they threaten my sense of unique contribution?",
      "Whose work am I overlooking because of my own need to be the one whose work is seen?",
    ],
    affirmations: [
      "I collaborate with skilled people and create something greater than the sum of our parts.",
      "I acknowledge the value of every contributor.",
      "My skills contribute to a shared vision.",
    ],
  },
  {
    cardName: "Four of Pentacles",
    tags: ["security", "conservation", "resource-control", "stability"],
    summary: "Clutching and shielding — what are you holding so tightly that it limits you?",
    general:
      "A figure clutching four coins with visible arms, shielding one — the Four of Pentacles marks the fear-based relationship with resources: the hoarding tendency, the inability to give or receive financial flow, the constant anxiety about not having enough. Security is a legitimate human need — but when it becomes the dominant organising principle of life, it calcifies into miserliness. Ask: what am I holding so tightly that it is actually diminishing in my grip?",
    love: "A partner who is generous with emotional stability but guarded with financial resources — a need for control that may stem from scarcity wounds.",
    career: null,
    shadow: [
      "Is my financial caution truly prudent — or is it a repetition of early scarcity that has no present basis?",
      "Am I holding so tightly to what I have that I am preventing abundance from flowing through me?",
      "What would it feel like to release my grip — and what is the exact fear I am protecting against?",
    ],
    affirmations: [
      "Abundance flows through me, not to me.",
      "I release my grip and allow life to provide.",
      "I have enough — and I am enough.",
    ],
  },
  {
    cardName: "Five of Pentacles",
    tags: ["hardship", "isolation", "worry", "spiritual-emergency"],
    summary: "Walking through the dark — the light is closer than you see.",
    general:
      "Two figures walk past a church in financially visible hardship — the Five of Pentacles marks a period of scarcity, worry, or hardship that can feel endless. The church is always there, its windows lit, its door open. But the figures walk past because — and this is the card's central truth — the hardship has become a lens that shows nothing but darkness. The resource is not absent; it is unperceived. If you are in a difficult phase: look at the windows. The help exists.",
    love: "A love that cannot meet your needs in the way you need them met — not because the love is absent, but because neither party can see clearly in the dark.",
    career: null,
    shadow: [
      "Am I walking past help that is actually available — and my scarcity lens is simply not perceiving it?",
      "Would reaching out cost me something so precious that it is not worth the reach? Or is that the lie I tell myself?",
      "What story am I telling about my financial scarcity — and is it as fixed and permanent as it feels?",
    ],
    affirmations: [
      "Help is available — I open my eyes to see it.",
      "I am never as alone as I feel.",
      "I receive with open hands what the universe provides.",
    ],
  },
  {
    cardName: "Six of Pentacles",
    tags: ["generosity", "giving-receiving", "sharing", "charity"],
    summary: "The flow of giving and receiving — one hand open, one hand holding.",
    general:
      "The Six of Pentacles balances giving and receiving — the honest flow of resources: money, time, care, attention. Generosity is not charity; it is a cy cling system in which what flows out comes back. Receiving is as courageous as giving — it is the other half of the equation. If you have been hoarding, give. If you have been depleted without receiving, ask for help. Both require vulnerability. Both are acts of trust.",
    love: null,
    career: null,
    shadow: [
      "Is my giving genuine, or does it come with strings that make it conditional?",
      "Am I able to receive — or do I deflect gifts and help because of pride or a discomfort with owed debts?",
      "Where have I been giving without boundaries in a way that has depleted me?",
    ],
    affirmations: [
      "I give freely and receive gracefully.",
      "Generosity flows both ways.",
      "I balance giving and receiving with honest awareness.",
    ],
  },
  {
    cardName: "Seven of Pentacles",
    tags: ["long-term-project", "patience", "investment", "delayed-gratification"],
    summary: "The gardener pauses — will the seeds grow?",
    general:
      "A figure pauses in the garden, leaning on their hoe — the Seven of Pentacles marks the moment in a long project when you must assess: is this going to grow? Have I planted this in the right soil? Is the investment worth continuing? This card asks for honest patience rather than panicked abandonment or continued blind investment. The question is not 'will I ever see a return?' — it is: 'do I still believe in this path enough to keep tending it?'",
    love: null,
    career: null,
    shadow: [
      "Am I still invested in this because I believe in it — or because I am afraid to admit I planted the wrong seeds?",
      "What would it cost me to honestly assess whether this effort is worth it — and am I willing to pay that cost?",
      "Is my patience grounded in actual faith, or in a refusal to acknowledge a sunk cost?",
    ],
    affirmations: [
      "I invest my energy wisely and patiently.",
      "I am willing to honestly assess my investments.",
      "Patience and honest evaluation are both my allies.",
    ],
  },
  {
    cardName: "Eight of Pentacles",
    tags: ["apprenticeship", "dedication", "mastery", "quality-craft"],
    summary: "The artisan's focus — dedication to the craft.",
    general:
      "An artisan at work on eight pentacles arranged before them — the Eight of Pentacles is the pure energy of dedicated, focused, skillful work. This is the card of apprenticeship: of showing up, doing the unglamorous work daily, and slowly — over time — developing genuine mastery. There are no short-cuts. There is only the repetition of skilled effort. If you see this card, you are being called to recommit to craft, to quality, and to the long view.",
    love: null,
    career: null,
    shadow: [
      "Is my apparent dedication actually avoidance of a bigger existential question about whether this work matters?",
      "Am I sacrificing the present for a future efficiency — or am I genuinely committed to mastery?",
      "Where might I be doing the work without joy — and what is the cost of that deprivation?",
    ],
    affirmations: [
      "I commit to mastery through daily dedicated practice.",
      "Quality craftsmanship is a form of worship.",
      "I show up for my work with consistent skill and care.",
    ],
  },
  {
    cardName: "Nine of Pentacles",
    tags: ["abundance", "luxury", "self-sufficiency", "earned-rewards"],
    summary: "Abundance earned — the five-star garden you built with your own hands.",
    general:
      "A woman in a walled garden with nine pentacles — the Nine of Pentacles represents abundance earned through your own sustained effort: the five-star life that emerged from years of patient building, the luxury that was not inherited but created. This card celebrates the mature pleasure of a life well-expressed, of self-sufficiency, and of the beauty that your own hands have grown given the right conditions. Enjoy it fully.",
    love: null,
    career: null,
    shadow: [
      "Can I receive enjoyment of what I have built without guilt — or do I make myself wrong for succeeding?",
      "Have I inadvertently walled myself in with my own success — and isolated myself from intimacy?",
      "What part of my abundance is mine alone to enjoy, and what part is shared — and am I clear about the difference?",
    ],
    affirmations: [
      "I enjoy what I have earned.",
      "My self-sufficiency is a genuine achievement.",
      "I deserve the garden I have grown.",
    ],
  },
  {
    cardName: "Ten of Pentacles",
    tags: ["family-blessing", "legacy", "inheritance", "long-term-success"],
    summary: "Family prosperity — legacy that outlasts the individual.",
    general:
      "Three generations gathered — the Ten of Pentacles represents the culmination of family wealth, resources, and legacy: long-term security, inherited abundance, generational success. This is the material life at its most stable and enduring. It speaks to the question of what you are building that will outlast you, and to the complicated dynamics of generational wealth and responsibility. It also speaks to the fact that you are the inheritor of both beauty and wounds in equal measure.",
    love: null,
    career: null,
    shadow: [
      "What legacy am I building — and for whom? Am I building for myself or for a family I am trying to please or impress?",
      "What did I inherit that I need to honestly separate from my own earned identity — the wealth or the wounds?",
      "What will outlast me — and is that thought comfortable or uncomfortable?",
    ],
    affirmations: [
      "I receive the gifts of my lineage with honesty.",
      "I build for enduring impact.",
      "Family legacy is both my inheritance and my invitation.",
    ],
  },
  {
    cardName: "Page of Pentacles",
    tags: ["manifestation", "opportunity", "skill-development", "practical-learning"],
    summary: "A young practitioner's first practical lesson arrives.",
    general:
      "The Page of Pentacles presents a young practical learner — a messenger from the realm of material reality: new financial opportunities, skill development, and the grounded expression of intellectual or creative potential in the material world. This is the card of the apprentice: someone who is willing to begin at the beginning, do the unglamorous work of building competence, and delay gratification in service of a longer future.",
    love: null,
    career: null,
    shadow: [
      "Am I willing to start at the beginning — and is 'starting from scratch' a gift, or a wound I am carrying?",
      "Is my pursuit of practical skill genuine — or am I over-investing in skill as a way to avoid the vulnerability of living?",
      "This new opportunity in front of me — am I seeing it clearly enough to assess whether it is worth my time?",
    ],
    affirmations: [
      "I invest in practical skills that will outlast any trend.",
      "I am willing to begin at the beginning.",
      "My future is built with patient, daily action.",
    ],
  },
  {
    cardName: "Knight of Pentacles",
    tags: ["efficiency", "routine", "conservatism", "hard-work"],
    summary: "Steady and methodical — the tortoise who reliably finishes the race.",
    general:
      "The Knight of Pentacles rides steadily, not with speed but with reliability — this is the card of solid, methodical, conscientious work: doing what needs to be done, day after day, without drama, without excitement, but with a quiet competence that is the foundation of all lasting achievement. The Knight is not flashy — but the Knight always finishes. If you have been discounting quiet competence in favour of more glamorous approaches: reconsider.",
    love: null,
    career: null,
    shadow: [
      "Is my solid, reliable approach actual wisdom — or is it a fear of risk dressed up as prudence?",
      "Am I hiding behind routine to avoid the discomfort of growth and new environments?",
      "What would it cost me to step out of the habitual routine for even an afternoon?",
    ],
    affirmations: [
      "I do the work consistently, day after day.",
      "Reliability is my underrated strength.",
      "I finish what I start.",
    ],
  },
  {
    cardName: "Queen of Pentacles",
    tags: ["nurturing", "practicality", "abundance", "security"],
    summary: "Grounded nurturing — the earth-mother who provides from her own substance.",
    general:
      "The Queen of Pentacles is the mature, grounded sovereign of the material and nurturing realm: practical wisdom, generous abundance, and a nurturing that does not martyr itself but feeds from genuine overflow. She models the integration of practical competence and genuine warmth. She earns her prosperity and she shares it generously. Her security is earned, not clutched.",
    love: "A stable, nurturing presence who provides genuinely — not from martyrdom but from a fullness that can genuinely share.",
    career: null,
    shadow: [
      "Am I nurturing from genuine overflow — or from a compulsion that is actually depleting me?",
      "Is my practicality grounded in genuine wisdom — or in a fear of abundance?",
      "Where might I be neglecting my own need for care while caring for everything and everyone else?",
    ],
    affirmations: [
      "I provide for myself and others from genuine abundance.",
      "My nurturing nature flows from overflow, not depletion.",
      "I tend to myself with the same care I offer others.",
    ],
  },
  {
    cardName: "King of Pentacles",
    tags: ["security", "control", "discipline", "abundance"],
    summary: "The kingdom of matter — mastery of the material realm.",
    general:
      "The King of Pentacles sits on a throne carved from living wood — mastery of the material realm: wealth accumulated and managed, property and resources secured, business acumen that has been earned through hard-earned experience. This is the energy of the mature businessman, land-owner, or financial authority who has built their kingdom through discipline and is now capable of holding it without anxiety. The King provides security not through fear but through genuine mastery.",
    love: null,
    career: null,
    shadow: [
      "Is my material mastery a genuine achievement — or am I using accumulation to manage an underlying anxiety?",
      "Am I providing genuine leadership in my domain — or am I hoarding what I have out of fear?",
      "Where might my focus on the material realm be eclipsing development in other parts of my life that I am neglecting?",
    ],
    affirmations: [
      "I master the material realm with integrity.",
      "My achievements are earned and I hold them with grace.",
      "I am abundant in the worlds of spirit and matter both.",
    ],
  },
];

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

/**
 * Get all tarot interpretations organised by Arcana.
 */
export function getInterpretations(): TarotInterpretations {
  return {
    majorArcana: MAJOR_ARCANA,
    minorArcana: {
      wands: WANDS,
      cups: CUPS,
      swords: SWORDS,
      pentacles: PENTACLES,
    },
  };
}

/**
 * Get all interpretations as a flat array.
 */
export function getAllInterpretations(): CardInterpretation[] {
  const { majorArcana, minorArcana } = getInterpretations();
  return [
    ...majorArcana,
    ...minorArcana.wands,
    ...minorArcana.cups,
    ...minorArcana.swords,
    ...minorArcana.pentacles,
  ];
}

/**
 * Get a specific card interpretation by card name.
 */
export function getInterpretationByName(name: string): CardInterpretation | undefined {
  return getAllInterpretations().find(
    (card) => card.cardName.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get interpretations by Arcana type.
 */
export function getMajorArcanaInterpretations(): CardInterpretation[] {
  return getInterpretations().majorArcana;
}

export function getMinorArcanaInterpretations(): TarotInterpretations["minorArcana"] {
  return getInterpretations().minorArcana;
}

export function getWandsInterpretations(): CardInterpretation[] {
  return getInterpretations().minorArcana.wands;
}

export function getCupsInterpretations(): CardInterpretation[] {
  return getInterpretations().minorArcana.cups;
}

export function getSwordsInterpretations(): CardInterpretation[] {
  return getInterpretations().minorArcana.swords;
}

export function getPentaclesInterpretations(): CardInterpretation[] {
  return getInterpretations().minorArcana.pentacles;
}
