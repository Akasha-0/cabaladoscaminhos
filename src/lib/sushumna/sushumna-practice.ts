// Sushumna practice

export interface SushumnaPracticeConfig {
  duration?: number; // minutes
  intensity?: number; // 1-10 scale
  focus?: 'base' | 'middle' | 'crown' | 'full';
  breathingRate?: 'slow' | 'medium' | 'rapid';
}

export interface SushumnaPracticeResult {
  completed: boolean;
  channelClearance: number; // 0-100
  pranicFlow: number; // 0-100
  activatedPoints: string[];
  insights: string[];
}

const CHANNEL_POINTS = ['root', 'sacral', 'solar', 'heart', 'throat', 'thirdEye', 'crown'];

export async function performPractice(config: SushumnaPracticeConfig = {}): Promise<SushumnaPracticeResult> {
  const {
    duration = 30,
    intensity = 5,
    focus = 'full',
    breathingRate = 'medium',
  } = config;

  const breathingMultiplier = {
    slow: 0.7,
    medium: 1.0,
    rapid: 1.5,
  }[breathingRate];

  const durationFactor = Math.min(1, duration / 60);
  const intensityFactor = intensity / 10;

  const channelClearance = Math.round(
    Math.min(100, intensityFactor * 60 + durationFactor * 40) * breathingMultiplier
  );

  const pranicFlow = Math.round(
    Math.min(100, (channelClearance * 0.6 + intensityFactor * 40) * breathingMultiplier)
  );

  let activatedPoints: string[];
  if (focus === 'full') {
    activatedPoints = CHANNEL_POINTS.slice(
      0,
      Math.max(1, Math.ceil((intensityFactor * 0.5 + durationFactor * 0.5) * 7))
    );
  } else {
    const focusIndex = CHANNEL_POINTS.indexOf(focus);
    activatedPoints = CHANNEL_POINTS.slice(0, focusIndex + 1);
  }

  return {
    completed: true,
    channelClearance,
    pranicFlow,
    activatedPoints,
    insights: generateInsights(activatedPoints, channelClearance),
  };
}

function generateInsights(points: string[], clearance: number): string[] {
  const insights: string[] = [];

  if (clearance >= 70) {
    insights.push('The central channel opens with clarity and purpose');
  }
  if (clearance >= 90) {
    insights.push('Sushumna glows with pure pranic light, free from obstruction');
  }

  const pointInsights: Record<string, string> = {
    root: 'Muladhara anchors the celestial current at the base',
    sacral: 'Svadhisthana rises to meet the central flow',
    solar: 'Manipura integrates solar and lunar currents',
    heart: 'Anahata becomes the meeting point of heaven and earth',
    throat: 'Vishuddha opens as the gateway of divine speech',
    thirdEye: 'Ajna awakens to perceive beyond form',
    crown: 'Sahasrara receives the infinite descending light',
  };

  points.forEach((p) => {
    if (pointInsights[p]) insights.push(pointInsights[p]);
  });

  return insights;
}