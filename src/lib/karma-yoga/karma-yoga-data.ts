/**
 * Karma Yoga data module
 * Provides selfless action and service data for the Cabala dos Caminhos system
 */

export interface KarmaYogaRecord {
  id: string;
  name: string;
  description: string;
  principles: string[];
  associatedPaths: string[];
  practice: string;
  benefits: string[];
}

export interface KarmaYogaCycle {
  phase: string;
  description: string;
  focus: string;
}

export function getData(): {
  karmaYogaRecords: KarmaYogaRecord[];
  cycles: KarmaYogaCycle[];
} {
  return {
    karmaYogaRecords: [
      {
        id: 'action',
        name: 'Skillful Action (Karma)',
        description: 'Performing actions without attachment to results, dedicating them to the divine.',
        principles: ['Disinterested action', 'Dedicating fruits to God', 'Action as worship', 'Skill in means'],
        associatedPaths: ['Mars', 'Sefirot: Gevurah', 'Sun'],
        practice: 'Act with full engagement while releasing attachment to outcomes',
        benefits: ['Freedom from anxiety', 'Inner peace through action', 'Spiritual evolution through work'],
      },
      {
        id: 'service',
        name: 'Selfless Service (Seva)',
        description: 'Serving others without expectation of reward or recognition.',
        principles: ['Compassionate action', 'Humility', 'Equality in service', 'Seeing the divine in all'],
        associatedPaths: ['Venus', 'Sefirot: Tiferet', 'Moon'],
        practice: 'Find opportunities to serve daily without ulterior motives',
        benefits: ['Dissolution of ego', 'Pure love through action', 'Connection to universal consciousness'],
      },
      {
        id: 'dedication',
        name: 'Sacred Dedication (Sankalpa)',
        description: 'Offering every action as a sacrifice to the divine purpose.',
        principles: ['Divine offering', 'Intentional action', 'Surrender of ego', 'Alignment with will'],
        associatedPaths: ['Jupiter', 'Sefirot: Chesed', 'Mercury'],
        practice: 'Begin each action with the intention: this is for the divine',
        benefits: ['Transmutation of action into worship', 'Grace in daily life', 'Alignment with destiny'],
      },
      {
        id: 'detachment',
        name: 'Detached Engagement (Nishkama)',
        description: 'Acting with full effort while remaining unattached to fruits.',
        principles: ['Nishkama karma', 'Equanimity in success/failure', 'Work as meditation', 'Freedom through action'],
        associatedPaths: ['Saturn', 'Sefirot: Hod', 'Ketu'],
        practice: 'Give your best effort, then release the outcome to the cosmic plan',
        benefits: ['Liberation through action', 'Inner freedom in any circumstance', 'Wisdom through experience'],
      },
      {
        id: 'skill',
        name: 'Mastery in Action (Karma Siddhi)',
        description: 'Perfecting skill and using talents in service of the highest good.',
        principles: ['Excellence', 'Stewardship', 'Using gifts', 'Action as expression'],
        associatedPaths: ['Mercury', 'Sefirot: Netzach', 'Rahu'],
        practice: 'Develop your skills with devotion, then offer them in service',
        benefits: ['Divine employment of talents', 'Joy in work', 'Contribution to collective evolution'],
      },
      {
        id: 'sacrifice',
        name: 'Willing Sacrifice (Yajna)',
        description: 'Understanding that all action is sacrifice and offering it consciously.',
        principles: ['Conscious sacrifice', 'Universal exchange', 'Giving and receiving', 'Cosmic reciprocity'],
        associatedPaths: ['Sun', 'Sefirot: Tiferet', 'Mars'],
        practice: 'See every action as a sacred offering and trust the cosmic exchange',
        benefits: ['Participating in cosmic law', 'Abundance through giving', 'Spiritual fire awakened'],
      },
      {
        id: 'equality',
        name: 'Equitable Action (Samatva)',
        description: 'Maintaining equal vision in success and failure, victory and defeat.',
        principles: ['Equanimity', 'Impartiality', 'Balance', 'Inner stability'],
        associatedPaths: ['Saturn', 'Sefirot: Tipferet', 'Venus'],
        practice: 'Remain centered regardless of external outcomes',
        benefits: ['Unshakeable peace', 'Wisdom in action', 'Freedom from external circumstances'],
      },
      {
        id: 'renunciation',
        name: 'Renounced Action (Nishkriya)',
        description: 'Acting without the sense of doership, seeing oneself as instrument.',
        principles: ['Non-doership', 'Divine instrument', 'Surrender', 'Witness consciousness'],
        associatedPaths: ['Ketu', 'Sefirot: Yesod', 'Moon'],
        practice: 'See yourself as a channel for divine action, not the actor',
        benefits: ['Ego dissolution', 'Union with divine will', 'Liberation from karma'],
      },
    ],
    cycles: [
      {
        phase: 'Initiation',
        description: 'Recognizing that all action can be sacred',
        focus: 'Awakening to the potential of selfless action',
      },
      {
        phase: 'Practice',
        description: 'Actively dedicating actions to divine purpose',
        focus: 'Developing the discipline of consecrated action',
      },
      {
        phase: 'Surrender',
        description: 'Releasing attachment to fruits and outcomes',
        focus: 'Cultivating perfect equanimity in action',
      },
      {
        phase: 'Absorption',
        description: 'Action becomes meditation, work becomes worship',
        focus: 'Unifying will and action in divine service',
      },
      {
        phase: 'Transcendence',
        description: 'Living in a state of continuous selfless action',
        focus: 'Being an instrument of cosmic evolution',
      },
      {
        phase: 'Liberation',
        description: 'Freedom achieved through perfect action',
        focus: 'Union with the divine through work',
      },
      {
        phase: 'Return',
        description: 'Serving humanity from a liberated state',
        focus: 'Being a channel of grace for others',
      },
    ],
  };
}