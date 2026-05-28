// Auto-generated — skip linting and formatting

export interface PlaylistTrack {
  id: string;
  title: string;
  duration: number;
  category: string;
  tags?: string[];
  priority?: number;
}

export interface PlaylistConfig {
  name: string;
  purpose?: string;
  targetDuration?: number;
  categories?: string[];
  tags?: string[];
  trackCount?: number;
}

export interface GeneratedPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: PlaylistTrack[];
  totalDuration: number;
  purpose: string;
  metadata: {
    generatedAt: string;
    config: PlaylistConfig;
    trackCount: number;
  };
}

export interface GeneratorOptions {
  shuffle?: boolean;
  includeTransitions?: boolean;
  maxTracks?: number;
  minTrackDuration?: number;
  maxTrackDuration?: number;
}

const DEFAULT_TRACKS: PlaylistTrack[] = [
  { id: "breath-awareness", title: "Breath Awareness", duration: 600, category: "beginner", tags: ["breathing", "relaxation", "calm"] },
  { id: "body-scan", title: "Body Scan", duration: 900, category: "relaxation", tags: ["progressive", "tension", "release"] },
  { id: "loving-kindness", title: "Loving Kindness", duration: 720, category: "compassion", tags: ["metta", "compassion", "heart"] },
  { id: "grounding", title: "Grounding", duration: 480, category: "grounding", tags: ["earth", "stability", "presence"] },
  { id: "sleep-journey", title: "Sleep Journey", duration: 1800, category: "sleep", tags: ["deep", "rest", "peace"] },
  { id: "morning-intent", title: "Morning Intention", duration: 300, category: "morning", tags: ["intention", "energy", "clarity"] },
  { id: "anxiety-relief", title: "Anxiety Relief", duration: 600, category: "anxiety", tags: ["calm", "nervous", "soothing"] },
  { id: "focus-meditation", title: "Focus & Concentration", duration: 540, category: "focus", tags: ["clarity", "attention", "sharp"] },
  { id: "chakra-activation", title: "Chakra Activation", duration: 900, category: "energy", tags: ["chakra", "vibration", "flow"] },
  { id: "gratitude-practice", title: "Gratitude Practice", duration: 420, category: "gratitude", tags: ["thankful", "abundance", "joy"] },
  { id: "lunar-meditation", title: "Lunar Meditation", duration: 720, category: "sacred", tags: ["moon", "intuition", "feminine"] },
  { id: "solar-activation", title: "Solar Activation", duration: 480, category: "sacred", tags: ["sun", "power", "masculine"] },
  { id: "sound-bath", title: "Sound Bath Journey", duration: 1200, category: "healing", tags: ["solfeggio", "vibration", "renewal"] },
  { id: "visualization", title: "Guided Visualization", duration: 660, category: "manifestation", tags: ["imagination", "create", "manifest"] },
  { id: "breathwork", title: "Energizing Breathwork", duration: 360, category: "energy", tags: ["prana", "vitality", "breath"] },
];

/**
 * Get all available tracks for playlist generation
 */
function getAvailableTracks(): PlaylistTrack[] {
  return DEFAULT_TRACKS;
}

/**
 * Filter tracks by criteria
 */
function filterTracks(
  tracks: PlaylistTrack[],
  config: PlaylistConfig,
  options: GeneratorOptions
): PlaylistTrack[] {
  let filtered = [...tracks];

  if (config.categories?.length) {
    filtered = filtered.filter((t) => config.categories!.includes(t.category));
  }

  if (config.tags?.length) {
    filtered = filtered.filter((t) =>
      config.tags!.some((tag) => t.tags?.includes(tag))
    );
  }

  if (options.minTrackDuration) {
    filtered = filtered.filter((t) => t.duration >= options.minTrackDuration!);
  }

  if (options.maxTrackDuration) {
    filtered = filtered.filter((t) => t.duration <= options.maxTrackDuration!);
  }

  if (options.maxTracks) {
    filtered = filtered.slice(0, options.maxTracks);
  }

  return filtered;
}

/**
 * Calculate track priority based on playlist purpose
 */
function calculatePriority(track: PlaylistTrack, purpose: string): number {
  const purposeMappings: Record<string, string[]> = {
    sleep: ["sleep", "relaxation", "calm"],
    focus: ["focus", "clarity", "morning"],
    energy: ["energy", "breath", "power"],
    healing: ["healing", "vibration", "renewal"],
    meditation: ["meditation", "presence", "grounding"],
    sacred: ["sacred", "moon", "sun", "spiritual"],
  };

  const relevantTags = purposeMappings[purpose.toLowerCase()] || [];
  if (relevantTags.some((tag) => track.tags?.includes(tag))) {
    return 3;
  }
  if (relevantTags.some((tag) => track.category.includes(tag))) {
    return 2;
  }
  return 1;
}

/**
 * Build optimal track sequence
 */
function sequenceTracks(
  tracks: PlaylistTrack[],
  purpose: string,
  shuffle: boolean
): PlaylistTrack[] {
  const sequenced = tracks.map((t) => ({
    ...t,
    priority: calculatePriority(t, purpose),
  }));

  sequenced.sort((a, b) => b.priority! - a.priority!);

  if (shuffle) {
    const samePriority = sequenced.filter((t) => t.priority === sequenced[0].priority);
    const others = sequenced.filter((t) => t.priority !== sequenced[0].priority);
    for (let i = samePriority.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [samePriority[i], samePriority[j]] = [samePriority[j], samePriority[i]];
    }
    return [...samePriority, ...others];
  }

  return sequenced;
}

/**
 * Generate playlist with smart track selection
 */
export function generatePlaylist(
  config: PlaylistConfig,
  options: GeneratorOptions = {}
): GeneratedPlaylist {
  const allTracks = getAvailableTracks();
  const filtered = filterTracks(allTracks, config, options);
  const sequenced = sequenceTracks(
    filtered,
    config.purpose || config.name,
    options.shuffle ?? false
  );

  const tracks = options.maxTracks
    ? sequenced.slice(0, options.maxTracks)
    : sequenced;

  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);

  const purposeDescriptions: Record<string, string> = {
    sleep: "Designed for deep relaxation and restful sleep",
    focus: "Optimized for concentration and mental clarity",
    energy: "Activates vital energy and expands consciousness",
    healing: "Promotes inner healing and renewal",
    meditation: "Guides you into meditative presence",
    sacred: "Opens doorways to spiritual connection",
  };

  const purpose = config.purpose || "general";
  const description =
    purposeDescriptions[purpose.toLowerCase()] ||
    `Curated playlist for ${purpose}`;

  return {
    id: `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: config.name,
    description,
    tracks,
    totalDuration,
    purpose: purpose,
    metadata: {
      generatedAt: new Date().toISOString(),
      config,
      trackCount: tracks.length,
    },
  };
}

/**
 * Generate themed playlists
 */
export function generateThemedPlaylist(theme: string): GeneratedPlaylist {
  const themeConfigs: Record<string, PlaylistConfig> = {
    morning: {
      name: "Morning Awakening",
      purpose: "energy",
      targetDuration: 1200,
      categories: ["morning", "energy"],
      tags: ["energy", "clarity", "intention"],
    },
    evening: {
      name: "Evening Unwinding",
      purpose: "relaxation",
      targetDuration: 1800,
      categories: ["relaxation", "sleep"],
      tags: ["calm", "rest", "peace"],
    },
    chakra: {
      name: "Chakra Balancing Journey",
      purpose: "healing",
      targetDuration: 2400,
      tags: ["chakra", "vibration", "flow"],
    },
    sacred: {
      name: "Sacred Space",
      purpose: "sacred",
      targetDuration: 1800,
      categories: ["sacred"],
      tags: ["spiritual", "moon", "sun"],
    },
    abundance: {
      name: "Abundance Frequency",
      purpose: "manifestation",
      targetDuration: 1500,
      tags: ["abundance", "manifest", "gratitude"],
    },
  };

  const themeConfig = themeConfigs[theme.toLowerCase()] || {
    name: `${theme} Playlist`,
    purpose: "general",
  };

  return generatePlaylist(themeConfig, {
    shuffle: true,
    includeTransitions: true,
    maxTracks: 6,
  });
}