export interface AudioTrack {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  category: string;
  url?: string;
}

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: "breath-awareness",
    title: "Breath Awareness",
    description: "Guided meditation focusing on natural breath awareness for calm and presence.",
    duration: 600,
    category: "beginner",
  },
  {
    id: "body-scan",
    title: "Body Scan",
    description: "Progressive relaxation from toes to crown, releasing tension mindfully.",
    duration: 900,
    category: "relaxation",
  },
  {
    id: "loving-kindness",
    title: "Loving Kindness",
    description: "Metta meditation cultivating compassion for self and others.",
    duration: 720,
    category: "compassion",
  },
  {
    id: "grounding",
    title: "Grounding",
    description: "Connect with earth energy through visualization and breath.",
    duration: 480,
    category: "grounding",
  },
  {
    id: "sleep",
    title: "Sleep Journey",
    description: "Deep relaxation for restful sleep and inner peace.",
    duration: 1800,
    category: "sleep",
  },
  {
    id: "morning-intent",
    title: "Morning Intention",
    description: "Set positive intentions for the day with guided visualization.",
    duration: 300,
    category: "morning",
  },
  {
    id: "anxiety-relief",
    title: "Anxiety Relief",
    description: "Calm the nervous system with breathing techniques and mindfulness.",
    duration: 600,
    category: "anxiety",
  },
  {
    id: "focus-concentration",
    title: "Focus & Concentration",
    description: "Sharpen attention and mental clarity through single-point focus.",
    duration: 540,
    category: "focus",
  },
];

export function getTracks(): AudioTrack[] {
  return AUDIO_TRACKS;
}

export function getTrackById(id: string): AudioTrack | undefined {
  return AUDIO_TRACKS.find((track) => track.id === id);
}

export function getTracksByCategory(category: string): AudioTrack[] {
  return AUDIO_TRACKS.filter((track) => track.category === category);
}
